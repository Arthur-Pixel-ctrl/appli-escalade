# E. Tâches de réalisation (entraînement)

Expert entraînement, 17 novembre 2026. Tâches autonomes pour des développeurs qui démarrent sans contexte (Sonnet ou Haiku).

## À lire par le gérant avant de distribuer

> **(consolidation 17/11)** L'ordre de distribution et les amendements de chaque tâche sont dans `docs/backlog-v2.md`, qui prime sur ce fichier. Points principaux : le dossier est déjà dans le dépôt ; les emplacements `src/regles/`, `src/assistant/`, `src/donnees/` sont confirmés ; l'**adaptateur stockage → vue** est la tâche **C-01** (phase 3), et le catalogue des objectifs spécifiques la tâche **C-02** ; `ZoneDouleur` (avec `'autre'`) s'importe de `src/donnees/profil.ts` ; la période de 4 semaines s'appelle « phase » à l'écran (B9) mais les noms internes du moteur restent ; les questions Q1 à Q10 ci-dessous sont tranchées (voir le tableau en fin de fichier).

- **Copier ce dossier** (`/home/claude/v2/specs/entrainement/`) dans le dépôt sous `docs/specs/entrainement/` : les tâches citent ces chemins.
- Emplacements proposés : `src/regles/` (moteur), `src/assistant/` (assistant), `src/donnees/` (catalogue). L'architecte peut les déplacer ; il suffit alors de changer les chemins dans les tâches.
- Le moteur ne dépend **pas** du modèle de données v2 : il lit une « vue » (`SeanceVerif`, `PlanVerif`…) définie ici. Un adaptateur stockage → vue sera écrit quand le modèle v2 sera figé (hors de ce lot, voir « Besoins de données »).
- Vagues possibles (3 développeurs au plus en parallèle, fichiers distincts) :
  1. E-01, E-10, E-11, E-14
  2. E-02
  3. E-03, E-04, E-05, puis E-06, E-08
  4. E-07, E-12, E-13
  5. E-09
  6. E-15, E-16

## Règles communes à toutes les tâches

À rappeler en tête de chaque tâche distribuée :
- Lire `CLAUDE.md` : français partout (noms métier, commentaires, messages), commentaires courts qui disent pourquoi, pas de sur-ingénierie, rien de calculable n'est stocké.
- Fonctions **pures** : pas d'accès à la base, pas de `new Date()` sans argument, pas de `Math.random`.
- Imports avec l'extension `.ts`, comme le reste du code (`import { x } from './base.ts'`).
- Aucune nouvelle dépendance npm.
- Tests avec Vitest, fichier `*.test.ts` à côté du fichier testé.
- Avant de livrer : `npm run build` et `npm run test` passent.
- Fin de tâche selon `CLAUDE.md` : commit en français, mise à jour du tableau « État » du `README.md`.
- Ne modifier aucun fichier de `src/donnees/bibliotheque/`.

---

## E-01 · Types et réglages du moteur de vérification

- **Objectif** : poser les types d'entrée et de sortie du moteur, les règles par défaut et les libellés français.
- **Dépendances** : aucune.
- **Modèle conseillé** : Haiku.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (sections B.1 et B.3), `src/donnees/bibliotheque/types.ts`, `src/donnees/profil.ts`.
- **Fichiers à créer** : `src/regles/types.ts`, `src/regles/reglesParDefaut.ts`, `src/regles/reglesParDefaut.test.ts`.

**Étapes**
1. Dans `types.ts`, recopier les interfaces de B.1 et B.3 : `ProfilVerif`, `FicheVerif`, `EtapeVerif`, `ObjectifGroupeVerif`, `VersionVerif`, `SeanceVerif`, `SemaineVerif`, `ObjectifPersoVerif`, `PlanVerif`, `DouleurVerif`, `FormeVerif`, `ResultatTestVerif`, `ContexteVerif`, `Regles`, `Avertissement`, et le type `Jour = string`.
2. Importer `Qualite`, `Marqueur`, `Prerequis`, `Contexte` depuis `src/donnees/bibliotheque/types.ts` au lieu de les redéfinir. `ZoneDouleur` : (consolidation 17/11) l'importer de `src/donnees/profil.ts`, qui contient `'autre'` depuis la tâche F2-02.
3. Ajouter `type Niveau = 'information' | 'fort'` et l'utiliser dans `Avertissement`.
4. Dans `reglesParDefaut.ts`, exporter :
   - `REGLES_PAR_DEFAUT: Regles` avec exactement : `heuresEntreSeancesMax: 48`, `poutreIntensiveParSemaine: 2`, `blocLimiteParSemaine: 2`, `poutreParSemaine: 3`, `joursDoigtsMaxParSemaine: 4`, `reposEffortMaxS: 180`, `dechargeActive: true`, `dechargeReductionPct: 50`, `seuilSommeilH: 7`, `hausseChargeMaxPct: 10`, `dureeBlocNerveuxMaxMin: 60`, `toleranceDechargePts: 10`, `seuilDechargeOublieePct: 90`, `joursSansPoutreAvantObjectif: 3`. Un commentaire d'une ligne par valeur avec sa source (copier la colonne de commentaire de B.1).
   - `QUALITES_PHYSIQUES`, `MARQUEURS_NERVEUX`, `MARQUEURS_QUOTA`, `MARQUEURS_RISQUE_DOULEUR` (valeurs en B.2).
   - `NOMS_QUALITES: Record<Qualite, string>` : doigts « force des doigts », traction_gainage « traction et gainage », puissance « puissance », resistance « résistance », endurance « endurance », technique « technique », mental « mental », antagonistes « antagonistes », mobilite « mobilité », echauffement « échauffement ».
   - `NOMS_ZONES: Record<ZoneDouleur, string>` : doigts « doigts », poignet « poignet », coude « coude », epaule « épaule », genou « genou », dos « dos », autre « autre zone ».
   - `EFFORT_PREVU_PAR_DEFAUT = { dure: 7, legere: 4 }` avec le commentaire « décidé par Arthur le 17/11 (B17) » (consolidation 17/11).

**Critères d'acceptation**
- `npm run build` passe ; aucun `any`.
- Les noms de champs sont exactement ceux de B.1 et B.3.

**Tests** (`reglesParDefaut.test.ts`)
- `REGLES_PAR_DEFAUT.heuresEntreSeancesMax === 48`, `.poutreIntensiveParSemaine === 2`, `.reposEffortMaxS === 180`, `.dechargeReductionPct === 50`.
- `QUALITES_PHYSIQUES.length === 5` ; `MARQUEURS_QUOTA` contient `'poutre'` ; `MARQUEURS_NERVEUX` ne contient pas `'poutre'`.
- Chaque `Qualite` de la bibliothèque a un nom dans `NOMS_QUALITES` (parcourir `BIBLIOTHEQUE`).

**Pièges**
- Ne pas confondre `Qualite` de la bibliothèque (10 valeurs) et `QUALITES_PHYSIQUES` (5).
- `marqueurs` de `FicheVerif` peut valoir `null` (exercice perso non qualifié) : garder `Marqueur[] | null`.

---

## E-02 · Fonctions de base et adaptateur de la bibliothèque

- **Objectif** : écrire les fonctions de B.2, l'adaptateur `Protocole → FicheVerif` et des exemples réutilisables par les tests des autres tâches.
- **Dépendances** : E-01.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (B.2), `src/regles/types.ts`, `src/regles/reglesParDefaut.ts`, `src/donnees/bibliotheque/types.ts`, `src/donnees/bibliotheque/index.ts`, `src/chrono/sequence.ts` (type `ConfigChrono`), `src/donnees/profil.ts` (`COTATIONS_BLOC`).
- **Fichiers à créer** : `src/regles/base.ts`, `src/regles/adaptateur.ts`, `src/regles/exemples.ts`, `src/regles/base.test.ts`, `src/regles/adaptateur.test.ts`.

**Étapes**
1. `base.ts` : `marqueursDe`, `estNerveuse`, `dureeEtape`, `estCongestionnante`, `marqueursVersion`, `marqueursSeance`, `estMaximale`, `estPoutreIntensive`, `estDure`, `dureeVersion`, `effortPrevu`, `chargePrevue`, `chargeSemaine(lundi, seances)`, `lundiDe`, `joursEntre`, `ajouterJours(jour, n)`, `heuresEntre(isoA, isoB)`, `seanceSolliciteDoigts`, `zonesDouloureuses`, `itemsRouges`, `nbDuresMax`, `capPoutreAnciennete`. Définitions exactes : tableau B.2. Les fonctions qui lisent une fiche reçoivent `fiches: Record<string, FicheVerif>` et **ignorent** une étape dont la fiche est inconnue.
2. `joursEntre` et `lundiDe` calculent en UTC (`Date.UTC(a, m − 1, j)`) pour ne pas être faussés par le changement d'heure. Ne pas importer `lundiDe` de `debrief.ts` (il travaille en heure locale).
3. `adaptateur.ts` : `ficheDepuisProtocole(p: Protocole): FicheVerif` avec `origine: 'bibliotheque'`, `marqueurs: p.marqueurs`, `reposEntreEffortsS` selon B.2, `solliciteDoigts` selon B.2 (liste `FICHES_SANS_DOIGTS` exportée, recopiée de B.2) ; et `fichesDeLaBibliotheque(): Record<string, FicheVerif>`.
4. `exemples.ts` (sans import de Vitest) : `PROFIL_DE_REFERENCE: ProfilVerif` (bloc, `niveauBloc: '7A'`, 4 ans, poutre `occasionnelle`, `test15sSur25mm: true`, `tractionsStrictesMax: 12`, `adulte: true`, `grimpeEnTete: false`, `douleursEnCours: []`, `seancesParSemaine: 3`) ; `contexteDeReference(surcharges?)` qui renvoie un `ContexteVerif` (aujourd'hui `2026-11-23`, maintenant `2026-11-23T08:00:00.000Z`, fiches de la bibliothèque, listes vides, `REGLES_PAR_DEFAUT`) ; `seanceSolo(id, date, ficheIds, options?)` qui fabrique une `SeanceVerif` (qualité par défaut : qualité de la première fiche non `echauffement`, dureté par défaut : `dure` si une fiche est nerveuse, sinon `legere`).

**Critères d'acceptation**
- Toutes les fonctions de B.2 existent, sont exportées et commentées en une ligne.
- `fichesDeLaBibliotheque()` renvoie 60 fiches.

**Tests**
- `joursEntre('2026-11-24', '2026-11-26') === 2` ; `joursEntre('2026-10-24', '2026-10-26') === 2` (passage à l'heure d'hiver le 25 octobre) ; `lundiDe('2026-11-29') === '2026-11-23'` ; `lundiDe('2026-11-30') === '2026-11-30'`.
- `reposEntreEffortsS` : `doigts-suspensions-max-lestees` → 180 ; `doigts-7-53-horst` → 53 ; `doigts-reglette-minimale-horst` → 180 ; `puissance-bloc-limite` → 240 ; `doigts-echelles-3-6-9` → `undefined`.
- `solliciteDoigts` : `traction-lestee-force-lattice` → faux ; `antagonistes-lattice` → faux ; `puissance-bloc-limite` → vrai ; `doigts-abrahangs` → vrai.
- `estCongestionnante` : `resistance-a-la-minute` (7 min) → vrai ; `endurance-continuite-fin-de-seance` (10 min) → faux ; même fiche avec `reglages.dureeMin: 20` → vrai.
- `chargePrevue` d'une séance solo de 110 min, dure, sans `effortPrevu` → 770 ; avec une version groupe de 60 min et `effortPrevu: 8` → `max(770, 480) = 770`.
- `nbDuresMax(2) === 2`, `nbDuresMax(3) === 3`, `nbDuresMax(5) === 3`.
- `capPoutreAnciennete(0.5) === 0`, `(1) === 1`, `(3.9) === 1`, `(4) === 2`, `(6.5) === 2`, `(7) === 3`.
- `itemsRouges({ sommeil: 2, fatigue: 1, courbatures: 3, douleur: 5, peau: 4, … }) === 2`.

**Pièges**
- `marqueursSeance` d'une séance prévue = union des deux versions ; d'une séance réalisée = ses marqueurs réels seulement.
- `estDure` est vrai aussi pour une séance marquée légère mais maximale.

---

## E-03 · Vérifications de séance : profil, douleurs, contexte (S-01 à S-09)

- **Objectif** : écrire les vérifications S-01 à S-09.
- **Dépendances** : E-02.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (B.3, B.5 lignes S-01 à S-09), `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/reglesParDefaut.ts`, `src/regles/exemples.ts`, `src/donnees/profil.ts` (`COTATIONS_BLOC`).
- **Fichiers à créer** : `src/regles/verifSeanceProfil.ts`, `src/regles/verifSeanceProfil.test.ts`.

**Étapes**
1. Exporter `manquesPrerequis(prerequis: Prerequis, profil: ProfilVerif): string[]` qui renvoie les phrases de manque de S-03, dans l'ordre : années, poutre, tractions, test 15 s, niveau bloc, adulte. Elle servira aussi à P-12 et à l'assistant.
2. Exporter `verifierSeanceProfil(s: SeanceVerif, ctx: ContexteVerif, origine: 'utilisateur' | 'assistant'): Avertissement[]` qui applique S-01 à S-09 à la version solo, puis à la version groupe (étapes du mini-bloc) si elle existe, avec `version` renseigné.
3. Messages : texte exact de la colonne « Message », placeholders remplis ; `{zone}` via `NOMS_ZONES` ; une alerte S-04 par étape même si plusieurs zones (lister les zones séparées par « , »).
4. `source` : colonne « Source » en clair : `[SYN]` → « Synthèse », `[VER n]` → « Vérifications », `[AUD x]` → « Audit de la bibliothèque », `[PLAN]` → « Plan v2 », `[MOD]` → « Modèle de données », `[CDC]` → « Choix de l'app » ; garder les auteurs entre parenthèses.
5. `portee: 'etape'` avec `etapeIndex` pour S-01 à S-04, S-06 à S-09 ; `portee: 'seance'` pour S-05 (une seule par séance).

**Critères d'acceptation**
- Les 9 vérifications existent avec le code, le niveau et le message de la spécification.
- Une étape à fiche inconnue ne produit que S-01.

**Tests** (avec `contexteDeReference` et `seanceSolo`)
- S-01 : étape `fiche-inventee` → 1 alerte S-01 fort, message contenant « fiche-inventee ».
- S-02 : `puissance-pan-gullich-stien` → origine `assistant` : niveau `fort` ; origine `utilisateur` : niveau `information`.
- S-03 : profil `tractionsStrictesMax: null` + `traction-lestee-force-lattice` → message contenant « 10 tractions strictes (non renseigné) » ; profil 6 tractions → « 10 tractions strictes (tu en fais 6) » ; profil de référence → aucune S-03. `doigts-suspensions-max-lestees` avec poutre `occasionnelle` → « une expérience de poutre régulière ». `puissance-planche` avec `niveauBloc: '6A+'` → « un niveau 6B en bloc » ; avec `'6B'` → rien.
- `manquesPrerequis({ anneesPratiqueMin: 2, adulte: true }, { …, anneesPratique: 1, adulte: null })` → 2 phrases.
- S-04 : `douleursEnCours: ['doigts']` + `puissance-bloc-limite` → S-04 fort ; + `technique-pieds-silencieux` → rien. Douleur ouverte `{ date: '2026-11-20', zone: 'coude', niveau: 'reduction' }` et séance du 23 avec `antagonistes-legers` → S-04.
- S-05 : douleur `alerte` ouverte le 20, séance dure le 23 → 1 S-05 ; séance légère sans marqueur nerveux → rien ; douleur résolue le 21 → rien.
- S-06 : douleur `reduction` le 20 ; séance du 23 avec `doigts-reglette-minimale-horst` (marqueurs `maximale`, `arque`) → S-06 ; même séance le 5 décembre (15 jours) → pas de S-06.
- S-07 : `mental-ecole-de-vol` avec `grimpeEnTete: false` → S-07 fort et pas de S-08 ; avec `grimpeEnTete: true` → S-08 information.
- S-09 : `endurance-4x4-voies` pour un bloqueur → S-09 ; pour un grimpeur de voie → rien.

**Pièges**
- Une donnée de profil à `null` compte comme « non remplie » (prudence).
- `niveauBlocMin` se compare par l'index dans `COTATIONS_BLOC`, pas en comparant les chaînes (« 6B+ » > « 6B » en texte, mais « 7A » < « 6C+ » serait faux en texte… comparer les index).

---

## E-04 · Vérifications de séance : déroulé, groupe, modules (S-10 à S-25)

- **Objectif** : écrire les vérifications S-10 à S-25.
- **Dépendances** : E-02.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (B.3, B.5 lignes S-10 à S-25), `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/reglesParDefaut.ts`, `src/regles/exemples.ts`.
- **Fichiers à créer** : `src/regles/verifSeanceDeroule.ts`, `src/regles/verifSeanceDeroule.test.ts`.

**Étapes**
1. Exporter `verifierSeanceDeroule(s: SeanceVerif, ctx: ContexteVerif): Avertissement[]`.
2. S-10, S-11, S-12, S-13, S-14, S-15, S-16, S-18, S-19, S-24, S-25 : sur la version solo, et sur les étapes du mini-bloc de la version groupe (sauf S-10 : solo seulement).
3. S-17 : sur chaque version. S-20, S-22, S-23 : version groupe seulement. S-21 : une fois par séance, si la version groupe existe ; `{différence}` = liste des marqueurs à quota présents d'un seul côté, ou « dureté » si seule la dureté diffère.
4. Messages et sources comme en E-03, étape 4.

**Critères d'acceptation**
- Les 16 vérifications existent avec code, niveau et message de la spécification.
- Aucune alerte sur les déroulés suivants (catalogue, `seances-types.md`) : `echauffement-general, echauffement-doigts-poutre, doigts-reglette-minimale-lopez, puissance-bloc-limite, antagonistes-lattice` et `echauffement-general, puissance-bloc-limite, traction-lestee-force-lattice, antagonistes-lattice`.

**Tests**
- S-10 : `puissance-bloc-limite` seule → S-10 fort ; précédée de `echauffement-general` → rien.
- S-11 : `echauffement-general, doigts-reglette-minimale-lopez` → S-11 information ; avec `echauffement-doigts-poutre` avant → rien.
- S-12 : `echauffement-general, resistance-boulder-triples, puissance-bloc-limite` → S-12 fort sur l'étape 2 ; `echauffement-general, endurance-continuite-fin-de-seance, puissance-bloc-limite` → rien (10 min) ; avec `reglages.dureeMin: 20` sur la continuité → S-12.
- S-13 : `echauffement-general, puissance-bloc-limite, puissance-pan-gullich-initiation` → S-13 ; ordre inverse → rien.
- S-14 : `doigts-reglette-minimale-lopez` et `doigts-7-53-horst` dans la même séance → S-14.
- S-15 : `doigts-suspensions-max-lestees` avec `reglages.reposS: 120` → S-15 fort, message « 120 s » ; `doigts-7-53-horst` sans réglage → rien ; avec `reglages.reposS: 40` → S-15 ; exercice perso `{ marqueurs: ['maximale'], reposEntreEffortsS: 90 }` → S-15.
- S-16 : `echauffement-general, puissance-bloc-limite, puissance-planche` (40 + 45 = 85) → S-16 information « 85 min » ; `puissance-intervalles-force` seule (60) → rien.
- S-17 : version solo `legere` avec `puissance-bloc-limite` → S-17.
- S-18 : exercice perso `{ marqueurs: ['bidoigts', 'maximale'] }` → S-18 fort ; `doigts-abrahangs` → rien.
- S-19 : exercice perso `{ marqueurs: null }` → S-19.
- S-20 : groupe avec 0 objectif → S-20 ; 4 objectifs → S-20.
- S-21 : solo `puissance-bloc-limite`, groupe avec un objectif sans marqueur → S-21, message contenant « bloc_limite » ou son nom.
- S-22 : objectif `{ marqueurs: ['bloc_limite'], blocs: 3 }` sans `essaisMaxParBloc` → S-22.
- S-23 : séance `qualite: 'resistance'`, groupe avec un seul objectif `{ accents: ['puissance'] }` et sans mini-bloc → S-23 ; en ajoutant un objectif `{ accents: ['resistance'] }` → rien ; séance `qualite: 'technique'` → rien (qualité non physique).
- S-24 : étape module de 20 min → S-24 ; 12 min → rien.
- S-25 : étape module `doigts-reglette-minimale-lopez` dans une version `legere` → S-25.

**Pièges**
- Les index d'étape (`etapeIndex`) partent de 0 et se comptent dans la liste de la version concernée.
- Ne pas émettre S-12 deux fois pour la même étape nerveuse s'il y a deux étapes congestionnantes avant.

---

## E-05 · Vérifications de semaine : espacement et quotas (W-01 à W-08)

- **Objectif** : écrire W-01 à W-08.
- **Dépendances** : E-02.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (B.3, B.6 lignes W-01 à W-08), `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/reglesParDefaut.ts`, `src/regles/exemples.ts`.
- **Fichiers à créer** : `src/regles/verifSemaineQuotas.ts`, `src/regles/verifSemaineQuotas.test.ts`.

**Étapes**
1. `verifierEspacement(seances: SeanceVerif[], ctx: ContexteVerif): Avertissement[]` pour W-01, sur toute la frise (toutes les séances du plan et les séances réalisées), triées par date puis par heure de fin.
2. `verifierQuotasSemaine(lundi: Jour, seances: SeanceVerif[], seancesParSemaine: number, ctx: ContexteVerif): Avertissement[]` pour W-02 à W-08 ; elle ne garde que les séances dont `lundiDe(date) === lundi`.
3. W-01 : comparer chaque séance exigeante à la **précédente séance exigeante du même type** (maximale avec maximale, poutre intensive avec poutre intensive), pas seulement à la séance juste avant.
4. `portee: 'seance'` pour W-01 (sur la seconde séance), `portee: 'semaine'` avec `lundi` pour W-02 à W-08.

**Critères d'acceptation**
- Les 8 vérifications existent avec code, niveau et message de la spécification.

**Tests** (profil de référence, 3 séances par semaine)
- W-01 : maximales le mardi 24 et le jeudi 26 → rien ; le mardi 24 et le mercredi 25 → W-01 sur la séance du 25 ; le dimanche 29 et le lundi 30 → W-01 sur le 30 ; deux séances maximales le même jour → W-01.
- W-01 avec séances réalisées : fin de la première le 24 à 20:00, seconde réalisée de 60 min finie le 26 à 19:00 (début 18:00, écart 46 h) → W-01 ; finie le 26 à 21:00 (écart 48 h) → rien.
- W-01, séance légère (`technique-pieds-silencieux`) intercalée : maximale le 24, légère le 25, maximale le 26 → rien ; maximale le 24, légère le 25, maximale le 25 → W-01 sur la maximale du 25 (la légère n'interrompt pas la comparaison).
- W-02 : `doigts-reglette-minimale-lopez` lundi, mercredi, vendredi → W-02 « 3 séances » ; W-01 muet.
- W-03 : `puissance-bloc-limite` trois fois → W-03.
- W-04 : `doigts-echelles-3-6-9` quatre jours → W-04, et W-05 fort (plafond 2 de la fiche ; marqueur `poutre`, qui est un marqueur à quota).
- W-05 : `antagonistes-lattice` 3 fois → W-05 information ; `puissance-bloc-limite` 3 fois → W-05 fort.
- W-06 : 5 jours avec une séance de grimpe → W-06 ; 4 jours de grimpe + 1 jour `mobilite-grand-ecart-lattice` → rien.
- W-07 : 4 séances avec `seancesParSemaine: 3` → W-07.
- W-08 : 4 séances dures avec `seancesParSemaine: 4` → W-08 (max 3) ; 3 séances dures avec 3 → rien.

**Pièges**
- Un dimanche et le lundi suivant sont dans deux semaines différentes mais à un jour d'écart : W-01 se calcule sur la frise entière.
- Une séance prévue porte les marqueurs de ses deux versions.

---

## E-06 · Vérifications de semaine : charge et contenu (W-09 à W-19)

- **Objectif** : écrire W-09 à W-19.
- **Dépendances** : E-02.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (B.3, B.6 lignes W-09 à W-19), `docs/specs/entrainement/regles-planification.md` (A.4), `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/reglesParDefaut.ts`, `src/regles/exemples.ts`.
- **Fichiers à créer** : `src/regles/verifSemaineContenu.ts`, `src/regles/verifSemaineContenu.test.ts`.

**Étapes**
1. `verifierContenuSemaine(lundi: Jour, plan: PlanVerif, ctx: ContexteVerif): Avertissement[]`.
2. La semaine se retrouve dans `plan.semaines` par son `lundi` ; son bloc par `mesocycleOrdre` ; l'accent dans `plan.mesocycles`.
3. W-09 : chercher la dernière semaine de type `charge` **avant** celle-ci dans `plan.semaines`, en sautant les semaines d'un autre type ; pourcentage arrondi à l'entier.
4. W-10 : `cible` arrondie à la dizaine dans le message.
5. W-13 : appliquer l'exception du bloqueur (`endurance-1-on-1-off` entretient `resistance`) ; liste en français avec `NOMS_QUALITES`, séparée par « , » ; « la » si un seul élément, « les » sinon.

**Critères d'acceptation**
- Les 11 vérifications existent avec code, niveau et message de la spécification.
- La semaine conforme (mardi `echauffement-general, echauffement-doigts-poutre, doigts-reglette-minimale-lopez, puissance-bloc-limite, antagonistes-lattice`, qualité `doigts` ; jeudi `echauffement-general, puissance-bloc-limite, traction-lestee-force-lattice, antagonistes-lattice`, qualité `traction_gainage` ; samedi `echauffement-general, technique-tout-en-drapeau, endurance-1-on-1-off, endurance-continuite-fin-de-seance, antagonistes-legers`, qualité `endurance`, légère ; semaine `charge`, accent `doigts`) ne produit aucune alerte.

**Tests**
- W-09 : charges 1 500 puis 1 700 → W-09 « 13 % » ; 1 500 puis 1 640 → rien ; charge, décharge, charge à 1 500, 800, 1 700 → comparaison 1 700 / 1 500.
- W-10 : semaines de charge à 1 500, 1 600, 1 700, réduction 50 % : décharge à 1 500 → fort ; 1 000 → information « 800 » ; 950 → rien. `dechargeActive: false` → rien.
- W-11 : `resistance-4x4-blocs` en semaine de décharge, absente des semaines de charge du bloc → W-11.
- W-12 : une séance maximale dans la semaine 3 (charge) du bloc et deux dans la semaine 4 (décharge) → W-12 « (2) » et « (1) » ; deux et deux → rien.
- W-13 : semaine sans aucune étape `traction_gainage` → message contenant « traction et gainage » ; profil voie avec `endurance-1-on-1-off` et sans résistance → « résistance » listée.
- W-14 : accent `puissance`, aucune séance de qualité `puissance` → message 1 ; deux séances `resistance` et une `puissance` → message 2.
- W-15 : profil 2 ans, deux séances avec poutre → W-15 (cap 1) ; profil 0,5 an, une séance avec poutre → message « Moins d'un an ».
- W-16 : une seule étape d'antagonistes en semaine de charge → W-16 « Une seule séance ».
- W-17 : séance `antagonistes-lattice` seule → W-17.
- W-18 : objectif spécifique `o1` sur le bloc, aucun module `o1` dans la semaine → W-18 « 0 fois ».
- W-19 : `doigts-abrahangs` et `puissance-bloc-limite` dans la même séance → W-19 ; `doigts-abrahangs` seule un jour, autre séance le même jour → W-19 ; seule ce jour-là → rien.

**Pièges**
- W-13, W-14, W-16 et W-18 ne s'appliquent qu'aux semaines `charge`.
- La charge d'une séance prévue est le maximum de ses deux versions (`chargePrevue`).

---

## E-07 · Vérifications du plan (P-01 à P-14)

- **Objectif** : écrire P-01 à P-14.
- **Dépendances** : E-02, E-03 (`manquesPrerequis`).
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (B.3, B.7), `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/verifSeanceProfil.ts`, `src/regles/exemples.ts`.
- **Fichiers à créer** : `src/regles/verifPlan.ts`, `src/regles/verifPlan.test.ts`.

**Étapes**
1. `verifierStructurePlan(plan: PlanVerif, ctx: ContexteVerif): Avertissement[]`.
2. P-02 : parcourir `plan.semaines` dans l'ordre ; numéros de semaine du message à partir de 1 (position dans le plan).
3. P-09 : ne rien émettre si aucune fiche de `ctx.fiches` n'a `estTest: true` (c'est le cas aujourd'hui).
4. P-12 : utiliser `manquesPrerequis` et `zonesDouloureuses(ctx, ctx.aujourdhui)` ; `{raison}` = manques joints par « ; », ou « douleur déclarée ({zone}) ».
5. `portee: 'plan'`, avec `mesocycleOrdre` quand l'alerte vise un bloc.

**Critères d'acceptation**
- Les 14 vérifications existent avec code, niveau et message de la spécification.
- Un plan standard (12 semaines, 3 blocs `doigts`, `puissance`, `resistance`, chacun 3 `charge` + 1 `decharge`) ne produit aucune alerte P.

**Tests**
- P-01 : 10 semaines en accent tournant → P-01.
- P-02 : un bloc de 4 semaines `charge` → P-02 « 4 semaines » ; même plan avec `dechargeActive: false` → rien.
- P-03 : blocs `doigts`, `doigts`, `resistance` → P-03 ; `resistance`, `resistance`, `doigts` → pas de P-03.
- P-04 : trois blocs `resistance` (12 semaines) → P-04.
- P-05 : objectif daté au 2027-02-14 sans semaine `affutage` → P-05 ; avec semaines `affutage` aux lundis 2027-02-01 et 2027-02-08 → rien.
- P-06 : décharge à 30 % → P-06.
- P-07 : objectif daté, blocs `doigts`, `resistance`, `puissance` → P-07.
- P-08 : objectif le 2027-02-14, poutre intensive le 2027-02-12 → P-08 ; le 2027-02-10 → rien.
- P-09 : aucune fiche de test → rien.
- P-10 : 3 objectifs spécifiques sur un bloc → P-10.
- P-11 : deux objectifs portant `poutre` → P-11.
- P-12 : objectif `{ prerequis: { tractionsStrictesMin: 10 } }` avec `tractionsStrictesMax: 6` → P-12 fort.
- P-13 : plan à 4 séances, profil à 3 → P-13.
- P-14 : `cycleSuivantDebut` le lendemain de la fin du plan, sans semaine `transition` → P-14.

**Pièges**
- En mode `objectif_date`, P-01 ne s'applique pas.
- Les semaines `affutage` ne cassent pas la suite de P-02 (elles ne sont pas `charge`).

---

## E-08 · Vérifications du jour (J-01 à J-07)

- **Objectif** : écrire J-01 à J-07.
- **Dépendances** : E-02.
- **Modèle conseillé** : Haiku.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (B.3, B.8), `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/exemples.ts`.
- **Fichiers à créer** : `src/regles/verifJour.ts`, `src/regles/verifJour.test.ts`.

**Étapes**
1. `verifierJour(seanceDuJour: SeanceVerif, ctx: ContexteVerif, realisees: SeanceVerif[]): Avertissement[]` (J-01 à J-07, `portee: 'jour'`, `seanceId` renseigné).
2. Forme du jour : l'élément de `ctx.formes` dont `date === ctx.aujourdhui`.
3. J-02 : les 3 formes des dates `aujourdhui`, `aujourdhui − 1`, `aujourdhui − 2`, toutes avec `heuresSommeil` ; sinon rien.
4. J-04 : `{h}` arrondi à l'heure inférieure, `{reste}` = `48 − h` arrondi à l'heure supérieure.

**Critères d'acceptation**
- Les 7 vérifications existent avec code, niveau et message de la spécification.

**Tests** (aujourd'hui `2026-11-23`, maintenant `2026-11-23T08:00:00.000Z`)
- J-01 : forme `sommeil 2, fatigue 2, courbatures 4, douleur 5, peau 4`, séance dure → J-01 ; séance légère → rien.
- J-02 : 6 h, 6,5 h, 7 h sur 3 nuits (moyenne 6,5) + séance maximale → J-02 ; 7, 7, 7 → rien ; 2 nuits seulement → rien.
- J-03 : `douleur: 2` + séance dure → J-03.
- J-04 : dernière maximale finie le 2026-11-22 à 18:00 (14 h avant) + séance maximale → J-04, message « 14 h » et « 34 h » ; finie le 2026-11-21 à 07:00 (49 h) → rien.
- J-05 : douleur `reduction` ouverte depuis le 2026-11-09 (14 jours) → J-05 ; depuis le 10 → rien.
- J-06 : test « Tractions strictes » à 12 le 2026-10-26 puis 10 le 2026-11-20, deux formes avec `fatigue: 2` le 18 et le 21 → J-06 ; une seule forme fatiguée → rien.
- J-07 : séance réalisée le 2026-11-22 avec `peau: 1` + séance dure → J-07.

**Pièges**
- `sensProgres: 'baisse'` (un temps, par exemple) : « moins bon » veut dire plus grand.

---

## E-09 · Points d'entrée du moteur et tests d'intégration

- **Objectif** : assembler le moteur, trier et dédoublonner, tester les cas de référence.
- **Dépendances** : E-03, E-04, E-05, E-06, E-07, E-08.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/moteur-verification.md` (B.3, B.4, B.11), tous les fichiers de `src/regles/`.
- **Fichiers à créer** : `src/regles/index.ts`, `src/regles/integration.test.ts`.

**Étapes**
1. Exporter `verifierSeance`, `verifierSemaine`, `verifierPlan`, `verifierJour` (B.4) en appelant les fonctions des tâches précédentes.
2. `verifierPlan` : toutes les séances (profil et déroulé), `verifierEspacement` sur la frise, chaque semaine (quotas et contenu), la structure.
3. Dédoublonnage par `code` + `seanceId` + `version` + `etapeIndex` + `lundi` + `mesocycleOrdre`.
4. Tri : `fort` d'abord, puis date (date de séance, ou `lundi`), puis code.
5. Réexporter les types utiles depuis `index.ts`.

**Critères d'acceptation**
- Les 12 cas de B.11 passent, chacun dans un test nommé d'après lui.
- Un même problème ne sort qu'une fois.

**Tests** : les 12 cas de B.11, avec ces déroulés (version solo ; pas de version groupe sauf mention) :
- ST-DOI-02 : `echauffement-general, echauffement-doigts-poutre, doigts-reglette-minimale-lopez, puissance-bloc-limite, antagonistes-lattice` (qualité `doigts`, dure).
- ST-TRA-02 : `echauffement-general, puissance-bloc-limite, traction-lestee-force-lattice, antagonistes-lattice` (`traction_gainage`, dure).
- ST-END-02 : `echauffement-general, technique-tout-en-drapeau, endurance-1-on-1-off, endurance-continuite-fin-de-seance, antagonistes-legers` (`endurance`, légère).
- Plus un test d'ordre : pour un plan qui produit un `fort` le 26 et une `information` le 24, le `fort` sort en premier.

**Pièges**
- Ne pas appeler deux fois W-01 (une fois par semaine) : il se calcule une seule fois sur la frise.

---

## E-10 · Catalogue des séances types et des objectifs de groupe (données)

- **Objectif** : transformer `seances-types.md` en données TypeScript testées.
- **Dépendances** : aucune.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/seances-types.md` (C.1 et C.2), `src/donnees/bibliotheque/types.ts`, `src/donnees/bibliotheque/index.ts`, `src/donnees/seanceGroupeExemple.ts`.
- **Fichiers à créer** : `src/donnees/objectifsGroupe.ts`, `src/donnees/seancesTypes.ts`, `src/donnees/seancesTypes.test.ts`.

**Étapes**
1. `objectifsGroupe.ts` : type `ObjectifGroupeType { id; libelle; cible: number; compte: 'blocs_notes' | 'flashs'; ficheReference?: string; blocs?: number; essaisMaxParBloc?: number; ecartCotation?: [number, number]; reposConseilleS?: number; accents: Qualite[] }` et la liste `OBJECTIFS_GROUPE` des 18 lignes de C.1 (OG-01 à OG-18). Les marqueurs ne sont **pas** stockés : fonction `marqueursObjectif(o)` = marqueurs de `ficheReference` (vide si absente). Exception : aucune ; vérifier que OG-01, OG-13 donnent `maximale, bloc_limite` et OG-02, OG-14 `maximale`.
2. `seancesTypes.ts` : type `SeanceType { id; nom; qualite: Qualite; role: 'N' | 'C' | 'L' | 'H'; durete: 'dure' | 'legere'; solo: EtapeType[]; groupe: null | GroupeType; variantes: Record<string, { solo: EtapeType[]; miniBloc?: MiniBlocType }> }` avec `GroupeType { objectifIds: string[]; miniBloc?: MiniBlocType }`, `MiniBlocType { moment: 'avant' | 'apres'; etapes: EtapeType[] }`, `EtapeType { ficheId: string; reglages?: { dureeMin?: number; series?: number; reposS?: number } }`. Une variante donne le déroulé solo complet de remplacement et, si besoin, le mini-bloc de groupe de remplacement.
3. Saisir les 26 séances de C.2 (ST-DOI-01 à ST-HOR-01), dans l'ordre du document. Variantes : ST-DOI-02 `lestee` (solo et mini-bloc avec `doigts-suspensions-max-lestees`) et `entretien` (solo seulement, `puissance-bloc-limite` avec `reglages.dureeMin: 20`), ST-PUI-02 `poutre_entretien` (solo, et mini-bloc `avant` [`echauffement-doigts-poutre`, `doigts-reglette-minimale-lopez`]). `groupe: null` pour ST-DOI-05, ST-TEC-03 et ST-HOR-01. ST-TEC-02 en groupe : objectif OG-18.
4. Fonctions déduites (rien de stocké) : `dureeSeanceType(st, variante?)`, `marqueursSeanceType(st, version)`, `prerequisSeanceType(st)` (union : max des nombres, poutre la plus exigeante, `true` si l'une l'exige), `contreIndicationsSeanceType(st)`.
5. `seanceTypeParId(id)`.

**Critères d'acceptation**
- 18 objectifs, 26 séances, 3 variantes.
- Les champs `blocs` et `essaisMaxParBloc` des objectifs OG-01, OG-02, OG-13, OG-14 sont ceux de la note sous le tableau C.1.
- Aucune donnée calculable stockée (durée, marqueurs, prérequis, contre-indications).

**Tests**
- Tous les `ficheId` (solo, variantes, mini-blocs) et `ficheReference` existent dans `BIBLIOTHEQUE` ; aucun n'a `exclureDeLaGeneration`.
- Durées : ST-DOI-02 = 110 ; ST-DOI-02 `entretien` = 90 ; ST-PUI-02 `poutre_entretien` = 115 ; ST-TRA-02 = 113 ; ST-END-01 = 70 ; ST-HOR-01 = 35.
- `marqueursSeanceType(ST-DOI-02, 'solo')` contient `poutre`, `maximale`, `poutre_intensive`, `bloc_limite` ; la version groupe (mini-bloc + OG-01) donne les mêmes marqueurs à quota.
- `prerequisSeanceType(ST-TRA-02)` = `{ anneesPratiqueMin: 2, tractionsStrictesMin: 10, adulte: true }`.
- Pour chaque séance avec une version groupe : 1 à 3 objectifs, ids existants.
- Chaque séance solo commence par une fiche de qualité `echauffement` sauf ST-DOI-05.
- Aucune séance n'a plus de 60 min d'étapes nerveuses (marqueurs `maximale`, `poutre_intensive`, `bloc_limite`, `pan_gullich`).

**Pièges**
- `doigts-reglette-minimale-lopez` exige `adulte` : ST-DOI-03 en groupe hérite de cette exigence.
- Ne pas recopier les totaux du document dans les données : ils sont calculés.

---

## E-11 · Format et validation des réponses de l'assistant

- **Objectif** : typer la réponse de l'assistant et la valider avant tout usage (règles F-1 à F-8, contrôles A-01 à A-07).
- **Dépendances** : aucune.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/assistant-ia.md` (D.3, D.4, D.5), `docs/specs/entrainement/moteur-verification.md` (B.9).
- **Fichiers à créer** : `src/assistant/format.ts`, `src/assistant/validerReponse.ts`, `src/assistant/validerReponse.test.ts`.

**Étapes**
1. `format.ts` : recopier les types de D.3 (`ContexteAssistant`) et D.4 (`ReponseAssistant` et tous ses sous-types), plus `TITRES_LIVRES` et `AUTEURS_CONNUS` (listes de D.4).
2. `validerReponse(texte: string, ids: IdsAutorises): ResultatValidation` avec `IdsAutorises = { fiches: Set<string>; seancesTypes: Map<string, string[]> /* id → variantes */; objectifsGroupe: Set<string>; seancesAVenir: Set<string>; objectifsPerso: Set<string>; aujourdhui: string }` et `ResultatValidation = { etat: 'ok'; reponse: ReponseAssistant; informations: string[] } | { etat: 'invalide'; code: 'A-01' | 'A-02' | 'A-04'; erreurs: string[] } | { etat: 'interdit'; reponse: ReponseAssistant }`.
3. Validation écrite à la main (pas de bibliothèque de schéma) : une fonction par règle F-1 à F-8, chacune renvoie une liste d'erreurs en français (« blocs : 3 éléments attendus, 2 reçus »).
4. A-05 : retirer d'une source `livre` tout champ autre que `type` et `titre`, et ajouter l'information de B.9. A-06 : retirer une source `livre` au titre inconnu (comparaison exacte), information de B.9. Les sources `methode` d'un auteur hors liste sont retirées de la même façon.
5. A-07 : motifs de D.5, étape 4, cherchés après normalisation (minuscules, accents retirés avec `normalize('NFD')` puis suppression des diacritiques). Si trouvé : `etat: 'interdit'` et une réponse de remplacement `{ version: 1, type: 'refus', resume: <message A-07>, texte: <message A-07>, justification: [], sources: [] }`.
6. Le texte peut arriver entouré d'un bloc de code Markdown : le retirer avant `JSON.parse` (tolérance), mais ne rien accepter d'autre autour.

**Critères d'acceptation**
- Les exemples 1, 2 et 3 de D.9 sont valides (`etat: 'ok'`) avec des ids autorisés correspondants.
- Toute réponse acceptée est conforme aux types de D.4.

**Tests**
- Exemple 1 de D.9 → `ok`.
- Exemple 1 avec `debut: '2026-11-24'` (mardi) → `invalide`, code `A-04`.
- Exemple 1 avec 2 blocs → `invalide`, `A-01`, erreur mentionnant « blocs ».
- Exemple 1 avec `seanceTypeId: 'ST-XXX-99'` → `invalide`, `A-02`, erreur contenant « ST-XXX-99 ».
- Exemple 1 avec `variante: 'inconnue'` → `A-02`.
- Exemple 2 avec `seanceId: 's-9999'` → `A-02`.
- Source `{ type: 'livre', titre: 'Guide de l\'alimentation du grimpeur', page: 42 }` → `ok`, page retirée, une information.
- Source `{ type: 'livre', titre: 'Un autre livre' }` → `ok`, source retirée, une information.
- `resume` contenant « Pour PERDRE du poids… » → `interdit` ; « Ton affûtage commence lundi » → `ok` ; « charge en % du poids du corps » → `ok` ; « attention au déficit énergétique » → `ok`.
- `texte` non JSON (« Voici ton plan : … ») → `A-01`.
- `type: 'question'` sans `questions` → `A-01`.
- `effortPrevu: 11` → `A-01`.

**Pièges**
- `seche` ne doit pas déclencher sur « sécher » ? Après normalisation, « secher » contient « seche » : chercher le mot entier (`\bseche\b`).
- Ne jamais lever d'exception : toute erreur devient un `etat: 'invalide'`.

---

## E-12 · Développer un brouillon de l'assistant en plan vérifiable

- **Objectif** : transformer un brouillon validé en `PlanVerif` complet (ou appliquer un ajustement à un plan existant), pour le passer au moteur.
- **Dépendances** : E-01 (types du moteur), E-10 (catalogue), E-11 (format).
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/regles-planification.md` (A.1, A.4), `docs/specs/entrainement/assistant-ia.md` (D.4), `src/regles/types.ts`, `src/regles/reglesParDefaut.ts`, `src/donnees/seancesTypes.ts`, `src/donnees/objectifsGroupe.ts`, `src/assistant/format.ts`.
- **Fichiers à créer** : `src/assistant/developperBrouillon.ts`, `src/assistant/developperBrouillon.test.ts`.

**Étapes**
1. `developperCycle(b: BrouillonCycle, fiches): PlanVerif` avec `origine: 'assistant'` ; `developperBloc` et `developperSemaine` sur le même principe.
2. Dates : semaine `k` du bloc `n` commence à `debut + 7 × ((n − 1) × 4 + (k − 1))` jours ; jour de séance = lundi + index du jour (`lundi` 0 … `dimanche` 6).
3. Séance type (`seanceTypeId`) : copier le déroulé solo (ou la variante), la version groupe (objectifs via `OBJECTIFS_GROUPE`, marqueurs via `marqueursObjectif`), qualité, dureté. Ids de séance : `${debut}-b${n}-s${k}-${jour}`.
4. Semaines `decharge` et `affutage` (A4-3, A4-5, A4-10, A6-9) : sur chaque étape, `reglages.series` divisées par deux arrondi au-dessus si l'étape a un réglage de séries, `reglages.dureeMin` = `dureeEtape × (1 − reductionPct / 100)` arrondie à la minute (minimum 1) ; sur chaque objectif de groupe, `blocs` divisé par deux arrondi au-dessus ; en `decharge`, note « Semaine allégée : niveau flash plutôt que projet. » sur les étapes et objectifs qui portent `bloc_limite`. Les étapes de module d'objectif spécifique dont la fiche est nerveuse ou de qualité `doigts` ou `traction_gainage` sont retirées (A4-7). Aucun autre changement : mêmes séances, mêmes fiches, même dureté. Pour une fiche chrono de la bibliothèque (`protocoleParId`) dont `config.series > 1`, poser aussi `reglages.series = ceil(config.series / 2)` pour que l'écran de séance raccourcisse vraiment le chrono ; pour une forme `essais` ou `liste`, seule la durée change.
5. Modules d'objectifs spécifiques : l'assistant les place lui-même comme étapes avec `moduleObjectifId` (champ facultatif de `EtapeBrouillon`, D.4) ; le code ne les invente pas.
6. `appliquerAjustement(plan: PlanVerif, a: BrouillonAjustement): PlanVerif` : appliquer les opérations dans l'ordre, sur une copie (ne jamais muter l'entrée). `alleger_seance` applique la même règle qu'en étape 4 à une seule séance.

**Critères d'acceptation**
- L'exemple 1 de D.9 donne 12 semaines, 36 séances, semaines 4, 8, 12 de type `decharge`.
- L'entrée n'est jamais modifiée.

**Tests**
- Exemple 1 : première séance le `2026-11-24` (mardi), dernière le `2027-02-13` (samedi de la semaine 12).
- Semaine 4, séance ST-DOI-02 : `puissance-bloc-limite` à 20 min (40 × 0,5).
- Semaine 4 : l'objectif OG-01 de ST-DOI-02 garde ses marqueurs, `blocs` passe de 3 à 2 et porte la note « niveau flash ».
- Semaine 4 : autant de séances maximales qu'en semaine 3 (2 dans le bloc 1).
- Exemple 2 appliqué à un plan contenant `s-1126` : la séance `s-1126` a le déroulé de ST-END-01 et garde sa date.
- `deplacer_seance` vers `2026-11-27` : nouvelle date, mêmes étapes.

**Pièges**
- Le `jour` d'une séance de remplacement est ignoré : la date d'origine est conservée.
- `dureeMin` réduite doit passer par `reglages.dureeMin`, pas modifier la fiche.

---

## E-13 · Contexte envoyé à l'assistant

- **Objectif** : construire le `ContexteAssistant` (D.3) à partir du profil, du plan, de l'historique et de la bibliothèque, avec le filtrage des fiches.
- **Dépendances** : E-03 (`manquesPrerequis`), E-10, E-11.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/assistant-ia.md` (D.3), `src/assistant/format.ts`, `src/regles/types.ts`, `src/regles/verifSeanceProfil.ts`, `src/regles/base.ts`, `src/donnees/seancesTypes.ts`, `src/donnees/objectifsGroupe.ts`, `src/donnees/bibliotheque/index.ts`.
- **Fichiers à créer** : `src/assistant/contexte.ts`, `src/assistant/contexte.test.ts`.

**Étapes**
1. `trierFiches(fiches: FicheVerif[], profil: ProfilVerif, zones: ZoneDouleur[]): { disponibles; indisponibles }` : raison `a_verifier` si `exclureDeLaGeneration`, sinon `prerequis` si `manquesPrerequis` non vide, sinon `douleur` si contre-indication, sinon `contexte` si `grimpeEnTete` exigé et non rempli ; sinon disponible.
2. `seancesTypesDisponibles` : une séance type est envoyée si toutes ses fiches (solo et mini-bloc) sont disponibles ; ses variantes seulement si leurs fiches le sont aussi.
3. `construireContexte(entrees): ContexteAssistant` : entrées nommées (profil, plan en cours, séances réalisées des 4 dernières semaines, tests, formes, douleurs, exercices perso, demande, aujourd'hui, règles). Résumés : 4 dernières semaines, 6 dernières séances, dernier résultat de chaque test, 14 prochains jours.
4. Ne jamais inclure le poids du corps ni le prénom.

**Critères d'acceptation**
- Le contexte ne contient aucune clé `poidsCorpsKg` ni `prenom` (test sur `JSON.stringify`).
- `fichesDisponibles` + `fichesIndisponibles` = toutes les fiches, sans doublon.

**Tests**
- Profil de référence (E-02) : `puissance-pan-gullich-stien` indisponible `a_verifier` ; `doigts-suspensions-max-lestees` indisponible `prerequis` ; `doigts-reglette-minimale-lopez` disponible.
- Douleur `doigts` : `puissance-bloc-limite` indisponible `douleur` ; ST-DOI-02 absente des séances types ; ST-END-01 présente.
- Profil `experiencePoutre: 'aucune'` : ST-DOI-01 présente, ST-DOI-02 absente.
- ST-DOI-02 avec un profil poutre `occasionnelle` : variantes `['entretien']` seulement (`lestee` exige `reguliere`).

**Pièges**
- La raison `a_verifier` passe avant `prerequis` : une fiche exclue doit le rester même si le profil remplit tout.

---

## E-14 · Prompt système de l'assistant

- **Objectif** : mettre le prompt de D.6 dans le code, tel quel, et protéger ses règles clés par des tests.
- **Dépendances** : aucune.
- **Modèle conseillé** : Haiku.
- **Fichiers à lire** : `docs/specs/entrainement/assistant-ia.md` (D.6).
- **Fichiers à créer** : `src/assistant/promptSysteme.ts`, `src/assistant/promptSysteme.test.ts`.

**Étapes**
1. Exporter `PROMPT_SYSTEME: string`, copie exacte du bloc `text` de D.6 (gabarit littéral avec accents ; attention aux apostrophes et guillemets français).
2. Exporter `VERSION_PROMPT = '2026-11-17'`.

**Critères d'acceptation**
- Le texte est identique au bloc de D.6 (comparer par un test sur quelques phrases et sur la longueur à ±1 %).

**Tests** : `PROMPT_SYSTEME` contient « Un seul objet JSON », « 48 h », « 2 séances de poutre intensive », « Tu ne donnes jamais de conseil pour perdre du poids », « Escalade Training : les secrets de la planification », « Guide de l'alimentation du grimpeur », « N'invente jamais un identifiant », « claquement ».

**Pièges**
- Ne pas reformuler ni « améliorer » le texte : toute modification passe par l'expert entraînement.

---

## E-15 · Traitement d'une réponse de l'assistant

- **Objectif** : enchaîner validation, développement, moteur et décision de relance, sans appel réseau (l'appel lui-même relève de l'architecte).
- **Dépendances** : E-09, E-11, E-12.
- **Modèle conseillé** : Sonnet.
- **Fichiers à lire** : `docs/specs/entrainement/assistant-ia.md` (D.5), `src/assistant/validerReponse.ts`, `src/assistant/developperBrouillon.ts`, `src/regles/index.ts`.
- **Fichiers à créer** : `src/assistant/traiterReponse.ts`, `src/assistant/traiterReponse.test.ts`.

**Étapes**
1. `traiterReponse(texte, ids, ctxVerif, planEnCours, tentative: 1 | 2): Traitement` avec `Traitement = { etat: 'afficher'; reponse; plan?: PlanVerif; avertissements: Avertissement[]; informations: string[] } | { etat: 'relancer'; messageRelance: string } | { etat: 'echec'; message: string }`.
2. Règles de D.5, étape 7 : à la tentative 1, `relancer` si invalide (A-01, A-02, A-04) ou si le moteur rend au moins un `fort` ; à la tentative 2, `afficher` (avec avertissements) si la réponse est valide, sinon `echec` avec le message de A-01.
3. `messageRelance` : « Ta réponse précédente pose ces problèmes. Corrige-les et renvoie un seul objet JSON. » puis une ligne par erreur ou avertissement fort (`code : message`).
4. `choisirMeilleure(t1, t2)` : garde celle qui a le moins d'avertissements `fort`, la seconde en cas d'égalité.
5. Réponse `interdit` (A-07) : `afficher` directement la réponse de remplacement, sans relance.

**Critères d'acceptation**
- Jamais plus d'une relance.
- Aucune exception ne sort de `traiterReponse`.

**Tests**
- Exemple 1 de D.9 valide et conforme → `afficher`, aucun `fort`.
- Exemple 1 modifié avec ST-TRA-02 le mercredi du bloc 1 (deux maximales de suite), tentative 1 → `relancer`, message contenant « W-01 ».
- Même chose, tentative 2 → `afficher` avec l'avertissement W-01.
- Texte non JSON, tentative 2 → `echec`.
- Texte contenant « perte de poids » → `afficher` le refus standard.

**Pièges**
- Le moteur reçoit `origine: 'assistant'` : S-02 passe en `fort`.

---

## E-16 · Chaque séance type passe le moteur

- **Objectif** : garantir que le catalogue respecte les règles qu'il sert à illustrer.
- **Dépendances** : E-09, E-10.
- **Modèle conseillé** : Haiku.
- **Fichiers à lire** : `src/donnees/seancesTypes.ts`, `src/regles/index.ts`, `src/regles/exemples.ts`, `src/regles/adaptateur.ts`.
- **Fichiers à créer** : `src/donnees/seancesTypes.moteur.test.ts`.

**Étapes**
1. Pour chaque séance type (et chaque variante), construire une `SeanceVerif` datée du `2026-11-24`, avec sa version solo et, si elle existe, sa version groupe (objectifs de `OBJECTIFS_GROUPE` convertis en `ObjectifGroupeVerif` avec `marqueursObjectif`, mini-bloc, même dureté que le solo). Profil « tout rempli » : `anneesPratique: 10`, poutre `reguliere`, `test15sSur25mm: true`, `tractionsStrictesMax: 20`, `adulte: true`, `grimpeEnTete: true`, `niveauBloc: '7A'`, discipline `voie` (pour ne pas déclencher S-09), aucune douleur.
2. Appeler `verifierSeance` et vérifier qu'il ne rend **aucun** avertissement, ni fort ni information.
3. En cas d'échec, le message du test affiche l'identifiant de la séance (et de la variante) et les codes reçus.

**Critères d'acceptation**
- Le test passe sur les 26 séances et les 3 variantes.

**Pièges**
- Si une séance type échoue, ne pas modifier le moteur : signaler l'écart au gérant (soit la séance, soit la règle est à revoir par l'expert).

---

# Besoins de données

Liste des données dont les règles ont besoin, pour le gérant et l'architecte. « Nouveau » = absent de `docs/modele-donnees.md` et de `src/donnees/profil.ts`.

## Profil

| Donnée | Type | Statut | Sert à |
|---|---|---|---|
| `tractionsStrictesMax` | `number \| null` | Nouveau (proposé par l'audit) | S-03, tests de fin de bloc, choix d'accent |
| `test15sSur25mm` | `boolean \| null` | Prévu dans le modèle (7.2), absent du code | S-03 |
| `adulte` | `boolean \| null` (case « 18 ans ou plus », pas de date de naissance) | Nouveau (audit) | S-03 |
| `grimpeEnTete` | `boolean \| null` | Nouveau (audit) | S-07 |
| `joursDisponibles` | `JourSemaine[]` | Nouveau | Placement des séances, assistant |
| `douleursEnCours` avec `'autre'` | `ZoneDouleur[]` | Le modèle 7.2 a `'autre'`, le code non | S-04 |
| `poidsCorpsKg` | existant | **Jamais envoyé à l'assistant** | Tests en % du poids du corps seulement |
| Sexe ou « repère de traction » | à décider | Question Q2 | Repère Lattice (165 % hommes, 135 % femmes) |

## Plan

| Donnée | Statut | Remarque |
|---|---|---|
| `Cycle.origine` : `'utilisateur' \| 'assistant'` | Nouveau | S-02 change de niveau selon l'origine ; à garder sur chaque brouillon accepté |
| `Mesocycle.accent` limité aux 5 qualités physiques | Existant | Q1 : faut-il un `accentVolet` (technique) ? |
| `Mesocycle.objectifsPersoIds` (0 à 2) | Prévu (7.3) | P-10, P-11, W-18 |
| `SemainePlan.type` dont `affutage` et `transition`, `reductionPct` | Existant | — |
| `SeancePlanifiee.qualite` : les 10 valeurs de la bibliothèque (technique, mobilité…) | À élargir (le modèle n'a que 5 valeurs) | Séances techniques et hors grimpe |
| `VersionSolo.effortPrevu` et `VersionGroupe.effortPrevu` (1 à 10) | Nouveau | Charge prévue (W-09, W-10) ; défaut 7 ou 4 (Q5) |
| `VersionSolo.marqueurs`, `VersionGroupe.marqueurs` | **À ne pas stocker** | Déduits des étapes et des objectifs (CLAUDE.md) ; le modèle actuel les stocke |
| `VersionSolo.dureeMin` | **À ne pas stocker** | Somme des étapes |
| `Etape.reglages` : `series`, `reposS`, `dureeMin` | Prévu (`Record<string, number>`) | Nommer ces trois clés |
| `Etape.moduleObjectifId` | Nouveau | S-24, S-25, W-18 |
| `Etape.exercicePersoId` | Nouveau (ou `protocoleId` commun) | Exercices personnels dans le plan |
| `SeanceType.id` d'origine sur la séance planifiée (`modeleId`) | Existant | Assistant (`seanceTypeId`) |

## Objectifs de groupe

| Donnée | Statut | Remarque |
|---|---|---|
| `ficheReference` | Nouveau | Les marqueurs de l'objectif s'en déduisent (A6-2) |
| `cible`, `compte` | Existant dans le code | — |
| `blocs`, `essaisMaxParBloc`, `ecartCotation`, `reposConseilleS`, `accents` | Prévu dans le modèle | S-22, S-23 |
| `marqueurs` | **À ne pas stocker** | Déduits de `ficheReference` |

## Exercices personnels

Mêmes champs qu'une fiche, pour être vérifiés comme elle : `qualite`, `dureeMin`, `marqueurs: Marqueur[] | null` (null tant que l'utilisateur n'a pas répondu « est-ce un effort maximal, sur poutre, en bloc limite ? »), `contreIndications`, `prerequis` (facultatif), `contexte.terrain`, repos entre efforts (facultatif), `reference` (« livre, page »).

## Suivi

| Donnée | Statut | Sert à |
|---|---|---|
| `Douleur` datée avec `niveau` (`alerte`, `reduction`), `signes`, `resolueLe` | Prévu (2.10), absent du code | S-05, S-06, J-05 ; aujourd'hui seul un booléen `douleur` existe dans la séance réalisée |
| `FormeQuotidienne` avec `heuresSommeil` | Prévu | J-01 à J-03 |
| `ResultatTest` et `TestRepere.sensProgres` | Prévu | J-06, règle de décision du cycle suivant |
| Fiches de test (`estTest`) | **Trou T-01** | P-09, tests de fin de bloc |
| `SeanceRealisee.marqueurs` et heure de fin (`creeLe`) | `creeLe` existe ; marqueurs prévus | W-01 en heures, J-04 |

## Réglages

`Reglages.regles` gagne : `poutreParSemaine` (3), `joursDoigtsMaxParSemaine` (4), `hausseChargeMaxPct` (10), `dureeBlocNerveuxMaxMin` (60), `toleranceDechargePts` (10), `seuilDechargeOublieePct` (90), `joursSansPoutreAvantObjectif` (3). Les valeurs existantes restent (`heuresEntreSeancesMax` 48, `poutreIntensiveParSemaine` 2, `blocLimiteParSemaine` 2, `reposEffortMaxS` 180, `dechargeActive`, `dechargeReductionPct` 50, `seuilSommeilH` 7). `reposBlocLimiteS` (240) reste une valeur d'affichage du chrono, pas une règle du moteur.

## Écrans (pour le concepteur produit)

- Les avertissements ont deux niveaux et ne bloquent jamais ; un avertissement `fort` doit se voir avant d'enregistrer.
- La version groupe d'une séance rappelle toujours l'échauffement commun (S-10 ne la vérifie pas).
- Les signaux d'arrêt (A.8) s'affichent pendant les étapes nerveuses.

---

# Questions pour Arthur

> **(consolidation 17/11)** Tranchées le 17/11 (`docs/decisions-phase-1.md`) : Q1 → une phase de technique est possible (B13) ; Q2 → repère facultatif au choix dans le profil, aucun par défaut (B14) ; Q3 → planche de gymnastique (B15) ; Q4 → oui, 5e séance sans grimpe (B16) ; Q5 → 7 et 4, modifiables (B17) ; Q6 → mêmes séances à volume réduit (proposition gardée) ; Q7 → information (B18) ; Q8 → oui (B19) ; Q9 → oui, 3 blocs × 4 essais (B20) ; Q10 → recherche ciblée avant la phase 3 (B21).

Référencées dans les autres documents par leur numéro.

| # | Question | Proposition par défaut |
|---|---|---|
| Q1 | Un bloc peut-il mettre en avant un volet (technique et tactique) plutôt qu'une qualité physique, quand les tests sont au repère mais que la cotation stagne ? | Non : l'accent reste physique, le volet technique passe à 20 à 30 min par séance (A.2) |
| Q2 | Le repère de traction de Lattice diffère selon le sexe (165 % hommes, 135 % femmes). Demander le sexe, laisser choisir le repère, ou ne pas afficher de repère ? | Laisser choisir « repère hommes / repère femmes / aucun », sans question sur le sexe |
| Q3 | L'objectif « planche » désigne-t-il la planche de gymnastique (gainage) ou la planche d'escalade (MoonBoard, Kilter) ? | À trancher ; aucun des deux n'a de fiche de module aujourd'hui |
| Q4 | À 5 séances par semaine, la cinquième est hors grimpe (mobilité, gainage au sol), pour respecter les 4 jours de doigts de Hörst. D'accord ? | Oui |
| Q5 | Effort prévu par défaut pour calculer la charge prévue : 7 pour une séance dure, 4 pour une légère. D'accord, ou faut-il le demander à chaque séance ? | 7 et 4, modifiables |
| Q6 | Semaine allégée : garder les mêmes séances à volume réduit de moitié (choix actuel), ou supprimer une séance ? | Mêmes séances, volume réduit |
| Q7 | Le plafond de poutre selon l'ancienneté (Bechtel : 1 séance par semaine entre 1 et 4 ans) contredit les 2 séances d'échelles 3-6-9 du même auteur. Garder l'avertissement (niveau information) ? | Oui, en information |
| Q8 | Une séance faite à la maison (suspensions légères, mobilité) n'a pas de version groupe. Acceptable ? | Oui |
| Q9 | L'objectif de groupe d'exemple « 5 blocs durs à réglettes, 5 essais max chacun » (25 essais) dépasse la fiche solo de bloc limite (environ 12 essais). Le ramener à « 3 blocs, 4 essais max » (OG-01) ? | Oui |
| Q10 | Objectifs spécifiques sans fiche sourcée (arqués, planche, front lever, peur de la chute en bloc) : lancer une recherche sourcée, ou les retirer de la liste en attendant ? | Les retirer en attendant ; chacun peut créer un exercice personnel |
