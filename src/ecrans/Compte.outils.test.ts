// Constats I-1 (fichier puis question, jamais d'effacement dans le même geste), M-2 et M-3 de l'audit de fin de phase 2.
import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { base } from '../donnees/base.ts'
import { ecrire, ecrireEtat, lireEtat } from '../donnees/stockage.ts'

// `delierAppareil` peut être forcé à échouer ; tout le reste de reprise.ts reste vrai.
const echec = vi.hoisted(() => ({ delier: 0 }))
vi.mock('../synchro/reprise.ts', async (original) => {
  const vrai = await original<typeof import('../synchro/reprise.ts')>()
  return {
    ...vrai,
    delierAppareil: async () => {
      if (echec.delier > 0) { echec.delier--; throw new Error('base indisponible') }
      return vrai.delierAppareil()
    },
  }
})

import { creerFichierDeSauvegarde, detacherAppareilApresSuppression, terminerDetachementEnSuspens, texteQuestionFichier } from './Compte.outils.ts'

beforeEach(async () => {
  for (const t of base.tables) await t.clear()
  echec.delier = 0
})
afterEach(() => { vi.unstubAllGlobals() })

describe('I-1 : créer le fichier n’efface rien', () => {
  it('télécharge le fichier et laisse toutes les données de l’appareil', async () => {
    const clics = vi.fn()
    vi.stubGlobal('document', { createElement: () => ({ click: clics }) })
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} })
    await ecrire('seancesRealisees', { id: 'seance-1', nom: 'Doigts' })
    await ecrireEtat('compteId', 'compte-a')
    await creerFichierDeSauvegarde()
    expect(clics).toHaveBeenCalledTimes(1)
    expect(await base.seancesRealisees.get('seance-1')).toBeDefined()
    expect((await base.seancesRealisees.get('seance-1'))?.aEnvoyer).toBe(1)
    expect(await lireEtat('compteId')).toBe('compte-a')
  })

  it('la question dit clairement ce qui n’existe que dans le fichier', () => {
    expect(texteQuestionFichier(0)).toContain('Tout est déjà envoyé')
    expect(texteQuestionFichier(1)).toContain('1 modification pas encore envoyée')
    expect(texteQuestionFichier(1)).toContain('que dans ce fichier')
    expect(texteQuestionFichier(3)).toContain('3 modifications pas encore envoyées')
    expect(texteQuestionFichier(3)).toContain('elles seront perdues')
  })
})

describe('M-2 : détachement après suppression du compte', () => {
  it('réessaie une fois quand le détachement échoue', async () => {
    await ecrireEtat('compteId', 'compte-supprime')
    echec.delier = 1
    expect(await detacherAppareilApresSuppression()).toBe(true)
    expect(await lireEtat('compteId')).toBeNull()
  })

  it('garde la marque « en cours » si les deux essais échouent, puis termine au démarrage suivant', async () => {
    await ecrireEtat('compteId', 'compte-supprime')
    await ecrireEtat('compteSupprimeEnCours', true)
    echec.delier = 2
    expect(await detacherAppareilApresSuppression()).toBe(false)
    expect(await lireEtat('compteId')).toBe('compte-supprime')
    expect(await lireEtat('compteSupprimeEnCours')).toBe(true)
    await terminerDetachementEnSuspens()
    expect(await lireEtat('compteId')).toBeNull()
    expect(await lireEtat('compteSupprimeEnCours')).toBeNull()
  })

  it('ne touche à rien quand aucun détachement n’est en suspens', async () => {
    await ecrireEtat('compteId', 'compte-vivant')
    await terminerDetachementEnSuspens()
    expect(await lireEtat('compteId')).toBe('compte-vivant')
  })
})
