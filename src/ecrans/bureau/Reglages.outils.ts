// Petites fonctions des réglages de l'ordinateur, dans un fichier à part pour pouvoir les tester sans afficher l'écran.
// La clé API Claude d'Arthur reste sur cet appareil : elle n'est écrite que dans la table `appareil`
// (jamais synchronisée, jamais exportée), jamais affichée en entier, jamais écrite dans la console ni dans une adresse.
import type { Reglages } from '../../donnees/modele.ts'
import { ecrire, ecrireAppareil, effacerAppareil, lireAppareil, lireUn } from '../../donnees/stockage.ts'

export const MODELE_HAIKU = 'claude-haiku-5-5'
export const MODELE_SONNET = 'claude-sonnet-5-5'
export const REDUCTIONS_DECHARGE = [40, 50, 60] as const

// ——— Règles de sécurité réglables : valeurs prudentes par défaut ———

export const DECHARGE_ACTIVE_PAR_DEFAUT = true
export const DECHARGE_REDUCTION_PAR_DEFAUT = 50

export interface ReglesChoisies { dechargeActive: boolean; dechargeReductionPct: number }

/** Lit les règles dans les réglages ; une valeur absente, du mauvais type ou hors des trois choix prend le défaut prudent. */
export function reglesDepuis(reglages: Reglages | undefined): ReglesChoisies {
  const brut = reglages?.reglesSecurite ?? {}
  const reduction = brut.dechargeReductionPct
  return {
    dechargeActive: typeof brut.dechargeActive === 'boolean' ? brut.dechargeActive : DECHARGE_ACTIVE_PAR_DEFAUT,
    dechargeReductionPct: typeof reduction === 'number' && (REDUCTIONS_DECHARGE as readonly number[]).includes(reduction)
      ? reduction : DECHARGE_REDUCTION_PAR_DEFAUT,
  }
}

export function lireReglages(): Promise<Reglages | undefined> {
  return lireUn<Reglages>('reglages', 'reglages')
}

/** Écrit les règles sans toucher au reste du document (le modèle de l'assistant, par exemple). */
export async function enregistrerRegles(regles: ReglesChoisies): Promise<void> {
  const existant = await lireReglages()
  await ecrire('reglages', { ...existant, id: 'reglages', reglesSecurite: { ...existant?.reglesSecurite, ...regles } })
}

/** Modèle choisi pour l'assistant ; Haiku, le moins cher, tant qu'on n'a rien choisi. */
export function modeleDepuis(reglages: Reglages | undefined): string {
  return reglages?.assistantModele === MODELE_SONNET ? MODELE_SONNET : MODELE_HAIKU
}

export async function enregistrerModele(modele: string): Promise<void> {
  const existant = await lireReglages()
  await ecrire('reglages', { ...existant, id: 'reglages', reglesSecurite: existant?.reglesSecurite ?? {}, assistantModele: modele })
}

// ——— Clé de l'assistant ———

// Clé gardée en mémoire seulement (case « Mémoriser » décochée) : elle disparaît avec l'onglet.
let cleEnMemoire: string | null = null

/** Affichage d'une clé déjà enregistrée : le début et la fin seulement. Une clé courte n'est jamais montrée. */
export function masquerCle(cle: string): string {
  if (cle.length < 16) return '••••••••'
  return `${cle.slice(0, 7)}••••${cle.slice(-4)}`
}

export async function memoriserCleActive(): Promise<boolean> {
  return (await lireAppareil<boolean>('memoriserCle')) ?? true
}

/** La clé actuelle : celle de la base si elle est mémorisée, sinon celle de la mémoire de l'onglet. */
export async function lireCle(): Promise<string | null> {
  return (await lireAppareil<string>('cleApiClaude')) ?? cleEnMemoire
}

/** Enregistre la clé sur cet appareil. Sans mémorisation, elle reste en mémoire et n'est écrite nulle part. */
export async function enregistrerCle(cle: string, memoriser: boolean): Promise<void> {
  const propre = cle.trim()
  await ecrireAppareil('memoriserCle', memoriser)
  if (memoriser) {
    await ecrireAppareil('cleApiClaude', propre)
    cleEnMemoire = null
  } else {
    await effacerAppareil('cleApiClaude')
    cleEnMemoire = propre
  }
  // Une autre clé n'a pas encore été vérifiée.
  await effacerAppareil('cleApiEtat')
}

/** Change la case « Mémoriser la clé » : la clé déjà saisie passe de la base à la mémoire, ou l'inverse. */
export async function changerMemorisation(memoriser: boolean): Promise<void> {
  const cle = await lireCle()
  if (cle) await enregistrerCle(cle, memoriser)
  else await ecrireAppareil('memoriserCle', memoriser)
}

export async function supprimerCle(): Promise<void> {
  cleEnMemoire = null
  await effacerAppareil('cleApiClaude')
  await effacerAppareil('cleApiEtat')
}

/** Pour les tests : oublie la clé gardée en mémoire. */
export function oublierCleEnMemoire(): void {
  cleEnMemoire = null
}

/** Une clé Claude commence par « sk-ant- » : sinon on prévient, sans bloquer (on avertit sans bloquer). */
export function ressembleAUneCle(cle: string): boolean {
  return cle.trim().startsWith('sk-ant-')
}
