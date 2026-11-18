// Format de séance : fichiers de référence pour une future app native (montre).
// Ce test lit docs/format-seance/*.json et vérifie qu'ils sont EXACTEMENT ce que le code produit.
// Si le moteur change (durée, ordre des phases, champ d'une séance), le test échoue : il faut alors
// décider si le format change vraiment, puis régénérer les fichiers avec :
//   REGENERER=1 npx vitest run src/moteur/format.test.ts
// Sans REGENERER, ce test n'écrit jamais rien.
import { describe, expect, it } from 'vitest'
import { construireSequence, PREPARATION_S } from '../chrono/sequence.ts'
import type { ConfigChrono } from '../chrono/sequence.ts'
import { EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import type { SeanceRealisee } from '../donnees/modele.ts'

// Chemins construits depuis ce fichier, jamais depuis le dossier courant.
const dossier = (nom: string) => new URL(`../../docs/format-seance/${nom}`, import.meta.url)
// Pas de types Node dans le projet de l'app : on lit la variable d'environnement avec un type minimal.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}
const regenerer = env.REGENERER === '1'

/** Mise en forme fixe : deux espaces et un saut de ligne final. */
const enTexte = (x: unknown) => JSON.stringify(x, null, 2) + '\n'

// Le projet de l'app n'a pas les types Node : on charge `node:fs` par un nom en variable (le test tourne bien sous Node).
const nomFs: string = 'node:fs'
const { readFileSync, writeFileSync } = (await import(/* @vite-ignore */ nomFs)) as {
  readFileSync: (chemin: URL, encodage: 'utf8') => string
  writeFileSync: (chemin: URL, texte: string) => void
}

/** Écrit le fichier si REGENERER=1, sinon vérifie qu'il est identique à ce que le code produit. */
function verifierFichier(nom: string, attendu: unknown) {
  const texte = enTexte(attendu)
  if (regenerer) {
    writeFileSync(dossier(nom), texte)
    return
  }
  expect(readFileSync(dossier(nom), 'utf8')).toBe(texte)
}

/** Une séance en groupe réalisée : 3 blocs, liée à la séance planifiée d'exemple. */
const EXEMPLE_SEANCE_REALISEE: SeanceRealisee = {
  id: '4a7b9c1d-2e3f-4a50-8b61-7c8d9e0f1a77',
  versionFormat: 1,
  creeLe: '2026-11-17T19:32:00.000Z',
  modifieLe: '2026-11-17T19:32:00.000Z',
  date: '2026-11-17',
  mode: 'groupe',
  nom: 'Doigts et bloc limite',
  durete: 'dure',
  dureeMin: 87,
  effortPercu: 8,
  peau: 3,
  douleur: false,
  etapes: [],
  objectifs: [
    { libelle: '3 blocs durs à réglettes, 4 essais max chacun', cible: 3, fait: 2 },
    { libelle: 'Flasher 3 violets', cible: 3, fait: 1 },
  ],
  blocs: [
    { couleur: 'Rouge', essais: 3, resultat: 'enchaine', objectif: 0 },
    { couleur: 'Rouge', essais: 4, resultat: 'enchaine', objectif: 0 },
    { couleur: 'Violet', essais: 1, resultat: 'flash', objectif: 1 },
  ],
  seancePlanifieeId: EXEMPLE_SEANCE_PLANIFIEE.id,
  qualite: 'doigts',
  marqueurs: ['bloc_limite'], // instantané facultatif : la montre n'a pas besoin de le lire ni de l'écrire
}

/** Réglages de chrono des vecteurs. `preparationS` est donné à `construireSequence`. */
const CAS_CHRONO: { nom: string; config: ConfigChrono; preparationS: number }[] = [
  { nom: 'repetition_unique', config: { gabarit: 'repetition_unique', effortS: 10, series: 3, reposSeriesS: 180 }, preparationS: PREPARATION_S },
  { nom: 'depart_minute', config: { gabarit: 'depart_minute', effortS: 10, creneauS: 60, repetitions: 5, series: 2, reposSeriesS: 180 }, preparationS: PREPARATION_S },
  { nom: 'intermittent', config: { gabarit: 'intermittent', effortS: 7, reposRepetitionsS: 3, repetitions: 6, series: 3, reposSeriesS: 180 }, preparationS: PREPARATION_S },
  // Plan le plus simple de Bechtel : créneau par suspension, sans repos entre paliers.
  { nom: 'echelle_sans_repos_entre_paliers', config: { gabarit: 'echelle', dureesS: [5, 10, 15], creneauS: 30, series: 4, reposSeriesS: 15 }, preparationS: PREPARATION_S },
  // Échelles 3-6-9 : toute l'échelle tient dans le créneau, le reste s'ajoute au repos entre séries.
  { nom: 'echelle_avec_repos_entre_paliers', config: { gabarit: 'echelle', dureesS: [3, 6, 9], creneauS: 45, reposEntrePaliersS: 6, series: 9, reposSeriesS: 0 }, preparationS: PREPARATION_S },
  { nom: 'sans_preparation', config: { gabarit: 'repetition_unique', effortS: 10, series: 2, reposSeriesS: 120 }, preparationS: 0 },
]

describe('format de séance documenté', () => {
  it('seance-planifiee.json correspond à la séance planifiée d’exemple', () => {
    verifierFichier('seance-planifiee.json', EXEMPLE_SEANCE_PLANIFIEE)
  })

  it('seance-realisee.json correspond à la séance réalisée d’exemple', () => {
    verifierFichier('seance-realisee.json', EXEMPLE_SEANCE_REALISEE)
  })

  it('chrono-vecteurs.json correspond aux phases calculées par le chrono', () => {
    const vecteurs = CAS_CHRONO.map(({ nom, config, preparationS }) => ({
      nom, config, preparationS, phases: construireSequence(config, preparationS),
    }))
    verifierFichier('chrono-vecteurs.json', vecteurs)
  })

  it('la séance réalisée d’exemple pointe bien la séance planifiée d’exemple', () => {
    expect(EXEMPLE_SEANCE_REALISEE.seancePlanifieeId).toBe(EXEMPLE_SEANCE_PLANIFIEE.id)
  })
})
