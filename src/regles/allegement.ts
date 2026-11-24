// Semaine allégée (et affûtage) : on prend une séance planifiée et on en rend une version réduite.
// Fonction pure : la séance d'entrée n'est jamais modifiée, on rend une copie.
// Spécification : docs/specs/niveaux-de-detail.md § 2.4 (point 4) ; regles-planification.md A4-3, A4-5, A6-9 ;
// docs/backlog-v2.md, G-03 (étape 1).
import { protocoleParId } from '../donnees/bibliotheque/index.ts'
import type { SeancePlanifiee } from '../donnees/modele.ts'
import type { EtapeSeance, ObjectifGroupe, ReglagesEtape } from '../moteur/types.ts'
import { marqueursDe } from './base.ts'
import { etapeDepuisProtocole } from './passerelles.ts'
import type { FicheVerif } from './types.ts'

export const NOTE_SEMAINE_ALLEGEE = 'Semaine allégée : niveau flash plutôt que projet.'

/** Divise par deux en arrondissant au-dessus (au moins 1 si la valeur de départ était positive). */
const moitieArrondieAuDessus = (n: number): number => Math.ceil(n / 2)

/** Une durée réduite : jamais moins d'une minute. */
const dureeReduite = (dureeMin: number, facteur: number): number => Math.max(1, Math.round(dureeMin * facteur))

/** Nombre de séries d'un chrono (les autres formes n'en ont pas). */
function seriesDuChrono(e: EtapeSeance): number | undefined {
  return e.forme === 'chrono' ? e.config.series : undefined
}

function etapeAllegee(
  e: EtapeSeance,
  facteur: number,
  type: 'allegee' | 'affutage',
  fiches: Record<string, FicheVerif>,
): EtapeSeance {
  const fiche = e.origine ? fiches[e.origine.refId] : undefined

  // Décision F2, point 6 : l'échauffement garde sa durée (et ses séries) avant un effort maximal.
  if (fiche?.qualite === 'echauffement') return structuredClone(e)

  const series = seriesDuChrono(e)
  const seriesReduites = series !== undefined && series > 1 ? moitieArrondieAuDessus(series) : undefined
  const dureeMin = dureeReduite(e.dureeMin, facteur)

  const protocole = e.origine?.source === 'bibliotheque' ? protocoleParId(e.origine.refId) : undefined
  let etape: EtapeSeance
  if (protocole) {
    // On refait l'étape depuis la fiche, avec les réglages déjà posés plus les nouveaux.
    const reglages: ReglagesEtape = {
      ...e.origine?.reglages,
      dureeMin,
      ...(seriesReduites !== undefined ? { series: seriesReduites } : {}),
    }
    etape = etapeDepuisProtocole(protocole, e.id, reglages)
    if (e.objectifSpecifiqueId !== undefined) etape.objectifSpecifiqueId = e.objectifSpecifiqueId
    if (e.note !== undefined) etape.note = e.note
  } else {
    // Exercice personnel ou étape sans fiche connue : on réduit la copie directement.
    etape = structuredClone(e)
    etape.dureeMin = dureeMin
    if (seriesReduites !== undefined && etape.forme === 'chrono') etape.config.series = seriesReduites
  }

  // Le bloc limite devient un travail à vue : la note le rappelle (seulement en semaine allégée).
  if (type === 'allegee' && fiche !== undefined && marqueursDe(fiche).includes('bloc_limite')) {
    if (!etape.note?.includes(NOTE_SEMAINE_ALLEGEE)) {
      etape.note = etape.note === undefined ? NOTE_SEMAINE_ALLEGEE : `${etape.note} ${NOTE_SEMAINE_ALLEGEE}`
    }
  }
  return etape
}

function objectifAllege(o: ObjectifGroupe): ObjectifGroupe {
  const copie = structuredClone(o)
  copie.cible = moitieArrondieAuDessus(o.cible)
  if (o.blocs !== undefined) copie.blocs = moitieArrondieAuDessus(o.blocs)
  return copie
}

/**
 * Une séance allégée : séries divisées par deux, minutes × (1 − réduction), échauffement intact.
 * `reductionPct` : 50 pour 50 %. L'effort prévu et la dureté ne changent pas (A4-4) : c'est le volume qui baisse.
 * `fiches` sert à reconnaître l'échauffement et le bloc limite.
 */
export function allegerSeance(
  s: SeancePlanifiee,
  reductionPct: number,
  type: 'allegee' | 'affutage',
  fiches: Record<string, FicheVerif>,
): SeancePlanifiee {
  const facteur = 1 - Math.min(100, Math.max(0, reductionPct)) / 100
  const copie = structuredClone(s)

  copie.solo.etapes = s.solo.etapes.map((e) => etapeAllegee(e, facteur, type, fiches))
  copie.solo.parties = s.solo.parties?.map((p) => ({ ...structuredClone(p), dureeMin: dureeReduite(p.dureeMin, facteur) }))

  if (s.groupe) {
    const groupe = copie.groupe!
    groupe.objectifs = s.groupe.objectifs.map(objectifAllege)
    if (s.groupe.miniBloc) {
      groupe.miniBloc = {
        moment: s.groupe.miniBloc.moment,
        etapes: s.groupe.miniBloc.etapes.map((e) => etapeAllegee(e, facteur, type, fiches)),
      }
    }
    if (s.groupe.dureeMin !== undefined) groupe.dureeMin = dureeReduite(s.groupe.dureeMin, facteur)
  }
  return copie
}
