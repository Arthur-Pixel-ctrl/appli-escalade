import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { base } from '../donnees/base.ts'
import { ecrire } from '../donnees/stockage.ts'
import {
  demarrerSynchroAutomatique, depuisQuand, etatSynchroCourt, regrouper, surEtatSynchro, synchroEnCours,
  synchroniserMaintenant,
} from './automatique.ts'

describe('regrouper', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('trois demandes à 1 s d’intervalle donnent un seul lancement, 3 s après la dernière', () => {
    const action = vi.fn()
    const groupe = regrouper(action, 3000)
    groupe.demander()
    vi.advanceTimersByTime(1000)
    groupe.demander()
    vi.advanceTimersByTime(1000)
    groupe.demander()
    vi.advanceTimersByTime(2999)
    expect(action).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(action).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(10_000)
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('arreter annule un lancement prévu', () => {
    const action = vi.fn()
    const groupe = regrouper(action, 3000)
    groupe.demander()
    groupe.arreter()
    vi.advanceTimersByTime(10_000)
    expect(action).not.toHaveBeenCalled()
  })
})

describe('depuisQuand', () => {
  // Dates en heure locale : le test ne dépend pas du fuseau de la machine.
  const maintenant = new Date(2026, 10, 18, 14, 5, 0)
  const iso = (d: Date) => d.toISOString()

  it('moins d’une minute : à l’instant', () => {
    expect(depuisQuand(iso(new Date(2026, 10, 18, 14, 4, 30)), maintenant)).toBe('à l’instant')
  })
  it('quelques minutes : il y a N min', () => {
    expect(depuisQuand(iso(new Date(2026, 10, 18, 14, 0, 0)), maintenant)).toBe('il y a 5 min')
  })
  it('plus d’une heure, le même jour : à l’heure exacte', () => {
    expect(depuisQuand(iso(new Date(2026, 10, 18, 11, 5, 0)), maintenant)).toBe('à 11 h 05')
  })
  it('la veille : hier à …', () => {
    expect(depuisQuand(iso(new Date(2026, 10, 17, 18, 40, 0)), maintenant)).toBe('hier à 18 h 40')
  })
  it('plus ancien : la date', () => {
    expect(depuisQuand(iso(new Date(2026, 10, 12, 9, 3, 0)), maintenant)).toMatch(/^le 12 nov\.? à 9 h 03$/)
  })
})

describe('etatSynchroCourt', () => {
  it('suit l’ordre de priorité', () => {
    expect(etatSynchroCourt({ enLigne: false, enCours: true, enAttente: 3 })).toBe('HORS LIGNE')
    expect(etatSynchroCourt({ enLigne: true, enCours: true, enAttente: 3 })).toBe('ENVOI EN COURS…')
    expect(etatSynchroCourt({ enLigne: true, enCours: false, enAttente: 1 })).toBe('1 CHANGEMENT EN ATTENTE')
    expect(etatSynchroCourt({ enLigne: true, enCours: false, enAttente: 4 })).toBe('4 CHANGEMENTS EN ATTENTE')
    expect(etatSynchroCourt({ enLigne: true, enCours: false, enAttente: 0 })).toBe('À JOUR')
  })
})

describe('demarrerSynchroAutomatique', () => {
  beforeEach(async () => {
    for (const t of base.tables) await t.clear()
    // Seules les minuteries sont simulées : fake-indexeddb a besoin du reste (setImmediate…).
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
  })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

  it('lance tout de suite, puis 3 s après une écriture, une seule fois pour plusieurs écritures', async () => {
    const lancer = vi.fn().mockResolvedValue(undefined)
    const arreter = demarrerSynchroAutomatique(lancer)
    await vi.advanceTimersByTimeAsync(0)
    expect(lancer).toHaveBeenCalledTimes(1)

    await ecrire('salles', { id: 's1', nom: 'A' })
    await vi.advanceTimersByTimeAsync(1000)
    await ecrire('salles', { id: 's1', nom: 'B' })
    await vi.advanceTimersByTimeAsync(2999)
    expect(lancer).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(lancer).toHaveBeenCalledTimes(2)
    arreter()
  })

  it('après arret, plus rien ne se lance', async () => {
    const lancer = vi.fn().mockResolvedValue(undefined)
    const arreter = demarrerSynchroAutomatique(lancer)
    await vi.advanceTimersByTimeAsync(0)
    arreter()
    await ecrire('salles', { id: 's2', nom: 'A' })
    await vi.advanceTimersByTimeAsync(10_000)
    expect(lancer).toHaveBeenCalledTimes(1)
    await synchroniserMaintenant()
    expect(lancer).toHaveBeenCalledTimes(1)
  })

  it('une seule synchro à la fois, et synchroEnCours le dit', async () => {
    let finir: () => void = () => {}
    const lancer = vi.fn(() => new Promise<void>((r) => { finir = r }))
    const arreter = demarrerSynchroAutomatique(lancer)
    await vi.advanceTimersByTimeAsync(0)
    expect(synchroEnCours()).toBe(true)
    void synchroniserMaintenant()
    expect(lancer).toHaveBeenCalledTimes(1)
    finir()
    await vi.advanceTimersByTimeAsync(0)
    // La demande faite pendant l'envoi a préparé un seul lancement de plus.
    expect(lancer).toHaveBeenCalledTimes(2)
    finir()
    await vi.advanceTimersByTimeAsync(0)
    expect(synchroEnCours()).toBe(false)
    arreter()
  })

  it('une erreur est avalée et ne relance pas en boucle', async () => {
    const lancer = vi.fn().mockRejectedValue(new Error('réseau'))
    const arreter = demarrerSynchroAutomatique(lancer)
    await vi.advanceTimersByTimeAsync(0)
    void synchroniserMaintenant()
    await vi.advanceTimersByTimeAsync(0)
    expect(lancer).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(2000)
    expect(lancer).toHaveBeenCalledTimes(2)
    expect(synchroEnCours()).toBe(false)
    arreter()
  })

  it('prévient les écrans au début et à la fin', async () => {
    const rappel = vi.fn()
    const desabonner = surEtatSynchro(rappel)
    const arreter = demarrerSynchroAutomatique(() => Promise.resolve())
    await vi.advanceTimersByTimeAsync(0)
    expect(rappel).toHaveBeenCalledTimes(2)
    desabonner()
    arreter()
  })

  it('ne lance rien hors ligne, et lance au retour du réseau, puis toutes les 5 minutes tant que visible', async () => {
    const ecouteurs = new Map<string, () => void>()
    const etat = { enLigne: false, visibilite: 'visible' }
    vi.stubGlobal('navigator', { get onLine() { return etat.enLigne } })
    vi.stubGlobal('window', {
      addEventListener: (nom: string, f: () => void) => { ecouteurs.set(nom, f) },
      removeEventListener: (nom: string) => { ecouteurs.delete(nom) },
    })
    vi.stubGlobal('document', {
      get visibilityState() { return etat.visibilite },
      addEventListener: (nom: string, f: () => void) => { ecouteurs.set(nom, f) },
      removeEventListener: (nom: string) => { ecouteurs.delete(nom) },
    })
    const lancer = vi.fn().mockResolvedValue(undefined)
    const arreter = demarrerSynchroAutomatique(lancer)
    await vi.advanceTimersByTimeAsync(0)
    expect(lancer).not.toHaveBeenCalled()

    etat.enLigne = true
    ecouteurs.get('online')!()
    await vi.advanceTimersByTimeAsync(0)
    expect(lancer).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(5 * 60_000)
    expect(lancer).toHaveBeenCalledTimes(2)

    etat.visibilite = 'hidden'
    await vi.advanceTimersByTimeAsync(5 * 60_000)
    expect(lancer).toHaveBeenCalledTimes(2)

    etat.visibilite = 'visible'
    ecouteurs.get('visibilitychange')!()
    await vi.advanceTimersByTimeAsync(0)
    expect(lancer).toHaveBeenCalledTimes(3)

    arreter()
    expect(ecouteurs.size).toBe(0)
  })
})
