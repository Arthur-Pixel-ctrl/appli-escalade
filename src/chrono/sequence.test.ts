import { describe, expect, it } from 'vitest'
import { construireSequence, dureeTotaleS, etatA, type ConfigChrono } from './sequence.ts'

const resume = (c: ConfigChrono, prep = 0) =>
  construireSequence(c, prep).map((p) => `${p.type[0]}${p.dureeS}`).join(' ')

describe('construireSequence', () => {
  it('répétition unique : un effort par série, long repos entre les séries', () => {
    const c: ConfigChrono = { gabarit: 'repetition_unique', effortS: 10, series: 3, reposSeriesS: 180 }
    expect(resume(c)).toBe('e10 r180 e10 r180 e10')
  })

  it('départ à la minute : le repos complète le créneau', () => {
    const c: ConfigChrono = { gabarit: 'depart_minute', effortS: 10, creneauS: 60, repetitions: 3, series: 1, reposSeriesS: 0 }
    expect(resume(c)).toBe('e10 r50 e10 r50 e10')
  })

  it('intermittent 7/3 : six répétitions puis repos entre séries', () => {
    const c: ConfigChrono = { gabarit: 'intermittent', effortS: 7, reposRepetitionsS: 3, repetitions: 6, series: 2, reposSeriesS: 180 }
    expect(resume(c)).toBe('e7 r3 e7 r3 e7 r3 e7 r3 e7 r3 e7 r180 e7 r3 e7 r3 e7 r3 e7 r3 e7 r3 e7')
    expect(dureeTotaleS(construireSequence(c, 0))).toBe(2 * (6 * 7 + 5 * 3) + 180)
  })

  it('échelle 3-6-9 : durées variables dans un créneau de 45 s', () => {
    const c: ConfigChrono = { gabarit: 'echelle', dureesS: [3, 6, 9], creneauS: 45, series: 2, reposSeriesS: 120 }
    expect(resume(c)).toBe('e3 r42 e6 r39 e9 r120 e3 r42 e6 r39 e9')
  })

  it('ajoute une préparation et numérote séries et répétitions', () => {
    const c: ConfigChrono = { gabarit: 'echelle', dureesS: [3, 6, 9], creneauS: 45, series: 2, reposSeriesS: 120 }
    const phases = construireSequence(c)
    expect(phases[0]).toMatchObject({ type: 'preparation', dureeS: 5 })
    const dernierEffort = phases[phases.length - 1]
    expect(dernierEffort).toMatchObject({ type: 'effort', serie: 2, repetition: 3, totalSeries: 2, totalRepetitions: 3 })
    expect(phases.find((p) => p.entreSeries)).toMatchObject({ type: 'repos', dureeS: 120, serie: 1 })
  })

  it('ne finit jamais par un repos', () => {
    const c: ConfigChrono = { gabarit: 'depart_minute', effortS: 5, creneauS: 30, repetitions: 4, series: 3, reposSeriesS: 90 }
    const phases = construireSequence(c)
    expect(phases[phases.length - 1].type).toBe('effort')
  })
})

describe('etatA', () => {
  const phases = construireSequence(
    { gabarit: 'echelle', dureesS: [3, 6, 9], creneauS: 45, series: 1, reposSeriesS: 0 },
    5,
  ) // p5 e3 r42 e6 r39 e9

  it('donne la phase et le temps restant arrondi vers le haut', () => {
    expect(etatA(phases, 0)).toMatchObject({ index: 0, resteS: 5, termine: false })
    expect(etatA(phases, 4.2)).toMatchObject({ index: 0, resteS: 1 })
    expect(etatA(phases, 5)).toMatchObject({ index: 1, resteS: 3 })
    expect(etatA(phases, 6.5).phase?.type).toBe('effort')
    expect(etatA(phases, 8)).toMatchObject({ index: 2, resteS: 42 })
  })

  it('annonce la phase suivante', () => {
    expect(etatA(phases, 8).suivante).toMatchObject({ type: 'effort', dureeS: 6 })
  })

  it('retombe juste après une longue veille', () => {
    // 5 + 3 + 42 + 6 + 39 = 95 : on doit être dans le dernier effort
    expect(etatA(phases, 97)).toMatchObject({ index: 5, resteS: 7 })
  })

  it('se termine à la fin de la dernière phase', () => {
    expect(etatA(phases, 104).termine).toBe(true)
    expect(etatA(phases, 9999).termine).toBe(true)
  })
})
