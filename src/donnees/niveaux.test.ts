import { describe, expect, it } from 'vitest'
import { EXEMPLE_CYCLE, EXEMPLE_SEANCE_PLANIFIEE } from './exemplesV2.ts'
import { NIVEAUX_DETAIL, type AccentPhase, type PartieSeance, type SeancePlanifiee, type VersionSolo } from './modele.ts'
import {
  ACCENTS_NERVEUX, ETIQUETTES_NIVEAU, EXEMPLES_NIVEAU, dureeVersionSolo, niveauAffiche, niveauChoisi,
  niveauDisponible, niveauPropose, plusPetitNiveau,
} from './niveaux.ts'

const etape = EXEMPLE_SEANCE_PLANIFIEE.solo.etapes[0]
const parties: PartieSeance[] = [
  { titre: 'Échauffement', dureeMin: 30 },
  { titre: 'Bloc limite', dureeMin: 45 },
]
const soloSans = (extra: Partial<VersionSolo> = {}): VersionSolo => ({ ...EXEMPLE_SEANCE_PLANIFIEE.solo, etapes: [], ...extra })
const seanceAvec = (solo: VersionSolo, niveauDetail?: SeancePlanifiee['niveauDetail']): SeancePlanifiee => ({
  ...EXEMPLE_SEANCE_PLANIFIEE, solo, ...(niveauDetail ? { niveauDetail } : {}),
})

describe('niveaux de détail', () => {
  it('les niveaux vont du moins au plus détaillé', () => {
    expect(NIVEAUX_DETAIL).toEqual(['simple', 'grandes_lignes', 'detaille'])
    expect(plusPetitNiveau('detaille', 'simple')).toBe('simple')
    expect(plusPetitNiveau('grandes_lignes', 'detaille')).toBe('grandes_lignes')
    for (const n of NIVEAUX_DETAIL) {
      expect(ETIQUETTES_NIVEAU[n]).not.toBe('')
      expect(EXEMPLES_NIVEAU[n]).not.toBe('')
    }
  })

  it('un document existant sans les nouveaux champs se lit comme avant (détaillé)', () => {
    // Document tel qu'enregistré avant les niveaux, relu après un aller-retour JSON (sauvegarde ou synchro).
    const ancienneSeance = JSON.parse(JSON.stringify(EXEMPLE_SEANCE_PLANIFIEE)) as SeancePlanifiee
    const ancienCycle = JSON.parse(JSON.stringify(EXEMPLE_CYCLE))
    expect(ancienneSeance).not.toHaveProperty('niveauDetail')
    expect(ancienCycle).not.toHaveProperty('niveauDetail')
    expect(ancienneSeance.solo).not.toHaveProperty('recommandation')
    expect(ancienneSeance.solo).not.toHaveProperty('parties')
    expect(ancienneSeance.versionFormat).toBe(1)
    expect(niveauChoisi(ancienneSeance, ancienCycle)).toBe('detaille')
    expect(niveauAffiche(ancienneSeance, ancienCycle)).toBe('detaille')
    expect(niveauAffiche(ancienneSeance)).toBe('detaille')
    expect(dureeVersionSolo(ancienneSeance.solo)).toBe(
      ancienneSeance.solo.etapes.reduce((t, e) => t + e.dureeMin, 0),
    )
  })

  it('séance simple dans un cycle détaillé : simple ; sans niveau propre : celui du cycle', () => {
    const cycle = { niveauDetail: 'detaille' as const }
    expect(niveauChoisi(seanceAvec(EXEMPLE_SEANCE_PLANIFIEE.solo, 'simple'), cycle)).toBe('simple')
    expect(niveauAffiche(seanceAvec(EXEMPLE_SEANCE_PLANIFIEE.solo, 'simple'), cycle)).toBe('simple')
    expect(niveauChoisi(seanceAvec(EXEMPLE_SEANCE_PLANIFIEE.solo), { niveauDetail: 'grandes_lignes' })).toBe('grandes_lignes')
  })

  it('choisi détaillé sans étapes : grandes lignes avec des parties, simple sans', () => {
    expect(niveauAffiche(seanceAvec(soloSans({ parties }), 'detaille'))).toBe('grandes_lignes')
    expect(niveauAffiche(seanceAvec(soloSans(), 'detaille'))).toBe('simple')
  })

  it('le niveau disponible suit le contenu ; changer de niveau ne touche pas aux étapes (R-9)', () => {
    const s = seanceAvec({ ...EXEMPLE_SEANCE_PLANIFIEE.solo, parties }, 'simple')
    const avant = JSON.stringify(s)
    expect(niveauDisponible(s.solo)).toBe('detaille')
    expect(niveauAffiche(s)).toBe('simple')
    expect(JSON.stringify(s)).toBe(avant)
    expect(s.solo.etapes.length).toBeGreaterThan(0)
  })

  it('dureeVersionSolo : étapes, parties (30 + 45 = 75), vide', () => {
    expect(dureeVersionSolo({ ...soloSans(), etapes: [etape] })).toBe(etape.dureeMin)
    expect(dureeVersionSolo(soloSans({ parties: [{ titre: 'A', dureeMin: 30 }, { titre: 'B', dureeMin: 45 }] }))).toBe(75)
    expect(dureeVersionSolo(soloSans())).toBe(0)
  })
})

describe('niveauPropose (décision F6)', () => {
  const PHRASE_1 = 'Une de tes phases travaille les doigts, la traction ou la puissance'
  const PHRASE_2 = 'Les accents de tes phases ne sont pas tous choisis'
  const PHRASE_3 = 'Tes phases visent l\'endurance, la résistance ou la technique'

  it('liste vide ou accent manquant : détaillé, phrase 2', () => {
    for (const a of [[], [null, null, null], ['endurance', null, 'technique']] as (AccentPhase | null)[][]) {
      const r = niveauPropose(a)
      expect(r.niveau).toBe('detaille')
      expect(r.pourquoi).toContain(PHRASE_2)
    }
  })

  it('un accent nerveux : détaillé, phrase 1 (accents de départ compris)', () => {
    const departs: AccentPhase[][] = [
      ['doigts', 'puissance', 'resistance'],
      ['doigts', 'endurance', 'resistance'],
      ['traction_gainage', 'endurance', 'puissance'],
    ]
    for (const a of departs) {
      const r = niveauPropose(a)
      expect(r.niveau).toBe('detaille')
      expect(r.pourquoi).toContain(PHRASE_1)
    }
  })

  it('endurance, résistance, technique : grandes lignes, phrase 3', () => {
    for (const a of [['endurance', 'resistance', 'technique'], ['technique', 'technique', 'technique']] as AccentPhase[][]) {
      const r = niveauPropose(a)
      expect(r.niveau).toBe('grandes_lignes')
      expect(r.pourquoi).toContain(PHRASE_3)
    }
  })

  it('sur les 343 combinaisons : jamais simple, jamais de phrase vide', () => {
    const valeurs: (AccentPhase | null)[] = [...ACCENTS_NERVEUX, 'resistance', 'endurance', 'technique', null]
    expect(valeurs).toHaveLength(7)
    let n = 0
    for (const a of valeurs) for (const b of valeurs) for (const c of valeurs) {
      const r = niveauPropose([a, b, c])
      expect(r.niveau).not.toBe('simple')
      expect(r.pourquoi).not.toBe('')
      n++
    }
    expect(n).toBe(343)
  })
})
