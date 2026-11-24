// Fonctions pures de la vue Phase (tableau 4 semaines × 7 jours).
// Rien ici n'écrit dans la base : l'écran passe par `Plan.tsx` puis `src/donnees/plan.ts`.
// Rien de calculable n'est stocké (R-8) : la case d'une séance se déduit de sa date.
import type { Cycle, DateISO, NiveauDetail, PhaseCycle, SeancePlanifiee } from '../../donnees/modele.ts'
import { niveauAffiche } from '../../donnees/niveaux.ts'
import { ajouterJours, debutSemaine } from '../../donnees/plan.ts'

export type NumeroSemaine = 1 | 2 | 3 | 4

export const SEMAINES_DE_PHASE: NumeroSemaine[] = [1, 2, 3, 4]
export const JOURS_COURTS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
export const JOURS_LONGS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

export const TEXTE_COPIE_IDENTIQUE =
  'Copie identique. Fais progresser les réglages à la main, voir la progression de chaque fiche.'

/** La date d'une case : lundi de la semaine + numéro du jour (0 = lundi). */
export function dateDeLaCase(cycle: Cycle, phase: Pick<PhaseCycle, 'ordre'>, semaine: NumeroSemaine, jour: number): DateISO {
  return ajouterJours(debutSemaine(cycle, phase, semaine), jour)
}

/** Les séances posées dans une case (normalement 0 ou 1). */
export function seancesDeLaCase(seances: SeancePlanifiee[], phase: PhaseCycle, cycle: Cycle, semaine: NumeroSemaine, jour: number): SeancePlanifiee[] {
  const date = dateDeLaCase(cycle, phase, semaine, jour)
  return seances.filter((s) => s.phaseId === phase.id && s.date === date)
}

/** Première case libre, dans l'ordre : semaine 1 lundi, mardi… puis semaine 2. `null` si tout est pris. */
export function premiereCaseLibre(seances: SeancePlanifiee[], phase: PhaseCycle, cycle: Cycle): { semaine: NumeroSemaine; jour: number } | null {
  for (const semaine of SEMAINES_DE_PHASE) {
    for (let jour = 0; jour < 7; jour++) {
      if (seancesDeLaCase(seances, phase, cycle, semaine, jour).length === 0) return { semaine, jour }
    }
  }
  return null
}

/** Séance vide (amendement 3) : technique, légère, sans étape, pas de version groupe. */
export function nouvelleSeanceVide(cycle: Cycle, phase: PhaseCycle, semaine: NumeroSemaine, jour: number, maintenant: string, id: string): SeancePlanifiee {
  return {
    id, versionFormat: 1, creeLe: maintenant, modifieLe: maintenant,
    cycleId: cycle.id, phaseId: phase.id, semaine,
    date: dateDeLaCase(cycle, phase, semaine, jour),
    qualite: 'technique',
    solo: { nom: 'Nouvelle séance', durete: 'legere', etapes: [] },
    groupe: null,
  }
}

/** Copie identique d'une séance sur une autre case : nouvel identifiant, date décalée, jamais « sautée ». */
export function copierSurCase(source: SeancePlanifiee, cycle: Cycle, phase: PhaseCycle, semaine: NumeroSemaine, jour: number, maintenant: string, id: string): SeancePlanifiee {
  const { sauteeLe: _saute, supprimeLe: _supprime, ...reste } = structuredClone(source)
  return { ...reste, id, creeLe: maintenant, modifieLe: maintenant, phaseId: phase.id, semaine, date: dateDeLaCase(cycle, phase, semaine, jour) }
}

/** Déplace une séance : même document, nouvelle date et nouvelle semaine. */
export function deplacerSurCase(seance: SeancePlanifiee, cycle: Cycle, phase: PhaseCycle, semaine: NumeroSemaine, jour: number): SeancePlanifiee {
  return { ...seance, semaine, date: dateDeLaCase(cycle, phase, semaine, jour) }
}

/**
 * Recopie la semaine 1 sur les semaines 2 et 3 (copie identique, jour par jour).
 * Prudence : une case déjà occupée n'est jamais écrasée ; on compte celles qu'on a laissées.
 */
export function recopierSemaine1(seances: SeancePlanifiee[], phase: PhaseCycle, cycle: Cycle, maintenant: string, nouvelId: () => string): { nouvelles: SeancePlanifiee[]; ignorees: number } {
  const nouvelles: SeancePlanifiee[] = []
  let ignorees = 0
  const lundi = debutSemaine(cycle, phase, 1)
  const sources = seances.filter((s) => s.phaseId === phase.id && s.date >= lundi && s.date <= ajouterJours(lundi, 6))
  for (const cible of [2, 3] as const) {
    for (const source of sources) {
      const jour = jourDeLaSemaine(source.date, lundi)
      if (seancesDeLaCase(seances, phase, cycle, cible, jour).length > 0 || nouvelles.some((n) => n.date === dateDeLaCase(cycle, phase, cible, jour))) {
        ignorees++
        continue
      }
      nouvelles.push(copierSurCase(source, cycle, phase, cible, jour, maintenant, nouvelId()))
    }
  }
  return { nouvelles, ignorees }
}

function jourDeLaSemaine(date: DateISO, lundi: DateISO): number {
  for (let j = 0; j < 7; j++) if (ajouterJours(lundi, j) === date) return j
  return 0
}

/** « 45 min », « 1 h 30 » ; `null` quand la séance n'a pas de durée. */
export function formatDuree(minutes: number): string | null {
  if (minutes <= 0) return null
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

/** Une ligne de contenu selon le niveau affiché (niveaux-de-detail § 1.3) ; rien ne s'efface, on ne fait que lire. */
export function ligneContenu(seance: SeancePlanifiee, cycle: Pick<Cycle, 'niveauDetail'>): string {
  const niveau: NiveauDetail = niveauAffiche(seance, cycle)
  const { solo } = seance
  if (niveau === 'detaille') return `${solo.etapes.length} étape${solo.etapes.length > 1 ? 's' : ''}`
  if (niveau === 'grandes_lignes') {
    const n = solo.parties?.length ?? 0
    return `${n} partie${n > 1 ? 's' : ''}`
  }
  return solo.recommandation ?? 'Pas encore de contenu'
}
