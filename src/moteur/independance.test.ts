import { describe, expect, it } from 'vitest'

// Le moteur doit pouvoir être repris tel quel par une autre app (montre) : pas de React, pas de base, pas d'écran.
// On lit le texte des fichiers avec Vite (import.meta.glob) : pas besoin des types de Node.
const sources: Record<string, string> = import.meta.glob(['./*.ts', '!./*.test.ts', '../chrono/sequence.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const interdits = ['react', 'dexie', '@supabase', '/ecrans/', '/donnees/base']

describe('indépendance du moteur', () => {
  it('trouve bien les fichiers à contrôler', () => {
    const noms = Object.keys(sources)
    expect(noms).toContain('../chrono/sequence.ts')
    expect(noms).toContain('./horloge.ts')
    expect(noms.length).toBeGreaterThanOrEqual(5)
  })

  for (const [nom, texte] of Object.entries(sources)) {
    it(`${nom} n'importe ni React, ni la base, ni un écran`, () => {
      const imports = texte
        .split('\n')
        .filter((ligne) => /^\s*(import|export)\b.*\bfrom\b/.test(ligne) || /^\s*import\s+['"]/.test(ligne))
      for (const ligne of imports) {
        for (const interdit of interdits) expect(ligne, `${nom} : « ${ligne} »`).not.toContain(interdit)
      }
    })
  }
})
