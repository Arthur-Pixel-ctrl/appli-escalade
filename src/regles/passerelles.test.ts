import { describe, expect, it } from 'vitest'
import { protocoleParId } from '../donnees/bibliotheque/index.ts'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES, EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import type {
  Cycle, DouleurDeclaree, ExercicePerso, ObjectifSpecifique, Profil, SeancePlanifiee, SeanceRealisee,
} from '../donnees/modele.ts'
import { PROFIL_VIDE } from '../donnees/profil.ts'
import { SEANCES_TYPES, marqueursSeanceType, seanceTypeParId } from '../donnees/seancesTypes.ts'
import { fichesDeLaBibliotheque } from './adaptateur.ts'
import { contexteDeReference, PROFIL_DE_REFERENCE } from './exemples.ts'
import {
  cleAvertissement, contexteVerif, etapeDepuisExercicePerso, etapeDepuisProtocole, etatPrerequis,
  ficheDepuisExercicePerso, formeAffichage, marqueursVersionPlanifiee, planVersVerif, profilVersVerif,
  realiseeVersVerif, seanceDepuisType, seanceVersVerif, toutesLesFiches,
} from './passerelles.ts'
import { marqueursVersion } from './base.ts'
import { REGLES_PAR_DEFAUT } from './reglesParDefaut.ts'
import type { Avertissement, ContexteVerif, SeanceVerif } from './types.ts'
import { verifierSeanceDeroule } from './verifSeanceDeroule.ts'
import { verifierSeanceProfil } from './verifSeanceProfil.ts'
import { verifierContenuSemaine } from './verifSemaineContenu.ts'
import { verifierQuotasSemaine } from './verifSemaineQuotas.ts'

const MAINTENANT = '2026-11-24T08:00:00.000Z'
const fiches = fichesDeLaBibliotheque()
const base = { id: 's1', cycleId: EXEMPLE_CYCLE.id, phaseId: EXEMPLE_PHASES[0].id, semaine: 1 as const, date: '2026-11-17', maintenant: MAINTENANT }
const depuisType = (id: string, variante?: string, surcharge: Partial<typeof base> = {}) =>
  seanceDepuisType(seanceTypeParId(id)!, variante, { ...base, ...surcharge })

/** Profil « tout rempli » : aucun prérequis ne manque. */
const PROFIL_COMPLET: Profil = {
  ...PROFIL_VIDE, niveauBloc: '7B', anneesPratique: 8, experiencePoutre: 'reguliere', tractionsStrictes: 20,
  tient15sSur25mm: true, majeur: true, grimpeEnTete: true, lieux: ['salle_bloc', 'salle_voie', 'maison'], seancesParSemaine: 3,
}
const ctxComplet = (): ContexteVerif => contexteVerif({
  profil: PROFIL_COMPLET, exercicesPerso: [], douleurs: [], formes: [], objectifs: [], aujourdhui: '2026-11-24', maintenant: MAINTENANT,
})

/** Les vérifications d'une séance (profil puis déroulé), comme le fera verifierSeance. */
const verifierSeance = (s: SeanceVerif, ctx: ContexteVerif): Avertissement[] => [
  ...verifierSeanceProfil(s, ctx, 'utilisateur'), ...verifierSeanceDeroule(s, ctx),
]
const codes = (a: Avertissement[]) => a.map((x) => x.code)

const perso = (surcharge: Partial<ExercicePerso> = {}): ExercicePerso => ({
  id: 'perso-1', versionFormat: 1, creeLe: MAINTENANT, modifieLe: MAINTENANT,
  nom: 'Mon exercice', qualite: 'technique', resume: '10 min', consigne: 'Fais-le.', dureeMin: 10,
  marqueurs: null, contreIndications: [], forme: 'liste', elements: ['a', 'b'], ...surcharge,
}) as ExercicePerso

describe('profilVersVerif', () => {
  it('renomme les champs et garde null', () => {
    const v = profilVersVerif({ ...PROFIL_VIDE, tractionsStrictes: 12, tient15sSur25mm: true, majeur: false })
    expect(v).toMatchObject({ tractionsStrictesMax: 12, test15sSur25mm: true, adulte: false, grimpeEnTete: null })
    expect(profilVersVerif(PROFIL_VIDE)).toMatchObject({ tractionsStrictesMax: null, test15sSur25mm: null, adulte: null })
  })
  it('niveau de bloc vide → null ; lieux vides → salle de bloc ; lieux recopiés', () => {
    expect(profilVersVerif({ ...PROFIL_VIDE, niveauBloc: '' }).niveauBloc).toBeNull()
    expect(profilVersVerif(PROFIL_VIDE).lieux).toEqual(['salle_bloc'])
    expect(profilVersVerif({ ...PROFIL_VIDE, lieux: ['maison'] }).lieux).toEqual(['maison'])
  })
  it('tractionsStrictes null → S-03 « (non renseigné) » à travers les vérifications', () => {
    const ctx = { ...ctxComplet(), profil: profilVersVerif({ ...PROFIL_COMPLET, tractionsStrictes: null }) }
    const etape = etapeDepuisProtocole(protocoleParId('traction-lestee-force-lattice')!, 'e')
    const s = seanceVersVerif({ ...EXEMPLE_SEANCE_PLANIFIEE, solo: { nom: 'x', etapes: [etape], durete: 'dure' }, groupe: null }, fiches)
    const s03 = verifierSeance(s, ctx).find((a) => a.code === 'S-03')
    expect(s03?.message).toContain('(non renseigné)')
  })
})

describe('fiches', () => {
  it('exercice perso : marqueurs null gardés, prérequis {} , doigts selon le terrain', () => {
    const f = ficheDepuisExercicePerso(perso())
    expect(f).toMatchObject({ origine: 'perso', marqueurs: null, prerequis: {}, solliciteDoigts: false })
    expect(ficheDepuisExercicePerso(perso({ contexte: { terrain: 'poutre' }, reposEntreEffortsS: 90 }))).toMatchObject({
      solliciteDoigts: true, reposEntreEffortsS: 90,
    })
  })
  it('toutesLesFiches : bibliothèque et exercices perso non supprimés', () => {
    const toutes = toutesLesFiches([perso(), perso({ id: 'perso-2', supprimeLe: MAINTENANT })])
    expect(toutes['perso-1']).toBeDefined()
    expect(toutes['perso-2']).toBeUndefined()
    expect(toutes['doigts-echelles-3-6-9']).toBeDefined()
  })
})

describe('étapes', () => {
  it('recopie complète et réglages appliqués', () => {
    const p = protocoleParId('doigts-echelles-3-6-9')!
    const e = etapeDepuisProtocole(p, 'echelles', { series: 4, dureeMin: 9 })
    expect(e).toMatchObject({ id: 'echelles', titre: p.nom, resume: p.resume, consigne: p.consigne, dureeMin: 9 })
    expect(e.origine).toEqual({ source: 'bibliotheque', refId: p.id, reglages: { series: 4, dureeMin: 9 } })
    if (e.forme !== 'chrono') throw new Error('chrono attendu')
    expect(e.config.series).toBe(4)
    if (p.forme === 'chrono') expect(p.config.series).not.toBe(4) // la bibliothèque n'est pas modifiée
  })
  it('repos réglé sur une forme essais ; durée de la fiche par défaut', () => {
    const p = protocoleParId('puissance-bloc-limite')!
    const e = etapeDepuisProtocole(p, 'b', { reposS: 300 })
    expect(e.forme === 'essais' && e.reposS).toBe(300)
    expect(e.dureeMin).toBe(p.dureeMin)
  })
  it('exercice perso', () => {
    const e = etapeDepuisExercicePerso(perso(), 'x')
    expect(e.origine).toEqual({ source: 'perso', refId: 'perso-1' })
    expect(e.forme).toBe('liste')
  })
  it('aller-retour : seanceVersVerif retrouve le ficheId, et reglages.series arrive au moteur', () => {
    const e = etapeDepuisProtocole(protocoleParId('doigts-echelles-3-6-9')!, 'echelles', { series: 4 })
    const s = seanceVersVerif({ ...EXEMPLE_SEANCE_PLANIFIEE, solo: { nom: 'x', etapes: [e], durete: 'dure' } }, fiches)
    expect(s.solo.etapes[0].ficheId).toBe('doigts-echelles-3-6-9')
    expect(s.solo.etapes[0].reglages?.series).toBe(4)
  })
})

describe('seanceDepuisType', () => {
  it('ST-DOI-02 : solo, groupe, recommandation, marqueurs du catalogue ; pas de niveau posé', () => {
    const s = depuisType('ST-DOI-02')
    expect(s).toMatchObject({ qualite: 'doigts', seanceTypeId: 'ST-DOI-02', versionFormat: 1, creeLe: MAINTENANT })
    expect(s.niveauDetail).toBeUndefined()
    expect(s.variante).toBeUndefined()
    expect(s.solo.etapes).toHaveLength(5)
    expect(s.solo.recommandation).toBe(seanceTypeParId('ST-DOI-02')!.recommandation)
    expect(s.groupe?.objectifs[0]).toMatchObject({ modeleId: 'OG-01', ficheReference: 'puissance-bloc-limite', blocs: 3, essaisMaxParBloc: 4 })
    expect(s.groupe?.miniBloc?.etapes).toHaveLength(2)
    expect(new Set(s.solo.etapes.map((e) => e.id)).size).toBe(5)
  })
  it('variantes : déroulé et recommandation de la variante', () => {
    const entretien = depuisType('ST-DOI-02', 'entretien')
    expect(entretien.variante).toBe('entretien')
    expect(entretien.solo.recommandation).toContain('bloc limite court')
    expect(entretien.solo.etapes[3].dureeMin).toBe(20)
    const lestee = depuisType('ST-DOI-02', 'lestee')
    expect(lestee.solo.etapes.map((e) => e.origine?.refId)).toContain('doigts-suspensions-max-lestees')
    expect(() => depuisType('ST-DOI-02', 'inconnue')).toThrow()
  })
  it('séance sans version groupe', () => {
    expect(depuisType('ST-DOI-05').groupe).toBeNull()
  })
  it('ST-DOI-02 puis vérifications : aucun avertissement avec le profil tout rempli', () => {
    const s = seanceVersVerif(depuisType('ST-DOI-02'), toutesLesFiches([]))
    expect(codes(verifierSeance(s, ctxComplet()))).toEqual([])
  })
  it('les 26 séances types : marqueurs planifiés = marqueurs du catalogue, aucune erreur S-01', () => {
    for (const st of SEANCES_TYPES) {
      const s = seanceDepuisType(st, undefined, base)
      expect(marqueursVersionPlanifiee(s.solo, fiches).sort(), st.id).toEqual(marqueursSeanceType(st, 'solo').sort())
      if (s.groupe) expect(marqueursVersionPlanifiee(s.groupe, fiches).sort(), st.id).toEqual(marqueursSeanceType(st, 'groupe').sort())
      expect(codes(verifierSeance(seanceVersVerif(s, fiches), ctxComplet())), st.id).not.toContain('S-01')
    }
  })
})

describe('marqueursVersionPlanifiee', () => {
  it('compte aussi les exercices principaux des parties', () => {
    const solo = { nom: 'x', etapes: [], durete: 'dure' as const, parties: [{ titre: 'P', dureeMin: 40, principal: { source: 'bibliotheque' as const, refId: 'puissance-bloc-limite' } }] }
    expect(marqueursVersionPlanifiee(solo, fiches)).toEqual(fiches['puissance-bloc-limite'].marqueurs)
    expect(marqueursVersionPlanifiee({ nom: 'x', etapes: [], durete: 'dure' }, fiches)).toEqual([])
  })
})

describe('principauxHorsEtapes (consolidation 24/11)', () => {
  const etape = (id: string) => etapeDepuisProtocole(protocoleParId(id)!, id)
  const partie = (refId: string) => ({ titre: refId, dureeMin: 30, principal: { source: 'bibliotheque' as const, refId } })
  const seanceAvec = (etapes: string[], parties: string[]): SeancePlanifiee => ({
    ...EXEMPLE_SEANCE_PLANIFIEE, niveauDetail: undefined, groupe: null,
    solo: { nom: 'Tractions et poutre', durete: 'dure', etapes: etapes.map(etape), parties: parties.map(partie) },
  })
  const E = ['echauffement-general', 'traction-simple-4x5']
  const P = 'doigts-suspensions-max-lestees'
  const memesMarqueurs = (s: SeancePlanifiee) => {
    const vue = seanceVersVerif(s, fiches)
    const ctx = ctxComplet()
    expect(marqueursVersion(vue.solo, ctx.fiches).sort()).toEqual(marqueursVersionPlanifiee(s.solo, fiches).sort())
  }
  it('principal absent des étapes : posé, étapes inchangées, marqueurs identiques prévu/réalisé', () => {
    const s = seanceAvec(E, [P])
    const v = seanceVersVerif(s, fiches).solo
    expect(v.principauxHorsEtapes).toEqual([P])
    expect(v.etapes.map((e) => e.ficheId)).toEqual(E)
    expect(v.etapesDetaillees).toBeUndefined()
    memesMarqueurs(s)
  })
  it('principal déjà dans les étapes : champ absent', () => {
    const s = seanceAvec(E, ['traction-simple-4x5'])
    expect(seanceVersVerif(s, fiches).solo).not.toHaveProperty('principauxHorsEtapes')
    memesMarqueurs(s)
  })
  it('deux parties au même principal : une seule fois, dans l\'ordre des parties', () => {
    const s = seanceAvec(E, [P, 'puissance-bloc-limite', P])
    expect(seanceVersVerif(s, fiches).solo.principauxHorsEtapes).toEqual([P, 'puissance-bloc-limite'])
    memesMarqueurs(s)
  })
  it('sans étapes : comme avant, étapes résumées, champ absent', () => {
    const s = seanceAvec([], [P])
    const v = seanceVersVerif(s, fiches).solo
    expect(v).not.toHaveProperty('principauxHorsEtapes')
    expect(v).toMatchObject({ etapesDetaillees: false })
    expect(v.etapes.map((e) => e.ficheId)).toEqual([P])
    memesMarqueurs(s)
  })
  it('étapes sans parties : champ absent', () => {
    const s = { ...seanceAvec(E, []), solo: { nom: 'x', durete: 'dure' as const, etapes: E.map(etape) } }
    expect(seanceVersVerif(s, fiches).solo).not.toHaveProperty('principauxHorsEtapes')
  })
})

describe('seanceVersVerif et niveaux de détail', () => {
  const simpleMain: SeancePlanifiee = {
    ...EXEMPLE_SEANCE_PLANIFIEE, niveauDetail: 'simple', groupe: null,
    solo: {
      nom: 'À la main', etapes: [], durete: 'legere', recommandation: 'Tractions.',
      parties: [{ titre: 'Séance', dureeMin: 30, principal: { source: 'bibliotheque', refId: 'traction-simple-4x5' } }],
    },
  }
  it('simple écrite à la main : une étape résumée, étapes non détaillées, durée des parties', () => {
    const v = seanceVersVerif(simpleMain, fiches).solo
    expect(v).toMatchObject({ niveau: 'simple', etapesDetaillees: false, dureeMin: 30 })
    expect(v.etapes).toEqual([{ ficheId: 'traction-simple-4x5', reglages: { dureeMin: 30 } }])
  })
  it('la même séance détaillée passée en simple : identique sauf le niveau', () => {
    const detaillee = depuisType('ST-DOI-02')
    const enSimple = { ...detaillee, niveauDetail: 'simple' as const }
    const a = seanceVersVerif(detaillee, fiches)
    const b = seanceVersVerif(enSimple, fiches)
    expect(a.solo.niveau).toBe('detaille')
    expect(b.solo.niveau).toBe('simple')
    expect({ ...b, solo: { ...b.solo, niveau: 'detaille' } }).toEqual(a)
    expect(b.solo.etapesDetaillees).toBeUndefined()
  })
  it('niveau du cycle suivi, sinon détaillé', () => {
    const s = depuisType('ST-DOI-02')
    expect(seanceVersVerif(s, fiches, undefined, { niveauDetail: 'grandes_lignes' }).solo.niveau).toBe('grandes_lignes')
    expect(seanceVersVerif(s, fiches).solo.niveau).toBe('detaille')
  })
  it('dure sans exercice : aucune étape, aucun marqueur, S-26 sans « maximal »', () => {
    const s = seanceVersVerif({ ...simpleMain, solo: { nom: 'Dure', etapes: [], durete: 'dure' } }, fiches)
    expect(s.solo).toMatchObject({ etapes: [], etapesDetaillees: false, dureeMin: 0 })
    const a = verifierSeance(s, ctxComplet())
    expect(codes(a)).toContain('S-26')
    expect(a.find((x) => x.code === 'S-26')?.message).not.toContain('maximal')
  })
  it('une étape sans origine garde son id : S-01', () => {
    const s = seanceVersVerif(EXEMPLE_SEANCE_PLANIFIEE, fiches)
    expect(s.solo.etapes[0].ficheId).toBe('echauffement')
    expect(codes(verifierSeance(s, ctxComplet()))).toContain('S-01')
  })
  it('séance d\'exemple de exemplesV2 : S-01 (étapes sans origine) et ses conséquences, aucune autre alerte forte', () => {
    const a = verifierSeance(seanceVersVerif(EXEMPLE_SEANCE_PLANIFIEE, fiches), ctxComplet())
    expect(codes(a).filter((c) => c === 'S-01')).toHaveLength(6)
    // Sans fiche connue côté solo : S-26 (dure sans exercice), et S-21 / S-23 viennent du groupe de l'exemple.
    expect(new Set(codes(a))).toEqual(new Set(['S-01', 'S-21', 'S-23', 'S-26']))
    expect(new Set(a.filter((x) => x.niveau === 'fort').map((x) => x.code))).toEqual(new Set(['S-01']))
  })
  it('étapes avec origine et objectif spécifique', () => {
    const e = { ...etapeDepuisProtocole(protocoleParId('antagonistes-legers')!, 'a'), objectifSpecifiqueId: 'obj-1' }
    const s = seanceVersVerif({ ...simpleMain, solo: { nom: 'x', etapes: [e], durete: 'legere' } }, fiches)
    expect(s.solo.etapes[0]).toMatchObject({ ficheId: 'antagonistes-legers', moduleObjectifId: 'obj-1' })
  })
  it('séance réalisée : le réel', () => {
    const r = realisee({ mode: 'libre', marqueurs: ['maximale'], peau: 2 })
    const s = seanceVersVerif(depuisType('ST-DOI-02'), fiches, r)
    expect(s.realisee).toEqual({ version: 'solo', finLe: r.creeLe, dureeMin: 90, effortPercu: 8, marqueurs: ['maximale'], peau: 2 })
  })
})

function realisee(surcharge: Partial<SeanceRealisee> = {}): SeanceRealisee {
  return {
    id: 'r1', versionFormat: 1, creeLe: '2026-11-17T19:00:00.000Z', modifieLe: '2026-11-17T19:00:00.000Z', date: '2026-11-17',
    mode: 'solo', nom: 'Séance', durete: 'dure', dureeMin: 90, effortPercu: 8, peau: 3, douleur: false,
    etapes: [], objectifs: [], blocs: [], ...surcharge,
  }
}

describe('realiseeVersVerif', () => {
  it('séance libre : solo, étapes faites avec fiche seulement', () => {
    const s = realiseeVersVerif(realisee({
      mode: 'libre', marqueurs: ['bloc_limite'],
      etapes: [{ titre: 'a', statut: 'faite', refId: 'puissance-bloc-limite' }, { titre: 'b', statut: 'passee', refId: 'x' }, { titre: 'c', statut: 'faite' }],
    }))
    expect(s.solo.etapes).toEqual([{ ficheId: 'puissance-bloc-limite' }])
    expect(s.realisee).toMatchObject({ version: 'solo', marqueurs: ['bloc_limite'] })
    expect(s.qualite).toBe('technique')
  })
  it('séance en groupe : version groupe avec ses objectifs', () => {
    const s = realiseeVersVerif(realisee({ mode: 'groupe', objectifs: [{ libelle: 'o', cible: 3, fait: 2 }] }))
    expect(s.realisee?.version).toBe('groupe')
    expect(s.groupe?.objectifs).toHaveLength(1)
    expect(s.realisee?.marqueurs).toEqual([])
  })
})

describe('planVersVerif', () => {
  const seance = (id: string, date: string, surcharge: Partial<SeancePlanifiee> = {}): SeancePlanifiee =>
    ({ ...depuisType('ST-DOI-02', undefined, { id, date }), ...surcharge })
  const entrees = (seances: SeancePlanifiee[], extra: Record<string, unknown> = {}) => ({
    cycle: EXEMPLE_CYCLE, phases: EXEMPLE_PHASES, seances, realisees: [] as SeanceRealisee[], objectifs: [] as ObjectifSpecifique[],
    origine: 'utilisateur' as const, fiches, ...extra,
  })

  it('EXEMPLE_PHASES : 12 semaines, la semaine 4 de chaque phase est decharge, lundis calculés', () => {
    const p = planVersVerif(entrees([]))
    expect(p.semaines).toHaveLength(12)
    expect(p.semaines[0]).toEqual({ lundi: '2026-11-16', type: 'charge', mesocycleOrdre: 1, numero: 1 })
    expect(p.semaines[3]).toEqual({ lundi: '2026-12-07', type: 'decharge', reductionPct: 50, mesocycleOrdre: 1, numero: 4 })
    expect(p.semaines[4].lundi).toBe('2026-12-14')
    expect(p.semaines.filter((w) => w.type === 'decharge').map((w) => w.numero)).toEqual([4, 4, 4])
    expect(p).toMatchObject({ mode: 'accent_tournant', debut: '2026-11-16', nbSemaines: 12, seancesParSemaine: 3, origine: 'utilisateur' })
    expect(p.mesocycles.map((m) => m.accent)).toEqual(['doigts', 'puissance', 'resistance'])
  })
  it('séance sautée ou supprimée absente ; sautée mais faite présente', () => {
    const a = seance('a', '2026-11-17')
    const sautee = seance('b', '2026-11-19', { sauteeLe: MAINTENANT })
    const supprimee = seance('c', '2026-11-21', { supprimeLe: MAINTENANT })
    const sauteeFaite = seance('d', '2026-11-22', { sauteeLe: MAINTENANT })
    const p = planVersVerif(entrees([a, sautee, supprimee, sauteeFaite], { realisees: [realisee({ id: 'rd', seancePlanifieeId: 'd', date: '2026-11-22' })] }))
    expect(p.seances.map((s) => s.id)).toEqual(['a', 'd'])
    expect(p.seances[1].realisee).toBeDefined()
  })
  it('une séance réalisée hors plan compte', () => {
    const p = planVersVerif(entrees([], { realisees: [realisee({ id: 'libre', mode: 'libre' }), realisee({ id: 'sup', supprimeLe: MAINTENANT })] }))
    expect(p.seances.map((s) => s.id)).toEqual(['libre'])
  })
  it('objectif daté : mode, affûtage compté, réduction de la première semaine', () => {
    const phases = EXEMPLE_PHASES.map((ph, i) => i < 2 ? ph : { ...ph, semaines: ph.semaines.map((w) => w.numero >= 3 ? { ...w, type: 'affutage' as const, reductionPct: 45 } : w) })
    const cycle: Cycle = { ...EXEMPLE_CYCLE, objectif: { libelle: 'Projet', date: '2027-02-06' } }
    const p = planVersVerif(entrees([], { cycle, phases, cycleSuivant: { debut: '2027-02-08' } }))
    expect(p.mode).toBe('objectif_date')
    expect(p.objectif).toEqual({ date: '2027-02-06', semainesAffutage: 2, reductionVolumePct: 45 })
    expect(p.cycleSuivantDebut).toBe('2027-02-08')
  })
  it('objectifs spécifiques de la phase : identifiants des documents non supprimés', () => {
    const obj = (id: string, phaseId: string, extra: Partial<ObjectifSpecifique> = {}): ObjectifSpecifique =>
      ({ id, phaseId, libelle: id, versionFormat: 1, creeLe: MAINTENANT, modifieLe: MAINTENANT, ...extra })
    const p = planVersVerif(entrees([], { objectifs: [obj('o1', EXEMPLE_PHASES[0].id), obj('o2', EXEMPLE_PHASES[0].id, { supprimeLe: MAINTENANT }), obj('o3', EXEMPLE_PHASES[1].id)] }))
    expect(p.mesocycles.map((m) => m.objectifsPersoIds)).toEqual([['o1'], ['o3'], []])
  })

  it('niveau simple (étapes gardées) : mêmes avertissements de semaine qu\'au niveau détaillé', () => {
    // Trois séances sur une semaine, dont deux maximales à moins de 48 h : W-01 attendu dans les deux niveaux.
    const seances = [seance('a', '2026-11-17'), seance('b', '2026-11-18'), seance('c', '2026-11-20')]
    const ctx = ctxComplet()
    const avertissementsSemaine = (niveau?: Cycle['niveauDetail']) => {
      const cycle = niveau ? { ...EXEMPLE_CYCLE, niveauDetail: niveau } : EXEMPLE_CYCLE
      const p = planVersVerif(entrees(seances, { cycle }))
      return [
        ...verifierQuotasSemaine('2026-11-16', p.seances, p.seancesParSemaine, ctx),
        ...verifierContenuSemaine('2026-11-16', p, ctx),
      ].map((a) => `${a.code}|${a.message}`)
    }
    const detaille = avertissementsSemaine()
    expect(detaille.length).toBeGreaterThan(0)
    expect(avertissementsSemaine('simple')).toEqual(detaille)
    expect(avertissementsSemaine('grandes_lignes')).toEqual(detaille)
  })
})

describe('contexteVerif', () => {
  const entree = (extra: Partial<Parameters<typeof contexteVerif>[0]> = {}) => ({
    profil: PROFIL_COMPLET, exercicesPerso: [], douleurs: [], formes: [], objectifs: [], aujourdhui: '2026-11-24', maintenant: MAINTENANT, ...extra,
  })
  it('sans réglage : les défauts', () => {
    expect(contexteVerif(entree()).regles).toEqual(REGLES_PAR_DEFAUT)
  })
  it('réglage valide appliqué ; mauvais type ou clé inconnue ignorés', () => {
    const regles = contexteVerif(entree({ reglages: { reglesSecurite: { heuresEntreSeancesMax: 'x' as unknown as number, dechargeActive: false, poutreParSemaine: 2, inconnue: 5 } } })).regles
    expect(regles.heuresEntreSeancesMax).toBe(REGLES_PAR_DEFAUT.heuresEntreSeancesMax)
    expect(regles.dechargeActive).toBe(false)
    expect(regles.poutreParSemaine).toBe(2)
    expect(regles).not.toHaveProperty('inconnue')
  })
  it('objectifs : catalogue déduit de la fiche, objectif écrit à la main vide ; clés = identifiants des documents', () => {
    const obj = (id: string, extra: Partial<ObjectifSpecifique>): ObjectifSpecifique =>
      ({ id, phaseId: 'p', libelle: `Objectif ${id}`, versionFormat: 1, creeLe: MAINTENANT, modifieLe: MAINTENANT, ...extra })
    const ctx = contexteVerif(entree({ objectifs: [obj('u1', { modeleId: 'OS-02' }), obj('u2', {}), obj('u3', { supprimeLe: MAINTENANT })] }))
    expect(Object.keys(ctx.objectifsPerso)).toEqual(['u1', 'u2'])
    expect(ctx.objectifsPerso.u1).toMatchObject({ id: 'u1', nom: 'Objectif u1', remplacementNom: 'Prévention des épaules' })
    expect(ctx.objectifsPerso.u1.prerequis).toEqual(protocoleParId('traction-prises-decalees')!.prerequis)
    expect(ctx.objectifsPerso.u2).toEqual({ id: 'u2', nom: 'Objectif u2', marqueurs: [], prerequis: {}, contreIndications: [] })
  })
  it('douleurs et formes non supprimées ; résultats de tests vides', () => {
    const d = (surcharge: Partial<DouleurDeclaree>): DouleurDeclaree => ({
      id: 'd', versionFormat: 1, creeLe: MAINTENANT, modifieLe: MAINTENANT, date: '2026-11-20', zone: 'coude', niveau: 'reduction', signes: [], ...surcharge,
    })
    const ctx = contexteVerif(entree({
      douleurs: [d({ id: 'd1' }), d({ id: 'd2', supprimeLe: MAINTENANT })],
      formes: [{ id: '2026-11-24', versionFormat: 1, creeLe: MAINTENANT, modifieLe: MAINTENANT, date: '2026-11-24', sommeil: 2, fatigue: 3, courbatures: 3, douleur: 4, peau: 5, heuresSommeil: 6 }],
    }))
    expect(ctx.douleurs).toEqual([{ date: '2026-11-20', zone: 'coude', niveau: 'reduction', signes: [] }])
    expect(ctx.formes[0]).toMatchObject({ sommeil: 2, heuresSommeil: 6 })
    expect(ctx.resultatsTests).toEqual([])
    expect(ctx.profil.adulte).toBe(true)
  })
})

describe('etatPrerequis', () => {
  const lestee = fiches['traction-lestee-force-lattice']
  it('manques en clair ; null compte comme non rempli', () => {
    const e = etatPrerequis(lestee, { ...PROFIL_DE_REFERENCE, tractionsStrictesMax: null, adulte: null }, [], '2026-11-24')
    expect(e.manques.join(' ')).toContain('non renseigné')
    expect(e.manques).toContain('18 ans ou plus')
  })
  it('profil complet : rien ne manque', () => {
    expect(etatPrerequis(lestee, profilVersVerif(PROFIL_COMPLET), [], '2026-11-24').manques).toEqual([])
  })
  it('contre-indication active : douleur ouverte, pas résolue', () => {
    const zone = lestee.contreIndications[0]
    const profil = profilVersVerif(PROFIL_COMPLET)
    const ouverte = { date: '2026-11-20', zone, niveau: 'reduction' as const, signes: [] }
    expect(etatPrerequis(lestee, profil, [ouverte], '2026-11-24').contreIndications).toEqual([zone])
    expect(etatPrerequis(lestee, profil, [{ ...ouverte, resolueLe: '2026-11-22' }], '2026-11-24').contreIndications).toEqual([])
  })
})

describe('avertissements', () => {
  const a = (surcharge: Partial<Avertissement>): Avertissement => ({ code: 'W-01', niveau: 'fort', message: '', portee: 'semaine', source: '', ...surcharge })
  it('cleAvertissement : champs absents vides', () => {
    expect(cleAvertissement(a({ lundi: '2026-11-16' }))).toBe('W-01||||2026-11-16|')
    expect(cleAvertissement(a({ code: 'S-03', seanceId: 's', version: 'solo', etapeIndex: 0, mesocycleOrdre: 2 }))).toBe('S-03|s|solo|0||2')
  })
  it('cleAvertissement : le sujet s\'ajoute à la fin, seulement s\'il existe', () => {
    const base = { code: 'W-18', lundi: '2026-11-23', mesocycleOrdre: 1 }
    expect(cleAvertissement(a({ ...base, sujet: 'o1' }))).toBe('W-18||||2026-11-23|1|o1')
    expect(cleAvertissement(a({ ...base, sujet: 'o1' }))).not.toBe(cleAvertissement(a({ ...base, sujet: 'o2' })))
    expect(cleAvertissement(a(base))).toBe('W-18||||2026-11-23|1')
  })
  it('formeAffichage', () => {
    for (const code of ['S-04', 'S-05', 'S-06', 'J-05']) expect(formeAffichage(a({ code }))).toBe('arret')
    expect(formeAffichage(a({ code: 'W-01' }))).toBe('avertissement')
    expect(formeAffichage(a({ code: 'S-26', niveau: 'information' }))).toBe('information')
  })
})

it('contexte de référence reste compatible avec le contexte construit', () => {
  expect(Object.keys(ctxComplet()).sort()).toEqual(Object.keys(contexteDeReference()).sort())
})
