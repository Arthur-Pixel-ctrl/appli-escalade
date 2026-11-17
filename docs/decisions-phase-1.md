# Décisions de fin de phase 1

17 novembre 2026. Les trois concepteurs (architecture, design, entraînement) ont posé 24 questions qui se recoupent. Elles sont regroupées ici avec une recommandation. Statut : **en attente de validation par Arthur.** Une recommandation non contestée devient une décision.

## A. Questions qu'Arthur doit trancher lui-même

| # | Question | Options | Recommandation |
|---|---|---|---|
| A1 | La direction visuelle « Topo » (carnet de salle, fond craie, fiches vissées, rubalise) et le vert pétrole pour l'action | Oui / à retravailler | — (goût personnel) |
| A2 | Nom de l'app | Libre | — |
| A3 | Adresse d'envoi des codes de connexion | Une adresse Gmail dédiée (gratuit) / un nom de domaine (environ 10 € par an, plus propre) | Gmail dédiée pour commencer |

## B. Recommandations, appliquées sauf avis contraire

**Compte et données**
| # | Sujet | Recommandation | Pourquoi |
|---|---|---|---|
| B1 | Connexion | Code à 6 chiffres reçu par e-mail, pas de lien | Sur iPhone, le lien s'ouvre dans Safari, qui ne partage pas sa mémoire avec l'app installée |
| B2 | Qui peut s'inscrire | Liste d'invités tenue par Arthur | Offre gratuite limitée, app entre amis |
| B3 | Usage sans compte | Conservé : tout marche sur l'appareil, sans partage ni copie de sécurité | Déjà prévu par l'architecture |
| B4 | Transparence | L'app dit qu'Arthur, administrateur du serveur, peut techniquement voir les données | Honnêteté envers les amis |

**Assistant IA**
| # | Sujet | Recommandation | Pourquoi |
|---|---|---|---|
| B5 | Modèle par défaut | Haiku, Sonnet en option dans les réglages | Coût par brouillon environ 15 fois plus faible selon l'architecte (estimation à revérifier) |
| B6 | Coût affiché | Estimation affichée avant chaque demande | Chacun paie avec sa clé |
| B7 | Où | Ordinateur seulement au début | L'ordinateur organise, le téléphone exécute |

**Écrans**
| # | Sujet | Recommandation |
|---|---|---|
| B8 | Fond clair | Oui. Thème sombre du soir reporté après la phase 4 |
| B9 | « Bloc 1 » ou « Phase 1 » pour les périodes de 4 semaines | « Phase », pour ne pas confondre avec un bloc d'escalade |
| B10 | « Forme du jour » | Gardée et rendue utile : elle alimente les contrôles du jour (phase 4) |
| B11 | Ajuster le plan sur téléphone | Petits ajustements seulement : déplacer ou sauter une séance |
| B12 | Lancer une séance sur ordinateur | Masqué : on lance depuis le téléphone |

**Entraînement**
| # | Sujet | Recommandation |
|---|---|---|
| B13 | Une phase centrée sur la technique | Oui, possible : la technique est souvent ce qui limite autour du 7A |
| B14 | Repères de traction, différents selon le sexe dans les sources | Pas affichés par défaut ; repère au choix dans le profil, facultatif |
| B15 | « Planche » dans les objectifs | La planche de gymnastique (full planche), comme Arthur l'a écrit |
| B16 | 5e séance de la semaine | Sans grimpe (renforcement, mobilité) |
| B17 | Effort prévu par défaut | 7 pour une séance dure, 4 pour une légère, modifiable |
| B18 | Plafond de poutre selon l'ancienneté (Bechtel) | Affiché en information, pas en avertissement |
| B19 | Séances à la maison | Sans version groupe |
| B20 | Objectif « 5 blocs durs, 5 essais max » | Ramené à 3 blocs × 4 essais |
| B21 | Trous de la bibliothèque (tests de fin de phase, échauffement court, modules de 10 à 15 min, arqués, planche, front lever, peur de la chute en bloc, fiches de groupe, résistance en voie) | Recherche ciblée, vérification et audit, comme pour la bibliothèque, avant la phase 3 |

## C. Corrections relevées par le gérant

- Démonstration du constructeur : l'assistant y attribue la règle des 48 h au livre *Escalade Training : les secrets de la planification*. Rien ne permet de l'affirmer. À corriger : l'assistant ne prête jamais à un livre une affirmation que nous n'avons pas vérifiée.
- Les tâches design citent des dépendances « [archi] » et « [entraînement] » à relier aux identifiants F2 et E, dans une liste unique ordonnée.

## D. Ce qu'Arthur devra faire (environ 1 h, au milieu de la phase 2)

D'après `docs/architecture-v2.md` section 9 : créer le compte et le projet Supabase ; coller deux scripts SQL fournis ; régler la connexion par code et les modèles d'e-mail ; brancher l'adresse d'envoi ; copier deux valeurs publiques dans GitHub. Le guide pas à pas sera fourni au bon moment.

## E. Étape suivante

Une consolidation (concepteur Opus, effort élevé) fusionne les 56 tâches (F2-01 à F2-16, D-01 à D-24, E-01 à E-16) en une liste unique, ordonnée en vagues, en appliquant ces décisions. Puis la phase 2 démarre.
