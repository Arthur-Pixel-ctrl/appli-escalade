import { describe, expect, it } from 'vitest'
import { seanceTypeParId } from '../donnees/seancesTypes.ts'
import { fichesDeLaBibliotheque } from './adaptateur.ts'
import { allegerSeance, NOTE_SEMAINE_ALLEGEE } from './allegement.ts'
import { seanceDepuisType } from './passerelles.ts'

const fiches = fichesDeLaBibliotheque()
const base = { id: 's', cycleId: 'c', phaseId: 'p', semaine: 4 as const, date: '2026-12-26', maintenant: '2026-11-24T08:00:00.000Z' }
const seance = (id: string, variante?: string) => seanceDepuisType(seanceTypeParId(id)!, variante, base)
const etape = (s: ReturnType<typeof seance>, refId: string) => s.solo.etapes.find((e) => e.origine?.refId === refId)!

describe('allegerSeance', () => {
  it('ne modifie pas son entrée', () => {
    const s = seance('ST-DOI-02')
    const avant = structuredClone(s)
    allegerSeance(s, 50, 'allegee', fiches)
    expect(s).toEqual(avant)
  })

  it('réduit les minutes de moitié, garde l\'échauffement complet et note le bloc limite', () => {
    const a = allegerSeance(seance('ST-DOI-02'), 50, 'allegee', fiches)
    expect(etape(a, 'puissance-bloc-limite').dureeMin).toBe(20)
    expect(etape(a, 'puissance-bloc-limite').note).toBe(NOTE_SEMAINE_ALLEGEE)
    expect(etape(a, 'echauffement-general').dureeMin).toBe(35)
    expect(etape(a, 'echauffement-general').note).toBeUndefined()
  })

  it('divise les séries d\'un chrono par deux (arrondi au-dessus)', () => {
    const s = seance('ST-DOI-02')
    const chrono = etape(s, 'doigts-reglette-minimale-lopez')
    expect(chrono.forme).toBe('chrono')
    const series = chrono.forme === 'chrono' ? chrono.config.series : 0
    const a = etape(allegerSeance(s, 50, 'allegee', fiches), 'doigts-reglette-minimale-lopez')
    expect(a.forme === 'chrono' && a.config.series).toBe(Math.ceil(series / 2))
  })

  it('l\'affûtage ne pose pas la note de semaine allégée', () => {
    const a = allegerSeance(seance('ST-DOI-02'), 50, 'affutage', fiches)
    expect(etape(a, 'puissance-bloc-limite').note).toBeUndefined()
    expect(etape(a, 'puissance-bloc-limite').dureeMin).toBe(20)
  })

  it('garde dureté, effort prévu et recommandation', () => {
    const s = seance('ST-DOI-02')
    const a = allegerSeance(s, 50, 'allegee', fiches)
    expect(a.solo.durete).toBe(s.solo.durete)
    expect(a.solo.effortPrevu).toBe(s.solo.effortPrevu)
    expect(a.solo.recommandation).toBe(s.solo.recommandation)
  })

  it('allège le mini-bloc et divise blocs et cible des objectifs de groupe', () => {
    const s = seance('ST-DOI-02')
    const a = allegerSeance(s, 50, 'allegee', fiches)
    expect(s.groupe?.objectifs.length).toBeGreaterThan(0)
    s.groupe!.objectifs.forEach((o, i) => {
      expect(a.groupe!.objectifs[i].cible).toBe(Math.ceil(o.cible / 2))
      if (o.blocs !== undefined) expect(a.groupe!.objectifs[i].blocs).toBe(Math.ceil(o.blocs / 2))
    })
    const avant = s.groupe!.miniBloc!.etapes.find((e) => e.origine?.refId === 'doigts-reglette-minimale-lopez')!
    const apres = a.groupe!.miniBloc!.etapes.find((e) => e.origine?.refId === 'doigts-reglette-minimale-lopez')!
    expect(apres.dureeMin).toBeLessThan(avant.dureeMin)
  })

  it('réduit la durée annoncée du groupe et celle des parties', () => {
    const s = seance('ST-DOI-02')
    s.groupe!.dureeMin = 90
    s.solo.parties = [{ titre: 'Effort', dureeMin: 40 }]
    const a = allegerSeance(s, 50, 'allegee', fiches)
    expect(a.groupe!.dureeMin).toBe(45)
    expect(a.solo.parties![0].dureeMin).toBe(20)
  })

  it('une durée ne descend jamais sous 1 minute', () => {
    const a = allegerSeance(seance('ST-DOI-02'), 100, 'allegee', fiches)
    expect(a.solo.etapes.filter((e) => e.origine?.refId !== 'echauffement-general').every((e) => e.dureeMin >= 1)).toBe(true)
  })
})
