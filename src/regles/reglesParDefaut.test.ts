import { describe, expect, it } from 'vitest'
import { BIBLIOTHEQUE } from '../donnees/bibliotheque/index.ts'
import {
  EFFORT_PREVU_PAR_DEFAUT,
  MARQUEURS_NERVEUX,
  MARQUEURS_QUOTA,
  NOMS_QUALITES,
  NOMS_ZONES,
  QUALITES_PHYSIQUES,
  REGLES_PAR_DEFAUT,
} from './reglesParDefaut.ts'

describe('REGLES_PAR_DEFAUT', () => {
  it('reprend les valeurs de la spécification', () => {
    expect(REGLES_PAR_DEFAUT.heuresEntreSeancesMax).toBe(48)
    expect(REGLES_PAR_DEFAUT.poutreIntensiveParSemaine).toBe(2)
    expect(REGLES_PAR_DEFAUT.reposEffortMaxS).toBe(180)
    expect(REGLES_PAR_DEFAUT.dechargeReductionPct).toBe(50)
  })
})

describe('listes de marqueurs et de qualités', () => {
  it('compte cinq qualités physiques', () => {
    expect(QUALITES_PHYSIQUES).toHaveLength(5)
  })

  it('compte la poutre dans les quotas, mais pas dans les marqueurs nerveux', () => {
    expect(MARQUEURS_QUOTA).toContain('poutre')
    expect(MARQUEURS_NERVEUX).not.toContain('poutre')
  })

  it('donne un nom à chaque qualité de la bibliothèque', () => {
    for (const protocole of BIBLIOTHEQUE) {
      expect(NOMS_QUALITES[protocole.qualite], protocole.id).toBeTruthy()
    }
  })

  it('donne un nom à chaque zone de douleur', () => {
    expect(NOMS_ZONES.epaule).toBe('épaule')
    expect(NOMS_ZONES.autre).toBe('autre zone')
  })
})

describe('effort prévu par défaut', () => {
  it('vaut 7 pour une séance dure et 4 pour une séance légère', () => {
    expect(EFFORT_PREVU_PAR_DEFAUT).toEqual({ dure: 7, legere: 4 })
  })
})
