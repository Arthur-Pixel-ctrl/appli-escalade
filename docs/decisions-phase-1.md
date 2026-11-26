# Décisions de fin de phase 1

17 novembre 2026. Les trois concepteurs (architecture, design, entraînement) ont posé 24 questions qui se recoupent. Elles sont regroupées ici avec une recommandation. Statut : **validé par Arthur le 17/11/2026** (A1 oui, A3 Gmail dédiée, toutes les recommandations B appliquées). A2 décidé le 18/11 : « Get me to 9a ».

## A. Questions qu'Arthur doit trancher lui-même

| # | Question | Options | Recommandation |
|---|---|---|---|
| A1 | La direction visuelle « Topo » (carnet de salle, fond craie, fiches vissées, rubalise) et le vert pétrole pour l'action | Oui / à retravailler | **Décidé : oui** |
| A2 | Nom de l'app | Libre | **Décidé le 18/11 : « Get me to 9a »** (clin d'œil aux grimpeurs, sans nom de personne réelle) |
| A3 | Adresse d'envoi des codes de connexion | Une adresse Gmail dédiée (gratuit) / un nom de domaine (environ 10 € par an, plus propre) | **Décidé : Gmail dédiée** |

## B. Recommandations (toutes validées le 17/11/2026)

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

## F. Décisions du 18/11/2026 (après la phase 2)

| # | Sujet | Décision d'Arthur |
|---|---|---|
| F1 | Recette de la phase 2 et mise en place de Supabase | Reportées à plus tard ; on passe à la phase 3 |
| F2 | Recherche B21 (`docs/recherche-b21/audit.md`, 15 points) | **Tout oui** : les 15 recommandations de l'audit sont validées (tests jamais placés dans une séance générée et conditions strictes pour les tests maximaux ; réglages des tests maximaux ; repères Lattice affichés comme repères ; tests de fin de cycle pour la courbe seulement ; zones « hanche » et « cheville » ; échauffement court réservé aux séances non maximales ; bidoigts à 8 tenues au départ ; module hanches de 12 min ; école de vol courte en voie ; une seule fiche de chute en bloc, 50-80-100 cm, hors génération ; rappel de sécurité du bloc ; jeux de groupe sans élimination, 4 blocs ; trois séances de résistance en voie, 1 par semaine en profil bloc, pyramide abandonnée ; gainage au sol, front lever et préparation planche en fiches d'essai, objectif « planche complète » retiré ; arqué doux au mur, jamais automatique, après relecture par un kiné) |
| F3 | Bibliothèque | La bibliothèque est une **banque d'exercices** dans laquelle le générateur de plan, puis l'assistant IA, piochent selon les objectifs, le nombre de séances par semaine, les prérequis et les douleurs du grimpeur |
| F4 | Niveau de détail des séances | **Trois niveaux**, même structure (cycle de 12 semaines, 3 phases, séances avec type, dureté et durée) : **Simple** (type de séance et une recommandation), **Grandes lignes** (les 3 ou 4 blocs de la séance avec l'exercice principal), **Détaillé** (chaque étape avec chrono, séries, repos, consignes, comme aujourd'hui) |
| F5 | Où se choisit le niveau | **À la création du programme, sur ordinateur** : un niveau par défaut pour tout le cycle, modifiable séance par séance (sur ordinateur aussi). Le téléphone affiche chaque séance à son niveau et garde le suivi (chrono, trois questions, débrief) |
| F6 | Niveau de détail proposé à la création d'un cycle (question Q1 de `docs/specs/niveaux-de-detail.md`) | **Pas de niveau imposé : l'app pose la question à la création du cycle, et la proposition dépend de l'objectif.** À reporter dans `niveaux-de-detail.md` (Q1), N-01 (`NIVEAU_PAR_DEFAUT` remplacé par une fonction de proposition selon l'objectif) et D-25 / O-13 (la question du niveau vient après le choix de l'objectif) |
| F7 | Séance « dure » écrite à la main sans exercice de la banque (question Q2) | **Non** : elle compte comme une séance dure ordinaire, pas comme un effort maximal. À reporter dans `niveaux-de-detail.md` (B.2, S-26, Q2) et `moteur-verification.md` (`marqueursVersion` sans `maximale` dans ce cas, S-26 reformulée en information, cas de test 14) |

## G. Décisions du 26/11/2026 (phase 4)

| # | Sujet | Décision d'Arthur |
|---|---|---|
| G1 | Fin de phase 3 | Essai réel sur ordinateur réussi (« tout semble bien marcher ») : phase 3 validée, passage à la phase 4 |
| G2 | Douleurs (question posée par le cadrage de la phase 4, sous C-04) | **Remplacer par les douleurs datées** : la question du profil « Une douleur en ce moment ? » (zones sans date) est remplacée par les douleurs déclarées et datées de C-04, une seule source pour les règles (S-04 à S-06, J-03, J-05). Mise en œuvre à spécifier (premier écran, profil téléphone et ordinateur, reprise des zones déjà notées, moteur) |
