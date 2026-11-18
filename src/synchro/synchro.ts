// Moteur de synchronisation (architecture § 2.3) : envoie ce qui a changé ici, récupère ce qui a changé ailleurs.
// Règle d'or : on ne perd jamais une donnée. La version la plus récente d'un document gagne, entière.
import { base, avecReprise } from '../donnees/base.ts'
import {
  ecrireEtat, lireEtat, signalerDonneesChangees, TABLES_SYNCHRONISEES, type TableSynchronisee,
} from '../donnees/stockage.ts'
import { curseurAvecMarge, decider, depuisLigne, versLigne } from './fusion.ts'

/** Une ligne telle qu'on l'envoie à la table `documents` du serveur. */
export interface LigneEnvoyee {
  user_id: string
  type: TableSynchronisee
  id: string
  contenu: Record<string, unknown>
  modifie_le: string
  supprime_le: string | null
}

/** Une ligne telle que le serveur nous la renvoie. `type` est un texte : une version plus récente de l'app peut en écrire de nouveaux. */
export interface LigneRecue {
  type: string
  id: string
  contenu: Record<string, unknown>
  recu_le: string
}

/** Ce que la synchronisation attend du serveur. Deux versions : Supabase, et une en mémoire pour les tests. */
export interface ServeurDocuments {
  envoyer(lignes: LigneEnvoyee[]): Promise<void>
  /** Lignes dont `recu_le` est strictement après `apres`, triées par `recu_le`. */
  recevoirApres(apres: string | null, limite: number): Promise<LigneRecue[]>
  lireUn(type: TableSynchronisee, id: string): Promise<LigneRecue | null>
}

export interface BilanSynchro { envoyes: number; recus: number; appliques: number }

/** Un document que le serveur a refusé (identifiant trop long, contenu trop gros…). Il reste « à envoyer » sur l'appareil. */
export interface DocumentRefuse { table: TableSynchronisee; id: string }

/** Clé de `etatSynchro` qui garde la liste des documents refusés au dernier envoi. */
export const CLE_REFUSES = 'refuses'

const TAILLE_PAQUET_ENVOI = 100
const TAILLE_PAGE_RECEPTION = 500

type DocLocal = Record<string, unknown> & { id: string; modifieLe: string; aEnvoyer?: 0 | 1 }

// Une seule synchronisation à la fois : un deuxième appel reçoit la même promesse.
let enCours: Promise<BilanSynchro> | null = null

/**
 * Pousse puis tire. Sans serveur (pas de configuration Supabase), ne fait rien.
 * En cas d'erreur, la note dans `derniereErreur` puis relance l'erreur : les documents restent « à envoyer ».
 */
export function synchroniser(serveur: ServeurDocuments | null, userId: string): Promise<BilanSynchro> {
  if (!serveur) return Promise.resolve({ envoyes: 0, recus: 0, appliques: 0 })
  if (enCours) return enCours
  enCours = (async () => {
    // L'envoi et la réception sont indépendants : un envoi qui échoue n'empêche pas de recevoir.
    let erreurEnvoi: unknown = null
    let envoyes = 0
    try {
      envoyes = await pousser(serveur, userId)
    } catch (erreur) {
      erreurEnvoi = erreur
    }
    try {
      const { recus, appliques } = await tirer(serveur)
      if (appliques > 0) signalerDonneesChangees()
      if (erreurEnvoi) throw erreurEnvoi
      await ecrireEtat('derniereSynchro', new Date().toISOString())
      await ecrireEtat('derniereErreur', null)
      return { envoyes, recus, appliques }
    } catch (erreur) {
      await ecrireEtat('derniereErreur', messageEnFrancais(erreurEnvoi ?? erreur)).catch(() => {})
      throw erreurEnvoi ?? erreur
    } finally {
      enCours = null
    }
  })()
  return enCours
}

/** Nombre de documents « à envoyer », toutes tables confondues. */
export async function compterEnAttente(): Promise<number> {
  let total = 0
  for (const table of TABLES_SYNCHRONISEES) {
    total += await avecReprise(() => base.table(table).where('aEnvoyer').equals(1).count())
  }
  return total
}

/** Erreur du réseau ou de la session : tout le monde échoue pareil, aucun document n'est « refusé » en particulier. */
function estErreurGenerale(erreur: unknown): boolean {
  const texte = (erreur instanceof Error ? `${erreur.name} ${erreur.message}` : String(erreur)).toLowerCase()
  return /failed to fetch|network|load failed|timeout|offline|réseau|jwt|not authenticated|fetch failed/.test(texte)
}

/** Traduit une erreur technique du serveur en phrase française, pour l'indicateur de synchronisation. */
export function messageEnFrancais(erreur: unknown): string {
  const texte = erreur instanceof Error ? erreur.message : String(erreur)
  if (estErreurGenerale(erreur) && /failed to fetch|network|load failed|fetch failed|timeout|offline/i.test(texte)) {
    return 'Pas de réseau ou serveur injoignable'
  }
  if (/jwt|not authenticated/i.test(texte)) return 'Ta connexion au compte a expiré : reconnecte-toi'
  // Un message déjà en français (écrit par l'app) est gardé tel quel ; un message technique du serveur est remplacé.
  if (/[éèêàùç’]|réseau/i.test(texte)) return texte
  return 'Le serveur n’a pas pu enregistrer certaines données'
}

/**
 * Envoie les documents « à envoyer ». Renvoie le nombre de documents envoyés.
 * Un paquet refusé est renvoyé document par document : un document refusé est noté (`refuses`) et ne bloque pas les autres.
 * Il garde sa marque « à envoyer » : rien n'est jamais retiré à un document que le serveur n'a pas pris.
 */
async function pousser(serveur: ServeurDocuments, userId: string): Promise<number> {
  let envoyes = 0
  const refuses: DocumentRefuse[] = []
  try {
    for (const table of TABLES_SYNCHRONISEES) {
      const aEnvoyer = (await avecReprise(() => base.table(table).where('aEnvoyer').equals(1).toArray())) as DocLocal[]
      for (let i = 0; i < aEnvoyer.length; i += TAILLE_PAQUET_ENVOI) {
        const paquet = aEnvoyer.slice(i, i + TAILLE_PAQUET_ENVOI)
        try {
          await serveur.envoyer(paquet.map((doc) => versLigne(userId, table, doc)))
          await marquerEnvoyes(table, paquet)
          envoyes += paquet.length
        } catch (erreur) {
          if (estErreurGenerale(erreur)) throw erreur
          // Le serveur a refusé quelque chose : on cherche quel document, un par un.
          for (const doc of paquet) {
            try {
              await serveur.envoyer([versLigne(userId, table, doc)])
              await marquerEnvoyes(table, [doc])
              envoyes++
            } catch (erreurDoc) {
              if (estErreurGenerale(erreurDoc)) throw erreurDoc
              refuses.push({ table, id: doc.id })
            }
          }
        }
      }
    }
  } finally {
    // La liste est mise à jour même si l'envoi s'arrête en route.
    await ecrireEtat(CLE_REFUSES, refuses).catch(() => {})
  }
  return envoyes
}

/**
 * Remet `aEnvoyer` à 0, mais seulement pour les documents qui n'ont pas bougé depuis l'envoi.
 * Si l'utilisateur a modifié un document pendant l'envoi, il reste « à envoyer » : sa modification partira au prochain tour.
 */
async function marquerEnvoyes(table: TableSynchronisee, paquet: DocLocal[]): Promise<void> {
  await avecReprise(() => base.transaction('rw', base.table(table), async () => {
    for (const envoye of paquet) {
      const actuel = (await base.table(table).get(envoye.id)) as DocLocal | undefined
      if (actuel && actuel.modifieLe === envoye.modifieLe) {
        await base.table(table).put({ ...actuel, aEnvoyer: 0 })
      }
    }
  }))
}

/** Récupère les lignes reçues depuis le dernier curseur et applique celles qui sont plus récentes que le local. */
async function tirer(serveur: ServeurDocuments): Promise<{ recus: number; appliques: number }> {
  let recus = 0
  let appliques = 0
  let curseur = (await lireEtat<string>('curseur')) ?? null
  // Première demande avec marge ; les suivantes repartent exactement de la dernière ligne reçue.
  let apres = curseurAvecMarge(curseur)
  for (;;) {
    const page = await serveur.recevoirApres(apres, TAILLE_PAGE_RECEPTION)
    for (const ligne of page) {
      recus++
      if (await appliquer(ligne)) appliques++
    }
    // Le curseur n'avance qu'une fois la page appliquée : un échec en cours de route ne fait rien rater.
    for (const ligne of page) {
      if (curseur === null || Date.parse(ligne.recu_le) > Date.parse(curseur)) curseur = ligne.recu_le
    }
    if (curseur !== null && page.length > 0) await ecrireEtat('curseur', curseur)
    if (page.length < TAILLE_PAGE_RECEPTION) break
    apres = page[page.length - 1].recu_le
  }
  return { recus, appliques }
}

/** Applique une ligne reçue si elle est plus récente que le local. Renvoie vrai si le local a changé. */
async function appliquer(ligne: LigneRecue): Promise<boolean> {
  // Une table inconnue vient d'une version plus récente de l'app : on l'ignore, sans erreur.
  const table = TABLES_SYNCHRONISEES.find((t) => t === ligne.type)
  if (!table) return false
  // Sans date de modification valable, impossible de savoir qui gagne : on garde le local.
  const modifieLe = ligne.contenu?.modifieLe
  if (typeof modifieLe !== 'string' || Number.isNaN(Date.parse(modifieLe))) return false
  const distant = { ...ligne.contenu, id: ligne.id, modifieLe }
  // Lecture, décision et écriture dans la même transaction : une écriture locale ne peut pas s'intercaler.
  return avecReprise(() => base.transaction('rw', base.table(table), async () => {
    const local = (await base.table(table).get(ligne.id)) as DocLocal | undefined
    if (decider(local, distant) === 'garder_local') return false
    await base.table(table).put(depuisLigne({ ...ligne, contenu: distant }))
    return true
  }))
}
