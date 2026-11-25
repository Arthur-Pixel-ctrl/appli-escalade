import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { base } from './base.ts'
import { entreesDepuis } from './bibliotheque/filtres.ts'
import {
  BROUILLON_VIDE, REPONSES_PRUDENTES, erreursDuBrouillon, exerciceDepuisBrouillon, marqueursDepuisReponses, phraseReference,
  premierChampEnErreur, type BrouillonExercice, type ReponsesSecurite,
} from './exercicePerso.ts'
import { LIVRES } from './modele.ts'
import { enregistrerExercicePerso, lireExercicesPerso } from './plan.ts'
import { ficheDepuisExercicePerso } from '../regles/passerelles.ts'
import { contexteDeReference, seanceSolo } from '../regles/exemples.ts'
import { verifierSeance } from '../regles/index.ts'

// Toutes les réponses à « non », sauf celles qu'on veut tester.
const TOUT_NON: ReponsesSecurite = { effortMaximal: 'non', poutre: 'non', blocLimite: 'non', arqueOuTrous: 'non', bidoigts: 'non', sansPieds: 'non' }

describe('marqueursDepuisReponses', () => {
  it('« Effort maximal des doigts ? » oui → maximale', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, effortMaximal: 'oui' })).toEqual(['maximale'])
  })
  it('« Effort maximal des doigts ? » je ne sais pas → maximale (prudence)', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, effortMaximal: 'je_ne_sais_pas' })).toEqual(['maximale'])
  })
  it('« Sur poutre ? » oui → poutre, sans poutre_intensive si l’effort n’est pas maximal', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, poutre: 'oui' })).toEqual(['poutre'])
  })
  it('« Sur poutre ? » avec effort maximal → poutre et poutre_intensive', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, poutre: 'oui', effortMaximal: 'oui' }))
      .toEqual(['maximale', 'poutre', 'poutre_intensive'])
  })
  it('« Bloc à ta limite ? » oui → bloc_limite', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, blocLimite: 'oui' })).toEqual(['bloc_limite'])
  })
  it('« Arqué ou trous ? » oui → arque, trou, sans bidoigts', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, arqueOuTrous: 'oui' })).toEqual(['arque', 'trou'])
  })
  it('« Arqué ou trous ? » je ne sais pas → arque, trou (prudence)', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, arqueOuTrous: 'je_ne_sais_pas' })).toEqual(['arque', 'trou'])
  })
  it('« Bidoigts ? » oui → bidoigts', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, bidoigts: 'oui' })).toEqual(['bidoigts'])
  })
  it('« Bidoigts ? » non → pas de bidoigts', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, bidoigts: 'non' })).not.toContain('bidoigts')
  })
  it('« Bidoigts ? » je ne sais pas → bidoigts (prudence)', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, bidoigts: 'je_ne_sais_pas' })).toEqual(['bidoigts'])
  })
  it('« Sans pieds au pan ? » oui → pan_gullich', () => {
    expect(marqueursDepuisReponses({ ...TOUT_NON, sansPieds: 'oui' })).toEqual(['pan_gullich'])
  })
  it('tout à non → aucun marqueur', () => {
    expect(marqueursDepuisReponses(TOUT_NON)).toEqual([])
  })
  it('tout « je ne sais pas » → tous les marqueurs, comme un « oui » partout', () => {
    const tous = marqueursDepuisReponses({ effortMaximal: 'je_ne_sais_pas', poutre: 'je_ne_sais_pas', blocLimite: 'je_ne_sais_pas', arqueOuTrous: 'je_ne_sais_pas', bidoigts: 'je_ne_sais_pas', sansPieds: 'je_ne_sais_pas' })
    expect(tous).toEqual(marqueursDepuisReponses({ effortMaximal: 'oui', poutre: 'oui', blocLimite: 'oui', arqueOuTrous: 'oui', bidoigts: 'oui', sansPieds: 'oui' }))
    expect([...tous].sort()).toEqual(['arque', 'bidoigts', 'bloc_limite', 'maximale', 'pan_gullich', 'poutre', 'poutre_intensive', 'trou'])
  })
  it('les réponses par défaut du formulaire sont prudentes', () => {
    expect(marqueursDepuisReponses(REPONSES_PRUDENTES)).toContain('maximale')
    expect(marqueursDepuisReponses(REPONSES_PRUDENTES)).toContain('bidoigts')
  })
  it('l’ordre des marqueurs rendus est stable', () => {
    expect(marqueursDepuisReponses(REPONSES_PRUDENTES))
      .toEqual(['maximale', 'poutre', 'poutre_intensive', 'bloc_limite', 'arque', 'trou', 'bidoigts', 'pan_gullich'])
  })
  it('cas de l’audit : arqué à effort maximal sans bidoigts → pas de S-18 ; avec « je ne sais pas » → S-18 fort', () => {
    const sansBidoigts = exerciceDepuisBrouillon(
      { ...BROUILLON_VIDE, nom: 'Arqué max', qualite: 'doigts', forme: 'essais', reponses: { ...TOUT_NON, effortMaximal: 'oui', arqueOuTrous: 'oui' } },
      'perso-a', '2026-11-25T10:00:00.000Z')
    const prudent = { ...sansBidoigts, id: 'perso-b', marqueurs: marqueursDepuisReponses({ ...TOUT_NON, effortMaximal: 'oui', arqueOuTrous: 'oui', bidoigts: 'je_ne_sais_pas' }) }
    expect(sansBidoigts.marqueurs).not.toContain('bidoigts')
    const ctx = contexteDeReference()
    ctx.fiches['perso-a'] = ficheDepuisExercicePerso(sansBidoigts)
    ctx.fiches['perso-b'] = ficheDepuisExercicePerso(prudent)
    const codesDe = (id: string) => verifierSeance(seanceSolo('s', '2026-11-24', ['echauffement-general', id]), ctx).map((a) => a.code)
    expect(codesDe('perso-a')).not.toContain('S-18')
    expect(codesDe('perso-b')).toContain('S-18')
  })
})

const complet = (surcharge: Partial<BrouillonExercice> = {}): BrouillonExercice => ({
  ...BROUILLON_VIDE, nom: ' Suspensions du livre ', qualite: 'doigts', forme: 'chrono', consigne: 'Suspends-toi calmement.', ...surcharge,
})

describe('validation du brouillon', () => {
  it('refuse un brouillon vide, avec nom, qualité et forme dans cet ordre', () => {
    const e = erreursDuBrouillon(BROUILLON_VIDE)
    expect(Object.keys(e)).toEqual(['nom', 'qualite', 'forme'])
    expect(premierChampEnErreur(e)).toBe('nom')
  })
  it('refuse 0 série pour un chrono, avec un message', () => {
    const e = erreursDuBrouillon(complet({ series: '0' }))
    expect(e.series).toMatch(/au moins 1 série/)
    expect(premierChampEnErreur(e)).toBe('series')
  })
  it('refuse une liste sans élément et une page qui n’est pas un nombre', () => {
    const e = erreursDuBrouillon(complet({ forme: 'liste', elements: ' \n ', livre: 'cent_exercices', page: 'quatre' }))
    expect(e.elements).toBeDefined()
    expect(e.page).toBeDefined()
  })
  it('refuse un créneau plus court que l’effort', () => {
    expect(erreursDuBrouillon(complet({ gabarit: 'depart_minute', effortS: '10', creneauS: '5' })).creneauS).toBeDefined()
  })
  it('accepte un brouillon complet', () => {
    expect(erreursDuBrouillon(complet())).toEqual({})
  })
})

describe('exerciceDepuisBrouillon', () => {
  const maintenant = '2026-11-25T10:00:00.000Z'

  it('cite le livre par sa clé et sa page, sans rien recopier, ni prénom ni poids', () => {
    const e = exerciceDepuisBrouillon(complet({ livre: 'cent_exercices', page: '84' }), 'perso-1', maintenant)
    expect(e.reference).toEqual({ livre: 'cent_exercices', page: '84' })
    expect(phraseReference(e.reference!)).toBe(`${LIVRES.cent_exercices}, p. 84`)
    const texte = JSON.stringify(e).toLowerCase()
    for (const interdit of ['prenom', 'prénom', 'poids']) expect(texte).not.toContain(interdit)
  })
  it('garde le titre d’un autre ouvrage', () => {
    const e = exerciceDepuisBrouillon(complet({ livre: 'autre', titreAutre: 'Mon cahier', page: '' }), 'perso-1', maintenant)
    expect(e.reference).toEqual({ livre: 'autre', titreAutre: 'Mon cahier' })
  })
  it('qualifie l’exercice : marqueurs jamais null, contre-indications et terrain recopiés', () => {
    const e = exerciceDepuisBrouillon(complet({ zones: ['coude'], terrain: 'poutre', reponses: { ...TOUT_NON, poutre: 'oui' } }), 'perso-1', maintenant)
    expect(e.marqueurs).toEqual(['poutre'])
    expect(e.contreIndications).toEqual(['coude'])
    expect(e.contexte).toEqual({ terrain: 'poutre' })
    expect(e.nom).toBe('Suspensions du livre')
  })
  it('construit les trois formes', () => {
    const chrono = exerciceDepuisBrouillon(complet({ series: '4' }), 'a', maintenant)
    expect(chrono).toMatchObject({ forme: 'chrono', config: { gabarit: 'repetition_unique', series: 4, effortS: 10 }, resume: '4 séries' })
    const liste = exerciceDepuisBrouillon(complet({ forme: 'liste', elements: 'A\nB' }), 'b', maintenant)
    expect(liste).toMatchObject({ forme: 'liste', elements: ['A', 'B'] })
    const essais = exerciceDepuisBrouillon(complet({ forme: 'essais', reposEssaisS: '120' }), 'c', maintenant)
    expect(essais).toMatchObject({ forme: 'essais', reposS: 120 })
  })
  it('refuse un brouillon sans qualité ni forme', () => {
    expect(() => exerciceDepuisBrouillon(BROUILLON_VIDE, 'x', maintenant)).toThrow()
  })
})

describe('enregistrement et bibliothèque', () => {
  beforeEach(async () => { await base.exercicesPerso.clear() })

  it('un exercice créé est relu, passe en fiche du moteur et apparaît « Perso » avec sa référence', async () => {
    const e = exerciceDepuisBrouillon(complet({ livre: 'planification', page: '12' }), 'perso-test', '2026-11-25T10:00:00.000Z')
    await enregistrerExercicePerso(e)
    const relus = await lireExercicesPerso()
    expect(relus.map((x) => x.id)).toEqual(['perso-test'])
    expect(ficheDepuisExercicePerso(relus[0]!).marqueurs).toContain('maximale')
    const entree = entreesDepuis([], relus)[0]!
    expect(entree.preuve).toBe('Perso')
    expect(entree.origine).toBe('perso')
    expect(relus[0]!.reference?.livre).toBe('planification')
  })
})
