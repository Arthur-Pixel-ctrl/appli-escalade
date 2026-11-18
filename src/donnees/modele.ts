// Les documents enregistrés par l'app (modèle v2, docs/architecture-v2.md § 3.2).
// Ce fichier ne contient que des types et des constantes : aucune fonction, aucun accès à la base.
import type { Contexte, Forme, Marqueur, Prerequis, Qualite } from './bibliotheque/types.ts'
import type { Profil, ZoneDouleur } from './profil.ts'
import type { BlocGrimpe, EtapeSeance, ObjectifGroupe, SeanceGuidee } from '../moteur/types.ts'
import type { Salle } from './salles.ts'

export type { Profil }

export type DateISO = string // "2026-11-17", jour local
export type Horodatage = string // "2026-11-17T18:32:00.000Z"

/** Les cinq qualités physiques. */
export type QualitePhysique = 'doigts' | 'traction_gainage' | 'puissance' | 'resistance' | 'endurance'
/** L'accent d'une phase : une qualité physique, ou la technique. */
export type AccentPhase = QualitePhysique | 'technique'
export type Durete = 'dure' | 'legere'
/** Note de 1 à 5 de la forme du jour : 1 = mauvais, 5 = très bon ; « rouge » = 1 ou 2. */
export type Note5 = 1 | 2 | 3 | 4 | 5

export const QUALITES_PHYSIQUES: QualitePhysique[] = ['doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance']

/** Champs communs à tout document enregistré et synchronisé. */
export interface Document {
  id: string
  versionFormat: 1 // forme du document ; augmentera si un champ change de sens
  creeLe: Horodatage
  modifieLe: Horodatage // la règle « dernière modification gagne » compare ce champ
  supprimeLe?: Horodatage // suppression douce : le document reste, masqué
}

// ——— Profil et réglages (table `reglages`, deux documents à identifiant fixe) ———

export type ProfilEnregistre = Profil & Document & { id: 'profil' }

export interface Reglages extends Document {
  id: 'reglages'
  // Valeurs choisies pour les règles de sécurité réglables. Clés, défauts et plages vivent dans le code
  // des règles ; une valeur absente, hors plage ou du mauvais type est ignorée.
  reglesSecurite: Record<string, number | boolean>
  assistantModele?: string // absent = modèle par défaut
}

// ——— Plan ———

/** Trace d'un brouillon proposé par l'assistant et gardé par l'utilisateur (affichée, jamais exécutée). */
export interface TraceAssistant {
  modele: string
  demandeLe: Horodatage
  demande: string // ce que l'utilisateur a demandé
  explication: string // le pourquoi, en clair
  sources: string[] // "López : 48 h entre deux séances sur une même préhension" ; un livre : son titre seul
}

export interface Cycle extends Document {
  nom: string
  debut: DateISO // toujours un lundi
  nbSemaines: number // 12 par défaut ; moins en mode objectif daté
  seancesParSemaine: number
  etat: 'brouillon' | 'valide' // un brouillon n'apparaît jamais sur le téléphone
  objectif?: { libelle: string; date?: DateISO } // avec une date : mode « objectif daté » (calculé)
  abandonneLe?: DateISO // arrêté avant la fin ; le cycle reste dans l'historique
  assistant?: TraceAssistant
  avertissementsGardes: string[] // clés des avertissements repliés par « Je garde ce choix »
}

export interface SemainePlan {
  numero: 1 | 2 | 3 | 4
  type: 'charge' | 'allegee' | 'affutage' | 'transition'
  reductionPct?: number // allégée et affûtage : 40 à 60 %, 50 par défaut
}

/** Une phase de 4 semaines. Sa date de début n'est pas stockée : debut du cycle + (ordre − 1) × 28 jours. */
export interface PhaseCycle extends Document {
  cycleId: string
  ordre: 1 | 2 | 3
  accent: AccentPhase | null // null = pas encore choisi dans le constructeur
  semaines: SemainePlan[] // 4 : 3 de charge puis 1 allégée par défaut
  note?: string
}

export interface ObjectifSpecifique extends Document {
  phaseId: string // 0 à 2 par phase ; la liste d'une phase se lit par cet index
  libelle: string // "Renforcer les bidoigts"
  modeleId?: string // objectif du catalogue des objectifs spécifiques, s'il en vient
  indicateur?: { nom: string; unite: string; depart?: number; cible?: number }
}

/** Version solo d'une séance planifiée : étapes complètes, recopiées à la création. */
export interface VersionSolo extends SeanceGuidee {
  durete: Durete // choisie par l'utilisateur (défaut proposé par les règles)
  effortPrevu?: number // 1 à 10 ; absent = 7 si dure, 4 si légère
  // Pas de champ `marqueurs` : ils se calculent depuis les fiches citées par origine.refId.
}

/** Version groupe : objectifs globaux, et un mini-bloc solo facultatif. */
export interface VersionGroupe {
  nom: string
  durete: Durete
  effortPrevu?: number
  dureeMin?: number // durée annoncée (« 1 h 30 ») : non calculable pour une séance de groupe
  reposConseilleS: number
  objectifs: ObjectifGroupe[] // 1 à 3
  miniBloc?: { moment: 'avant' | 'apres'; etapes: EtapeSeance[] }
  // L'échauffement en commun n'est pas stocké : l'écran le rappelle toujours.
}

export interface SeancePlanifiee extends Document {
  cycleId: string
  phaseId: string
  semaine: 1 | 2 | 3 | 4
  date: DateISO
  qualite: Qualite // dominante, choisie (peut être 'technique' ou 'mobilite')
  solo: VersionSolo
  groupe: VersionGroupe | null // null = pas de version groupe proposée (séance à la maison)
  seanceTypeId?: string // séance type du catalogue d'origine ("ST-DOI-02"), information
  variante?: string
  sauteeLe?: Horodatage // l'utilisateur a choisi de la sauter (téléphone ou ordinateur)
  // Pas de `avertissementsVus` : les avertissements gardés sont sur le cycle.
}

// ——— Journal ———

export interface EtapeRealisee {
  titre: string
  statut: 'faite' | 'passee' | 'a_faire'
  refId?: string // origine.refId de l'étape planifiée
}

/** Compatible avec les séances déjà enregistrées : tous les champs ajoutés en v2 sont facultatifs. */
export interface SeanceRealisee extends Document {
  date: DateISO
  mode: 'solo' | 'groupe' | 'libre'
  nom: string
  durete: Durete
  dureeMin: number
  effortPercu: number // 1 à 10
  peau: 1 | 2 | 3 // 1 abîmée, 2 limite, 3 bonne
  douleur: boolean
  etapes: EtapeRealisee[]
  objectifs: { libelle: string; cible: number; fait: number }[]
  blocs: BlocGrimpe[]
  seancePlanifieeId?: string // absent = séance hors plan
  salleId?: string
  qualite?: Qualite
  marqueurs?: Marqueur[] // instantané des marqueurs de la version exécutée : servent aux quotas et aux 48 h
}

// ——— Bibliothèque personnelle ———

export type LivreReference = 'planification' | 'cent_exercices' | 'alimentation' | 'autre'

/** Titre complet des livres : une constante de code, pas une donnée. Seuls le titre et la page sont cités. */
export const LIVRES: Record<LivreReference, string> = {
  planification: 'Escalade Training : les secrets de la planification (K. Arc, H. Di Domenico, Amphora)',
  cent_exercices: 'Escalade Training : 100 exercices spécifiques d’entraînement (K. Arc, H. Di Domenico, Amphora)',
  alimentation: 'Guide de l’alimentation du grimpeur (C. Milenkovic-Messin)',
  autre: 'Autre ouvrage',
}

/** Un exercice créé par l'utilisateur. Même forme d'exécution qu'un protocole : le moteur le joue pareil. */
export type ExercicePerso = Document & Forme & {
  nom: string
  qualite: Qualite
  resume: string
  consigne: string
  dureeMin: number
  // null = pas encore qualifié. Le formulaire traduit « oui / non / je ne sais pas » en marqueurs,
  // « je ne sais pas » comptant comme « oui » (prudence).
  marqueurs: Marqueur[] | null
  contreIndications: ZoneDouleur[]
  prerequis?: Prerequis // mêmes conditions qu'un protocole
  contexte?: Contexte // terrain, partenaire…
  reposEntreEffortsS?: number
  prerequisNote?: string
  reference?: { livre: LivreReference; titreAutre?: string; page?: string } // "Escalade Training, p. 84"
}

/** Une salle créée par l'utilisateur. Même identifiant qu'un préréglage = elle le remplace pour lui. */
export type SallePerso = Document & Salle

// ——— Suivi (tables créées dès la version 3 de la base, remplies en phases 4 et 6) ———

/** Forme du jour. Identifiant = la date : une seule forme par jour, même sur deux appareils. */
export interface FormeDuJour extends Document {
  date: DateISO
  sommeil: Note5
  fatigue: Note5
  courbatures: Note5
  douleur: Note5
  peau: Note5
  heuresSommeil?: number
}

/** Une douleur déclarée, datée. Aucune information médicale libre. */
export interface DouleurDeclaree extends Document {
  date: DateISO
  zone: ZoneDouleur
  niveau: 'alerte' | 'reduction' // alerte = au moins un signe d'arrêt coché
  signes: string[] // signes d'alerte cochés
  resolueLe?: DateISO
}

/** Résultat d'un test repère. Unité et sens de progrès viennent du catalogue des tests. */
export interface ResultatTest extends Document {
  testId: string
  date: DateISO
  valeur: number
  cote?: 'gauche' | 'droite'
  note?: string
}
