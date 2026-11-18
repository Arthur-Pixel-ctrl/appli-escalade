// Le vrai serveur : la table `documents` de Supabase (supabase/migrations/0001_documents.sql).
// Le client est reçu en paramètre : ce fichier n'importe pas `compte/client.ts`, il reste donc testable sans configuration.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LigneEnvoyee, LigneRecue, ServeurDocuments } from './synchro.ts'

export function serveurSupabase(client: SupabaseClient): ServeurDocuments {
  return {
    async envoyer(lignes) {
      if (lignes.length === 0) return
      // Le déclencheur SQL refuse d'écraser une version plus récente.
      const { error } = await client.from('documents').upsert(lignes satisfies LigneEnvoyee[], { onConflict: 'user_id,type,id' })
      if (error) throw new Error(error.message)
    },

    async recevoirApres(apres, limite) {
      let requete = client.from('documents').select('type,id,contenu,recu_le').order('recu_le').limit(limite)
      if (apres) requete = requete.gt('recu_le', apres)
      const { data, error } = await requete
      if (error) throw new Error(error.message)
      return (data ?? []) as LigneRecue[]
    },

    async lireUn(type, id) {
      const { data, error } = await client.from('documents')
        .select('type,id,contenu,recu_le').eq('type', type).eq('id', id).maybeSingle()
      if (error) throw new Error(error.message)
      return (data as LigneRecue | null) ?? null
    },
  }
}
