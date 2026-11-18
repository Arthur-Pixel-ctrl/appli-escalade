import { describe, expect, it } from 'vitest'
import { construireSequence, dureeTotaleS } from '../../chrono/sequence.ts'
import { BIBLIOTHEQUE, peutEtreGeneree, protocoleParId } from './index.ts'
import { ZONES } from '../profil.ts'
import type { Qualite } from './types.ts'

// Garde-fous sur le contenu de la bibliothèque : si une fiche est mal remplie,
// ces tests le disent avant que l’app ne l’affiche.

const QUALITES: Qualite[] = [
  'doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance',
  'technique', 'mental', 'antagonistes', 'mobilite', 'echauffement',
]

describe('bibliothèque de protocoles', () => {
  it('les identifiants sont uniques et en minuscules avec tirets', () => {
    const ids = BIBLIOTHEQUE.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('protocoleParId retrouve chaque protocole', () => {
    for (const p of BIBLIOTHEQUE) expect(protocoleParId(p.id)).toBe(p)
    expect(protocoleParId('inconnu')).toBeUndefined()
  })

  it('chaque protocole a une source avec un auteur', () => {
    for (const p of BIBLIOTHEQUE) expect(p.source.auteur.trim(), p.id).not.toBe('')
  })

  it('chaque chrono produit une séquence valide qui finit par un effort', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.forme !== 'chrono') continue
      const phases = construireSequence(p.config)
      expect(phases.length, p.id).toBeGreaterThan(0)
      expect(phases[phases.length - 1].type, p.id).toBe('effort')
      for (const phase of phases) expect(phase.dureeS, p.id).toBeGreaterThan(0)
    }
  })

  it('la durée annoncée colle à la durée du chrono (à 15 % près)', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.forme !== 'chrono') continue
      const minutes = dureeTotaleS(construireSequence(p.config)) / 60
      expect(p.dureeMin, p.id).toBeGreaterThanOrEqual(minutes * 0.85)
      expect(p.dureeMin, p.id).toBeLessThanOrEqual(minutes * 1.15)
    }
  })

  it('poutre intensive et pan Güllich ont toujours un prérequis', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.marqueurs.includes('poutre_intensive') || p.marqueurs.includes('pan_gullich')) {
        expect(Object.keys(p.prerequis).length, p.id).toBeGreaterThan(0)
      }
    }
  })

  it('toute séance maximale (hors bloc limite) a un prérequis', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.marqueurs.includes('maximale') && !p.marqueurs.includes('bloc_limite')) {
        expect(Object.keys(p.prerequis).length, p.id).toBeGreaterThan(0)
      }
    }
  })

  it('toute fiche sur poutre porte le marqueur « poutre » (pour le plafond par semaine)', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.contexte?.terrain === 'poutre') expect(p.marqueurs, p.id).toContain('poutre')
    }
  })

  it('le pan Güllich est réservé aux adultes', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.marqueurs.includes('pan_gullich')) expect(p.prerequis.adulte, p.id).toBe(true)
    }
  })

  // Un prérequis écrit en phrase ne peut pas être lu par le générateur : il doit être un champ.
  it('aucune consigne ne cache un prérequis', () => {
    for (const p of BIBLIOTHEQUE) {
      expect(p.consigne, p.id).not.toMatch(/strictes|réservé à/i)
    }
  })

  it('chaque qualité a au moins deux protocoles', () => {
    for (const q of QUALITES) {
      expect(BIBLIOTHEQUE.filter((p) => p.qualite === q).length, q).toBeGreaterThanOrEqual(2)
    }
  })

  it('les fiches « à vérifier » disent ce qui est à vérifier', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.aVerifier !== undefined) expect(p.aVerifier.trim(), p.id).not.toBe('')
    }
  })

  it('les fiches exclues de la génération disent pourquoi', () => {
    for (const p of BIBLIOTHEQUE) {
      if (p.exclureDeLaGeneration !== undefined) expect(p.exclureDeLaGeneration.trim(), p.id).not.toBe('')
    }
  })

  // ——— Recherche B21 (décisions du 18/11) ———
  const IDS_TESTS = [
    'test-suspension-max-7s-20mm', 'test-traction-lestee-2rm', 'test-tractions-strictes-max',
    'test-suspension-bras-flechis', 'test-tractions-cadencees-15-par-min', 'test-endurance-8-blocs-50-min',
    'test-mobilite-montee-de-pied', 'test-mobilite-ecart-debout', 'test-mobilite-epaules-mains-dans-le-dos',
  ]

  it('les 9 tests sont présents, marqués estTest, et aucun n’est générable', () => {
    for (const id of IDS_TESTS) {
      const p = protocoleParId(id)
      expect(p, id).toBeDefined()
      expect(p!.estTest, id).toBe(true)
      expect(p!.exclureDeLaGeneration, id).toBe('Test : proposé seulement par “faire mes tests”')
      expect(peutEtreGeneree(p!), id).toBe(false)
    }
    // Un test marqué estTest est toujours exclu, même si on oublie le texte d'exclusion.
    for (const p of BIBLIOTHEQUE) if (p.estTest) expect(peutEtreGeneree(p), p.id).toBe(false)
  })

  it('les deux tests maximaux gardent leurs prérequis stricts', () => {
    expect(protocoleParId('test-suspension-max-7s-20mm')!.prerequis).toEqual({
      anneesPratiqueMin: 2, experiencePoutreMin: 'reguliere', test15sSur25mm: true, adulte: true,
    })
    expect(protocoleParId('test-traction-lestee-2rm')!.prerequis).toEqual({
      anneesPratiqueMin: 2, tractionsStrictesMin: 10, adulte: true,
    })
  })

  it('les fiches abandonnées ne sont pas dans la bibliothèque', () => {
    expect(protocoleParId('resistance-pyramide-4-8-12-16')).toBeUndefined()
    expect(protocoleParId('mental-chute-module-bloc')).toBeUndefined()
  })

  it('bidoigts : 8 tenues à deux doigts au départ, chrono de 10 tenues, hors génération', () => {
    const p = protocoleParId('doigts-bidoigts-module')!
    expect(p.forme === 'chrono' && p.config.gabarit === 'intermittent' && p.config.repetitions).toBe(10)
    expect(peutEtreGeneree(p)).toBe(false)
    expect(p.prerequis).toEqual({ anneesPratiqueMin: 2, experiencePoutreMin: 'occasionnelle' })
  })

  it('les fiches de chute, front lever, planche de gymnastique, arqué doux et échauffement court sont hors génération', () => {
    for (const id of [
      'technique-reception-bloc', 'mental-chute-bloc-progressive', 'mental-chute-module-voie',
      'traction-front-lever-tenues', 'gainage-planche-gym-preparation', 'doigts-arque-doux-mur', 'echauffement-court',
    ]) expect(peutEtreGeneree(protocoleParId(id)!), id).toBe(false)
  })

  it('la résistance en voie se fait avec un assureur, plafonnée à une séance par fiche', () => {
    const fiches = BIBLIOTHEQUE.filter((p) => p.marqueurs.includes('resistance_voie'))
    expect(fiches.map((p) => p.id).sort()).toEqual(
      ['resistance-capacity-power', 'resistance-circuits-30-mouvements', 'resistance-voies-repetees'])
    for (const p of fiches) {
      expect(p.contexte?.partenaire, p.id).toBe(true)
      expect(p.contexte?.terrain, p.id).toBe('voie')
      expect(p.maxParSemaine, p.id).toBe(1)
    }
  })

  it('une seule fiche de chute volontaire en bloc, réception sur deux pieds', () => {
    const chutes = BIBLIOTHEQUE.filter((p) => p.qualite === 'mental' && p.contexte?.terrain === 'bloc')
    expect(chutes.map((p) => p.id)).toEqual(['mental-chute-bloc-progressive'])
    const texte = JSON.stringify(protocoleParId('technique-reception-bloc'))
    expect(texte).not.toMatch(/un seul pied/i)
    expect(texte).toMatch(/deux pieds/)
  })

  it('« planche » seul désigne la planche d’escalade : la figure s’appelle « planche de gymnastique »', () => {
    const gym = protocoleParId('gainage-planche-gym-preparation')!
    const texte = JSON.stringify({ ...gym, id: '', source: { auteur: gym.source.auteur } })
    expect(texte.match(/planche(?! de gymnastique)/gi) ?? [], gym.id).toEqual([])
    expect(JSON.stringify(protocoleParId('gainage-ponts-sol'))).not.toMatch(/planche/i)
  })

  it('les zones de douleur « hanche » et « cheville » existent et les fiches n’utilisent que des zones connues', () => {
    const valeurs = ZONES.map((z) => z.valeur)
    expect(valeurs).toContain('hanche')
    expect(valeurs).toContain('cheville')
    for (const p of BIBLIOTHEQUE) for (const z of p.contreIndications) expect(valeurs, p.id).toContain(z)
    expect(protocoleParId('technique-reception-bloc')!.contreIndications).toContain('cheville')
    expect(protocoleParId('mobilite-hanches-module')!.contreIndications).toContain('hanche')
    expect(protocoleParId('test-mobilite-montee-de-pied')!.contreIndications).toContain('hanche')
  })

  it('les fiches de groupe sont adaptées au groupe et sans jeu à vies', () => {
    const groupe = BIBLIOTHEQUE.filter((p) => p.id.startsWith('groupe-'))
    expect(groupe).toHaveLength(5)
    for (const p of groupe) {
      expect(p.contexte?.groupe, p.id).toBe('adapte')
      expect(p.consigne, p.id).not.toMatch(/\bvies?\b/)
    }
  })
})
