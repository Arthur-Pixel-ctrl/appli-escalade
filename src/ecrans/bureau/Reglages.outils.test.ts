import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { base, exporterDonnees } from '../../donnees/base.ts'
import { TABLES_SYNCHRONISEES, lireAppareil, ecrire } from '../../donnees/stockage.ts'
import {
  changerMemorisation, enregistrerCle, enregistrerModele, enregistrerRegles, lireCle, lireReglages, masquerCle,
  memoriserCleActive, modeleDepuis, oublierCleEnMemoire, reglesDepuis, ressembleAUneCle, supprimerCle,
  MODELE_HAIKU, MODELE_SONNET,
} from './Reglages.outils.ts'

const CLE = 'sk-ant-test-0000'

beforeEach(async () => {
  oublierCleEnMemoire()
  for (const t of base.tables) await t.clear()
})
afterEach(() => { vi.restoreAllMocks() })

/** Tout ce que la synchronisation pourrait envoyer : les onze tables, en texte. */
async function toutLeSynchronise(): Promise<string> {
  const lots: unknown[] = []
  for (const table of TABLES_SYNCHRONISEES) lots.push(await base.table(table).toArray())
  return JSON.stringify(lots)
}

describe('la clé de l’assistant reste sur l’appareil', () => {
  it('une sauvegarde exportée après saisie ne contient pas la clé', async () => {
    await ecrire('salles', { id: 's1', nom: 'Ma salle' })
    await enregistrerCle(CLE, true)
    const texte = await exporterDonnees()
    expect(texte).not.toContain(CLE)
    expect(texte).not.toContain('cleApiClaude')
  })

  it('aucun document synchronisé ne la contient, même après avoir enregistré réglages et modèle', async () => {
    await enregistrerCle(CLE, true)
    await enregistrerRegles({ dechargeActive: true, dechargeReductionPct: 50 })
    await enregistrerModele(MODELE_SONNET)
    expect(await toutLeSynchronise()).not.toContain(CLE)
    expect(await lireAppareil('cleApiClaude')).toBe(CLE)
  })

  it('« Mémoriser » décochée : la clé n’est écrite dans aucune table, mais reste lisible le temps de l’onglet', async () => {
    await enregistrerCle(CLE, false)
    expect(await base.appareil.get('cleApiClaude')).toBeUndefined()
    expect(await toutLeSynchronise()).not.toContain(CLE)
    expect(await lireCle()).toBe(CLE)
    oublierCleEnMemoire() // l'onglet se ferme
    expect(await lireCle()).toBeNull()
  })

  it('décocher puis recocher la case déplace la clé sans la perdre', async () => {
    await enregistrerCle(CLE, true)
    await changerMemorisation(false)
    expect(await base.appareil.get('cleApiClaude')).toBeUndefined()
    expect(await lireCle()).toBe(CLE)
    await changerMemorisation(true)
    expect(await lireAppareil('cleApiClaude')).toBe(CLE)
    expect(await memoriserCleActive()).toBe(true)
  })

  it('supprimer la clé l’efface partout, y compris de la mémoire', async () => {
    await enregistrerCle(CLE, true)
    await supprimerCle()
    expect(await lireCle()).toBeNull()
    await enregistrerCle(CLE, false)
    await supprimerCle()
    expect(await lireCle()).toBeNull()
  })

  it('n’écrit rien dans la console', async () => {
    const espions = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) => vi.spyOn(console, m).mockImplementation(() => {}))
    await enregistrerCle(CLE, true)
    await changerMemorisation(false)
    await supprimerCle()
    for (const e of espions) expect(e).not.toHaveBeenCalled()
  })

  it('l’affichage masqué ne montre jamais la clé en entier', () => {
    const vu = masquerCle(CLE)
    expect(vu).not.toBe(CLE)
    expect(vu).not.toContain('test')
    expect(vu).toContain('••••')
    expect(masquerCle('court')).not.toContain('court')
  })

  it('une clé qui ne commence pas par « sk-ant- » est signalée, pas refusée', async () => {
    expect(ressembleAUneCle(CLE)).toBe(true)
    expect(ressembleAUneCle('abc')).toBe(false)
    await enregistrerCle('abc', true)
    expect(await lireCle()).toBe('abc')
  })
})

describe('règles et modèle', () => {
  it('valeurs prudentes par défaut, et valeurs hors plage ignorées', () => {
    expect(reglesDepuis(undefined)).toEqual({ dechargeActive: true, dechargeReductionPct: 50 })
    const mauvais = { reglesSecurite: { dechargeActive: 'oui', dechargeReductionPct: 90 } } as never
    expect(reglesDepuis(mauvais)).toEqual({ dechargeActive: true, dechargeReductionPct: 50 })
  })

  it('les règles s’écrivent dans reglesSecurite sans effacer le modèle', async () => {
    await enregistrerModele(MODELE_SONNET)
    await enregistrerRegles({ dechargeActive: false, dechargeReductionPct: 60 })
    const r = await lireReglages()
    expect(r?.reglesSecurite).toMatchObject({ dechargeActive: false, dechargeReductionPct: 60 })
    expect(modeleDepuis(r)).toBe(MODELE_SONNET)
  })

  it('Haiku tant que rien n’est choisi', () => {
    expect(modeleDepuis(undefined)).toBe(MODELE_HAIKU)
  })
})
