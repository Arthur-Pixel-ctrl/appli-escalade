// Adaptateur : transforme un protocole de la bibliothèque en fiche pour le moteur de vérification
// (moteur-verification.md, B.1 et B.2).
import { BIBLIOTHEQUE } from '../donnees/bibliotheque/index.ts'
import type { Protocole } from '../donnees/bibliotheque/types.ts'
import type { FicheVerif } from './types.ts'

/** Fiches de la bibliothèque qui ne sollicitent pas les doigts (en plus des qualités antagonistes et mobilité). */
export const FICHES_SANS_DOIGTS: string[] = [
  'traction-simple-4x5',
  'traction-negatives',
  'traction-lestee-force-lattice',
  'traction-lestee-5x5-horst',
  'traction-blocages-90-120',
  'traction-prises-decalees',
  'puissance-tractions-explosives',
  'puissance-tractions-rapides-nelson',
  'mental-rituel-entre-essais',
  'mental-bilan-a-vue',
  'technique-lecture-a-vue',
  'echauffement-dynamique-vagy',
]

/** Repos entre deux efforts, en secondes ; undefined pour une échelle ou une liste (pas de repos unique). */
function reposEntreEffortsS(p: Protocole): number | undefined {
  if (p.forme === 'essais') return p.reposS
  if (p.forme === 'liste') return undefined
  const c = p.config
  switch (c.gabarit) {
    case 'repetition_unique':
      return c.reposSeriesS
    case 'intermittent':
      return c.repetitions > 1 ? c.reposRepetitionsS : c.reposSeriesS
    case 'depart_minute':
      return c.creneauS - c.effortS
    case 'echelle':
      return undefined
  }
}

/** Une fiche de la bibliothèque sollicite-t-elle les doigts ? */
function solliciteDoigts(p: Protocole): boolean {
  if (p.qualite === 'antagonistes' || p.qualite === 'mobilite') return false
  return !FICHES_SANS_DOIGTS.includes(p.id)
}

/** Un exercice perso sollicite les doigts s'il se fait sur bloc, voie, pan ou poutre. */
export function solliciteDoigtsPerso(terrain: string | undefined): boolean {
  return terrain === 'bloc' || terrain === 'voie' || terrain === 'pan' || terrain === 'poutre'
}

/** Ramène un protocole de la bibliothèque à la forme lue par le moteur. */
export function ficheDepuisProtocole(p: Protocole): FicheVerif {
  const fiche: FicheVerif = {
    id: p.id,
    nom: p.nom,
    origine: 'bibliotheque',
    qualite: p.qualite,
    dureeMin: p.dureeMin,
    marqueurs: p.marqueurs,
    prerequis: p.prerequis,
    contreIndications: p.contreIndications,
    solliciteDoigts: solliciteDoigts(p),
  }
  if (p.contexte) fiche.contexte = p.contexte
  if (p.maxParSemaine !== undefined) fiche.maxParSemaine = p.maxParSemaine
  if (p.exclureDeLaGeneration !== undefined) fiche.exclureDeLaGeneration = p.exclureDeLaGeneration
  const repos = reposEntreEffortsS(p)
  if (repos !== undefined) fiche.reposEntreEffortsS = repos
  if (p.estTest) fiche.estTest = true
  return fiche
}

/** Toute la bibliothèque, indexée par identifiant. */
export function fichesDeLaBibliotheque(): Record<string, FicheVerif> {
  return Object.fromEntries(BIBLIOTHEQUE.map((p) => [p.id, ficheDepuisProtocole(p)]))
}
