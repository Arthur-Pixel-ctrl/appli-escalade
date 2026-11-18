// Constat M-1 de l'audit de fin de phase 2 : un document refusé ne bloque ni les autres envois, ni la réception.
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { base, importerDonnees } from '../donnees/base.ts'
import { ecrire, lireEtat } from '../donnees/stockage.ts'
import { serveurMemoire, type ServeurMemoire } from './serveurMemoire.ts'
import { CLE_REFUSES, compterEnAttente, messageEnFrancais, synchroniser } from './synchro.ts'

const MOI = 'u1'
let serveur: ServeurMemoire
beforeEach(async () => {
  for (const t of base.tables) await t.clear()
  serveur = serveurMemoire()
})

/** Comme la contrainte SQL : un identifiant de plus de 100 caractères fait refuser tout le paquet. */
function serveurQuiRefuseLesIdTropLongs() {
  const envoyerVrai = serveur.envoyer
  serveur.envoyer = async (lignes) => {
    if (lignes.some((l) => l.id.length > 100)) throw new Error('new row for relation "documents" violates check constraint "documents_id_check"')
    return envoyerVrai(lignes)
  }
  return envoyerVrai
}

/** Met directement dans la base un document que l'import écarterait (ancienne donnée, ou bug). */
async function poserDocumentTropLong(id: string) {
  await base.table('salles').put({ id, nom: 'trop long', versionFormat: 1, creeLe: '2026-11-01T00:00:00.000Z', modifieLe: '2026-11-01T00:00:00.000Z', aEnvoyer: 1 })
}

describe('un document refusé par le serveur', () => {
  it('ne bloque pas les autres documents du même paquet', async () => {
    serveurQuiRefuseLesIdTropLongs()
    await ecrire('salles', { id: 'bonne-1', nom: 'A' })
    await poserDocumentTropLong('x'.repeat(101))
    await ecrire('salles', { id: 'bonne-2', nom: 'B' })
    const bilan = await synchroniser(serveur, MOI)
    expect(bilan.envoyes).toBe(2)
    expect(serveur.lignes.has('salles/bonne-1')).toBe(true)
    expect(serveur.lignes.has('salles/bonne-2')).toBe(true)
  })

  it('est noté dans refuses et garde sa marque « à envoyer »', async () => {
    serveurQuiRefuseLesIdTropLongs()
    const trop = 'x'.repeat(101)
    await poserDocumentTropLong(trop)
    await ecrire('salles', { id: 'bonne', nom: 'A' })
    await synchroniser(serveur, MOI)
    expect(await lireEtat(CLE_REFUSES)).toEqual([{ table: 'salles', id: trop }])
    expect((await base.table('salles').get(trop)).aEnvoyer).toBe(1)
    expect(await compterEnAttente()).toBe(1)
    // Au tour suivant, il est retenté (et reste refusé) sans empêcher le reste.
    await ecrire('salles', { id: 'bonne-3', nom: 'C' })
    await synchroniser(serveur, MOI)
    expect(serveur.lignes.has('salles/bonne-3')).toBe(true)
    expect((await base.table('salles').get(trop)).aEnvoyer).toBe(1)
  })

  it('la liste des refusés se vide quand plus rien n’est refusé', async () => {
    const envoyerVrai = serveurQuiRefuseLesIdTropLongs()
    await poserDocumentTropLong('x'.repeat(101))
    await synchroniser(serveur, MOI)
    expect(await lireEtat(CLE_REFUSES)).toHaveLength(1)
    serveur.envoyer = envoyerVrai
    await base.table('salles').delete('x'.repeat(101))
    await synchroniser(serveur, MOI)
    expect(await lireEtat(CLE_REFUSES)).toEqual([])
  })

  it('n’empêche pas de recevoir ce qui vient des autres appareils', async () => {
    const envoyerVrai = serveurQuiRefuseLesIdTropLongs()
    await envoyerVrai([{ user_id: MOI, type: 'seancesRealisees', id: 'venue-du-pc', modifie_le: '2026-11-18T10:00:00.000Z', supprime_le: null,
      contenu: { id: 'venue-du-pc', modifieLe: '2026-11-18T10:00:00.000Z', nom: 'Doigts' } }])
    await poserDocumentTropLong('x'.repeat(101))
    await ecrire('seancesRealisees', { id: 'seance-du-jour', nom: 'Bloc' })
    await synchroniser(serveur, MOI)
    await synchroniser(serveur, MOI)
    expect(await base.seancesRealisees.get('venue-du-pc')).toBeDefined()
    expect(serveur.lignes.has('seancesRealisees/seance-du-jour')).toBe(true)
  })

  it('la réception se fait même quand l’envoi échoue (réseau), et l’erreur reste signalée en français', async () => {
    const envoyerVrai = serveur.envoyer
    await envoyerVrai([{ user_id: MOI, type: 'salles', id: 'ailleurs', modifie_le: '2026-11-18T10:00:00.000Z', supprime_le: null,
      contenu: { id: 'ailleurs', modifieLe: '2026-11-18T10:00:00.000Z', nom: 'Autre' } }])
    serveur.envoyer = async () => { throw new TypeError('Failed to fetch') }
    await ecrire('salles', { id: 'locale', nom: 'L' })
    await expect(synchroniser(serveur, MOI)).rejects.toThrow()
    expect(await base.table('salles').get('ailleurs')).toBeDefined()
    expect((await base.table('salles').get('locale')).aEnvoyer).toBe(1)
    expect(await lireEtat('derniereErreur')).toBe('Pas de réseau ou serveur injoignable')
  })
})

describe('messageEnFrancais', () => {
  it('remplace les messages techniques anglais', () => {
    expect(messageEnFrancais(new Error('violates check constraint "documents_id_check"'))).toBe('Le serveur n’a pas pu enregistrer certaines données')
    expect(messageEnFrancais(new Error('JWT expired'))).toContain('reconnecte-toi')
  })
  it('garde un message déjà en français', () => {
    expect(messageEnFrancais(new Error('Réseau coupé'))).toBe('Réseau coupé')
  })
})

describe('import : documents que le serveur refuserait', () => {
  const fichier = (docs: unknown[]) => JSON.stringify({ version: 2, tables: { salles: docs } })
  const doc = (id: string, plus: Record<string, unknown> = {}) => ({ id, modifieLe: '2026-11-01T00:00:00.000Z', ...plus })

  it('écarte un identifiant de plus de 100 caractères et garde celui de 100', async () => {
    const bilan = await importerDonnees(fichier([doc('x'.repeat(101)), doc('y'.repeat(100)), doc('ok')]))
    expect(bilan).toEqual({ seances: 0, autres: 2, ecartes: 1 })
    expect(await base.table('salles').get('x'.repeat(101))).toBeUndefined()
    expect(await base.table('salles').get('y'.repeat(100))).toBeDefined()
  })

  it('écarte un contenu de 200 ko ou plus', async () => {
    const bilan = await importerDonnees(fichier([doc('gros', { nom: 'a'.repeat(200_000) }), doc('petit', { nom: 'a'.repeat(1000) })]))
    expect(bilan).toEqual({ seances: 0, autres: 1, ecartes: 1 })
    expect(await base.table('salles').get('gros')).toBeUndefined()
  })

  it('le scénario de l’audit n’empêche plus rien d’arriver', async () => {
    serveurQuiRefuseLesIdTropLongs()
    await importerDonnees(fichier([doc('x'.repeat(101))]))
    await synchroniser(serveur, MOI)
    expect(await lireEtat('derniereErreur')).toBeNull()
  })
})
