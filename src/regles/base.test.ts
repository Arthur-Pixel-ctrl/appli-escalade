import { describe, expect, it } from 'vitest'
import {
  ajouterJours,
  capPoutreAnciennete,
  chargePrevue,
  chargeSemaine,
  dureeEtape,
  dureeVersion,
  effortPrevu,
  estCongestionnante,
  estDure,
  estMaximale,
  estNerveuse,
  estPoutreIntensive,
  heuresEntre,
  itemsRouges,
  joursEntre,
  lundiDe,
  marqueursDe,
  marqueursSeance,
  marqueursVersion,
  nbDuresMax,
  sansContenuConnu,
  seanceSolliciteDoigts,
  zonesDouloureuses,
} from './base.ts'
import { contexteDeReference, seanceSolo } from './exemples.ts'
import type { SeanceVerif, VersionVerif } from './types.ts'

const ctx = contexteDeReference()
const fiches = ctx.fiches

describe('dates', () => {
  it('joursEntre ne bouge pas au changement d\'heure', () => {
    expect(joursEntre('2026-11-24', '2026-11-26')).toBe(2)
    expect(joursEntre('2026-10-24', '2026-10-26')).toBe(2)
  })
  it('lundiDe', () => {
    expect(lundiDe('2026-11-29')).toBe('2026-11-23')
    expect(lundiDe('2026-11-30')).toBe('2026-11-30')
    expect(lundiDe('2026-10-25')).toBe('2026-10-19')
  })
  it('ajouterJours', () => {
    expect(ajouterJours('2026-11-30', 1)).toBe('2026-12-01')
    expect(ajouterJours('2026-10-24', 2)).toBe('2026-10-26')
    expect(ajouterJours('2026-11-23', -1)).toBe('2026-11-22')
  })
  it('heuresEntre', () => {
    expect(heuresEntre('2026-11-23T08:00:00.000Z', '2026-11-25T08:00:00.000Z')).toBe(48)
  })
})

describe('marqueurs et nature', () => {
  it('marqueursDe : null donne une liste vide', () => {
    expect(marqueursDe({ ...fiches['puissance-bloc-limite'], marqueurs: null })).toEqual([])
    expect(marqueursDe(fiches['puissance-bloc-limite'])).toContain('bloc_limite')
  })
  it('estNerveuse', () => {
    expect(estNerveuse(fiches['puissance-bloc-limite'])).toBe(true)
    expect(estNerveuse(fiches['technique-pieds-silencieux'])).toBe(false)
  })
  it('estCongestionnante', () => {
    const resistance = fiches['resistance-a-la-minute']
    expect(estCongestionnante({ ficheId: resistance.id }, resistance)).toBe(true)
    const endurance = fiches['endurance-continuite-fin-de-seance']
    expect(estCongestionnante({ ficheId: endurance.id }, endurance)).toBe(false)
    expect(estCongestionnante({ ficheId: endurance.id, reglages: { dureeMin: 20 } }, endurance)).toBe(true)
  })
  it('dureeEtape : le réglage prime sur la fiche', () => {
    const f = fiches['endurance-continuite-fin-de-seance']
    expect(dureeEtape({ ficheId: f.id }, f)).toBe(f.dureeMin)
    expect(dureeEtape({ ficheId: f.id, reglages: { dureeMin: 20 } }, f)).toBe(20)
  })
})

describe('marqueurs et dureté d\'une séance', () => {
  it('marqueursVersion : fiches connues et objectifs de groupe, étapes inconnues ignorées', () => {
    const v: VersionVerif = {
      durete: 'dure',
      etapes: [{ ficheId: 'puissance-bloc-limite' }, { ficheId: 'fiche-inventee' }],
      objectifs: [{ libelle: 'x', accents: [], marqueurs: ['pan_gullich'] }],
    }
    expect(marqueursVersion(v, fiches).sort()).toEqual([...marqueursDe(fiches['puissance-bloc-limite']), 'pan_gullich'].sort())
  })

  it('F7 : solo dure sans étape : aucun marqueur, mais dure et pas maximale', () => {
    const s: SeanceVerif = { ...seanceSolo('s', '2026-11-23', []), qualite: 'doigts' }
    s.solo = { durete: 'dure', etapes: [] }
    expect(sansContenuConnu(s.solo, fiches)).toBe(true)
    expect(marqueursVersion(s.solo, fiches)).toEqual([])
    expect(estDure(s, fiches)).toBe(true)
    expect(estMaximale(s, fiches)).toBe(false)
    expect(estPoutreIntensive(s, fiches)).toBe(false)
  })
  it('F7 : solo dure dont toutes les étapes sont inconnues : même résultat', () => {
    const s = seanceSolo('s', '2026-11-23', ['fiche-inventee'], { durete: 'dure' })
    expect(sansContenuConnu(s.solo, fiches)).toBe(true)
    expect(marqueursVersion(s.solo, fiches)).toEqual([])
  })
  it('solo légère sans étape : aucun marqueur', () => {
    const v: VersionVerif = { durete: 'legere', etapes: [] }
    expect(marqueursVersion(v, fiches)).toEqual([])
  })

  it('marqueursSeance : prévue = union des deux versions ; réalisée = marqueurs réels', () => {
    const s = seanceSolo('s', '2026-11-23', ['technique-pieds-silencieux'], {
      groupe: { durete: 'dure', etapes: [], objectifs: [{ libelle: 'g', accents: [], marqueurs: ['bloc_limite'] }] },
    })
    expect(marqueursSeance(s, fiches)).toEqual(['bloc_limite'])
    const faite = { ...s, realisee: { version: 'solo' as const, finLe: '2026-11-23T10:00:00.000Z', dureeMin: 60, effortPercu: 5, marqueurs: [] } }
    expect(marqueursSeance(faite, fiches)).toEqual([])
  })

  it('estDure : vrai aussi pour une séance légère mais maximale', () => {
    const s = seanceSolo('s', '2026-11-23', ['doigts-reglette-minimale-horst'], { durete: 'legere' })
    expect(estMaximale(s, fiches)).toBe(true)
    expect(estDure(s, fiches)).toBe(true)
  })
  it('estPoutreIntensive', () => {
    const s = seanceSolo('s', '2026-11-23', ['doigts-suspensions-max-lestees'])
    expect(estPoutreIntensive(s, fiches)).toBe(marqueursSeance(s, fiches).includes('poutre_intensive'))
  })
})

describe('durée et charge', () => {
  it('dureeVersion : dureeMin prime, sinon somme des étapes connues', () => {
    expect(dureeVersion({ durete: 'legere', etapes: [], dureeMin: 90 }, fiches)).toBe(90)
    const f = fiches['technique-pieds-silencieux']
    const v: VersionVerif = { durete: 'legere', etapes: [{ ficheId: f.id }, { ficheId: f.id }, { ficheId: 'fiche-inventee' }] }
    expect(dureeVersion(v, fiches)).toBe(2 * f.dureeMin)
  })
  it('effortPrevu : 7 pour dure, 4 pour légère, sinon la valeur donnée', () => {
    expect(effortPrevu({ durete: 'dure', etapes: [] })).toBe(7)
    expect(effortPrevu({ durete: 'legere', etapes: [] })).toBe(4)
    expect(effortPrevu({ durete: 'legere', etapes: [], effortPrevu: 9 })).toBe(9)
  })
  it('chargePrevue : solo de 110 min dure = 770 ; la version groupe plus légère ne change rien', () => {
    const solo = seanceSolo('s', '2026-11-23', [], { durete: 'dure', dureeMin: 110 })
    expect(chargePrevue(solo, fiches)).toBe(770)
    const avecGroupe = { ...solo, groupe: { durete: 'dure' as const, etapes: [], dureeMin: 60, effortPrevu: 8 } }
    expect(chargePrevue(avecGroupe, fiches)).toBe(770) // max(770, 480)
  })
  it('chargePrevue : la version groupe peut être la plus lourde', () => {
    const solo = seanceSolo('s', '2026-11-23', [], { durete: 'legere', dureeMin: 60 })
    const s = { ...solo, groupe: { durete: 'dure' as const, etapes: [], dureeMin: 100 } }
    expect(chargePrevue(s, fiches)).toBe(700)
  })
  it('chargePrevue : réalisée = effort perçu × minutes', () => {
    const s = seanceSolo('s', '2026-11-23', [], {
      dureeMin: 110,
      realisee: { version: 'solo', finLe: '2026-11-23T10:00:00.000Z', dureeMin: 80, effortPercu: 6, marqueurs: [] },
    })
    expect(chargePrevue(s, fiches)).toBe(480)
  })
  it('chargeSemaine : du lundi au dimanche seulement', () => {
    const l = (id: string, date: string) => seanceSolo(id, date, [], { durete: 'legere', dureeMin: 10 }) // 40
    const seances = [l('a', '2026-11-22'), l('b', '2026-11-23'), l('c', '2026-11-29'), l('d', '2026-11-30')]
    expect(chargeSemaine('2026-11-23', seances, fiches)).toBe(80)
  })
})

describe('doigts, douleurs, forme', () => {
  it('seanceSolliciteDoigts : étape qui sollicite les doigts', () => {
    expect(seanceSolliciteDoigts(seanceSolo('s', '2026-11-23', ['puissance-bloc-limite']), fiches)).toBe(true)
    expect(seanceSolliciteDoigts(seanceSolo('s', '2026-11-23', ['traction-lestee-force-lattice']), fiches)).toBe(false)
  })
  it('seanceSolliciteDoigts : objectif de groupe', () => {
    const s = seanceSolo('s', '2026-11-23', ['traction-lestee-force-lattice'], {
      groupe: { durete: 'dure', etapes: [], objectifs: [{ libelle: 'g', accents: [], marqueurs: [] }] },
    })
    expect(seanceSolliciteDoigts(s, fiches)).toBe(true)
  })
  it('seanceSolliciteDoigts : qualité mobilite sans fiche → non', () => {
    const s = seanceSolo('s', '2026-11-23', [], { qualite: 'mobilite' })
    expect(seanceSolliciteDoigts(s, fiches)).toBe(false)
    expect(seanceSolliciteDoigts(seanceSolo('s', '2026-11-23', [], { qualite: 'antagonistes' }), fiches)).toBe(false)
  })
  it('seanceSolliciteDoigts : qualité traction_gainage sans fiche → oui (prudence)', () => {
    expect(seanceSolliciteDoigts(seanceSolo('s', '2026-11-23', [], { qualite: 'traction_gainage' }), fiches)).toBe(true)
  })
  it('dureeVersion : solo avec dureeMin 90 et sans étapes → 90', () => {
    const s = seanceSolo('s', '2026-11-23', [], { dureeMin: 90 })
    expect(dureeVersion(s.solo, fiches)).toBe(90)
  })

  it('zonesDouloureuses : profil, douleurs ouvertes, déclarées avant le jour', () => {
    const c = contexteDeReference({
      profil: { ...ctx.profil, douleursEnCours: ['doigts'] },
      douleurs: [
        { date: '2026-11-20', zone: 'coude', niveau: 'reduction', signes: [] },
        { date: '2026-11-20', zone: 'epaule', niveau: 'alerte', signes: [], resolueLe: '2026-11-21' },
        { date: '2026-11-25', zone: 'dos', niveau: 'reduction', signes: [] },
      ],
    })
    expect(zonesDouloureuses(c, '2026-11-23').sort()).toEqual(['coude', 'doigts'])
    expect(zonesDouloureuses(c, '2026-11-20').sort()).toEqual(['coude', 'doigts', 'epaule'])
  })
  it('itemsRouges', () => {
    expect(itemsRouges({ date: '2026-11-23', sommeil: 2, fatigue: 1, courbatures: 3, douleur: 5, peau: 4 })).toBe(2)
  })
})

describe('plafonds', () => {
  it('nbDuresMax', () => {
    expect([2, 3, 4, 5].map(nbDuresMax)).toEqual([2, 3, 3, 3])
  })
  it('capPoutreAnciennete', () => {
    const attendu: [number, number][] = [[0.5, 0], [1, 1], [3.9, 1], [4, 2], [6.5, 2], [7, 3]]
    for (const [annees, cap] of attendu) expect(capPoutreAnciennete(annees)).toBe(cap)
  })
})
