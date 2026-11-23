import { describe, expect, it } from 'vitest'
import { contexteDeReference, PROFIL_DE_REFERENCE, seanceSolo } from './exemples.ts'
import type { OptionsSeanceSolo } from './exemples.ts'
import { verifierContenuSemaine } from './verifSemaineContenu.ts'
import type { Avertissement, ContexteVerif, Jour, PlanVerif, SeanceVerif, SemaineVerif } from './types.ts'

const ECHAUFFEMENT = 'echauffement-general'

function semaine(lundi: Jour, type: SemaineVerif['type'] = 'charge', extra: Partial<SemaineVerif> = {}): SemaineVerif {
  return { lundi, type, mesocycleOrdre: 1, numero: 1, ...extra }
}

function plan(semaines: SemaineVerif[], seances: SeanceVerif[], surcharges: Partial<PlanVerif> = {}): PlanVerif {
  return {
    origine: 'utilisateur',
    debut: semaines[0]?.lundi ?? '2026-11-02',
    nbSemaines: semaines.length,
    seancesParSemaine: 3,
    mode: 'accent_tournant',
    mesocycles: [{ ordre: 1, accent: 'doigts', objectifsPersoIds: [] }],
    semaines,
    seances,
    ...surcharges,
  }
}

/** Une séance « ballast » qui pèse exactement `charge` unités (effort 10 × minutes). */
function seanceDeCharge(id: string, date: Jour, charge: number, fiches: string[] = [ECHAUFFEMENT]): SeanceVerif {
  return seanceSolo(id, date, fiches, { qualite: 'technique', durete: 'legere', effortPrevu: 10, dureeMin: charge / 10 })
}

/** Codes émis par la vérification, dans l'ordre. */
function codes(a: Avertissement[]): string[] {
  return a.map((x) => x.code)
}

function verifier(lundi: Jour, p: PlanVerif, ctx: ContexteVerif = contexteDeReference()): Avertissement[] {
  return verifierContenuSemaine(lundi, p, ctx)
}

/** Seuls les avertissements d'un code donné. */
function seulement(a: Avertissement[], code: string): Avertissement[] {
  return a.filter((x) => x.code === code)
}

// Les trois séances de la semaine conforme (cas 1 de B.11) : lundi 2026-11-23.
function semaineConforme(options: { jeudi?: Partial<OptionsSeanceSolo> & { date?: Jour } } = {}): SeanceVerif[] {
  return [
    seanceSolo(
      'mardi',
      '2026-11-24',
      [ECHAUFFEMENT, 'echauffement-doigts-poutre', 'doigts-reglette-minimale-lopez', 'puissance-bloc-limite', 'antagonistes-lattice'],
      { qualite: 'doigts' },
    ),
    seanceSolo(
      'jeudi',
      options.jeudi?.date ?? '2026-11-26',
      [ECHAUFFEMENT, 'puissance-bloc-limite', 'traction-lestee-force-lattice', 'antagonistes-lattice'],
      { qualite: 'traction_gainage' },
    ),
    seanceSolo(
      'samedi',
      '2026-11-28',
      [ECHAUFFEMENT, 'technique-tout-en-drapeau', 'endurance-1-on-1-off', 'endurance-continuite-fin-de-seance', 'antagonistes-legers'],
      { qualite: 'endurance', durete: 'legere' },
    ),
  ]
}

describe('semaine conforme (cas 1 de B.11)', () => {
  it('ne produit aucun avertissement', () => {
    const p = plan([semaine('2026-11-23')], semaineConforme())
    expect(verifier('2026-11-23', p)).toEqual([])
  })

  it('reste muette au niveau simple (cas 13)', () => {
    const seances = semaineConforme().map((s) => ({ ...s, solo: { ...s.solo, niveau: 'simple' as const } }))
    expect(verifier('2026-11-23', plan([semaine('2026-11-23')], seances))).toEqual([])
  })

  it('une semaine absente du plan ne produit rien', () => {
    expect(verifier('2026-12-07', plan([semaine('2026-11-23')], semaineConforme()))).toEqual([])
  })
})

describe('W-09 charge en forte hausse (cas 9)', () => {
  const deuxSemaines = (c2: number) =>
    plan(
      [semaine('2026-11-02'), semaine('2026-11-09', 'charge', { numero: 2 })],
      [seanceDeCharge('a', '2026-11-03', 1500), seanceDeCharge('b', '2026-11-10', c2)],
    )

  it('1 500 puis 1 700 : information, 13 %', () => {
    const w09 = seulement(verifier('2026-11-09', deuxSemaines(1700)), 'W-09')
    expect(w09).toHaveLength(1)
    expect(w09[0].niveau).toBe('information')
    expect(w09[0].message).toBe(
      'La charge prévue monte de 13 % par rapport à ta dernière semaine de charge. Le repère prudent est 10 % au plus.',
    )
    expect(w09[0].portee).toBe('semaine')
    expect(w09[0].lundi).toBe('2026-11-09')
  })

  it('1 500 puis 1 640 : rien (+9 %)', () => {
    expect(seulement(verifier('2026-11-09', deuxSemaines(1640)), 'W-09')).toEqual([])
  })

  it('exactement +10 % : rien (la condition est stricte)', () => {
    expect(seulement(verifier('2026-11-09', deuxSemaines(1650)), 'W-09')).toEqual([])
  })

  it('saute la décharge : compare 1 700 à 1 500, pas à 800', () => {
    const p = plan(
      [semaine('2026-11-02'), semaine('2026-11-09', 'decharge'), semaine('2026-11-16', 'charge')],
      [seanceDeCharge('a', '2026-11-03', 1500), seanceDeCharge('b', '2026-11-10', 800), seanceDeCharge('c', '2026-11-17', 1700)],
    )
    expect(seulement(verifier('2026-11-16', p), 'W-09')[0].message).toContain('13 %')
  })

  it('la première semaine de charge n’a pas de référence', () => {
    expect(seulement(verifier('2026-11-02', deuxSemaines(1700)), 'W-09')).toEqual([])
  })

  it('ne s’applique pas à une semaine qui n’est pas de charge', () => {
    const p = plan(
      [semaine('2026-11-02'), semaine('2026-11-09', 'decharge')],
      [seanceDeCharge('a', '2026-11-03', 1000), seanceDeCharge('b', '2026-11-10', 3000)],
    )
    expect(seulement(verifier('2026-11-09', p), 'W-09')).toEqual([])
  })
})

describe('W-10 semaine allégée (cas 7)', () => {
  // Charges 1 500, 1 600, 1 700 : moyenne 1 600, cible 800 (réduction 50 %).
  const avecDecharge = (charge: number) =>
    plan(
      [semaine('2026-11-02'), semaine('2026-11-09'), semaine('2026-11-16'), semaine('2026-11-23', 'decharge')],
      [
        seanceDeCharge('a', '2026-11-03', 1500),
        seanceDeCharge('b', '2026-11-10', 1600),
        seanceDeCharge('c', '2026-11-17', 1700),
        seanceDeCharge('d', '2026-11-24', charge),
      ],
    )

  it('1 500 : fort', () => {
    const w10 = seulement(verifier('2026-11-23', avecDecharge(1500)), 'W-10')
    expect(w10).toHaveLength(1)
    expect(w10[0].niveau).toBe('fort')
    expect(w10[0].message).toBe(
      'Ta semaine allégée est presque aussi chargée qu’une semaine normale. Divise les séries par deux et vise environ 800 unités.',
    )
  })

  it('1 000 : information avec la cible 800', () => {
    const w10 = seulement(verifier('2026-11-23', avecDecharge(1000)), 'W-10')
    expect(w10).toHaveLength(1)
    expect(w10[0].niveau).toBe('information')
    expect(w10[0].message).toBe(
      'Ta semaine allégée reste un peu chargée : vise environ 800 unités (50 % de moins que tes semaines de charge).',
    )
  })

  it('950 : rien', () => {
    expect(seulement(verifier('2026-11-23', avecDecharge(950)), 'W-10')).toEqual([])
  })

  it('1 440 pile : fort ; 960 pile : rien', () => {
    expect(seulement(verifier('2026-11-23', avecDecharge(1440)), 'W-10')[0].niveau).toBe('fort')
    expect(seulement(verifier('2026-11-23', avecDecharge(960)), 'W-10')).toEqual([])
  })

  it('dechargeActive: false : rien', () => {
    const ctx = contexteDeReference({ regles: { ...contexteDeReference().regles, dechargeActive: false } })
    expect(seulement(verifier('2026-11-23', avecDecharge(1500), ctx), 'W-10')).toEqual([])
  })

  it('utilise la réduction de la semaine quand elle existe (40 % : cible 960)', () => {
    const p = avecDecharge(1200)
    p.semaines[3] = semaine('2026-11-23', 'decharge', { reductionPct: 40 })
    const w10 = seulement(verifier('2026-11-23', p), 'W-10')
    expect(w10[0].niveau).toBe('information')
    expect(w10[0].message).toContain('960 unités (40 % de moins')
  })

  it('l’échauffement garde sa durée en semaine allégée : au-dessus de la cible, c’est une information', () => {
    // 1 200 unités pour une cible de 800 : un peu chargée, pas oubliée (A4-3, 18/11).
    expect(seulement(verifier('2026-11-23', avecDecharge(1200)), 'W-10')[0].niveau).toBe('information')
  })

  it('ne compare qu’aux semaines de charge du même bloc', () => {
    const p = avecDecharge(1500)
    p.semaines.forEach((w) => {
      if (w.type === 'charge') w.mesocycleOrdre = 2
    })
    expect(seulement(verifier('2026-11-23', p), 'W-10')).toEqual([])
  })

  it('séance dure sans exercice connu comptée comme séance dure ordinaire (7 × 90 = 630)', () => {
    const dure = seanceSolo('x', '2026-11-10', [], { qualite: 'traction_gainage', durete: 'dure', dureeMin: 90 })
    const p = plan(
      [semaine('2026-11-02'), semaine('2026-11-09', 'decharge')],
      [seanceDeCharge('a', '2026-11-03', 700), dure],
    )
    // moyenne 700, cible 350 ; 630 ≥ 630 (90 %) : fort.
    expect(seulement(verifier('2026-11-09', p), 'W-10')[0].niveau).toBe('fort')
  })
})

describe('W-11 exercice nouveau en semaine allégée ou d’affûtage', () => {
  it('décharge : une fiche absente des semaines de charge du bloc', () => {
    const p = plan(
      [semaine('2026-11-02'), semaine('2026-11-09', 'decharge')],
      [
        seanceSolo('a', '2026-11-03', [ECHAUFFEMENT, 'puissance-bloc-limite']),
        seanceSolo('b', '2026-11-10', [ECHAUFFEMENT, 'puissance-bloc-limite', 'resistance-4x4-blocs']),
      ],
    )
    const w11 = seulement(verifier('2026-11-09', p), 'W-11')
    expect(w11).toHaveLength(1)
    expect(w11[0].niveau).toBe('information')
    expect(w11[0].portee).toBe('etape')
    expect(w11[0].seanceId).toBe('b')
    expect(w11[0].etapeIndex).toBe(2)
    expect(w11[0].message).toMatch(
      /^« .+ » n’apparaît pas dans tes semaines de charge : en semaine allégée, garde des exercices connus\.$/,
    )
  })

  it('décharge : fiche déjà vue en charge : rien', () => {
    const p = plan(
      [semaine('2026-11-02'), semaine('2026-11-09', 'decharge')],
      [
        seanceSolo('a', '2026-11-03', [ECHAUFFEMENT, 'resistance-4x4-blocs']),
        seanceSolo('b', '2026-11-10', [ECHAUFFEMENT, 'resistance-4x4-blocs']),
      ],
    )
    expect(seulement(verifier('2026-11-09', p), 'W-11')).toEqual([])
  })

  it('affûtage : compare au bloc qui le contient et au précédent', () => {
    const p = plan(
      [
        semaine('2026-11-02', 'charge', { mesocycleOrdre: 1 }),
        semaine('2026-11-09', 'charge', { mesocycleOrdre: 2 }),
        semaine('2026-11-16', 'affutage', { mesocycleOrdre: 2 }),
      ],
      [
        seanceSolo('a', '2026-11-03', [ECHAUFFEMENT, 'resistance-4x4-blocs']), // bloc précédent
        seanceSolo('b', '2026-11-10', [ECHAUFFEMENT, 'puissance-bloc-limite']),
        seanceSolo('c', '2026-11-17', [ECHAUFFEMENT, 'resistance-4x4-blocs', 'technique-tout-en-drapeau']),
      ],
      { mesocycles: [{ ordre: 1, accent: 'doigts', objectifsPersoIds: [] }, { ordre: 2, accent: 'puissance', objectifsPersoIds: [] }] },
    )
    const w11 = seulement(verifier('2026-11-16', p), 'W-11')
    expect(w11).toHaveLength(1)
    expect(w11[0].message).toContain('en semaine d’affûtage')
    expect(w11[0].etapeIndex).toBe(2)
  })

  it('ne s’applique pas à une semaine de charge', () => {
    const p = plan([semaine('2026-11-02')], [seanceSolo('a', '2026-11-03', [ECHAUFFEMENT, 'resistance-4x4-blocs'])])
    expect(seulement(verifier('2026-11-02', p), 'W-11')).toEqual([])
  })
})

describe('W-12 efforts maximaux en semaine allégée', () => {
  const maximale = (id: string, date: Jour) => seanceSolo(id, date, ['traction-lestee-force-lattice'], { qualite: 'traction_gainage' })

  it('1 maximale en charge (semaine 3), 2 en allégée (semaine 4) : (2) et (1)', () => {
    const p = plan(
      [semaine('2026-11-09', 'charge', { numero: 3 }), semaine('2026-11-16', 'decharge', { numero: 4 })],
      [maximale('a', '2026-11-10'), maximale('b', '2026-11-17'), maximale('c', '2026-11-19')],
    )
    const w12 = seulement(verifier('2026-11-16', p), 'W-12')
    expect(w12).toHaveLength(1)
    expect(w12[0].niveau).toBe('information')
    expect(w12[0].message).toBe(
      'Ta semaine allégée compte plus de séances maximales (2) que ta dernière semaine de charge (1) : garde-en 1 au plus.',
    )
  })

  it('2 et 2 : rien', () => {
    const p = plan(
      [semaine('2026-11-09'), semaine('2026-11-16', 'decharge')],
      [maximale('a', '2026-11-10'), maximale('a2', '2026-11-12'), maximale('b', '2026-11-17'), maximale('c', '2026-11-19')],
    )
    expect(seulement(verifier('2026-11-16', p), 'W-12')).toEqual([])
  })

  it('séance dure sans exercice connu : pas maximale, donc pas de W-12 (F7)', () => {
    const dure = seanceSolo('d', '2026-11-17', [], { qualite: 'traction_gainage', durete: 'dure', dureeMin: 60 })
    const p = plan(
      [semaine('2026-11-09'), semaine('2026-11-16', 'decharge')],
      [seanceSolo('a', '2026-11-10', [ECHAUFFEMENT, 'technique-tout-en-drapeau']), dure],
    )
    expect(seulement(verifier('2026-11-16', p), 'W-12')).toEqual([])
  })
})

describe('W-13 qualité non entretenue', () => {
  it('semaine sans traction_gainage : la cite', () => {
    const seances = semaineConforme().filter((s) => s.id !== 'jeudi')
    const w13 = seulement(verifier('2026-11-23', plan([semaine('2026-11-23')], seances)), 'W-13')
    expect(w13).toHaveLength(1)
    expect(w13[0].niveau).toBe('information')
    expect(w13[0].message).toContain('traction et gainage')
    expect(w13[0].message).toBe(
      "Cette semaine ne contient rien pour : traction et gainage. Ajoute une étape courte pour l'entretenir (10 à 20 min suffisent).",
    )
  })

  it('plusieurs manques : liste séparée par « , » et « les »', () => {
    const seances = [seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'technique-tout-en-drapeau'])]
    const w13 = seulement(verifier('2026-11-23', plan([semaine('2026-11-23')], seances)), 'W-13')
    expect(w13[0].message).toContain(
      'rien pour : force des doigts, traction et gainage, puissance, résistance, endurance. Ajoute une étape courte pour les entretenir',
    )
  })

  it('profil voie : endurance-1-on-1-off n’entretient pas la résistance', () => {
    const ctx = contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, disciplinePrincipale: 'voie' } })
    const w13 = seulement(verifier('2026-11-23', plan([semaine('2026-11-23')], semaineConforme()), ctx), 'W-13')
    expect(w13).toHaveLength(1)
    expect(w13[0].message).toContain('rien pour : résistance.')
  })

  it('séance sans exercice connu : entretient sa qualité dominante (cas 14)', () => {
    const seances = semaineConforme({ jeudi: { date: '2026-11-25' } }).map((s) =>
      s.id === 'jeudi'
        ? seanceSolo('jeudi', '2026-11-25', [], { qualite: 'traction_gainage', durete: 'dure', dureeMin: 90 })
        : s,
    )
    expect(verifier('2026-11-23', plan([semaine('2026-11-23')], seances))).toEqual([])
  })

  it('exercice principal en étape résumée : rien (cas 15)', () => {
    const resumee = seanceSolo('jeudi', '2026-11-25', ['traction-simple-4x5'], { qualite: 'traction_gainage', dureeMin: 90 })
    resumee.solo.etapesDetaillees = false
    const seances = [...semaineConforme().filter((s) => s.id !== 'jeudi'), resumee]
    expect(verifier('2026-11-23', plan([semaine('2026-11-23')], seances))).toEqual([])
  })

  it('un objectif de groupe entretient ses accents', () => {
    const seances = semaineConforme().filter((s) => s.id !== 'jeudi')
    seances[0] = {
      ...seances[0],
      groupe: {
        durete: 'dure',
        etapes: [],
        objectifs: [{ libelle: 'Tractions en groupe', accents: ['traction_gainage'], marqueurs: [] }],
        dureeMin: 60,
      },
    }
    expect(seulement(verifier('2026-11-23', plan([semaine('2026-11-23')], seances)), 'W-13')).toEqual([])
  })

  it('ne s’applique pas à une semaine allégée', () => {
    const p = plan([semaine('2026-11-23', 'decharge')], [seanceDeCharge('a', '2026-11-24', 500, [ECHAUFFEMENT])])
    expect(seulement(verifier('2026-11-23', p), 'W-13')).toEqual([])
  })
})

describe('W-14 accent de la phase', () => {
  const pAccentPuissance = (seances: SeanceVerif[], accent: PlanVerif['mesocycles'][0]['accent'] = 'puissance') =>
    plan([semaine('2026-11-23')], seances, { mesocycles: [{ ordre: 1, accent, objectifsPersoIds: [] }] })
  const s = (id: string, date: Jour, qualite: SeanceVerif['qualite']) =>
    seanceSolo(id, date, [ECHAUFFEMENT], { qualite, durete: 'legere' })

  it('aucune séance de l’accent : message 1', () => {
    const w14 = seulement(verifier('2026-11-23', pAccentPuissance([s('a', '2026-11-24', 'technique')])), 'W-14')
    expect(w14).toHaveLength(1)
    expect(w14[0].message).toBe('Cette phase met en avant puissance, mais aucune séance de la semaine n’a cette qualité.')
  })

  it('deux séances résistance et une puissance : message 2', () => {
    const seances = [s('a', '2026-11-23', 'resistance'), s('b', '2026-11-25', 'resistance'), s('c', '2026-11-27', 'puissance')]
    const w14 = seulement(verifier('2026-11-23', pAccentPuissance(seances)), 'W-14')
    expect(w14).toHaveLength(1)
    expect(w14[0].message).toBe(
      'Plus de séances résistance que de séances puissance, l’accent de cette phase. C’est voulu ?',
    )
  })

  it('accent majoritaire ou à égalité : rien', () => {
    const seances = [s('a', '2026-11-23', 'resistance'), s('c', '2026-11-27', 'puissance')]
    expect(seulement(verifier('2026-11-23', pAccentPuissance(seances)), 'W-14')).toEqual([])
  })

  it('accent null : ignoré', () => {
    expect(seulement(verifier('2026-11-23', pAccentPuissance([s('a', '2026-11-24', 'technique')], null)), 'W-14')).toEqual([])
  })
})

describe('W-15 poutre et ancienneté', () => {
  const poutre = (id: string, date: Jour) => seanceSolo(id, date, [ECHAUFFEMENT, 'doigts-reglette-minimale-lopez'])

  it('2 ans, deux séances de poutre : cap 1', () => {
    const ctx = contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, anneesPratique: 2 } })
    const p = plan([semaine('2026-11-23')], [poutre('a', '2026-11-23'), poutre('b', '2026-11-26')])
    const w15 = seulement(verifier('2026-11-23', p, ctx), 'W-15')
    expect(w15).toHaveLength(1)
    expect(w15[0].message).toBe(
      'Avec 2 ans de pratique, Bechtel conseille 1 séance de poutre par semaine au plus. Tu en prévois 2.',
    )
  })

  it('4 ans (cap 2), trois séances : « séances » au pluriel', () => {
    const p = plan([semaine('2026-11-23')], [poutre('a', '2026-11-23'), poutre('b', '2026-11-25'), poutre('c', '2026-11-27')])
    expect(seulement(verifier('2026-11-23', p), 'W-15')[0].message).toContain('conseille 2 séances de poutre')
  })

  it('0,5 an, une séance : message « Moins d’un an »', () => {
    const ctx = contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, anneesPratique: 0.5 } })
    const w15 = seulement(verifier('2026-11-23', plan([semaine('2026-11-23')], [poutre('a', '2026-11-23')]), ctx), 'W-15')
    expect(w15[0].message).toBe('Moins d’un an de pratique : la grimpe suffit, la poutre viendra après un an sans blessure.')
  })

  it('une séance pour 4 ans : rien ; s’applique aussi hors semaine de charge', () => {
    expect(seulement(verifier('2026-11-23', plan([semaine('2026-11-23')], [poutre('a', '2026-11-23')])), 'W-15')).toEqual([])
    const ctx = contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, anneesPratique: 2 } })
    const p = plan([semaine('2026-11-23', 'decharge')], [poutre('a', '2026-11-23'), poutre('b', '2026-11-26')])
    expect(seulement(verifier('2026-11-23', p, ctx), 'W-15')).toHaveLength(1)
  })
})

describe('W-16 antagonistes insuffisants', () => {
  const avec = (n: number) =>
    plan(
      [semaine('2026-11-23')],
      Array.from({ length: n }, (_, i) => seanceSolo(`a${i}`, `2026-11-2${3 + i * 2}`, [ECHAUFFEMENT, 'antagonistes-lattice'])),
    )

  it('une seule étape : « Une seule séance »', () => {
    const w16 = seulement(verifier('2026-11-23', avec(1)), 'W-16')
    expect(w16).toHaveLength(1)
    expect(w16[0].message).toBe(
      'Une seule séance d’antagonistes cette semaine : 2 courtes séances après la grimpe protègent épaules et coudes.',
    )
  })

  it('aucune étape : « Aucune séance »', () => {
    const p = plan([semaine('2026-11-23')], [seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'technique-tout-en-drapeau'])])
    expect(seulement(verifier('2026-11-23', p), 'W-16')[0].message).toMatch(/^Aucune séance d’antagonistes/)
  })

  it('deux étapes : rien ; semaine allégée : rien', () => {
    expect(seulement(verifier('2026-11-23', avec(2)), 'W-16')).toEqual([])
    const p = plan([semaine('2026-11-23', 'decharge')], [])
    expect(seulement(verifier('2026-11-23', p), 'W-16')).toEqual([])
  })
})

describe('W-17 antagonistes un jour sans grimpe', () => {
  it('séance d’antagonistes seule : W-17 sur la séance', () => {
    const p = plan([semaine('2026-11-23')], [seanceSolo('a', '2026-11-24', ['antagonistes-lattice'])])
    const w17 = seulement(verifier('2026-11-23', p), 'W-17')
    expect(w17).toHaveLength(1)
    expect(w17[0].niveau).toBe('information')
    expect(w17[0].portee).toBe('seance')
    expect(w17[0].seanceId).toBe('a')
    expect(w17[0].message).toBe('Fais les antagonistes après une séance de grimpe, pas un jour de repos.')
  })

  it('antagonistes après de la grimpe : rien', () => {
    const p = plan([semaine('2026-11-23')], [seanceSolo('a', '2026-11-24', ['puissance-bloc-limite', 'antagonistes-lattice'])])
    expect(seulement(verifier('2026-11-23', p), 'W-17')).toEqual([])
  })
})

describe('W-18 module d’objectif spécifique', () => {
  const ctx = contexteDeReference({
    objectifsPerso: { o1: { id: 'o1', nom: 'Réglettes de 10 mm', marqueurs: [], prerequis: {}, contreIndications: [] } },
  })
  const pObjectif = (seances: SeanceVerif[]) =>
    plan([semaine('2026-11-23')], seances, { mesocycles: [{ ordre: 1, accent: 'doigts', objectifsPersoIds: ['o1'] }] })
  const avecModules = (n: number) => {
    const s = seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'puissance-bloc-limite'])
    s.solo.etapes = Array.from({ length: n }, () => ({ ficheId: 'puissance-bloc-limite', moduleObjectifId: 'o1' }))
    return s
  }

  it('aucun module : « 0 fois »', () => {
    const w18 = seulement(verifier('2026-11-23', pObjectif([avecModules(0)]), ctx), 'W-18')
    expect(w18).toHaveLength(1)
    expect(w18[0].message).toBe('Le module « Réglettes de 10 mm » est prévu 0 fois cette semaine : 1 à 2 fois par semaine.')
  })

  it('trois modules : trop fréquent ; un ou deux : rien', () => {
    expect(seulement(verifier('2026-11-23', pObjectif([avecModules(3)]), ctx), 'W-18')[0].message).toContain('prévu 3 fois')
    expect(seulement(verifier('2026-11-23', pObjectif([avecModules(1)]), ctx), 'W-18')).toEqual([])
    expect(seulement(verifier('2026-11-23', pObjectif([avecModules(2)]), ctx), 'W-18')).toEqual([])
  })

  it('pas d’objectif sur le bloc : rien', () => {
    expect(seulement(verifier('2026-11-23', plan([semaine('2026-11-23')], [avecModules(0)]), ctx), 'W-18')).toEqual([])
  })
})

describe('W-19 suspensions légères', () => {
  it('abrahangs et bloc limite dans la même séance : W-19', () => {
    const p = plan([semaine('2026-11-23')], [seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'doigts-abrahangs', 'puissance-bloc-limite'])])
    const w19 = seulement(verifier('2026-11-23', p), 'W-19')
    expect(w19).toHaveLength(1)
    expect(w19[0].niveau).toBe('information')
    expect(w19[0].seanceId).toBe('a')
    expect(w19[0].message).toBe('Laisse au moins 6 h entre les suspensions légères pieds au sol et toute autre séance.')
  })

  it('abrahangs seule, autre séance le même jour : W-19', () => {
    const p = plan(
      [semaine('2026-11-23')],
      [seanceSolo('a', '2026-11-24', ['doigts-abrahangs']), seanceSolo('b', '2026-11-24', [ECHAUFFEMENT, 'technique-tout-en-drapeau'])],
    )
    expect(seulement(verifier('2026-11-23', p), 'W-19').map((x) => x.seanceId)).toEqual(['a'])
  })

  it('abrahangs seule ce jour-là (même avec échauffement) : rien', () => {
    const p = plan(
      [semaine('2026-11-23')],
      [seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'doigts-abrahangs']), seanceSolo('b', '2026-11-25', ['technique-tout-en-drapeau'])],
    )
    expect(seulement(verifier('2026-11-23', p), 'W-19')).toEqual([])
  })

  it('une seule alerte par séance si les deux cas se cumulent', () => {
    const p = plan(
      [semaine('2026-11-23')],
      [seanceSolo('a', '2026-11-24', ['doigts-abrahangs', 'puissance-bloc-limite']), seanceSolo('b', '2026-11-24', ['technique-tout-en-drapeau'])],
    )
    expect(seulement(verifier('2026-11-23', p), 'W-19')).toHaveLength(1)
  })
})

describe('codes émis', () => {
  it('une semaine conforme ne produit aucun code, une semaine vide en produit plusieurs', () => {
    expect(codes(verifier('2026-11-23', plan([semaine('2026-11-23')], semaineConforme())))).toEqual([])
    expect(codes(verifier('2026-11-23', plan([semaine('2026-11-23')], [])))).toEqual(['W-13', 'W-14', 'W-16'])
  })
})
