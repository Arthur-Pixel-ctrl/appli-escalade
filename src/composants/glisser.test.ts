import { describe, expect, it } from 'vitest'
import type { SeancePlanifiee } from '../donnees/modele.ts'
import type { EtapeSeance } from '../moteur/types.ts'
import { aDepasseLeSeuil, defilementAuBord, deplacerElement, idZone, lireZone, reordonnerEtapes } from './glisser.ts'

const etape = (id: string) => ({ id, titre: id }) as unknown as EtapeSeance
const seance = (ids: string[], mini?: string[]) => ({
  id: 's1',
  solo: { nom: 'Test', etapes: ids.map(etape) },
  groupe: mini ? { nom: 'G', miniBloc: { moment: 'avant', etapes: mini.map(etape) }, objectifs: [] } : null,
}) as unknown as SeancePlanifiee

describe('deplacerElement', () => {
  it('descend un élément de plusieurs places', () => expect(deplacerElement(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']))
  it('monte un élément de plusieurs places', () => expect(deplacerElement(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']))
  it('ne touche à rien si la place ne change pas ou sort de la liste', () => {
    const l = ['a', 'b']
    expect(deplacerElement(l, 1, 1)).toBe(l)
    expect(deplacerElement(l, 0, 5)).toBe(l)
    expect(deplacerElement(l, -1, 0)).toBe(l)
  })
  it('ne modifie pas la liste d’origine', () => {
    const l = ['a', 'b', 'c']
    deplacerElement(l, 0, 2)
    expect(l).toEqual(['a', 'b', 'c'])
  })
})

describe('reordonnerEtapes', () => {
  it('réordonne la version solo', () => {
    expect(reordonnerEtapes(seance(['a', 'b', 'c']), 'solo', 2, 0).solo.etapes.map((e) => e.id)).toEqual(['c', 'a', 'b'])
  })
  it('réordonne le mini-bloc du groupe sans toucher au solo', () => {
    const r = reordonnerEtapes(seance(['a', 'b'], ['x', 'y']), 'minibloc', 0, 1)
    expect(r.groupe?.miniBloc?.etapes.map((e) => e.id)).toEqual(['y', 'x'])
    expect(r.solo.etapes.map((e) => e.id)).toEqual(['a', 'b'])
  })
  it('rend la séance telle quelle s’il n’y a pas de mini-bloc', () => {
    const s = seance(['a'])
    expect(reordonnerEtapes(s, 'minibloc', 0, 1)).toBe(s)
  })
})

describe('zones et seuils', () => {
  it('écrit et relit un identifiant de zone', () => {
    expect(idZone('etape', 's1', 'solo', 2)).toBe('etape:s1:solo:2')
    expect(lireZone('etape:s1:solo:2')).toEqual({ type: 'etape', parties: ['s1', 'solo', '2'] })
  })
  it('ne démarre le glisser qu’après quelques pixels', () => {
    expect(aDepasseLeSeuil(2, 2)).toBe(false)
    expect(aDepasseLeSeuil(6, 0)).toBe(true)
  })
  it('défile près des bords seulement', () => {
    expect(defilementAuBord(10, 800)).toBeLessThan(0)
    expect(defilementAuBord(400, 800)).toBe(0)
    expect(defilementAuBord(790, 800)).toBeGreaterThan(0)
  })
})
