// Fonctions pures de l'écran Aujourd'hui (T-06) : on lit le plan et les séances faites, on ne stocke rien (R-8).
import { lundiDe } from '../donnees/debrief.ts'
import type {
  Cycle, DateISO, DouleurDeclaree, Durete, ExercicePerso, FormeDuJour, NiveauDetail, ObjectifSpecifique, PhaseCycle,
  Profil, Reglages, SeancePlanifiee, SeanceRealisee, VersionGroupe,
} from '../donnees/modele.ts'
import { ajouterJours, statutSeance } from '../donnees/plan.ts'
import {
  cleAvertissement, contexteVerif, formeAffichage, planVersVerif, toutesLesFiches, verifierSemaine, type Avertissement,
} from '../regles/index.ts'
import { nomDuJour } from './bureau/avertissementsPlan.ts'
import { ETIQUETTES_ACCENT, semaineDuJour } from './bureau/Plan.outils.ts'

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const INITIALES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** 1 h 45 à partir de 105 minutes. */
export function formaterDuree(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

export const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export const libelleDurete = (d: Durete) => (d === 'dure' ? 'Séance dure' : 'Séance légère')

// ——— Ce que l'écran montre pour la séance du jour ———

export type VueDuJour =
  | { type: 'seance'; seance: SeancePlanifiee }
  | { type: 'faite'; seance: SeancePlanifiee; realisee: SeanceRealisee }
  | { type: 'repos'; sautee: boolean }

/** Une séance à faire d'abord, sinon une séance déjà faite, sinon le repos (avec « Séance sautée. » si elle l'a été). */
export function vueDuJour(seances: SeancePlanifiee[], realisees: SeanceRealisee[], aujourdhui: DateISO): VueDuJour {
  const duJour = seances.filter((s) => s.date === aujourdhui)
  const avec = (statut: string) => duJour.find((s) => statutSeance(s, realisees, aujourdhui) === statut)
  const aFaire = avec('aujourdhui')
  if (aFaire) return { type: 'seance', seance: aFaire }
  const faite = avec('faite')
  const realisee = faite && realisees.find((r) => !r.supprimeLe && r.seancePlanifieeId === faite.id)
  if (faite && realisee) return { type: 'faite', seance: faite, realisee }
  return { type: 'repos', sautee: avec('sautee') !== undefined }
}

/** La séance manquée la plus récente, si elle date de moins d'une semaine : « Séance de lundi pas faite ». */
export function seanceManquee(
  seances: SeancePlanifiee[], realisees: SeanceRealisee[], aujourdhui: DateISO,
): { seance: SeancePlanifiee; jour: string } | undefined {
  const seance = [...seances]
    .filter((s) => statutSeance(s, realisees, aujourdhui) === 'manquee' && s.date >= ajouterJours(aujourdhui, -6))
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0]
  return seance ? { seance, jour: nomDuJour(seance.date) } : undefined
}

/** La première séance à venir (après aujourd'hui). */
export function prochaineAVenir(seances: SeancePlanifiee[], realisees: SeanceRealisee[], aujourdhui: DateISO): SeancePlanifiee | undefined {
  return [...seances]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .find((s) => statutSeance(s, realisees, aujourdhui) === 'a_venir')
}

// ——— La semaine en 7 cases ———

export type EtatJour = 'fait' | 'aujourdhui' | 'prevu' | 'manque' | 'saute' | 'repos'

export interface CaseJour { date: DateISO; initiale: string; etat: EtatJour; libelle: string }

/** Les 7 jours de la semaine du jour. Aujourd'hui garde sa case « aujourd'hui », faite ou non (le libellé le dit). */
export function joursDeLaSemaine(seances: SeancePlanifiee[], realisees: SeanceRealisee[], aujourdhui: DateISO): CaseJour[] {
  const lundi = lundiDe(aujourdhui)
  return JOURS.map((nom, i) => {
    const date = ajouterJours(lundi, i)
    const duJour = seances.filter((s) => s.date === date)
    const statuts = duJour.map((s) => statutSeance(s, realisees, aujourdhui))
    const premiere = duJour[0]?.solo.nom
    const jour = majuscule(nom)
    if (date === aujourdhui) {
      const fait = statuts.includes('faite') && !statuts.includes('aujourdhui')
      return { date, initiale: INITIALES[i], etat: 'aujourdhui' as const, libelle: `${jour}, aujourd’hui${fait ? ', fait' : ''}` }
    }
    const etat: EtatJour = statuts.includes('faite') ? 'fait'
      : statuts.includes('a_venir') ? 'prevu'
        : statuts.includes('manquee') ? 'manque'
          : statuts.includes('sautee') ? 'saute' : 'repos'
    const mots: Record<EtatJour, string> = {
      fait: `${jour}, ${premiere}, fait`, prevu: `${jour}, ${premiere}`, manque: `${jour}, ${premiere}, pas faite`,
      saute: `${jour}, ${premiere}, sautée`, repos: `${jour}, repos`, aujourdhui: '',
    }
    return { date, initiale: INITIALES[i], etat, libelle: mots[etat] }
  })
}

// ——— Mention de phase ———

/** « Phase 1 · doigts · semaine 2 sur 4 », et « SEMAINE ALLÉGÉE » quand c'est le cas (R-2). */
export function mentionPhase(cycle: Cycle, phases: PhaseCycle[], aujourdhui: DateISO): { phase: string; type: string | null } | null {
  const position = semaineDuJour(cycle, aujourdhui)
  const phase = position && phases.find((p) => p.ordre === position.phase)
  if (!position || !phase) return null
  const accent = phase.accent ? ` · ${ETIQUETTES_ACCENT[phase.accent].toLowerCase()}` : ''
  const type = phase.semaines.find((s) => s.numero === position.semaine)?.type
  const typeTexte = type === 'allegee' ? 'SEMAINE ALLÉGÉE' : type === 'affutage' ? 'SEMAINE D’AFFÛTAGE' : type === 'transition' ? 'SEMAINE DE TRANSITION' : null
  return { phase: `Phase ${position.phase}${accent} · semaine ${position.semaine} sur 4`, type: typeTexte }
}

// ——— Boutons de lancement ———

export function sousTitreSolo(niveau: NiveauDetail): string {
  return { detaille: 'Séance guidée, chrono intégré', grandes_lignes: 'Grandes lignes, chrono libre', simple: 'Recommandation, chrono libre' }[niveau]
}

/** « 2 objectifs, 1 h 30 » : la durée annoncée n'est pas calculable pour une séance de groupe, elle manque parfois. */
export function sousTitreGroupe(g: Pick<VersionGroupe, 'objectifs' | 'dureeMin'>): string {
  const n = g.objectifs.length
  const objectifs = `${n} ${n > 1 ? 'objectifs' : 'objectif'}`
  return g.dureeMin !== undefined ? `${objectifs}, ${formaterDuree(g.dureeMin)}` : objectifs
}

/**
 * Jusqu'à l'arrivée de SeanceEnBref (D-27), toute séance solo s'ouvre en SeanceSolo, donc seulement si elle a des étapes
 * (amendement 6 de D-22). Sans étapes, le bouton solo est masqué.
 */
export const peutLancerSolo = (s: Pick<SeancePlanifiee, 'solo'>) => s.solo.etapes.length > 0
export const peutLancerGroupe = (s: Pick<SeancePlanifiee, 'groupe'>) => s.groupe !== null

// ——— Avertissements de la semaine qui citent la séance du jour (amendement 4) ———

export interface DonneesVerifJour {
  cycle: Cycle
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  objectifs: ObjectifSpecifique[]
  profil: Profil
  reglages?: Pick<Reglages, 'reglesSecurite'>
  exercicesPerso: ExercicePerso[]
  douleurs: DouleurDeclaree[]
  formes: FormeDuJour[]
  realisees: SeanceRealisee[]
  aujourdhui: DateISO
  maintenant: string
}

export interface AvertissementDuJour { avertissement: Avertissement; forme: 'avertissement' | 'arret'; garde: boolean }

/**
 * Ce que le moteur dit de la semaine du jour, gardé pour la séance donnée. Les simples informations sont écartées
 * (elles n'alertent pas) ; un signal d'arrêt n'est jamais replié, un avertissement l'est si l'utilisateur l'a gardé.
 */
export function avertissementsDeLaSeance(d: DonneesVerifJour, seanceId: string): AvertissementDuJour[] {
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
  for (const a of verifierSemaine(lundiDe(d.aujourdhui), plan, ctx)) {
    if (a.seanceId !== seanceId) continue
    const forme = formeAffichage(a)
    if (forme === 'information') continue
    resultat.push({ avertissement: a, forme, garde: forme === 'avertissement' && gardes.has(cleAvertissement(a)) })
  }
  return resultat
}

// ——— Hors ligne : la date de la dernière version connue du plan ———

export function dateDuPlanConnu(cycle: Cycle, seances: SeancePlanifiee[]): string {
  return [cycle.modifieLe, ...seances.map((s) => s.modifieLe)].reduce((a, b) => (a > b ? a : b))
}
