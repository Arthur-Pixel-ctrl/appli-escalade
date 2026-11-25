// Vérifications du plan : P-01 à P-15 (moteur-verification.md, B.7).
// Fonctions pures : on avertit, on ne bloque jamais. Les messages sont ceux de la spécification.
import {
  ajouterJours,
  estPoutreIntensive,
  joursEntre,
  sansContenuConnu,
  zonesDouloureuses,
} from './base.ts'
import { MARQUEURS_QUOTA, NOMS_MARQUEURS, NOMS_QUALITES, NOMS_ZONES } from './reglesParDefaut.ts'
import { manquesPrerequis } from './verifSeanceProfil.ts'
import type { Avertissement, ContexteVerif, Jour, Niveau, PlanVerif, Qualite, SemaineVerif } from './types.ts'

type Bloc = PlanVerif['mesocycles'][number]

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

/** « 2027-02-14 » devient « 14 février 2027 ». */
function dateEnClair(jour: Jour): string {
  const [a, m, j] = jour.split('-').map(Number)
  return `${j === 1 ? '1er' : j} ${MOIS[m - 1]} ${a}`
}

/** Une alerte du plan ; `bloc` (ordre) est renseigné quand elle vise une phase. */
function alerte(
  code: string,
  niveau: Niveau,
  message: string,
  source: string,
  extra: Partial<Avertissement> = {},
): Avertissement {
  return { code, niveau, message, source, portee: 'plan', ...extra }
}

/** Blocs dans l'ordre, avec le nombre de semaines que le plan leur donne. */
function blocsOrdonnes(plan: PlanVerif): (Bloc & { nbSemaines: number })[] {
  return [...plan.mesocycles]
    .sort((a, b) => a.ordre - b.ordre)
    .map((b) => ({ ...b, nbSemaines: plan.semaines.filter((s) => s.mesocycleOrdre === b.ordre).length }))
}

const ACCENTS_FORCE_PUISSANCE: Qualite[] = ['doigts', 'traction_gainage', 'puissance']

/**
 * Vérifications de la structure du plan (P-01 à P-15). Une alerte par cas, jamais de blocage.
 * Un accent de phase à null (pas encore choisi) est ignoré par P-03, P-04 et P-07.
 */
export function verifierStructurePlan(plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  const alertes: Avertissement[] = []
  const blocs = blocsOrdonnes(plan)

  // P-01 : format inhabituel (seulement en accent tournant)
  if (
    plan.mode === 'accent_tournant' &&
    (plan.nbSemaines !== 12 || plan.mesocycles.length !== 3 || blocs.some((b) => b.nbSemaines !== 4))
  ) {
    alertes.push(
      alerte(
        'P-01',
        'information',
        "Ton cycle s'écarte du format 12 semaines en 3 phases de 4. C'est possible, mais les repères de l'app sont faits pour ce format.",
        'Plan de l\'app',
      ),
    )
  }

  // P-02 : plus de 3 semaines de charge d'affilée (les semaines d'affûtage ou de transition coupent la suite)
  if (ctx.regles.dechargeActive) {
    let suite: { semaine: SemaineVerif; position: number }[] = []
    const clore = () => {
      if (suite.length > 3) {
        const a = suite[0].position
        const b = suite[suite.length - 1].position
        alertes.push(
          alerte(
            'P-02',
            'fort',
            `${suite.length} semaines de charge d'affilée (semaines ${a} à ${b}) : place une semaine allégée après la troisième.`,
            'Synthèse (3 semaines de charge, 1 de décharge), plan de l\'app',
            { mesocycleOrdre: suite[0].semaine.mesocycleOrdre, lundi: suite[0].semaine.lundi },
          ),
        )
      }
      suite = []
    }
    plan.semaines.forEach((semaine, i) => {
      if (semaine.type === 'charge') suite.push({ semaine, position: i + 1 })
      else clore()
    })
    clore()
  }

  // P-03 : deux phases de force ou de puissance de suite avec le même accent
  for (let i = 1; i < blocs.length; i++) {
    const avant = blocs[i - 1].accent
    const apres = blocs[i].accent
    if (avant !== null && avant === apres && ACCENTS_FORCE_PUISSANCE.includes(avant)) {
      alertes.push(
        alerte(
          'P-03',
          'information',
          `Deux phases de suite sur ${NOMS_QUALITES[avant]} : pour la force et la puissance, la BMC conseille 3 à 5 semaines. Change l'accent de la phase ${blocs[i].ordre}.`,
          'Synthèse (BMC)',
          { mesocycleOrdre: blocs[i].ordre },
        ),
      )
    }
  }

  // P-04 : suite de phases « résistance » de plus de 8 semaines au total (une alerte par suite)
  let suiteResistance: typeof blocs = []
  const cloreResistance = () => {
    const total = suiteResistance.reduce((somme, b) => somme + b.nbSemaines, 0)
    if (total > 8) {
      alertes.push(
        alerte(
          'P-04',
          'information',
          "Plus de 8 semaines d'accent résistance : le travail lactique se limite à 3 à 8 semaines.",
          'Synthèse (consensus minimal)',
          { mesocycleOrdre: suiteResistance[0].ordre },
        ),
      )
    }
    suiteResistance = []
  }
  for (const bloc of blocs) {
    if (bloc.accent === 'resistance') suiteResistance.push(bloc)
    else cloreResistance()
  }
  cloreResistance()

  const objectif = plan.mode === 'objectif_date' ? plan.objectif : undefined

  // P-05 : objectif daté sans semaine d'affûtage dans les 21 jours qui précèdent
  if (objectif) {
    const aAffutage = plan.semaines.some((s) => {
      const ecart = joursEntre(s.lundi, objectif.date)
      return s.type === 'affutage' && ecart >= 0 && ecart <= 21
    })
    if (!aAffutage) {
      alertes.push(
        alerte(
          'P-05',
          'information',
          `Ton objectif du ${dateEnClair(objectif.date)} n'a pas de semaines d'affûtage. Prévois-en 2, avec 40 à 60 % de volume en moins.`,
          'Synthèse (Bosquet)',
        ),
      )
    }
  }

  // P-06 : réduction d'une semaine allégée ou d'affûtage hors de 40 à 60 %
  for (const s of plan.semaines) {
    const r = s.reductionPct
    if ((s.type === 'decharge' || s.type === 'affutage') && r !== undefined && (r < 40 || r > 60)) {
      alertes.push(
        alerte(
          'P-06',
          'information',
          `Réduction de ${r} % en semaine ${s.type === 'decharge' ? 'allégée' : "d'affûtage"} : le repère est de 40 à 60 %.`,
          'Synthèse',
          { mesocycleOrdre: s.mesocycleOrdre, lundi: s.lundi },
        ),
      )
    }
  }

  // P-07 : ordre des accents en objectif daté (les accents non choisis sont ignorés)
  if (objectif) {
    const choisis = blocs.filter((b) => b.accent !== null)
    const premiereResistance = choisis.findIndex((b) => b.accent === 'resistance')
    const resistanceAvantPuissance =
      premiereResistance !== -1 && choisis.slice(premiereResistance + 1).some((b) => b.accent === 'puissance')
    const dernier = choisis[choisis.length - 1]
    const mauvaisFinal = dernier !== undefined && dernier.accent !== 'puissance' && dernier.accent !== 'resistance'
    if (resistanceAvantPuissance || mauvaisFinal) {
      alertes.push(
        alerte(
          'P-07',
          'information',
          'Pour un objectif daté, finis par la puissance puis la résistance (en voie), juste avant l\'affûtage.',
          'Synthèse (Lattice ; Bechtel)',
          dernier ? { mesocycleOrdre: dernier.ordre } : {},
        ),
      )
    }
  }

  // P-08 : poutre intensive dans les jours qui précèdent l'objectif
  if (objectif) {
    for (const s of plan.seances) {
      const ecart = joursEntre(s.date, objectif.date)
      if (ecart >= 0 && ecart <= ctx.regles.joursSansPoutreAvantObjectif && estPoutreIntensive(s, ctx.fiches)) {
        alertes.push(
          alerte(
            'P-08',
            'information',
            `Pas de poutre intensive dans les ${ctx.regles.joursSansPoutreAvantObjectif} jours avant ton objectif : tes doigts doivent arriver frais.`,
            'Synthèse (Lattice) ; 3 jours : choix de l\'app',
            { seanceId: s.id },
          ),
        )
      }
    }
  }

  // P-09 : pas de test en fin de bloc. Inactive tant qu'aucune fiche n'est un test (trou T-01, tâche C-08).
  if (Object.values(ctx.fiches).some((f) => f.estTest)) {
    for (const bloc of blocs) {
      const semainesDuBloc = plan.semaines.filter((s) => s.mesocycleOrdre === bloc.ordre)
      if (semainesDuBloc.length === 0) continue
      const derniere = semainesDuBloc.reduce((a, b) => (b.lundi > a.lundi ? b : a))
      const aUnTest = plan.seances.some((s) => {
        const decalage = joursEntre(derniere.lundi, s.date)
        return decalage >= 0 && decalage <= 6 && s.solo.etapes.some((e) => ctx.fiches[e.ficheId]?.estTest)
      })
      if (!aUnTest) {
        alertes.push(
          alerte(
            'P-09',
            'information',
            `La phase ${bloc.ordre} n'a pas de test en fin de semaine allégée. Ajoute au moins tes tractions strictes et un bloc repère pour voir tes progrès.`,
            'Synthèse',
            { mesocycleOrdre: bloc.ordre },
          ),
        )
      }
    }
  }

  // P-10 : plus de 2 objectifs spécifiques sur une phase
  for (const bloc of blocs) {
    if (bloc.objectifsPersoIds.length > 2) {
      alertes.push(
        alerte(
          'P-10',
          'information',
          `${bloc.objectifsPersoIds.length} objectifs spécifiques sur cette phase : 2 au plus, pour qu'ils restent courts.`,
          'Plan de l\'app, modèle de données',
          { mesocycleOrdre: bloc.ordre },
        ),
      )
    }
  }

  // P-11 : deux objectifs d'une phase dans le même quota (liste commune du moteur, MARQUEURS_QUOTA)
  for (const bloc of blocs) {
    const objectifs = bloc.objectifsPersoIds.flatMap((id) => (ctx.objectifsPerso[id] ? [ctx.objectifsPerso[id]] : []))
    for (let i = 0; i < objectifs.length; i++) {
      for (let j = i + 1; j < objectifs.length; j++) {
        const commun = MARQUEURS_QUOTA.find((m) => objectifs[i].marqueurs.includes(m) && objectifs[j].marqueurs.includes(m))
        if (commun === undefined) continue
        alertes.push(
          alerte(
            'P-11',
            'information',
            `« ${objectifs[i].nom} » et « ${objectifs[j].nom} » comptent dans le même quota (${NOMS_MARQUEURS[commun]}). Garde-en un pour cette phase.`,
            'Modèle de données',
            { mesocycleOrdre: bloc.ordre, sujet: `${objectifs[i].id}+${objectifs[j].id}` },
          ),
        )
      }
    }
  }

  // P-12 : objectif inadapté aujourd'hui (prérequis manquants ou zone douloureuse)
  const zones = zonesDouloureuses(ctx, ctx.aujourdhui)
  for (const bloc of blocs) {
    for (const id of bloc.objectifsPersoIds) {
      const objectif = ctx.objectifsPerso[id]
      if (!objectif) continue
      const raisons = manquesPrerequis(objectif.prerequis, ctx.profil)
      const touchees = objectif.contreIndications.filter((z) => zones.includes(z))
      if (touchees.length > 0) raisons.push(`douleur déclarée (${touchees.map((z) => NOMS_ZONES[z]).join(', ')})`)
      if (raisons.length === 0) continue
      const remplacement = objectif.remplacementNom ? ` Essaie plutôt « ${objectif.remplacementNom} ».` : ''
      alertes.push(
        alerte(
          'P-12',
          'fort',
          `L'objectif « ${objectif.nom} » ne te convient pas aujourd'hui : ${raisons.join(' ; ')}.${remplacement}`,
          'Modèle de données (objectifs proposables)',
          { mesocycleOrdre: bloc.ordre, sujet: id },
        ),
      )
    }
  }

  // P-13 : le plan et le profil ne comptent pas le même nombre de séances par semaine
  if (plan.seancesParSemaine !== ctx.profil.seancesParSemaine) {
    alertes.push(
      alerte(
        'P-13',
        'information',
        `Ton plan compte ${plan.seancesParSemaine} séances par semaine, ton profil ${ctx.profil.seancesParSemaine}. Mets-les d'accord.`,
        'Choix de l\'app',
      ),
    )
  }

  // P-14 : le cycle suivant suit de moins de 7 jours, sans semaine de transition en fin de plan
  if (plan.cycleSuivantDebut !== undefined && plan.semaines.length > 0) {
    const derniere = plan.semaines[plan.semaines.length - 1]
    const finDuPlan = ajouterJours(derniere.lundi, 6)
    if (joursEntre(finDuPlan, plan.cycleSuivantDebut) < 7 && derniere.type !== 'transition') {
      alertes.push(
        alerte(
          'P-14',
          'information',
          'Le cycle suivant commence tout de suite : une semaine de transition, en grimpe libre, aide à récupérer.',
          'Synthèse',
        ),
      )
    }
  }

  // P-15 : séances sans étapes détaillées (une seule alerte pour tout le plan)
  const sansEtapes = plan.seances.filter((s) => s.solo.etapesDetaillees === false || sansContenuConnu(s.solo, ctx.fiches))
  if (sansEtapes.length > 0) {
    alertes.push(
      alerte(
        'P-15',
        'information',
        `${sansEtapes.length === 1 ? "1 séance n'a pas" : `${sansEtapes.length} séances n'ont pas`} d'étapes détaillées : l'app vérifie la récupération, les quotas et tes douleurs, mais pas l'ordre des exercices ni les repos. Ton téléphone te rappellera ces règles pendant la séance.`,
        'Choix de l\'app',
      ),
    )
  }

  return alertes
}
