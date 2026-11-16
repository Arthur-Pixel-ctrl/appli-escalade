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
export type Marqueur =
  | 'maximale' | 'poutre_intensive' | 'bloc_limite' | 'pan_gullich' | 'arque' | 'bidoigts'
  | 'poutre' // toute séance sur poutre, intensive ou non : sert à plafonner le total (3 par semaine au plus, posé par l'audit)
  | 'trou' // la synthèse demande d'étiqueter les trous pour en limiter le cumul
  | 'pan' // pan Güllich pieds posés : sans les contraintes du pan sans pieds

/**
 * À qui proposer le protocole. Absent = pas de condition.
 * Une donnée que le profil ne connaît pas encore compte comme « non remplie » : par prudence.
 */
export interface Prerequis {
  anneesPratiqueMin?: number
  experiencePoutreMin?: 'occasionnelle' | 'reguliere'
  tractionsStrictesMin?: number // 10 pour lester, 15 pour le bloc sans pieds (Hörst)
  test15sSur25mm?: true // tenir 15 s sur 25 mm : entrée des protocoles maximaux et lestés (López)
  niveauBlocMin?: string // cotation Fontainebleau ("6B"), comparée grâce à l'ordre de COTATIONS_BLOC
  adulte?: true // 18 ans révolus : pan Güllich et lest (BMC, Lattice)
}

/** Où et avec qui l'exercice se fait. Absent = pas d'exigence particulière (une salle de bloc suffit), seul. */
export interface Contexte {
  terrain?: 'bloc' | 'voie' | 'poutre' | 'pan' | 'barre' | 'sol'
  partenaire?: true // assureur ou observateur indispensable
  grimpeEnTete?: true // il faut savoir grimper et tomber en tête
  groupe?: 'adapte' | 'seul' // se prête à une séance à plusieurs, ou isole chacun
}

/** Ce que l'écran affiche : un chrono, une routine à valider, ou des essais comptés avec repos. */
export type Forme =
  | { forme: 'chrono'; config: ConfigChrono; mot: string; detail: string } // mot = consigne pendant l'effort ("SUSPENDS-TOI")
  | { forme: 'liste'; elements: string[] }
  // reposS : repos après chaque essai. essaisParSerie et reposSeriesS : un repos plus long
  // tous les N essais (5 séries de 2 : 1 min puis 10 min ; 4 blocs × 4 : 2 min puis 5 min).
  | { forme: 'essais'; reposS: number; essaisParSerie?: number; reposSeriesS?: number }

export type Protocole = Forme & {
  id: string // en minuscules avec tirets, stable dans le temps : "doigts-echelles-3-6-9"
  nom: string
  qualite: Qualite
  resume: string // très court, pour la liste des étapes : "3 échelles", "10 min"
  consigne: string // une ou deux phrases, tutoiement, ce qu'il faut faire et l'intention
  dureeMin: number // durée indicative, repos compris
  preuve: Preuve
  source: { auteur: string; adresse?: string } // d'où viennent les réglages
  prerequis: Prerequis
  contexte?: Contexte
  contreIndications: ZoneDouleur[] // une douleur déclarée dans une de ces zones écarte le protocole
  marqueurs: Marqueur[]
  maxParSemaine?: number
  progression: string // comment durcir au fil des semaines, en une phrase
  aVerifier?: string // présent si un réglage n'a pas pu être confirmé à la source : dire lequel
  exclureDeLaGeneration?: string // présent tant qu'une valeur clé reste à vérifier : dire pourquoi
}
