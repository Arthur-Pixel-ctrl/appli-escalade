import { describe, expect, it } from 'vitest'
import { lignesContexte, lignesPrerequis, phraseLimiteSemaine, phraseReference } from './lignesFiche.ts'
import type { ProfilVerif } from '../../regles/types.ts'

const profil: ProfilVerif = {
  disciplinePrincipale: 'bloc', niveauBloc: '6B', anneesPratique: 4, experiencePoutre: 'occasionnelle', tractionsStrictesMax: 12,
  test15sSur25mm: null, adulte: true, grimpeEnTete: null, seancesParSemaine: 3, lieux: ['salle_bloc'],
}
const AUJOURDHUI = '2026-11-24'

describe('lignesPrerequis', () => {
  it('dit la demande et l’état pour toi, une ligne par prérequis', () => {
    const l = lignesPrerequis({ anneesPratiqueMin: 1, tractionsStrictesMin: 10, experiencePoutreMin: 'reguliere', niveauBlocMin: '7A', adulte: true }, profil, AUJOURDHUI)
    expect(l.map((x) => x.phrase)).toEqual([
      'Années de pratique : 1 an demandé · toi : 4 ans',
      'Expérience de poutre : régulière demandée · toi : occasionnelle',
      'Tractions strictes : 10 demandées · toi : 12',
      'Niveau en bloc : 7A demandé · toi : 6B',
      '18 ans ou plus : demandé · toi : oui',
    ])
    expect(l.map((x) => x.rempli)).toEqual([true, false, true, false, true])
  })
  it('accorde « demandés » au pluriel', () => {
    expect(lignesPrerequis({ anneesPratiqueMin: 2 }, profil, AUJOURDHUI)[0].phrase).toBe('Années de pratique : 2 ans demandés · toi : 4 ans')
  })
  it('une donnée non renseignée compte comme non remplie', () => {
    const [ligne] = lignesPrerequis({ test15sSur25mm: true }, profil, AUJOURDHUI)
    expect(ligne.phrase).toBe('Test 15 s sur 25 mm : à réussir · toi : pas renseigné, compte comme non rempli')
    expect(ligne.rempli).toBe(false)
    const sans = lignesPrerequis({ tractionsStrictesMin: 10, niveauBlocMin: '6A', adulte: true }, { ...profil, tractionsStrictesMax: null, niveauBloc: null, adulte: null }, AUJOURDHUI)
    expect(sans.every((x) => !x.rempli && x.phrase.includes('pas renseigné'))).toBe(true)
  })
  it('un test réussi remplit la ligne ; aucun prérequis, aucune ligne', () => {
    expect(lignesPrerequis({ test15sSur25mm: true }, { ...profil, test15sSur25mm: true }, AUJOURDHUI)[0]).toMatchObject({ rempli: true })
    expect(lignesPrerequis({}, profil, AUJOURDHUI)).toEqual([])
  })
})

describe('lignesContexte et limite', () => {
  it('seul par défaut, puis partenaire et tête', () => {
    expect(lignesContexte(undefined)).toEqual(['Se fait seul'])
    expect(lignesContexte({ groupe: 'adapte', partenaire: true, grimpeEnTete: true })).toHaveLength(3)
  })
  it('limite par semaine', () => {
    expect(phraseLimiteSemaine(2)).toBe('2 fois par semaine au plus')
    expect(phraseLimiteSemaine(1)).toBe('1 fois par semaine au plus')
    expect(phraseLimiteSemaine(undefined)).toMatch(/Pas de limite/)
  })
})

describe('phraseReference', () => {
  it('cite le titre complet et la page, rien d’autre', () => {
    expect(phraseReference({ livre: 'planification', page: '84' })).toBe('Escalade Training : les secrets de la planification (K. Arc, H. Di Domenico, Amphora), p. 84')
    expect(phraseReference({ livre: 'alimentation' })).toBe('Guide de l’alimentation du grimpeur (C. Milenkovic-Messin)')
    expect(phraseReference({ livre: 'autre', titreAutre: 'Mon carnet', page: ' 3 ' })).toBe('Mon carnet, p. 3')
    expect(phraseReference(undefined)).toBeUndefined()
  })
})
