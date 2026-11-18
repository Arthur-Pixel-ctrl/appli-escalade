// Types du moteur de séance : uniquement des types, aucune logique, pour qu'une autre app (montre) puisse les reprendre.
import type { Forme, Preuve, Qualite } from '../donnees/bibliotheque/types.ts'

/** Réglages propres d'une étape dans un plan (consolidation 17/11 : les trois clés lues par le moteur de vérification). */
export interface ReglagesEtape { series?: number; reposS?: number; dureeMin?: number }

/** Une étape prête à être exécutée : tout ce qu'il faut pour l'afficher et lancer le chrono. */
export type EtapeSeance = Forme & {
  id: string            // unique dans la séance : "echelles", "bloc-limite-2"
  titre: string
  resume: string        // "9 échelles", "40 min"
  consigne: string
  dureeMin: number      // durée indicative, repos compris (réglage dureeMin déjà appliqué)
  preuve?: Preuve
  // D'où vient l'étape. Information seulement : l'étape est autonome, elle ne relit jamais la bibliothèque.
  // Les réglages sont déjà appliqués à la forme (séries du chrono, repos) ; ils sont gardés ici comme trace.
  origine?: { source: 'bibliotheque' | 'perso'; refId: string; reglages?: ReglagesEtape }
  objectifSpecifiqueId?: string  // (consolidation 17/11) l'étape est le module d'un objectif spécifique de la phase
  note?: string                  // (consolidation 17/11) courte note affichée : « Semaine allégée : niveau flash plutôt que projet. »
}

/** Une séance guidée en solo (forme actuelle de SEANCE_EXEMPLE, avec des étapes complètes). */
export interface SeanceGuidee { nom: string; etapes: EtapeSeance[] }

/** Un objectif de groupe : un défi global suivi par un compteur (forme actuelle). */
export interface ObjectifGroupe {
  libelle: string
  cible: number
  couleurConseillee?: string
  compte: 'blocs_notes' | 'flashs'
  // (consolidation 17/11) Bornes et intention, reprises du catalogue OG-xx (seances-types.md, C.1). Toutes facultatives.
  modeleId?: string              // "OG-01"
  ficheReference?: string        // protocole solo équivalent : les marqueurs de l'objectif s'en déduisent (jamais stockés)
  blocs?: number
  essaisMaxParBloc?: number      // borne de sécurité affichée pendant la séance
  ecartCotation?: [number, number]
  reposConseilleS?: number
  accents?: Qualite[]            // qualités que l'objectif travaille
}

/** Une séance en groupe (forme actuelle de SEANCE_GROUPE_EXEMPLE). */
export interface SeanceGroupe { nom: string; reposConseilleS: number; objectifs: ObjectifGroupe[] }

/** Un bloc grimpé et noté pendant une séance en groupe. */
export interface BlocGrimpe {
  couleur: string
  essais: number
  resultat: 'flash' | 'enchaine' | 'non_enchaine'
  objectif: number // position de l'objectif en cours au moment de la saisie
}
