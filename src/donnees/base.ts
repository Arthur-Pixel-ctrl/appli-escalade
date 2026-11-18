import Dexie, { type Table } from 'dexie'
import type { ProfilEnregistre, SeanceRealisee } from './modele.ts'
import { completerProfil, type Profil } from './profil.ts'

// La base de données de l'app, stockée sur le téléphone (IndexedDB, via Dexie).
// Le type `SeanceRealisee` vient de `modele.ts` ; les autres fichiers continuent de l'importer d'ici.
export type { SeanceRealisee }

/** Ce qu'on connaît de la séance avant les trois questions de fin. */
export type Brouillon = Omit<SeanceRealisee, 'id' | 'versionFormat' | 'creeLe' | 'modifieLe' | 'date' | 'effortPercu' | 'peau' | 'douleur'>

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
    versionFormat: 1,
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
  const enregistre = await avecReprise(() => base.reglages.get('profil'))
  // Un profil enregistré avant la v2 n'a pas les champs récents : on les complète.
  return enregistre ? completerProfil(enregistre) : null
}

export async function enregistrerProfil(profil: Profil): Promise<void> {
  const maintenant = new Date().toISOString()
  await avecReprise(async () => {
    const existant = await base.reglages.get('profil')
    await base.reglages.put({ ...profil, id: 'profil', versionFormat: 1, creeLe: existant?.creeLe ?? maintenant, modifieLe: maintenant })
  })
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
