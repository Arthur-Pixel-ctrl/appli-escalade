import Dexie, { type Table } from 'dexie'
import type { BlocGrimpe } from './seanceGroupeExemple.ts'

// La base de données de l'app, stockée sur le téléphone (IndexedDB, via Dexie).
// Version simplifiée de `SeanceRealisee` du modèle de données : on n'enregistre que ce que
// l'app sait déjà produire. Les champs manquants seront ajoutés avec les lots suivants.
export interface SeanceRealisee {
  id: string
  creeLe: string // horodatage complet
  modifieLe: string
  date: string // jour de la séance, "2026-11-16"
  mode: 'solo' | 'groupe'
  nom: string
  durete: 'dure' | 'legere'
  dureeMin: number
  effortPercu: number // 1 à 10
  peau: 1 | 2 | 3 // 1 abîmée, 2 limite, 3 bonne
  douleur: boolean
  etapes: { titre: string; statut: 'faite' | 'passee' | 'a_faire' }[] // séance solo
  objectifs: { libelle: string; cible: number; fait: number }[] // séance en groupe
  blocs: BlocGrimpe[]
}

/** Ce qu'on connaît de la séance avant les trois questions de fin. */
export type Brouillon = Omit<SeanceRealisee, 'id' | 'creeLe' | 'modifieLe' | 'date' | 'effortPercu' | 'peau' | 'douleur'>

class Base extends Dexie {
  seancesRealisees!: Table<SeanceRealisee, string>
  constructor() {
    super('appli-escalade')
    // Seuls les champs qui servent à chercher ou trier sont indexés.
    this.version(1).stores({ seancesRealisees: 'id, date, mode' })
  }
}

export const base = new Base()

/** Le jour local au format "2026-11-16" (et non le jour en temps universel). */
export function jourLocal(d = new Date()): string {
  const deux = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`
}

export async function enregistrerSeance(
  brouillon: Brouillon,
  reponses: Pick<SeanceRealisee, 'effortPercu' | 'peau' | 'douleur'>,
): Promise<string> {
  const maintenant = new Date()
  const seance: SeanceRealisee = {
    ...brouillon,
    ...reponses,
    id: crypto.randomUUID(),
    creeLe: maintenant.toISOString(),
    modifieLe: maintenant.toISOString(),
    date: jourLocal(maintenant),
  }
  await base.seancesRealisees.add(seance)
  return seance.id
}
