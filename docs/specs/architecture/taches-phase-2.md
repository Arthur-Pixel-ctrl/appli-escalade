# Tâches de la phase 2 — Fondations

17 novembre 2026 · Auteur : architecte · Référence : `architecture.md` (même dossier).
Phase 2 : comptes, synchronisation, modèle de données v2, reprise des données existantes, squelette de la mise en page ordinateur, moteur de séance séparé de l'affichage. La nouvelle direction artistique n'est pas ici (tâches du concepteur DA).

## Mode d'emploi pour le gérant

- **Avant de distribuer F2-01**, copier `architecture.md` dans le dépôt sous `docs/architecture-v2.md` (un commit « Architecture v2 »). Plusieurs tâches y renvoient par numéro de section.
- Donner à chaque développeur : `CLAUDE.md` (il est lu automatiquement), le bloc **« Règles communes »** ci-dessous, puis **une seule tâche**. Rien d'autre n'est nécessaire.
- Les étapes 1 à 8 d'Arthur (`docs/architecture-v2.md` § 9) doivent être faites **après F2-03 et avant F2-07**.
- Note : `CLAUDE.md` dit « Agents en Opus par défaut » ; le plan v2 confie le code à Sonnet et Haiku. Les modèles ci-dessous suivent le plan v2.

### Ordre et parallélisme

Au plus trois développeurs en même temps, jamais sur les mêmes fichiers.

| Vague | Tâches en parallèle | Condition |
|---|---|---|
| 1 | F2-01, F2-03 | — |
| 2 | F2-02, F2-06 | F2-01 fini pour F2-02 ; F2-03 fini pour F2-06 |
| 3 | F2-04, F2-13, F2-15 | F2-02 fini (F2-04, F2-13) ; F2-06 fini (F2-15) |
| 4 | F2-05, F2-07, F2-08 | F2-04 fini (les trois) ; F2-06 fini (F2-07, F2-08) |
| 5 | F2-09, F2-12 | F2-07 et F2-08 finis (F2-09) ; F2-04 fini (F2-12) |
| 6 | F2-10 | F2-09 fini |
| 7 | F2-11 | F2-10 fini |
| 8 | F2-14 | F2-11 et F2-05 finis |
| 9 | F2-16 | toutes les autres finies |

| Id | Titre | Modèle | Dépend de |
|---|---|---|---|
| F2-01 | Moteur de séance indépendant de l'affichage | Sonnet | — |
| F2-02 | Modèle de données v2 : types et documentation | Sonnet | F2-01 |
| F2-03 | Base serveur Supabase : script SQL et guide | Sonnet | — |
| F2-04 | Base locale version 3 et écriture unique | Sonnet | F2-02 |
| F2-05 | Profil : les quatre prérequis | Sonnet | F2-04 |
| F2-06 | Client Supabase et configuration | Haiku | F2-03 |
| F2-07 | Connexion par code reçu par e-mail | Sonnet | F2-04, F2-06 |
| F2-08 | Moteur de synchronisation | Sonnet | F2-04, F2-06 |
| F2-09 | Lien du compte et reprise des données | Sonnet | F2-07, F2-08 |
| F2-10 | Synchronisation automatique et indicateur | Sonnet | F2-09 |
| F2-11 | Export complet, import v2, suppression du compte | Sonnet | F2-10 |
| F2-12 | Accès au plan et valeurs dérivées | Sonnet | F2-04 |
| F2-13 | Format de séance documenté (préparation montre) | Sonnet | F2-02 |
| F2-14 | Mise en page bureau : squelette et navigation | Sonnet | F2-05, F2-11 |
| F2-15 | Garder le projet Supabase éveillé | Haiku | F2-06 |
| F2-16 | Recette de fin de phase et README | Haiku | toutes |

---

## Règles communes à toutes les tâches

À lire avant la tâche. Elles complètent `CLAUDE.md`.

1. **Contexte.** App d'entraînement à l'escalade : PWA React 19 + TypeScript + Vite, hors ligne, données sur l'appareil avec Dexie (IndexedDB), publiée sur GitHub Pages. Elle est utilisée tous les jours sur iPhone (app installée sur l'écran d'accueil). La phase 2 ajoute des comptes (Supabase), une synchronisation entre téléphone et ordinateur, et une mise en page ordinateur. Le propriétaire, Arthur, est peu technique et lit le code : noms en français, commentaires courts qui expliquent le pourquoi, pas d'abstraction inutile.
2. **Ne rien casser sur iPhone.** Tout ce qui marche aujourd'hui doit marcher pareil : séance solo, chrono, séance en groupe, trois questions, débrief, historique, profil, sauvegarde par fichier, mise à jour de l'app. Ne jamais supprimer ni renommer la base Dexie `appli-escalade`, ni modifier les déclarations de ses versions 1 et 2.
3. **Ne toucher que les fichiers cités** par la tâche (plus le tableau « État » du README). Si un autre fichier doit changer, s'arrêter et le signaler au gérant.
4. **TypeScript strict du projet** : `verbatimModuleSyntax` (écrire `import type` pour les types), `erasableSyntaxOnly` (pas d'`enum`, pas de `namespace`, pas de propriétés de constructeur), `noUnusedLocals`. Les imports locaux portent l'extension `.ts` / `.tsx`.
5. **Tests** : Vitest, environnement `node` (pas de `window`, pas de `document`). Un module qui touche `document` ou `window` au chargement doit le protéger par `typeof document !== 'undefined'`. Pour tester Dexie : `import 'fake-indexeddb/auto'` en **première ligne** du fichier de test (paquet ajouté par F2-04).
6. **Aucun secret dans le code ni dans Git** : jamais de clé `sb_secret_…`, de mot de passe ou de clé API Claude. Les seules valeurs Supabase autorisées sont l'adresse du projet et la clé publiable `sb_publishable_…`, lues dans `import.meta.env`.
7. **Avant de livrer** : `npm run build`, `npm run test` et `npm run lint` passent ; les tests existants (31 au départ) passent toujours.
8. **Pour finir** : ajouter une ligne au tableau « État » du README (`| F2-xx | titre court | Fait |`), puis un commit en français commençant par l'identifiant (`F2-04 : base locale version 3 et écriture unique`), poussé selon les consignes du gérant.
9. **Rapport au gérant** (10 lignes au plus) : ce qui a été fait, fichiers touchés, tests ajoutés, ce qu'Arthur doit vérifier sur iPhone, difficultés.

---

## F2-01 — Moteur de séance indépendant de l'affichage

**Objectif** : sortir la logique d'exécution des séances (solo, groupe) et l'horloge du chrono dans des fonctions TypeScript pures, sans React, sans aucun changement visible.
**Dépend de** : rien. **En parallèle possible** : F2-03 (aucun fichier commun).
**Modèle** : Sonnet.

**Pourquoi** : une future app Apple Watch devra rejouer exactement la même logique ; et une logique pure se teste sans écran.

**Fichiers**
- Créer : `src/moteur/types.ts`, `src/moteur/seanceSolo.ts`, `src/moteur/seanceGroupe.ts`, `src/moteur/horloge.ts`, `src/moteur/moteur.test.ts`, `src/moteur/independance.test.ts`.
- Modifier : `src/donnees/seanceExemple.ts`, `src/donnees/seanceGroupeExemple.ts`, `src/ecrans/SeanceSolo.tsx`, `src/ecrans/SeanceGroupe.tsx`, `src/chrono/useChrono.ts`, `src/donnees/base.ts` (un import), `src/App.tsx` (imports seulement).
- Lire d'abord : ces fichiers, plus `src/chrono/sequence.ts` et `src/donnees/bibliotheque/types.ts`.

**Étapes**
1. `src/moteur/types.ts` — y déplacer les types de séance. Contenu exact :
   ```ts
   import type { Forme, Preuve } from '../donnees/bibliotheque/types.ts'

   /** Une étape prête à être exécutée : tout ce qu'il faut pour l'afficher et lancer le chrono. */
   export type EtapeSeance = Forme & {
     id: string
     titre: string
     resume: string
     consigne: string
     dureeMin: number // durée indicative, repos compris
     preuve?: Preuve
     // D'où vient l'étape. Information seulement : l'étape est autonome, elle ne relit jamais la bibliothèque.
     origine?: { source: 'bibliotheque' | 'perso'; refId: string; reglages?: Record<string, number> }
   }
   export interface SeanceGuidee { nom: string; etapes: EtapeSeance[] }
   export interface ObjectifGroupe { libelle: string; cible: number; couleurConseillee?: string; compte: 'blocs_notes' | 'flashs' }
   export interface SeanceGroupe { nom: string; reposConseilleS: number; objectifs: ObjectifGroupe[] }
   export interface BlocGrimpe { couleur: string; essais: number; resultat: 'flash' | 'enchaine' | 'non_enchaine'; objectif: number }
   ```
   Ce fichier ne contient que des types.
2. `src/donnees/seanceExemple.ts` : supprimer les types `Etape`, `Preuve`, `SeanceGuidee` locaux ; importer `SeanceGuidee` depuis `../moteur/types.ts`. Retirer `dureeMin: 105` de la séance et ajouter `dureeMin` à chaque étape : échauffement 20, pieds 10, échelles 7, bloc limite 40, antagonistes 12, mobilité 15. Ne rien changer d'autre aux textes ni aux réglages.
3. `src/donnees/seanceGroupeExemple.ts` : retirer les types et la fonction `avancement` ; garder seulement `SEANCE_GROUPE_EXEMPLE`, typée avec `SeanceGroupe` importé de `../moteur/types.ts`.
4. `src/moteur/seanceSolo.ts` — fonctions pures, l'heure est toujours passée en paramètre (jamais `Date.now()` à l'intérieur) :
   ```ts
   export type StatutEtape = 'a_faire' | 'faite' | 'passee'
   export interface EtatSeanceSolo { debutMs: number; statuts: StatutEtape[] }
   export function demarrerSeanceSolo(seance: SeanceGuidee, maintenantMs: number): EtatSeanceSolo
   export function etapeEnCours(etat: EtatSeanceSolo): number          // première étape « a_faire », −1 si tout est traité
   export function marquerEtape(etat: EtatSeanceSolo, statut: 'faite' | 'passee'): EtatSeanceSolo // ne change rien si −1
   export function minutesEcoulees(etat: { debutMs: number }, maintenantMs: number): number // arrondi, jamais négatif
   export function bilanEtapes(seance: SeanceGuidee, etat: EtatSeanceSolo): { titre: string; statut: StatutEtape }[]
   ```
   `minutesEcoulees` reproduit exactement `minutesDepuis` de `SeanceSolo.tsx` (`Math.max(0, Math.round(ms / 60000))`).
5. `src/moteur/seanceGroupe.ts` :
   ```ts
   export interface EtatSeanceGroupe { debutMs: number; blocs: BlocGrimpe[]; position: number }
   export function demarrerSeanceGroupe(maintenantMs: number): EtatSeanceGroupe
   export function noterBloc(etat: EtatSeanceGroupe, couleur: string, essais: number, enchaine: boolean): EtatSeanceGroupe
     // résultat : 'non_enchaine' si !enchaine, 'flash' si enchaîné en 1 essai, 'enchaine' sinon ; objectif = etat.position
   export function annulerDernierBloc(etat: EtatSeanceGroupe): EtatSeanceGroupe
   export function changerObjectif(etat: EtatSeanceGroupe, position: number): EtatSeanceGroupe
   export function avancement(objectif: ObjectifGroupe, position: number, blocs: BlocGrimpe[]): number // déplacée telle quelle
   export function bilanObjectifs(seance: SeanceGroupe, blocs: BlocGrimpe[]): { libelle: string; cible: number; fait: number }[]
   ```
6. `src/moteur/horloge.ts` — l'horloge du chrono, extraite de `useChrono.ts` :
   ```ts
   export type Marche = 'pret' | 'en_cours' | 'en_pause' | 'termine'
   export interface Horloge { marche: Marche; departMs: number; dejaEcouleS: number }
   export const HORLOGE_PRETE: Horloge = { marche: 'pret', departMs: 0, dejaEcouleS: 0 }
   export function demarrerHorloge(maintenantMs: number): Horloge
   export function mettreEnPause(h: Horloge, maintenantMs: number): Horloge
   export function reprendreHorloge(h: Horloge, maintenantMs: number): Horloge
   export function terminerHorloge(h: Horloge): Horloge
   export function secondesEcoulees(h: Horloge, maintenantMs: number): number // en pause : dejaEcouleS
   ```
7. `src/chrono/useChrono.ts` : garder le même comportement et la même interface publique (`marche`, `etat`, `phases`, `demarrer`, `pause`, `reprendre`), mais ranger l'horloge dans un `useState<Horloge>` ou un `useRef<Horloge>` manipulé par les fonctions de `horloge.ts`. Les signaux, l'écran allumé et l'intervalle de 100 ms restent dans le hook.
8. `src/ecrans/SeanceSolo.tsx` et `src/ecrans/SeanceGroupe.tsx` : remplacer la logique locale par un `useState` qui contient `EtatSeanceSolo` / `EtatSeanceGroupe`, modifié uniquement par les fonctions du moteur. **Le JSX et les textes ne changent pas.** `SeanceSolo` exporte encore `StatutEtape` (ré-export depuis le moteur) si `App.tsx` en a besoin.
9. `src/App.tsx` : n'adapter que les imports (et `avancement` → `bilanObjectifs` si plus simple). `src/donnees/base.ts` : importer `BlocGrimpe` depuis `../moteur/types.ts`.
10. `src/moteur/moteur.test.ts` : au moins ces cas —
    solo : démarrer une séance de 3 étapes → 3 « a_faire », étape en cours 0 ; marquer faite puis passée → étape en cours 2 ; tout marquer → −1 ; marquer encore → état inchangé ; `minutesEcoulees` à +90 s → 2 (arrondi) et avant le début → 0 ;
    groupe : un bloc enchaîné en 1 essai → « flash », en 3 → « enchaine », non enchaîné → « non_enchaine » ; l'objectif enregistré est la position courante ; `annulerDernierBloc` ; `avancement` en mode « flashs » ne compte que les flashs ;
    horloge : démarrer à 1 000 ms → 5 s écoulées à 6 000 ms ; pause à 6 000, reprise à 10 000 → 7 s à 12 000 ; en pause, le temps ne bouge pas.
11. `src/moteur/independance.test.ts` : lit avec `node:fs` tous les `.ts` (hors `.test.ts`) de `src/moteur/` et le fichier `src/chrono/sequence.ts`, et vérifie qu'aucun n'importe `react`, `dexie`, `@supabase`, `/ecrans/` ni `/donnees/base`. (Exception autorisée : `import type` depuis `donnees/bibliotheque/types.ts`.) Chemin : `new URL('./', import.meta.url)`.

**Critères d'acceptation**
- Aucune différence visible dans l'app ; `grep -r "useState\|useEffect" src/moteur` ne renvoie rien.
- Tous les tests passent, dont au moins 12 nouveaux.
- `SeanceSolo.tsx` et `SeanceGroupe.tsx` ne contiennent plus de calcul de statut, de flash ou d'avancement.

**Pièges**
- Ne pas déplacer `src/chrono/sequence.ts` ni changer `ConfigChrono` : beaucoup de fichiers en dépendent.
- React (mode strict) appelle deux fois les fonctions d'initialisation : elles doivent être pures.
- Ne pas mettre `Date.now()` dans le moteur : on passe l'heure en paramètre (c'est ce qui le rend testable et transposable).
- `Forme` de la bibliothèque a pour la forme « essais » des champs `essaisParSerie` et `reposSeriesS` facultatifs : les étapes d'exemple n'en ont pas, c'est normal.

**Vérification sur iPhone (Arthur, après mise en ligne)** : une séance solo complète (une étape passée, un chrono avec pause et reprise), une séance en groupe (3 blocs, annuler le dernier, changer d'objectif), puis le débrief : tout est identique à avant.

---

## F2-02 — Modèle de données v2 : types et documentation

**Objectif** : écrire les types TypeScript de tous les documents de la v2 et la section 8 du modèle de données, sans changer le comportement de l'app.
**Dépend de** : F2-01. **En parallèle possible** : F2-06.
**Modèle** : Sonnet.

**Fichiers**
- Créer : `src/donnees/modele.ts`, `src/donnees/exemplesV2.ts`, `src/donnees/modele.test.ts`.
- Modifier : `src/donnees/profil.ts`, `src/donnees/base.ts`, `src/donnees/debrief.test.ts` (fabrique de séance du test), `docs/modele-donnees.md`.
- Lire d'abord : `docs/architecture-v2.md` §§ 3.1 à 3.5 (les types y sont donnés en entier), `src/moteur/types.ts`, `src/donnees/bibliotheque/types.ts`, `src/donnees/salles.ts`.

**Étapes**
1. `src/donnees/profil.ts` : ajouter au type `Profil` les quatre prérequis, avec leur commentaire :
   `tractionsStrictes: number | null`, `tient15sSur25mm: boolean | null`, `majeur: boolean | null`, `grimpeEnTete: boolean | null` (null = pas encore renseigné, compte comme « non rempli » par prudence). Les mettre à `null` dans `PROFIL_VIDE`. Ajouter `export function completerProfil(p: Partial<Profil>): Profil` qui part de `PROFIL_VIDE` et recopie les champs présents : elle sert à lire sans erreur les profils enregistrés avant la v2 (dans `lireProfil` de `base.ts`, et à l'import).
2. `src/donnees/modele.ts` : recopier les types de `docs/architecture-v2.md` § 3.2 (partie « Fichier `src/donnees/modele.ts` ») : `DateISO`, `Horodatage`, `QualitePhysique`, `Durete`, `Document`, `ProfilEnregistre` (le type `Profil` reste dans `profil.ts` et est ré-exporté), `Reglages`, `TraceAssistant`, `Cycle`, `SemainePlan`, `Mesocycle`, `ObjectifSpecifique`, `VersionSolo`, `VersionGroupe`, `SeancePlanifiee`, `EtapeRealisee`, `SeanceRealisee`, `LivreReference`, `ExercicePerso`, `SallePerso`. Ajouter :
   ```ts
   export const QUALITES_PHYSIQUES: QualitePhysique[] = ['doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance']
   export const LIVRES: Record<LivreReference, string> = {
     planification: 'Escalade Training : les secrets de la planification (K. Arc, H. Di Domenico, Amphora)',
     cent_exercices: 'Escalade Training : 100 exercices spécifiques d’entraînement (K. Arc, H. Di Domenico, Amphora)',
     alimentation: 'Guide de l’alimentation du grimpeur (C. Milenkovic-Messin)',
     autre: 'Autre ouvrage',
   }
   ```
3. `src/donnees/base.ts` : supprimer l'interface `SeanceRealisee` locale et la remplacer par `import type { SeanceRealisee } from './modele.ts'` plus `export type { SeanceRealisee }` (les autres fichiers continuent d'importer depuis `base.ts`). `ProfilEnregistre` vient aussi de `modele.ts`. Dans `enregistrerSeance`, ajouter `versionFormat: 1`. Dans `enregistrerProfil`, ajouter `versionFormat: 1` et `creeLe` (celui de l'enregistrement existant s'il y en a un, sinon maintenant) : le type `ProfilEnregistre` les exige désormais. Dans `lireProfil`, passer le résultat par `completerProfil` (en gardant `null` si rien n'est enregistré). Le type `Brouillon` reste dans `base.ts` et exclut aussi `versionFormat`.
4. `src/donnees/debrief.test.ts` : ajouter `versionFormat: 1` dans la fabrique `seance()`. Rien d'autre.
5. `src/donnees/exemplesV2.ts` : des exemples typés, réutilisés par d'autres tâches : `EXEMPLE_CYCLE` (début lundi 2026-11-16, état « valide », 3 séances par semaine), `EXEMPLE_MESOCYCLES` (3 blocs : doigts, puissance, resistance ; semaines 1 à 3 « charge », semaine 4 « allegee » avec `reductionPct: 50`), `EXEMPLE_SEANCE_PLANIFIEE` (cycle et bloc 1, semaine 1, date 2026-11-17, `solo` construit à partir de `SEANCE_EXEMPLE` avec `durete: 'dure'` et `marqueurs: ['poutre', 'bloc_limite']`, `groupe` à partir de `SEANCE_GROUPE_EXEMPLE`, `avertissementsVus: []`). Identifiants : UUID écrits en dur. Dates de création fixes.
6. `src/donnees/modele.test.ts` : (a) `JSON.parse(JSON.stringify(EXEMPLE_SEANCE_PLANIFIEE))` est égal à l'original (le document ne contient que des données) ; (b) `completerProfil({ prenom: 'Léa' })` donne les quatre prérequis à `null` et garde le prénom ; (c) chaque bloc d'exemple a 4 semaines ; (d) `QUALITES_PHYSIQUES` a 5 valeurs.
7. `docs/modele-donnees.md` : ajouter à la fin une section `## 8. Modèle v2 (17 novembre 2026)` qui dit qu'elle fait foi en cas de contradiction, renvoie à `docs/architecture-v2.md` § 3 pour le détail, et reprend en clair : le tableau « ce qui vit où » (§ 3.1), la liste des tables Dexie version 3 (§ 3.4), le tableau « calculé, jamais stocké » (§ 3.5) et la règle « la séance planifiée recopie ses étapes ». Ne pas modifier les sections 1 à 7.

**Critères d'acceptation**
- Build et tests passent ; aucun changement visible.
- `src/donnees/modele.ts` ne contient que des types et des constantes (aucune fonction, aucun accès à Dexie).
- Tous les champs ajoutés à `SeanceRealisee` par rapport à l'ancienne version sont facultatifs (les séances déjà enregistrées restent valides).

**Pièges**
- Ne pas changer les identifiants ni les textes de `SEANCE_EXEMPLE`.
- `ExercicePerso` et `SallePerso` sont des **intersections** (`Document & Forme & {…}`), pas des interfaces : `Forme` est une union.
- `Qualite` (bibliothèque, 10 valeurs) et `QualitePhysique` (5 valeurs) sont différents : l'accent d'un bloc est toujours une `QualitePhysique`.

**Vérification sur iPhone** : ouvrir l'app, terminer une séance courte, rouvrir son débrief depuis Bilans, modifier le profil : rien n'a changé.

---

## F2-03 — Base serveur Supabase : script SQL et guide

**Objectif** : écrire le script SQL qui crée la table des documents et ses règles d'accès, et le guide pas à pas pour qu'Arthur crée le projet Supabase.
**Dépend de** : rien. **En parallèle possible** : F2-01, F2-02.
**Modèle** : Sonnet (sécurité des données).

**Fichiers**
- Créer : `supabase/migrations/0001_documents.sql`, `supabase/verification.sql`, `docs/supabase.md`.
- Lire d'abord : `docs/architecture-v2.md` § 2 (synchronisation), § 3.3 (schéma serveur), § 8 (sécurité), § 9 (ce qu'Arthur doit faire).

**Étapes**
1. `supabase/migrations/0001_documents.sql` : reprendre **exactement** le SQL de `docs/architecture-v2.md` § 3.3 (table `documents`, index `documents_curseur`, RLS, `revoke` / `grant`, quatre règles, déclencheur `avant_ecriture_document`, fonctions `supprimer_mon_compte` et `ping`). En tête du fichier, un commentaire de 5 lignes : à quoi sert le fichier, où le coller (SQL Editor), qu'il ne doit être exécuté qu'une fois.
2. Relire le SQL ligne par ligne et vérifier : chaque `create policy` cite `to authenticated` ; `revoke all … from anon, authenticated` vient avant le `grant` ; le déclencheur compare `new.modifie_le < old.modifie_le` (strictement inférieur) ; `supprimer_mon_compte` est `security definer` avec `set search_path = ''` et n'est exécutable que par `authenticated` ; `ping` ne lit aucune table.
3. `supabase/verification.sql` : requêtes de recette à coller **après** le script, chacune précédée d'un commentaire disant le résultat attendu :
   ```sql
   -- 1. RLS est activé : doit renvoyer « true ».
   select relrowsecurity from pg_class where relname = 'documents';
   -- 2. Les règles existent : doit renvoyer 4 lignes.
   select policyname, cmd from pg_policies where tablename = 'documents';
   -- 3. Un visiteur non connecté ne peut rien lire : doit échouer avec « permission denied for table documents ».
   begin; set local role anon; select * from public.documents; rollback;
   -- 4. Le réveil fonctionne pour un visiteur : doit renvoyer une date.
   begin; set local role anon; select public.ping(); rollback;
   ```
4. `docs/supabase.md` : le guide d'Arthur, en français simple, à partir de `docs/architecture-v2.md` § 9 (étapes 1 à 9 et « À savoir ensuite »), en ajoutant après l'étape 3 : « Coller `supabase/verification.sql`, l'exécuter, comparer chaque résultat au commentaire. » Ajouter une section « Ce qui est public, ce qui est secret » (reprendre § 8, premier paragraphe) et une section « Test d'isolement à deux comptes » à faire après F2-10 : se connecter avec deux adresses sur deux navigateurs, enregistrer une séance avec la première, vérifier que la seconde ne la voit pas.

**Critères d'acceptation**
- Le SQL est identique à celui de l'architecture (au commentaire d'en-tête près).
- Le guide se suit sans connaissance technique : chaque étape dit où cliquer, quoi coller, quel résultat attendre.
- Aucune valeur réelle (adresse de projet, clé) n'apparaît : seulement des exemples `xxxxxxxx`.

**Pièges**
- Ne pas ajouter de règle `for all` : une règle par opération, c'est plus lisible et c'est la recommandation Supabase.
- Ne pas accorder `insert`/`update` au rôle `anon`.
- Pas de `drop table` dans le script : il ne doit jamais pouvoir effacer des données s'il est relancé par erreur (il échouera simplement sur « already exists »).

**Vérification sur iPhone** : sans objet (aucun code de l'app ne change).

---

## F2-04 — Base locale version 3 et écriture unique

**Objectif** : faire passer la base Dexie en version 3 (nouvelles tables, drapeau `aEnvoyer`), migrer les données existantes sans perte, et faire passer toutes les écritures par une seule fonction `ecrire()`.
**Dépend de** : F2-02. **En parallèle possible** : F2-13, F2-15.
**Modèle** : Sonnet.

**Pourquoi** : la synchronisation (F2-08) a besoin de savoir ce qui a changé depuis le dernier envoi. Tout passe par `ecrire()`, qui pose les dates et le drapeau ; rien ne peut être oublié.

**Fichiers**
- Créer : `src/donnees/stockage.ts`, `src/donnees/stockage.test.ts`, `src/donnees/migration.test.ts`.
- Modifier : `src/donnees/base.ts`, `package.json` et `package-lock.json` (`npm install -D fake-indexeddb`).
- Lire d'abord : `src/donnees/base.ts`, `src/donnees/modele.ts`, `docs/architecture-v2.md` §§ 2.2 et 3.4.

**Étapes**
1. `npm install -D fake-indexeddb`.
2. `src/donnees/base.ts` :
   - protéger l'écouteur `visibilitychange` du bas du fichier par `if (typeof document !== 'undefined')` ;
   - ajouter le type `export type Local<T> = T & { aEnvoyer: 0 | 1 }` ;
   - déclarer les tables dans la classe : `seancesRealisees: Table<Local<SeanceRealisee>, string>`, `reglages: Table<Local<ProfilEnregistre | Reglages>, string>`, `cycles`, `mesocycles`, `seancesPlanifiees`, `objectifsSpecifiques`, `exercicesPerso`, `salles` (types de `modele.ts`, enveloppés dans `Local<>`), `etatSynchro: Table<{ cle: string; valeur: unknown }, string>`, `appareil: Table<{ cle: string; valeur: unknown }, string>` ;
   - **garder les lignes `version(1)` et `version(2)` telles quelles**, puis ajouter `this.version(3).stores({...})` avec exactement les index de `docs/architecture-v2.md` § 3.4, et une fonction `.upgrade(async (tx) => { ... })` qui, avec `tx.table('seancesRealisees').toCollection().modify(...)` et de même pour `reglages`, ajoute à chaque enregistrement : `aEnvoyer = 1`, `versionFormat = 1`, `creeLe = creeLe ?? modifieLe`, et pour l'enregistrement `profil` les quatre prérequis à `null` s'ils manquent.
3. `src/donnees/stockage.ts` (nouveau) :
   ```ts
   /** Les tables envoyées au serveur. Le type envoyé au serveur est le nom de la table. */
   export const TABLES_SYNCHRONISEES = ['seancesRealisees', 'reglages', 'cycles', 'mesocycles',
     'seancesPlanifiees', 'objectifsSpecifiques', 'exercicesPerso', 'salles'] as const
   export type TableSynchronisee = (typeof TABLES_SYNCHRONISEES)[number]

   export async function ecrire<T extends { id: string }>(table: TableSynchronisee, doc: T): Promise<void>
   // pose versionFormat = 1, modifieLe = maintenant, creeLe = doc.creeLe ?? creeLe de l'enregistrement existant ?? maintenant,
   // aEnvoyer = 1 ; enregistre avec avecReprise(); puis prévient les abonnés de surEcriture.
   export async function supprimer(table: TableSynchronisee, id: string): Promise<void>
   // suppression douce : supprimeLe = modifieLe = maintenant, aEnvoyer = 1. Ne fait rien si l'id n'existe pas.
   export async function lireTous<T>(table: TableSynchronisee): Promise<T[]>      // sans les documents supprimés
   export async function lireUn<T>(table: TableSynchronisee, id: string): Promise<T | undefined> // undefined si supprimé

   export async function lireEtat<T>(cle: string): Promise<T | undefined>          // table etatSynchro
   export async function ecrireEtat(cle: string, valeur: unknown): Promise<void>
   export async function lireAppareil<T>(cle: string): Promise<T | undefined>      // table appareil : jamais synchronisée
   export async function ecrireAppareil(cle: string, valeur: unknown): Promise<void>
   export async function effacerAppareil(cle: string): Promise<void>

   // Petits événements pour prévenir le reste de l'app, sans dépendance.
   export function surEcriture(rappel: () => void): () => void            // une écriture locale a eu lieu (lance une synchro)
   export function surDonneesChangees(rappel: () => void): () => void     // des données sont arrivées du serveur (relire)
   export function signalerDonneesChangees(): void
   ```
   Les deux `sur…` renvoient la fonction qui désabonne. Implémentation : un `Set` de rappels par événement.
4. Dans `base.ts`, faire passer les écritures existantes par `ecrire` : `enregistrerSeance` → `ecrire('seancesRealisees', seance)` ; `enregistrerProfil` → `ecrire('reglages', { ...profil, id: 'profil' })`. `lireSeances` ne renvoie plus les séances qui ont `supprimeLe`. `importerDonnees` : avant `bulkPut`, compléter chaque enregistrement (`versionFormat: 1`, `creeLe ??= modifieLe`, `aEnvoyer: 1`) ; ne pas changer le format du fichier (c'est F2-11).
5. `src/donnees/migration.test.ts` : `import 'fake-indexeddb/auto'` en première ligne. Créer avec Dexie une base `appli-escalade` en **version 2** (mêmes `stores` que la version 2 actuelle), y mettre une séance au format actuel (sans `versionFormat`, sans `aEnvoyer`) et un profil `{ id: 'profil', modifieLe, ...PROFIL d'avant sans prérequis }`, fermer. Puis `const { base, lireSeances, lireProfil } = await import('./base.ts')` (import **après** la préparation) et vérifier : la séance est toujours là avec `aEnvoyer: 1` et `versionFormat: 1` ; le profil a ses champs d'origine, `tractionsStrictes: null`, `aEnvoyer: 1` ; `base.verno === 3` ; la table `cycles` existe et est vide.
6. `src/donnees/stockage.test.ts` (avec fake-indexeddb) : `ecrire` pose `creeLe`, `modifieLe`, `versionFormat`, `aEnvoyer` ; un second `ecrire` du même id garde `creeLe` et avance `modifieLe` ; `supprimer` puis `lireTous` → absent, mais l'enregistrement existe dans la table avec `supprimeLe` ; `TABLES_SYNCHRONISEES` ne contient ni `etatSynchro` ni `appareil` ; `surEcriture` est appelé une fois par écriture et plus après désabonnement ; `ecrireAppareil('cleApiClaude', 'x')` n'écrit dans aucune table synchronisée.

**Critères d'acceptation**
- Un téléphone qui avait des séances et un profil les retrouve tous après la mise à jour (prouvé par `migration.test.ts`).
- `grep -n "\.put(\|\.add(\|bulkPut" src --include=*.ts --include=*.tsx` ne montre d'écritures directes que dans `stockage.ts`, dans l'`upgrade` et dans `importerDonnees`.
- Build, tests et lint passent.

**Pièges**
- Une erreur dans `upgrade` bloque l'ouverture de la base sur le téléphone : la fonction doit tolérer des champs manquants (`??`), ne jamais lever d'exception, ne jamais supprimer.
- Dexie n'indexe pas les booléens : `aEnvoyer` vaut `0` ou `1`.
- Comparer les dates avec la chaîne ISO produite par `new Date().toISOString()` uniquement (même format partout).
- Dans les tests, chaque fichier a sa propre base en mémoire ; dans `migration.test.ts`, appeler `Dexie.delete('appli-escalade')` au début.

**Vérification sur iPhone** : après mise à jour, ouvrir Bilans : toutes les anciennes séances sont là ; ouvrir le profil : inchangé ; faire une séance : elle s'enregistre et apparaît.

---

## F2-05 — Profil : les quatre prérequis

**Objectif** : permettre de renseigner, dans le formulaire du profil, les quatre prérequis qui débloquent les exercices exigeants, avec des valeurs prudentes par défaut.
**Dépend de** : F2-04. **En parallèle possible** : F2-07, F2-08 (aucun fichier commun).
**Modèle** : Sonnet.

**Fichiers**
- Modifier : `src/ecrans/ProfilFormulaire.tsx`, `src/donnees/profil.ts`.
- Créer : `src/donnees/profil.test.ts`.
- Lire d'abord : ces deux fichiers, `src/ecrans/Bienvenue.tsx`, `src/ecrans/Profil.tsx`, `src/index.css` (classes `question`, `choix`, `compteur`, `texte-3`), `src/donnees/bibliotheque/types.ts` (type `Prerequis`, pour comprendre à quoi servent ces champs).

**Étapes**
1. Dans `profil.ts`, ajouter un petit convertisseur pour les questions à trois réponses :
   ```ts
   export type Reponse3 = 'oui' | 'non' | 'inconnu'
   export const versReponse3 = (v: boolean | null): Reponse3 => (v === null ? 'inconnu' : v ? 'oui' : 'non')
   export const depuisReponse3 = (r: Reponse3): boolean | null => (r === 'inconnu' ? null : r === 'oui')
   ```
2. Dans `ProfilFormulaire.tsx`, ajouter **à la fin du formulaire, avant le bouton**, une section titrée « Pour débloquer les exercices exigeants » (`h2` classe `sous-titre`), avec la phrase : « Si tu ne sais pas, laisse “Je ne sais pas” : par prudence, les exercices concernés ne te seront pas proposés. » Puis quatre questions, avec le composant `Choix` existant (valeurs `Reponse3` converties) :
   - « Tractions strictes d'affilée, bras tendus en bas » : un compteur `−` / `+` de 0 à 40 comme celui des années de pratique, plus un bouton « Je ne sais pas » qui remet `null` ; quand la valeur est `null`, le compteur affiche « ? » et `+` part de 0 ;
   - « Tu tiens 15 s sur une réglette de 25 mm, poids du corps ? » : Oui / Non / Pas testé ;
   - « Tu as 18 ans ou plus ? » : Oui / Non / Je préfère ne pas dire (→ `null`) ;
   - « Tu sais grimper et chuter en tête ? » : Oui / Non / Je ne sais pas.
3. Ces champs sont facultatifs : le bouton de validation reste toujours actif.
4. `src/donnees/profil.test.ts` : aller-retour `versReponse3` / `depuisReponse3` sur les trois valeurs ; `completerProfil({})` (créée par F2-02) a les quatre prérequis à `null`.

**Critères d'acceptation**
- Au premier lancement (écran Bienvenue) comme dans l'onglet Profil, les quatre questions apparaissent en bas, réponses « inconnu » sélectionnées par défaut.
- Enregistrer, fermer l'app, rouvrir : les réponses sont conservées.
- Boutons d'au moins 48 px, focus visible, uniquement des variables de `src/index.css`.

**Pièges**
- Le composant `Choix` n'accepte pas `null` comme valeur : passer par `Reponse3`.
- Ne pas rendre ces questions obligatoires ni bloquantes (règle : avertir sans bloquer).
- Ne pas toucher à `Profil.tsx` ni à `App.tsx` (F2-07 les modifie en même temps).

**Vérification sur iPhone** : ouvrir Profil, répondre aux quatre questions, enregistrer, fermer complètement l'app, rouvrir : réponses gardées ; les autres champs du profil sont intacts.

---

## F2-06 — Client Supabase et configuration

**Objectif** : ajouter la bibliothèque Supabase, un client unique configuré par deux variables publiques, et le branchement de ces variables dans la mise en ligne, l'app restant pleinement utilisable sans elles.
**Dépend de** : F2-03. **En parallèle possible** : F2-02, puis F2-04, F2-13.
**Modèle** : Haiku (tâche mécanique, étapes exactes).

**Fichiers**
- Modifier : `package.json`, `package-lock.json`, `.github/workflows/mise-en-ligne.yml`, `README.md` (section « Lancer l'app sur son ordinateur »).
- Créer : `src/compte/client.ts`, `src/compte/client.test.ts`, `src/env.d.ts`, `.env.exemple`.

**Étapes**
1. `npm install @supabase/supabase-js`.
2. `src/env.d.ts` :
   ```ts
   /// <reference types="vite/client" />
   // Les deux valeurs publiques du projet Supabase, fournies au moment de la construction.
   interface ImportMetaEnv {
     readonly VITE_SUPABASE_URL?: string
     readonly VITE_SUPABASE_CLE_PUBLIQUE?: string
   }
   interface ImportMeta { readonly env: ImportMetaEnv }
   ```
3. `src/compte/client.ts` :
   ```ts
   import { createClient, type SupabaseClient } from '@supabase/supabase-js'

   // Connexion au service de comptes (Supabase). Les deux valeurs sont publiques par nature :
   // la clé publiable ne donne accès qu'à ce que les règles de la base autorisent.

   /** Vrai si la configuration est utilisable. Refuse une clé secrète, qui ne doit jamais être dans l'app. */
   export function configurationValide(url: string | undefined, cle: string | undefined): boolean {
     if (!url || !cle) return false
     if (cle.startsWith('sb_secret_')) return false
     return url.startsWith('https://')
   }

   const url = import.meta.env.VITE_SUPABASE_URL
   const cle = import.meta.env.VITE_SUPABASE_CLE_PUBLIQUE

   /** Faux en développement sans `.env.local` : l'app fonctionne alors sans compte, comme avant. */
   export const comptesDisponibles = configurationValide(url, cle)

   export const supabase: SupabaseClient | null = comptesDisponibles
     ? createClient(url!, cle!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
     : null
   ```
   Si la clé commence par `sb_secret_`, écrire en plus un `console.error` explicite (« Clé secrète refusée : utiliser la clé publiable »).
4. `src/compte/client.test.ts` : `configurationValide` → faux sans URL, faux sans clé, faux avec `sb_secret_abc`, faux avec `http://…`, vrai avec `https://x.supabase.co` et `sb_publishable_abc`.
5. `.env.exemple` :
   ```
   # Copier ce fichier en .env.local et remplacer les valeurs (voir docs/supabase.md, étape 6).
   # Ces deux valeurs sont publiques. Ne jamais mettre ici une clé qui commence par sb_secret_.
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_CLE_PUBLIQUE=sb_publishable_xxxxxxxx
   ```
6. `.github/workflows/mise-en-ligne.yml` : sur l'étape `- run: npm run build` seulement, ajouter :
   ```yaml
        env:
          VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
          VITE_SUPABASE_CLE_PUBLIQUE: ${{ vars.VITE_SUPABASE_CLE_PUBLIQUE }}
   ```
   (`vars`, pas `secrets` : ce sont des variables de dépôt.)
7. README, section « Lancer l'app sur son ordinateur » : une phrase « Pour tester les comptes, copier `.env.exemple` en `.env.local` et y mettre les valeurs du projet Supabase (voir `docs/supabase.md`). Sans ce fichier, l'app fonctionne sans compte. »

**Critères d'acceptation**
- `npm run build` passe **sans** `.env.local` ; aucune erreur dans la console du navigateur au lancement sans configuration.
- `supabase-js` n'est importé que dans `src/compte/client.ts`.
- Aucun écran ne change.

**Pièges**
- Ne pas ajouter de mise en cache des requêtes Supabase dans la configuration PWA (`vite.config.ts` ne change pas) : des données en cache du service worker contourneraient la synchronisation.
- `.env.local` est déjà ignoré par Git (`*.local` dans `.gitignore`) : ne pas le créer dans le dépôt.

**Vérification sur iPhone** : l'app s'ouvre et fonctionne comme avant (rien de nouveau à l'écran).

---

## F2-07 — Connexion par code reçu par e-mail

**Objectif** : un écran Compte qui permet de se connecter avec son e-mail et un code à 6 chiffres, de voir avec quelle adresse on est connecté et de se déconnecter.
**Dépend de** : F2-04, F2-06 (et le projet Supabase créé par Arthur pour l'essai réel). **En parallèle possible** : F2-05, F2-08.
**Modèle** : Sonnet.

**Pourquoi un code et pas un lien** : sur iPhone, l'app installée et Safari ne partagent pas leur mémoire ; un lien e-mail connecterait Safari, pas l'app (`docs/architecture-v2.md` § 2.4).

**Fichiers**
- Créer : `src/compte/session.ts`, `src/compte/session.test.ts`, `src/ecrans/Compte.tsx`.
- Modifier : `src/ecrans/Profil.tsx` (une ligne de menu), `src/App.tsx` (une vue de plus).
- Lire d'abord : `src/compte/client.ts`, `src/ecrans/Profil.tsx`, `src/App.tsx`, `src/ecrans/Questions.tsx` (exemple d'écran simple), `src/index.css`.

**Étapes**
1. `src/compte/session.ts` :
   ```ts
   export function emailValide(email: string): boolean          // forme simple : texte@texte.texte, espaces retirés
   export function nettoyerCode(saisie: string): string         // garde les chiffres seulement ("123 456" → "123456")
   export function codeValide(code: string): boolean            // 6 à 10 chiffres
   export function messageErreur(e: unknown): string            // traduit en français : réseau absent, code faux ou expiré,
                                                                // trop de demandes (attendre une minute), autre
   export async function envoyerCode(email: string): Promise<void>      // supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
   export async function verifierCode(email: string, code: string): Promise<void> // supabase.auth.verifyOtp({ email, token: code, type: 'email' })
   export async function seDeconnecter(): Promise<void>                 // supabase.auth.signOut()
   export function useSession(): { chargement: boolean; userId: string | null; email: string | null }
     // getSession() au montage + onAuthStateChange ; si `supabase` est null : { chargement: false, userId: null, email: null }
   ```
   Les fonctions lèvent une `Error` avec un message déjà traduit.
2. `src/ecrans/Compte.tsx`, un écran (`main.ecran`) avec bouton « Retour » en haut (comme `bouton-discret` des autres écrans), quatre états :
   - **non connecté** : titre « Ton compte » ; texte « Avec un compte, tes séances et ton plan se retrouvent sur ton téléphone et ton ordinateur, et une copie est gardée en sécurité. Sans compte, tout reste sur cet appareil. » ; champ e-mail (`type="email"`, `autoComplete="email"`) ; bouton principal « Recevoir un code » (désactivé si l'e-mail n'est pas valide) ;
   - **code envoyé** : « Un code a été envoyé à … » ; champ code (`inputMode="numeric"`, `autoComplete="one-time-code"`) ; bouton principal « Me connecter » ; bouton second « Renvoyer le code » désactivé 60 secondes (afficher le décompte) ; bouton texte « Changer d'adresse » ;
   - **connecté** : « Connecté avec … » ; bouton second « Me déconnecter » (confirmation `window.confirm` : « Te déconnecter ? Tes données restent sur cet appareil. ») ;
   - **hors ligne** (`navigator.onLine === false`) dans les deux premiers états : message « Il faut du réseau pour se connecter. Tu peux continuer à utiliser l'app sans compte. »
   En bas, la phrase de confidentialité : « Tes données sont gardées sur un serveur en Europe administré par Arthur. Elles ne sont ni vendues ni partagées. » Messages d'erreur dans une zone `role="status" aria-live="polite"`.
   **Cette tâche ne synchronise rien et ne lie pas les données de l'appareil au compte** (c'est F2-09).
3. `src/ecrans/Profil.tsx` : nouvelle prop `onCompte: () => void` ; dans la section « À savoir et données », une première ligne `<button className="ligne" onClick={onCompte}><span>Compte</span><span>{email ?? 'Pas de compte'}</span></button>`, affichée seulement si `comptesDisponibles`. Utiliser `useSession()` pour l'e-mail.
4. `src/App.tsx` : ajouter la vue `{ nom: 'compte' }` qui affiche `<Compte onRetour={accueil} />` dans `<div className="app">`, et passer `onCompte={() => setVue({ nom: 'compte' })}` à `Profil`.
5. `src/compte/session.test.ts` : `emailValide` (vrai : `a@b.fr`, ` a@b.fr ` ; faux : `a@b`, `ab.fr`, vide), `nettoyerCode`, `codeValide` (6 chiffres oui, 5 non, lettres non), `messageErreur` sur une erreur réseau (`TypeError: Failed to fetch`) et sur un message contenant « expired ».

**Critères d'acceptation**
- Sans configuration Supabase (`.env.local` absent), la ligne Compte n'apparaît pas et rien ne change.
- Avec configuration : connexion réussie avec un vrai code ; la session survit à la fermeture complète de l'app ; déconnexion possible.
- Tous les boutons font au moins 48 px ; un seul bouton principal par état.

**Pièges**
- `detectSessionInUrl` est faux (F2-06) : ne pas essayer de traiter un lien.
- Ne pas mettre l'e-mail dans l'adresse de la page (pas de paramètre d'URL).
- Le code peut arriver collé avec des espaces : passer par `nettoyerCode`.
- Ne pas appeler `supabase` quand il vaut `null`.

**Vérification sur iPhone** (après les étapes d'Arthur) : dans l'app installée, Profil → Compte → e-mail → code reçu → saisi → « Connecté avec … » ; fermer l'app, rouvrir : toujours connecté.

---

## F2-08 — Moteur de synchronisation

**Objectif** : écrire la fonction `synchroniser()` qui envoie au serveur les documents modifiés et récupère ceux des autres appareils, avec la règle « la dernière modification gagne », testée entièrement sans réseau.
**Dépend de** : F2-04, F2-06. **En parallèle possible** : F2-05, F2-07.
**Modèle** : Sonnet (tâche la plus délicate de la phase).

**Fichiers**
- Créer : `src/synchro/fusion.ts`, `src/synchro/synchro.ts`, `src/synchro/serveurSupabase.ts`, `src/synchro/serveurMemoire.ts`, `src/synchro/fusion.test.ts`, `src/synchro/synchro.test.ts`.
- Lire d'abord : `docs/architecture-v2.md` §§ 2.2, 2.3, 2.5 et 3.3 ; `src/donnees/stockage.ts` ; `src/donnees/base.ts` ; `src/compte/client.ts`.

**Étapes**
1. `src/synchro/fusion.ts` (fonctions pures) :
   ```ts
   export type Decision = 'prendre_distant' | 'garder_local'
   /** La version la plus récente gagne, entière. À égalité, on garde la locale (rien à faire). */
   export function decider(local: { modifieLe: string } | undefined, distant: { modifieLe: string }): Decision
   /** Prépare un document local pour le serveur : retire aEnvoyer, recopie modifie_le et supprime_le. */
   export function versLigne(userId: string, table: TableSynchronisee, doc: Record<string, unknown>): LigneEnvoyee
   /** Document reçu → document local à jour (aEnvoyer = 0). */
   export function depuisLigne(ligne: LigneRecue): Record<string, unknown>
   /** Le curseur moins une marge, pour ne rien rater si deux écritures arrivent presque en même temps. */
   export function curseurAvecMarge(curseur: string | null, margeS = 60): string | null
   ```
   `decider` compare `Date.parse(distant.modifieLe) > Date.parse(local.modifieLe)`. `curseurAvecMarge` renvoie `new Date(Date.parse(curseur) - margeS * 1000).toISOString()`.
2. `src/synchro/synchro.ts` :
   ```ts
   export interface LigneEnvoyee { user_id: string; type: TableSynchronisee; id: string; contenu: Record<string, unknown>; modifie_le: string; supprime_le: string | null }
   export interface LigneRecue { type: string; id: string; contenu: Record<string, unknown>; recu_le: string }
   /** Ce que la synchronisation attend du serveur. Deux versions : Supabase, et une en mémoire pour les tests. */
   export interface ServeurDocuments {
     envoyer(lignes: LigneEnvoyee[]): Promise<void>
     recevoirApres(apres: string | null, limite: number): Promise<LigneRecue[]>  // recu_le strictement après, triées
     lireUn(type: TableSynchronisee, id: string): Promise<LigneRecue | null>
   }
   export interface BilanSynchro { envoyes: number; recus: number; appliques: number }
   export async function synchroniser(serveur: ServeurDocuments, userId: string): Promise<BilanSynchro>
   export async function compterEnAttente(): Promise<number>   // nombre de documents aEnvoyer = 1, toutes tables
   ```
   Déroulé de `synchroniser` :
   - **Verrou** : si une synchronisation est en cours, renvoyer la même promesse (variable de module).
   - **Pousser** : pour chaque table de `TABLES_SYNCHRONISEES`, `where('aEnvoyer').equals(1)` ; envoyer par paquets de 100 avec `versLigne` ; après chaque paquet réussi, dans une transaction Dexie, pour chaque document envoyé : relire l'enregistrement et mettre `aEnvoyer = 0` **seulement si son `modifieLe` est toujours celui qui a été envoyé**.
   - **Tirer** : `curseur = await lireEtat<string>('curseur') ?? null` ; première demande `recevoirApres(curseurAvecMarge(curseur), 500)`, puis tant qu'une page est pleine, `recevoirApres(recu_le de la dernière ligne, 500)` (sans marge). Pour chaque ligne : ignorer si `type` n'est pas dans `TABLES_SYNCHRONISEES` (ligne écrite par une version plus récente de l'app) ; sinon lire le local, appliquer `decider` sur `contenu.modifieLe`, et si « prendre_distant », `put(depuisLigne(ligne))`. Retenir la plus grande `recu_le` (comparaison avec `Date.parse`) et l'enregistrer comme nouveau `curseur`.
   - **Fin** : `ecrireEtat('derniereSynchro', maintenant)`, effacer `derniereErreur` ; si `appliques > 0`, `signalerDonneesChangees()`. En cas d'erreur : `ecrireEtat('derniereErreur', message)` puis relancer l'erreur. Le verrou est toujours libéré (`finally`).
3. `src/synchro/serveurSupabase.ts` :
   ```ts
   export function serveurSupabase(client: SupabaseClient): ServeurDocuments
   ```
   `envoyer` : `client.from('documents').upsert(lignes, { onConflict: 'user_id,type,id' })` ; `recevoirApres` : `select('type,id,contenu,recu_le')`, `.order('recu_le')`, `.limit(limite)`, et `.gt('recu_le', apres)` si `apres` ; `lireUn` : `.eq('type', type).eq('id', id).maybeSingle()`. Toute `error` renvoyée par Supabase devient `throw new Error(error.message)`.
4. `src/synchro/serveurMemoire.ts` : un faux serveur pour les tests (et pour F2-09, F2-11) : `export function serveurMemoire(): ServeurDocuments & { lignes: Map<string, LigneRecue & { modifie_le: string }> ; avantEnvoi?: () => Promise<void> }`. Il applique la même règle que le déclencheur SQL (refuser une version plus ancienne) et attribue à chaque écriture une `recu_le` croissante (horloge fictive : `new Date(Date.UTC(2026, 0, 1) + n * 1000).toISOString()`). `avantEnvoi`, s'il est défini, est appelé au début d'`envoyer` (sert à simuler une écriture locale pendant l'envoi).
5. `src/synchro/fusion.test.ts` : `decider` (local absent, distant plus récent, plus ancien, égal) ; `versLigne` n'a pas de `aEnvoyer` dans `contenu` et recopie `supprimeLe` ; `depuisLigne` met `aEnvoyer = 0` ; `curseurAvecMarge(null)` → `null`.
6. `src/synchro/synchro.test.ts` (fake-indexeddb + `serveurMemoire`), au moins :
   1. une séance écrite avec `ecrire` part au serveur et son `aEnvoyer` repasse à 0 ;
   2. un document modifié pendant l'envoi (via `avantEnvoi`) garde `aEnvoyer = 1` ;
   3. un document plus récent sur le serveur remplace le local ; un plus ancien est ignoré ;
   4. deux synchronisations de suite ne créent aucun doublon (taille du serveur identique) ;
   5. une suppression douce (`supprimer`) arrive au serveur avec `supprime_le` ;
   6. 1 200 documents sur le serveur arrivent tous (pagination) ;
   7. une ligne de type inconnu (`formes`) est ignorée sans erreur ;
   8. deux appels simultanés à `synchroniser` n'envoient qu'une fois ;
   9. en cas d'échec d'envoi, `derniereErreur` est rempli et les `aEnvoyer` restent à 1 ;
   10. la table `appareil` n'est jamais lue (y mettre `cleApiClaude` et vérifier qu'elle n'apparaît dans aucune ligne du serveur).

**Critères d'acceptation**
- Tous les tests ci-dessus passent, sans réseau.
- Aucun écran ne change (personne n'appelle encore `synchroniser`).
- Le code de `synchro.ts` reste lisible : fonctions `pousser()` et `tirer()` séparées, commentaires courts.

**Pièges**
- Les dates du serveur (`recu_le`) ont un format différent de `toISOString()` (`+00:00`, microsecondes) : les comparer avec `Date.parse`, jamais comme des chaînes.
- Ne pas comparer avec `modifie_le` du serveur : comparer `contenu.modifieLe`, écrit par l'appareil.
- Ne jamais écrire dans Dexie un document reçu sans passer par `decider`.
- `aEnvoyer` ne doit jamais partir au serveur.

**Vérification sur iPhone** : sans objet (rien n'est encore branché) ; l'app fonctionne comme avant.

---

## F2-09 — Lien du compte et reprise des données

**Objectif** : à la première connexion, rattacher les données déjà présentes sur l'appareil au compte et les envoyer sans perte ni doublon ; ne jamais mélanger les données de deux comptes.
**Dépend de** : F2-07, F2-08. **En parallèle possible** : F2-12.
**Modèle** : Sonnet.

**Fichiers**
- Créer : `src/synchro/reprise.ts`, `src/synchro/reprise.test.ts`, `src/ecrans/Reprise.tsx`.
- Modifier : `src/ecrans/Compte.tsx`.
- Lire d'abord : `docs/architecture-v2.md` § 4 ; `src/synchro/synchro.ts` ; `src/synchro/fusion.ts` ; `src/donnees/stockage.ts` ; `src/donnees/base.ts` (`lireProfil`, `exporterDonnees`, `jourLocal`) ; `src/ecrans/Compte.tsx` ; `src/ecrans/Profil.tsx` (fonction `exporter`, à imiter).

**Étapes**
1. `src/synchro/reprise.ts` :
   ```ts
   export type SituationReprise = 'premier_lien' | 'meme_compte' | 'autre_compte'
   export function situationReprise(compteIdLocal: string | null | undefined, compteIdSession: string): SituationReprise

   /** Vrai si les deux profils diffèrent sur un champ utile (on ignore id, creeLe, modifieLe, versionFormat, aEnvoyer). */
   export function profilsDifferents(local: Record<string, unknown>, distant: Record<string, unknown>): boolean

   export type ResultatLien = 'lie' | 'choix_profil_requis' | 'autre_compte'
   export async function lierCompte(serveur: ServeurDocuments, session: { userId: string; email: string },
                                    choixProfil?: 'appareil' | 'compte'): Promise<{ resultat: ResultatLien; bilan?: BilanSynchro }>

   /** Vide toutes les tables synchronisées, etatSynchro et appareil. Ne supprime pas la base. */
   export async function effacerDonneesLocales(): Promise<void>
   ```
   Déroulé de `lierCompte` :
   - `meme_compte` → `synchroniser` et renvoyer `lie`.
   - `autre_compte` → ne rien faire, renvoyer `autre_compte`.
   - `premier_lien` → lire le profil local (table `reglages`, id `profil`) et le profil distant (`serveur.lireUn('reglages', 'profil')`). Si les deux existent, diffèrent, et que `choixProfil` est absent → renvoyer `choix_profil_requis`. Si `choixProfil === 'appareil'` → réécrire le profil local avec `ecrire` (son `modifieLe` devient le plus récent). Si `choixProfil === 'compte'` → `put(depuisLigne(distant))` dans `reglages`. Puis `ecrireEtat('compteId', userId)`, `ecrireEtat('compteEmail', email)`, `ecrireEtat('curseur', null)`, et `synchroniser`. Renvoyer `lie` et le bilan.
2. `src/ecrans/Reprise.tsx` : deux variantes, selon une prop `situation` :
   - `choix_profil` : titre « Deux profils différents » ; texte « Ce téléphone et ton compte ont chacun un profil. Lequel garder ? » ; deux boutons de même rang : « Garder celui de cet appareil », « Garder celui du compte » ; afficher sous chacun deux informations utiles (niveau bloc, séances par semaine) pour aider à choisir.
   - `autre_compte` : titre « Cet appareil est lié à un autre compte » ; texte « Il contient les données de {compteEmail masqué : 2 premières lettres + … + domaine}. Pour te connecter avec {nouvel e-mail}, il faut d'abord les effacer de cet appareil. Elles restent sur le compte d'origine. » ; bouton principal « Sauvegarder dans un fichier puis effacer » (export JSON comme dans `Profil.tsx`, puis `effacerDonneesLocales()`, puis `lierCompte`) ; bouton second « Annuler » (`seDeconnecter()`).
3. `src/ecrans/Compte.tsx` : juste après une connexion réussie (et à l'ouverture de l'écran si on est connecté mais que `compteId` local est absent ou différent), appeler `lierCompte(serveurSupabase(supabase), session)` et afficher `Reprise` si nécessaire. Pendant l'opération : « Mise en lien de tes données… ». Quand le résultat est `lie` et que des documents ont été appliqués (`bilan.appliques > 0`) ou que le choix était « compte », recharger l'app (`window.location.reload()`) pour afficher les données à jour ; sinon afficher « Tes données sont reliées à ton compte : N envoyées. ».
4. Déconnexion (dans `Compte.tsx`) : avant de confirmer, appeler `compterEnAttente()` ; s'il est supérieur à 0, le message devient « N modifications ne sont pas encore envoyées. Elles partiront à ta prochaine connexion. Te déconnecter quand même ? ».
5. `src/synchro/reprise.test.ts` (fake-indexeddb + `serveurMemoire`) :
   1. `situationReprise` : `null` → premier_lien, même id → meme_compte, autre id → autre_compte ;
   2. appareil avec 3 séances et un profil, compte vide → après `lierCompte`, le serveur a 4 documents, `compteId` est enregistré ;
   3. appareil et compte avec chacun 2 séances différentes → les deux ont 4 séances après, aucun doublon ;
   4. profils différents sans choix → `choix_profil_requis` et rien n'est envoyé ;
   5. choix « appareil » → le serveur a le profil de l'appareil ; choix « compte » → l'appareil a celui du compte ;
   6. `lierCompte` relancé une seconde fois → aucun doublon ;
   7. `effacerDonneesLocales` vide les tables synchronisées, `etatSynchro` et `appareil`, et la base s'ouvre encore.

**Critères d'acceptation**
- Un téléphone qui a un historique, connecté pour la première fois, retrouve tout son historique sur un second appareil connecté au même compte.
- Les données de deux comptes ne sont jamais mélangées sur un appareil.
- Les tests ci-dessus passent.

**Pièges**
- `effacerDonneesLocales` ne doit **jamais** appeler `base.delete()` (la base doit rester ouverte et à la version 3) : utiliser `table.clear()`.
- Ne pas montrer l'e-mail complet de l'autre compte (confidentialité) : le masquer.
- Un échec réseau pendant `lierCompte` ne doit rien effacer ; on peut relancer.

**Vérification sur iPhone** : sur le téléphone qui a l'historique, se connecter → message « reliées à ton compte » ; sur l'ordinateur, se connecter au même compte → l'historique apparaît dans Bilans.

---

## F2-10 — Synchronisation automatique et indicateur

**Objectif** : lancer la synchronisation toute seule aux bons moments, rafraîchir l'affichage quand des données arrivent, et montrer son état dans l'écran Compte.
**Dépend de** : F2-09. **En parallèle possible** : F2-12 s'il n'est pas fini (aucun fichier commun).
**Modèle** : Sonnet.

**Fichiers**
- Créer : `src/synchro/automatique.ts`, `src/synchro/automatique.test.ts`.
- Modifier : `src/App.tsx`, `src/ecrans/Compte.tsx`, `src/ecrans/Historique.tsx`.
- Lire d'abord : `docs/architecture-v2.md` § 2.3 ; `src/synchro/synchro.ts` ; `src/synchro/reprise.ts` ; `src/donnees/stockage.ts` (`surEcriture`, `surDonneesChangees`, `lireEtat`) ; `src/compte/session.ts` ; `src/App.tsx`.

**Étapes**
1. `src/synchro/automatique.ts` :
   ```ts
   /** Regroupe des demandes rapprochées en un seul lancement, `delaiMs` après la dernière. */
   export function regrouper(action: () => void, delaiMs: number): { demander(): void; arreter(): void }

   /**
    * Lance `lancer` : tout de suite, au retour du réseau, au retour au premier plan, 3 s après une écriture locale,
    * et toutes les 5 minutes tant que l'app est visible. Renvoie la fonction qui arrête tout.
    * Les erreurs sont avalées ici (elles sont déjà enregistrées dans etatSynchro par synchroniser).
    */
   export function demarrerSynchroAutomatique(lancer: () => Promise<unknown>): () => void
   ```
   Protéger tout accès à `window` / `document` par `typeof window !== 'undefined'`. Ne pas lancer si `navigator.onLine === false`.
2. `src/App.tsx` :
   - avec `useSession()` : quand `userId` existe **et** que `lireEtat('compteId')` vaut ce `userId`, démarrer `demarrerSynchroAutomatique(() => synchroniser(serveurSupabase(supabase!), userId))` ; l'arrêter quand la session change ou disparaît (retour de `useEffect`) ;
   - s'abonner à `surDonneesChangees` pour relire le profil (`lireProfil().then(p => p && setProfil(p))`).
3. `src/ecrans/Historique.tsx` : s'abonner aussi à `surDonneesChangees` pour relire les séances.
4. `src/ecrans/Compte.tsx`, état « connecté » : ajouter l'indicateur, relu à l'ouverture, toutes les 30 s et à chaque `surDonneesChangees`, avec un bouton second « Synchroniser maintenant » :
   - hors ligne : « Hors ligne. Tes données sont sur l'appareil et partiront au retour du réseau. » ;
   - `derniereErreur` présent : « La dernière synchronisation a échoué : {message}. Nouvel essai automatique. » ;
   - modifications en attente (`compterEnAttente()`) : « N modifications en attente d'envoi. » ;
   - sinon : « À jour, {il y a 2 min | à 14 h 05 | hier à 18 h 40} » (calculé par une fonction pure `depuisQuand(iso, maintenant)` dans `automatique.ts`, testée).
   Ajouter la phrase d'aide : « Si tu modifies la même chose sur deux appareils sans réseau, c'est la modification la plus récente qui est gardée. »
5. `src/synchro/automatique.test.ts` : avec `vi.useFakeTimers()` : `regrouper` — trois demandes à 1 s d'intervalle avec un délai de 3 s → un seul lancement, 3 s après la dernière ; `arreter` annule un lancement prévu. `depuisQuand` : 30 s → « à l'instant », 5 min → « il y a 5 min », 3 h → « à 11 h 05 » (même jour), la veille → « hier à … ».

**Critères d'acceptation**
- Une séance terminée sur le téléphone connecté apparaît sur l'ordinateur connecté en moins d'une minute (ordinateur ouvert, au premier plan), sans rien toucher.
- En mode avion, une séance s'enregistre normalement ; au retour du réseau, l'indicateur passe de « 1 modification en attente » à « À jour ».
- Aucune synchronisation ne démarre tant que `compteId` ne correspond pas à la session (la reprise F2-09 passe d'abord).

**Pièges**
- Ne pas démarrer deux fois la synchronisation automatique (mode strict de React : bien renvoyer la fonction d'arrêt dans `useEffect`).
- Ne jamais bloquer l'interface en attendant une synchronisation ; ne jamais afficher d'alerte bloquante (`alert`) pour une erreur de synchronisation.
- Ne pas recharger l'écran de séance en cours quand des données arrivent : seuls le profil et l'historique se relisent.

**Vérification sur iPhone** : mode avion, faire une séance, voir « 1 modification en attente » dans Compte ; couper le mode avion, revenir dans l'app : « À jour ». Vérifier sur l'ordinateur que la séance est arrivée.

---

## F2-11 — Export complet, import v2, suppression du compte

**Objectif** : la sauvegarde par fichier couvre toutes les données v2 (jamais la clé API), l'import accepte les anciens fichiers, et chacun peut supprimer son compte et ses données.
**Dépend de** : F2-10. **En parallèle possible** : F2-12 s'il n'est pas fini.
**Modèle** : Sonnet.

**Fichiers**
- Modifier : `src/donnees/base.ts` (`exporterDonnees`, `importerDonnees`), `src/ecrans/Compte.tsx`, `src/ecrans/Profil.tsx` (texte d'aide seulement).
- Créer : `src/donnees/sauvegarde.test.ts`.
- Lire d'abord : `docs/architecture-v2.md` § 8 ; `src/donnees/base.ts` ; `src/donnees/stockage.ts` ; `src/synchro/fusion.ts` (`decider`) ; `src/synchro/reprise.ts` (`effacerDonneesLocales`) ; `src/ecrans/Compte.tsx` ; `src/ecrans/Profil.tsx`.

**Étapes**
1. Export, format version 2 :
   ```ts
   interface SauvegardeV2 { version: 2; exporteLe: string; tables: Partial<Record<TableSynchronisee, unknown[]>> }
   ```
   Toutes les tables de `TABLES_SYNCHRONISEES`, documents supprimés compris (pour que l'import propage la suppression), **sans** le champ `aEnvoyer`. Ni `etatSynchro`, ni `appareil`.
2. Import : accepte `version: 1` (format actuel : `seancesRealisees` et `reglages`) et `version: 2`. Pour chaque document d'une table connue : compléter (`versionFormat: 1`, `creeLe ??= modifieLe`) ; appliquer `decider(local, importé)` ; si « prendre_distant », l'enregistrer avec `aEnvoyer: 1` (il partira au serveur si on est connecté). Ignorer les tables inconnues. Valeur de retour : `{ seances: number; autres: number }` ; adapter le message de `Profil.tsx` (« Sauvegarde rechargée : 12 séances et 4 autres éléments. »).
3. Suppression du compte, dans `Compte.tsx` (état connecté), tout en bas, bouton texte « Supprimer mon compte » qui ouvre une étape de confirmation dans le même écran :
   - texte : « Ton compte et toutes tes données sur le serveur seront supprimés définitivement. Les données de cet appareil seront aussi effacées. Tu peux d'abord garder une copie dans un fichier. » ;
   - bouton second « Sauvegarder dans un fichier » ;
   - champ « Tape SUPPRIMER pour confirmer » ; bouton « Supprimer définitivement », actif seulement si le champ vaut exactement `SUPPRIMER` ; hors ligne : désactivé avec « Il faut du réseau. » ;
   - action : `supabase.rpc('supprimer_mon_compte')` → si erreur, message et on s'arrête ; sinon `seDeconnecter()` (ignorer une erreur), `effacerDonneesLocales()`, `window.location.reload()` (l'app repart sur l'écran de bienvenue).
4. `Profil.tsx` : le texte d'aide sous les boutons de sauvegarde devient, si une session existe : « Tes données sont aussi copiées sur ton compte. » ; sinon le texte actuel.
5. `src/donnees/sauvegarde.test.ts` (fake-indexeddb) : l'export contient `version: 2`, les huit tables, aucun `aEnvoyer`, et **aucune trace** de `cleApiClaude` même si la table `appareil` la contient (chercher la chaîne dans le JSON) ; un fichier version 1 (séance + profil au format actuel) s'importe ; aller-retour export → base vidée → import redonne les mêmes documents ; un document importé plus ancien que le local ne l'écrase pas.

**Critères d'acceptation**
- Les sauvegardes faites avant la v2 se rechargent.
- La clé API ne peut sortir de l'appareil par aucun export (test).
- Après suppression du compte : l'utilisateur n'apparaît plus dans Supabase (« Authentication » → « Users ») et l'app redémarre vide.

**Pièges**
- Ne pas appeler l'API d'administration de Supabase : elle demande la clé secrète. La fonction SQL `supprimer_mon_compte` existe pour ça.
- L'ordre compte : supprimer côté serveur **d'abord**, effacer l'appareil **ensuite** (sinon, en cas d'échec réseau, on perdrait la copie locale sans avoir supprimé le compte).

**Vérification sur iPhone** : « Sauvegarder mes données » produit un fichier ; « Recharger une sauvegarde » avec un ancien fichier fonctionne. La suppression se teste avec un compte d'essai, pas celui d'Arthur.

---

## F2-12 — Accès au plan et valeurs dérivées

**Objectif** : fournir les fonctions de lecture et d'écriture du plan (cycles, blocs, séances planifiées, exercices personnels, salles) et les calculs dérivés dont les phases 3 et 4 auront besoin, tous testés.
**Dépend de** : F2-04 (et F2-02). **En parallèle possible** : F2-05 à F2-11 (fichiers nouveaux uniquement).
**Modèle** : Sonnet.

**Fichiers**
- Créer : `src/donnees/plan.ts`, `src/donnees/plan.test.ts`.
- Lire d'abord : `docs/architecture-v2.md` §§ 3.2 et 3.5 ; `src/donnees/modele.ts` ; `src/donnees/exemplesV2.ts` ; `src/donnees/stockage.ts` ; `src/donnees/debrief.ts` (`lundiDe`, pour la façon de calculer les dates en heure locale) ; `src/donnees/salles.ts` ; `src/donnees/profil.ts` (`COTATIONS_BLOC`) ; `src/donnees/bibliotheque/types.ts` (`Prerequis`).

**Étapes**
1. Dates (fonctions pures, jours locaux au format `"2026-11-17"`) :
   ```ts
   export function ajouterJours(jour: DateISO, n: number): DateISO      // new Date(a, m − 1, j + n), jamais new Date("2026-11-17")
   export function debutMesocycle(cycle: Cycle, meso: Pick<Mesocycle, 'ordre'>): DateISO       // debut + (ordre − 1) × 28
   export function debutSemaine(cycle: Cycle, meso: Pick<Mesocycle, 'ordre'>, semaine: 1 | 2 | 3 | 4): DateISO
   export function finCycle(cycle: Cycle): DateISO                      // dernier dimanche : debut + nbSemaines × 7 − 1
   ```
2. Plan (fonctions pures) :
   ```ts
   export function cycleEnCours(cycles: Cycle[], aujourdhui: DateISO): Cycle | undefined
     // état 'valide', sans supprimeLe ni abandonneLe, debut ≤ aujourdhui ≤ finCycle ; si plusieurs : le plus récemment modifié
   export type StatutSeance = 'faite' | 'aujourdhui' | 'a_venir' | 'sautee'
   export function statutSeance(s: SeancePlanifiee, realisees: SeanceRealisee[], aujourdhui: DateISO): StatutSeance
     // faite si une séance réalisée non supprimée cite s.id (prioritaire) ; sinon selon la date
   export function dureeEtapes(etapes: EtapeSeance[]): number          // somme des dureeMin
   export function salleEffective(id: string | undefined, sallesPerso: SallePerso[]): Salle
     // salle perso non supprimée de même id, sinon préréglage (salleParId)
   ```
3. Prérequis (fonction pure) :
   ```ts
   export function prerequisRemplis(p: Prerequis, profil: Profil): { rempli: boolean; manquants: (keyof Prerequis)[] }
   ```
   Correspondances : `anneesPratiqueMin` ↔ `anneesPratique` ; `experiencePoutreMin` ↔ `experiencePoutre` (ordre aucune < occasionnelle < reguliere) ; `tractionsStrictesMin` ↔ `tractionsStrictes` ; `test15sSur25mm` ↔ `tient15sSur25mm === true` ; `niveauBlocMin` ↔ `niveauBloc` (position dans `COTATIONS_BLOC`) ; `adulte` ↔ `majeur === true`. **Une valeur `null` ou inconnue du profil compte comme non remplie.** Commentaire en tête : « Comparaison mécanique ; les règles qui l'utilisent sont celles de l'expert entraînement. »
4. Lecture et écriture (minces enveloppes de `stockage.ts`) :
   ```ts
   export async function lireCycles(): Promise<Cycle[]>
   export async function lirePlanDuCycle(cycleId: string): Promise<{ mesocycles: Mesocycle[]; seances: SeancePlanifiee[] }>
   export async function lireSeancesEntre(debut: DateISO, fin: DateISO): Promise<SeancePlanifiee[]>  // index `date`, sans supprimées
   export async function enregistrerCycle(c: Cycle): Promise<void>                // et de même : enregistrerMesocycle,
   export async function supprimerCycle(id: string): Promise<void>                // enregistrerSeancePlanifiee, enregistrerExercicePerso,
                                                                                  // enregistrerSallePerso, lireExercicesPerso, lireSallesPerso
   ```
   `supprimerCycle` supprime (doucement) aussi ses blocs, ses objectifs spécifiques et ses séances planifiées.
5. `src/donnees/plan.test.ts` : avec `EXEMPLE_CYCLE` et `EXEMPLE_MESOCYCLES` : début du bloc 2 = 2026-12-14, du bloc 3 = 2027-01-11, semaine 4 du bloc 1 = 2026-12-07, fin du cycle = 2027-02-07 ; `ajouterJours` à travers le changement d'heure (2027-03-27 + 2 = 2027-03-29) ; `cycleEnCours` (brouillon ignoré, abandonné ignoré, hors dates → undefined) ; les quatre `statutSeance` ; `salleEffective` (perso prioritaire, perso supprimée ignorée) ; `prerequisRemplis` (null → manquant, majeur faux → `adulte` manquant, cotation inférieure → manquant, tout rempli → `rempli: true`) ; avec fake-indexeddb : `supprimerCycle` masque ses séances dans `lireSeancesEntre`.

**Critères d'acceptation**
- Tous les calculs du tableau « calculé, jamais stocké » (§ 3.5) qui concernent le plan existent ici et sont testés.
- Aucune de ces valeurs n'est enregistrée dans la base.

**Pièges**
- `new Date("2026-11-17")` est interprété en heure universelle : à minuit à Paris on tombe la veille. Toujours construire les dates avec `new Date(année, mois − 1, jour)`.
- Ne pas recalculer `statut` d'une séance à partir d'un champ stocké : il n'y en a pas, c'est voulu.

**Vérification sur iPhone** : sans objet (aucun écran ne change).

---

## F2-13 — Format de séance documenté (préparation de la montre)

**Objectif** : documenter le format d'une séance planifiée et réalisée, et publier des exemples de référence vérifiés par un test, pour qu'une future app native (Apple Watch) puisse lire les séances et rejouer le chrono à l'identique.
**Dépend de** : F2-01, F2-02. **En parallèle possible** : F2-04, F2-15.
**Modèle** : Sonnet.

**Fichiers**
- Créer : `docs/format-seance.md`, `docs/format-seance/seance-planifiee.json`, `docs/format-seance/seance-realisee.json`, `docs/format-seance/chrono-vecteurs.json`, `src/moteur/format.test.ts`.
- Lire d'abord : `docs/architecture-v2.md` §§ 3.2, 3.3 et 7 ; `src/chrono/sequence.ts` ; `src/moteur/types.ts` ; `src/moteur/seanceSolo.ts` ; `src/moteur/seanceGroupe.ts` ; `src/donnees/modele.ts` ; `src/donnees/exemplesV2.ts` ; `src/donnees/bibliotheque/doigts.ts` (exemples de réglages de chrono).

**Étapes**
1. `src/moteur/format.test.ts` génère et vérifie trois fichiers :
   - `seance-planifiee.json` = `EXEMPLE_SEANCE_PLANIFIEE` ; `seance-realisee.json` = une `SeanceRealisee` d'exemple (mode groupe, 3 blocs, liée à la séance planifiée) ;
   - `chrono-vecteurs.json` = une liste `{ nom, config, preparationS, phases }` où `phases = construireSequence(config, preparationS)`, pour au moins : `repetition_unique` (10 s, 3 séries, 180 s), `depart_minute` (10 s / 60 s, 5 répétitions, 2 séries), `intermittent` (7 s / 3 s, 6 répétitions, 3 séries, 180 s), `echelle` sans repos entre paliers (Plan le plus simple de Bechtel, voir `doigts.ts`), `echelle` avec `reposEntrePaliersS` (Échelles 3-6-9), et un cas `preparationS = 0`.
   Fonctionnement : si la variable d'environnement `REGENERER` vaut `1`, le test **écrit** les fichiers (avec `JSON.stringify(x, null, 2)` + saut de ligne final) ; sinon il les **lit** et vérifie l'égalité exacte avec ce que le code produit. Ainsi tout changement du moteur qui modifierait le format fait échouer le test.
   Commande de régénération à noter en tête du test : `REGENERER=1 npx vitest run src/moteur/format.test.ts`.
2. `docs/format-seance.md`, pour un développeur qui ne lit pas le TypeScript :
   - à quoi sert le format, et la règle « une séance planifiée est autonome : elle contient tout ce qu'il faut pour être exécutée » ;
   - où lire les données : table `documents` de Supabase, colonne `contenu`, `type = 'seancesPlanifiees'`, filtre par date (`contenu->>date`) ; règles d'accès ; la règle « dernière modification gagne » sur `modifieLe` ; `versionFormat` ;
   - chaque champ de `SeancePlanifiee`, `VersionSolo`, `VersionGroupe`, `EtapeSeance` (trois formes : chrono, liste, essais), `ConfigChrono` (quatre gabarits), `SeanceRealisee`, avec unité et sens ;
   - l'**algorithme du chrono** en pseudo-code, fidèle à `construireSequence` et `etatA` : phase de préparation, efforts et repos d'une série, long repos entre séries (pas après la dernière), cas particulier de l'échelle avec `reposEntrePaliersS` (le reste du créneau s'ajoute au repos entre séries), et le principe « on recalcule toujours depuis le temps écoulé réel » ;
   - comment écrire une séance réalisée (identifiant UUID, `aEnvoyer` n'existe pas côté serveur, `modifieLe` en heure UTC ISO) ;
   - « Les fichiers de `docs/format-seance/` sont la référence : une autre implémentation doit produire exactement les mêmes phases. »

**Critères d'acceptation**
- `npm run test` vérifie les trois fichiers JSON ; modifier une durée dans `sequence.ts` fait échouer le test.
- Le document permet de réécrire le chrono dans un autre langage sans lire le code TypeScript.

**Pièges**
- Ne pas écrire de fichier pendant un `npm run test` normal (seulement avec `REGENERER=1`).
- Lire et écrire avec des chemins construits depuis `import.meta.url`, pas depuis le dossier courant.

**Vérification sur iPhone** : sans objet.

---

## F2-14 — Mise en page bureau : squelette et navigation

**Objectif** : sur un écran large (900 px et plus), afficher une mise en page « ordinateur » avec un menu latéral et ses rubriques ; sur téléphone, ne rien changer.
**Dépend de** : F2-05, F2-11 (pour ne pas toucher `App.tsx` et les écrans en même temps qu'elles). **En parallèle possible** : aucune tâche restante ne touche ces fichiers, mais F2-16 attend celle-ci.
**Modèle** : Sonnet.

**Fichiers**
- Créer : `src/miseEnPage/useEcranLarge.ts`, `src/miseEnPage/MiseEnPageTelephone.tsx`, `src/miseEnPage/MiseEnPageBureau.tsx`, `src/miseEnPage/miseEnPage.test.ts`.
- Modifier : `src/App.tsx`, `src/index.css` (une section ajoutée **à la fin**, rien de modifié au-dessus).
- Lire d'abord : `docs/architecture-v2.md` § 6 ; `src/App.tsx` ; `src/index.css` ; `src/ecrans/EnConstruction.tsx` ; `src/ecrans/Historique.tsx` ; `src/ecrans/Profil.tsx`.

**Étapes**
1. `src/miseEnPage/useEcranLarge.ts` :
   ```ts
   export const LARGEUR_BUREAU_PX = 900
   export function estEcranLarge(largeurPx: number): boolean          // largeurPx >= LARGEUR_BUREAU_PX
   export function useEcranLarge(): boolean                           // matchMedia('(min-width: 900px)'), suit les changements
   ```
   Sans `window` (tests) : renvoie `false`.
2. `src/miseEnPage/MiseEnPageTelephone.tsx` : déplacer depuis `App.tsx`, **sans changement de rendu**, le bloc final (bandeau de mise à jour, contenu des onglets, barre d'onglets). Il reçoit en props ce dont il a besoin (`onglet`, `setOnglet`, `majPrete`, `profil`, les rappels vers `setVue`…).
3. `src/miseEnPage/MiseEnPageBureau.tsx` :
   ```ts
   export const RUBRIQUES_BUREAU = ['Plan', 'Bibliothèque', 'Mes exercices', 'Assistant', 'Bilans', 'Profil'] as const
   export type RubriqueBureau = (typeof RUBRIQUES_BUREAU)[number]
   ```
   Structure : `<div className="bureau">` avec `<nav className="bureau-menu" aria-label="Navigation principale">` (nom de l'app en haut, puis un bouton par rubrique, `aria-current="page"` sur la rubrique active, puis en bas l'e-mail du compte ou « Pas de compte ») et `<div className="bureau-contenu">`. Contenu : Bilans → `Historique`, Profil → `Profil` (mêmes props que sur téléphone), les autres → `EnConstruction` avec un titre et une phrase (Plan : « Ici tu construiras ton cycle de 12 semaines. » ; Bibliothèque : « Les 60 protocoles, filtrables. » ; Mes exercices : « Tes exercices, avec leur référence de livre si tu veux. » ; Assistant : « Un brouillon de plan proposé par l'IA, que tu modifies et valides. »). Rubrique par défaut : Plan. Le bandeau « Nouvelle version disponible » s'affiche en haut du contenu.
4. `src/App.tsx` : `const large = useEcranLarge()` ; quand `vue.nom === 'onglets'`, rendre `MiseEnPageBureau` si `large`, sinon `MiseEnPageTelephone`. Les autres vues (séance, questions, mises en garde, débrief, compte) restent rendues comme aujourd'hui dans `<div className="app">`, centrées, sur les deux mises en page. Ajouter en tête de `App` le commentaire : « Ordinateur pour organiser, téléphone pour exécuter : les séances se lancent depuis le téléphone. »
5. `src/index.css` : à la fin, une section commentée `/* Mise en page bureau (F2-14) — sera reprise par la nouvelle direction artistique */` avec les classes `.bureau` (grille : menu 240 px + contenu, hauteur 100 %), `.bureau-menu` (colonne, filet à droite, `var(--filet)`), `.bureau-menu button` (48 px de haut au moins, aligné à gauche, `aria-current` en `var(--accent)`), `.bureau-contenu` (défilement, largeur de lecture limitée à 960 px). **Uniquement des variables existantes** de `:root`.
6. `src/miseEnPage/miseEnPage.test.ts` : `estEcranLarge(899)` faux, `estEcranLarge(900)` vrai ; `RUBRIQUES_BUREAU` contient « Plan » et « Profil » ; `useEcranLarge` peut être importé sans `window` (pas d'erreur au chargement).

**Critères d'acceptation**
- À 375 px de large (iPhone), l'app est identique pixel pour pixel à avant (comparer avant / après avec les outils du navigateur en mode appareil).
- À 1 280 px, menu latéral et contenu ; Bilans et Profil fonctionnent ; ouvrir un débrief depuis Bilans puis le fermer ramène au bureau.
- Redimensionner la fenêtre fait basculer d'une mise en page à l'autre sans recharger.

**Pièges**
- La classe `.app` limite la largeur à 480 px : ne pas la modifier (le téléphone en dépend) ; la mise en page bureau a sa propre classe racine.
- Ne pas ajouter de routeur ni de dépendance.
- Ne rien styler de la nouvelle direction artistique : squelette seulement.

**Vérification sur iPhone** : tous les onglets et une séance complète, à l'identique. Sur ordinateur : ouvrir l'adresse de l'app dans une grande fenêtre.

---

## F2-15 — Garder le projet Supabase éveillé

**Objectif** : une tâche GitHub Actions hebdomadaire appelle la fonction `ping()` du projet Supabase pour limiter sa mise en pause après 7 jours sans activité.
**Dépend de** : F2-06 (variables de dépôt) et le script de F2-03 exécuté par Arthur. **En parallèle possible** : F2-04, F2-13.
**Modèle** : Haiku.

**Fichiers**
- Créer : `.github/workflows/reveil-supabase.yml`.
- Modifier : `docs/supabase.md` (une section).

**Étapes**
1. `.github/workflows/reveil-supabase.yml` :
   ```yaml
   # Appelle chaque lundi une petite fonction du projet Supabase (elle ne lit aucune donnée),
   # pour éviter que l'offre gratuite ne mette le projet en pause après 7 jours sans activité.
   name: Réveil Supabase

   on:
     schedule:
       - cron: '17 6 * * 1' # chaque lundi à 6 h 17 (heure universelle)
     workflow_dispatch: # permet aussi de le lancer à la main

   permissions:
     contents: read

   jobs:
     reveil:
       runs-on: ubuntu-latest
       if: ${{ vars.VITE_SUPABASE_URL != '' }}
       steps:
         - name: Appeler ping()
           run: |
             curl --fail --silent --show-error -X POST "${{ vars.VITE_SUPABASE_URL }}/rest/v1/rpc/ping" \
               -H "apikey: ${{ vars.VITE_SUPABASE_CLE_PUBLIQUE }}" \
               -H "Content-Type: application/json" -d '{}'
   ```
2. `docs/supabase.md` : section « Le réveil hebdomadaire » : ce que fait le fichier ; comment le lancer à la main (onglet « Actions » → « Réveil Supabase » → « Run workflow ») ; que faire si le projet est quand même en pause (« Restore project » dans le tableau de bord ; les données sont conservées et les appareils renvoient ce qu'ils ont en attente).

**Critères d'acceptation**
- Lancé à la main depuis l'onglet Actions, le travail réussit (coche verte) une fois le projet créé et les variables ajoutées.
- Le fichier ne contient aucune valeur en dur (seulement `vars.…`).

**Pièges**
- Utiliser `vars.` et non `secrets.` (ce sont les variables de dépôt créées par Arthur).
- `ping` doit être appelé en `POST` sur `/rest/v1/rpc/ping`.

**Vérification sur iPhone** : sans objet.

---

## F2-16 — Recette de fin de phase et README

**Objectif** : vérifier que tout ce qui marchait marche encore et que les nouveautés de la phase 2 fonctionnent, écrire la liste de vérification d'Arthur et mettre le README à jour.
**Dépend de** : toutes les autres tâches. **En parallèle possible** : rien.
**Modèle** : Haiku.

**Fichiers**
- Créer : `docs/recette-phase-2.md`.
- Modifier : `README.md`.
- Lire d'abord : `README.md`, `docs/architecture-v2.md` (§§ 0, 4, 6, 8, 9), `docs/supabase.md`, la liste des fichiers de `src/`.

**Étapes**
1. Lancer `npm ci`, `npm run lint`, `npm run test`, `npm run build`. Noter le nombre de tests (il doit dépasser nettement 31). Si quelque chose échoue : **ne pas corriger**, le signaler au gérant avec la sortie exacte.
2. Contrôles automatiques à faire et à consigner dans `docs/recette-phase-2.md` (résultat de chaque commande) :
   - `grep -rn "sb_secret_" src .github` → seulement le refus dans `src/compte/client.ts` ;
   - `grep -rn "supabase-js" src` → seulement `src/compte/client.ts` (et les types dans `src/synchro/serveurSupabase.ts`) ;
   - `grep -rn "from 'react'" src/moteur src/chrono/sequence.ts` → rien ;
   - `grep -rn "cleApiClaude" src` → seulement `stockage.ts` / tests ;
   - les versions 1 et 2 de la base sont toujours déclarées dans `src/donnees/base.ts`.
3. `docs/recette-phase-2.md` : en plus des résultats ci-dessus, la **liste de vérification manuelle pour Arthur**, en cases à cocher, en trois parties :
   - **iPhone, sans compte** : ouvrir l'app mise à jour ; anciennes séances présentes dans Bilans ; profil intact et quatre nouvelles questions ; séance solo complète avec chrono (pause, reprise, « Stop, ça fait mal ») ; séance en groupe (3 blocs, annuler, changer d'objectif) ; trois questions ; débrief ; sauvegarde et rechargement d'un fichier ; bandeau de mise à jour ;
   - **iPhone, avec compte** : connexion par code ; reprise de l'historique ; séance en mode avion puis retour du réseau (« À jour ») ; déconnexion avec modifications en attente ; reconnexion ;
   - **ordinateur** : mise en page bureau à 1 280 px et bascule en réduisant la fenêtre ; connexion au même compte ; historique du téléphone visible ; profil modifié sur l'ordinateur visible sur le téléphone ; test d'isolement à deux comptes (`docs/supabase.md`) ; suppression d'un compte d'essai.
4. `README.md` : remplacer la phrase « Les données restent sur l'appareil de chaque personne : ni compte ni serveur. » par « Les données restent sur l'appareil et fonctionnent hors ligne. Avec un compte (facultatif), elles se synchronisent entre téléphone et ordinateur. » ; compléter « Où trouver quoi » avec `src/moteur/`, `src/compte/`, `src/synchro/`, `src/miseEnPage/`, `src/donnees/modele.ts`, `src/donnees/stockage.ts`, `src/donnees/plan.ts`, `supabase/`, `docs/architecture-v2.md`, `docs/supabase.md`, `docs/format-seance.md` ; section « Technique » : ajouter Supabase (comptes par code e-mail, une table de documents protégée par des règles d'accès) ; vérifier que les lignes F2-01 à F2-15 sont dans le tableau « État » et ajouter F2-16.

**Critères d'acceptation**
- `docs/recette-phase-2.md` existe, avec les résultats des contrôles et la liste de vérification complète.
- README à jour, sans jargon non expliqué.

**Pièges**
- Ne modifier aucun fichier de `src/`.
- Ne pas cocher soi-même les vérifications manuelles : elles sont pour Arthur.

**Vérification sur iPhone** : c'est l'objet de la liste écrite dans cette tâche.

---

## Annexe — Ce qu'Arthur fait, et quand

| Moment | Action | Détail |
|---|---|---|
| Après F2-03 | Créer le compte et le projet Supabase, exécuter le SQL et la vérification | `docs/supabase.md`, étapes 1 à 3 |
| Avant F2-07 | Régler la connexion par code, brancher Gmail (ou un domaine), récupérer les deux valeurs, les mettre dans GitHub et dans `.env.local` | Étapes 4 à 8 |
| Après F2-07 | Se connecter une première fois | Étape 9 |
| Après F2-10 | Test réel téléphone + ordinateur, test d'isolement à deux comptes | `docs/supabase.md` |
| Après F2-16 | Recette complète | `docs/recette-phase-2.md` |
