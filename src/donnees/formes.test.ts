import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { base } from './base.ts'
import { enregistrerForme, lireForme, lireFormesEntre, resumeForme } from './formes.ts'
import type { FormeDuJour } from './modele.ts'
import { supprimer } from './stockage.ts'

const reponses = { sommeil: 2, fatigue: 3, courbatures: 4, douleur: 5, peau: 1, heuresSommeil: 5.5 } as const

beforeEach(async () => { await base.formes.clear() })

describe('formes du jour', () => {
  it('enregistre puis relit les mêmes valeurs, identifiant = date, à envoyer', async () => {
    await enregistrerForme({ date: '2026-11-26', ...reponses })
    const f = await lireForme('2026-11-26')
    expect(f).toMatchObject({ id: '2026-11-26', date: '2026-11-26', ...reponses })
    expect((await base.formes.get('2026-11-26'))?.aEnvoyer).toBe(1)
  })

  it('deux enregistrements le même jour : un seul document, le second gagne, creeLe du premier gardé', async () => {
    await enregistrerForme({ date: '2026-11-26', ...reponses })
    const premier = await lireForme('2026-11-26') as FormeDuJour
    await new Promise((r) => setTimeout(r, 5))
    await enregistrerForme({ date: '2026-11-26', sommeil: 5, fatigue: 5, courbatures: 5, douleur: 5, peau: 5 })
    expect(await base.formes.count()).toBe(1)
    const second = await lireForme('2026-11-26') as FormeDuJour
    expect(second.sommeil).toBe(5)
    expect(second).not.toHaveProperty('heuresSommeil')
    expect(second.creeLe).toBe(premier.creeLe)
    expect(second.modifieLe > premier.modifieLe).toBe(true)
  })

  it('lireForme rend undefined un jour sans forme', async () => {
    expect(await lireForme('2026-11-27')).toBeUndefined()
  })

  it('lireFormesEntre : bornes incluses, sans les supprimées', async () => {
    for (const d of ['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26']) await enregistrerForme({ date: d, ...reponses })
    await supprimer('formes', '2026-11-25')
    const formes = await lireFormesEntre('2026-11-24', '2026-11-26')
    expect(formes.map((f) => f.date)).toEqual(['2026-11-24', '2026-11-26'])
  })

  it('resumeForme : 0, 1 et 2', () => {
    expect(resumeForme(0)).toBe('Aucun voyant au rouge')
    expect(resumeForme(1)).toBe('1 voyant au rouge')
    expect(resumeForme(2)).toBe('2 voyants au rouge')
  })
})
