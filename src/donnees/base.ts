import Dexie, { type Table } from 'dexie'
import type {
  Cycle, DouleurDeclaree, ExercicePerso, FormeDuJour, ObjectifSpecifique, PhaseCycle, ProfilEnregistre,
  Reglages, ResultatTest, SallePerso, SeancePlanifiee, SeanceRealisee,
} from './modele.ts'
import { completerProfil, type Profil } from './profil.ts'
import { decider } from '../synchro/fusion.ts'
import {
  ecrire, lireTous, lireUn, signalerDonneesChangees, signalerEcriture, TABLES_SYNCHRONISEES, type TableSynchronisee,
} from './stockage.ts'

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
  // Par `lireUn` : un profil supprimé (suppression douce) n'existe plus.
  const enregistre = await lireUn<Local<ProfilEnregistre>>('reglages', 'profil')
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
// Un seul format pour toute l'app (la sauvegarde du compte dans `reprise.ts` passe par ici).
export interface SauvegardeV2 { version: 2; exporteLe: string; tables: Partial<Record<TableSynchronisee, unknown[]>> }

/**
 * Les 11 tables synchronisées, documents supprimés compris (pour que l'import propage la suppression).
 * Sans `aEnvoyer` (propre à l'appareil). Ni `etatSynchro` ni `appareil` : la clé API Claude ne sort jamais.
 */
export async function exporterDonnees(): Promise<string> {
  const tables: SauvegardeV2['tables'] = {}
  for (const nom of TABLES_SYNCHRONISEES) {
    const documents = (await avecReprise(() => base.table(nom).toArray())) as Record<string, unknown>[]
    tables[nom] = documents.map(({ aEnvoyer: _aEnvoyer, ...contenu }) => contenu)
  }
  const sauvegarde: SauvegardeV2 = { version: 2, exporteLe: new Date().toISOString(), tables }
  return JSON.stringify(sauvegarde, null, 2)
}

// Limites du script SQL du serveur (supabase/migrations/0001_documents.sql) : un document qui les dépasse
// serait refusé à l'envoi. On l'écarte dès l'import plutôt que de le garder « à envoyer » pour toujours.
export const LONGUEUR_MAX_ID = 100
export const TAILLE_MAX_DOCUMENT = 200_000

/** Vrai si le serveur accepterait ce document. */
function acceptableParLeServeur(doc: { id: string }): boolean {
  if (doc.id.length > LONGUEUR_MAX_ID) return false
  return new TextEncoder().encode(JSON.stringify(doc)).length < TAILLE_MAX_DOCUMENT
}

type DocImporte = Record<string, unknown> & { id: string; modifieLe: string }

/** Complète un document d'un ancien fichier (sans dates ni version) ; `null` s'il n'a pas d'identifiant. */
function completerImporte(brut: unknown): DocImporte | null {
  if (typeof brut !== 'object' || brut === null) return null
  const doc = { ...(brut as Record<string, unknown>) }
  if (typeof doc.id !== 'string' || doc.id === '') return null
  if (typeof doc.modifieLe !== 'string' || Number.isNaN(Date.parse(doc.modifieLe))) {
    // Très ancien fichier : on se rabat sur la date de création, puis sur le jour de la séance, puis sur 1970.
    const jour = typeof doc.date === 'string' ? `${doc.date}T00:00:00.000Z` : undefined
    const repli = [doc.creeLe, jour].find((d) => typeof d === 'string' && !Number.isNaN(Date.parse(d)))
    doc.modifieLe = repli ?? new Date(0).toISOString()
  }
  doc.creeLe = typeof doc.creeLe === 'string' ? doc.creeLe : doc.modifieLe
  doc.versionFormat = 1
  return doc as DocImporte
}

/**
 * Recharge une sauvegarde (version 1 ou 2). Pour chaque document, la version la plus récente gagne :
 * un document du fichier plus ancien que celui de l'appareil ne l'écrase jamais.
 * Ce qui est pris dans le fichier repart au serveur à la prochaine synchro (`aEnvoyer: 1`).
 * Les documents que le serveur refuserait (identifiant trop long, contenu trop gros) sont écartés et comptés dans `ecartes`.
 * Renvoie le nombre de séances et d'autres éléments (non supprimés) contenus dans le fichier.
 */
export async function importerDonnees(texte: string): Promise<{ seances: number; autres: number; ecartes: number }> {
  let s: { version?: number; tables?: unknown } | null
  try { s = JSON.parse(texte) } catch { throw new Error('Ce fichier n’est pas une sauvegarde de l’app.') }
  const tablesFichier = s?.tables as Record<string, unknown> | undefined
  const versionConnue = s?.version === 1 || s?.version === 2
  // Un fichier version 1 contient toujours les séances ; on garde cette vérification pour refuser un mauvais fichier.
  if (!versionConnue || !tablesFichier || typeof tablesFichier !== 'object'
    || (s?.version === 1 && !Array.isArray(tablesFichier.seancesRealisees))) {
    throw new Error('Ce fichier n’est pas une sauvegarde de l’app.')
  }

  // Les tables inconnues sont ignorées ; les connues sont lues en entier avant d'écrire quoi que ce soit.
  const aImporter: { nom: TableSynchronisee; docs: DocImporte[] }[] = []
  let ecartes = 0
  for (const nom of TABLES_SYNCHRONISEES) {
    const brut = tablesFichier[nom]
    if (!Array.isArray(brut)) continue
    const valides = brut.map(completerImporte).filter((d): d is DocImporte => d !== null)
    const acceptes = valides.filter(acceptableParLeServeur)
    ecartes += valides.length - acceptes.length
    aImporter.push({ nom, docs: acceptes })
  }

  let seances = 0
  let autres = 0
  let ecrits = 0
  const tables = aImporter.map(({ nom }) => base.table(nom))
  await avecReprise(() => base.transaction('rw', tables, async () => {
    seances = 0
    autres = 0
    ecrits = 0
    for (const { nom, docs } of aImporter) {
      const table = base.table(nom)
      for (const doc of docs) {
        if (!doc.supprimeLe) { if (nom === 'seancesRealisees') seances++; else autres++ }
        const local = (await table.get(doc.id)) as { modifieLe: string } | undefined
        if (decider(local, doc) === 'prendre_distant') { await table.put({ ...doc, aEnvoyer: 1 }); ecrits++ }
      }
    }
  }))
  // Comme une écriture normale : une synchro est demandée et les écrans se relisent.
  if (ecrits > 0) { signalerEcriture(); signalerDonneesChangees() }
  return { seances, autres, ecartes }
}
