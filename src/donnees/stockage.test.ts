import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { base } from './base.ts'
import {
  ecrire, ecrireAppareil, effacerAppareil, lireAppareil, lireEtat, ecrireEtat, lireTous, lireUn,
  signalerDonneesChangees, supprimer, surDonneesChangees, surEcriture, TABLES_SYNCHRONISEES,
} from './stockage.ts'

afterEach(() => { vi.useRealTimers() })

describe('ecrire', () => {
  it('pose creeLe, modifieLe, versionFormat et aEnvoyer', async () => {
    await ecrire('salles', { id: 's1', nom: 'Ma salle' })
    const doc = await base.table('salles').get('s1')
    expect(doc.versionFormat).toBe(1)
    expect(doc.aEnvoyer).toBe(1)
    expect(doc.creeLe).toBe(doc.modifieLe)
    expect(new Date(doc.modifieLe).toISOString()).toBe(doc.modifieLe)
  })

  it('garde creeLe et fait avancer modifieLe à la seconde écriture', async () => {
    await ecrire('cycles', { id: 'c1', nom: 'A' })
    const premier = await base.table('cycles').get('c1')
    await new Promise((r) => setTimeout(r, 5))
    await ecrire('cycles', { id: 'c1', nom: 'B' })
    const second = await base.table('cycles').get('c1')
    expect(second.nom).toBe('B')
    expect(second.creeLe).toBe(premier.creeLe)
    expect(second.modifieLe > premier.modifieLe).toBe(true)
  })
})

describe('supprimer', () => {
  it('masque le document mais le garde, marqué à envoyer', async () => {
    await ecrire('formes', { id: 'f1', date: '2026-11-18' })
    await base.table('formes').update('f1', { aEnvoyer: 0 })
    await supprimer('formes', 'f1')
    expect(await lireTous('formes')).toEqual([])
    expect(await lireUn('formes', 'f1')).toBeUndefined()
    const brut = await base.table('formes').get('f1')
    expect(brut.supprimeLe).toBeTruthy()
    expect(brut.aEnvoyer).toBe(1)
  })

  it('ne fait rien si l’identifiant n’existe pas', async () => {
    const rappel = vi.fn()
    const arret = surEcriture(rappel)
    await supprimer('formes', 'inconnu')
    arret()
    expect(await base.table('formes').get('inconnu')).toBeUndefined()
    expect(rappel).not.toHaveBeenCalled()
  })
})

describe('lecture', () => {
  it('lireUn renvoie le document, lireTous les liste', async () => {
    await ecrire('douleurs', { id: 'd1', date: '2026-11-18' })
    expect(await lireUn<{ id: string }>('douleurs', 'd1')).toMatchObject({ id: 'd1' })
    expect((await lireTous<{ id: string }>('douleurs')).map((d) => d.id)).toEqual(['d1'])
  })
})

describe('tables et événements', () => {
  it('TABLES_SYNCHRONISEES : 11 tables, sans etatSynchro ni appareil', () => {
    expect([...TABLES_SYNCHRONISEES]).toEqual([
      'seancesRealisees', 'reglages', 'cycles', 'phases', 'seancesPlanifiees', 'objectifsSpecifiques',
      'exercicesPerso', 'salles', 'formes', 'douleurs', 'resultatsTests',
    ])
    expect(TABLES_SYNCHRONISEES).not.toContain('etatSynchro')
    expect(TABLES_SYNCHRONISEES).not.toContain('appareil')
  })

  it('surEcriture est appelé une fois par écriture, plus après désabonnement', async () => {
    const rappel = vi.fn()
    const arret = surEcriture(rappel)
    await ecrire('exercicesPerso', { id: 'e1' })
    expect(rappel).toHaveBeenCalledTimes(1)
    arret()
    await ecrire('exercicesPerso', { id: 'e2' })
    expect(rappel).toHaveBeenCalledTimes(1)
  })

  it('surDonneesChangees réagit à signalerDonneesChangees', () => {
    const rappel = vi.fn()
    const arret = surDonneesChangees(rappel)
    signalerDonneesChangees()
    arret()
    signalerDonneesChangees()
    expect(rappel).toHaveBeenCalledTimes(1)
  })

  it('les données de l’appareil et de la synchro ne touchent aucune table synchronisée', async () => {
    const rappel = vi.fn()
    const arret = surEcriture(rappel)
    await ecrireAppareil('cleApiClaude', 'x')
    await ecrireEtat('curseur', 'abc')
    arret()
    expect(rappel).not.toHaveBeenCalled()
    expect(await lireAppareil('cleApiClaude')).toBe('x')
    expect(await lireEtat('curseur')).toBe('abc')
    for (const t of TABLES_SYNCHRONISEES) {
      const tous = await base.table(t).toArray()
      expect(JSON.stringify(tous)).not.toContain('cleApiClaude')
    }
    await effacerAppareil('cleApiClaude')
    expect(await lireAppareil('cleApiClaude')).toBeUndefined()
  })
})
