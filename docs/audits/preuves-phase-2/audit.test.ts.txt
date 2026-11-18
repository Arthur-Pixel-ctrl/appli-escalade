// Tests de l'auditeur (copie d'audit seulement, jamais dans le dépôt).
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { base, importerDonnees, lireProfil } from '../donnees/base.ts'
import { ecrire, supprimer } from '../donnees/stockage.ts'
import { serveurMemoire } from '../synchro/serveurMemoire.ts'
import { synchroniser } from '../synchro/synchro.ts'

const MOI = 'u1'
beforeEach(async () => { for (const t of base.tables) await t.clear() })

describe('audit', () => {
  it('un seul document refusé par le serveur bloque aussi la réception', async () => {
    const serveur = serveurMemoire()
    const envoyerVrai = serveur.envoyer
    // Comme la contrainte SQL : id de plus de 100 caractères refusé, tout le paquet échoue.
    serveur.envoyer = async (lignes) => {
      if (lignes.some((l) => l.id.length > 100)) throw new Error('violates check constraint "documents_id_check"')
      return envoyerVrai(lignes)
    }
    // Une séance venue d'un autre appareil attend sur le serveur.
    await envoyerVrai([{ user_id: MOI, type: 'seancesRealisees', id: 'venue-du-pc', modifie_le: '2026-11-18T10:00:00.000Z', supprime_le: null,
      contenu: { id: 'venue-du-pc', modifieLe: '2026-11-18T10:00:00.000Z', nom: 'Doigts' } }])
    // Une sauvegarde rechargée contient un document à l'identifiant trop long.
    await importerDonnees(JSON.stringify({ version: 2, tables: { salles: [{ id: 'x'.repeat(101), modifieLe: '2026-11-01T00:00:00.000Z' }] } }))
    await ecrire('seancesRealisees', { id: 'seance-du-jour', nom: 'Bloc' })
    await expect(synchroniser(serveur, MOI)).rejects.toThrow()
    await expect(synchroniser(serveur, MOI)).rejects.toThrow()
    // Rien n'est reçu, et la séance du jour (table précédente) est partie mais pas les tables suivantes.
    expect(await base.seancesRealisees.get('venue-du-pc')).toBeUndefined()
  })

  it('lireProfil renvoie un profil supprimé (suppression douce)', async () => {
    await ecrire('reglages', { id: 'profil', prenom: 'Arthur' })
    await supprimer('reglages', 'profil')
    expect(await lireProfil()).not.toBeNull()
  })
})
