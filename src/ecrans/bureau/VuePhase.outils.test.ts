import { describe, expect, it } from 'vitest'
import { nouveauCycleVide } from './Plan.outils.ts'
import {
  copierSurCase, dateDeLaCase, deplacerSurCase, formatDuree, ligneContenu, nouvelleSeanceVide, premiereCaseLibre, recopierSemaine1, seancesDeLaCase,
} from './VuePhase.outils.ts'

let n = 0
const id = () => `id-${++n}`
const { cycle, phases } = nouveauCycleVide(
  { nom: 'Hiver', debut: '2026-11-30', seancesParSemaine: 3, accents: [null, null, null], niveauDetail: 'detaille' }, 'm', id)
const phase = phases[1] // début le 28 décembre

describe('cases', () => {
  it('calcule la date d\'une case', () => {
    expect(dateDeLaCase(cycle, phases[0], 1, 0)).toBe('2026-11-30')
    expect(dateDeLaCase(cycle, phases[0], 2, 3)).toBe('2026-12-10')
    expect(dateDeLaCase(cycle, phase, 1, 0)).toBe('2026-12-28')
  })
  it('crée une séance vide prudente', () => {
    const s = nouvelleSeanceVide(cycle, phase, 2, 1, 'm', 'a')
    expect(s).toMatchObject({ qualite: 'technique', groupe: null, semaine: 2, date: '2027-01-05' })
    expect(s.solo).toEqual({ nom: 'Nouvelle séance', durete: 'legere', etapes: [] })
  })
  it('trouve la première case libre', () => {
    const a = nouvelleSeanceVide(cycle, phase, 1, 0, 'm', 'a')
    expect(premiereCaseLibre([], phase, cycle)).toEqual({ semaine: 1, jour: 0 })
    expect(premiereCaseLibre([a], phase, cycle)).toEqual({ semaine: 1, jour: 1 })
    expect(seancesDeLaCase([a], phase, cycle, 1, 0)).toHaveLength(1)
  })
})

describe('copie, déplacement, recopie', () => {
  it('copie identique : nouvel id, date décalée, pas de « sautée »', () => {
    const a = { ...nouvelleSeanceVide(cycle, phase, 1, 0, 'm', 'a'), sauteeLe: 'x' }
    const c = copierSurCase(a, cycle, phase, 3, 2, 'm2', 'b')
    expect(c).toMatchObject({ id: 'b', semaine: 3, date: '2027-01-13' })
    expect(c.sauteeLe).toBeUndefined()
    expect(c.solo).toEqual(a.solo)
    expect(c.solo).not.toBe(a.solo)
  })
  it('déplace sans changer l\'identifiant', () => {
    const a = nouvelleSeanceVide(cycle, phase, 1, 0, 'm', 'a')
    expect(deplacerSurCase(a, cycle, phase, 4, 6)).toMatchObject({ id: 'a', semaine: 4, date: '2027-01-24' })
  })
  it('recopie la semaine 1 sur 2 et 3 sans écraser', () => {
    const s1 = nouvelleSeanceVide(cycle, phase, 1, 0, 'm', 'a')
    const s2 = nouvelleSeanceVide(cycle, phase, 1, 3, 'm', 'b')
    const dejaLa = nouvelleSeanceVide(cycle, phase, 2, 0, 'm', 'c')
    const { nouvelles, ignorees } = recopierSemaine1([s1, s2, dejaLa], phase, cycle, 'm', id)
    expect(nouvelles).toHaveLength(3)
    expect(ignorees).toBe(1)
    expect(nouvelles.map((x) => x.semaine).sort()).toEqual([2, 3, 3])
  })
})

describe('affichage', () => {
  it('formate les durées', () => {
    expect(formatDuree(0)).toBeNull()
    expect(formatDuree(45)).toBe('45 min')
    expect(formatDuree(90)).toBe('1 h 30')
    expect(formatDuree(120)).toBe('2 h')
  })
  it('suit le niveau affiché sans rien effacer', () => {
    const s = nouvelleSeanceVide(cycle, phase, 1, 0, 'm', 'a')
    expect(ligneContenu(s, { niveauDetail: 'detaille' })).toBe('Pas encore de contenu') // sans étapes : niveau simple
    const avecParties = { ...s, solo: { ...s.solo, parties: [{ titre: 'A', dureeMin: 20 }, { titre: 'B', dureeMin: 20 }] } }
    expect(ligneContenu(avecParties, { niveauDetail: 'detaille' })).toBe('2 parties')
    expect(ligneContenu({ ...s, solo: { ...s.solo, recommandation: 'Grimpe cool' } }, { niveauDetail: 'simple' })).toBe('Grimpe cool')
  })
})
