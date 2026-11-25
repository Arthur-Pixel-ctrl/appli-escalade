// Fonctions pures du Tableau de bord (O-02, D-19).
// Rien ici n'écrit ni ne lit la base : l'écran lit, ces fonctions calculent (R-8, rien de calculable n'est stocké).
import type {
  Cycle, DateISO, NiveauDetail, ObjectifSpecifique, PartieSeance, PhaseCycle, SeancePlanifiee, SeanceRealisee,
} from '../../donnees/modele.ts'
import { niveauAffiche } from '../../donnees/niveaux.ts'
import { ajouterJours, cycleTermine, debutSemaine, statutSeance, type StatutSeance } from '../../donnees/plan.ts'
import { partiesAffichees, recommandationAffichee, type FicheVerif } from '../../regles/index.ts'
import { semaineDuJour } from './Plan.outils.ts'
import { positionDeLaSemaine } from './VueSemaine.outils.ts'

export type EtatTableau = 'aucun' | 'termine' | 'en_cours'

/** Les trois états de O-02. « En cours » couvre aussi un cycle pas encore commencé (le plan est déjà là). */
export function etatTableau(cycle: Cycle | undefined, aujourdhui: DateISO): EtatTableau {
  if (!cycle) return 'aucun'
  return cycleTermine(cycle, aujourdhui) ? 'termine' : 'en_cours'
}

export interface SemaineAffichee {
  numero: number // 1 à 12
  phase: 1 | 2 | 3
  semaine: 1 | 2 | 3 | 4
  /** Faux avant le début du cycle : on montre alors la semaine 1, à venir. */
  commence: boolean
}

/** La semaine du jour ; avant le début du cycle, la semaine 1 (« Ouvrir la semaine 1 »). */
export function semaineAffichee(cycle: Cycle, aujourdhui: DateISO): SemaineAffichee {
  const position = semaineDuJour(cycle, aujourdhui)
  if (position) return { numero: position.numero, phase: position.phase, semaine: position.semaine, commence: true }
  return { numero: 1, phase: 1, semaine: 1, commence: false }
}

/** Les cases de la bande S1 à S12 : « faite » quand la semaine est entièrement passée. */
export function casesDeLaBande(cycle: Cycle, phases: PhaseCycle[], aujourdhui: DateISO) {
  return phases.flatMap((p) => p.semaines.map((s) => {
    const lundi = debutSemaine(cycle, p, s.numero)
    return { numero: (p.ordre - 1) * 4 + s.numero, type: s.type, faite: ajouterJours(lundi, 6) < aujourdhui }
  }))
}

export interface LigneJour {
  seance: SeancePlanifiee
  statut: StatutSeance
}

/** Les séances d'une semaine du cycle, par date, avec leur statut calculé (faite, prévue, manquée…). */
export function seancesDeLaSemaine(
  numero: number, phases: PhaseCycle[], seances: SeancePlanifiee[], realisees: SeanceRealisee[], aujourdhui: DateISO,
): LigneJour[] {
  const { ordre, semaine } = positionDeLaSemaine(numero)
  const phase = phases.find((p) => p.ordre === ordre)
  return seances
    .filter((s) => phase !== undefined && s.phaseId === phase.id && s.semaine === semaine)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((seance) => ({ seance, statut: statutSeance(seance, realisees, aujourdhui) }))
}

/** La prochaine séance à faire : la première, d'aujourd'hui ou après, ni faite ni sautée. */
export function prochaineSeance(
  seances: SeancePlanifiee[], realisees: SeanceRealisee[], aujourdhui: DateISO,
): SeancePlanifiee | undefined {
  return [...seances]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .find((s) => {
      const statut = statutSeance(s, realisees, aujourdhui)
      return statut === 'aujourdhui' || statut === 'a_venir'
    })
}

/** Ce que la fiche « Prochaine séance » montre, selon le niveau affiché (R-9) : on lit, on ne change rien. */
export type ContenuSeance =
  | { niveau: 'detaille'; lignes: { titre: string; dureeMin: number }[] }
  | { niveau: 'grandes_lignes'; parties: PartieSeance[] }
  | { niveau: 'simple'; recommandation: string }

export function contenuDeLaSeance(
  seance: SeancePlanifiee, cycle: Pick<Cycle, 'niveauDetail'>, fiches: Record<string, FicheVerif>,
): ContenuSeance {
  const niveau: NiveauDetail = niveauAffiche(seance, cycle)
  if (niveau === 'detaille') {
    return { niveau, lignes: seance.solo.etapes.map((e) => ({ titre: e.titre, dureeMin: e.dureeMin })) }
  }
  if (niveau === 'grandes_lignes') return { niveau, parties: partiesAffichees(seance.solo, seance.qualite, fiches) }
  return { niveau, recommandation: recommandationAffichee(seance.solo, seance.qualite, seance.solo.durete, fiches) }
}

/** Les objectifs de la phase en cours (1 ou 2), dans leur ordre de création. */
export function objectifsDeLaPhase(phases: PhaseCycle[], objectifs: ObjectifSpecifique[], ordre: number): ObjectifSpecifique[] {
  const phase = phases.find((p) => p.ordre === ordre)
  if (!phase) return []
  return objectifs
    .filter((o) => o.phaseId === phase.id && !o.supprimeLe)
    .sort((a, b) => (a.creeLe < b.creeLe ? -1 : a.creeLe > b.creeLe ? 1 : 0))
}

export const ETIQUETTES_STATUT: Record<StatutSeance, string> = {
  faite: 'Faite', sautee: 'Sautée', manquee: 'Manquée', aujourdhui: 'Aujourd’hui', a_venir: 'Prévue',
}
