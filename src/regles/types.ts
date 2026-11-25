// Les types du moteur de vérification (docs/specs/entrainement/moteur-verification.md, B.1 et B.3).
// Le moteur ne lit pas la base : il reçoit cette « vue », construite par un petit adaptateur.
// Les types communs (qualités, marqueurs, prérequis, contexte, zones de douleur) viennent des
// documents existants et ne sont pas recopiés ici.
import type { Contexte, Marqueur, Prerequis, Qualite } from '../donnees/bibliotheque/types.ts'
import type { ZoneDouleur } from '../donnees/profil.ts'
import type { NiveauDetail } from '../donnees/modele.ts'

export type { Contexte, Marqueur, Prerequis, Qualite, ZoneDouleur }

export type Jour = string // "2026-11-17"

/** Information : « à savoir, c'est peut-être voulu ». Fort : « risque pour ton corps ou plan incohérent ». */
export type Niveau = 'information' | 'fort'

/** Ce que le moteur sait du grimpeur. null = pas encore renseigné (compte comme « non rempli »). */
export interface ProfilVerif {
  disciplinePrincipale: 'bloc' | 'voie'
  niveauBloc: string | null // "7A"
  anneesPratique: number
  experiencePoutre: 'aucune' | 'occasionnelle' | 'reguliere'
  tractionsStrictesMax: number | null
  test15sSur25mm: boolean | null
  adulte: boolean | null
  grimpeEnTete: boolean | null
  douleursEnCours: ZoneDouleur[]
  seancesParSemaine: number
  // (consolidation 18/11) jamais vide : C-01 met ['salle_bloc'] si le profil n'en dit rien
  lieux: ('salle_bloc' | 'salle_voie' | 'maison')[]
}

/** Une fiche de la bibliothèque OU un exercice personnel, ramenés à la même forme. */
export interface FicheVerif {
  id: string
  nom: string
  origine: 'bibliotheque' | 'perso'
  qualite: Qualite
  dureeMin: number
  marqueurs: Marqueur[] | null // null = exercice perso dont l'utilisateur n'a pas dit s'il est intense
  prerequis: Prerequis // {} pour un exercice perso sans condition
  contexte?: Contexte
  contreIndications: ZoneDouleur[]
  maxParSemaine?: number
  exclureDeLaGeneration?: string
  reposEntreEffortsS?: number // calculé par l'adaptateur
  solliciteDoigts: boolean // table B.2
  estTest?: boolean // fiche de test repère (aucune aujourd'hui)
}

export interface EtapeVerif {
  ficheId: string
  reglages?: { series?: number; reposS?: number; dureeMin?: number }
  moduleObjectifId?: string // présent si l'étape est le module d'un objectif spécifique
}

export interface ObjectifGroupeVerif {
  libelle: string
  accents: Qualite[] // qualités avec lesquelles l'objectif est cohérent
  marqueurs: Marqueur[]
  blocs?: number
  essaisMaxParBloc?: number
  reposConseilleS?: number
}

export interface VersionVerif {
  durete: 'dure' | 'legere'
  effortPrevu?: number // 1 à 10 ; absent = valeur par défaut (EFFORT_PREVU_PAR_DEFAUT)
  etapes: EtapeVerif[] // solo : tout le déroulé ; groupe : le mini-bloc (peut être vide)
  objectifs?: ObjectifGroupeVerif[] // groupe seulement
  // groupe : durée annoncée ; solo : seulement sans étapes réelles (somme des parties)
  dureeMin?: number
  // (consolidation 18/11) niveau affiché ; absent = détaillé
  niveau?: NiveauDetail
  // (consolidation 18/11) faux = étapes résumées (une par exercice principal) ; absent = vrai
  etapesDetaillees?: boolean
  // (consolidation 24/11) solo avec étapes réelles : fiches des principaux des parties écrites, absentes des étapes ;
  // exercices de la séance sans place dans l'ordre (niveaux-de-detail.md § 3.4) ; absent = aucun
  principauxHorsEtapes?: string[]
}

export interface SeanceVerif {
  id: string
  nom: string
  date: Jour
  qualite: Qualite // qualité dominante
  solo: VersionVerif
  groupe?: VersionVerif
  realisee?: {
    version: 'solo' | 'groupe'
    finLe: string // horodatage ISO de fin
    dureeMin: number
    effortPercu: number
    marqueurs: Marqueur[]
    peau?: 1 | 2 | 3
  }
  // (consolidation 25/11, audit phase 3) Séance réalisée sans séance planifiée dans ce plan (faite hors plan,
  // ou sa séance planifiée a été supprimée) : son `id` est celui de la séance réalisée.
  // Posé par `realiseeVersVerif` ; absent = séance du plan (prévue, ou prévue puis faite). Calculé, jamais stocké (R-8).
  horsPlan?: true
}

export interface SemaineVerif {
  lundi: Jour
  type: 'charge' | 'decharge' | 'affutage' | 'transition'
  reductionPct?: number
  mesocycleOrdre: number // 1, 2, 3
  numero: number // 1 à 4 dans le bloc
}

export interface ObjectifPersoVerif {
  id: string
  nom: string
  marqueurs: Marqueur[]
  prerequis: Prerequis
  contreIndications: ZoneDouleur[]
  remplacementNom?: string
}

export interface PlanVerif {
  origine: 'utilisateur' | 'assistant'
  debut: Jour
  nbSemaines: number
  seancesParSemaine: number
  mode: 'accent_tournant' | 'objectif_date'
  objectif?: { date: Jour; semainesAffutage: number; reductionVolumePct: number }
  // accent : null tant que la phase n'a pas d'accent choisi (amendement de consolidation)
  mesocycles: { ordre: number; accent: Qualite | null; objectifsPersoIds: string[] }[]
  semaines: SemaineVerif[] // dans l'ordre
  seances: SeanceVerif[]
  cycleSuivantDebut?: Jour
}

export interface DouleurVerif {
  date: Jour
  zone: ZoneDouleur
  niveau: 'alerte' | 'reduction'
  signes: string[]
  resolueLe?: Jour
}

export interface FormeVerif {
  date: Jour
  sommeil: number
  fatigue: number
  courbatures: number
  douleur: number
  peau: number // 1 à 5 pour chacun de ces cinq champs
  heuresSommeil?: number
}

export interface ResultatTestVerif {
  testNom: string
  date: Jour
  valeur: number
  sensProgres: 'hausse' | 'baisse'
}

export interface ContexteVerif {
  aujourdhui: Jour
  maintenant: string // horodatage ISO
  profil: ProfilVerif
  fiches: Record<string, FicheVerif> // bibliothèque + exercices perso
  objectifsPerso: Record<string, ObjectifPersoVerif>
  douleurs: DouleurVerif[]
  formes: FormeVerif[]
  resultatsTests: ResultatTestVerif[]
  regles: Regles
}

/** Réglages de sécurité. Valeurs et sources : reglesParDefaut.ts. */
export interface Regles {
  heuresEntreSeancesMax: number // [SYN], [MOD]
  poutreIntensiveParSemaine: number // [SYN]
  blocLimiteParSemaine: number // [SYN]
  poutreParSemaine: number // [AUD I-8]
  joursDoigtsMaxParSemaine: number // [VER 9]
  reposEffortMaxS: number // [SYN] (3 à 5 min)
  dechargeActive: boolean // [SYN]
  dechargeReductionPct: number // [SYN], [MOD] (40 à 60)
  seuilSommeilH: number // [SYN]
  hausseChargeMaxPct: number // [SYN] (repère FFME, non validé)
  dureeBlocNerveuxMaxMin: number // [SYN] (gabarit : 30 à 60 min)
  toleranceDechargePts: number // [CDC]
  seuilDechargeOublieePct: number // [CDC]
  joursSansPoutreAvantObjectif: number // [CDC]
}

/** (consolidation 25/11, audit phase 3) Noms des champs de ProfilVerif qu'un prérequis de fiche peut demander et qui peuvent valoir null. */
export type PrerequisNonRenseigne = 'tractionsStrictesMax' | 'test15sSur25mm' | 'niveauBloc' | 'adulte'

export interface Avertissement {
  code: string // "W-01"
  niveau: Niveau
  message: string // déjà rempli, prêt à afficher
  portee: 'plan' | 'semaine' | 'seance' | 'etape' | 'jour'
  seanceId?: string
  version?: 'solo' | 'groupe'
  etapeIndex?: number
  lundi?: Jour
  mesocycleOrdre?: number
  sujet?: string // ce que vise l'alerte quand une vérification en émet plusieurs pour la même cible (B.3)
  // (consolidation 25/11, audit phase 3) W-01 seulement : la séance d'avant (`a`), quand c'est une séance du plan ;
  // absent si elle a été réalisée hors plan (`a.horsPlan`). Ni dans la cible, ni dans `cleAvertissement`.
  seanceLieeId?: string
  // (consolidation 25/11, audit phase 3) S-03 seulement : prérequis demandés que le profil laisse à null,
  // dans l'ordre de `PrerequisNonRenseigne` ; absent si aucun. Ni dans la cible, ni dans `cleAvertissement`.
  nonRenseignes?: PrerequisNonRenseigne[]
  source: string // texte court affichable : « Hörst, López (synthèse) »
}
