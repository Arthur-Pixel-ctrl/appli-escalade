# Plan v2 — Appli escalade

17 novembre 2026 · Statut : validé par Arthur. Phase 1 lancée le 17/11 au soir.
Ce plan fait suite aux tests avec des grimpeurs. Il remplace la feuille de route de `contexte-projet.md` à partir du lot 4.

## 1. Les demandes et ce qu'elles impliquent

| Demande | Ce que ça implique |
|---|---|
| Une plateforme ordinateur pour organiser son entraînement | Même app, avec une mise en page « bureau » dédiée à la planification. L'ordinateur sert à organiser, le téléphone à exécuter. |
| Le téléphone pour le déroulé de séance, la saisie et le chrono | C'est ce qui existe. Conservé, puis branché sur le plan. |
| Une version Apple Watch | Impossible en app web : watchOS n'accepte pas les PWA. Il faut une app native (Swift), un Mac avec Xcode et un compte développeur Apple payant. Phase finale, optionnelle, décision reportée. **L'architecture doit dès maintenant la rendre possible.** |
| Une bibliothèque d'exercices pour construire son programme soi-même | Bibliothèque consultable et filtrable sur ordinateur, ajout d'exercices personnels, constructeur de plan par glisser-déposer. |
| Garder les blocs de 4 semaines | Décidé : cycle de 12 semaines = 3 blocs de 4 semaines (3 de charge, 1 allégée et réglable). |
| Un assistant IA qui aide sans décider | L'assistant propose des brouillons ; l'utilisateur modifie et valide. Il s'appuie sur la synthèse théorique, la bibliothèque et les méthodes reconnues, en citant ses sources. Toute proposition passe par les règles de sécurité codées : l'IA ne peut pas les contourner. |
| Les livres de référence | Voir section 4. |
| Une direction artistique propre, inspirée de sisyf.com | Voir section 2. |

## 2. Direction artistique : notre propre identité

**Principe (décision d'Arthur du 17/11)** : on s'inspire de sisyf.com sans rien prendre. L'identité de l'app est construite avec la bibliothèque DESIGN.md (références et méthode des jetons de design) et validée par un audit « redesign ».

Sisyf est une app web de préparation de courses de trail : plan sur ordinateur, suivi de course sur téléphone, hors ligne. Même principe que notre app. Un module d'entraînement y est annoncé en alpha.

**Ce qui nous plaît chez Sisyf** (observé le 17/11/2026, captures dans l'espace de travail `v2/refs-da/`) :
- Fond crème chaud (`#ede4d2`) avec un grain de papier.
- Titres en linéale très grasse et condensée, en capitales pour les titres de section.
- Texte courant en sans-serif arrondie, légère.
- Étiquettes, boutons et petites mentions en police à chasse fixe.
- Cartes « papier » : corps blanc, bandeau d'en-tête gris clair, bordure fine, ombre portée dure décalée sans flou, légère rotation, ruban adhésif aux coins.
- Annotations manuscrites bleues avec une flèche dessinée.
- Numéros d'étape dans un cercle à trait épais.
- Bouton principal vert à libellé en chasse fixe, avec un bord bas orange qui donne du relief.
- Captures du produit plutôt que photos. Ton direct, phrases courtes.

**Règles**
- Inspiration, pas copie : ni le nom, ni le logo, ni les textes, ni une combinaison qui ferait passer notre app pour la leur. Notre identité doit avoir sa propre signature, tirée de l'escalade (prises, magnésie, topos, cotations, couleurs de blocs…).
- La règle « un seul accent » est revue : un rôle par couleur (action, relief, annotation, état).
- Lisibilité en salle : fond clair possible ; le chrono garde un plein écran à fort contraste.
- Les couleurs de prises (jaune, vert, bleu, violet, rouge, noir…) servent à désigner les blocs : la palette de l'interface ne doit pas les concurrencer.

## 3. Décisions techniques

**Comptes et synchronisation** : connexion par lien e-mail, sans mot de passe, sur un service hébergé avec offre gratuite (Supabase ou équivalent, choix final par l'architecte). Données de chacun isolées. L'app reste utilisable hors ligne à la salle et se synchronise au retour du réseau. À la première connexion, les séances et le profil déjà enregistrés sur le téléphone sont repris.

**Assistant IA** : chaque utilisateur saisit sa propre clé API Claude. Elle reste sur son appareil, n'est jamais envoyée à notre serveur ni synchronisée. À vérifier par l'architecte : l'appel direct depuis le navigateur, la protection de la clé sur l'appareil, le modèle utilisé pour limiter le coût.

**Apple Watch (plus tard)** : le moteur de séance et de chrono doit rester indépendant de l'affichage, et les séances du jour doivent pouvoir être lues par une future app native (format de données documenté, accès par le même service).

**Hébergement** : l'app reste publiée sur GitHub Pages.

## 4. Les livres de référence

- *Escalade Training : les secrets de la planification* et *Escalade Training : 100 exercices spécifiques d'entraînement* (Kevin Arc et Hervé Di Domenico, Amphora).
- *Guide de l'alimentation du grimpeur* (Caroline Milenkovic-Messin).

Arthur possède les versions papier, pas de version numérique. Usage :
- leur contenu n'est pas recopié dans l'app (droits d'auteur) ;
- chacun peut ajouter un exercice personnel avec une référence « livre, page » ;
- l'assistant peut citer ces livres par leur titre, sans en inventer le contenu ;
- on s'appuie aussi sur tout ce qu'on sait déjà : synthèse théorique, méthodes reconnues (Hörst, Lattice, Bechtel, López, Anderson, MacLeod…), vérifications et audit de la bibliothèque.

## 5. Revue de l'existant

**Conservé tel quel** : chrono et ses quatre gabarits ; séance solo ; séance en groupe et saisie des blocs ; trois questions et débrief ; mises en garde ; mise à jour de l'app installée ; protection contre l'écran noir ; bibliothèque de 60 protocoles vérifiés et audités ; 31 tests ; mise en ligne automatique.

**À adapter** :
- Stockage : local seulement → local et synchronisé, avec reprise des données existantes.
- Modèle de données : compte, programme, plan, exercices personnels.
- Profil : modifiable aussi sur ordinateur ; ajout des données de prérequis (tractions strictes, test de 15 s sur 25 mm, majorité, grimpe en tête).
- Direction artistique : selon la section 2.
- Écrans « Aujourd'hui » et « Programme » du téléphone : branchés sur le plan réel ; les séances d'exemple disparaissent.

**Remplacé** : la génération automatique de séances types (ancienne tâche 4.2) laisse la place au constructeur de plan et à l'assistant.

**Abandonné** : rien.

## 6. Phases

| Phase | Contenu | Fin de phase quand… |
|---|---|---|
| 0. Cadrage | Ce plan, les décisions | Fait le 17/11 |
| 1. Spécifications | Trois concepteurs en parallèle : architecture, parcours et DA, règles de planification et de l'assistant. Chacun livre un cahier des charges et une liste de tâches autonomes | Les tâches de la phase 2 sont prêtes à distribuer |
| 2. Fondations | Comptes, synchronisation, modèle de données v2, reprise des données existantes, nouvelle DA | L'app actuelle tourne sur la nouvelle base, sur téléphone et ordinateur |
| 3. Plateforme ordinateur | Bibliothèque filtrable, exercices personnels, constructeur de cycle, avertissements de sécurité en direct | Un plan complet se construit à la main sur ordinateur |
| 4. Téléphone sur le plan | « Aujourd'hui » affiche la séance prévue (solo ou groupe), « Programme » montre le plan, les résultats remontent | Une semaine réelle se suit de bout en bout |
| 5. Assistant IA | Brouillon de cycle, de bloc ou d'ajustement, expliqué et sourcé, toujours modifiable | Un plan se crée avec l'assistant puis se retouche à la main |
| 6. Bilans | Progression des cinq qualités, tests repères, comparaisons de blocs (ordinateur) | Les tests de fin de bloc s'affichent en courbes |
| 7. Mobilité et nutrition | Routines guidées ; repères d'alimentation simples | Les deux modules sont utilisables |
| 8. Apple Watch (option) | App native : chrono et passage d'étape au poignet | Décision séparée |

Chaque phase se termine par un audit et un test réel par Arthur.

## 7. Organisation des agents

| Rôle | Modèle | Quand | Ce qu'il produit |
|---|---|---|---|
| Gérant | Opus 5.5 (conversation principale) | Tout le temps | Tient le plan, distribue les tâches, relit, enregistre sur GitHub, explique |
| Architecte | Opus, effort élevé | Phase 1, puis début de chaque phase | Architecture, découpage en tâches autonomes avec leurs dépendances |
| Concepteur produit et DA | Opus, effort élevé | Phase 1, puis phases 3 à 5 | Parcours, écrans, système de design, critères d'acceptation |
| Expert entraînement | Opus, effort élevé | Phases 1 et 5 | Règles du cycle, recommandations des méthodes reconnues, garde-fous et consignes de l'assistant |
| Développeurs | Sonnet | Phases 2 à 7, jusqu'à 3 en parallèle sur des fichiers distincts | Le code d'une tâche, ses tests |
| Rédacteur | Haiku, ou Sonnet si le texte demande de la nuance | Au besoin | Fiches, textes d'écran, mises en forme |
| Testeur | Haiku | Fin de chaque tâche | Parcours automatisés, vérification de non-régression |
| Auditeur | Fable | Fin de chaque phase | Audit sécurité de l'entraînement, des données et du code |

**Contraintes de fonctionnement**
- Un agent ne peut pas en lancer un autre : les concepteurs écrivent les tâches, le gérant les distribue aux développeurs.
- Chaque agent démarre sans mémoire de la conversation : une tâche doit contenir tout ce qu'il faut pour être faite seule.
- Les concepteurs en effort élevé coûtent cher : ils travaillent au début de chaque phase. L'exécution passe par Sonnet et Haiku.

## 8. Décisions

**18/11/2026** : l'app s'appelle « Get me to 9a ». Questions de fin de phase 1 tranchées : voir `docs/decisions-phase-1.md`.

**17/11/2026** : DA propre, inspirée de sisyf.com sans rien reprendre, construite avec la bibliothèque DESIGN.md et un audit « redesign » · comptes et synchronisation · clé API IA fournie par chaque utilisateur · cycle de 12 semaines en 3 blocs de 4 semaines · Apple Watch reportée mais prévue dans l'architecture · livres papier cités sans être recopiés, en complément des connaissances déjà réunies · concepteurs Opus (effort élevé), exécutants Sonnet et Haiku, audit Fable.
