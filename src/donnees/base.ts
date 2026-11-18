import Dexie, { type Table } from 'dexie'
import type {
  Cycle, DouleurDeclaree, ExercicePerso, FormeDuJour, ObjectifSpecifique, PhaseCycle, ProfilEnregistre,
  Reglages, ResultatTest, SallePerso, SeancePlanifiee, SeanceRealisee,
} from './modele.ts'
import { completerProfil, type Profil } from './profil.ts'
import { ecrire, lireTous } from './stockage.ts'

// La base de données de l'app, stockée sur le téléphone (IndexedDB, via Dexie).
// Le type `SeanceRealisee` vient de `modele.ts` ; les autres fichiers continuent de l'importer d'ici.
export type { SeanceRealisee }

/** Ce qu'on connaît de la séance avant les trois questions de fin. */
export type Brouillon = Omit<SeanceRealisee, 'id' | 'versionFormat' | 'creeLe' | 'modifieLe' | 'date' | 'effortPercu' | 'peau' | 'douleur'>

/** Un document tel qu'il est stocké sur l'appareil : `aEnvoyer` vaut 1 tant qu'il n'est pas parti au serveur (0 ou 1 : Dexie n'indexe pas les booléens). */
export type Local<T> = T & { aEnvoyer: 0 | 1 }

class Base extends Dexie {
  seancesRealisees!: Table<Local<SeanceRealisee>, string>
  reglages!: Table<Local<ProfilEnregistre | Reglages>, string>
  cycles!: Table<Local<Cycle>, string>
  phases!: Table<Local<PhaseCycle>, string>
  seancesPlanifiees!: Table<Local<SeancePlanifiee>, string>
  objectifsSpecifiques!: Table<Local<ObjectifSpecifique>, string>
  exercicesPerso!: Table<Local<ExercicePerso>, string>
  salles!: Table<Local<SallePerso>, string>
  formes!: Table<Local<FormeDuJour>, string>
  douleurs!: Table<Local<DouleurDeclaree>, string>
  resultatsTests!: Table<Local<ResultatTest>, string>
  etatSynchro!: Table<{ cle: string; valeur: unknown }, string>
  appareil!: Table<{ cle: string; valeur: unknown }, string>
  constructor() {
    super('appli-escalade')
    // Seuls les champs qui servent à chercher ou trier sont indexés.
    this.version(1).stores({ seancesRealisees: 'id, date, mode' })
    // Version 2 : ajout des réglages (le profil du grimpeur). Les séances déjà enregistrées sont conservées.
    this.version(2).stores({ seancesRealisees: 'id, date, mode', reglages: 'id' })
    // Version 3 : nouvelles tables du plan, drapeau `aEnvoyer` pour la synchronisation (architecture § 3.4).
    this.version(3).stores({
      seancesRealisees: 'id, date, mode, aEnvoyer',
      reglages: 'id, aEnvoyer', // documents 'profil' et 'reglages'
      cycles: 'id, debut, aEnvoyer',
      phases: 'id, cycleId, aEnvoyer',
      seancesPlanifiees: 'id, date, cycleId, phaseId, aEnvoyer',
      objectifsSpecifiques: 'id, phaseId, aEnvoyer',
      exercicesPerso: 'id, aEnvoyer',
      salles: 'id, aEnvoyer',
      formes: 'id, date, aEnvoyer',
      douleurs: 'id, date, aEnvoyer',
      resultatsTests: 'id, date, testId, aEnvoyer',
      etatSynchro: 'cle', // jamais synchronisée
      appareil: 'cle', // jamais synchronisée, jamais exportée
    }).upgrade(async (tx) => {
      // Règle d'or : on ajoute des champs, on ne retire ni ne remplace rien. Les champs manquants sont tolérés.
      const maintenant = new Date().toISOString()
      const completer = (doc: Record<string, unknown>) => {
        doc.aEnvoyer = 1
        doc.versionFormat = 1
        doc.modifieLe = doc.modifieLe ?? maintenant
        doc.creeLe = doc.creeLe ?? doc.modifieLe
      }
      await tx.table('seancesRealisees').toCollection().modify(completer)
      await tx.table('reglages').toCollection().modify((doc: Record<string, unknown>) => {
        completer(doc)
        if (doc.id !== 'profil') return
        // Le profil reçoit d'un coup les champs récents (prérequis à null, jours, repère), sans perdre les siens.
        const complet = completerProfil(doc as Partial<Profil>)
        for (const [cle, valeur] of Object.entries(complet)) if (doc[cle] === undefined) doc[cle] = valeur
      })
    })
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
  const horodatage = maintenant.toISOString()
  const seance: SeanceRealisee = {
    ...brouillon,
    ...reponses,
    id: crypto.randomUUID(),
    versionFormat: 1,
    creeLe: horodatage,
    modifieLe: horodatage,
    date: jourLocal(maintenant),
  }
  await ecrire('seancesRealisees', seance)
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
// (Protégé : les tests tournent sans `document`.)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !base.isOpen()) void base.open().catch(() => {})
  })
}

export async function lireProfil(): Promise<Profil | null> {
  const enregistre = await avecReprise(() => base.reglages.get('profil'))
  // Un profil enregistré avant la v2 n'a pas les champs récents : on les complète.
  return enregistre ? completerProfil(enregistre as Partial<Profil>) : null
}

export async function enregistrerProfil(profil: Profil): Promise<void> {
  await ecrire('reglages', { ...profil, id: 'profil' })
}

/** Toutes les séances enregistrées. */
export function lireSeances(): Promise<SeanceRealisee[]> {
  return lireTous<SeanceRealisee>('seancesRealisees')
}

// Sauvegarde : toutes les données dans un seul fichier, à garder ou à transférer sur un autre appareil.
interface Sauvegarde { version: 1; exporteLe: string; tables: { seancesRealisees: SeanceRealisee[]; reglages: (ProfilEnregistre | Reglages)[] } }

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
  // Un fichier exporté avant la version 3 n'a ni `versionFormat` ni `aEnvoyer` : on les complète.
  const completer = <T extends { modifieLe: string; creeLe?: string }>(doc: T) =>
    ({ ...doc, versionFormat: 1 as const, creeLe: doc.creeLe ?? doc.modifieLe, aEnvoyer: 1 as const })
  await base.seancesRealisees.bulkPut(s.tables.seancesRealisees.map(completer))
  if (Array.isArray(s.tables.reglages)) await base.reglages.bulkPut(s.tables.reglages.map(completer))
  return s.tables.seancesRealisees.length
}
