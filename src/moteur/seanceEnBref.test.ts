import { describe, expect, it } from 'vitest'
import {
  demarrerChrono, dureeMinutes, etapesRealisees, marquerPartie, mettreEnPauseChrono, ouvrirSeanceEnBref,
  reprendreChrono, tempsEcouleS,
} from './seanceEnBref.ts'

const MIN = 60000

describe('chrono libre', () => {
  it('démarré à 1 s, pause à 61 s, reprise à 121 s, lu à 181 s : 120 s, 2 min', () => {
    let e = ouvrirSeanceEnBref([{ titre: 'Séance' }], 0)
    e = demarrerChrono(e, 1000)
    e = mettreEnPauseChrono(e, 61000)
    e = reprendreChrono(e, 121000)
    expect(tempsEcouleS(e, 181000)).toBe(120)
    expect(dureeMinutes(e, 181000)).toBe(2)
  })
  it('en pause, le temps ne bouge plus', () => {
    let e = demarrerChrono(ouvrirSeanceEnBref([{ titre: 'Séance' }], 0), 0)
    e = mettreEnPauseChrono(e, 30000)
    expect(tempsEcouleS(e, 500000)).toBe(30)
  })
  it('jamais démarré : la durée est le temps depuis l’ouverture', () => {
    const e = ouvrirSeanceEnBref([{ titre: 'Séance' }], 0)
    expect(tempsEcouleS(e, 30 * MIN)).toBe(0)
    expect(dureeMinutes(e, 30 * MIN)).toBe(30)
  })
})

describe('parties', () => {
  it('une partie faite : une entrée', () => {
    const e = marquerPartie(ouvrirSeanceEnBref([{ titre: 'Séance', refId: 'traction-simple-4x5' }], 0), 0, 'faite')
    expect(etapesRealisees(e)).toEqual([{ titre: 'Séance', statut: 'faite', refId: 'traction-simple-4x5' }])
  })
  it('trois parties : faite, passée, à faire, dans l’ordre, refId gardé', () => {
    let e = ouvrirSeanceEnBref([{ titre: 'A', refId: 'a' }, { titre: 'B' }, { titre: 'C', refId: 'c' }], 0)
    e = marquerPartie(marquerPartie(e, 0, 'faite'), 1, 'passee')
    expect(etapesRealisees(e)).toEqual([
      { titre: 'A', statut: 'faite', refId: 'a' }, { titre: 'B', statut: 'passee' }, { titre: 'C', statut: 'a_faire', refId: 'c' },
    ])
  })
  it('une partie déjà faite peut être corrigée', () => {
    let e = marquerPartie(ouvrirSeanceEnBref([{ titre: 'A' }], 0), 0, 'faite')
    e = marquerPartie(e, 0, 'passee')
    expect(e.parties[0].statut).toBe('passee')
  })
})
