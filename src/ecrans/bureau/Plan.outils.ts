// Fonctions pures de la rubrique Plan (vue 12 semaines et fenêtre « Nouveau cycle »).
// Rien ici n'écrit dans la base : les écrans passent par `src/donnees/plan.ts`.
// Rien de calculable n'est stocké (R-8) : nombre de séances, charge, semaine en cours se calculent à chaque affichage.
import { lundiDe } from '../../donnees/debrief.ts'
import type {
  AccentPhase, Cycle, DateISO, NiveauDetail, PhaseCycle, SemainePlan, SeancePlanifiee,
} from '../../donnees/modele.ts'
import { ETIQUETTES_NIVEAU, dureeVersionSolo, niveauPropose } from '../../donnees/niveaux.ts'
import { ajouterJours, debutSemaine } from '../../donnees/plan.ts'

export const ETIQUETTES_ACCENT: Record<AccentPhase, string> = {
  doigts: 'Doigts',
  traction_gainage: 'Traction et gainage',
  puissance: 'Puissance',
  resistance: 'Résistance',
  endurance: 'Endurance',
  technique: 'Technique',
}
export const ACCENTS: AccentPhase[] = ['doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance', 'technique']

export const REDUCTIONS_ALLEGEE = [40, 50, 60] as const
export const REDUCTION_PAR_DEFAUT = 50
export const NB_OBJECTIFS_MAX = 2

export const ETIQUETTES_TYPE_SEMAINE: Record<SemainePlan['type'], string> = {
  charge: 'Charge',
  allegee: 'Allégée',
  affutage: 'Affûtage',
  transition: 'Transition',
}

// ——— Dates ———

/** Le lundi qui suit la date donnée (jamais aujourd'hui, même un lundi) : début proposé d'un nouveau cycle. */
export function lundiSuivant(aujourdhui: DateISO): DateISO {
  return ajouterJours(lundiDe(aujourdhui), 7)
}

export function estUnLundi(jour: DateISO): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(jour) && lundiDe(jour) === jour
}

const jourMois = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const jourMoisAnnee = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

function versDate(jour: DateISO): Date {
  const [a, m, j] = jour.split('-').map(Number)
  return new Date(a, m - 1, j)
}
export function dateCourte(jour: DateISO): string { return jourMois.format(versDate(jour)) }
export function dateLongue(jour: DateISO): string { return jourMoisAnnee.format(versDate(jour)) }

// ——— Création ———

/** Trois phases de 4 semaines : 3 de charge puis 1 allégée (réduction prudente par défaut). */
export function semainesParDefaut(): SemainePlan[] {
  return [
    { numero: 1, type: 'charge' },
    { numero: 2, type: 'charge' },
    { numero: 3, type: 'charge' },
    { numero: 4, type: 'allegee', reductionPct: REDUCTION_PAR_DEFAUT },
  ]
}

export interface DemandeCycle {
  nom: string
  debut: DateISO
  seancesParSemaine: number
  accents: (AccentPhase | null)[] // 3 accents, null = pas encore choisi
  niveauDetail: NiveauDetail // toujours écrit : c'est celui que la fenêtre a affiché
}

/** Un cycle brouillon vide et ses 3 phases. `niveauDetail` est toujours écrit (décision F6). */
export function nouveauCycleVide(demande: DemandeCycle, maintenant: string, nouvelId: () => string): { cycle: Cycle; phases: PhaseCycle[] } {
  const cycle: Cycle = {
    id: nouvelId(), versionFormat: 1, creeLe: maintenant, modifieLe: maintenant,
    nom: demande.nom.trim(),
    debut: demande.debut,
    nbSemaines: 12,
    seancesParSemaine: demande.seancesParSemaine,
    etat: 'brouillon',
    niveauDetail: demande.niveauDetail,
    avertissementsGardes: [],
  }
  const phases = ([1, 2, 3] as const).map((ordre): PhaseCycle => ({
    id: nouvelId(), versionFormat: 1, creeLe: maintenant, modifieLe: maintenant,
    cycleId: cycle.id, ordre, accent: demande.accents[ordre - 1] ?? null, semaines: semainesParDefaut(),
  }))
  return { cycle, phases }
}

// ——— Niveau de détail ———

/**
 * La ligne sous le choix du niveau. Tant que l'utilisateur n'a pas choisi (`choisi === null`), elle suit la proposition ;
 * s'il a choisi autre chose que la proposition, elle le dit sans insister (F6).
 */
export function phraseNiveau(accents: (AccentPhase | null)[], choisi: NiveauDetail | null): string {
  const propose = niveauPropose(accents)
  if (choisi === null || choisi === propose.niveau) return propose.pourquoi
  return `Ton choix. Pour ces accents, l’app propose ${ETIQUETTES_NIVEAU[propose.niveau]}.`
}

/** Les séances qui ont leur propre niveau, différent du niveau demandé : elles le gardent quand le cycle change. */
export function seancesAvecNiveauPropre(seances: Pick<SeancePlanifiee, 'niveauDetail'>[], nouveau: NiveauDetail): number {
  return seances.filter((s) => s.niveauDetail !== undefined && s.niveauDetail !== nouveau).length
}

// ——— Lecture du plan : tout se calcule ———

export interface ResumeSemaine {
  nb: number
  dures: number
  legeres: number
  minutes: number
}

export function resumeSemaine(seances: SeancePlanifiee[], phaseId: string, semaine: number): ResumeSemaine {
  const deLaSemaine = seances.filter((s) => s.phaseId === phaseId && s.semaine === semaine)
  return {
    nb: deLaSemaine.length,
    dures: deLaSemaine.filter((s) => s.solo.durete === 'dure').length,
    legeres: deLaSemaine.filter((s) => s.solo.durete === 'legere').length,
    minutes: deLaSemaine.reduce((total, s) => total + dureeVersionSolo(s.solo), 0),
  }
}

/** Part de la charge (0 à 1) d'une semaine par rapport à la plus chargée du cycle. */
export function chargeRelative(minutes: number, minutesMax: number): number {
  return minutesMax <= 0 ? 0 : Math.min(1, minutes / minutesMax)
}

export interface PositionSemaine {
  phase: 1 | 2 | 3
  semaine: 1 | 2 | 3 | 4
  numero: number // 1 à 12
}

/** La semaine du cycle qui contient la date, ou `null` avant le début ou après la fin. */
export function semaineDuJour(cycle: Cycle, aujourdhui: DateISO): PositionSemaine | null {
  for (let n = 1; n <= cycle.nbSemaines; n++) {
    const phase = (Math.floor((n - 1) / 4) + 1) as 1 | 2 | 3
    const semaine = (((n - 1) % 4) + 1) as 1 | 2 | 3 | 4
    const debut = debutSemaine(cycle, { ordre: phase }, semaine)
    if (debut <= aujourdhui && aujourdhui <= ajouterJours(debut, 6)) return { phase, semaine, numero: n }
  }
  return null
}

/** Les 12 semaines à plat, dans l'ordre, pour la bande S1 à S12. */
export function semainesAPlat(phases: PhaseCycle[]): { numero: number; phase: 1 | 2 | 3; semaine: 1 | 2 | 3 | 4; type: SemainePlan['type'] }[] {
  return phases.flatMap((p) => p.semaines.map((s) => ({
    numero: (p.ordre - 1) * 4 + s.numero, phase: p.ordre, semaine: s.numero, type: s.type,
  })))
}

/** Le cycle à montrer : le plus récemment modifié parmi ceux qui ne sont ni supprimés ni abandonnés. */
export function cycleAMontrer(cycles: Cycle[]): Cycle | undefined {
  return cycles
    .filter((c) => !c.supprimeLe && !c.abandonneLe)
    .sort((a, b) => (a.modifieLe < b.modifieLe ? 1 : a.modifieLe > b.modifieLe ? -1 : 0))[0]
}

/** Phrase lue par un lecteur d'écran pour une case de la bande : « Semaine 4, allégée ». */
export function libelleCaseSemaine(numero: number, type: SemainePlan['type'], enCours: boolean): string {
  const suite = type === 'charge' ? '' : `, ${ETIQUETTES_TYPE_SEMAINE[type].toLowerCase()}`
  return `Semaine ${numero}${suite}${enCours ? ', en cours' : ''}`
}
