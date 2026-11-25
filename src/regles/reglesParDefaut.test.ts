import { describe, expect, it } from 'vitest'
import { BIBLIOTHEQUE } from '../donnees/bibliotheque/index.ts'
import {
  EFFORT_PREVU_PAR_DEFAUT,
  RESISTANCE_VOIE_PAR_SEMAINE,
  MARQUEURS_NERVEUX,
  MARQUEURS_QUOTA,
  MARQUEURS_RISQUE_DOULEUR,
  NOMS_MARQUEURS,
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

  it('donne un libellé sans underscore à chaque marqueur des quotas et du risque douleur', () => {
    for (const m of [...MARQUEURS_QUOTA, ...MARQUEURS_RISQUE_DOULEUR]) {
      expect(NOMS_MARQUEURS[m], m).toBeTruthy()
      expect(NOMS_MARQUEURS[m], m).not.toContain('_')
    }
    expect(NOMS_MARQUEURS.poutre_intensive).toBe('poutre intensive')
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

describe('plafond de résistance en voie', () => {
  it('vaut 1 pour un profil bloc et 2 pour un profil voie', () => {
    expect(RESISTANCE_VOIE_PAR_SEMAINE).toEqual({ bloc: 1, voie: 2 })
  })
})
