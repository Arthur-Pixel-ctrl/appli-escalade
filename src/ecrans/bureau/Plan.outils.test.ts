import { describe, expect, it } from 'vitest'
import type { Cycle, PhaseCycle } from '../../donnees/modele.ts'
import {
  chargeRelative, cycleAMontrer, estUnLundi, libelleCaseSemaine, lundiSuivant, nouveauCycleVide,
  phraseNiveau, semaineDuJour, seancesAvecNiveauPropre, semainesAPlat,
} from './Plan.outils.ts'

let compteur = 0
const id = () => `id-${++compteur}`

describe('lundiSuivant', () => {
  it('donne le lundi qui suit, même un lundi', () => {
    expect(lundiSuivant('2026-11-23')).toBe('2026-11-30') // lundi
    expect(lundiSuivant('2026-11-25')).toBe('2026-11-30') // mercredi
    expect(lundiSuivant('2026-11-29')).toBe('2026-11-30') // dimanche
  })
  it('reconnaît un lundi', () => {
    expect(estUnLundi('2026-11-30')).toBe(true)
    expect(estUnLundi('2026-12-01')).toBe(false)
    expect(estUnLundi('')).toBe(false)
  })
})

describe('nouveauCycleVide', () => {
  it('crée un brouillon de 12 semaines, 3 phases de 4 semaines (3 de charge, 1 allégée à 50 %)', () => {
    const { cycle, phases } = nouveauCycleVide(
      { nom: ' Hiver ', debut: '2026-11-30', seancesParSemaine: 3, accents: [null, null, null], niveauDetail: 'detaille' },
      '2026-11-23T10:00:00.000Z', id,
    )
    expect(cycle).toMatchObject({ nom: 'Hiver', etat: 'brouillon', nbSemaines: 12, avertissementsGardes: [], niveauDetail: 'detaille' })
    expect(phases.map((p) => p.ordre)).toEqual([1, 2, 3])
    expect(phases.every((p) => p.cycleId === cycle.id && p.accent === null)).toBe(true)
    expect(phases[0].semaines.map((s) => s.type)).toEqual(['charge', 'charge', 'charge', 'allegee'])
    expect(phases[0].semaines[3].reductionPct).toBe(50)
  })
  it('écrit toujours le niveau affiché, y compris Simple', () => {
    const { cycle } = nouveauCycleVide(
      { nom: 'x', debut: '2026-11-30', seancesParSemaine: 2, accents: ['endurance', null, null], niveauDetail: 'simple' }, 'm', id)
    expect(cycle.niveauDetail).toBe('simple')
  })
})

describe('phraseNiveau', () => {
  it('suit la proposition tant que rien n’est choisi', () => {
    expect(phraseNiveau([null, null, null], null)).toContain('ne sont pas tous choisis')
    expect(phraseNiveau(['doigts', null, null], null)).toContain('doigts, la traction ou la puissance')
  })
  it('dit « Ton choix » quand le choix diffère de la proposition', () => {
    expect(phraseNiveau([null, null, null], 'simple')).toBe('Ton choix. Pour ces accents, l’app propose Détaillé.')
    expect(phraseNiveau(['endurance', 'technique', 'resistance'], 'detaille')).toBe('Ton choix. Pour ces accents, l’app propose Grandes lignes.')
  })
  it('garde la phrase de la proposition quand le choix la rejoint', () => {
    expect(phraseNiveau(['endurance', 'technique', 'resistance'], 'grandes_lignes')).toContain('endurance, la résistance ou la technique')
  })
})

describe('seancesAvecNiveauPropre', () => {
  it('compte celles dont le niveau propre diffère du nouveau niveau', () => {
    expect(seancesAvecNiveauPropre([{}, { niveauDetail: 'simple' }, { niveauDetail: 'detaille' }], 'detaille')).toBe(1)
  })
})

describe('lecture du plan', () => {
  const cycle = { debut: '2026-11-30', nbSemaines: 12 } as Cycle
  it('trouve la semaine du jour', () => {
    expect(semaineDuJour(cycle, '2026-11-23')).toBeNull()
    expect(semaineDuJour(cycle, '2026-11-30')).toEqual({ phase: 1, semaine: 1, numero: 1 })
    expect(semaineDuJour(cycle, '2026-12-27')).toEqual({ phase: 1, semaine: 4, numero: 4 })
    expect(semaineDuJour(cycle, '2026-12-28')).toEqual({ phase: 2, semaine: 1, numero: 5 })
    expect(semaineDuJour(cycle, '2027-02-21')).toEqual({ phase: 3, semaine: 4, numero: 12 })
    expect(semaineDuJour(cycle, '2027-02-22')).toBeNull()
  })
  it('met les semaines à plat', () => {
    const { phases } = nouveauCycleVide({ nom: 'a', debut: '2026-11-30', seancesParSemaine: 3, accents: [null, null, null], niveauDetail: 'detaille' }, 'm', id)
    const plat = semainesAPlat(phases as PhaseCycle[])
    expect(plat).toHaveLength(12)
    expect(plat[11]).toMatchObject({ numero: 12, phase: 3, semaine: 4, type: 'allegee' })
  })
  it('borne la charge relative', () => {
    expect(chargeRelative(60, 120)).toBe(0.5)
    expect(chargeRelative(10, 0)).toBe(0)
  })
  it('écrit « Semaine 4, allégée »', () => {
    expect(libelleCaseSemaine(4, 'allegee', false)).toBe('Semaine 4, allégée')
    expect(libelleCaseSemaine(2, 'charge', true)).toBe('Semaine 2, en cours')
  })
  it('montre le cycle le plus récent non abandonné', () => {
    const a = { id: 'a', modifieLe: '2026-11-01' } as Cycle
    const b = { id: 'b', modifieLe: '2026-11-10' } as Cycle
    const c = { id: 'c', modifieLe: '2026-11-20', abandonneLe: '2026-11-21' } as Cycle
    expect(cycleAMontrer([a, b, c])?.id).toBe('b')
    expect(cycleAMontrer([])).toBeUndefined()
  })
})
