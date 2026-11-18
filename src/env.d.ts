/// <reference types="vite/client" />
// Les deux valeurs publiques du projet Supabase, fournies au moment de la construction.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_CLE_PUBLIQUE?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
