import { describe, expect, it } from 'vitest'
import { BIBLIOTHEQUE } from '../donnees/bibliotheque/index.ts'
import { FICHES_SANS_DOIGTS, fichesDeLaBibliotheque, ficheDepuisProtocole, solliciteDoigtsPerso } from './adaptateur.ts'
import { contexteDeReference, seanceSolo } from './exemples.ts'

const fiches = fichesDeLaBibliotheque()

describe('fichesDeLaBibliotheque', () => {
  it('une fiche par protocole, toutes de la bibliothèque', () => {
    expect(Object.keys(fiches)).toHaveLength(BIBLIOTHEQUE.length)
    expect(Object.values(fiches).every((f) => f.origine === 'bibliotheque')).toBe(true)
  })
  it('les identifiants de FICHES_SANS_DOIGTS existent tous', () => {
    for (const id of FICHES_SANS_DOIGTS) expect(fiches[id], id).toBeDefined()
  })
  it('reprend marqueurs, prérequis et estTest du protocole', () => {
    const p = BIBLIOTHEQUE[0]
    const f = ficheDepuisProtocole(p)
    expect(f.marqueurs).toEqual(p.marqueurs)
    expect(f.prerequis).toEqual(p.prerequis)
    expect(fiches['puissance-bloc-limite'].estTest).toBeUndefined()
    const test = BIBLIOTHEQUE.find((q) => q.estTest)
    if (test) expect(fiches[test.id].estTest).toBe(true)
  })
})

describe('reposEntreEffortsS', () => {
  it('suit la forme et le gabarit du protocole', () => {
    expect(fiches['doigts-suspensions-max-lestees'].reposEntreEffortsS).toBe(180)
    expect(fiches['doigts-7-53-horst'].reposEntreEffortsS).toBe(53)
    expect(fiches['doigts-reglette-minimale-horst'].reposEntreEffortsS).toBe(180)
    expect(fiches['puissance-bloc-limite'].reposEntreEffortsS).toBe(240)
    expect(fiches['doigts-echelles-3-6-9'].reposEntreEffortsS).toBeUndefined()
  })
})

describe('solliciteDoigts', () => {
  it('liste des fiches sans doigts, antagonistes et mobilité', () => {
    expect(fiches['traction-lestee-force-lattice'].solliciteDoigts).toBe(false)
    expect(fiches['antagonistes-lattice'].solliciteDoigts).toBe(false)
    expect(fiches['puissance-bloc-limite'].solliciteDoigts).toBe(true)
    expect(fiches['doigts-abrahangs'].solliciteDoigts).toBe(true)
  })
  it('toute fiche de qualité mobilité ou antagonistes ne sollicite pas les doigts', () => {
    for (const f of Object.values(fiches)) {
      if (f.qualite === 'mobilite' || f.qualite === 'antagonistes') expect(f.solliciteDoigts, f.id).toBe(false)
    }
  })
  it('exercice perso : selon le terrain', () => {
    expect(solliciteDoigtsPerso('poutre')).toBe(true)
    expect(solliciteDoigtsPerso('bloc')).toBe(true)
    expect(solliciteDoigtsPerso('sol')).toBe(false)
    expect(solliciteDoigtsPerso(undefined)).toBe(false)
  })
})

describe('exemples', () => {
  it('contexteDeReference et seanceSolo', () => {
    const c = contexteDeReference()
    expect(c.aujourdhui).toBe('2026-11-23')
    expect(c.profil.lieux).toEqual(['salle_bloc'])
    expect(contexteDeReference({ aujourdhui: '2026-12-01' }).aujourdhui).toBe('2026-12-01')
    const s = seanceSolo('s', '2026-11-23', ['echauffement-dynamique-vagy', 'puissance-bloc-limite'])
    expect(s.qualite).toBe('puissance')
    expect(s.solo.durete).toBe('dure')
    expect(seanceSolo('t', '2026-11-23', ['technique-pieds-silencieux']).solo.durete).toBe('legere')
  })
})
