# Appli escalade

Application d'entraînement à l'escalade : séances guidées avec chrono, séances en groupe à objectifs, programme par blocs de 4 semaines, mobilité et repères de nutrition.

Elle s'installe sur le téléphone comme une app (PWA) et fonctionne hors ligne. Les données restent sur l'appareil de chaque personne : ni compte ni serveur.

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
| 3.6 | Profil et premier lancement | À faire |

## Ouvrir l'app

Adresse : https://arthur-pixel-ctrl.github.io/appli-escalade/

À chaque enregistrement sur la branche `main`, l'app est testée, construite et mise en ligne automatiquement (onglet « Actions » du dépôt). Sur téléphone, ouvrir l'adresse puis « Ajouter à l'écran d'accueil » pour l'installer.

## Lancer l'app sur son ordinateur

Il faut Node.js 22 ou plus récent.

```bash
npm install     # installe les dépendances (une seule fois)
npm run dev     # lance l'app en local, adresse affichée dans le terminal
npm run test    # lance les tests
npm run build   # construit la version à mettre en ligne (dossier dist/)
```

## Où trouver quoi

| Dossier ou fichier | Rôle |
|---|---|
| `src/main.tsx` | Point d'entrée : démarre l'app |
| `src/App.tsx` | Structure générale et barre d'onglets |
| `src/ecrans/` | Un fichier par écran |
| `src/donnees/seanceExemple.ts` | La séance d'exemple et la forme d'une étape |
| `src/donnees/seanceGroupeExemple.ts` | Les objectifs de groupe d'exemple |
| `src/donnees/base.ts` | La base de données sur le téléphone et l'enregistrement d'une séance |
| `src/donnees/debrief.ts` | Calculs du débrief (charge, semaine, blocs par couleur), testés |
| `src/donnees/salles.ts` | Les salles et leurs couleurs de blocs |
| `src/chrono/sequence.ts` | Calcul du chrono : phases d'effort et de repos, testé |
| `src/chrono/useChrono.ts` | Fait tourner le chrono dans un écran |
| `src/chrono/signaux.ts` | Bips, vibrations, écran qui reste allumé |
| `src/index.css` | Thème : couleurs, police, composants de base |
| `vite.config.ts` | Configuration de la construction et de l'installation sur téléphone |
| `docs/modele-donnees.md` | Modèle de données de l'app |

## Technique

React, TypeScript, Vite. Stockage local avec Dexie (IndexedDB) : les séances restent sur l'appareil. Tests avec Vitest.
