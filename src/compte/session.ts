import { useEffect, useState } from 'react'
import { supabase } from './client.ts'

// Connexion par code reçu par e-mail (pas de lien : sur iPhone, l'app installée et Safari
// ne partagent pas leur mémoire, un lien connecterait Safari et pas l'app).

/** Forme simple : texte@texte.texte, espaces autour retirés. */
export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** Garde les chiffres seulement : un code collé avec des espaces reste utilisable. */
export function nettoyerCode(saisie: string): string {
  return saisie.replace(/\D/g, '')
}

/** Le serveur envoie 6 chiffres aujourd'hui ; on tolère jusqu'à 10 si ce réglage change. */
export function codeValide(code: string): boolean {
  return /^\d{6,10}$/.test(code)
}

/** Traduit une erreur du service en phrase française, sans jargon. */
export function messageErreur(e: unknown): string {
  const texte = e instanceof Error ? `${e.name} ${e.message}` : String(e ?? '')
  const t = texte.toLowerCase()
  // Adresse absente de la liste d'invités : le serveur renvoie une erreur générique de base de données.
  if (t.includes('database error saving new user') || t.includes('adresse non invitée') || t.includes('signups not allowed')) {
    return 'Cette adresse n’est pas sur la liste d’invités. Demande à Arthur de l’ajouter.'
  }
  if (t.includes('failed to fetch') || t.includes('networkerror') || t.includes('load failed') || t.includes('network request failed')) {
    return 'Pas de réseau. Réessaie quand tu es connecté à internet.'
  }
  if (t.includes('rate limit') || t.includes('too many') || t.includes('security purposes') || t.includes('429')) {
    return 'Trop de demandes. Attends une minute, puis réessaie.'
  }
  if (t.includes('expired') || t.includes('invalid') || t.includes('incorrect')) {
    return 'Ce code est faux ou n’est plus valable. Vérifie-le, ou demande un nouveau code.'
  }
  return 'La connexion a échoué. Réessaie dans un instant.'
}

// Les trois fonctions lèvent une Error au message déjà traduit.
function clientOuErreur() {
  if (!supabase) throw new Error('Les comptes ne sont pas disponibles sur cette version.')
  return supabase
}

export async function envoyerCode(email: string): Promise<void> {
  const client = clientOuErreur()
  try {
    const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
    if (error) throw error
  } catch (e) {
    throw new Error(messageErreur(e))
  }
}

export async function verifierCode(email: string, code: string): Promise<void> {
  const client = clientOuErreur()
  try {
    const { error } = await client.auth.verifyOtp({ email: email.trim(), token: nettoyerCode(code), type: 'email' })
    if (error) throw error
  } catch (e) {
    throw new Error(messageErreur(e))
  }
}

export async function seDeconnecter(): Promise<void> {
  const client = clientOuErreur()
  try {
    const { error } = await client.auth.signOut({ scope: 'local' }) // seulement cet appareil : les autres restent connectés
    if (error) throw error
  } catch (e) {
    throw new Error(messageErreur(e))
  }
}

interface EtatSession { chargement: boolean; userId: string | null; email: string | null }

/** Session courante : lue au montage, puis suivie. Sans configuration : jamais de compte, pas d'attente. */
export function useSession(): EtatSession {
  const [etat, setEtat] = useState<EtatSession>({ chargement: supabase !== null, userId: null, email: null })
  useEffect(() => {
    if (!supabase) return
    let actif = true
    const depuis = (s: { user: { id: string; email?: string } } | null): EtatSession => ({
      chargement: false, userId: s?.user.id ?? null, email: s?.user.email ?? null,
    })
    supabase.auth.getSession()
      .then(({ data }) => { if (actif) setEtat(depuis(data.session)) })
      .catch(() => { if (actif) setEtat(depuis(null)) })
    const { data } = supabase.auth.onAuthStateChange((_evenement, session) => { if (actif) setEtat(depuis(session)) })
    return () => { actif = false; data.subscription.unsubscribe() }
  }, [])
  return etat
}
