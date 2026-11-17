# C. Séances types

Expert entraînement, 17 novembre 2026. Catalogue de séances prêtes à glisser dans un plan. Chaque séance a une version solo (déroulé ordonné de fiches de la bibliothèque) et une version groupe (1 à 3 objectifs globaux, plus un mini-bloc solo de 10 à 15 min si besoin).

**Règles du catalogue**
- Seuls des identifiants existants de `src/donnees/bibliotheque/` sont utilisés (contrôlé par script le 17/11 : 60 fiches, aucune inconnue, aucune fiche `exclureDeLaGeneration`).
- Durées : celles des fiches (`dureeMin`), sauf réglage indiqué entre parenthèses. Le total est indicatif.
- Marqueurs, prérequis et contre-indications de la séance : **déduits** des fiches (union), jamais saisis. Ils sont donnés ici pour relecture.
- Chaque séance respecte les vérifications S du moteur (échauffement avant l'effort nerveux, effort nerveux avant le travail congestionnant, pan en début de séance, bloc nerveux de 60 min au plus, solo et groupe de même intensité).
- Rôles : N (nerveuse), C (capacité), L (légère), H (hors grimpe) — voir `regles-planification.md`, A.3.3.
- Sources : celles des fiches. Les assemblages sont des choix de conception [CDC] construits sur le gabarit de séance de la synthèse [SYN] (échauffement, technique, bloc nerveux, capacité, antagonistes, retour au calme).

**Convention pour la version groupe** : l'échauffement se fait en commun, en grimpant (20 à 30 min, du plus facile au plus dur), avant le mini-bloc et les objectifs. Il n'est pas compté dans le mini-bloc. Le mini-bloc `avant` se fait après cet échauffement, doigts frais ; le mini-bloc `après` à la fin.

---

## C.1 Objectifs de groupe

Chaque objectif reprend la difficulté, le volume et le repos d'une fiche solo [CDC, d'après les fiches citées]. `cible` et `compte` suivent la forme existante (`src/donnees/seanceGroupeExemple.ts`) ; `ecartCotation` est donné par rapport au niveau maximal, seulement quand la fiche s'exprime ainsi [MOD].

| Code | Libellé affiché | Fiche solo de référence | `cible` / `compte` | Volume et borne | `ecartCotation` | Repos conseillé | `accents` | `marqueurs` |
|---|---|---|---|---|---|---|---|---|
| **OG-01** | 3 blocs à ta limite, 4 essais max chacun | `puissance-bloc-limite` | 3 / `blocs_notes` | 3 blocs × 4 essais ≈ 12 essais, l'équivalent des 40 min de la fiche à 4 min de repos | [+1, +2] | 240 s | doigts, traction_gainage, puissance | maximale, bloc_limite |
| **OG-02** | 6 blocs connus, 3 passages chacun | `puissance-intervalles-force` | 6 / `blocs_notes` | 6 × 3 passages | [−2, −1] | 180 s | puissance, traction_gainage | maximale |
| **OG-03** | Flasher 3 blocs juste sous ton niveau | — (lecture : Medernach et Memmert, synthèse) | 3 / `flashs` | 3 blocs, 1 essai compté chacun | — | 120 s | — (volet technique) | — |
| **OG-04** | 6 blocs triplés à ton niveau flash | `resistance-boulder-triples` | 6 / `blocs_notes` | 6 blocs × 3 passages, 1 min entre passages | — (niveau flash, terrain raide) | 180 s entre blocs | resistance | — |
| **OG-05** | 4 séries de 4 blocs enchaînés | `resistance-4x4-blocs` | 4 / `blocs_notes` (une série = un bloc noté) | 4 séries | — (un peu sous ton niveau à vue) | 240 s | resistance | — |
| **OG-06** | Traversée à deux : 1 min chacun, 10 fois | `endurance-1-on-1-off` | 10 / `blocs_notes` | 10 passages d'une minute ; le repos est le passage de l'autre | — (2 cotations sous ton niveau à vue) | 60 s | endurance | — |
| **OG-07** | 15 min de blocs faciles enchaînés en relais | `endurance-continuite-fin-de-seance` | 1 / `blocs_notes` | 10 à 20 min | — (facile, congestion à peine perceptible) | — | endurance | — |
| **OG-08** | Pieds silencieux : l'autre compte les bruits | `technique-pieds-silencieux` (+ comptage des contacts, Kettle, synthèse) | 4 / `blocs_notes` | 4 blocs faciles ; on refait si un pied claque | — (2 à 3 cotations sous ton max) | 120 s | — (volet technique) | — |
| **OG-09** | 4 blocs moyens, 4 fois chacun, de plus en plus propre | `technique-volume-blocs` | 4 / `blocs_notes` | 4 × 4 | — (difficulté moyenne) | 120 s, 300 s entre blocs | — (volet technique) | — |
| **OG-10** | 5 blocs connus sans lâcher les pieds | `gainage-blocs-pieds-colles` | 5 / `blocs_notes` | 5 blocs | — (blocs connus, raides) | 120 s | traction_gainage | — |
| **OG-11** | Flasher 3 blocs de ton niveau, 2 essais max | — (option manuelle pour alléger davantage une semaine allégée, A6-9) | 3 / `flashs` | 3 × 2 essais | — (niveau flash) | 240 s | puissance, doigts | — |
| **OG-12** | 4 blocs jamais faits, 3 essais chacun | — (« Trois essais », Climb Strong, synthèse) | 4 / `blocs_notes` | 4 × 3 essais | — (niveau à vue +1 ou +2) | 180 s | — (volet technique) | — |
| **OG-13** | 3 blocs sur la planche, 4 essais max chacun | `puissance-planche` | 3 / `blocs_notes` | 3 tranches de 15 min, 4 essais au plus par tranche (15 min à 4 min de repos) | — | 240 s après un essai dur, 90 s après une chute rapide | puissance, doigts | maximale, bloc_limite |
| **OG-14** | Un bloc facile sans les pieds, 4 séries de 3 | `puissance-bloc-sans-pieds` | 4 / `blocs_notes` | 4 × 3 passages | [−6, −5] | 180 s | puissance, traction_gainage | maximale |
| **OG-15** | Bloc à la minute : 8 départs | `resistance-a-la-minute` | 8 / `blocs_notes` | 8 départs, chacun son chrono | — | reste de la minute | resistance | — |
| **OG-16** | Blocs longs : 3 séries de 4 passages | `resistance-capacite-anaerobie` | 3 / `blocs_notes` | 3 × 4 passages de 30 à 50 s ; tomber sur un quart au plus | — | 120 s ; 600 s entre séries | resistance | — |
| **OG-17** | Deux blocs enchaînés, 4 passages en relais | `resistance-enchainement-deux-blocs` | 4 / `blocs_notes` | 4 passages de 60 à 90 s | — (niveau à vue ou juste en dessous) | 300 s | resistance | — |
| **OG-18** | Voies faciles : 3 séries de 3 voies | `endurance-4x4-voies` | 3 / `blocs_notes` | 3 × 3 voies | — (5 cotations sous ton niveau flash) | 480 s | endurance | — |

**Champs `blocs` et `essaisMaxParBloc`** (exigés par S-22 pour les objectifs maximaux) : OG-01 → 3 et 4 ; OG-02 → 6 et 3 ; OG-13 → 3 et 4 ; OG-14 → 4 et 3 (une série notée comme un bloc). Pour les autres objectifs, `blocs` = `cible` et pas de `essaisMaxParBloc`, sauf OG-11 (3 et 2) et OG-12 (4 et 3).

Les marqueurs ne sont pas saisis : ils viennent de la fiche de référence (A6-2). OG-03 et OG-12 n'ont pas de fiche de référence (trou T-05) : marqueurs vides.

**Note sur l'exemple existant** « 5 blocs durs à réglettes, 5 essais max chacun » (séance de groupe d'exemple) : il représente jusqu'à 25 essais durs, plus du double de la fiche solo de bloc limite. OG-01 le ramène à l'intention de la fiche. Question à Arthur (Q9).

---

## C.2 Catalogue

### Doigts

**ST-DOI-01 · Doigts découverte + bloc limite** — qualité `doigts`, rôle N, dure. Pour une expérience de poutre « aucune ».

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `doigts-echelles-3-6-9` | 7 |
| 3 | `puissance-bloc-limite` | 40 |
| 4 | `antagonistes-legers` | 10 |
| | **Total** | **92** |

Marqueurs : poutre, maximale, bloc_limite. Prérequis : 1 an. Contre-indications : doigts, poignet, coude, épaule, genou.
Groupe : mini-bloc `avant` [`doigts-echelles-3-6-9`] (7 min) ; objectifs OG-01.

**ST-DOI-02 · Suspensions max (réglette minimale) + bloc limite** — `doigts`, N, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `echauffement-doigts-poutre` | 8 |
| 3 | `doigts-reglette-minimale-lopez` | 7 |
| 4 | `puissance-bloc-limite` | 40 |
| 5 | `antagonistes-lattice` | 20 |
| | **Total** | **110** |

Marqueurs : poutre, maximale, poutre_intensive, bloc_limite. Prérequis : 2 ans, poutre occasionnelle, 15 s sur 25 mm, adulte. Contre-indications : doigts, poignet, coude, épaule, genou.
Variante `lestee` (poutre régulière) : `doigts-suspensions-max-lestees` à la place de l'étape 3 ; en groupe, même remplacement dans le mini-bloc.
Variante `entretien` (semaine d'accent résistance ou endurance) : étape 4 réglée à 20 min (`reglages.dureeMin: 20`, « bloc limite court » [SYN]) → total 90.
Groupe : mini-bloc `avant` [`echauffement-doigts-poutre`, `doigts-reglette-minimale-lopez`] (15 min) ; objectifs OG-01.

**ST-DOI-03 · Réglette minimale (Hörst) + gainage** — `doigts`, N, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `echauffement-doigts-poutre` | 8 |
| 3 | `doigts-reglette-minimale-horst` | 31 |
| 4 | `gainage-blocs-pieds-colles` | 15 |
| 5 | `antagonistes-legers` | 10 |
| | **Total** | **99** |

Marqueurs : poutre, maximale, poutre_intensive, arque. Prérequis : 2 ans, poutre occasionnelle, 15 s sur 25 mm. Contre-indications : doigts, poignet, coude, épaule.
Groupe : le protocole de Hörst (31 min) ne tient pas dans un mini-bloc : mini-bloc `avant` [`echauffement-doigts-poutre`, `doigts-reglette-minimale-lopez`] (15 min, même intention : suspension maximale sur réglette minimale) ; objectifs OG-10. Le prérequis `adulte` s'ajoute en groupe (fiche López).

**ST-DOI-04 · Doigts en force-endurance + 1 min / 1 min** — `doigts`, C, dure. Utile en voie après un bloc de force [SYN].

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `echauffement-doigts-poutre` | 8 |
| 3 | `doigts-repeaters-7-3` | 9 |
| 4 | `technique-un-seul-contact` | 10 |
| 5 | `endurance-1-on-1-off` | 19 |
| 6 | `antagonistes-legers` | 10 |
| | **Total** | **91** |

Marqueurs : poutre, poutre_intensive. Prérequis : 1 an, poutre occasionnelle. Contre-indications : doigts, poignet, coude, épaule.
Groupe : mini-bloc `avant` [`echauffement-doigts-poutre`, `doigts-repeaters-7-3`] (17 min, au-delà des 15 min du modèle : à accepter ou à raccourcir) ; objectifs OG-06.

**ST-DOI-05 · Doigts légers à la maison** — `doigts`, L, légère. Jour léger ; au moins 6 h avant ou après toute autre séance.

| # | Fiche | min |
|---|---|---|
| 1 | `doigts-abrahangs` | 10 |
| 2 | `mobilite-etirements-du-soir` | 20 |
| | **Total** | **30** |

Marqueurs : poutre, bidoigts. Prérequis : aucun. Contre-indications : doigts.
Groupe : sans objet (séance à la maison). Voir la question Q8.

### Traction et gainage

**ST-TRA-01 · Tractions de base et gainage** — `traction_gainage`, N, dure. Tout profil.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `technique-tout-en-drapeau` | 10 |
| 3 | `gainage-blocs-pieds-colles` | 15 |
| 4 | `traction-simple-4x5` | 15 |
| 5 | `traction-negatives` | 15 |
| 6 | `antagonistes-legers` | 10 |
| | **Total** | **100** |

Marqueurs : aucun. Prérequis : aucun. Contre-indications : poignet, coude, épaule. Tractions après la grimpe [SYN] (Lattice, Bechtel).
Groupe : objectifs OG-10 ; mini-bloc `après` [`traction-simple-4x5`] (15 min).

**ST-TRA-02 · Bloc limite + tractions lestées** — `traction_gainage`, N, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `puissance-bloc-limite` | 40 |
| 3 | `traction-lestee-force-lattice` | 18 |
| 4 | `antagonistes-lattice` | 20 |
| | **Total** | **113** |

Marqueurs : maximale, bloc_limite. Prérequis : 2 ans, 10 tractions strictes, adulte. Contre-indications : doigts, poignet, coude, épaule, genou. Bloc nerveux : 58 min.
Groupe : objectifs OG-01 ; mini-bloc `après` [`traction-lestee-force-lattice`] (18 min).

**ST-TRA-03 · Vers la traction à un bras** — `traction_gainage`, N, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `technique-formes-de-hanches` | 15 |
| 3 | `gainage-blocs-pieds-colles` | 15 |
| 4 | `traction-prises-decalees` | 15 |
| 5 | `antagonistes-legers` | 10 |
| | **Total** | **90** |

Marqueurs : aucun. Prérequis : 10 tractions strictes. Contre-indications : poignet, coude, épaule.
Groupe : objectifs OG-10 ; mini-bloc `après` [`traction-prises-decalees`] (15 min).

### Puissance

**ST-PUI-01 · Bloc limite + tractions explosives** — `puissance`, N, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `puissance-bloc-limite` | 40 |
| 3 | `puissance-tractions-explosives` | 12 |
| 4 | `antagonistes-legers` | 10 |
| | **Total** | **97** |

Marqueurs : maximale, bloc_limite. Prérequis : 1 an. Contre-indications : doigts, poignet, coude, épaule, genou.
Groupe : objectifs OG-01 ; mini-bloc `après` [`puissance-tractions-explosives`] (12 min).

**ST-PUI-02 · Planche** — `puissance`, N, dure. L'échauffement complet couvre les 15 à 20 min de mur classique demandés avant la planche [SYN].

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `puissance-planche` | 45 |
| 3 | `antagonistes-lattice` | 20 |
| | **Total** | **100** |

Marqueurs : maximale, bloc_limite. Prérequis : 2 ans, 6B en bloc. Contre-indications : doigts, poignet, coude, épaule, genou.
Variante `poutre_entretien` (S1 d'un bloc puissance [SYN]) : insérer `echauffement-doigts-poutre` et `doigts-reglette-minimale-lopez` avant l'étape 2 → 115 min, bloc nerveux 52 min, prérequis de ST-DOI-02. En groupe, la variante ajoute le mini-bloc `avant` [`echauffement-doigts-poutre`, `doigts-reglette-minimale-lopez`] (15 min).
Groupe : objectifs OG-13.

**ST-PUI-03 · Pan Güllich (initiation) + bloc limite** — `puissance`, N, dure. Adultes expérimentés seulement.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `puissance-pan-gullich-initiation` | 15 |
| 3 | `puissance-bloc-limite` | 40 |
| 4 | `antagonistes-legers` | 10 |
| | **Total** | **100** |

Marqueurs : maximale, pan_gullich, bloc_limite. Prérequis : 2 ans, poutre régulière, adulte. Contre-indications : doigts, poignet, coude, épaule, genou. Bloc nerveux : 55 min.
Groupe : mini-bloc `avant` [`puissance-pan-gullich-initiation`] (15 min) ; objectifs OG-01.

**ST-PUI-04 · Intervalles de force** — `puissance`, N, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `puissance-intervalles-force` | 60 |
| 3 | `antagonistes-legers` | 10 |
| | **Total** | **105** |

Marqueurs : maximale. Prérequis : 1 an. Contre-indications : doigts, poignet, coude, épaule. Bloc nerveux : 60 min (à la limite du repère).
Groupe : objectifs OG-02.

**ST-PUI-05 · Bloc sans pieds + gainage** — `puissance`, N, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `puissance-bloc-sans-pieds` | 40 |
| 3 | `gainage-blocs-pieds-colles` | 15 |
| 4 | `antagonistes-legers` | 10 |
| | **Total** | **100** |

Marqueurs : maximale. Prérequis : 2 ans, 15 tractions strictes. Contre-indications : doigts, poignet, coude, épaule.
Groupe : objectifs OG-14, OG-10.

### Résistance

**ST-RES-01 · Blocs triplés** — `resistance`, C, dure. Format du bloqueur [SYN].

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `technique-un-seul-contact` | 10 |
| 3 | `resistance-boulder-triples` | 41 |
| 4 | `antagonistes-lattice` | 20 |
| | **Total** | **106** |

Marqueurs : aucun. Prérequis : aucun. Contre-indications : doigts, poignet, coude, épaule.
Groupe : objectifs OG-04.

**ST-RES-02 · Bloc à la minute + 4 × 4** — `resistance`, C, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `resistance-a-la-minute` | 7 |
| 3 | `resistance-4x4-blocs` | 30 |
| 4 | `antagonistes-legers` | 10 |
| | **Total** | **82** |

Marqueurs : aucun. Prérequis : aucun. Contre-indications : doigts, poignet, coude, épaule. 4 × 4 : environ 3 semaines puis retour à un travail moins intense (fiche).
Groupe : objectifs OG-15, OG-05.

**ST-RES-03 · Blocs longs (capacité anaérobie)** — `resistance`, C, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `resistance-capacite-anaerobie` | 46 |
| 3 | `antagonistes-legers` | 10 |
| | **Total** | **91** |

Marqueurs : aucun. Prérequis : aucun. Contre-indications : doigts, poignet, coude, épaule.
Groupe : objectifs OG-16.

**ST-RES-04 · Enchaînement de deux blocs + pan pieds posés** — `resistance`, C, dure.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `resistance-enchainement-deux-blocs` | 19 |
| 3 | `resistance-pan-pieds-poses` | 14 |
| 4 | `antagonistes-legers` | 10 |
| | **Total** | **78** |

Marqueurs : pan. Prérequis : 2 ans. Contre-indications : doigts, poignet, coude, épaule. Seule séance de résistance « longue » disponible en salle de bloc ; en voie, voir le trou T-06.
Groupe : objectifs OG-17 ; mini-bloc `après` [`resistance-pan-pieds-poses`] (14 min).

### Endurance

**ST-END-01 · Continuité et technique** — `endurance`, L, légère.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-dynamique-vagy` | 10 |
| 2 | `technique-pieds-silencieux` | 10 |
| 3 | `technique-grimpe-au-ralenti` | 10 |
| 4 | `endurance-arc` | 20 |
| 5 | `mobilite-etirements-du-soir` | 20 |
| | **Total** | **70** |

Marqueurs : aucun. Prérequis : aucun. Contre-indications : aucune.
Groupe : objectifs OG-08, OG-07.

**ST-END-02 · 1 min / 1 min et continuité** — `endurance`, L, légère. Le « bloc d'endurance ciblé » du bloqueur [SYN].

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `technique-tout-en-drapeau` | 10 |
| 3 | `endurance-1-on-1-off` | 19 |
| 4 | `endurance-continuite-fin-de-seance` | 10 |
| 5 | `antagonistes-legers` | 10 |
| | **Total** | **84** |

Marqueurs : aucun. Prérequis : aucun. Contre-indications : poignet, coude, épaule (antagonistes).
Groupe : objectifs OG-06, OG-07.

**ST-END-03 · Voies faciles en séries** — `endurance`, C, dure. Grimpeur de voie.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `technique-lecture-a-vue` | 3 |
| 3 | `endurance-4x4-voies` | 50 |
| 4 | `mental-bilan-a-vue` | 3 |
| 5 | `antagonistes-legers` | 10 |
| | **Total** | **101** |

Marqueurs : aucun. Contexte : voie. Contre-indications : poignet, coude, épaule.
Groupe : objectifs OG-18.

**ST-END-04 · Voies doublées faciles** — `endurance`, C, dure. Quatrième séance du grimpeur de voie en début de cycle [SYN]. Séance longue.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `endurance-volume-voies` | 80 |
| 3 | `antagonistes-legers` | 10 |
| | **Total** | **125** |

Marqueurs : aucun. Contexte : voie. L'audit estime la fiche plus proche de 100 min (M-11).
Groupe : objectifs OG-18.

**ST-END-05 · Récupération active** — `endurance`, L, légère.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-dynamique-vagy` | 10 |
| 2 | `endurance-regeneration-5x3` | 21 |
| 3 | `mobilite-etirements-du-soir` | 20 |
| | **Total** | **51** |

Groupe : objectifs OG-07.

### Technique (séances légères)

**ST-TEC-01 · Technique en bloc** — `technique` (volet), L, légère. Qualité dominante à enregistrer : `endurance` si la séance doit compter dans une qualité physique (continuité finale), sinon voir Q1.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `technique-un-seul-contact` | 10 |
| 3 | `technique-volume-blocs` | 50 |
| 4 | `endurance-continuite-fin-de-seance` | 10 |
| | **Total** | **105** |

Groupe : objectifs OG-09, OG-12, OG-07.

**ST-TEC-02 · Technique en voie** — `technique`, L, légère. Contexte : voie.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `technique-lecture-a-vue` | 3 |
| 3 | `technique-faire-la-course` | 30 |
| 4 | `mental-bilan-a-vue` | 3 |
| 5 | `mobilite-etirements-du-soir` | 20 |
| | **Total** | **91** |

Groupe : objectifs OG-18 avec la consigne de faire la course (même voie, 10 % plus vite).

**ST-TEC-03 · Projet après travail** — `technique`, C, dure. Contexte : voie. Séance de performance.

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-general` | 35 |
| 2 | `technique-apres-travail` | 90 |
| | **Total** | **125** |

Groupe : sans objet (le projet est individuel ; la version solo sert aussi quand on grimpe à plusieurs).

### Hors grimpe

**ST-HOR-01 · Hanches** — `mobilite` (volet), H, légère. Cinquième séance de la semaine (A.3.7), séance séparée [SYN].

| # | Fiche | min |
|---|---|---|
| 1 | `echauffement-dynamique-vagy` | 10 |
| 2 | `mobilite-grand-ecart-lattice` | 25 |
| | **Total** | **35** |

Contre-indications : genou. Groupe : sans objet.

---

## C.3 Assemblages de référence

Semaines construites avec ce catalogue, pour un bloqueur (profil de référence du moteur, B.11). Elles servent de tests au moteur et d'exemples à l'assistant.

### Trois séances (mardi, jeudi, samedi)

| Accent du bloc | Mardi | Jeudi | Samedi | Avertissements attendus |
|---|---|---|---|---|
| `doigts` | ST-DOI-02 | ST-TRA-02 | ST-END-02 | aucun |
| `doigts`, poutre « aucune » | ST-DOI-01 | ST-TRA-01 | ST-END-02 | aucun |
| `traction_gainage` | ST-TRA-02 | ST-TRA-03 | ST-END-02 | W-13 (doigts non entretenus) : ajouter la variante « poutre d'entretien » si voulu |
| `puissance` | ST-PUI-02 (variante poutre d'entretien) | ST-TRA-02 | ST-END-02 | aucun |
| `resistance` | ST-DOI-02 (variante entretien) | ST-RES-01 | ST-RES-03 | W-13 (traction et endurance non entretenues) : ajouter `endurance-continuite-fin-de-seance` en fin de ST-RES-03 si voulu |
| `endurance` | ST-DOI-02 (variante entretien) | ST-END-02 | ST-END-01 | W-13 (traction non entretenue) |

Lecture voie : samedi devient ST-END-03 (voies) [SYN].

### Quatre séances (lundi, mardi, jeudi, samedi)

| Accent | Lundi (N) | Mardi (L) | Jeudi (N ou C) | Samedi (C) | Avertissements attendus |
|---|---|---|---|---|---|
| `doigts` | ST-DOI-02 | ST-TEC-01 | ST-PUI-02 | ST-END-02 | W-13 (traction) |
| `puissance` | ST-PUI-03 ou ST-PUI-01 | ST-END-01 | ST-PUI-02 (variante poutre) | ST-RES-01 | W-13 (traction) avec ST-PUI-03 |
| `resistance` | ST-DOI-02 (variante entretien) | ST-TEC-01 | ST-RES-02 | ST-RES-01 | W-13 (traction) |

Contrôle : dans chaque ligne, au plus 2 séances `bloc_limite`, au plus 2 `poutre_intensive`, au moins un jour sans séance maximale entre deux séances maximales, 3 séances dures au plus, 4 jours de doigts. Pour entretenir la traction, remplacer les antagonistes du samedi par `traction-simple-4x5` suivi des antagonistes, ou utiliser ST-TRA-02 le jeudi.

### Semaine allégée (réduction 50 %)

Mêmes séances que la semaine 3 du bloc, avec : séries divisées par deux, minutes des étapes multipliées par 0,5, note « niveau flash plutôt que projet » sur les étapes de bloc limite, nombre de blocs des objectifs de groupe divisé par deux (A.4, A6-9). Pas plus de séances maximales qu'en semaine 3.

---

## C.4 Trous de la bibliothèque

Classés par effet sur la qualité des séances. Aucun n'est comblé ici : il faut une recherche sourcée avant d'écrire une fiche.

| # | Manque | Effet | Ce que disent les sources | Priorité |
|---|---|---|---|---|
| **T-01** | **Tests repères** : suspension maximale 7 s sur 20 mm, traction lestée sur 2 répétitions, tractions strictes au maximum, suspension bras fléchis, tractions cadencées, compteur d'endurance, tests de mobilité | Pas de test de fin de bloc ; la règle de décision du cycle suivant (A.2) et la vérification P-09 restent inactives ; le profil ne se met pas à jour | Protocoles décrits dans [SYN] et [VER 3] | Haute |
| **T-02** | **Échauffement court** (15 à 20 min avec grimpe) | Toutes les séances dépassent 80 min à cause des 35 min d'échauffement complet | [AUD, couverture] ; prescription de Schweizer : 20 à 30 min, 3 à 4 voies ou 8 à 12 blocs [VER 6] | Haute |
| **T-03** | **Modules de 10 à 15 min** pour les objectifs spécifiques : hanches (les deux fiches de mobilité font 20 et 25 min), peur de la chute (20 min), bidoigts dédiés | S-24 se déclenche ; modules trop longs | Routine C de la synthèse : maintiens de 60 s par zone, 10 min par zone et par semaine [SYN] | Haute |
| **T-04** | **Fiches de groupe** : tour de rôle, bloc imposé, comptage des pieds à deux ; champ `contexte.groupe` vide sur toutes les fiches | Les objectifs de groupe pointent vers des fiches solo | [AUD, couverture groupe] | Moyenne |
| **T-05** | **Technique en bloc** : Trois essais, Prévision de méthode, Paresseux puis singe, Survol, Arrêts nets, Changements de pied, Pieds sous tension, Comptage des contacts | Peu de variété pour le volet technique, OG-03 et OG-12 sans fiche | Toutes décrites dans [SYN] | Moyenne |
| **T-06** | **Résistance en voie** : `resistance-capacity-power` est exclue (repos de 10 min non géré) ; rien d'autre en voie | Un grimpeur de voie n'a pas de séance de résistance longue | Voies répétées et pyramide 4-8-12-16 (La Fabrique Verticale), circuits de 30 mouvements (Barrows) [SYN], [VER 2] | Moyenne (haute pour la voie) |
| **T-07** | **Endurance de force** : superboulder, blocs à repos courts (Barrows), puissance anaérobie (Bechtel) | Pas de format court et dense | [SYN], [VER 2] | Basse |
| **T-08** | **Gainage hors mur, front lever, planche (gymnastique)** | Objectifs « front lever » et « planche » impossibles ; aucune séance de gainage à la maison | Le gainage au sol est un travail de soutien [SYN] ; aucun protocole chiffré dans les sources | Basse ; ne pas inventer |
| **T-09** | **Arqué à faible charge** | Objectif « arqués » impossible | Hörst proscrit l'arqué complet sur poutre ; Nelson le pratique à faible charge sans protocole chiffré [SYN] | Basse ; prudence |
| **T-10** | **Peur de la chute en bloc** et **rappel de sécurité du bloc** (tapis dégagé, désescalade, réception genoux fléchis) | Objectif « peur de la chute » limité à la voie | Rien de sourcé sur la peur en bloc [SYN] ; rappel de sécurité demandé par [SYN] et [AUD] | Moyenne pour le rappel ; basse pour la peur |
| **T-11** | **Prévention du coude** | Seuls les extenseurs du poignet des antagonistes | Aucun protocole propre au coude dans les sources | Basse |
| **T-12** | **Musculation générale de Bechtel** (un mouvement polyarticulaire après le bloc) et **bloc cadencé** | Moins de choix pour la traction | [SYN] | Basse |
| **T-13** | **Fiches exclues à débloquer** : `puissance-pan-gullich-stien` (4 exercices à relire), `doigts-intermittent-80-devise` (réglages à relire), `resistance-capacity-power` (repos long à gérer) | Pas de bloc pan Güllich structuré, pas d'intermittent à 80 % pour la voie (A5-4) | [AUD I-2, I-9, I-10] | Moyenne |
| **T-14** | **Retour au calme** | Aucune fiche ; `endurance-regeneration-5x3` en tient lieu | [AUD, couverture] | Basse |
