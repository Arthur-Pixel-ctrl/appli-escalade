import Dexie, { type Table } from 'dexie'
import type { BlocGrimpe } from './seanceGroupeExemple.ts'
import type { Profil } from './profil.ts'

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

/** Le profil tel qu'il est rangé dans la base : un seul enregistrement, d'identifiant fixe. */
export type ProfilEnregistre = Profil & { id: 'profil'; modifieLe: string }

class Base extends Dexie {
  seancesRealisees!: Table<SeanceRealisee, string>
  reglages!: Table<ProfilEnregistre, string>
  constructor() {
    super('appli-escalade')
    // Seuls les champs qui servent à chercher ou trier sont indexés.
    this.version(1).stores({ seancesRealisees: 'id, date, mode' })
    // Version 2 : ajout des réglages (le profil du grimpeur). Les séances déjà enregistrées sont conservées.
    this.version(2).stores({ seancesRealisees: 'id, date, mode', reglages: 'id' })
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
  await avecReprise(() => base.seancesRealisees.add(seance))
  return seance.id
}

/**
 * Lance une opération sur la base, et la retente une fois si elle échoue.
 * Sur iPhone, quand l'app revient après des heures en arrière-plan, Safari perd parfois
 * la connexion à la base : il suffit alors de la fermer et de la rouvrir.
 */
export async function avecReprise<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch {
    base.close()
    await base.open()
    return await operation()
  }
}

/** Réessaie la base quand l'app revient au premier plan, pour la retrouver prête. */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !base.isOpen()) void base.open().catch(() => {})
})

export async function lireProfil(): Promise<Profil | null> {
  return (await avecReprise(() => base.reglages.get('profil'))) ?? null
}

export async function enregistrerProfil(profil: Profil): Promise<void> {
  await avecReprise(() => base.reglages.put({ ...profil, id: 'profil', modifieLe: new Date().toISOString() }))
}

/** Toutes les séances enregistrées. */
export function lireSeances(): Promise<SeanceRealisee[]> {
  return avecReprise(() => base.seancesRealisees.toArray())
}

// Sauvegarde : toutes les données dans un seul fichier, à garder ou à transférer sur un autre appareil.
interface Sauvegarde { version: 1; exporteLe: string; tables: { seancesRealisees: SeanceRealisee[]; reglages: ProfilEnregistre[] } }

export async function exporterDonnees(): Promise<string> {
  const sauvegarde: Sauvegarde = {
    version: 1,
    exporteLe: new Date().toISOString(),
    tables: { seancesRealisees: await base.seancesRealisees.toArray(), reglages: await base.reglages.toArray() },
  }
  return JSON.stringify(sauvegarde, null, 2)
}

/** Recharge une sauvegarde. Les enregistrements de même identifiant sont remplacés, les autres sont gardés. */
export async function importerDonnees(texte: string): Promise<number> {
  const s = JSON.parse(texte) as Partial<Sauvegarde>
  if (s.version !== 1 || !s.tables || !Array.isArray(s.tables.seancesRealisees)) {
    throw new Error('Ce fichier n’est pas une sauvegarde de l’app.')
  }
  await base.seancesRealisees.bulkPut(s.tables.seancesRealisees)
  if (Array.isArray(s.tables.reglages)) await base.reglages.bulkPut(s.tables.reglages)
  return s.tables.seancesRealisees.length
}
