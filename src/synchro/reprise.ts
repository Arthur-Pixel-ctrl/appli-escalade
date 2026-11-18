// Lien d'un compte avec les données de l'appareil (architecture § 4).
// Règle d'or : lier ne supprime rien. Les données de l'appareil et celles du compte se rejoignent
// par la règle « la plus récente gagne » de `synchroniser`. Seule `effacerDonneesLocales` efface.
import { avecReprise, base, exporterDonnees } from '../donnees/base.ts'
import {
  ecrire, ecrireEtat, lireEtat, TABLES_SYNCHRONISEES,
} from '../donnees/stockage.ts'
import { depuisLigne } from './fusion.ts'
import { compterEnAttente, synchroniser, type BilanSynchro, type ServeurDocuments } from './synchro.ts'

export type SituationReprise = 'premier_lien' | 'meme_compte' | 'autre_compte'

/** Compare le compte noté sur l'appareil à celui de la session. */
export function situationReprise(compteIdLocal: string | null | undefined, compteIdSession: string): SituationReprise {
  if (!compteIdLocal) return 'premier_lien'
  return compteIdLocal === compteIdSession ? 'meme_compte' : 'autre_compte'
}

// Ces champs ne disent rien du contenu du profil : on ne les compare pas.
const CHAMPS_IGNORES = new Set(['id', 'creeLe', 'modifieLe', 'versionFormat', 'aEnvoyer'])

function champsUtiles(profil: Record<string, unknown>): [string, unknown][] {
  return Object.entries(profil)
    .filter(([cle, valeur]) => !CHAMPS_IGNORES.has(cle) && valeur !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
}

/** Vrai si les deux profils diffèrent sur un champ utile (on ignore id, creeLe, modifieLe, versionFormat, aEnvoyer). */
export function profilsDifferents(local: Record<string, unknown>, distant: Record<string, unknown>): boolean {
  return JSON.stringify(champsUtiles(local)) !== JSON.stringify(champsUtiles(distant))
}

export type ResultatLien = 'lie' | 'choix_profil_requis' | 'autre_compte'

type DocProfil = Record<string, unknown> & { id: string; modifieLe?: string; supprimeLe?: string }

async function lireProfilLocal(): Promise<DocProfil | undefined> {
  const doc = (await avecReprise(() => base.reglages.get('profil'))) as DocProfil | undefined
  return doc && !doc.supprimeLe ? doc : undefined
}

/**
 * Lie l'appareil au compte de la session, puis synchronise.
 * - même compte : synchronise seulement ;
 * - autre compte : ne fait rien (l'écran propose de sauvegarder puis d'effacer) ;
 * - premier lien : si les deux côtés ont un profil différent, demande lequel garder (`choix_profil_requis`,
 *   rien n'est écrit ni envoyé), puis note le compte et synchronise.
 * Une erreur réseau remonte telle quelle : rien n'a été effacé, on peut relancer.
 */
export async function lierCompte(
  serveur: ServeurDocuments,
  session: { userId: string; email: string },
  choixProfil?: 'appareil' | 'compte',
): Promise<{ resultat: ResultatLien; bilan?: BilanSynchro }> {
  const situation = situationReprise(await lireEtat<string | null>('compteId'), session.userId)
  if (situation === 'autre_compte') return { resultat: 'autre_compte' }
  if (situation === 'meme_compte') {
    return { resultat: 'lie', bilan: await synchroniser(serveur, session.userId) }
  }

  const local = await lireProfilLocal()
  const ligneDistante = await serveur.lireUn('reglages', 'profil')
  const distant = ligneDistante && !ligneDistante.contenu.supprimeLe
    ? { ...ligneDistante.contenu, id: 'profil' } as DocProfil
    : undefined

  if (local && distant && profilsDifferents(local, distant)) {
    if (!choixProfil) return { resultat: 'choix_profil_requis' }
    if (choixProfil === 'appareil') {
      // Réécrit : son `modifieLe` devient le plus récent, donc il l'emporte sur celui du compte.
      await ecrire('reglages', local)
    } else if (ligneDistante) {
      await avecReprise(() => base.reglages.put(depuisLigne({ ...ligneDistante, contenu: distant }) as never))
    }
  }

  // Le compte est noté avant la synchro : si le réseau coupe, le prochain essai reprend là où on en était.
  await ecrireEtat('compteId', session.userId)
  await ecrireEtat('compteEmail', session.email)
  await ecrireEtat('curseur', null)
  return { resultat: 'lie', bilan: await synchroniser(serveur, session.userId) }
}

// ——— Ce que l'appareil contient (pour l'écran de reprise) ———

export interface ResumeAppareil {
  nbSeances: number
  premiereDate: string | null
  derniereDate: string | null
  aUnProfil: boolean
}

export async function resumerAppareil(): Promise<ResumeAppareil> {
  const seances = (await avecReprise(() => base.seancesRealisees.toArray())).filter((s) => !s.supprimeLe)
  const dates = seances.map((s) => s.date).filter(Boolean).sort()
  return {
    nbSeances: seances.length,
    premiereDate: dates[0] ?? null,
    derniereDate: dates[dates.length - 1] ?? null,
    aUnProfil: (await lireProfilLocal()) !== undefined,
  }
}

/** Le profil de l'appareil et celui du compte, pour que l'écran de choix les montre côte à côte. */
export async function profilsACompare(serveur: ServeurDocuments): Promise<{
  appareil: Record<string, unknown> | null; compte: Record<string, unknown> | null
}> {
  const local = await lireProfilLocal()
  const ligne = await serveur.lireUn('reglages', 'profil')
  return {
    appareil: local ?? null,
    compte: ligne && !ligne.contenu.supprimeLe ? ligne.contenu : null,
  }
}

/** Adresse masquée pour ne pas montrer l'e-mail d'un autre compte en entier : « ar…@gmail.com ». */
export function masquerEmail(email: string): string {
  const arobase = email.lastIndexOf('@')
  if (arobase < 0) return '…'
  return `${email.slice(0, Math.min(2, arobase))}…${email.slice(arobase)}`
}

// ——— Sauvegarde et effacement ———

/** La sauvegarde complète est celle de « Sauvegarder mes données » : un seul format de fichier (`exporterDonnees`). */
export const sauvegardeComplete = exporterDonnees

/**
 * Détache l'appareil d'un compte supprimé, sans effacer aucune donnée : le compte n'est plus noté,
 * et tout ce que l'appareil contient est marqué « à envoyer » pour un éventuel futur compte.
 */
export async function delierAppareil(): Promise<void> {
  await ecrireEtat('compteId', null)
  await ecrireEtat('compteEmail', null)
  await ecrireEtat('curseur', null)
  for (const table of TABLES_SYNCHRONISEES) {
    await avecReprise(() => base.table(table).toCollection().modify({ aEnvoyer: 1 }))
  }
}

/**
 * Vide toutes les tables synchronisées, `etatSynchro` et `appareil`. Ne supprime pas la base (`clear`, jamais `delete`).
 * Garde-fou : refuse si des modifications pas encore envoyées dépassent le nombre que l'utilisateur a vu et accepté
 * (`enAttenteAcceptees`, 0 par défaut). Sans cela, un appel direct pourrait perdre des données en silence.
 */
export async function effacerDonneesLocales(options: { enAttenteAcceptees?: number } = {}): Promise<void> {
  const accepte = options.enAttenteAcceptees ?? 0
  const enAttente = await compterEnAttente()
  if (enAttente > accepte) {
    throw new Error(`${enAttente} modification${enAttente > 1 ? 's' : ''} pas encore envoyée${enAttente > 1 ? 's' : ''} : effacement refusé.`)
  }
  const tables = [...TABLES_SYNCHRONISEES.map((t) => base.table(t)), base.etatSynchro, base.appareil]
  await avecReprise(() => base.transaction('rw', tables, async () => {
    for (const table of tables) await table.clear()
  }))
}
