import { describe, expect, it } from 'vitest'
import { hashAvecRubrique, rubriqueDepuisAdresse } from './rubriqueAdresse.ts'

describe('rubriqueDepuisAdresse', () => {
  it('retrouve la rubrique, accents et espaces compris', () => {
    expect(rubriqueDepuisAdresse(hashAvecRubrique('', 'Bibliothèque'))).toBe('Bibliothèque')
    expect(rubriqueDepuisAdresse(hashAvecRubrique('', 'Tableau de bord'))).toBe('Tableau de bord')
  })
  it('ignore une adresse vide ou une rubrique inconnue', () => {
    expect(rubriqueDepuisAdresse('')).toBeNull()
    expect(rubriqueDepuisAdresse('#rubrique=Nimporte')).toBeNull()
    expect(rubriqueDepuisAdresse('#autre=1')).toBeNull()
  })
})

describe('hashAvecRubrique', () => {
  it('garde les autres paramètres et remplace l’ancienne rubrique', () => {
    expect(rubriqueDepuisAdresse(hashAvecRubrique('#x=1&rubrique=Plan', 'Profil'))).toBe('Profil')
    expect(hashAvecRubrique('#x=1&rubrique=Plan', 'Profil')).toContain('x=1')
  })
})
