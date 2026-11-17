# Consignes pour Claude sur ce dépôt

- Projet piloté depuis le projet Claude « Appli escalade ». Le document de contexte du projet fait foi (vision, décisions, feuille de route, direction visuelle).
- Langue : interface, commentaires, noms de variables métier et messages de commit en français.
- Le propriétaire est peu technique et lit le code pour progresser : noms clairs, commentaires courts qui expliquent le pourquoi, pas de sur-ingénierie.
- Travailler une tâche à la fois ; chaque tâche se termine par un commit poussé et une mise à jour du tableau « État » du README.
- Design : identité « Topo », décrite dans `docs/specs/design/DESIGN.md` (une couleur par rôle : action, annotation, avertissement, arrêt ; les couleurs de prises ne servent qu'à désigner les blocs). Variables de `src/index.css` uniquement, boutons d'au moins 48 px de haut, focus visible, un écran = une action principale.
- Données : suivre `docs/architecture-v2.md` section 3 (le modèle v1 de `docs/modele-donnees.md` est remplacé). Rien de calculable n'est stocké.
- Décisions en vigueur : `docs/plan-v2.md` et `docs/decisions-phase-1.md`.
- Sécurité de l'entraînement : avertir sans bloquer ; afficher les signaux d'arrêt ; valeurs par défaut prudentes.
- Avant de livrer : `npm run build` et `npm run test` doivent passer.
- Modèles (décision du propriétaire, 17/11/2026) : la conversation de pilotage tourne sur Opus 5.5. Les concepteurs qui écrivent les spécifications et découpent les tâches sont en Opus, effort élevé. Le code est confié à Sonnet, les tâches mécaniques et les tests à Haiku. Fable sert seulement à auditer un travail terminé. Voir docs/plan-v2.md, section 7.
- Agents : réservés aux travaux indépendants (recherche, contenus). Les tâches qui touchent les mêmes fichiers se font l'une après l'autre.
