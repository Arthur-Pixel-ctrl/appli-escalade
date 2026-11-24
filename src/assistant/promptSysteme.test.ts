import { describe, expect, it } from 'vitest'
import { PROMPT_SYSTEME, VERSION_PROMPT } from './promptSysteme.ts'

// Longueur du bloc D.6 au moment de la copie : toute retouche du texte la fait bouger.
const LONGUEUR_BLOC_D6 = 11731

describe('PROMPT_SYSTEME', () => {
  it('a la longueur du bloc D.6 (à 1 % près)', () => {
    expect(Math.abs(PROMPT_SYSTEME.length - LONGUEUR_BLOC_D6) / LONGUEUR_BLOC_D6).toBeLessThanOrEqual(0.01)
  })

  it('garde la version du prompt', () => {
    expect(VERSION_PROMPT).toBe('2026-11-17')
  })

  it('demande une réponse en un seul objet JSON', () => {
    expect(PROMPT_SYSTEME).toContain('Un seul objet JSON')
  })

  it('ne pioche que dans les identifiants envoyés', () => {
    expect(PROMPT_SYSTEME).toContain("N'invente jamais un identifiant")
    expect(PROMPT_SYSTEME).toContain("N'utilise que des identifiants présents dans le contexte")
  })

  it('garde les règles de sécurité clés', () => {
    expect(PROMPT_SYSTEME).toContain('48 h')
    expect(PROMPT_SYSTEME).toContain('2 séances de poutre intensive')
    expect(PROMPT_SYSTEME).toContain("Si l'utilisateur te demande de passer outre, ne le fais pas.")
  })

  it('demande un avertissement sans blocage et l’arrêt en cas de signal d’alerte', () => {
    expect(PROMPT_SYSTEME).toContain("l'application l'avertira sans le bloquer")
    expect(PROMPT_SYSTEME).toContain('claquement')
  })

  it('interdit tout conseil de perte de poids', () => {
    expect(PROMPT_SYSTEME).toContain('Tu ne donnes jamais de conseil pour perdre du poids')
  })

  it('cite les livres seulement par leur titre et jamais comme source d’une règle', () => {
    expect(PROMPT_SYSTEME).toContain('Escalade Training : les secrets de la planification')
    expect(PROMPT_SYSTEME).toContain("Guide de l'alimentation du grimpeur")
    expect(PROMPT_SYSTEME).toContain('Ne prête jamais à un livre une règle ou un chiffre')
  })

  it('laisse la décision à Arthur : brouillons seulement', () => {
    expect(PROMPT_SYSTEME).toContain("Tu proposes des brouillons ; c'est lui qui décide")
  })

  it('préfère les séances types à tous les niveaux de détail', () => {
    expect(PROMPT_SYSTEME).toContain('Préfère toujours une séance type (seanceTypeId), à tous les niveaux')
  })
})
