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
- Modèles (décision du propriétaire, 17/11/2026) : la conversation de pilotage tourne sur Opus 5.5. Les décisions de conception, les spécifications et le découpage des tâches sont confiés à Opus, effort extra-élevé (précision du 23/11/2026). Le code est confié à Sonnet, ainsi que les tâches mécaniques et les tests (décision du 26/11/2026 : Haiku a créé trois fois des rappels interdits ; il n'est plus utilisé). Fable sert seulement à auditer un travail terminé ; sans crédits d'usage, l'audit passe à Opus effort élevé (18/11). Le gérant vérifie chaque livraison par rapport aux spécifications de départ. Voir docs/plan-v2.md, section 7.
- Agents : réservés aux travaux indépendants (recherche, contenus). Les tâches qui touchent les mêmes fichiers se font l'une après l'autre.
