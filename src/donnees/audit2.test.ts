// Constats M-5, M-6 et M-7 de l'audit de fin de phase 2.
import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { base, importerDonnees, lireProfil } from './base.ts'
import { ecrire, supprimer, surDonneesChangees, surEcriture } from './stockage.ts'

beforeEach(async () => { for (const t of base.tables) await t.clear() })
afterEach(() => { vi.unstubAllGlobals() })

describe('M-5 : lireProfil', () => {
  it('renvoie le profil enregistré', async () => {
    await ecrire('reglages', { id: 'profil', prenom: 'Arthur' })
    expect(await lireProfil()).toMatchObject({ prenom: 'Arthur' })
  })
  it('ne renvoie plus un profil supprimé', async () => {
    await ecrire('reglages', { id: 'profil', prenom: 'Arthur' })
    await supprimer('reglages', 'profil')
    expect(await lireProfil()).toBeNull()
  })
})

describe('M-6 : importerDonnees prévient les abonnés', () => {
  const fichier = JSON.stringify({ version: 2, tables: { salles: [{ id: 's1', modifieLe: '2026-11-01T00:00:00.000Z' }] } })

  it('demande une synchro et fait relire les écrans', async () => {
    const ecritures = vi.fn()
    const changements = vi.fn()
    const desabonner = [surEcriture(ecritures), surDonneesChangees(changements)]
    await importerDonnees(fichier)
    desabonner.forEach((f) => f())
    expect(ecritures).toHaveBeenCalledTimes(1)
    expect(changements).toHaveBeenCalledTimes(1)
  })

  it('ne dit rien quand rien n’a changé (document plus ancien que le local)', async () => {
    await importerDonnees(fichier)
    const ecritures = vi.fn()
    const desabonner = surEcriture(ecritures)
    await importerDonnees(fichier)
    desabonner()
    expect(ecritures).not.toHaveBeenCalled()
  })
})

describe('M-7 : demande de conservation des données', () => {
  it('appelle navigator.storage.persist une seule fois, après un enregistrement', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('navigator', { storage: { persist } })
    await ecrire('salles', { id: 'a', nom: 'A' })
    await ecrire('salles', { id: 'b', nom: 'B' })
    expect(persist).toHaveBeenCalledTimes(1)
  })

  it('n’empêche jamais l’enregistrement, même si persist échoue ou lève une erreur', async () => {
    vi.stubGlobal('navigator', { storage: { persist: vi.fn().mockRejectedValue(new Error('refusé')) } })
    await expect(ecrire('salles', { id: 'a', nom: 'A' })).resolves.toBeUndefined()
    vi.stubGlobal('navigator', { storage: { persist: () => { throw new Error('boum') } } })
    await expect(ecrire('salles', { id: 'b', nom: 'B' })).resolves.toBeUndefined()
    expect(await base.table('salles').get('b')).toBeDefined()
  })

  it('fonctionne sans navigator.storage', async () => {
    vi.stubGlobal('navigator', {})
    await expect(ecrire('salles', { id: 'c', nom: 'C' })).resolves.toBeUndefined()
  })
})
