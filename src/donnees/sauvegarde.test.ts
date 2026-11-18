import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { base, exporterDonnees, importerDonnees } from './base.ts'
import { ecrire, ecrireAppareil, supprimer, TABLES_SYNCHRONISEES } from './stockage.ts'
import { delierAppareil, sauvegardeComplete } from '../synchro/reprise.ts'
import { ecrireEtat, lireEtat } from './stockage.ts'

beforeEach(async () => {
  for (const t of base.tables) await t.clear()
})

const seance = (id: string, plus: Record<string, unknown> = {}) => ({ id, date: '2026-11-01', nom: `Séance ${id}`, mode: 'solo', ...plus })

/** Un document dans chacune des onze tables. */
async function toutRemplir() {
  for (const t of TABLES_SYNCHRONISEES) await ecrire(t, { id: `${t}-1`, nom: t })
}

describe('export (format version 2)', () => {
  it('contient les onze tables, sans aEnvoyer, et les documents supprimés', async () => {
    await toutRemplir()
    await supprimer('salles', 'salles-1')
    const fichier = JSON.parse(await exporterDonnees())
    expect(fichier.version).toBe(2)
    expect(Object.keys(fichier.tables).sort()).toEqual([...TABLES_SYNCHRONISEES].sort())
    expect(Object.keys(fichier.tables)).toHaveLength(11)
    expect(JSON.stringify(fichier)).not.toContain('aEnvoyer')
    expect(fichier.tables.salles[0].supprimeLe).toBeTruthy()
  })

  it('ne contient aucune trace de la clé API ni des tables de l’appareil', async () => {
    await toutRemplir()
    await ecrireAppareil('cleApiClaude', 'sk-ant-secret-123')
    await ecrireEtat('compteId', 'utilisateur-secret')
    const texte = await exporterDonnees()
    expect(texte).not.toContain('cleApiClaude')
    expect(texte).not.toContain('sk-ant-secret-123')
    expect(texte).not.toContain('utilisateur-secret')
    expect(Object.keys(JSON.parse(texte).tables)).not.toContain('appareil')
  })

  it('la sauvegarde du compte est le même format', async () => {
    await toutRemplir()
    const a = JSON.parse(await exporterDonnees())
    const b = JSON.parse(await sauvegardeComplete())
    expect(b.version).toBe(2)
    expect(b.tables).toEqual(a.tables)
  })
})

describe('import', () => {
  it('recharge un fichier au format actuel exact (version 1 : séances et profil)', async () => {
    const ancien = JSON.stringify({
      version: 1, exporteLe: '2026-11-15T10:00:00.000Z',
      tables: {
        seancesRealisees: [
          { id: 's1', versionFormat: 1, creeLe: '2026-11-10T17:00:00.000Z', modifieLe: '2026-11-10T18:30:00.000Z', date: '2026-11-10', mode: 'solo', nom: 'A', aEnvoyer: 0 },
          { id: 's2', date: '2026-10-01', mode: 'groupe', nom: 'Sans dates' }, // avant la v3 : ni modifieLe ni creeLe
        ],
        reglages: [{ id: 'profil', versionFormat: 1, creeLe: '2026-11-01T08:00:00.000Z', modifieLe: '2026-11-05T09:00:00.000Z', prenom: 'Arthur' }],
      },
    })
    expect(await importerDonnees(ancien)).toEqual({ seances: 2, autres: 1 })
    expect(await base.seancesRealisees.get('s1')).toMatchObject({ nom: 'A', modifieLe: '2026-11-10T18:30:00.000Z', aEnvoyer: 1 })
    expect(await base.seancesRealisees.get('s2')).toMatchObject({ versionFormat: 1, modifieLe: '2026-10-01T00:00:00.000Z', creeLe: '2026-10-01T00:00:00.000Z', aEnvoyer: 1 })
    expect(await base.reglages.get('profil')).toMatchObject({ prenom: 'Arthur', aEnvoyer: 1 })
  })

  it('aller-retour : export, base vidée, import redonne les mêmes documents', async () => {
    await toutRemplir()
    await ecrire('seancesRealisees', seance('s2'))
    await supprimer('cycles', 'cycles-1')
    const avant: Record<string, unknown[]> = {}
    for (const t of TABLES_SYNCHRONISEES) avant[t] = await base.table(t).toArray()
    const fichier = await exporterDonnees()

    for (const t of base.tables) await t.clear()
    const bilan = await importerDonnees(fichier)
    expect(bilan.seances).toBe(2)
    for (const t of TABLES_SYNCHRONISEES) {
      const apres = (await base.table(t).toArray()) as Record<string, unknown>[]
      const attendu: Record<string, unknown>[] = (avant[t] as Record<string, unknown>[]).map((d) => ({ ...d, aEnvoyer: 1 }))
      expect(apres.sort((x, y) => String(x.id).localeCompare(String(y.id)))).toEqual(attendu.sort((x, y) => String(x.id).localeCompare(String(y.id))))
    }
    // La suppression voyage avec le fichier.
    expect(((await base.cycles.get('cycles-1')) as { supprimeLe?: string }).supprimeLe).toBeTruthy()
  })

  it('un document du fichier plus ancien que le local ne l’écrase pas ; un plus récent le remplace', async () => {
    await ecrire('seancesRealisees', seance('s1', { nom: 'Local récent' }))
    await ecrire('seancesRealisees', seance('s3', { nom: 'Local ancien' }))
    const local = (await base.seancesRealisees.get('s1'))!
    const plusAncien = new Date(Date.parse(local.modifieLe) - 60_000).toISOString()
    const plusRecent = new Date(Date.parse(local.modifieLe) + 60_000).toISOString()
    await base.seancesRealisees.update('s1', { aEnvoyer: 0 })
    await importerDonnees(JSON.stringify({
      version: 2, exporteLe: plusRecent,
      tables: { seancesRealisees: [
        { id: 's1', nom: 'Fichier ancien', date: '2026-11-01', mode: 'solo', versionFormat: 1, creeLe: plusAncien, modifieLe: plusAncien },
        { id: 's3', nom: 'Fichier récent', date: '2026-11-01', mode: 'solo', versionFormat: 1, creeLe: plusAncien, modifieLe: plusRecent },
      ] },
    }))
    expect(await base.seancesRealisees.get('s1')).toMatchObject({ nom: 'Local récent', aEnvoyer: 0 }) // intact
    expect(await base.seancesRealisees.get('s3')).toMatchObject({ nom: 'Fichier récent', modifieLe: plusRecent, aEnvoyer: 1 })
  })

  it('ignore les tables inconnues, garde les données absentes du fichier, refuse un mauvais fichier', async () => {
    await ecrire('seancesRealisees', seance('reste'))
    const bilan = await importerDonnees(JSON.stringify({
      version: 2, exporteLe: 'x', tables: { appareil: [{ cle: 'cleApiClaude', valeur: 'pirate' }], inconnue: [{ id: 'z' }], salles: [{ id: 'salle-a', modifieLe: '2026-11-01T00:00:00.000Z' }] },
    }))
    expect(bilan).toEqual({ seances: 0, autres: 1 })
    expect(await base.appareil.count()).toBe(0)
    expect(await base.seancesRealisees.get('reste')).toBeTruthy()
    await expect(importerDonnees('pas du json')).rejects.toThrow('sauvegarde')
    await expect(importerDonnees(JSON.stringify({ version: 3, tables: {} }))).rejects.toThrow('sauvegarde')
    await expect(importerDonnees(JSON.stringify({ version: 1, tables: { reglages: [] } }))).rejects.toThrow('sauvegarde')
    expect(await base.seancesRealisees.count()).toBe(1)
  })
})

describe('détacher l’appareil après suppression du compte', () => {
  it('oublie le compte mais garde toutes les données, marquées à envoyer', async () => {
    await toutRemplir()
    await ecrireEtat('compteId', 'u1')
    await ecrireEtat('curseur', 'abc')
    await base.seancesRealisees.update('seancesRealisees-1', { aEnvoyer: 0 })
    await delierAppareil()
    expect(await lireEtat('compteId')).toBeNull()
    expect(await base.seancesRealisees.count()).toBe(1)
    expect((await base.seancesRealisees.get('seancesRealisees-1'))?.aEnvoyer).toBe(1)
  })
})
