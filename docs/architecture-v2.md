# Architecture v2 — Get me to 9a

> **Consolidation du 17/11** (passe du 18/11) : ce document a été mis en cohérence avec `docs/decisions-phase-1.md`, les spécifications du design et de l'entraînement. Chaque ajout ou correction porte la mention « (consolidation 17/11) ». L'app s'appelle « Get me to 9a » (décision du 18/11) ; le dépôt, l'adresse, la base Dexie et le projet Supabase gardent le nom `appli-escalade`. Liste des tâches : `docs/backlog-v2.md`.

17 novembre 2026 · Auteur : architecte (phase 1) · Statut : proposition à valider par Arthur.
Ce document répond aux huit questions du cahier des charges de l'architecte. Il s'appuie sur `docs/plan-v2.md` (qui fait foi), sur le code du dépôt au commit `632dfec` et sur la documentation officielle consultée le 17/11/2026 (liste des sources en fin de document).

## 0. Les décisions en bref

| Sujet | Décision | Pourquoi, en une phrase |
|---|---|---|
| Service de comptes et de données | **Supabase**, offre gratuite, région Europe (Paris) | Gratuit pour quelques dizaines de personnes, sécurité par utilisateur écrite en SQL lisible, aucune dépendance propriétaire forte (c'est du PostgreSQL). |
| Hors ligne | **L'appareil reste la source de vérité** (Dexie, comme aujourd'hui). Le serveur est une copie de sauvegarde et de partage entre appareils | L'app marche déjà hors ligne ; on ajoute une synchronisation, on ne remplace pas le stockage. |
| Forme des données sur le serveur | **Une seule table `documents`** : un enregistrement local = une ligne (type, id, contenu JSON) | Un seul jeu de règles d'accès, un seul code de synchronisation, aucune modification du serveur quand le modèle évolue. |
| Conflits | **La dernière modification gagne, document par document** (comparaison de `modifieLe`) | Simple à expliquer ; et le modèle est découpé pour que le téléphone et l'ordinateur n'écrivent presque jamais le même document. |
| Connexion | **Code à usage unique reçu par e-mail** (6 chiffres), sans mot de passe | Sur iPhone, l'app installée ne partage pas sa mémoire avec Safari : un lien e-mail connecterait Safari, pas l'app (§ 2.4). |
| Inscriptions (consolidation 17/11, B2) | **Liste d'invités** tenue par Arthur (table `invites`, § 3.3) | Offre gratuite limitée, app entre amis. |
| Envoi des e-mails | **SMTP personnalisé obligatoire** : une **adresse Gmail dédiée** avec mot de passe d'application (décision A3 ; consolidation 17/11) | L'envoi intégré de Supabase n'écrit qu'aux membres de l'équipe du projet, 2 messages par heure. |
| Sans compte | L'app fonctionne exactement comme aujourd'hui, données sur l'appareil, sauvegarde par fichier | Le compte est un plus, jamais une obligation. |
| Ordinateur et téléphone | Même code, deux mises en page choisies par la **largeur d'écran** (1 024 px, seuil du design ; consolidation 17/11) | Pas de deuxième app à maintenir. |
| Assistant IA | Appel direct du navigateur à l'API Claude avec la clé de l'utilisateur, en-tête `anthropic-dangerous-direct-browser-access: true`, réponse **JSON au format `ReponseAssistant`** (`docs/specs/entrainement/assistant-ia.md` D.4), vérifiée par le code ; ordinateur seulement (B7) | Seul moyen sans serveur ; la clé reste sur l'appareil. |
| Modèle IA par défaut | **Claude Haiku 5.5** (`claude-haiku-5-5`), Sonnet 5.5 en option ; **coût estimé affiché avant chaque demande** (B5, B6 ; consolidation 17/11) | Environ 0,01 $ par brouillon de cycle contre environ 0,15 $. |
| Apple Watch | Moteur de séance en TypeScript pur (`src/moteur/` + `src/chrono/sequence.ts`), séances planifiées **autonomes** (étapes recopiées), format documenté avec des exemples de référence | Une future app native lira les mêmes documents par la même API et rejouera les mêmes calculs. |

## 1. Schéma des composants

```
                    ┌──────────────── Même app (PWA React, GitHub Pages) ────────────────┐
                    │                                                                     │
  Téléphone ───────►│  Mise en page téléphone      Mise en page bureau   ◄────────────────│◄─── Ordinateur
  (exécuter)        │  (onglets en bas)            (menu latéral)                         │     (organiser)
                    │        │                           │                                │
                    │        ▼                           ▼                                │
                    │  Écrans (src/ecrans/)   ──── lisent / écrivent ────┐                │
                    │        │                                           │                │
                    │        ▼                                           ▼                │
                    │  Moteur de séance (src/moteur/, src/chrono/)   Données (src/donnees/)│
                    │  TypeScript pur, sans React                    stockage.ts : ecrire()│
                    │                                                    │                │
                    │                                   Dexie / IndexedDB (sur l'appareil)│
                    │                                   tables synchronisées + aEnvoyer   │
                    │                                   etatSynchro, appareil (jamais     │
                    │                                   synchronisées : clé API ici)       │
                    │                                                    │                │
                    │                         Synchronisation (src/synchro/)              │
                    │                         pousser les aEnvoyer = 1, tirer depuis le   │
                    │                         curseur, dernière modification gagne        │
                    │                                                    │                │
                    │  Assistant (src/assistant/, phase 5) ─┐            │                │
                    └───────────────────────────────────────│────────────│────────────────┘
                                                            │            │ HTTPS, clé publique
                                       HTTPS, clé de        │            │ + jeton de session
                                       l'utilisateur        ▼            ▼
                                              api.anthropic.com     Supabase (Paris)
                                                                    Auth (code e-mail)
                                                                    Table documents + RLS
                                                                    ▲
                                                                    │ même API REST, plus tard
                                                              App Apple Watch native
```

Règles de dépendance (vérifiées par un test, tâche F2-01) :
- `src/moteur/` et `src/chrono/sequence.ts` n'importent ni React, ni Dexie, ni Supabase.
- `src/synchro/` ne connaît pas les écrans.
- Les écrans n'appellent jamais Supabase directement : ils écrivent dans Dexie par `ecrire()`, la synchronisation fait le reste.

## 2. Comptes et synchronisation

### 2.1 Comparaison des solutions

Vérifié sur les pages officielles le 17/11/2026 (sources en fin de document).

| Critère | **Supabase** (recommandé) | Dexie Cloud | Firebase (Firestore + Auth) | PocketBase hébergé |
|---|---|---|---|---|
| Offre gratuite | 500 Mo de base, 50 000 utilisateurs actifs par mois, 5 Go de trafic, 2 projets. **Projet mis en pause après 7 jours sans activité.** Pas de sauvegarde automatique. | 3 utilisateurs en production, 100 Mo. Au-delà : offre Pro à partir de 3 € par mois pour 25 places. | Plan Spark gratuit, mais **5 e-mails de connexion par lien et par jour** ; au-delà il faut ajouter une carte bancaire (plan Blaze). | PocketBase est libre mais doit tourner sur un serveur ; l'hébergement gratuit dépend d'offres communautaires (non vérifié en détail). |
| Hors ligne | Rien d'intégré : on garde Dexie et on écrit une petite synchronisation (≈ 200 lignes). | Le meilleur : conçu pour Dexie, hors ligne et synchronisation inclus. | Cache hors ligne intégré au SDK web, mais il remplace Dexie (tout le stockage serait à réécrire). | Rien d'intégré, comme Supabase. |
| Données isolées par utilisateur | Règles RLS en SQL, lisibles : « la ligne appartient à `auth.uid()` ». | Modèle de « royaumes » et de droits propre à Dexie Cloud. | Règles de sécurité dans un langage propre à Firebase. | Règles d'API par collection. |
| Connexion sans mot de passe | Code ou lien par e-mail, intégré. | Code par e-mail, intégré. | Lien par e-mail (pas de code) : inutilisable dans l'app iPhone installée (§ 2.4). | Code par e-mail, intégré. |
| Simplicité pour un débutant | Tableau de bord clair, SQL standard, très documenté. | La plus simple côté code (quelques lignes). | Console riche mais concepts propres (collections, règles, quotas). | Simple, mais il faut gérer un serveur. |
| Dépendance au fournisseur | Faible : PostgreSQL standard, export SQL possible, auto-hébergeable. | Forte : serveur propriétaire (auto-hébergement payant, 3 495 € en licence). | Forte : base NoSQL propriétaire de Google. | Faible (logiciel libre). |
| **Verdict** | **Retenu.** | Excellent techniquement mais payant dès le 4e ami. | Écarté : quota de 5 e-mails par jour et pas de code à saisir. | Écarté : un serveur à administrer. |

**Pourquoi Supabase malgré la synchronisation à écrire nous-mêmes** : l'app stocke déjà tout dans Dexie et fonctionne hors ligne. Ajouter une synchronisation « envoyer ce qui a changé, récupérer ce qui a changé » sur une seule table est un code court, testable sans réseau, et qu'Arthur peut lire. En échange on obtient la gratuité pour tout le groupe, des règles d'accès en SQL standard et la liberté de partir.

**Points de vigilance Supabase**
1. **Envoi d'e-mails** : l'envoi intégré refuse toute adresse qui n'est pas membre de l'équipe du projet et se limite à 2 messages par heure. Il faut brancher un serveur SMTP (§ 9, étape 5). Ensuite la limite démarre à 30 messages par heure, réglable.
2. **Mise en pause après 7 jours d'inactivité** : grâce au stockage local, l'app continue de marcher (séances, chrono, saisie) ; seule la synchronisation s'arrête jusqu'à ce qu'Arthur relance le projet dans le tableau de bord. Une tâche planifiée hebdomadaire (F2-15) appelle la fonction `ping()` (qui ne lit aucune donnée) pour limiter ce risque ; son efficacité est à confirmer à l'usage.
3. **Pas de sauvegarde automatique en gratuit** : chaque appareil garde une copie complète, et l'export JSON reste disponible.
4. **Clés** : Supabase remplace les anciennes clés `anon` / `service_role` (fin 2026) par une **clé publiable** `sb_publishable_…` et une **clé secrète** `sb_secret_…`. L'app n'utilise que la clé publiable.

### 2.2 Principe : local d'abord

- Dexie reste la base de l'app. Tout se lit et s'écrit localement, sans attendre le réseau.
- Chaque enregistrement d'une table synchronisée porte un drapeau local `aEnvoyer` (1 = modifié depuis le dernier envoi, 0 = à jour). Ce drapeau n'est jamais envoyé au serveur.
- Toutes les écritures passent par une seule fonction, `ecrire(table, document)` dans `src/donnees/stockage.ts`. Elle pose `modifieLe = maintenant` (et `creeLe` à la création), `aEnvoyer = 1`, puis prévient l'app qu'une synchronisation est souhaitée.
- Les suppressions sont **douces** : `supprimer(table, id)` pose `supprimeLe` et `aEnvoyer = 1`. Le document reste, masqué partout. Sans cela, un autre appareil ne saurait pas qu'il a été supprimé.
- Sans compte, les documents restent simplement en `aEnvoyer = 1` : à la première connexion, tout part d'un coup (c'est la reprise, § 4).

### 2.3 Le cycle de synchronisation

Fonction `synchroniser(serveur)` dans `src/synchro/synchro.ts`. Une seule exécution à la fois.

1. **Pousser** : lire, dans chaque table synchronisée, les documents `aEnvoyer = 1`. Les envoyer par paquets de 100 (`upsert` sur la table `documents`). Après succès, remettre `aEnvoyer = 0` **seulement si `modifieLe` n'a pas changé entre-temps** (sinon la modification faite pendant l'envoi serait oubliée).
2. **Tirer** : demander au serveur les lignes dont `recu_le` (heure de réception par le serveur) est postérieure au **curseur** moins 60 secondes de marge, par paquets de 500, triées par `recu_le`. Pour chacune, appliquer la règle de fusion ci-dessous. Enregistrer le nouveau curseur (la plus grande `recu_le` reçue) dans `etatSynchro`.
3. Si au moins un document local a changé, émettre l'événement « données changées » : les écrans ouverts se relisent.

**Quand synchroniser** (tâche F2-10) : à l'ouverture de l'app si une session existe ; au retour du réseau (événement `online`) ; quand l'app revient au premier plan ; 3 secondes après une écriture locale ; toutes les 5 minutes tant que l'app est visible. Jamais d'attente bloquante : l'interface ne dépend pas de la synchronisation.

**Indicateur** dans l'écran Compte : « À jour il y a 2 min », « 3 modifications en attente d'envoi », « Hors ligne : tes données sont sur l'appareil et partiront au retour du réseau », « Échec : … (nouvel essai automatique) ».

### 2.4 Connexion : un code reçu par e-mail

Le plan prévoyait un lien e-mail. **Sur iPhone, l'app installée sur l'écran d'accueil et Safari ne partagent ni cookies ni stockage, et iOS ne sait pas ouvrir une PWA depuis un lien** : toucher le lien connecterait Safari, pas l'app. Supabase envoie le même e-mail pour un lien ou un code : il suffit que le modèle d'e-mail contienne `{{ .Token }}`. On utilise donc partout le code :

1. Écran Compte : champ e-mail → `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`.
2. L'utilisateur reçoit un code (6 chiffres par défaut, valable 1 heure, un nouvel envoi possible toutes les 60 secondes).
3. Il le saisit dans l'app → `supabase.auth.verifyOtp({ email, token, type: 'email' })` → session ouverte.
4. La session est gardée par supabase-js dans le stockage du navigateur et renouvelée automatiquement. Hors ligne, elle reste ; la synchronisation attend le réseau.

Le même parcours sert sur ordinateur : un seul écran à construire et à tester. Client créé avec `{ auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }`.

### 2.5 Conflits : règle et explication

**Règle** : pour un même document (même type, même identifiant), la version qui a le `modifieLe` le plus récent gagne, entière. Pas de fusion champ par champ.
- Sur l'appareil : fonction pure `decider(local, distant)` → `'prendre_distant'` si le local n'existe pas ou si `distant.modifieLe > local.modifieLe`, sinon `'garder_local'`.
- Sur le serveur : un déclencheur refuse d'écraser une ligne par une version plus ancienne (§ 3.3). Deux appareils qui poussent dans le désordre ne peuvent donc pas faire reculer une donnée.

**Pourquoi c'est suffisant ici** : le modèle est découpé pour que chaque appareil écrive « ses » documents.
- Le téléphone écrit surtout le **journal** : une séance réalisée est un nouveau document, jamais modifié par l'ordinateur.
- L'ordinateur écrit surtout le **plan** : cycles, blocs, séances planifiées, exercices personnels.
- Le statut d'une séance planifiée (« faite », « sautée ») **n'est pas stocké** : il se déduit de l'existence d'une séance réalisée qui la cite. Le téléphone n'a donc jamais besoin de modifier une séance planifiée.
- Restent le profil et les réglages, modifiables des deux côtés : si les deux ont été modifiés hors ligne, la modification la plus récente l'emporte entière. C'est rare et sans gravité.
- (consolidation 17/11, B11) **Exception voulue** : sur le téléphone, on peut déplacer une séance planifiée (champ `date`) ou la sauter (`sauteeLe`). Le téléphone écrit alors le document `SeancePlanifiee` entier. Si l'ordinateur modifie la même séance hors ligne au même moment, la modification la plus récente gagne : un des deux changements est perdu. Risque accepté (rare, visible, réparable à la main).

**Phrase à afficher dans l'aide** : « Si tu modifies la même chose sur deux appareils sans réseau, c'est la modification la plus récente qui est gardée. »

Limite connue : la comparaison utilise l'horloge de l'appareil. Une horloge très fausse peut faire perdre une modification ; les téléphones et ordinateurs sont aujourd'hui réglés automatiquement.

## 3. Modèle de données v2

Ce chapitre complète `docs/modele-donnees.md` (sa section 7 reste valable). Il deviendra la section 8 de ce fichier (tâche F2-02). Vocabulaire (consolidation 17/11, décision B9) : la période de 4 semaines s'appelle **« Phase »** à l'écran et `PhaseCycle` dans le code (table `phases`, champ `phaseId`) ; `Phase` seul est déjà le nom d'une phase du chrono (`src/chrono/sequence.ts`). « Bloc » ne désigne plus qu'un bloc d'escalade (`BlocGrimpe`). Le moteur de vérification garde ses noms internes (`mesocycleOrdre`, semaine `decharge`) : la conversion se fait dans une seule tâche (C-01, `docs/backlog-v2.md`).

### 3.1 Ce qui vit où

| Donnée | Où | Synchronisée | Qui l'écrit surtout |
|---|---|---|---|
| Bibliothèque des 60 protocoles | Code (`src/donnees/bibliotheque/`), versionnée | Non (publiée avec l'app) | Concepteurs, par commit |
| Catalogues : séances types, objectifs de groupe, objectifs spécifiques, tests repères (consolidation 17/11) | Code (`src/donnees/`), versionnés | Non | Concepteurs, par commit |
| Salles préréglées | Code (`src/donnees/salles.ts`) | Non | Concepteurs |
| Profil (avec prérequis, jours disponibles, repère de traction) | Dexie `reglages`, id `profil` | Oui | Les deux |
| Réglages (règles de sécurité réglables, modèle d'IA) | Dexie `reglages`, id `reglages` | Oui | Ordinateur |
| Cycles, phases, séances planifiées | Dexie `cycles`, `phases`, `seancesPlanifiees` | Oui | Ordinateur (le téléphone peut déplacer ou sauter une séance, § 2.5) |
| Objectifs spécifiques d'une phase | Dexie `objectifsSpecifiques` | Oui | Ordinateur |
| Exercices personnels | Dexie `exercicesPerso` | Oui | Ordinateur |
| Salles personnelles (ou préréglage modifié) | Dexie `salles` | Oui | Les deux |
| Séances réalisées | Dexie `seancesRealisees` | Oui | Téléphone |
| Forme du jour (consolidation 17/11, phase 4) | Dexie `formes` | Oui | Téléphone |
| Douleurs déclarées, datées (consolidation 17/11, phase 4) | Dexie `douleurs` | Oui | Les deux |
| Résultats des tests repères (consolidation 17/11, phase 6) | Dexie `resultatsTests` | Oui | Les deux |
| État de la synchronisation (curseur, compte lié) | Dexie `etatSynchro` | **Jamais** | L'app |
| Clé API Claude, préférences de l'appareil | Dexie `appareil` | **Jamais** | L'utilisateur |

(consolidation 17/11) Les trois tables de suivi sont déclarées **dès la version 3** de la base, vides : aucune nouvelle version de Dexie ne sera nécessaire en phases 4 et 6. **Le serveur n'a rien à changer.**

### 3.2 Types TypeScript (côté appareil)

Fichier `src/moteur/types.ts` (tâche F2-01) — ce que le moteur de séance sait exécuter. C'est le type `Etape` actuel de `seanceExemple.ts`, unifié avec la `Forme` de la bibliothèque et complété d'une durée et d'une origine.

```ts
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
```

Fichier `src/donnees/profil.ts` (tâches F2-02 et F2-05) — le type `Profil` y reste ; ajouts :

```ts
export type ZoneDouleur = 'doigts' | 'poignet' | 'coude' | 'epaule' | 'genou' | 'dos' | 'autre' // 'autre' : consolidation 17/11
export type JourSemaine = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche' // consolidation 17/11

export interface Profil {
  prenom: string
  disciplinePrincipale: 'bloc' | 'voie'
  niveauBloc: string
  niveauVoie: string
  objectif: string
  anneesPratique: number
  experiencePoutre: 'aucune' | 'occasionnelle' | 'reguliere'
  poidsCorpsKg: number | null           // jamais envoyé à l'assistant
  pointsFaibles: string
  douleursEnCours: ZoneDouleur[]
  seancesParSemaine: number
  grimpeSouventEnGroupe: boolean        // donne le mode habituel (bouton principal d'Aujourd'hui)
  salleHabituelleId: string
  // Prérequis des protocoles exigeants. null = pas encore renseigné : compte comme « non rempli », par prudence.
  tractionsStrictes: number | null      // nombre maximal de tractions strictes d'affilée
  tient15sSur25mm: boolean | null       // tient 15 s sur une réglette de 25 mm, poids du corps
  majeur: boolean | null                // 18 ans révolus : lest et pan Güllich
  grimpeEnTete: boolean | null          // sait grimper et chuter en tête
  // (consolidation 17/11)
  joursDisponibles: JourSemaine[]       // vide = pas renseigné ; sert au placement des séances et à l'assistant
  repereTraction: 'aucun' | 'hommes' | 'femmes' // décision B14 : repère Lattice facultatif dans les bilans, 'aucun' par défaut
}
```

Fichier `src/donnees/modele.ts` (tâche F2-02) — les documents enregistrés.

```ts
import type { Marqueur, Qualite, Forme, Prerequis, Contexte } from './bibliotheque/types.ts'
import type { Profil, ZoneDouleur } from './profil.ts'
import type { EtapeSeance, ObjectifGroupe, BlocGrimpe, SeanceGuidee } from '../moteur/types.ts'
import type { Salle } from './salles.ts'

export type DateISO = string      // "2026-11-17", jour local
export type Horodatage = string   // "2026-11-17T18:32:00.000Z"

/** Les cinq qualités physiques. */
export type QualitePhysique = 'doigts' | 'traction_gainage' | 'puissance' | 'resistance' | 'endurance'
/** (consolidation 17/11, décision B13) L'accent d'une phase : une qualité physique, ou la technique. */
export type AccentPhase = QualitePhysique | 'technique'
export type Durete = 'dure' | 'legere'
/** (consolidation 17/11) Note de 1 à 5 de la forme du jour : 1 = mauvais, 5 = très bon ; « rouge » = 1 ou 2. */
export type Note5 = 1 | 2 | 3 | 4 | 5

/** Champs communs à tout document enregistré et synchronisé. */
export interface Document {
  id: string
  versionFormat: 1          // forme du document ; augmentera si un champ change de sens
  creeLe: Horodatage
  modifieLe: Horodatage     // la règle « dernière modification gagne » compare ce champ
  supprimeLe?: Horodatage   // suppression douce : le document reste, masqué
}

// ——— Profil et réglages (table `reglages`, deux documents à identifiant fixe) ———

export type ProfilEnregistre = Profil & Document & { id: 'profil' }

export interface Reglages extends Document {
  id: 'reglages'
  // Valeurs choisies par l'utilisateur pour les règles de sécurité réglables.
  // Les clés, valeurs par défaut et plages sont définies dans le code par l'expert entraînement
  // (REGLES_PAR_DEFAUT, tâche E-01) ; une valeur absente, hors plage ou du mauvais type est ignorée.
  reglesSecurite: Record<string, number | boolean>   // (consolidation 17/11) dechargeActive est un booléen
  assistantModele?: string              // absent = modèle par défaut (§ 5.4)
}

// ——— Plan ———

/** Trace d'un brouillon proposé par l'assistant et gardé par l'utilisateur (affichée, jamais exécutée). */
export interface TraceAssistant {
  modele: string
  demandeLe: Horodatage
  demande: string          // ce que l'utilisateur a demandé
  explication: string      // le pourquoi, en clair
  sources: string[]        // "López : 48 h entre deux séances sur une même préhension" ; un livre : son titre seul
}

export interface Cycle extends Document {
  nom: string
  debut: DateISO                 // toujours un lundi
  nbSemaines: number             // (consolidation 17/11) 12 par défaut ; moins en mode objectif daté (règle A1-12)
  seancesParSemaine: number
  etat: 'brouillon' | 'valide'   // un brouillon n'apparaît jamais sur le téléphone ; « Valider le cycle » sur ordinateur (D-14)
  objectif?: { libelle: string; date?: DateISO }  // avec une date : mode « objectif daté » (calculé, § 3.5)
  abandonneLe?: DateISO          // arrêté avant la fin ; le cycle reste dans l'historique
  assistant?: TraceAssistant
  avertissementsGardes: string[] // (consolidation 17/11) clés des avertissements repliés par « Je garde ce choix » (C-01)
}

export interface SemainePlan {
  numero: 1 | 2 | 3 | 4
  // (consolidation 17/11) affûtage (objectif daté, A1-9) et transition entre deux cycles (A1-4)
  type: 'charge' | 'allegee' | 'affutage' | 'transition'
  reductionPct?: number          // allégée et affûtage : 40 à 60 %, 50 par défaut (règles A1-3, A4-9)
}

/** (consolidation 17/11 : anciennement Mesocycle) Une phase de 4 semaines. Sa date de début n'est pas stockée :
 *  debut du cycle + (ordre − 1) × 28 jours. */
export interface PhaseCycle extends Document {
  cycleId: string
  ordre: 1 | 2 | 3
  accent: AccentPhase | null     // null = pas encore choisi dans le constructeur
  semaines: SemainePlan[]        // 4 : 3 de charge puis 1 allégée par défaut
  note?: string
}

export interface ObjectifSpecifique extends Document {
  phaseId: string                // 0 à 2 par phase (règle A7-1) ; la liste d'une phase se lit par cet index
  libelle: string                // "Renforcer les bidoigts"
  modeleId?: string              // objectif du catalogue des objectifs spécifiques (C-02), s'il en vient
  indicateur?: { nom: string; unite: string; depart?: number; cible?: number }
}

/** Version solo d'une séance planifiée : étapes complètes, recopiées à la création. */
export interface VersionSolo extends SeanceGuidee {
  durete: Durete                 // choisie par l'utilisateur (défaut proposé par les règles)
  effortPrevu?: number           // (consolidation 17/11) 1 à 10 ; absent = 7 si dure, 4 si légère (B17)
  // (consolidation 17/11) plus de champ `marqueurs` : ils se calculent depuis les fiches citées par origine.refId
}

/** Version groupe : objectifs globaux, et un mini-bloc solo facultatif. */
export interface VersionGroupe {
  nom: string
  durete: Durete
  effortPrevu?: number           // (consolidation 17/11)
  dureeMin?: number              // (consolidation 17/11) durée annoncée (« 1 h 30 ») : non calculable pour une séance de groupe
  reposConseilleS: number
  objectifs: ObjectifGroupe[]    // 1 à 3
  miniBloc?: { moment: 'avant' | 'apres'; etapes: EtapeSeance[] }
  // L'échauffement en commun n'est pas stocké : l'écran le rappelle toujours (seances-types.md, convention groupe).
}

export interface SeancePlanifiee extends Document {
  cycleId: string
  phaseId: string
  semaine: 1 | 2 | 3 | 4
  date: DateISO
  qualite: Qualite               // dominante, choisie (peut être 'technique' ou 'mobilite')
  solo: VersionSolo
  groupe: VersionGroupe | null   // null = pas de version groupe proposée (séance à la maison, B19)
  // (consolidation 17/11)
  seanceTypeId?: string          // séance type du catalogue d'origine ("ST-DOI-02"), information
  variante?: string
  sauteeLe?: Horodatage          // l'utilisateur a choisi de la sauter (téléphone ou ordinateur, B11)
  // (consolidation 17/11) `avertissementsVus` est retiré : les avertissements gardés sont sur le cycle.
}

// ——— Journal ———

export interface EtapeRealisee {
  titre: string
  statut: 'faite' | 'passee' | 'a_faire'
  refId?: string                 // origine.refId de l'étape planifiée
}

/** Compatible avec les séances déjà enregistrées : tous les champs ajoutés en v2 sont facultatifs. */
export interface SeanceRealisee extends Document {
  date: DateISO
  mode: 'solo' | 'groupe' | 'libre'
  nom: string
  durete: Durete
  dureeMin: number
  effortPercu: number            // 1 à 10
  peau: 1 | 2 | 3
  douleur: boolean
  etapes: EtapeRealisee[]
  objectifs: { libelle: string; cible: number; fait: number }[]
  blocs: BlocGrimpe[]
  seancePlanifieeId?: string     // absent = séance hors plan
  salleId?: string
  qualite?: Qualite
  marqueurs?: Marqueur[]         // instantané des marqueurs de la version exécutée : servent aux quotas et aux 48 h
}

// ——— Bibliothèque personnelle ———

export type LivreReference = 'planification' | 'cent_exercices' | 'alimentation' | 'autre'

/** Un exercice créé par l'utilisateur. Même forme d'exécution qu'un protocole : le moteur le joue pareil. */
export type ExercicePerso = Document & Forme & {
  nom: string
  qualite: Qualite
  resume: string
  consigne: string
  dureeMin: number
  // (consolidation 17/11) null = pas encore qualifié (règle S-19). Le formulaire traduit les réponses
  // « oui / non / je ne sais pas » en marqueurs, « je ne sais pas » comptant comme « oui ».
  marqueurs: Marqueur[] | null
  contreIndications: ZoneDouleur[]
  prerequis?: Prerequis          // (consolidation 17/11) mêmes conditions qu'un protocole
  contexte?: Contexte            // (consolidation 17/11) terrain, partenaire…
  reposEntreEffortsS?: number    // (consolidation 17/11) règle S-15
  prerequisNote?: string
  reference?: { livre: LivreReference; titreAutre?: string; page?: string } // "Escalade Training, p. 84"
}

/** Une salle créée par l'utilisateur. Même identifiant qu'un préréglage = elle le remplace pour lui. */
export type SallePerso = Document & Salle

// ——— Suivi (consolidation 17/11 : tables créées dès la version 3, remplies en phases 4 et 6) ———

/** Forme du jour (décision B10, tâche C-03). Identifiant = la date : une seule forme par jour, même sur deux appareils. */
export interface FormeDuJour extends Document {
  date: DateISO
  sommeil: Note5
  fatigue: Note5
  courbatures: Note5
  douleur: Note5
  peau: Note5
  heuresSommeil?: number
}

/** Une douleur déclarée, datée (tâche C-04). Aucune information médicale libre. */
export interface DouleurDeclaree extends Document {
  date: DateISO
  zone: ZoneDouleur
  niveau: 'alerte' | 'reduction' // alerte = au moins un signe d'arrêt coché (regles-planification.md, A.8)
  signes: string[]               // signes d'alerte cochés, libellés de A.8
  resolueLe?: DateISO
}

/** Résultat d'un test repère (phase 6, tâche C-08). Unité et sens de progrès viennent du catalogue des tests. */
export interface ResultatTest extends Document {
  testId: string
  date: DateISO
  valeur: number
  cote?: 'gauche' | 'droite'
  note?: string
}
```

Le titre complet des livres est une constante de code (`LIVRES`), pas une donnée : `planification` → « Escalade Training : les secrets de la planification (K. Arc, H. Di Domenico, Amphora) », `cent_exercices` → « Escalade Training : 100 exercices spécifiques d'entraînement (mêmes auteurs) », `alimentation` → « Guide de l'alimentation du grimpeur (C. Milenkovic-Messin) ». Aucun contenu des livres n'est recopié : seulement titre et page. (consolidation 17/11) L'app et l'assistant ne prêtent jamais à ces livres une affirmation que nous n'avons pas vérifiée : ils les citent par leur titre, comme lecture conseillée.

**Pourquoi les séances planifiées recopient leurs étapes** : le modèle v1 le prévoyait déjà (« modifier la bibliothèque ne réécrit jamais le passé »). C'est aussi ce qui permet à une future app de montre de lire une séance sans connaître la bibliothèque, et au téléphone d'exécuter une séance créée sur l'ordinateur avec une version plus récente de l'app. Ce n'est pas une valeur « calculable » au sens du modèle : c'est un instantané figé, comme une photocopie datée. Taille estimée : 3 Ko par séance, environ 300 Ko par cycle. (consolidation 17/11) Les **marqueurs**, eux, ne sont pas recopiés dans la version : ils servent seulement aux règles, qui tournent sur l'appareil avec la bibliothèque ; la montre n'en a pas besoin pour exécuter.

### 3.3 Schéma côté serveur (Supabase / PostgreSQL)

Une seule table de documents (plus la liste d'invités, consolidation 17/11). Chaque document local devient une ligne ; le serveur ne lit pas le contenu, il le garde.

Fichier `supabase/migrations/0001_documents.sql` (tâche F2-03) :

```sql
-- Les documents de chaque utilisateur : une ligne par enregistrement de l'app.
create table public.documents (
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  type        text        not null check (type ~ '^[a-zA-Z]{1,40}$'),     -- nom de la table locale : "seancesRealisees"
  id          text        not null check (char_length(id) between 1 and 100),
  contenu     jsonb       not null check (jsonb_typeof(contenu) = 'object' and pg_column_size(contenu) < 200000),
  modifie_le  timestamptz not null,                                       -- copie de contenu.modifieLe
  supprime_le timestamptz,                                                -- copie de contenu.supprimeLe
  recu_le     timestamptz not null default now(),                         -- posé par le serveur : sert de curseur
  primary key (user_id, type, id)
);
create index documents_curseur on public.documents (user_id, recu_le);

-- Sécurité : chacun ne voit et ne modifie que ses lignes.
alter table public.documents enable row level security;
revoke all on table public.documents from anon, authenticated;
grant select, insert, update, delete on table public.documents to authenticated;

create policy "lire ses documents"      on public.documents for select to authenticated using ((select auth.uid()) = user_id);
create policy "ajouter ses documents"   on public.documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "modifier ses documents"  on public.documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "supprimer ses documents" on public.documents for delete to authenticated using ((select auth.uid()) = user_id);

-- À chaque écriture : on note l'heure de réception, et on refuse de remplacer une version plus récente.
create function public.avant_ecriture_document() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.modifie_le < old.modifie_le then
    return old;  -- le serveur a déjà une version plus récente : on la garde telle quelle
  end if;
  new.recu_le := clock_timestamp();
  return new;
end;
$$;
create trigger avant_ecriture before insert or update on public.documents
  for each row execute function public.avant_ecriture_document();

-- Suppression du compte par l'utilisateur lui-même (aucune clé secrète dans l'app).
create function public.supprimer_mon_compte() returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.documents where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;

-- Petite requête appelée chaque semaine par GitHub Actions pour limiter la mise en pause du projet.
-- Elle ne lit aucune donnée.
create function public.ping() returns timestamptz language sql stable set search_path = '' as $$ select now() $$;
grant execute on function public.ping() to anon;
```

(consolidation 17/11, décision B2) **Liste d'invités** — à la suite, dans le même fichier :

```sql
-- Liste d'invités : seules ces adresses peuvent créer un compte (décision B2).
-- Arthur ajoute une adresse avec : insert into public.invites (email) values ('prenom@exemple.fr');
create table public.invites (
  email     text        primary key check (email = lower(email)),   -- toujours en minuscules
  ajoute_le timestamptz not null default now()
);
-- Aucune règle d'accès : la liste n'est lisible ni par l'app ni par un visiteur, seulement depuis le tableau de bord.
alter table public.invites enable row level security;
revoke all on table public.invites from anon, authenticated;

-- Avant toute création de compte : refuser une adresse absente de la liste.
create function public.verifier_invitation() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.invites where email = lower(new.email)) then
    raise exception 'Adresse non invitée';
  end if;
  return new;
end;
$$;
create trigger verifier_invitation before insert on auth.users
  for each row execute function public.verifier_invitation();
```

Un compte déjà créé n'est pas touché (le déclencheur ne joue qu'à la création). Arthur s'inscrit sur la liste **avant** sa première connexion. Côté app, Supabase renvoie une erreur générique (« Database error saving new user », à confirmer à l'essai, § 9 étape 9) que l'écran Compte traduit : « Cette adresse n'est pas sur la liste d'invités. Demande à Arthur de l'ajouter. »

Pourquoi une seule table générique plutôt qu'une table par entité :
- une seule série de règles d'accès à relire, impossible d'oublier une table ;
- le code de synchronisation est le même pour tous les types ;
- ajouter une entité (forme du jour, tests…) ne demande **aucune** modification du serveur ;
- tous les calculs se font sur l'appareil : le serveur n'a pas besoin de colonnes.

Ce qu'on perd : pas de contrôle de cohérence côté serveur (une séance planifiée qui cite une phase supprimée reste possible). L'app tolère ces cas (un document orphelin est ignoré à l'affichage). Si un jour un écran a besoin de chercher côté serveur (la montre, par date), PostgREST sait filtrer dans le JSON : `?type=eq.seancesPlanifiees&contenu->>date=eq.2026-11-17`.

### 3.4 Tables Dexie (version 3 de la base)

```ts
this.version(3).stores({
  seancesRealisees:     'id, date, mode, aEnvoyer',
  reglages:             'id, aEnvoyer',            // documents 'profil' et 'reglages'
  cycles:               'id, debut, aEnvoyer',
  phases:               'id, cycleId, aEnvoyer',   // (consolidation 17/11) anciennement mesocycles
  seancesPlanifiees:    'id, date, cycleId, phaseId, aEnvoyer',
  objectifsSpecifiques: 'id, phaseId, aEnvoyer',
  exercicesPerso:       'id, aEnvoyer',
  salles:               'id, aEnvoyer',
  formes:               'id, date, aEnvoyer',      // (consolidation 17/11) forme du jour, phase 4
  douleurs:             'id, date, aEnvoyer',      // (consolidation 17/11) douleurs déclarées, phase 4
  resultatsTests:       'id, date, testId, aEnvoyer', // (consolidation 17/11) tests repères, phase 6
  etatSynchro:          'cle',                     // { cle, valeur } — jamais synchronisée
  appareil:             'cle',                     // { cle, valeur } — jamais synchronisée, jamais exportée
}).upgrade(...)
```

- Le nom de la base (`appli-escalade`) et les versions 1 et 2 restent déclarés tels quels : Dexie en a besoin pour faire monter les téléphones existants. (consolidation 17/11) Le nouveau nom de l'app, « Get me to 9a », ne change **pas** le nom de la base.
- La migration vers la version 3 ajoute à chaque séance et au profil existants : `aEnvoyer: 1`, `versionFormat: 1`, `creeLe` (= `modifieLe` s'il manque) et, pour le profil, les champs ajoutés en v2 par `completerProfil` (quatre prérequis à `null`, `joursDisponibles: []`, `repereTraction: 'aucun'` ; consolidation 17/11).
- `aEnvoyer` vaut 0 ou 1 (Dexie n'indexe pas les booléens).
- Les tables synchronisées sont listées une seule fois, dans `TABLES_SYNCHRONISEES` (`src/donnees/stockage.ts`), **11 tables** (consolidation 17/11). Le type envoyé au serveur est le nom de la table.

`etatSynchro` contient : `compteId` (identifiant du compte auquel les données de l'appareil sont liées), `compteEmail`, `curseur`, `derniereSynchro`, `derniereErreur`.
`appareil` contient : `cleApiClaude`, `memoriserCle`, et (consolidation 17/11) `cleApiEtat` : `{ etat: 'verifiee' | 'refusee'; le: Horodatage }`, posé par « Vérifier la clé » (C-06).

### 3.5 Calculé, jamais stocké

| Valeur | Comment on l'obtient |
|---|---|
| Statut d'une séance planifiée (consolidation 17/11) | Dans cet ordre : **faite** s'il existe une séance réalisée non supprimée avec ce `seancePlanifieeId` ; **sautée** si `sauteeLe` est posé ; **manquée** si la date est passée ; sinon **aujourd'hui** ou **à venir** |
| Date de début d'une phase et d'une semaine | `cycle.debut + (ordre − 1) × 28 j + (semaine − 1) × 7 j` |
| Cycle en cours, phase en cours, semaine en cours | Cycle validé, non abandonné, qui couvre la date du jour (le plus récemment modifié si deux se chevauchent) |
| Cycle terminé (consolidation 17/11) | Date du jour après la fin du cycle, sans `abandonneLe` |
| Mode du cycle (consolidation 17/11) | « objectif daté » si `objectif.date` existe, sinon « accent tournant » |
| Durée d'une version de séance | Solo : somme des `dureeMin` de ses étapes ; groupe : `dureeMin` annoncée, sinon somme du mini-bloc |
| Marqueurs d'une version de séance (consolidation 17/11) | Union des marqueurs des fiches citées par `origine.refId` (bibliothèque ou exercices personnels) et des fiches de référence des objectifs de groupe (`marqueursVersion`, E-02 ; conversion C-01) |
| Origine d'un plan pour les règles (consolidation 17/11) | Paramètre du moteur : `'assistant'` pendant le tri d'un brouillon de l'assistant, `'utilisateur'` partout ailleurs |
| Objectifs spécifiques d'une phase | Documents `objectifsSpecifiques` dont `phaseId` est celui de la phase |
| Charge, charge de la semaine, monotonie, 48 h, quotas, cumul de risques | Formules de `docs/modele-donnees.md` § 4 et moteur de vérification de l'entraînement (`docs/specs/entrainement/moteur-verification.md`) |
| Prérequis remplis pour un protocole | `manquesPrerequis` (E-03) sur le profil converti (C-01) ; `null` compte comme non rempli |
| Avertissements de sécurité d'un plan | Recalculés à chaque affichage par le moteur de vérification ; seules les clés des avertissements **gardés** (« Je garde ce choix ») sont enregistrées, dans `Cycle.avertissementsGardes` |
| État d'envoi d'une séance réalisée (consolidation 17/11) | `aEnvoyer` local : 1 = « envoi au retour du réseau », 0 = « envoyée » |
| Débrief, avancement d'un objectif de groupe | Comme aujourd'hui (`debrief.ts`, `avancement`) |
| Salle effective | Salle personnelle de même id si elle existe, sinon préréglage |

### 3.6 Ce que les deux autres concepteurs trouveront dans le modèle

- **Expert entraînement** : `PhaseCycle.accent` (cinq qualités ou technique) et `semaines` (charge, allégée, affûtage, transition ; `reductionPct`), `effortPrevu` sur chaque version de séance, `ReglagesEtape` et `objectifSpecifiqueId` sur chaque étape, les bornes des objectifs de groupe, `ExercicePerso.marqueurs` (null tant que non qualifié), `Profil` avec les quatre prérequis à `null` par défaut et `joursDisponibles`, `Reglages.reglesSecurite` (valeurs utilisateur ; bornes et défauts dans son code), `Cycle.avertissementsGardes`, `TraceAssistant`, les documents de suivi `FormeDuJour`, `DouleurDeclaree`, `ResultatTest`. (consolidation 17/11) Le moteur ne lit pas ces types directement : il reçoit ses vues (`SeanceVerif`, `PlanVerif`, `ContexteVerif`), construites par les passerelles de la tâche C-01. Son interface de sortie est l'`Avertissement` de `moteur-verification.md` B.3, qui remplace celle du § 5.5.
- **Concepteur produit et DA** : `Cycle.etat = 'brouillon'` pour construire sur ordinateur sans rien montrer sur le téléphone, `abandonneLe`, l'indicateur de synchronisation (§ 2.3), les écrans de compte et de reprise (§ 4), la séparation téléphone / ordinateur (§ 6).

### 3.7 Besoins de données des autres concepteurs : couverture (consolidation 17/11)

Confrontation des listes « Besoins de données » (`parcours-et-ecrans.md` § 6 et `taches-entrainement.md`) avec ce modèle. « Couvert » = existait ; « ajouté » = ajouté le 17/11 (tâche qui le crée) ; « calculé » = jamais stocké ; « abandonné » = avec la raison.

| Besoin | Décision |
|---|---|
| **Compte et synchronisation** (design) | |
| E-mail du compte, état connecté, durée de validité du code | Couvert : session Supabase, `etatSynchro.compteEmail`, code valable 1 h (§ 2.4) — F2-07 |
| État de synchronisation (à jour, envoi en cours, en attente, dernière synchronisation) | Couvert : `etatSynchro`, `compterEnAttente()` ; « envoi en cours » en mémoire ; mention courte `etatSynchroCourt` — F2-08, F2-10 |
| Plan changé sur un autre appareil pendant l'édition | Couvert : événement `surDonneesChangees`, règle « dernière modification gagne » ; bandeau affiché par D-16 |
| Reprise : séances et profil trouvés sur l'appareil | Calculé (lecture locale) — F2-09 |
| Reprise : contenu du compte, avancement « n sur N » | Abandonné : il faudrait lire le serveur avant de lier, et `synchroniser` n'expose pas d'avancement ; l'écran dit « ce que ton compte contient arrivera aussi ici » |
| Reprise interrompue reprenable | Couvert : `lierCompte` peut être relancé sans doublon — F2-09 |
| Liste des appareils connectés | Abandonné : demande la clé secrète Supabase, absente de l'app |
| Choix « continuer sans compte » mémorisé | Abandonné : l'écran d'accueil n'apparaît qu'une fois ; le profil et Aujourd'hui reproposent le compte |
| **Profil** | |
| Quatre prérequis (design et entraînement) | Couvert : `tractionsStrictes`, `tient15sSur25mm`, `majeur`, `grimpeEnTete` ; noms du moteur (`tractionsStrictesMax`, `test15sSur25mm`, `adulte`) obtenus par C-01 |
| Date de mise à jour de chaque prérequis | Abandonné : l'écran affiche la date de modification du profil (`modifieLe`) |
| Mode habituel solo ou groupe | Couvert : `grimpeSouventEnGroupe` |
| Couleurs de salle modifiables | Couvert : `SallePerso` |
| Jours disponibles | Ajouté : `Profil.joursDisponibles` — F2-02 (saisie : D-20) |
| Zone « autre » | Ajouté : `ZoneDouleur` — F2-02 |
| Repère de traction (sexe dans les sources) | Ajouté : `Profil.repereTraction`, facultatif, `'aucun'` par défaut (B14) — F2-02 (saisie : D-20, affichage : D-24) |
| Poids du corps | Couvert ; jamais envoyé à l'assistant — E-13 |
| **Plan** | |
| Cycle : nom, début, séances par semaine, statut | Couvert ; « terminé » calculé (`cycleTermine`, F2-12) ; validation par « Valider le cycle » (D-14) |
| Origine du plan (utilisateur ou assistant) | Calculé : paramètre du moteur (§ 3.5) |
| Mode du cycle, semaines et réduction d'affûtage | Calculé depuis `objectif.date` et les semaines de type `affutage` |
| Phase : accent, réglage de la semaine allégée | Couvert ; accent élargi à la technique (B13) et `null` tant que non choisi — F2-02 |
| Objectifs spécifiques (0 à 2, test repère, origine) | Couvert : `ObjectifSpecifique` (`phaseId`, `modeleId`, `indicateur`) ; catalogue ajouté — C-02 |
| Types de semaine affûtage et transition | Ajouté : `SemainePlan.type` — F2-02 ; « décharge » du moteur = `allegee` (conversion C-01) |
| Qualité dominante d'une séance (10 valeurs) | Couvert : `SeancePlanifiee.qualite` |
| Effort prévu par version | Ajouté : `effortPrevu` (défaut 7 ou 4, B17) — F2-02 |
| Marqueurs et durée d'une version | Calculés (retirés du stockage) — R-8 |
| Dureté d'une séance | Couvert, **déclarée** (le design la voulait calculée ; la règle S-17 a besoin d'une dureté choisie, défaut proposé par `estDure`) |
| Réglages d'une étape (séries, repos, durée) | Ajouté : `ReglagesEtape` — F2-01 |
| Module d'objectif spécifique dans une étape | Ajouté : `EtapeSeance.objectifSpecifiqueId` (`moduleObjectifId` dans le moteur) — F2-01 |
| Exercice personnel dans une étape | Couvert : `origine: { source: 'perso', refId }` |
| Séance type d'origine | Ajouté : `seanceTypeId`, `variante` — F2-02 |
| Séance sautée volontairement (B11) | Ajouté : `SeancePlanifiee.sauteeLe` — F2-02 (écran : C-05) |
| Échauffement commun de la version groupe | Abandonné en stockage : rappel fixe à l'écran (convention de `seances-types.md`) |
| Version par défaut d'une séance | Abandonné : le mode se choisit le jour même ; le bouton principal suit le mode habituel |
| Lien séance réalisée ↔ séance prévue, séance libre | Couvert : `seancePlanifieeId`, `mode: 'libre'` |
| Avertissements repliés (« Je garde ce choix ») | Ajouté : `Cycle.avertissementsGardes` (remplace `SeancePlanifiee.avertissementsVus`) — F2-02, clés C-01 |
| Avertissement : niveau, portée, cible, message, source | Couvert par la sortie du moteur (B.3) ; forme d'affichage (information, avertissement, arrêt) calculée — C-01 |
| Avertissement : correction en un clic, texte « Pourquoi ? » | Partiel : « Pourquoi ? » affiche la source ; correction seulement pour W-01 (« Décaler au lendemain ») — D-18 |
| Règle d'une séance manquée | Couvert par la règle A3-6 (pas de rattrapage) : texte affiché par D-22 |
| **Objectifs de groupe** | |
| Fiche de référence, blocs, essais max, écart de cotation, repos, accents | Ajoutés : `ObjectifGroupe` — F2-01 ; marqueurs calculés |
| **Bibliothèque et exercices personnels** | |
| Origine (bibliothèque ou perso), séances qui utilisent un exercice | Calculés |
| Exercice personnel : marqueurs (null tant que non qualifié), prérequis, contexte, repos entre efforts | Ajoutés — F2-02 |
| Réponses aux questions de sécurité | Traduites en marqueurs à l'enregistrement (D-13) ; les réponses elles-mêmes ne sont pas gardées |
| Auteur d'un exercice (compte) | Abandonné : les documents sont déjà isolés par compte |
| Prérequis, manques en clair, contre-indication, exclusion de l'assistant | Calculés — E-03, C-01 |
| Traduction lisible des réglages du chrono | Calculé — D-12 |
| **Assistant** | |
| Clé API : présence, état de vérification | Couvert : `appareil.cleApiClaude` ; ajouté `appareil.cleApiEtat` — C-06 |
| Conversation | Abandonné en stockage : gardée en mémoire le temps de la page (données de santé possibles, rien de synchronisé) |
| Proposition, éléments, statut de chaque élément | Calculés en mémoire — C-07 ; un brouillon gardé laisse une `TraceAssistant` sur le cycle |
| Sources, erreurs distinctes | Format `ReponseAssistant` (D.4) — E-11 ; erreurs — C-06 |
| Coût estimé d'une demande | Calculé avant chaque envoi (B6) — C-06 |
| **Suivi et bilans** | |
| Forme du jour (B10) | Ajouté : `FormeDuJour`, table `formes` — F2-02, F2-04 (écran : C-03) |
| Douleur datée avec niveau, signes, résolution | Ajouté : `DouleurDeclaree`, table `douleurs` — F2-02, F2-04 (écran : C-04) |
| Tests repères et résultats | Ajouté : `ResultatTest`, table `resultatsTests` ; catalogue des tests (unité, sens de progrès) — C-08, après la recherche sur la bibliothèque |
| Marqueurs et heure de fin d'une séance réalisée | Couvert : `SeanceRealisee.marqueurs`, `creeLe` |
| Réglages des règles de sécurité | Couvert : `Reglages.reglesSecurite` (nombres et booléens) ; défauts dans `REGLES_PAR_DEFAUT` (E-01) |

## 4. Reprise des données existantes

### 4.1 À la mise à jour de l'app (sans rien faire)

La migration Dexie version 3 (tâche F2-04) s'exécute à la première ouverture de la nouvelle version : rien n'est effacé, les séances et le profil existants reçoivent `aEnvoyer = 1`, `versionFormat = 1`, `creeLe`, et le profil gagne ses quatre prérequis à `null`. L'app continue de fonctionner sans compte, exactement comme avant. Les séances d'exemple n'ont jamais été enregistrées : rien à nettoyer.

### 4.2 À la première connexion

La fonction `situationReprise(compteIdLocal, compteIdSession)` (pure, testée) distingue trois cas :

| Cas | Situation | Ce qui se passe |
|---|---|---|
| `premier_lien` | L'appareil n'a jamais été lié à un compte | On enregistre `compteId` et `compteEmail` dans `etatSynchro`, puis on synchronise : tout ce qui est en `aEnvoyer = 1` part vers le compte, et ce que le compte contient déjà (créé depuis un autre appareil) arrive. **Exception : le profil.** Si l'appareil et le compte ont chacun un profil, on demande : « Garder le profil de ce téléphone » ou « Garder celui du compte ». Le choix « ce téléphone » repose `modifieLe = maintenant` sur le profil local pour qu'il l'emporte. |
| `meme_compte` | Reconnexion au même compte | Synchronisation normale. |
| `autre_compte` | L'appareil contient les données d'un autre compte | On ne mélange jamais deux personnes. Écran : « Ce téléphone contient les données de a…@gmail.com. » Choix : « Sauvegarder dans un fichier puis effacer ce téléphone » (export JSON, vidage des tables synchronisées et de `etatSynchro`, puis lien au nouveau compte) ou « Annuler » (déconnexion). |

**Pourquoi il n'y a ni perte ni doublon**
- Les identifiants sont des UUID créés sur l'appareil ; le serveur range par (utilisateur, type, id). Renvoyer deux fois le même document le remplace, il ne le duplique pas : on peut relancer une synchronisation interrompue autant de fois qu'on veut.
- `aEnvoyer` ne repasse à 0 qu'après confirmation du serveur.
- Les deux seuls documents à identifiant fixe (`profil`, `reglages`) sont traités à part (choix explicite pour le profil ; la règle « plus récent » pour les réglages).

**Déconnexion** : les données restent sur l'appareil (c'est le principe local d'abord), `compteId` aussi. S'il reste des modifications non envoyées, l'app prévient avant de déconnecter. Une reconnexion au même compte reprend là où on en était.

### 4.3 Un utilisateur qui refuse de créer un compte

Rien ne change pour lui : toutes les fonctions de séance, de chrono, de saisie, de débrief et (plus tard) de plan marchent sur l'appareil. Ce qu'il n'a pas : le partage entre téléphone et ordinateur, et la copie de sécurité sur le serveur. L'écran Compte le dit en une phrase et rappelle la sauvegarde par fichier. Il peut créer un compte n'importe quand : la reprise § 4.2 enverra tout son historique. Si la configuration Supabase est absente de la construction (développement local sans `.env.local`), l'écran Compte est masqué et l'app reste en mode local.

## 5. Assistant IA (technique)

### 5.1 Appel direct depuis le navigateur : vérifié

- L'API accepte les requêtes venant d'un navigateur (CORS) **seulement avec l'en-tête `anthropic-dangerous-direct-browser-access: true`**. Le SDK TypeScript l'ajoute quand on passe `dangerouslyAllowBrowser: true` ; sans cette option, il refuse de tourner dans un navigateur.
- La documentation recommande d'appeler l'API depuis un serveur, parce que n'importe qui ayant accès à la page peut lire une clé qui s'y trouve. Elle cite comme cas acceptables les outils internes aux utilisateurs de confiance. Ici, **chaque utilisateur n'expose que sa propre clé, sur son propre appareil** : c'est le cas le moins risqué possible sans serveur.
- Les organisations avec « zéro rétention des données » ou l'API de conformité ne peuvent pas appeler l'API depuis un navigateur (erreur 401 « CORS requests are not allowed for this Organization »). Sans objet pour des comptes personnels ; le message d'erreur de l'app le mentionnera.
- Version d'API actuelle : `anthropic-version: 2026-10-21`.

**Choix : `fetch` direct plutôt que le SDK.** Un seul point d'appel, une vingtaine de lignes, aucun paquet à ajouter, et Arthur voit exactement ce qui part. Requête :

```ts
await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': cle,
    'anthropic-version': '2026-10-21',
    'anthropic-dangerous-direct-browser-access': 'true',
  },
  body: JSON.stringify({
    model: modele,                         // 'claude-haiku-5-5' par défaut
    max_tokens: 16000,
    system: consignesAssistant,            // écrites par l'expert entraînement
    messages: [{ role: 'user', content: contexteEtDemande }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA_PROPOSITION } },
  }),
})
```

(consolidation 17/11) Première version **sans `output_config`** : le format `ReponseAssistant` (`assistant-ia.md` D.4) est une union de formes, et la validation écrite à la main (E-11) puis une relance au plus (E-15) en tiennent lieu. Si les réponses illisibles sont fréquentes à l'usage, ajouter un schéma JSON dans une tâche à part. La réponse JSON se trouve dans le premier bloc `text` de `content`. Erreurs à traduire en français : 401 (clé refusée ou expirée), 429 (trop de demandes, réessayer dans une minute), 5xx et réseau (« Le service ne répond pas, ton plan n'a pas été modifié »).

### 5.2 Où vit la clé

- Table Dexie `appareil`, clé `cleApiClaude`. Cette table n'est **jamais** dans `TABLES_SYNCHRONISEES`, **jamais** dans l'export JSON, jamais écrite dans la console ni dans un message d'erreur. Des tests vérifient ces trois points (F2-04, F2-08, F2-11).
- Case « Mémoriser la clé sur cet ordinateur » (cochée par défaut). Décochée : la clé reste en mémoire le temps de l'onglet.
- Bouton « Oublier la clé ».
- Pas de chiffrement local : une clé chiffrée avec une autre clé rangée à côté ne protège de rien ; mieux vaut le dire que donner une fausse impression de sécurité.
- Conseils affichés à la saisie : créer une clé dédiée à l'app dans la Console Claude, avec une **date d'expiration** (30 jours par exemple) et une limite de dépense sur son organisation ; la désactiver au moindre doute.

**Risques qui restent** : une extension de navigateur malveillante ou une faille dans le code de la page pourrait lire la clé ; quelqu'un qui utilise l'ordinateur aussi. Parades : peu de dépendances, une politique de sécurité du contenu (balise `<meta http-equiv="Content-Security-Policy">` qui n'autorise les connexions que vers l'app, Supabase et `api.anthropic.com`, à poser en phase 5), et l'assistant réservé à l'ordinateur personnel.

### 5.3 Ce que l'assistant reçoit et rend

> (consolidation 17/11) **Remplacé** par `docs/specs/entrainement/assistant-ia.md` : D.3 (`ContexteAssistant`, construit par E-13) et D.4 (`ReponseAssistant`, validé par E-11). Le format `PropositionCycle` ci-dessous est abandonné ; le principe reste : l'assistant n'assemble que des identifiants existants, le code reconstruit les étapes (E-12, C-07). Texte d'origine gardé pour mémoire.

L'assistant ne crée **jamais** de contenu d'exercice : il assemble des identifiants existants. Le code reconstruit les étapes complètes à partir de la bibliothèque et des exercices personnels.

Contexte envoyé (construit par `construireContexte()`) : profil (sans prénom), prérequis, douleurs en cours, réglages de sécurité, plan en cours s'il y en a un, résumé de la bibliothèque (identifiant, nom, qualité, marqueurs, prérequis, contre-indications, durée), exercices personnels (mêmes champs), règles et consignes de l'expert entraînement, titres des livres de référence.

Réponse attendue, forme `PropositionCycle` (schéma JSON passé dans `output_config`) :

```ts
interface PropositionCycle {
  explication: string                  // le pourquoi du plan, en clair
  sources: string[]                    // auteurs, méthodes, livres (titre seulement)
  questions: string[]                  // ce que l'assistant aurait besoin de savoir ; peut être vide
  blocs: {
    ordre: 1 | 2 | 3
    accent: QualitePhysique
    semaines: { numero: 1 | 2 | 3 | 4; type: 'charge' | 'allegee'; reductionPct: number | null }[]
    objectifs: string[]                // objectifs spécifiques proposés, en clair
    seances: {
      semaine: 1 | 2 | 3 | 4
      jour: 1 | 2 | 3 | 4 | 5 | 6 | 7  // 1 = lundi
      nom: string
      qualite: Qualite
      solo: { etapes: { refId: string; reglages: { cle: string; valeur: number }[]; note: string | null }[] }
      groupe: { objectifs: { libelle: string; cible: number; compte: 'blocs_notes' | 'flashs' }[];
                miniBloc: { moment: 'avant' | 'apres'; refIds: string[] } | null } | null
    }[]
  }[]
}
```

Le schéma ne peut pas imposer de minimum ou de maximum numérique (limite des sorties structurées) : **toutes les bornes sont vérifiées par le code**. Une proposition d'ajustement (un bloc, une semaine) suit la même forme, limitée aux blocs concernés.

### 5.4 Modèle par défaut

| Modèle | Prix (par million de jetons, entrée / sortie) | Coût estimé d'un brouillon de cycle (≈ 30 000 jetons envoyés, 8 000 rendus) |
|---|---|---|
| **Claude Haiku 5.5** `claude-haiku-5-5` (défaut) | 0,10 $ / 0,50 $ (requêtes de moins de 100 000 jetons) | ≈ 0,007 $ |
| Claude Sonnet 5.5 `claude-sonnet-5-5` (option « plus soigné ») | 2 $ / 10 $ | ≈ 0,14 $ |

(consolidation 17/11, décisions B5 à B7) Haiku par défaut, Sonnet en option dans les réglages de l'ordinateur ; **avant chaque demande, l'écran affiche le coût estimé** (jetons envoyés estimés à partir de la longueur du contexte, 8 000 jetons rendus au plus, doublé si une relance est nécessaire : « ≈ 0,01 $, au plus 0,02 $ ») ; l'assistant n'existe que dans la mise en page ordinateur. Tâche C-06.

Garder le contexte sous 100 000 jetons (au-delà, Haiku 5.5 coûte cinq fois plus cher) : le résumé de la bibliothèque doit rester compact. Le choix est enregistré dans `Reglages.assistantModele` ; l'identifiant par défaut est une constante unique, facile à changer quand un nouveau modèle sort.

### 5.5 Du JSON au brouillon : la chaîne de validation

> (consolidation 17/11) La chaîne réelle est celle de `assistant-ia.md` D.5 : `construireContexte` (E-13) → appel (C-06) → `traiterReponse` (E-11, E-12, moteur E-09, relance E-15) → découpage en éléments et application élément par élément au plan (C-07, D-23). L'interface `Avertissement` ci-dessous est remplacée par celle de `moteur-verification.md` B.3 (`niveau: 'information' | 'fort'`, `portee`, cible, `source`) et `verifierPlan` reçoit les vues du moteur (`PlanVerif`, `ContexteVerif`) construites par C-01.

```
demande ─► construireContexte() ─► appelerClaude() ─► JSON.parse
        ─► analyserProposition()   structure, identifiants connus, jours et semaines cohérents, bornes
                                   → refus net si invalide (« L'assistant a rendu une proposition inutilisable »)
        ─► versBrouillon()         Cycle (etat 'brouillon', assistant: TraceAssistant) + Mesocycles
                                   + SeancesPlanifiees avec étapes complètes reconstruites par le code
        ─► verifierPlan()          moteur de sécurité de l'expert : rend des avertissements, ne bloque jamais
        ─► affichage du brouillon avec avertissements, explication et sources ─► l'utilisateur modifie ─► « Valider »
```

Interface que le moteur de sécurité doit exposer (contrat entre les deux concepteurs, à confirmer par l'expert) :

```ts
interface Avertissement {
  code: string                     // stable : "48h_maximale", "quota_poutre_intensive", "prerequis_lest"…
  gravite: 'info' | 'attention' | 'arret'
  message: string                  // en clair, tutoiement
  seancesIds: string[]             // séances concernées
}
function verifierPlan(plan: { cycle: Cycle; mesocycles: Mesocycle[]; seances: SeancePlanifiee[] },
                      profil: Profil, reglages: Reglages,
                      realisees: SeanceRealisee[]): Avertissement[]
```

Le même `verifierPlan` sert au constructeur manuel (phase 3) : l'IA n'a aucun chemin qui l'évite.

## 6. Ordinateur et téléphone dans la même app

- **Une seule app, une seule adresse.** La mise en page dépend de la largeur de la fenêtre : `useEcranLarge()` (requête média `(min-width: 1024px)`, seuil du design ; consolidation 17/11), recalculée quand la fenêtre change de taille. Un iPad en paysage aura la mise en page bureau, c'est voulu.
- **Téléphone** : inchangé. Onglets en bas : Aujourd'hui, Programme, Bilans, Profil. Les écrans de séance occupent tout l'écran.
- **Bureau** (consolidation 17/11 : forme du design, `parcours-et-ecrans.md` § 0 et § 3) : barre du haut avec la marque « Get me to 9a », rubriques **Tableau de bord**, **Plan** (constructeur de cycle, phase 3), **Bibliothèque** (filtrable, avec le filtre « mes exercices », phase 3), **Bilans** (Historique aujourd'hui, courbes en phase 6), **Profil** (et réglages, compte), plus un bouton **Assistant** qui ouvre un panneau à droite (phase 5). En phase 2, les rubriques non construites affichent « En construction ».
- **Navigation** : pas de routeur ajouté. L'état actuel (`onglet`, `vue`) reste dans `App.tsx`, qui choisit `MiseEnPageTelephone` ou `MiseEnPageBureau`. Les écrans de séance, de questions, de mises en garde et de débrief restent communs.

| Fonction | Téléphone | Ordinateur |
|---|---|---|
| Séance du jour, chrono, saisie des blocs, trois questions | Oui | Non proposé (texte : « Les séances se lancent depuis ton téléphone ») ; décision B12 |
| Consulter le plan, l'historique, un débrief | Oui | Oui |
| Construire et modifier un plan, la bibliothèque, les exercices personnels | Consultation ; déplacer ou sauter une séance (B11, consolidation 17/11) | Oui |
| Assistant IA, saisie de la clé API | Non | Oui |
| Profil, compte, export, suppression du compte | Oui | Oui |

Les styles de la mise en page bureau s'ajoutent dans une section délimitée de `src/index.css` ; le concepteur DA les reprendra avec la nouvelle identité.

## 7. Apple Watch plus tard : ce qu'on prépare maintenant

Ce qu'une app montre devra faire : lire la séance du jour, dérouler les étapes, faire tourner le chrono avec vibrations, renvoyer le résultat. Une PWA ne peut pas parler à la montre ; la montre passera donc directement par le serveur.

1. **Moteur indépendant de l'affichage** (F2-01) : `src/chrono/sequence.ts` (déjà pur) et `src/moteur/` (déroulé d'une séance solo et d'une séance en groupe sous forme de fonctions `etat + action → nouvel état`, sans React). Les hooks React deviennent de minces enveloppes. La logique à réécrire en Swift tient alors dans quelques fonctions documentées.
2. **Séances autonomes** : une `SeancePlanifiee` contient ses étapes complètes (chrono compris). La montre n'a pas besoin de la bibliothèque.
3. **Format documenté** (F2-13) : `docs/format-seance.md` décrit `SeancePlanifiee`, `EtapeSeance`, `ConfigChrono`, `SeanceRealisee`, avec des fichiers d'exemple et des **vecteurs de référence** (`docs/format-seance/*.json` : une configuration de chrono → la liste exacte des phases attendue), générés et vérifiés par un test. Une app Swift validera son propre chrono contre ces fichiers.
4. **Même accès** : la montre se connectera au même projet Supabase (bibliothèque Swift de Supabase, même code par e-mail), lira `documents` filtrés par type et par date, et écrira une `SeanceRealisee` au même format. La règle « dernière modification gagne » et le curseur `recu_le` s'appliquent tels quels.
5. **Champ `versionFormat`** sur chaque document : une app native ancienne saura qu'elle lit une forme qu'elle ne connaît pas.

Ce qu'on ne fait pas maintenant : aucune ligne de Swift, aucun compte développeur Apple, aucune API dédiée.

## 8. Sécurité et confidentialité

**Public dans le code publié (normal)** : l'adresse du projet Supabase et la clé publiable `sb_publishable_…`. Elles ne donnent accès qu'à ce que les règles RLS autorisent, c'est-à-dire, pour un visiteur non connecté, rien.
**Jamais dans le code ni dans GitHub** : la clé secrète `sb_secret_…` (l'app n'en a pas besoin ; elle ne sert qu'au tableau de bord d'Arthur), le mot de passe de la base, le mot de passe d'application Gmail (il ne vit que dans les réglages SMTP de Supabase), les clés API Claude des utilisateurs.

**Règles d'accès** : RLS activé sur `documents`, droits retirés au rôle anonyme, quatre règles « la ligne appartient à `auth.uid()` ». Une vérification de recette (F2-03) : connecté en tant qu'utilisateur A, lire les documents de B rend une liste vide ; sans session, toute lecture est refusée.

**Données de santé légères** (douleurs déclarées, poids facultatif, sensations) :
- minimisation : poids facultatif, douleurs en zones, aucun texte médical libre obligatoire ;
- projet créé en **région Europe (Paris)** ; chiffrement au repos et en transit assuré par Supabase ;
- transparence (décision B4) : Arthur, administrateur du projet, peut techniquement lire toutes les lignes dans le tableau de bord. L'écran Compte le dit : « Tes données sont gardées sur un serveur en Europe administré par Arthur. Il peut techniquement les voir et s'engage à ne pas les consulter. Elles ne sont ni vendues ni partagées. » (consolidation 17/11) ;
- aucune mesure d'audience, aucun traceur.

**Export** : « Sauvegarder mes données » exporte toutes les tables synchronisées dans un fichier JSON (format version 2, l'import accepte encore la version 1). La table `appareil` (clé API) n'est jamais exportée.
**Suppression du compte** : bouton dans l'écran Compte, double confirmation (« Tape SUPPRIMER »), appel de `supprimer_mon_compte()`, puis vidage des tables locales et de `etatSynchro`. Un export est proposé juste avant.

**Inscriptions** (consolidation 17/11, décision B2) : seules les adresses de la liste d'invités (table `invites`, § 3.3) peuvent créer un compte. Arthur ajoute une adresse par une ligne SQL dans le tableau de bord.

## 9. Ce qu'Arthur doit faire lui-même

Personne d'autre ne peut créer ces comptes. Compter une heure et quart en tout (consolidation 17/11 : avec la Gmail dédiée et la liste d'invités). Les noms de menus peuvent légèrement changer : chercher le mot indiqué. Ces étapes se font **pendant la phase 2, après la tâche F2-03** (le fichier SQL doit exister) et **avant F2-07** (la connexion a besoin du projet).

**Étape 0 — Créer l'adresse Gmail dédiée (10 min, consolidation 17/11, décision A3)**
1. Créer un nouveau compte Google réservé à l'app (par exemple une adresse du type « getmeto9a.app@gmail.com », selon ce qui est libre). C'est l'adresse qui enverra les codes.
2. Sur ce compte, activer la validation en deux étapes (myaccount.google.com → Sécurité) : elle est exigée pour l'étape 5.
3. Ranger le mot de passe dans son gestionnaire de mots de passe.

**Étape 1 — Créer le compte Supabase (5 min)**
1. Aller sur supabase.com, « Start your project », se connecter avec son compte GitHub.
2. Créer une organisation : nom « Get me to 9a », offre **Free** (consolidation 17/11 ; le projet garde le nom `appli-escalade`).

**Étape 2 — Créer le projet (5 min)**
1. « New project » : nom `appli-escalade`, région **West EU (Paris)**.
2. Mot de passe de la base : cliquer « Generate », le ranger dans son gestionnaire de mots de passe. L'app n'en a pas besoin ; ne le donner à personne, ne le coller nulle part.
3. Attendre que le projet soit prêt (une à deux minutes).

**Étape 3 — Créer la table et ses règles (5 min)**
1. Menu de gauche, « SQL Editor », « New query ».
2. Coller tout le contenu du fichier `supabase/migrations/0001_documents.sql` du dépôt, cliquer « Run ». Le message doit être « Success. No rows returned ».
3. Vérifier dans « Table Editor » que les tables `documents` et `invites` existent et portent la mention « RLS enabled ».

**Étape 3 bis — S'inscrire sur la liste d'invités (2 min, consolidation 17/11, décision B2)**
1. « SQL Editor », « New query », coller en remplaçant l'adresse : `insert into public.invites (email) values ('ton.adresse@exemple.fr');` (en minuscules), « Run ».
2. Faire de même pour chaque ami, maintenant ou plus tard. Sans cette ligne, l'app refuse l'inscription.

**Étape 4 — Régler la connexion par e-mail (10 min)**
1. « Authentication » → « Sign In / Providers » → « Email » : activé ; laisser « Confirm email » activé ; « Email OTP Expiration » : 3600 (une heure) ; « Email OTP Length » : 6.
2. « Authentication » → « URL Configuration » → « Site URL » : `https://arthur-pixel-ctrl.github.io/appli-escalade/`.
3. « Authentication » → « Emails » (modèles) : dans **« Magic Link »** et dans **« Confirm signup »**, remplacer le contenu par :
   - Sujet : `Ton code Get me to 9a : {{ .Token }}` (consolidation 17/11)
   - Corps : `<p>Voici ton code pour te connecter à Get me to 9a :</p><p style="font-size:28px;letter-spacing:4px"><strong>{{ .Token }}</strong></p><p>Saisis-le dans l'app. Il est valable une heure. Si tu n'as rien demandé, ignore cet e-mail.</p>`

**Étape 5 — Brancher l'envoi des e-mails (15 min)**
Sans cette étape, seuls les membres du projet Supabase reçoivent les codes, et 2 par heure au plus.

(consolidation 17/11, décision A3) **Adresse Gmail dédiée créée à l'étape 0.**
1. Sur ce compte Google dédié : vérifier que la validation en deux étapes est active (myaccount.google.com → Sécurité).
2. Créer un « mot de passe d'application » (myaccount.google.com/apppasswords), nom « Supabase ». Copier les 16 caractères.
3. Supabase → « Authentication » → « Emails » → « SMTP Settings » → activer « Enable custom SMTP » :
   hôte `smtp.gmail.com`, port `587`, utilisateur = l'adresse Gmail dédiée, mot de passe = le mot de passe d'application, adresse d'expéditeur = l'adresse Gmail dédiée, nom d'expéditeur `Get me to 9a`.
4. « Authentication » → « Rate Limits » : laisser 30 e-mails par heure (largement assez).
Conséquence : les amis verront l'adresse Gmail dédiée comme expéditeur.

Plus tard, si besoin (non retenu le 17/11), plus propre — un nom de domaine (environ 10 € par an) et Resend (gratuit) : Resend n'écrit à d'autres adresses que la sienne qu'après vérification d'un domaine. Arthur achète un domaine, l'ajoute dans Resend, recopie les enregistrements DNS demandés, puis met les réglages SMTP de Resend dans Supabase.

**Étape 6 — Récupérer les deux valeurs publiques (2 min)**
« Project Settings » → « API Keys » (et « Data API » pour l'adresse) :
- l'adresse du projet, de la forme `https://xxxxxxxx.supabase.co` ;
- la **clé publiable**, qui commence par `sb_publishable_`.
Ne jamais copier la clé qui commence par `sb_secret_`.

**Étape 7 — Les donner à GitHub (5 min)**
Dépôt `appli-escalade` sur github.com → « Settings » → « Secrets and variables » → « Actions » → onglet **« Variables »** → « New repository variable », deux fois :
- `VITE_SUPABASE_URL` = l'adresse du projet ;
- `VITE_SUPABASE_CLE_PUBLIQUE` = la clé publiable.
Ce sont des « variables » et non des « secrets » parce que ces deux valeurs sont publiques par nature : elles seront de toute façon lisibles dans l'app publiée.

**Étape 8 — Pour lancer l'app sur son ordinateur (2 min)**
Créer à la racine du dépôt un fichier `.env.local` (il est ignoré par Git) avec :
```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_CLE_PUBLIQUE=sb_publishable_xxxxxxxx
```

**Étape 9 — Essayer (5 min, après F2-07)**
Ouvrir l'app, Profil → Compte, saisir son e-mail, recevoir le code, le saisir. Dans Supabase, « Authentication » → « Users » : son adresse apparaît. (consolidation 17/11) Essayer aussi une adresse **absente** de la liste d'invités : l'app doit afficher « Cette adresse n'est pas sur la liste d'invités ». Noter le message si c'est autre chose.

**À savoir ensuite**
- Si l'app affiche « Synchronisation impossible » plusieurs jours de suite et que le tableau de bord indique « Paused » : cliquer « Restore project ». Les données sont conservées, les téléphones renvoient ce qu'ils ont en attente.
- Pour la phase 5 (assistant), chaque utilisateur crée sa propre clé API dans la Console Claude ; Arthur n'a rien à faire pour les autres.

## 10. Questions que seul Arthur peut trancher

> (consolidation 17/11) **Toutes tranchées** le 17/11 (`docs/decisions-phase-1.md`) : 1 code à 6 chiffres (B1) ; 2 Gmail dédiée (A3) ; 3 liste d'invités (B2) ; 4 Haiku par défaut, Sonnet en option, coût affiché (B5, B6) ; 5 transparence oui (B4) ; 6 séance masquée sur ordinateur (B12) ; 7 `CLAUDE.md` aligné par le gérant. Nom de l'app : « Get me to 9a » (18/11).

1. **Code plutôt que lien** : sur iPhone, un lien e-mail connecterait Safari et pas l'app installée. On remplace le lien par un code à 6 chiffres partout. D'accord ?
2. **Expéditeur des e-mails** : une adresse Gmail (la sienne ou une dédiée), ou un nom de domaine à environ 10 € par an ?
3. **Inscriptions** : ouvertes à toute personne qui connaît l'adresse de l'app, ou réservées à une liste d'adresses ?
4. **Modèle IA par défaut** : Haiku 5.5 (quasi gratuit, moins fin) ou Sonnet 5.5 (environ 0,15 $ par brouillon de cycle) ?
5. **Transparence** : d'accord pour écrire dans l'app que les données sont sur un serveur en Europe administré par Arthur, qui peut techniquement les voir ?
6. **Séance sur ordinateur** : la masquer (proposition) ou la permettre quand même ?
7. **Consigne des modèles** : `CLAUDE.md` dit « Agents en Opus par défaut » alors que le plan v2 confie le code à Sonnet et Haiku. À aligner (le gérant).

## 11. Découpage de la phase 2

Détail dans `docs/specs/architecture/taches-phase-2.md` : 16 tâches autonomes. (consolidation 17/11) L'ordre réel, mêlé aux tâches du design et amendé, est dans `docs/backlog-v2.md` (12 vagues pour la phase 2) ; F2-14 y est fusionnée avec D-10.

| Id | Titre | Modèle |
|---|---|---|
| F2-01 | Moteur de séance indépendant de l'affichage | Sonnet |
| F2-02 | Modèle de données v2 : types et documentation | Sonnet |
| F2-03 | Base serveur Supabase : script SQL et guide | Sonnet |
| F2-04 | Base locale version 3 et écriture unique | Sonnet |
| F2-05 | Profil : les quatre prérequis | Sonnet |
| F2-06 | Client Supabase et configuration | Haiku |
| F2-07 | Connexion par code reçu par e-mail | Sonnet |
| F2-08 | Moteur de synchronisation | Sonnet |
| F2-09 | Lien du compte et reprise des données | Sonnet |
| F2-10 | Synchronisation automatique et indicateur | Sonnet |
| F2-11 | Export complet, import v2, suppression du compte | Sonnet |
| F2-12 | Accès au plan et valeurs dérivées | Sonnet |
| F2-13 | Format de séance documenté (préparation montre) | Sonnet |
| F2-14 | Mise en page bureau : squelette et navigation | Sonnet |
| F2-15 | Garder le projet Supabase éveillé | Haiku |
| F2-16 | Recette de fin de phase et README | Haiku |

Hors phase 2 mais préparé : l'assistant (§ 5, phase 5), le constructeur de plan et la bibliothèque filtrable (phase 3), l'affichage du plan sur le téléphone (phase 4). Suggestion pour plus tard : enregistrer l'état d'une séance en cours dans Dexie, pour la reprendre si iOS ferme l'app en arrière-plan ; le moteur pur de F2-01 le rend facile.

## 12. Sources consultées (17/11/2026)

- Supabase, tarifs et limites de l'offre gratuite : https://supabase.com/pricing
- Supabase, envoi d'e-mails et SMTP personnalisé : https://supabase.com/docs/guides/auth/auth-smtp
- Supabase, connexion sans mot de passe (lien ou code) : https://supabase.com/docs/guides/auth/auth-email-passwordless
- Supabase, clés d'API (publiable, secrète, fin des anciennes clés) : https://supabase.com/docs/guides/api/api-keys
- Supabase, règles RLS : https://supabase.com/docs/guides/database/postgres/row-level-security
- Dexie Cloud, tarifs : https://dexie.org/cloud/pricing
- Firebase, limites d'Authentication : https://firebase.google.com/docs/auth/limits
- Resend, domaine de test limité à sa propre adresse : https://resend.com/docs/knowledge-base/403-error-resend-dev-domain
- Google, limites du serveur SMTP de Gmail : https://support.google.com/a/answer/176600
- PWA iOS et liens magiques : https://intercom.help/progressier/en/articles/10433517-can-you-use-magic-links-in-a-pwa ; WebKit, stockage non partagé avec Safari : https://bugs.webkit.org/show_bug.cgi?id=181849
- Claude, SDK TypeScript (`dangerouslyAllowBrowser`) : https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript
- Claude, authentification et applications dans le navigateur : https://platform.claude.com/docs/en/manage-claude/authentication
- Claude, modèles : https://platform.claude.com/docs/en/models/overview ; tarifs : https://platform.claude.com/docs/en/about-claude/pricing
- Claude, sorties structurées : https://platform.claude.com/docs/en/build-with-claude/structured-outputs

Non vérifié en détail : l'hébergement gratuit de PocketBase ; l'effet exact d'une requête hebdomadaire sur la mise en pause Supabase ; les libellés exacts des menus du tableau de bord Supabase et le modèle d'e-mail utilisé à la toute première inscription (d'où la consigne de modifier les deux modèles).
