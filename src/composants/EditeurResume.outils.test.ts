import { describe, expect, it } from 'vitest'
import type { SeancePlanifiee } from '../donnees/modele.ts'
import { etapeDepuisFiche } from '../ecrans/bureau/VueSemaine.outils.ts'
import { contexteDeReference } from '../regles/exemples.ts'
import { fichesDeLaBibliotheque, seanceVersVerif, verifierSeance } from '../regles/index.ts'
import {
  ajouterPartie, changerNiveau, ecrireDureeSimple, ecrireRecommandation, etapesDepuisSeanceType, figerParties, figerRecommandation,
  modifierPartie, monterPartie, poserPrincipal, recalculerGrandesLignes, retirerPartie, revenirAuTexteProposé,
} from './EditeurResume.outils.ts'

const fiches = fichesDeLaBibliotheque()
const etape = (id: string) => {
  const e = etapeDepuisFiche(id, [], [])
  if (!e) throw new Error(`fiche inconnue ${id}`)
  return e
}
const seance = (surcharge: Partial<SeancePlanifiee['solo']> = {}, reste: Partial<SeancePlanifiee> = {}): SeancePlanifiee => ({
  id: 's1', versionFormat: 1, creeLe: '2026-11-23T08:00:00.000Z', modifieLe: '2026-11-23T08:00:00.000Z',
  cycleId: 'c', phaseId: 'p', semaine: 1, date: '2026-11-24', qualite: 'doigts', groupe: null,
  solo: { nom: 'Doigts', durete: 'dure', etapes: [etape('echauffement-general'), etape('traction-simple-4x5')], recommandation: 'Ma ligne',
    parties: [{ titre: 'Effort', dureeMin: 40, principal: { source: 'bibliotheque', refId: 'traction-simple-4x5' } }], ...surcharge },
  ...reste,
} as SeancePlanifiee)

describe('changer de niveau (R-9)', () => {
  it('dans tous les sens, seul niveauDetail change : étapes, parties et recommandation intactes', () => {
    const depart = seance()
    let s = depart
    for (const n of ['simple', 'grandes_lignes', 'detaille', null, 'simple', 'detaille'] as const) {
      s = changerNiveau(s, n)
      expect(s.solo).toBe(depart.solo)
    }
  })
  it('« Comme le cycle » efface le niveau de la séance', () => {
    const s = changerNiveau(changerNiveau(seance(), 'simple'), null)
    expect(s).not.toHaveProperty('niveauDetail')
  })
})

describe('recommandation', () => {
  it('texte vide ou « Revenir au texte proposé » : le champ disparaît', () => {
    expect(ecrireRecommandation(seance().solo, '  ')).not.toHaveProperty('recommandation')
    expect(revenirAuTexteProposé(seance().solo)).not.toHaveProperty('recommandation')
  })
  it('120 caractères au plus ; « Modifier le texte » fige la valeur proposée', () => {
    expect(ecrireRecommandation(seance().solo, 'a'.repeat(200)).recommandation).toHaveLength(120)
    expect(figerRecommandation(seance({ recommandation: undefined }).solo, 'Proposé').recommandation).toBe('Proposé')
  })
})

describe('séance simple écrite à la main', () => {
  const vide = seance({ etapes: [] }).solo
  const sansParties = (() => { const { parties: _p, ...reste } = vide; return reste })()
  it('durée et principal vivent dans une seule partie « Séance »', () => {
    const avecDuree = ecrireDureeSimple(sansParties, 45)
    expect(avecDuree.parties).toEqual([{ titre: 'Séance', dureeMin: 45 }])
    const avecPrincipal = poserPrincipal(avecDuree, 0, { source: 'bibliotheque', refId: 'traction-simple-4x5' })
    expect(avecPrincipal.parties).toEqual([{ titre: 'Séance', dureeMin: 45, principal: { source: 'bibliotheque', refId: 'traction-simple-4x5' } }])
    expect(poserPrincipal(avecPrincipal, 0, null).parties).toEqual([{ titre: 'Séance', dureeMin: 45 }])
  })
  it('un principal choisi sans durée crée la partie avec une durée par défaut', () => {
    expect(poserPrincipal(sansParties, 0, { source: 'bibliotheque', refId: 'x' }).parties?.[0]).toMatchObject({ titre: 'Séance', dureeMin: 30 })
  })
})

describe('grandes lignes', () => {
  it('ajouter (5 au plus), monter, modifier, retirer', () => {
    let solo = seance({ etapes: [] }).solo
    for (let i = 0; i < 6; i++) solo = ajouterPartie(solo)
    expect(solo.parties).toHaveLength(5)
    solo = modifierPartie(solo, 1, { titre: 'B', consigne: 'Une consigne' })
    solo = monterPartie(solo, 1, -1)
    expect(solo.parties?.[0]).toMatchObject({ titre: 'B', consigne: 'Une consigne' })
    expect(modifierPartie(solo, 0, { consigne: '' }).parties?.[0]).not.toHaveProperty('consigne')
    for (let i = 0; i < 5; i++) solo = retirerPartie(solo, 0)
    expect(solo).not.toHaveProperty('parties')
  })
  it('« Modifier le texte » recopie les parties calculées', () => {
    const s = seance().solo
    expect(figerParties(s, [{ titre: 'A', dureeMin: 10 }]).parties).toEqual([{ titre: 'A', dureeMin: 10 }])
  })
})

describe('S-27 et « Recalculer les grandes lignes »', () => {
  const ctx = contexteDeReference()
  const codes = (s: SeancePlanifiee) => verifierSeance(seanceVersVerif(s, fiches), ctx).map((a) => a.code)
  const avecEcart = seance({ parties: [{ titre: 'Effort principal', dureeMin: 30, principal: { source: 'bibliotheque', refId: 'doigts-suspensions-max-lestees' } }] })
  it('un principal absent des étapes donne S-27 ; recalculer le fait disparaître sans toucher étapes ni recommandation', () => {
    expect(codes(avecEcart)).toContain('S-27')
    const solo = recalculerGrandesLignes(avecEcart.solo)
    expect(solo).not.toHaveProperty('parties')
    expect(solo.etapes).toBe(avecEcart.solo.etapes)
    expect(solo.recommandation).toBe('Ma ligne')
    expect(codes({ ...avecEcart, solo })).not.toContain('S-27')
  })
  it('choisir un principal déconseillé reste permis : rien ne bloque', () => {
    expect(poserPrincipal(avecEcart.solo, 0, { source: 'bibliotheque', refId: 'doigts-suspensions-max-lestees' }).parties).toHaveLength(1)
  })
})

describe('séance type', () => {
  it('sans séance type connue, rien à recopier', () => {
    expect(etapesDepuisSeanceType(seance())).toBeUndefined()
    expect(etapesDepuisSeanceType(seance({}, { seanceTypeId: 'ST-DOI-02' }))?.length).toBeGreaterThan(0)
  })
})
