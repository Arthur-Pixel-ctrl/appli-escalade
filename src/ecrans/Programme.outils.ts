// Fonctions pures de l'écran Programme (T-07) : la semaine ouverte, jour par jour.
import type { Cycle, DateISO, PhaseCycle, SeancePlanifiee, SeanceRealisee } from '../donnees/modele.ts'
import { lundiDe } from '../donnees/debrief.ts'
import { ajouterJours, debutSemaine } from '../donnees/plan.ts'
import { cleAvertissement, contexteVerif, formeAffichage, planVersVerif, toutesLesFiches, verifierSemaine } from '../regles/index.ts'
import { ETIQUETTES_ACCENT } from './bureau/Plan.outils.ts'
import { seancesDeLaSemaine, type LigneJour } from './bureau/TableauDeBord.outils.ts'
import { positionDeLaSemaine } from './bureau/VueSemaine.outils.ts'
import type { AvertissementDuJour, DonneesVerifJour } from './Aujourdhui.outils.ts'

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

/**
 * Ce que le moteur dit de la semaine de la séance, gardé pour elle : les avertissements qui la visent
 * et ceux qui la citent (W-01 se pose sur la séance d'après et nomme celle d'avant par `seanceLieeId`).
 * Même règle qu'`avertissementsDeLaSeance` (Aujourd'hui) : les informations sont écartées, un signal d'arrêt
 * n'est jamais replié. On avertit, on ne bloque rien.
 */
export function avertissementsAutourDe(d: DonneesVerifJour, seance: SeancePlanifiee): AvertissementDuJour[] {
  const ctx = contexteVerif({
    profil: d.profil, ...(d.reglages ? { reglages: d.reglages } : {}), exercicesPerso: d.exercicesPerso,
    douleurs: d.douleurs, formes: d.formes, objectifs: d.objectifs, aujourdhui: d.aujourdhui, maintenant: d.maintenant,
  })
  const plan = planVersVerif({
    cycle: d.cycle, phases: d.phases, seances: d.seances, realisees: d.realisees, objectifs: d.objectifs,
    origine: 'utilisateur', fiches: toutesLesFiches(d.exercicesPerso),
  })
  const gardes = new Set(d.cycle.avertissementsGardes)
  const resultat: AvertissementDuJour[] = []
  for (const a of verifierSemaine(lundiDe(seance.date), plan, ctx)) {
    if (a.seanceId !== seance.id && a.seanceLieeId !== seance.id) continue
    const forme = formeAffichage(a)
    if (forme === 'information') continue
    resultat.push({ avertissement: a, forme, garde: forme === 'avertissement' && gardes.has(cleAvertissement(a)) })
  }
  return resultat
}
