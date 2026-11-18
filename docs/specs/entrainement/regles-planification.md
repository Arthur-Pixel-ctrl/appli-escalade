# A. Règles de planification

Expert entraînement, 17 novembre 2026. Ce document dit comment un plan se construit. Il ne décrit pas d'écran ni de stockage : les données utilisées sont nommées dans `taches-entrainement.md`, section « Besoins de données ».

## Conventions

**Sources**, citées entre crochets à la fin de chaque règle :

| Code | Document | Poids |
|---|---|---|
| `[SYN]` | `docs/theorie-entrainement.md` (synthèse théorique) | Source principale |
| `[VER n]` | `docs/verifications.md`, point n | Prime sur la synthèse |
| `[AUD x]` | `docs/audit-bibliotheque.md`, constat x | Prime sur la synthèse |
| `[PLAN]` | `docs/plan-v2.md` | Décision d'Arthur |
| `[MOD]` | `docs/modele-donnees.md` | Modèle en vigueur |
| `[CDC]` | Choix de conception de l'expert entraînement | Valeur prudente, réglable, à afficher comme « proposition de l'app » |

Toute valeur chiffrée vient d'une de ces sources. Une valeur marquée `[CDC]` n'a aucune source externe : l'app doit la présenter comme une proposition et la rendre réglable.

**Vocabulaire**
- *Qualités* (cinq) : `doigts`, `traction_gainage`, `puissance`, `resistance`, `endurance`.
- *Volets* (quatre) : technique et tactique ; mental ; antagonistes, mobilité, prévention ; récupération et charge.
- *Bloc* = mésocycle de 4 semaines. *Cycle* = 3 blocs = 12 semaines. **(consolidation 17/11, décision B9)** À l'écran et dans les messages, cette période s'appelle **« phase »** (« Phase 1 ») pour ne pas la confondre avec un bloc d'escalade ; dans le code, `PhaseCycle`. Ce document garde « bloc » au sens de mésocycle.
- *Séance maximale* : une séance dont au moins une étape porte le marqueur `maximale` (suspensions max, bloc limite, pan Güllich, bloc sans pieds, intervalles de force, tractions lestées, blocages, tests maximaux).
- *Séance dure* / *légère* : étiquette `durete` de la version de séance [MOD].
- *Étape nerveuse* : étape dont le protocole porte `maximale`, `poutre_intensive`, `bloc_limite` ou `pan_gullich`.
- *Étape congestionnante* : étape de qualité `resistance`, ou de qualité `endurance` d'au moins 20 minutes.

---

## A.1 Structure du cycle

| # | Règle | Source |
|---|---|---|
| A1-1 | Un cycle dure 12 semaines et commence un lundi. Il contient 3 blocs de 4 semaines. | [PLAN], [SYN] (mésocycle de 4 semaines, cycle de 12 semaines, 3 à 4 cycles par an) |
| A1-2 | Dans chaque bloc : semaines 1 à 3 de charge, semaine 4 allégée. | [PLAN], [SYN] (Lattice : 3 de charge, 1 de décharge) |
| A1-3 | La semaine allégée est réglable (réduction de 40 à 60 %, 50 % par défaut) et désactivable. Quand elle est désactivée, aucun avertissement « semaine allégée oubliée » n'est émis. | [SYN] (Lattice : 40 à 60 % ; décharge inutile en rééducation, en entretien ou pour un débutant complet), [MOD] (`dechargeReductionPct` 50, plage 40 à 60) |
| A1-4 | Une semaine de transition est conseillée entre deux cycles : grimpe libre, pas de séance maximale, pas de test. | [SYN] (« une semaine de transition entre cycles ») ; contenu de la semaine : [CDC] |
| A1-5 | Accent tournant : chaque bloc met en avant **une** qualité (son « accent ») ; les quatre autres sont entretenues chaque semaine de charge (voir A.3). | [PLAN], [SYN] (non linéaire à accent tournant ; Rucci : un objectif mis en avant, les autres entretenus) |
| A1-6 | Deux priorités au plus en même temps : l'accent du bloc et, éventuellement, un volet mis en avant (technique, mental). (consolidation 17/11, décision B13) Une phase peut aussi avoir la **technique** pour accent : c'est souvent ce qui limite autour du 7A. | [SYN] (Bechtel : deux priorités non concurrentes au plus) |
| A1-7 | Un même protocole d'accent est gardé tout le bloc (pas de changement de méthode au milieu d'un bloc). | [SYN] (López : changer trop tôt coûte ; tendon plus lent que le muscle, maintien d'un même protocole plusieurs semaines) |

### Mode « objectif daté »

| # | Règle | Source |
|---|---|---|
| A1-8 | Le cycle est calé à rebours : sa dernière semaine est celle de l'objectif. | [CDC] |
| A1-9 | Affûtage : les 2 dernières semaines avant l'objectif (réglable de 1 à 3), volume réduit de 40 à 60 % (50 % par défaut), intensité et nombre de séances maintenus. Les semaines d'affûtage remplacent la fin du bloc 3 : le bloc 3 compte alors 2 semaines de charge et 2 d'affûtage, sans semaine allégée. | Durée et réduction : [SYN] (Bosquet : environ 2 semaines, volume −41 à 60 %, intensité et fréquence maintenues) ; [MOD] (`semainesAffutage` 2, `reductionVolumePct` 40 à 60). Remplacement de la semaine allégée : [CDC] |
| A1-10 | Pendant l'affûtage : une séance de doigts par semaine, à environ 80 % de l'effort maximal, pas deux séances de doigts juste avant l'objectif ; aucun protocole nouveau. | [SYN] (Lattice avant un voyage ; Lattice : aucun exercice nouveau en décharge) |
| A1-11 | La puissance passe en accent dans les 2 à 6 semaines qui précèdent l'affûtage ; pour un objectif en voie, le travail lactique (résistance) occupe les 3 à 8 dernières semaines, après la puissance. | [SYN] (Lattice : puissance 2 à 6 semaines avant l'objectif ; consensus minimal : lactique 3 à 8 semaines avant ; Bechtel : phase lactique après la puissance, juste avant la performance) |
| A1-12 | Moins de 12 semaines disponibles : 8 à 11 semaines → 2 blocs (le premier de 4 semaines avec semaine allégée, le second raccourci et terminé par l'affûtage) ; moins de 8 semaines → un seul bloc d'accent spécifique puis l'affûtage, sans protocole nouveau. | [CDC] (dérivé de A1-9 et A1-10) |

---

## A.2 Ordre des accents selon le profil

Règle générale : force en premier, puissance ensuite, résistance en dernier, l'endurance de base avant tout travail congestionnant. [SYN] (Lattice : force en période de base ; Bechtel : capacités lentes, puissances rapides, lactique juste avant la performance ; consensus : base aérobie facile avant le travail congestionnant, jamais de sacrifice de la force).

### Tableau de départ (premier cycle)

| Profil | B1 | B2 | B3 | Source |
|---|---|---|---|---|
| **Bloc, cas général** (ex. bloqueur 7A visant 7B–7C) | `doigts` | `puissance` | `resistance` (résistance courte : blocs triplés, à la minute, blocs longs) | [SYN] (« lecture bloc 7A vers 7B–7C : accents alternés doigts, puissance, résistance courte ; continuité à dose d'entretien ») |
| **Bloc, traction sous le repère, doigts au repère** | `traction_gainage` | `puissance` | `resistance` | Repère : [VER 3] (charge totale sur 2 répétitions ; rendements décroissants vers 165 % hommes, 135 % femmes). Doigts et traction pèsent du même ordre entre V4 et V8 : [SYN]. Ordre : [CDC] |
| **Voie, cas général** (7a visant 7b–7c) | `doigts` | `endurance` (continuité, puissance aérobie) | `resistance` (résistance longue) | [SYN] (« continuité et résistance longue montent en priorité sans abandonner la force » ; « un mésocycle sur trois met l'accent sur la résistance et la continuité » ; « le bloc limite reste hebdomadaire »). Placement endurance avant résistance : [SYN] (base aérobie avant congestion ; Bechtel). Ordre exact : [CDC] |
| **Objectif daté, bloc** | `doigts` | `puissance` | `resistance` courte, puis affûtage (A1-9) | [SYN] (Lattice : puissance 2 à 6 semaines avant ; Bosquet) |
| **Objectif daté, voie** | `doigts` | `endurance` | `resistance` longue, puis affûtage | [SYN] (lactique 3 à 8 semaines avant l'objectif, après la puissance) |
| **Expérience de poutre « aucune »** | `doigts`, avec les seuls protocoles non maximaux (échelles 3-6-9, plan le plus simple, suspensions légères pieds au sol) | comme le cas général | comme le cas général | [SYN] (séquence prudente : 4 à 8 semaines au poids du corps avant le lest), [AUD B-3] |
| **Moins d'un an de pratique** | `traction_gainage` | `endurance` | `puissance` (bloc limite dès qu'un an de pratique est atteint) | Poutre après un an sans blessure : [SYN] (coachs Lattice) ; bloc limite à partir d'un an : [AUD M-8]. Ordre : [CDC] |

**Notes**
- Les repères de force sont des moyennes de population, pas des seuils : écarts-types de 14 à 19 points [VER 3]. L'app les affiche comme « repère », jamais comme objectif à atteindre.
- Repères doigts disponibles : en voie, suspension maximale 7 s sur 20 mm, charge totale de 124 % (7a), 134 % (7b+), 138 % (7c) du poids du corps ; en bloc, seulement des tranches larges (lest moyen de 24,2 kg pour V5–V7, 38,4 kg pour V8–V11) [SYN]. Sans test, le profil est traité comme « sous le repère ».
- Repère traction : charge totale (corps + lest) sur 2 répétitions, en % du poids du corps : environ 145 % pour les hommes V7–V8, repère de rendements décroissants 165 % (hommes) et 135 % (femmes) [VER 3]. Le sexe n'est pas dans le profil. (consolidation 17/11, décision B14) Le repère n'est pas affiché par défaut ; chacun peut choisir dans son profil « aucun », « repère hommes » ou « repère femmes » (`Profil.repereTraction`).

### Cycles suivants : règle de décision

Appliquée à la fin de chaque cycle, sur les tests de fin de bloc (A.5) et la pyramide [SYN] (« règle de décision ») :

| Situation | Accent proposé pour B1 du cycle suivant | Source |
|---|---|---|
| Test de doigts sous le repère de la cotation actuelle | `doigts` | [SYN] |
| Tests de doigts et de traction au repère, mais cotation et taux de réussite qui stagnent sur le cycle | Garder l'ordre physique et mettre en avant le volet technique et tactique (A1-6) : 20 à 30 min d'exercices techniques par séance, un ou deux habiletés par mois | [SYN] (règle de décision ; Bridgewater : 20 à 30 min, une à deux habiletés par mois) |
| Test de traction sous le repère, doigts au repère | `traction_gainage` | [VER 3], [CDC] |
| Un test repère a baissé sur 2 semaines avec de la fatigue | Pas de nouveau cycle tout de suite : une semaine allégée de plus | [SYN] (« décharge si un test repère baisse sur 2 semaines avec fatigue ») ; Bechtel : 1 à 2 semaines de coupure si les chiffres baissent de façon répétée |
| Sinon | Même ordre que le cycle précédent | [CDC] |

Deux blocs consécutifs sur la même qualité de force ou de puissance (8 semaines) sont déconseillés : la BMC plafonne ces blocs à 3 à 5 semaines [SYN]. Pour la résistance et l'endurance, deux blocs de suite restent acceptables (BMC : 8 à 10 semaines) mais le travail lactique ne dépasse pas 8 semaines d'affilée [SYN].

---

## A.3 Semaines types

### A.3.1 Principes communs

| # | Règle | Source |
|---|---|---|
| A3-1 | Au moins 48 h entre deux séances maximales ; jamais deux jours de suite. En planification, la règle se lit en jours calendaires : deux séances maximales sont séparées d'au moins un jour sans séance maximale (mardi puis jeudi : oui ; mardi puis mercredi : non). | [SYN], [MOD] (`heuresEntreSeancesMax` 48). Lecture en jours : [CDC] |
| A3-2 | Au plus 2 séances de poutre intensive et 2 séances de bloc limite par semaine. | [SYN], [PLAN] |
| A3-3 | Au plus 3 séances avec poutre par semaine, tous types confondus. | [AUD I-8] (posé par l'audit) |
| A3-4 | Au plus 4 jours de grimpe ou de poutre par semaine ; au moins 3 jours sans sollicitation des doigts. | [VER 9] (Hörst) |
| A3-5 | Chaque séance dure suit un jour de repos quand c'est possible ; une séance modérée d'un autre type peut suivre une séance dure dans les 24 h. | [SYN] (Lattice ; Bechtel) |
| A3-6 | Une séance manquée n'est pas rattrapée en fin de semaine. | [SYN] (Lattice), [MOD] |
| A3-7 | Ordre dans la séance : échauffement → technique (geste nouveau, à frais) → bloc nerveux (doigts, bloc limite, pan) → bloc capacité (résistance, continuité) → antagonistes et gainage → retour au calme et mobilité. | [SYN] (gabarit de séance ; Lattice : poutre, bloc de force, antagonistes ; Bechtel : habiletés, force, filières) |
| A3-8 | Gabarit de durée : échauffement général 10 min ; échauffement spécifique 15 à 20 min ; bloc nerveux 30 à 60 min ; bloc capacité 0 à 30 min ; antagonistes et gainage 10 à 15 min ; retour au calme 5 à 10 min. | [SYN] (gabarit de séance) |
| A3-9 | À ne pas réunir dans une même séance : force maximale et résistance congestionnante ; poutre maximale après un gros volume. Compatibles : doigts, bloc limite et antagonistes ; technique et volume aérobie. | [SYN] |
| A3-10 | Antagonistes : 2 séances courtes par semaine, après les jours de grimpe (jamais un jour de repos). | [VER 5] |
| A3-11 | Technique : 10 à 20 min d'exercice technique en début de séance, à chaque séance. | [SYN] (Bechtel, Hampton, Gresham) |
| A3-12 | Mobilité : viser environ 10 min par zone et par semaine (au-delà, pas de gain notable). | [SYN] (Ingram et al., 2024) |

### A.3.2 Dose d'entretien des qualités hors accent

Une qualité est « entretenue » dans une semaine de charge si au moins une étape d'une séance de la semaine a cette qualité. Dose minimale :

| Qualité | Entretien minimal par semaine de charge | Source |
|---|---|---|
| `doigts` | 1 exposition : poutre courte ou bloc dur à réglettes | [SYN] (Lattice, entretien : une séance de doigts intense par semaine) |
| `traction_gainage` | 1 étape de traction ou de gainage | [CDC] |
| `puissance` | 1 séance de bloc limite (ou planche, intervalles de force) | [SYN] (« le bloc limite reste hebdomadaire ») |
| `resistance` | Bloqueur : 1 bloc de résistance ou d'endurance | [SYN] (Lattice : au moins une séance d'endurance par semaine pour un bloqueur) |
| `endurance` | 10 à 20 min de continuité facile en fin d'une séance | [SYN] (dose à 3 séances) |
| Grimpeur de voie | Au moins 2 séances sur 3 contiennent de l'endurance ou de la résistance | [SYN] (Lattice) |

### A.3.3 Rôles de séance

Pour lire les semaines types, chaque séance a un rôle [CDC, d'après les semaines types de la synthèse] :

| Rôle | Contenu | Dureté |
|---|---|---|
| **N** (nerveuse) | Bloc nerveux de l'accent ou d'entretien : poutre, bloc limite, pan, tractions lestées | dure, maximale |
| **C** (capacité) | Résistance ou endurance selon l'accent, précédée d'un bloc limite court ou d'une poutre d'entretien si l'accent est la résistance | dure, non maximale sauf bloc limite court |
| **L** (légère) | Technique, volume facile en 1 à 3 essais, continuité, mobilité | légère |
| **H** (hors grimpe) | Mobilité, gainage au sol ; aucune sollicitation des doigts (les antagonistes restent après les séances de grimpe, A3-10) | légère |

### A.3.4 Trois séances par semaine (référence)

Jours conseillés : mardi, jeudi, samedi. [SYN] (semaine type à 3 séances, reprise telle quelle pour les accents doigts, puissance et résistance ; colonnes traction et endurance : [CDC] par analogie).

| Séance | Accent `doigts` | Accent `traction_gainage` | Accent `puissance` | Accent `resistance` | Accent `endurance` |
|---|---|---|---|---|---|
| **S1** mardi, N | Poutre maximale, bloc limite, antagonistes | Bloc limite, tractions (lestées si prérequis), antagonistes | Pan ou planche à la limite, mouvements dynamiques, poutre courte d'entretien | Bloc limite court, poutre d'entretien | Bloc limite, poutre d'entretien, antagonistes |
| **S2** jeudi, N ou C | Bloc limite ou intervalles de force, tirage et gainage | Intervalles de force ou bloc sans pieds, blocages, gainage | Bloc limite, force de tirage | C : 4 × 4, blocs triplés, circuits | C : 1 min / 1 min ou ARC, technique |
| **S3** samedi, L ou C | Volume technique (blocs en 1 à 3 essais) ou voies, continuité 10 à 20 min, mobilité | Volume technique, continuité, mobilité | Volume technique ou voies, continuité | Voies ou circuits longs, antagonistes | Voies ou volume de blocs, continuité longue, mobilité |

Lecture voie : S3 devient toujours une séance de voies [SYN].

### A.3.5 Quatre séances par semaine

[SYN] (semaine type à 4 séances) :

| Jour | Rôle | Contenu |
|---|---|---|
| Lundi | N | Doigts, bloc limite selon l'accent, antagonistes |
| Mardi | L | Technique, volume facile ou continuité en voie, mobilité |
| Mercredi | — | Repos |
| Jeudi | N | Pan ou planche : puissance ou force appliquée, tirage et gainage |
| Vendredi | — | Repos |
| Samedi | C | Selon l'accent : résistance, ou séance de voies, falaise, projet |
| Dimanche | — | Repos |

Avec 4 séances, la quatrième sert l'endurance : continuité ou volume de voies en début de cycle, résistance longue 3 à 4 semaines avant un objectif en voie [SYN].

### A.3.6 Deux séances par semaine

[CDC], construit sur A3-1 à A3-11 : deux séances dures séparées d'au moins deux jours (mardi, samedi). L'entretien de toutes les qualités se fait par des étapes courtes.

| Séance | Accent nerveux (`doigts`, `traction_gainage`, `puissance`) | Accent capacité (`resistance`, `endurance`) |
|---|---|---|
| **S1** mardi, N | Accent (poutre ou tractions ou bloc limite), poutre ou bloc limite d'entretien, antagonistes | Bloc limite, poutre d'entretien, tractions, antagonistes |
| **S2** samedi, C | Technique 10 min, bloc limite ou intervalles de force, résistance courte (à la minute) ou continuité 10 à 20 min, antagonistes | Technique 10 min, accent capacité (blocs triplés, 4 × 4, 1 min / 1 min, voies), mobilité |

Avec deux séances, l'avertissement « qualité non entretenue » (moteur, `W-14`) sera plus fréquent : c'est attendu, il reste une information.

### A.3.7 Cinq séances par semaine

[CDC], construit sur A3-4 (Hörst : 4 jours de grimpe ou de poutre au plus) : la cinquième séance est **hors grimpe**.

| Jour | Rôle | Contenu |
|---|---|---|
| Lundi | N | Comme à 4 séances |
| Mardi | L | Technique, continuité, mobilité |
| Mercredi | — | Repos |
| Jeudi | N | Comme à 4 séances |
| Vendredi | H | Mobilité (grand écart, séance séparée), gainage au sol. Pas d'antagonistes ce jour-là : ils se font après les jours de grimpe [VER 5] |
| Samedi | C | Selon l'accent |
| Dimanche | — | Repos |

### A.3.8 Nombre de séances dures par semaine

| Séances par semaine | Séances dures au plus | Source |
|---|---|---|
| 2 | 2 | [CDC] |
| 3 | 3 | [SYN] (Lattice : chaque séance dure suit un jour de repos ; en accent résistance, S3 est elle aussi exigeante) |
| 4 | 3 | [SYN] (lundi, jeudi, samedi selon l'accent ; mardi léger) |
| 5 | 3 | [CDC] (5e séance hors grimpe) |
| 6 et plus | 3 | [CDC] |

Ce plafond s'ajoute à la règle des 48 h, qui ne vise que les séances maximales.

---

## A.4 Semaine allégée et affûtage

### Semaine allégée (semaine 4 de chaque bloc)

| # | Règle | Source |
|---|---|---|
| A4-1 | La charge prévue de la semaine (Σ effort prévu × minutes) vise `(1 − réduction) ×` la moyenne des trois semaines de charge du bloc. Réduction par défaut 50 %, plage 40 à 60 %. | [SYN], [MOD] |
| A4-2 | On continue de grimper : même nombre de séances par défaut ; la réduction passe d'abord par le nombre de séries et la durée. | « Sans arrêter de grimper, moins de séances ou de séries » : [SYN]. Priorité aux séries : [CDC] |
| A4-3 | Concrètement, sur chaque étape : séries divisées par deux (arrondi au-dessus, au moins 1) ; durée des étapes en minutes multipliée par `(1 − réduction)` ; protocoles inchangés. (consolidation 18/11) Les étapes d'échauffement gardent leur durée : échauffement complet avant un effort maximal (décision F2, point 6) ; la semaine allégée reste alors un peu au-dessus de la cible, W-10 le signale en information. Fonction commune : `allegerSeance` (G-03). | [CDC] (application chiffrée de A4-1) |
| A4-4 | Quelques efforts intenses conservés : les séances maximales de la semaine de charge restent, à volume réduit. La semaine allégée n'a jamais plus de séances maximales que la dernière semaine de charge du bloc. | [SYN] (Lattice : « quelques efforts intenses conservés »), [CDC] |
| A4-5 | Bloc : niveau flash plutôt que projet. Une note le rappelle sur les étapes de bloc limite ; en groupe, le nombre de blocs des objectifs est divisé par deux (arrondi au-dessus), avec la même note. | [SYN] (Lattice) ; mise en œuvre : [CDC] |
| A4-6 | Aucun protocole nouveau : seuls des protocoles déjà présents dans les semaines de charge du bloc. | [SYN] (Lattice) |
| A4-7 | Les modules d'objectifs spécifiques sont suspendus, sauf mobilité et prévention. | [CDC] |
| A4-8 | Les tests de fin de bloc se placent en fin de semaine allégée (A.5). | [SYN] (« par mésocycle, en fin de décharge ») |

**Exemple chiffré** (A4-1 à A4-3, réduction 50 %) : semaines de charge à 1 500, 1 600 et 1 700 unités → moyenne 1 600 → cible de la semaine allégée 800. Une séance « Suspensions max + bloc limite » en semaine de charge : 4 séries de suspensions, bloc limite de 40 min, effort prévu 8. En semaine allégée : 2 séries, bloc limite de 20 min en flash, effort prévu inchangé.

### Affûtage (mode objectif daté)

| # | Règle | Source |
|---|---|---|
| A4-9 | Volume réduit de 40 à 60 % (50 % par défaut) ; intensité et nombre de séances maintenus. | [SYN] (Bosquet) |
| A4-10 | Concrètement : mêmes séances que la dernière semaine de charge, séries et minutes réduites comme en A4-3, effort prévu inchangé. | [CDC] |
| A4-11 | Une séance de doigts par semaine, à environ 80 % de l'effort maximal ; pas de séance de poutre intensive dans les 3 derniers jours avant l'objectif. | 80 % et « pas d'empilement juste avant » : [SYN] (Lattice). « 3 jours » : [CDC] |
| A4-12 | Aucun protocole nouveau, aucun test. | [SYN] (Lattice), [CDC] |

---

## A.5 Tests et progression d'un bloc à l'autre

### Tests de fin de bloc (en fin de semaine allégée)

[SYN] (tableau de bord : par mésocycle, retest court ; par cycle, batterie complète). Un test maximal compte comme une **séance maximale** pour la règle des 48 h et pour les quotas [CDC, conséquence de A3-1].

| Test | Quand | Prérequis | Protocole de test | Source |
|---|---|---|---|---|
| Suspension maximale 7 s, deux bras, 20 mm, semi-arqué ou main ouverte, charge totale en % du poids du corps | Fin de chaque bloc | Ceux des suspensions max lestées : 2 ans de pratique, poutre régulière, 15 s sur 25 mm, adulte | 4 à 8 essais ; paliers de 7 s avec 2 min de repos, 5 kg au plus par palier | [SYN] (Lattice ; Crimpd), prérequis : [CDC] alignés sur `doigts-suspensions-max-lestees` |
| Traction lestée sur 2 répétitions, charge totale en % du poids du corps | Fin de chaque bloc | 10 tractions strictes, 2 ans, adulte | 3 min entre essais | [VER 3] |
| Tractions strictes au maximum | Fin de chaque bloc (sert aussi au profil) | Aucun | — | [SYN] (tests sans capteur) |
| 1 à 2 blocs repères | Fin de chaque bloc | Aucun | Mêmes blocs retentés | [SYN] |
| Suspension bras fléchis à deux bras ; tractions cadencées à 15 par minute | Fin de cycle | Aucun | — | [SYN] (batterie IRCRA) |
| Test d'endurance de terrain : compteur de Bechtel (voies ou blocs réalisables à difficulté fixe, avec de la marge) | Fin de cycle | Aucun | — | [SYN] |
| Pyramide de croix et taux de réussite par cotation | Fin de cycle (calculés, pas testés) | — | — | [SYN] |
| Grille technique (10 items notés de 1 à 5) | Toutes les 4 à 6 semaines | — | — | [SYN] |
| Mobilité : 5 tests au mètre ruban | Tous les 2 à 3 mois | — | — | [SYN] |

Sans prérequis pour le test maximal de doigts : l'app propose seulement les tests sans prérequis et la question du test de 15 s sur 25 mm (qui sert de porte d'entrée) [CDC]. Entre deux tests, l'estimation de Bechtel peut servir une fois par mois : (secondes tenues × charge totale × 0,0333) + charge totale, à partir d'une tenue de 5 à 10 s [SYN].

**Trou de la bibliothèque** : aucun de ces tests n'existe aujourd'hui comme fiche. Voir `seances-types.md`, section C.4.

### Règles de progression

| # | Règle | Source |
|---|---|---|
| A5-1 | Charge de poutre : marge constatée supérieure à la cible deux séances de suite → proposer +1,25 à 2,5 kg ; marge inférieure → proposer −2 à 5 kg ou une réglette plus grande. | [SYN], [MOD] (`ajustementCharge`) ; palier de 1,25 kg : [SYN] (Mundry, seule règle testée) |
| A5-2 | Changement de protocole quand la charge ne monte plus sur 2 à 3 séances, ou à la fin du bloc ; jamais au milieu du bloc sans raison (douleur, stagnation). | [SYN] |
| A5-3 | Passage de l'expérience de poutre de « aucune » à « occasionnelle » : proposé (jamais imposé) après un cycle complet de 8 semaines d'échelles 3-6-9 ; de « occasionnelle » à « régulière » : au choix de l'utilisateur. | « Aucune → occasionnelle » : [AUD, couverture] (proposition de l'audit). « Occasionnelle → régulière » : [CDC] |
| A5-4 | Séquence prudente sur poutre : 4 à 8 semaines au poids du corps (réglette minimale de Hörst ou échelles), puis 4 semaines de suspensions lestées de 10 s avec 3 s de marge sur 18 à 20 mm, puis réglette minimale ou intermittent à 80 % si l'objectif est la voie. | [SYN] |
| A5-5 | Technique : zéro faute sur deux séances de suite → durcir (angle, taille des prises, cotation) ; une même habileté pendant une dizaine de séances avant d'en changer ; une à deux habiletés par mois. | [SYN] (Bechtel, Bridgewater) |
| A5-6 | Charge hebdomadaire : une hausse de plus de 10 % d'une semaine de charge à la suivante est signalée. C'est un repère prudent, pas un seuil validé. | [SYN] (document régional FFME) |
| A5-7 | Aucun ratio charge aiguë / charge chronique, aucune « zone » de charge. La monotonie s'affiche sans seuil. | [SYN] (Impellizzeri ; Haddad : pas de seuil chiffré) |
| A5-8 | Objectifs spécifiques : test repère du module en fin de bloc ; le module est reconduit au bloc suivant ou remplacé, au choix de l'utilisateur. | [MOD] (`testRepereId`), [CDC] |

---

## A.6 Séance de groupe : même intention que la version solo

Une séance planifiée a deux versions prêtes, solo et groupe ; le mode se choisit le jour même [MOD]. Règles pour que la version groupe garde l'intention :

| # | Règle | Source |
|---|---|---|
| A6-1 | Même qualité dominante, même dureté. | [CDC] |
| A6-2 | Mêmes marqueurs à quota (`maximale`, `poutre_intensive`, `bloc_limite`, `pan_gullich`, `poutre`). Les marqueurs de la version groupe se déduisent de ses objectifs et de son mini-bloc, ils ne se saisissent pas. | [CDC] ; « rien de calculable n'est stocké » : CLAUDE.md |
| A6-3 | 1 à 3 objectifs globaux. | [MOD], [PLAN] |
| A6-4 | Chaque objectif borne le volume : nombre de blocs **et** nombre d'essais maximum par bloc, ou nombre de passages. Exemple : « 3 blocs durs à réglettes, 4 essais max chacun » (consolidation 17/11 : l'ancien exemple à 5 × 5 est ramené à 3 × 4, décision B20). | [CDC] |
| A6-5 | Chaque objectif reprend la difficulté et le repos de la fiche solo correspondante, exprimés en écart de cotation et en minutes. Bloc limite : 1 à 2 cotations au-dessus du niveau après travail, 4 min de repos conseillé (3 à 5). Intervalles de force : 1 à 2 cotations sous le maximum, 3 min. Blocs triplés : niveau flash, 1 min entre passages, 3 min entre séries. | [SYN] (fiches et minuteurs : 4 min entre essais de bloc limite, plage 3 à 5) |
| A6-6 | Le repos pris pendant l'essai des autres compte, mais le chrono de repos conseillé reste affiché pour les objectifs maximaux. | [AUD, couverture groupe] |
| A6-7 | Ce qui ne se fait pas à plusieurs (poutre, tractions lestées, chronos individuels) va dans un mini-bloc solo de 10 à 15 min, avant la grimpe pour la poutre (doigts frais), après pour les antagonistes. | [MOD] (`miniBloc` 10 à 15 min, `moment`), placement : [SYN] (travail intense à frais) |
| A6-8 | Les objectifs de groupe se prêtent aux formats à plusieurs : tour de rôle sur un même bloc, observateur qui compte les fautes de pied, bloc imposé par un partenaire. | [AUD, couverture groupe], [SYN] (comptage des contacts de pied, Kettle) |
| A6-9 | En semaine allégée, chaque objectif garde sa nature (et donc ses marqueurs, pour rester aligné sur la version solo) mais son nombre de blocs est divisé par deux (arrondi au-dessus), avec la note « niveau flash plutôt que projet ». L'objectif OG-11 (« flasher 3 blocs de ton niveau ») reste disponible pour qui veut alléger davantage à la main. | [SYN] (Lattice : flash plutôt que projet), division : [CDC] |

Correspondances entre fiches solo et objectifs de groupe : voir `seances-types.md`.

---

## A.7 Objectifs spécifiques

| # | Règle | Source |
|---|---|---|
| A7-1 | 0 à 2 objectifs spécifiques par bloc. | [PLAN], [MOD] (`objectifsPersoIds` 0 à 2) |
| A7-2 | Un objectif = un module de 10 à 15 min, 1 à 2 fois par semaine. | [PLAN], [MOD] |
| A7-3 | Proposables seulement si les prérequis sont remplis et si aucune contre-indication ne figure dans les douleurs déclarées ; sinon proposer l'objectif de prévention de remplacement. | [MOD] (`objectifsProposables`) |
| A7-4 | Deux objectifs du même bloc ne portent pas le même marqueur à quota. | [MOD] |
| A7-5 | Placement : module de force (doigts, traction) en début de séance dure, juste après l'échauffement, et jamais un jour léger ; module de mobilité ou de prévention en fin de séance ou un jour léger ; module mental selon son terrain. | Travail intense à frais : [SYN]. Jour léger interdit aux modules de force : conséquence de A3-1 [CDC] |
| A7-6 | Le module compte dans la charge (minutes × effort prévu) et ses marqueurs comptent dans les quotas de la semaine. | [MOD] |
| A7-7 | Suspendus en semaine allégée et en affûtage, sauf mobilité et prévention. | [CDC] |

### Les objectifs demandés et leur état dans la bibliothèque

| Objectif | Fiche disponible | Placement | Contraintes | État |
|---|---|---|---|---|
| Bidoigts | `doigts-abrahangs` (10 min ; 8 tenues sur 20 en bidoigts) | Jour léger, au moins 6 h après ou avant toute autre séance | Charges faibles seulement : les bidoigts exposent les lombricaux [SYN] ; jamais de bidoigt lesté | Partiel : pas de module bidoigts dédié |
| Arqués | Aucune fiche courte à faible charge | — | Hörst proscrit l'arqué complet sur poutre ; force sur A2 multipliée par environ 31,5 ; flexion de l'articulation moyenne sous 80 à 90° [SYN] | **Trou** : ne pas créer sans source |
| Traction à un bras | `traction-prises-decalees` (15 min, 10 tractions strictes) | Séance dure, après la grimpe | Hörst : 2 à 3 jours par semaine, décalage augmenté dès 5 répétitions propres [SYN] | Disponible (15 min) |
| Planche | Aucune | — | — | **Trou** ; il s'agit de la planche de gymnastique (full planche), décision B15 (consolidation 17/11) |
| Front lever | Aucune | — | Gainage au sol : travail de soutien, pas un levier principal [SYN] | **Trou** |
| Souplesse de hanches | `mobilite-etirements-du-soir` (20 min), `mobilite-grand-ecart-lattice` (25 min, séance séparée) | Fin de séance ou jour léger | Les deux dépassent 15 min ; 8 à 12 semaines avant un progrès mesurable [SYN] | Partiel : manque une fiche de 10 à 15 min |
| Peur de la chute | `mental-ecole-de-vol` (voie, tête, assureur formé) | Séance en voie | Formation à l'assurage dynamique et à la chute en tête exigée [SYN] | Voie : disponible. Bloc : **trou** (rien de sourcé [SYN]) |
| Prévention des épaules | `antagonistes-legers` (10 min) | Après une séance de grimpe | [VER 5] | Disponible |
| Prévention des coudes | `antagonistes-legers` (extenseurs du poignet) | Après une séance de grimpe | Aucun protocole propre au coude dans les sources | Partiel |

---

## A.8 Règles de sécurité transversales (rappel)

Le moteur `moteur-verification.md` les applique toutes. Principe : **avertir, jamais bloquer** [PLAN], [MOD].

- Signaux d'arrêt immédiat et consultation : claquement dans un doigt, douleur aiguë soudaine à la base d'un doigt, gonflement ou ecchymose, tendon qui fait saillie, impossibilité de fléchir ou d'étendre complètement, genou qui gonfle ou se bloque, épaule instable, engourdissements [SYN].
- Signaux de réduction de charge : douleur au-dessus de 2 sur 10 pendant l'effort ou plus de 10 min après, raideur articulaire inhabituelle le lendemain, douleur du coude à la préhension [SYN].
- Conduite en réduction : supprimer arqué, pan Güllich, trous et efforts maximaux pendant 1 à 2 semaines, garder de la grimpe facile indolore, consulter sans amélioration nette en 14 jours [SYN].
- Signaux de séance de force : fin du bloc de force si deux essais de suite sont nettement moins bons que le meilleur [SYN].
- L'app n'attribue jamais de grade de lésion [SYN].
- Sommeil : moyenne de 3 nuits sous 7 h → transformer la séance maximale en séance technique ou de volume [SYN].
- Questionnaire du matin : deux items dans le rouge ou une douleur signalée → séance allégée [SYN].
