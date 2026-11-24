import { describe, expect, it } from 'vitest'
import { verifierSeanceDeroule } from './verifSeanceDeroule.ts'
import { contexteDeReference, seanceSolo } from './exemples.ts'
import type { Avertissement, FicheVerif, ObjectifGroupeVerif, SeanceVerif, VersionVerif } from './types.ts'

const ctx = contexteDeReference()
const J = '2026-11-24'

/** Codes émis (sans doublon d'ordre) pour une séance solo faite des fiches données. */
function codes(ficheIds: string[], options = {}, c = ctx): string[] {
  return verifierSeanceDeroule(seanceSolo('s', J, ficheIds, options), c).map((a) => a.code)
}
function trouver(a: Avertissement[], code: string) {
  return a.filter((x) => x.code === code)
}
function persoFiche(extra: Partial<FicheVerif>): FicheVerif {
  return {
    id: 'perso-1', nom: 'Mon exercice', origine: 'perso', qualite: 'puissance', dureeMin: 10,
    marqueurs: [], prerequis: {}, contreIndications: [], solliciteDoigts: true, ...extra,
  }
}
function groupe(objectifs: ObjectifGroupeVerif[], etapes: string[] = [], durete: VersionVerif['durete'] = 'legere'): VersionVerif {
  return { durete, etapes: etapes.map((ficheId) => ({ ficheId })), objectifs }
}
const obj = (o: Partial<ObjectifGroupeVerif> = {}): ObjectifGroupeVerif => ({ libelle: 'Objectif', accents: [], marqueurs: [], ...o })

describe('S-10 à S-14', () => {
  it('S-10 : pas d\'échauffement avant un effort nerveux', () => {
    const a = verifierSeanceDeroule(seanceSolo('s', J, ['puissance-bloc-limite']), ctx)
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ code: 'S-10', niveau: 'fort', portee: 'etape', etapeIndex: 0, version: 'solo' })
    expect(a[0].message).toBe('Ajoute un échauffement avant « ' + ctx.fiches['puissance-bloc-limite'].nom + ' » : 20 à 30 min de grimpe de plus en plus dure.')
    expect(codes(['echauffement-general', 'puissance-bloc-limite'])).not.toContain('S-10')
  })
  it('S-10 : muette en groupe', () => {
    const s = seanceSolo('s', J, ['echauffement-general', 'puissance-bloc-limite'])
    s.groupe = groupe([obj()], ['puissance-bloc-limite'])
    const a = verifierSeanceDeroule(s, ctx)
    expect(trouver(a, 'S-10')).toHaveLength(0)
  })
  it('S-11 : poutre intensive sans échauffement des doigts', () => {
    const a = verifierSeanceDeroule(seanceSolo('s', J, ['echauffement-general', 'doigts-reglette-minimale-lopez']), ctx)
    expect(trouver(a, 'S-11')).toMatchObject([{ niveau: 'information', etapeIndex: 1 }])
    expect(codes(['echauffement-general', 'echauffement-doigts-poutre', 'doigts-reglette-minimale-lopez'])).not.toContain('S-11')
  })
  it('S-12 : effort maximal après un travail congestionnant, une fois par étape', () => {
    const a = verifierSeanceDeroule(seanceSolo('s', J, ['echauffement-general', 'resistance-boulder-triples', 'puissance-bloc-limite']), ctx)
    expect(trouver(a, 'S-12')).toMatchObject([{ niveau: 'fort', etapeIndex: 2 }])
    expect(codes(['echauffement-general', 'endurance-continuite-fin-de-seance', 'puissance-bloc-limite'])).not.toContain('S-12')
    const longue = seanceSolo('s', J, ['echauffement-general', 'endurance-continuite-fin-de-seance', 'puissance-bloc-limite'])
    longue.solo.etapes[1].reglages = { dureeMin: 20 }
    expect(trouver(verifierSeanceDeroule(longue, ctx), 'S-12')).toHaveLength(1)
    const deux = verifierSeanceDeroule(seanceSolo('s', J, ['echauffement-general', 'resistance-boulder-triples', 'resistance-boulder-triples', 'puissance-bloc-limite']), ctx)
    expect(trouver(deux, 'S-12')).toHaveLength(1)
  })
  it('S-13 : pan en début de séance', () => {
    expect(codes(['echauffement-general', 'puissance-bloc-limite', 'puissance-pan-gullich-initiation'])).toContain('S-13')
    expect(codes(['echauffement-general', 'puissance-pan-gullich-initiation', 'puissance-bloc-limite'])).not.toContain('S-13')
  })
  it('S-14 : deux protocoles de suspensions maximales', () => {
    const a = verifierSeanceDeroule(seanceSolo('s', J, ['echauffement-general', 'echauffement-doigts-poutre', 'doigts-reglette-minimale-lopez', 'doigts-7-53-horst']), ctx)
    expect(trouver(a, 'S-14')).toMatchObject([{ niveau: 'information', portee: 'seance' }])
    expect(codes(['echauffement-general', 'echauffement-doigts-poutre', 'doigts-reglette-minimale-lopez'])).not.toContain('S-14')
  })
})

describe('S-15 : repos et niveau de détail', () => {
  const fiches = ['echauffement-general', 'echauffement-doigts-poutre', 'doigts-suspensions-max-lestees']
  function avecRepos(ids: string[], reposS: number | undefined, niveau?: VersionVerif['niveau']) {
    const s = seanceSolo('s', J, ids)
    if (reposS !== undefined) s.solo.etapes[ids.length - 1].reglages = { reposS }
    if (niveau) s.solo.niveau = niveau
    return trouver(verifierSeanceDeroule(s, ctx), 'S-15')
  }
  it('repos de 120 s : fort, message avec 120 s', () => {
    const a = avecRepos(fiches, 120)
    expect(a).toHaveLength(1)
    expect(a[0].niveau).toBe('fort')
    expect(a[0].message).toContain('120 s')
    expect(a[0].message).toContain('prends au moins 3 min')
  })
  it('7-53 sans réglage : rien ; avec 40 s : S-15', () => {
    const ids = ['echauffement-general', 'echauffement-doigts-poutre', 'doigts-7-53-horst']
    expect(avecRepos(ids, undefined)).toHaveLength(0)
    expect(avecRepos(ids, 40)).toHaveLength(1)
  })
  it('exercice perso maximal avec 90 s : S-15', () => {
    const perso = persoFiche({ marqueurs: ['maximale'], reposEntreEffortsS: 90 })
    const c = contexteDeReference({ fiches: { ...ctx.fiches, [perso.id]: perso } })
    const a = verifierSeanceDeroule(seanceSolo('s', J, ['echauffement-general', perso.id], { fiches: c.fiches }), c)
    expect(trouver(a, 'S-15')).toHaveLength(1)
  })
  it('muette en grandes lignes et en simple, forte en détaillé (cas 16)', () => {
    expect(avecRepos(fiches, 120, 'grandes_lignes')).toHaveLength(0)
    expect(avecRepos(fiches, 120, 'simple')).toHaveLength(0)
    expect(avecRepos(fiches, 120, 'detaille')).toHaveLength(1)
  })
})

describe('S-16 à S-19', () => {
  it('S-16 : 85 min de nerveux, puis rien à 60 min', () => {
    const a = verifierSeanceDeroule(seanceSolo('s', J, ['echauffement-general', 'puissance-bloc-limite', 'puissance-planche']), ctx)
    const s16 = trouver(a, 'S-16')
    expect(s16).toHaveLength(1)
    expect(s16[0].message).toContain('85 min')
    expect(codes(['puissance-intervalles-force'])).not.toContain('S-16')
  })
  it('S-17 : séance légère avec effort maximal', () => {
    expect(codes(['echauffement-general', 'puissance-bloc-limite'], { durete: 'legere' })).toContain('S-17')
    expect(codes(['echauffement-general', 'puissance-bloc-limite'])).not.toContain('S-17')
  })
  it('S-18 : bidoigts sous forte charge', () => {
    const perso = persoFiche({ marqueurs: ['bidoigts', 'maximale'] })
    const c = contexteDeReference({ fiches: { ...ctx.fiches, [perso.id]: perso } })
    const a = verifierSeanceDeroule(seanceSolo('s', J, ['echauffement-general', perso.id], { fiches: c.fiches }), c)
    expect(trouver(a, 'S-18')).toMatchObject([{ niveau: 'fort', etapeIndex: 1 }])
    expect(codes(['echauffement-general', 'doigts-abrahangs'])).not.toContain('S-18')
  })
  it('S-19 : exercice perso non qualifié', () => {
    const perso = persoFiche({ marqueurs: null })
    const c = contexteDeReference({ fiches: { ...ctx.fiches, [perso.id]: perso } })
    const a = verifierSeanceDeroule(seanceSolo('s', J, [perso.id], { fiches: c.fiches }), c)
    expect(trouver(a, 'S-19')).toMatchObject([{ niveau: 'information' }])
    expect(codes(['echauffement-general'])).not.toContain('S-19')
  })
})

describe('Version groupe : S-20 à S-23', () => {
  const base = (g: VersionVerif, qualite: SeanceVerif['qualite'] = 'puissance'): SeanceVerif => {
    const s = seanceSolo('s', J, ['echauffement-general'], { qualite, durete: 'legere' })
    s.groupe = g
    return s
  }
  it('S-20 : 0 ou 4 objectifs', () => {
    expect(trouver(verifierSeanceDeroule(base(groupe([], ['technique-pieds-silencieux']), 'technique'), ctx), 'S-20')[0].message).toBe('Une séance en groupe tient en 1 à 3 objectifs. Tu en as 0.')
    expect(trouver(verifierSeanceDeroule(base(groupe([obj(), obj(), obj(), obj()]), 'technique'), ctx), 'S-20')[0].message).toContain('Tu en as 4.')
    expect(trouver(verifierSeanceDeroule(base(groupe([obj()]), 'technique'), ctx), 'S-20')).toHaveLength(0)
  })
  it('S-21 : marqueur à quota d\'un seul côté', () => {
    const s = seanceSolo('s', J, ['echauffement-general', 'puissance-bloc-limite'])
    s.groupe = groupe([obj({ accents: ['puissance'] })])
    const a = trouver(verifierSeanceDeroule(s, ctx), 'S-21')
    expect(a).toHaveLength(1)
    expect(a[0].message).toContain('bloc_limite')
    expect(a[0].portee).toBe('seance')
  })
  it('S-21 : seule la dureté diffère, puis rien si identiques', () => {
    const s = base(groupe([obj({ accents: ['puissance'] })], [], 'dure'))
    expect(trouver(verifierSeanceDeroule(s, ctx), 'S-21')[0].message).toContain('(dureté)')
    expect(trouver(verifierSeanceDeroule(base(groupe([obj({ accents: ['puissance'] })])), ctx), 'S-21')).toHaveLength(0)
  })
  it('S-22 : objectif à la limite sans plafond', () => {
    const s = base(groupe([obj({ accents: ['puissance'], marqueurs: ['bloc_limite'], blocs: 3 })]))
    expect(trouver(verifierSeanceDeroule(s, ctx), 'S-22')).toHaveLength(1)
    const ok = base(groupe([obj({ accents: ['puissance'], marqueurs: ['bloc_limite'], blocs: 3, essaisMaxParBloc: 4 })]))
    expect(trouver(verifierSeanceDeroule(ok, ctx), 'S-22')).toHaveLength(0)
  })
  it('S-22 : deux objectifs sans plafond donnent deux alertes de sujets \'0\' et \'1\'', () => {
    const s = base(groupe([obj({ accents: ['puissance'], marqueurs: ['bloc_limite'] }), obj({ accents: ['puissance'], marqueurs: ['bloc_limite'] })]))
    expect(trouver(verifierSeanceDeroule(s, ctx), 'S-22').map((a) => a.sujet)).toEqual(['0', '1'])
  })
  it('S-23 : qualité dominante non travaillée', () => {
    const s = base(groupe([obj({ accents: ['puissance'] })]), 'resistance')
    expect(trouver(verifierSeanceDeroule(s, ctx), 'S-23')).toHaveLength(1)
    const ok = base(groupe([obj({ accents: ['puissance'] }), obj({ accents: ['resistance'] })]), 'resistance')
    expect(trouver(verifierSeanceDeroule(ok, ctx), 'S-23')).toHaveLength(0)
    expect(trouver(verifierSeanceDeroule(base(groupe([obj({ accents: ['puissance'] })]), 'technique'), ctx), 'S-23')).toHaveLength(0)
  })
})

describe('Modules : S-24 et S-25', () => {
  function avecModule(ficheId: string, dureeMin?: number, durete: VersionVerif['durete'] = 'dure') {
    const s = seanceSolo('s', J, ['echauffement-general', ficheId], { durete })
    s.solo.etapes[1].moduleObjectifId = 'obj-1'
    if (dureeMin !== undefined) s.solo.etapes[1].reglages = { dureeMin }
    return verifierSeanceDeroule(s, ctx)
  }
  it('S-24 : 20 min hors format, 12 min correct', () => {
    expect(trouver(avecModule('technique-pieds-silencieux', 20), 'S-24')[0].message).toContain('dure 20 min')
    expect(trouver(avecModule('technique-pieds-silencieux', 12), 'S-24')).toHaveLength(0)
  })
  it('S-25 : module intense dans une version légère', () => {
    expect(trouver(avecModule('doigts-reglette-minimale-lopez', 12, 'legere'), 'S-25')).toHaveLength(1)
    expect(trouver(avecModule('doigts-reglette-minimale-lopez', 12, 'dure'), 'S-25')).toHaveLength(0)
  })
})

describe('S-26 : séance dure sans exercice connu (décision F7)', () => {
  it('dure et sans étape : information, sans « maximal »', () => {
    const s = seanceSolo('s', J, [], { durete: 'dure', nom: 'Ma séance', qualite: 'traction_gainage' })
    const a = verifierSeanceDeroule(s, ctx)
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ code: 'S-26', niveau: 'information', portee: 'seance', version: 'solo' })
    expect(a[0].message).toBe('« Ma séance » est notée dure, sans exercice de la bibliothèque : l\'app la compte comme une séance dure ordinaire. Si tu y fais de la poutre ou du bloc à ta limite, choisis son exercice principal : la règle des 48 h et les quotas en tiendront compte.')
    expect(a[0].message).not.toContain('maximal')
  })
  it('légère : muette ; avec exercice principal résumé : muette', () => {
    expect(verifierSeanceDeroule(seanceSolo('s', J, [], { durete: 'legere' }), ctx)).toHaveLength(0)
    const s = seanceSolo('s', J, ['traction-simple-4x5'], { durete: 'dure', dureeMin: 90 })
    s.solo.etapesDetaillees = false
    expect(verifierSeanceDeroule(s, ctx)).toEqual([])
  })
})

describe('Selon le contenu (B.5 consolidé, cas 15)', () => {
  it('étapes résumées : S-10 à S-14, S-16, S-24, S-25 muettes', () => {
    const s = seanceSolo('s', J, ['traction-lestee-force-lattice'], { dureeMin: 90 })
    s.solo.etapesDetaillees = false
    expect(verifierSeanceDeroule(s, ctx)).toEqual([])
    const m = seanceSolo('s', J, ['puissance-bloc-limite', 'puissance-pan-gullich-initiation'])
    m.solo.etapesDetaillees = false
    m.solo.etapes[0].moduleObjectifId = 'o'
    expect(verifierSeanceDeroule(m, ctx).map((a) => a.code)).toEqual([])
  })
  it('étapes résumées : S-17 et S-18 restent actives', () => {
    const s = seanceSolo('s', J, ['puissance-bloc-limite'], { durete: 'legere' })
    s.solo.etapesDetaillees = false
    expect(verifierSeanceDeroule(s, ctx).map((a) => a.code)).toContain('S-17')
  })
})

describe('Déroulés du catalogue : aucune alerte', () => {
  it('séance doigts et séance traction', () => {
    const a = seanceSolo('a', J, ['echauffement-general', 'echauffement-doigts-poutre', 'doigts-reglette-minimale-lopez', 'puissance-bloc-limite', 'antagonistes-lattice'])
    const b = seanceSolo('b', J, ['echauffement-general', 'puissance-bloc-limite', 'traction-lestee-force-lattice', 'antagonistes-lattice'])
    expect(verifierSeanceDeroule(a, ctx)).toEqual([])
    expect(verifierSeanceDeroule(b, ctx)).toEqual([])
  })
})
