// Exemples typés du modèle v2, réutilisés par les tests et les écrans des tâches suivantes.
// Identifiants (UUID) et dates sont fixes pour que les tests restent stables.
import type { Cycle, PhaseCycle, SemainePlan, SeancePlanifiee } from './modele.ts'
import { SEANCE_EXEMPLE } from './seanceExemple.ts'
import { SEANCE_GROUPE_EXEMPLE } from './seanceGroupeExemple.ts'

const CREE_LE = '2026-11-16T08:00:00.000Z'
const ID_CYCLE = '3f1c2a9e-5b7d-4e08-9a41-6c2d8e1f0a11'
const ID_PHASE_1 = '7b9d4c52-1e3a-4f6b-8c70-2a5e9d3b1c22'
const ID_PHASE_2 = '0d6e8f13-9a2c-4b57-a1e4-5c7b3f9d2e33'
const ID_PHASE_3 = 'c2a4e6b8-3d5f-4719-b0c2-8e1a7d5f4b44'

/** Un cycle de 12 semaines qui commence un lundi, 3 séances par semaine. */
export const EXEMPLE_CYCLE: Cycle = {
  id: ID_CYCLE, versionFormat: 1, creeLe: CREE_LE, modifieLe: CREE_LE,
  nom: 'Cycle d’automne', debut: '2026-11-16', nbSemaines: 12, seancesParSemaine: 3,
  etat: 'valide', avertissementsGardes: [],
}

/** Trois semaines de charge, puis une semaine allégée de moitié. */
const quatreSemaines = (): SemainePlan[] => [
  { numero: 1, type: 'charge' },
  { numero: 2, type: 'charge' },
  { numero: 3, type: 'charge' },
  { numero: 4, type: 'allegee', reductionPct: 50 },
]

/** Les trois phases du cycle : doigts, puissance, résistance. */
export const EXEMPLE_PHASES: PhaseCycle[] = [
  { id: ID_PHASE_1, versionFormat: 1, creeLe: CREE_LE, modifieLe: CREE_LE, cycleId: ID_CYCLE, ordre: 1, accent: 'doigts', semaines: quatreSemaines() },
  { id: ID_PHASE_2, versionFormat: 1, creeLe: CREE_LE, modifieLe: CREE_LE, cycleId: ID_CYCLE, ordre: 2, accent: 'puissance', semaines: quatreSemaines() },
  { id: ID_PHASE_3, versionFormat: 1, creeLe: CREE_LE, modifieLe: CREE_LE, cycleId: ID_CYCLE, ordre: 3, accent: 'resistance', semaines: quatreSemaines() },
]

/** Une séance de la phase 1, semaine 1, avec ses deux versions (solo et groupe). */
export const EXEMPLE_SEANCE_PLANIFIEE: SeancePlanifiee = {
  id: '9e8d7c6b-5a49-4382-b1f0-e2d3c4b5a666', versionFormat: 1, creeLe: CREE_LE, modifieLe: CREE_LE,
  cycleId: ID_CYCLE, phaseId: ID_PHASE_1, semaine: 1, date: '2026-11-17', qualite: 'doigts',
  solo: { ...SEANCE_EXEMPLE, durete: 'dure' },
  groupe: { ...SEANCE_GROUPE_EXEMPLE, durete: 'dure' },
}
