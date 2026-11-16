import { describe, expect, it } from 'vitest'
import type { SeanceRealisee } from './base.ts'
import { chargeSeance, chiffresBlocs, lundiDe, parCouleur, precedente, resume, seancesDeLaSemaine } from './debrief.ts'

const seance = (plus: Partial<SeanceRealisee>): SeanceRealisee => ({
  id: 'a', creeLe: '2026-11-16T19:00:00.000Z', modifieLe: '2026-11-16T19:00:00.000Z', date: '2026-11-16',
  mode: 'groupe', nom: 'Test', durete: 'dure', dureeMin: 95, effortPercu: 7, peau: 2, douleur: false,
  etapes: [], objectifs: [], blocs: [], ...plus,
})

const BLOCS: SeanceRealisee['blocs'] = [
  { couleur: 'Rouge', essais: 3, resultat: 'enchaine', objectif: 0 },
  { couleur: 'Rouge', essais: 5, resultat: 'non_enchaine', objectif: 0 },
  { couleur: 'Violet', essais: 1, resultat: 'flash', objectif: 1 },
  { couleur: 'Violet', essais: 1, resultat: 'flash', objectif: 1 },
]

describe('débrief', () => {
  it('calcule la charge : effort × minutes', () => {
    expect(chargeSeance({ effortPercu: 7, dureeMin: 95 })).toBe(665)
  })

  it('trouve le lundi de la semaine, y compris pour un dimanche', () => {
    expect(lundiDe('2026-11-16')).toBe('2026-11-16') // un lundi
    expect(lundiDe('2026-11-19')).toBe('2026-11-16')
    expect(lundiDe('2026-11-22')).toBe('2026-11-16') // dimanche
    expect(lundiDe('2026-11-23')).toBe('2026-11-23')
    expect(lundiDe('2026-12-02')).toBe('2026-11-30') // changement de mois
  })

  it('compte les blocs : un flash est aussi un bloc enchaîné', () => {
    expect(chiffresBlocs({ blocs: BLOCS })).toEqual({ tentes: 4, enchaines: 3, flashs: 2, essais: 10 })
  })

  it('regroupe par couleur, la plus dure en premier', () => {
    const ordre = ['Jaune', 'Vert', 'Bleu', 'Violet', 'Rouge', 'Noir']
    expect(parCouleur({ blocs: BLOCS }, ordre)).toEqual([
      { couleur: 'Rouge', tentes: 2, flashs: 0, enchaines: 1 },
      { couleur: 'Violet', tentes: 2, flashs: 2, enchaines: 2 },
    ])
  })

  it('ne garde que les séances de la même semaine', () => {
    const s = seance({ id: 'x', date: '2026-11-18' })
    const toutes = [s, seance({ id: 'y', date: '2026-11-16' }), seance({ id: 'z', date: '2026-11-15' })]
    expect(seancesDeLaSemaine(s, toutes).map((x) => x.id)).toEqual(['x', 'y'])
  })

  it('retrouve la séance précédente du même mode', () => {
    const s = seance({ id: 'x', creeLe: '2026-11-18T19:00:00.000Z' })
    const toutes = [
      s,
      seance({ id: 'ancienne', creeLe: '2026-11-10T19:00:00.000Z' }),
      seance({ id: 'recente', creeLe: '2026-11-16T19:00:00.000Z' }),
      seance({ id: 'solo', mode: 'solo', creeLe: '2026-11-17T19:00:00.000Z' }),
    ]
    expect(precedente(s, toutes)?.id).toBe('recente')
    expect(precedente(seance({ id: 'seule' }), [])).toBeUndefined()
  })

  it('résume la séance en une phrase', () => {
    expect(resume(seance({ objectifs: [{ libelle: 'a', cible: 5, fait: 5 }, { libelle: 'b', cible: 3, fait: 3 }] }))).toBe('Tes 2 objectifs sont atteints.')
    expect(resume(seance({ objectifs: [{ libelle: 'a', cible: 5, fait: 5 }, { libelle: 'b', cible: 3, fait: 1 }] }))).toBe('1 objectif atteint sur 2.')
    expect(resume(seance({ mode: 'solo', etapes: [{ titre: 'a', statut: 'faite' }, { titre: 'b', statut: 'passee' }] }))).toBe('1 étape faite sur 2.')
  })
})
