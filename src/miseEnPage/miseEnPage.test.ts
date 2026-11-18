import { describe, expect, it } from 'vitest'
import { estEcranLarge, LARGEUR_BUREAU_PX } from './useEcranLarge.ts'
import { ONGLETS, ongletPourRubrique, RUBRIQUES_BUREAU, rubriquePourOnglet } from './navigation.ts'

describe('estEcranLarge', () => {
  it('bascule au seuil de 1024 px', () => {
    expect(LARGEUR_BUREAU_PX).toBe(1024)
    expect(estEcranLarge(1023)).toBe(false)
    expect(estEcranLarge(1024)).toBe(true)
    expect(estEcranLarge(390)).toBe(false)
  })
})

describe('navigation', () => {
  it('propose les rubriques du bureau, sans « Mes exercices » ni « Assistant »', () => {
    expect([...RUBRIQUES_BUREAU]).toEqual(['Tableau de bord', 'Plan', 'Bibliothèque', 'Bilans', 'Profil'])
  })
  it('garde l’écran courant quand on passe d’une mise en page à l’autre', () => {
    for (const { nom } of ONGLETS) expect(ongletPourRubrique(rubriquePourOnglet(nom))).toBe(nom)
    expect(ongletPourRubrique('Bibliothèque')).toBe('Aujourd’hui')
  })
})

describe('useEcranLarge sans window', () => {
  it('se charge sans erreur', async () => {
    expect(typeof window).toBe('undefined')
    const module = await import('./useEcranLarge.ts')
    expect(typeof module.useEcranLarge).toBe('function')
  })
})
