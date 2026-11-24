# Get me to 9a

(dépôt et adresse : `appli-escalade`)

Application d'entraînement à l'escalade : séances guidées avec chrono, séances en groupe à objectifs, programme par blocs de 4 semaines, mobilité et repères de nutrition.

Elle s'installe sur le téléphone comme une app (PWA) et fonctionne hors ligne. Les données restent sur l'appareil. Avec un compte (facultatif), elles se synchronisent entre téléphone et ordinateur.

Les contenus d'entraînement, de nutrition et de mobilité sont des repères généraux, pas un avis médical.

## État

| Lot | Contenu | État |
|---|---|---|
| 3.1 | Squelette de l'app, thème, navigation | Fait |
| 3.1 bis | Mise en ligne automatique (GitHub Pages) | Fait |
| 3.2 | Moteur de chrono (4 gabarits, sons, vibrations, écran allumé) | Fait |
| 3.3 | Séance guidée (solo), sur une séance d'exemple | Fait |
| 3.4 | Séance en groupe, saisie des blocs par couleur | Fait |
| 3.5 | Trois questions, débrief, enregistrement des séances, historique | Fait |
| 3.6 | Profil, premier lancement, sauvegarde des données | Fait |
| 4.1 | Bibliothèque de 60 protocoles, vérifiée à la source et auditée (`docs/verifications.md`, `docs/audit-bibliotheque.md`) | Fait |

### Plan v2 (`docs/plan-v2.md`, liste des tâches : `docs/backlog-v2.md`)

Phase 2 (fondations) : la base de données est passée à la version 3, avec écriture unique, migration sans perte et sauvegarde complète. L'app accepte un compte facultatif (connexion par code e-mail), synchronise les séances entre téléphone et ordinateur, et a une mise en page ordinateur. Recette de fin de phase : [`docs/recette-phase-2.md`](docs/recette-phase-2.md).

| Tâche | Contenu | État |
|---|---|---|
| F2-01 | Moteur de séance indépendant de l'affichage (`src/moteur/`) | Fait |
| F2-03 | Script du serveur Supabase et guide d'installation (`supabase/`, `docs/supabase.md`) | Fait |
| D-01 | Polices et couleurs de l'identité « Topo », nom « Get me to 9a » | Fait |
| F2-02 | Modèle de données v2 : types, exemples, profil complété (`src/donnees/modele.ts`) | Fait |
| F2-06 | Client Supabase, sans effet tant que le projet n'est pas configuré (`src/compte/client.ts`) | Fait |
| D-02 | Composants de base « Topo » en CSS (fiches, étiquettes, avertissements, signaux d'arrêt) | Fait |
| F2-13 | Format de séance documenté pour une future montre (`docs/format-seance.md`) | Fait |
| F2-15 | Réveil automatique du projet Supabase, lundi et jeudi (`.github/workflows/reveil-supabase.yml`) | Fait |
| D-03 | Icônes, pastille de prise et encadré d'avertissement (`src/composants/`) | Fait |
| F2-04 | Base locale version 3 : nouvelles tables, écriture unique `ecrire()`, migration sans perte (`src/donnees/stockage.ts`) | Fait |
| D-04 | Fenêtre de confirmation et erreur d'enregistrement affichée dans l'écran (`src/composants/Confirmation.tsx`) | Fait |
| F2-05 | Profil : quatre prérequis facultatifs pour débloquer les exercices exigeants | Fait |
| F2-08 | Moteur de synchronisation, pas encore branché sur l'app (`src/synchro/`) | Fait |
| D-05 | Chrono plein écran : préparation sur encre, effort sur craie, repos sur résine | Fait |
| F2-12 | Accès au plan : dates des phases, statut des séances, fin du cycle, calculés à la lecture (`src/donnees/plan.ts`) | Fait |
| D-06 | Barre d'onglets avec icônes et nouvel écran Aujourd'hui (données d'exemple jusqu'à D-22) | Fait |
| F2-07 | Connexion par code reçu par e-mail, visible seulement une fois Supabase configuré (`src/ecrans/Compte.tsx`) | Fait, essai réel à faire |
| D-07 | Séance solo et séance en groupe au style « Topo », avertissement au-delà de 4 essais | Fait |
| F2-09 | Lien du compte et reprise des séances déjà sur l'appareil, sans rien effacer (`src/synchro/reprise.ts`) | Fait, essai réel à faire |
| D-08 | Trois questions, débrief, bilans par semaine et mises en garde au style « Topo » | Fait |
| F2-10 | Synchronisation automatique (démarrage, retour du réseau, après chaque écriture) et indicateur, active seulement avec un compte lié (`src/synchro/automatique.ts`) | Fait, essai réel à faire |
| D-09 | Profil, bienvenue (prénom demandé), chargement, icône « 9a » au style « Topo » | Fait |
| F2-11 | Sauvegarde complète (11 tables, sans clé API), rechargement des anciens fichiers, suppression du compte | Fait, suppression à essayer pour de vrai |
| F2-14 | Mise en page ordinateur (1024 px et plus) : barre du haut et rubriques, sans lancement de séance | Fait |
| D-21 | Bienvenue avec compte ou sans compte, « J'ai une sauvegarde » avant de créer le profil, bandeau hors ligne | Fait |
| F2-16 | Recette de fin de phase 2 et README (`docs/recette-phase-2.md`) | Fait |
| Audit 2 | Audit de fin de phase 2 (`docs/audits/audit-phase-2.md`) : 0 bloquant, 2 importants et 11 mineurs, tous corrigés | Fait |
| B21 | Recherche sur les trous de la bibliothèque, auditée (`docs/recherche-b21/`) ; 27 fiches ajoutées à la banque d'exercices (9 proposables, 18 hors génération jusqu'à validation), zones de douleur « hanche » et « cheville » | Fait |
| N-01 | Niveaux de détail : types et fonction `niveauPropose` (proposition selon les accents des phases) | Fait |
| E-01 | Moteur de vérification : types et réglages par défaut (`src/regles/`) | Fait |
| C-02 | Catalogue des objectifs spécifiques (10, dont 4 à ajouter à la main seulement) | Fait |
| D-20 | Profil et réglages sur ordinateur : jours, lieux, règles, clé de l'assistant gardée sur l'appareil | Fait |
| E-02 | Moteur de vérification : fonctions de base et adaptateur de la bibliothèque | Fait |
| E-10 | Catalogue des 26 séances types (avec leur recommandation d'une ligne) et des 21 objectifs de groupe | Fait |
| E-03 à E-08 | Moteur de vérification : séance (S-01 à S-26), semaine (W-01 à W-19), jour (J-01 à J-07), plan (P-01 à P-15) | Fait |
| D-14 | Plan sur ordinateur : vue 12 semaines, fenêtre « Nouveau cycle » avec niveau de détail proposé selon les accents | Fait |
| C-01 | Passerelles entre le plan, la banque d'exercices et le moteur ; résumés des niveaux Simple et Grandes lignes | Fait |
| D-15 | Plan sur ordinateur : vue phase (4 semaines × 7 jours), ajouter, copier, déplacer, recopier une semaine | Fait |
| G-02 | Semaines types du générateur (2 à 5 séances, 6 accents) et accents de départ selon le profil | Fait |
| E-17 | Plafond de résistance en voie (W-20 : 1 par semaine en profil bloc, 2 en voie) et avertissements distincts par sujet | Fait |
| D-11 | Bibliothèque sur ordinateur : banque d'exercices filtrable (qualité, terrain, durée, prérequis, preuve, groupe), étiquette « À la main seulement » | Fait |
| E-09 | Moteur de vérification : point d'entrée unique (`src/regles/index.ts`), dédoublonnage, les 18 cas d'exemple vérifiés de bout en bout | Fait |

## Ouvrir l'app

Adresse : https://arthur-pixel-ctrl.github.io/appli-escalade/

À chaque enregistrement sur la branche `main`, l'app est testée, construite et mise en ligne automatiquement (onglet « Actions » du dépôt). Sur téléphone, ouvrir l'adresse puis « Ajouter à l'écran d'accueil » pour l'installer.

L'app installée vérifie les nouvelles versions à chaque ouverture. Quand il y en a une, un bandeau « Nouvelle version disponible » apparaît en haut des onglets : il suffit de le toucher. La date de la version en cours est affichée en bas de l'onglet Profil.

## Lancer l'app sur son ordinateur

Il faut Node.js 22 ou plus récent.

```bash
npm install     # installe les dépendances (une seule fois)
npm run dev     # lance l'app en local, adresse affichée dans le terminal
npm run test    # lance les tests
npm run build   # construit la version à mettre en ligne (dossier dist/)
```

Pour tester les comptes, copier `.env.exemple` en `.env.local` et y mettre les valeurs du projet Supabase (voir `docs/supabase.md`). Sans ce fichier, l'app fonctionne sans compte.

## Où trouver quoi

| Dossier ou fichier | Rôle |
|---|---|
| `src/main.tsx` | Point d'entrée : démarre l'app |
| `src/App.tsx` | Structure générale et barre d'onglets |
| `src/ecrans/` | Un fichier par écran |
| `src/donnees/seanceExemple.ts` | La séance d'exemple et la forme d'une étape |
| `src/donnees/seanceGroupeExemple.ts` | Les objectifs de groupe d'exemple |
| `src/donnees/bibliotheque/` | La bibliothèque de protocoles, un fichier par qualité, testée |
| `src/donnees/profil.ts` | La forme du profil du grimpeur |
| `src/moteur/` | Le moteur de séance, sans affichage (testé) |
| `src/compte/` | Connexion par code, client Supabase, session |
| `src/synchro/` | Synchronisation entre téléphone et serveur, reprise des séances |
| `src/miseEnPage/` | Mise en page téléphone et mise en page ordinateur (bascule à 1 024 px) |
| `src/donnees/base.ts` | La base de données sur le téléphone et l'enregistrement d'une séance |
| `src/donnees/modele.ts` | Forme des données v2 (séances, plan, profil) |
| `src/donnees/stockage.ts` | Écriture unique des données, sauvegarde et rechargement |
| `src/donnees/plan.ts` | Dates des phases et statut des séances, calculés à la lecture |
| `src/donnees/debrief.ts` | Calculs du débrief (charge, semaine, blocs par couleur), testés |
| `src/donnees/salles.ts` | Les salles et leurs couleurs de blocs |
| `src/chrono/sequence.ts` | Calcul du chrono : phases d'effort et de repos, testé |
| `src/chrono/useChrono.ts` | Fait tourner le chrono dans un écran |
| `src/chrono/signaux.ts` | Bips, vibrations, écran qui reste allumé |
| `src/index.css` | Thème : couleurs, police, composants de base |
| `vite.config.ts` | Configuration de la construction et de l'installation sur téléphone |
| `supabase/` | Script SQL de la base serveur et sa vérification |
| `docs/modele-donnees.md` | Modèle de données de l'app (version 1, remplacée) |
| `docs/architecture-v2.md` | Architecture de la phase 2 |
| `docs/supabase.md` | Guide pas à pas du serveur Supabase |
| `docs/format-seance.md` | Format de séance documenté pour une future montre |

## Technique

React, TypeScript, Vite. Stockage local avec Dexie (IndexedDB) : les séances restent sur l'appareil. Tests avec Vitest. Comptes et synchronisation avec Supabase : connexion par code envoyé par e-mail, et une table de documents protégée par des règles d'accès (une personne ne voit que ses données).
