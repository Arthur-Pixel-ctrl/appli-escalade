// Point d'entrée unique pour écrire dans la base locale (architecture § 3.4).
// Pourquoi : la synchronisation doit savoir ce qui a changé depuis le dernier envoi.
// Tout passe par `ecrire()`, qui pose les dates et le drapeau `aEnvoyer` : rien ne peut être oublié.
import { avecReprise, base } from './base.ts'

/** Les tables envoyées au serveur. Le type envoyé au serveur est le nom de la table. */
export const TABLES_SYNCHRONISEES = [
  'seancesRealisees', 'reglages', 'cycles', 'phases', 'seancesPlanifiees',
  'objectifsSpecifiques', 'exercicesPerso', 'salles', 'formes', 'douleurs', 'resultatsTests',
] as const
export type TableSynchronisee = (typeof TABLES_SYNCHRONISEES)[number]

// Les champs que `ecrire` pose ; on les lit sans connaître le type exact du document.
type Suivi = { creeLe?: string; modifieLe?: string; supprimeLe?: string; aEnvoyer?: 0 | 1; versionFormat?: 1 }

/** Enregistre un document (création ou remplacement) et le marque « à envoyer ». */
export async function ecrire<T extends { id: string }>(table: TableSynchronisee, doc: T): Promise<void> {
  const maintenant = new Date().toISOString()
  await avecReprise(async () => {
    const t = base.table(table)
    const existant = (await t.get(doc.id)) as Suivi | undefined
    const creeLe = (doc as Suivi).creeLe ?? existant?.creeLe ?? maintenant
    await t.put({ ...doc, versionFormat: 1, creeLe, modifieLe: maintenant, aEnvoyer: 1 })
  })
  prevenir(abonnesEcriture)
}

/** Suppression douce : le document reste dans la table, masqué, pour que la suppression soit envoyée. */
export async function supprimer(table: TableSynchronisee, id: string): Promise<void> {
  const maintenant = new Date().toISOString()
  const fait = await avecReprise(async () => {
    const t = base.table(table)
    const existant = await t.get(id)
    if (!existant) return false
    await t.put({ ...existant, supprimeLe: maintenant, modifieLe: maintenant, aEnvoyer: 1 })
    return true
  })
  if (fait) prevenir(abonnesEcriture)
}

/** Tous les documents d'une table, sans ceux qui sont supprimés. */
export async function lireTous<T>(table: TableSynchronisee): Promise<T[]> {
  const tous = (await avecReprise(() => base.table(table).toArray())) as Suivi[]
  return tous.filter((d) => !d.supprimeLe) as T[]
}

/** Un document, ou `undefined` s'il n'existe pas ou s'il est supprimé. */
export async function lireUn<T>(table: TableSynchronisee, id: string): Promise<T | undefined> {
  const doc = (await avecReprise(() => base.table(table).get(id))) as Suivi | undefined
  return doc && !doc.supprimeLe ? (doc as T) : undefined
}

// ——— État de la synchronisation et réglages de l'appareil : jamais envoyés au serveur ———

export async function lireEtat<T>(cle: string): Promise<T | undefined> {
  return (await avecReprise(() => base.etatSynchro.get(cle)))?.valeur as T | undefined
}
export async function ecrireEtat(cle: string, valeur: unknown): Promise<void> {
  await avecReprise(() => base.etatSynchro.put({ cle, valeur }))
}
export async function lireAppareil<T>(cle: string): Promise<T | undefined> {
  return (await avecReprise(() => base.appareil.get(cle)))?.valeur as T | undefined
}
export async function ecrireAppareil(cle: string, valeur: unknown): Promise<void> {
  await avecReprise(() => base.appareil.put({ cle, valeur }))
}
export async function effacerAppareil(cle: string): Promise<void> {
  await avecReprise(() => base.appareil.delete(cle))
}

// ——— Petits événements pour prévenir le reste de l'app, sans dépendance ———

const abonnesEcriture = new Set<() => void>()
const abonnesDonnees = new Set<() => void>()

function prevenir(abonnes: Set<() => void>): void {
  for (const rappel of [...abonnes]) rappel()
}

/** Une écriture locale a eu lieu (lance une synchro). Renvoie la fonction qui désabonne. */
export function surEcriture(rappel: () => void): () => void {
  abonnesEcriture.add(rappel)
  return () => { abonnesEcriture.delete(rappel) }
}

/** Des données sont arrivées du serveur (il faut relire). Renvoie la fonction qui désabonne. */
export function surDonneesChangees(rappel: () => void): () => void {
  abonnesDonnees.add(rappel)
  return () => { abonnesDonnees.delete(rappel) }
}

export function signalerDonneesChangees(): void {
  prevenir(abonnesDonnees)
}
