# Audit de la recherche B21

Audit du 18 novembre 2026, par un auditeur qui n'a pas participé à la recherche. Périmètre : les quatre fichiers de `docs/recherche-b21/` (`t01-tests.md`, `t02-t03-echauffement-modules.md`, `t04-t10-groupe-chute.md`, `t06-t08-t09-voie-gainage-arque.md`), confrontés à `src/donnees/bibliotheque/types.ts`, `src/chrono/sequence.ts`, `bibliotheque.test.ts`, aux 60 fiches existantes et aux sources citées. Aucun autre fichier du dépôt n'a été modifié.

## Verdict

1. **Oui, la recherche peut être présentée à Arthur, après les corrections ci-dessous.** Les chiffres sont fidèles : sur 41 points relus à la source (plus de 100 chiffres), aucun chiffre faux ne touche à la sécurité. Les verdicts « confirmé » tiennent, et les livres non lus ne sont jamais cités comme source.
2. **Deux fiches doivent sortir de la génération avant toute présentation** : les deux tests maximaux (doigts et traction lestée) et le module bidoigts. Plusieurs fiches de chute et d'échauffement doivent aussi attendre la validation d'Arthur. Deux fiches de peur de la chute en bloc se contredisent : on n'en garde qu'une.
3. Décompte : **2 bloquants, 11 importants, 19 mineurs**. 30 fiches proposées : 4 prêtes, 11 prêtes après correction, 13 hors génération jusqu'à validation, 2 à abandonner. Les 37 décisions des chercheurs sont ramenées à **15**.

## Méthode et limites

- J'ai relu moi-même 41 points (souvent plusieurs chiffres chacun), choisis en priorité parmi ceux qui touchent à la sécurité et ceux marqués « confirmé ». Au moins 6 par fichier. J'ai utilisé l'outil de lecture web et, pour un passage, le navigateur (page Lattice sur les tractions, lue en entier). Le tableau en annexe donne chaque point, l'adresse et le résultat.
- Les 5 fiches proposées en forme `chrono` ont été recalculées à la main avec la règle de `construireSequence` (5 s de préparation, pas de repos après le dernier effort). Toutes respectent la marge de 15 % du test `bibliotheque.test.ts`.
- Je n'ai pas relu : le manuel de Bechtel (formule d'estimation), les pages Climb Strong (« V Sum », échauffements), Draper et al. 2021, Ingram et al. 2024, Behm et al. 2016, Han et al. 2025, les pages BMC, ni les pages de jeux de 8bplus, Movement et Kletterretter. Leurs chiffres ne sont donc ni confirmés ni infirmés ici.
- Règle appliquée pour l'état des fiches : une fiche passe « hors génération jusqu'à validation » quand un **choix de conception non sourcé touche à la sécurité** : doigts, chute, effort maximal, arqué, front lever, planche de gymnastique, ou échauffement avant un effort maximal. Les choix sans enjeu de sécurité (nombre de manches d'un jeu, repos de 120 s en technique) n'empêchent pas une fiche d'être « prête ».

---

## Constats bloquants

| # | Fichier, fiche | Ce qui ne va pas | Preuve | Correction |
|---|---|---|---|---|
| **B-1** | `t01-tests.md`, `test-suspension-max-7s-20mm` et `test-traction-lestee-2rm` | Deux tests d'effort maximal (marqueur `maximale`) sont proposés **sans `exclureDeLaGeneration`**. Or le champ `estTest` n'existe pas dans `types.ts` (le chercheur le note lui-même) : rien n'empêche le générateur de placer ces tests comme une séance ordinaire de doigts ou de traction, chaque semaine (`maxParSemaine: 1`). Pire : l'échauffement (6 à 8 suspensions de 50 à 90 %), la charge de départ (+ 10 %), les paliers (2,5 kg) et le nombre d'essais (6) sont des choix de conception, que le chercheur demande lui-même de valider (sa question 3). Les 7 autres tests portent déjà l'exclusion, ou n'ont pas d'enjeu de sécurité. | `types.ts` : pas d'`estTest`. `t01`, ligne 460 : « `estTest` n'existe pas encore ». Lattice (PDF du protocole) ne chiffre pas l'échauffement : « warm up thoroughly » seulement. | Ajouter `exclureDeLaGeneration: 'Test maximal : proposé seulement par la fonction de test ; échauffement, départ et paliers à valider par Arthur.'` aux deux fiches. Par cohérence, mettre la même exclusion sur les **9 tests**, mobilité comprise, tant que `estTest` n'existe pas (tâche C-08). |
| **B-2** | `t02-t03`, `doigts-bidoigts-module` | Le module compte **16 tenues en bidoigt**. C'est le double de l'étude (8) et 5 à 8 fois la dose de départ de Hooper (2 à 3 tenues à deux doigts). Il porte sur la prise qui expose le plus les lombricaux, et il est **ouvert à la génération**. De plus, le chrono compte toujours 18 tenues, alors que la progression demande de s'arrêter à 10 aux deux premières séances : l'écran pousse à dépasser la consigne de prudence. | Gilmore et al. 2024 (PMC11576708) : des séries de 2 tenues sur deux paires, en main ouverte puis en demi-arqué, soit 8 tenues en bidoigt, 10 s de tenue et 20 s de repos, « small strain ». Hooper's Beta : départ à 2 à 3 tenues de 10 à 15 s à trois doigts, puis 2 à 3 à deux doigts, 1 à 2 fois par semaine. | Ajouter `exclureDeLaGeneration` jusqu'à la validation d'Arthur. Mettre par défaut le **volume de l'étude** : 2 tenues à trois doigts puis 8 en bidoigt (2 + 2 + 2 + 2), soit `repetitions: 10`. Le chrono dure alors 10 × 10 + 9 × 20 + 5 = 285 s, donc `dureeMin: 5`. Passer à 18 seulement après validation, et par un changement de fiche, jamais en cours de séance. Accepter que S-24 se déclenche, ou placer le module après `doigts-abrahangs` (décision 7). |

## Constats importants

| # | Fichier, fiche | Ce qui ne va pas | Preuve | Correction |
|---|---|---|---|---|
| I-1 | `t02` `mental-chute-module-bloc` et `t04` `mental-chute-bloc-progressive` | **Deux fiches de peur de la chute en bloc qui se contredisent.** Celle de `t02` fait lâcher « depuis une hauteur où tu restes à l'aise » : pas de hauteur maximale, pas de réception apprise avant, pas d'observateur, et un roulé « sur les fesses ». Celle de `t04` impose la réception d'abord, 50, 80 puis 100 cm au plus, un partenaire, 6 chutes par séance et un roulé « sur le dos ». | Lecture des deux fichiers (`t02` § 3.5 ; `t04` § C2, n° 7). | Abandonner `mental-chute-module-bloc` et garder `mental-chute-bloc-progressive` avec `technique-reception-bloc`. Harmoniser le roulé (voir M-9). |
| I-2 | `t04`, `technique-reception-bloc` | (a) La hauteur de départ (40 à 50 cm) et le nombre de sauts (5 à 6) ne sont écrits que dans `aVerifier`. Ce champ n'est pas affiché à l'écran : la personne ne sait pas de quelle hauteur sauter, ni combien de fois. (b) L'élément « puis un seul pied » introduit une **réception sur un pied**. Aucune source ne la demande : toutes parlent des deux pieds. | FFME 2025, § 2.4 : « se réceptionner sur les pieds, amortir avec les jambes ». The Climbing Doctor (White-Graff) : hauteurs de 16 à 42 pouces ; au-dessus, réception sur deux pieds seulement, sur surface souple. | Retirer « puis un seul pied ». Ajouter un élément « Marche basse : 40 à 50 cm, jamais plus d'1 m ; 6 sauts au plus » (choix de conception, à valider). Garder l'exclusion. |
| I-3 | `t04`, `mental-chute-bloc-progressive` (et l'existant `mental-ecole-de-vol`) | La consigne écrit « Inconfortable, mais pas débordant ». Ce n'est pas la formule de la source, et c'est une dose plus forte que ce qu'elle dit. `t02` (V9) avait d'ailleurs signalé que cette formule ne figure pas sur la page. | Lattice, « Fear of Falling » (avec A. Maguire) : les vols doivent être seulement **légèrement** inconfortables (« slightly uncomfortable »). | Écrire « Légèrement inconfortable, jamais plus. » dans les deux fiches. |
| I-4 | `t02`, `echauffement-court` | Fiche ouverte à la génération, alors que le chercheur montre lui-même (D3) que la vérification S-10 accepte toute fiche `echauffement`. L'échauffement court ferait donc disparaître l'avertissement avant une séance maximale. Toutes ses durées (3, 4, 1 et 10 min) sont des choix de conception, sous les fourchettes des sources (15 à 30 min de grimpe). | `t02`, V3, V4 et décision D3. Schweizer 2012 : 20 à 30 min ; Lytton 2014 : au moins 15 min de grimpe facile ; Hörst : 15 à 30 min avant la poutre. Les trois relus. | `exclureDeLaGeneration: 'À ne pas générer tant que le moteur ne sait pas l’écarter avant une séance maximale (D3).'` Le retirer quand la règle existe et qu'Arthur a validé la décision 6. |
| I-5 | `t02`, `mental-chute-module-voie` | Des vols en tête, avec « 3 à 5 vols », 15 min et 2 séances par semaine, tous non sourcés. La fiche est ouverte à la génération. C'est aussi un doublon partiel de `mental-ecole-de-vol` (mêmes marches, mêmes signaux). | `t02`, `aVerifier` de la fiche. Knatterud (Nicros) : « au moins une fois par semaine pendant quelques mois », sans nombre de vols. | Hors génération jusqu'à validation (décision 9). La présenter comme la **version courte** de l'école de vol, avec la même liste de marches, plutôt que comme un second protocole. |
| I-6 | `t01`, `test-traction-lestee-2rm` | Avec un départ à + 10 %, des paliers de 2,5 kg et 6 essais au plus, la charge la plus haute qu'on peut atteindre est d'environ **128 % du poids du corps** pour 70 kg (77 kg, puis 79,5, 82, 84,5, 87 et 89,5 kg). C'est la moyenne Lattice des V4. Pour un bloqueur 7a, le test s'arrêterait avant l'échec et **sous-estimerait** la force. Ce n'est pas dangereux, mais la courbe et la règle de décision du cycle suivant seraient faussées. | Calcul. Lattice, « predictors for performance » : V4 128 ± 14 %, V8 150 ± 15 %. Gilmore et al. : paliers de 5 kg au plus ; si l'échec n'arrive pas en 8 essais, le test est refait un autre jour en partant plus haut. | Partir du dernier résultat moins 10 %, ou de + 10 % au premier test. Paliers de 5 kg au plus loin du maximum, puis 2,5 kg. 8 essais au plus. Si l'échec n'est pas atteint, refaire le test un autre jour en partant plus haut (Gilmore). |
| I-7 | `t01`, `test-traction-lestee-2rm` et `test-tractions-strictes-max` | Les deux consignes contiennent le mot « strictes ». Le test « aucune consigne ne cache un prérequis » (`/strictes|réservé à/i`) échouerait, donc `npm run test` aussi. | `bibliotheque.test.ts`, ligne 78. | Écrire « tractions propres (bras tendus en bas, menton au-dessus de la barre, sans élan) ». |
| I-8 | `t06`, les trois fiches de résistance en voie | La décision « 1 séance par semaine pour un profil bloc, 2 au plus pour la voie » ne peut pas s'écrire avec `maxParSemaine`, qui compte **par fiche**. Avec Voies doublées (2), Circuits de 30 mouvements (2) et Voies répétées (1), le générateur peut placer jusqu'à **5 séances de résistance en voie** dans une semaine. | `types.ts` : `maxParSemaine` est un champ de chaque fiche. Lattice (Capacity Power, [VER 4]) : 2 séances par semaine au plus. Barrows : 1,5 à 2. | Avant de débloquer, ajouter une règle globale (un marqueur, comme `poutre` et son plafond de 3) : 2 séances de résistance par semaine au plus, 1 pour un profil bloc. |
| I-9 | `t04` `groupe-trois-essais-tour-de-role` et `t06` `resistance-capacity-power` | **Les deux lots se contredisent.** `t06` montre que l'écran ne lit pas `essaisParSerie` ni `reposSeriesS` (`SeanceSolo.tsx`, ligne 92), et propose de les retirer. `t04` crée une fiche qui en dépend : les 240 s entre deux blocs ne seraient jamais affichées. | `src/ecrans/SeanceSolo.tsx:92` : `<Essais reposS={e.reposS} />`, vérifié par recherche dans le code. | Choisir une seule voie pour tout le lot : soit l'option A de `t06` partout (un essai = une série, le repos court est écrit dans la consigne), soit une petite tâche de code qui fait lire `reposSeriesS` à l'écran. Sans risque ici (180 s au lieu de 240), mais il faut trancher avant d'écrire les fiches. |
| I-10 | `t06`, `planche-preparation` et `gainage-ponts-sol` | « Planche » a **trois sens** dans l'appli : la planche d'escalade (`puissance-planche`, et la règle « échauffement complet avant la planche » de `t02`), le gainage en planche (`gainage-ponts-sol` : « planche ventrale ») et la planche de gymnastique. La fiche « Planche : préparation » prête à confusion, pour Arthur comme pour une règle qui chercherait le mot. | `puissance.ts` (`puissance-planche`) ; `t02`, D2 ; `t06`, § 2. | Nommer la fiche « Planche de gymnastique : préparation », avec l'identifiant `gainage-planche-gym-preparation`. Dans `gainage-ponts-sol`, écrire « gainage ventral » et « gainage latéral ». Réserver « planche » seul à la planche d'escalade. |
| I-11 | `t01`, test 2 (repères) et décision 4 | « Lattice précise que ces chiffres ne sont pas des objectifs » est **faux**. Lattice appelle 165 % (hommes) et 135 % (femmes) ses « gold standards », et conseille d'en faire un axe d'entraînement si l'on est en dessous. Le choix de l'appli (« des repères, jamais un objectif ») reste prudent et défendable, mais c'est **notre** choix, pas celui de Lattice. | Lattice, « Is pull-up training a waste of time for climbers? » (O. Torr, 13 août 2026), lu en entier dans le navigateur : « gold standards », et conseil de travailler la traction en dessous de ce niveau. | Corriger la phrase : « Lattice les présente comme des étalons ; l'appli les affiche comme de simples repères (choix de conception) ». Reformuler la décision 3 en conséquence. |

## Constats mineurs

| # | Fichier, fiche | Constat et preuve | Correction |
|---|---|---|---|
| M-1 | `t01`, tractions strictes et suspension bras fléchis | Le choix de conception « au moins 1 traction stricte » est écrit, mais `prerequis: {}`. | `prerequis: { tractionsStrictesMin: 1 }`. |
| M-2 | `t04`, § A9, A14 et liste des sources | La page Nicros `?p=1579` est attribuée à « Eric Hörst ». La signature est celle de **Bryn Knatterud** (4 octobre 2014), Hörst détient seulement le droit d'auteur du site. `t02` avait raison, d'où une contradiction entre les deux lots. | Écrire « Knatterud (Nicros, site de Hörst) » partout. |
| M-3 | `t06`, `gainage-ponts-sol` | `aVerifier` dit « 3 séries pour chaque exercice ». La consigne (deux tours de ventral, latéral gauche, latéral droit) en donne 2 par exercice et par côté, sous les 3 à 4 de l'étude (Sæterbakken 2018 : 3 à 4 séries de 4 à 10 répétitions maximales, 2 min de repos, relu). | Corriger `aVerifier` (2 séries). Ou passer à 3 tours (9 séries) : 1 514 s, soit `dureeMin: 25`. |
| M-4 | `t06`, `front-lever-tenues` | Le critère de passage « 5 tenues de 15 s » ne peut pas se vérifier avec un chrono réglé sur 10 s. Maples le confirme comme critère (5 × 15 s « sans lutter », relu), mais c'est un autre réglage que celui de la fiche. | Dire « quand les 5 tenues de 10 s deviennent faciles, fais un essai de 5 × 15 s avant de changer de variante ». |
| M-5 | `t02`, `mobilite-hanches-module` | « Arrête si tu as mal à l'intérieur du genou » est attribué à Lattice. La page dit seulement de voir un kiné si le grand écart donne mal au genou malgré le renforcement. « Par côté » n'est écrit que pour le rouleau ; la capsule de hanche se fait « des deux côtés ». | Garder la règle d'arrêt, qui est prudente, mais l'indiquer comme notre choix dans `aVerifier`. |
| M-6 | `t01`, test 1 | « Au-delà de 8 essais, test à refaire 24 h plus tard (Lattice) » : le PDF de Lattice ne dit rien de tel (aucun « 24 », aucun « retest »). Seul Gilmore dit de refaire le test un autre jour. Les bords de 18 et 22 mm viennent de l'article Lattice « number 1 measure », pas du PDF. | Retirer « 24 h (Lattice) ». Attribuer les 18 et 22 mm à l'article. |
| M-7 | `t01`, test 5 | « Échauffement non précisé » : la transcription Power Company décrit un échauffement standard (5 min de marche ou de course, 5 min de mobilisation), 24 h de repos complet avant le test et 7 jours entre deux visites. | Le mentionner. C'est utile pour l'échauffement des tests de fin de cycle. |
| M-8 | `t01`, `test-suspension-max-7s-20mm` | `dureeMin: 25` est court : 10 min d'échauffement, 6 à 8 suspensions d'échauffement, puis jusqu'à 8 essais avec 2 min de repos, cela fait plutôt 35 min. | `dureeMin: 35`. |
| M-9 | `t02` et `t04`, réception en bloc | Roulé « sur les fesses » (`t02`, d'après White-Graff, qui dit bien « roll to your butt ») contre roulé « sur le dos » (`t04`). La FFME dit seulement « se laisser rouler en protégeant ses bras ». | Une seule formule : « jambes fléchies, puis roule en arrière, bras rentrés ». |
| M-10 | `t04`, `technique-rappel-securite-bloc` | Ce rappel est une fiche `technique` d'1 min : le générateur pourrait la choisir comme exercice de technique. | Prévoir un affichage avant les séances de bloc. En attendant : `exclureDeLaGeneration: 'Rappel affiché, pas un exercice.'` |
| M-11 | `t04`, OG-19 | « 4 blocs durs, 3 essais max chacun » se confond avec l'OG-12 existant (« 4 blocs jamais faits, 3 essais chacun »). | « 4 blocs déjà réussis, parmi tes plus durs : 3 essais max ». |
| M-12 | `t04`, `groupe-contacts-a-deux` | « Kris Hampton (Climb Strong) » : Hampton est l'entraîneur de Power Company. L'attribution vient de la fiche existante `technique-un-seul-contact` (« Kris Hampton ; Climb Strong »), que je n'ai pas relue. | À vérifier lors de la prochaine relecture de l'existant. |
| M-13 | `t06`, identifiants | `front-lever-tenues`, `planche-preparation` et `arque-mur-prises-faciles` ne suivent pas la règle des fiches existantes (préfixe de la qualité). | `traction-front-lever-tenues`, `gainage-planche-gym-preparation`, `doigts-arque-doux-mur`. |
| M-14 | `t06`, `arque-mur-prises-faciles` | « Légèrement arqués, un peu plus que d'habitude » est flou. C'est pourtant la seule définition qui protège les poulies. Schweizer 2012 (relu) déconseille un arqué prononcé, avec la deuxième articulation (PIP) pliée au-delà de 80 à 90°. | « La deuxième articulation du doigt pliée à angle droit au plus, le pouce jamais posé sur l'index. » |
| M-15 | `t06`, `resistance-circuits-30-mouvements` | `terrain: 'voie'` avec 2 min de repos : en voie, la descente à la moulinette mange une partie du repos. Le chercheur note bien que Barrows ne parle pas de voie. | Dire dans la consigne que la descente fait partie du repos, ou proposer le circuit sur un mur de bloc. |
| M-16 | `t02`, `echauffement-court` | `source.auteur` cite « Power Company » sans précision, alors que le même fichier corrige l'existant pour cette raison. | Écrire « Power Company (Hampton, page sur la planche d'escalade) ». |
| M-17 | `t02`, décision D8 (a) | L'adresse Gripped `?p=47646` n'est **pas** dans la fiche `mental-ecole-de-vol` (qui cite seulement « Gripped », sans adresse). Elle est dans `docs/theorie-entrainement.md`, ligne 252. | Corriger le document de théorie, et retirer « Gripped » de l'auteur de la fiche. |
| M-18 | `t02`, sources | Page Strong Mind indiquée « auteur non indiqué ». La signature est **Angus Kille** (`t04` avait raison). | Corriger. |
| M-19 | `t02`, `mobilite-hanches-module` | « Environ 9 min de tenues par semaine, cohérent avec le seuil de 10 min » : le seuil d'Ingram vaut **par groupe musculaire**. Ici, les tenues de plusieurs exercices sont additionnées. | Écrire « proche du seuil, si l'on compte les adducteurs comme un seul groupe ». |

---

## Tableau des fiches proposées

États : **P** = prête ; **PAC** = prête après correction ; **HG** = hors génération jusqu'à validation ; **A** = à abandonner.

| Identifiant | Lot | État | Motif principal |
|---|---|---|---|
| `test-suspension-max-7s-20mm` | T-01 | HG | B-1, M-6, M-8 |
| `test-traction-lestee-2rm` | T-01 | HG | B-1, I-6, I-7 |
| `test-tractions-strictes-max` | T-01 | PAC | I-7, M-1, exclusion des tests (B-1) |
| `test-suspension-bras-flechis` | T-01 | PAC | M-1 |
| `test-tractions-cadencees-15-par-min` | T-01 | HG | Source secondaire, critère d'arrêt conçu par nous (déjà exclue) |
| `test-endurance-8-blocs-50-min` | T-01 | HG | Source secondaire, sans repère (déjà exclue) |
| `test-mobilite-montee-de-pied` | T-01 | PAC | Exclusion des tests (B-1) ; zone « hanche » (décision 5) |
| `test-mobilite-ecart-debout` | T-01 | PAC | Idem |
| `test-mobilite-epaules-mains-dans-le-dos` | T-01 | HG | Contrôle facultatif, pas de sens de progrès (déjà exclue) |
| `echauffement-court` | T-02 | HG | I-4, M-16 |
| `mobilite-hanches-module` | T-03 | PAC | M-5, M-19 |
| `doigts-bidoigts-module` | T-03 | HG | B-2 |
| `mental-chute-module-voie` | T-03 | HG | I-5 |
| `mental-chute-module-bloc` | T-03 | **A** | I-1 (doublon contradictoire) |
| `groupe-trois-essais-tour-de-role` | T-04 | PAC | I-9, M-11 |
| `groupe-ajout-de-mouvement` | T-04 | P | Règles confirmées (Add-On, 3 à 5 mouvements) |
| `groupe-beta-miroir` | T-04 | P | Perfect Repeat confirmé (5 répétitions, partenaire possible) |
| `groupe-contacts-a-deux` | T-04 | PAC | M-12 |
| `groupe-flash-defi` | T-04 | PAC | `essaisParSerie: 1` sans effet, à retirer (I-9) |
| `technique-reception-bloc` | T-10 | HG | I-2 |
| `mental-chute-bloc-progressive` | T-10 | HG | I-3 ; hauteurs à valider |
| `technique-rappel-securite-bloc` | T-10 | PAC | M-9, M-10 |
| `resistance-capacity-power` (remplacement) | T-06 | P | Volume et repos confirmés [VER 4] ; poser le plafond I-8 avant de retirer l'exclusion |
| `resistance-voies-repetees` | T-06 | P | La Fabrique Verticale relue : 3 à 4 passages, repos égal au temps de la voie, 30 min, second tour |
| `resistance-circuits-30-mouvements` | T-06 | PAC | M-15, I-8 |
| `resistance-pyramide-4-8-12-16` | T-06 | **A** | Repos non rattachés aux blocs (relu : la page ne les associe pas), sur pan |
| `gainage-ponts-sol` | T-08 | PAC | M-3, I-10 |
| `front-lever-tenues` | T-08 | HG | Repos et fréquence non sourcés ; M-4, M-13 |
| `planche-preparation` | T-08 | HG | Prérequis de GMB invérifiables ; I-10, M-13 |
| `arque-mur-prises-faciles` | T-09 | HG | Entièrement conçue par nous ; M-14 ; relecture par un kiné |

Total : 30 fiches, dont 4 P, 11 PAC, 13 HG et 2 A.

Conformité au format : les 30 propositions respectent `Protocole` (champs obligatoires présents, `forme` existante, gabarits `intermittent` et `repetition_unique` réels). Les durées des 5 chronos collent à `dureeMin` à 15 % près : bidoigts 525 s pour 10 min ; circuits 1 325 s pour 22 min ; ponts 971 s pour 16 min ; front lever 535 s pour 10 min ; planche de gymnastique 705 s pour 12 min. Les fiches `maximale` hors bloc limite ont toutes un prérequis, et les fiches sur poutre portent le marqueur `poutre`. Aucun identifiant ne double l'existant, sauf `resistance-capacity-power`, qui remplace volontairement la fiche actuelle. Le seul écart avec les tests est I-7.

## Corrections de l'existant : vérification

| Correction annoncée | Verdict de l'audit | Preuve |
|---|---|---|
| `mental-ecole-de-vol` : « Hörst (Nicros) » devient « Knatterud (Nicros) » | **Confirmée**. Écrire « Knatterud (Nicros, site de Hörst) ». | nicros.com/?p=1579 : signature B. Knatterud, droit d'auteur E. Hörst. |
| Adresse Gripped `?p=47646` pour l'école de vol | **Confirmée** : c'est un article d'échauffement (B. de Bruijn), sans rien sur les chutes. Elle est à retirer de `docs/theorie-entrainement.md`, ligne 252, pas de la fiche (M-17). | gripped.com/?p=47646 |
| `echauffement-general` : « Power Company » ne donne aucun protocole | **Confirmée en partie.** L'épisode sur l'échauffement ne donne aucune durée, mais la page Power Company sur la planche d'escalade donne 15 à 20 min (`t02` l'a lu). Remplacer par « Power Company (avant la planche) », ou par Climb Strong et Hörst (pages Climb Strong non relues ; Hörst relu : 15 à 30 min). | powercompanyclimbing…/breakingbeta/warming-up |
| `doigts-abrahangs` : gain « Abrahangs seul » non significatif | **Confirmée** : + 2,5 % en moyenne, p = 0,12. Les auteurs parlent seulement d'une tendance positive. | PMC11576708 |
| `mental-ecole-de-vol` : « inconfortable mais pas débordant » absent de la page | **Confirmée** (la source dit « légèrement inconfortable ») ; à corriger dans la fiche (I-3). | latticetraining.com/blog/fear-of-falling |
| Synthèse : Nelson pratique l'arqué « à faible charge » | **Confirmée** : suspensions en arqué complet sur 15 et 10 mm jusqu'à l'échec, dans une plage de 40 à 70 % du maximum. Pour les débutants, il propose plutôt une prise ronde, un bac ou une réglette de 35 mm. | trainingbeta.com/?p=23516 |
| Synthèse et fiche de la FFME : « réception genoux fléchis » | **Confirmée** : la FFME écrit « amortir avec les jambes », sans parler de genoux fléchis. | Règles de sécurité FFME 2025, § 2.4 |
| `doigts-reglette-minimale-horst` : « pouce libre » n'est pas écrit chez Hörst | **Confirmée** : Hörst écrit seulement de ne jamais s'entraîner en arqué complet avec le pouce verrouillé. La fiche reste compatible ; c'est mineur. | trainingforclimbing.com/4-fingerboard-strength-protocols-that-work/ |
| Spécification A.5 : le « compteur de Bechtel » n'est pas un test ; OG-06 : la page Lattice est en solo | **Non revérifiées** par l'audit (pages Climb Strong non relues). Le V-Sum (MTI) est en revanche confirmé : 50 min, les 8 blocs les plus durs, un « + » vaut 0,5. | mtntactical.com (V-Sum) |
| Nouvelle, trouvée par l'audit : auteur de Strong Mind | Angus Kille (M-18). | strongmindclimbing.com |

---

## Décisions pour Arthur (liste fusionnée : 15)

Chaque question se répond par oui ou non. Entre parenthèses : la recommandation, puis les questions des chercheurs qu'elle remplace.

**Tests de fin de phase et de fin de cycle**

1. **Les tests ne seront jamais placés dans une séance générée** : seule une fonction « faire mes tests » les proposera. Pour les deux tests maximaux (doigts et traction lestée), on garde les conditions strictes : 2 ans de pratique, poutre régulière, 15 s sur 25 mm, adulte, 10 tractions. D'accord ? (Oui. Remplace t01-2 et une partie de t01-6.)
2. **Tu valides les réglages des tests maximaux qu'aucune source ne chiffre ?** Échauffement : 6 à 8 suspensions de plus en plus lourdes. Traction lestée sur 2 répétitions : départ à ton dernier résultat moins 10 % (+ 10 % la première fois), paliers de 5 kg puis 2,5 kg, 8 essais au plus ; si tu n'as pas échoué, tu refais le test un autre jour. (Oui. Remplace t01-1 et t01-3.)
3. **Afficher les repères de Lattice comme de simples repères, avec l'écart possible, sans jamais les présenter comme un objectif ?** Attention : Lattice, lui, les appelle des « étalons » ; ce sera un choix de l'appli. (Oui. Remplace t01-4.)
4. **Garder les tests de fin de cycle** (suspension bras fléchis, tractions cadencées, 8 blocs en 50 min, montée de pied, écart debout) **pour suivre ta courbe seulement**, sans qu'ils changent le programme suivant, et le test des épaules en contrôle facultatif ? (Oui. Remplace t01-5, t01-6 et t01-7.)

**Douleurs déclarées**

5. **Ajouter « hanche » et « cheville » aux zones de douleur ?** La cheville représente 40 % des blessures de chute en bloc dans l'étude de 2025. (Oui. Remplace t01-8 et t04-3.)

**Échauffement**

6. **Échauffement court de 18 min seulement pour les séances qui ne sont pas un effort maximal.** Avant la poutre intensive, la planche d'escalade, le pan ou le bloc limite, on garde l'échauffement complet, et l'appli t'avertit si tu prends le court. Le court n'est pas proposé automatiquement tant que cet avertissement n'existe pas. D'accord ? (Oui. Remplace D1, D2 et D3.)

**Modules courts**

7. **Bidoigts : commencer au volume de l'étude** (8 tenues à deux doigts, environ 5 min), et ne passer à 16 qu'après plusieurs séances sans douleur, sur ta décision ? L'autre choix, 16 dès le départ, est le double de l'étude. (Oui, commencer à 8. Remplace D4 et D5 ; conditions : 2 ans de pratique et un peu de poutre.)
8. **Module hanches de 12 min, sans rotation externe ni grand écart avant-arrière** (aucune source ne les propose pour l'escalade) ? (Oui. Remplace D6.)

**Peur de la chute**

9. **En voie : garder l'école de vol, avec une version courte de 15 min, 3 à 5 vols à la même marche,** proposée seulement après ta validation ? (Oui. Remplace D7, partie voie.)
10. **En bloc : une seule fiche, « chute par étapes », après la fiche de réception.** Chute volontaire à 50, 80 puis 100 cm au plus (pieds au-dessus du tapis), 6 chutes par séance, 2 séances par semaine, réception sur les deux pieds. Tout cela reste hors génération tant que tu n'as pas validé ces hauteurs. D'accord ? (Oui. Remplace t04-1, t04-2, t04-4 et D7, partie bloc.)
11. **Afficher le rappel de sécurité du bloc avant chaque séance de bloc limite et chaque fiche de chute ?** (Oui. Remplace t04-5.)

**Séances à plusieurs**

12. **Jeux de groupe sans élimination** : manches fixes ; pour le format « trois essais », 4 blocs au lieu des 5 de la source (12 essais durs au plus) ; les objectifs OG-03 et OG-08 sont rattachés aux nouvelles fiches de groupe. D'accord ? (Oui. Remplace t04-6, t04-7, t04-8 et t04-9.)

**Résistance en voie**

13. **Ajouter trois séances de résistance en voie** (Voies doublées, Voies répétées, Circuits de 30 mouvements), **toujours avec un assureur, et 1 séance de résistance par semaine au plus tant que ton profil est « bloc »** (2 si ton objectif devient la voie), et abandonner la pyramide 4-8-12-16 ? (Oui. Remplace t06-1 à t06-6.)

**Gainage, front lever, planche de gymnastique**

14. **Ajouter le gainage au sol comme travail de soutien.** Le front lever et la planche de gymnastique (préparation seulement, sans planche complète) restent en fiches d'essai non générées, sans aucun délai promis, jusqu'à ce que tu valides leurs repos et leur fréquence (2 min, 2 séances par semaine, 8 tractions avant le front lever). On retire l'objectif « planche complète ». D'accord ? (Oui. Remplace t06-7 à t06-10.)

**Arqué**

15. **Arqué : une seule fiche, « arqué doux au mur », jamais proposée automatiquement, et seulement si tu choisis l'objectif « arqués », après relecture par un kiné.** Sinon, on retire l'objectif. D'accord ? (Oui, avec la relecture. Remplace t06-11 et t06-12.)

Les points purement techniques, comme l'étiquette « Synthèse » des jeux (t04-8) ou le choix de laisser les conditions de la planche dans la consigne (t06-10), ne demandent pas Arthur : ils suivent des décisions 12 et 14.

---

## Annexe : chiffres relus à la source

✔ = conforme ; ✘ = non conforme ; ≈ = conforme avec une nuance.

| Fichier | Point | Résultat | Adresse lue |
|---|---|---|---|
| t01 | 7 s à deux bras, bord de 20 mm, demi-arqué ou 4 doigts main ouverte, arqué complet exclu, 4 à 8 essais, 2 min de repos, échec si les doigts bougent | ✔ | Lattice, PDF du protocole (2018) |
| t01 | Refaire le test 24 h plus tard au-delà de 8 essais (Lattice) | ✘ (M-6) | idem |
| t01 | Paliers de 5 kg au plus, 8 essais au plus, sinon un autre jour | ✔ | PMC11576708 |
| t01 | 2 répétitions maximales, 3 min de repos, prise en pronation à la largeur des épaules, charge totale | ✔ | Lattice, « predictors for performance » |
| t01 | Moyennes par cotation de bloc (suspension et traction, V4 à V14) | ✔ | idem |
| t01 | Voie 7a 124 ± 14 … 9a 190 ± 19 ; 436 grimpeurs ; R = 0,66 ; 0,29 chez les avancés | ✔ | Lattice, « number 1 measure » |
| t01 | 733 tests ; 145 % (V7–V8) et 160 % (V9–V10) ; 165 et 135 % ; femmes 137 % | ✔ | Lattice, « pull-ups diminishing returns » |
| t01 | « Ces chiffres ne sont pas des objectifs, selon Lattice » | ✘ (I-11) | idem, lu dans le navigateur |
| t01 | Hörst : 10 tractions d'affilée avant de lester ; départ à + 10 %, paliers de 5 lb ; 3 min au moins dans le 5 × 5 | ✔ | trainingforclimbing.com (hypergravity) |
| t01 | V-Sum : 3 tours d'échauffement de 25 mouvements, 50 min, les 8 plus durs, « + » vaut 0,5 | ✔ | mtntactical.com |
| t01 | Montée de pied : 23 cm ; 3 essais d'habituation et 3 mesurés ; fiabilité 0,93 ; 103,7 et 114 cm ; écart debout 38,2 cm ; variante assise 43,8 cm | ✔ | theclimbingdoctor.com (mobility assessment) |
| t01 | Tractions cadencées : 60 battements par minute, 4 s par traction, 15 par minute | ✔ | Power Company, IRCRA |
| t01 | Échauffement du test « non précisé » | ✘ (M-7) | idem |
| t01 | Bras fléchis : barre de 2,5 cm, prise en pronation, menton au-dessus de la barre ; coefficient 0,894, variation 18 % | ✔ | Stien et al. 2022 |
| t02 | Schweizer : 20 à 30 min ; 3 à 4 voies de 40 mouvements ou 8 à 12 blocs ; 100 à 120 mouvements, jusqu'à + 30 % ; poches : jusqu'à + 50 % ; lombrical | ✔ | smw.ch (Schweizer 2012) |
| t02 | Abrahangs : 10 s / 20 s ; 18 à 22 mm ; pieds au sol ; 6 h entre deux séances ; + 2,5 %, p = 0,12 | ✔ | PMC11576708 |
| t02 | Séquence Lattice du grand écart : 3 × 4 squats cosaques de 8 s ; 3 × 30 s ; 1 à 2 fois par semaine ; 8 à 12 semaines ; charge après 4 à 6 semaines | ✔ | latticetraining.com (side split) |
| t02 | Règle d'arrêt « douleur à l'intérieur du genou » (Lattice) | ≈ (M-5) | idem |
| t02 | Nicros : Knatterud ; 1 fois par semaine pendant quelques mois ; 5 à 6, 10 puis 15 à 20 pieds ; dévers de 30 à 45° | ✔ | nicros.com/?p=1579 |
| t02 | Lytton : au moins 15 min ; rien à moins de 2 cotations du maximum ; 5 à 10 min de repos ; exemple pour un V5 | ✔ | trainingbeta.com (Lytton 2014) |
| t02 | Hooper : 2 à 3 tenues de 10 à 15 s à trois doigts, puis à deux doigts ; 1 à 2 fois par semaine ; après l'échauffement, avant l'arqué | ✔ | Hooper's Beta (copie Squarespace ; l'adresse officielle annoncée est hoopersbeta.com) |
| t02 | Gripped `?p=47646` est un article d'échauffement | ✔ | gripped.com |
| t02 | L'épisode Power Company sur l'échauffement ne donne pas de protocole | ✔ | powercompanyclimbing… /warming-up |
| t04 | Beurienne 2025 : 402 réponses, 245 retenues, 301 blessures ; cheville 40 % ; 85 % de chutes involontaires ; rapports de cotes 0,18 et 0,27 ; fabricant de tapis | ✔ | frontiersin.org (fspor.2025.1609133) |
| t04 | DAV 2025 : 341, 252, 174 accidents ; 155 chutes sur le tapis (89 %) ; 55 et 34 % ; 46 et 27 % ; « abklettern » | ✔ | alpenverein.de |
| t04 | FFME 2025 : § 2.1, 2.4, 2.7 ; pas de « genoux fléchis », pas de hauteur maximale | ✔ | ffme.fr (Règles de sécurité 2025) |
| t04 | White-Graff : 16 à 42 pouces ; au-delà, déconseillé | ✔ | theclimbingdoctor.com |
| t04 | Three Strike : 5 blocs, 3 essais, au moins 3 min, 2 visualisations ; grosses prises d'abord ; 30 min ; remplacer le plus facile | ✔ | lasportivausa.com (deux pages) |
| t04 | Perfect Repeat : 5 répétitions, partenaire possible | ✔ | idem |
| t04 | Flash Challenge : 10 blocs, 5 par joueur, 1 essai, 10 et 5 points | ✔ | theclimbinghangar.com |
| t04 | Add-On : 2 joueurs au moins, 3 à 5 mouvements, variante à 3 vies | ✔ | shedreamsofalpine.com |
| t04 | Strong Mind : auteur Kille ; aucun nombre de vols | ✔ | strongmindclimbing.com |
| t04 | Nicros attribué à Hörst | ✘ (M-2) | nicros.com |
| t04 | Maguire : « légèrement inconfortable » ; signaux d'arrêt ; aucun nombre de vols | ✔ (la fiche s'en écarte, I-3) | latticetraining.com/blog/fear-of-falling |
| t06 | La Fabrique : voie juste sous le niveau maximal à vue, 3 à 4 passages, repos égal au temps de la voie, 30 min, second tour ; pyramide : repos non rattachés ; aucune fréquence | ✔ | lafabriqueverticale.com |
| t06 | Sæterbakken : 19 grimpeurs (18 dans la discussion), 2 fois par semaine pendant 10 semaines, 3 à 4 séries de 4 à 10 répétitions maximales, 2 min ; tenues de 3 à 5 s, 3 s de pause ; blocage + 10,6 % (p = 0,192) ; levée du corps + 29,6 % (p = 0,037) | ✔ | journals.plos.org |
| t06 | Maples : 5 tractions, 30 s à l'envers, 10 V-ups ; 5 × 15 s ; aucun repos ni fréquence | ✔ | 12minuteathlete.com |
| t06 | GMB, planche de gymnastique : prérequis ; 5 × 20 s ; 2 à 3 min ; 3 jours par semaine, puis 4 après environ 2 mois ; de 6 mois à 2 ans ; poignets | ✔ | gmb.io/planche |
| t06 | Hörst : jamais d'arqué complet avec le pouce verrouillé ; 15 à 30 min d'échauffement ; poches de 20 à 30 mm (7-53) | ✔ | trainingforclimbing.com (4 protocols) |
| t06 | Nelson : arqué complet sur 15 et 10 mm jusqu'à l'échec ; 30 à 45 s ; 40 à 70 % ; articulations douloureuses ; 35 mm pour les débutants | ✔ | trainingbeta.com/?p=23516 |
| t06 | Schweizer : 3 à 4 fois la force au bout du doigt ; PIP au-delà de 80 à 90° ; A2 1,5 à 2 fois plus touchée que l'A4 | ✔ | smw.ch |
| t06 | L'écran des essais ne lit que `reposS` | ✔ | `src/ecrans/SeanceSolo.tsx:92` |

**Droits d'auteur.** Aucun des quatre fichiers ne recopie un passage de plus de 15 mots d'une source : les citations entre guillemets sont des titres, des phrases de nos propres documents ou de courtes formules traduites (celle de la FFME, la plus longue, fait 14 mots). Les livres *Escalade Training* et *Guide de l'alimentation du grimpeur* sont signalés comme non lus dans `t01`, `t02` et `t04`, et rien ne leur est attribué. `t06` ne les cite pas, et ne cite *Overcoming Gravity* et le *Rock Climber's Training Manual* que par leur titre.
