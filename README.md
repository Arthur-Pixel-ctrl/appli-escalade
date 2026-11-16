# Appli escalade

Application d'entraînement à l'escalade : séances guidées avec chrono, séances en groupe à objectifs, programme par blocs de 4 semaines, mobilité et repères de nutrition.

Elle s'installe sur le téléphone comme une app (PWA) et fonctionne hors ligne. Les données restent sur l'appareil de chaque personne : ni compte ni serveur.

Les contenus d'entraînement, de nutrition et de mobilité sont des repères généraux, pas un avis médical.

## État

| Lot | Contenu | État |
|---|---|---|
| 3.1 | Squelette de l'app, thème, navigation | Fait |
| 3.2 | Moteur de chrono | À faire |
| 3.3 | Séance guidée (solo) | À faire |
| 3.4 | Séance en groupe, saisie des blocs | À faire |
| 3.5 | Trois questions et débrief | À faire |
| 3.6 | Profil et premier lancement | À faire |

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
| `src/index.css` | Thème : couleurs, police, composants de base |
| `vite.config.ts` | Configuration de la construction et de l'installation sur téléphone |
| `docs/modele-donnees.md` | Modèle de données de l'app |

## Technique

React, TypeScript, Vite. Stockage local prévu avec Dexie (IndexedDB). Tests avec Vitest.
