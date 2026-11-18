import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Connexion au service de comptes (Supabase). Les deux valeurs sont publiques par nature :
// la clé publiable ne donne accès qu'à ce que les règles de la base autorisent.

/** Vrai si la configuration est utilisable. Refuse une clé secrète, qui ne doit jamais être dans l'app. */
export function configurationValide(url: string | undefined, cle: string | undefined): boolean {
  if (!url || !cle) return false
  if (cle.startsWith('sb_secret_')) return false
  return url.startsWith('https://')
}

const url = import.meta.env.VITE_SUPABASE_URL
const cle = import.meta.env.VITE_SUPABASE_CLE_PUBLIQUE

// Une clé secrète mise par erreur dans la configuration : on le signale clairement dans la console.
if (cle?.startsWith('sb_secret_')) {
  console.error('Clé secrète refusée : utiliser la clé publiable')
}

/** Faux en développement sans `.env.local` : l'app fonctionne alors sans compte, comme avant. */
export const comptesDisponibles = configurationValide(url, cle)

export const supabase: SupabaseClient | null = comptesDisponibles
  ? createClient(url!, cle!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null
