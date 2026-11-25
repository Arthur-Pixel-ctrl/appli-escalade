import { describe, expect, it } from 'vitest'
import { validerReponse, type IdsAutorises } from './validerReponse.ts'

// Données de D.9 de assistant-ia.md : profil commun, exemples 1 à 3.
const ids = (surcharge: Partial<IdsAutorises> = {}): IdsAutorises => ({
  fiches: new Set(['puissance-bloc-limite', 'endurance-4x4-voies', 'doigts-reglette-minimale-lopez', 'mon-exo']),
  seancesTypes: new Map([
    ['ST-DOI-02', ['entretien']],
    ['ST-TRA-02', []],
    ['ST-END-02', []],
    ['ST-PUI-02', ['poutre_entretien']],
    ['ST-RES-01', []],
    ['ST-RES-03', []],
    ['ST-END-01', []],
    ['ST-TRA-01', []],
  ]),
  objectifsGroupe: new Set(['OG-01']),
  seancesAVenir: new Set(['s-1126', 's-1128', 's-1201', 's-1203', 's-1205']),
  objectifsPerso: new Set(['OP-01']),
  aujourdhui: '2026-11-17',
  niveauDetail: 'detaille',
  niveauxSeancesAVenir: new Map([['s-1126', 'detaille'], ['s-1201', 'simple']]),
  ...surcharge,
})

const phase = (ordre: number, accent: string, seances: object[]) => ({
  ordre, accent, objectifsPersoIds: [],
  semaines: [{ type: 'charge' }, { type: 'charge' }, { type: 'charge' }, { type: 'decharge', reductionPct: 50 }],
  semaineType: seances,
})

const exemple1 = () => ({
  version: 1,
  type: 'cycle',
  resume: 'Cycle de 12 semaines à partir du 23 novembre : doigts, puis puissance, puis résistance courte.',
  brouillon: {
    debut: '2026-11-23', seancesParSemaine: 3, mode: 'accent_tournant',
    blocs: [
      phase(1, 'doigts', [
        { jour: 'mardi', seanceTypeId: 'ST-DOI-02' }, { jour: 'jeudi', seanceTypeId: 'ST-TRA-02' }, { jour: 'samedi', seanceTypeId: 'ST-END-02' },
      ]),
      phase(2, 'puissance', [
        { jour: 'mardi', seanceTypeId: 'ST-PUI-02', variante: 'poutre_entretien' }, { jour: 'jeudi', seanceTypeId: 'ST-TRA-02' }, { jour: 'samedi', seanceTypeId: 'ST-END-02' },
      ]),
      phase(3, 'resistance', [
        { jour: 'mardi', seanceTypeId: 'ST-DOI-02', variante: 'entretien' }, { jour: 'jeudi', seanceTypeId: 'ST-RES-01' }, { jour: 'samedi', seanceTypeId: 'ST-RES-03' },
      ]),
    ],
  },
  justification: ['Les doigts d\'abord.', 'La puissance ensuite.'],
  sources: [
    { type: 'synthese', sujet: 'Planification : accent tournant' },
    { type: 'methode', auteur: 'Lattice Training', idee: 'Force en période de base, puissance 2 à 6 semaines avant l\'objectif.' },
  ],
})

const exemple2 = () => ({
  version: 1,
  type: 'ajustement',
  resume: 'Deux semaines sans effort maximal ni arqué.',
  brouillon: {
    operations: [
      { op: 'remplacer_seance', seanceId: 's-1126', par: { jour: 'jeudi', seanceTypeId: 'ST-END-01' }, raison: 'Pas de bloc limite pendant la douleur.' },
      { op: 'remplacer_seance', seanceId: 's-1201', par: { jour: 'mardi', seanceTypeId: 'ST-TRA-01' }, raison: 'Tractions et gainage à la place.' },
    ],
  },
  justification: ['Réduire la charge, pas arrêter de grimper.'],
  sources: [{ type: 'synthese', sujet: 'Quand arrêter, quand consulter' }],
  miseEnGarde: 'Arrête tout de suite si tu sens un claquement.',
})

const exemple3 = () => ({
  version: 1,
  type: 'refus',
  resume: 'Je ne donne pas de conseils de perte de poids. Je peux t\'aider par l\'entraînement.',
  texte: 'Je ne donne pas de conseils de perte de poids. Pour progresser, mange assez, surtout les jours durs.',
  justification: [],
  sources: [{ type: 'synthese', sujet: 'Manger assez' }, { type: 'livre', titre: 'Guide de l\'alimentation du grimpeur' }],
})

const valider = (o: unknown, i = ids()) => validerReponse(typeof o === 'string' ? o : JSON.stringify(o), i)
const invalideAvec = (o: unknown, code: string, morceau: string, i = ids()) => {
  const r = valider(o, i)
  expect(r.etat).toBe('invalide')
  if (r.etat === 'invalide') {
    expect(r.code).toBe(code)
    expect(r.erreurs.join('\n')).toContain(morceau)
  }
}
const modif = (f: (e: any) => void, base: () => any = exemple1) => { const e = base(); f(e); return e }

describe('exemples de D.9', () => {
  it('exemple 1 : ok', () => {
    const r = valider(exemple1())
    expect(r.etat).toBe('ok')
  })
  it('exemple 2 : ok', () => expect(valider(exemple2()).etat).toBe('ok'))
  it('exemple 3 : refus standard ok', () => expect(valider(exemple3()).etat).toBe('ok'))
  it('tolère un bloc de code Markdown autour, rien d\'autre', () => {
    expect(valider('```json\n' + JSON.stringify(exemple1()) + '\n```').etat).toBe('ok')
    invalideAvec('Voici : ```json\n' + JSON.stringify(exemple1()) + '\n```', 'A-01', 'JSON')
  })
})

describe('lecture et forme (A-01)', () => {
  it('texte non JSON', () => invalideAvec('Voici ton plan : …', 'A-01', 'JSON'))
  it('texte vide, tableau, nombre', () => {
    invalideAvec('', 'A-01', 'vide')
    invalideAvec('[]', 'A-01', 'objet')
    invalideAvec('12', 'A-01', 'objet')
  })
  it('2 blocs au lieu de 3', () => invalideAvec(modif((e) => e.brouillon.blocs.pop()), 'A-01', 'blocs'))
  it('question sans questions', () => {
    invalideAvec({ version: 1, type: 'question', resume: 'Peux-tu préciser ?', justification: [], sources: [] }, 'A-01', 'questions')
  })
  it('question avec 4 questions', () => {
    invalideAvec({ version: 1, type: 'question', resume: 'x', justification: [], sources: [], questions: ['a', 'b', 'c', 'd'] }, 'A-01', 'questions')
  })
  it('questions sur un autre type', () => invalideAvec(modif((e) => { e.questions = ['a'] }), 'A-01', 'questions'))
  it('effortPrevu 11', () => {
    const e = exemple1()
    e.brouillon.blocs[0].semaineType[0] = {
      jour: 'mardi', nom: 'Test', qualite: 'doigts', durete: 'dure', effortPrevu: 11,
      solo: { etapes: [{ ficheId: 'puissance-bloc-limite' }] }, groupe: null,
    } as never
    invalideAvec(e, 'A-01', 'effortPrevu')
  })
  it('version, type, champ inconnu, champ manquant', () => {
    invalideAvec(modif((e) => { e.version = 2 }), 'A-01', 'version')
    invalideAvec(modif((e) => { e.type = 'magie' }), 'A-01', 'type')
    invalideAvec(modif((e) => { e.extra = 1 }), 'A-01', 'extra')
    invalideAvec(modif((e) => { delete e.resume }), 'A-01', 'resume')
  })
  it('brouillon absent ou en trop (F-1)', () => {
    invalideAvec(modif((e) => { delete e.brouillon }), 'A-01', 'brouillon')
    invalideAvec(modif((e) => { e.brouillon = { operations: [] } }, exemple3), 'A-01', 'brouillon')
  })
  it('brouillon d\'une autre forme que le type', () => {
    invalideAvec(modif((e) => { e.type = 'ajustement' }), 'A-01', 'operations')
  })
  it('texte manquant pour un refus', () => invalideAvec(modif((e) => { delete e.texte }, exemple3), 'A-01', 'texte'))
  it('longueurs maximales (F-8)', () => {
    invalideAvec(modif((e) => { e.resume = 'a'.repeat(301) }), 'A-01', 'resume')
    invalideAvec(modif((e) => { e.justification = Array(6).fill('x') }), 'A-01', 'justification')
    invalideAvec(modif((e) => { e.justification = ['a'.repeat(201)] }), 'A-01', 'justification')
    invalideAvec(modif((e) => { e.miseEnGarde = 'a'.repeat(401) }), 'A-01', 'miseEnGarde')
    invalideAvec(modif((e) => { e.texte = 'a'.repeat(1501) }, exemple3), 'A-01', 'texte')
    invalideAvec(modif((e) => { e.sources = Array(7).fill({ type: 'synthese', sujet: 's' }) }), 'A-01', 'sources')
    invalideAvec(modif((e) => { e.sources[1].idee = 'a'.repeat(121) }), 'A-01', 'idee')
  })
  it('deux séances le même jour, trop de séances (F-5)', () => {
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaineType[1].jour = 'mardi' }), 'A-01', 'même jour')
    invalideAvec(modif((e) => { e.brouillon.seancesParSemaine = 2 }), 'A-01', '3 séances, 2 au plus')
  })
  it('semaines d\'un bloc, ordre, accent, mode (F-4)', () => {
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaines.pop() }), 'A-01', 'semaines')
    invalideAvec(modif((e) => { e.brouillon.blocs[1].ordre = 3 }), 'A-01', 'ordre')
    invalideAvec(modif((e) => { e.brouillon.blocs[0].accent = 'mental' }), 'A-01', 'accent')
    invalideAvec(modif((e) => { e.brouillon.mode = 'objectif_date' }), 'A-01', 'objectif')
  })
  it('l\'accent technique est accepté (B13)', () => {
    expect(valider(modif((e) => { e.brouillon.blocs[2].accent = 'technique' })).etat).toBe('ok')
  })
  it('reductionPct hors bornes (F-7)', () => {
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaines[3].reductionPct = 70 }), 'A-01', 'reductionPct')
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaines[0].reductionPct = 50 }), 'A-01', 'reductionPct')
  })
  it('objectifs de groupe : 0 ou 4 refusés', () => {
    const g = (n: number) => ({
      jour: 'mardi', nom: 'S', qualite: 'doigts', durete: 'legere', effortPrevu: 4,
      solo: { etapes: [{ ficheId: 'mon-exo' }] }, groupe: { objectifs: Array(n).fill({ objectifId: 'OG-01' }) },
    })
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaineType[0] = g(0) }), 'A-01', 'objectifs')
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaineType[0] = g(4) }), 'A-01', 'objectifs')
    expect(valider(modif((e) => { e.brouillon.blocs[0].semaineType[0] = g(3) })).etat).toBe('ok')
  })
  it('forme de séance non reconnue', () => {
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaineType[0] = { jour: 'mardi' } }), 'A-01', 'non reconnue')
  })
  it('type de source inconnu', () => {
    invalideAvec(modif((e) => { e.sources = [{ type: 'blog', url: 'x' }] }), 'A-01', 'source')
  })
  it('jamais d\'exception : valeurs absurdes', () => {
    for (const v of ['null', 'true', '{"version":1,"type":null}', '{"version":1,"type":"cycle","brouillon":null,"resume":1,"justification":{},"sources":3}']) {
      expect(valider(v).etat).toBe('invalide')
    }
  })
})

describe('dates (A-04)', () => {
  it('debut un mardi', () => invalideAvec(modif((e) => { e.brouillon.debut = '2026-11-24' }), 'A-04', 'lundi'))
  it('date inexistante ou mal formée', () => {
    invalideAvec(modif((e) => { e.brouillon.debut = '2026-02-30' }), 'A-04', 'invalide')
    invalideAvec(modif((e) => { e.brouillon.debut = '23/11/2026' }), 'A-04', 'invalide')
  })
  it('début dans une semaine déjà passée', () => {
    invalideAvec(modif((e) => { e.brouillon.debut = '2026-11-09' }), 'A-04', 'semaine en cours')
  })
  it('objectif avant le début', () => {
    invalideAvec(modif((e) => {
      e.brouillon.mode = 'objectif_date'
      e.brouillon.objectif = { libelle: 'Trip', date: '2026-11-20', semainesAffutage: 2, reductionVolumePct: 50 }
    }), 'A-04', 'après le début')
  })
  it('objectif daté valide', () => {
    expect(valider(modif((e) => {
      e.brouillon.mode = 'objectif_date'
      e.brouillon.objectif = { libelle: 'Trip', date: '2027-02-20', semainesAffutage: 2, reductionVolumePct: 50 }
    })).etat).toBe('ok')
  })
  it('semaine : lundi, et opérations : date passée', () => {
    const semaine = (lundi: string) => ({
      version: 1, type: 'semaine', resume: 'x', justification: [], sources: [],
      brouillon: { lundi, type: 'charge', seances: [{ jour: 'mardi', seanceTypeId: 'ST-DOI-02' }] },
    })
    expect(valider(semaine('2026-11-23')).etat).toBe('ok')
    invalideAvec(semaine('2026-11-25'), 'A-04', 'lundi')
    const dep = (d: string) => ({
      version: 1, type: 'ajustement', resume: 'x', justification: [], sources: [],
      brouillon: { operations: [{ op: 'deplacer_seance', seanceId: 's-1126', nouvelleDate: d, raison: 'Décalage' }] },
    })
    expect(valider(dep('2026-11-27')).etat).toBe('ok')
    invalideAvec(dep('2026-11-01'), 'A-04', 'passé')
  })
})

describe('identifiants inconnus (A-02)', () => {
  it('séance type inconnue', () => {
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaineType[0].seanceTypeId = 'ST-XXX-99' }), 'A-02', 'ST-XXX-99')
  })
  it('variante inconnue', () => {
    invalideAvec(modif((e) => { e.brouillon.blocs[1].semaineType[0].variante = 'inconnue' }), 'A-02', 'inconnue')
  })
  it('seanceId inconnu', () => {
    invalideAvec(modif((e) => { e.brouillon.operations[0].seanceId = 's-9999' }, exemple2), 'A-02', 's-9999')
  })
  it('fiche hors de la banque envoyée (étape, partie, objectif, référence)', () => {
    const composee = (etape: object) => ({
      jour: 'mardi', nom: 'S', qualite: 'doigts', durete: 'legere', effortPrevu: 4, solo: { etapes: [etape] }, groupe: null,
    })
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaineType[0] = composee({ ficheId: 'fiche-interdite' }) }), 'A-02', 'fiche-interdite')
    invalideAvec(modif((e) => {
      e.brouillon.blocs[0].semaineType[0] = {
        ...composee({ ficheId: 'mon-exo' }),
        groupe: { objectifs: [{ libelle: 'x', cible: 3, compte: 'flashs', ficheReference: 'zzz' }] },
      }
    }), 'A-02', 'zzz')
    invalideAvec(modif((e) => {
      e.brouillon.blocs[0].semaineType[0] = { ...composee({ ficheId: 'mon-exo' }), groupe: { objectifs: [{ objectifId: 'OG-99' }] } }
    }), 'A-02', 'OG-99')
    invalideAvec(modif((e) => { e.brouillon.blocs[0].semaineType[0] = composee({ ficheId: 'mon-exo', moduleObjectifId: 'OP-99' }) }), 'A-02', 'OP-99')
    invalideAvec(modif((e) => { e.brouillon.blocs[0].objectifsPersoIds = ['OP-77'] }), 'A-02', 'OP-77')
  })
  it('une fiche valide et un objectif perso valide passent', () => {
    expect(valider(modif((e) => {
      e.brouillon.blocs[0].objectifsPersoIds = ['OP-01']
      e.brouillon.blocs[0].semaineType[0] = {
        jour: 'mardi', nom: 'S', qualite: 'doigts', durete: 'legere', effortPrevu: 4,
        solo: { etapes: [{ ficheId: 'mon-exo', reglages: { series: 3, reposS: 90, dureeMin: 10 }, note: 'Facile.', moduleObjectifId: 'OP-01' }] },
        groupe: null,
      }
    })).etat).toBe('ok')
  })
  it('réglages hors bornes', () => {
    invalideAvec(modif((e) => {
      e.brouillon.blocs[0].semaineType[0] = {
        jour: 'mardi', nom: 'S', qualite: 'doigts', durete: 'legere', effortPrevu: 4,
        solo: { etapes: [{ ficheId: 'mon-exo', reglages: { series: 0 } }] }, groupe: null,
      }
    }), 'A-01', 'series')
  })
  it('opérations : alleger hors bornes, trop d\'opérations, op inconnue', () => {
    const aj = (ops: object[]) => ({ version: 1, type: 'ajustement', resume: 'x', justification: [], sources: [], brouillon: { operations: ops } })
    invalideAvec(aj([{ op: 'alleger_seance', seanceId: 's-1126', reductionPct: 5, raison: 'x' }]), 'A-01', 'reductionPct')
    invalideAvec(aj([]), 'A-01', 'operations')
    invalideAvec(aj([{ op: 'detruire', raison: 'x' }]), 'A-01', 'inconnue')
    invalideAvec(aj([{ op: 'alleger_seance', seanceId: 's-1126', reductionPct: 30, raison: 'a'.repeat(121) }]), 'A-01', 'raison')
    expect(valider(aj([{ op: 'alleger_seance', seanceId: 's-1126', reductionPct: 30, raison: 'Fatigue' }])).etat).toBe('ok')
  })
})

describe('séance résumée (F-9) et niveau (F6)', () => {
  const resumee = (surcharge: object = {}) => ({
    jour: 'mardi', nom: 'Doigts', qualite: 'doigts', durete: 'dure', effortPrevu: 8,
    niveau: 'grandes_lignes', recommandation: 'Poutre 10 s, 4 essais max, 3 min de repos.',
    parties: [
      { titre: 'Échauffement', dureeMin: 30 },
      { titre: 'Poutre', dureeMin: 45, ficheId: 'doigts-reglette-minimale-lopez' },
    ],
    groupe: null,
    ...surcharge,
  })
  const avec = (s: object) => modif((e) => { e.brouillon.blocs[0].semaineType[0] = s })
  const gl = () => ids({ niveauDetail: 'grandes_lignes' })

  it('valide aux trois niveaux', () => {
    expect(valider(avec(resumee()), gl()).etat).toBe('ok') // grandes lignes
    expect(valider(avec(resumee({
      niveau: 'simple', parties: [{ titre: 'Poutre', dureeMin: 60, ficheId: 'doigts-reglette-minimale-lopez' }],
    })), ids({ niveauDetail: 'simple' })).etat).toBe('ok')
    expect(valider(exemple1(), ids({ niveauDetail: 'detaille' })).etat).toBe('ok') // séances types, détaillé
    expect(valider(exemple1(), gl()).etat).toBe('ok') // séances types : valables à tous les niveaux
  })
  it('simple à 2 parties', () => {
    invalideAvec(avec(resumee({ niveau: 'simple' })), 'A-01', 'parties', ids({ niveauDetail: 'simple' }))
  })
  it('grandes lignes à 1 ou 6 parties', () => {
    invalideAvec(avec(resumee({ parties: [{ titre: 'x', dureeMin: 30, ficheId: 'mon-exo' }] })), 'A-01', 'parties', gl())
    invalideAvec(avec(resumee({ parties: Array(6).fill({ titre: 'x', dureeMin: 30, ficheId: 'mon-exo' }) })), 'A-01', 'parties', gl())
  })
  it('partie avec ficheId absent de la banque', () => {
    invalideAvec(avec(resumee({
      parties: [{ titre: 'a', dureeMin: 30 }, { titre: 'b', dureeMin: 30, ficheId: 'inconnue-xyz' }],
    })), 'A-02', 'inconnue-xyz', gl())
  })
  it('recommandation de 121 caractères', () => {
    invalideAvec(avec(resumee({ recommandation: 'a'.repeat(121) })), 'A-01', 'recommandation', gl())
    expect(valider(avec(resumee({ recommandation: 'a'.repeat(120) })), gl()).etat).toBe('ok')
  })
  it('durée de partie hors bornes', () => {
    invalideAvec(avec(resumee({ parties: [{ titre: 'a', dureeMin: 4 }, { titre: 'b', dureeMin: 30, ficheId: 'mon-exo' }] })), 'A-01', 'dureeMin', gl())
    invalideAvec(avec(resumee({ parties: [{ titre: 'a', dureeMin: 181 }, { titre: 'b', dureeMin: 30, ficheId: 'mon-exo' }] })), 'A-01', 'dureeMin', gl())
  })
  it('séance dure sans aucune fiche', () => {
    invalideAvec(avec(resumee({ parties: [{ titre: 'a', dureeMin: 30 }, { titre: 'b', dureeMin: 30 }] })), 'A-01', 'au moins une partie avec une fiche', gl())
    expect(valider(avec(resumee({ durete: 'legere', parties: [{ titre: 'a', dureeMin: 30 }, { titre: 'b', dureeMin: 30 }] })), gl()).etat).toBe('ok')
  })
  it('F-10 : niveau différent de celui envoyé', () => {
    // contexte grandes_lignes, séance résumée simple
    const simple = resumee({ niveau: 'simple', parties: [{ titre: 'P', dureeMin: 60, ficheId: 'mon-exo' }] })
    const r = valider(avec(simple), gl())
    expect(r.etat).toBe('invalide')
    if (r.etat === 'invalide') {
      expect(r.code).toBe('A-01')
      expect(r.erreurs.join('\n')).toContain('séance du mardi : niveau simple reçu, grandes_lignes attendu')
    }
  })
  it('F-10 : brouillon de cycle (detaille) avec une séance résumée', () => {
    invalideAvec(avec(resumee()), 'A-01', 'séance du mardi : séance résumée, detaille attendu', ids({ niveauDetail: 'detaille' }))
  })
  it('F-10 : remplacer_seance suit le niveau de la séance visée', () => {
    const rempl = (par: object) => ({
      version: 1, type: 'ajustement', resume: 'x', justification: [], sources: [],
      brouillon: { operations: [{ op: 'remplacer_seance', seanceId: 's-1201', par, raison: 'Allégé' }] },
    })
    const contexte = ids({ niveauDetail: 'grandes_lignes' }) // cycle en grandes lignes, s-1201 en simple
    const unePartie = resumee({ niveau: 'simple', parties: [{ titre: 'P', dureeMin: 60, ficheId: 'mon-exo' }] })
    expect(valider(rempl(unePartie), contexte).etat).toBe('ok')
    const troisParties = resumee({
      parties: [{ titre: 'a', dureeMin: 20 }, { titre: 'b', dureeMin: 30, ficheId: 'mon-exo' }, { titre: 'c', dureeMin: 20 }],
    })
    invalideAvec(rempl(troisParties), 'A-01', 'niveau grandes_lignes reçu, simple attendu', contexte)
  })
  it('F-10 : séances types et composées acceptées à tous les niveaux', () => {
    for (const n of ['simple', 'grandes_lignes', 'detaille'] as const) {
      expect(valider(exemple1(), ids({ niveauDetail: n })).etat).toBe('ok')
    }
    const composee = { jour: 'mardi', nom: 'S', qualite: 'doigts', durete: 'legere', effortPrevu: 4, solo: { etapes: [{ ficheId: 'mon-exo' }] }, groupe: null }
    expect(valider(avec(composee), ids({ niveauDetail: 'simple' })).etat).toBe('ok')
  })
  it('l\'assistant ne peut pas poser niveauDetail sur le cycle ni la réponse', () => {
    invalideAvec(modif((e) => { e.brouillon.niveauDetail = 'simple' }), 'A-01', 'niveauDetail')
    invalideAvec(modif((e) => { e.niveauDetail = 'simple' }), 'A-01', 'niveauDetail')
  })
})

describe('sources (A-05, A-06)', () => {
  it('livre avec page : page retirée, une information', () => {
    const r = valider(modif((e) => { e.sources = [{ type: 'livre', titre: 'Guide de l\'alimentation du grimpeur', page: 42 }] }))
    expect(r.etat).toBe('ok')
    if (r.etat === 'ok') {
      expect(r.reponse.sources).toEqual([{ type: 'livre', titre: 'Guide de l\'alimentation du grimpeur' }])
      expect(r.informations).toEqual(['Les livres sont cités par leur titre seulement.'])
    }
  })
  it('livre inconnu : source retirée, une information', () => {
    const r = valider(modif((e) => { e.sources = [{ type: 'livre', titre: 'Un autre livre' }] }))
    expect(r.etat).toBe('ok')
    if (r.etat === 'ok') {
      expect(r.reponse.sources).toEqual([])
      expect(r.informations).toHaveLength(1)
    }
  })
  it('méthode d\'un auteur hors liste et fiche inconnue : retirées', () => {
    const r = valider(modif((e) => {
      e.sources = [
        { type: 'methode', auteur: 'Gourou X', idee: 'Une idée.' },
        { type: 'fiche', ficheId: 'pas-envoyee' },
        { type: 'fiche', ficheId: 'mon-exo' },
      ]
    }))
    expect(r.etat).toBe('ok')
    if (r.etat === 'ok') {
      expect(r.reponse.sources).toEqual([{ type: 'fiche', ficheId: 'mon-exo' }])
      expect(r.informations).toHaveLength(2)
    }
  })
  it('titre de livre : casse exacte, mais apostrophe typographique et espaces multiples tolérés', () => {
    const r1 = valider(modif((e) => { e.sources = [{ type: 'livre', titre: 'guide de l\'alimentation du grimpeur' }] }))
    if (r1.etat === 'ok') expect(r1.reponse.sources).toEqual([])
    const r2 = valider(modif((e) => { e.sources = [{ type: 'livre', titre: 'Guide de l\u2019alimentation  du grimpeur' }] }))
    expect(r2.etat).toBe('ok')
    if (r2.etat === 'ok') {
      expect(r2.reponse.sources).toEqual([{ type: 'livre', titre: 'Guide de l\'alimentation du grimpeur' }]) // titre canonique
      expect(r2.informations).toEqual([])
    }
  })
})

describe('contenu interdit (A-07)', () => {
  const avecResume = (resume: string) => modif((e) => { e.resume = resume })
  it('« Pour PERDRE du poids… » : interdit, réponse de remplacement', () => {
    const r = valider(avecResume('Pour PERDRE du poids, mange moins.'))
    expect(r.etat).toBe('interdit')
    if (r.etat === 'interdit') {
      expect(r.reponse.type).toBe('refus')
      expect(r.reponse.brouillon).toBeUndefined()
      expect(r.reponse.sources).toEqual([])
      expect(r.reponse.texte).toContain('Pour progresser, mange assez')
    }
  })
  it('motif caché dans une note ou une raison', () => {
    expect(valider(modif((e) => { e.brouillon.operations[0].raison = 'Pour maigrir.' }, exemple2)).etat).toBe('interdit')
    expect(valider(modif((e) => { e.justification = ['Un déficit calorique aide.'] })).etat).toBe('interdit')
    expect(valider(modif((e) => { e.miseEnGarde = 'Perdre 3 kg avant le trip.' })).etat).toBe('interdit')
  })
  it('motifs permis', () => {
    expect(valider(avecResume('Ton affûtage commence lundi.')).etat).toBe('ok')
    expect(valider(avecResume('Charge en % du poids du corps.')).etat).toBe('ok')
    expect(valider(avecResume('Attention au déficit énergétique.')).etat).toBe('ok')
  })
  it('« sèche » seul déclenche, « sécher » non', () => {
    expect(valider(avecResume('Fais une sèche avant le trip.')).etat).toBe('interdit')
    expect(valider(avecResume('Laisse sécher la magnésie.')).etat).toBe('ok')
  })
})
