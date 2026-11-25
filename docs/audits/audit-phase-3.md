# Audit de fin de phase 3 — « Get me to 9a »

25 novembre 2026 · Auditeur indépendant · Copie auditée : `/home/claude/wt/AUDIT-3` (branche `tache/AUDIT-3`, depuis `main` au commit `7e20111`, « Fusion de D-26 »). Aucun fichier de code n'a été modifié. Scripts et captures de l'auditeur : `/home/claude/audits/phase-3/` ; copies des scripts et de leurs résultats, en `.txt`, dans `docs/audits/preuves-phase-3/`.

## Verdict

**Prêt pour l'essai réel d'Arthur : oui, avec réserves.**
Le moteur de vérification tient sa spécification : les 69 vérifications S, W, P et J se déclenchent avec le bon code, le bon niveau et le message mot pour mot (aux apostrophes près dans 7 messages). Les 19 cas chiffrés de B.11 donnent le résultat attendu, et le générateur n'a placé aucune fiche interdite sur 2 472 plans essayés. Aucun bouton n'est désactivé à cause d'un avertissement. Rien n'a régressé sur le téléphone, et le cycle brouillon y reste invisible.

Deux réserves :
- un trou dans les contrôles du jour (J-02, J-04), à combler avant de les brancher sur le téléphone (C-03, phase 4) ;
- trois écrans où un signal d'arrêt peut ne pas être montré en entier.

| Gravité | Nombre |
|---|---|
| Bloquant | 0 |
| Important | 1 |
| Mineur | 12 |

## Commandes lancées

- `npm ci` : réussi. `npm audit --omit=dev` : 0 vulnérabilité.
- `npm run test` : 61 fichiers, 1 127 tests, tous passent.
- `npm run build` : réussi (PWA, 15 fichiers précachés). Un avis de Vite : le fichier JavaScript principal pèse 1 Mo (avis « plus de 500 kB »). Il est mis en cache par la PWA, donc sans effet sur l'usage hors ligne.
- `npm run lint` (oxlint) : 0 erreur, 1 avertissement, déjà signalé à la phase 2 (`src/chrono/useRepos.ts:19`, `setState` dans un effet).
- Scripts Node de l'auditeur, qui appellent directement le code de `src/` sans passer par Vitest :
  - `messages.mjs` et `spec.mjs` : lisent les tableaux de `moteur-verification.md`, déclenchent chacune des 69 vérifications et comparent code, niveau et message par expression régulière ;
  - `b11.mjs` : refait les cas 1 à 19 de B.11 ;
  - `generateur.mjs` : 2 472 plans générés pour 8 profils ;
  - `complements.mjs` : E-16, J-04, profil vide et passerelles C-01 ;
  - `w01lien.mjs` : point (a) ;
  - `prompt.mjs` : comparaison du prompt avec la spécification D.6.
- Parcours Playwright sur la version construite (`vite preview`, port 4190), à 1280 × 800 et 390 × 844 :
  - `parcours-bureau.mjs` ;
  - `parcours-bureau-2.mjs` ;
  - `parcours-telephone.mjs` ;
  - `debrief.mjs`.

  Le serveur est arrêté à la fin.

---

## Constat important

### I-1. Les contrôles du jour J-02 et J-04 se taisent pour une séance dont seule la version groupe est maximale

**Ce qui peut arriver.** Arthur écrit à la main une séance « dure » sans exercice en solo, avec en groupe l'objectif type « 3 blocs à ta limite » (OG-01, marqueur `maximale`). La veille au soir, il a fait une séance maximale. Le matin, le contrôle du jour ne dit rien : ni l'avertissement fort des 48 h (J-04), ni le manque de sommeil (J-02). Le plan, lui, affiche bien W-01 pour cette même séance. Les deux parties du moteur se contredisent.

**Où.** `src/regles/verifJour.ts:23-25` (`estDureSansContenu`), `:39` (`viseParMaximale = maximale && !estDureSansContenu(...)`), `:60` et `:87`.

**Preuve.** Script `complements.mjs` (résultat dans `preuves-phase-3/resultat-complements.txt`). La séance est dure en solo, sans exercice, avec « 3 blocs à ta limite » en groupe. La séance maximale a été faite il y a 12 h, après trois nuits de 5 h :
```
codes = (aucun) ; estMaximale côté W-01 : 1 W-01
même séance mais solo légère : codes = J-04,J-02
```
La spécification (B.8) pose la condition `estMaximale(s)` pour J-02 et J-04. Le tableau F7 de B.2 rend ces deux contrôles muets « pour elle » seulement parce qu'une séance dure sans exercice n'a aucun marqueur. Ici, la version groupe en a un. Le code ajoute une exception qui n'existe pas dans la spécification. Elle ne change rien quand la séance n'a pas de marqueur, mais elle supprime J-04 dès que la version groupe est maximale.

**Risque.** Aucun aujourd'hui : les contrôles du jour ne sont affichés qu'à partir de C-03 (phase 4). Ensuite, un avertissement fort de récupération manquerait le matin d'une séance de groupe intense.

**Correction proposée.** Remplacer `viseParMaximale` par `maximale` (soit `estMaximale(seanceDuJour, fiches)`) et retirer `estDureSansContenu`. Le cas F7 reste couvert, puisqu'une version sans exercice n'a aucun marqueur. Ajouter le test ci-dessus dans `verifJour.test.ts`.
**Qui.** Petite tâche de code, Sonnet. À faire avant C-03 ou au début de C-03.

---

## Constats mineurs

### M-1. Un signal d'arrêt peut ne pas être montré en entier (tableau de bord, onglet GROUPE, vues Phase et 12 semaines)

**Ce qui peut arriver.** Prenons une douleur aux doigts déclarée et une semaine chargée.
- **Tableau de bord.** La rubrique « Avertissements ouverts » n'en montre que 3, dans l'ordre du moteur (fort d'abord, puis par date). Un signal d'arrêt (S-04, S-05, S-06) sur une séance de jeudi peut donc rester caché derrière trois avertissements forts du lundi. Il ne reste alors que la phrase « 1 signal d'arrêt » et « et 2 autre(s), à voir dans le Plan ».
- **Onglet GROUPE de la fiche de séance.** Quand cet onglet est affiché, les avertissements des étapes **solo** ne sont montrés nulle part dans la fiche, signaux d'arrêt compris. Il ne reste que le nombre dans le triangle.
- **Vues Phase et 12 semaines.** Le repère est le même triangle ambre, qu'il s'agisse d'un signal d'arrêt ou d'un simple avertissement.

**Où.** `src/ecrans/bureau/TableauDeBord.tsx:160` et `:215-218` (`ouverts.slice(0, 3)`) ; `src/composants/FicheSeance.tsx:328-330` (`surEtapeCachee` vide quand `surGroupe`) ; `src/ecrans/bureau/VuePhase.tsx:276` et `src/ecrans/bureau/VueCycle.tsx:324-325`.
**Risque.** Faible : la vue Semaine montre le signal en entier, en tête de semaine et dans la fiche. Mais la consigne est « signaux d'arrêt visibles et jamais repliés ».
**Correction proposée.**
- Tableau de bord : trier les signaux d'arrêt en premier et ne jamais les compter dans la limite de 3.
- Fiche : sur l'onglet GROUPE, garder en tête les avertissements `arret` de la version solo, avec le nom de l'étape (comme `surEtapeCachee`).
- Repères : utiliser l'icône `arret` dès qu'un signal d'arrêt est dans la case.

**Qui.** Sonnet (design), en une tâche.

### M-2. W-01 : l'écran retrouve la seconde séance par son nom (point a)

**Ce qui peut arriver.** Le repère « Cette séance est citée par l'avertissement de la séance qui la suit » peut se poser sur la mauvaise séance, ou ne se poser nulle part. La correction « Décaler au lendemain » n'est pas touchée : elle déplace bien la séance visée par le moteur.
**Où.** `src/ecrans/bureau/avertissementsPlan.ts:92-100` (`seanceDAvantPourW01`, expression `/après « (.+?) » \(/` sur le message).
**Preuve.** Script `w01lien.mjs` (`preuves-phase-3/resultat-w01lien.txt`) :
```
cas 1 (homonyme le jour de b) : lien = c (attendu : a)
cas 2 (nom avec guillemets et parenthèse) : lien = undefined (attendu : a)
cas 3 (séance d'avant faite hors plan) : lien = vieille (attendu : aucune)
```
Le générateur donne le même nom à une séance chaque semaine : les homonymes sont donc la règle, pas l'exception. Le lien dépend aussi du texte du message : une reformulation dans la spécification le casserait sans bruit.
**Correction proposée.** Faire ce qu'annonce la note de livraison de D-18 :
1. ajouter `seanceLieeId?: string` à `Avertissement` (B.3), rempli par W-01 avec l'identifiant de la séance `a` ;
2. le reprendre tel quel dans `ranger` ;
3. supprimer `seanceDAvantPourW01`.

`cleAvertissement` ne doit pas changer, pour que les choix déjà gardés tiennent.
**Qui.** Conception (Opus) pour l'amendement de B.3, puis Sonnet pour le code (moteur et écran).

### M-3. Beaucoup de S-03 avec un profil peu rempli (point b)

**Constat.** C'est conforme : une alerte par fiche et par séance, de niveau fort, et un `null` compte comme non rempli. Avec le profil de départ (`PROFIL_VIDE` : tractions, réglette 25 mm et majorité « non renseignés »), 8 des 26 séances types déclenchent S-03 (14 alertes). Le générateur les évite toutes : un plan proposé ne contient aucun S-03. En revanche, un plan retouché à la main en reçoit vite beaucoup. Exemple : une séance sur trois remplacée par ST-TRA-02 donne **24 S-03 forts** sur 40 avertissements, le plus souvent « 10 tractions strictes (non renseigné) » et « 18 ans ou plus ». Chaque S-03 se garde un par un, car sa clé dépend de la séance.
**Risque.** Supportable pour l'essai, mais le message important (« complète ton profil ») se noie dans la répétition, et Arthur risque de tout garder sans lire.
**Correction proposée** (sans rien retirer du moteur) :
- en tête de la vue 12 semaines, une ligne « Ton profil ne dit pas encore : tractions strictes, réglette 25 mm, âge. Le compléter » quand des S-03 viennent de données `null` ;
- dans la liste de la semaine, regrouper les S-03 identiques (« … dans 4 séances »).

**Qui.** Conception (Opus) pour la règle d'affichage, puis Sonnet.

### M-4. Apostrophes typographiques dans 7 messages du moteur

**Où.** `src/regles/verifSemaineContenu.ts:126` (W-10 fort), `:159` et `:167` (W-11), `:249` et `:264` (W-14), `:278` (W-15), `:295` (W-16).
**Preuve.** Le script `messages.mjs` classe ces messages en « APOSTROPHE » : ils sont identiques à la spécification si l'on remplace `’` par `'`. Tous les autres messages sont identiques caractère par caractère (`resultat-messages.txt`).
**Risque.** Aucun à l'écran. Mais un test ou une règle qui compare les textes (comme W-01, constat M-2) échouerait, et ces messages ne sont plus « mot pour mot ».
**Correction.** Utiliser `'` comme dans les autres fichiers du moteur, ou décider dans la spécification que l'apostrophe typographique est la règle. **Qui.** Haiku.

### M-5. Quelques sources affichées par « Pourquoi ? » ne suivent pas la spécification

**Où et quoi.**
- `src/regles/verifSemaineQuotas.ts:175` (W-07) écrit « Cahier des charges », et `:187` (W-08) « cahier des charges ». `[CDC]` veut dire « choix de conception de l'app » (`regles-planification.md:16`) ; partout ailleurs, le code écrit « Choix de l'app ».
- `src/regles/verifSemaineContenu.ts:319` (W-18) affiche « synthèse (objectifs spécifiques) », alors que la spécification donne `[PLAN], [MOD]` (modèle de données, pas la synthèse).
- `src/regles/verifSemaineContenu.ts:243` (W-14) ne cite pas `[CDC]`.

**Risque.** Arthur pourrait croire qu'une règle vient d'une source qui ne la donne pas (W-18).
**Correction.** « Choix de l'app » pour W-07 et W-08 ; « Plan de l'app, modèle de données » pour W-18 ; ajouter « choix de l'app » à W-14. **Qui.** Haiku.

### M-6. Identifiants techniques dans deux messages (S-21 et P-11)

**Où.** `src/regles/verifSeanceDeroule.ts:372` et `src/regles/verifPlan.ts:261`.
**Preuve.** « Les versions solo et groupe de « … » n'ont pas la même intensité (bloc_limite, dureté). » et « … comptent dans le même quota (poutre_intensive). » (`resultat-messages.txt`). La spécification dit `{différence}` et `{marqueur}` sans préciser la forme, et le code y met l'identifiant brut.
**Correction.** Un petit dictionnaire `NOMS_MARQUEURS` (« bloc à ta limite », « poutre intensive », « effort maximal »…) dans `reglesParDefaut.ts`, comme `NOMS_QUALITES`. **Qui.** Haiku, après une ligne de spécification (Opus) qui fixe les libellés.

### M-7. P-01 parle encore de « blocs » de semaines

**Où.** `src/regles/verifPlan.ts:64` : « …format 12 semaines en 3 blocs de 4. » Le texte est conforme à `moteur-verification.md` (B.7), mais contraire à la règle R-2 : « Bloc » ne désigne plus qu'un bloc d'escalade. Les messages de P-03, P-09, P-10 et P-11 ont été corrigés le 17/11, pas celui de P-01.
**Correction.** Spécification puis code : « …format 12 semaines en 3 phases de 4. » **Qui.** Opus (texte), puis Haiku.

### M-8. Étiquette « À VÉRIFIER » sur des étapes que le générateur a le droit de placer

**Ce qui peut arriver.** Un plan proposé montre « À VÉRIFIER » sur plusieurs étapes (« Échelles 3-6-9 », « Bloc limite », « Antagonistes légers »…, capture `b4-semaine1.png`). Arthur peut croire que le générateur a placé des fiches « à vérifier », ce que l'audit doit justement exclure. En réalité, l'étiquette lit le champ `aVerifier` (un réglage estimé, signalé par honnêteté), pas `exclureDeLaGeneration` (fiche écartée, S-02 « a un réglage encore à vérifier »). Le générateur respecte bien la règle : voir « Vérifié et trouvé conforme ».
**Où.** `src/composants/FicheSeance.tsx:151`, conforme au texte de `parcours-et-ecrans.md:385` et de `taches-design.md:532`.
**Correction.** Changer le vocabulaire, par exemple « Réglage estimé » pour `aVerifier`, et garder « à vérifier » pour les fiches écartées (S-02, « À la main seulement »). **Qui.** Conception (Opus), puis Haiku.

### M-9. La banque ne contrôle pas la fiche de référence des objectifs de groupe

**Où.** `src/regles/banque.ts:105-109` (`fichesDeLaSeance` : solo et mini-bloc seulement).
**Preuve.** Sortie de `generateur.mjs` : 5 objectifs de groupe ont une fiche de référence qui n'est ni dans le solo ni dans le mini-bloc de leur séance type. C'est le cas de ST-END-04 et ST-TEC-02, dont l'objectif OG-18 renvoie à `endurance-4x4-voies` (terrain `voie`). Aucun des 2 472 plans générés n'a placé de fiche interdite, objectifs compris : le trou n'est pas atteint aujourd'hui.
**Risque.** Une prochaine mise à jour du catalogue pourrait proposer à un grimpeur sans salle de voie un objectif de groupe « en voie », ou un objectif dont la fiche est contre-indiquée. Les douleurs (S-04) ne sont vérifiées que sur les étapes, pas sur les objectifs.
**Correction.** Ajouter les `ficheReference` des objectifs à `fichesDeLaSeance` (banque et générateur), avec un test. **Qui.** Sonnet.

### M-10. « Proposer un plan » interrompu laisse des phases et des séances orphelines

**Où.** `src/ecrans/bureau/Plan.tsx:219-222`. Seul le cycle est retiré (suppression douce) ; les phases et séances déjà écrites restent, et elles seront synchronisées. `src/donnees/plan.ts:99-103` (`lireSeancesEntre`) ne regarde ni le cycle ni son état.
**Risque.** Aucun aujourd'hui : le téléphone ne lit pas encore le plan, et la vue Plan lit par cycle. Mais si D-22 (phase 4) utilise `lireSeancesEntre`, des séances de brouillon ou orphelines apparaîtraient dans Aujourd'hui.
**Correction.** Remplacer la suppression du seul cycle par `supprimerCycle(plan.cycle.id)`, qui existe déjà. Dans D-22, ne lire que les séances de `cycleEnCours` (cycle validé). À ajouter au texte de D-22. **Qui.** Sonnet ; une ligne d'amendement (Opus) pour D-22.

### M-11. Commentaires « niveau affiché » au lieu de « niveau choisi » pour l'assistant

**Où.** `src/assistant/format.ts:55` (`niveau: string // niveau affiché`) et `src/assistant/validerReponse.ts:29`. La spécification D.3, consolidée le 24/11, dit : « niveau choisi par l'utilisateur (`niveauChoisi`, N-01), et non plus le niveau affiché ». Les deux diffèrent pour une séance choisie en « détaillé » qui n'a que des grandes lignes.
**Risque.** Le développeur de E-13 suivra le commentaire. L'assistant répondrait alors en grandes lignes là où la règle F-10 attend du détaillé.
**Correction.** Corriger les deux commentaires. **Qui.** Haiku, ou au début de E-13.

### M-12. Petits manques d'accessibilité et de clarté

- **Réordonner au clavier.** « Monter » et « Descendre », dans le menu d'une étape (`src/composants/FicheSeance.tsx:167-168`), marchent et gardent le focus. Mais rien n'est annoncé : la zone `aria-live` affichait encore « Séance décalée au lendemain. » après le déplacement (parcours 2). Le glisser-déposer, lui, annonce son dépôt. **Correction** : `setMessage('« … » déplacée en position n.')` comme au dépôt.
- **Question « Arqué, bidoigts ou trous ? ».** Elle donne les trois marqueurs à la fois (`src/donnees/exercicePerso.ts:39`, conforme à l'amendement de D-13). Un exercice perso « arqué, effort maximal » reçoit donc aussi `bidoigts`, et déclenche S-18 fort (« Retire le lest… des bidoigts »). C'est une fausse alerte, prudente. **Correction** (conception, Opus) : séparer « Bidoigts ? » des arqués et des trous.
- **S-01 sur un exercice principal.** L'écran remplace la fin du message du moteur (`FicheSeance.tsx:53-55`) : le texte affiché n'est plus celui du moteur. C'est sensé, mais la spécification veut un message « prêt à afficher ». **Correction** : faire écrire ce texte par le moteur (B.5, cas « portée séance »).

**Qui.** Sonnet (premier point) ; Opus puis Sonnet (deuxième et troisième).

---

## Points à juger en plus

- **(a) Lien W-01 par le nom** : voir M-2. Le risque est faible (un repère mal placé, jamais une correction appliquée à la mauvaise séance), mais le lien est fragile. Il faut `seanceLieeId` dans l'avertissement.
- **(b) Profil peu rempli et S-03** : conforme, mais lourd (M-3). Le générateur, lui, évite toutes ces fiches.
- **(c) Cycle brouillon sur le téléphone** : invisible. Un cycle proposé, commençant le lundi 23/11 (donc en cours) et laissé en brouillon, n'apparaît ni dans Aujourd'hui ni dans Programme à 390 × 844 : Programme est encore « En construction », et Aujourd'hui ne lit pas le plan. `cycleEnCours` (`src/donnees/plan.ts:47-50`) ne retient que les cycles `valide`. Piège à éviter en phase 4 : M-10.
- **(d) Téléphone** : aucune régression.
  - Séance solo : démarrage, « Stop, ça fait mal » visible dès le premier écran, mises en garde, « Revenir à la séance », puis « Terminer et enregistrer ».
  - Trois questions : la douleur est pré-cochée à « Oui ».
  - Débrief : « Douleur signalée ».
  - Séance en groupe : « Stop, ça fait mal » présent ; les réserves I-2 de la phase 2 sont donc levées.
  - Profil.
  - Aucun bouton de moins de 48 px, aucune erreur de page.
- **(e) Clé API** :
  - elle vit dans la table `appareil` (`src/donnees/base.ts:56`), qui n'est ni dans `TABLES_SYNCHRONISEES` ni dans l'export (`base.ts:150-154`) ;
  - décochée, la case « Mémoriser » la garde seulement en mémoire (`Reglages.outils.ts:50-78`) ;
  - elle est affichée masquée (`masquerCle`) ;
  - le seul `console.error` de `src/` est `src/compte/client.ts:21`, sans la clé.

  Conforme.
- **(f) Assistant** :
  - le prompt `PROMPT_SYSTEME` est **identique caractère par caractère** au bloc D.6 (12 605 caractères, `resultat-prompt.txt`), avec `VERSION_PROMPT = '2026-11-24'` ;
  - la règle F-10 est appliquée (`validerReponse.ts:270-330` et `:467-475`) : une séance résumée est refusée si le niveau attendu est « détaillé » ou différent, et le niveau attendu d'un `remplacer_seance` est celui de la séance visée ;
  - les livres ne sont cités que par leur titre (`assistant/format.ts:230-231`).

  Seul écart : les commentaires de M-11.

---

## Vérifié et trouvé conforme

**1. Moteur (`src/regles/`)**
- Les **69 vérifications** (S-01 à S-27, W-01 à W-20, P-01 à P-15, J-01 à J-07) se déclenchent toutes dans `messages.mjs`. Aucun code inconnu n'est émis. Les niveaux sont conformes, y compris les cas « voir condition » : S-02 assistant fort et utilisateur information ; W-05 fort avec marqueur à quota ; W-10 fort ou information. Les messages sont identiques à la spécification, sauf les apostrophes de M-4. Les variantes sont vérifiées : pluriels, élision « l' / les », « 1er février 2027 », « 1 séance n'a pas ».
- Les sources sont traduites en clair de façon fidèle (sauf M-5).
- **B.11** : les 19 cas, leurs variantes, et le cas 19 aux trois niveaux affichés et par niveau de cycle, à la fois par `verifierSemaine` + `verifierSeance` et par `verifierPlan` (le chemin de l'écran). Résultat : **45 sur 45** (`resultat-b11.txt`).
- **E-16** : les 26 séances types, avec chaque variante, aux trois niveaux, profil tout rempli : 87 vérifications, aucun avertissement.
- Dédoublonnage par `code + seanceId + version + etapeIndex + lundi + mesocycleOrdre + sujet` (`src/regles/index.ts:21-23`). Tri fort, puis date, puis code. `cleAvertissement` n'ajoute `|sujet` que s'il existe.

**2. Avertir sans bloquer**
- Boutons désactivés relevés sur les vues 12 semaines et Semaine : seulement « Assistant » (phase 5) et « Semaine précédente » en semaine 1. Revue du code : aucun `disabled` ne dépend d'un avertissement.
- « Valider le cycle » reste possible avec des avertissements. La fenêtre dit « Ton cycle apparaîtra sur ton téléphone. Tu pourras encore le modifier. »
- Les séances types non proposables restent ajoutables, en pointillé.
- « Je garde ce choix » n'est jamais offert à un signal d'arrêt ni à une information (`avertissementsPlan.ts:110`, `FicheSeance.tsx:63`).
- `formeAffichage` donne `arret` pour S-04, S-05, S-06 et J-05.
- W-01 corrigé en un clic : « Décaler au lendemain », l'avertissement disparaît en moins d'une seconde (parcours 2).

**3. Passerelles C-01**
- `profilVersVerif` garde les `null` ; `niveauBloc` vide devient `null` ; sans lieux, le profil vaut `['salle_bloc']`.
- Un `null` compte comme non rempli : « 5 tractions strictes (non renseigné) ; tenir 15 s… ; un niveau 6A en bloc ; 18 ans ou plus ».
- `allegee` → `decharge` dans le moteur, et `allegee` dans les documents.
- Aucune clé `marqueurs`, `statut`, `mode` ni `origine` dans un plan généré ; aucun champ calculable dans les séances enregistrées (lecture IndexedDB après « Proposer un plan »).

**4. Exercices personnels**
- « Je ne sais pas » est la réponse de départ et compte comme « oui » (`exercicePerso.ts:21-41`). L'écran le dit : « Je ne sais pas compte comme oui, par prudence ».
- Les livres sont des clés de `LIVRES`, avec le titre et la page facultative, comme le prévoit D-12 pour un exercice perso. Aucun contenu de livre dans `src/` (recherche sur les titres et les auteurs).

**5. Glisser-déposer au clavier**
- Chaque geste a son bouton : « Ajouter à… » depuis le rail (fenêtre, focus dedans, Échap rend le focus) ; « Monter » et « Descendre » pour une étape ; « Déplacer » pour une séance dans la vue Phase ; menu de case Copier, Coller, Vider.
- Le glisser s'annule avec Échap (`useGlisser.ts`).
- Focus visible sur les 25 premiers éléments tabulés de la vue Semaine. Aucun élément interactif de moins de 48 px sur les écrans parcourus, à l'ordinateur comme au téléphone.

**6. Niveaux et banque**
- R-9 :
  - passer le cycle en Simple puis en Détaillé laisse 36 séances, 164 étapes et 36 recommandations (base lue avant et après) ;
  - dans une fiche, Simple puis Détaillé garde les 4 étapes, avec la ligne « 4 étapes enregistrées, cachées à ce niveau » ;
  - en simple, les avertissements d'étape montent en tête de la fiche avec le nom de l'étape.
- Sur 494 plans générés, les avertissements sont **identiques** en simple, en grandes lignes et en détaillé, hors S-15.
- Générateur, **2 472 plans** pour 8 profils (vide, complet, débutant, voie, maison seulement, doigts douloureux, épaule et coude, mineur), 2 à 5 séances, jusqu'à 216 combinaisons d'accents (toutes pour 3 séances par semaine) :
  - aucune fiche à vérifier (`exclureDeLaGeneration`), de test, à prérequis manquants, contre-indiquée, hors lieux ou demandant la tête, ni en étape ni en objectif de groupe ;
  - aucun `maxParSemaine` dépassé ;
  - **aucun avertissement fort** (`resultat-generateur.txt`).

**7. Niveau du cycle (F6, F7)**
- Fenêtre Nouveau cycle :
  - accents de départ doigts, puissance, résistance → Détaillé ;
  - endurance, résistance, technique → Grandes lignes, avec la phrase « pourquoi » mot pour mot ;
  - un choix à la main est gardé quand les accents changent, avec « Ton choix. Pour ces accents, l'app propose Détaillé. ».
- Le niveau écrit est celui affiché : « Grandes lignes » choisi → `niveauDetail: 'grandes_lignes'` en base (`NouveauCycle.tsx:42` et `:65`, `Plan.outils.ts:82`, `Plan.tsx:212`).
- `niveauPropose` suit § 1.7.
- F7 :
  - une séance dure sans exercice n'a aucun marqueur (cas 14) ;
  - S-26 n'apparaît qu'en information, sans le mot « maximal » (message et écran) ;
  - le bouton « Choisir l'exercice principal » est présent ;
  - aucun W-01 au lendemain d'une séance maximale (cas 14).

**8. S-27 et cas 19**
- S-03 fort, S-27 information et W-01 fort, avec la même cible (portée séance, version solo, `sujet` = fiche, sans `etapeIndex`), aux niveaux simple, grandes lignes et détaillé, et par niveau de cycle.
- Variantes : (b) S-04 en `arret` ; (c) plus rien après « Recalculer ».
- Dans la fiche : S-27 en tête, avec « Recalculer les grandes lignes » (fenêtre de confirmation, R-4) et « Voir les étapes ».

**Design et règles**
- Aucune couleur en dur dans les écrans : seul le voile des fenêtres, commenté, faute de variables dans `::backdrop`.
- Aucun `window.confirm` ni `alert`.
- « Les séances se lancent depuis ton téléphone » dans la vue Semaine (R-6). Aucun bouton de lancement sur ordinateur.
