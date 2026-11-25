# Parcours et écrans, version 2

Ce document décrit ce que chaque écran doit faire et montrer. Le style vient de `DESIGN.md` (système « Topo »).
Les démonstrations `demo-aujourdhui.html`, `demo-chrono.html` et `demo-constructeur.html` illustrent trois écrans.
Les règles de planification (quotas, 48 h, prérequis), les textes de l'assistant et les objectifs proposés viennent
de l'expert entraînement ; le modèle de données et la navigation technique viennent de l'architecte. Ce document dit
**où et comment** ces éléments s'affichent ; la section 6 liste les données dont chaque écran a besoin.

> **Consolidation du 17/11** (décisions de `docs/decisions-phase-1.md` appliquées ; chaque correction porte la mention « (consolidation 17/11) ») : l'app s'appelle **« Get me to 9a »** ; connexion par **code à 6 chiffres** reçu par e-mail, jamais par lien (B1), avec **liste d'invités** (B2) ; la période de 4 semaines s'appelle **« Phase »** (B9 : « Phase 1 », « Vue phase », « Objectifs de la phase ») ; **aucune séance ne se lance sur ordinateur** (B12) ; « Forme du jour » gardée et branchée en phase 4 (B10) ; petits ajustements sur téléphone : déplacer ou sauter une séance (B11) ; assistant sur ordinateur seulement, Haiku par défaut, coût estimé affiché avant chaque demande (B5 à B7). Les tâches et leur ordre sont dans `docs/backlog-v2.md`.

> **Consolidation du 18/11** (décisions F3 à F5, détail dans `docs/specs/niveaux-de-detail.md`) : chaque séance s'affiche à un **niveau de détail** (simple, grandes lignes, détaillé), choisi pour tout le cycle à sa création sur ordinateur (fenêtre **O-13**) et modifiable séance par séance sur ordinateur ; le téléphone affiche chaque séance à son niveau (**T-16** pour le simple et les grandes lignes) et garde tout le suivi ; un **générateur** propose un plan à partir de la banque d'exercices ; « HORS ASSISTANT » devient « À LA MAIN SEULEMENT ». Chaque ajout porte la mention « (consolidation 18/11) ».

> **Consolidation du 23/11** (décision F6) : aucun niveau n'est imposé à la création d'un cycle. Dans **O-13**, la question du niveau vient **après** les accents des phases, avec un niveau présélectionné selon ces accents et une ligne qui dit pourquoi (`docs/specs/niveaux-de-detail.md` § 1.7). Pour un brouillon de cycle de l'assistant (**O-10**), la même question s'affiche en tête de la réponse. Mention « (consolidation 23/11, F6) ».

> **Consolidation du 25/11, audit de fin de phase 3** (`docs/audits/audit-phase-3.md`, points M-3, M-8 et M-12) : une ligne « Ton profil ne dit pas encore : … » et les S-03 identiques regroupés dans les listes de la semaine (§ 4, O-02, O-03, O-05) ; l'étiquette « À VÉRIFIER » d'une étape devient « RÉGLAGE ESTIMÉ », « à vérifier » restant réservé aux fiches écartées (O-05, O-07, T-08) ; deux questions au lieu d'une pour les prises de l'exercice personnel (O-08) ; un avertissement d'une séance sans étapes nomme sa partie (O-05). Mention « (consolidation 25/11, audit phase 3) ». Tâches : vague 3.12 de `docs/backlog-v2.md`.

Conventions : identifiant d'écran `T-xx` (téléphone) et `O-xx` (ordinateur). Pour chaque écran : **But**, **Contenu**,
**Action principale** (une seule, en résine), **Autres actions**, **États**, **Adaptation**, **Accessibilité**.
Tous les textes sont au tutoiement, en phrases courtes, sans point d'exclamation ni emoji.

---

## 0. Principes

1. **Une seule app, deux usages.** Même adresse, mêmes données. Au-dessus de 1024 px de large, l'app prend la
   mise en page « bureau » faite pour **organiser** ; en dessous, la mise en page « téléphone » faite pour **exécuter**.
2. **Un écran, une action principale.** Elle est en résine et toujours au même endroit : en bas de l'écran sur
   téléphone, en haut à droite du contenu sur ordinateur.
3. **Avertir sans bloquer.** Les avertissements de sécurité apparaissent en direct, avec leur raison et leur source,
   et proposent une correction en un clic. Aucun n'empêche d'enregistrer.
4. **L'assistant propose, l'utilisateur décide.** Rien de ce que propose l'assistant ne change le plan tant que
   l'utilisateur ne l'a pas gardé, élément par élément.
5. **Hors ligne d'abord à la salle.** Tout ce qui sert en séance marche sans réseau ; l'envoi se fait au retour du réseau.
6. **Gros doigts, magnésie.** Cibles de 48 px minimum, 64 px pour les actions de séance, rien d'important dans les coins.

### Navigation

| Téléphone (barre du bas, 4 onglets) | Ordinateur (barre du haut) |
|---|---|
| Aujourd'hui | Tableau de bord |
| Programme (lecture du plan) | Plan (constructeur : 12 semaines, bloc, semaine) |
| — | Bibliothèque |
| Bilans | Bilans |
| Profil | Profil et réglages |
| — | Bouton « Assistant » (panneau latéral, toujours à droite) |

(consolidation 17/11, B12) Sur ordinateur, aucune séance ne se lance : le tableau de bord dit « Les séances se lancent
depuis ton téléphone ». Le débrief et l'aperçu d'un chrono restent consultables, dans une colonne centrée de 480 px. Sur téléphone, les écrans de planification ne sont pas
proposés : l'onglet Programme montre le plan et dit « Pour modifier ton plan, ouvre l'app sur un ordinateur ».

### États communs à tous les écrans

| État | Comportement |
|---|---|
| **Chargement** | Rien pendant 400 ms, puis des silhouettes grises à la forme du contenu (fiches, lignes). Jamais de rond qui tourne. |
| **Hors ligne** | Bandeau encre en haut : « Hors ligne. Tout est gardé sur cet appareil, l'envoi se fera au retour du réseau. » Les actions qui exigent le réseau (connexion, assistant) sont désactivées avec la raison écrite dessous. |
| **Synchronisation** | Mention en chasse fixe dans l'en-tête : « À JOUR », « ENVOI EN COURS… », « 3 CHANGEMENTS EN ATTENTE ». Un toucher ouvre le détail (dernière synchronisation, heure). |
| **Erreur de chargement** | Ce qui s'est passé, si des données sont perdues (« Tes séances ne sont pas effacées »), quoi faire, un bouton « Réessayer ». |
| **Mise à jour disponible** | Bandeau résine en haut des onglets (comme aujourd'hui), jamais pendant une séance. |
| **Fenêtre de confirmation** | Remplace `window.confirm` et `window.alert` (voir `DESIGN.md`). |

---

## 1. Parcours clés

### P1. Premier lancement sur un téléphone neuf
1. **T-01 Bienvenue** : deux phrases, « Recevoir mon code de connexion ». (consolidation 17/11, B1)
2. **T-02 E-mail** : champ e-mail, « Recevoir mon code de connexion ».
3. **T-03 Code envoyé** : « Saisis le code reçu. » L'utilisateur lit le code à 6 chiffres dans sa messagerie et le
   saisit dans l'app, qui se connecte.
4. Si le compte est vide : **T-05 Profil** (formulaire actuel, plus les prérequis), puis **T-15 Mises en garde** une fois.
5. **T-06 Aujourd'hui**. S'il n'y a pas encore de plan : état vide qui renvoie vers l'ordinateur et propose une séance libre.

### P2. Reprise des données d'un téléphone déjà utilisé (les testeurs actuels)
1. À l'ouverture de la nouvelle version, l'app fonctionne comme avant ; un bandeau discret dans Aujourd'hui propose
   « Crée ton compte pour retrouver ton plan sur ordinateur ».
2. **T-02 → T-03** comme en P1.
3. Au retour connecté : **T-04 Reprise** affiche ce qui a été trouvé sur le téléphone (« 14 séances, ton profil »)
   et ce que le compte contient déjà. Action principale : « Ajouter à mon compte ».
4. Confirmation : « 14 séances ajoutées. Elles restent aussi sur ce téléphone. » → Aujourd'hui.
Rien n'est jamais effacé du téléphone pendant la reprise.

### P3. Construire un cycle à la main sur ordinateur
1. **O-01 Connexion** (même code par e-mail ; consolidation 17/11), puis **O-02 Tableau de bord** vide : « Crée ton premier cycle ».
1 bis. (consolidation 18/11) **O-13 Nouveau cycle** : date, séances par semaine, accents proposés, puis **niveau de détail** proposé selon les accents (consolidation 23/11, F6) ; « Proposer un plan » (le générateur remplit les 12 semaines en brouillon, à retoucher ensuite) ou « Commencer vide » (étapes 2 à 4).
2. **O-03 Vue 12 semaines** : date de début, nombre de séances par semaine (2 à 5), accent de chaque bloc,
   jusqu'à 2 objectifs par bloc, réglage de la semaine allégée.
3. **O-04 Vue bloc** : poser des séances sur les jours de la semaine 1 ; « Recopier sur les semaines 2 et 3 ».
4. **O-05 Vue semaine** : glisser des protocoles depuis la bibliothèque dans chaque séance, régler la version solo et
   la version groupe. Les avertissements apparaissent en direct.
5. Le plan est enregistré au fil de l'eau ; il arrive sur le téléphone à la synchronisation suivante.

### P4. Construire ou ajuster avec l'assistant
1. Bouton « Assistant » : le panneau **O-10** s'ouvre à droite, le plan reste visible.
2. L'utilisateur écrit sa demande ou choisit une demande toute faite (« Brouillon de cycle », « Brouillon de cette phase » (consolidation 17/11),
   « Ajuster cette semaine »).
3. L'assistant répond par un **brouillon** : une liste d'éléments (ajouter, retirer, déplacer, remplacer, régler),
   chacun avec sa raison et ses sources. Survoler un élément surligne la case concernée dans le plan.
4. Pour chaque élément : **Garder** (appliqué tout de suite au plan, annulable), **Modifier** (l'élément s'ouvre dans
   le plan pour être changé à la main, puis il est gardé), **Rejeter** (barré, annulable).
5. Les règles de sécurité s'appliquent au résultat comme à une modification manuelle : un avertissement s'affiche
   dans l'élément concerné et dans le plan.

### P5. Une séance réelle à la salle (téléphone, souvent hors ligne)
1. **T-06 Aujourd'hui** affiche la séance prévue, ses étapes, et les deux boutons « Je grimpe seul » et
   « Je grimpe en groupe » (le mode habituel est l'action principale).
2. **T-08 Séance solo** ou **T-09 Séance en groupe** ; **T-10 Chrono** au besoin ; « Stop, ça fait mal » mène
   aux mises en garde.
3. **T-11 Trois questions** puis **T-12 Débrief**. La séance réalisée est rattachée à la séance prévue ;
   elle part au compte au retour du réseau.

### P6. Faire le point en fin de phase (ordinateur)
1. Semaine 4 : le tableau de bord rappelle les tests repères de la phase. (consolidation 17/11)
2. **O-11 Bilans** : courbes par qualité, comparaison avec le bloc précédent, séances faites et prévues.
3. Retour au plan pour ajuster le bloc suivant, à la main ou avec l'assistant.

---

## 2. Écrans du téléphone

### T-01 Bienvenue (nouveau, remplace l'actuel `Bienvenue`)
- **But** : dire en deux phrases ce que fait l'app et lancer la connexion.
- **Contenu** : surtitre « Get me to 9a » (consolidation 17/11 : nom de l'app), titre `affiche` « Ton carnet d'entraînement », deux phrases (« Tu prépares ton plan sur ordinateur,
  tu le suis ici, à la salle, même sans réseau. Tes séances restent à toi. »), une annotation au trait de topo.
- **Action principale** : « Recevoir mon code de connexion » (consolidation 17/11).
- **Autres actions** : bouton discret « Continuer sans compte » (décision B3) ; si choisi, l'app reste locale
  comme aujourd'hui et Profil rappelle l'intérêt du compte.
- **États** : hors ligne → bouton principal désactivé, phrase « La connexion demande du réseau. Tu peux commencer sans
  compte et te connecter plus tard. »
- **Adaptation** : sur ordinateur, même contenu dans une fiche de 480 px centrée.

### T-02 Saisie de l'e-mail
- **But** : obtenir l'adresse où envoyer le code (consolidation 17/11 : code et non lien, B1).
- **Contenu** : titre « Ton e-mail », champ `type="email"`, `autocomplete="email"`, `spellcheck=false`, aide « On t'envoie
  un code à 6 chiffres. Pas de mot de passe. »
- **Action principale** : « Recevoir mon code de connexion ». Reste active ; pendant l'envoi : « Envoi… ».
- **États** : e-mail mal écrit → message sous le champ « Vérifie l'adresse : il manque le @. » et focus sur le champ ;
  échec réseau → « Le code n'est pas parti. Vérifie le réseau, puis réessaie. » ; adresse absente de la liste d'invités (B2)
  → « Cette adresse n'est pas sur la liste d'invités. Demande à Arthur de l'ajouter. »

### T-03 Lien envoyé
(consolidation 17/11 : devient « Code envoyé », décision B1 ; réalisé dans l'écran Compte, tâche F2-07)
- **But** : faire saisir le code reçu.
- **Contenu** : « Regarde ta boîte mail », l'adresse en chasse fixe, champ code (`inputMode="numeric"`,
  `autocomplete="one-time-code"`), « Saisis le code reçu. Il est valable 1 h. », aide « Rien reçu ? Regarde dans les indésirables. »
- **Action principale** : « Me connecter » ; bouton second « Renvoyer le code » (actif après 60 s, avec le décompte
  affiché) ; discret « Changer d'adresse ».
- **États** : code faux ou expiré → message sous le champ et « Renvoyer le code ».

### T-04 Reprise des données (nouveau)
- **But** : rattacher au compte ce qui existe déjà sur le téléphone, sans rien perdre.
- **Contenu** : titre « On a trouvé tes séances » ; carte « Sur ce téléphone » (nombre de séances, dates de la première
  et de la dernière, profil oui ou non) ; carte « Dans ton compte » (même chose, ou « vide »).
  Si les deux ont un profil : choix « Garder le profil de ce téléphone » ou « Garder celui du compte » (choix encre,
  par défaut le plus récent, date affichée).
- **Action principale** : « Ajouter à mon compte ».
- **Autres actions** : discret « Plus tard » (les données restent locales, la question revient dans Profil).
- **États** (consolidation 17/11 : la jauge « n sur N » et la carte « Dans ton compte » sont abandonnées, voir architecture § 3.7 ; réalisé par F2-09) : envoi en cours → « Envoi en cours… » au lieu de la jauge « 8 séances sur 14 » ; erreur → « La reprise s'est arrêtée à 8 séances sur 14.
  Rien n'est perdu : réessaie quand le réseau revient. » ; hors ligne → bouton désactivé avec la raison.
- **Accessibilité** : la jauge a un `aria-label` qui dit le nombre ; le message final est annoncé (`role="status"`).

### T-05 Profil au premier lancement
- **But** : remplir le profil qui sert aux prérequis et aux règles.
- **Contenu** : le formulaire actuel découpé en **trois pages courtes** avec un repère « 1 sur 3 » :
  (1) toi : prénom, discipline, niveaux, années de pratique, salle ; (2) ton expérience : poutre, tractions strictes,
  test de 15 s sur 25 mm (« Je ne sais pas » possible), majorité, grimpe en tête ; (3) ton état : douleur en ce moment,
  séances par semaine, en groupe ou non, poids (facultatif).
- **Action principale** : « Continuer », puis « Enregistrer mon profil » à la dernière page.
- **Règle prudente** : « Je ne sais pas » compte comme « non » pour les prérequis, et l'aide le dit.
- **États** : champ obligatoire vide → message sous le champ, focus dessus ; hors ligne → enregistrement local, envoi plus tard.

### T-06 Aujourd'hui (adapté, branché sur le plan)
- **But** : savoir quoi faire aujourd'hui et le commencer en un geste.
- **Contenu** (voir `demo-aujourdhui.png`) :
  - en-tête en chasse fixe : date, état de synchronisation ;
  - mention « Phase 1 · doigts · semaine 2 sur 4 » (consolidation 17/11, B9) (et « SEMAINE ALLÉGÉE » si c'est le cas) ;
  - titre `affiche` : nom de la séance ;
  - **fiche de la séance** : étiquette de dureté (facile, moyenne, dure), durée, étapes numérotées avec leur durée ;
    (consolidation 18/11) selon le niveau affiché : étapes (détaillé), parties avec leur durée (grandes lignes),
    recommandation en grand (simple) ; sous-titre du bouton solo : « Séance guidée, chrono intégré » (détaillé),
    « Grandes lignes, chrono libre », « Recommandation, chrono libre » (simple) ;
  - deux boutons : « Je grimpe seul » (sous-titre « Séance guidée, chrono intégré ») et « Je grimpe en groupe »
    (sous-titre « 2 objectifs, 1 h 30 ») ; le **mode habituel** du profil est le bouton principal, l'autre est second ;
  - ligne « Forme du jour » (décision B10 : gardée, branchée en phase 4 sur les contrôles du jour, tâche C-03 ; retirée en phase 2 pour ne pas laisser de bouton sans action) ; la ligne « Assiette du jour » est retirée jusqu'à la phase 7 ;
  - « Cette semaine » : 7 cases (fait, aujourd'hui, prévu, repos) et la phrase « Prochaine : jeudi, technique (facile) ».
- **Signaux** : si une douleur est déclarée dans le profil, un signal d'arrêt (rubalise brique) en haut :
  « Douleur au coude déclarée. Les exercices à risque sont retirés de ta séance. » avec « Voir les mises en garde ».
  Si un avertissement de la semaine concerne aujourd'hui (deux séances dures rapprochées), rubalise ambre au-dessus de la fiche.
- **États** :
  - *pas de plan* : titre « Pas encore de plan », phrase « Prépare ton cycle sur ordinateur. En attendant, fais une
    séance libre. », action principale « Faire une séance libre » (séance en groupe sans objectifs, ou liste
    d'échauffement + essais), annotation vers l'adresse de l'app à ouvrir sur ordinateur ;
  - *jour de repos* : titre « Repos », phrase « Prochaine séance : jeudi, technique. », action principale
    « Voir la semaine » ; bouton discret « Faire une séance quand même » ;
  - *séance déjà faite* : titre « Séance faite », chiffres du débrief, action principale « Revoir le débrief » ;
  - *séance manquée la veille* : ligne d'information « Séance de lundi pas faite » et le choix proposé par les règles
    (par exemple « La faire aujourd'hui »), sans culpabiliser ;
  - *chargement* : silhouettes de la fiche et des boutons ;
  - *hors ligne* : tout fonctionne, bandeau hors ligne.
- **Adaptation** : sur tablette, colonne de 560 px ; sur ordinateur, cet écran est remplacé par le tableau de bord.

### T-07 Programme (adapté)
- **But** : voir le plan en cours sur le téléphone.
- **Contenu** : en haut, les 3 phases en bande (consolidation 17/11) (comme la démo du constructeur, version compacte : S1 à S12, semaine
  en cours en encre, semaines allégées hachurées, semaines passées en résine douce) ; dessous, la semaine choisie en
  lignes de jours (comme la vue semaine de l'ordinateur, sans poignées) ; toucher une séance ouvre son aperçu (étapes,
  version solo et version groupe) avec « Faire cette séance maintenant ». (consolidation 18/11) L'aperçu suit le
  niveau affiché de la séance ; le téléphone ne change pas le niveau.
- **Action principale** : aucune action résine par défaut ; dans l'aperçu d'une séance : « Faire cette séance maintenant ».
- **Autres actions** : flèches « Semaine précédente », « Semaine suivante » (48 px) ; dans l'aperçu d'une séance à venir
  (consolidation 17/11, B11) : « Déplacer » (un autre jour de la même semaine) et « Sauter cette séance » (avec
  confirmation) ; phrase en bas « Pour modifier le reste de ton plan, ouvre l'app sur un ordinateur. »
- **États** : pas de plan → même état vide que T-06 ; plan pas encore arrivé (synchro) → « Ton plan arrive… »,
  puis contenu ; hors ligne → dernière version connue, avec sa date.

### T-08 Séance solo (adaptée)
- **But** : dérouler les étapes, une à la fois.
- **Changements** : séance prise dans le plan (plus d'exemple) ; style Topo (fiche ouverte pour l'étape en cours avec
  bord résine, repères carrés, jauge d'étapes encre/résine/hachures) ; lien « Voir la fiche » sur chaque étape
  (ouvre la fiche protocole en lecture) ; référence « livre, page » pour un exercice personnel ; « Quitter » ouvre la
  fenêtre de confirmation (« Quitter la séance ? Elle ne sera pas enregistrée. » / « Quitter » / « Rester ») ;
  « Passer l'étape » et « Terminer la séance » en boutons seconds ; « Terminer la séance » devient principal quand tout
  est traité.
- **États** : étape sans réglage valable (protocole « à vérifier ») → avertissement ambre dans l'étape ; séance vide → impossible (on ne propose pas une séance vide).
  (consolidation 25/11, audit phase 3) « à vérifier » désigne ici une fiche écartée (`exclureDeLaGeneration`, S-02), seule à mériter l'ambre ; un réglage estimé (`aVerifier`, voir O-07) n'affiche rien pendant la séance.

### T-09 Séance en groupe (adaptée)
- **But** : noter les blocs et suivre les objectifs du jour.
- **Changements** : objectifs pris dans la version groupe de la séance prévue ; **pastilles de prise** (voir démo) ;
  boutons « Pas encore » (second) et « Flashé » / « Enchaîné » (principal) côte à côte, 64 px ; « Annuler le dernier
  bloc » garde la ligne actuelle ; « Terminer la séance » discret en bas, puis confirmation si aucun bloc n'est noté.
- **États** : salle sans couleurs définies → choix de couleurs générique (les 6 habituelles) et lien vers Profil.

### T-10 Chrono (adapté, voir `demo-chrono.png`)
- **But** : suivre l'effort sans lire, à deux mètres.
- **Changements** : trois fonds (préparation encre, effort craie, repos résine) ; `theme-color` de la barre du
  téléphone à la couleur de la phase ; chiffres posés dans des cases de largeur fixe ; jauge des séries en haut ;
  « Stop, ça fait mal » en bouton d'arrêt brique, toujours au même endroit ; pause : rubalise ambre en haut, mot
  « En pause », « Reprendre » principal, « Quitter l'exercice » discret.
- **Écran « prêt »** (avant démarrage) : fond magnésie, titre de l'exercice, détail, réglages en chasse fixe
  (« 9 échelles · 3-6-9 s · créneau 45 s »), action principale « Démarrer » (72 px).
- **Écran « terminé »** : fond magnésie, « Terminé », « Toutes les séries sont faites. », « Continuer ».
- **Accessibilité** : le compte à rebours n'est pas annoncé chaque seconde (`aria-live="off"`) ; les changements de
  phase sont annoncés une fois (« Effort, 7 secondes ») dans une zone `aria-live="assertive"` invisible.

### T-11 Trois questions (adapté)
- **Changements** : sélection en encre pleine ; bouton « Enregistrer et voir le débrief » désactivé tant que les trois
  réponses manquent, avec la phrase dessous « Réponds aux trois questions pour continuer. » ; « Oui » à la douleur ouvre
  une précision facultative (zone : doigts, coude, épaule…) si l'expert entraînement le demande.
- **États** : échec d'enregistrement → message dans l'écran (plus de `window.alert`) : « La séance n'a pas pu être
  enregistrée. Tes réponses sont gardées : réessaie. » avec « Réessayer ».

### T-12 Débrief (adapté)
- **Changements** : chiffres clés en `chiffre-cle` (le principal en résine) ; tableau des blocs avec pastilles de prise ;
  ligne « Séance prévue : Doigts et bloc limite · faite » qui relie à la séance du plan ; mention de synchronisation
  « Enregistrée sur ce téléphone · envoyée » ou « … · envoi au retour du réseau » ; « La suite » en lignes ;
  si douleur signalée : signal d'arrêt brique en haut, avant les chiffres.
- **Action principale** : « Terminer ».

### T-13 Bilans (téléphone, adapté)
- **But** : retrouver ses séances.
- **Contenu** : liste actuelle (séance, date, mode, charge) groupée par semaine avec la charge de la semaine en tête de
  groupe ; filtre « Toutes / Solo / Groupe » en choix encre. Les courbes détaillées sont sur ordinateur (lien
  « Voir les courbes sur ordinateur »).
- **États** : vide → « Aucune séance enregistrée pour l'instant. Termine une séance pour la retrouver ici. » avec
  annotation vers l'onglet Aujourd'hui ; erreur de lecture → message actuel, avec « Réessayer ».

### T-14 Profil (téléphone, adapté)
- **Contenu** : sections repliables : « Toi » (formulaire), « Prérequis » (tractions strictes, test 15 s sur 25 mm,
  majorité, grimpe en tête, avec la date de la dernière mise à jour), « Ta salle », « Compte » (e-mail, état de
  synchronisation, « Se déconnecter »), « À savoir » (mises en garde), « Données » (sauvegarde, reprise, version).
- **Action principale** : « Enregistrer le profil » (dans la section ouverte).
- **États** : non connecté → section Compte : « Tu n'as pas de compte. Ton plan d'ordinateur ne peut pas arriver ici. »
  avec « Recevoir mon code de connexion » (consolidation 17/11) ; modification non enregistrée en quittant l'onglet → fenêtre de confirmation.

### T-15 Mises en garde (style seulement)
- Les deux listes passent en signal d'arrêt (rubalise brique, « Arrête la séance et consulte ») et en avertissement
  (rubalise ambre, « Allège pendant 1 à 2 semaines »). Contenu inchangé.

### T-16 Séance en bref (consolidation 18/11, nouveau : niveaux simple et grandes lignes)
- **But** : faire une séance décrite en une ligne ou en quelques parties, avec un chrono libre, sans perdre le suivi.
- **Contenu** : nom ; mention « Doigts · dure · 1 h 30 » ; **chrono libre** (temps écoulé en chiffres de 72 px,
  « Démarrer » / « Pause ») ; *simple* : la recommandation en `affiche` ; *grandes lignes* : les parties en lignes
  (titre, durée, exercice principal, consigne), chacune avec « Fait » et « Passé » (64 px), « Voir la fiche » pour
  l'exercice principal ; « Lancer un repos » (minuteur existant, 3 min par défaut, choix de 1 à 5 min).
- **Rappels de sécurité** (séance dure) : fiche en encre « À respecter » : « Échauffe-toi 20 à 30 min, de plus en plus
  dur, avant tout effort maximal. » ; « Entre deux efforts maximaux : 3 à 5 min de repos. » ; « Arrête l'effort maximal
  quand deux essais de suite sont nettement moins bons que le meilleur. » ; avant une séance de bloc limite, le rappel
  de sécurité du bloc (décision F2, point 11), comme en détaillé.
- **Arrêt** : « Stop, ça fait mal » toujours visible (bouton d'arrêt brique), vers les mises en garde (T-15). Le
  signal d'arrêt d'une douleur déclarée reste affiché en haut.
- **Action principale** : « Terminer la séance » → T-11 Trois questions → T-12 Débrief.
- **Autres actions** : « Quitter » (fenêtre de confirmation, comme T-08).
- **États** : rien à résumer → « Séance {qualité}, {dureté} : grimpe à ton idée. » ; hors ligne → tout marche.
- **Accessibilité** : le temps écoulé n'est pas annoncé chaque seconde ; chaque partie est une ligne avec deux boutons
  libellés (« Échauffement fait »).

---

## 3. Écrans de l'ordinateur

Mise en page commune : barre du haut de 64 px (marque, navigation, état de synchronisation, bouton « Assistant »),
contenu dans un conteneur de 1280 px max, marges 32 px. Quand le panneau d'assistant est ouvert, il occupe 404 px à
droite et le contenu se resserre ; en dessous de 1280 px, le panneau passe **par-dessus** le contenu (avec un voile)
au lieu de le pousser.

### O-01 Connexion sur ordinateur
- Même parcours que T-01 à T-03, dans une fiche centrée de 480 px : le code reçu se saisit sur l'ordinateur
  (consolidation 17/11). Après connexion : tableau de bord.

### O-02 Tableau de bord
- **But** : voir où on en est et aller au bon endroit.
- **Contenu** (grille de 12 colonnes) :
  - à gauche (8 colonnes) : titre `affiche` « Semaine 6 sur 12 » ; la bande des 12 semaines ; « Cette semaine » en
    lignes de jours avec l'état (faite, prévue, manquée) ; « Avertissements ouverts » (liste de rubalises, cliquables
    vers l'endroit du plan) ; (consolidation 25/11, audit phase 3) sous le compte, la ligne « Ton profil ne dit pas
    encore : … » si un S-03 de la semaine vient d'un profil non rempli, et les S-03 identiques en une seule rubalise
    (§ 4) ;
  - à droite (4 colonnes) : fiche « Prochaine séance » (en lecture, avec « Les séances se lancent depuis ton téléphone » ; consolidation 17/11, B12) ; « Derniers tests »
    (chiffres clés en chasse fixe et petite courbe) ; « Objectifs de la phase » (1 ou 2, avec l'avancée).
- **Action principale** : « Ouvrir la semaine en cours » (vers O-05).
- **États** :
  - *aucun cycle* : titre « Crée ton premier cycle », trois choix en fiches : « Partir de zéro » (principal),
    « Demander un brouillon à l'assistant », « Reprendre un cycle précédent » (si un existe) ;
  - *cycle terminé* : « Ton cycle est fini. » avec « Voir le bilan » (principal) et « Préparer le cycle suivant » ;
  - *chargement*, *hors ligne*, *erreur* : états communs.

### O-03 Plan, vue 12 semaines
- **But** : poser la structure du cycle.
- **Contenu** :
  - en-tête : nom du cycle (modifiable en place), dates (date de début choisie, fin calculée), séances par semaine
    (choix 2 à 5) ;
  - trois **colonnes de phases** (consolidation 17/11, B9). Chaque phase : titre « Phase 1 », **accent** (les cinq
    qualités ou la technique, B13), **objectifs** (deux emplacements, voir ci-dessous), 4 lignes de semaines
    avec le nombre de séances, la dureté (petites étiquettes) et une barre de charge ; la 4e semaine porte
    « ALLÉGÉE » et un réglage d'allègement (choix encre parmi les valeurs données par l'expert, par défaut la plus prudente) ;
  - chaque semaine est cliquable (ouvre O-05) ; chaque phase a « Ouvrir la phase » (O-04) ;
  - (consolidation 17/11) étiquette « BROUILLON » tant que le cycle n'est pas validé, et bouton second « Valider le cycle »
    (confirmation : « Ton cycle apparaîtra sur ton téléphone. Tu pourras encore le modifier. »).
  - (consolidation 18/11) « Niveau : Grandes lignes » (choix encre Simple / Grandes lignes / Détaillé) ; changer ouvre
    une confirmation : « Les séances suivront ce niveau. Rien n'est effacé. {n} séances gardent leur propre niveau. »,
    action « Changer le niveau », lien « Les passer aussi en {niveau} ».
- **Objectifs de la phase** : bouton « Choisir un objectif » ouvre une liste courte (proposée par les règles selon
  l'accent et le profil) avec une option « Écrire le mien » ; au plus 2 ; au-delà, le bouton est désactivé avec
  « Deux objectifs au plus par phase : retire-en un pour en choisir un autre. »
- **Action principale** : « Ouvrir la semaine en cours » (ou « Ouvrir la semaine 1 » avant le début).
- **Avertissements** : un repère ambre sur la case d'une semaine qui en contient ; un résumé en haut
  (« 2 avertissements dans la phase 1 »). (consolidation 25/11, audit phase 3) Sous ce résumé, la ligne « Ton profil ne
  dit pas encore : … » si un S-03 du plan vient d'un profil non rempli (§ 4). Les comptes et les repères ne changent pas.
- **États** : création → les phases sont vides avec, dans chacune, « Choisis l'accent de la phase » et une annotation
  au trait de topo ; erreur d'enregistrement → bandeau « Changement pas encore enregistré, nouvel essai dans
  quelques secondes » (les changements restent à l'écran).

### O-04 Plan, vue bloc
(consolidation 17/11 : « Vue phase » à l'écran, B9)
- **But** : répartir les séances sur les 4 semaines d'une phase.
- **Contenu** : tableau 4 lignes (semaines) × 7 colonnes (jours) ; chaque case contient 0 ou 1 séance sous forme
  d'étiquette compacte (dureté, nom court, durée, icône solo ou groupe selon la version par défaut) ; ligne de charge
  à droite de chaque semaine ; avertissements en rubalise au-dessus du tableau.
- **Actions** : glisser une séance d'une case à l'autre (même semaine ou autre semaine) ; menu de case « Ajouter une
  séance », « Copier », « Coller », « Vider » ; bouton second « Recopier la semaine 1 sur les semaines 2 et 3 »
  (la progression des protocoles est appliquée par les règles, et le dit).
- **Action principale** : « Ajouter une séance » (dans le premier jour libre ; ou cliquer sur une case vide).
- **Alternative clavier** : chaque étiquette a un bouton « Déplacer » qui ouvre un choix de semaine et de jour.
- **États** : bloc vide → chaque case vide affiche « + » au survol, annotation « Commence par la semaine 1 ».

### O-05 Plan, vue semaine (le constructeur, voir `demo-constructeur.png`)
- **But** : composer les séances de la semaine, en solo et en groupe.
- **Disposition** : colonne gauche « Bibliothèque » (312 px), colonne centrale « Semaine », panneau d'assistant à
  droite s'il est ouvert.
- **Colonne Bibliothèque** : recherche, filtres rapides (qualité, matériel, durée), interrupteur « Seulement ceux qui
  me conviennent » (prérequis remplis), compteur « 12 protocoles · 9 me conviennent », fiches glissables. Une fiche
  dont les prérequis ne sont pas remplis est en pointillé avec l'étiquette « PRÉREQUIS » ; elle reste glissable
  (avertir sans bloquer).
- **Colonne Semaine** :
  - en-tête : mention du cycle, titre de la phase, choix de vue « 12 semaines / Phase / Semaine », bande des 12 semaines ;
  - ligne « Semaine 2 · 10 au 16 nov. », résumé « 3 séances · 2 dures », **action principale « Ajouter une séance »** ;
  - avertissements de la semaine (rubalise ambre) avec « Pourquoi ? » et une correction en un clic ; (consolidation
    25/11, audit phase 3) en tête de cette liste, la ligne « Ton profil ne dit pas encore : … » si un S-03 de la semaine
    vient d'un profil non rempli, et les S-03 identiques regroupés en une ligne (§ 4) ;
  - 7 lignes de jours. Jour de repos : bande creuse « Repos ». Jour avec séance : **fiche de séance**.
- **Fiche de séance** :
  - en-tête : étiquette de dureté (calculée), nom (modifiable en place), durée (calculée), **bascule « SOLO | GROUPE »**
    qui choisit la version affichée et éditée ;
  - (consolidation 18/11) **niveau** : « Comme le cycle (grandes lignes) / Simple / Grandes lignes / Détaillé ». La version
    solo s'édite au niveau choisi : *simple* = recommandation d'une ligne (120 caractères, compteur), durée, exercice
    principal facultatif (« Choisir dans la bibliothèque ») ; *grandes lignes* = 1 à 5 parties (titre, durée, exercice
    principal facultatif, consigne courte ; « Ajouter une partie », « Monter », « Descendre », « Retirer ») ;
    *détaillé* = les étapes ci-dessous. Une séance qui a des étapes, affichée en simple ou en grandes lignes, montre le
    résumé calculé avec « Modifier le texte » et « Voir les étapes ». Une séance sans étapes passée en détaillé :
    « Cette séance n'a pas encore d'étapes. » avec « Remplir depuis la séance type » ou « Ajouter une étape ».
    Un avertissement qui vise une étape cachée s'affiche en tête de la fiche, avec le nom de l'étape ; (consolidation
    25/11, audit phase 3) pour une séance sans étapes (étapes résumées, une par partie qui a un exercice principal), la
    ligne dit « Partie « {titre de la partie} » » au lieu de « Étape « … » » ;
  - **version solo** : étapes numérotées (protocoles), chacune avec poignée, nom, étiquettes (PRÉREQUIS, RÉGLAGE ESTIMÉ,
    PERSO), durée, menu (« Voir la fiche », « Remplacer », « Monter », « Descendre », « Retirer ») ; zone de dépôt
    en bas « Dépose un protocole ici » ; (consolidation 25/11, audit phase 3) « RÉGLAGE ESTIMÉ » remplace « À VÉRIFIER » :
    l'étiquette lit le champ `aVerifier` de la fiche (un réglage que la source ne confirme pas), en étiquette contour,
    avec le texte de la fiche en infobulle ; elle ne dit pas que la fiche est écartée (vocabulaire : O-07) ;
  - **version groupe** : échauffement commun (étapes), puis objectifs de groupe (libellé, cible, couleur conseillée
    optionnelle en pastille de prise, essais maximum), « Ajouter un objectif » ; un objectif peut être « tiré d'un
    protocole » (bouton) pour reprendre ses consignes ;
  - pied : « La version groupe n'est pas encore remplie » si c'est le cas (information, pas un blocage), et
    « Copier depuis la version solo ».
- **Glisser-déposer** : la fiche saisie monte (ombre flottante, contour résine) ; les zones de dépôt valables prennent
  un fond résine doux et un bord pointillé ; le texte de la zone dit ce qui va se passer (« Dépose ici pour ajouter
  Échelles 3-6-9 à samedi »). Déposer sur un jour vide crée une séance. Échap annule.
- **Alternative clavier et tactile** : sur chaque fiche de la bibliothèque, bouton « Ajouter à… » (menu : jour, puis
  séance existante ou nouvelle) ; dans une séance, « Monter » et « Descendre ».
- **Avertissements en direct** : recalculés à chaque changement ; affichés à trois endroits : en tête de semaine
  (liste), sur la fiche de séance concernée (icône triangle ambre et nombre dans l'en-tête, la ligne fautive
  surlignée), sur l'étape (étiquette « PRÉREQUIS » ou contre-indication). Chaque avertissement : titre en gras,
  une phrase, « Pourquoi ? » (règle et source), une correction proposée si elle existe, et « Je garde ce choix »
  qui le replie en une ligne (il reste dans la liste et se rouvre). Jamais de blocage d'enregistrement.
- **États** : semaine vide → dans la colonne centrale « Semaine vide. Glisse un protocole sur un jour, ou demande un
  brouillon à l'assistant. » ; bibliothèque sans résultat → « Aucun protocole ne correspond. Retire un filtre. »
  avec la liste des filtres actifs à retirer d'un clic ; hors ligne → tout reste modifiable, synchronisation plus tard ;
  modification venue d'un autre appareil pendant l'édition → bandeau « Ce plan a changé sur ton téléphone. » avec
  « Voir la nouvelle version » (le choix de fusion appartient à l'architecte).

### O-06 Bibliothèque
- **But** : parcourir et filtrer les 60 protocoles et ses exercices personnels.
- **Disposition** : colonne de filtres à gauche (280 px), grille de fiches (3 colonnes à 1280 px, 2 à 1024 px).
- **Filtres** (tous combinables, nombre de résultats affiché en direct, état gardé dans l'adresse de la page) :
  - recherche (nom, consigne, auteur) ;
  - **qualité** : doigts, traction et gainage, puissance, résistance, endurance, technique, mental, antagonistes,
    mobilité, échauffement (choix multiple) ;
  - **matériel ou terrain** : poutre, pan, bloc, voie, barre, sol ;
  - **durée** : 10 min max, 20 min max, 40 min max, plus ;
  - **prérequis** : « Tous » / « Seulement ceux qui me conviennent » / « Ceux qui ne me conviennent pas encore » ;
  - **preuve** : étude, avis de coach, synthèse, perso ;
  - **avec d'autres** : « Se prête au groupe » ; **partenaire nécessaire** ;
  - **origine** : bibliothèque, mes exercices.
- **Fiche de la grille** : étiquette « QUALITÉ · DURÉE », nom, résumé (1 ligne), preuve (étiquette contour), terrain,
  état des prérequis (rien si remplis ; sinon étiquette pointillée « PRÉREQUIS » et le manque en clair, par exemple
  « 10 tractions strictes demandées ») ; si une douleur déclarée est une contre-indication : mini signal d'arrêt
  « Déconseillé : douleur au coude déclarée ».
- **Action principale** : « Créer un exercice » (vers O-08).
- **Autres actions** : clic sur une fiche → O-07 (panneau latéral) ; tri (qualité, durée, nom).
- **États** : chargement → 6 silhouettes de fiches ; aucun résultat → message et filtres à retirer ; « mes exercices »
  vide → « Tu n'as pas encore d'exercice personnel. Ajoute ceux de tes livres avec leur page. » + annotation.

### O-07 Fiche protocole (panneau latéral de 560 px, depuis la bibliothèque ou le plan)
- **But** : tout savoir d'un protocole avant de le poser dans le plan.
- **Contenu**, dans cet ordre : étiquettes (qualité, durée, preuve, PERSO si personnel) ; nom (`titre-1`) ; consigne ;
  **réglages** en chasse fixe, traduits en phrase (« 9 échelles de 3, 6 puis 9 s · créneau de 45 s · 6 s entre deux
  suspensions ») ; matériel et terrain ; seul ou en groupe ; partenaire ; **prérequis**, un par ligne avec son état
  pour toi (« Années de pratique : 1 an demandé · toi : 4 ans » ; « Test 15 s sur 25 mm : pas renseigné, compte comme
  non rempli ») ; **contre-indications** (zones) et, si une douleur déclarée y correspond, signal d'arrêt ;
  **limite par semaine** ; **progression** ; **« Réglage estimé »** s'il existe ; **source** (auteur, lien) ; pour un
  exercice personnel : **référence « livre, page »**.
  (consolidation 25/11, audit phase 3) **« Réglage estimé »** remplace « « À vérifier » en avertissement ambre » :
  section simple, comme « Pour progresser », juste avant la source, titre « Réglage estimé » et le texte `aVerifier` de
  la fiche ; plus de rubalise ambre. Pourquoi : ce n'est pas un risque (l'ambre est réservé aux avertissements, une
  couleur par rôle), et la plupart des fiches en ont un, signalé par honnêteté.
- **Vocabulaire** (consolidation 25/11, audit phase 3, M-8) :
  - **« Réglage estimé »** : champ `aVerifier`. Un réglage (repos, durée, charge, seuil de prérequis…) que la source ne
    confirme pas et que l'app a posé prudemment. La fiche reste proposable par le générateur et l'assistant.
  - **« À vérifier »** et **« À LA MAIN SEULEMENT »** : champ `exclureDeLaGeneration` (ou fiche de test). Une valeur clé
    reste à vérifier : ni le générateur ni l'assistant ne la proposent ; à la main, S-02 le dit (« a un réglage encore à
    vérifier »). Seuls ces cas emploient « à vérifier ».
- **Action principale** : « Ajouter au plan » (menu : semaine, jour, séance ; par défaut la semaine affichée).
- **Autres actions** : « Essayer le chrono » (second, ouvre le chrono en aperçu) ; pour un exercice personnel :
  « Modifier », « Supprimer » (avec confirmation, et la liste des séances qui l'utilisent).
- **États** : protocole exclu de la génération automatique (ou fiche de test) → étiquette « À LA MAIN SEULEMENT »
  (consolidation 18/11 : le générateur et l'assistant ne la proposent pas ; ajoutable à la main) et la raison ; panneau
  fermé par Échap ou la croix, focus rendu à la fiche d'origine.

### O-08 Créer un exercice personnel
- **But** : ajouter un exercice à soi, par exemple tiré d'un livre, sans recopier le livre.
- **Disposition** : formulaire à gauche (7 colonnes), aperçu de la fiche en direct à droite (5 colonnes).
- **Champs** :
  1. Nom (obligatoire).
  2. Qualité (choix obligatoire).
  3. Forme : « Chrono », « Liste à cocher », « Essais avec repos » ; les sous-champs suivent la forme
     (chrono : gabarit, effort, repos, répétitions, séries, mot affiché pendant l'effort ; liste : éléments ;
     essais : repos entre essais).
  4. Consigne (2 phrases conseillées ; compteur de caractères ; aide : « Écris avec tes mots. Ne recopie pas le livre :
     note plutôt sa page. »).
  5. Durée indicative (minutes).
  6. Matériel ou terrain.
  7. **Référence** (facultative) : livre (liste : *Escalade Training : les secrets de la planification*,
     *Escalade Training : 100 exercices spécifiques d'entraînement*, *Guide de l'alimentation du grimpeur*, « Autre »)
     et page.
  8. **Sécurité**, en questions simples (oui / non / je ne sais pas) : « Effort maximal des doigts ? », « Sur poutre ? »,
     « Arqué, bidoigts ou trous ? », « Sans pieds au pan ? », « Pour quelles zones est-il déconseillé en cas de douleur ? »
     (doigts, poignet, coude, épaule, genou, dos). **Valeur prudente** : « Je ne sais pas » est traité comme « oui » par
     les règles, et l'aide le dit.
     (consolidation 25/11, audit phase 3, M-12) Questions dans cet ordre : « Effort maximal des doigts ? », « Sur
     poutre ? », « Bloc à ta limite ? » (ajoutée par D-13), « Arqué ou trous ? », « Bidoigts ? », « Sans pieds au pan ? »,
     puis les zones. « Arqué, bidoigts ou trous ? » est coupée en deux : elle donnait les trois marqueurs ensemble, et un
     exercice arqué à effort maximal recevait `bidoigts`, d'où un S-18 fort à tort. « Je ne sais pas » à « Bidoigts ? »
     pose toujours `bidoigts` (prudence). Correspondances : backlog, D-13, amendement 3.
  9. Réglage du chrono : bouton « Essayer le chrono ».
- **Action principale** : « Créer l'exercice ». Il apparaît dans la bibliothèque avec l'étiquette « PERSO ».
- **États** : champ obligatoire manquant → message sous le champ, focus sur le premier ; quitter avec des changements →
  confirmation ; réglage de chrono incohérent (0 série) → message sous le champ.

### O-09 Choisir les objectifs d'une phase (fenêtre légère depuis O-03 ou O-04)
- **But** : choisir jusqu'à 2 objectifs spécifiques.
- **Contenu** : liste proposée par les règles (libellé, test repère associé, pourquoi il va avec l'accent), option
  « Écrire le mien » (libellé, test repère facultatif). Compteur « 1 sur 2 ».
- **Action principale** : « Garder ces objectifs ».

### O-10 Panneau de l'assistant
- **But** : obtenir un brouillon expliqué et sourcé, et le trier élément par élément.
- **Ouverture** : bouton « Assistant » de la barre du haut ; panneau de 404 px à droite (voir démo), le plan reste visible
  et modifiable. Fermeture : croix ou Échap ; la conversation est gardée.
- **En-tête** : titre, mention « CLÉ SUR CET APPAREIL », croix.
- **Zone de conversation** :
  - messages de l'utilisateur à droite, fond creux ;
  - réponses de l'assistant à gauche, liseré sépia, étiquette sépia **« BROUILLON »** et compteur
    « 2 sur 3 traités » ;
  - une phrase de résumé, puis la **liste des éléments**. Chaque élément : ce qui change, en une phrase
    (« Déplacer « Puissance au pan » de vendredi à samedi »), la raison, les numéros de sources ; trois boutons
    **Garder** (encre plein), **Modifier**, **Rejeter** (contours) ;
  - **Garder** applique l'élément au plan tout de suite ; l'élément passe en fond résine doux « GARDÉ » avec
    « Annuler » ;
  - **Modifier** applique l'élément puis ouvre la case concernée du plan en édition (contour résine) ; l'élément
    passe « GARDÉ, MODIFIÉ » ;
  - **Rejeter** barre l'élément, fond creux pointillé, « REJETÉ » avec « Annuler » ;
  - survoler ou focaliser un élément surligne la case concernée du plan (contour pointillé résine) ;
  - en bas de la réponse : bouton discret « Garder tout ce qui reste » (jamais en principal) ;
  - **sources** : liste numérotée sous la proposition : synthèse théorique du projet (section), protocole de la
    bibliothèque (lien vers sa fiche), méthode reconnue (auteur), ou livre **cité par son titre seulement** ;
  - **avertissements** : si un élément déclenche une règle de sécurité, la rubalise ambre apparaît **dans l'élément**
    avec le texte de la règle (écrit par les règles, pas par l'assistant) ; l'élément reste gardable ; le même
    avertissement apparaît dans le plan une fois gardé.
- **Saisie** : champ « Demande un ajustement… » (zone de texte qui grandit, Entrée envoie, Maj+Entrée va à la ligne),
  bouton « Envoyer » ; au-dessus, trois demandes toutes faites en boutons seconds : « Brouillon de cycle »,
  « Brouillon de ce bloc », « Ajuster cette semaine ».
- **Action principale** : il n'y en a pas en résine dans le panneau (l'action principale de l'écran reste celle du plan) ;
  « Envoyer » est un bouton second.
- **États** :
  - *pas de clé* : « Pour utiliser l'assistant, ajoute ta clé API Claude. Elle reste sur cet appareil. »
    avec « Ajouter ma clé » (vers O-12, section Assistant) ;
  - *réflexion* : « L'assistant prépare un brouillon… » et trois lignes en silhouette ; bouton « Arrêter » ;
  - *clé refusée* : « Ta clé a été refusée. Vérifie-la dans les réglages. » ;
  - *limite ou crédit atteint* : « Ta clé n'a plus de crédit ou a atteint sa limite. Réessaie plus tard ou vérifie ton
    compte Anthropic. » ;
  - *réponse illisible* : « La réponse n'a pas pu être lue. Rien n'a été changé dans ton plan. » avec « Réessayer » ;
  - *hors ligne* : champ désactivé, « L'assistant a besoin du réseau. Ton plan reste modifiable à la main. » ;
  - *proposition sur un plan qui a changé depuis* : éléments devenus impossibles grisés avec « Ne s'applique plus ».
- **Coût** (consolidation 17/11, B6) : sous le champ de saisie, « Coût estimé : ≈ 0,01 $ avec Haiku (au plus 0,02 $ s'il faut
  une relance) », mis à jour avant chaque envoi ; le modèle (Haiku par défaut, Sonnet en option dans les réglages) est nommé.
- **Sources** (consolidation 17/11) : un livre n'est jamais la source d'une règle ou d'un chiffre ; il s'affiche à part,
  sous « Lecture conseillée ».
- **Niveau d'un brouillon de cycle** (consolidation 23/11, F6) : l'assistant ne choisit pas le niveau. En tête d'une
  réponse de type cycle, au-dessus des éléments : « Niveau du cycle » en trois choix encre, présélection
  `niveauPropose` sur les accents des phases du brouillon, et sa ligne « pourquoi » (comme O-13). Le cycle est créé à
  ce niveau quand tu gardes son premier élément. Pour les autres demandes, mention « Niveau : celui du cycle
  (grandes lignes) », qui se change dans l'en-tête du cycle.
- **Téléphone** : l'assistant n'est pas proposé sur téléphone (décision B7).

### O-11 Bilans (ordinateur)
- **But** : voir sa progression et comparer les phases.
- **Onglets** (choix encre, état dans l'adresse) : « Qualités », « Phases », « Séances » (consolidation 17/11).
  - **Qualités** : 5 petits graphiques côte à côte (doigts, traction et gainage, puissance, résistance, endurance),
    un par qualité, même échelle de temps ; points des tests repères reliés ; séparation verticale à chaque fin de phase ;
    valeur actuelle en `chiffre-cle` au-dessus. Une seule couleur par graphique (encre), la dernière valeur en résine.
    Pas de graphique à 5 couleurs : il concurrencerait les couleurs de prises.
  - **Phases** : tableau comparatif (séances prévues, faites, charge totale, charge moyenne par semaine, tests de fin de
    phase, objectifs atteints ou non), une phase par colonne. Repère de traction tracé seulement si le profil en a
    choisi un (B14).
  - **Séances** : tableau de l'historique (date, nom, mode, durée, effort, charge, prévue ou libre), filtrable et
    triable ; ligne cliquable → débrief.
- **Action principale** : « Saisir un test repère » (fenêtre : qualité, test, valeur, date).
- **États** : aucun test → « Les courbes apparaissent après tes premiers tests de fin de phase (semaine 4). » avec
  annotation vers « Saisir un test repère » ; une seule mesure → point seul et « Encore un test pour voir une tendance ».
- **Accessibilité** : chaque graphique a un résumé texte (« Doigts : 32 kg en S4, 35 kg en S8, en hausse ») et un
  tableau caché accessible.

### O-12 Profil et réglages (ordinateur)
- **Disposition** : sommaire à gauche (ancres), sections à droite, une action « Enregistrer » par section.
- **Sections** :
  1. **Toi** : champs du profil actuel.
  2. **Prérequis** : tractions strictes (nombre), test 15 s sur 25 mm (oui / non / pas fait), 18 ans révolus,
     grimpe en tête, avec une aide par ligne et la date de mise à jour.
  3. **Douleurs en cours** : zones ; aide « Une douleur déclarée écarte les exercices à risque. »
  4. **Ta salle** : salle, couleurs et fourchettes (pastilles de prise), modifiables.
  5. **Compte** : e-mail, « Se déconnecter » (consolidation 17/11 : la liste des appareils connectés est abandonnée, elle demanderait la clé secrète du serveur).
  6. **Assistant** : champ « Clé API Claude » (`type="password"`, bouton « Afficher », `autocomplete="off"`,
     `spellcheck=false`), aide « Elle reste sur cet appareil. Elle n'est jamais envoyée à notre serveur ni synchronisée.
     Chaque demande à l'assistant est payée avec ta clé. » ; état « Vérifiée le 17 nov. » / « Pas encore vérifiée » /
     « Refusée » ; boutons « Vérifier la clé » (second), « Retirer la clé » (discret, avec confirmation) ; lien
     « Où trouver ma clé ? ».
  7. **Données** : sauvegarde en fichier, recharger une sauvegarde, supprimer mon compte (avec confirmation forte :
     taper « supprimer »).
  8. **À savoir** : mises en garde, version de l'app.
- **Action principale** : « Enregistrer » de la section en cours d'édition (une seule active à la fois).
- **États** : changements non enregistrés en quittant → confirmation ; enregistrement hors ligne → « Enregistré sur cet
  appareil, envoi au retour du réseau. »
- (consolidation 18/11) Section **Toi** : « Où tu t'entraînes » (choix multiples encre) : « Salle de bloc », « Salle avec
  des voies (corde et assureur) », « À la maison (poutre ou barre) » ; aide « Le générateur et l'assistant ne te
  proposent que des exercices faisables là. Rien de coché : salle de bloc. » (`Profil.lieux`).

### O-13 Nouveau cycle (consolidation 18/11, fenêtre)
- **But** : poser le cadre du cycle et son niveau de détail, puis le remplir avec le générateur ou à la main.
- **Ouverture** : « Crée ton premier cycle » (O-02), « Nouveau cycle » (O-03).
- **Contenu**, dans cet ordre (consolidation 23/11, F6 : le niveau vient après les accents) : nom ; date de début (un
  lundi ; par défaut le lundi suivant) ; séances par semaine (2 à 5, profil par défaut) ; jours (rappel de
  `joursDisponibles`, « Modifier dans ton profil ») ; lieux (rappel, même lien) ;
  **accents** des 3 phases, proposés selon ton profil (modifiables) ;
  **niveau de détail** en trois choix encre, chacun avec sa ligne d'exemple :
  « Simple — Jeudi · Doigts · dure · 1 h 30 : Bloc limite sur réglettes, 4 essais max. » ;
  « Grandes lignes — Échauffement 30 min · Bloc limite 45 min · Antagonistes 15 min. » ;
  « Détaillé — Chaque étape avec son chrono, ses séries et ses repos. » ;
  sous le choix, la ligne **« pourquoi »** du niveau proposé (consolidation 23/11, F6), par exemple « Une de tes phases
  travaille les doigts, la traction ou la puissance : en Détaillé, le chrono règle les temps d'effort et les repos. » ;
  aide « Tu pourras changer le niveau du cycle ou d'une séance à tout moment. Rien n'est effacé. »
- **Niveau proposé** (consolidation 23/11, F6) : un niveau est toujours présélectionné par `niveauPropose(accents)`
  (`niveaux-de-detail.md` § 1.7), jamais imposé, jamais écrit sans avoir été affiché. Détaillé dès qu'une phase
  travaille les doigts, la traction ou la puissance, ou tant qu'un accent manque ; Grandes lignes quand toutes les phases
  visent l'endurance, la résistance ou la technique ; Simple jamais présélectionné, toujours proposé. Tant que tu n'as pas
  touché au niveau, la présélection et sa ligne suivent les accents. Dès que tu choisis, ton choix reste ; si les accents
  changent ensuite et que la proposition diffère, la ligne devient « Ton choix. Pour ces accents, l'app propose
  {Niveau}. » Avant D-25 (fenêtre sans accents) : Détaillé, avec « Les accents de tes phases ne sont pas tous choisis :
  l'app propose le niveau le plus guidé. »
- **Action principale** : « Proposer un plan » (le générateur remplit les 12 semaines au niveau affiché ; le cycle reste en brouillon).
- **Autres actions** : « Commencer vide » (second) ; « Annuler ».
- **États** : génération → la vue 12 semaines s'ouvre sur le cycle brouillon, avec les avertissements en direct et, pour
  chaque manque du générateur, une ligne d'information (« Pas de séance possible le jeudi avec ton profil ou tes
  douleurs : repos. ») ; erreur d'enregistrement → comme O-03.
- **Accessibilité** : fenêtre de confirmation (D-04) : focus piégé, Échap annule, titre lu à l'ouverture.
  (consolidation 23/11, F6) La ligne « pourquoi » est liée au groupe de choix du niveau (`aria-describedby`) et lue
  quand elle change (`aria-live="polite"`).

---

## 4. Les avertissements de sécurité : forme commune

Les règles et leurs textes viennent de l'expert entraînement. L'affichage est commun :

| Niveau | Forme | Où | Exemple de forme (texte à fournir par les règles) |
|---|---|---|---|
| **Information** | Ligne avec icône « i » encre | Fiche, séance | « La version groupe n'est pas encore remplie. » |
| **Avertissement** | Rubalise ambre, `role="status"` | Semaine, séance, étape, élément de l'assistant | Titre : « Deux séances dures à moins de 48 h. » Phrase. « Pourquoi ? ». Correction en un clic. « Je garde ce choix ». |
| **Arrêt** | Rubalise brique, `role="alert"` | Aujourd'hui, débrief, chrono (après « Stop »), fiche protocole | « Douleur au coude déclarée. » Phrase. « Voir les mises en garde ». |

Règles d'affichage :
- jamais de case à cocher « J'accepte », jamais de bouton désactivé à cause d'un avertissement ;
- un avertissement replié (« Je garde ce choix ») reste compté dans le résumé de la semaine et du tableau de bord ;
- le texte dit **quoi**, **pourquoi** (en une phrase) et **que faire** ; la source est dans « Pourquoi ? » ;
- un même avertissement n'apparaît qu'une fois par zone (pas de doublon semaine + séance + étape ouvert en même temps :
  il est ouvert au niveau le plus précis, résumé ailleurs).

**Profil non renseigné et S-03 répétés** (consolidation 25/11, audit phase 3, M-3). Avec un profil peu rempli, une même
fiche donne un S-03 dans chaque séance qui la contient (24 S-03 forts sur 40 avertissements dans l'exemple de l'audit) :
le message utile, « complète ton profil », se noie, et on risque de tout garder sans lire. Deux règles d'affichage ;
**rien n'est retiré du moteur**, chaque S-03 reste compté (résumés, repères, « dont n gardés ») et reste visible sur
son étape, dans la fiche de séance, avec son « Je garde ce choix ».

1. **Ligne de profil.** Quand au moins un S-03 de la zone porte `nonRenseignes` (B.3 de `moteur-verification.md` :
   prérequis demandés que le profil laisse vides), la zone montre **une** ligne d'information (icône « i » encre,
   comme le niveau Information ci-dessus, jamais ambre), placée **avant** les avertissements de la zone :
   - titre en gras : « Ton profil ne dit pas encore : {liste}. » ; `{liste}` = réunion des `nonRenseignes` des S-03 de la
     zone (gardés compris), sans doublon, dans cet ordre, chacun avec son libellé :
     `tractionsStrictesMax` « combien de tractions strictes tu fais » ; `test15sSur25mm` « si tu tiens 15 s sur une
     réglette de 25 mm » ; `niveauBloc` « ton niveau en bloc » ; `adulte` « si tu as 18 ans ou plus » ; séparés par « , »,
     le dernier par « et » ;
   - suite : « Ce qui n'est pas renseigné compte comme non rempli, par prudence. » ;
   - bouton texte (jamais en résine) : « Compléter mon profil », qui ouvre la rubrique Profil ; sans moyen d'y aller,
     le bouton n'est pas affiché et le texte reste.
   Exemple : « **Ton profil ne dit pas encore : combien de tractions strictes tu fais et si tu as 18 ans ou plus.** Ce qui
   n'est pas renseigné compte comme non rempli, par prudence. Compléter mon profil ».
   Zones : la vue 12 semaines (O-03, sous le résumé en tête, pour tout le plan) ; la vue Semaine (O-05, en tête de la
   liste des avertissements de la semaine) ; le tableau de bord (O-02, « Avertissements ouverts », sous le compte, pour
   la semaine affichée). Pas dans la fiche de séance (elle se répéterait dans chaque fiche), ni dans la vue Phase.
   La ligne n'est pas un avertissement du moteur : elle n'entre dans aucun compte et n'a ni « Pourquoi ? » ni
   « Je garde ce choix ». Elle disparaît quand le profil est complété (les S-03 n'ont plus de `nonRenseignes`).
2. **S-03 identiques regroupés**, dans les deux listes de la semaine : vue Semaine (O-05) et tableau de bord (O-02).
   Un groupe = les S-03 de la liste dont le message est **identique** (même fiche, mêmes manques) et qui visent **au
   moins deux séances différentes**. Il prend la place du premier, l'ordre des autres lignes ne change pas. Les autres
   codes, et les signaux d'arrêt, ne sont jamais regroupés.
   - Vue Semaine : une ligne résumée, comme les autres lignes de séance : icône avertissement, puis « **Dans {n}
     séances** ({jours}) : {titre} », puis « (gardé) » si tous les S-03 du groupe sont gardés ; bouton « Voir la
     séance » vers la première séance du groupe. `{n}` = nombre de séances distinctes ; `{jours}` = leurs jours, en
     minuscules, dans l'ordre de la semaine, séparés par « , », le dernier par « et » (« mardi, jeudi et samedi ») ;
     `{titre}` = première phrase du message, comme pour les autres lignes.
   - Tableau de bord : une rubalise ambre, titre = première phrase du message, texte « Dans {n} séances ({jours}). ». Elle
     compte pour **une** ligne dans la limite des lignes affichées ; les signaux d'arrêt restent d'abord et hors limite
     (correction M-1) ; la phrase « et {k} autre(s), à voir dans le Plan » compte les avertissements du moteur non
     montrés, pas les lignes.
   - Un S-03 seul (une seule séance) reste une ligne ordinaire. Deux S-03 identiques dans une même séance (la même
     fiche à deux étapes) ne forment pas un groupe.

---

## 5. Textes d'interface de référence

| Situation | Texte |
|---|---|
| Bouton de connexion | Recevoir mon code de connexion (consolidation 17/11) |
| Code envoyé | Regarde ta boîte mail. Saisis le code reçu. Il est valable 1 h. |
| Adresse non invitée | Cette adresse n'est pas sur la liste d'invités. Demande à Arthur de l'ajouter. |
| Reprise | On a trouvé tes séances · Ajouter à mon compte |
| Reprise faite | 14 séances ajoutées. Elles restent aussi sur ce téléphone. |
| Hors ligne | Hors ligne. Tout est gardé sur cet appareil, l'envoi se fera au retour du réseau. |
| Quitter une séance | Quitter la séance ? Elle ne sera pas enregistrée. · Quitter · Rester |
| Pas de plan (téléphone) | Pas encore de plan. Prépare ton cycle sur ordinateur. En attendant, fais une séance libre. |
| Assistant sans clé | Pour utiliser l'assistant, ajoute ta clé API Claude. Elle reste sur cet appareil. |
| Brouillon | Rien n'est appliqué tant que tu ne gardes pas. |
| Prérequis non rempli | Prérequis : 10 tractions strictes demandées. Tu peux l'ajouter quand même. |
| Valeur inconnue | Pas renseigné : compte comme non rempli, par prudence. |
| Profil incomplet (consolidation 25/11, audit phase 3) | Ton profil ne dit pas encore : combien de tractions strictes tu fais et si tu as 18 ans ou plus. Ce qui n'est pas renseigné compte comme non rempli, par prudence. · Compléter mon profil |
| S-03 regroupés (consolidation 25/11, audit phase 3) | Dans 3 séances (mardi, jeudi et samedi) : « Tractions lestées, force max » demande : 10 tractions strictes (non renseigné) ; 18 ans ou plus. |
| Réglage non confirmé à la source (consolidation 25/11, audit phase 3) | Étiquette : RÉGLAGE ESTIMÉ. Fiche : section « Réglage estimé » avec le texte de la fiche. |
| Exercice personnel | Écris avec tes mots. Ne recopie pas le livre : note plutôt sa page. |

---

## 6. Besoins de données

> (consolidation 17/11) Chaque besoin ci-dessous est confronté au modèle dans `docs/architecture-v2.md` § 3.7 (couvert, ajouté, calculé ou abandonné).

Liste pour l'architecte et l'expert entraînement (le gérant consolide). « Calculé » = à ne pas stocker.

### Compte et synchronisation
- Adresse e-mail du compte ; état connecté ou non ; durée de validité du lien de connexion (pour T-03).
- État de synchronisation : à jour, envoi en cours, nombre de changements en attente, date et heure de la dernière
  synchronisation réussie.
- Signal « le plan a changé sur un autre appareil pendant l'édition » et règle de fusion (O-05).
- Pour la reprise (T-04) : nombre de séances locales, date de la première et de la dernière, présence et date de
  modification du profil local ; même chose côté compte ; progression de l'envoi (n sur N) ; reprise interrompue
  reprenable.
- Liste des appareils connectés (facultatif, O-12).
- Choix « continuer sans compte » mémorisé (si Q2 retenue).

### Profil
- Champs actuels, plus : tractions strictes (nombre ou inconnu), test 15 s sur 25 mm (oui, non, pas fait),
  18 ans révolus (oui, non), grimpe en tête (oui, non), date de mise à jour de chaque prérequis.
- **Mode habituel** : solo ou groupe (pour choisir le bouton principal d'Aujourd'hui) ; peut être tiré de
  `grimpeSouventEnGroupe`.
- Couleurs de la salle modifiables par l'utilisateur (nom, couleur, fourchette de cotation).

### Plan
- Cycle : nom, date de début (fin calculée), séances par semaine visées (2 à 5), statut (en cours, terminé).
- Bloc (3 par cycle) : numéro, accent (qualité), objectifs (0 à 2 : libellé, test repère associé facultatif, origine
  proposée ou écrite), réglage de la semaine allégée.
- Semaine : numéro 1 à 12, allégée (calculé : 4e du bloc), dates (calculé).
- Séance prévue : jour, nom, **version solo** (liste ordonnée d'étapes : protocole + réglages propres éventuels),
  **version groupe** (étapes communes + objectifs de groupe : libellé, cible, couleur conseillée facultative, essais
  maximum, protocole d'origine facultatif), version par défaut si différente du mode habituel.
- Calculés pour l'affichage : dureté d'une séance, durée estimée, charge prévue de la semaine, nombre de séances dures,
  état d'une séance prévue (faite, manquée, à venir) à partir des séances réalisées.
- Lien entre une séance réalisée et la séance prévue (identifiant), et séance « libre » sans lien.
- (consolidation 18/11) Niveau de détail du cycle et d'une séance ; recommandation d'une ligne ; parties (titre, durée,
  exercice principal, consigne) ; lieux d'entraînement du profil. Calculés : niveau affiché, parties et recommandation
  tirées des étapes. Voir `docs/architecture-v2.md` § 3.7.

### Bibliothèque et exercices personnels
- Pour chaque protocole : tous les champs de `types.ts` (déjà présents), plus « origine » (bibliothèque ou perso).
- Exercice personnel : champs d'un protocole, plus référence « livre, page » (titre parmi une liste + « autre », page),
  réponses aux questions de sécurité (oui, non, je ne sais pas) traduites en marqueurs par les règles, auteur (compte).
- Pour chaque protocole et le profil courant (calculé par les règles) : prérequis remplis ou non, **liste des manques**
  en texte clair, contre-indication active ou non, protocole exclu de l'assistant ou non.
- Liste des séances qui utilisent un exercice personnel (pour la suppression).
- Traduction lisible des réglages de chrono (« 9 échelles de 3, 6 puis 9 s… ») : fonction partagée.

### Règles de sécurité (avertissements)
- Pour chaque avertissement calculé : identifiant de règle, niveau (information, avertissement, arrêt), portée
  (cycle, bloc, semaine, séance, étape) et cible précise, titre, phrase d'explication, texte « Pourquoi ? » et source,
  correction proposée facultative (libellé + action applicable), état replié (« Je garde ce choix ») mémorisé.
- Réglages d'allègement possibles pour la semaine allégée et valeur par défaut prudente.
- Liste des objectifs proposables selon l'accent du bloc et le profil, avec test repère.
- Règle à appliquer à une séance manquée (proposition affichée sur Aujourd'hui).

### Assistant
- Clé API : présence, état de vérification (vérifiée le…, refusée), stockée **sur l'appareil seulement**.
- Conversation : messages (auteur, texte, date), gardée sur l'appareil ou synchronisée (à trancher par l'architecte :
  elle peut contenir des données de santé déclarées).
- Proposition : type (cycle, bloc, semaine), résumé, liste d'éléments ; élément : type (ajouter, retirer, déplacer,
  remplacer, régler, objectif), cible dans le plan, état avant et après (pour l'aperçu), raison, références de sources,
  avertissements déclenchés (calculés par les règles), statut (en attente, gardé, gardé modifié, rejeté), possibilité
  d'annuler.
- Sources : type (synthèse, protocole, méthode, livre), libellé, lien ou section ; les livres par titre seulement.
- Erreurs distinctes : clé refusée, limite ou crédit, réseau, réponse illisible.
- Coût estimé d'une demande (facultatif, Q6).

### Séances réalisées et bilans
- Séance réalisée : champs actuels + identifiant de la séance prévue (ou libre) + état d'envoi (local, envoyé).
- Tests repères : qualité, nom du test, valeur, unité, date, bloc et semaine (calculés d'après la date), saisi sur
  téléphone ou ordinateur.
- Calculés : charge par séance et par semaine (existant), séances prévues et faites par bloc, objectifs atteints.
- « Forme du jour » (si Q5 retenue) : questions et réponses, effet sur la séance défini par l'expert.

---

## 7. Questions pour Arthur

> (consolidation 17/11) Tranchées le 17/11 (`docs/decisions-phase-1.md`) : Q1 oui (A1) ; Q2 oui, usage sans compte conservé (B3) ; Q3 fond clair, thème sombre reporté après la phase 4 (B8) ; Q4 ordinateur seulement (B7) ; Q5 gardée et rendue utile (B10) ; Q6 oui (B6) ; Q7 déplacer ou sauter une séance (B11) ; Q8 « Get me to 9a » (décision du 18/11) ; Q9 « Phase » (B9).

- **Q1** : la direction « Topo » (magnésie, résine, étiquettes vissées, pastilles de prise, rubalise) te plaît-elle,
  et la couleur d'action pétrole (résine) te convient-elle ?
- **Q2** : peut-on utiliser l'app sans compte (comme aujourd'hui), avec le compte en option ?
- **Q3** : passer l'app en fond clair (magnésie) : d'accord, sachant que le chrono garde ses écrans contrastés ?
  Faut-il un thème sombre pour le soir ?
- **Q4** : l'assistant reste-t-il réservé à l'ordinateur en v2 ?
- **Q5** : la ligne « Forme du jour » d'Aujourd'hui : on la garde (quelques questions avant la séance) ou on la retire ?
- **Q6** : afficher un coût estimé avant chaque demande à l'assistant ?
- **Q7** : sur téléphone, autoriser un petit ajustement du plan (déplacer une séance à un autre jour), ou tout
  modifier sur ordinateur ?
- **Q8** : un nom pour l'app (le système de design s'appelle « Topo », l'app reste « Appli escalade » en attendant) ?
- **Q9** : « bloc » sert à la fois pour la période de 4 semaines et pour un bloc d'escalade. On garde « Bloc 1, Bloc 2… »
  pour les périodes, ou on préfère « Phase » ou « Période » ?
