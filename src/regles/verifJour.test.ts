import { describe, expect, it } from 'vitest'
import { contexteDeReference, seanceSolo } from './exemples.ts'
import { verifierJour } from './verifJour.ts'
import type { ContexteVerif, DouleurVerif, FormeVerif, Marqueur, ResultatTestVerif, SeanceVerif } from './types.ts'

const AUJOURDHUI = '2026-11-23'

/** Séance dure sans maximale : une fiche de traction simple, dure déclarée. */
const seanceDure = () => seanceSolo('dure', AUJOURDHUI, ['traction-simple-4x5'], { durete: 'dure' })
/** Séance légère. */
const seanceLegere = () => seanceSolo('legere', AUJOURDHUI, ['traction-simple-4x5'], { durete: 'legere' })
/** Séance maximale : la fiche de traction lestée porte le marqueur « maximale ». */
const seanceMaximale = () => seanceSolo('max', AUJOURDHUI, ['traction-lestee-force-lattice'])
/** Séance dure sans exercice connu (décision F7 : une séance dure ordinaire). */
const seanceDureSansContenu = () =>
  seanceSolo('vide', AUJOURDHUI, [], { durete: 'dure', qualite: 'traction_gainage', dureeMin: 90 })

/** Forme du jour, ou d'un autre jour ; les valeurs par défaut ne déclenchent aucune vérification. */
function forme(date: string, surcharge: Partial<FormeVerif> = {}): FormeVerif {
  return { date, sommeil: 4, fatigue: 4, courbatures: 4, douleur: 4, peau: 4, ...surcharge }
}

/** Séance réalisée à une heure donnée, avec ses marqueurs et sa peau. */
function realisee(id: string, date: string, finLe: string, marqueurs: Marqueur[] = [], peau?: 1 | 2 | 3): SeanceVerif {
  return seanceSolo(id, date, ['traction-simple-4x5'], {
    realisee: { version: 'solo', finLe, dureeMin: 60, effortPercu: 6, marqueurs, peau },
  })
}

function douleur(date: string, surcharge: Partial<DouleurVerif> = {}): DouleurVerif {
  return { date, zone: 'doigts', niveau: 'reduction', signes: [], ...surcharge }
}

function codes(ctx: ContexteVerif, seance: SeanceVerif, realisees: SeanceVerif[] = []): string[] {
  return verifierJour(seance, ctx, realisees).map((a) => a.code)
}

describe('J-01 deux voyants rouges', () => {
  const formeRouge = forme(AUJOURDHUI, { sommeil: 2, fatigue: 2, courbatures: 4, douleur: 5, peau: 4 })

  it('déclenche sur une séance dure', () => {
    const ctx = contexteDeReference({ formes: [formeRouge] })
    const avertissements = verifierJour(seanceDure(), ctx, [])
    expect(avertissements).toHaveLength(1)
    expect(avertissements[0]).toMatchObject({
      code: 'J-01',
      niveau: 'information',
      portee: 'jour',
      seanceId: 'dure',
      message: 'Deux voyants sont au rouge ce matin. Fais plutôt la version légère, ou une séance technique.',
    })
  })
  it('ne déclenche pas sur une séance légère', () => {
    expect(codes(contexteDeReference({ formes: [formeRouge] }), seanceLegere())).not.toContain('J-01')
  })
})

describe('J-02 manque de sommeil', () => {
  const nuits = (heures: number[]) =>
    heures.map((h, i) => forme(`2026-11-${String(23 - i).padStart(2, '0')}`, { heuresSommeil: h }))

  it('déclenche sur 6 h, 6,5 h, 7 h (moyenne 6,5) avec une séance maximale', () => {
    const ctx = contexteDeReference({ formes: nuits([6, 6.5, 7]) })
    const avertissement = verifierJour(seanceMaximale(), ctx, []).find((a) => a.code === 'J-02')
    expect(avertissement?.message).toBe(
      "Moins de 7 h de sommeil en moyenne sur 3 nuits : transforme la séance maximale en séance technique ou de volume.",
    )
  })
  it('ne déclenche pas sur 7, 7, 7', () => {
    expect(codes(contexteDeReference({ formes: nuits([7, 7, 7]) }), seanceMaximale())).not.toContain('J-02')
  })
  it('ne déclenche pas avec seulement 2 nuits renseignées', () => {
    expect(codes(contexteDeReference({ formes: nuits([6, 6]) }), seanceMaximale())).not.toContain('J-02')
  })
})

describe('J-03 douleur signalée ce matin', () => {
  it('déclenche avec une douleur de 2 ou moins sur une séance dure', () => {
    const ctx = contexteDeReference({ formes: [forme(AUJOURDHUI, { douleur: 2 })] })
    expect(verifierJour(seanceDure(), ctx, []).find((a) => a.code === 'J-03')).toMatchObject({
      niveau: 'information',
      message:
        "Tu signales une douleur ce matin. Allège la séance, et arrête si elle dépasse 2 sur 10 pendant l'effort.",
    })
  })
  it('ne déclenche pas sur une séance légère', () => {
    const ctx = contexteDeReference({ formes: [forme(AUJOURDHUI, { douleur: 2 })] })
    expect(codes(ctx, seanceLegere())).not.toContain('J-03')
  })
})

describe('J-04 récupération pas finie', () => {
  const maximaleFinieLe = (finLe: string) => realisee('passee', '2026-11-22', finLe, ['maximale'])

  it('déclenche 14 h après une séance maximale, avec 34 h restantes', () => {
    const ctx = contexteDeReference()
    const avertissement = verifierJour(seanceMaximale(), ctx, [maximaleFinieLe('2026-11-22T18:00:00.000Z')]).find(
      (a) => a.code === 'J-04',
    )
    expect(avertissement).toMatchObject({
      niveau: 'fort',
      message: 'Ta dernière séance maximale date de 14 h. Attends encore 34 h, ou fais la version légère.',
    })
  })
  it('ne déclenche pas 49 h après', () => {
    const ctx = contexteDeReference()
    expect(codes(ctx, seanceMaximale(), [maximaleFinieLe('2026-11-21T07:00:00.000Z')])).not.toContain('J-04')
  })
})

describe('J-05 douleur qui dure', () => {
  it('déclenche pour une douleur de réduction ouverte depuis 14 jours', () => {
    const ctx = contexteDeReference({ douleurs: [douleur('2026-11-09')] })
    expect(verifierJour(seanceLegere(), ctx, []).find((a) => a.code === 'J-05')).toMatchObject({
      niveau: 'fort',
      message: "Ta douleur (doigts) dure depuis 14 jours. Consulte un médecin ou un kiné qui connaît l'escalade.",
    })
  })
  it('ne déclenche pas depuis 13 jours, ni pour une douleur résolue', () => {
    const recente = contexteDeReference({ douleurs: [douleur('2026-11-10')] })
    expect(codes(recente, seanceLegere())).not.toContain('J-05')
    const resolue = contexteDeReference({ douleurs: [douleur('2026-11-09', { resolueLe: '2026-11-20' })] })
    expect(codes(resolue, seanceLegere())).not.toContain('J-05')
  })
})

describe('J-06 test en baisse avec fatigue', () => {
  const tractions: ResultatTestVerif[] = [
    { testNom: 'Tractions strictes', date: '2026-10-26', valeur: 12, sensProgres: 'hausse' },
    { testNom: 'Tractions strictes', date: '2026-11-20', valeur: 10, sensProgres: 'hausse' },
  ]

  it('déclenche avec un test en baisse et deux formes fatiguées', () => {
    const ctx = contexteDeReference({
      resultatsTests: tractions,
      formes: [forme('2026-11-18', { fatigue: 2 }), forme('2026-11-21', { fatigue: 2 })],
    })
    expect(verifierJour(seanceLegere(), ctx, []).find((a) => a.code === 'J-06')?.message).toBe(
      'Ton test « Tractions strictes » baisse et tu es fatigué : prends une semaine allégée avant de continuer.',
    )
  })
  it('ne déclenche pas avec une seule forme fatiguée', () => {
    const ctx = contexteDeReference({
      resultatsTests: tractions,
      formes: [forme('2026-11-21', { fatigue: 2 })],
    })
    expect(codes(ctx, seanceLegere())).not.toContain('J-06')
  })
  it('lit le sens de progrès : un temps qui diminue est une amélioration', () => {
    const ctx = contexteDeReference({
      resultatsTests: [
        { testNom: 'Suspension 15 s', date: '2026-11-10', valeur: 30, sensProgres: 'baisse' },
        { testNom: 'Suspension 15 s', date: '2026-11-20', valeur: 25, sensProgres: 'baisse' },
      ],
      formes: [forme('2026-11-18', { fatigue: 2 }), forme('2026-11-21', { fatigue: 2 })],
    })
    expect(codes(ctx, seanceLegere())).not.toContain('J-06')
  })
})

describe('J-07 peau abîmée', () => {
  it('déclenche si la dernière séance avec peau abîmée date d hier, sur une séance dure', () => {
    const ctx = contexteDeReference()
    const hier = realisee('hier', '2026-11-22', '2026-11-22T18:00:00.000Z', [], 1)
    expect(verifierJour(seanceDure(), ctx, [hier]).find((a) => a.code === 'J-07')).toMatchObject({
      niveau: 'information',
      message: 'Ta peau était abîmée à la dernière séance. Si tes pulpes sont roses et brillantes, prends un jour de repos.',
    })
  })
  it('ne déclenche pas pour une séance d il y a deux jours, ni sur une séance légère', () => {
    const ctx = contexteDeReference()
    const avant = realisee('avant', '2026-11-21', '2026-11-21T18:00:00.000Z', [], 1)
    expect(codes(ctx, seanceDure(), [avant])).not.toContain('J-07')
    const hier = realisee('hier', '2026-11-22', '2026-11-22T18:00:00.000Z', [], 1)
    expect(codes(ctx, seanceLegere(), [hier])).not.toContain('J-07')
  })
})

describe('séance dure sans exercice connu (décision F7, 23/11)', () => {
  it('ne déclenche ni J-02 ni J-04, même avec 6 h de sommeil et une maximale 20 h avant', () => {
    const nuits = [23, 22, 21].map((j) => forme(`2026-11-${j}`, { heuresSommeil: 6 }))
    const maximaleRecente = realisee('max', '2026-11-22', '2026-11-22T12:00:00.000Z', ['maximale'])
    const ctx = contexteDeReference({ formes: nuits })
    const liste = codes(ctx, seanceDureSansContenu(), [maximaleRecente])
    expect(liste).not.toContain('J-02')
    expect(liste).not.toContain('J-04')
  })
  it('déclenche J-01 si deux voyants sont au rouge', () => {
    const ctx = contexteDeReference({
      formes: [forme(AUJOURDHUI, { sommeil: 2, fatigue: 2 })],
    })
    const maximaleRecente = realisee('max', '2026-11-22', '2026-11-22T12:00:00.000Z', ['maximale'])
    expect(codes(ctx, seanceDureSansContenu(), [maximaleRecente])).toContain('J-01')
  })
})

describe('ordre des avertissements', () => {
  it('les avertissements forts viennent avant les informations', () => {
    const ctx = contexteDeReference({
      formes: [forme(AUJOURDHUI, { sommeil: 2, fatigue: 2 })],
      douleurs: [douleur('2026-11-09')],
    })
    const maximaleRecente = realisee('max', '2026-11-22', '2026-11-22T18:00:00.000Z', ['maximale'])
    const liste = verifierJour(seanceMaximale(), ctx, [maximaleRecente]).map((a) => [a.code, a.niveau])
    expect(liste).toEqual([
      ['J-04', 'fort'],
      ['J-05', 'fort'],
      ['J-01', 'information'],
    ])
  })
})
