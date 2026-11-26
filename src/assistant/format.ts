// Format des échanges avec l'assistant IA : ce qu'on lui envoie (ContexteAssistant) et ce qu'il doit rendre
// (ReponseAssistant). Types recopiés de docs/specs/entrainement/assistant-ia.md (D.3 et D.4), avec les
// amendements de consolidation du 17/11, du 18/11 et du 23/11.
// Aucun appel réseau ici : seulement la forme des données. La vérification est dans validerReponse.ts.
import type { NiveauDetail, QualitePhysique } from '../donnees/modele.ts'
import type { Qualite } from '../donnees/bibliotheque/types.ts'
import type { JourSemaine } from '../donnees/profil.ts'
import type { Regles } from '../regles/types.ts'

export type { Qualite, QualitePhysique, JourSemaine }

// ——— Contexte envoyé à l'assistant (D.3) ———

export interface ContexteAssistant {
  aujourdhui: string // "2026-11-17"
  demande: string // texte de l'utilisateur
  // Niveau du cycle en cours. Pour un « Brouillon de cycle » on envoie 'detaille' (F6) : le niveau du nouveau
  // cycle se choisit après la réponse, jamais par l'assistant.
  niveauDetail: NiveauDetail
  profil: {
    disciplinePrincipale: 'bloc' | 'voie'
    niveauBloc: string | null
    niveauVoie: string | null
    objectif: string // texte libre de l'utilisateur
    anneesPratique: number
    experiencePoutre: 'aucune' | 'occasionnelle' | 'reguliere'
    tractionsStrictesMax: number | null
    test15sSur25mm: boolean | null
    adulte: boolean | null
    grimpeEnTete: boolean | null
    pointsFaibles: string[]
    seancesParSemaine: number
    joursDisponibles: string[]
    grimpeSouventEnGroupe: boolean
    lieux: string[] // au moins ["salle_bloc"]
  }
  regles: Regles // valeurs en vigueur (le poids du corps n'est jamais envoyé)
  planEnCours: null | {
    debut: string
    mode: string
    objectif?: { libelle: string; date: string }
    blocs: { ordre: number; accent: string; objectifsPerso: string[] }[]
    semaineCourante: { lundi: string; numero: number; type: string; ordreBloc: number }
    seancesAVenir: {
      // 14 prochains jours
      id: string
      date: string
      nom: string
      qualite: string
      durete: string
      seanceTypeId?: string
      etapes: string[] // sans étapes : les exercices principaux des parties
      objectifsGroupe: string[]
      niveau: string // niveau choisi par l'utilisateur (`niveauChoisi`), pas le niveau affiché
    }[]
  }
  historique: {
    semaines: { lundi: string; charge: number; seances: number; dures: number; maximales: number }[] // 4 dernières
    dernieresSeances: {
      date: string
      nom: string
      qualite: string
      effortPercu: number
      dureeMin: number
      finAnticipee?: string
      douleur: boolean
    }[] // 6 dernières
    tests: { nom: string; date: string; valeur: number; unite: string }[]
    forme?: { itemsRougesAujourdhui?: number; sommeilMoyen3Nuits?: number }
  }
  douleursOuvertes: { zone: string; niveau: 'alerte' | 'reduction'; depuisJours: number; signes: string[] }[]
  // La banque d'exercices (décision F3) : seule source de fiches pour l'assistant.
  fichesDisponibles: {
    id: string
    nom: string
    qualite: string
    dureeMin: number
    marqueurs: string[]
    maxParSemaine?: number
    terrain?: string
    resume: string
  }[]
  fichesIndisponibles: {
    id: string
    nom: string
    raison: 'prerequis' | 'douleur' | 'a_verifier' | 'test' | 'contexte'
  }[]
  seancesTypes: {
    id: string
    nom: string
    qualite: string
    role: 'N' | 'C' | 'L' | 'H'
    durete: string
    dureeMin: number
    variantes: string[]
    recommandation: string
  }[]
  objectifsGroupe: { id: string; libelle: string; ficheReference?: string }[]
  objectifsPerso: { id: string; nom: string }[]
  exercicesPerso: { id: string; nom: string; qualite: string; dureeMin: number; marqueurs: string[] | null }[]
}

// ——— Réponse de l'assistant (D.4) ———

export type TypeReponse = 'cycle' | 'bloc' | 'semaine' | 'ajustement' | 'explication' | 'refus' | 'question'

export interface ReponseAssistant {
  version: 1
  type: TypeReponse
  resume: string // 300 caractères au plus
  brouillon?: BrouillonCycle | BrouillonBloc | BrouillonSemaine | BrouillonAjustement
  justification: string[] // 0 à 5 phrases de 200 caractères au plus
  sources: SourceCitee[] // 0 à 6
  miseEnGarde?: string // 400 caractères au plus
  questions?: string[] // 1 à 3, type 'question' seulement
  texte?: string // type 'explication' ou 'refus', 1 500 caractères au plus
}

// ---- Séances ----
export interface EtapeBrouillon {
  ficheId: string // un id de fichesDisponibles ou d'exercicesPerso
  reglages?: { series?: number; reposS?: number; dureeMin?: number }
  note?: string // 120 caractères au plus
  moduleObjectifId?: string // id de objectifsPerso : l'étape est le module d'un objectif spécifique
}

export type ObjectifBrouillon =
  | { objectifId: string } // un id de objectifsGroupe ("OG-01")
  | {
      libelle: string
      cible: number
      compte: 'blocs_notes' | 'flashs'
      ficheReference: string
      blocs?: number
      essaisMaxParBloc?: number
      reposConseilleS?: number
    }

export interface GroupeBrouillon {
  objectifs: ObjectifBrouillon[] // 1 à 3
  miniBloc?: { moment: 'avant' | 'apres'; etapes: EtapeBrouillon[] }
}

export interface PartieBrouillon {
  titre: string
  dureeMin: number // 5 à 180
  ficheId?: string
  consigne?: string // 120 caractères au plus
}

export type SeanceBrouillon =
  // Séance du catalogue : valable à tous les niveaux, à préférer.
  | { jour: JourSemaine; seanceTypeId: string; variante?: string }
  // Séance composée étape par étape (niveau détaillé).
  | {
      jour: JourSemaine
      nom: string
      qualite: Qualite
      durete: 'dure' | 'legere'
      effortPrevu: number // 1 à 10
      solo: { etapes: EtapeBrouillon[] }
      groupe: null | GroupeBrouillon
    }
  // Séance résumée (consolidation 18/11) : niveau simple ou grandes lignes.
  | {
      jour: JourSemaine
      nom: string
      qualite: Qualite
      durete: 'dure' | 'legere'
      effortPrevu: number
      niveau: 'simple' | 'grandes_lignes'
      recommandation: string // 120 caractères au plus ; garde les bornes de sécurité
      parties: PartieBrouillon[] // simple : 1 ; grandes lignes : 2 à 5
      groupe: null | GroupeBrouillon
    }

// ---- Plans ----
export type TypeSemaine = 'charge' | 'decharge' | 'affutage' | 'transition'

export interface BrouillonSemaine {
  lundi: string // date d'un lundi
  type: TypeSemaine
  reductionPct?: number // decharge et affutage : 40 à 60
  seances: SeanceBrouillon[]
}

export interface BrouillonBloc {
  ordre: number // 1, 2 ou 3 (dans l'interface : « phase »)
  accent: QualitePhysique | 'technique'
  objectifsPersoIds: string[] // 0 à 2
  semaines: { type: 'charge' | 'decharge' | 'affutage'; reductionPct?: number }[] // 4 éléments
  semaineType: SeanceBrouillon[]
}

export interface BrouillonCycle {
  debut: string // un lundi
  seancesParSemaine: number
  mode: 'accent_tournant' | 'objectif_date'
  objectif?: { libelle: string; date: string; semainesAffutage: number; reductionVolumePct: number }
  blocs: BrouillonBloc[] // 3 éléments en accent tournant
}

// ---- Ajustement du plan en cours ----
export type Operation = { raison: string } & (
  | { op: 'remplacer_seance'; seanceId: string; par: SeanceBrouillon } // le jour de `par` est ignoré
  | { op: 'remplacer_etape'; seanceId: string; version: 'solo' | 'groupe'; index: number; par: EtapeBrouillon }
  | { op: 'retirer_etape'; seanceId: string; version: 'solo' | 'groupe'; index: number }
  | { op: 'ajouter_etape'; seanceId: string; version: 'solo' | 'groupe'; index: number; etape: EtapeBrouillon }
  | { op: 'deplacer_seance'; seanceId: string; nouvelleDate: string }
  | { op: 'alleger_seance'; seanceId: string; reductionPct: number } // 10 à 60
  | { op: 'changer_semaine'; lundi: string; type: TypeSemaine; reductionPct?: number }
)

export interface BrouillonAjustement {
  operations: Operation[] // 1 à 10
}

// ---- Sources ----
export const AUTEURS_CONNUS = [
  'Hörst', 'Lattice Training', 'Bechtel', 'López', 'Anderson', 'MacLeod', 'Barrows', 'Nelson',
  'Power Company', 'La Fabrique Verticale', 'BMC', 'Schweizer', 'Mundry et al.', 'Devise et al.',
  'Stien et al.', 'Gilmore et al.', 'Giles et al.', 'Bosquet et al.', 'Walsh et al.', 'Ingram et al.',
  'Haddad et al.',
] as const
export type AuteurConnu = (typeof AUTEURS_CONNUS)[number]

// Les trois livres de l'utilisateur : cités par leur titre seul, jamais comme source d'une règle.
export const TITRES_LIVRES = [
  'Escalade Training : les secrets de la planification',
  "Escalade Training : 100 exercices spécifiques d'entraînement",
  "Guide de l'alimentation du grimpeur",
] as const
export type TitreLivre = (typeof TITRES_LIVRES)[number]

export type SourceCitee =
  | { type: 'synthese'; sujet: string }
  | { type: 'fiche'; ficheId: string }
  | { type: 'methode'; auteur: AuteurConnu; idee: string } // idée en 120 caractères au plus
  | { type: 'livre'; titre: TitreLivre } // titre seul : ni page, ni contenu
