import { describe, expect, it } from 'vitest'
import { contexteDeReference, PROFIL_DE_REFERENCE, seanceSolo } from './exemples.ts'
import { manquesPrerequis, verifierSeanceProfil } from './verifSeanceProfil.ts'
import type { Avertissement, ContexteVerif, DouleurVerif, ProfilVerif, SeanceVerif } from './types.ts'

const JOUR = '2026-11-23'

function verifier(
  ficheIds: string[],
  surcharges: Partial<ContexteVerif> = {},
  origine: 'utilisateur' | 'assistant' = 'utilisateur',
  date = JOUR,
): Avertissement[] {
  return verifierSeanceProfil(seanceSolo('s1', date, ficheIds), contexteDeReference(surcharges), origine)
}
const codes = (a: Avertissement[]) => a.map((x) => x.code)
const profil = (surcharges: Partial<ProfilVerif>): ProfilVerif => ({ ...PROFIL_DE_REFERENCE, ...surcharges })
const douleur = (surcharges: Partial<DouleurVerif>): DouleurVerif => ({
  date: '2026-11-20',
  zone: 'coude',
  niveau: 'reduction',
  signes: [],
  ...surcharges,
})

describe('S-01 fiche inconnue', () => {
  it('une fiche inventée donne S-01 fort, et rien d\'autre', () => {
    const a = verifier(['fiche-inventee'])
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ code: 'S-01', niveau: 'fort', portee: 'etape', version: 'solo', etapeIndex: 0, seanceId: 's1' })
    expect(a[0].message).toBe("Cet exercice n'existe pas dans ta bibliothèque (fiche-inventee). Remplace-le ou supprime l'étape.")
  })
  it('une fiche connue ne donne pas S-01', () => {
    expect(codes(verifier(['technique-pieds-silencieux']))).not.toContain('S-01')
  })
  it('la fiche inconnue est ignorée par les autres règles même avec une douleur', () => {
    const a = verifier(['fiche-inventee'], { profil: profil({ douleursEnCours: ['doigts'] }) })
    expect(codes(a)).toEqual(['S-01'])
  })
})

describe('S-02 fiche encore à vérifier', () => {
  it('assistant : fort', () => {
    const a = verifier(['puissance-pan-gullich-stien'], {}, 'assistant').find((x) => x.code === 'S-02')
    expect(a?.niveau).toBe('fort')
    expect(a?.message).toContain("L'assistant a proposé « ")
    expect(a?.message).toContain('Remplace-la.')
  })
  it('cas 12 de B.11 : assistant avec la fiche de Güllich donne S-02 fort et S-03 fort', () => {
    const a = verifier(['puissance-pan-gullich-stien'], {}, 'assistant')
    expect(a.filter((x) => ['S-02', 'S-03'].includes(x.code)).map((x) => x.niveau)).toEqual(['fort', 'fort'])
  })
  it('utilisateur : information', () => {
    const a = verifier(['puissance-pan-gullich-stien'], {}, 'utilisateur').find((x) => x.code === 'S-02')
    expect(a?.niveau).toBe('information')
    expect(a?.message).toContain('a un réglage encore à vérifier : ')
    expect(a?.message).toContain('Garde-la seulement si tu sais la régler.')
  })
  it('fiche sans réserve : rien', () => {
    expect(codes(verifier(['technique-pieds-silencieux']))).not.toContain('S-02')
  })
})

describe('S-03 prérequis', () => {
  it('tractions non renseignées', () => {
    const a = verifier(['traction-lestee-force-lattice'], { profil: profil({ tractionsStrictesMax: null }) })
    const s03 = a.find((x) => x.code === 'S-03')
    expect(s03?.niveau).toBe('fort')
    expect(s03?.message).toContain('10 tractions strictes (non renseigné)')
  })
  it('6 tractions', () => {
    const a = verifier(['traction-lestee-force-lattice'], { profil: profil({ tractionsStrictesMax: 6 }) })
    expect(a.find((x) => x.code === 'S-03')?.message).toContain('10 tractions strictes (tu en fais 6)')
  })
  it('profil de référence : aucune S-03', () => {
    expect(codes(verifier(['traction-lestee-force-lattice']))).not.toContain('S-03')
  })
  it('poutre régulière demandée', () => {
    const a = verifier(['doigts-suspensions-max-lestees'])
    expect(a.find((x) => x.code === 'S-03')?.message).toContain('une expérience de poutre régulière')
  })
  it('niveau de bloc : 6A+ insuffisant pour 6B, 6B suffisant', () => {
    const a = verifier(['puissance-planche'], { profil: profil({ niveauBloc: '6A+' }) })
    expect(a.find((x) => x.code === 'S-03')?.message).toContain('un niveau 6B en bloc')
    expect(codes(verifier(['puissance-planche'], { profil: profil({ niveauBloc: '6B' }) }))).not.toContain('S-03')
  })
  it('une seule alerte par fiche, qui liste tous les manques', () => {
    const a = verifier(['traction-lestee-force-lattice'], { profil: profil({ tractionsStrictesMax: 3, adulte: null, test15sSur25mm: null }) })
    const s03 = a.filter((x) => x.code === 'S-03')
    expect(s03).toHaveLength(1)
    expect(s03[0].message).toContain(' ; ')
    expect(s03[0].message).toMatch(/^« .* » demande : .*\. Choisis une fiche plus accessible, ou complète ton profil si c'est déjà le cas\.$/)
  })
})

describe('manquesPrerequis', () => {
  it('années et adulte inconnu : 2 phrases, dans l\'ordre', () => {
    const m = manquesPrerequis({ anneesPratiqueMin: 2, adulte: true }, profil({ anneesPratique: 1, adulte: null }))
    expect(m).toEqual(['2 ans de pratique (tu en as 1)', '18 ans ou plus'])
  })
  it('toutes les phrases, dans l\'ordre de la spécification', () => {
    const m = manquesPrerequis(
      { anneesPratiqueMin: 5, experiencePoutreMin: 'occasionnelle', tractionsStrictesMin: 15, test15sSur25mm: true, niveauBlocMin: '7B', adulte: true },
      profil({ anneesPratique: 0, experiencePoutre: 'aucune', tractionsStrictesMax: 2, test15sSur25mm: null, niveauBloc: null, adulte: false }),
    )
    expect(m).toEqual([
      '5 ans de pratique (tu en as 0)',
      'une expérience de poutre occasionnelle',
      '15 tractions strictes (tu en fais 2)',
      'tenir 15 s sur une réglette de 25 mm',
      'un niveau 7B en bloc',
      '18 ans ou plus',
    ])
  })
  it('prérequis remplis ou vides : aucun manque', () => {
    expect(manquesPrerequis({}, profil({}))).toEqual([])
    expect(manquesPrerequis({ niveauBlocMin: '7A' }, profil({ niveauBloc: '7A' }))).toEqual([])
  })
  it('compare les positions des cotations, pas les textes', () => {
    expect(manquesPrerequis({ niveauBlocMin: '6C+' }, profil({ niveauBloc: '7A' }))).toEqual([])
    expect(manquesPrerequis({ niveauBlocMin: '7A' }, profil({ niveauBloc: '6C+' }))).toEqual(['un niveau 7A en bloc'])
  })
})

describe('S-04 douleur déclarée', () => {
  it('douleur du profil et fiche qui la sollicite', () => {
    const a = verifier(['puissance-bloc-limite'], { profil: profil({ douleursEnCours: ['doigts'] }) }).find((x) => x.code === 'S-04')
    expect(a?.niveau).toBe('fort')
    expect(a?.message).toMatch(
      /^Tu as signalé une douleur \(doigts\)\. « .* » la sollicite : remplace-la par un exercice qui ne fait pas mal, ou retire-la\.$/,
    )
  })
  it('fiche qui ne sollicite pas la zone : rien', () => {
    expect(codes(verifier(['technique-pieds-silencieux'], { profil: profil({ douleursEnCours: ['doigts'] }) }))).not.toContain('S-04')
  })
  it('douleur ouverte déclarée avant la séance', () => {
    const a = verifier(['antagonistes-legers'], { douleurs: [douleur({})] })
    expect(codes(a)).toContain('S-04')
  })
  it('plusieurs zones : une seule alerte par étape, zones séparées par une virgule', () => {
    const fiches = contexteDeReference().fiches
    const ctx = contexteDeReference({
      fiches: { ...fiches, test: { ...fiches['technique-pieds-silencieux'], id: 'test', contreIndications: ['doigts', 'coude'] } },
      profil: profil({ douleursEnCours: ['doigts', 'coude'] }),
    })
    const a = verifierSeanceProfil(seanceSolo('s1', JOUR, ['test'], { fiches: ctx.fiches }), ctx, 'utilisateur').filter((x) => x.code === 'S-04')
    expect(a).toHaveLength(1)
    expect(a[0].message).toContain('(doigts, coude)')
  })
})

describe('S-05 signe d\'alerte', () => {
  const alerte = douleur({ niveau: 'alerte', signes: ['gonflement', 'blocage'] })
  it('séance dure : une S-05, signes listés', () => {
    const a = verifier(['puissance-bloc-limite'], { douleurs: [alerte] }).filter((x) => x.code === 'S-05')
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ niveau: 'fort', portee: 'seance' })
    expect(a[0].message).toBe(
      "Tu as signalé un signe d'alerte (gonflement, blocage). Pas de séance dure avant d'avoir consulté un médecin ou un kiné qui connaît l'escalade.",
    )
  })
  it('séance légère sans marqueur nerveux : rien', () => {
    expect(codes(verifier(['technique-pieds-silencieux'], { douleurs: [alerte] }))).not.toContain('S-05')
  })
  it('douleur résolue le 21 : rien', () => {
    expect(codes(verifier(['puissance-bloc-limite'], { douleurs: [{ ...alerte, resolueLe: '2026-11-21' }] }))).not.toContain('S-05')
  })
  it('alerte déclarée après la séance : rien', () => {
    expect(codes(verifier(['puissance-bloc-limite'], { douleurs: [{ ...alerte, date: '2026-11-25' }] }))).not.toContain('S-05')
  })
  it('une seule S-05 même avec une version groupe', () => {
    const s: SeanceVerif = {
      ...seanceSolo('s1', JOUR, ['puissance-bloc-limite']),
      groupe: { durete: 'dure', etapes: [{ ficheId: 'puissance-bloc-limite' }] },
    }
    const a = verifierSeanceProfil(s, contexteDeReference({ douleurs: [alerte] }), 'utilisateur')
    expect(a.filter((x) => x.code === 'S-05')).toHaveLength(1)
  })
})

describe('S-06 effort à risque pendant une douleur', () => {
  const fiche = 'doigts-reglette-minimale-horst'
  it('douleur du 20, séance du 23 : S-06', () => {
    const a = verifier([fiche], { douleurs: [douleur({})] }).find((x) => x.code === 'S-06')
    expect(a?.niveau).toBe('fort')
    expect(a?.message).toContain('Tu as une douleur en cours. Pendant 1 à 2 semaines, retire « ')
    expect(a?.message).toContain("pas d'arqué, de pan, de trous ni d'effort maximal. Garde de la grimpe facile qui ne fait pas mal.")
  })
  it('même séance le 5 décembre (15 jours) : pas de S-06', () => {
    expect(codes(verifier([fiche], { douleurs: [douleur({})] }, 'utilisateur', '2026-12-05'))).not.toContain('S-06')
  })
  it('14 jours : encore S-06', () => {
    expect(codes(verifier([fiche], { douleurs: [douleur({})] }, 'utilisateur', '2026-12-04'))).toContain('S-06')
  })
  it('douleur résolue ou fiche sans marqueur à risque : rien', () => {
    expect(codes(verifier([fiche], { douleurs: [douleur({ resolueLe: '2026-11-22' })] }))).not.toContain('S-06')
    expect(codes(verifier(['technique-pieds-silencieux'], { douleurs: [douleur({})] }))).not.toContain('S-06')
  })
  it('douleur de niveau alerte : pas de S-06 (c\'est S-05)', () => {
    expect(codes(verifier([fiche], { douleurs: [douleur({ niveau: 'alerte' })] }))).not.toContain('S-06')
  })
})

describe('S-07, S-08 et S-09 contexte', () => {
  it('école de vol sans savoir grimper en tête : S-07 fort, pas de S-08', () => {
    const a = verifier(['mental-ecole-de-vol'], { profil: profil({ grimpeEnTete: false }) })
    expect(codes(a)).toContain('S-07')
    expect(codes(a)).not.toContain('S-08')
    expect(a.find((x) => x.code === 'S-07')?.niveau).toBe('fort')
  })
  it('école de vol en sachant grimper en tête : S-08 information', () => {
    const a = verifier(['mental-ecole-de-vol'], { profil: profil({ grimpeEnTete: true }) })
    expect(codes(a)).not.toContain('S-07')
    expect(a.find((x) => x.code === 'S-08')?.niveau).toBe('information')
  })
  it('grimpeEnTete non renseigné compte comme non', () => {
    expect(codes(verifier(['mental-ecole-de-vol'], { profil: profil({ grimpeEnTete: null }) }))).toContain('S-07')
  })
  it('fiche sans contexte : ni S-07 ni S-08', () => {
    const a = codes(verifier(['technique-pieds-silencieux']))
    expect(a).not.toContain('S-07')
    expect(a).not.toContain('S-08')
  })
  it('S-09 : voie pour un bloqueur, rien pour un grimpeur de voie', () => {
    const bloqueur = verifier(['endurance-4x4-voies'])
    expect(bloqueur.find((x) => x.code === 'S-09')).toMatchObject({ niveau: 'information' })
    expect(bloqueur.find((x) => x.code === 'S-09')?.message).toMatch(/^« .* » se fait en voie\. Vérifie que ta salle en a\.$/)
    expect(codes(verifier(['endurance-4x4-voies'], { profil: profil({ disciplinePrincipale: 'voie' }) }))).not.toContain('S-09')
  })
})

describe('version groupe et sources', () => {
  it('la version groupe est vérifiée avec version: groupe', () => {
    const s: SeanceVerif = {
      ...seanceSolo('s1', JOUR, ['technique-pieds-silencieux']),
      groupe: { durete: 'legere', etapes: [{ ficheId: 'fiche-inventee' }] },
    }
    const a = verifierSeanceProfil(s, contexteDeReference(), 'utilisateur')
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ code: 'S-01', version: 'groupe', etapeIndex: 0 })
  })
  it('chaque avertissement a une source en clair, sans crochets', () => {
    const a = verifier(['puissance-pan-gullich-stien', 'mental-ecole-de-vol', 'fiche-inventee'], {
      profil: profil({ douleursEnCours: ['doigts'], grimpeEnTete: false }),
    })
    expect(a.length).toBeGreaterThan(3)
    for (const x of a) expect(x.source).not.toMatch(/[[\]]/)
  })
  it('étape résumée (etapesDetaillees: false) : vérifiée comme les autres', () => {
    const s = seanceSolo('s1', JOUR, ['mental-ecole-de-vol'])
    s.solo.etapesDetaillees = false
    expect(codes(verifierSeanceProfil(s, contexteDeReference(), 'utilisateur'))).toContain('S-07')
  })
})
