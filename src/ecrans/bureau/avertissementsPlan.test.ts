import { describe, expect, it } from 'vitest'
import { PROFIL_VIDE } from '../../donnees/profil.ts'
import { seanceTypeParId } from '../../donnees/seancesTypes.ts'
import { seanceDepuisType, type Avertissement } from '../../regles/index.ts'
import { nouveauCycleVide } from './Plan.outils.ts'
import { nouvelleSeanceVide } from './VuePhase.outils.ts'
import {
  avecGarde, calculerAvertissements, compter, decalerAuLendemain, entreesDesSeances, nombreDuRepere, peutDecaler, phraseCompte, ranger, scinderMessage,
} from './avertissementsPlan.ts'

let n = 0
const { cycle, phases } = nouveauCycleVide(
  { nom: 'Hiver', debut: '2026-11-30', seancesParSemaine: 3, accents: ['doigts', null, null], niveauDetail: 'detaille' }, 'm', () => `id-${++n}`)
const phase = phases[0]
const base = (id: string, semaine: 1 | 2 | 3 | 4, date: string) => ({ id, cycleId: cycle.id, phaseId: phase.id, semaine, date, maintenant: 'm' })
const maximale = (id: string, date: string, semaine: 1 | 2 | 3 | 4 = 1) => seanceDepuisType(seanceTypeParId('ST-DOI-02')!, undefined, base(id, semaine, date))

function verifier(seances: ReturnType<typeof maximale>[], gardes: string[] = []) {
  const brut = calculerAvertissements({
    cycle, phases, seances, objectifs: [], profil: PROFIL_VIDE, exercicesPerso: [], douleurs: [], formes: [], realisees: [],
    aujourdhui: '2026-11-30', maintenant: '2026-11-30T08:00:00.000Z',
  })
  return { brut, plan: ranger(brut, gardes, { cycle, phases, seances }) }
}

describe('deux séances maximales à 24 h (W-01)', () => {
  const lundi = maximale('a', '2026-11-30')
  const mardi = maximale('b', '2026-12-01')
  it('vise la séance du mardi et lie celle du lundi', () => {
    const { plan } = verifier([lundi, mardi])
    const w01 = plan.entrees.find((e) => e.avertissement.code === 'W-01')
    expect(w01).toMatchObject({ seanceId: 'b', seanceLieeId: 'a', forme: 'avertissement', semaine: 1, phaseOrdre: 1, garde: false })
    expect(entreesDesSeances(plan, ['a', 'b'])).toContain(w01)
    expect(plan.parSemaine.get(1)).toContain(w01)
  })
  it('la correction décale au lendemain et W-01 disparaît', () => {
    const { plan } = verifier([lundi, mardi])
    const w01 = plan.entrees.find((e) => e.avertissement.code === 'W-01')!
    expect(peutDecaler(w01, cycle, phases, [lundi, mardi])).toBe(true)
    const decalee = decalerAuLendemain(mardi, cycle, phases)!
    expect(decalee.date).toBe('2026-12-02')
    expect(verifier([lundi, decalee]).brut.some((a) => a.code === 'W-01')).toBe(false)
  })
  it('« Je garde ce choix » replie l’avertissement mais il reste compté', () => {
    const { plan: avant } = verifier([lundi, mardi])
    const w01 = avant.entrees.find((e) => e.avertissement.code === 'W-01')!
    const { plan } = verifier([lundi, mardi], avecGarde([], w01.cle, true))
    const garde = plan.entrees.find((e) => e.avertissement.code === 'W-01')!
    expect(garde.garde).toBe(true)
    expect(compter(plan.parSemaine.get(1)!).gardes).toBe(1)
    expect(compter(plan.parSemaine.get(1)!).total).toBe(compter(avant.parSemaine.get(1)!).total)
    expect(nombreDuRepere(plan.parSemaine.get(1)!)).toBe(nombreDuRepere(avant.parSemaine.get(1)!))
  })
})

describe('décision F7 : séance dure sans exercice connu', () => {
  it('donne S-26 seul, sans avertissement des 48 h', () => {
    const a = maximale('a', '2026-11-30')
    const dure = { ...nouvelleSeanceVide(cycle, phase, 1, 1, 'm', 'b'), qualite: 'traction_gainage' as const, solo: { nom: 'Dure vide', durete: 'dure' as const, etapes: [] } }
    const { brut } = verifier([a, dure])
    expect(brut.filter((x) => x.seanceId === 'b').map((x) => x.code)).toContain('S-26')
    expect(brut.some((x) => x.code === 'W-01')).toBe(false)
  })
})

describe('décalage', () => {
  it('un dimanche passe au lundi suivant, dans la bonne semaine', () => {
    const dimanche = maximale('d', '2026-12-06')
    expect(decalerAuLendemain(dimanche, cycle, phases)).toMatchObject({ date: '2026-12-07', semaine: 2, phaseId: phase.id })
  })
  it('hors du cycle, rien n’est proposé', () => {
    const fin = maximale('f', '2027-02-21', 4)
    expect(decalerAuLendemain({ ...fin, phaseId: phases[2].id }, cycle, phases)).toBeNull()
  })
})

describe('rangement et textes', () => {
  const arret: Avertissement = { code: 'S-04', niveau: 'fort', message: 'Douleur au doigt.', portee: 'seance', seanceId: 'a', source: 'x' }
  it('un signal d’arrêt n’est jamais replié, même gardé', () => {
    const a = maximale('a', '2026-11-30')
    const { entrees } = ranger([arret], ['S-04|a||||'], { cycle, phases, seances: [a] })
    expect(entrees[0]).toMatchObject({ forme: 'arret', garde: false })
  })
  it('un avertissement de plan sans phase ni semaine va dans « duPlan »', () => {
    const plan = ranger([{ code: 'P-01', niveau: 'fort', message: 'm', portee: 'plan', source: 's' }], [], { cycle, phases, seances: [] })
    expect(plan.duPlan).toHaveLength(1)
  })
  it('avecGarde ajoute et retire sans doublon', () => {
    expect(avecGarde(['x'], 'y', true)).toEqual(['x', 'y'])
    expect(avecGarde(['x', 'y'], 'y', true)).toEqual(['x', 'y'])
    expect(avecGarde(['x', 'y'], 'y', false)).toEqual(['x'])
  })
  it('phrase de compte', () => {
    expect(phraseCompte({ total: 0, arrets: 0, avertissements: 0, informations: 0, gardes: 0 })).toBe('Aucun avertissement')
    expect(phraseCompte({ total: 3, arrets: 1, avertissements: 2, informations: 0, gardes: 1 })).toBe('1 signal d’arrêt, 2 avertissements dont 1 gardé')
  })
  it('scinde le message à la première phrase', () => {
    expect(scinderMessage('Deux séances. Décale-la d’un jour.')).toEqual({ titre: 'Deux séances.', suite: 'Décale-la d’un jour.' })
    expect(scinderMessage('Une seule phrase.')).toEqual({ titre: 'Une seule phrase.', suite: '' })
  })
})
