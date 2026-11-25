import { describe, expect, it } from 'vitest'
import type { Avertissement } from '../../regles/types.ts'
import { accentsPreselectionnes, phraseBandeauPlanPropose, rappelJours, rappelLieux } from './NouveauCycle.outils.ts'

const avertissement = (niveau: 'fort' | 'information'): Avertissement =>
  ({ code: 'W-01', niveau, message: 'm', portee: 'plan', source: 's' })

describe('accentsPreselectionnes', () => {
  it('suit accentsDeDepart', () => {
    expect(accentsPreselectionnes({ anneesPratique: 0.5, disciplinePrincipale: 'bloc' })).toEqual(['traction_gainage', 'endurance', 'puissance'])
    expect(accentsPreselectionnes({ anneesPratique: 3, disciplinePrincipale: 'voie' })).toEqual(['doigts', 'endurance', 'resistance'])
    expect(accentsPreselectionnes({ anneesPratique: 3, disciplinePrincipale: 'bloc' })).toEqual(['doigts', 'puissance', 'resistance'])
  })
  it('sans profil : départ de débutant', () => {
    expect(accentsPreselectionnes(null)).toEqual(['traction_gainage', 'endurance', 'puissance'])
  })
})

describe('rappels du profil', () => {
  it('range les jours dans l’ordre de la semaine', () => {
    expect(rappelJours(['samedi', 'mardi'])).toBe('Jours disponibles : mardi, samedi.')
  })
  it('dit quand rien n’est renseigné', () => {
    expect(rappelJours([])).toContain('pas renseignés')
    expect(rappelLieux([])).toContain('salle de bloc')
    expect(rappelLieux(['maison', 'salle_voie'])).toBe('Lieux : maison, salle avec des voies.')
  })
})

describe('phraseBandeauPlanPropose', () => {
  it('compte séances, avertissements forts et informations', () => {
    const phrase = phraseBandeauPlanPropose({
      seances: new Array(36).fill(null) as never,
      avertissements: [avertissement('fort'), avertissement('information'), avertissement('information')],
    })
    expect(phrase).toBe('Plan proposé : 36 séances. 1 avertissement fort, 2 informations, à voir semaine par semaine.')
  })
  it('accepte zéro', () => {
    expect(phraseBandeauPlanPropose({ seances: [], avertissements: [] }))
      .toBe('Plan proposé : 0 séance. 0 avertissement fort, 0 information, à voir semaine par semaine.')
  })
})
