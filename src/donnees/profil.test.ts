import { describe, expect, it } from 'vitest'
import { completerProfil, depuisReponse3, versReponse3, type Reponse3 } from './profil.ts'

describe('Reponse3', () => {
  it('fait l’aller-retour sur les trois valeurs', () => {
    for (const r of ['oui', 'non', 'inconnu'] as Reponse3[]) expect(versReponse3(depuisReponse3(r))).toBe(r)
    for (const v of [true, false, null]) expect(depuisReponse3(versReponse3(v))).toBe(v)
  })
})

describe('prérequis du profil', () => {
  it('un profil vide a les quatre prérequis à null (non rempli, par prudence)', () => {
    const p = completerProfil({})
    expect([p.tractionsStrictes, p.tient15sSur25mm, p.majeur, p.grimpeEnTete]).toEqual([null, null, null, null])
  })
  it('conserve un prérequis déjà renseigné', () => {
    expect(completerProfil({ tractionsStrictes: 0, majeur: false }).tractionsStrictes).toBe(0)
    expect(completerProfil({ majeur: false }).majeur).toBe(false)
  })
})

describe('lieux d’entraînement', () => {
  it('un profil ancien reçoit une liste vide', () => {
    expect(completerProfil({}).lieux).toEqual([])
  })
  it('conserve les lieux déjà choisis', () => {
    expect(completerProfil({ lieux: ['maison'] }).lieux).toEqual(['maison'])
  })
})
