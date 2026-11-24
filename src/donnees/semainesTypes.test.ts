import { describe, expect, it } from 'vitest'
import type { AccentPhase } from './modele.ts'
import type { JourSemaine } from './profil.ts'
import { marqueursSeanceType, seanceTypeParId, type SeanceType } from './seancesTypes.ts'
import { JOURS_CONSEILLES, accentsDeDepart, semaineType, type ChoixSeance } from './semainesTypes.ts'

const ACCENTS: AccentPhase[] = ['doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance', 'technique']
const NOMBRES = [2, 3, 4, 5] as const
const ORDRE_JOURS: JourSemaine[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

const stDe = (id: string): SeanceType => {
  const st = seanceTypeParId(id)
  if (st === undefined) throw new Error(`Séance type introuvable : ${id}`)
  return st
}

const estMaximale = (c: ChoixSeance): boolean =>
  marqueursSeanceType(stDe(c.seanceTypeId), 'solo', c.variante).includes('maximale')

describe('semaines types : identifiants et variantes', () => {
  it('chaque séance et chaque variante citée existent dans le catalogue', () => {
    for (const accent of ACCENTS) {
      for (const n of NOMBRES) {
        for (const cas of semaineType(accent, n)) {
          for (const c of cas) {
            const st = stDe(c.seanceTypeId)
            if (c.variante !== undefined) expect(st.variantes[c.variante], `${c.seanceTypeId}/${c.variante}`).toBeDefined()
          }
        }
      }
    }
  })
})

describe('semaines types : nombre de cases', () => {
  it('chaque accent a autant de cases que de séances annoncées, et aucune case vide', () => {
    for (const accent of ACCENTS) {
      for (const n of NOMBRES) {
        const cases = semaineType(accent, n)
        expect(cases, `${accent} ${n}`).toHaveLength(n)
        for (const cas of cases) expect(cas.length).toBeGreaterThan(0)
      }
    }
  })

  it('les jours conseillés comptent autant de jours que de séances', () => {
    for (const n of NOMBRES) expect(JOURS_CONSEILLES[n]).toHaveLength(n)
  })

  it('à 5 séances, le vendredi (4e case) est la séance hors grimpe', () => {
    const cinq = semaineType('doigts', 5)
    expect(cinq).toHaveLength(5)
    expect(cinq[3]).toEqual([{ seanceTypeId: 'ST-HOR-01' }])
  })
})

describe('semaines types : espacement des séances maximales', () => {
  // Jours d'un nombre de séances : 2 écarts de 48 h minimum entre deux séances maximales, y compris d'une semaine à l'autre.
  it.each(ACCENTS.flatMap((accent) => NOMBRES.map((n) => [accent, n] as const)))(
    '%s à %i séances : 48 h entre deux séances maximales',
    (accent, n) => {
      const jours = JOURS_CONSEILLES[n]
      const cases = semaineType(accent, n)
      const indices = cases
        .map((cas, i) => ({ index: ORDRE_JOURS.indexOf(jours[i]!), maximale: cas.some(estMaximale) }))
        .filter((x) => x.maximale)
        .map((x) => x.index)
      for (let i = 0; i + 1 < indices.length; i++) {
        expect(indices[i + 1]! - indices[i]!).toBeGreaterThanOrEqual(2)
      }
      if (indices.length >= 2) {
        expect(indices[0]! + 7 - indices[indices.length - 1]!).toBeGreaterThanOrEqual(2)
      }
    },
  )
})

describe('accentsDeDepart', () => {
  it('moins d\'un an de pratique : traction, endurance, puissance', () => {
    expect(accentsDeDepart({ anneesPratique: 0.5, disciplinePrincipale: 'bloc' })).toEqual(['traction_gainage', 'endurance', 'puissance'])
  })

  it('voie : doigts, endurance, résistance', () => {
    expect(accentsDeDepart({ anneesPratique: 3, disciplinePrincipale: 'voie' })).toEqual(['doigts', 'endurance', 'resistance'])
  })

  it('bloc : doigts, puissance, résistance', () => {
    expect(accentsDeDepart({ anneesPratique: 3, disciplinePrincipale: 'bloc' })).toEqual(['doigts', 'puissance', 'resistance'])
  })
})
