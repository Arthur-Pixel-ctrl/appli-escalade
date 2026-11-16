import { describe, expect, it } from 'vitest'
import { construireSequence, dureeTotaleS } from '../../chrono/sequence.ts'
import { BIBLIOTHEQUE, protocoleParId } from './index.ts'
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
})
