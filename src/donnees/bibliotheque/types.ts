import type { ConfigChrono } from '../../chrono/sequence.ts'
import type { ZoneDouleur } from '../profil.ts'

// La bibliothèque d'exercices et de protocoles. Chaque entrée est un « protocole » :
// un exercice avec ses réglages, d'où il vient, à qui il convient et comment progresser.
// Les séances types (lot 4.2) seront des listes de protocoles.

/** Les cinq qualités physiques mesurées, puis les volets transversaux. */
export type Qualite =
  | 'doigts' | 'traction_gainage' | 'puissance' | 'resistance' | 'endurance'
  | 'technique' | 'mental' | 'antagonistes' | 'mobilite' | 'echauffement'

/** D'où vient le protocole : une étude, l'avis d'un entraîneur, ou une synthèse maison. */
export type Preuve = 'Étude' | 'Avis de coach' | 'Synthèse'

/** Étiquettes utilisées par les règles de sécurité (quotas par semaine, 48 h entre deux séances maximales). */
export type Marqueur = 'maximale' | 'poutre_intensive' | 'bloc_limite' | 'pan_gullich' | 'arque' | 'bidoigts'

/** Ce que l'écran affiche : un chrono, une routine à valider, ou des essais comptés avec repos. */
export type Forme =
  | { forme: 'chrono'; config: ConfigChrono; mot: string; detail: string } // mot = consigne pendant l'effort ("SUSPENDS-TOI")
  | { forme: 'liste'; elements: string[] }
  | { forme: 'essais'; reposS: number }

export type Protocole = Forme & {
  id: string // en minuscules avec tirets, stable dans le temps : "doigts-echelles-3-6-9"
  nom: string
  qualite: Qualite
  resume: string // très court, pour la liste des étapes : "3 échelles", "10 min"
  consigne: string // une ou deux phrases, tutoiement, ce qu'il faut faire et l'intention
  dureeMin: number // durée indicative, repos compris
  preuve: Preuve
  source: { auteur: string; adresse?: string } // d'où viennent les réglages
  // À qui le proposer. Absent = pas de condition.
  prerequis: { anneesPratiqueMin?: number; experiencePoutreMin?: 'occasionnelle' | 'reguliere' }
  contreIndications: ZoneDouleur[] // une douleur déclarée dans une de ces zones écarte le protocole
  marqueurs: Marqueur[]
  maxParSemaine?: number
  progression: string // comment durcir au fil des semaines, en une phrase
  aVerifier?: string // présent si un réglage n'a pas pu être confirmé à la source : dire lequel
}
