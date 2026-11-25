import { describe, expect, it } from 'vitest'
import { contexteDeReference, seanceSolo } from './exemples.ts'
import { ajouterJours } from './base.ts'
import { verifierStructurePlan } from './verifPlan.ts'
import type {
  Avertissement,
  ContexteVerif,
  FicheVerif,
  Jour,
  ObjectifPersoVerif,
  PlanVerif,
  Qualite,
  SeanceVerif,
  SemaineVerif,
} from './types.ts'

const DEBUT: Jour = '2026-11-02' // un lundi

type TypeSemaine = SemaineVerif['type']

/** Semaines à la suite, une par type, rattachées au bloc donné. */
function semaines(types: TypeSemaine[], debut: Jour = DEBUT, ordre = 1, depart = 0): SemaineVerif[] {
  return types.map((type, i) => ({
    lundi: ajouterJours(debut, 7 * (depart + i)),
    type,
    mesocycleOrdre: ordre,
    numero: i + 1,
  }))
}

const BLOC_STANDARD: TypeSemaine[] = ['charge', 'charge', 'charge', 'decharge']

/** Plan standard : 12 semaines, 3 blocs doigts / puissance / résistance de 3 charge + 1 décharge. */
function planStandard(surcharges: Partial<PlanVerif> = {}): PlanVerif {
  const accents: Qualite[] = ['doigts', 'puissance', 'resistance']
  return {
    origine: 'utilisateur',
    debut: DEBUT,
    nbSemaines: 12,
    seancesParSemaine: 3,
    mode: 'accent_tournant',
    mesocycles: accents.map((accent, i) => ({ ordre: i + 1, accent, objectifsPersoIds: [] })),
    semaines: accents.flatMap((_, i) => semaines(BLOC_STANDARD, DEBUT, i + 1, i * 4)),
    seances: [],
    ...surcharges,
  }
}

/** Plan fabriqué à partir d'une liste de blocs (accent, types de semaines). */
function planDeBlocs(blocs: { accent: Qualite | null; types: TypeSemaine[] }[], surcharges: Partial<PlanVerif> = {}): PlanVerif {
  let depart = 0
  const toutes: SemaineVerif[] = []
  blocs.forEach((b, i) => {
    toutes.push(...semaines(b.types, DEBUT, i + 1, depart))
    depart += b.types.length
  })
  return planStandard({
    mesocycles: blocs.map((b, i) => ({ ordre: i + 1, accent: b.accent, objectifsPersoIds: [] })),
    semaines: toutes,
    nbSemaines: toutes.length,
    ...surcharges,
  })
}

/**
 * Contexte de référence sans fiche de test : la bibliothèque en a désormais (tâche C-08), ce qui active P-09.
 * Les autres vérifications se testent sans elle ; P-09 a ses propres tests plus bas.
 */
function contexteSansTests(): ContexteVerif {
  const base = contexteDeReference()
  const fiches = Object.fromEntries(Object.entries(base.fiches).filter(([, f]) => !f.estTest))
  return { ...base, fiches }
}

function verifier(p: PlanVerif, ctx: ContexteVerif = contexteSansTests()): Avertissement[] {
  return verifierStructurePlan(p, ctx)
}

function codes(a: Avertissement[]): string[] {
  return a.map((x) => x.code)
}

function objectif(id: string, extra: Partial<ObjectifPersoVerif> = {}): ObjectifPersoVerif {
  return { id, nom: id, marqueurs: [], prerequis: {}, contreIndications: [], ...extra }
}

/** Plan standard dont le premier bloc porte ces objectifs. */
function planAvecObjectifs(ids: string[]): PlanVerif {
  const p = planStandard()
  p.mesocycles[0].objectifsPersoIds = ids
  return p
}

function ctxAvecObjectifs(...objectifs: ObjectifPersoVerif[]): ContexteVerif {
  return { ...contexteSansTests(), objectifsPerso: Object.fromEntries(objectifs.map((o) => [o.id, o])) }
}

const DATE_OBJECTIF: Jour = '2027-02-14' // un dimanche

/** Plan en objectif daté : 3 blocs finissant par puissance puis résistance, affûtage les 2 dernières semaines. */
function planDate(surcharges: Partial<PlanVerif> = {}): PlanVerif {
  return planDeBlocs(
    [
      { accent: 'doigts', types: BLOC_STANDARD },
      { accent: 'puissance', types: BLOC_STANDARD },
      { accent: 'resistance', types: ['charge', 'charge', 'affutage', 'affutage'] },
    ],
    { mode: 'objectif_date', objectif: { date: DATE_OBJECTIF, semainesAffutage: 2, reductionVolumePct: 50 }, ...surcharges },
  )
}

describe('verifierStructurePlan', () => {
  it('un plan standard ne produit aucune alerte', () => {
    expect(verifier(planStandard())).toEqual([])
  })

  it('P-01 : 10 semaines en accent tournant', () => {
    const p = planDeBlocs([
      { accent: 'doigts', types: BLOC_STANDARD },
      { accent: 'puissance', types: BLOC_STANDARD },
      { accent: 'resistance', types: ['charge', 'decharge'] },
    ])
    const a = verifier(p)
    expect(codes(a)).toContain('P-01')
    expect(a.find((x) => x.code === 'P-01')?.niveau).toBe('information')
    expect(a.find((x) => x.code === 'P-01')?.message).toBe(
      "Ton cycle s'écarte du format 12 semaines en 3 phases de 4. C'est possible, mais les repères de l'app sont faits pour ce format.",
    )
  })

  it('P-01 : ne se déclenche pas en objectif daté', () => {
    const p = planDeBlocs([{ accent: 'puissance', types: BLOC_STANDARD }], {
      mode: 'objectif_date',
      objectif: { date: '2026-12-06', semainesAffutage: 0, reductionVolumePct: 50 },
    })
    expect(codes(verifier(p))).not.toContain('P-01')
  })

  it('P-01 : un bloc qui n\'a pas 4 semaines', () => {
    const p = planDeBlocs([
      { accent: 'doigts', types: ['charge', 'charge', 'charge', 'decharge', 'decharge'] },
      { accent: 'puissance', types: BLOC_STANDARD },
      { accent: 'resistance', types: ['charge', 'charge', 'decharge'] },
    ])
    expect(codes(verifier(p))).toContain('P-01')
  })

  describe('P-02', () => {
    const blocDe4Charge = (surcharges: Partial<PlanVerif> = {}) =>
      planDeBlocs([{ accent: 'doigts', types: ['charge', 'charge', 'charge', 'charge'] }], surcharges)

    it('4 semaines de charge d\'affilée : alerte forte avec les numéros de semaine', () => {
      const a = verifier(blocDe4Charge()).filter((x) => x.code === 'P-02')
      expect(a).toHaveLength(1)
      expect(a[0].niveau).toBe('fort')
      expect(a[0].message).toBe(
        "4 semaines de charge d'affilée (semaines 1 à 4) : place une semaine allégée après la troisième.",
      )
      expect(a[0].mesocycleOrdre).toBe(1)
    })

    it('décharge désactivée : rien', () => {
      const ctx = contexteDeReference({ fiches: contexteSansTests().fiches, regles: { ...contexteDeReference().regles, dechargeActive: false } })
      expect(codes(verifier(blocDe4Charge(), ctx))).not.toContain('P-02')
    })

    it('une semaine d\'affûtage coupe la suite (numéros comptés dans le plan)', () => {
      const p = planDeBlocs([
        { accent: 'doigts', types: ['decharge', 'charge', 'charge', 'charge'] },
        { accent: 'puissance', types: ['charge', 'charge', 'charge', 'charge', 'affutage', 'charge'] },
      ])
      const a = verifier(p).filter((x) => x.code === 'P-02')
      expect(a).toHaveLength(1)
      expect(a[0].message).toContain('(semaines 2 à 8)')
      expect(a[0].message.startsWith('7 semaines')).toBe(true)
    })
  })

  describe('P-03', () => {
    const troisBlocs = (a: Qualite | null, b: Qualite | null, c: Qualite | null) =>
      planDeBlocs([
        { accent: a, types: BLOC_STANDARD },
        { accent: b, types: BLOC_STANDARD },
        { accent: c, types: BLOC_STANDARD },
      ])

    it('doigts, doigts, résistance : P-03 avec la phase à changer', () => {
      const a = verifier(troisBlocs('doigts', 'doigts', 'resistance')).filter((x) => x.code === 'P-03')
      expect(a).toHaveLength(1)
      expect(a[0].niveau).toBe('information')
      expect(a[0].mesocycleOrdre).toBe(2)
      expect(a[0].message).toBe(
        "Deux phases de suite sur force des doigts : pour la force et la puissance, la BMC conseille 3 à 5 semaines. Change l'accent de la phase 2.",
      )
    })

    it('résistance, résistance, doigts : pas de P-03', () => {
      expect(codes(verifier(troisBlocs('resistance', 'resistance', 'doigts')))).not.toContain('P-03')
    })

    it('un accent null est ignoré', () => {
      expect(codes(verifier(troisBlocs(null, null, 'doigts')))).not.toContain('P-03')
    })
  })

  describe('P-04', () => {
    it('trois blocs résistance (12 semaines) : P-04', () => {
      const p = planDeBlocs([
        { accent: 'resistance', types: BLOC_STANDARD },
        { accent: 'resistance', types: BLOC_STANDARD },
        { accent: 'resistance', types: BLOC_STANDARD },
      ])
      const a = verifier(p).filter((x) => x.code === 'P-04')
      expect(a).toHaveLength(1)
      expect(a[0].niveau).toBe('information')
    })

    it('exactement 8 semaines : rien', () => {
      const p = planDeBlocs([
        { accent: 'resistance', types: BLOC_STANDARD },
        { accent: 'resistance', types: BLOC_STANDARD },
        { accent: 'doigts', types: BLOC_STANDARD },
      ])
      expect(codes(verifier(p))).not.toContain('P-04')
    })

    it('un accent null interrompt la suite', () => {
      const p = planDeBlocs([
        { accent: 'resistance', types: BLOC_STANDARD },
        { accent: null, types: BLOC_STANDARD },
        { accent: 'resistance', types: BLOC_STANDARD },
      ])
      expect(codes(verifier(p))).not.toContain('P-04')
    })
  })

  describe('P-05', () => {
    it('objectif daté sans affûtage : P-05 avec la date en clair', () => {
      const p = planDeBlocs(
        [
          { accent: 'doigts', types: BLOC_STANDARD },
          { accent: 'puissance', types: BLOC_STANDARD },
          { accent: 'resistance', types: BLOC_STANDARD },
        ],
        { mode: 'objectif_date', objectif: { date: DATE_OBJECTIF, semainesAffutage: 2, reductionVolumePct: 50 } },
      )
      const a = verifier(p).filter((x) => x.code === 'P-05')
      expect(a).toHaveLength(1)
      expect(a[0].message).toBe(
        "Ton objectif du 14 février 2027 n'a pas de semaines d'affûtage. Prévois-en 2, avec 40 à 60 % de volume en moins.",
      )
    })

    it('avec des semaines d\'affûtage aux lundis 2027-02-01 et 2027-02-08 : rien', () => {
      const p = planDate({
        semaines: [
          ...planStandard().semaines.slice(0, 10).map((s) => ({ ...s })),
          { lundi: '2027-02-01', type: 'affutage', mesocycleOrdre: 3, numero: 3 },
          { lundi: '2027-02-08', type: 'affutage', mesocycleOrdre: 3, numero: 4 },
        ],
      })
      expect(codes(verifier(p))).not.toContain('P-05')
    })

    it('en accent tournant : jamais', () => {
      expect(codes(verifier(planStandard()))).not.toContain('P-05')
    })
  })

  describe('P-06', () => {
    it('décharge à 30 % : P-06', () => {
      const p = planStandard()
      p.semaines[3].reductionPct = 30
      const a = verifier(p).filter((x) => x.code === 'P-06')
      expect(a).toHaveLength(1)
      expect(a[0].message).toBe('Réduction de 30 % en semaine allégée : le repère est de 40 à 60 %.')
      expect(a[0].lundi).toBe(p.semaines[3].lundi)
    })

    it('affûtage à 70 % : formulation d\'affûtage', () => {
      const p = planDate()
      const affutage = p.semaines.find((s) => s.type === 'affutage') as SemaineVerif
      affutage.reductionPct = 70
      const a = verifier(p).filter((x) => x.code === 'P-06')
      expect(a[0].message).toBe("Réduction de 70 % en semaine d'affûtage : le repère est de 40 à 60 %.")
    })

    it('40 %, 60 % ou sans valeur : rien', () => {
      const p = planStandard()
      p.semaines[3].reductionPct = 40
      p.semaines[7].reductionPct = 60
      expect(codes(verifier(p))).not.toContain('P-06')
    })
  })

  describe('P-07', () => {
    it('objectif daté, doigts, résistance, puissance : P-07', () => {
      const p = planDeBlocs(
        [
          { accent: 'doigts', types: BLOC_STANDARD },
          { accent: 'resistance', types: BLOC_STANDARD },
          { accent: 'puissance', types: ['charge', 'charge', 'affutage', 'affutage'] },
        ],
        { mode: 'objectif_date', objectif: { date: DATE_OBJECTIF, semainesAffutage: 2, reductionVolumePct: 50 } },
      )
      expect(codes(verifier(p))).toContain('P-07')
    })

    it('le dernier bloc n\'est ni puissance ni résistance : P-07', () => {
      const p = planDate()
      p.mesocycles[2].accent = 'doigts'
      expect(codes(verifier(p))).toContain('P-07')
    })

    it('doigts, puissance, résistance : rien', () => {
      expect(codes(verifier(planDate()))).not.toContain('P-07')
    })

    it('en accent tournant ou avec des accents null : rien', () => {
      expect(codes(verifier(planDeBlocs([{ accent: 'resistance', types: BLOC_STANDARD }, { accent: 'puissance', types: BLOC_STANDARD }])))).not.toContain('P-07')
      const p = planDate()
      p.mesocycles.forEach((m) => (m.accent = null))
      expect(codes(verifier(p))).not.toContain('P-07')
    })
  })

  describe('P-08', () => {
    // Poutre intensive : fiche de la bibliothèque marquée `poutre_intensive`.
    const POUTRE = 'doigts-reglette-minimale-lopez'

    it('poutre intensive le 2027-02-12 (2 jours avant) : P-08', () => {
      const s = seanceSolo('poutre', '2027-02-12', [POUTRE])
      const a = verifier(planDate({ seances: [s] })).filter((x) => x.code === 'P-08')
      expect(a).toHaveLength(1)
      expect(a[0].seanceId).toBe('poutre')
      expect(a[0].message).toBe('Pas de poutre intensive dans les 3 jours avant ton objectif : tes doigts doivent arriver frais.')
    })

    it('le 2027-02-10 (4 jours avant) : rien', () => {
      const s = seanceSolo('poutre', '2027-02-10', [POUTRE])
      expect(codes(verifier(planDate({ seances: [s] })))).not.toContain('P-08')
    })

    it('le jour même : P-08 ; après l\'objectif : rien', () => {
      const jour = seanceSolo('jour', '2027-02-14', [POUTRE])
      const apres = seanceSolo('apres', '2027-02-15', [POUTRE])
      expect(codes(verifier(planDate({ seances: [jour] })))).toContain('P-08')
      expect(codes(verifier(planDate({ seances: [apres] })))).not.toContain('P-08')
    })
  })

  describe('P-09', () => {
    it('aucune fiche de test : rien (inactive)', () => {
      expect(codes(verifier(planStandard()))).not.toContain('P-09')
    })

    it('avec la bibliothèque actuelle (fiches de test présentes), un plan sans test déclenche P-09 sur chaque phase', () => {
      const a = verifier(planStandard(), contexteDeReference()).filter((x) => x.code === 'P-09')
      expect(a.map((x) => x.mesocycleOrdre)).toEqual([1, 2, 3])
    })

    it('avec une fiche de test : un bloc sans test en dernière semaine déclenche P-09', () => {
      const base = contexteDeReference()
      const test: FicheVerif = { ...base.fiches['echauffement-general'], id: 'test-repere', nom: 'Test repère', estTest: true }
      const ctx = contexteDeReference({ fiches: { ...base.fiches, [test.id]: test } })
      // Le bloc 1 a son test dans sa dernière semaine (4e), pas les blocs 2 et 3.
      const p = planStandard({ seances: [seanceSolo('test', '2026-11-24', ['test-repere'], { fiches: ctx.fiches })] })
      p.seances[0].date = p.semaines[3].lundi
      const a = verifier(p, ctx).filter((x) => x.code === 'P-09')
      expect(a.map((x) => x.mesocycleOrdre)).toEqual([2, 3])
      expect(a[0].message).toBe(
        "La phase 2 n'a pas de test en fin de semaine allégée. Ajoute au moins tes tractions strictes et un bloc repère pour voir tes progrès.",
      )
    })
  })

  it('P-10 : 3 objectifs spécifiques sur un bloc', () => {
    const ctx = ctxAvecObjectifs(objectif('a'), objectif('b'), objectif('c'))
    const a = verifier(planAvecObjectifs(['a', 'b', 'c']), ctx).filter((x) => x.code === 'P-10')
    expect(a).toHaveLength(1)
    expect(a[0].message).toBe("3 objectifs spécifiques sur cette phase : 2 au plus, pour qu'ils restent courts.")
    expect(a[0].mesocycleOrdre).toBe(1)
    expect(codes(verifier(planAvecObjectifs(['a', 'b']), ctx))).not.toContain('P-10')
  })

  describe('P-11', () => {
    it('deux objectifs portant poutre : P-11', () => {
      const ctx = ctxAvecObjectifs(
        objectif('front', { nom: 'Front lever', marqueurs: ['poutre'] }),
        objectif('planche', { nom: 'Planche', marqueurs: ['poutre', 'arque'] }),
      )
      const a = verifier(planAvecObjectifs(['front', 'planche']), ctx).filter((x) => x.code === 'P-11')
      expect(a).toHaveLength(1)
      expect(a[0].message).toBe('« Front lever » et « Planche » comptent dans le même quota (poutre). Garde-en un pour cette phase.')
    })

    it('deux objectifs portant poutre_intensive : le libellé, jamais l\'identifiant brut', () => {
      const ctx = ctxAvecObjectifs(
        objectif('a', { nom: 'Traversée', marqueurs: ['poutre_intensive'] }),
        objectif('b', { nom: 'Chute', marqueurs: ['poutre_intensive'] }),
      )
      const a = verifier(planAvecObjectifs(['a', 'b']), ctx).filter((x) => x.code === 'P-11')
      expect(a[0].message).toBe('« Traversée » et « Chute » comptent dans le même quota (poutre intensive). Garde-en un pour cette phase.')
    })

    it('trois objectifs portant poutre : trois P-11 de sujets distincts', () => {
      const ctx = ctxAvecObjectifs(
        objectif('a', { marqueurs: ['poutre'] }),
        objectif('b', { marqueurs: ['poutre'] }),
        objectif('c', { marqueurs: ['poutre'] }),
      )
      const a = verifier(planAvecObjectifs(['a', 'b', 'c']), ctx).filter((x) => x.code === 'P-11')
      expect(a.map((x) => x.sujet)).toEqual(['a+b', 'a+c', 'b+c'])
    })

    it('un marqueur hors quota partagé, ou quotas différents : rien', () => {
      const ctx = ctxAvecObjectifs(
        objectif('a', { marqueurs: ['arque'] }),
        objectif('b', { marqueurs: ['arque'] }),
        objectif('c', { marqueurs: ['poutre'] }),
      )
      expect(codes(verifier(planAvecObjectifs(['a', 'b', 'c']), ctx))).not.toContain('P-11')
    })
  })

  describe('P-12', () => {
    it('prérequis non remplis : P-12 fort', () => {
      const ctx = contexteDeReference({
        fiches: contexteSansTests().fiches,
        profil: { ...contexteDeReference().profil, tractionsStrictesMax: 6 },
        objectifsPerso: { os: objectif('os', { nom: 'Traction lestée', prerequis: { tractionsStrictesMin: 10 }, remplacementNom: 'Traction simple' }) },
      })
      const a = verifier(planAvecObjectifs(['os']), ctx).filter((x) => x.code === 'P-12')
      expect(a).toHaveLength(1)
      expect(a[0].niveau).toBe('fort')
      expect(a[0].message).toBe(
        "L'objectif « Traction lestée » ne te convient pas aujourd'hui : 10 tractions strictes (tu en fais 6). Essaie plutôt « Traction simple ».",
      )
    })

    it('douleur déclarée sur une zone contre-indiquée : P-12, sans remplacement', () => {
      const base = contexteDeReference()
      const ctx = contexteDeReference({
        fiches: contexteSansTests().fiches,
        profil: { ...base.profil, douleursEnCours: ['coude'] },
        objectifsPerso: { os: objectif('os', { nom: 'Levier', contreIndications: ['coude'] }) },
      })
      const a = verifier(planAvecObjectifs(['os']), ctx).filter((x) => x.code === 'P-12')
      expect(a[0].message).toBe("L'objectif « Levier » ne te convient pas aujourd'hui : douleur déclarée (coude).")
    })

    it('manques et douleur ensemble : raisons jointes par « ; »', () => {
      const base = contexteDeReference()
      const ctx = contexteDeReference({
        fiches: contexteSansTests().fiches,
        profil: { ...base.profil, tractionsStrictesMax: 6, douleursEnCours: ['coude'] },
        objectifsPerso: { os: objectif('os', { prerequis: { tractionsStrictesMin: 10 }, contreIndications: ['coude'] }) },
      })
      const a = verifier(planAvecObjectifs(['os']), ctx).filter((x) => x.code === 'P-12')
      expect(a[0].message).toContain('10 tractions strictes (tu en fais 6) ; douleur déclarée (coude)')
    })

    it('deux objectifs inadaptés : deux P-12 de sujets distincts', () => {
      const ctx = contexteDeReference({
        fiches: contexteSansTests().fiches,
        profil: { ...contexteDeReference().profil, tractionsStrictesMax: 6 },
        objectifsPerso: {
          o1: objectif('o1', { prerequis: { tractionsStrictesMin: 10 } }),
          o2: objectif('o2', { prerequis: { tractionsStrictesMin: 10 } }),
        },
      })
      const a = verifier(planAvecObjectifs(['o1', 'o2']), ctx).filter((x) => x.code === 'P-12')
      expect(a.map((x) => x.sujet)).toEqual(['o1', 'o2'])
    })

    it('objectif adapté : rien', () => {
      const ctx = ctxAvecObjectifs(objectif('os', { prerequis: { tractionsStrictesMin: 10 } }))
      expect(codes(verifier(planAvecObjectifs(['os']), ctx))).not.toContain('P-12')
    })
  })

  it('P-13 : plan à 4 séances, profil à 3', () => {
    const a = verifier(planStandard({ seancesParSemaine: 4 })).filter((x) => x.code === 'P-13')
    expect(a).toHaveLength(1)
    expect(a[0].message).toBe("Ton plan compte 4 séances par semaine, ton profil 3. Mets-les d'accord.")
    expect(codes(verifier(planStandard({ seancesParSemaine: 3 })))).not.toContain('P-13')
  })

  describe('P-14', () => {
    const finDuPlan = (p: PlanVerif) => ajouterJours(p.semaines[p.semaines.length - 1].lundi, 6)

    it('cycle suivant le lendemain de la fin du plan, sans transition : P-14', () => {
      const p = planStandard()
      p.cycleSuivantDebut = ajouterJours(finDuPlan(p), 1)
      expect(codes(verifier(p))).toContain('P-14')
    })

    it('avec une semaine de transition en fin de plan : rien', () => {
      const p = planStandard()
      p.semaines[11].type = 'transition'
      p.cycleSuivantDebut = ajouterJours(finDuPlan(p), 1)
      expect(codes(verifier(p))).not.toContain('P-14')
    })

    it('cycle suivant 7 jours après la fin, ou non défini : rien', () => {
      const p = planStandard()
      expect(codes(verifier(p))).not.toContain('P-14')
      p.cycleSuivantDebut = ajouterJours(finDuPlan(p), 7)
      expect(codes(verifier(p))).not.toContain('P-14')
    })
  })

  describe('P-15', () => {
    const detaillee = (id: string, date: Jour): SeanceVerif =>
      seanceSolo(id, date, ['echauffement-general', 'puissance-bloc-limite'])

    it('une séance aux étapes résumées : P-15 avec n = 1', () => {
      const resumee = detaillee('resumee', '2026-11-03')
      resumee.solo.etapesDetaillees = false
      const a = verifier(planStandard({ seances: [detaillee('a', '2026-11-04'), resumee] })).filter((x) => x.code === 'P-15')
      expect(a).toHaveLength(1)
      expect(a[0].niveau).toBe('information')
      expect(a[0].message.startsWith("1 séance n'a pas d'étapes détaillées")).toBe(true)
    })

    it('séances sans exercice connu : comptées, une seule alerte', () => {
      const vides = [1, 2].map((i) => {
        const s = detaillee(`vide${i}`, `2026-11-0${i + 2}`)
        s.solo.etapes = []
        return s
      })
      const a = verifier(planStandard({ seances: vides })).filter((x) => x.code === 'P-15')
      expect(a).toHaveLength(1)
      expect(a[0].message.startsWith('2 séances')).toBe(true)
    })

    it('plan de séances détaillées : rien', () => {
      expect(codes(verifier(planStandard({ seances: [detaillee('a', '2026-11-04')] })))).not.toContain('P-15')
    })
  })
})
