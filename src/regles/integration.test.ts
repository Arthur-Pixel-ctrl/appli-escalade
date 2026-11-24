// Tests d'intégration du moteur (moteur-verification.md, B.11) : chaque cas passe par les points d'entrée de index.ts.
import { describe, expect, it } from 'vitest'
import { protocoleParId } from '../donnees/bibliotheque/index.ts'
import type { PartieSeance, SeancePlanifiee } from '../donnees/modele.ts'
import { EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import { fichesDeLaBibliotheque } from './adaptateur.ts'
import { contexteDeReference, PROFIL_DE_REFERENCE, seanceSolo } from './exemples.ts'
import { etapeDepuisProtocole, formeAffichage, seanceVersVerif } from './passerelles.ts'
import {
  cleAvertissement,
  verifierJour,
  verifierPlan,
  verifierSeance,
  verifierSemaine,
  type Avertissement,
  type ContexteVerif,
  type Jour,
  type PlanVerif,
  type SeanceVerif,
  type SemaineVerif,
} from './index.ts'

const ECHAUFFEMENT = 'echauffement-general'
const L1 = '2026-11-23'

// Déroulés de seances-types.md, versions solo.
const ST_DOI_02 = ['echauffement-general', 'echauffement-doigts-poutre', 'doigts-reglette-minimale-lopez', 'puissance-bloc-limite', 'antagonistes-lattice']
const ST_TRA_02 = ['echauffement-general', 'puissance-bloc-limite', 'traction-lestee-force-lattice', 'antagonistes-lattice']
const ST_END_02 = ['echauffement-general', 'technique-tout-en-drapeau', 'endurance-1-on-1-off', 'endurance-continuite-fin-de-seance', 'antagonistes-legers']

function semaine(lundi: Jour, type: SemaineVerif['type'] = 'charge', extra: Partial<SemaineVerif> = {}): SemaineVerif {
  return { lundi, type, mesocycleOrdre: 1, numero: 1, ...extra }
}

function plan(semaines: SemaineVerif[], seances: SeanceVerif[], surcharges: Partial<PlanVerif> = {}): PlanVerif {
  return {
    origine: 'utilisateur',
    debut: semaines[0]?.lundi ?? L1,
    nbSemaines: semaines.length,
    seancesParSemaine: 3,
    mode: 'accent_tournant',
    mesocycles: [{ ordre: 1, accent: 'doigts', objectifsPersoIds: [] }],
    semaines,
    seances,
    ...surcharges,
  }
}

/** Semaine de référence du cas 1 (profil par défaut, règles par défaut). */
function semaineConforme(): SeanceVerif[] {
  return [
    seanceSolo('doi', '2026-11-24', ST_DOI_02, { nom: 'Doigts : réglette minimale + bloc limite', qualite: 'doigts', durete: 'dure' }),
    seanceSolo('tra', '2026-11-26', ST_TRA_02, { nom: 'Traction : bloc limite + tractions lestées', qualite: 'traction_gainage', durete: 'dure' }),
    seanceSolo('end', '2026-11-28', ST_END_02, { nom: 'Endurance : 1 min / 1 min', qualite: 'endurance', durete: 'legere' }),
  ]
}

/** « Avec verifierSemaine et verifierSeance sur chaque séance » (B.11, cas 1 à 3). */
function toutVerifier(seances: SeanceVerif[], ctx: ContexteVerif = contexteDeReference(), lundi: Jour = L1): Avertissement[] {
  return [
    ...verifierSemaine(lundi, plan([semaine(lundi)], seances), ctx),
    ...seances.flatMap((s) => verifierSeance(s, ctx)),
  ]
}

const codes = (alertes: Avertissement[]) => alertes.map((a) => a.code)
const seulement = (alertes: Avertissement[], code: string) => alertes.filter((a) => a.code === code)

describe('B.11 : cas 1 à 12', () => {
  it('cas 1 : semaine conforme, aucun avertissement', () => {
    expect(toutVerifier(semaineConforme())).toEqual([])
  })

  it('cas 2 : deux maximales de suite, W-01 fort sur la séance du 25', () => {
    const [doi, tra, end] = semaineConforme()
    const alertes = toutVerifier([doi, { ...tra, date: '2026-11-25' }, end])
    const w01 = seulement(alertes, 'W-01')
    expect(w01.length).toBeGreaterThan(0)
    expect(w01.every((a) => a.niveau === 'fort' && a.seanceId === 'tra')).toBe(true)
    expect(codes(alertes).filter((c) => c !== 'W-01')).toEqual([])
  })

  it('cas 3 : frontière de semaine, W-01 fort sur la séance du 30', () => {
    const seances = [
      seanceSolo('dim', '2026-11-29', ['echauffement-general', 'puissance-bloc-limite'], { durete: 'dure' }),
      seanceSolo('lun', '2026-11-30', ['echauffement-general', 'puissance-bloc-limite'], { durete: 'dure' }),
    ]
    const p = plan([semaine(L1), semaine('2026-11-30')], seances)
    const ctx = contexteDeReference()
    const w01 = [...verifierSemaine(L1, p, ctx), ...verifierSemaine('2026-11-30', p, ctx)].filter((a) => a.code === 'W-01')
    expect(w01).toHaveLength(1)
    expect(w01[0]).toMatchObject({ niveau: 'fort', seanceId: 'lun' })
    // Une seule fois aussi sur tout le plan.
    expect(seulement(verifierPlan(p, ctx), 'W-01')).toHaveLength(1)
  })

  it('cas 4 : poutre intensive lundi, mercredi, vendredi : W-02 fort, W-01 muet', () => {
    const poutre = (id: string, date: Jour) => seanceSolo(id, date, [ECHAUFFEMENT, 'doigts-reglette-minimale-lopez'], { durete: 'dure', qualite: 'doigts' })
    const alertes = verifierSemaine(L1, plan([semaine(L1)], [poutre('a', '2026-11-23'), poutre('b', '2026-11-25'), poutre('c', '2026-11-27')]), contexteDeReference())
    expect(seulement(alertes, 'W-02')).toHaveLength(1)
    expect(seulement(alertes, 'W-02')[0].niveau).toBe('fort')
    expect(seulement(alertes, 'W-01')).toEqual([])
  })

  it('cas 5 : tractions strictes non renseignées, S-03 fort avec « (non renseigné) »', () => {
    const ctx = contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, tractionsStrictesMax: null } })
    const s = seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'traction-lestee-force-lattice'])
    const s03 = seulement(verifierSeance(s, ctx), 'S-03')
    expect(s03.length).toBeGreaterThan(0)
    expect(s03[0].niveau).toBe('fort')
    expect(s03[0].message).toContain('10 tractions strictes (non renseigné)')
  })

  it('cas 6 : douleur aux doigts, S-04 fort sur puissance-bloc-limite', () => {
    const ctx = contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, douleursEnCours: ['doigts'] } })
    const s = seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'puissance-bloc-limite'])
    const s04 = seulement(verifierSeance(s, ctx), 'S-04')
    expect(s04.length).toBeGreaterThan(0)
    expect(s04.every((a) => a.niveau === 'fort')).toBe(true)
    // Le jour même, S-04 reste visible (signal d'arrêt).
    expect(codes(verifierJour(s, contexteDeReference({ aujourdhui: '2026-11-24', profil: ctx.profil }), []))).toContain('S-04')
  })

  describe('cas 7 : semaine allégée', () => {
    /** Trois semaines de charge (1 500, 1 600, 1 700), puis une semaine allégée de `charge`. */
    const planAllege = (charge: number) => {
      const lundis = ['2026-11-02', '2026-11-09', '2026-11-16', L1]
      const ballast = (id: string, date: Jour, c: number) =>
        seanceSolo(id, date, [ECHAUFFEMENT], { qualite: 'technique', durete: 'legere', effortPrevu: 10, dureeMin: c / 10 })
      return plan(
        [semaine(lundis[0], 'charge', { numero: 1 }), semaine(lundis[1], 'charge', { numero: 2 }), semaine(lundis[2], 'charge', { numero: 3 }), semaine(lundis[3], 'decharge', { numero: 4, reductionPct: 50 })],
        [ballast('a', '2026-11-03', 1500), ballast('b', '2026-11-10', 1600), ballast('c', '2026-11-17', 1700), ballast('d', '2026-11-24', charge)],
      )
    }
    const w10 = (charge: number) => seulement(verifierSemaine(L1, planAllege(charge), contexteDeReference()), 'W-10')

    it('1 500 : W-10 fort', () => {
      expect(w10(1500).map((a) => a.niveau)).toEqual(['fort'])
    })
    it('1 000 : W-10 information', () => {
      expect(w10(1000).map((a) => a.niveau)).toEqual(['information'])
    })
    it('950 : rien', () => {
      expect(w10(950)).toEqual([])
    })
  })

  it('cas 8 : bloc de 4 semaines de charge, P-02 fort', () => {
    const lundis = ['2026-11-02', '2026-11-09', '2026-11-16', L1]
    const p = plan(lundis.map((l, i) => semaine(l, 'charge', { numero: i + 1 })), [])
    const p02 = seulement(verifierPlan(p, contexteDeReference()), 'P-02')
    expect(p02).toHaveLength(1)
    expect(p02[0].niveau).toBe('fort')
  })

  describe('cas 9 : hausse de charge', () => {
    const ballast = (id: string, date: Jour, c: number) =>
      seanceSolo(id, date, [ECHAUFFEMENT], { qualite: 'technique', durete: 'legere', effortPrevu: 10, dureeMin: c / 10 })
    const w09 = (charge2: number) => {
      const p = plan([semaine('2026-11-16', 'charge', { numero: 1 }), semaine(L1, 'charge', { numero: 2 })], [ballast('a', '2026-11-17', 1500), ballast('b', '2026-11-24', charge2)])
      return seulement(verifierSemaine(L1, p, contexteDeReference()), 'W-09')
    }
    it('1 500 puis 1 700 : information (+13 %)', () => {
      expect(w09(1700).map((a) => a.niveau)).toEqual(['information'])
    })
    it('1 500 puis 1 640 : rien (+9 %)', () => {
      expect(w09(1640)).toEqual([])
    })
  })

  describe('cas 10 : repos raccourci', () => {
    const avecRepos = (ficheId: string, reposS?: number) => {
      const s = seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, ficheId])
      if (reposS !== undefined) s.solo.etapes[1].reglages = { reposS }
      return s
    }
    const s15 = (s: SeanceVerif) => seulement(verifierSeance(s, contexteDeReference()), 'S-15')
    it('suspensions max lestées avec 120 s : S-15 fort', () => {
      expect(s15(avecRepos('doigts-suspensions-max-lestees', 120)).map((a) => a.niveau)).toEqual(['fort'])
    })
    it('7/53 sans réglage (53 s) : rien', () => {
      expect(s15(avecRepos('doigts-7-53-horst'))).toEqual([])
    })
    it('7/53 avec 40 s : S-15 fort', () => {
      expect(s15(avecRepos('doigts-7-53-horst', 40)).map((a) => a.niveau)).toEqual(['fort'])
    })
  })

  it('cas 11 : résistance puis puissance dans la même séance, S-12 fort', () => {
    const s = seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'resistance-boulder-triples', 'puissance-bloc-limite'])
    const s12 = seulement(verifierSeance(s, contexteDeReference()), 'S-12')
    expect(s12.map((a) => a.niveau)).toEqual(['fort'])
  })

  it('cas 12 : plan de l\'assistant avec puissance-pan-gullich-stien, S-02 fort et S-03 fort', () => {
    const s = seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'puissance-pan-gullich-stien'])
    const p = plan([semaine(L1)], [s], { origine: 'assistant' })
    const alertes = verifierPlan(p, contexteDeReference())
    expect(seulement(alertes, 'S-02').map((a) => a.niveau)).toEqual(['fort'])
    expect(seulement(alertes, 'S-03').map((a) => a.niveau)).toEqual(['fort'])
    // Même résultat par la séance seule, avec l'origine de l'assistant.
    expect(codes(verifierSeance(s, contexteDeReference(), 'assistant'))).toEqual(expect.arrayContaining(['S-02', 'S-03']))
  })
})

describe('B.11 : niveaux de détail (cas 13 à 16)', () => {
  it('cas 13 : le cas 1 au niveau simple, aucun avertissement', () => {
    const seances = semaineConforme().map((s) => ({ ...s, solo: { ...s.solo, niveau: 'simple' as const } }))
    expect(toutVerifier(seances)).toEqual([])
  })

  /** Le cas 1 dont la séance du jeudi devient une séance du mercredi 25 sans étapes (cas 14). */
  const seanceDureSansContenu = (): SeanceVerif => ({
    id: 'tra',
    nom: 'Séance dure sans contenu',
    date: '2026-11-25',
    qualite: 'traction_gainage',
    solo: { durete: 'dure', etapes: [], dureeMin: 90 },
  })

  it('cas 14 : séance dure sans contenu, S-26 information seul, sans W-01', () => {
    const [doi, , end] = semaineConforme()
    const alertes = toutVerifier([doi, seanceDureSansContenu(), end])
    expect(codes(alertes)).toEqual(['S-26'])
    expect(alertes[0]).toMatchObject({ niveau: 'information', seanceId: 'tra' })
  })

  it('cas 15 : exercice principal résumé traction-simple-4x5, ni W-01 ni S-26 ni S-10', () => {
    const [doi, , end] = semaineConforme()
    const s = seanceDureSansContenu()
    s.solo = { durete: 'dure', etapes: [{ ficheId: 'traction-simple-4x5', reglages: { dureeMin: 90 } }], etapesDetaillees: false, dureeMin: 90 }
    expect(toutVerifier([doi, s, end])).toEqual([])
  })

  it('cas 15 variante : traction lestée (maximale), W-01 fort sur la séance du 25, S-26 et S-10 muets', () => {
    const [doi, , end] = semaineConforme()
    const s = seanceDureSansContenu()
    s.solo = { durete: 'dure', etapes: [{ ficheId: 'traction-lestee-force-lattice', reglages: { dureeMin: 90 } }], etapesDetaillees: false, dureeMin: 90 }
    const alertes = toutVerifier([doi, s, end])
    const w01 = seulement(alertes, 'W-01')
    expect(w01.length).toBeGreaterThan(0)
    expect(w01.every((a) => a.niveau === 'fort' && a.seanceId === 'tra')).toBe(true)
    expect(codes(alertes)).not.toContain('S-26')
    expect(codes(alertes)).not.toContain('S-10')
  })

  describe('cas 16 : repos raccourci selon le niveau', () => {
    const avecNiveau = (niveau: 'grandes_lignes' | 'detaille') => {
      const s = seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'doigts-suspensions-max-lestees'])
      s.solo.etapes[1].reglages = { reposS: 120 }
      s.solo.niveau = niveau
      return s
    }
    it('grandes lignes : S-15 muet', () => {
      expect(seulement(verifierSeance(avecNiveau('grandes_lignes'), contexteDeReference()), 'S-15')).toEqual([])
    })
    it('détaillé : S-15 fort', () => {
      expect(seulement(verifierSeance(avecNiveau('detaille'), contexteDeReference()), 'S-15').map((a) => a.niveau)).toEqual(['fort'])
    })
  })

  it('le plan de 12 semaines du cas 1 au niveau simple (étapes gardées) donne les mêmes avertissements, sauf S-15', () => {
    const lundis = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 10, 23 + i * 7))
      return d.toISOString().slice(0, 10)
    })
    const semaines = lundis.map((l, i) => semaine(l, i % 4 === 3 ? 'decharge' : 'charge', { mesocycleOrdre: Math.floor(i / 4) + 1, numero: (i % 4) + 1 }))
    const decaler = (jour: Jour, n: number) => new Date(Date.UTC(+jour.slice(0, 4), +jour.slice(5, 7) - 1, +jour.slice(8) + n)).toISOString().slice(0, 10)
    // Un défaut réel par semaine pour que la comparaison ne porte pas sur du vide : repos raccourci (S-15) et deux maximales de suite (W-01).
    const seances = lundis.flatMap((l, i) => {
      const doi = seanceSolo(`doi${i}`, decaler(l, 1), ST_DOI_02, { qualite: 'doigts', durete: 'dure' })
      const tra = seanceSolo(`tra${i}`, decaler(l, i === 0 ? 2 : 3), ST_TRA_02, { qualite: 'traction_gainage', durete: 'dure' })
      const end = seanceSolo(`end${i}`, decaler(l, 5), ST_END_02, { qualite: 'endurance', durete: 'legere' })
      if (i === 1) doi.solo.etapes[2].reglages = { reposS: 120 } // S-15 au niveau détaillé seulement
      return [doi, tra, end]
    })
    const mesocycles = [1, 2, 3].map((ordre) => ({ ordre, accent: 'doigts' as const, objectifsPersoIds: [] }))
    const ctx = contexteDeReference()
    const enDetaille = verifierPlan(plan(semaines, seances, { mesocycles }), ctx)
    const enSimple = verifierPlan(
      plan(semaines, seances.map((s) => ({ ...s, solo: { ...s.solo, niveau: 'simple' as const } })), { mesocycles }),
      ctx,
    )
    expect(codes(enDetaille)).toContain('S-15') // le défaut est bien vu en détaillé
    expect(codes(enDetaille)).toContain('W-01')
    expect(enSimple).toEqual(enDetaille.filter((a) => a.code !== 'S-15'))
  })
})

describe('B.11 : W-20 et unicité (cas 17 et 18)', () => {
  const VOIES = 'resistance-voies-repetees'
  const CIRCUIT = 'resistance-circuits-30-mouvements'
  const deuxSeances = () => [seanceSolo('a', '2026-11-24', [VOIES]), seanceSolo('b', '2026-11-26', [CIRCUIT])]
  const w20 = (seances: SeanceVerif[], ctx = contexteDeReference()) =>
    verifierSemaine(L1, plan([semaine(L1)], seances), ctx).filter((a) => a.code === 'W-20' || a.code === 'W-05')
  const voie = () => contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, disciplinePrincipale: 'voie' } })

  it('cas 17 : profil bloc, W-20 fort avec son message, W-05 muet', () => {
    const alertes = w20(deuxSeances())
    expect(codes(alertes)).toEqual(['W-20'])
    expect(alertes[0].niveau).toBe('fort')
    expect(alertes[0].message).toBe(
      '2 séances de résistance en voie cette semaine : 1 au plus avec un profil « bloc ». Garde-en une et fais le reste en bloc, ou change ton profil si ton objectif devient la voie.',
    )
  })

  it('cas 17 (a) : profil voie, W-20 muet ; avec une troisième séance, W-20 fort', () => {
    expect(w20(deuxSeances(), voie())).toEqual([])
    const trois = [...deuxSeances(), seanceSolo('c', '2026-11-28', ['resistance-capacity-power'])]
    const alertes = w20(trois, voie())
    expect(alertes.map((a) => a.code)).toEqual(['W-20'])
    expect(alertes[0].message).toBe("3 séances de résistance en voie cette semaine : 2 au plus. Remplace la dernière par de l'endurance ou de la technique.")
  })

  describe('cas 17 (b) : séance prévue ou réalisée', () => {
    const avecGroupe = (): SeanceVerif => {
      const s = seanceSolo('b', '2026-11-26', ['resistance-boulder-triples'])
      s.groupe = { durete: 'dure', etapes: [{ ficheId: CIRCUIT }] }
      return s
    }
    it('prévue : W-20 fort', () => {
      expect(codes(w20([seanceSolo('a', '2026-11-24', [VOIES]), avecGroupe()]))).toEqual(['W-20'])
    })
    it('réalisée en solo sans marqueur : W-20 muet', () => {
      const faite = avecGroupe()
      faite.realisee = { version: 'solo', finLe: '2026-11-26T19:00:00.000Z', dureeMin: 60, effortPercu: 7, marqueurs: [] }
      expect(w20([seanceSolo('a', '2026-11-24', [VOIES]), faite])).toEqual([])
    })
  })

  it('cas 17 (c) : dimanche 29 et lundi 30, deux semaines du calendrier, W-20 muet', () => {
    const seances = [seanceSolo('a', '2026-11-29', [VOIES]), seanceSolo('b', '2026-11-30', [CIRCUIT])]
    const p = plan([semaine(L1), semaine('2026-11-30', 'charge', { mesocycleOrdre: 2, numero: 1 })], seances, {
      mesocycles: [{ ordre: 1, accent: 'doigts', objectifsPersoIds: [] }, { ordre: 2, accent: 'puissance', objectifsPersoIds: [] }],
    })
    const ctx = contexteDeReference()
    expect(seulement([...verifierSemaine(L1, p, ctx), ...verifierSemaine('2026-11-30', p, ctx)], 'W-20')).toEqual([])
    expect(seulement(verifierPlan(p, ctx), 'W-20')).toEqual([])
  })

  describe('cas 18 : deux alertes du même code pour la même cible', () => {
    const ctxObjectifs = () =>
      contexteDeReference({
        objectifsPerso: {
          o1: { id: 'o1', nom: 'Réglettes de 10 mm', marqueurs: [], prerequis: {}, contreIndications: [] },
          o2: { id: 'o2', nom: 'Poches', marqueurs: [], prerequis: {}, contreIndications: [] },
        },
      })
    const planObjectifs = () =>
      plan([semaine(L1)], semaineConforme(), { mesocycles: [{ ordre: 1, accent: 'doigts', objectifsPersoIds: ['o1', 'o2'] }] })

    it('deux W-18 (sujets o1 et o2) par verifierSemaine, avec des clés différentes', () => {
      const w18 = seulement(verifierSemaine(L1, planObjectifs(), ctxObjectifs()), 'W-18')
      expect(w18.map((a) => a.sujet).sort()).toEqual(['o1', 'o2'])
      expect(w18.find((a) => a.sujet === 'o1')?.message).toContain('Réglettes de 10 mm')
      expect(w18.find((a) => a.sujet === 'o2')?.message).toContain('Poches')
      expect(new Set(w18.map(cleAvertissement)).size).toBe(2)
    })

    it('deux W-18 aussi par verifierPlan', () => {
      expect(seulement(verifierPlan(planObjectifs(), ctxObjectifs()), 'W-18')).toHaveLength(2)
    })

    /** Samedi : antagonistes-lattice au lieu des légers ; mobilité en fin des trois séances. */
    const seancesW05 = () => {
      const [doi, tra, end] = semaineConforme()
      end.solo.etapes[end.solo.etapes.length - 1] = { ficheId: 'antagonistes-lattice' }
      return [doi, tra, end].map((s) => {
        s.solo.etapes.push({ ficheId: 'mobilite-grand-ecart-lattice' })
        return s
      })
    }

    it('deux W-05 (sujets antagonistes-lattice et mobilite-grand-ecart-lattice) par verifierSemaine', () => {
      const w05 = seulement(verifierSemaine(L1, plan([semaine(L1)], seancesW05()), contexteDeReference()), 'W-05')
      expect(w05.map((a) => a.sujet).sort()).toEqual(['antagonistes-lattice', 'mobilite-grand-ecart-lattice'])
      expect(w05.every((a) => a.niveau === 'information')).toBe(true)
      expect(new Set(w05.map(cleAvertissement)).size).toBe(2)
    })

    it('deux W-05 aussi par verifierPlan', () => {
      expect(seulement(verifierPlan(plan([semaine(L1)], seancesW05()), contexteDeReference()), 'W-05')).toHaveLength(2)
    })
  })
})

describe('dédoublonnage et tri', () => {
  it('le dédoublonnage ne retire que les vrais doublons (même code, même cible, même sujet)', () => {
    const alertes = verifierPlan(plan([semaine(L1)], semaineConforme()), contexteDeReference())
    const cles = alertes.map((a) => [a.code, a.seanceId, a.version, a.etapeIndex, a.lundi, a.mesocycleOrdre, a.sujet].map((v) => v ?? '').join('|'))
    expect(new Set(cles).size).toBe(cles.length)
  })

  it('un fort sort avant une information même si l\'information est plus ancienne', () => {
    const seances = [
      // 24 : information (S-26, séance dure sans contenu)
      { id: 'sans', nom: 'Sans contenu', date: '2026-11-24', qualite: 'traction_gainage', solo: { durete: 'dure', etapes: [], dureeMin: 60 } } as SeanceVerif,
      // 25 et 26 : deux maximales de suite, W-01 fort le 26
      seanceSolo('m1', '2026-11-25', [ECHAUFFEMENT, 'puissance-bloc-limite'], { durete: 'dure' }),
      seanceSolo('m2', '2026-11-26', [ECHAUFFEMENT, 'puissance-bloc-limite'], { durete: 'dure' }),
    ]
    const alertes = verifierSemaine(L1, plan([semaine(L1)], seances), contexteDeReference())
    const iFort = alertes.findIndex((a) => a.code === 'W-01')
    const iInfo = alertes.findIndex((a) => a.code === 'S-26' || a.niveau === 'information')
    expect(iFort).toBeGreaterThanOrEqual(0)
    expect(alertes[iFort].seanceId).toBe('m2')
    expect(iInfo).toBeGreaterThan(iFort)
  })

  it('à niveau égal : par date, puis par code', () => {
    const seances = [
      seanceSolo('tard', '2026-11-27', [ECHAUFFEMENT, 'puissance-bloc-limite'], { durete: 'dure', qualite: 'puissance' }),
      seanceSolo('tot', '2026-11-24', [ECHAUFFEMENT, 'puissance-bloc-limite'], { durete: 'dure', qualite: 'puissance' }),
    ]
    const ctx = contexteDeReference({ profil: { ...PROFIL_DE_REFERENCE, douleursEnCours: ['doigts'] } })
    const alertes = seulement(verifierPlan(plan([semaine(L1)], seances), ctx), 'S-04')
    expect(alertes.map((a) => a.seanceId)).toEqual(['tot', 'tard'])
  })

  it('aucun avertissement de sécurité ne disparaît : deux W-18 de sujets différents restent deux', () => {
    const ctx = contexteDeReference({
      objectifsPerso: {
        a: { id: 'a', nom: 'A', marqueurs: [], prerequis: {}, contreIndications: [] },
        b: { id: 'b', nom: 'B', marqueurs: [], prerequis: {}, contreIndications: [] },
      },
    })
    const p = plan([semaine(L1)], semaineConforme(), { mesocycles: [{ ordre: 1, accent: 'doigts', objectifsPersoIds: ['a', 'b'] }] })
    expect(seulement(verifierSemaine(L1, p, ctx), 'W-18')).toHaveLength(2)
  })

  it('un champ absent compte comme vide : deux alertes sans sujet ni cible du même code se confondent', () => {
    // W-01 se calcule une seule fois sur la frise : une alerte par séance, pas une par semaine.
    const s = [
      seanceSolo('a', '2026-11-24', [ECHAUFFEMENT, 'puissance-bloc-limite'], { durete: 'dure' }),
      seanceSolo('b', '2026-11-25', [ECHAUFFEMENT, 'puissance-bloc-limite'], { durete: 'dure' }),
    ]
    const alertes = verifierPlan(plan([semaine(L1)], s), contexteDeReference())
    expect(seulement(alertes, 'W-01')).toHaveLength(1)
  })
})

describe('B.11 : cas 19, principal hors étapes (consolidation 24/11)', () => {
  const P = 'doigts-suspensions-max-lestees'
  const fiches = fichesDeLaBibliotheque()

  /** La séance du mercredi 25 : étapes réelles, grandes lignes avec P en principal, passée par la passerelle. */
  function seanceDu25(surcharge: Partial<SeancePlanifiee> = {}, parties: PartieSeance[] | null = [
    { titre: 'Échauffement', dureeMin: 30 },
    { titre: 'Effort principal', dureeMin: 40, principal: { source: 'bibliotheque', refId: P } },
  ]): SeanceVerif {
    const etape = (id: string) => etapeDepuisProtocole(protocoleParId(id)!, id)
    const planifiee: SeancePlanifiee = {
      ...EXEMPLE_SEANCE_PLANIFIEE,
      id: 'tp', date: '2026-11-25', qualite: 'traction_gainage', groupe: null, niveauDetail: undefined,
      solo: {
        nom: 'Tractions et poutre', durete: 'dure',
        etapes: [etape('echauffement-general'), etape('traction-simple-4x5')],
        ...(parties ? { parties } : {}), // null = parties effacées
      },
      ...surcharge,
    }
    return seanceVersVerif(planifiee, fiches)
  }
  const semaineDu = (s: SeanceVerif, ctx: ContexteVerif = contexteDeReference()) => {
    const [doi, , end] = semaineConforme()
    return toutVerifier([doi, s, end], ctx)
  }
  const MESSAGE_S27 =
    "« Suspensions max lestées (López) » est dans les grandes lignes de « Tractions et poutre », pas dans ses étapes. L'app vérifie ses prérequis, tes douleurs et la récupération, mais pas sa place dans la séance. Mets-les d'accord : ajoute cet exercice aux étapes, ou recalcule les grandes lignes."

  it('la vue : principauxHorsEtapes et deux étapes réelles', () => {
    const s = seanceDu25()
    expect(s.solo.principauxHorsEtapes).toEqual([P])
    expect(s.solo.etapes.map((e) => e.ficheId)).toEqual(['echauffement-general', 'traction-simple-4x5'])
  })

  it('cas 19 : S-03 fort, S-27 information, W-01 fort, tous sur la séance du 25, rien d\'autre', () => {
    const alertes = semaineDu(seanceDu25())
    expect(codes(alertes).sort()).toEqual(['S-03', 'S-27', 'W-01'])
    expect(alertes.every((a) => a.seanceId === 'tp')).toBe(true)
    const s03 = seulement(alertes, 'S-03')[0]
    expect(s03).toMatchObject({ niveau: 'fort', portee: 'seance', version: 'solo', sujet: P })
    expect(s03).not.toHaveProperty('etapeIndex')
    expect(s03.message).toBe(
      "« Suspensions max lestées (López) » demande : une expérience de poutre régulière. Choisis une fiche plus accessible, ou complète ton profil si c'est déjà le cas.",
    )
    const s27 = seulement(alertes, 'S-27')[0]
    expect(s27).toMatchObject({ niveau: 'information', portee: 'seance', version: 'solo', sujet: P })
    expect(s27).not.toHaveProperty('etapeIndex')
    expect(s27.message).toBe(MESSAGE_S27)
    expect(seulement(alertes, 'W-01')[0].niveau).toBe('fort')
  })

  it('cas 19 (a) : niveau grandes lignes, les mêmes trois avertissements', () => {
    const alertes = semaineDu(seanceDu25({ niveauDetail: 'grandes_lignes' }))
    expect(codes(alertes).sort()).toEqual(['S-03', 'S-27', 'W-01'])
  })

  it('cas 19 (b) : douleur aux doigts, verifierJour rend S-04 fort (même cible), forme « arret »', () => {
    const ctx = contexteDeReference({ aujourdhui: '2026-11-25', profil: { ...PROFIL_DE_REFERENCE, douleursEnCours: ['doigts'] } })
    const s = seanceDu25()
    const s04 = seulement(verifierJour(s, ctx, []), 'S-04')
    expect(s04).toHaveLength(1)
    expect(s04[0]).toMatchObject({ niveau: 'fort', portee: 'seance', version: 'solo', sujet: P })
    expect(s04[0]).not.toHaveProperty('etapeIndex')
    expect(formeAffichage(s04[0])).toBe('arret')
    expect(codes(verifierJour(s, ctx, [])).filter((c) => c === 'S-27' || c === 'S-03')).toEqual([])
  })

  it('cas 19 (c) : parties effacées, champ absent et plus aucun avertissement', () => {
    const s = seanceDu25({}, null)
    expect(s.solo).not.toHaveProperty('principauxHorsEtapes')
    expect(semaineDu(s)).toEqual([])
  })

  it('les 18 premiers cas restent identiques : le cas 1 est vide', () => {
    expect(toutVerifier(semaineConforme())).toEqual([])
  })
})
