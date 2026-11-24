import { describe, expect, it } from 'vitest'
import type { ConfigChrono } from '../../chrono/sequence.ts'
import { BIBLIOTHEQUE } from './index.ts'
import { appliquerReglages, bornesReglages, decrireForme, decrireReglages, dureeCourte, estCeluiDeLaFiche } from './reglages.ts'

describe('dureeCourte', () => {
  it('dit les secondes, les minutes et le reste', () => {
    expect(dureeCourte(45)).toBe('45 s')
    expect(dureeCourte(180)).toBe('3 min')
    expect(dureeCourte(150)).toBe('2 min 30')
    expect(dureeCourte(605)).toBe('10 min 05')
  })
})

describe('decrireReglages : un cas par gabarit', () => {
  it('échelle avec repos entre suspensions (exemple de la spec)', () => {
    const c: ConfigChrono = { gabarit: 'echelle', dureesS: [3, 6, 9], creneauS: 45, reposEntrePaliersS: 6, series: 9, reposSeriesS: 0 }
    expect(decrireReglages(c)).toBe('9 échelles de 3, 6 puis 9 s · créneau de 45 s · 6 s entre deux suspensions')
  })
  it('échelle avec repos entre échelles', () => {
    const c: ConfigChrono = { gabarit: 'echelle', dureesS: [5, 10, 15], creneauS: 30, series: 4, reposSeriesS: 15 }
    expect(decrireReglages(c)).toBe('4 échelles de 5, 10 puis 15 s · créneau de 30 s · 15 s de repos entre deux échelles')
  })
  it('répétition unique : un seul effort, puis plusieurs séries', () => {
    expect(decrireReglages({ gabarit: 'repetition_unique', effortS: 600, series: 1, reposSeriesS: 0 })).toBe('1 effort de 10 min')
    expect(decrireReglages({ gabarit: 'repetition_unique', effortS: 10, series: 3, reposSeriesS: 180 }))
      .toBe('3 séries d’un effort de 10 s · 3 min de repos entre deux séries')
  })
  it('départ à la minute', () => {
    const c: ConfigChrono = { gabarit: 'depart_minute', effortS: 7, creneauS: 60, repetitions: 3, series: 3, reposSeriesS: 300 }
    expect(decrireReglages(c)).toBe('3 séries de 3 départs · 7 s d’effort toutes les minutes · 5 min de repos entre deux séries')
  })
  it('intermittent', () => {
    const c: ConfigChrono = { gabarit: 'intermittent', effortS: 7, reposRepetitionsS: 3, repetitions: 6, series: 1, reposSeriesS: 0 }
    expect(decrireReglages(c)).toBe('1 série de 6 répétitions · 7 s d’effort, 3 s de repos')
  })
})

describe('decrireForme', () => {
  it('couvre la liste et les essais', () => {
    expect(decrireForme({ forme: 'liste', elements: ['a', 'b', 'c'] })).toBe('3 éléments à cocher, dans l’ordre')
    expect(decrireForme({ forme: 'essais', reposS: 180 })).toBe('3 min de repos après chaque essai')
    expect(decrireForme({ forme: 'essais', reposS: 60, essaisParSerie: 2, reposSeriesS: 600 }))
      .toBe('1 min de repos après chaque essai · 10 min de repos tous les 2 essais')
  })
  it('décrit toutes les fiches de la bibliothèque sans texte vide ni « NaN »', () => {
    for (const p of BIBLIOTHEQUE) {
      const t = decrireForme(p)
      expect(t, p.id).not.toBe('')
      expect(t, p.id).not.toMatch(/NaN|undefined/)
    }
  })
})

const fiche: ConfigChrono = { gabarit: 'intermittent', effortS: 7, reposRepetitionsS: 13, repetitions: 6, series: 9, reposSeriesS: 120 }

describe('bornesReglages', () => {
  it('ne propose que moins de séries et plus de repos que la fiche', () => {
    const b = bornesReglages(fiche)
    expect(b.series).toEqual({ min: 1, max: 9, pas: 1 })
    expect(b.reposSeriesS).toEqual({ min: 120, max: 240, pas: 15 })
  })
  it('ne propose rien quand la fiche n’a qu’une série ou pas de repos entre séries', () => {
    expect(bornesReglages({ gabarit: 'repetition_unique', effortS: 600, series: 1, reposSeriesS: 0 })).toEqual({})
    const b = bornesReglages({ gabarit: 'echelle', dureesS: [3, 6, 9], creneauS: 45, reposEntrePaliersS: 6, series: 9, reposSeriesS: 0 })
    expect(b.series).toBeDefined()
    expect(b.reposSeriesS).toBeUndefined()
  })
  it('plafonne le repos à 15 minutes', () => {
    const b = bornesReglages({ gabarit: 'intermittent', effortS: 10, reposRepetitionsS: 6, repetitions: 12, series: 3, reposSeriesS: 600 })
    expect(b.reposSeriesS?.max).toBe(900)
  })
})

describe('appliquerReglages', () => {
  it('accepte une valeur dans les bornes', () => {
    const r = appliquerReglages(fiche, { series: 5, reposSeriesS: 180 })
    expect(r).toMatchObject({ series: 5, reposSeriesS: 180 })
  })
  it('ramène dans les bornes ce qui en sort : jamais plus de séries, jamais moins de repos', () => {
    expect(appliquerReglages(fiche, { series: 20, reposSeriesS: 10 })).toMatchObject({ series: 9, reposSeriesS: 120 })
    expect(appliquerReglages(fiche, { series: 0, reposSeriesS: 5000 })).toMatchObject({ series: 1, reposSeriesS: 240 })
    expect(appliquerReglages(fiche, { series: -3 })).toMatchObject({ series: 1 })
  })
  it('arrondit au pas et ignore les valeurs absurdes', () => {
    expect(appliquerReglages(fiche, { reposSeriesS: 131 }).reposSeriesS).toBe(135)
    expect(appliquerReglages(fiche, { series: Number.NaN, reposSeriesS: Infinity })).toMatchObject({ series: 9, reposSeriesS: 120 })
  })
  it('ne touche pas à l’effort ni ne modifie la fiche d’origine', () => {
    const copie = JSON.stringify(fiche)
    const r = appliquerReglages(fiche, { series: 4 })
    expect(r).toMatchObject({ effortS: 7, reposRepetitionsS: 13, repetitions: 6 })
    expect(JSON.stringify(fiche)).toBe(copie)
  })
  it('sans réglage possible, rend la fiche telle quelle', () => {
    const une: ConfigChrono = { gabarit: 'repetition_unique', effortS: 600, series: 1, reposSeriesS: 0 }
    expect(appliquerReglages(une, { series: 5, reposSeriesS: 300 })).toEqual(une)
  })
  it('reste dans les bornes pour toutes les fiches à chrono de la bibliothèque, quelle que soit la demande', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.forme !== 'chrono') continue
      const b = bornesReglages(p.config)
      for (const series of [-1, 0, 1, 3, 100]) {
        for (const repos of [0, 15, 100, 400, 100000]) {
          const r = appliquerReglages(p.config, { series, reposSeriesS: repos })
          expect(r.series, p.id).toBeGreaterThanOrEqual(1)
          expect(r.series, p.id).toBeLessThanOrEqual(p.config.series)
          expect(r.reposSeriesS, p.id).toBeGreaterThanOrEqual(p.config.reposSeriesS)
          expect(r.reposSeriesS, p.id).toBeLessThanOrEqual(b.reposSeriesS?.max ?? p.config.reposSeriesS)
        }
      }
    }
  })
})

describe('estCeluiDeLaFiche', () => {
  it('reconnaît les valeurs de la fiche', () => {
    expect(estCeluiDeLaFiche(fiche, {})).toBe(true)
    expect(estCeluiDeLaFiche(fiche, { series: 9, reposSeriesS: 120 })).toBe(true)
    expect(estCeluiDeLaFiche(fiche, { series: 8 })).toBe(false)
    expect(estCeluiDeLaFiche(fiche, { series: 50 })).toBe(true) // ramené à la fiche
  })
})
