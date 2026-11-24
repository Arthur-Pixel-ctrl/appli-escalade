// Générateur de plan : propose un cycle de 12 semaines (3 phases de 4 semaines) pioché dans la banque d'exercices,
// puis le fait vérifier par le moteur. Fonction pure : rien n'est lu ni écrit en base, pas d'horloge
// (dates et identifiants arrivent en entrée). Le cycle reste toujours en brouillon : l'écran (D-25) enregistre.
// Spécification : docs/specs/niveaux-de-detail.md § 2.3 à § 2.5 ; docs/backlog-v2.md, G-03.
import type {
  AccentPhase, Cycle, DateISO, DouleurDeclaree, ExercicePerso, Horodatage, NiveauDetail, PhaseCycle, Profil,
  Reglages, SemainePlan, SeancePlanifiee,
} from '../donnees/modele.ts'
import type { JourSemaine } from '../donnees/profil.ts'
import { DERNIERE_SEANCE_VOIE, JOURS_CONSEILLES, SECOURS, semaineType, type ChoixSeance } from '../donnees/semainesTypes.ts'
import { marqueursSeanceType, seanceTypeParId, type SeanceType } from '../donnees/seancesTypes.ts'
import { allegerSeance } from './allegement.ts'
import { ajouterJours, lundiDe, zonesDouloureuses } from './base.ts'
import { seancesTypesDisponibles, trierFiches } from './banque.ts'
// verifierPlan est défini dans index.ts, qui réexporte aussi ce fichier : cet import circulaire est sans risque,
// car verifierPlan n'est appelée qu'à l'exécution de genererCycle, jamais au chargement des modules.
import { verifierPlan } from './index.ts'
import { contexteVerif, planVersVerif, seanceDepuisType } from './passerelles.ts'
import { RESISTANCE_VOIE_PAR_SEMAINE } from './reglesParDefaut.ts'
import type { Avertissement } from './types.ts'

export interface EntreesGenerateur {
  profil: Profil
  douleurs: DouleurDeclaree[]
  exercicesPerso: ExercicePerso[]
  reglages?: Pick<Reglages, 'reglesSecurite'>
  debut: DateISO // un lundi ; sinon le lundi suivant (et le plan le dit)
  nom: string
  seancesParSemaine: number // 2 à 5
  accents: [AccentPhase, AccentPhase, AccentPhase]
  niveauDetail: NiveauDetail
  aujourdhui: DateISO
  maintenant: Horodatage
  nouvelId: () => string
}

export interface PlanGenere {
  cycle: Cycle
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  avertissements: Avertissement[] // tous ceux du moteur, jamais filtrés
  manques: string[] // ce que le générateur n'a pas pu faire, en phrases courtes
}

const JOURS: JourSemaine[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

/** Les jours de la semaine pour n séances (§ 2.4, point 2). Moins de jours que de séances : autant que de jours. */
function choisirJours(disponibles: JourSemaine[], n: 2 | 3 | 4 | 5, manques: string[]): JourSemaine[] {
  // Aucun jour renseigné : on suppose tous les jours libres, donc les jours conseillés.
  const libres = disponibles.length === 0 ? JOURS : JOURS.filter((j) => disponibles.includes(j))
  const conseilles = JOURS_CONSEILLES[n]
  if (conseilles.every((j) => libres.includes(j))) return conseilles
  if (libres.length < n) {
    manques.push(`Tu as ${libres.length} jour${libres.length > 1 ? 's' : ''} disponible${libres.length > 1 ? 's' : ''} pour ${n} séances : le plan en compte ${libres.length}.`)
    return libres
  }
  return libres.slice(0, n)
}

interface Choisie { st: SeanceType; variante?: string }

/** Ce qu'une séance déjà choisie compte dans les plafonds de sa semaine. */
interface Comptes { fiches: Set<string>; resistanceVoie: boolean }

/** Les fiches d'une séance (solo et mini-bloc du groupe, variante comprise) : chacune compte une fois par séance. */
function fichesDeLaSeance(st: SeanceType, variante?: string): Set<string> {
  const v = variante === undefined ? undefined : st.variantes[variante]
  const miniBloc = v?.miniBloc ?? st.groupe?.miniBloc
  return new Set([...(v?.solo ?? st.solo), ...(miniBloc?.etapes ?? [])].map((e) => e.ficheId))
}

function comptesDe(c: Choisie): Comptes {
  const marqueurs = [...marqueursSeanceType(c.st, 'solo', c.variante), ...marqueursSeanceType(c.st, 'groupe', c.variante)]
  return { fiches: fichesDeLaSeance(c.st, c.variante), resistanceVoie: marqueurs.includes('resistance_voie') }
}

export function genererCycle(e: EntreesGenerateur): PlanGenere {
  const manques: string[] = []

  // ——— Contexte du moteur et banque ———
  const ctx = contexteVerif({
    profil: e.profil, reglages: e.reglages, exercicesPerso: e.exercicesPerso, douleurs: e.douleurs,
    formes: [], objectifs: [], aujourdhui: e.aujourdhui, maintenant: e.maintenant,
  })
  const zones = zonesDouloureuses(ctx, e.aujourdhui)
  const { disponibles: fichesDisponibles } = trierFiches(Object.values(ctx.fiches), ctx.profil, zones)
  const disponibles = seancesTypesDisponibles(fichesDisponibles)
  const maxResistanceVoie = RESISTANCE_VOIE_PAR_SEMAINE[ctx.profil.disciplinePrincipale]

  // ——— Début, nombre de séances, jours ———
  let debut = e.debut
  if (lundiDe(debut) !== debut) {
    debut = ajouterJours(lundiDe(debut), 7) // un cycle commence toujours un lundi
    manques.push(`Le cycle commence un lundi : début décalé au ${debut}.`)
  }
  const n = Math.min(5, Math.max(2, Math.round(e.seancesParSemaine))) as 2 | 3 | 4 | 5
  if (n !== e.seancesParSemaine) manques.push(`Le plan propose de 2 à 5 séances par semaine : ${n} retenues.`)
  const jours = choisirJours(e.profil.joursDisponibles, n, manques)
  const aVoie = ctx.profil.disciplinePrincipale === 'voie' && ctx.profil.lieux.includes('salle_voie')

  // ——— Une semaine type par phase (semaines 1 à 3 identiques) ———
  const semainesParPhase: (Choisie | null)[][] = e.accents.map((accent) => {
    // Moins de jours que de séances : on prend la semaine type de ce nombre de jours (au moins 2 cases, on garde les premières).
    const cases = semaineType(accent, Math.max(2, jours.length) as 2 | 3 | 4 | 5).slice(0, jours.length)
    const choisies: (Choisie | null)[] = []
    const comptes: Comptes[] = []

    // Cette séance respecte-t-elle les plafonds de la semaine avec celles déjà choisies ?
    const respectePlafonds = (c: Choisie): boolean => {
      const nouvelle = comptesDe(c)
      for (const id of nouvelle.fiches) {
        const max = ctx.fiches[id]?.maxParSemaine
        if (max !== undefined && comptes.filter((x) => x.fiches.has(id)).length + 1 > max) return false
      }
      return !(nouvelle.resistanceVoie && comptes.filter((x) => x.resistanceVoie).length + 1 > maxResistanceVoie)
    }

    cases.forEach((cas, i) => {
      const role = seanceTypeParId(cas[0].seanceTypeId)?.role ?? 'C' // le rôle est celui de la case, pas du remplaçant
      let candidats: ChoixSeance[] = cas
      // Grimpeur de voie : la dernière séance de la semaine est la lecture voie si elle est disponible.
      if (aVoie && i === cases.length - 1) candidats = [DERNIERE_SEANCE_VOIE, ...cas]
      candidats = [...candidats, ...SECOURS[role].map((seanceTypeId) => ({ seanceTypeId }))]

      for (const cand of candidats) {
        const dispo = disponibles.find((d) => d.seanceType.id === cand.seanceTypeId)
        if (!dispo) continue
        // Variante lestée de ST-DOI-02 quand elle est disponible (poutre régulière), sauf si la case demande « entretien ».
        const variantes: (string | undefined)[] =
          cand.variante !== undefined ? [cand.variante]
            : cand.seanceTypeId === 'ST-DOI-02' && dispo.variantes.includes('lestee') ? ['lestee', undefined]
              : [undefined]
        for (const variante of variantes) {
          if (variante !== undefined && !dispo.variantes.includes(variante)) continue
          const choix: Choisie = { st: dispo.seanceType, ...(variante !== undefined ? { variante } : {}) }
          if (!respectePlafonds(choix)) continue
          choisies.push(choix)
          comptes.push(comptesDe(choix))
          return
        }
      }
      choisies.push(null)
      manques.push(`Pas de séance possible le ${jours[i]} avec ton profil ou tes douleurs : repos.`)
    })
    return choisies
  })

  // ——— Documents ———
  const reductionPct = ctx.regles.dechargeReductionPct
  const allegee = ctx.regles.dechargeActive
  const nbParSemaine = jours.length

  const cycle: Cycle = {
    id: e.nouvelId(), versionFormat: 1, creeLe: e.maintenant, modifieLe: e.maintenant,
    nom: e.nom, debut, nbSemaines: 12, seancesParSemaine: nbParSemaine, etat: 'brouillon',
    niveauDetail: e.niveauDetail, avertissementsGardes: [],
  }
  const phases: PhaseCycle[] = e.accents.map((accent, k) => {
    const semaines: SemainePlan[] = [
      { numero: 1, type: 'charge' }, { numero: 2, type: 'charge' }, { numero: 3, type: 'charge' },
      allegee ? { numero: 4, type: 'allegee', reductionPct } : { numero: 4, type: 'charge' },
    ]
    return {
      id: e.nouvelId(), versionFormat: 1, creeLe: e.maintenant, modifieLe: e.maintenant,
      cycleId: cycle.id, ordre: (k + 1) as 1 | 2 | 3, accent, semaines,
    }
  })

  const seances: SeancePlanifiee[] = []
  phases.forEach((phase, k) => {
    for (const semaine of [1, 2, 3, 4] as const) {
      semainesParPhase[k].forEach((choix, i) => {
        if (choix === null) return
        const date = ajouterJours(debut, k * 28 + (semaine - 1) * 7 + JOURS.indexOf(jours[i]))
        const seance = seanceDepuisType(choix.st, choix.variante, {
          id: e.nouvelId(), cycleId: cycle.id, phaseId: phase.id, semaine, date, maintenant: e.maintenant,
        })
        seances.push(semaine === 4 && allegee ? allegerSeance(seance, reductionPct, 'allegee', ctx.fiches) : seance)
      })
    }
  })

  // ——— Vérification : tous les avertissements sont rendus, aucun n'est masqué ———
  const avertissements = verifierPlan(
    planVersVerif({ cycle, phases, seances, realisees: [], objectifs: [], origine: 'utilisateur', fiches: ctx.fiches }),
    ctx,
  )
  return { cycle, phases, seances, avertissements, manques: [...new Set(manques)] }
}
