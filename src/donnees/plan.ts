// Accès au plan (cycles, phases, séances planifiées, exercices et salles personnels)
// et valeurs dérivées (architecture § 3.5 : « calculé, jamais stocké »).
// Les dates de début, la fin d'un cycle, le statut d'une séance se calculent ici à chaque lecture ;
// aucune de ces valeurs n'est enregistrée dans la base.
import { avecReprise, base, jourLocal } from './base.ts'
import { lundiDe } from './debrief.ts'
import type {
  Cycle, DateISO, ExercicePerso, PhaseCycle, SallePerso, SeancePlanifiee, SeanceRealisee,
} from './modele.ts'
import { salleParId, type Salle } from './salles.ts'
import { ecrire, lireTous, lireUn, supprimer } from './stockage.ts'
import type { EtapeSeance } from '../moteur/types.ts'

// ——— Dates (fonctions pures, jours locaux) ———

/**
 * Ajoute (ou retire) des jours à un jour local.
 * On construit la date avec `new Date(année, mois − 1, jour)` : `new Date("2026-11-17")` serait lu
 * en heure universelle et tomberait la veille à minuit à Paris. Le jour est recalculé par le calendrier,
 * donc le changement d'heure (jour de 23 h ou 25 h) ne décale rien.
 */
export function ajouterJours(jour: DateISO, n: number): DateISO {
  const [annee, mois, j] = jour.split('-').map(Number)
  return jourLocal(new Date(annee, mois - 1, j + n))
}

/** Premier jour (un lundi) d'une phase : début du cycle + (ordre − 1) × 28 jours. */
export function debutPhase(cycle: Cycle, phase: Pick<PhaseCycle, 'ordre'>): DateISO {
  return ajouterJours(cycle.debut, (phase.ordre - 1) * 28)
}

/** Premier jour (un lundi) d'une semaine de phase : début de la phase + (semaine − 1) × 7 jours. */
export function debutSemaine(cycle: Cycle, phase: Pick<PhaseCycle, 'ordre'>, semaine: 1 | 2 | 3 | 4): DateISO {
  return ajouterJours(debutPhase(cycle, phase), (semaine - 1) * 7)
}

/** Dernier jour du cycle (un dimanche) : début + nombre de semaines × 7 − 1. */
export function finCycle(cycle: Cycle): DateISO {
  return ajouterJours(cycle.debut, cycle.nbSemaines * 7 - 1)
}

// ——— Valeurs dérivées (fonctions pures) ———

/**
 * Le cycle qui couvre la date du jour : validé, ni supprimé ni abandonné.
 * Si deux cycles se chevauchent, le plus récemment modifié l'emporte.
 */
export function cycleEnCours(cycles: Cycle[], aujourdhui: DateISO): Cycle | undefined {
  const candidats = cycles.filter((c) =>
    c.etat === 'valide' && !c.supprimeLe && !c.abandonneLe && c.debut <= aujourdhui && aujourdhui <= finCycle(c))
  // Les horodatages sont en UTC ISO : l'ordre alphabétique est l'ordre du temps.
  return candidats.sort((a, b) => (a.modifieLe < b.modifieLe ? 1 : a.modifieLe > b.modifieLe ? -1 : 0))[0]
}

/** Vrai quand la date du jour est après la fin du cycle et que le cycle n'a pas été abandonné. */
export function cycleTermine(cycle: Cycle, aujourdhui: DateISO): boolean {
  return !cycle.abandonneLe && aujourdhui > finCycle(cycle)
}

export type StatutSeance = 'faite' | 'sautee' | 'manquee' | 'aujourdhui' | 'a_venir'

/**
 * Statut d'une séance planifiée, dans cet ordre de priorité :
 * faite (une séance réalisée non supprimée la cite), sautée (choix de l'utilisateur),
 * manquée (date passée), puis aujourd'hui ou à venir. « Faite » l'emporte donc sur « sautée ».
 */
export function statutSeance(s: SeancePlanifiee, realisees: SeanceRealisee[], aujourdhui: DateISO): StatutSeance {
  if (realisees.some((r) => !r.supprimeLe && r.seancePlanifieeId === s.id)) return 'faite'
  if (s.sauteeLe) return 'sautee'
  if (s.date < aujourdhui) return 'manquee'
  return s.date === aujourdhui ? 'aujourdhui' : 'a_venir'
}

/**
 * Les jours où on peut déplacer une séance depuis le téléphone : ceux de sa semaine (du lundi au dimanche)
 * qui ne sont pas passés, sauf son jour actuel. Une séance manquée ou sautée n'en a aucun : pas de rattrapage (A3-6).
 * Un jour qui a déjà une séance reste possible : les avertissements le diront, rien n'est bloqué.
 */
export function joursPossibles(s: SeancePlanifiee, aujourdhui: DateISO): DateISO[] {
  if (s.date < aujourdhui || s.sauteeLe) return []
  const lundi = lundiDe(s.date)
  return [0, 1, 2, 3, 4, 5, 6].map((i) => ajouterJours(lundi, i)).filter((jour) => jour >= aujourdhui && jour !== s.date)
}

/** Durée d'une version solo : somme des durées de ses étapes (en minutes). */
export function dureeEtapes(etapes: EtapeSeance[]): number {
  return etapes.reduce((total, e) => total + e.dureeMin, 0)
}

/** La salle personnelle de même identifiant si elle existe (et n'est pas supprimée), sinon le préréglage. */
export function salleEffective(id: string | undefined, sallesPerso: SallePerso[]): Salle {
  return sallesPerso.find((s) => s.id === id && !s.supprimeLe) ?? salleParId(id)
}

// ——— Lecture ———

export function lireCycles(): Promise<Cycle[]> {
  return lireTous<Cycle>('cycles')
}

/** Les phases (dans l'ordre) et les séances (dans l'ordre des dates) d'un cycle, sans les supprimées. */
export async function lirePlanDuCycle(cycleId: string): Promise<{ phases: PhaseCycle[]; seances: SeancePlanifiee[] }> {
  const phases = await avecReprise(() => base.phases.where('cycleId').equals(cycleId).toArray())
  const seances = await avecReprise(() => base.seancesPlanifiees.where('cycleId').equals(cycleId).toArray())
  return {
    phases: phases.filter((p) => !p.supprimeLe).sort((a, b) => a.ordre - b.ordre),
    seances: seances.filter((s) => !s.supprimeLe).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
  }
}

/**
 * Le plan à montrer sur le téléphone : le cycle validé qui couvre la date du jour, ses phases et ses séances.
 * `null` s'il n'y en a pas (aucun cycle, brouillon seulement, cycle terminé, supprimé ou abandonné).
 * Aujourd'hui et Programme ne lisent que le cycle validé en cours (amendement 7 de D-22) :
 * une séance dont la phase n'est pas une phase non supprimée de ce cycle est orpheline et n'est jamais rendue.
 */
export async function lirePlanEnCours(
  aujourdhui: DateISO,
): Promise<{ cycle: Cycle; phases: PhaseCycle[]; seances: SeancePlanifiee[] } | null> {
  const cycle = cycleEnCours(await lireCycles(), aujourdhui)
  if (!cycle) return null
  const { phases, seances } = await lirePlanDuCycle(cycle.id)
  const idsPhases = new Set(phases.map((p) => p.id))
  return { cycle, phases, seances: seances.filter((s) => idsPhases.has(s.phaseId)) }
}

/** Une séance planifiée par son identifiant, `undefined` si elle n'existe pas ou a été supprimée. */
export async function lireSeancePlanifiee(id: string): Promise<SeancePlanifiee | undefined> {
  return lireUn<SeancePlanifiee>('seancesPlanifiees', id)
}

/**
 * Ne regarde ni le cycle ni son état : ne pas s'en servir pour afficher le plan (Aujourd'hui, Programme).
 * Les séances planifiées dont la date est comprise entre `debut` et `fin` (inclus), sans les supprimées.
 */
export async function lireSeancesEntre(debut: DateISO, fin: DateISO): Promise<SeancePlanifiee[]> {
  const trouvees = await avecReprise(() => base.seancesPlanifiees.where('date').between(debut, fin, true, true).toArray())
  return trouvees.filter((s) => !s.supprimeLe)
}

export function lireExercicesPerso(): Promise<ExercicePerso[]> {
  return lireTous<ExercicePerso>('exercicesPerso')
}

export function lireSallesPerso(): Promise<SallePerso[]> {
  return lireTous<SallePerso>('salles')
}

// ——— Écriture (toujours par `ecrire` / `supprimer` : dates et drapeau d'envoi posés au même endroit) ———

export function enregistrerCycle(c: Cycle): Promise<void> {
  return ecrire('cycles', c)
}

export function enregistrerPhase(p: PhaseCycle): Promise<void> {
  return ecrire('phases', p)
}

export function enregistrerSeancePlanifiee(s: SeancePlanifiee): Promise<void> {
  return ecrire('seancesPlanifiees', s)
}

export function enregistrerExercicePerso(e: ExercicePerso): Promise<void> {
  return ecrire('exercicesPerso', e)
}

export function enregistrerSallePerso(s: SallePerso): Promise<void> {
  return ecrire('salles', s)
}

/** Supprime (doucement) le cycle, ses phases, leurs objectifs spécifiques et ses séances planifiées. */
export async function supprimerCycle(id: string): Promise<void> {
  // On lit directement la base pour trouver aussi les documents déjà masqués sans les re-supprimer.
  const { phases, seances } = await lirePlanDuCycle(id)
  for (const phase of phases) {
    const objectifs = await avecReprise(() => base.objectifsSpecifiques.where('phaseId').equals(phase.id).toArray())
    for (const o of objectifs) if (!o.supprimeLe) await supprimer('objectifsSpecifiques', o.id)
    await supprimer('phases', phase.id)
  }
  for (const s of seances) await supprimer('seancesPlanifiees', s.id)
  await supprimer('cycles', id)
}

// Petits ajustements du téléphone (B11, architecture § 2.5) : le document entier est réécrit ;
// si l'ordinateur modifie la même séance sans réseau, la modification la plus récente gagne.

async function lireOuErreur(id: string): Promise<SeancePlanifiee> {
  const s = await lireSeancePlanifiee(id)
  if (!s) throw new Error('Séance introuvable.')
  return s
}

/** Déplace une séance à un autre jour de sa semaine. `aujourdhui` vient de l'appelant : pas d'horloge cachée. */
export async function deplacerSeance(id: string, nouvelleDate: DateISO, aujourdhui: DateISO): Promise<void> {
  const s = await lireOuErreur(id)
  if (!joursPossibles(s, aujourdhui).includes(nouvelleDate)) {
    throw new Error('Ce jour n’est pas possible : même semaine, pas avant aujourd’hui.')
  }
  // `semaine` et `phaseId` ne changent pas : le jour reste dans la même semaine.
  await ecrire('seancesPlanifiees', { ...s, date: nouvelleDate })
}

/** Saute une séance : on garde l'instant du choix, le statut « sautée » se calcule (§ 3.5). */
export async function sauterSeance(id: string): Promise<void> {
  const s = await lireOuErreur(id)
  await ecrire('seancesPlanifiees', { ...s, sauteeLe: new Date().toISOString() })
}

/** Annule le saut : le champ disparaît du document. */
export async function annulerSaut(id: string): Promise<void> {
  const s = await lireOuErreur(id)
  const { sauteeLe: _sauteeLe, ...reste } = s
  await ecrire('seancesPlanifiees', reste)
}
