# Modèle de données — application d'entraînement à l'escalade

## 1. Vue d'ensemble

- Quatre familles de données : la **bibliothèque** (ce qu'on peut faire), la **planification** (ce qui est prévu), le **journal** (ce qui a été fait) et le **suivi** (comment va le grimpeur), plus les **réglages**.
- Tout enregistrement porte un `id` stable, `creeLe` et `modifieLe` : c'est ce qui rendra une synchronisation possible plus tard.
- Les données fournies avec l'application (bibliothèque) ont un identifiant lisible (`proto-echelles-369`) ; celles créées par l'utilisateur ont un UUID.
- Chaque paramètre réglable est un `Param` : valeur par défaut, minimum, maximum, unité. Chaque protocole porte une `Source` avec son statut de preuve.
- Une séance planifiée embarque ses deux versions (solo et groupe), copiées du modèle : modifier la bibliothèque ne réécrit jamais le passé.
- Une séance réalisée est un seul document (étapes, séries, blocs, objectifs à l'intérieur) : simple à exporter, simple à fusionner.
- Rien de calculable n'est stocké : charge, monotonie, respect des 48 h, type de journée nutritionnelle sont dérivés (section 4).
- Vocabulaire : « bloc » désigne toujours un bloc d'escalade (`BlocGrimpe`) ; le bloc de 4 semaines s'appelle `Mesocycle`.

Relations :

- Un `Exercice` contient plusieurs `Protocole` (façons chiffrées de le faire).
- Une `Routine` contient plusieurs `Etape`, chacune pointant un `Protocole`.
- Un `ModeleSeance` contient une `VersionSolo` (plusieurs `Etape`) et une `VersionGroupe` (1 à 3 `ObjectifGroupe`, mini-bloc solo facultatif).
- Un `Cycle` contient plusieurs `Mesocycle` ; un `Mesocycle` contient plusieurs `SemainePlan` et plusieurs `SeancePlanifiee`.
- Une `SeancePlanifiee` donne au plus une `SeanceRealisee` ; une `SeanceRealisee` peut exister sans plan (séance libre).
- Une `SeanceRealisee` contient plusieurs `EtapeRealisee` (qui contiennent plusieurs `SerieRealisee`), plusieurs `ObjectifRealise`, plusieurs `BlocGrimpe`, plusieurs `FauteTechnique`.
- Un `TestRepere` contient plusieurs `ResultatTest`.
- Une `Salle` contient plusieurs `CouleurSalle`.
- `FormeQuotidienne`, `EvaluationTechnique`, `Douleur` sont indépendantes, rattachées à une date.

## 2. Entités

### 2.1 Types communs

Briques partagées par toutes les entités.

```ts
type ID = string;          // UUID, ou identifiant lisible pour la bibliothèque fournie
type DateISO = string;     // "2026-11-17"
type Horodatage = string;  // "2026-11-17T18:32:00.000Z"

interface Base {
  id: ID;
  creeLe: Horodatage;
  modifieLe: Horodatage;     // mis à jour à chaque écriture (future synchronisation)
  supprimeLe?: Horodatage;   // suppression douce : l'enregistrement reste, masqué
}

// Les cinq qualités mesurées (une dominante par séance)
type Qualite = 'doigts' | 'traction_gainage' | 'puissance' | 'resistance' | 'endurance';
// Les quatre volets transversaux
type Volet = 'technique' | 'mental' | 'prevention' | 'recuperation';
// Étiquette de séance pour les règles de sécurité
type Durete = 'dure' | 'legere';
// Ce qui rend une séance « à surveiller » (quotas hebdomadaires, cumul de risques)
type Marqueur = 'maximale' | 'poutre_intensive' | 'bloc_limite'
  | 'arque_intensif' | 'pan_gullich' | 'trous' | 'crochets_talon';

interface Source {
  statut: 'etude' | 'coach' | 'synthese';
  auteur: string;            // "Bechtel, manuel de poutre Climb Strong"
  url?: string;
  aVerifier?: boolean;       // chiffre signalé « à recontrôler » dans la théorie
}

// Paramètre réglable : valeur par défaut et plage défendue
interface Param { defaut: number; min: number; max: number; unite: string }

type Prehension = 'semi_arque' | 'main_ouverte' | 'trois_doigts' | 'bidoigt' | 'pince' | 'arque';
interface Prise { prehension: Prehension; tailleMm?: number }

type Cotation = string;      // Fontainebleau pour le bloc ("6C+"), française pour la voie ("6c")
```

La correspondance vers les quatre catégories physiques est une constante de code, pas une donnée : `doigts` et `traction_gainage` → force maximale ; `puissance` → puissance ; `resistance` → résistance ; `endurance` → endurance de base.

### 2.2 Exercice

Un geste ou un format d'entraînement, sans chiffres (les chiffres sont dans ses protocoles).

```ts
type ZoneMobilite = 'adducteurs' | 'ischios' | 'flechisseurs_hanche' | 'fessiers'
  | 'rotation_hanche' | 'cheville' | 'pectoraux' | 'grand_dorsal' | 'poignets_doigts';

interface Exercice extends Base {
  nom: string;                       // "Suspensions en échelle"
  famille: Qualite | Volet;          // rattachement principal
  type: 'poutre' | 'musculation' | 'grimpe' | 'technique' | 'mental'
      | 'antagoniste' | 'mobilite' | 'echauffement';
  consigne: string;                  // texte court affiché pendant l'exercice
  materiel?: string[];               // "poutre", "élastique"
  zones?: ZoneMobilite[];            // pour compter les minutes de mobilité par zone
  fautesSuivies?: string[];          // "pied_bruyant", "reajustement" : compteurs proposés
}
```

### 2.3 Protocole

Une façon chiffrée de réaliser un exercice : chrono, volume, charge, cible d'effort, source.

```ts
// Les gabarits de chrono. Les repos sont dans Protocole.repos, pas ici.
type Chrono =
  | { gabarit: 'repetition_unique'; effortS: Param }                      // 1 effort puis long repos
  | { gabarit: 'depart_minute'; effortS: Param; creneauS: number;         // un départ par créneau
      repetitions: Param }
  | { gabarit: 'intermittent'; effortS: Param; repetitions: Param | 'ouvert' } // effort/repos répété
  | { gabarit: 'echelle'; dureesS: number[]; creneauS: number }           // 3-6-9 dans un créneau fixe
  | { gabarit: 'tempo'; phasesS: number[]; repetitions: Param }           // descente, bas, montée, haut
  | { gabarit: 'duree'; dureeS: Param }                                   // bloc de temps (technique, continuité)
  | { gabarit: 'repetitions'; repetitions: Param | 'ouvert' };            // compté, sans chrono d'effort

// 'ouvert' = autant de répétitions que possible : l'écran affiche un compteur à incrémenter

interface Protocole extends Base {
  exerciceId: ID;
  nom: string;                       // "Échelles 3-6-9 au poids du corps"
  chrono: Chrono;
  series: Param;                     // nombre de séries (par prise si `prises` est rempli)
  repos: {                           // les trois niveaux de repos
    cotesS?: Param;                  // entre côté gauche et côté droit
    repetitionsS?: Param;            // entre répétitions d'une série
    seriesS?: Param;                 // entre séries
  };
  parCote?: boolean;                 // chaque série se fait à gauche puis à droite
  prises?: Prise[];                  // positions enchaînées (poutre)
  charge: {
    mode: 'poids_du_corps' | 'lest' | 'allege' | 'pourcentage_max' | 'libre';
    valeur?: Param;                  // kg ou %
  };
  cible?: {                          // comment doser l'effort
    type: 'marge_s' | 'effort_percu' | 'echec_volontaire' | 'loin_de_l_echec';
    valeur?: Param;                  // 3 s de marge, effort perçu 9…
  };
  ecartCotation?: Param;             // terrain : cotations sous (−) ou au-dessus (+) du niveau max
  saisie: ('charge' | 'marge' | 'effort_percu' | 'reussite' | 'repetitions' | 'duree' | 'fautes')[];
  marqueurs: Marqueur[];             // ex. ['maximale', 'poutre_intensive']
  progression?: string;              // règle de progression, en clair
  prerequis?: string[];              // affichés avant la première utilisation
  signauxArret?: string[];           // affichés pendant l'exercice
  source: Source;
}
```

### 2.4 Routine et Etape

Une suite ordonnée de protocoles réutilisable : échauffement, antagonistes, mobilité.

```ts
// Une ligne d'un déroulé : un protocole OU une routine entière
interface Etape {
  protocoleId?: ID;
  routineId?: ID;
  reglages?: Record<string, number>; // valeurs retenues, dans la plage du Param : { series: 3 }
  note?: string;                     // consigne du jour
}

interface Routine extends Base {
  nom: string;                       // "Échauffement dynamique (A)"
  type: 'echauffement' | 'antagonistes' | 'mobilite';
  dureeMin: number;
  etapes: Etape[];
  source: Source;
}
```

### 2.5 ObjectifGroupe

Un défi global pour une séance en groupe, suivi par simples compteurs.

```ts
interface ObjectifGroupe extends Base {
  libelle: string;                   // "5 blocs durs en dévers, 5 essais max chacun"
  accents: Qualite[];                // accents de mésocycle avec lesquels il est cohérent
  volet?: Volet;                     // ex. 'technique' pour un défi de lecture
  durete: Durete;
  marqueurs: Marqueur[];
  cible: {
    blocs?: number;                  // absent = « tous » (toutes les violettes)
    essaisMaxParBloc?: number;
    ecartCotation?: [number, number];// fourchette par rapport au niveau max : [-1, 0]
    couleur?: string;                // si le défi vise une couleur de la salle
    style?: string;                  // "dévers", "réglettes", "dalle"
  };
  reposConseilleS?: Param;           // chrono de repos facultatif
}
```

### 2.6 ModeleSeance

Une séance type de la bibliothèque, avec ses deux versions.

```ts
interface VersionSolo {
  durete: Durete;
  marqueurs: Marqueur[];
  dureeMin: number;
  etapes: Etape[];                   // déroulé complet, dans l'ordre
}

interface VersionGroupe {
  durete: Durete;
  marqueurs: Marqueur[];
  dureeMin: number;
  objectifIds: ID[];                 // 1 à 3 objectifs
  miniBloc?: {                       // 10 à 15 min en solo, facultatif
    moment: 'avant' | 'apres';
    dureeMin: number;
    etapes: Etape[];
  };
}

interface ModeleSeance extends Base {
  nom: string;                       // "Doigts + bloc limite"
  qualite: Qualite;                  // qualité dominante
  volets: Volet[];                   // contenus transversaux embarqués
  solo: VersionSolo;
  groupe: VersionGroupe;
}
```

### 2.7 Cycle, Mesocycle, SemainePlan

Le plan dans le temps : un cycle de 12 semaines découpé en blocs de 4 semaines à accent tournant.

```ts
interface Cycle extends Base {
  nom: string;
  debut: DateISO;                    // un lundi
  nbSemaines: number;                // 12 par défaut
  seancesParSemaine: number;         // 3 ou 4
  mode: 'accent_tournant' | 'objectif_date';
  objectif?: {                       // seulement en mode objectif daté
    libelle: string;
    date: DateISO;
    semainesAffutage: number;        // 2 par défaut
    reductionVolumePct: number;      // 40 à 60, intensité maintenue
  };
  statut: 'prevu' | 'en_cours' | 'termine';
}

interface SemainePlan {
  numero: number;                    // 1 à 4 dans le mésocycle
  type: 'charge' | 'decharge' | 'affutage' | 'transition';
  reductionPct?: number;             // décharge : 40 à 60 % de charge en moins
}

interface Mesocycle extends Base {
  cycleId: ID;
  ordre: number;                     // 1, 2, 3
  accent: Qualite;                   // la qualité mise en avant
  debut: DateISO;
  semaines: SemainePlan[];           // 3 de charge + 1 de décharge par défaut
}
```

### 2.8 SeancePlanifiee

Une séance prévue à une date, avec ses deux versions prêtes ; le mode se choisit le jour même.

```ts
interface SeancePlanifiee extends Base {
  date: DateISO;
  mesocycleId: ID;
  semaine: number;                   // numéro de SemainePlan
  modeleId?: ID;                     // modèle d'origine (information)
  nom: string;
  qualite: Qualite;
  solo: VersionSolo;                 // copies du modèle, ajustables sans toucher la bibliothèque
  groupe: VersionGroupe;
  statut: 'prevue' | 'faite' | 'sautee';  // une séance sautée n'est pas rattrapée
}
```

### 2.9 SeanceRealisee et son contenu

Le journal : ce qui a réellement été fait, en solo, en groupe ou hors plan.

```ts
interface SerieRealisee {
  numero: number;
  prise?: Prise;
  cote?: 'gauche' | 'droite';
  chargeKg?: number;                 // lest (+) ou allègement (−)
  dureeS?: number;
  repetitions?: number;              // aussi pour les compteurs ouverts
  margeS?: number;                   // marge constatée
  effortPercu?: number;              // 1 à 10
  reussie?: boolean;
}

interface EtapeRealisee {
  protocoleId: ID;
  dureeS: number;                    // temps passé (sert aux minutes de mobilité)
  series: SerieRealisee[];
  finAnticipee?: 'qualite_baisse' | 'douleur' | 'temps';
}

interface ObjectifRealise {
  objectifId?: ID;
  libelle: string;                   // copie du texte du défi
  tentes: number;                    // blocs tentés
  reussis: number;
  essais: number;                    // essais au total
  atteint: boolean;
}

interface BlocGrimpe {
  couleur?: string;                  // couleur de la salle…
  cotation?: Cotation;               // …ou cotation, si connue
  essais: number;
  resultat: 'flash' | 'enchaine' | 'non_enchaine';
  style?: string;
  repere?: boolean;                  // bloc repère à retester
}

interface FauteTechnique { type: string; nombre: number }   // "pied_bruyant": 4

interface SeanceRealisee extends Base {
  date: DateISO;
  mode: 'solo' | 'groupe' | 'libre';
  seancePlanifieeId?: ID;
  salleId?: ID;
  qualite: Qualite;
  durete: Durete;                    // copiée de la version choisie, modifiable au bilan
  marqueurs: Marqueur[];
  dureeMin: number;
  effortPercu: number;               // note globale 1 à 10, donnée après la séance
  peau?: 1 | 2 | 3;                  // 1 = abîmée, 2 = limite, 3 = bonne
  etapes: EtapeRealisee[];           // solo, ou mini-bloc en groupe
  objectifs: ObjectifRealise[];      // groupe
  blocs: BlocGrimpe[];               // détail facultatif en groupe
  fautes: FauteTechnique[];
  compteurs: {                       // charge spécifique des doigts
    essaisMax: number;               // essais à la limite
    suspensionsMax: number;
    minutesPan: number;
  };
  bilan?: string;                    // une phrase
}
```

### 2.10 Suivi

Les mesures qui montrent la forme et le progrès.

```ts
// Questionnaire du matin : 1 = mauvais, 5 = très bon ; « rouge » = 1 ou 2
interface FormeQuotidienne extends Base {
  date: DateISO;                     // une seule par jour
  sommeil: number;
  fatigue: number;
  courbatures: number;
  douleur: number;                   // doigts, coudes, épaules
  peau: number;
  heuresSommeil?: number;
}

interface TestRepere extends Base {
  nom: string;                       // "Suspension maximale 7 s sur 20 mm"
  domaine: Qualite | 'mobilite';
  unite: string;                     // "kg", "% du poids du corps", "répétitions", "cm", "s"
  consigne: string;
  rythme: 'mesocycle' | 'cycle' | 'trimestre';
  sensProgres: 'hausse' | 'baisse';
  source: Source;
}

interface ResultatTest extends Base {
  testId: ID;
  date: DateISO;
  valeur: number;
  cote?: 'gauche' | 'droite';        // symétrie (mobilité, un bras)
  note?: string;
}

type ItemTechnique = 'pieds' | 'mains' | 'hanches' | 'bras_tendus' | 'tension_devers'
  | 'dynamisme' | 'rythme' | 'respiration' | 'lecture' | 'variete';

interface EvaluationTechnique extends Base {
  date: DateISO;                     // toutes les 4 à 6 semaines
  notes: Record<ItemTechnique, number>;   // 1 à 5
  commentaire?: string;
}

interface Douleur extends Base {
  date: DateISO;
  zone: 'doigt' | 'poignet' | 'coude' | 'epaule' | 'genou' | 'cheville' | 'autre';
  cote?: 'gauche' | 'droite';
  intensite: number;                 // 0 à 10
  niveau: 'alerte' | 'reduction';    // alerte = arrêt et consultation
  signes: string[];                  // "claquement", "gonflement", "raideur le lendemain"
  seanceId?: ID;
  resolueLe?: DateISO;
}
```

### 2.11 Nutrition

Le repère d'assiette pour chaque type de journée ; aucun chiffre de calories ni de poids.

```ts
type TypeJournee = 'repos' | 'seance_courte' | 'seance_dure_ou_longue' | 'gros_volume';

interface RepereAssiette {
  id: TypeJournee;
  assiette: { feculents: string; proteines: string; legumes: string };  // "une moitié", "un quart"
  reperes: string[];                 // "collation glucidique si dernier repas > 3 h"
  source: Source;
}
```

### 2.12 Réglages et salles

Le profil, les unités, les règles de sécurité réglables ; les salles et leurs couleurs.

```ts
interface Reglages {
  id: 'reglages';                    // un seul enregistrement
  modifieLe: Horodatage;
  profil: {
    discipline: 'bloc' | 'voie';
    niveauBloc: Cotation;            // "7A"
    niveauVoie?: Cotation;           // "6c"
    anneesPratique: number;
    experiencePoutre: 'aucune' | 'occasionnelle' | 'reguliere';
    tient15sSur25mm?: boolean;       // prérequis avant les protocoles lestés
    pointsFaibles: string[];         // "bidoigts"
    objectif: string;                // "7B à 7C en bloc"
    poidsCorpsKg?: number;           // facultatif, sert seulement aux tests en % du poids du corps
  };
  unites: { charge: 'kg' | 'lb'; longueur: 'cm' | 'in' };
  regles: {
    heuresEntreSeancesMax: Param;    // 48
    poutreIntensiveParSemaine: Param;// 2
    blocLimiteParSemaine: Param;     // 2
    reposEffortMaxS: Param;          // 180 (120 à 300)
    reposBlocLimiteS: Param;         // 240 (180 à 300)
    dechargeActive: boolean;
    dechargeReductionPct: Param;     // 50 (40 à 60)
    seuilSommeilH: Param;            // 7
  };
}

interface CouleurSalle {
  couleur: string;                   // "violet"
  cotationMin: Cotation;
  cotationMax: Cotation;
}

interface Salle extends Base {
  nom: string;
  couleurs: CouleurSalle[];          // de la plus facile à la plus dure
}
```

## 3. Tables Dexie et index

Une table par entité stockée. Seuls les champs servant à chercher ou trier sont indexés ; le reste du document est enregistré tel quel.

```ts
db.version(1).stores({
  // Bibliothèque
  exercices:            'id, famille, type',
  protocoles:           'id, exerciceId',
  routines:             'id, type',
  objectifsGroupe:      'id, *accents',            // * = index sur chaque valeur du tableau
  modelesSeance:        'id, qualite',
  tests:                'id, domaine',
  reperesAssiette:      'id',
  // Planification
  cycles:               'id, debut, statut',
  mesocycles:           'id, cycleId, debut',
  seancesPlanifiees:    'id, date, mesocycleId, statut',
  // Journal et suivi
  seancesRealisees:     'id, date, seancePlanifieeId, mode',
  formes:               'id, &date',               // & = unique : une forme par jour
  resultatsTests:       'id, [testId+date]',
  evaluationsTechnique: 'id, date',
  douleurs:             'id, date, zone',
  // Réglages
  salles:               'id',
  reglages:             'id',
});
```

L'export JSON est un objet `{ version, exporteLe, tables: { nomDeTable: [...] } }`. L'import remplace ou fusionne par `id`, en gardant le `modifieLe` le plus récent. Un index sur `modifieLe` sera ajouté quand la synchronisation sera décidée.

## 4. Valeurs dérivées (jamais stockées)

```
// Charge
chargeSeance(s)        = s.effortPercu × s.dureeMin              // 7 × 95 = 665
chargeJour(d)          = somme des chargeSeance du jour d (0 si repos)
chargeSemaine(lundi)   = somme des chargeJour sur 7 jours
monotonie(lundi)       = moyenne(chargeJour sur 7 j) / écartType(chargeJour sur 7 j)
                         // non définie si l'écart-type vaut 0
contrainte(lundi)      = chargeSemaine × monotonie
essaisLimiteSemaine    = somme des compteurs.essaisMax de la semaine
// Aucun ratio charge aiguë / chronique, aucune « zone » chiffrée : écartés par la théorie.

// Sécurité (avertissements, jamais de blocage)
seanceMaximale(s)      = s.marqueurs contient 'maximale'
regle48h(prevue)       = pour la dernière séance maximale M avant `prevue` :
                           (début de prevue − fin de M) ≥ regles.heuresEntreSeancesMax
                         // vérifiée seulement si la version choisie est elle-même maximale
quotaSemaine(marqueur) = nb de séances (faites + prévues) de la semaine portant ce marqueur
                           ≤ regles.poutreIntensiveParSemaine / blocLimiteParSemaine
cumulRisques(semaine)  = nb de séances portant arque_intensif, pan_gullich, trous, crochets_talon

// Forme du jour
itemsRouges(forme)     = nb d'items ≤ 2
allegerSeance          = itemsRouges ≥ 2 OU douleur ouverte (resolueLe absent)
                         OU moyenne(heuresSommeil des 3 dernières nuits) < regles.seuilSommeilH
                         → proposer la version légère ou une séance technique
arretEtConsultation    = douleur ouverte de niveau 'alerte' → masquer les séances dures
consulter              = douleur 'reduction' non résolue après 14 jours

// Progression
ajustementCharge(protocole) = sur les 2 dernières séances du protocole, si cible.type = 'marge_s' :
                           marge constatée > cible les 2 fois → proposer +1,25 à 2,5 kg
                           marge constatée < cible            → proposer −2 à 5 kg ou réglette plus grande
tauxReussite(cotation) = blocs enchaînés ou flashés / blocs tentés, sur la période
                         // une couleur est convertie via Salle.couleurs (fourchette)
pyramide               = nb de blocs enchaînés par cotation sur le cycle
minutesMobilite(zone, semaine) = somme des EtapeRealisee.dureeS dont l'exercice porte la zone, / 60
                         // repère : 5 à 10 min par zone et par semaine
retestDu(test)         = dernier ResultatTest plus ancien que le rythme du test

// Planification et nutrition
typeSemaine(date)      = SemainePlan du mésocycle couvrant la date
statut d'un mésocycle  = déduit de ses dates
typeJournee(d)         = 'gros_volume'            si ≥ 2 séances dures ou longues sur 3 jours glissants
                       = 'seance_dure_ou_longue'  si séance du jour dure, ou ≥ 120 min
                       = 'seance_courte'          si autre séance
                       = 'repos'                  sinon
                         // calculé sur le prévu le matin, recalculé sur le réalisé
```

## 5. Exemples

### 5.1 Protocole de poutre pour ce profil

```json
{
  "id": "proto-echelles-369",
  "creeLe": "2026-11-15T09:00:00.000Z",
  "modifieLe": "2026-11-15T09:00:00.000Z",
  "exerciceId": "exo-suspensions-echelle",
  "nom": "Échelles 3-6-9 au poids du corps",
  "chrono": { "gabarit": "echelle", "dureesS": [3, 6, 9], "creneauS": 45 },
  "series": { "defaut": 3, "min": 3, "max": 5, "unite": "échelles par prise" },
  "repos": { "seriesS": { "defaut": 120, "min": 60, "max": 180, "unite": "s" } },
  "prises": [
    { "prehension": "semi_arque", "tailleMm": 20 },
    { "prehension": "main_ouverte", "tailleMm": 20 },
    { "prehension": "trois_doigts", "tailleMm": 20 }
  ],
  "charge": { "mode": "poids_du_corps" },
  "cible": { "type": "loin_de_l_echec" },
  "saisie": ["reussite", "effort_percu"],
  "marqueurs": [],
  "progression": "Semaines 1 à 3 : 3, 4 puis 5 échelles par prise. Ensuite échelles 3-6-9-12.",
  "prerequis": ["Aucune douleur aux doigts", "Prises tenables confortablement 9 s"],
  "signauxArret": [
    "Douleur à la base d'un doigt",
    "Sensation de claquement",
    "Épaules qui ne restent plus engagées",
    "Glissade non contrôlée"
  ],
  "source": { "statut": "coach", "auteur": "Bechtel, manuel de poutre Climb Strong", "aVerifier": true }
}
```

### 5.2 Séance planifiée (solo et groupe)

```json
{
  "id": "5e0d7a52-3c1b-4f6a-9d2e-8a41c0b7f913",
  "creeLe": "2026-11-15T09:10:00.000Z",
  "modifieLe": "2026-11-15T09:10:00.000Z",
  "date": "2026-11-17",
  "mesocycleId": "b7c2a9e4-1f3d-4a58-8e60-2d9f4c1a7b35",
  "semaine": 2,
  "modeleId": "modele-doigts-bloc-limite",
  "nom": "Doigts + bloc limite",
  "qualite": "doigts",
  "solo": {
    "durete": "dure",
    "marqueurs": ["maximale", "bloc_limite"],
    "dureeMin": 105,
    "etapes": [
      { "routineId": "routine-echauffement-a" },
      { "protocoleId": "proto-pieds-silencieux", "reglages": { "dureeS": 600 } },
      { "protocoleId": "proto-echelles-369", "reglages": { "series": 4 } },
      { "protocoleId": "proto-bloc-limite", "reglages": { "seriesS": 240 }, "note": "Blocs à réglettes" },
      { "routineId": "routine-antagonistes" },
      { "routineId": "routine-mobilite-c" }
    ]
  },
  "groupe": {
    "durete": "dure",
    "marqueurs": ["maximale", "bloc_limite"],
    "dureeMin": 90,
    "objectifIds": ["obj-blocs-a-doigts-5x5", "obj-flash-3-sous-le-max"],
    "miniBloc": {
      "moment": "avant",
      "dureeMin": 12,
      "etapes": [{ "protocoleId": "proto-echelles-369", "reglages": { "series": 3 } }]
    }
  },
  "statut": "prevue"
}
```

### 5.3 Séance en groupe réalisée

```json
{
  "id": "c41f8e06-7b2a-4d93-a5e1-0f6d3b9c2e78",
  "creeLe": "2026-11-17T20:45:00.000Z",
  "modifieLe": "2026-11-17T20:46:10.000Z",
  "date": "2026-11-17",
  "mode": "groupe",
  "seancePlanifieeId": "5e0d7a52-3c1b-4f6a-9d2e-8a41c0b7f913",
  "salleId": "9a3e5d17-6c48-4b0f-b2a9-71e4c8d05f26",
  "qualite": "doigts",
  "durete": "dure",
  "marqueurs": ["maximale", "bloc_limite"],
  "dureeMin": 95,
  "effortPercu": 7,
  "peau": 3,
  "etapes": [
    {
      "protocoleId": "proto-echelles-369",
      "dureeS": 660,
      "series": [
        { "numero": 1, "prise": { "prehension": "semi_arque", "tailleMm": 20 }, "reussie": true, "effortPercu": 6 },
        { "numero": 2, "prise": { "prehension": "main_ouverte", "tailleMm": 20 }, "reussie": true, "effortPercu": 6 },
        { "numero": 3, "prise": { "prehension": "trois_doigts", "tailleMm": 20 }, "reussie": true, "effortPercu": 7 }
      ]
    }
  ],
  "objectifs": [
    {
      "objectifId": "obj-blocs-a-doigts-5x5",
      "libelle": "5 blocs durs à réglettes, 5 essais max chacun",
      "tentes": 5, "reussis": 2, "essais": 21, "atteint": true
    },
    {
      "objectifId": "obj-flash-3-sous-le-max",
      "libelle": "Flasher 3 blocs un cran sous ton max",
      "tentes": 4, "reussis": 3, "essais": 4, "atteint": true
    }
  ],
  "blocs": [
    { "couleur": "violet", "essais": 3, "resultat": "enchaine", "style": "réglettes" },
    { "couleur": "violet", "essais": 5, "resultat": "non_enchaine", "style": "réglettes" },
    { "couleur": "rouge", "essais": 1, "resultat": "flash" }
  ],
  "fautes": [],
  "compteurs": { "essaisMax": 21, "suspensionsMax": 0, "minutesPan": 0 },
  "bilan": "Bonnes sensations sur réglettes, peau limite en fin de séance."
}
```

Dans cet exemple, une ligne de `series` résume les échelles faites sur une prise. La charge (7 × 95 = 665) n'apparaît pas : elle est calculée à l'affichage.

## 6. Points ouverts à valider

- **Séries à l'intérieur de la séance** : choix de simplicité. Les courbes de charge de poutre demandent de relire toutes les séances, ce qui reste rapide pour un seul utilisateur. À revoir seulement si cela devient lent.
- **Poids du corps** : champ facultatif, utile uniquement pour exprimer les tests en pourcentage. Le garder, ou n'afficher que des kilos de lest ?
- **Seuil « gros volume »** (2 séances dures ou longues sur 3 jours) : proposition de synthèse, à régler à l'usage. Faut-il aussi pouvoir forcer le type de journée à la main ?
- **Échelles 3-6-9** : le créneau de 45 s et le repos entre prises (non précisé par la source) sont à recontrôler dans le manuel avant de figer la bibliothèque.
- **Bidoigts** (point faible déclaré) : absents du protocole de départ, car réservés aux charges faibles. Les introduire par un protocole léger dédié, ou seulement par des objectifs de groupe ?
- **Étiquette dure / légère en groupe** : copiée de la version planifiée, modifiable au bilan. Suffisant, ou faut-il la déduire de l'effort perçu ?
- **Détail des blocs en groupe** : facultatif. Sans lui, le taux de réussite par cotation ne se nourrit que des séances solo.
- **Conversion couleur → cotation** : une couleur couvre une fourchette ; les statistiques par cotation utiliseront-elles le bas, le haut ou le milieu de la fourchette ?
- **Mental** (échelle de marches pour la peur de la chute) : couvert par les exercices et compteurs génériques, sans entité dédiée. À confirmer selon l'importance donnée à la voie.
- **Règles de sécurité** : avertissements sans blocage. À confirmer.

---

## 7. Mise à jour du 16 novembre 2026

Cette section applique les décisions prises après les maquettes. En cas de contradiction avec les sections précédentes, elle fait foi.

### 7.1 Décisions qui ferment des points ouverts

- **Usage** : plusieurs grimpeurs, chacun sur son appareil avec ses propres données. Le modèle reste mono-utilisateur par appareil ; rien n'est préréglé pour une personne.
- **Poids du corps** : enregistré dans le profil.
- **Règles de sécurité** : avertissements seulement, jamais de blocage.
- **Bidoigts** : traités par un objectif personnel (7.3), à faible charge.
- **Blocs en groupe** : chaque bloc peut être noté (couleur, essais, résultat), au fil de la séance ou à la fin.
- **Échelles** : effort perçu de séance de 1 à 10 ; peau au bilan sur 3 niveaux (1 abîmée, 2 limite, 3 bonne). Le questionnaire du matin garde sa propre échelle.

### 7.2 Profil du grimpeur (remplace `Reglages.profil`)

```ts
interface Profil {
  prenom?: string;
  disciplinePrincipale: 'bloc' | 'voie';
  niveauBloc?: Cotation;             // "7A"
  niveauVoie?: Cotation;             // "6c"
  objectif?: string;                 // "7B à 7C en bloc"
  anneesPratique: number;
  experiencePoutre: 'aucune' | 'occasionnelle' | 'reguliere';
  test15sSur25mm?: boolean;          // prérequis d'entrée à la poutre
  poidsCorpsKg?: number;
  pointsFaibles: string[];           // "bidoigts"
  douleursEnCours: ZoneDouleur[];    // vide = aucune ; filtre les objectifs et les protocoles
  seancesParSemaine: 3 | 4 | number;
  grimpeSouventEnGroupe: boolean;
  salleHabituelleId?: ID;
  premierLancementFait: boolean;     // false = afficher le parcours de démarrage
}

type ZoneDouleur = 'doigts' | 'poignet' | 'coude' | 'epaule' | 'genou' | 'dos' | 'autre';
```

Le programme est généré à partir du profil : le niveau, l'ancienneté et l'expérience de la poutre déterminent les protocoles proposés et leurs valeurs de départ.

### 7.3 ObjectifPerso (nouvelle entité, bibliothèque)

Rôle : un objectif personnel choisi pour un bloc de 4 semaines, qui ajoute un module court aux séances.

```ts
interface ObjectifPerso extends Base {
  nom: string;                       // "Renforcer les bidoigts"
  famille: 'doigts' | 'force' | 'gainage' | 'mobilite' | 'mental' | 'prevention';
  description: string;
  module: {
    routineId: ID;                   // routine de 10 à 15 min
    dureeMin: number;
    foisParSemaine: 1 | 2;
    placement: 'debut_seance_dure' | 'fin_seance' | 'jour_leger';
  };
  objectifGroupeId?: ID;             // équivalent en séance de groupe ("chercher les blocs à bidoigts")
  marqueurs: Marqueur[];             // compte dans les quotas hebdomadaires
  prerequis: {
    anneesPratiqueMin?: number;
    experiencePoutreMin?: 'occasionnelle' | 'reguliere';
    tractionsMin?: number;
  };
  contreIndications: ZoneDouleur[];  // une douleur déclarée dans ces zones masque l'objectif
  remplacementSiDouleur?: ID;        // objectif de prévention proposé à la place
  testRepereId?: ID;                 // indicateur de progrès, retesté en fin de bloc
  source: Source;
}
```

Lien avec la planification : `Mesocycle` gagne le champ `objectifsPersoIds: ID[]` (0 à 2). Les séances planifiées du bloc reçoivent les modules correspondants comme étapes facultatives.

Règle dérivée :

```
objectifsProposables(profil) =
  tous les ObjectifPerso
  dont les prérequis sont remplis par le profil
  et dont aucune contre-indication ne figure dans profil.douleursEnCours
// si un objectif est masqué pour douleur, proposer remplacementSiDouleur
// avertir si deux objectifs choisis portent le même marqueur à quota
```

### 7.4 Salles préréglées

`Salle` gagne `prereglage: boolean` et `enseigne?: string`. `CouleurSalle` devient `{ ordre: number; nom: string; hex: string; cotationMin: Cotation; cotationMax: Cotation }` ; `BlocGrimpe.couleur` reprend le `nom`. Les préréglages sont fournis avec l'app et modifiables ; chacun peut créer sa salle. Les fourchettes sont approximatives (source : tableau klimbr.co, limites en dégradé).

Enseignes préréglées : Arkose, Vertical Art, Climbing District, Climb Up, Blocbuster, Ablok, Block Out, Cortigrimpe, Mroc.

Exemple, Mroc (fourchettes à confirmer sur place) :

```json
{
  "id": "salle-mroc",
  "nom": "Mroc",
  "prereglage": true,
  "couleurs": [
    { "ordre": 1, "nom": "Jaune",  "hex": "#E8D44A", "cotationMin": "3",   "cotationMax": "4C" },
    { "ordre": 2, "nom": "Vert",   "hex": "#5FA052", "cotationMin": "4C",  "cotationMax": "5B" },
    { "ordre": 3, "nom": "Bleu",   "hex": "#4A7BD0", "cotationMin": "5B",  "cotationMax": "6A" },
    { "ordre": 4, "nom": "Violet", "hex": "#8E5CC2", "cotationMin": "6A+", "cotationMax": "6C+" },
    { "ordre": 5, "nom": "Rouge",  "hex": "#C8443C", "cotationMin": "7A",  "cotationMax": "7B" },
    { "ordre": 6, "nom": "Noir",   "hex": "#000000", "cotationMin": "7B+", "cotationMax": "8A" }
  ]
}
```

### 7.5 Débrief de fin de séance

Aucune nouvelle table : le débrief est calculé à partir de `SeanceRealisee` et de l'historique.

```
debrief(s) = {
  resume:        phrase générée (objectifs atteints, fait marquant)
  chiffres:      blocs enchaînés / tentés, essais, effortPercu
  objectifs:     pour chaque ObjectifRealise : tentés, réussis, essais
  parCouleur:    regroupement des BlocGrimpe par couleur : tentés, flash, enchaînés
  semaine:       charge cumulée / charge prévue, séances dures faites / prévues
  comparaison:   mêmes chiffres sur la dernière séance de même qualité dominante
  suite:         repère d'assiette du soir, prochaine séance, prochaine séance dure
}
```

### 7.6 Tables Dexie

Ajouter la table `objectifsPerso` (index : `id`, `famille`). La table des réglages stocke désormais `Profil`. Total : 18 tables.
