import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Connexion au service de comptes (Supabase). Les deux valeurs sont publiques par nature :
// la clé publiable ne donne accès qu'à ce que les règles de la base autorisent.

/** Seule une clé « publiable » est acceptée : une clé secrète ou l'ancienne clé `service_role` (eyJ…) ne doit jamais être dans l'app. */
const DEBUT_CLE_PUBLIABLE = 'sb_publishable_'

/** Vrai si la configuration est utilisable. */
export function configurationValide(url: string | undefined, cle: string | undefined): boolean {
  if (!url || !cle) return false
  if (!cle.startsWith(DEBUT_CLE_PUBLIABLE)) return false
  return url.startsWith('https://')
}

const url = import.meta.env.VITE_SUPABASE_URL
const cle = import.meta.env.VITE_SUPABASE_CLE_PUBLIQUE

// Une clé qui n'est pas « publiable » (par exemple une clé secrète) : on le signale clairement dans la console.
if (cle && !cle.startsWith(DEBUT_CLE_PUBLIABLE)) {
  console.error('Clé refusée : utiliser la clé publiable (sb_publishable_…)')
}

/** Faux en développement sans `.env.local` : l'app fonctionne alors sans compte, comme avant. */
export const comptesDisponibles = configurationValide(url, cle)

export const supabase: SupabaseClient | null = comptesDisponibles
  ? createClient(url!, cle!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null
