import { describe, expect, it } from 'vitest'
import { peutEtreGeneree, protocoleParId } from './bibliotheque/index.ts'
import { QUALITES_PHYSIQUES } from './modele.ts'
import type { AccentPhase } from './modele.ts'
import {
  OBJECTIFS_SPECIFIQUES,
  estProposeSeulementALaMain,
  objectifParId,
  objectifVersVerif,
  objectifsPourAccent,
  partagentUnMarqueurAQuota,
} from './objectifsSpecifiques.ts'

const ACCENTS: AccentPhase[] = [...QUALITES_PHYSIQUES, 'technique']

describe('catalogue des objectifs spécifiques', () => {
  it('les identifiants sont uniques', () => {
    const ids = OBJECTIFS_SPECIFIQUES.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque fiche de module existe dans la bibliothèque', () => {
    for (const o of OBJECTIFS_SPECIFIQUES) expect(protocoleParId(o.ficheModule), o.id).toBeDefined()
  })

  it('chaque remplacement existe, se choisit automatiquement et n’a pas de remplacement lui-même', () => {
    for (const o of OBJECTIFS_SPECIFIQUES) {
      if (!o.remplacementId) continue
      const remplacement = objectifParId(o.remplacementId)
      expect(remplacement, o.id).toBeDefined()
      expect(estProposeSeulementALaMain(remplacement!), o.id).toBe(false)
      expect(remplacement!.remplacementId, o.id).toBeUndefined()
    }
  })

  it('le remplacement par défaut est la prévention des épaules', () => {
    expect(objectifParId('OS-03')?.nom).toBe('Prévention des épaules')
    expect(objectifParId('OS-01')?.remplacementId).toBe('OS-03')
  })

  it('le test repère, s’il existe, a un libellé en clair', () => {
    for (const o of OBJECTIFS_SPECIFIQUES) if (o.testRepere !== undefined) expect(o.testRepere.length).toBeGreaterThan(3)
  })

  it('les accents cités existent', () => {
    for (const o of OBJECTIFS_SPECIFIQUES) for (const a of o.accents) expect(ACCENTS, o.id).toContain(a)
  })

  it('les modules durent de 10 à 20 min (20 min : peur de la chute en voie, signalée par S-24)', () => {
    for (const o of OBJECTIFS_SPECIFIQUES) {
      const duree = o.reglages?.dureeMin ?? protocoleParId(o.ficheModule)!.dureeMin
      expect(duree, o.id).toBeGreaterThanOrEqual(10)
      expect(duree, o.id).toBeLessThanOrEqual(20)
    }
  })
})

describe('objectifs proposés seulement à la main', () => {
  const aLaMain = OBJECTIFS_SPECIFIQUES.filter(estProposeSeulementALaMain).map((o) => o.nom)

  it('ce sont les arqués, le front lever, la planche de gymnastique et la chute en bloc', () => {
    expect(aLaMain.sort()).toEqual(
      ['Arqués', 'Front lever', 'Peur de la chute en bloc', 'Planche de gymnastique (préparation)'].sort(),
    )
  })

  it('un objectif a un avertissement exactement quand sa fiche est hors génération', () => {
    for (const o of OBJECTIFS_SPECIFIQUES) {
      const horsGeneration = !peutEtreGeneree(protocoleParId(o.ficheModule)!)
      expect(o.avertissementALaMain !== undefined, o.id).toBe(horsGeneration)
    }
  })

  it('aucun objectif à la main n’est le remplacement d’un autre', () => {
    for (const o of OBJECTIFS_SPECIFIQUES) {
      if (o.remplacementId) expect(estProposeSeulementALaMain(objectifParId(o.remplacementId)!)).toBe(false)
    }
  })

  it('« planche » désigne toujours la planche de gymnastique', () => {
    const planche = OBJECTIFS_SPECIFIQUES.filter((o) => /planche/i.test(o.nom))
    expect(planche.map((o) => o.nom)).toEqual(['Planche de gymnastique (préparation)'])
  })
})

describe('liste proposée pour une phase', () => {
  it('les objectifs automatiques passent avant ceux « à la main »', () => {
    for (const accent of ACCENTS) {
      const liste = objectifsPourAccent(accent)
      const premierAMain = liste.findIndex(estProposeSeulementALaMain)
      if (premierAMain >= 0) {
        expect(liste.slice(premierAMain).every(estProposeSeulementALaMain), accent).toBe(true)
      }
    }
  })

  it('chaque accent a au moins un objectif automatique (la prévention des épaules)', () => {
    for (const accent of ACCENTS) {
      expect(objectifsPourAccent(accent).some((o) => !estProposeSeulementALaMain(o)), accent).toBe(true)
    }
  })

  it('deux objectifs choisis automatiquement ne partagent pas de marqueur à quota (A7-4)', () => {
    const auto = OBJECTIFS_SPECIFIQUES.filter((o) => !estProposeSeulementALaMain(o))
    for (const a of auto) for (const b of auto) if (a !== b) expect(partagentUnMarqueurAQuota(a, b), `${a.id}/${b.id}`).toBe(false)
  })

  it('le front lever et la planche de gymnastique partagent « maximale » : jamais ensemble sans avertissement', () => {
    const frontLever = objectifParId('OS-08')!
    const planche = objectifParId('OS-09')!
    expect(partagentUnMarqueurAQuota(frontLever, planche)).toBe(true)
    // Les autres objectifs « à la main » n'entrent pas en conflit avec eux.
    expect(partagentUnMarqueurAQuota(objectifParId('OS-07')!, frontLever)).toBe(false)
    expect(partagentUnMarqueurAQuota(objectifParId('OS-10')!, planche)).toBe(false)
  })
})

describe('objectifVersVerif', () => {
  it('lit marqueurs, prérequis et contre-indications dans la fiche', () => {
    const v = objectifVersVerif(objectifParId('OS-01')!)
    expect(v.marqueurs).toEqual(['poutre', 'bidoigts'])
    expect(v.contreIndications).toEqual(['doigts'])
    expect(v.remplacementNom).toBe('Prévention des épaules')
  })

  it('traction à un bras : prérequis de 10 tractions, coude et épaule écartés', () => {
    const v = objectifVersVerif(objectifParId('OS-02')!)
    expect(v.prerequis).toEqual({ tractionsStrictesMin: 10 })
    expect(v.contreIndications).toEqual(['coude', 'epaule'])
  })

  it('la prévention des épaules n’a pas de remplacement', () => {
    expect(objectifVersVerif(objectifParId('OS-03')!).remplacementNom).toBeUndefined()
  })

  it('renvoie des copies : modifier le résultat ne touche pas la bibliothèque', () => {
    const v = objectifVersVerif(objectifParId('OS-01')!)
    v.marqueurs.push('maximale')
    expect(protocoleParId('doigts-abrahangs')!.marqueurs).toEqual(['poutre', 'bidoigts'])
  })
})
