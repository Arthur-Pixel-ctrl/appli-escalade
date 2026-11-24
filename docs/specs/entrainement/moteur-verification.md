# B. Moteur de vérification

Expert entraînement, 17 novembre 2026. Ce moteur reçoit un plan (fait à la main ou proposé par l'assistant), ou une seule séance, et rend une liste d'avertissements. Il est fait de **fonctions pures** : aucune lecture de base de données, aucune date « maintenant » cachée (la date du jour est un paramètre).

Principe : **avertir, jamais bloquer** [PLAN], [MOD], CLAUDE.md.

> **(consolidation 17/11)** À l'écran, la période de 4 semaines s'appelle « phase » (décision B9) : les **messages** ci-dessous le disent ; les noms internes du moteur (`mesocycleOrdre`, `mesocycles`, semaine `decharge`) ne changent pas. La vue `PlanVerif` est construite à partir des documents enregistrés par la tâche C-01 (`docs/backlog-v2.md`). Un accent de phase peut valoir `'technique'` (B13) ou être `null` tant qu'il n'est pas choisi : W-14, P-03, P-04 et P-07 ignorent un accent `null`. L'effort prévu par défaut (7 et 4) est décidé (B17) ; le plafond de poutre selon l'ancienneté reste une information (B18). Le moteur ne modifie rien ; il ne retire rien ; il ne masque rien. L'écran décide comment afficher.

> **(consolidation 18/11, décisions F4 et F5)** Niveaux de détail (`docs/specs/niveaux-de-detail.md`, § 3). Le moteur vérifie toujours **le contenu le plus fin qui existe**, quel que soit le niveau affiché : une séance affichée « simple » qui a des étapes est vérifiée sur ses étapes. Sans étapes, la passerelle C-01 donne au moteur une étape résumée par exercice principal. Seul S-15 dépend du niveau affiché (le chrono réglé n'est lancé qu'en détaillé). Deux vérifications nouvelles, d'information : S-26 et P-15. Aucune vérification de semaine, de plan ou de jour ne change.

> **(consolidation 23/11, décision F7)** Une version solo **dure** sans aucune fiche connue est une **séance dure ordinaire**, pas un effort maximal : `marqueursVersion` ne lui ajoute plus le marqueur `maximale` (la prudence du 18/11 est retirée). Ce que fait chaque règle pour cette séance : fin de B.2. S-26 reste une information, reformulée ; cas 14 et 15 de B.11 mis à jour.

> **(consolidation 23/11, décision F2 point 13, et unicité)** Deux trous signalés par les développeurs. (1) **W-20**, nouvelle vérification de semaine : au plus 1 séance de résistance en voie par semaine tant que le profil est « bloc », 2 en voie (décision F2 d'Arthur, point 13 de `docs/recherche-b21/audit.md` ; constat I-8 de cet audit). Le marqueur `resistance_voie` entre dans B.1 ; la constante `RESISTANCE_VOIE_PAR_SEMAINE` dans B.2. (2) **Unicité** (B.3) : l'`Avertissement` gagne un champ `sujet`, rempli par les vérifications qui émettent plusieurs alertes du même code pour la même cible (S-22, W-05, W-18, P-11, P-12) ; sans lui, le dédoublonnage en supprimait. Cas 17 et 18 en B.11. Tâche de code : E-17 (`docs/backlog-v2.md`).

> **(consolidation 24/11)** Point signalé par les développeurs de C-01 et E-09 : une séance qui a des étapes **et** des parties écrites, dont un exercice principal manque dans les étapes. Le moteur ne le voyait pas avant la séance (ni prérequis, ni douleurs, ni 48 h). Règle (`docs/specs/niveaux-de-detail.md` § 3.4) : ce « principal hors étapes » est un exercice de la séance, sans place dans l'ordre. Nouveau champ `VersionVerif.principauxHorsEtapes` (B.1) ; il entre dans `marqueursVersion` et `seanceSolliciteDoigts` (B.2), dans W-05 (B.6) et dans les vérifications de fiche (B.5) ; jamais dans les contrôles d'ordre, de repos ni de durée. Nouvelle information **S-27**, cas 19 en B.11. Tâche de code : E-18.

Sources : mêmes codes que `regles-planification.md` (`[SYN]`, `[VER n]`, `[AUD x]`, `[PLAN]`, `[MOD]`, `[CDC]`).

---

## B.1 Entrées

Le moteur ne lit pas directement les types du stockage (en cours de définition par l'architecte). Il reçoit une **vue** simple, construite par un petit adaptateur. Ainsi, le moteur peut être écrit et testé dès maintenant.

```ts
type Jour = string // "2026-11-17"
type Qualite = 'doigts' | 'traction_gainage' | 'puissance' | 'resistance' | 'endurance'
  | 'technique' | 'mental' | 'antagonistes' | 'mobilite' | 'echauffement' // = Qualite de la bibliothèque
type Marqueur = 'maximale' | 'poutre_intensive' | 'bloc_limite' | 'pan_gullich' | 'arque'
  | 'bidoigts' | 'poutre' | 'trou' | 'pan' // = Marqueur de la bibliothèque
  | 'resistance_voie'                   // (consolidation 23/11) résistance en voie : compté par W-20 ; déjà dans le type de la bibliothèque
type ZoneDouleur = 'doigts' | 'poignet' | 'coude' | 'epaule' | 'genou' | 'dos' | 'autre'

/** Ce que le moteur sait du grimpeur. null = pas encore renseigné (compte comme « non rempli »). */
interface ProfilVerif {
  disciplinePrincipale: 'bloc' | 'voie'
  niveauBloc: string | null           // "7A"
  anneesPratique: number
  experiencePoutre: 'aucune' | 'occasionnelle' | 'reguliere'
  tractionsStrictesMax: number | null
  test15sSur25mm: boolean | null
  adulte: boolean | null
  grimpeEnTete: boolean | null
  douleursEnCours: ZoneDouleur[]
  seancesParSemaine: number
  lieux: ('salle_bloc' | 'salle_voie' | 'maison')[] // (consolidation 18/11) jamais vide : C-01 met ['salle_bloc'] si le profil n'en dit rien
}

/** Une fiche de la bibliothèque OU un exercice personnel, ramenés à la même forme. */
interface FicheVerif {
  id: string
  nom: string
  origine: 'bibliotheque' | 'perso'
  qualite: Qualite
  dureeMin: number
  marqueurs: Marqueur[] | null        // null = exercice perso dont l'utilisateur n'a pas dit s'il est intense
  prerequis: Prerequis                 // = Prerequis de la bibliothèque ; {} pour un exercice perso sans condition
  contexte?: Contexte                  // = Contexte de la bibliothèque
  contreIndications: ZoneDouleur[]
  maxParSemaine?: number
  exclureDeLaGeneration?: string
  reposEntreEffortsS?: number          // calculé par l'adaptateur (B.2)
  solliciteDoigts: boolean             // table B.2
  estTest?: boolean                    // fiche de test repère (aucune aujourd'hui)
}

interface EtapeVerif {
  ficheId: string
  reglages?: { series?: number; reposS?: number; dureeMin?: number }
  moduleObjectifId?: string            // présent si l'étape est le module d'un objectif spécifique
}

interface ObjectifGroupeVerif {
  libelle: string
  accents: Qualite[]                   // qualités avec lesquelles l'objectif est cohérent
  marqueurs: Marqueur[]
  blocs?: number
  essaisMaxParBloc?: number
  reposConseilleS?: number
}

interface VersionVerif {
  durete: 'dure' | 'legere'
  effortPrevu?: number                 // 1 à 10 ; absent = valeur par défaut (B.2)
  etapes: EtapeVerif[]                 // solo : tout le déroulé ; groupe : le mini-bloc (peut être vide)
  objectifs?: ObjectifGroupeVerif[]    // groupe seulement
  dureeMin?: number                    // groupe : durée annoncée ; solo : présente seulement sans étapes réelles (somme des parties, consolidation 18/11)
  niveau?: 'simple' | 'grandes_lignes' | 'detaille' // (consolidation 18/11) niveau affiché ; absent = détaillé
  etapesDetaillees?: boolean           // (consolidation 18/11) faux = étapes résumées (une par exercice principal) ; absent = vrai
  principauxHorsEtapes?: string[]      // (consolidation 24/11) solo avec étapes réelles : fiches des principaux des parties écrites, absentes des étapes ;
                                       // exercices de la séance sans place dans l'ordre (niveaux-de-detail.md § 3.4) ; absent = aucun
}

interface SeanceVerif {
  id: string
  nom: string
  date: Jour
  qualite: Qualite                     // qualité dominante
  solo: VersionVerif
  groupe?: VersionVerif
  realisee?: {                         // présent si la séance a eu lieu
    version: 'solo' | 'groupe'
    finLe: string                      // horodatage ISO de fin
    dureeMin: number
    effortPercu: number
    marqueurs: Marqueur[]
    peau?: 1 | 2 | 3
  }
}

interface SemaineVerif {
  lundi: Jour
  type: 'charge' | 'decharge' | 'affutage' | 'transition'
  reductionPct?: number
  mesocycleOrdre: number               // 1, 2, 3
  numero: number                       // 1 à 4 dans le bloc
}

interface ObjectifPersoVerif {
  id: string
  nom: string
  marqueurs: Marqueur[]
  prerequis: Prerequis
  contreIndications: ZoneDouleur[]
  remplacementNom?: string
}

interface PlanVerif {
  origine: 'utilisateur' | 'assistant'
  debut: Jour
  nbSemaines: number
  seancesParSemaine: number
  mode: 'accent_tournant' | 'objectif_date'
  objectif?: { date: Jour; semainesAffutage: number; reductionVolumePct: number }
  mesocycles: { ordre: number; accent: Qualite; objectifsPersoIds: string[] }[]
  semaines: SemaineVerif[]             // dans l'ordre
  seances: SeanceVerif[]
  cycleSuivantDebut?: Jour
}

interface DouleurVerif {
  date: Jour
  zone: ZoneDouleur
  niveau: 'alerte' | 'reduction'
  signes: string[]
  resolueLe?: Jour
}

interface FormeVerif {
  date: Jour
  sommeil: number; fatigue: number; courbatures: number; douleur: number; peau: number // 1 à 5
  heuresSommeil?: number
}

interface ResultatTestVerif { testNom: string; date: Jour; valeur: number; sensProgres: 'hausse' | 'baisse' }

interface ContexteVerif {
  aujourdhui: Jour
  maintenant: string                   // horodatage ISO
  profil: ProfilVerif
  fiches: Record<string, FicheVerif>   // bibliothèque + exercices perso
  objectifsPerso: Record<string, ObjectifPersoVerif>
  douleurs: DouleurVerif[]
  formes: FormeVerif[]
  resultatsTests: ResultatTestVerif[]
  regles: Regles
}

interface Regles {
  heuresEntreSeancesMax: number        // 48       [SYN], [MOD]
  poutreIntensiveParSemaine: number    // 2        [SYN]
  blocLimiteParSemaine: number         // 2        [SYN]
  poutreParSemaine: number             // 3        [AUD I-8]
  joursDoigtsMaxParSemaine: number     // 4        [VER 9]
  reposEffortMaxS: number              // 180      [SYN] (3 à 5 min)
  dechargeActive: boolean              // true     [SYN]
  dechargeReductionPct: number         // 50       [SYN], [MOD] (40 à 60)
  seuilSommeilH: number                // 7        [SYN]
  hausseChargeMaxPct: number           // 10       [SYN] (repère FFME, non validé)
  dureeBlocNerveuxMaxMin: number       // 60       [SYN] (gabarit : 30 à 60 min)
  toleranceDechargePts: number         // 10       [CDC]
  seuilDechargeOublieePct: number      // 90       [CDC]
  joursSansPoutreAvantObjectif: number // 3        [CDC]
}
```

## B.2 Fonctions de base

| Nom | Définition | Source |
|---|---|---|
| `QUALITES_PHYSIQUES` | `['doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance']` | [SYN] |
| `MARQUEURS_NERVEUX` | `['maximale', 'poutre_intensive', 'bloc_limite', 'pan_gullich']` | [CDC] |
| `MARQUEURS_QUOTA` | `['maximale', 'poutre_intensive', 'bloc_limite', 'pan_gullich', 'poutre']` | [CDC] |
| `MARQUEURS_RISQUE_DOULEUR` | `['maximale', 'arque', 'pan_gullich', 'trou', 'pan']` | [SYN] (pendant une douleur : pas d'arqué, de pan, de trous ni d'effort maximal) |
| `RESISTANCE_VOIE_PAR_SEMAINE` (consolidation 23/11) | `{ bloc: 1, voie: 2 }`, lu avec `profil.disciplinePrincipale` (W-20). **Constante** de `reglesParDefaut.ts`, pas un champ de `Regles` : la valeur dépend du profil (un champ de `Regles` est un seul nombre), personne ne la règle à l'écran (D-20 ne montre que la semaine allégée), et c'est une décision, comme `EFFORT_PREVU_PAR_DEFAUT`. `MARQUEURS_QUOTA` ne change pas : y mettre `resistance_voie` changerait W-05, S-21 et P-11 sans décision | Décision F2 d'Arthur, point 13 ; audit B21, I-8 (Lattice [VER 4] : 2 au plus) |
| `marqueursDe(f)` | `f.marqueurs ?? []` | — |
| `estNerveuse(f)` | `marqueursDe(f) ∩ MARQUEURS_NERVEUX ≠ ∅` | [CDC] |
| `dureeEtape(e, f)` | `e.reglages?.dureeMin ?? f.dureeMin` | — |
| `estCongestionnante(e, f)` | `f.qualite === 'resistance' OU (f.qualite === 'endurance' ET dureeEtape(e, f) ≥ 20)` | [SYN] (« résistance congestionnante », « gros volume ») ; 20 min : [CDC] |
| `marqueursVersion(v)` | union des `marqueursDe(f)` des étapes connues ∪ (consolidation 24/11) des `v.principauxHorsEtapes` connus ∪ union des `o.marqueurs` des objectifs. (consolidation 23/11, F7) Rien de plus : une version `sansContenuConnu` n'a aucun marqueur, même dure (séance dure ordinaire) | [CDC] ; décision F7 d'Arthur ; principaux : `niveaux-de-detail.md` § 3.4 |
| `marqueursSeance(s)` | `s.realisee ? s.realisee.marqueurs : marqueursVersion(s.solo) ∪ (s.groupe ? marqueursVersion(s.groupe) : ∅)` — une séance prévue porte les marqueurs de ses deux versions, par prudence | [CDC] |
| `estMaximale(s)` | `'maximale' ∈ marqueursSeance(s)` | [SYN] |
| `estPoutreIntensive(s)` | `'poutre_intensive' ∈ marqueursSeance(s)` | [SYN] |
| `estDure(s)` | `s.solo.durete === 'dure' OU s.groupe?.durete === 'dure' OU estMaximale(s)` | [CDC] |
| `dureeVersion(v)` | `v.dureeMin ?? Σ dureeEtape(e, f)` sur les étapes connues (groupe : durée annoncée ; solo : `dureeMin` n'est posée que sans étapes réelles, consolidation 18/11) | — |
| `sansContenuConnu(v)` (consolidation 18/11) | version **solo** dont aucune étape n'a de fiche connue (`etapes` vide ou toutes inconnues). (consolidation 24/11) Ne lit pas `principauxHorsEtapes`, comme `dureeVersion` et `chargePrevue` : étapes seulement | — |
| `effortPrevu(v)` | `v.effortPrevu ?? (v.durete === 'dure' ? 7 : 4)` | **[CDC]** : 7 et 4 sont des valeurs par défaut prudentes, décidées par Arthur le 17/11 (B17) |
| `chargePrevue(s)` | `s.realisee ? s.realisee.effortPercu × s.realisee.dureeMin : max(effortPrevu(solo) × dureeVersion(solo), effortPrevu(groupe) × dureeVersion(groupe))` | [SYN], [MOD] (`chargeSeance = effort perçu × minutes`) |
| `chargeSemaine(lundi)` | `Σ chargePrevue(s)` des séances du lundi au dimanche | [MOD] |
| `lundiDe(jour)` | lundi de la semaine (déjà dans `src/donnees/debrief.ts`) | — |
| `joursEntre(a, b)` | nombre de jours calendaires de `a` à `b` (b − a) | — |
| `solliciteDoigts(f)` | faux pour les identifiants de la liste ci-dessous et pour toute fiche de qualité `antagonistes` ou `mobilite` ; vrai sinon. Exercice perso : vrai si `contexte.terrain` vaut `bloc`, `voie`, `pan` ou `poutre`, faux sinon | [VER 9] (Hörst : jours de grimpe et de poutre) ; liste : [CDC] |
| `seanceSolliciteDoigts(s)` | une étape au moins avec `solliciteDoigts` (consolidation 24/11 : ou un principal hors étapes connu qui a `solliciteDoigts`), ou une version groupe avec au moins un objectif, ou (consolidation 18/11) `sansContenuConnu(s.solo)` ET `s.qualite ∉ {mobilite, antagonistes}` (prudence, gardée le 23/11 : elle ne dépend pas du marqueur `maximale`) | [CDC] |
| `reposEntreEffortsS(f)` (adaptateur) | forme `essais` : `reposS` ; chrono `repetition_unique` : `reposSeriesS` ; chrono `intermittent` : `reposRepetitionsS` si `repetitions > 1`, sinon `reposSeriesS` ; chrono `depart_minute` : `creneauS − effortS` ; `echelle` et `liste` : non défini | — |
| `zonesDouloureuses(ctx, jour)` | `profil.douleursEnCours` ∪ zones des `douleurs` ouvertes (`resolueLe` absent ou postérieur à `jour`) et déclarées avant ou le `jour` | [MOD] |
| `itemsRouges(forme)` | nombre de valeurs ≤ 2 parmi sommeil, fatigue, courbatures, douleur, peau | [MOD] |
| `nbDuresMax(n)` | `min(n, 3)` : 2 séances → 2, 3 → 3, 4 et plus → 3 | [SYN] (Lattice : chaque séance dure suit un jour de repos ; semaine à 4 séances : 3 dures) ; plafond de 3 au-delà : [CDC] |
| `capPoutreAnciennete(a)` | `a < 1 → 0 ; 1 ≤ a < 4 → 1 ; 4 ≤ a < 7 → 2 ; a ≥ 7 → 3` | [SYN] (Bechtel : 1 séance courte entre 1 et 4 ans, jusqu'à 2 entre 4 et 6, 1 à 3 au-delà de 7 ; coachs Lattice : poutre après un an). Lecture 6 à 7 ans → 2 : [CDC] |

**Fiches de la bibliothèque qui ne sollicitent pas les doigts** (en plus des qualités `antagonistes` et `mobilite`) : `traction-simple-4x5`, `traction-negatives`, `traction-lestee-force-lattice`, `traction-lestee-5x5-horst`, `traction-blocages-90-120`, `traction-prises-decalees`, `puissance-tractions-explosives`, `puissance-tractions-rapides-nelson`, `mental-rituel-entre-essais`, `mental-bilan-a-vue`, `technique-lecture-a-vue`, `echauffement-dynamique-vagy`.

**Séance dure sans exercice connu : ce que fait chaque règle** (consolidation 23/11, décision F7). Version solo `sansContenuConnu` et `durete === 'dure'` (par exemple une séance simple écrite à la main sans exercice principal). Elle compte comme une **séance dure ordinaire** :

| Règle | Pour cette séance |
|---|---|
| `marqueursVersion`, `estMaximale`, `estPoutreIntensive` | aucun marqueur ; ni maximale, ni poutre intensive |
| `estDure` | vrai (dureté déclarée) |
| **W-01** 48 h | muette. La règle des 48 h s'applique à elle comme à toute séance dure : elle ne vise que les séances maximales et de poutre intensive (A3-1, A.3.8) |
| **W-06** jours de doigts | inchangée : un jour de doigts, sauf qualité `mobilite` ou `antagonistes` (`seanceSolliciteDoigts`) |
| **W-08** séances dures, **W-09** et **W-10** charge | comptée, comme toute séance dure (effort prévu 7 × somme des parties) |
| **W-12** efforts max en semaine allégée | pas comptée parmi les séances maximales |
| **W-13** entretien | inchangée : elle entretient sa qualité dominante `s.qualite` |
| **S-05**, **J-01**, **J-03**, **J-07** | s'appliquent, comme à toute séance dure (`estDure`) |
| **J-02** sommeil, **J-04** récupération | muettes pour elle : ni séance maximale du jour, ni dernière séance maximale réalisée (sa séance réalisée n'a pas de marqueur, C-01) |
| **S-21** solo et groupe | peut signaler une différence si la version groupe porte un marqueur à quota : c'est voulu, la version solo n'en déclare aucun |
| **S-26** | information (B.5) : propose de choisir l'exercice principal |
| **P-15** | inchangée : la séance est comptée parmi celles sans étapes |

## B.3 Sortie

```ts
interface Avertissement {
  code: string                         // "W-01"
  niveau: 'information' | 'fort'
  message: string                      // déjà rempli, prêt à afficher
  portee: 'plan' | 'semaine' | 'seance' | 'etape' | 'jour'
  seanceId?: string
  version?: 'solo' | 'groupe'
  etapeIndex?: number
  lundi?: Jour
  mesocycleOrdre?: number
  sujet?: string                       // (consolidation 23/11) ce que vise l'alerte quand une vérification en émet plusieurs pour la même cible (tableau ci-dessous)
  source: string                       // texte court affichable : « Hörst, López (synthèse) »
}
```

- Tri : `fort` avant `information`, puis par date, puis par code.
- Pas de doublon : un même `code` pour la même cible (`seanceId`, `version`, `etapeIndex`, `lundi`, `mesocycleOrdre`, `sujet`) n'apparaît qu'une fois. (consolidation 23/11) `sujet` s'ajoute à la cible : sans lui, deux objectifs oubliés la même semaine donnaient deux W-18 de même cible, et le dédoublonnage en gardait un seul. Seules ces vérifications le remplissent :

| Code | Plusieurs alertes pour la même cible | `sujet` |
|---|---|---|
| S-22 | une par objectif de groupe sans plafond, même version | rang de l'objectif dans `objectifs`, en texte (`'0'`, `'1'`, `'2'`) : l'objectif de groupe n'a pas d'identifiant |
| W-05 | une par fiche au-delà de son plafond, même semaine | `f.id` |
| W-18 | une par objectif spécifique du bloc, même semaine | identifiant de l'objectif (`o.id`) |
| P-11 | une par paire d'objectifs, même phase | `idA + '+' + idB`, dans l'ordre de `objectifsPersoIds` |
| P-12 | une par objectif, même phase | identifiant de l'objectif |
| S-01 à S-04, S-06 à S-09, S-18, S-19, S-27 (consolidation 24/11) | une par principal hors étapes, même séance (portée `seance`, version `solo`, sans `etapeIndex`) | identifiant de la fiche (`ficheId`) |

Les autres vérifications émettent au plus une alerte par cible, déjà distinguée par ses champs (vérifié sur le code livré le 24/11) : par étape, avec `etapeIndex` (S-01 à S-04, S-06 à S-13, S-15, S-18, S-19, S-24, S-25, W-11 ; consolidation 24/11 : sauf sur un principal hors étapes, ligne ci-dessus) ; par version ou par séance (S-05, S-14, S-16, S-17, S-20, S-21, S-23, S-26, W-01, W-17, W-19, P-08) ; par semaine (W-02 à W-04, W-06 à W-10, W-12 à W-16, W-20) ; par phase ou suite de semaines (P-02 à P-04, P-06, P-09, P-10) ; une fois par plan ou par jour (P-01, P-05, P-07, P-13 à P-15, J-01 à J-07 ; J-05 cite la plus ancienne douleur). Une vérification future qui émet plusieurs alertes pour la même cible remplit `sujet`.
- (consolidation 23/11) La clé « Je garde ce choix » (`cleAvertissement`, C-01) ajoute `|{sujet}` à la fin, **seulement s'il est présent** : les clés sans `sujet` ne changent pas, et garder le W-18 d'un objectif ne replie pas celui d'un autre.
- Les étapes dont la fiche est inconnue ne déclenchent que `S-01` ; les autres vérifications les ignorent.
- Les deux niveaux : **information** (« à savoir, c'est peut-être voulu ») et **fort** (« risque pour ton corps ou plan incohérent : change-le, sauf raison précise »). Aucun des deux n'empêche d'enregistrer.

## B.4 Points d'entrée

```ts
verifierSeance(s: SeanceVerif, ctx: ContexteVerif, origine?: 'utilisateur' | 'assistant'): Avertissement[]
  // S-01 à S-27 sur chaque version présente (S-26 : consolidation 18/11 ; S-27 : consolidation 24/11)
verifierSemaine(lundi: Jour, plan: PlanVerif, ctx: ContexteVerif): Avertissement[]
  // W-02 à W-20 sur cette semaine (W-01 se calcule sur toute la frise, voir plus bas ; W-20 : consolidation 23/11)
verifierPlan(plan: PlanVerif, ctx: ContexteVerif): Avertissement[]
  // toutes les séances, W-01 sur toute la frise, toutes les semaines, P-01 à P-14
verifierJour(seanceDuJour: SeanceVerif, ctx: ContexteVerif, realisees: SeanceVerif[]): Avertissement[]
  // J-01 à J-07, plus S-04 et S-05 sur la séance du jour
```

---

## B.5 Vérifications d'une séance (S)

(consolidation 18/11) **Selon le contenu** : quand `etapesDetaillees === false` (étapes résumées d'une séance simple ou en grandes lignes sans étapes), S-10 à S-14, S-16, S-24 et S-25 ne s'appliquent pas (l'ordre réel n'est pas connu ; P-15 le dit, et le téléphone affiche des rappels). **S-15** ne s'applique que si `niveau` est absent ou vaut `'detaille'`. Les autres vérifications s'appliquent à toutes les étapes, réelles ou résumées.

(consolidation 24/11) **Principaux hors étapes** (`v.principauxHorsEtapes`, solo seulement ; `niveaux-de-detail.md` § 3.4) : S-01 à S-04, S-06 à S-09, S-18 et S-19 s'appliquent à chacun comme à une étape, mêmes conditions et mêmes messages, avec une alerte de portée `seance`, version `solo`, sans `etapeIndex`, `sujet` = identifiant de la fiche (B.3). S-17 et S-21 le voient par `marqueursVersion`. Les contrôles d'ordre (S-10 à S-14, S-16, S-24, S-25) et S-15 ne lisent que `v.etapes` : un principal hors étapes n'a pas de place dans le déroulé. S-27 le signale.

Chaque vérification s'applique à **chaque version** présente (`solo`, puis `groupe`), sauf mention contraire. Dans la version groupe, les « étapes » sont celles du mini-bloc. `f` désigne `ctx.fiches[e.ficheId]`. `{nom}` est `f.nom`.

| Code | Condition | Niveau | Message | Source |
|---|---|---|---|---|
| **S-01** Fiche inconnue | `ctx.fiches[e.ficheId]` absent | fort | Cet exercice n'existe pas dans ta bibliothèque ({ficheId}). Remplace-le ou supprime l'étape. | [CDC] (intégrité ; protège contre une invention de l'assistant) |
| **S-02** Fiche encore à vérifier | `f.exclureDeLaGeneration` défini. Niveau **fort** si `origine === 'assistant'`, **information** sinon | voir condition | Assistant : L'assistant a proposé « {nom} », qui n'est pas encore prête : {raison}. Remplace-la. — Utilisateur : « {nom} » a un réglage encore à vérifier : {raison}. Garde-la seulement si tu sais la régler. | [AUD I-2, I-9, I-10] |
| **S-03** Prérequis non remplis | Un des tests ci-dessous est vrai (une seule alerte par fiche, qui liste tous les manques) : `anneesPratiqueMin` : `profil.anneesPratique < v` ; `experiencePoutreMin` : `rang(profil.experiencePoutre) < rang(v)` avec aucune 0, occasionnelle 1, reguliere 2 ; `tractionsStrictesMin` : `profil.tractionsStrictesMax === null OU < v` ; `test15sSur25mm` : `profil.test15sSur25mm !== true` ; `niveauBlocMin` : `profil.niveauBloc === null OU index(COTATIONS_BLOC, niveauBloc) < index(COTATIONS_BLOC, v)` ; `adulte` : `profil.adulte !== true` | fort | « {nom} » demande : {manques}. Choisis une fiche plus accessible, ou complète ton profil si c'est déjà le cas. — Manques, séparés par « ; » : « {v} ans de pratique (tu en as {x}) » ; « une expérience de poutre {occasionnelle\|régulière} » ; « {v} tractions strictes (tu en fais {x})» ou « {v} tractions strictes (non renseigné) » ; « tenir 15 s sur une réglette de 25 mm » ; « un niveau {v} en bloc » ; « 18 ans ou plus » | [AUD B-1, B-3], [SYN] (López, Hörst, BMC, Lattice) |
| **S-04** Douleur déclarée | `f.contreIndications ∩ zonesDouloureuses(ctx, s.date) ≠ ∅` | fort | Tu as signalé une douleur ({zone}). « {nom} » la sollicite : remplace-la par un exercice qui ne fait pas mal, ou retire-la. | [MOD], [SYN] (réduction ciblée) |
| **S-05** Signe d'alerte non résolu | `∃ d ∈ ctx.douleurs : d.niveau === 'alerte' ET d ouverte au s.date ET d.date ≤ s.date ET estDure(s)` (une alerte par séance) | fort | Tu as signalé un signe d'alerte ({signes}). Pas de séance dure avant d'avoir consulté un médecin ou un kiné qui connaît l'escalade. | [SYN] (arrêt immédiat et consultation) |
| **S-06** Effort à risque pendant une douleur | `∃ d : d.niveau === 'reduction' ET d ouverte au s.date ET 0 ≤ joursEntre(d.date, s.date) ≤ 14 ET marqueursDe(f) ∩ MARQUEURS_RISQUE_DOULEUR ≠ ∅` | fort | Tu as une douleur en cours. Pendant 1 à 2 semaines, retire « {nom} » : pas d'arqué, de pan, de trous ni d'effort maximal. Garde de la grimpe facile qui ne fait pas mal. | [SYN] |
| **S-07** Grimpe en tête exigée | `f.contexte?.grimpeEnTete === true ET profil.grimpeEnTete !== true` | fort | « {nom} » demande de savoir grimper et tomber en tête, avec un assureur formé à l'assurage dynamique. Fais-toi d'abord former. | [SYN], [AUD I-13] |
| **S-08** Partenaire nécessaire | `f.contexte?.partenaire === true` et S-07 non émis pour cette étape | information | « {nom} » se fait avec un partenaire (assureur ou observateur). Prévois-le. | [AUD I-13] |
| **S-09** Fiche en voie pour un bloqueur | `f.contexte?.terrain === 'voie' ET profil.disciplinePrincipale === 'bloc'` | information | « {nom} » se fait en voie. Vérifie que ta salle en a. | [AUD I-13] |
| **S-10** Pas d'échauffement | Solo seulement : `i` = index de la première étape `estNerveuse` ; aucune étape d'index `< i` n'a `qualite === 'echauffement'`. En groupe, l'échauffement se fait en commun avant le mini-bloc et les objectifs : l'écran de séance le rappelle toujours, le moteur ne le vérifie pas | fort | Ajoute un échauffement avant « {nom} » : 20 à 30 min de grimpe de plus en plus dure. | [VER 6], [SYN] |
| **S-11** Pas d'échauffement des doigts | Étape `i` avec `'poutre_intensive'` ; aucune étape d'index `< i` n'a `ficheId === 'echauffement-doigts-poutre'` | information | Avant « {nom} », fais 3 à 8 suspensions progressives (fiche Échauffement des doigts) : la dernière te donne la charge du jour. | [SYN] (López) |
| **S-12** Effort maximal après un travail congestionnant | `∃ i < j : estCongestionnante(etapes[i]) ET estNerveuse(fiche j)` (une alerte par étape `j`) | fort | « {nom j} » vient après « {nom i} » : les efforts maximaux se font frais. Place-le avant, ou dans une autre séance. | [SYN] (« à séparer : force maximale et résistance congestionnante ; poutre maximale après un gros volume ») |
| **S-13** Pan ou bloc sans pieds trop tard | Étape `j` avec `'pan_gullich'` ou `ficheId === 'puissance-bloc-sans-pieds'` ; `∃ i < j` avec `estNerveuse(fiche i)` | fort | « {nom} » se fait en début de séance, jamais fatigué : place-le juste après l'échauffement. | [SYN] (BMC ; Anderson), fiches `puissance-pan-gullich-initiation` et `puissance-bloc-sans-pieds` |
| **S-14** Deux protocoles de suspensions max | Nombre d'étapes dont la fiche porte `'maximale'` et `'poutre_intensive'` `≥ 2` | information | Deux protocoles de suspensions maximales dans la même séance : garde-en un, ou réduis le volume de chacun de 25 à 30 %. | [SYN] (López : −25 à 30 % ; Hörst : pas le 7-53 avec le 10 s lesté) |
| **S-15** Repos trop court entre efforts max | Étape avec `'maximale'` ; `repos = e.reglages?.reposS ?? f.reposEntreEffortsS` ; si `repos` défini ET `repos < regles.reposEffortMaxS` ET NON (`f.origine === 'bibliotheque'` ET `repos ≥ f.reposEntreEffortsS`) | fort | {repos} s de repos entre deux efforts maximaux dans « {nom} » : prends au moins 3 min. | [SYN] (3 à 5 min), [MOD]. Exception pour les protocoles conçus ainsi (7-53 : 53 s) : [AUD I-11] |
| **S-16** Bloc nerveux trop long | `Σ dureeEtape` des étapes `estNerveuse` `> regles.dureeBlocNerveuxMaxMin` | information | {total} min d'efforts maximaux dans cette séance : le repère est de 30 à 60 min. Raccourcis, ou répartis sur deux séances. | [SYN] (gabarit de séance) |
| **S-17** Séance légère qui contient un effort maximal | `v.durete === 'legere' ET marqueursVersion(v) ∩ MARQUEURS_NERVEUX ≠ ∅` | information | Cette séance est notée légère mais contient un effort maximal. Passe-la en dure : la récupération sera comptée de toute façon. | [CDC] |
| **S-18** Bidoigts sous forte charge | `'bidoigts' ∈ marqueursDe(f) ET ('maximale' ∈ marqueursDe(f) OU 'poutre_intensive' ∈ marqueursDe(f))` | fort | Les bidoigts se travaillent à faible charge seulement. Retire le lest ou l'intensité maximale de « {nom} ». | [SYN] (lombricaux) |
| **S-19** Exercice perso non qualifié | `f.origine === 'perso' ET f.marqueurs === null` | information | Pour « {nom} », dis si c'est un effort maximal, sur poutre ou en bloc limite : sinon les règles de récupération ne le comptent pas. | [CDC] |
| **S-20** Nombre d'objectifs de groupe | Groupe seulement : `objectifs.length < 1 OU > 3` | information | Une séance en groupe tient en 1 à 3 objectifs. Tu en as {n}. | [MOD], [PLAN] |
| **S-21** Solo et groupe d'intensité différente | Séance avec groupe : `(marqueursVersion(solo) ∩ MARQUEURS_QUOTA) ≠ (marqueursVersion(groupe) ∩ MARQUEURS_QUOTA)` OU `solo.durete ≠ groupe.durete` (une alerte par séance, portée séance) | information | Les versions solo et groupe de « {seance} » n'ont pas la même intensité ({différence}). Aligne-les pour que la semaine reste équilibrée quel que soit ton choix. | [CDC] (A6-1, A6-2) |
| **S-22** Objectif à la limite sans plafond | Objectif `o` avec `o.marqueurs ∩ {maximale, bloc_limite} ≠ ∅` ET (`o.blocs` absent OU `o.essaisMaxParBloc` absent) | information | Fixe un nombre de blocs et d'essais pour « {libelle} » : un objectif à la limite sans plafond pousse à trop en faire. | [CDC] (A6-4) |
| **S-23** Version groupe hors qualité | Groupe seulement, une fois par séance : `s.qualite ∈ QUALITES_PHYSIQUES` ET aucun objectif n'a `s.qualite` dans `accents` ET aucune étape du mini-bloc n'a `f.qualite === s.qualite`. (Un objectif complémentaire d'une autre qualité est normal, comme une étape complémentaire en solo) | information | La version groupe de « {seance} » ne travaille pas sa qualité dominante ({qualite}). Ajoute un objectif qui la travaille. | [MOD] (`ObjectifGroupe.accents`), [CDC] (A6-1) |
| **S-24** Module hors format | Étape avec `moduleObjectifId` ET (`dureeEtape < 10 OU > 15`) | information | Le module « {nom} » dure {d} min : un objectif spécifique tient en 10 à 15 min. | [PLAN], [MOD] |
| **S-25** Module intense un jour léger | Étape avec `moduleObjectifId` ET `estNerveuse(f)` ET `v.durete === 'legere'` | information | Le module « {nom} » est un effort intense : place-le en début de séance dure, juste après l'échauffement. | [SYN] (intense à frais), [CDC] (A7-5) |
| **S-26** Séance dure sans exercice connu (consolidation 18/11 ; message : consolidation 23/11, F7) | Solo seulement : `sansContenuConnu(v)` ET `v.durete === 'dure'` | information | « {seance} » est notée dure, sans exercice de la bibliothèque : l'app la compte comme une séance dure ordinaire. Si tu y fais de la poutre ou du bloc à ta limite, choisis son exercice principal : la règle des 48 h et les quotas en tiendront compte. | [CDC] ; décision F7 d'Arthur |
| **S-27** Exercice des grandes lignes absent des étapes (consolidation 24/11) | Solo seulement : pour chaque `id` de `v.principauxHorsEtapes` dont la fiche est connue (une fiche inconnue ne donne que S-01). Portée `seance`, version `solo`, `sujet` = `id` | information | « {nom} » est dans les grandes lignes de « {seance} », pas dans ses étapes. L'app vérifie ses prérequis, tes douleurs et la récupération, mais pas sa place dans la séance. Mets-les d'accord : ajoute cet exercice aux étapes, ou recalcule les grandes lignes. | [CDC] (`niveaux-de-detail.md` § 3.4) |

## B.6 Vérifications d'une semaine (W)

« Les séances de la semaine » = celles dont `lundiDe(date) === lundi`, prévues et réalisées. Les comptes se font en **séances**, pas en étapes, sauf mention contraire.

| Code | Condition | Niveau | Message | Source |
|---|---|---|---|---|
| **W-01** Moins de 48 h entre deux séances exigeantes | Sur **toute la frise** (les semaines se chevauchent : un dimanche et le lundi suivant). Trier les séances par date ; pour chaque paire de séances consécutives `a`, `b` telles que (`estMaximale(a)` ET `estMaximale(b)`) OU (`estPoutreIntensive(a)` ET `estPoutreIntensive(b)`) : si `a` et `b` sont toutes deux réalisées, `écart = heures(début de b − a.realisee.finLe)` avec début de b = `b.realisee.finLe − b.realisee.dureeMin` ; écart trop court si `< regles.heuresEntreSeancesMax`. Sinon, trop court si `joursEntre(a.date, b.date) < 2`. Une alerte, portée séance `b` | fort | « {b} » ({jour b}) arrive moins de 48 h après « {a} » ({jour a}) : deux séances {maximales \| de poutre intensive}. Décale-la d'un jour ou fais sa version légère. | [SYN] (48 h ; jamais deux jours de suite ; López : 48 h sur une même prise), [MOD] |
| **W-02** Quota poutre intensive | `nb séances avec estPoutreIntensive > regles.poutreIntensiveParSemaine` | fort | {n} séances de poutre intensive cette semaine : {max} au plus. Allège ou déplace la dernière. | [SYN], [PLAN] |
| **W-03** Quota bloc limite | `nb séances avec 'bloc_limite' ∈ marqueursSeance > regles.blocLimiteParSemaine` | fort | {n} séances de bloc limite cette semaine : {max} au plus. Remplace la dernière par du volume ou des intervalles plus faciles. | [SYN], [PLAN] |
| **W-04** Poutre, tous types | `nb séances avec 'poutre' ∈ marqueursSeance > regles.poutreParSemaine` | fort | {n} séances avec poutre cette semaine : 3 au plus, tous exercices confondus. | [AUD I-8] |
| **W-05** Plafond d'une fiche | Pour chaque fiche `f` avec `maxParSemaine` : `nb séances contenant f > f.maxParSemaine` (consolidation 24/11 : « contenant » = dans une étape ou parmi les principaux hors étapes). Niveau **fort** si `marqueursDe(f) ∩ MARQUEURS_QUOTA ≠ ∅`, **information** sinon | voir condition | « {nom} » est prévue {n} fois cette semaine ; sa fiche conseille {max} fois au plus. | Fiches de la bibliothèque |
| **W-06** Trop de jours de doigts | `nb de dates distinctes portant au moins une séance avec seanceSolliciteDoigts > regles.joursDoigtsMaxParSemaine` | fort | Tu sollicites tes doigts {n} jours cette semaine : 4 au plus, et au moins 3 jours de repos des doigts. Remplace une séance par de la mobilité ou du gainage au sol. | [VER 9] (Hörst) |
| **W-07** Plus de séances que choisi | `nb séances > plan.seancesParSemaine` | information | {n} séances prévues pour {m} choisies : ton plan est plus chargé que prévu. Retire-en une ou change ton nombre de séances. | [CDC] |
| **W-08** Trop de séances dures | `nb séances avec estDure > nbDuresMax(plan.seancesParSemaine)` | fort | {n} séances dures cette semaine : avec {m} séances par semaine, garde-en {max} au plus et rends les autres légères. | [SYN] (semaines types), [CDC] (A.3.8) |
| **W-09** Charge en forte hausse | Semaine `k` de type `charge` ; `k'` = dernière semaine de type `charge` avant `k` dans le plan ; `chargeSemaine(k) > chargeSemaine(k') × (1 + regles.hausseChargeMaxPct / 100)` | information | La charge prévue monte de {p} % par rapport à ta dernière semaine de charge. Le repère prudent est {max} % au plus. | [SYN] (FFME, repère non validé) |
| **W-10** Semaine allégée oubliée ou trop chargée | Semaine de type `decharge`, `regles.dechargeActive` ; `moy` = moyenne de `chargeSemaine` des semaines `charge` du même bloc ; `r = semaine.reductionPct ?? regles.dechargeReductionPct` ; `cible = moy × (1 − r/100)`. **Fort** si `charge ≥ moy × regles.seuilDechargeOublieePct / 100`. Sinon **information** si `charge > cible + moy × regles.toleranceDechargePts / 100` | voir condition | Fort : Ta semaine allégée est presque aussi chargée qu'une semaine normale. Divise les séries par deux et vise environ {cible} unités. — Information : Ta semaine allégée reste un peu chargée : vise environ {cible} unités ({r} % de moins que tes semaines de charge). | [SYN] (Lattice : 40 à 60 %), [MOD] ; seuils 90 % et 10 points : [CDC] |
| **W-11** Exercice nouveau en semaine allégée ou d'affûtage | Semaine `decharge` (ou `affutage`) ; fiche présente cette semaine et absente de toutes les semaines `charge` du même bloc (pour l'affûtage : du bloc qui le contient et du précédent) | information | « {nom} » n'apparaît pas dans tes semaines de charge : en semaine {allégée \| d'affûtage}, garde des exercices connus. | [SYN] (Lattice : aucun exercice nouveau) |
| **W-12** Plus d'efforts max en semaine allégée qu'en charge | Semaine `decharge` ; `n` = nb séances avec `estMaximale` cette semaine ; `m` = même nombre dans la dernière semaine `charge` du même bloc ; `n > m` | information | Ta semaine allégée compte plus de séances maximales ({n}) que ta dernière semaine de charge ({m}) : garde-en {m} au plus. | [SYN] (Lattice : quelques efforts intenses conservés), [CDC] (A4-4) |
| **W-13** Qualité non entretenue | Semaine `charge` ; liste des `q ∈ QUALITES_PHYSIQUES` telles qu'aucune étape de version solo (ni du mini-bloc groupe) n'a `f.qualite === q`, et qu'aucun objectif de groupe n'a `q` dans `accents`. (consolidation 18/11) Une séance dont la version solo est `sansContenuConnu` entretient sa qualité dominante `s.qualite`. Exception : pour `profil.disciplinePrincipale === 'bloc'`, `resistance` est aussi entretenue par une étape `endurance-1-on-1-off`. Une alerte si la liste n'est pas vide | information | Cette semaine ne contient rien pour : {liste}. Ajoute une étape courte pour {l' \| les }entretenir (consolidation 23/11 : élision) (10 à 20 min suffisent). | [PLAN], [SYN] (toutes les qualités entretenues ; bloqueur : « un bloc d'endurance ciblé, Boulder Triples ou 1 on / 1 off ») |
| **W-14** Accent du bloc absent ou minoritaire | Semaine `charge` ; `n(q)` = nombre de séances de la semaine dont la qualité dominante `s.qualite === q` ; `a` = accent du bloc. Si `n(a) = 0` → message 1 ; sinon s'il existe `q ∈ QUALITES_PHYSIQUES, q ≠ a, n(q) > n(a)` → message 2. Compter en séances et non en minutes : une poutre maximale dure 7 min, un bloc limite 40 | information | 1 : Cette phase met en avant {a}, mais aucune séance de la semaine n'a cette qualité. — 2 : Plus de séances {q} que de séances {a}, l'accent de cette phase. C'est voulu ? (consolidation 17/11) | [PLAN] (accent tournant), [CDC] |
| **W-15** Poutre et ancienneté | `cap = capPoutreAnciennete(profil.anneesPratique)` ; `nb séances avec 'poutre' > cap` | information | cap = 0 : Moins d'un an de pratique : la grimpe suffit, la poutre viendra après un an sans blessure. — Sinon : Avec {a} ans de pratique, Bechtel conseille {cap} séance{s} de poutre par semaine au plus. Tu en prévois {n}. | [SYN] (Bechtel ; coachs Lattice) |
| **W-16** Antagonistes insuffisants | Semaine `charge` ; nb d'étapes de qualité `antagonistes` `< 2` | information | {Aucune séance \| Une seule séance} d'antagonistes cette semaine : 2 courtes séances après la grimpe protègent épaules et coudes. | [VER 5] |
| **W-17** Antagonistes un jour sans grimpe | Séance qui contient une étape `antagonistes` et dont aucune étape n'a `solliciteDoigts` | information | Fais les antagonistes après une séance de grimpe, pas un jour de repos. | [VER 5] |
| **W-18** Module d'objectif spécifique oublié ou trop fréquent | Semaine `charge` ; pour chaque objectif `o` du bloc : `n` = nb d'étapes avec `moduleObjectifId === o.id` ; `n = 0` ou `n > 2` | information | Le module « {nom} » est prévu {n} fois cette semaine : 1 à 2 fois par semaine. | [PLAN], [MOD] |
| **W-19** Suspensions légères trop proches d'une autre séance | Une étape `doigts-abrahangs` dans une séance qui a d'autres étapes de grimpe ou de poutre, ou une séance contenant `doigts-abrahangs` le même jour qu'une autre séance | information | Laisse au moins 6 h entre les suspensions légères pieds au sol et toute autre séance. | [SYN] (Gilmore et al.), fiche `doigts-abrahangs` |
| **W-20** Résistance en voie au-delà du plafond (consolidation 23/11) | `max = RESISTANCE_VOIE_PAR_SEMAINE[profil.disciplinePrincipale]` ; `n` = nb séances de la semaine avec `'resistance_voie' ∈ marqueursSeance(s)` ; `n > max`. Une alerte par semaine, portée semaine, avec `lundi` et sans `mesocycleOrdre` (comme W-02 à W-08) | fort | Profil bloc : {n} séances de résistance en voie cette semaine : 1 au plus avec un profil « bloc ». Garde-en une et fais le reste en bloc, ou change ton profil si ton objectif devient la voie. — Profil voie : {n} séances de résistance en voie cette semaine : 2 au plus. Remplace la dernière par de l'endurance ou de la technique. | Décision F2 d'Arthur, point 13 ; audit B21, I-8 (Lattice [VER 4] : 2 séances par semaine au plus ; Barrows : 1,5 à 2) |

**W-20 : précisions** (consolidation 23/11)
- **Ce qui compte.** Les séances qui portent le marqueur `resistance_voie` (aujourd'hui `resistance-capacity-power`, `resistance-voies-repetees`, `resistance-circuits-30-mouvements`). Une séance compte une fois, même avec deux fiches de résistance en voie. La résistance en bloc ou sur poutre n'est pas comptée : la décision vise la voie, et W-13 et W-14 demandent de la résistance chaque semaine.
- **Séance prévue.** `marqueursSeance` porte les marqueurs de ses deux versions, par prudence (comme W-03 et W-04) : une séance dont seule la version groupe contient de la résistance en voie compte.
- **Séance réalisée.** Seuls `realisee.marqueurs` comptent : la version faite. Une séance réalisée hors plan compte aussi (C-01 la met dans `plan.seances`) ; une séance sautée n'y est pas. Une séance prévue puis faite est une seule `SeanceVerif` : rien n'est compté deux fois.
- **Semaine à cheval sur deux phases.** On compte par semaine du calendrier (`lundiDe(s.date) === lundi`), comme W-02 à W-08, quels que soient la phase, le type de semaine (charge, allégée, affûtage, transition) et l'accent. L'alerte porte `lundi` sans `mesocycleOrdre` : elle sort une seule fois. Une phase d'accent `resistance` ne relève pas le plafond.
- **Profil.** Seul `disciplinePrincipale` compte, au moment de la vérification, pour toutes les semaines du plan (le profil n'a pas d'historique). Les lieux ne changent pas le plafond : ils décident seulement si la fiche est proposée (G-01), et S-09 signale déjà une fiche en voie à un bloqueur.
- **Assureur.** « Toujours avec un assureur » est déjà couvert : les trois fiches ont `contexte.partenaire` (S-08, information, test de `bibliotheque.test.ts`). W-20 ne le répète pas.
- **Avec W-05.** La même fiche deux fois dans la semaine donne aussi W-05, en information (`resistance_voie` n'est pas dans `MARQUEURS_QUOTA`) : c'est voulu, l'une parle de la fiche, l'autre du total.
- **Pourquoi fort.** C'est un quota « au plus », comme W-02 à W-04, posé par Arthur ; et le test du générateur « aucun avertissement fort » (G-03) le fera respecter quand des séances types de résistance en voie entreront au catalogue.

## B.7 Vérifications du plan (P)

| Code | Condition | Niveau | Message | Source |
|---|---|---|---|---|
| **P-01** Format inhabituel | Mode `accent_tournant` et (`nbSemaines ≠ 12` OU `mesocycles.length ≠ 3` OU un bloc n'a pas 4 semaines) | information | Ton cycle s'écarte du format 12 semaines en 3 blocs de 4. C'est possible, mais les repères de l'app sont faits pour ce format. | [PLAN] |
| **P-02** Semaine allégée oubliée | `regles.dechargeActive` ; une suite de semaines consécutives de type `charge` de longueur `> 3` | fort | {n} semaines de charge d'affilée (semaines {a} à {b}) : place une semaine allégée après la troisième. | [SYN] (3 de charge, 1 de décharge), [PLAN] |
| **P-03** Deux blocs de force ou de puissance de suite | Deux blocs consécutifs avec le même accent `∈ {doigts, traction_gainage, puissance}` | information | Deux phases de suite sur {accent} : pour la force et la puissance, la BMC conseille 3 à 5 semaines. Change l'accent de la phase {k}. (consolidation 17/11) | [SYN] (BMC) |
| **P-04** Résistance trop longue | Suite de blocs consécutifs d'accent `resistance` totalisant `> 8` semaines | information | Plus de 8 semaines d'accent résistance : le travail lactique se limite à 3 à 8 semaines. | [SYN] (consensus minimal) |
| **P-05** Objectif daté sans affûtage | Mode `objectif_date` ; aucune semaine de type `affutage` dont le lundi est dans les 21 jours avant `objectif.date` | information | Ton objectif du {date} n'a pas de semaines d'affûtage. Prévois-en 2, avec 40 à 60 % de volume en moins. | [SYN] (Bosquet) |
| **P-06** Réduction hors plage | Semaine `decharge` ou `affutage` avec `reductionPct` défini hors `[40, 60]` | information | Réduction de {r} % en semaine {allégée \| d'affûtage} : le repère est de 40 à 60 %. | [SYN] |
| **P-07** Ordre des accents en objectif daté | Mode `objectif_date` et (un bloc `resistance` précède un bloc `puissance`, OU l'accent du dernier bloc n'est ni `puissance` ni `resistance`) | information | Pour un objectif daté, finis par la puissance puis la résistance (en voie), juste avant l'affûtage. | [SYN] (Lattice ; Bechtel) |
| **P-08** Poutre intensive juste avant l'objectif | Mode `objectif_date` ; séance avec `estPoutreIntensive` et `0 ≤ joursEntre(s.date, objectif.date) ≤ regles.joursSansPoutreAvantObjectif` | information | Pas de poutre intensive dans les 3 jours avant ton objectif : tes doigts doivent arriver frais. | [SYN] (Lattice), 3 jours : [CDC] |
| **P-09** Pas de test en fin de bloc | Active seulement si au moins une fiche a `estTest`. Bloc dont la dernière semaine ne contient aucune étape avec `estTest` | information | La phase {k} n'a pas de test en fin de semaine allégée. (consolidation 17/11) Ajoute au moins tes tractions strictes et un bloc repère pour voir tes progrès. | [SYN] |
| **P-10** Trop d'objectifs spécifiques | Bloc avec `objectifsPersoIds.length > 2` | information | {n} objectifs spécifiques sur cette phase : 2 au plus, pour qu'ils restent courts. (consolidation 17/11) | [PLAN], [MOD] |
| **P-11** Deux objectifs dans le même quota | Deux objectifs du même bloc partagent un marqueur de `MARQUEURS_QUOTA` | information | « {a} » et « {b} » comptent dans le même quota ({marqueur}). Garde-en un pour cette phase. (consolidation 17/11) | [MOD] |
| **P-12** Objectif spécifique inadapté | Pour un objectif du plan : prérequis non remplis (même logique que S-03) ou contre-indication dans `zonesDouloureuses(ctx, ctx.aujourdhui)` | fort | L'objectif « {nom} » ne te convient pas aujourd'hui : {raison}. {Essaie plutôt « {remplacementNom} ».} | [MOD] (`objectifsProposables`) |
| **P-13** Plan et profil en désaccord | `plan.seancesParSemaine ≠ profil.seancesParSemaine` | information | Ton plan compte {p} séances par semaine, ton profil {q}. Mets-les d'accord. | [CDC] |
| **P-15** Séances sans étapes (consolidation 18/11) | Au moins une séance du plan dont la version solo a `etapesDetaillees === false` ou `sansContenuConnu` ; une seule alerte, `{n}` = nombre de ces séances | information | {n} séances n'ont pas (au singulier : « 1 séance n'a pas », consolidation 23/11) d'étapes détaillées : l'app vérifie la récupération, les quotas et tes douleurs, mais pas l'ordre des exercices ni les repos. Ton téléphone te rappellera ces règles pendant la séance. | [CDC] |
| **P-14** Pas de transition avant le cycle suivant | `cycleSuivantDebut` défini et `joursEntre(fin du plan, cycleSuivantDebut) < 7` sans semaine de type `transition` en fin de plan | information | Le cycle suivant commence tout de suite : une semaine de transition, en grimpe libre, aide à récupérer. | [SYN] |

## B.8 Vérifications du jour (J)

Appliquées sur la séance prévue aujourd'hui, au moment de l'ouvrir sur le téléphone.

| Code | Condition | Niveau | Message | Source |
|---|---|---|---|---|
| **J-01** Deux voyants rouges | Forme du jour présente ; `itemsRouges(forme) ≥ 2` ; `estDure(s)` | information | Deux voyants sont au rouge ce matin. Fais plutôt la version légère, ou une séance technique. | [SYN], [MOD] |
| **J-02** Manque de sommeil | Au moins 3 formes des 3 derniers jours avec `heuresSommeil` ; moyenne `< regles.seuilSommeilH` ; `estMaximale(s)` | information | Moins de {seuil} h de sommeil en moyenne sur 3 nuits : transforme la séance maximale en séance technique ou de volume. | [SYN] (Walsh et al.) |
| **J-03** Douleur signalée ce matin | Forme du jour avec `douleur ≤ 2` ; `estDure(s)` | information | Tu signales une douleur ce matin. Allège la séance, et arrête si elle dépasse 2 sur 10 pendant l'effort. | [SYN] |
| **J-04** Récupération pas finie | `m` = dernière séance réalisée avec `estMaximale` ; `heures(ctx.maintenant − m.realisee.finLe) < regles.heuresEntreSeancesMax` ; `estMaximale(s)` | fort | Ta dernière séance maximale date de {h} h. Attends encore {reste} h, ou fais la version légère. | [SYN], [MOD] ; fonction existante `prochaineSeanceDurePossible` |
| **J-05** Douleur qui dure | Douleur `reduction` ouverte avec `joursEntre(d.date, aujourdhui) ≥ 14` | fort | Ta douleur ({zone}) dure depuis {n} jours. Consulte un médecin ou un kiné qui connaît l'escalade. | [SYN] |
| **J-06** Test en baisse avec fatigue | Pour un même test : dernier résultat moins bon que le précédent (selon `sensProgres`) ; et au moins 2 formes des 14 derniers jours avec `fatigue ≤ 2` | information | Ton test « {nom} » baisse et tu es fatigué : prends une semaine allégée avant de continuer. | [SYN] |
| **J-07** Peau abîmée | Dernière séance réalisée avec `peau === 1` et `joursEntre(sa date, aujourdhui) ≤ 1` ; `estDure(s)` | information | Ta peau était abîmée à la dernière séance. Si tes pulpes sont roses et brillantes, prends un jour de repos. | [SYN] (pratique de grimpeurs) |

## B.9 Contrôles propres aux brouillons de l'assistant (A)

Appliqués **avant** le moteur, par le validateur de réponses (voir `assistant-ia.md`, section D.5). Ils ne remplacent pas S, W et P : un brouillon valide passe ensuite par `verifierPlan`.

| Code | Condition | Conséquence | Message |
|---|---|---|---|
| **A-01** Réponse illisible | JSON invalide ou non conforme au schéma | Réponse non affichée ; une relance automatique avec l'erreur ; ensuite message d'échec | L'assistant n'a pas pu proposer de brouillon. Réessaie, ou reformule ta demande. |
| **A-02** Identifiant inventé | `ficheId` absent de la liste envoyée à l'assistant | Une relance avec la liste des identifiants inconnus ; ensuite étape affichée barrée avec S-01 | (S-01) |
| **A-03** Fiche exclue | `ficheId` d'une fiche avec `exclureDeLaGeneration` | S-02 niveau fort | (S-02) |
| **A-04** Dates incohérentes | `debut` qui n'est pas un lundi, séance hors des dates du plan, semaine sans numéro | Réponse non affichée ; une relance | L'assistant a proposé des dates incohérentes. Réessaie. |
| **A-05** Livre cité avec un contenu | Source de type `livre` avec une page, un numéro d'exercice ou une citation | Le champ en trop est retiré ; information | Les livres sont cités par leur titre seulement. |
| **A-06** Source inconnue | Source de type `livre` dont le titre n'est pas un des trois titres autorisés | Source retirée ; information | Une source citée par l'assistant n'est pas reconnue : elle a été retirée. |
| **A-07** Contenu interdit | Texte de la réponse qui parle de perte de poids, de poids cible, de régime ou de calories à réduire (liste de motifs dans `assistant-ia.md`, D.5) | Texte remplacé par le message standard | Je ne donne pas de conseils de perte de poids. Pour progresser, mange assez, surtout les jours durs : je peux t'expliquer les repères d'assiette. |

---

## B.10 Décompte

| Groupe | Nombre | Codes |
|---|---|---|
| Séance | 27 | S-01 à S-27 (S-26 : consolidation 18/11 ; S-27 : consolidation 24/11) |
| Semaine | 20 | W-01 à W-20 (W-20 : consolidation 23/11) |
| Plan | 15 | P-01 à P-15 (P-15 : consolidation 18/11) |
| Jour | 7 | J-01 à J-07 |
| Brouillon de l'assistant | 7 | A-01 à A-07 |
| **Total** | **76** | dont 69 dans le moteur (S, W, P, J) et 7 dans le validateur de l'assistant |

Niveau fort : S-01, S-02 (assistant), S-03 à S-07, S-10, S-12, S-13, S-15, S-18, W-01 à W-04, W-05 (fiches à quota), W-06, W-08, W-10 (oubliée), W-20, P-02, P-12, J-04, J-05.

## B.11 Cas chiffrés de référence

Ces cas servent de tests d'intégration (tâche E-07). Profil par défaut : bloc, 7A, 4 ans de pratique, poutre `occasionnelle`, `test15sSur25mm: true`, 12 tractions strictes, adulte, `grimpeEnTete: false`, aucune douleur, 3 séances par semaine. Règles par défaut.

1. **Semaine conforme** (lundi 2026-11-23, semaine `charge`, bloc d'accent `doigts`) : mardi 24 `Doigts : réglette minimale + bloc limite` (ST-DOI-02 de `seances-types.md`), jeudi 26 `Traction : bloc limite + tractions lestées` (ST-TRA-02), samedi 28 `Endurance : 1 min / 1 min` (ST-END-02, légère). Attendu, avec `verifierSemaine` et `verifierSeance` sur chaque séance (pas `verifierPlan`, qui signalerait un plan d'une seule semaine) : aucun avertissement, ni fort ni information.
2. **Deux maximales de suite** : mêmes séances, mais ST-TRA-02 déplacée au mercredi 25. Attendu : `W-01` fort sur la séance du 25.
3. **Frontière de semaine** : séance maximale le dimanche 2026-11-29 et le lundi 2026-11-30. Attendu : `W-01` fort sur celle du 30.
4. **Quota poutre intensive** : poutre intensive le lundi, le mercredi et le vendredi. Attendu : `W-02` fort (3 > 2) ; `W-01` muet (écarts de 2 jours).
5. **Prérequis** : profil avec `tractionsStrictesMax: null`, fiche `traction-lestee-force-lattice`. Attendu : `S-03` fort, message contenant « 10 tractions strictes (non renseigné) ».
6. **Douleur** : `douleursEnCours: ['doigts']`, fiche `puissance-bloc-limite`. Attendu : `S-04` fort.
7. **Semaine allégée** : semaines de charge à 1 500, 1 600, 1 700 (moyenne 1 600, réduction 50 %, cible 800). Semaine allégée à 1 500 → `W-10` fort (≥ 1 440). À 1 000 → `W-10` information (> 960). À 950 → rien.
8. **Allégée oubliée** : bloc de 4 semaines toutes `charge`. Attendu : `P-02` fort.
9. **Hausse de charge** : semaine 1 à 1 500, semaine 2 à 1 700. Attendu : `W-09` information (+13 %). Semaine 2 à 1 640 : rien (+9 %).
10. **Repos raccourci** : étape `doigts-suspensions-max-lestees` avec `reglages.reposS: 120`. Attendu : `S-15` fort. Étape `doigts-7-53-horst` sans réglage (53 s) : rien. Même étape avec `reglages.reposS: 40` : `S-15` fort.
11. **Ordre** : `resistance-boulder-triples` puis `puissance-bloc-limite` dans la même séance. Attendu : `S-12` fort.
12. **Assistant** : plan d'origine `assistant` contenant `puissance-pan-gullich-stien`. Attendu : `S-02` fort (et `S-03` fort pour ce profil, poutre non régulière).

**Cas ajoutés (consolidation 18/11, niveaux de détail)**

13. **Même semaine au niveau simple** : le cas 1 avec `niveau: 'simple'` sur chaque version solo (étapes gardées). Attendu : aucun avertissement, comme au cas 1.
14. **Séance dure sans contenu** (attendu mis à jour : consolidation 23/11, F7) : le cas 1, mais la séance du jeudi 26 est remplacée par une séance le mercredi 25 : qualité `traction_gainage`, version solo dure, `etapes: []`, `dureeMin: 90`, sans version groupe. Attendu : `S-26` information sur la séance du 25, et rien d'autre. Pas de `W-01` : c'est une séance dure ordinaire, pas maximale. Pas de `W-13` : elle entretient sa qualité dominante. Pas de `W-06` : 3 jours de doigts (le 25 compris, par prudence). Pas de `W-08` : 2 séances dures pour 3 au plus.
15. **Même séance avec un exercice principal** : la séance du 25 a une étape résumée `traction-simple-4x5` (`etapesDetaillees: false`, `dureeMin: 90`). Attendu : ni `W-01` ni `S-26` ; `S-10` muet (l'ordre n'est pas connu). (consolidation 23/11, F7) Variante : même forme, avec `traction-lestee-force-lattice` (marqueur `maximale`) comme exercice principal. Attendu : `W-01` fort sur la séance du 25 (deux séances maximales de suite, le 24 et le 25) ; `S-26` et `S-10` muets. C'est ce que propose S-26 : choisir l'exercice principal pour que la règle des 48 h le compte.
16. **Repos raccourci selon le niveau** : le cas 10 (`doigts-suspensions-max-lestees`, `reglages.reposS: 120`) avec `niveau: 'grandes_lignes'`. Attendu : `S-15` muet. Avec `niveau: 'detaille'` : `S-15` fort.

**Cas ajoutés (consolidation 23/11, W-20 et unicité)**

17. **Résistance en voie** (W-20) : profil par défaut (bloc). Semaine `charge` du lundi 2026-11-23 : mardi 24 une séance de qualité `resistance` avec `resistance-voies-repetees`, jeudi 26 une autre avec `resistance-circuits-30-mouvements` (dures, sans version groupe). Attendu, avec `verifierSemaine` (on ne regarde ici que W-05 et W-20) : `W-20` fort, message « 2 séances de résistance en voie cette semaine : 1 au plus avec un profil « bloc ». Garde-en une et fais le reste en bloc, ou change ton profil si ton objectif devient la voie. » ; `W-05` muet (chaque fiche une fois). Variantes :
    - (a) `disciplinePrincipale: 'voie'` → `W-20` muet. Plus une séance `resistance-capacity-power` le samedi 28 → `W-20` fort, message « 3 séances de résistance en voie cette semaine : 2 au plus. Remplace la dernière par de l'endurance ou de la technique. »
    - (b) Profil bloc ; la séance du 26 a une version solo `resistance-boulder-triples` (sans marqueur) et le circuit seulement dans le mini-bloc de sa version groupe. Prévue → `W-20` fort (une séance prévue compte ses deux versions). Réalisée en solo, `realisee.marqueurs: []` → `W-20` muet (seule la version faite compte).
    - (c) Profil bloc ; les deux séances le dimanche 29 et le lundi 30 : deux semaines du calendrier, même si le 30 ouvre une autre phase → `W-20` muet.
18. **Deux alertes du même code pour la même cible** (unicité, B.3) : le cas 1, avec deux objectifs spécifiques `o1` et `o2` sur la phase 1 et aucun module dans la semaine. Attendu, avec `verifierSemaine` : **deux** `W-18` information, `sujet` `'o1'` et `'o2'`, chacun avec le nom de son objectif ; les deux restent après le dédoublonnage, et leurs `cleAvertissement` diffèrent. Variante, sans objectifs : `antagonistes-legers` du samedi remplacée par `antagonistes-lattice`, et `mobilite-grand-ecart-lattice` ajoutée en fin des trois séances → **deux** `W-05` information (3 fois pour un plafond de 2), `sujet` `'antagonistes-lattice'` et `'mobilite-grand-ecart-lattice'`.

**Cas ajouté (consolidation 24/11, grandes lignes et étapes en désaccord)**

19. **Principal hors étapes** (`niveaux-de-detail.md` § 3.4) : le cas 1, mais la séance du jeudi 26 est remplacée par une séance « Tractions et poutre » le mercredi 25 : qualité `traction_gainage`, solo dure, sans version groupe, sans niveau propre (détaillé). Étapes réelles : `echauffement-general` puis `traction-simple-4x5`. Parties écrites : « Échauffement » 30 min sans principal, puis « Effort principal » 40 min, principal `doigts-suspensions-max-lestees`. La séance est une `SeancePlanifiee` passée par `seanceVersVerif` : `principauxHorsEtapes` vaut `['doigts-suspensions-max-lestees']`, les étapes de la vue sont les deux étapes réelles. Attendu, comme au cas 1 (`verifierSemaine` et `verifierSeance` sur chaque séance), trois avertissements, tous sur la séance du 25 :
    - `S-03` fort, portée séance, version solo, `sujet` `'doigts-suspensions-max-lestees'`, sans `etapeIndex` : « « Suspensions max lestées (López) » demande : une expérience de poutre régulière. Choisis une fiche plus accessible, ou complète ton profil si c'est déjà le cas. »
    - `S-27` information, même cible : « « Suspensions max lestées (López) » est dans les grandes lignes de « Tractions et poutre », pas dans ses étapes. L'app vérifie ses prérequis, tes douleurs et la récupération, mais pas sa place dans la séance. Mets-les d'accord : ajoute cet exercice aux étapes, ou recalcule les grandes lignes. »
    - `W-01` fort : deux séances maximales de suite, le 24 et le 25.
    - Rien d'autre. En particulier ni `S-10`, ni `S-11`, ni `S-15` : le principal n'a pas de place dans le déroulé (placé en dernière étape, il aurait donné `S-11`). Avant la règle du 24/11, cette semaine ne donnait **aucun** avertissement.

    Variantes :
    - (a) même séance avec `niveauDetail: 'grandes_lignes'` → les mêmes trois avertissements : le niveau affiché ne change rien.
    - (b) `douleursEnCours: ['doigts']` → `verifierJour` sur la séance du 25 rend `S-04` fort, même cible, et rien d'autre ; `formeAffichage` donne `'arret'`.
    - (c) parties effacées (« Recalculer les grandes lignes ») → `principauxHorsEtapes` absent, et plus aucun avertissement dans la semaine : ni `S-03`, ni `S-27`, ni `W-01`.
