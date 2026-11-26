import { describe, expect, it } from 'vitest'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES, EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import { joursDeLaSemaineOuverte, mentionSemaine } from './Programme.outils.ts'

describe('semaine ouverte', () => {
  const seances = [EXEMPLE_SEANCE_PLANIFIEE, { ...EXEMPLE_SEANCE_PLANIFIEE, id: 'jeu', date: '2026-11-19' }]
  it('7 jours à partir du lundi, les séances rangées par date avec leur statut', () => {
    const jours = joursDeLaSemaineOuverte(EXEMPLE_CYCLE, EXEMPLE_PHASES, seances, [], 1, '2026-11-18')
    expect(jours.map((j) => j.date)).toEqual(['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'])
    expect(jours[1].lignes.map((l) => l.statut)).toEqual(['manquee'])
    expect(jours[3].lignes.map((l) => l.statut)).toEqual(['a_venir'])
    expect(jours[0].lignes).toEqual([])
  })
  it('la mention dit la phase, l’accent et la semaine allégée', () => {
    expect(mentionSemaine(EXEMPLE_PHASES, 2)).toBe('Phase 1 · doigts')
    expect(mentionSemaine(EXEMPLE_PHASES, 4)).toBe('Phase 1 · doigts · semaine allégée')
    expect(mentionSemaine(EXEMPLE_PHASES, 5)).toBe('Phase 2 · puissance')
  })
})
