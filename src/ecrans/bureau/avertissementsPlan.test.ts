import { describe, expect, it } from 'vitest'
import type { SeanceRealisee } from '../../donnees/modele.ts'
import { PROFIL_VIDE } from '../../donnees/profil.ts'
import { seanceTypeParId } from '../../donnees/seancesTypes.ts'
import { seanceDepuisType, type Avertissement } from '../../regles/index.ts'
import { nouveauCycleVide } from './Plan.outils.ts'
import { nouvelleSeanceVide } from './VuePhase.outils.ts'
import type { EntreeAvertissement } from './avertissementsPlan.ts'
import {
  arretsEnPremier, avecGarde, calculerAvertissements, formeDuRepere, compter, decalerAuLendemain, entreesDesSeances, nombreDuRepere, peutDecaler, phraseCompte, ranger, scinderMessage,
  enumerer, nomDuJour, nonRenseignesDe, phraseProfilIncomplet, regrouperS03, joursDuGroupe,
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

describe('séance liée de W-01 : les trois cas de l\'audit (M-2, consolidation 25/11)', () => {
  /** Comme `verifier`, avec des séances réalisées. */
  function verifierAvec(seances: ReturnType<typeof maximale>[], realisees: SeanceRealisee[] = []) {
    const brut = calculerAvertissements({
      cycle, phases, seances, objectifs: [], profil: PROFIL_VIDE, exercicesPerso: [], douleurs: [], formes: [], realisees,
      aujourdhui: '2026-11-30', maintenant: '2026-11-30T08:00:00.000Z',
    })
    return ranger(brut, [], { cycle, phases, seances })
  }
  const nommee = (s: ReturnType<typeof maximale>, nom: string) => ({ ...s, solo: { ...s.solo, nom } })
  const legere = (s: ReturnType<typeof maximale>, nom: string) => ({ ...s, solo: { ...s.solo, nom, etapes: [], durete: 'legere' as const } })
  const w01De = (plan: ReturnType<typeof verifierAvec>) => plan.entrees.find((e) => e.avertissement.code === 'W-01')

  it('cas 1 : une séance légère homonyme le jour de la seconde : lien vers la bonne séance', () => {
    const a = nommee(maximale('a', '2026-11-30'), 'Poutre')
    const b = nommee(maximale('b', '2026-12-01'), 'Bloc')
    const c = legere(maximale('c', '2026-12-01'), 'Poutre')
    const plan = verifierAvec([a, b, c])
    expect(w01De(plan)).toMatchObject({ seanceId: 'b', seanceLieeId: 'a' })
    expect(plan.lieesParSeance.get('a')).toContain(w01De(plan))
    expect(plan.lieesParSeance.has('c')).toBe(false)
  })
  it('cas 2 : un nom avec « » et ( ) : lien vers la bonne séance', () => {
    const a = nommee(maximale('a', '2026-11-30'), 'Bloc « dur » (salle)')
    const b = nommee(maximale('b', '2026-12-01'), 'Bloc')
    expect(w01De(verifierAvec([a, b]))).toMatchObject({ seanceId: 'b', seanceLieeId: 'a' })
  })
  it('cas 3 : séance d\'avant faite hors plan : aucun lien, même avec une vieille séance du même nom', () => {
    const vieille = legere(maximale('vieille', '2026-11-02'), 'Grimpe libre')
    const b = nommee(maximale('b', '2026-12-01'), 'Bloc')
    const horsPlan = {
      id: 'libre', versionFormat: 1, creeLe: '2026-11-30T19:00:00.000Z', modifieLe: '2026-11-30T19:00:00.000Z', date: '2026-11-30',
      mode: 'libre', nom: 'Grimpe libre', durete: 'dure', dureeMin: 60, effortPercu: 8, peau: 3, douleur: false,
      etapes: [], objectifs: [], blocs: [], marqueurs: ['maximale'],
    } as SeanceRealisee
    const plan = verifierAvec([vieille, b], [horsPlan])
    const w01 = w01De(plan)
    expect(w01).toMatchObject({ seanceId: 'b' })
    expect(w01).not.toHaveProperty('seanceLieeId')
    expect(plan.lieesParSeance.size).toBe(0)
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

describe('signaux d’arrêt : toujours devant, repère « arrêt »', () => {
  const entree = (cle: string, forme: EntreeAvertissement['forme']) =>
    ({ cle, forme, garde: false, semaine: 1, phaseOrdre: 1, avertissement: { code: 'X', message: cle } }) as unknown as EntreeAvertissement

  it('un arrêt passe devant trois avertissements forts, sans changer l’ordre des autres', () => {
    const rangees = arretsEnPremier([entree('a', 'avertissement'), entree('b', 'avertissement'), entree('c', 'avertissement'), entree('arret', 'arret')])
    expect(rangees.map((e) => e.cle)).toEqual(['arret', 'a', 'b', 'c'])
  })

  it('la forme du repère vaut « arrêt » dès qu’un arrêt est dans la liste', () => {
    expect(formeDuRepere([entree('a', 'avertissement'), entree('z', 'arret')])).toBe('arret')
    expect(formeDuRepere([entree('a', 'avertissement')])).toBe('avertissement')
    expect(formeDuRepere([])).toBe('avertissement')
  })
})

describe('profil non renseigné et S-03 regroupés (M-3)', () => {
  const entree = (code: string, nonRenseignes?: Avertissement['nonRenseignes'], garde = false): EntreeAvertissement => ({
    avertissement: { code, message: 'm', nonRenseignes } as Avertissement, cle: `${code}-${nonRenseignes?.join('') ?? ''}`,
    forme: 'avertissement', garde, semaine: 1, phaseOrdre: 1,
  })

  it('enumerer : 1, 2 et 3 mots', () => {
    expect(enumerer(['a'])).toBe('a')
    expect(enumerer(['a', 'b'])).toBe('a et b')
    expect(enumerer(['a', 'b', 'c'])).toBe('a, b et c')
  })
  it('phraseProfilIncomplet', () => {
    expect(phraseProfilIncomplet(['tractionsStrictesMax'])).toBe('Ton profil ne dit pas encore : combien de tractions strictes tu fais.')
    expect(phraseProfilIncomplet(['tractionsStrictesMax', 'adulte'])).toBe('Ton profil ne dit pas encore : combien de tractions strictes tu fais et si tu as 18 ans ou plus.')
    expect(phraseProfilIncomplet(['tractionsStrictesMax', 'test15sSur25mm', 'niveauBloc', 'adulte'])).toBe(
      'Ton profil ne dit pas encore : combien de tractions strictes tu fais, si tu tiens 15 s sur une réglette de 25 mm, ton niveau en bloc et si tu as 18 ans ou plus.')
  })
  it('nonRenseignesDe : réunion sans doublon, dans l\'ordre, gardés compris, autres codes ignorés', () => {
    expect(nonRenseignesDe([entree('S-03', ['adulte']), entree('S-03', ['tractionsStrictesMax', 'adulte'])])).toEqual(['tractionsStrictesMax', 'adulte'])
    expect(nonRenseignesDe([entree('S-03', ['niveauBloc'], true)])).toEqual(['niveauBloc'])
    expect(nonRenseignesDe([entree('S-04', ['adulte'])])).toEqual([])
    expect(nonRenseignesDe([])).toEqual([])
  })
  it('nomDuJour', () => {
    expect(nomDuJour('2026-11-24')).toBe('mardi')
  })

  // ST-TRA-02 mardi, jeudi et samedi de la semaine du 30/11 (posés dans le désordre pour vérifier le tri par date).
  const tractions = (id: string, date: string) => seanceDepuisType(seanceTypeParId('ST-TRA-02')!, undefined, base(id, 1, date))
  const trois = [tractions('c', '2026-12-05'), tractions('a', '2026-12-01'), tractions('b', '2026-12-03')]

  it('trois séances de la même fiche : un groupe, dans l\'ordre des dates, et les comptes ne changent pas', () => {
    const { plan } = verifier(trois)
    const semaine = plan.parSemaine.get(1) ?? []
    const lignes = regrouperS03(semaine, trois)
    const groupes = lignes.filter((l) => l.type === 'groupe')
    expect(groupes.length).toBeGreaterThan(0)
    for (const g of groupes) {
      if (g.type !== 'groupe') continue
      expect(g.seanceIds).toEqual(['a', 'b', 'c'])
      expect(g.entrees.every((e) => e.avertissement.code === 'S-03')).toBe(true)
    }
    const nbEntrees = lignes.reduce((t, l) => t + (l.type === 'groupe' ? l.entrees.length : 1), 0)
    expect(nbEntrees).toBe(semaine.length)
    expect(lignes.length).toBeLessThan(semaine.length)
    expect(compter(semaine).total).toBe(semaine.length)
    expect(joursDuGroupe(['a', 'b', 'c'], trois)).toBe('mardi, jeudi et samedi')
  })
  it('une seule séance : pas de groupe', () => {
    const une = [tractions('a', '2026-12-01')]
    const { plan } = verifier(une)
    expect(regrouperS03(plan.entrees, une).every((l) => l.type === 'seule')).toBe(true)
  })
  it('deux messages différents : deux lignes ; un S-04 n\'est jamais regroupé ; ordre reçu gardé', () => {
    const e = (cle: string, code: string, message: string, seanceId: string): EntreeAvertissement => ({
      avertissement: { code, message } as Avertissement, cle, forme: 'avertissement', garde: false, seanceId, semaine: 1, phaseOrdre: 1,
    })
    const ss = [tractions('a', '2026-12-01'), tractions('b', '2026-12-03')]
    const lignes = regrouperS03([
      e('1', 'S-03', 'x', 'a'), e('2', 'S-04', 'x', 'a'), e('3', 'S-03', 'y', 'a'),
      e('4', 'S-04', 'x', 'b'), e('5', 'S-03', 'x', 'b'), e('6', 'S-03', 'y', 'b'),
    ], ss)
    expect(lignes.map((l) => l.type === 'groupe' ? `G${l.entrees.map((x) => x.cle).join('')}` : l.entree.cle)).toEqual(['G15', '2', 'G36', '4'])
  })
})
