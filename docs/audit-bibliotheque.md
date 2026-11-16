# Audit de la bibliothèque de protocoles (lot 4)

Audit du 16 novembre 2026. Périmètre : `src/donnees/bibliotheque/` (60 fiches, 10 fichiers), `src/chrono/sequence.ts`, la synthèse théorique et `docs/verifications.md`. Aucun fichier du dépôt n'a été modifié.

## Verdict

1. **Oui, la bibliothèque peut servir de base aux séances générées, mais pas en l'état** : les valeurs de chrono sont fidèles aux sources (28 chronos recalculés, aucun écart de durée), le ton est tenu, aucun conseil de poids.
2. **Condition 1** : corriger les 4 constats bloquants. Tous ont la même racine : des prérequis écrits en phrases dans la consigne (« 10 tractions strictes », « 15 à 20 tractions ») que le générateur ne peut pas lire, et des protocoles intensifs sans marqueur ni prérequis suffisant.
3. **Condition 2** : ajouter à `types.ts` les champs de la dernière section (tractions strictes, test 15 s sur 25 mm, niveau, majorité, contexte corde/partenaire, repos entre séries pour la forme `essais`) avant d'écrire le générateur, puis traiter les constats importants.

Décompte : **4 bloquants, 15 importants, 17 mineurs**.

## Méthode et limites

- Les 28 fiches de forme `chrono` ont été passées dans `construireSequence` (script hors dépôt) : nombre d'efforts, repos, durée totale comparés à la consigne, au `resume`, au `dureeMin` et à la source. Tableau complet en annexe.
- Deux vérifications à la source n'ont pas pu être faites (demande de lecture web restée sans réponse) : les quatre exercices du protocole de Stien et al. 2021, et le détail du protocole F80 de Devise et al. 2022. Les constats I-9 et I-10 le signalent.
- Les corrections de prérequis proposées (seuils en années, tractions, niveau) qui ne viennent pas d'une source sont marquées « posé par l'audit » : elles devront figurer dans `aVerifier`.

## Constats

### Bloquants

| # | Protocole | Constat | Correction proposée |
|---|---|---|---|
| B-1 | `traction-lestee-force-lattice`, `traction-lestee-5x5-horst`, `puissance-bloc-sans-pieds` | Prérequis de Hörst écrits seulement dans la consigne (« Il faut faire 10 tractions strictes avant de lester », « Réservé à qui fait 15 à 20 tractions strictes ») alors que `prerequis: {}`. Le générateur proposera donc du lest maximal (marqueur `maximale`) et du bloc sans pieds à n'importe quel profil. Le test « poutre intensive et pan Güllich ont toujours un prérequis » ne couvre pas `maximale`. | Ajouter le champ `tractionsStrictesMin` (voir dernière section). Tractions lestées : `prerequis: { anneesPratiqueMin: 2, tractionsStrictesMin: 10 }`. Bloc sans pieds : `prerequis: { anneesPratiqueMin: 2, tractionsStrictesMin: 15 }`. Étendre le test : toute fiche `maximale` hors `bloc_limite` doit avoir un prérequis non vide. Tant que le profil n'a pas la donnée, considérer le prérequis comme non rempli. |
| B-2 | `puissance-bloc-sans-pieds` | Aucun marqueur (`marqueurs: []`) pour un travail sans pieds en grands mouvements rapides, de même nature que le pan Güllich. Il échappe à la règle des 48 h et peut être placé la veille ou le lendemain d'un bloc limite. La consigne ne donne aucun garde-fou de réception. | `marqueurs: ['maximale']`. `contreIndications: ['doigts', 'poignet', 'coude', 'epaule']`. Consigne : « Un bloc 5 à 6 cotations sous ton maximum, sur grosses prises, grimpé sans les pieds, en grands mouvements rapides. Ne réceptionne jamais bras tendus. Arrête à la moindre douleur d’épaule ou de coude. » (les deux dernières phrases sont transposées des règles du pan Güllich : le dire dans `aVerifier`). |
| B-3 | `doigts-reglette-minimale-horst` | Protocole maximal (`maximale`, `poutre_intensive`, `arque` ; réglette « tenue tout juste 15 s », effort 9 sur 10, 10 suspensions) ouvert avec `prerequis: { anneesPratiqueMin: 1 }` seulement, donc à un grimpeur d'un an sans aucune expérience de poutre. La fiche López équivalente, moins volumineuse (3 suspensions), exige 2 ans et une expérience `occasionnelle`. Incohérent, et contraire à « valeurs par défaut prudentes ». | `prerequis: { anneesPratiqueMin: 2, experiencePoutreMin: 'occasionnelle', test15sSur25mm: true }`. Dans `progression`, remplacer « Porte d’entrée avant le lest » par « Étape avant le lest, après un premier cycle d’échelles 3-6-9 ». |
| B-4 | `resistance-poutre-20-40` | Trois défauts cumulés. (a) Consigne « Tiens autant de répétitions que possible dans le tour » : pousse à l'échec sur poutre, sans garde-fou, et contredit le chrono qui en compte 6. (b) Pas de marqueur `poutre_intensive` : 12 suspensions de 20 s (240 s sous tension) ne comptent pas dans le quota de 2 par semaine. (c) `prerequis: { anneesPratiqueMin: 1 }` sans expérience de poutre. | `marqueurs: ['poutre_intensive']`. `prerequis: { anneesPratiqueMin: 2, experiencePoutreMin: 'occasionnelle' }`. Consigne : « 20 s de suspension à deux mains, 40 s de repos, sans lest, sur une bonne prise (20 mm ou plus). Six suspensions par tour. Arrête le tour dès que tu ne tiens plus 20 s ou que tes épaules se relâchent : ne va pas jusqu’à lâcher. » `maxParSemaine: 1` reste juste. |

### Importants

| # | Protocole | Constat | Correction proposée |
|---|---|---|---|
| I-1 | `resistance-boulder-triples`, `resistance-capacity-power` | Adresse `LATTICE_UKC = …/articles/page.php?id=11352`. `docs/verifications.md` (point 4) note que ce lien court renvoie vers un autre contenu (gainage et souplesse). | `const LATTICE_UKC = 'https://www.ukclimbing.com/articles/features/lattice_training_series_with_tom_randall_-_part_2_power_endurance-11352'`. |
| I-2 | `resistance-capacity-power`, `technique-volume-blocs` | Forme `essais` avec un seul `reposS`. L'écran lancera 60 s (resp. 2 min) après chaque passage, y compris là où la source prescrit 10 min entre séries (resp. 5 min entre blocs). Le repos long n'existe que dans la consigne. Pour « Voies doublées », c'est le repos qui protège : une séance générée serait fausse d'un facteur 10. | Ajouter `reposSeriesS` et `essaisParSerie` à la forme `essais` (dernière section). Capacity power : `reposS: 60, essaisParSerie: 2, reposSeriesS: 600`. Volume de blocs : `reposS: 120, essaisParSerie: 4, reposSeriesS: 300`. En attendant, exclure `resistance-capacity-power` de la génération. |
| I-3 | `puissance-intervalles-force` | `marqueurs: []` pour la séance de force de Lattice : 18 passages « à fond », une à deux cotations sous le maximum, 60 min. La synthèse range le « pan dur » et le bloc de force parmi les séances maximales soumises aux 48 h. Sans marqueur, le générateur peut l'accoler à un bloc limite. | `marqueurs: ['maximale']` (pas `bloc_limite`, pour garder les deux types distincts comme le demande la synthèse). |
| I-4 | `traction-blocages-90-120` | Tenues de 10 s à « 80 à 90 % de ton maximum » sans marqueur `maximale`, avec `prerequis: {}`, et sans dire comment régler la charge (lest ? un bras ?). Un débutant ne peut pas appliquer la consigne ; un grimpeur fort la lira comme « leste-toi ». | `marqueurs: ['maximale']`. Consigne : « Bloque 10 s, coude à 90°, quatre fois, puis quatre fois coude à 120°. Effort dur mais tenu sans trembler (8 sur 10) : élastique si tu ne tiens pas 10 s, lest seulement si tu fais 10 tractions strictes. Évite les blocages très fermés. » Ajouter à `aVerifier` : « Réglage de la charge par l’effort perçu : posé par nous ; la source dit 80 à 90 % du maximum. » |
| I-5 | `traction-simple-4x5`, `traction-prises-decalees` | 4 × 5 : « assistées par un élastique ou lestées » avec `prerequis: {}` ; la version lestée contourne le seuil de 10 tractions. Prises décalées : exercice vers le blocage à un bras, `prerequis: {}`. | 4 × 5, consigne : « 4 séries de 5 tractions, avec un élastique si besoin. Choisis une aide qui te laisse finir toutes les répétitions proprement. Lest seulement si tu fais 10 tractions strictes. » Prises décalées : `prerequis: { tractionsStrictesMin: 10 }` (posé par l'audit, à inscrire dans `aVerifier`). |
| I-6 | `traction-lestee-force-lattice` | `progression` : « sous le repère de Lattice (environ 145 à 165 % du poids du corps sur 2 répétitions) ». Deux pièges : le lecteur peut comprendre « lest = 145 % » alors qu'il s'agit de la charge totale (précision présente seulement dans `aVerifier`) ; et 165 % est le repère hommes, celui des femmes est 135 % (vérification 3). Par ailleurs `aVerifier` écrit « 145 % vers 7A-7A+ » alors que la source dit V7–V8, soit 7A+ à 7B. | `progression` : « Commence avec moins de séries, monte à 5, puis augmente la charge à effort constant. Repère de Lattice sur 2 répétitions, corps plus lest : environ 135 % de ton poids pour une femme, 145 à 165 % pour un homme. Au-delà, travaille plutôt autre chose. » Dans `aVerifier`, remplacer « vers 7A-7A+ » par « vers 7A+ à 7B ». |
| I-7 | `doigts-7-13-bechtel` | 54 suspensions de 7 s (378 s sous tension, 32 min) sur réglette, trou et pince, ouvertes à `anneesPratiqueMin: 1` sans expérience de poutre, 3 fois par semaine, sans marqueur. La source ne donne pas la charge ; « poids du corps » est notre choix, et rien ne garantit qu'une suspension sur trou soit « loin de l'échec » pour ce profil. La synthèse demande d'étiqueter les trous. | `prerequis: { anneesPratiqueMin: 2, experiencePoutreMin: 'occasionnelle' }`, `maxParSemaine: 2`. Ajouter à la consigne : « Trou à trois doigts, jamais en bidoigt. Si une prise n’est pas confortable, pose un pied sur une chaise. » Ajouter le marqueur `trou` (dernière section). |
| I-8 | `doigts-echelles-3-6-9`, `doigts-plan-simple-bechtel` | `maxParSemaine: 3` et aucun marqueur : rien ne plafonne le total de séances de poutre. Le générateur peut empiler 3 séances d'échelles et 2 intensives, soit 5 jours de poutre, alors que Hörst fixe 4 jours de sollicitation des doigts au plus et que Bechtel limite à une courte séance par semaine entre 1 et 4 ans de pratique, 2 entre 4 et 6 ans. Par ailleurs `contreIndications` omet `coude` (suspension bras tendus), présent sur toutes les autres fiches de poutre. | `maxParSemaine: 2` sur les deux fiches. `contreIndications: ['doigts', 'coude', 'epaule']` (aussi sur `doigts-7-13-bechtel`). Ajouter le marqueur `poutre` à toute fiche sur poutre (dernière section) et une règle « 3 séances de poutre par semaine au plus, tous types confondus » (posé par l'audit). |
| I-9 | `puissance-pan-gullich-stien` | Consigne non exécutable : « Quatre exercices de pan » sans dire lesquels. La synthèse ne les nomme pas non plus ; la relecture de l'article n'a pas pu être faite pendant l'audit. Aucun `aVerifier`. | Exclure la fiche de la génération tant que les quatre exercices ne sont pas relus dans Stien et al. 2021 et listés. Ajouter `aVerifier: 'Les quatre exercices ne sont pas nommés dans la synthèse : à relire dans l’article avant usage. Repos de 3 min retenu dans la plage 2 à 3 min.'` |
| I-10 | `doigts-intermittent-80-devise` | Trois valeurs posées sans `aVerifier` : 12 répétitions fixes (la source dit « jusqu'à 12 »), le sens de ce compte (par main ou au total) et la façon de régler 80 % d'un maximum à une main que l'app ne mesure pas. La consigne « 10 s de traction à une main » est ambiguë (suspension ou traction ?). Le chrono n'indique pas le changement de main. Détail du protocole non relu à la source pendant l'audit. | Ajouter `aVerifier: 'Nombre de répétitions (12, la source dit « jusqu’à 12 »), compte par main ou au total, et réglage des 80 % : à relire dans l’article.'` Exclure de la génération jusque-là. Consigne : « Suspension de 10 s à une main sur 12 mm, allégée par une poulie ou un pied au sol, puis 6 s pour changer de main. » |
| I-11 | `doigts-7-53-horst`, `doigts-suspensions-intermittentes-lopez` | Repos sous 3 min entre efforts proches du maximum : 53 s (7-53, marqué `maximale`) et 20 s (intermittentes, « tu frôles l'échec »). C'est fidèle aux sources, mais contraire à la règle de l'app et non signalé : une règle automatique « 3 min entre efforts maximaux » les casserait ou les laisserait passer sans avertir. | Garder les valeurs. 7-53 : ajouter à `aVerifier` « Exception voulue à la règle des 3 min : les 53 s sont le protocole de Hörst. » Intermittentes : remplacer la dernière phrase de la consigne par « Garde de la marge sur les deux premières séries ; seule la dernière suspension de la dernière série peut être très dure. » |
| I-12 | `antagonistes-lattice`, `antagonistes-legers` | `contreIndications: []` pour des pompes, dips et développés : une douleur d'épaule, de coude ou de poignet déclarée n'écarte rien. | `contreIndications: ['epaule', 'coude', 'poignet']` sur les deux fiches. Dans `antagonistes-lattice`, premier élément : « Pompes ou développé couché » en tête, « dips » retiré de la liste par défaut (plus exigeant pour l'épaule ; posé par l'audit). |
| I-13 | `mental-ecole-de-vol`, `endurance-4x4-voies`, `endurance-volume-voies`, `resistance-capacity-power`, `technique-faire-la-course`, `technique-lecture-a-vue`, `technique-apres-travail`, `mental-bilan-a-vue` | Fiches qui exigent une corde, un assureur ou la grimpe en tête, sans aucun champ qui le dise. Le générateur les proposera à un bloqueur seul dans une salle de bloc. Pour l'école de vol, la condition de sécurité (« seulement si tu sais tomber en tête, assureur formé ») n'existe qu'en texte. | Ajouter le champ `contexte` (dernière section). École de vol : `contexte: { terrain: 'voie', partenaire: true, grimpeEnTete: true }`. Les autres : `contexte: { terrain: 'voie' }`. |
| I-14 | `doigts-reglette-minimale-lopez`, `doigts-suspensions-max-lestees` | Progression « 3 séries en semaine 1, 4 en semaine 2, 5 ensuite » : `docs/verifications.md` (point 9) dit qu'elle n'a pas été retrouvée à la source. Aucun `aVerifier`. Le repos est fixé à 180 s, borne basse de la plage « 3 à 5 min », sans le dire. Prérequis de López absents : tenir 15 s sur 25 mm, 16 ans révolus. | Ajouter sur les deux fiches `aVerifier: 'Progression 3, 4, 5 séries : non retrouvée à la source lors de la vérification. Repos de 3 min : borne basse de la plage 3 à 5 min de López.'` Ajouter `test15sSur25mm: true` aux prérequis. Lestées : `progression` chiffrée, « ajoute 1,25 à 2,5 kg » au lieu de « un peu de charge ». |
| I-15 | `resistance-pan-pieds-poses` | Travail sur pan Güllich (30 s d'échelles, 10 séries) sans marqueur `pan_gullich`, sans `epaule` ni `poignet` en contre-indication, ouvert dès 1 an. Il ne compte dans aucun cumul de pan. | `marqueurs: ['pan_gullich']`, `contreIndications: ['doigts', 'poignet', 'coude', 'epaule']`, `prerequis: { anneesPratiqueMin: 2 }`. Si le marqueur `pan_gullich` déclenche une règle « adultes, très expérimentés », créer plutôt le marqueur `pan` (dernière section). |

### Mineurs

| # | Protocole | Constat | Correction proposée |
|---|---|---|---|
| M-1 | `doigts-abrahangs` | `preuve: 'Étude'` pour une analyse rétrospective non randomisée, dont le gain seul n'est pas significatif (p = 0,12) et dont les auteurs sont liés au protocole. Pas de `maxParSemaine`. `progression` contient une règle de placement (6 h d'écart). | `source.auteur: 'Gilmore et al., 2024 (étude observationnelle non randomisée, auteurs liés au protocole)'`. Déplacer « Laisse au moins 6 h avec toute autre séance. » dans la consigne. |
| M-2 | `technique-lecture-a-vue` | `preuve: 'Étude'` : l'étude de Sanchez ne fonde que les 3 minutes (et ne trouve pas d'effet sur la réussite) ; le contenu de la consigne vient de Berry, un coach. | `preuve: 'Avis de coach'`, `source.auteur: 'Berry (UKClimbing) ; durée de 3 min d’après Sanchez et al., 2012'`. |
| M-3 | `doigts-plan-simple-bechtel` | Le choix de la prise (« tenue 15 s avec de la marge ») n'est que dans `aVerifier`, invisible à l'écran. `progression` propose « ajoute un peu de charge » à un profil sans expérience. | `detail: 'Poids du corps · prise tenue 15 s avec de la marge'`. `progression` : « 8 séances, 2 par semaine. Si c’est facile, prends une prise un peu plus petite ; le lest (environ 2 kg) seulement après ces 8 séances. » |
| M-4 | `doigts-density-hangs-nelson` | « 40 à 70 % de ton maximum » : au poids du corps, un bloqueur 7A est déjà vers 70 à 80 % de son maximum sur 20 mm (repères Lattice de la synthèse). La consigne ne dit pas comment alléger. Nom en anglais. | Consigne : « Tiens 30 s sur une prise, sans glisser, en gardant de la marge : allège avec un pied sur une chaise ou une poulie. À placer loin de la grimpe, ni juste avant ni juste après. » `nom: 'Suspensions longues'`. |
| M-5 | `puissance-tractions-rapides-nelson` | « 60 à 70 % de ton maximum » sans dire de quel maximum ; « la vitesse baisse de 10 à 20 % » n'est pas mesurable sans capteur. | Consigne : « 3 à 4 tractions rapides, nettement plus légères que ton maximum : au poids du corps, ou à l’élastique si tu fais moins de 10 tractions. Arrête dès que tu sens la vitesse baisser. » |
| M-6 | `doigts-reglette-minimale-horst` | « arqué ouvert » : jargon non expliqué, proche de « semi-arqué » pour un lecteur non initié. | « … seconde en arqué ouvert (doigts fléchis, pouce libre, jamais posé sur l’index). » |
| M-7 | `puissance-pan-gullich-initiation` | « Échelles 1-2-3-4-5 puis 1-3-5 » non expliqué ; taille des réglettes absente ; la source dit « jusqu'à l'échec », la fiche (à raison) ne le reprend pas mais ne le signale pas. | Consigne : « Monte barreau par barreau (1-2-3-4-5), puis un barreau sur deux (1-3-5), sur grosses réglettes de 20 à 25 mm. En début de séance, jamais fatigué. Ne réceptionne jamais bras tendus. Arrête à la moindre douleur d’articulation ou de tendon. » Ajouter `aVerifier: 'La source va jusqu’à l’échec : nous arrêtons avant, par prudence. Repos de 3 min dans la plage 2 à 3 min.'` L'âge passe dans `prerequis` (dernière section). |
| M-8 | `puissance-bloc-limite`, `puissance-planche` | `prerequis: {}` : bloc limite proposé dès le premier mois ; planche sans niveau minimal. Les règles d'arrêt du bloc limite sont rangées dans `progression`. | Bloc limite : `prerequis: { anneesPratiqueMin: 1 }`, et déplacer « Fin du bloc si deux essais de suite sont nettement moins bons que le meilleur » dans la consigne. Planche : `prerequis: { anneesPratiqueMin: 2, niveauBlocMin: '6B' }` (posé par l'audit). |
| M-9 | `resistance-enchainement-deux-blocs`, `resistance-pan-pieds-poses` | `resume` « 4 séries » / « 10 séries », mais la configuration compte en `repetitions` (`series: 1`) : l'écran affichera « répétition 3 sur 4 ». | `resume: '4 passages'` et `resume: '10 passages'`, ou inverser dans la config (`gabarit: 'repetition_unique'` avec `series: 4, reposSeriesS: 300` ; `series: 10, reposSeriesS: 60`). Durées inchangées. |
| M-10 | `resistance-capacity-power` | `resume: '2 × 5'` illisible. | `resume: '5 séries de 2'`. |
| M-11 | `endurance-volume-voies` | `dureeMin: 80` sous-estimé : 6 séries de deux voies (environ 8 min) et 5 repos de 10 min font environ 100 min. | `dureeMin: 100`. |
| M-12 | `endurance-4x4-voies` | Le nom annonce 4 × 4, la consigne et le résumé disent 3 × 3 (première séance du cycle). | `nom: 'Séries de voies faciles (vers le 4 × 4)'`. |
| M-13 | `technique-formes-de-hanches`, `gainage-blocs-pieds-colles`, `echauffement-doigts-poutre` | Valeurs posées sans mention : repos de 2 min et 15 min (formes de hanches) ; « suspensions de 5 à 7 s » attribuées à López alors qu'elles viennent de la routine de la synthèse. | Formes de hanches : `aVerifier: 'La source ne donne ni repos ni durée : nous posons 2 min entre passages et 15 min.'` Échauffement des doigts : compléter `aVerifier` par « Durée de 5 à 7 s : proposition de la synthèse, pas de López. » |
| M-14 | `echauffement-doigts-poutre` | Consigne « après 15 à 30 min de grimpe facile », puis élément « 6 à 8 suspensions si tu n’as pas grimpé avant » : contradictoire. | Consigne : « Juste avant une séance de poutre, si possible après 15 à 30 min de grimpe facile. La dernière suspension te dit la charge du jour. » |
| M-15 | `antagonistes-lattice`, `mental-ecole-de-vol` | Consignes de trois phrases et plus (243 caractères pour les antagonistes) alors que `types.ts` demande une ou deux phrases. | Antagonistes : « Après une séance de grimpe, pas un jour de repos. Quatre exercices en circuit, trois tours, en gardant quelques répétitions en réserve. » École de vol : déplacer « Inconfortable, mais pas débordant. » en dernier élément de la liste. |
| M-16 | `traction-lestee-force-lattice` | « Fais-les frais, après la grimpe ou en séance séparée » se lit comme une contradiction. | « En séance séparée, ou après la grimpe si tu es encore frais. Jamais juste avant de grimper. » |
| M-17 | `puissance-bloc-sans-pieds` | `source.auteur` cite le prérequis de Hörst sans son adresse. | Ajouter à `aVerifier` : « Prérequis de 15 à 20 tractions : Hörst, https://trainingforclimbing.com/?p=4721. » |

### Points contrôlés sans constat

- Ton : aucun point d'exclamation, aucune apostrophe droite, tutoiement partout, aucun vouvoiement.
- Aucun conseil de perte de poids ; « poids du corps » ne sert qu'à exprimer une charge.
- `maxParSemaine` : 2 sur toutes les fiches `poutre_intensive`, `bloc_limite` et `pan_gullich`.
- Repos des fiches `maximale` de forme `essais` ou à suspension unique : 180 à 240 s, dans la règle.
- Résistance : `doigts` et `coude` en contre-indication partout, comme le demande la synthèse.
- Échelles 3-6-9, plan simple, 7-53, repeaters, Abrahangs, Barrows, Boulder Triples, 1 min / 1 min, 5 × 3, antagonistes, grand écart, échauffement : valeurs conformes à la synthèse et aux vérifications.

## Couverture

### Une option sûre par qualité pour qui débute la poutre (bloc 7A, 4 ans, expérience « aucune »)

| Qualité | Option sûre aujourd'hui | Remarque |
|---|---|---|
| Doigts | `doigts-echelles-3-6-9`, `doigts-plan-simple-bechtel`, `doigts-abrahangs` | Suffisant. Après B-3, plus aucune fiche maximale n'est ouverte à « aucune » : c'est voulu. Manque le chemin de passage : rien ne dit quand `experiencePoutre` passe à « occasionnelle » (proposition : après un cycle complet de 8 semaines d'échelles, au choix de l'utilisateur). |
| Traction et gainage | `traction-simple-4x5`, `traction-negatives`, `gainage-blocs-pieds-colles` | Suffisant après I-5. Aucun gainage hors mur (utile en séance à la maison). |
| Puissance | `puissance-bloc-limite`, `puissance-tractions-explosives` | Suffisant. Le pan Güllich reste fermé à ce profil, ce qui est prudent. |
| Résistance | `resistance-boulder-triples`, `resistance-a-la-minute`, `resistance-4x4-blocs` | Suffisant, tout en bloc. |
| Endurance | `endurance-continuite-fin-de-seance`, `endurance-1-on-1-off`, `endurance-arc` | Suffisant ; faisables en traversée dans une salle de bloc. |
| Technique, mental, antagonistes, mobilité, échauffement | Toutes les fiches sauf celles à corde | Voir manques ci-dessous. |

### Ce qui manque pour composer des séances solo

- **Peur en bloc** : la seule fiche mentale d'exposition est l'école de vol, sur corde. Rien pour la chute et la réception en bloc (la synthèse note qu'elle n'a rien trouvé de sourcé : à assumer comme proposition du projet ou à laisser vide, mais le dire).
- **Sécurité du bloc** : aucun rappel « tapis dégagé, désescalade quand c'est possible, réception genoux fléchis », pourtant demandé par la synthèse. À ajouter comme élément de `echauffement-general` ou comme consigne commune aux fiches `bloc_limite`.
- **Échauffement court** : le seul échauffement de grimpe dure 35 min. Il manque une version de 15 à 20 min pour une séance d'une heure (le dynamique de Vagy ne contient pas de grimpe).
- **Technique en bloc** : fiches de la synthèse non reprises et utiles au profil : « Trois essais » (lecture et flash), « Prévision de méthode », « Paresseux puis singe », « Survol ».
- **Maison sans mur** : seules les Abrahangs, les antagonistes et la mobilité se font hors salle. Aucun champ ne permet de le savoir (voir `contexte.lieu`).
- **Retour au calme** : aucune fiche ; `endurance-regeneration-5x3` peut en tenir lieu.

### Ce qui manque pour composer des séances en groupe

- Aucun champ ne dit si une fiche se prête au groupe. Les chronos de poutre isolent chacun sur son téléphone ; les fiches `essais` en bloc s'y prêtent naturellement (repos pris pendant l'essai des autres).
- Aucun format collectif : tour de rôle sur un même bloc, bloc imposé par un partenaire, observateur qui compte les fautes de pied (« Comptage des contacts de pied » de la synthèse, non repris), méthode imposée.
- L'équivalent groupe d'un objectif personnel (`objectifGroupeId` du modèle de données) n'a aucune fiche à pointer.
- Proposition minimale : ajouter `contexte.groupe: 'adapte' | 'seul'` et trois fiches `essais` de groupe (bloc à tour de rôle, bloc imposé, comptage des pieds à deux).

## Champs à ajouter à types.ts

Forme sobre : tout est facultatif, « absent = pas de condition », comme aujourd'hui. Les noms reprennent ceux de `docs/modele-donnees.md` quand ils existent (`test15sSur25mm`, `tractionsMin` y figure déjà sous ce nom pour `ObjectifPerso` : choisir un seul des deux noms).

```ts
/** Étiquettes utilisées par les règles de sécurité. */
export type Marqueur =
  | 'maximale' | 'poutre_intensive' | 'bloc_limite' | 'pan_gullich' | 'arque' | 'bidoigts'
  | 'poutre' // toute séance sur poutre, intensive ou non : sert à plafonner le total par semaine
  | 'trou'   // la synthèse demande d’étiqueter les trous pour en limiter le cumul
  | 'pan'    // travail sur pan Güllich pieds posés, sans les contraintes du pan sans pieds

/** À qui le proposer. Absent = pas de condition. Une donnée inconnue du profil vaut « non rempli ». */
export interface Prerequis {
  anneesPratiqueMin?: number
  experiencePoutreMin?: 'occasionnelle' | 'reguliere'
  tractionsStrictesMin?: number // 10 pour lester, 15 pour le sans-pieds (Hörst)
  test15sSur25mm?: true         // tenir 15 s sur 25 mm : entrée des protocoles maximaux et lestés (López)
  niveauBlocMin?: string        // cotation Fontainebleau, "6B" ; comparée grâce à COTATIONS_BLOC
  adulte?: true                 // 18 ans révolus : pan Güllich et lest (BMC, Lattice)
}

/** Où et avec qui l’exercice est faisable. Absent = partout, seul. */
export interface Contexte {
  terrain?: 'bloc' | 'voie' | 'poutre' | 'pan' | 'barre' | 'sol'
  partenaire?: true     // assureur ou observateur indispensable
  grimpeEnTete?: true   // école de vol
  groupe?: 'adapte' | 'seul' // se prête à une séance à plusieurs, ou isole chacun
}

export type Forme =
  | { forme: 'chrono'; config: ConfigChrono; mot: string; detail: string }
  | { forme: 'liste'; elements: string[] }
  // essaisParSerie et reposSeriesS : pour un repos long tous les N essais (5 séries de 2, 4 blocs × 4)
  | { forme: 'essais'; reposS: number; essaisParSerie?: number; reposSeriesS?: number }

// Dans Protocole :
//   prerequis: Prerequis
//   contexte?: Contexte
//   exclureDeLaGeneration?: string // raison ; présent tant qu’une valeur clé reste à vérifier (I-9, I-10)
```

Côté `Profil` (`src/donnees/profil.ts`), trois données manquent pour appliquer ces prérequis ; toutes facultatives, à demander seulement quand un protocole en dépend :

```ts
  tractionsStrictesMax: number | null // null = pas encore testé
  test15sSur25mm: boolean | null      // déjà prévu dans docs/modele-donnees.md
  adulte: boolean                     // une case « J’ai 18 ans ou plus », pas de date de naissance
  grimpeEnTete: boolean               // ouvre l’école de vol et les fiches en voie
```

Tests à ajouter dans `bibliotheque.test.ts` :

- toute fiche `maximale` qui n'est pas `bloc_limite` a un prérequis non vide ;
- toute fiche dont le `terrain` est `poutre` porte le marqueur `poutre` ;
- toute fiche `pan_gullich` a `adulte: true` ;
- aucune consigne ne contient « strictes » ou « Réservé à » (un prérequis écrit en phrase signale un champ oublié) ;
- la tolérance de durée passe de 50 % à 15 % : tous les chronos actuels tiennent déjà dans 5 %.

## Annexe : chronos recalculés

Durée totale = 5 s de préparation comprises. Toutes les valeurs concordent avec `dureeMin` (écart maximal : 0,4 min).

| Protocole | Efforts | Repos (s) | Total | `dureeMin` | Conforme à la source |
|---|---|---|---|---|---|
| `doigts-echelles-3-6-9` | 27 (9 échelles de 3-6-9 s) | 6 dans l'échelle, 15 après | 6 min 35 | 7 | Oui (créneau de 45 s par échelle) |
| `doigts-plan-simple-bechtel` | 12 (4 tours de 5-10-15 s) | 25, 20, puis 15 | 5 min 50 | 6 | Oui (tours de 90 s) |
| `doigts-7-13-bechtel` | 54 (9 × 6 × 7 s) | 13 / 120 | 32 min 08 | 32 | Oui |
| `doigts-abrahangs` | 20 × 10 s | 20 | 9 min 45 | 10 | Oui |
| `doigts-reglette-minimale-horst` | 10 (2 × 5 × 12 s) | 180 / 300 | 31 min 05 | 31 | Oui |
| `doigts-reglette-minimale-lopez` | 3 × 10 s | 180 | 6 min 35 | 7 | Oui (borne basse du repos) |
| `doigts-suspensions-max-lestees` | 3 × 10 s | 180 | 6 min 35 | 7 | Oui (borne basse du repos) |
| `doigts-suspensions-intermittentes-lopez` | 12 (3 × 4 × 10 s) | 20 / 120 | 9 min 05 | 9 | Oui |
| `doigts-7-53-horst` | 9 (3 × 3 × 7 s) | 53 / 300 | 16 min 26 | 16 | Oui |
| `doigts-repeaters-7-3` | 18 (3 × 6 × 7 s) | 3 / 180 | 8 min 56 | 9 | Oui |
| `doigts-intermittent-80-devise` | 36 (3 × 12 × 10 s) | 6 / 480 | 25 min 23 | 25 | À relire (I-10) |
| `doigts-density-hangs-nelson` | 3 × 30 s | 180 | 7 min 35 | 8 | Oui |
| `traction-blocages-90-120` | 8 × 10 s | 180 | 22 min 25 | 22 | Oui (repos posé, signalé) |
| `resistance-boulder-triples` | 18 (6 × 3 × 45 s) | 60 / 180 | 40 min 35 | 41 | Oui (effort fixé à 45 s, signalé) |
| `resistance-a-la-minute` | 8 × 20 s | 40 | 7 min 25 | 7 | Oui |
| `resistance-capacite-anaerobie` | 12 (3 × 4 × 40 s) | 120 / 600 | 46 min 05 | 46 | Oui |
| `resistance-enchainement-deux-blocs` | 4 × 60 s | 300 | 19 min 05 | 19 | Oui |
| `resistance-pan-pieds-poses` | 10 × 30 s | 60 | 14 min 05 | 14 | Oui |
| `resistance-poutre-20-40` | 12 (2 × 6 × 20 s) | 40 / 420 | 17 min 45 | 18 | Chrono oui, consigne non (B-4) |
| `endurance-continuite-fin-de-seance` | 1 × 600 s | aucun | 10 min 05 | 10 | Oui |
| `endurance-arc` | 1 × 1 200 s | aucun | 20 min 05 | 20 | Oui |
| `endurance-1-on-1-off` | 10 × 60 s | 60 | 19 min 05 | 19 | Oui |
| `endurance-regeneration-5x3` | 3 × 300 s | 180 | 21 min 05 | 21 | Oui |
| `technique-pieds-silencieux`, `-un-seul-contact`, `-tout-en-drapeau`, `-grimpe-au-ralenti` | 1 × 600 s | aucun | 10 min 05 | 10 | Oui |
| `technique-lecture-a-vue` | 1 × 180 s | aucun | 3 min 05 | 3 | Oui |
