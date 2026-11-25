import { describe, expect, it } from 'vitest'
import { PROMPT_SYSTEME, VERSION_PROMPT } from './promptSysteme.ts'

// Longueur du bloc D.6 au moment de la copie : toute retouche du texte la fait bouger.
const LONGUEUR_BLOC_D6 = 12605

/** Une partie du prompt, de son titre « # … » jusqu'au titre suivant. */
function partie(titre: string): string {
  const debut = PROMPT_SYSTEME.indexOf(`# ${titre}\n`)
  const fin = PROMPT_SYSTEME.indexOf('\n# ', debut + 1)
  return PROMPT_SYSTEME.slice(debut, fin === -1 ? undefined : fin)
}

describe('PROMPT_SYSTEME', () => {
  it('a la longueur du bloc D.6 (à 1 % près)', () => {
    expect(Math.abs(PROMPT_SYSTEME.length - LONGUEUR_BLOC_D6) / LONGUEUR_BLOC_D6).toBeLessThanOrEqual(0.01)
  })

  it('garde la version du prompt', () => {
    expect(VERSION_PROMPT).toBe('2026-11-24')
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

  // Décisions F5 et F6 : le niveau se choisit par l'utilisateur, jamais par l'assistant.
  it('ne choisit jamais le niveau de détail : répond au niveau envoyé', () => {
    expect(PROMPT_SYSTEME).toContain('Tu ne choisis jamais le niveau de détail')
    expect(PROMPT_SYSTEME).toContain("Réponds toujours au niveau qu'on t'envoie")
  })

  // Les fractions de l'assiette sont écrites en toutes lettres et sourcées (synthèse, vérification 7) :
  // un chiffre dans cette partie serait un repère sans source, comme l'ancien « 250 mL par heure ».
  it("ne garde aucun chiffre d'alimentation sans source", () => {
    const alimentation = partie('Alimentation et poids')
    expect(alimentation).toContain('Tu ne donnes jamais de conseil pour perdre du poids')
    expect(alimentation).not.toMatch(/\d/)
    expect(PROMPT_SYSTEME).not.toMatch(/\bm?l par heure/i)
    expect(PROMPT_SYSTEME).not.toContain('250')
    expect(alimentation).toContain("Source : la synthèse, sujet « Manger assez : l'assiette suit la dureté de la séance »")
    expect(alimentation).toContain("Ne prête jamais ces repères au « Guide de l'alimentation du grimpeur »")
  })
})
