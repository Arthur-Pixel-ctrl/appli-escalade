import { describe, expect, it } from 'vitest'
import { contexteDeReference, PROFIL_DE_REFERENCE, seanceSolo } from './exemples.ts'
import { cleAvertissement } from './passerelles.ts'
import { seanceTypeParId } from '../donnees/seancesTypes.ts'
import { verifierEspacement, verifierQuotasSemaine } from './verifSemaineQuotas.ts'
import type { Avertissement, SeanceVerif } from './types.ts'

const ctx = contexteDeReference()
const LUNDI = '2026-11-23'

// Les jours de la semaine de référence (lundi 23 novembre 2026).
const LUN = '2026-11-23'
const MAR = '2026-11-24'
const MER = '2026-11-25'
const JEU = '2026-11-26'
const VEN = '2026-11-27'
const SAM = '2026-11-28'
const DIM = '2026-11-29'
const LUN_SUIVANT = '2026-11-30'

const MAXIMALE = 'doigts-reglette-minimale-lopez' // maximale + poutre intensive + poutre
const BLOC_LIMITE = 'puissance-bloc-limite' // maximale + bloc limite

/** Une séance type du catalogue (ST-DOI-02…), avec les étapes de sa version solo. */
function seanceType(id: string, date: string): SeanceVerif {
  const st = seanceTypeParId(id)
  if (!st) throw new Error(`Séance type inconnue : ${id}`)
  return seanceSolo(id, date, st.solo.map((e) => e.ficheId), { nom: st.nom, qualite: st.qualite, durete: st.durete })
}

function codes(alertes: Avertissement[]): string[] {
  return alertes.map((a) => a.code)
}

/** Tous les contrôles W-01 à W-08 sur la semaine du lundi 23 (comme le fera le point d'entrée). */
function toutes(seances: SeanceVerif[], seancesParSemaine = 3): Avertissement[] {
  return [...verifierEspacement(seances, ctx), ...verifierQuotasSemaine(LUNDI, seances, seancesParSemaine, ctx)]
}

describe('W-01 · moins de 48 h entre deux séances exigeantes', () => {
  it('ne se déclenche pas à 48 h (mardi et jeudi)', () => {
    const s = [seanceSolo('a', MAR, [MAXIMALE]), seanceSolo('b', JEU, [BLOC_LIMITE])]
    expect(verifierEspacement(s, ctx)).toEqual([])
  })

  it('se déclenche sur la seconde séance de deux jours de suite, avec le message de la spécification', () => {
    const s = [seanceSolo('a', MAR, [MAXIMALE], { nom: 'Doigts' }), seanceSolo('b', MER, [BLOC_LIMITE], { nom: 'Bloc' })]
    const [alerte, ...reste] = verifierEspacement(s, ctx)
    expect(reste).toEqual([])
    expect(alerte).toMatchObject({ code: 'W-01', niveau: 'fort', portee: 'seance', seanceId: 'b' })
    expect(alerte.message).toBe(
      '« Bloc » (mercredi 25) arrive moins de 48 h après « Doigts » (mardi 24) : deux séances maximales. ' +
        "Décale-la d'un jour ou fais sa version légère.",
    )
  })

  it('se calcule sur toute la frise : dimanche et lundi suivant', () => {
    const s = [seanceSolo('a', DIM, [MAXIMALE]), seanceSolo('b', LUN_SUIVANT, [BLOC_LIMITE])]
    const alertes = verifierEspacement(s, ctx)
    expect(codes(alertes)).toEqual(['W-01'])
    expect(alertes[0].seanceId).toBe('b')
  })

  it('se déclenche pour deux séances maximales le même jour', () => {
    const s = [seanceSolo('a', MAR, [MAXIMALE]), seanceSolo('b', MAR, [BLOC_LIMITE])]
    expect(codes(verifierEspacement(s, ctx))).toEqual(['W-01'])
  })

  it('nomme la poutre intensive quand seule elle est en cause', () => {
    // Deux séances de poutre intensive sans effort maximal déclaré : on les fabrique avec des marqueurs réalisés.
    const realisee = (finLe: string) => ({
      version: 'solo' as const, finLe, dureeMin: 60, effortPercu: 7, marqueurs: ['poutre_intensive' as const],
    })
    const s = [
      seanceSolo('a', MAR, [MAXIMALE], { realisee: realisee('2026-11-24T20:00:00.000Z') }),
      seanceSolo('b', MER, [MAXIMALE], { realisee: realisee('2026-11-25T20:00:00.000Z') }),
    ]
    const [alerte] = verifierEspacement(s, ctx)
    expect(alerte.message).toContain('deux séances de poutre intensive.')
  })

  it("compte en heures entre deux séances réalisées : 46 h déclenche, 48 h non", () => {
    const realisee = (finLe: string) => ({
      version: 'solo' as const, finLe, dureeMin: 60, effortPercu: 8, marqueurs: ['maximale' as const],
    })
    const premiere = seanceSolo('a', MAR, [MAXIMALE], { realisee: realisee('2026-11-24T20:00:00.000Z') })
    const tropTot = seanceSolo('b', JEU, [BLOC_LIMITE], { realisee: realisee('2026-11-26T19:00:00.000Z') }) // début 18:00
    const pileA48h = seanceSolo('b', JEU, [BLOC_LIMITE], { realisee: realisee('2026-11-26T21:00:00.000Z') }) // début 20:00
    expect(codes(verifierEspacement([premiere, tropTot], ctx))).toEqual(['W-01'])
    expect(verifierEspacement([premiere, pileA48h], ctx)).toEqual([])
  })

  it("n'est pas interrompue par une séance légère intercalée", () => {
    const legere = (date: string) => seanceSolo('l', date, ['technique-pieds-silencieux'])
    const a = seanceSolo('a', MAR, [MAXIMALE])
    // maximale 24, légère 25, maximale 26 : rien
    expect(verifierEspacement([a, legere(MER), seanceSolo('b', JEU, [BLOC_LIMITE])], ctx)).toEqual([])
    // maximale 24, légère 25, maximale 25 : W-01 sur la maximale du 25
    const alertes = verifierEspacement([a, legere(MER), seanceSolo('b', MER, [BLOC_LIMITE])], ctx)
    expect(codes(alertes)).toEqual(['W-01'])
    expect(alertes[0].seanceId).toBe('b')
  })

  it("compare à la précédente séance du même type, pas à la séance juste avant", () => {
    const s = [
      seanceSolo('poutre', MAR, ['doigts-echelles-3-6-9']), // poutre simple : ni maximale ni intensive
      seanceSolo('a', MAR, [MAXIMALE]),
      seanceSolo('b', JEU, [BLOC_LIMITE]),
    ]
    expect(verifierEspacement(s, ctx)).toEqual([])
  })

  it("F7 : une séance dure sans exercice connu n'est pas une séance maximale", () => {
    const dureVide = seanceSolo('vide', MER, [], { qualite: 'traction_gainage', durete: 'dure', dureeMin: 90 })
    const s = [seanceSolo('a', MAR, [MAXIMALE]), dureVide]
    expect(verifierEspacement(s, ctx)).toEqual([])
  })

  it("F7 : la même séance avec un exercice principal maximal déclenche W-01 (cas 15 de B.11)", () => {
    const avecExercice = seanceSolo('b', MER, ['traction-lestee-force-lattice'], { dureeMin: 90 })
    expect(codes(verifierEspacement([seanceSolo('a', MAR, [MAXIMALE]), avecExercice], ctx))).toEqual(['W-01'])
  })
})

describe('W-02 · quota de poutre intensive', () => {
  const troisSeances = [LUN, MER, VEN].map((j, i) => seanceSolo(`p${i}`, j, [MAXIMALE]))

  it('se déclenche à 3 séances, sans W-01 (2 jours d\'écart)', () => {
    const alertes = toutes(troisSeances)
    const w02 = alertes.find((a) => a.code === 'W-02')
    expect(w02).toMatchObject({ niveau: 'fort', portee: 'semaine', lundi: LUNDI })
    expect(w02?.message).toBe(
      '3 séances de poutre intensive cette semaine : 2 au plus. Allège ou déplace la dernière.',
    )
    expect(codes(alertes)).not.toContain('W-01')
  })

  it('ne se déclenche pas à 2 séances', () => {
    expect(codes(toutes(troisSeances.slice(0, 2)))).not.toContain('W-02')
  })
})

describe('W-03 · quota de bloc limite', () => {
  const trois = [LUN, MER, VEN].map((j, i) => seanceSolo(`b${i}`, j, [BLOC_LIMITE]))

  it('se déclenche à 3 séances, avec W-05 fort sur la fiche', () => {
    const alertes = toutes(trois)
    expect(alertes.find((a) => a.code === 'W-03')?.message).toBe(
      '3 séances de bloc limite cette semaine : 2 au plus. Remplace la dernière par du volume ou des intervalles plus faciles.',
    )
    expect(alertes.find((a) => a.code === 'W-05')?.niveau).toBe('fort')
  })

  it('ne se déclenche pas à 2 séances', () => {
    expect(codes(toutes(trois.slice(0, 2)))).not.toContain('W-03')
  })
})

describe('W-04 · poutre, tous types', () => {
  const quatre = [LUN, MAR, JEU, VEN].map((j, i) => seanceSolo(`e${i}`, j, ['doigts-echelles-3-6-9']))

  it('se déclenche à 4 jours, avec W-05 fort (marqueur poutre, plafond 2 de la fiche)', () => {
    const alertes = toutes(quatre)
    expect(alertes.find((a) => a.code === 'W-04')?.message).toBe(
      '4 séances avec poutre cette semaine : 3 au plus, tous exercices confondus.',
    )
    const w05 = alertes.find((a) => a.code === 'W-05')
    expect(w05?.niveau).toBe('fort')
    expect(w05?.message).toContain('est prévue 4 fois cette semaine ; sa fiche conseille 2 fois au plus.')
  })

  it('ne se déclenche pas à 3 séances', () => {
    expect(codes(toutes(quatre.slice(0, 3)))).not.toContain('W-04')
  })
})

describe('W-05 · plafond d\'une fiche', () => {
  it('est une information pour une fiche sans marqueur à quota (antagonistes ×3)', () => {
    const s = [LUN, MER, VEN].map((j, i) => seanceSolo(`a${i}`, j, ['antagonistes-lattice']))
    const w05 = toutes(s).filter((a) => a.code === 'W-05')
    expect(w05).toHaveLength(1)
    expect(w05[0].niveau).toBe('information')
  })

  it('est fort pour une fiche à quota (bloc limite ×3)', () => {
    const s = [LUN, MER, VEN].map((j, i) => seanceSolo(`b${i}`, j, [BLOC_LIMITE]))
    expect(toutes(s).find((a) => a.code === 'W-05')?.niveau).toBe('fort')
  })

  it('ne se déclenche pas au plafond exact', () => {
    const s = [LUN, MER].map((j, i) => seanceSolo(`a${i}`, j, ['antagonistes-lattice']))
    expect(codes(toutes(s))).not.toContain('W-05')
  })

  it('compte une fiche une seule fois par séance, même présente dans les deux versions', () => {
    const groupe = { durete: 'legere' as const, etapes: [{ ficheId: 'antagonistes-lattice' }] }
    const s = [
      seanceSolo('a', LUN, ['antagonistes-lattice'], { groupe }),
      seanceSolo('b', MER, ['antagonistes-lattice'], { groupe }),
    ]
    expect(codes(toutes(s))).not.toContain('W-05')
  })
})

describe('W-06 · jours de doigts', () => {
  const grimpe = (jours: string[]) => jours.map((j, i) => seanceSolo(`g${i}`, j, ['technique-pieds-silencieux']))

  it('se déclenche à 5 jours de grimpe', () => {
    const alertes = toutes(grimpe([LUN, MAR, MER, JEU, VEN]), 5)
    expect(alertes.find((a) => a.code === 'W-06')?.message).toBe(
      'Tu sollicites tes doigts 5 jours cette semaine : 4 au plus, et au moins 3 jours de repos des doigts. ' +
        'Remplace une séance par de la mobilité ou du gainage au sol.',
    )
  })

  it("ne se déclenche pas avec 4 jours de grimpe et 1 jour de mobilité", () => {
    const s = [...grimpe([LUN, MAR, MER, JEU]), seanceSolo('m', VEN, ['mobilite-grand-ecart-lattice'])]
    expect(codes(toutes(s, 5))).not.toContain('W-06')
  })

  it('compte les jours, pas les séances : deux séances le même jour font un jour', () => {
    expect(codes(toutes(grimpe([LUN, LUN, MAR, MER, JEU]), 5))).not.toContain('W-06')
  })

  it('F7 : une séance dure sans exercice compte comme jour de doigts, sauf mobilité ou antagonistes', () => {
    const vide = (qualite: SeanceVerif['qualite']) =>
      seanceSolo('vide', MAR, [], { qualite, durete: 'dure', dureeMin: 60 })
    const autres = grimpe([LUN, MER, JEU, VEN])
    expect(codes(toutes([...autres, vide('traction_gainage')], 5))).toContain('W-06')
    expect(codes(toutes([...autres, vide('mobilite')], 5))).not.toContain('W-06')
    expect(codes(toutes([...autres, vide('antagonistes')], 5))).not.toContain('W-06')
  })
})

describe('W-07 · plus de séances que choisi', () => {
  const quatre = [LUN, MAR, JEU, SAM].map((j, i) => seanceSolo(`t${i}`, j, ['technique-pieds-silencieux']))

  it('se déclenche à 4 séances pour 3 choisies (information)', () => {
    const w07 = toutes(quatre, 3).find((a) => a.code === 'W-07')
    expect(w07).toMatchObject({ niveau: 'information', portee: 'semaine', lundi: LUNDI })
    expect(w07?.message).toBe(
      '4 séances prévues pour 3 choisies : ton plan est plus chargé que prévu. Retire-en une ou change ton nombre de séances.',
    )
  })

  it('ne se déclenche pas à 4 séances pour 4 choisies', () => {
    expect(codes(toutes(quatre, 4))).not.toContain('W-07')
  })

  it("ne compte que les séances de la semaine demandée", () => {
    const s = [...quatre.slice(0, 3), seanceSolo('suivante', LUN_SUIVANT, ['technique-pieds-silencieux'])]
    expect(codes(toutes(s, 3))).not.toContain('W-07')
  })
})

describe('W-08 · trop de séances dures', () => {
  // Séances dures déclarées, sans marqueur de quota : on teste seulement le compte.
  const dures = (jours: string[]) =>
    jours.map((j, i) => seanceSolo(`d${i}`, j, ['technique-pieds-silencieux'], { durete: 'dure' }))

  it('se déclenche à 4 séances dures avec 4 séances par semaine (3 au plus)', () => {
    const w08 = toutes(dures([LUN, MAR, JEU, SAM]), 4).find((a) => a.code === 'W-08')
    expect(w08).toMatchObject({ niveau: 'fort', portee: 'semaine' })
    expect(w08?.message).toBe(
      '4 séances dures cette semaine : avec 4 séances par semaine, garde-en 3 au plus et rends les autres légères.',
    )
  })

  it('ne se déclenche pas à 3 séances dures avec 3 séances par semaine', () => {
    expect(codes(toutes(dures([LUN, MER, VEN]), 3))).not.toContain('W-08')
  })

  it('F7 : une séance dure sans exercice compte dans W-08', () => {
    const s = [
      seanceSolo('a', LUN, [BLOC_LIMITE]),
      seanceSolo('vide', MAR, [], { qualite: 'traction_gainage', durete: 'dure', dureeMin: 90 }),
    ]
    expect(codes(toutes(s, 1))).toContain('W-08') // 1 séance par semaine : 1 dure au plus
  })
})

describe('Cas chiffrés de B.11', () => {
  const doigts = (date: string) => seanceType('ST-DOI-02', date)
  const traction = (date: string) => seanceType('ST-TRA-02', date)
  const endurance = (date: string) => seanceType('ST-END-02', date)

  it('cas 1 · semaine conforme : aucun avertissement W', () => {
    expect(toutes([doigts(MAR), traction(JEU), endurance(SAM)])).toEqual([])
  })

  it('cas 2 · deux maximales de suite : W-01 fort sur la séance du 25', () => {
    const alertes = toutes([doigts(MAR), traction(MER), endurance(SAM)])
    expect(alertes.filter((a) => a.code === 'W-01')).toHaveLength(1)
    expect(alertes.find((a) => a.code === 'W-01')).toMatchObject({ niveau: 'fort', seanceId: 'ST-TRA-02' })
  })

  it('cas 3 · frontière de semaine : W-01 fort sur celle du 30', () => {
    const alertes = toutes([seanceSolo('dim', DIM, [BLOC_LIMITE]), seanceSolo('lun', LUN_SUIVANT, [BLOC_LIMITE])])
    expect(alertes.find((a) => a.code === 'W-01')).toMatchObject({ niveau: 'fort', seanceId: 'lun' })
  })

  it('cas 4 · quota de poutre intensive : W-02 fort, W-01 muet', () => {
    const alertes = toutes([LUN, MER, VEN].map((j, i) => seanceSolo(`p${i}`, j, [MAXIMALE])))
    expect(codes(alertes)).toContain('W-02')
    expect(codes(alertes)).not.toContain('W-01')
  })

  it('cas 14 · séance dure sans contenu : ni W-01, ni W-06, ni W-08', () => {
    const vide = seanceSolo('vide', MER, [], { qualite: 'traction_gainage', durete: 'dure', dureeMin: 90 })
    expect(toutes([doigts(MAR), vide, endurance(SAM)])).toEqual([])
  })

  it('cas 15 · même séance avec un exercice principal maximal : W-01 fort sur celle du 25', () => {
    const principale = seanceSolo('princ', MER, ['traction-lestee-force-lattice'], { qualite: 'traction_gainage', dureeMin: 90 })
    const alertes = toutes([doigts(MAR), principale, endurance(SAM)])
    expect(alertes.find((a) => a.code === 'W-01')).toMatchObject({ niveau: 'fort', seanceId: 'princ' })
  })
})

describe('W-20 · résistance en voie', () => {
  const CAPACITY = 'resistance-capacity-power'
  const VOIES = 'resistance-voies-repetees'
  const CIRCUIT = 'resistance-circuits-30-mouvements'
  const BLOCS_4X4 = 'resistance-4x4-blocs'
  const w20 = (s: SeanceVerif[], c = ctx) => verifierQuotasSemaine(LUNDI, s, 3, c).filter((a) => a.code === 'W-20')
  const voie = contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, disciplinePrincipale: 'voie' } })
  const deuxSeances = () => [seanceSolo('a', MAR, [VOIES]), seanceSolo('b', JEU, [CIRCUIT])]

  it('profil bloc : 2 séances déclenchent, 1 seule ne déclenche pas', () => {
    expect(w20([seanceSolo('a', MAR, [VOIES])])).toEqual([])
    const [alerte, ...reste] = w20(deuxSeances())
    expect(reste).toEqual([])
    expect(alerte).toMatchObject({ code: 'W-20', niveau: 'fort', portee: 'semaine', lundi: LUNDI })
    expect(alerte.mesocycleOrdre).toBeUndefined()
    expect(alerte.sujet).toBeUndefined()
    expect(alerte.source).toBe("Décision d'Arthur (F2, point 13) ; audit B21, I-8 (Lattice)")
    expect(alerte.message).toBe(
      '2 séances de résistance en voie cette semaine : 1 au plus avec un profil « bloc ». ' +
        'Garde-en une et fais le reste en bloc, ou change ton profil si ton objectif devient la voie.',
    )
  })

  it('cas 17 (a) profil voie : 2 séances ne déclenchent pas, 3 déclenchent', () => {
    expect(w20(deuxSeances(), voie)).toEqual([])
    const [alerte] = w20([...deuxSeances(), seanceSolo('c', SAM, [CAPACITY])], voie)
    expect(alerte.niveau).toBe('fort')
    expect(alerte.message).toBe(
      "3 séances de résistance en voie cette semaine : 2 au plus. Remplace la dernière par de l'endurance ou de la technique.",
    )
  })

  it('cas 17 : la semaine ne déclenche pas W-05 (chaque fiche une fois)', () => {
    expect(verifierQuotasSemaine(LUNDI, deuxSeances(), 3, ctx).filter((a) => a.code === 'W-05')).toEqual([])
  })

  it('cas 17 (b) séance prévue : les deux versions comptent ; réalisée : seule la version faite', () => {
    const avecGroupe = (): SeanceVerif => {
      const s = seanceSolo('b', JEU, ['resistance-boulder-triples'])
      s.groupe = { durete: 'dure', etapes: [{ ficheId: CIRCUIT }] }
      return s
    }
    expect(w20([seanceSolo('a', MAR, [VOIES]), avecGroupe()]).map((a) => a.code)).toEqual(['W-20'])
    const faite = avecGroupe()
    faite.realisee = { version: 'solo', finLe: '2026-11-26T19:00:00.000Z', dureeMin: 60, effortPercu: 7, marqueurs: [] } as never
    expect(w20([seanceSolo('a', MAR, [VOIES]), faite])).toEqual([])
  })

  it('cas 17 (c) : deux semaines du calendrier (dimanche et lundi suivant) ne déclenchent pas', () => {
    const s = [seanceSolo('a', DIM, [VOIES]), seanceSolo('b', LUN_SUIVANT, [CIRCUIT])]
    expect(w20(s)).toEqual([])
    expect(verifierQuotasSemaine(LUN_SUIVANT, s, 3, ctx).filter((a) => a.code === 'W-20')).toEqual([])
  })

  it('une séance avec deux fiches de résistance en voie compte une fois', () => {
    expect(w20([seanceSolo('a', MAR, [VOIES, CIRCUIT])])).toEqual([])
  })

  it('la résistance en bloc ne compte pas', () => {
    expect(w20([seanceSolo('a', MAR, [BLOCS_4X4]), seanceSolo('b', JEU, [VOIES])])).toEqual([])
  })
})

describe('sujet des W-05', () => {
  it('cas 18 : deux fiches au-delà de leur plafond donnent deux W-05 de sujets distincts', () => {
    const s = [
      seanceSolo('a', MAR, ['antagonistes-lattice', 'mobilite-grand-ecart-lattice']),
      seanceSolo('b', JEU, ['antagonistes-lattice', 'mobilite-grand-ecart-lattice']),
      seanceSolo('c', SAM, ['antagonistes-lattice', 'mobilite-grand-ecart-lattice']),
    ]
    const w05 = verifierQuotasSemaine(LUNDI, s, 3, ctx).filter((a) => a.code === 'W-05')
    expect(w05.map((a) => a.sujet).sort()).toEqual(['antagonistes-lattice', 'mobilite-grand-ecart-lattice'])
    expect(new Set(w05.map(cleAvertissement)).size).toBe(2)
  })
})

describe('principaux hors étapes (consolidation 24/11)', () => {
  const avecPrincipal = (id: string, date: string, principal: string): SeanceVerif => {
    const s = seanceSolo(id, date, ['echauffement-general', 'traction-simple-4x5'], { durete: 'dure' })
    s.solo.principauxHorsEtapes = [principal]
    return s
  }
  it('W-05 compte un principal hors étapes', () => {
    const s = [
      seanceSolo('a', LUN, [MAXIMALE]),
      seanceSolo('b', MAR, [MAXIMALE]),
      avecPrincipal('c', JEU, MAXIMALE),
    ]
    const w05 = toutes(s).filter((a) => a.code === 'W-05')
    expect(w05).toHaveLength(1)
    expect(w05[0].message).toContain('prévue 3 fois')
  })
  it('W-01 entre une séance maximale et, le lendemain, une séance dont seul le principal hors étapes est maximal', () => {
    const s = [seanceSolo('a', MAR, [MAXIMALE]), avecPrincipal('b', MER, BLOC_LIMITE)]
    const a = verifierEspacement(s, ctx)
    expect(a.map((x) => [x.code, x.seanceId])).toEqual([['W-01', 'b']])
  })
})

describe('W-01 · séance liée (consolidation 25/11, audit phase 3)', () => {
  const MESSAGE = '« Bloc » (mercredi 25) arrive moins de 48 h après « Doigts » (mardi 24) : deux séances maximales. ' +
    "Décale-la d'un jour ou fais sa version légère."
  const prevue = () => seanceSolo('a', MAR, [MAXIMALE], { nom: 'Doigts' })
  const seconde = () => seanceSolo('b', MER, [BLOC_LIMITE], { nom: 'Bloc' })
  const realisee = (finLe: string) => ({
    version: 'solo' as const, finLe, dureeMin: 60, effortPercu: 8, marqueurs: ['maximale' as const],
  })

  it('entre deux séances prévues : seanceLieeId est l\'identifiant de la première', () => {
    const [alerte] = verifierEspacement([prevue(), seconde()], ctx)
    expect(alerte.seanceLieeId).toBe('a')
    expect(alerte.message).toBe(MESSAGE)
  })
  it('première réalisée hors plan : W-01 sans seanceLieeId', () => {
    const a = { ...prevue(), horsPlan: true as const, realisee: realisee('2026-11-24T20:00:00.000Z') }
    const [alerte] = verifierEspacement([a, seconde()], ctx)
    expect(alerte.code).toBe('W-01')
    expect(alerte).not.toHaveProperty('seanceLieeId')
  })
  it('première prévue puis faite (sans horsPlan) : seanceLieeId présent', () => {
    const a = { ...prevue(), realisee: realisee('2026-11-24T20:00:00.000Z') }
    const [alerte] = verifierEspacement([a, seconde()], ctx)
    expect(alerte.seanceLieeId).toBe('a')
  })
  it('une séance légère homonyme le jour de la seconde ne change pas seanceLieeId', () => {
    const legere = seanceSolo('c', MER, ['echauffement-general'], { nom: 'Doigts', durete: 'legere' })
    const alertes = verifierEspacement([prevue(), seconde(), legere], ctx)
    expect(alertes).toHaveLength(1)
    expect(alertes[0].seanceLieeId).toBe('a')
  })
  it('la clé « Je garde ce choix » ne dépend pas de seanceLieeId', () => {
    const [alerte] = verifierEspacement([prevue(), seconde()], ctx)
    const { seanceLieeId: _ignore, ...sans } = alerte
    expect(cleAvertissement(alerte)).toBe(cleAvertissement(sans))
  })
})
