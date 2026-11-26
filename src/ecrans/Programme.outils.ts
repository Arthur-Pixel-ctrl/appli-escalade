// Fonctions pures de l'écran Programme (T-07) : la semaine ouverte, jour par jour.
import type { Cycle, DateISO, PhaseCycle, SeancePlanifiee, SeanceRealisee } from '../donnees/modele.ts'
import { ajouterJours, debutSemaine } from '../donnees/plan.ts'
import { ETIQUETTES_ACCENT } from './bureau/Plan.outils.ts'
import { seancesDeLaSemaine, type LigneJour } from './bureau/TableauDeBord.outils.ts'
import { positionDeLaSemaine } from './bureau/VueSemaine.outils.ts'

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

export interface JourProgramme {
  date: DateISO
  /** « lun. » : trois lettres. */
  nom: string
  lignes: LigneJour[]
}

/** Les 7 jours de la semaine `numero` du cycle (1 à 12), avec les séances de chaque jour et leur statut. */
export function joursDeLaSemaineOuverte(
  cycle: Cycle, phases: PhaseCycle[], seances: SeancePlanifiee[], realisees: SeanceRealisee[], numero: number, aujourdhui: DateISO,
): JourProgramme[] {
  const { ordre, semaine } = positionDeLaSemaine(numero)
  const phase = phases.find((p) => p.ordre === ordre)
  if (!phase) return []
  const lundi = debutSemaine(cycle, phase, semaine)
  const lignes = seancesDeLaSemaine(numero, phases, seances, realisees, aujourdhui)
  return JOURS.map((nom, i) => {
    const date = ajouterJours(lundi, i)
    return { date, nom: `${nom.slice(0, 3)}.`, lignes: lignes.filter((l) => l.seance.date === date) }
  })
}

/** « Phase 2 · puissance · semaine allégée » : la mention sous « Semaine 6 sur 12 ». */
export function mentionSemaine(phases: PhaseCycle[], numero: number): string {
  const { ordre, semaine } = positionDeLaSemaine(numero)
  const phase = phases.find((p) => p.ordre === ordre)
  if (!phase) return ''
  const accent = phase.accent ? ` · ${ETIQUETTES_ACCENT[phase.accent].toLowerCase()}` : ''
  const type = phase.semaines.find((s) => s.numero === semaine)?.type
  const suite = type === 'allegee' ? ' · semaine allégée' : type === 'affutage' ? ' · affûtage' : type === 'transition' ? ' · transition' : ''
  return `Phase ${ordre}${accent}${suite}`
}
