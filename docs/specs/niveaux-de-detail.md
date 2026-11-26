# Niveaux de détail et banque d'exercices

18 novembre 2026 · Concepteur (architecture, entraînement, parcours). Intègre les décisions **F3, F4, F5** d'Arthur (`docs/decisions-phase-1.md`, section F), avant le code de la phase 3. Statut : à relire par le gérant. Les deux questions de la section 8 ont été tranchées par Arthur le 18/11 (F6, F7) et reportées le 23/11.

Les amendements correspondants sont marqués « (consolidation 18/11) » dans `docs/architecture-v2.md` § 3, `docs/specs/entrainement/moteur-verification.md`, `docs/specs/entrainement/assistant-ia.md`, `docs/specs/entrainement/regles-planification.md` (A4-3), `docs/specs/design/parcours-et-ecrans.md` et `docs/backlog-v2.md` (tâches N-01, G-01 à G-03, D-25 à D-27, et encadrés des tâches existantes).

(consolidation 23/11) Les décisions **F6** (niveau proposé selon l'objectif) et **F7** (séance dure sans exercice connu) sont reportées ici (§ 1.7, § 3.3, § 4.1, § 5, § 8) et dans les mêmes documents, avec la mention « (consolidation 23/11, F6) » ou « (consolidation 23/11, F7) ».

(consolidation 24/11) Point signalé par les développeurs de C-01 et E-09 : une séance qui a à la fois des étapes et des parties écrites. Règle au § 3.4 ; vérification S-27 et cas 19 dans `moteur-verification.md` ; tâche E-18 et amendement de D-26 dans `docs/backlog-v2.md`.

(consolidation 24/11) Point signalé par le développeur de E-14 : le prompt de l'assistant ne disait pas qu'il ne choisit jamais le niveau. Règle F-10 dans `assistant-ia.md` ; § 1.7 et § 5 ici.

## 0. En bref

- **Le niveau est un choix d'affichage, pas un autre modèle.** Même cycle, mêmes phases, mêmes séances (date, qualité, dureté, effort, durée). Le niveau dit seulement ce que le téléphone montre de la version solo : une ligne, 3 ou 4 parties, ou toutes les étapes.
- **Rien n'est effacé quand on change de niveau.** Les étapes restent enregistrées même quand la séance s'affiche « simple ». On peut monter ou descendre de niveau sans rien perdre.
- **Le générateur et les séances types remplissent toujours tout** (étapes complètes + recommandation). Le niveau ne change que l'affichage. Seules les séances écrites à la main en simple ou en grandes lignes n'ont pas d'étapes.
- **Pas de niveau imposé** (consolidation 23/11, F6). À la création d'un cycle, l'app pose la question du niveau après le choix des accents des phases, et présélectionne un niveau qui dépend d'eux (`niveauPropose`, § 1.7), avec une ligne qui dit pourquoi.
- **Le moteur vérifie toujours le contenu le plus fin qui existe.** Un seul contrôle dépend du niveau affiché : S-15 (repos réglé dans le chrono). Aucun avertissement de semaine ou de plan ne disparaît. (consolidation 23/11, F7) Une séance dure sans aucun exercice connu compte comme une séance dure ordinaire, pas comme un effort maximal ; S-26 propose de choisir son exercice principal. (consolidation 24/11) Un exercice principal des grandes lignes absent des étapes est vérifié comme un exercice de la séance (prérequis, douleurs, 48 h, quotas), sans place dans l'ordre ; S-27 le signale (§ 3.4).
- **La banque** = la bibliothèque (protocoles et exercices personnels) triée par une seule fonction commune au générateur (phase 3) et à l'assistant (phase 5).

---

## 1. Modèle de données

### 1.1 Où vit le niveau

```ts
// src/donnees/modele.ts (tâche N-01)
export type NiveauDetail = 'simple' | 'grandes_lignes' | 'detaille'
/** Du moins détaillé au plus détaillé : sert à comparer deux niveaux. */
export const NIVEAUX_DETAIL: NiveauDetail[] = ['simple', 'grandes_lignes', 'detaille']

interface Cycle            { /* … */ niveauDetail?: NiveauDetail }  // niveau par défaut du cycle ; absent = 'detaille'
interface SeancePlanifiee  { /* … */ niveauDetail?: NiveauDetail }  // remplace celui du cycle pour cette séance ; absent = celui du cycle
```

- Le niveau du cycle est choisi à la création, sur ordinateur (fenêtre O-13). (consolidation 23/11, F6) L'app y propose un niveau selon les accents des phases, sans l'imposer (§ 1.7). Il reste modifiable dans l'en-tête du cycle.
- Le niveau d'une séance est modifiable dans sa fiche, sur ordinateur seulement (R-6, B11 : le téléphone ne change pas le niveau).
- Les deux champs sont **facultatifs** : les cycles et séances déjà enregistrés (et les sauvegardes par fichier) se lisent comme « détaillé », c'est-à-dire comme aujourd'hui.

### 1.2 Contenu d'une séance à chaque niveau

Deux champs facultatifs s'ajoutent à la version solo. La version groupe ne change pas : ses objectifs bornés (blocs, essais max) sont déjà une description « en grandes lignes ».

```ts
/** (N-01) Une partie d'une séance en grandes lignes : « Échauffement · 20 min ». */
export interface PartieSeance {
  titre: string                 // « Bloc limite sur réglettes »
  dureeMin: number              // 5 à 180
  principal?: { source: 'bibliotheque' | 'perso'; refId: string } // exercice principal : ses marqueurs, prérequis et contre-indications comptent
  consigne?: string             // une phrase, 120 caractères au plus
}

interface VersionSolo extends SeanceGuidee {
  // … nom, etapes, durete, effortPrevu (inchangés)
  recommandation?: string       // une ligne, 120 caractères au plus (niveau simple)
  parties?: PartieSeance[]      // 1 à 5, écrites à la main ; absentes = calculées depuis les étapes
}
```

| Niveau | Ce que le téléphone montre | D'où ça vient |
|---|---|---|
| **Simple** | Mention « Jeudi · Doigts · dure · 1 h 30 » et la recommandation | `recommandation` si elle existe ; sinon une phrase calculée (`recommandationParDefaut`, C-01) |
| **Grandes lignes** | 3 ou 4 parties : titre, durée, exercice principal, consigne | `parties` si elles existent ; sinon calculées depuis les étapes (`partiesDepuisEtapes`, C-01) |
| **Détaillé** | Chaque étape avec chrono, séries, repos, consignes | `etapes` (inchangé) |

- **Une séance simple écrite à la main** enregistre `recommandation`, et une seule partie (`parties: [{ titre: 'Séance', dureeMin, principal? }]`) qui porte la durée et l'exercice principal choisi. Pas de champ de plus.
- **Une séance en grandes lignes écrite à la main** enregistre 2 à 5 `parties`, et `recommandation` si l'utilisateur en écrit une.
- **Une séance tirée d'une séance type ou du générateur** enregistre ses `etapes` complètes (recopiées, comme aujourd'hui) et sa `recommandation` (recopiée du catalogue, § 2.5). Ses parties ne sont pas enregistrées : elles se calculent.

**Pourquoi la recommandation est recopiée** : même raison que les étapes (architecture § 3.2) : c'est un instantané figé, que le téléphone et une future montre lisent sans relire le catalogue. Les parties, elles, se calculent depuis les étapes : les enregistrer créerait deux vérités qui divergent dès qu'on retouche une étape (R-8).

### 1.3 Valeurs calculées, jamais stockées (R-8)

| Valeur | Calcul |
|---|---|
| Niveau choisi | `seance.niveauDetail ?? cycle.niveauDetail ?? 'detaille'` |
| Niveau disponible | `etapes` non vides → détaillé ; sinon `parties` non vides → grandes lignes ; sinon simple |
| **Niveau affiché** | Le plus petit des deux. Exemple : choisi « détaillé » mais sans étapes → la séance s'affiche en grandes lignes (ou simple) ; l'ordinateur le signale dans la fiche. |
| Parties affichées | `parties` si présentes, sinon `partiesDepuisEtapes` (§ 1.4) |
| Recommandation affichée | `recommandation` si présente, sinon `recommandationParDefaut` (C-01) : avec des étapes, les titres des étapes de la partie « Effort principal » (« Suspensions max, réglette minimale (López), Bloc limite ») ; avec des parties écrites, les titres des deux premières parties reliés par « puis » ; sans rien : « Séance {qualité}, {dureté} : grimpe à ton idée. » |
| Durée de la version solo | Étapes présentes → somme des étapes ; sinon somme des parties ; sinon 0 (une séance vide reste possible, comme aujourd'hui). En grandes lignes avec des parties écrites à la main, l'écran affiche la somme des parties. |
| Marqueurs de la version solo | Union des fiches citées **partout** : `etapes[].origine.refId` ∪ `parties[].principal.refId` (plus les objectifs de groupe, comme aujourd'hui) |

### 1.4 Parties calculées depuis les étapes

`partiesDepuisEtapes(etapes, qualiteSeance, fiches)` (tâche C-01, fichier `src/regles/resumes.ts`) range chaque étape dans une famille, puis fusionne les étapes **consécutives** de même famille (ordre du gabarit A3-7) :

| Ordre | Famille (titre affiché) | Étapes |
|---|---|---|
| 1 | Échauffement | fiche de qualité `echauffement` |
| 2 | Effort principal | fiche nerveuse (marqueurs `maximale`, `poutre_intensive`, `bloc_limite`, `pan_gullich`) ou de la qualité dominante de la séance |
| 3 | Technique | qualité `technique` ou `mental` (si ce n'est pas la qualité dominante) |
| 4 | Antagonistes | qualité `antagonistes` |
| 5 | Retour au calme | qualité `mobilite` |
| 6 | Complément | le reste |

Chaque partie : titre de la famille, durée = somme des étapes, exercice principal = l'étape la plus longue, consigne = titres des étapes de la partie, séparés par des virgules. Une étape dont la fiche est inconnue va en « Complément ».

Exemples : ST-DOI-02 → Échauffement 43 min · Effort principal 47 min (suspensions max, bloc limite) · Antagonistes 20 min. ST-END-01 → Échauffement 10 · Technique 20 · Effort principal 20 (continuité longue) · Retour au calme 20. Test : chacune des 26 séances types donne 2 à 5 parties.

### 1.5 Changer de niveau

| Changement | Ce qui se passe | Ce qui est écrit |
|---|---|---|
| Détaillé → simple ou grandes lignes | Les étapes restent, cachées sur le téléphone. La recommandation et les parties affichées sont calculées tant qu'on ne les retouche pas. | `niveauDetail` seulement |
| Simple ou grandes lignes → détaillé, **avec** étapes | Les étapes réapparaissent telles quelles. | `niveauDetail` seulement |
| Simple ou grandes lignes → détaillé, **sans** étapes | La fiche dit « Cette séance n'a pas encore d'étapes. » et propose « Remplir depuis la séance type » (si `seanceTypeId`) ou « Ajouter une étape ». Tant qu'elle n'a pas d'étapes, le téléphone l'affiche à son niveau disponible. Recommandation et parties restent. | `niveauDetail`, puis les étapes ajoutées |
| Retoucher la recommandation ou une partie | La valeur calculée devient une valeur écrite. « Revenir au texte proposé » efface le champ (il redevient calculé). | `recommandation` ou `parties` |
| Grandes lignes écrites puis étapes ajoutées | Les deux coexistent : chaque niveau montre son contenu. Si les étapes changent, la fiche propose « Recalculer les grandes lignes » (efface `parties`). Le moteur vérifie les étapes ; (consolidation 24/11) un exercice principal des parties absent des étapes est vérifié lui aussi, sans place dans l'ordre, et S-27 le signale (§ 3.4). | — |
| Niveau du cycle | Toutes les séances sans niveau propre suivent. Confirmation : « Les séances suivront ce niveau. Rien n'est effacé. {n} séances gardent leur propre niveau. » ; lien « Les passer aussi en {niveau} » (efface leur `niveauDetail`). | `Cycle.niveauDetail` (et des `SeancePlanifiee.niveauDetail` effacés si demandé) |

Une séance déjà faite n'est pas touchée : la séance réalisée est un autre document.

### 1.6 Compatibilité

- **Base locale** : aucune nouvelle version de Dexie, aucun index (les champs sont dans les documents).
- **Synchronisation** : champs ajoutés et facultatifs, `versionFormat` reste 1 (aucun champ ne change de sens). Changer un niveau modifie la séance (`modifieLe`) : la règle « dernière modification gagne » s'applique comme pour un déplacement.
- **Sauvegarde** : l'export emporte les champs ; un fichier ancien se relit en « détaillé ».
- **Téléphone pas à jour** : il ne lit pas encore le plan avant la phase 4 ; quand il le lira, il aura les écrans des trois niveaux (D-22, D-27). Aucun téléphone ne verra une séance simple sans savoir l'afficher.

### 1.7 Niveau proposé à la création d'un cycle (consolidation 23/11, F6)

**Décision d'Arthur (F6)** : pas de niveau imposé. L'app pose la question à la création du cycle, et sa proposition dépend de l'objectif. Arthur garde le choix, et peut changer le niveau séance par séance (F5).

**Ce que « l'objectif » veut dire à ce moment.** Dans la fenêtre O-13, avant « Proposer un plan », le seul objectif enregistré dans le modèle est **l'accent de chaque phase** (`PhaseCycle.accent: AccentPhase | null`, `src/donnees/modele.ts`), présélectionné par `accentsDeDepart` (G-02) et modifiable (D-25). Les autres « objectifs » n'entrent pas dans la règle :
- `Cycle.objectif` (libellé et date, facultatif) se saisit plus tard, dans l'en-tête de la vue 12 semaines (D-14), et c'est un texte libre ;
- les objectifs spécifiques (`ObjectifSpecifique`, 0 à 2 par phase) se choisissent ensuite, dans O-09 ;
- l'objectif du profil est un texte libre : une règle ne le lit pas.

**La règle** (tâche N-01, `src/donnees/niveaux.ts`, fonction pure sans bibliothèque) :

```ts
/** Accents dont le cœur est un effort court et intense, réglé au chrono (« accent nerveux », regles-planification A.3.6). */
export const ACCENTS_NERVEUX: AccentPhase[] = ['doigts', 'traction_gainage', 'puissance']

/** Niveau présélectionné à la création d'un cycle, et la phrase qui dit pourquoi. Jamais 'simple'. */
export function niveauPropose(accents: (AccentPhase | null)[]): { niveau: NiveauDetail; pourquoi: string }
```

| Ordre | Condition (la première vraie l'emporte) | Niveau | `pourquoi` (mot pour mot) |
|---|---|---|---|
| 1 | Un accent choisi est dans `ACCENTS_NERVEUX` | `detaille` | « Une de tes phases travaille les doigts, la traction ou la puissance : en Détaillé, le chrono règle les temps d'effort et les repos. » |
| 2 | Liste vide, ou un accent vaut `null` | `detaille` | « Les accents de tes phases ne sont pas tous choisis : l'app propose le niveau le plus guidé. » |
| 3 | Sinon : tous les accents sont choisis, parmi `resistance`, `endurance`, `technique` | `grandes_lignes` | « Tes phases visent l'endurance, la résistance ou la technique : les grandes parties suffisent. Tu peux passer une séance de poutre en Détaillé. » |

`simple` n'est jamais présélectionné, mais il est toujours proposé : les trois choix restent affichés.

**En une phrase pour Arthur** : l'app propose Détaillé dès qu'une phase travaille les doigts, la traction ou la puissance, Grandes lignes quand toutes tes phases visent l'endurance, la résistance ou la technique ; Simple n'est jamais présélectionné, mais tu peux toujours le choisir.

**Pourquoi** [CDC] :
- *Accent nerveux → Détaillé.* Ces phases reposent sur des efforts courts et maximaux (suspensions de quelques secondes, tractions lestées, bloc à ta limite, pan), dont la sécurité tient aux temps d'effort et aux repos de 3 à 5 min [SYN, A.8]. En détaillé, le chrono les règle et le moteur vérifie ces repos (S-15) ; en grandes lignes, le chrono est libre et seuls des rappels les donnent (§ 4.2).
- *Endurance, résistance, technique → Grandes lignes.* L'effort y est sous-maximal ; sa borne tient en une consigne (« 1 min entre deux passages », recommandations du § 2.5). Le générateur remplit quand même toutes les étapes, et le moteur les vérifie (§ 3) : aucune règle de récupération ni de quota ne se perd. La séance de poutre d'entretien de ces cycles (ST-DOI-02, variante `entretien`) peut passer en Détaillé à elle seule (F5) : la ligne le rappelle.
- *Un accent manque → Détaillé.* On ne sait pas encore ce que la phase contiendra : valeur par défaut prudente (CLAUDE.md).
- *Les trois accents comptent, pas seulement le premier* : le niveau vaut pour tout le cycle, et une phase de doigts en phase 3 a besoin du même chrono qu'en phase 1.
- *Simple jamais présélectionné* : c'est le niveau le moins guidé (une ligne). Il reste un choix délibéré.

**Conséquence à connaître** : les accents de départ (`accentsDeDepart`) commencent tous par une phase de doigts ou de traction. Sans changement d'accent, la proposition est donc Détaillé ; elle passe à Grandes lignes quand toutes les phases sont d'endurance, de résistance ou de technique.

**Comment la question est posée** (O-13, § 4.1 ; tâches D-14 puis D-25) :
- La question du niveau vient **après** les accents, juste avant l'action principale.
- Le niveau proposé est présélectionné, et sa ligne `pourquoi` s'affiche sous le choix. **Aucun niveau n'est écrit sans avoir été affiché** : `Cycle.niveauDetail` reçoit toujours le niveau visible au moment de « Proposer un plan » ou de « Commencer vide ».
- Tant que l'utilisateur n'a pas touché au niveau, la présélection et sa ligne suivent les accents. Dès qu'il choisit, son choix reste. Si les accents changent ensuite et que la proposition diffère de son choix, la ligne devient « Ton choix. Pour ces accents, l'app propose {Niveau}. »
- Avant D-25, la fenêtre n'a pas encore les accents : `niveauPropose([])` donne Détaillé et la ligne 2.
- Plus tard, changer un accent dans la vue 12 semaines ne change pas le niveau et ne déclenche aucune proposition : le niveau se change dans l'en-tête du cycle (§ 1.5) ou séance par séance.

**Assistant (phase 5)** : l'assistant ne choisit jamais le niveau (§ 5).
- Demande « Brouillon de cycle » : le contexte envoie `niveauDetail: 'detaille'`. Les accents ne sont pas encore connus, et une séance type ou détaillée s'affiche ensuite à tout niveau sans rien perdre (R-9).
- Une réponse de type `cycle` s'affiche avec, en tête, « Niveau du cycle » : trois choix encre, présélection `niveauPropose` sur les accents des phases du brouillon, et sa ligne `pourquoi`. Le cycle est créé à ce niveau quand l'utilisateur garde son premier élément (C-07, D-23).
- Autres demandes (phase, semaine, ajustement) : le niveau du cycle en cours, affiché, modifiable seulement dans l'en-tête du cycle.
- (consolidation 24/11) L'assistant répond toujours au niveau envoyé : celui du contexte, ou le niveau choisi de la séance qu'il remplace. Une séance résumée porte ce niveau, jamais un autre ; au niveau détaillé, il n'en propose pas (règle F-10 de `assistant-ia.md`).

---

## 2. Banque d'exercices

### 2.1 Une seule fonction de tri

`trierFiches(fiches, profil, zones)` (tâche G-01, `src/regles/banque.ts`) range chaque fiche (protocole ou exercice personnel) en **disponible** ou **indisponible avec sa raison**, dans cet ordre (la première raison trouvée l'emporte) :

| Raison | Condition | Source |
|---|---|---|
| `a_verifier` | `exclureDeLaGeneration` défini | [AUD I-2, I-9, I-10], recherche B21 (F2) |
| `test` | `estTest` vrai : un test ne va jamais dans une séance générée, seule la fonction de test le propose (F2, point 1) | F2 |
| `prerequis` | `manquesPrerequis` non vide (E-03) ; une donnée non renseignée compte comme non remplie | S-03 |
| `douleur` | contre-indication dans `zonesDouloureuses` du jour | S-04 |
| `contexte` | grimpe en tête exigée et non remplie (S-07), ou terrain hors des lieux du profil (§ 2.2) | S-07, [AUD I-13] |

Utilisée par : le générateur (G-03), le menu « Ajouter une séance type » du constructeur (D-16 : les séances possibles d'abord, les autres en pointillé avec leur raison, toujours ajoutables à la main), l'assistant (E-13 : `fichesDisponibles` et `fichesIndisponibles`). `seancesTypesDisponibles(disponibles)` garde une séance type (et chaque variante) seulement si toutes ses fiches, solo et mini-bloc, sont disponibles (règle déjà écrite pour E-13, déplacée ici). Une fiche indisponible reste visible et ajoutable à la main dans la bibliothèque : on avertit sans bloquer. Étiquette dans la bibliothèque : « À LA MAIN SEULEMENT » pour `a_verifier` et `test` (remplace « HORS ASSISTANT »).

### 2.2 Le contexte : lieux, groupe, corde

Un champ de profil (tâche D-20) : `Profil.lieux: LieuEntrainement[]`, avec `LieuEntrainement = 'salle_bloc' | 'salle_voie' | 'maison'`. Écran : « Où tu t'entraînes » : « Salle de bloc », « Salle avec des voies (corde et assureur) », « À la maison (poutre ou barre) ». Vide = pas renseigné → on suppose **salle de bloc seulement** (prudence : pas de corde, rien à la maison).

| Terrain de la fiche (`contexte.terrain`) | Disponible si les lieux contiennent |
|---|---|
| absent, `bloc`, `pan` | `salle_bloc` ou `salle_voie` |
| `voie` (et `partenaire`) | `salle_voie` |
| `poutre`, `barre` | une salle ou `maison` |
| `sol` | toujours |

- **Groupe** : pas un filtre. Le générateur prépare la version groupe chaque fois que la séance type en a une (le mode se choisit le jour même) ; `groupe: null` pour les séances sans version groupe (B19).
- **Corde** : terrain `voie` + `salle_voie` ; la grimpe en tête reste contrôlée par S-07.

### 2.3 Ce que le générateur reçoit

`genererCycle(entrees)` (tâche G-03, `src/regles/generateur.ts`), fonction pure : elle rend des documents, l'écran (D-25) les écrit.

| Entrée | D'où | Défaut |
|---|---|---|
| Profil (avec lieux, prérequis, discipline, ancienneté, poutre) | profil enregistré, converti par C-01 | — |
| Douleurs | profil + douleurs déclarées | — |
| Début, nom | fenêtre O-13 | lundi suivant, « Cycle de {mois} » |
| Séances par semaine | O-13 (2 à 5) | `profil.seancesParSemaine` |
| Jours | `profil.joursDisponibles` | jours conseillés (§ 2.4) |
| Accents des 3 phases | O-13, proposés par `accentsDeDepart(profil)` | tableau A.2 |
| Niveau de détail | O-13 : choisi par l'utilisateur | (consolidation 23/11, F6) présélection `niveauPropose(accents)` (§ 1.7) |
| Semaine allégée et réduction | `Reglages.reglesSecurite` | active, 50 % |

Hors du générateur en phase 3 (choix de simplicité) : le mode « objectif daté » (l'affûtage se règle à la main, P-05 le rappelle) et les modules d'objectifs spécifiques (choisis ensuite dans O-09 ; l'assistant pourra les placer en phase 5).

### 2.4 Comment il choisit

1. **Accents** (`accentsDeDepart`, A.2) : moins d'un an de pratique → traction_gainage, endurance, puissance ; voie → doigts, endurance, résistance ; sinon → doigts, puissance, résistance.
2. **Jours** : si les jours disponibles contiennent les jours conseillés, on les prend ; sinon les `n` premiers jours disponibles de la semaine. Moins de jours que de séances : le plan en compte autant que de jours, et le dit. Jours conseillés : 2 → mardi, samedi ; 3 → mardi, jeudi, samedi ; 4 → lundi, mardi, jeudi, samedi ; 5 → lundi, mardi, jeudi, vendredi, samedi (A.3.4 à A.3.7).
3. **Une séance par jour**, prise dans le tableau ci-dessous : pour chaque case, **la première séance type disponible** (§ 2.1) dont les fiches ne dépassent pas leur `maxParSemaine` avec les séances déjà choisies dans la semaine. Sinon la liste de secours du rôle ; sinon aucune séance ce jour-là, et le générateur le dit (« Pas de séance possible le jeudi avec ton profil ou tes douleurs : repos »).
4. **Semaines 1 à 3** : mêmes séances (A1-7, un même protocole toute la phase). **Semaine 4** : allégée par `allegerSeance` (A4-3, A4-5, A6-9 : séries divisées par deux, minutes × (1 − réduction), note « niveau flash plutôt que projet », blocs des objectifs divisés par deux), si la semaine allégée est active. Les étapes d'échauffement gardent leur durée (F2, point 6 : échauffement complet avant un effort maximal) ; la semaine allégée reste donc un peu au-dessus de la cible, et W-10 le dit en information.
5. **Vérification** : `verifierPlan` sur le résultat ; les avertissements sont rendus avec le plan, jamais cachés. Le cycle est créé en **brouillon** (invisible sur le téléphone jusqu'à « Valider le cycle »).

**Tableau des choix** (tâche G-02, `src/donnees/semainesTypes.ts`). Source : C.3 de `seances-types.md` pour 3 et 4 séances [SYN] ; 2 séances, 5 séances et les accents traction, endurance, technique : [CDC] construits sur A.3.6, A.3.7 et C.3. « a | b » = a, sinon b. « (v) » = variante.

| Accent | 2 séances : mar N · sam N/C (consolidation 24/11 : le rôle d'une case est celui de sa première séance type) | 3 séances : mar N · jeu N/C · sam L/C | 4 séances : lun N · mar L · jeu N/C · sam C |
|---|---|---|---|
| doigts | DOI-02 \| DOI-01 · PUI-04 \| END-02 | DOI-02 \| DOI-01 · TRA-02 \| TRA-01 · END-02 | DOI-02 \| DOI-01 · TEC-01 · PUI-02 \| PUI-01 · END-02 |
| traction_gainage | TRA-02 \| TRA-01 · PUI-04 \| END-02 | TRA-02 \| TRA-01 · TRA-03 \| TRA-01 · END-02 | TRA-02 \| TRA-01 · TEC-01 · TRA-03 \| TRA-01 · END-02 |
| puissance | PUI-02 (poutre_entretien) \| PUI-02 \| PUI-01 · TRA-02 \| TRA-01 | PUI-02 (poutre_entretien) \| PUI-02 \| PUI-01 · TRA-02 \| TRA-01 · END-02 | PUI-03 \| PUI-01 · END-01 · PUI-02 (poutre_entretien) \| PUI-02 \| TRA-02 · RES-01 |
| resistance | DOI-02 (entretien) \| DOI-01 \| PUI-01 · RES-01 | DOI-02 (entretien) \| DOI-01 \| PUI-01 · RES-01 · RES-03 \| RES-02 | DOI-02 (entretien) \| DOI-01 · TEC-01 · RES-02 · RES-01 |
| endurance | DOI-02 (entretien) \| DOI-01 \| PUI-01 · END-02 | DOI-02 (entretien) \| DOI-01 \| PUI-01 · END-02 · END-01 | DOI-02 (entretien) \| DOI-01 · END-01 · TRA-01 · END-02 |
| technique | DOI-02 (entretien) \| DOI-01 · TEC-01 | DOI-02 (entretien) \| DOI-01 · TEC-01 · END-01 | DOI-02 (entretien) \| DOI-01 · TEC-01 · TRA-01 · END-01 |

(Les identifiants sont abrégés : DOI-02 = ST-DOI-02.)
- **5 séances** : les 4 séances de la colonne « 4 séances », plus le vendredi ST-HOR-01 (hors grimpe, A.3.7).
- **Grimpeur de voie** avec `salle_voie` : la dernière séance de la semaine devient ST-END-03 si elle est disponible (« lecture voie », C.3).
- **Variante `lestee`** de ST-DOI-02 à la place de la version de base quand elle est disponible (poutre régulière), sauf si la case demande `entretien`.
- **Secours par rôle** : N → ST-TRA-01, ST-END-02 ; C → ST-RES-01, ST-END-02, ST-END-01 ; L → ST-END-01, ST-END-05 ; H → ST-HOR-01.

Contrôle (tests de G-03) : avec le profil de référence du moteur (B.11), chaque accent et chaque nombre de séances donne un plan **sans avertissement fort** ; aucune séance générée ne contient de fiche `a_verifier`, `test`, contre-indiquée ou hors lieux ; aucun `maxParSemaine` dépassé ; générer au niveau simple et au niveau détaillé donne exactement les mêmes étapes.

### 2.5 Comment chaque niveau se remplit depuis une séance type

| Niveau | Rempli par | Exemple (ST-DOI-02) |
|---|---|---|
| Simple | `recommandation` du catalogue (tableau ci-dessous), recopiée ; mention type, dureté, durée calculées | « Jeudi · Doigts · dure · 1 h 50 — Suspensions max sur réglette minimale, puis bloc à ta limite : 4 essais max par bloc. » |
| Grandes lignes | parties calculées depuis les étapes recopiées (§ 1.4) | Échauffement 43 min · Effort principal 47 min · Antagonistes 20 min |
| Détaillé | étapes recopiées (C-01, `seanceDepuisType`, inchangé) | les 5 étapes avec chrono |

**Recommandations du catalogue** (tâche E-10 : champ `recommandation` de `SeanceType`, 120 caractères au plus). Elles reprennent les bornes de sécurité des fiches (essais max, repos, écart de 6 h) [fiches de la bibliothèque] ; la formulation est un choix de conception [CDC].

| Séance | Recommandation |
|---|---|
| ST-DOI-01 | Échelles 3-6-9 sur la poutre, puis bloc à ta limite : 4 essais max par bloc. |
| ST-DOI-02 | Suspensions max sur réglette minimale, puis bloc à ta limite : 4 essais max par bloc. |
| ST-DOI-03 | Réglette minimale sur la poutre (méthode Hörst), puis blocs raides sans lâcher les pieds. |
| ST-DOI-04 | Suspensions 7 s / 3 s sur la poutre, puis 1 min de grimpe, 1 min de repos, 10 fois. |
| ST-DOI-05 | Suspensions légères pieds au sol, puis étirements. 6 h d'écart avec toute autre séance. |
| ST-TRA-01 | Blocs sans lâcher les pieds, puis tractions 4 × 5 et tractions négatives. |
| ST-TRA-02 | Bloc à ta limite, 4 essais max par bloc, puis tractions lestées 4 × 3. |
| ST-TRA-03 | Blocs sans lâcher les pieds, puis tractions à prises décalées. |
| ST-PUI-01 | Bloc à ta limite, 4 essais max par bloc, puis tractions explosives 3 × 3. |
| ST-PUI-02 | Bloc limite sur planche d'escalade : 4 essais max par bloc, 4 min de repos. |
| ST-PUI-03 | Pan Güllich d'initiation en début de séance, puis bloc à ta limite : 4 essais max par bloc. |
| ST-PUI-04 | Intervalles de force : 6 blocs connus, 3 passages chacun, 3 min de repos. |
| ST-PUI-05 | Bloc sans pieds en début de séance, 4 séries de 3, puis blocs sans lâcher les pieds. |
| ST-RES-01 | Blocs triplés à ton niveau flash : 6 séries, 1 min entre deux passages. |
| ST-RES-02 | Bloc à la minute, 8 départs, puis 4 × 4 de blocs un peu sous ton niveau. |
| ST-RES-03 | Blocs longs répétés : 3 séries de 4 passages de 30 à 50 s. |
| ST-RES-04 | Enchaînement de deux blocs, 4 passages, puis pan Güllich pieds posés. |
| ST-END-01 | Technique des pieds et grimpe au ralenti, puis 20 min de continuité facile. |
| ST-END-02 | 1 min de grimpe, 1 min de repos, 10 fois, puis 10 min de continuité facile. |
| ST-END-03 | Voies faciles en séries : 3 séries de 3 voies, 8 min de repos entre les séries. |
| ST-END-04 | Voies faciles doublées : 6 séries. Séance longue, garde de la marge. |
| ST-END-05 | Échauffement dynamique, grimpe de récupération 3 × 5 min, puis étirements. |
| ST-TEC-01 | Un seul contact par prise, puis volume de blocs 4 × 4, de plus en plus propre. |
| ST-TEC-02 | Lecture avant l'à-vue, puis faire la course sur une voie connue, 5 passages. |
| ST-TEC-03 | Échauffement complet, puis essais sur ton projet après travail. |
| ST-HOR-01 | Échauffement dynamique, puis 25 min de grand écart latéral. |

Une variante garde la recommandation de sa séance, sauf `entretien` de ST-DOI-02 : « Suspensions max sur réglette minimale, puis bloc limite court (20 min) : 4 essais max par bloc. » Les séances ajoutées après la recherche B21 reçoivent leur recommandation dans la même tâche que leur saisie.

---

## 3. Moteur de vérification

### 3.1 Principe

Le moteur vérifie **le contenu enregistré, au niveau le plus fin qui existe**, quel que soit le niveau affiché. Un niveau plus simple cache des détails à l'écran ; il ne retire aucune règle de récupération, de quota ni de douleur. La passerelle C-01 construit la vue du moteur ainsi :

| Contenu de la version solo | `etapes` de la vue | Marqueurs | Durée |
|---|---|---|---|
| Étapes présentes | les étapes réelles ; (consolidation 24/11) les principaux des parties écrites absents des étapes à part, dans `principauxHorsEtapes` (§ 3.4) | fiches des étapes ∪ exercices principaux des parties écrites | somme des étapes |
| Pas d'étapes, des parties | une étape résumée par partie qui a un exercice principal (`ficheId` = principal, `dureeMin` = durée de la partie) | fiches des principaux | somme des parties (`VersionVerif.dureeMin`) |
| Rien de connu (aucune fiche) | aucune | aucun (consolidation 23/11, F7 : une version dure est une séance dure ordinaire, § 3.3) | somme des parties |

Nouveaux champs de la vue (E-01) : `VersionVerif.niveau?: NiveauDetail` (niveau affiché ; absent = détaillé) et `VersionVerif.etapesDetaillees?: boolean` (faux quand les étapes sont résumées ; absent = vrai). La version groupe garde toujours ses étapes réelles (mini-bloc) et le niveau détaillé.

### 3.2 Ce qui s'applique à chaque niveau

| Règles | Détaillé | Grandes lignes | Simple |
|---|---|---|---|
| **Semaine et plan** : 48 h (W-01), quotas (W-02 à W-05), jours de doigts (W-06), séances dures (W-08), charge et semaine allégée (W-09 à W-12), entretien des qualités (W-13), accent (W-14), poutre et ancienneté (W-15), antagonistes (W-16, W-17), modules (W-18), suspensions légères (W-19), P-01 à P-14 | oui | oui | oui |
| **Fiches citées** : fiche inconnue (S-01), à vérifier (S-02), prérequis (S-03), douleurs (S-04 à S-06), tête et partenaire (S-07, S-08), voie (S-09), bidoigts (S-18), exercice perso non qualifié (S-19) | sur les étapes et (consolidation 24/11) les principaux hors étapes (§ 3.4) | sur les étapes et les principaux hors étapes ; sans étapes, sur les exercices principaux des parties | sur les étapes et les principaux hors étapes ; sans étapes, sur l'exercice principal |
| Dureté et effort maximal (S-17) | oui | oui | oui |
| **Ordre du déroulé** : échauffement (S-10, S-11), effort maximal après un travail congestionnant (S-12), pan en début de séance (S-13), deux suspensions max (S-14), bloc nerveux trop long (S-16), modules (S-24, S-25) | oui | oui si la séance a des étapes ; sinon non (P-15 et rappels au téléphone) | oui si la séance a des étapes ; sinon non (P-15 et rappels au téléphone) |
| **Repos réglé dans le chrono** (S-15) | oui | non : le chrono réglé n'est pas lancé ; le téléphone rappelle « 3 à 5 min de repos entre deux efforts maximaux » | non : même rappel |
| Groupe (S-20 à S-23) | oui | oui | oui |
| Jour (J-01 à J-07) | oui | oui | oui |

### 3.3 Ajouts au moteur (amendements de `moteur-verification.md`)

- **Séance dure sans contenu connu** (B.2 ; consolidation 23/11, F7, décision d'Arthur qui remplace la prudence du 18/11) : une version solo **dure** sans aucune fiche connue est une **séance dure ordinaire**. Elle ne porte aucun marqueur (ni `maximale` ni marqueur à quota). Règle par règle :
  - **W-01** (48 h) : muette. La règle des 48 h s'applique à cette séance comme à toute séance dure : elle ne vise que les séances maximales et de poutre intensive (A3-1, A.3.8), et celle-ci n'en est pas une tant qu'aucun exercice maximal n'est choisi ;
  - **W-06** (jours de doigts) : inchangée. Elle compte comme un jour de doigts, sauf si sa qualité est `mobilite` ou `antagonistes` (prudence gardée : elle ne dépend pas du marqueur `maximale`) ;
  - **W-12** (efforts maximaux en semaine allégée), **J-02** et **J-04** (sommeil, récupération) : elle n'est pas comptée comme séance maximale ;
  - **W-13** (entretien) : inchangée. Elle entretient sa qualité dominante ;
  - **W-08**, **W-09**, **W-10**, **S-05**, **J-01**, **J-03**, **J-07** : elle compte comme toute séance dure (`estDure`, effort prévu 7) ;
  - **S-26** : information ci-dessous.
- **S-26 Séance dure sans exercice connu** — information, portée séance (consolidation 23/11, F7, nouveau texte) : « « {seance} » est notée dure, sans exercice de la bibliothèque : l'app la compte comme une séance dure ordinaire. Si tu y fais de la poutre ou du bloc à ta limite, choisis son exercice principal : la règle des 48 h et les quotas en tiendront compte. » [CDC]
- **P-15 Séances sans étapes** — information, portée plan, une fois : « {n} séances n'ont pas d'étapes détaillées : l'app vérifie la récupération, les quotas et tes douleurs, mais pas l'ordre des exercices ni les repos. Ton téléphone te rappellera ces règles pendant la séance. » [CDC]
- **S-27 Exercice des grandes lignes absent des étapes** (consolidation 24/11) — information, une par exercice : texte et règle au § 3.4.

Aucun avertissement fort ne disparaît : les seuls contrôles qui ne tournent pas sans étapes (ordre, repos) sont remplacés par des rappels affichés pendant la séance (§ 4.2), et P-15 le dit sur ordinateur.

### 3.4 Étapes et grandes lignes écrites ensemble (consolidation 24/11)

**Le cas.** Une séance peut avoir des étapes **et** des parties écrites : rien n'est effacé quand on change de niveau (R-9), et le § 1.5 le permet (« Grandes lignes écrites puis étapes ajoutées », ou « Modifier le texte » sur des parties calculées). L'exercice principal d'une partie peut alors manquer dans les étapes. Le téléphone montre les parties en grandes lignes, les étapes en détaillé : selon le niveau affiché, Arthur fait l'un ou l'autre.

**Constat sur le code livré (24/11).** La vue du moteur ne lisait que les étapes. Ce principal n'était vérifié ni pour les prérequis, ni pour les douleurs, ni pour la règle des 48 h et les quotas de la séance prévue. Il ne comptait qu'après coup, dans les marqueurs de la séance réalisée (`marqueursVersionPlanifiee`, C-01). Exemple (cas 19 de B.11) : étapes « Échauffement complet, Tractions 4 × 5 », partie « Effort principal » sur « Suspensions max lestées (López) », le lendemain d'une séance maximale : ni S-03 (poutre régulière exigée), ni W-01 (48 h), et ni S-04 si les doigts font mal.

**La règle.** Un exercice principal absent des étapes (« principal hors étapes ») est un exercice **de la séance**, **sans place dans l'ordre**.
- **Il compte** partout où l'app se demande ce que la séance demande au corps et au profil : ses marqueurs (W-01 à W-04, W-12, W-20, S-17, S-21, J-02, J-04, P-08), les vérifications de fiche (S-01 à S-09 sauf S-05, S-18, S-19), les jours de doigts (W-06) et le plafond de sa fiche (W-05).
- **Il ne compte pas** là où l'app lit l'ordre, les repos ou les minutes : S-10 à S-16, S-24, S-25, la durée et la charge (somme des étapes, § 1.3). Les règles d'entretien et de contenu de la semaine (W-11, W-13, W-16, W-17, W-19) restent sur les étapes.
- **S-27** (information, une par exercice) le dit : « « {nom} » est dans les grandes lignes de « {seance} », pas dans ses étapes. L'app vérifie ses prérequis, tes douleurs et la récupération, mais pas sa place dans la séance. Mets-les d'accord : ajoute cet exercice aux étapes, ou recalcule les grandes lignes. » [CDC]
- Même règle à tous les niveaux affichés : changer de niveau ne fait apparaître ni disparaître aucun avertissement.
- Rien n'est stocké (R-8) : la passerelle (C-01) calcule `principauxHorsEtapes` à chaque vérification. Rien n'est effacé (R-9).

**En une phrase pour Arthur** : si tes grandes lignes citent un exercice absent de tes étapes, l'app le vérifie quand même (prérequis, douleurs, 48 h, quotas), sans juger sa place dans la séance, et te propose de mettre les deux d'accord.

**Pourquoi** [CDC] :
- *Prudence.* En grandes lignes, Arthur fait ce principal : ses contre-indications et ses prérequis doivent être vus avant la séance, et un effort maximal doit compter dans les 48 h. S'il suit les étapes, le compter ajoute au pire un avertissement : on avertit, on ne bloque pas.
- *Le contenu le plus fin d'abord.* L'ordre reste celui des étapes. Ajouter le principal à la fin des étapes fausserait S-10 à S-13 (par exemple S-11 sur une poutre placée « après » tout le reste) ; résumer les étapes couperait les contrôles d'ordre d'une séance qui a un vrai déroulé.
- *Prévu et fait comptent pareil.* Les marqueurs de la séance prévue sont ceux que la séance réalisée recopie (`marqueursVersionPlanifiee`) : la règle des 48 h voit la même chose avant et après.
- *Pas de vérification selon le niveau affiché* : les avertissements changeraient avec le niveau, ce que le § 3.1 exclut.
- *Pas de blocage à l'édition* : on avertit sans bloquer, et l'écart naît aussi quand on ajoute des étapes à des grandes lignes écrites.
- *Entretien et contenu de la semaine sur les étapes* (W-11, W-13, W-16, W-17, W-19) : ce sont des informations, pas des règles de sécurité. Compter le principal pourrait en masquer une (« qualité non entretenue », « antagonistes insuffisants ») alors que la version détaillée ne le contient pas.

**Écran** (D-26) : S-27 s'affiche en tête de la fiche de séance, avec « Recalculer les grandes lignes » (confirmation, puis `parties` effacé : les parties redeviennent calculées depuis les étapes) et « Voir les étapes ». Choisir un principal absent des étapes reste permis.

**Exercice principal inconnu** (consolidation 25/11, audit phase 3, M-12) : quand la fiche d'un exercice principal n'existe pas (exercice personnel supprimé, identifiant inventé), S-01 a son propre message, écrit par le moteur : « Cet exercice n'existe pas dans ta bibliothèque ({ficheId}). Choisis un autre exercice principal pour la partie qui le cite. » (`moteur-verification.md` B.5). Il vaut pour un principal hors étapes (portée séance) comme pour une étape résumée d'une séance sans étapes (portée étape). L'écran affiche le message tel quel : il ne le réécrit plus.

---

## 4. Écrans

### 4.1 Ordinateur

- **O-13 Nouveau cycle** (nouvelle fenêtre, depuis le tableau de bord et la vue 12 semaines ; tâches D-14 puis D-25), dans cet ordre (consolidation 23/11, F6 : le niveau vient après les accents) : nom, date de début (un lundi), séances par semaine (2 à 5), jours (rappel du profil), lieux (rappel du profil, « Modifier dans ton profil »), accents proposés des 3 phases (modifiables, D-25), puis **niveau de détail** en choix encre, chacun avec sa ligne d'exemple :
  - « Simple — Jeudi · Doigts · dure · 1 h 30 : Bloc limite sur réglettes, 4 essais max. »
  - « Grandes lignes — Échauffement 30 min · Bloc limite 45 min · Antagonistes 15 min. »
  - « Détaillé — Chaque étape avec son chrono, ses séries et ses repos. »
  - (consolidation 23/11, F6) présélection `niveauPropose(accents)` et, sous le choix, sa ligne `pourquoi` (§ 1.7) ; la présélection suit les accents tant que l'utilisateur n'a pas choisi lui-même ;
  - aide : « Tu pourras changer le niveau du cycle ou d'une séance à tout moment. Rien n'est effacé. »
  - action principale « Proposer un plan » (générateur, D-25 ; en D-14 seule : « Créer le cycle ») ; action seconde « Commencer vide ». Les deux écrivent le niveau affiché, jamais un autre.
  - Après « Proposer un plan » : la vue 12 semaines s'ouvre sur le cycle brouillon, avec les avertissements (D-18) et une ligne d'information par manque du générateur.
- **O-03 Vue 12 semaines** : dans l'en-tête, « Niveau : Grandes lignes » (choix encre) ; changer ouvre la confirmation du § 1.5.
- **O-05 Fiche de séance** (D-26) : choix « Niveau : comme le cycle (grandes lignes) / Simple / Grandes lignes / Détaillé ». L'éditeur suit le niveau choisi :
  - *Simple* : recommandation (une ligne, compteur de caractères), durée, exercice principal (facultatif, « Choisir dans la bibliothèque », avec les étiquettes PRÉREQUIS et contre-indication) ;
  - *Grandes lignes* : 1 à 5 parties (titre, durée, exercice principal facultatif, consigne courte), « Ajouter une partie », « Monter », « Descendre », « Retirer » ;
  - *Détaillé* : l'éditeur actuel (D-16).
  - Une séance avec des étapes affichée en simple ou en grandes lignes montre le résumé calculé, avec « Modifier le texte » et « Voir les étapes ».
  - Avertissements : un avertissement qui vise une étape cachée s'affiche en tête de la fiche, avec le nom de l'étape. Aucun ne disparaît. (consolidation 24/11) S-27 propose « Recalculer les grandes lignes » et « Voir les étapes » (§ 3.4). (consolidation 25/11, audit phase 3) Une séance **sans étapes** n'a que des étapes résumées (une par partie qui a un exercice principal, § 3.1) : la ligne au-dessus de l'avertissement dit alors « Partie « {titre de la partie} » », jamais « Étape « inconnue » ».
- **Aucun lancement de séance sur ordinateur** (R-6, B12), à aucun niveau.

### 4.2 Téléphone

- **T-06 Aujourd'hui** et **T-07 Programme** (D-22) : la fiche de la séance suit le niveau affiché : étapes numérotées (détaillé), parties avec leur durée (grandes lignes), recommandation en grand (simple). Sous-titre du bouton solo : « Séance guidée, chrono intégré » (détaillé) ; « Grandes lignes, chrono libre » ; « Recommandation, chrono libre » (simple). Le bouton groupe ne change pas.
- **T-16 Séance en bref** (nouvel écran, D-27), pour le simple et les grandes lignes :
  - en haut : nom, mention « Doigts · dure · 1 h 30 » ; **chrono libre** (temps écoulé, gros chiffres, `Démarrer` / `Pause`) ;
  - simple : la recommandation ; grandes lignes : les parties en lignes cochables (« Fait », « Passé »), avec durée, exercice principal et consigne ; « Voir la fiche » ouvre la fiche de l'exercice principal en lecture ;
  - « Lancer un repos » (minuteur de repos existant, 3 min par défaut, choix de 1 à 5 min) ;
  - **rappels de sécurité** pour une séance dure : « Échauffe-toi 20 à 30 min, de plus en plus dur, avant tout effort maximal. » ; « Entre deux efforts maximaux : 3 à 5 min de repos. » ; « Arrête l'effort maximal quand deux essais de suite sont nettement moins bons que le meilleur. » [SYN, A.8] ; et le rappel de sécurité du bloc avant une séance de bloc limite (F2, point 11), comme en détaillé ;
  - **« Stop, ça fait mal »** toujours visible (bouton d'arrêt brique), vers les mises en garde ; le signal d'arrêt d'une douleur déclarée reste en haut d'Aujourd'hui ;
  - action principale « Terminer la séance » → Trois questions → Débrief, comme aujourd'hui. La séance réalisée : `mode: 'solo'`, `dureeMin` = temps écoulé (modifiable dans les trois questions s'il le faut), `etapes` = une entrée par partie (`titre`, `statut`, `refId` = exercice principal), `marqueurs` = ceux de la version planifiée (C-01).
- **T-08 Séance solo** (détaillé) : inchangée.
- Le téléphone ne change pas le niveau (B11) ; « Déplacer » et « Sauter » marchent à tous les niveaux.
- (consolidation 26/11, cadrage phase 4, D-27) Trois précisions, après relecture contre le code : (1) la durée n'est **pas** modifiable dans les trois questions (T-11 inchangé) : c'est le temps du chrono libre, ou, s'il n'a jamais été démarré, le temps depuis l'ouverture de l'écran (même règle qu'en détaillé ; sinon un oubli de « Démarrer » enregistrerait 0 min et fausserait la charge) ; (2) « comme en détaillé » pour le rappel de sécurité du bloc était faux : rien ne l'affichait, ni en détaillé ni en groupe ; D-27 l'affiche en tête des trois écrans de séance (T-08, T-09, T-16) pour une séance de bloc limite ; (3) « Stop, ça fait mal » est collé en haut, comme en T-08 et T-09.

---

## 5. Assistant IA (phase 5)

- **Niveau d'un nouveau cycle** (consolidation 23/11, F6) : l'assistant ne le choisit pas. Pour « Brouillon de cycle », le contexte envoie `'detaille'` ; la réponse affiche en tête « Niveau du cycle », présélectionné par `niveauPropose` sur les accents du brouillon, avec sa ligne `pourquoi` ; le cycle est créé à ce niveau quand l'utilisateur garde son premier élément (§ 1.7).
- **Contexte** (D.3) : `niveauDetail` du cycle en cours (`'detaille'` pour un brouillon de cycle, consolidation 23/11) ; chaque séance type envoyée porte sa `recommandation` ; `fichesDisponibles` et `fichesIndisponibles` viennent de `trierFiches` (G-01), raison `test` en plus ; `profil.lieux`. L'assistant ne pioche **que** dans cette banque envoyée (F-6, A-02 inchangés).
- **Réponse** (D.4) : une `SeanceBrouillon` peut être (1) une séance type, valable à tous les niveaux (préférée) ; (2) une séance composée étape par étape (détaillé) ; (3) **nouveau** : une séance résumée `{ niveau: 'simple' | 'grandes_lignes', recommandation, parties: [{ titre, dureeMin, ficheId?, consigne? }] }`, avec 1 partie en simple et 2 à 5 en grandes lignes (règle F-9). Chaque `ficheId` doit venir de la banque envoyée. (consolidation 24/11) `niveau` répète le niveau envoyé : un autre niveau, ou une séance résumée quand le niveau envoyé est détaillé, est refusé (F-10, A-01).
- **Expansion et vérification** : une séance résumée devient une version solo sans étapes (§ 1.2) ; le moteur la vérifie comme au § 3 (origine `assistant`, S-02 en fort inchangé).
- **Prompt** (D.6) : un paragraphe sur les niveaux (préférer les séances types à tout niveau ; en simple, une ligne qui garde les bornes de sécurité et la fiche principale ; jamais de fiche hors de la liste). (consolidation 24/11) Il dit aussi « Tu ne choisis jamais le niveau de détail » et demande de répondre au niveau envoyé.

## 6. Montre (`docs/format-seance.md`)

Effet limité, à documenter par N-01 (§ 4.1 et 4.2 du format) : `niveauDetail` facultatif sur le cycle et la séance ; `recommandation` et `parties` facultatifs sur la version solo. Consignes pour une app native : si `etapes` n'est pas vide, elle peut toujours exécuter les étapes, quel que soit le niveau ; si `etapes` est vide, afficher la recommandation et les parties avec un chrono libre, ou ne pas proposer la séance si elle ne sait pas le faire (prudence). Les parties calculées ne sont pas dans le document : sans la bibliothèque, la montre montre les étapes. Aucun changement du chrono ni de la séance réalisée.

## 7. Tâches

Détail et vagues dans `docs/backlog-v2.md`.

| Tâche | Contenu | Modèle | Vague |
|---|---|---|---|
| **N-01** | Types (`NiveauDetail`, `PartieSeance`, champs facultatifs) et fonctions de niveau sans bibliothèque ; `docs/format-seance.md` | Sonnet | 3.0 (nouvelle, seule) |
| **G-02** | Tableau des choix du générateur, jours conseillés, accents de départ (données) | Haiku | 3.6 |
| **G-01** | Banque : `trierFiches`, lieux, `seancesTypesDisponibles` | Sonnet | 3.7 |
| **G-03** | Générateur de cycle et allègement de la semaine 4 | Sonnet | 3.8 |
| **D-25** | Fenêtre « Nouveau cycle » : accents et « Proposer un plan » | Sonnet | 3.9 |
| **D-26** | Fiche de séance aux trois niveaux sur ordinateur | Sonnet | 3.11 |
| **D-27** | Séance en bref sur téléphone (simple, grandes lignes) | Sonnet | 4.2 |
| Amendées | D-20 (lieux), E-01, E-02, E-04, E-06, E-07, E-09, E-10, E-16, C-01, D-11, D-14, D-16, D-19 (phase 3) ; D-22 (phase 4) ; E-11, E-12, E-13, E-14, C-07, D-23 (phase 5) | | |
| Amendées le 23/11 | F6 : N-01, D-14, D-25 (phase 3) ; E-13, C-07, D-23 (phase 5). F7 : E-02, E-04, E-05, E-06, E-08, E-09 (phase 3) | | |
| **E-18** (consolidation 24/11) | Principal des grandes lignes absent des étapes : vérifié comme exercice de la séance, S-27 (§ 3.4) | Sonnet | 3.8 |
| Amendée le 24/11 | D-26 (affichage de S-27) ; E-11, E-13, E-14, C-07 (assistant : niveau envoyé, jamais choisi, F-10) | | |

## 8. Décisions d'Arthur sur les questions Q1 et Q2

Posées le 18/11, tranchées par Arthur le 18/11 (`docs/decisions-phase-1.md`, F6 et F7), reportées le 23/11. Les recommandations du 18/11 (Détaillé imposé pour Q1, « Oui » pour Q2) ne s'appliquent plus.

| # | Question | Réponse d'Arthur | Ce qui change |
|---|---|---|---|
| **Q1** | Quel niveau l'app propose-t-elle par défaut quand tu crées un cycle : Détaillé, Grandes lignes ou Simple ? | **F6** : pas de niveau imposé. L'app pose la question à la création du cycle, et la proposition dépend de l'objectif. | (consolidation 23/11, F6) § 1.7 : `niveauPropose(accents)` remplace la constante de niveau par défaut prévue le 18/11 ; la question vient après les accents, avec une ligne qui dit pourquoi (O-13, § 4.1) ; l'assistant ne choisit pas le niveau (§ 5). |
| **Q2** | Une séance écrite à la main, notée « dure », sans aucun exercice de la bibliothèque : l'app la compte-t-elle comme un effort maximal pour la règle des 48 h ? | **F7 : non.** Elle compte comme une séance dure ordinaire, pas comme un effort maximal. | (consolidation 23/11, F7) § 3.1 et § 3.3 : plus aucun marqueur pour cette séance ; W-01, W-12, J-02, J-04 ne la comptent pas ; W-06, W-13 et les règles de toute séance dure s'appliquent ; S-26 reste une information, reformulée. |
