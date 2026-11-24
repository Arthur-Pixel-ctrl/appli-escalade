# Backlog v2 — Get me to 9a

18 novembre 2026 · Consolidation des 56 tâches de la phase 1 (F2-01 à F2-16, D-01 à D-24, E-01 à E-16), plus 8 tâches ajoutées (C-01 à C-08) pour combler les trous. Statut : à relire par le gérant.

**Comment lire et distribuer**
1. Les tâches sont rangées par phase, puis par **vague** : les tâches d'une même vague touchent des fichiers distincts et peuvent tourner en parallèle (3 au plus). Une vague ne démarre que quand la précédente est finie et poussée.
2. Donner à chaque développeur : `CLAUDE.md` (lu automatiquement), les **règles communes** de son fichier d'origine (bloc « Règles communes » de `taches-phase-2.md`, section 0 de `taches-design.md`, « Règles communes » de `taches-entrainement.md`), les **règles de consolidation R-1 à R-8** ci-dessous, le texte complet de la tâche (lien) et son **encadré d'amendements**. Les amendements priment sur le texte d'origine.
3. Les décisions de `docs/decisions-phase-1.md` sont appliquées partout ; leurs numéros (B1, B9…) sont cités entre parenthèses.
4. Le modèle de données qui fait foi est `docs/architecture-v2.md` § 3 dans sa version consolidée (ajouts marqués « consolidation 17/11 »).
5. Points où Arthur agit : repérés par **[ARTHUR]**. Tâches qui attendent la recherche sur la bibliothèque : section « Tâches bloquées par les trous de la bibliothèque ».
6. **Consolidation du 18/11** (décisions F3 à F5 : banque d'exercices, trois niveaux de détail ; conception : `docs/specs/niveaux-de-detail.md`) : 7 tâches ajoutées (N-01, G-01 à G-03, D-25 à D-27, texte complet dans la section « Tâches ajoutées le 18/11 ») et des amendements marqués « (consolidation 18/11) » dans les encadrés des tâches existantes. Le modèle consolidé de `docs/architecture-v2.md` § 3 porte aussi ces ajouts.
7. **Consolidation du 23/11** (décisions F6 et F7 d'Arthur, détail dans `docs/specs/niveaux-de-detail.md` § 1.7, § 3.3 et § 8) : aucune tâche nouvelle ; amendements marqués « (consolidation 23/11, F6) » (N-01, D-14, D-25, E-13, C-07, D-23 : niveau proposé selon les accents) ou « (consolidation 23/11, F7) » (E-02, E-04, E-05, E-06, E-08, E-09 : séance dure sans exercice connu comptée comme séance dure ordinaire).
8. **Consolidation du 23/11, deux trous signalés par les développeurs** (détail dans `docs/specs/entrainement/moteur-verification.md`, B.2, B.3, B.6, B.11) : une tâche nouvelle, **E-17** (vague 3.5 bis : vérification **W-20**, plafond de résistance en voie selon la décision F2 d'Arthur, point 13 ; champ `sujet` des avertissements, pour que le dédoublonnage ne supprime plus le second W-18, W-05, P-11, P-12 ou S-22 d'une même cible) ; amendements marqués « (consolidation 23/11, W-20) » dans E-09 et G-03.

## Règles de consolidation (à joindre à chaque tâche)

- **R-1 Chemins.** Les documents du design sont dans `docs/specs/design/` (et non `docs/design/`) ; ceux de l'entraînement dans `docs/specs/entrainement/`. `docs/specs/architecture/architecture.md` n'est plus qu'un renvoi : lire `docs/architecture-v2.md`.
- **R-2 Vocabulaire (B9).** La période de 4 semaines s'appelle **« Phase »** à l'écran (« Phase 1 · doigts · semaine 2 sur 4 », « Vue phase », « Objectifs de la phase »). Dans le code : type `PhaseCycle`, table `phases`, champ `phaseId`, fonctions `debutPhase`, `lirePhases`… (`Phase` seul est déjà pris par le chrono, `src/chrono/sequence.ts`). « Bloc » ne désigne plus qu'un bloc d'escalade. Exception : les vues internes du moteur de vérification (`mesocycleOrdre`, `PlanVerif.mesocycles`, type de semaine `decharge`) et les clés du JSON de l'assistant (`blocs`) gardent leur nom ; la conversion se fait dans C-01 et C-07 uniquement.
- **R-3 Nom de l'app.** L'app s'appelle **« Get me to 9a »** (décision du propriétaire, 18/11) : titre de page, manifeste, en-tête ordinateur, textes d'accueil, e-mails de code. Ne **jamais** renommer le dépôt, l'adresse `…/appli-escalade/`, la base Dexie `appli-escalade`, ni le projet Supabase `appli-escalade` : les données des téléphones en dépendent.
- **R-4 Confirmations.** Dès que D-04 est livrée, toute demande de confirmation passe par `src/composants/Confirmation.tsx` ; jamais `window.confirm` ni `window.alert`.
- **R-5 Styles.** Dès que D-02 est livrée, les écrans nouveaux utilisent les classes Topo existantes de `src/index.css` (`.bouton.principal`, `.bouton-second`, `.bouton-texte`, `.champ`, `.mention`, `.donnee`, `.fiche`, `.avertissement`, `.signal-arret`…) ; aucune couleur en dur, une seule action en résine par écran.
- **R-6 Ordinateur.** Aucune séance ne se lance sur ordinateur (B12) : pas de bouton « Faire la séance ici », texte « Les séances se lancent depuis ton téléphone ». L'assistant n'existe que sur ordinateur (B7). Sur téléphone, seuls les petits ajustements sont permis : déplacer ou sauter une séance (B11).
- **R-7 README.** Chaque tâche ajoute sa ligne au tableau « État » du README **en dernier**, après `git pull --rebase` : en vague parallèle, c'est le seul fichier commun toléré.
- **R-8 Rien de calculable n'est stocké.** Les marqueurs d'une version de séance, sa durée, le statut d'une séance planifiée, le mode du cycle et l'origine d'un plan sont calculés (architecture § 3.5).
- **R-9 Niveaux de détail (consolidation 18/11).** Le niveau (simple, grandes lignes, détaillé) ne change que **l'affichage** de la version solo : changer de niveau n'efface jamais d'étapes, de parties ni de recommandation. Le niveau affiché, les parties tirées des étapes et la recommandation par défaut sont calculés (`niveauAffiche`, N-01 ; `partiesAffichees`, `recommandationAffichee`, C-01). Le moteur vérifie le contenu le plus fin qui existe ; « Stop, ça fait mal » et les signaux d'arrêt restent visibles à tous les niveaux. Le niveau se change sur ordinateur seulement.

## Vue d'ensemble

| Phase | Tâches | Vagues | Fin de phase quand… (plan v2) |
|---|---|---|---|
| 2. Fondations | 26 | 12 | L'app actuelle tourne sur la nouvelle base, sur téléphone et ordinateur |
| 3. Plateforme ordinateur | 30 | 13 | Un plan complet se construit à la main ou avec le générateur sur ordinateur, au niveau de détail choisi |
| 4. Téléphone sur le plan | 5 | 3 | Une semaine réelle se suit de bout en bout, à chaque niveau de détail |
| 5. Assistant IA | 8 | 4 | Un plan se crée avec l'assistant puis se retouche à la main |
| 6. Bilans | 2 | 2 | Les tests de fin de phase s'affichent en courbes |
| **Total** | **71** | **34** | (D-10 est fusionnée dans F2-14 ; les phases 7 et 8 n'ont pas encore de tâches ; 7 tâches ajoutées le 18/11, 1 le 23/11 : E-17) |

**Avant la phase 3** : recherche sourcée sur les trous de la bibliothèque (B21), vérification et audit, comme pour les 60 protocoles. Voir la dernière section.

---

# Phase 2 — Fondations

Ordre : chaque vague contient au plus une tâche qui touche `src/index.css` (toutes les tâches D en touchent) ; les tâches de données et de compte se glissent à côté. `package.json` est touché par D-01, F2-06, D-03, F2-04, jamais dans la même vague.

**[ARTHUR] entre la vague 2.1 et la vague 2.7** (environ 1 h 15) : créer l'adresse Gmail dédiée, le compte et le projet Supabase, coller le script SQL et sa vérification, s'inscrire en premier sur la liste d'invités, régler la connexion par code et l'envoi par Gmail, copier les deux valeurs publiques dans GitHub et dans `.env.local`. Guide pas à pas : [`docs/supabase.md`](supabase.md) (écrit par F2-03 ; en attendant, `docs/architecture-v2.md` § 9). La vague 2.7 (F2-07) a besoin du projet pour l'essai réel.

## Vague 2.1

#### F2-01 · Moteur de séance indépendant de l'affichage
- **Modèle** : Sonnet · **Dépend de** : — · **Texte** : [taches-phase-2.md, F2-01](specs/architecture/taches-phase-2.md#f2-01--moteur-de-séance-indépendant-de-laffichage)
- **Fichiers** : créer `src/moteur/types.ts`, `seanceSolo.ts`, `seanceGroupe.ts`, `horloge.ts`, `moteur.test.ts`, `independance.test.ts` ; modifier `src/donnees/seanceExemple.ts`, `src/donnees/seanceGroupeExemple.ts`, `src/ecrans/SeanceSolo.tsx`, `src/ecrans/SeanceGroupe.tsx`, `src/chrono/useChrono.ts`, `src/donnees/base.ts` (un import), `src/App.tsx` (imports).

> **Amendements de consolidation**
> 1. `src/moteur/types.ts` : recopier la version consolidée de `docs/architecture-v2.md` § 3.2 (bloc « Fichier `src/moteur/types.ts` ») au lieu du contenu de l'étape 1 : elle ajoute `ReglagesEtape` (`series`, `reposS`, `dureeMin`) pour `origine.reglages`, les champs facultatifs `objectifSpecifiqueId` et `note` d'`EtapeSeance`, et les champs facultatifs de `ObjectifGroupe` (`modeleId`, `ficheReference`, `blocs`, `essaisMaxParBloc`, `ecartCotation`, `reposConseilleS`, `accents`). Importer `Qualite` en `import type` depuis la bibliothèque (autorisé par `independance.test.ts`).
> 2. `src/donnees/seanceGroupeExemple.ts` (B20) : le premier objectif devient `{ libelle: '3 blocs durs à réglettes, 4 essais max chacun', cible: 3, couleurConseillee: 'Rouge', compte: 'blocs_notes', modeleId: 'OG-01', ficheReference: 'puissance-bloc-limite', blocs: 3, essaisMaxParBloc: 4 }`. C'est le seul texte qui change à l'écran ; l'iPhone affichera « 3 blocs » au lieu de « 5 blocs ».
> 3. Vague parallèle avec D-01 et F2-03 : aucun fichier commun.

#### F2-03 · Base serveur Supabase : script SQL et guide
- **Modèle** : Sonnet · **Dépend de** : — · **Texte** : [taches-phase-2.md, F2-03](specs/architecture/taches-phase-2.md#f2-03--base-serveur-supabase--script-sql-et-guide)
- **Fichiers** : créer `supabase/migrations/0001_documents.sql`, `supabase/verification.sql`, `docs/supabase.md`.

> **Amendements de consolidation**
> 1. **Liste d'invités (B2)** : le script reprend aussi le bloc « liste d'invités » ajouté à `docs/architecture-v2.md` § 3.3 (table `public.invites` protégée, fonction `verifier_invitation`, déclencheur `before insert on auth.users`). Le critère « SQL identique à l'architecture » vaut pour ce § 3.3 consolidé.
> 2. `supabase/verification.sql` : ajouter « 5. La liste d'invités est protégée : doit renvoyer « true » » (`select relrowsecurity from pg_class where relname = 'invites';`) et « 6. Un visiteur ne peut pas la lire : doit échouer avec « permission denied » » (`begin; set local role anon; select * from public.invites; rollback;`).
> 3. `docs/supabase.md` suit le § 9 consolidé : **étape 0** « Créer l'adresse Gmail dédiée » (A3) ; **étape 3 bis** « T'inscrire sur la liste d'invités » (`insert into public.invites (email) values ('ton.adresse@exemple.fr');`, en minuscules) ; étape 5 = Gmail dédiée seulement (le nom de domaine devient une note « plus tard ») ; nom d'expéditeur et modèle d'e-mail au nom **« Get me to 9a »** (R-3) ; organisation Supabase « Get me to 9a », projet toujours `appli-escalade`. Ajouter une section permanente « Inviter un ami » (une ligne SQL, et « l'ami reçoit ensuite son code en s'inscrivant depuis l'app ») et une section « Ce que tu peux voir » (B4 : l'administrateur voit techniquement toutes les lignes ; engagement à ne pas les consulter).
> 4. Le message exact renvoyé à l'app pour une adresse non invitée n'est pas vérifié : le guide demande, à l'étape 9, d'essayer aussi une adresse non invitée et de noter le message affiché.

#### D-01 · Polices et jetons de couleur
- **Modèle** : Sonnet · **Dépend de** : — · **Texte** : [taches-design.md, D-01](specs/design/taches-design.md#d-01--polices-et-jetons-de-couleur)
- **Fichiers** : `package.json`, `package-lock.json`, `src/main.tsx`, `src/index.css` (`:root`, `body`, `h1, h2`, `.chiffres`), `index.html`, `vite.config.ts`.

> **Amendements de consolidation**
> 1. R-1 : lire `docs/specs/design/DESIGN.md` §2 et §3.
> 2. **Nom de l'app (R-3)** : `index.html` → `<title>Get me to 9a</title>`, ajouter `<meta name="apple-mobile-web-app-title" content="Get me to 9a" />` (nom sous l'icône sur iPhone) ; `vite.config.ts`, manifeste → `name: 'Get me to 9a'`, `short_name: 'Get me to 9a'` (12 caractères : tient sous l'icône), `description: "Get me to 9a : ton carnet d'entraînement d'escalade. Séances guidées, chrono, plan."` ; même description dans la balise `<meta name="description">`. Ne rien renommer d'autre (R-3).
> 3. Ajouter au compte rendu, pour Arthur : une app déjà installée garde son ancien nom sous l'icône ; pour voir le nouveau, il faut la réinstaller, **mais supprimer l'icône d'un iPhone efface les données de l'app**. Ne la réinstaller qu'après une synchronisation réussie (fin de phase 2) ou une sauvegarde par fichier.
> 4. Vague parallèle avec F2-01 et F2-03.

## Vague 2.2

#### F2-02 · Modèle de données v2 : types et documentation
- **Modèle** : Sonnet · **Dépend de** : F2-01 · **Texte** : [taches-phase-2.md, F2-02](specs/architecture/taches-phase-2.md#f2-02--modèle-de-données-v2--types-et-documentation)
- **Fichiers** : créer `src/donnees/modele.ts`, `src/donnees/exemplesV2.ts`, `src/donnees/modele.test.ts` ; modifier `src/donnees/profil.ts`, `src/donnees/base.ts`, `src/donnees/debrief.test.ts`, `docs/modele-donnees.md`.

> **Amendements de consolidation**
> 1. Recopier les types de la **version consolidée** de `docs/architecture-v2.md` § 3.2 (lire les commentaires « consolidation 17/11 »). Principaux écarts avec le texte d'origine : `Mesocycle` devient `PhaseCycle` (et `mesocycleId` → `phaseId`) ; `AccentPhase = QualitePhysique | 'technique'` (B13) et `accent: AccentPhase | null` ; `SemainePlan.type` : `'charge' | 'allegee' | 'affutage' | 'transition'` ; `Cycle.nbSemaines: number` et `Cycle.avertissementsGardes: string[]` ; `VersionSolo` et `VersionGroupe` perdent `marqueurs` (calculés, R-8) et gagnent `effortPrevu?` (et `dureeMin?` annoncée pour le groupe) ; `SeancePlanifiee` perd `avertissementsVus` et gagne `seanceTypeId?`, `variante?`, `sauteeLe?` ; `ExercicePerso.marqueurs: Marqueur[] | null` plus `prerequis?`, `contexte?`, `reposEntreEffortsS?` ; `Reglages.reglesSecurite: Record<string, number | boolean>` ; trois documents de suivi `FormeDuJour`, `DouleurDeclaree`, `ResultatTest` (tables créées dès maintenant, remplies en phases 4 et 6).
> 2. `src/donnees/profil.ts` : en plus des quatre prérequis, ajouter `export type JourSemaine = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'`, les champs `joursDisponibles: JourSemaine[]` (vide = pas renseigné) et `repereTraction: 'aucun' | 'hommes' | 'femmes'` (B14, `'aucun'` par défaut), la zone `'autre'` dans `ZoneDouleur` et `{ valeur: 'autre', nom: 'Autre' }` à la fin de `ZONES`. `PROFIL_VIDE` : `joursDisponibles: []`, `repereTraction: 'aucun'`. `completerProfil` les complète aussi. Seul changement visible accepté : un choix « Autre » dans les douleurs du profil. Les écrans de saisie des jours et du repère viendront avec D-20.
> 3. `exemplesV2.ts` : `EXEMPLE_PHASES` (au lieu de `EXEMPLE_MESOCYCLES`), semaine 4 de type `'allegee'` avec `reductionPct: 50` ; `EXEMPLE_CYCLE` avec `nbSemaines: 12` et `avertissementsGardes: []` ; `EXEMPLE_SEANCE_PLANIFIEE` sans `marqueurs` ni `avertissementsVus`, avec `phaseId`.
> 4. `modele.test.ts`, test supplémentaire : `completerProfil({})` donne `joursDisponibles: []` et `repereTraction: 'aucun'`.
> 5. `docs/modele-donnees.md` § 8 : mentionner aussi le renommage « phase » (R-2) et les trois tables de suivi.

#### F2-06 · Client Supabase et configuration
- **Modèle** : Haiku · **Dépend de** : F2-03 · **Texte** : [taches-phase-2.md, F2-06](specs/architecture/taches-phase-2.md#f2-06--client-supabase-et-configuration)
- **Fichiers** : `package.json`, `package-lock.json`, `.github/workflows/mise-en-ligne.yml`, `README.md` (section « Lancer l'app sur son ordinateur »), créer `src/compte/client.ts`, `src/compte/client.test.ts`, `src/env.d.ts`, `.env.exemple`.

> **Amendements de consolidation** : aucun.

#### D-02 · Composants de base en CSS
- **Modèle** : Sonnet · **Dépend de** : D-01 · **Texte** : [taches-design.md, D-02](specs/design/taches-design.md#d-02--composants-de-base-en-css)
- **Fichiers** : `src/index.css` (sauf la section chrono).

> **Amendements de consolidation**
> 1. R-1 : lire `docs/specs/design/DESIGN.md` §4 et §5 et `docs/specs/design/demo-aujourdhui.html`.

## Vague 2.3

#### F2-13 · Format de séance documenté (préparation de la montre)
- **Modèle** : Sonnet · **Dépend de** : F2-01, F2-02 · **Texte** : [taches-phase-2.md, F2-13](specs/architecture/taches-phase-2.md#f2-13--format-de-séance-documenté-préparation-de-la-montre)
- **Fichiers** : créer `docs/format-seance.md`, `docs/format-seance/seance-planifiee.json`, `docs/format-seance/seance-realisee.json`, `docs/format-seance/chrono-vecteurs.json`, `src/moteur/format.test.ts`.

> **Amendements de consolidation**
> 1. Documenter les champs consolidés (R-2, R-8) : `phaseId`, `ReglagesEtape`, `objectifSpecifiqueId`, `note`, bornes facultatives de `ObjectifGroupe`, `effortPrevu`, `dureeMin` annoncée du groupe, `seanceTypeId`, `variante`, `sauteeLe`. Écrire noir sur blanc que les **marqueurs** d'une version ne sont pas dans le document (ils se calculent depuis la bibliothèque) et que la montre n'en a pas besoin pour exécuter la séance.
> 2. Une séance « sautée » (`sauteeLe`) ne doit pas être proposée par la montre.

#### F2-15 · Garder le projet Supabase éveillé
- **Modèle** : Haiku · **Dépend de** : F2-06 (et F2-03) · **Texte** : [taches-phase-2.md, F2-15](specs/architecture/taches-phase-2.md#f2-15--garder-le-projet-supabase-éveillé)
- **Fichiers** : créer `.github/workflows/reveil-supabase.yml` ; modifier `docs/supabase.md` (une section).

> **Amendements de consolidation** : aucun (le travail ne fait rien tant qu'Arthur n'a pas ajouté les variables).

#### D-03 · Icônes, pastille de prise, avertissement (composants React)
- **Modèle** : Sonnet · **Dépend de** : D-02 · **Texte** : [taches-design.md, D-03](specs/design/taches-design.md#d-03--icônes-pastille-de-prise-avertissement-composants-react)
- **Fichiers** : `package.json`, `package-lock.json`, créer `src/composants/Icone.tsx`, `PastillePrise.tsx`, `Avertissement.tsx` ; `src/index.css`.

> **Amendements de consolidation**
> 1. R-1 : lire `docs/specs/design/DESIGN.md` §5 et §6.
> 2. `Avertissement` accepte un troisième niveau `'information'` (ligne simple avec l'icône « i » encre, `role="status"`, sans rubalise), prévu par `parcours-et-ecrans.md` §4 et nécessaire aux avertissements de niveau « information » du moteur (phase 3). Ajouter l'icône `information` (Phosphor `Info`) à `NomIcone`, et dans `src/index.css` la classe `.information` (pas de fond ni de bande, icône `--texte`, texte `--texte-2` 15 px, padding 8 px 0).

## Vague 2.4

#### F2-04 · Base locale version 3 et écriture unique
- **Modèle** : Sonnet · **Dépend de** : F2-02 · **Texte** : [taches-phase-2.md, F2-04](specs/architecture/taches-phase-2.md#f2-04--base-locale-version-3-et-écriture-unique)
- **Fichiers** : créer `src/donnees/stockage.ts`, `stockage.test.ts`, `migration.test.ts` ; modifier `src/donnees/base.ts`, `package.json`, `package-lock.json`.

> **Amendements de consolidation**
> 1. Tables déclarées dans la classe (types de `modele.ts`, enveloppés dans `Local<>`) : `phases: Table<Local<PhaseCycle>, string>` (au lieu de `mesocycles`), `formes: Table<Local<FormeDuJour>, string>`, `douleurs: Table<Local<DouleurDeclaree>, string>`, `resultatsTests: Table<Local<ResultatTest>, string>`, en plus de celles du texte d'origine. Index de la version 3 : ceux du § 3.4 **consolidé** — table `phases` (et non `mesocycles`), index `phaseId` sur `seancesPlanifiees` et `objectifsSpecifiques`, et trois tables de plus : `formes: 'id, date, aEnvoyer'`, `douleurs: 'id, date, aEnvoyer'`, `resultatsTests: 'id, date, testId, aEnvoyer'`.
> 2. `TABLES_SYNCHRONISEES` (11 tables, dans cet ordre) : `seancesRealisees`, `reglages`, `cycles`, `phases`, `seancesPlanifiees`, `objectifsSpecifiques`, `exercicesPerso`, `salles`, `formes`, `douleurs`, `resultatsTests`.
> 3. Migration du profil : écrire `{ ...completerProfil(ancien), id: 'profil', modifieLe, creeLe, versionFormat: 1, aEnvoyer: 1 }` (importer `completerProfil` de `profil.ts`) : il reçoit d'un coup les prérequis à `null`, `joursDisponibles: []` et `repereTraction: 'aucun'`.
> 4. `migration.test.ts` : vérifier aussi que les tables `phases` et `formes` existent et sont vides.
> 5. La clé `appareil` documentée gagne `cleApiEtat` (phase 5) : rien à coder ici.

#### D-04 · Fenêtre de confirmation et erreurs en ligne
- **Modèle** : Sonnet · **Dépend de** : D-02 · **Texte** : [taches-design.md, D-04](specs/design/taches-design.md#d-04--fenêtre-de-confirmation-et-erreurs-en-ligne)
- **Fichiers** : créer `src/composants/Confirmation.tsx` ; modifier `src/App.tsx`, `src/ecrans/Questions.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. R-1 : lire `docs/specs/design/DESIGN.md` §5 (« Fenêtre de confirmation »).
> 2. Après cette tâche, R-4 s'applique à toutes les suivantes (F2-07, F2-09, F2-11 utilisent ce composant).

## Vague 2.5

#### F2-05 · Profil : les quatre prérequis
- **Modèle** : Sonnet · **Dépend de** : F2-04 · **Texte** : [taches-phase-2.md, F2-05](specs/architecture/taches-phase-2.md#f2-05--profil--les-quatre-prérequis)
- **Fichiers** : `src/ecrans/ProfilFormulaire.tsx`, `src/donnees/profil.ts`, créer `src/donnees/profil.test.ts`.

> **Amendements de consolidation**
> 1. Ne pas ajouter de question pour `joursDisponibles` ni `repereTraction` (ils viennent avec D-20, sur ordinateur).
> 2. Classes : celles de `src/index.css` déjà reprises par D-02 (R-5). D-09 reprendra la mise en forme du formulaire entier.

#### F2-08 · Moteur de synchronisation
- **Modèle** : Sonnet · **Dépend de** : F2-04, F2-06 · **Texte** : [taches-phase-2.md, F2-08](specs/architecture/taches-phase-2.md#f2-08--moteur-de-synchronisation)
- **Fichiers** : créer `src/synchro/fusion.ts`, `synchro.ts`, `serveurSupabase.ts`, `serveurMemoire.ts`, `fusion.test.ts`, `synchro.test.ts`.

> **Amendements de consolidation**
> 1. Test 7 : la table `formes` est désormais synchronisée ; utiliser un type inconnu `typeInconnu` pour vérifier qu'une ligne d'un type que l'app ne connaît pas est ignorée.
> 2. Les 11 tables de `TABLES_SYNCHRONISEES` sont poussées et tirées (aucun code propre à une table).

#### D-05 · Chrono plein écran à trois phases
- **Modèle** : Sonnet · **Dépend de** : D-02, D-03 · **Texte** : [taches-design.md, D-05](specs/design/taches-design.md#d-05--chrono-plein-écran-à-trois-phases)
- **Fichiers** : `src/ecrans/Chrono.tsx`, section « Écran de chrono » de `src/index.css`.

> **Amendements de consolidation**
> 1. R-1 : `docs/specs/design/DESIGN.md` et `docs/specs/design/demo-chrono.html`.
> 2. Les « trois phases » du chrono (préparation, effort, repos) n'ont rien à voir avec les phases du plan (R-2) ; garder ce vocabulaire dans `Chrono.tsx`.

## Vague 2.6

#### F2-12 · Accès au plan et valeurs dérivées
- **Modèle** : Sonnet · **Dépend de** : F2-04 · **Texte** : [taches-phase-2.md, F2-12](specs/architecture/taches-phase-2.md#f2-12--accès-au-plan-et-valeurs-dérivées)
- **Fichiers** : créer `src/donnees/plan.ts`, `src/donnees/plan.test.ts`.

> **Amendements de consolidation**
> 1. Noms (R-2) : `debutPhase(cycle, phase)`, `debutSemaine(cycle, phase, semaine)`, `lirePlanDuCycle(cycleId): Promise<{ phases: PhaseCycle[]; seances: SeancePlanifiee[] }>`, `enregistrerPhase`. `finCycle` utilise `cycle.nbSemaines` (nombre). `supprimerCycle` supprime doucement ses phases, ses objectifs spécifiques et ses séances.
> 2. Statut (B11) : `export type StatutSeance = 'faite' | 'sautee' | 'manquee' | 'aujourdhui' | 'a_venir'`, dans cet ordre de priorité : faite si une séance réalisée non supprimée cite son id ; sinon **sautée** si `sauteeLe` est posé (l'utilisateur a choisi de la sauter) ; sinon **manquée** si la date est passée ; sinon aujourd'hui ou à venir. Tests : un cas par statut, et « faite » l'emporte sur `sauteeLe`.
> 3. **Retirer** `prerequisRemplis` (étape 3) : la comparaison des prérequis appartient aux règles de l'entraînement (`manquesPrerequis`, E-03), branchée sur le profil par C-01. Une seule fonction dans l'app.
> 4. Ajouter `cycleTermine(cycle, aujourdhui): boolean` (aujourd'hui après `finCycle`, sans `abandonneLe`) pour le tableau de bord (D-19), avec un test.

#### D-06 · Barre d'onglets et écran Aujourd'hui
- **Modèle** : Sonnet · **Dépend de** : D-03 · **Texte** : [taches-design.md, D-06](specs/design/taches-design.md#d-06--barre-donglets-et-écran-aujourdhui)
- **Fichiers** : `src/App.tsx`, `src/ecrans/Aujourdhui.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. R-1 : `docs/specs/design/parcours-et-ecrans.md` T-06 et `docs/specs/design/demo-aujourdhui.html`.
> 2. Mention (R-2) : « Phase 1 · doigts · semaine 2 sur 4 » (et non « Bloc 1 »).
> 3. Étape 4 (B10) : retirer « Assiette du jour » **et** la ligne « Forme du jour » (pas de bouton sans action), avec le commentaire « Forme du jour : revient en phase 4, utile aux contrôles du jour (tâche C-03, décision B10). »
> 4. Les données d'exemple restent ; commentaire « remplacé par le plan réel en D-22 ».

## Vague 2.7

#### F2-07 · Connexion par code reçu par e-mail
- **Modèle** : Sonnet · **Dépend de** : F2-04, F2-06, D-04 · **[ARTHUR]** projet Supabase prêt pour l'essai réel · **Texte** : [taches-phase-2.md, F2-07](specs/architecture/taches-phase-2.md#f2-07--connexion-par-code-reçu-par-e-mail)
- **Fichiers** : créer `src/compte/session.ts`, `src/compte/session.test.ts`, `src/ecrans/Compte.tsx` ; modifier `src/ecrans/Profil.tsx`, `src/App.tsx`.

> **Amendements de consolidation**
> 1. **Textes** (B1, parcours T-02 et T-03 adaptés au code) : non connecté — aide « On t'envoie un code à 6 chiffres. Pas de mot de passe. », bouton principal « Recevoir mon code de connexion », adresse mal écrite → « Vérifie l'adresse. » sous le champ ; code envoyé — titre « Regarde ta boîte mail », l'adresse en `.donnee`, « Saisis le code reçu. Il est valable 1 h. », aide « Rien reçu ? Regarde dans les indésirables. », bouton principal « Me connecter », second « Renvoyer le code » (décompte de 60 s), texte « Changer d'adresse ». Le mot « lien » n'apparaît nulle part.
> 2. **Liste d'invités (B2)** : `messageErreur` reconnaît une adresse refusée (message contenant « Database error saving new user », « Adresse non invitée » ou « Signups not allowed ») et rend « Cette adresse n'est pas sur la liste d'invités. Demande à Arthur de l'ajouter. » Test dédié.
> 3. **Transparence (B4)** : la phrase du bas devient « Tes données sont gardées sur un serveur en Europe administré par Arthur. Il peut techniquement les voir et s'engage à ne pas les consulter. Elles ne sont ni vendues ni partagées. »
> 4. **Déconnexion** (R-4) : `Confirmation` (titre « Te déconnecter ? », texte « Tes données restent sur cet appareil. », action « Me déconnecter ») au lieu de `window.confirm`.
> 5. Styles : R-5. Vague parallèle avec D-07 (aucun fichier commun).

#### D-07 · Séance solo et séance en groupe
- **Modèle** : Sonnet · **Dépend de** : D-03, D-04, F2-01 · **Texte** : [taches-design.md, D-07](specs/design/taches-design.md#d-07--séance-solo-et-séance-en-groupe)
- **Fichiers** : `src/ecrans/SeanceSolo.tsx`, `src/ecrans/SeanceGroupe.tsx`, `src/ecrans/Debrief.tsx` (pastilles), `src/index.css`.

> **Amendements de consolidation**
> 1. R-1 : `docs/specs/design/parcours-et-ecrans.md` T-08, T-09 et `demo-aujourdhui.html`.
> 2. Les deux écrans ont été réécrits par F2-01 : leur état vient de `src/moteur/` ; ne changer que le JSX et les classes, jamais les appels au moteur.
> 3. Séance en groupe : sous le titre de l'objectif, si `essaisMaxParBloc` est renseigné, afficher en `.mention` « 4 ESSAIS MAX PAR BLOC » (borne de sécurité, A6-4).

## Vague 2.8

#### F2-09 · Lien du compte et reprise des données
- **Modèle** : Sonnet · **Dépend de** : F2-07, F2-08 · **Texte** : [taches-phase-2.md, F2-09](specs/architecture/taches-phase-2.md#f2-09--lien-du-compte-et-reprise-des-données)
- **Fichiers** : créer `src/synchro/reprise.ts`, `reprise.test.ts`, `src/ecrans/Reprise.tsx` ; modifier `src/ecrans/Compte.tsx`.

> **Amendements de consolidation** (cette tâche reprend les écrans T-04 de D-21 ; le design prime pour les textes, l'architecture pour la logique)
> 1. **Avant le premier envoi**, si l'appareil a au moins une séance enregistrée, `Reprise` affiche une troisième variante `premier_lien` : titre « On a trouvé tes séances » ; fiche « Sur cet appareil » : nombre de séances, dates de la première et de la dernière, profil oui ou non ; phrase « Ce que ton compte contient déjà arrivera aussi ici. Rien n'est effacé de cet appareil. » ; principal « Ajouter à mon compte » (lance `lierCompte`) ; texte « Plus tard » (on reste connecté sans lier : aucune synchronisation, la question revient à la prochaine ouverture de Compte). Sans séance locale, on lie directement.
> 2. Fin : « N séances ajoutées. Elles restent aussi sur cet appareil. » (`role="status"`) ; pendant l'envoi : « Envoi en cours… » (la jauge « 8 sur 14 » du design est abandonnée : `synchroniser` ne donne pas d'avancement). Échec : « La reprise s'est arrêtée. Rien n'est perdu : réessaie quand le réseau revient. »
> 3. Choix du profil : choix en encre (`aria-pressed`), présélection du plus récent, date de modification affichée sous chacun.
> 4. `effacerDonneesLocales` vide les 11 tables synchronisées, `etatSynchro` et `appareil`.
> 5. R-4 pour la confirmation de déconnexion avec modifications en attente.

#### D-08 · Trois questions, débrief, bilans, mises en garde
- **Modèle** : Sonnet · **Dépend de** : D-03, D-04 · **Texte** : [taches-design.md, D-08](specs/design/taches-design.md#d-08--trois-questions-débrief-bilans-mises-en-garde)
- **Fichiers** : `src/ecrans/Questions.tsx`, `src/ecrans/Debrief.tsx`, `src/ecrans/Historique.tsx`, `src/ecrans/MisesEnGarde.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. R-1 : `docs/specs/design/parcours-et-ecrans.md` T-11 à T-15.
> 2. La précision de zone après « Oui » à la douleur (T-11) n'est **pas** dans cette tâche : elle vient avec C-04 (phase 4).

## Vague 2.9

#### F2-10 · Synchronisation automatique et indicateur
- **Modèle** : Sonnet · **Dépend de** : F2-09 · **Texte** : [taches-phase-2.md, F2-10](specs/architecture/taches-phase-2.md#f2-10--synchronisation-automatique-et-indicateur)
- **Fichiers** : créer `src/synchro/automatique.ts`, `automatique.test.ts` ; modifier `src/App.tsx`, `src/ecrans/Compte.tsx`, `src/ecrans/Historique.tsx`.

> **Amendements de consolidation**
> 1. Exporter aussi, dans `automatique.ts` : `export function etatSynchroCourt(e: { enLigne: boolean; enCours: boolean; enAttente: number }): string` (pure, testée) qui rend la mention d'en-tête du design, dans cet ordre de priorité : « HORS LIGNE », « ENVOI EN COURS… », « 1 CHANGEMENT EN ATTENTE » / « N CHANGEMENTS EN ATTENTE », « À JOUR » ; et `export function synchroEnCours(): boolean`, vrai pendant qu'un lancement de `demarrerSynchroAutomatique` tourne (variable du module ; `synchro.ts` n'est pas modifié). Elle sera affichée dans l'en-tête par D-21 et F2-14.
> 2. `Historique.tsx` a été restylé par D-08 à la vague précédente : n'ajouter que l'abonnement.

#### D-09 · Profil, bienvenue, erreur, chargement, icône de l'app
- **Modèle** : Haiku · **Dépend de** : D-02, F2-05 · **Texte** : [taches-design.md, D-09](specs/design/taches-design.md#d-09--profil-bienvenue-erreur-chargement-icône-de-lapp)
- **Fichiers** : `src/ecrans/ProfilFormulaire.tsx`, `src/ecrans/Profil.tsx`, `src/ecrans/Bienvenue.tsx`, `src/ecrans/Erreur.tsx`, `src/ecrans/EnConstruction.tsx`, `public/favicon.svg`, `src/index.css`.

> **Amendements de consolidation**
> 1. Le formulaire contient désormais la section des prérequis (F2-05) : la reprendre aussi (choix en encre, compteur Topo).
> 2. **Icône de l'app « Get me to 9a » (R-3)** : garder la prise résine sur fond magnésie de l'étape 4, et ajouter sous le trou de vis, en blanc papier `#FBFAF7` (commentaire : `--surface`), le texte « 9a » (élément `<text>` avec `font-family="'Arial Narrow', Arial, sans-serif"` et `font-weight="800"` : la police de l'app n'est pas chargée dans l'icône, une police du système suffit), lisible à 48 px. Le `<title>` du SVG : « Get me to 9a ». Vérifier l'icône à 48 px et à 180 px.
> 3. **Bienvenue** : surtitre « Get me to 9a » (au lieu de « Bienvenue ») ; le texte ne change pas de sens. L'écran complet T-01 (connexion depuis l'accueil) vient avec D-21.
> 4. `Profil.tsx` a été modifié par F2-07 (ligne Compte) : la garder. La phrase « Tes données restent sur cet appareil… » sera reprise par F2-11 et D-21.

## Vague 2.10

#### F2-11 · Export complet, import v2, suppression du compte
- **Modèle** : Sonnet · **Dépend de** : F2-10 · **Texte** : [taches-phase-2.md, F2-11](specs/architecture/taches-phase-2.md#f2-11--export-complet-import-v2-suppression-du-compte)
- **Fichiers** : `src/donnees/base.ts`, `src/ecrans/Compte.tsx`, `src/ecrans/Profil.tsx` (texte d'aide), créer `src/donnees/sauvegarde.test.ts`.

> **Amendements de consolidation**
> 1. L'export couvre les **11** tables de `TABLES_SYNCHRONISEES` (test : « les onze tables »).
> 2. Confirmation de suppression : champ « Tape supprimer pour confirmer » ; accepter `supprimer` sans tenir compte de la casse ni des espaces autour (le design écrit en minuscules, l'architecture en capitales). Bouton « Supprimer définitivement » en `.bouton.arret`.
> 3. Vague parallèle avec F2-14 : ne pas toucher `App.tsx` ni `index.css`, ne pas changer les props de `Profil`.

#### F2-14 · Mise en page bureau : squelette et navigation (fusionnée avec D-10)
- **Modèle** : Sonnet · **Dépend de** : F2-05, F2-10, D-06, D-09 · **Textes** : [taches-phase-2.md, F2-14](specs/architecture/taches-phase-2.md#f2-14--mise-en-page-bureau--squelette-et-navigation) et [taches-design.md, D-10](specs/design/taches-design.md#d-10--coquille--bureau---1024-px)
- **Fichiers** : créer `src/miseEnPage/useEcranLarge.ts`, `MiseEnPageTelephone.tsx`, `MiseEnPageBureau.tsx`, `miseEnPage.test.ts`, `src/composants/BarreBureau.tsx` ; modifier `src/App.tsx`, `src/index.css` (section ajoutée à la fin).

> **Amendements de consolidation** (contradiction tranchée : la technique de F2-14, l'interface de D-10)
> 1. **Seuil 1024 px** (design) : `LARGEUR_BUREAU_PX = 1024`, `matchMedia('(min-width: 1024px)')` ; tests `estEcranLarge(1023)` faux, `(1024)` vrai. Un iPad en paysage a la mise en page bureau.
> 2. **Barre du haut**, pas de menu latéral (D-10, étape 2) : `BarreBureau.tsx`, 64 px, fond `--fond`, filet bas 2 px `--texte` ; marque **« Get me to 9a »** (`--police-titre` 900, 26 px, `Icone nom="prise"`) ; liens `RUBRIQUES_BUREAU = ['Tableau de bord', 'Plan', 'Bibliothèque', 'Bilans', 'Profil'] as const` (48 px, `aria-current="page"`, souligné résine 3 px) ; à droite la mention `etatSynchroCourt` (F2-10) ou « PAS DE COMPTE », et le bouton « Assistant » (`.bouton-second`, désactivé, `title="Arrive en phase 5"`). « Mes exercices » n'est pas une rubrique : ce sera un filtre de la Bibliothèque (D-11).
> 3. **Contenus** : Tableau de bord (rubrique par défaut) → `EnConstruction` « Tableau de bord » : « Ton plan de la semaine s'affichera ici. Les séances se lancent depuis ton téléphone. » (R-6, **pas** l'écran Aujourd'hui, qui a des boutons de séance) ; Plan → « Ici tu construiras ton cycle de 12 semaines, en 3 phases de 4 semaines. » ; Bibliothèque → « Les 60 protocoles et tes exercices, filtrables. » ; Bilans → `Historique` ; Profil → `Profil` (mêmes props que sur téléphone).
> 4. Conteneur de 1 280 px au plus, marges 32 px ; écrans de séance, questions, mises en garde, débrief, compte : colonne centrée de 480 px (comme aujourd'hui). Lien d'évitement « Aller au contenu » en premier élément focalisable.
> 5. CSS : section `/* Mise en page bureau (F2-14 + D-10) */` à la fin de `src/index.css`, variables Topo uniquement.
> 6. Critères : ceux de F2-14 (téléphone identique à 390 px, bascule sans rechargement) et de D-10 (à 1 366 × 860, barre du haut et pas de barre du bas ; redimensionner ne perd pas l'écran courant).

## Vague 2.11

#### D-21 · Compte, bienvenue et états réseau (réduite)
- **Modèle** : Sonnet · **Dépend de** : F2-11, F2-14 · **Texte d'origine** : [taches-design.md, D-21](specs/design/taches-design.md#d-21--connexion-par-lien-e-mail-et-reprise-des-données)
- **Fichiers** : `src/ecrans/Bienvenue.tsx`, `src/ecrans/Profil.tsx`, `src/ecrans/Aujourdhui.tsx` (bandeau), `src/miseEnPage/MiseEnPageTelephone.tsx`, `src/App.tsx` (passage de Bienvenue à Compte), `src/index.css`.

> **Amendements de consolidation** (contradiction tranchée : connexion par **code** dès la phase 2, B1 ; les écrans Compte et Reprise existent déjà, écrits par F2-07 et F2-09 avec les textes du design ; D-21 ne crée ni `Connexion.tsx` ni `LienEnvoye.tsx`)
> 1. **T-01 Bienvenue** : titre « Ton carnet d'entraînement », surtitre « Get me to 9a », phrases du parcours T-01 ; action principale « Recevoir mon code de connexion » : `App.tsx` affiche l'écran `Compte` existant même sans profil, son « Retour » ramène à l'accueil ; si la reprise (F2-09) a ramené un profil du compte, F2-09 recharge l'app, qui démarre alors normalement ; sinon l'accueil propose le formulaire de profil ; texte « Continuer sans compte » (B3 : l'app reste locale et passe au formulaire de profil actuel). Hors ligne : bouton principal désactivé avec « La connexion demande du réseau. Tu peux commencer sans compte et te connecter plus tard. » Masquer l'option de connexion si `comptesDisponibles` est faux.
> 2. **P2, bandeau** dans Aujourd'hui, si pas de compte et `comptesDisponibles` : « Crée ton compte pour retrouver ton plan sur ordinateur », un toucher ouvre Compte ; bouton « × » (48 px) qui le masque pour la session.
> 3. **T-14, section Compte du profil** sans compte : « Tu n'as pas de compte. Ton plan d'ordinateur ne peut pas arriver ici. » avec « Recevoir mon code de connexion » ; la phrase sur les données (« Tes données restent sur cet appareil… ») suit F2-11.
> 4. **États communs** : bandeau `.bandeau.hors-ligne` en haut des onglets quand `navigator.onLine` est faux (« Hors ligne. Tout est gardé sur cet appareil, l'envoi se fera au retour du réseau. ») ; mention `etatSynchroCourt` (F2-10) en haut d'Aujourd'hui, à côté de la date.
> 5. Critères : un téléphone neuf peut se connecter dès l'accueil ; « Continuer sans compte » donne l'app actuelle ; aucun texte ne parle de lien.

## Vague 2.12

#### F2-16 · Recette de fin de phase et README
- **Modèle** : Haiku · **Dépend de** : toutes les autres tâches de la phase 2 · **Texte** : [taches-phase-2.md, F2-16](specs/architecture/taches-phase-2.md#f2-16--recette-de-fin-de-phase-et-readme)
- **Fichiers** : créer `docs/recette-phase-2.md` ; modifier `README.md`.

> **Amendements de consolidation**
> 1. Contrôles automatiques en plus : `grep -rn "window.confirm\|window.alert" src` → rien ; `grep -rn "Mesocycle\|mesocycle" src` → rien ; `grep -rn "Appli escalade" src index.html vite.config.ts` → rien ; `grep -rn "'appli-escalade'" src/donnees/base.ts` → la base garde son nom.
> 2. Liste d'Arthur, en plus : une adresse non invitée est refusée avec le message de F2-07 ; l'app installée s'appelle « Get me to 9a » (après réinstallation **seulement une fois la synchronisation vérifiée**, voir D-01) ; la mention « Phase 1 » dans Aujourd'hui ; le chrono à trois fonds ; « Quitter » ouvre la fenêtre de confirmation ; sur ordinateur, aucun bouton ne lance une séance ; la bascule de mise en page se fait à 1 024 px.
> 3. README : titre « # Get me to 9a », suivi de « (dépôt et adresse : `appli-escalade`) » ; lignes F2 et D de la phase 2 présentes dans le tableau « État ».

## Fin de phase 2

**Sur un vrai téléphone (Arthur)** : la recette `docs/recette-phase-2.md` en entier. L'essentiel : après la mise à jour, toutes les anciennes séances et le profil sont là ; une séance solo et une séance en groupe complètes, chrono compris ; connexion par code, reprise de l'historique, mode avion puis retour du réseau ; le même historique sur l'ordinateur ; le test d'isolement à deux comptes ; une adresse non invitée refusée.

**Audit Fable** : (1) données — migration Dexie sans perte (rejouer `migration.test.ts` sur une copie réelle de sauvegarde), aucune écriture hors `ecrire()`, règle « dernière modification gagne », jamais deux comptes mélangés ; (2) sécurité — RLS et liste d'invités relues ligne à ligne, aucune clé secrète dans le dépôt ni dans `dist/`, clé API jamais exportée ni synchronisée ; (3) code — moteur pur (`independance.test.ts`), accessibilité (48 px, focus, contrastes) ; (4) cohérence avec ce backlog — nom de l'app, vocabulaire « phase », R-6.

---

# Phase 3 — Plateforme ordinateur

Les tâches E sont des fonctions pures dans des fichiers nouveaux (`src/regles/`, `src/donnees/`) : elles accompagnent les tâches du design, qui passent une à la fois sur `src/index.css`. Au début de la phase, l'architecte et le concepteur relisent les tâches C (texte complet plus bas) et les amendements des tâches D (plan v2, § 7).

**[ARTHUR] avant la vague 3.1** : relire et valider la recherche sur les trous de la bibliothèque (B21, dernière section) ; elle conditionne C-02. (consolidation 18/11) Les deux questions de `docs/specs/niveaux-de-detail.md` § 8 ont reçu leur réponse le 18/11 (F6 : niveau proposé selon l'objectif ; F7 : séance dure sans exercice comptée comme séance dure ordinaire) ; reportées le 23/11.

(consolidation 18/11) Le générateur et les écrans de niveau s'ajoutent aux vagues existantes ; la vague 3.0 (N-01 seule) ouvre la phase, parce que `src/donnees/modele.ts` doit porter les niveaux avant D-14.

## Vague 3.0 (consolidation 18/11)

#### N-01 · Niveaux de détail : types et fonctions de base
- **Modèle** : Sonnet · **Dépend de** : F2-02 · **Texte** : [plus bas](#n-01-texte-complet)
- **Fichiers** : modifier `src/donnees/modele.ts`, `docs/format-seance.md` (§ 4.1, 4.2), `docs/modele-donnees.md` (§ 8) ; créer `src/donnees/niveaux.ts`, `src/donnees/niveaux.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (décisions F4, F5).
> 1. (consolidation 23/11, F6) Pas de constante de niveau par défaut : `niveaux.ts` exporte `ACCENTS_NERVEUX` et la fonction `niveauPropose(accents)` de `niveaux-de-detail.md` § 1.7 (étape 2 et tests du texte complet, mis à jour).

## Vague 3.1

#### E-01 · Types et réglages du moteur de vérification
- **Modèle** : Haiku · **Dépend de** : — · **Texte** : [taches-entrainement.md, E-01](specs/entrainement/taches-entrainement.md#e-01--types-et-réglages-du-moteur-de-vérification)
- **Fichiers** : créer `src/regles/types.ts`, `src/regles/reglesParDefaut.ts`, `src/regles/reglesParDefaut.test.ts`.

> **Amendements de consolidation**
> 1. Étape 2 : `ZoneDouleur` s'importe de `src/donnees/profil.ts` (elle contient `'autre'` depuis F2-02) au lieu d'être redéfinie.
> 2. `PlanVerif.mesocycles[].accent` : `Qualite | null` (une phase dont l'accent n'est pas encore choisi ; B13 permet aussi `'technique'`). Les vérifications qui lisent l'accent (W-14, P-03, P-04, P-07) ignorent `null`.
> 3. `EFFORT_PREVU_PAR_DEFAUT` : commentaire « décidé par Arthur le 17/11 (B17) » au lieu de « à confirmer ».
> 4. Les noms internes du moteur (`mesocycleOrdre`, `decharge`) restent (R-2).
> 5. (consolidation 18/11) Ajouts de `moteur-verification.md` B.1 : `ProfilVerif.lieux: ('salle_bloc' | 'salle_voie' | 'maison')[]` ; `VersionVerif.niveau?: 'simple' | 'grandes_lignes' | 'detaille'` (absent = détaillé) et `VersionVerif.etapesDetaillees?: boolean` (absent = vrai) ; commentaire de `VersionVerif.dureeMin` : « groupe : durée annoncée ; solo : seulement sans étapes réelles ».

#### C-02 · Catalogue des objectifs spécifiques
- **Modèle** : Sonnet · **Dépend de** : F2-02, recherche sur la bibliothèque (B21) · **Texte** : [texte complet plus bas](#c-02-texte-complet)
- **Fichiers** : créer `src/donnees/objectifsSpecifiques.ts`, `src/donnees/objectifsSpecifiques.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (personne ne créait la liste des objectifs proposables, dont ont besoin O-09, P-12 et l'assistant).

#### D-20 · Profil et réglages sur ordinateur, clé de l'assistant
- **Modèle** : Sonnet · **Dépend de** : F2-14, F2-05, D-09 · **Texte** : [taches-design.md, D-20](specs/design/taches-design.md#d-20--profil-et-réglages-sur-ordinateur-clé-de-lassistant)
- **Fichiers** : créer `src/ecrans/bureau/Reglages.tsx` ; modifier `src/ecrans/ProfilFormulaire.tsx`, `src/miseEnPage/MiseEnPageBureau.tsx` (rubrique Profil), `src/index.css`.

> **Amendements de consolidation**
> 1. R-1 : `docs/specs/design/parcours-et-ecrans.md` O-12. Brancher l'écran dans `MiseEnPageBureau.tsx` (rubrique Profil), pas dans `App.tsx`.
> 2. Section « Toi » : ajouter **Jours disponibles** (7 choix multiples, `Profil.joursDisponibles`). Section « Prérequis » : date affichée = date de modification du profil (pas de date par prérequis). Ajouter le **repère de traction** (B14) : « Repère de traction dans tes bilans » : « Aucun » (par défaut) / « Repère hommes (165 % du poids du corps) » / « Repère femmes (135 %) », aide « Facultatif. C'est une moyenne de population, pas un objectif. » (`Profil.repereTraction`).
> 3. Section **Règles** (nouvelle, courte) : « Semaine allégée en fin de phase » (oui par défaut) et sa réduction 40, 50 ou 60 % (50 par défaut), écrites dans `Reglages.reglesSecurite` (`dechargeActive`, `dechargeReductionPct`) ; aide « Valeurs prudentes par défaut. »
> 4. Section **Assistant** (B5, B7) : clé enregistrée par `ecrireAppareil('cleApiClaude', …)` (F2-04), case « Mémoriser la clé sur cet ordinateur » (`memoriserCle`, cochée par défaut ; décochée, la clé reste en mémoire le temps de l'onglet), « Retirer la clé » avec `Confirmation` ; choix du modèle : « Haiku (par défaut, le moins cher) » / « Sonnet (plus soigné, environ 15 fois plus cher) » → `Reglages.assistantModele` (`claude-haiku-5-5` ou `claude-sonnet-5-5`). Le bouton « Vérifier la clé » et les états vérifiée / refusée viennent avec C-06 (phase 5). Aide : « L'assistant ne fonctionne que sur ordinateur. »
> 5. Section Compte : un bouton qui ouvre l'écran Compte existant (F2-07 à F2-11) ; la suppression du compte y est déjà (taper « supprimer »).
> 6. (consolidation 18/11, F3) **Lieux d'entraînement** : dans `src/donnees/profil.ts` (après la tâche qui y ajoute les zones « hanche » et « cheville » : la reprendre, ne rien défaire), `export type LieuEntrainement = 'salle_bloc' | 'salle_voie' | 'maison'`, champ `lieux: LieuEntrainement[]` dans `Profil`, `PROFIL_VIDE.lieux = []`, `completerProfil` le complète (un profil ancien reçoit `[]`). Section « Toi » : « Où tu t'entraînes » (O-12, texte consolidé 18/11). Test dans `profil.test.ts` : `completerProfil({}).lieux` vaut `[]`. Fichiers en plus : `src/donnees/profil.ts`, `src/donnees/profil.test.ts`.

## Vague 3.2

#### E-02 · Fonctions de base et adaptateur de la bibliothèque
- **Modèle** : Sonnet · **Dépend de** : E-01 · **Texte** : [taches-entrainement.md, E-02](specs/entrainement/taches-entrainement.md#e-02--fonctions-de-base-et-adaptateur-de-la-bibliothèque)
- **Fichiers** : créer `src/regles/base.ts`, `adaptateur.ts`, `exemples.ts`, `base.test.ts`, `adaptateur.test.ts`.

> **Amendements de consolidation**
> 1. (consolidation 18/11) B.2 consolidé : `sansContenuConnu(v)` ; prudence dans `seanceSolliciteDoigts` (sauf qualité `mobilite` ou `antagonistes`) ; `dureeVersion(v) = v.dureeMin ?? Σ` pour les deux versions. Tests : qualité `mobilite` sans fiche → ne sollicite pas les doigts ; solo avec `dureeMin: 90` et sans étapes → 90. `exemples.ts` : `PROFIL_DE_REFERENCE.lieux = ['salle_bloc']`.
> 2. (consolidation 23/11, F7) La prudence du 18/11 dans `marqueursVersion` est retirée : aucun marqueur n'est ajouté à une version `sansContenuConnu`, même dure ; c'est une séance dure ordinaire (B.2, tableau « Séance dure sans exercice connu »). La prudence de `seanceSolliciteDoigts` reste. Tests : solo dure `etapes: []` → `marqueursVersion` vide, `estDure` vrai, `estMaximale` faux ; solo légère `etapes: []` → vide ; qualité `traction_gainage` sans fiche → sollicite les doigts.

#### E-10 · Catalogue des séances types et des objectifs de groupe
- **Modèle** : Sonnet · **Dépend de** : — · **Texte** : [taches-entrainement.md, E-10](specs/entrainement/taches-entrainement.md#e-10--catalogue-des-séances-types-et-des-objectifs-de-groupe-données)
- **Fichiers** : créer `src/donnees/objectifsGroupe.ts`, `src/donnees/seancesTypes.ts`, `src/donnees/seancesTypes.test.ts`.

> **Amendements de consolidation**
> 1. OG-01 « 3 blocs à ta limite, 4 essais max chacun » est confirmé (B20).
> 2. Les champs de `ObjectifGroupeType` reprennent les noms de `ObjectifGroupe` (F2-01) : `ficheReference`, `blocs`, `essaisMaxParBloc`, `ecartCotation`, `reposConseilleS`, `accents`. La conversion vers une version groupe enregistrée se fera dans C-01.
> 3. La recherche (B21) ajoutera ensuite des séances (échauffement court, résistance en voie, objectifs de groupe à plusieurs) : une tâche de mise à jour du catalogue suivra, hors de ce backlog.
> 4. (consolidation 18/11, F4) `SeanceType.recommandation: string` et, dans une variante, `recommandation?: string` : textes **mot pour mot** du tableau de `docs/specs/niveaux-de-detail.md` § 2.5 (la variante `entretien` de ST-DOI-02 a la sienne). Tests : chaque recommandation est non vide et fait 120 caractères au plus ; chaque séance (ou variante) dont le solo porte `bloc_limite` contient « essais max ». La tâche de mise à jour du catalogue après B21 écrit aussi la recommandation des séances qu'elle ajoute.

#### D-14 · Plan : vue 12 semaines
- **Modèle** : Sonnet · **Dépend de** : F2-12, F2-14, C-02 · **Texte** : [taches-design.md, D-14](specs/design/taches-design.md#d-14--plan--vue-12-semaines)
- **Fichiers** : créer `src/ecrans/bureau/Plan.tsx`, `VueCycle.tsx`, `src/composants/BandeSemaines.tsx` ; modifier `src/miseEnPage/MiseEnPageBureau.tsx` (rubrique Plan), `src/index.css`.

> **Amendements de consolidation**
> 1. R-1, R-2 : colonnes « Phase 1 » à « Phase 3 », « Ouvrir la phase », « Objectifs de la phase ». Données : `lireCycles`, `lirePlanDuCycle`, `enregistrerCycle`, `enregistrerPhase` (F2-12), documents `PhaseCycle` et `ObjectifSpecifique`.
> 2. Accent (B13) : les cinq qualités **et** « technique » ; `null` tant que non choisi (« Choisis l'accent de la phase »).
> 3. Objectifs de la phase (O-09) : liste tirée de `OBJECTIFS_SPECIFIQUES` (C-02) filtrée par l'accent, plus « Écrire le mien » ; 2 au plus. Pas de filtrage par prérequis ici : l'avertissement P-12 le signalera (D-18), on avertit sans bloquer.
> 4. Semaine allégée : réduction 40, 50 ou 60 % (50 par défaut) ; chaque semaine peut aussi être passée en « affûtage » par son menu (mode objectif daté).
> 5. **Valider le cycle** (manquait : l'architecture veut un cycle `brouillon` invisible sur le téléphone tant qu'il n'est pas validé) : étiquette « BROUILLON » dans l'en-tête tant que `etat === 'brouillon'` ; bouton second « Valider le cycle » qui ouvre `Confirmation` (« Ton cycle apparaîtra sur ton téléphone. Tu pourras encore le modifier. ») puis passe `etat` à `'valide'`. Les avertissements n'empêchent jamais de valider.
> 6. En-tête : « Objectif (facultatif) » : libellé et date (`Cycle.objectif`). Nouveau cycle : `nbSemaines: 12`, `avertissementsGardes: []`, 3 phases à 4 semaines (3 charge, 1 allégée).
> 7. (consolidation 18/11, F5) **Fenêtre O-13 Nouveau cycle** (`parcours-et-ecrans.md`, consolidé 18/11), dans un fichier créé ici, `src/ecrans/bureau/NouveauCycle.tsx`, bâti sur la fenêtre de `Confirmation` (D-04) et les classes Topo existantes : nom, début (un lundi), séances par semaine, puis **niveau de détail** en dernier (trois choix encre avec leur ligne d'exemple), action principale « Créer le cycle ». (consolidation 23/11, F6) Présélection : `niveauPropose([])` de N-01 (la fenêtre n'a pas encore d'accents : Détaillé), et sa ligne `pourquoi` sous le choix (`aria-describedby`, `aria-live="polite"`) ; jamais de constante. `Cycle.niveauDetail` est **toujours** écrit à la création, avec le niveau affiché. Les accents et « Proposer un plan » viendront avec D-25.
> 8. (consolidation 18/11) En-tête de la vue 12 semaines : « Niveau : … » (choix encre) ; changer ouvre `Confirmation` (« Les séances suivront ce niveau. Rien n'est effacé. {n} séances gardent leur propre niveau. », action « Changer le niveau », lien « Les passer aussi en {niveau} » qui efface leur `niveauDetail`). Dépend aussi de N-01. Fichiers en plus : `src/ecrans/bureau/NouveauCycle.tsx`.

## Vague 3.3

> 9. (livraison 23/11, validé par le gérant) La fenêtre O-13 livrée demande déjà l'accent des trois phases (« Pas encore choisi » par défaut) avant le niveau, pour suivre F6 sans attendre D-25 ; `niveauPropose(accents)` y est appelé avec ces accents. La fenêtre de changement de niveau est un `<dialog>` propre à `VueCycle.tsx` (lien « Les passer aussi en … »). Le début du cycle n'est plus modifiable dès qu'une séance planifiée existe.

#### E-03 · Vérifications de séance : profil, douleurs, contexte (S-01 à S-09)
- **Modèle** : Sonnet · **Dépend de** : E-02 · **Texte** : [taches-entrainement.md, E-03](specs/entrainement/taches-entrainement.md#e-03--vérifications-de-séance--profil-douleurs-contexte-s-01-à-s-09)
- **Fichiers** : créer `src/regles/verifSeanceProfil.ts`, `src/regles/verifSeanceProfil.test.ts`.

> **Amendements de consolidation**
> 1. `manquesPrerequis` est **la seule** fonction de comparaison des prérequis de l'app (celle de F2-12 a été retirée) : la bibliothèque (D-11), la fiche (D-12), l'assistant (E-13) l'appellent par C-01.

#### E-04 · Vérifications de séance : déroulé, groupe, modules (S-10 à S-25)
- **Modèle** : Sonnet · **Dépend de** : E-02 · **Texte** : [taches-entrainement.md, E-04](specs/entrainement/taches-entrainement.md#e-04--vérifications-de-séance--déroulé-groupe-modules-s-10-à-s-25)
- **Fichiers** : créer `src/regles/verifSeanceDeroule.ts`, `src/regles/verifSeanceDeroule.test.ts`.

> **Amendements de consolidation**
> 1. (consolidation 18/11, F4) Application selon le contenu (B.5 consolidé) : S-10 à S-14, S-16, S-24, S-25 sont muettes si `etapesDetaillees === false` ; S-15 seulement si `niveau` est absent ou `'detaille'`. Ajouter **S-26** (information, solo seulement : `sansContenuConnu` et dure). Tests : cas 15 et 16 de B.11 ; S-26 sur une version solo dure `etapes: []`, muette si légère.
> 2. (consolidation 23/11, F7) Message de S-26 : texte du 23/11 de B.5, mot pour mot (« … l'app la compte comme une séance dure ordinaire. Si tu y fais de la poutre ou du bloc à ta limite, choisis son exercice principal : la règle des 48 h et les quotas en tiendront compte. »). Test en plus : le message ne contient pas « maximal ».

#### D-15 · Plan : vue phase (titre d'origine « vue bloc »)
- **Modèle** : Sonnet · **Dépend de** : D-14 · **Texte** : [taches-design.md, D-15](specs/design/taches-design.md#d-15--plan--vue-bloc)
- **Fichiers** : créer `src/ecrans/bureau/VuePhase.tsx` (et non `VueBloc.tsx`) ; modifier `src/ecrans/bureau/Plan.tsx` (sélecteur de vue), `src/index.css`.

> **Amendements de consolidation**
> 1. R-2 : fichier, titres et sélecteur « 12 semaines / Phase / Semaine ».
> 2. « Recopier la semaine 1 sur les semaines 2 et 3 » : **copie identique** (nouveaux identifiants, dates décalées). Il n'existe pas de fonction de progression : l'écran le dit (« Copie identique. Fais progresser les réglages à la main, voir la progression de chaque fiche. »). La semaine allégée n'est pas préparée automatiquement : l'avertissement W-10 le signalera.
> 3. « Ajouter une séance » crée une `SeancePlanifiee` vide : nom « Nouvelle séance », `qualite: 'technique'` (modifiable en D-16), solo `durete: 'legere'` sans étape, `groupe: null`.

## Vague 3.4

#### E-05 · Vérifications de semaine : espacement et quotas (W-01 à W-08)
- **Modèle** : Sonnet · **Dépend de** : E-02 · **Texte** : [taches-entrainement.md, E-05](specs/entrainement/taches-entrainement.md#e-05--vérifications-de-semaine--espacement-et-quotas-w-01-à-w-08)
- **Fichiers** : créer `src/regles/verifSemaineQuotas.ts`, `src/regles/verifSemaineQuotas.test.ts`.

> **Amendements de consolidation**
> 1. (consolidation 23/11, F7) Une séance dure sans exercice connu est une séance dure ordinaire : W-01 ne la vise pas (la règle des 48 h ne porte que sur les séances maximales et de poutre intensive), W-08 la compte, W-06 la compte comme jour de doigts sauf qualité `mobilite` ou `antagonistes`. Test : lundi une séance maximale, mardi une séance dure `etapes: []` de qualité `traction_gainage` → pas de W-01 sur mardi ; elle compte dans W-08 et dans W-06.

#### E-06 · Vérifications de semaine : charge et contenu (W-09 à W-19)
- **Modèle** : Sonnet · **Dépend de** : E-02 · **Texte** : [taches-entrainement.md, E-06](specs/entrainement/taches-entrainement.md#e-06--vérifications-de-semaine--charge-et-contenu-w-09-à-w-19)
- **Fichiers** : créer `src/regles/verifSemaineContenu.ts`, `src/regles/verifSemaineContenu.test.ts`.

> **Amendements de consolidation**
> 1. Messages de W-14 : « Cette phase met en avant… », « l'accent de cette phase » (texte corrigé dans `moteur-verification.md`, R-2). W-14 ignore une phase dont l'accent est `null`.
> 2. (consolidation 18/11) W-13 : une séance dont la version solo est `sansContenuConnu` entretient sa qualité dominante. Test : cas 14 de B.11 (pas de W-13).
> 3. (consolidation 23/11, F7) W-12 : une séance dure sans exercice connu n'est pas une séance maximale. Test : semaine allégée avec une séance dure `etapes: []`, dernière semaine de charge du bloc sans séance maximale → pas de W-12. W-09 et W-10 la comptent comme toute séance dure (effort prévu 7 × somme des parties).

#### C-01 · Passerelles entre le modèle v2, la bibliothèque et le moteur
- **Modèle** : Sonnet · **Dépend de** : E-02, E-03, F2-12, C-02, N-01 · **Texte** : [texte complet plus bas](#c-01-texte-complet)
- **Fichiers** : créer `src/regles/passerelles.ts`, `src/regles/passerelles.test.ts`, (consolidation 18/11) `src/regles/resumes.ts`, `src/regles/resumes.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (l'« adaptateur stockage → vue » annoncé par l'entraînement, que personne ne créait).
> 1. (consolidation 18/11, F4) Étapes 11 à 14 ajoutées au texte complet (niveaux de détail).

## Vague 3.5

> (livraison 24/11, validé par le gérant) Signatures réelles, à utiliser par les tâches suivantes (D-16, D-18, E-09, G-01…) : `seanceDepuisType(st, variante, base)` où `base` contient aussi `maintenant` (dates sans horloge) ; `planVersVerif({ …, fiches })` reçoit les fiches ; `contexteVerif(…, reglages?)` accepte des réglages facultatifs. Au-delà de 5 parties, la fin est regroupée en « Complément ». Point à traiter dans E-09 : si une séance a à la fois des étapes et des parties, l'exercice principal d'une partie absent des étapes compte dans les marqueurs planifiés mais pas dans les vérifications de séance ; `verifierSeance` (agrégation de S-01 à S-26) reste à écrire dans E-09.

#### E-07 · Vérifications du plan (P-01 à P-14)
- **Modèle** : Sonnet · **Dépend de** : E-02, E-03 · **Texte** : [taches-entrainement.md, E-07](specs/entrainement/taches-entrainement.md#e-07--vérifications-du-plan-p-01-à-p-14)
- **Fichiers** : créer `src/regles/verifPlan.ts`, `src/regles/verifPlan.test.ts`.

> **Amendements de consolidation**
> 1. Messages de P-03, P-09, P-10, P-11 au vocabulaire « phase » (texte corrigé dans `moteur-verification.md`, R-2). P-03, P-04, P-07 ignorent un accent `null`.
> 2. P-09 reste inactive tant qu'aucune fiche n'a `estTest` (trou T-01, tâche C-08).
> 3. (consolidation 18/11) Ajouter **P-15** (information, une fois par plan). Tests : un plan dont une séance a `etapesDetaillees: false` → P-15 avec `{n}` = 1 ; plan de séances détaillées → rien.

#### E-08 · Vérifications du jour (J-01 à J-07)
- **Modèle** : Haiku · **Dépend de** : E-02 · **Texte** : [taches-entrainement.md, E-08](specs/entrainement/taches-entrainement.md#e-08--vérifications-du-jour-j-01-à-j-07)
- **Fichiers** : créer `src/regles/verifJour.ts`, `src/regles/verifJour.test.ts`.

> **Amendements de consolidation** : branchée sur l'écran par C-03, phase 4.
> 1. (consolidation 23/11, F7) J-02 et J-04 ne visent pas une séance du jour dure sans exercice connu (séance dure ordinaire) ; J-01, J-03 et J-07 s'y appliquent, comme à toute séance dure. Tests : séance maximale réalisée il y a 20 h, séance du jour dure `etapes: []` → pas de J-04 ; même séance avec deux voyants au rouge → J-01.

#### D-11 · Bibliothèque filtrable
- **Modèle** : Sonnet · **Dépend de** : F2-14, C-01 · **Texte** : [taches-design.md, D-11](specs/design/taches-design.md#d-11--bibliothèque-filtrable)
- **Fichiers** : créer `src/ecrans/bureau/Bibliotheque.tsx`, `src/composants/FicheProtocole.tsx`, `src/donnees/bibliotheque/filtres.ts`, `filtres.test.ts` ; modifier `src/miseEnPage/MiseEnPageBureau.tsx` (rubrique Bibliothèque, au lieu de `App.tsx`), `src/index.css`.

> **Amendements de consolidation**
> 1. La fonction « [entraînement] prérequis » est `etatPrerequis(fiche, profil, douleurs, aujourdhui)` de C-01 (manques en clair = phrases de `manquesPrerequis`, E-03 ; contre-indication active via `zonesDouloureuses`).
> 2. Exercices personnels : lus par `lireExercicesPerso` (F2-12) et convertis par `ficheDepuisExercicePerso` (C-01) ; filtre « origine : bibliothèque / mes exercices » (remplace la rubrique « Mes exercices » de l'architecture). Étiquette « HORS ASSISTANT » si `exclureDeLaGeneration`.
> 3. « Créer un exercice » reste désactivé avec sa raison jusqu'à D-13.
> 4. (consolidation 18/11, F3) L'étiquette « HORS ASSISTANT » devient **« À LA MAIN SEULEMENT »** (fiche `exclureDeLaGeneration`, ou `estTest` quand le champ existera) : ni le générateur ni l'assistant ne la proposent ; elle reste ajoutable à la main, avec sa raison.

## Vague 3.5 bis (consolidation 23/11)

E-17 seule : elle reprend des fichiers de E-04 à E-07 et de C-01 (toutes livrées), donc elle passe après elles, et E-09 l'attend. Elle ne partage aucun fichier avec D-11, D-12, D-15 ni G-02.

#### E-17 · Plafond de résistance en voie (W-20) et sujet des avertissements
- **Modèle** : Sonnet · **Dépend de** : E-04, E-05, E-06, E-07, C-01 (livrées) · **Texte** : [plus bas](#e-17-texte-complet)
- **Fichiers** : modifier `src/regles/types.ts`, `reglesParDefaut.ts`, `reglesParDefaut.test.ts`, `verifSemaineQuotas.ts`, `verifSemaineQuotas.test.ts`, `verifSemaineContenu.ts`, `verifSemaineContenu.test.ts`, `verifPlan.ts`, `verifPlan.test.ts`, `verifSeanceDeroule.ts`, `verifSeanceDeroule.test.ts`, `passerelles.ts`, `passerelles.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (décision F2 d'Arthur, point 13 ; unicité de B.3).

## Vague 3.6

#### E-09 · Points d'entrée du moteur et tests d'intégration
- **Modèle** : Sonnet · **Dépend de** : E-03 à E-08, (consolidation 23/11) E-17 · **Texte** : [taches-entrainement.md, E-09](specs/entrainement/taches-entrainement.md#e-09--points-dentrée-du-moteur-et-tests-dintégration)
- **Fichiers** : créer `src/regles/index.ts`, `src/regles/integration.test.ts`.

> **Amendements de consolidation**
> 1. `index.ts` réexporte aussi les fonctions de `passerelles.ts` (C-01) : les écrans n'importent que `src/regles/index.ts`.
> 2. (consolidation 18/11) Réexporter aussi `resumes.ts` (C-01). Tests d'intégration en plus : cas 13 à 16 de B.11 ; le plan de 12 semaines du cas 1, rendu au niveau simple (étapes gardées), donne les mêmes avertissements qu'au niveau détaillé, sauf S-15 (« aucun avertissement ne disparaît »).
> 3. (consolidation 23/11, F7) Cas 14 et 15 dans leur version du 23/11 : cas 14 → `S-26` seul, sans `W-01` ; cas 15 → ni `W-01` ni `S-26`, et sa variante avec `traction-lestee-force-lattice` → `W-01` fort sur la séance du 25.
> 4. (consolidation 23/11, W-20) **Dédoublonnage** (étape 3) par `code` + `seanceId` + `version` + `etapeIndex` + `lundi` + `mesocycleOrdre` + **`sujet`** (B.3 consolidé). Un champ absent compte comme vide ; ne jamais dédoublonner sur le seul `code` + `lundi` ou sur le message. `verifierSemaine` couvre W-02 à **W-20** (W-20 est dans `verifierQuotasSemaine` depuis E-17 : rien à ajouter). Tests d'intégration en plus : cas 17 et 18 de B.11 ; cas 18 → deux `W-18` (puis deux `W-05`) **après** dédoublonnage, par `verifierSemaine` et par `verifierPlan`. Critère « Un même problème ne sort qu'une fois » : il reste vrai, deux objectifs sont deux problèmes.

#### D-12 · Fiche protocole en panneau latéral
- **Modèle** : Sonnet · **Dépend de** : D-11 · **Texte** : [taches-design.md, D-12](specs/design/taches-design.md#d-12--fiche-protocole-en-panneau-latéral)
- **Fichiers** : créer `src/composants/PanneauLateral.tsx`, `src/ecrans/bureau/FicheDetail.tsx`, `src/donnees/bibliotheque/reglages.ts`, `reglages.test.ts` ; `src/index.css`.

> **Amendements de consolidation**
> 1. Prérequis ligne par ligne avec `etatPrerequis` (C-01) ; « Pas renseigné : compte comme non rempli, par prudence. »
> 2. « Essayer le chrono » ouvre le chrono en **aperçu** : rien n'est enregistré, ce n'est pas une séance (compatible avec R-6). Pas de bouton « Commencer la séance ».
> 3. Référence d'un exercice personnel : titre complet tiré de `LIVRES` (F2-02) et page ; jamais d'autre contenu du livre.

#### G-02 · Semaines types du générateur (données) — consolidation 18/11
- **Modèle** : Haiku · **Dépend de** : E-10 · **Texte** : [plus bas](#g-02-texte-complet)
- **Fichiers** : créer `src/donnees/semainesTypes.ts`, `src/donnees/semainesTypes.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (décision F3).

## Vague 3.7

#### E-16 · Chaque séance type passe le moteur
- **Modèle** : Haiku · **Dépend de** : E-09, E-10 · **Texte** : [taches-entrainement.md, E-16](specs/entrainement/taches-entrainement.md#e-16--chaque-séance-type-passe-le-moteur)
- **Fichiers** : créer `src/donnees/seancesTypes.moteur.test.ts`.

> **Amendements de consolidation**
> 1. (consolidation 18/11) Refaire la même boucle avec `niveau: 'simple'` puis `'grandes_lignes'` sur la version solo (étapes gardées) : aucun avertissement non plus. Profil « tout rempli » : `lieux: ['salle_bloc', 'salle_voie', 'maison']`.

#### D-13 · Création d'un exercice personnel
- **Modèle** : Sonnet · **Dépend de** : D-12, F2-12 · **Texte** : [taches-design.md, D-13](specs/design/taches-design.md#d-13--création-dun-exercice-personnel)
- **Fichiers** : créer `src/ecrans/bureau/ExercicePerso.tsx`, `src/donnees/exercicePerso.ts`, `src/donnees/exercicePerso.test.ts` ; modifier `src/ecrans/bureau/Bibliotheque.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. `src/donnees/exercicePerso.ts` : `marqueursDepuisReponses(r)` ; « Je ne sais pas » compte comme « oui ». Correspondances : « Effort maximal des doigts ? » → `maximale` ; « Sur poutre ? » → `poutre` (et `poutre_intensive` si l'effort est aussi maximal) ; **« Bloc à ta limite ? »** (question ajoutée, demandée par la règle S-19) → `bloc_limite` ; « Arqué, bidoigts ou trous ? » → `arque`, `bidoigts`, `trou` ; « Sans pieds au pan ? » → `pan_gullich`. Un test par question et un test « tout je ne sais pas ».
> 2. Enregistrement par `enregistrerExercicePerso` (F2-12) au format `ExercicePerso` consolidé (`marqueurs`, `contreIndications`, `contexte.terrain`, `reference` avec les clés de `LIVRES`).

#### G-01 · Banque d'exercices : tri commun — consolidation 18/11
- **Modèle** : Sonnet · **Dépend de** : E-03, E-09, E-10, C-01, D-20 (lieux) · **Texte** : [plus bas](#g-01-texte-complet)
- **Fichiers** : créer `src/regles/banque.ts`, `src/regles/banque.test.ts` ; modifier `src/regles/index.ts` (une ligne d'export).

> **Amendements de consolidation** : tâche nouvelle (décision F3).

## Vagues 3.8 à 3.11 (consolidation 18/11 : D-16, D-17, D-18, D-19 y restent, une par vague, avec G-03, D-25 et D-26 à côté)

#### D-16 · Plan : vue semaine et éditeur de séance — vague 3.8
- **Modèle** : Sonnet · **Dépend de** : D-15, D-12, C-01, E-10 · **Texte** : [taches-design.md, D-16](specs/design/taches-design.md#d-16--plan--vue-semaine-et-éditeur-de-séance)
- **Fichiers** : créer `src/ecrans/bureau/VueSemaine.tsx`, `src/composants/FicheSeance.tsx`, `src/composants/RailBibliotheque.tsx` ; modifier `src/ecrans/bureau/Plan.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. Ajouter une étape = `etapeDepuisProtocole` ou `etapeDepuisExercicePerso` (C-01) : l'étape est recopiée complète (architecture § 3.2).
> 2. En-tête de la fiche : **dureté choisie** (défaut proposé par la règle `estDure`, modifiable ; la règle S-17 a besoin d'une dureté déclarée), **qualité dominante** choisie (défaut : celle de la première étape qui n'est pas un échauffement), **effort prévu** (défaut 7 si dure, 4 si légère, B17). La durée reste calculée.
> 3. Version groupe : **pas d'étapes d'échauffement commun stockées** ; une ligne fixe le rappelle (« Échauffement en commun : 20 à 30 min de grimpe de plus en plus dure »). Puis le mini-bloc (avant ou après) et 1 à 3 objectifs : libellé, cible, compte, couleur conseillée, `blocs`, `essaisMaxParBloc`, « Choisir un objectif type » (catalogue `OBJECTIFS_GROUPE`, E-10) ou « tiré d'un protocole » (`ficheReference`).
> 4. « Ajouter une séance type » (menu du jour) : catalogue E-10 converti par `seanceDepuisType` (C-01), qui remplit `seanceTypeId` et `variante`.
> 5. Bandeau « Ce plan a changé sur ton téléphone. » avec « Voir la nouvelle version » quand `surDonneesChangees` signale un changement d'un document affiché (règle : la dernière modification gagne).
> 6. (consolidation 18/11, F3) Dépend aussi de **G-01** : le menu « Ajouter une séance type » montre d'abord `seancesTypesDisponibles` (avec leur recommandation), puis les autres en pointillé avec leur raison, toujours ajoutables (avertir sans bloquer). L'éditeur reste celui du niveau détaillé ; les deux autres niveaux viennent avec D-26.

#### G-03 · Générateur de plan — vague 3.8 (consolidation 18/11)
- **Modèle** : Sonnet · **Dépend de** : G-01, G-02, C-01, E-09, N-01 · **Texte** : [plus bas](#g-03-texte-complet)
- **Fichiers** : créer `src/regles/generateur.ts`, `generateur.test.ts`, `src/regles/allegement.ts`, `allegement.test.ts` ; modifier `src/regles/index.ts` (une ligne d'export).

> **Amendements de consolidation** : tâche nouvelle (décision F3). En parallèle de D-16 : aucun fichier commun.
> 1. (consolidation 23/11, W-20) Dépend aussi de E-17. Comme un `maxParSemaine`, le plafond `RESISTANCE_VOIE_PAR_SEMAINE[profil.disciplinePrincipale]` se compte sur les séances déjà choisies dans la semaine (séances qui portent `resistance_voie`). Aujourd'hui aucune séance type n'en contient : rien ne change ; le test « aucun avertissement fort » couvre W-20 quand le catalogue en recevra.

#### D-17 · Plan : glisser-déposer et alternatives clavier — vague 3.9
- **Modèle** : Sonnet · **Dépend de** : D-16 · **Texte** : [taches-design.md, D-17](specs/design/taches-design.md#d-17--plan--glisser-déposer-et-alternatives-clavier)
- **Fichiers** : `VueSemaine.tsx`, `VuePhase.tsx` (et non `VueBloc.tsx`), `RailBibliotheque.tsx`, `FicheSeance.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. R-2 pour le nom du fichier. Aucune bibliothèque de glisser-déposer n'a été retenue : événements de pointeur, sans nouvelle dépendance.

#### D-25 · Nouveau cycle : accents et « Proposer un plan » — vague 3.9 (consolidation 18/11)
- **Modèle** : Sonnet · **Dépend de** : D-14, G-03 · **Texte** : [plus bas](#d-25-texte-complet)
- **Fichiers** : modifier `src/ecrans/bureau/NouveauCycle.tsx`, `src/ecrans/bureau/Plan.tsx`. **Ne touche pas `src/index.css`** (vague partagée avec D-17).

> **Amendements de consolidation** : tâche nouvelle (décisions F3, F5).
> 1. (consolidation 23/11, F6) Les accents viennent **avant** le niveau, et la présélection du niveau suit les accents (`niveauPropose`, N-01) : étape 1 du texte complet, mise à jour.

> (livraison D-14, 23/11) Les listes d'accents existent déjà dans `NouveauCycle.tsx` : D-25 y branche `accentsDeDepart` comme présélection au lieu de « Pas encore choisi », sans les recréer.

#### D-18 · Avertissements de sécurité en direct — vague 3.10
- **Modèle** : Sonnet · **Dépend de** : D-17, E-09, C-01 · **Texte** : [taches-design.md, D-18](specs/design/taches-design.md#d-18--avertissements-de-sécurité-en-direct)
- **Fichiers** : `VueSemaine.tsx`, `FicheSeance.tsx`, `VuePhase.tsx`, `VueCycle.tsx`, `src/composants/Avertissement.tsx`.

> **Amendements de consolidation** (forme de la sortie : celle du moteur, B.3)
> 1. Calcul : `planVersVerif` + `contexteVerif` (C-01) puis `verifierPlan` (E-09) avec l'origine `'utilisateur'`, recalculé à chaque changement (mémorisé).
> 2. Affichage : `formeAffichage(a)` (C-01) donne `'information'`, `'avertissement'` ou `'arret'` pour le composant `Avertissement` (niveau « information » ajouté par D-03). Placement par `portee` et cible (`seanceId`, `etapeIndex`, `lundi`, `mesocycleOrdre`).
> 3. « Pourquoi ? » affiche le champ `source` du moteur (pas de texte d'explication séparé). **Correction en un clic seulement pour W-01** : « Décaler au lendemain » (date + 1 jour) ; les autres avertissements n'en ont pas. Critère d'acceptation adapté en conséquence.
> 4. « Je garde ce choix » ajoute `cleAvertissement(a)` (C-01) à `Cycle.avertissementsGardes` ; l'avertissement replié reste compté dans les résumés.

#### D-19 · Tableau de bord — vague 3.11
- **Modèle** : Sonnet · **Dépend de** : D-14, D-18, F2-12 · **Texte** : [taches-design.md, D-19](specs/design/taches-design.md#d-19--tableau-de-bord)
- **Fichiers** : créer `src/ecrans/bureau/TableauDeBord.tsx` ; modifier `src/miseEnPage/MiseEnPageBureau.tsx` (au lieu de `App.tsx`).

> **Amendements de consolidation**
> 1. R-6 (B12) : **pas de « Faire la séance ici »** ; la fiche « Prochaine séance » est en lecture, avec « Les séances se lancent depuis ton téléphone ».
> 2. « Derniers tests » : état vide « Les tests de fin de phase arrivent en phase 6. » ; « Demander un brouillon à l'assistant » désactivé (« Arrive en phase 5 »).
> 3. Titre « Semaine 6 sur 12 », mention « Phase 2 · puissance » (R-2) ; cycle terminé par `cycleTermine` (F2-12).
> 4. (consolidation 18/11) La fiche « Prochaine séance » suit le niveau affiché (`niveauAffiche`, N-01 ; `partiesAffichees`, `recommandationAffichee`, C-01) : étapes, parties ou recommandation. Toujours aucun bouton de lancement (R-6).

#### D-26 · Fiche de séance aux trois niveaux — vague 3.11 (consolidation 18/11)
- **Modèle** : Sonnet · **Dépend de** : D-18, N-01, C-01, G-01 · **Texte** : [plus bas](#d-26-texte-complet)
- **Fichiers** : modifier `src/composants/FicheSeance.tsx`, `src/index.css` ; créer `src/composants/EditeurResume.tsx` (simple et grandes lignes).

> **Amendements de consolidation** : tâche nouvelle (décisions F4, F5). En parallèle de D-19 : aucun fichier commun.

## Fin de phase 3

**Sur un vrai téléphone** : rien de nouveau ne doit apparaître ; vérifier qu'aucune régression n'est venue des tâches partagées (séance solo, groupe, débrief, profil), et qu'un cycle **brouillon** construit sur l'ordinateur reste invisible sur le téléphone. **Sur ordinateur** : construire à la main un cycle de 12 semaines complet (3 phases, objectifs, versions solo et groupe), provoquer un avertissement des 48 h et le corriger en un clic, valider le cycle. (consolidation 18/11) Puis créer un second cycle avec « Proposer un plan » au niveau **grandes lignes**, passer une séance en simple puis en détaillé (rien ne se perd), écrire une séance simple à la main sans exercice et voir S-26. (consolidation 23/11) Dans la fenêtre « Nouveau cycle », vérifier que le niveau proposé passe de Détaillé à Grandes lignes quand les trois accents sont endurance, résistance ou technique, avec sa ligne « pourquoi » (F6) ; placer la séance dure sans exercice le lendemain d'une séance maximale : S-26 seul, pas d'avertissement des 48 h (F7).

**Audit Fable** : (1) entraînement — les 65 vérifications du moteur contre `moteur-verification.md` (code, niveau, message, source), les 12 cas de B.11, les 26 séances types sans avertissement (E-16) ; (2) « avertir sans bloquer » — aucun bouton désactivé par un avertissement, signaux d'arrêt visibles ; (3) passerelles C-01 — un `null` du profil compte comme non rempli, conversion `allegee` ↔ `decharge`, marqueurs jamais stockés ; (4) exercices personnels — « je ne sais pas » produit les marqueurs prudents, aucun contenu de livre recopié ; (5) accessibilité du glisser-déposer (tout au clavier) ; (6) (consolidation 18/11) niveaux et banque — changer de niveau n'efface rien, aucun avertissement de semaine ou de plan ne disparaît en simple ou en grandes lignes, le générateur ne place aucune fiche à vérifier, de test, contre-indiquée ou hors lieux, aucun `maxParSemaine` dépassé ; (7) (consolidation 23/11) le niveau d'un cycle est toujours celui affiché dans O-13, présélectionné par `niveauPropose` (F6) ; une séance dure sans exercice connu n'a aucun marqueur et S-26 ne parle pas d'effort maximal (F7).

---

# Phase 4 — Téléphone sur le plan

## Vague 4.1

#### D-22 · Aujourd'hui et Programme branchés sur le plan
- **Modèle** : Sonnet · **Dépend de** : D-06, D-07, D-14, F2-12, F2-14, C-01, E-09 · **Texte** : [taches-design.md, D-22](specs/design/taches-design.md#d-22--aujourdhui-et-programme-branchés-sur-le-plan)
- **Fichiers** : `src/ecrans/Aujourdhui.tsx`, créer `src/ecrans/Programme.tsx`, `src/miseEnPage/MiseEnPageTelephone.tsx` (onglets, au lieu de `App.tsx`), `src/App.tsx` (vues de séance), `src/ecrans/SeanceSolo.tsx`, `src/ecrans/SeanceGroupe.tsx`, `src/ecrans/Debrief.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. Données : `cycleEnCours`, `lireSeancesEntre`, `statutSeance` (F2-12, cinq statuts). Séance lancée depuis le plan : le brouillon de séance réalisée porte `seancePlanifieeId`, `qualite`, `salleId` et `marqueurs` = `marqueursVersionPlanifiee` (C-01) de la version exécutée. Séance libre : `mode: 'libre'`.
> 2. R-2 : « Phase 1 · doigts · semaine 2 sur 4 », « SEMAINE ALLÉGÉE ».
> 3. Séance manquée (règle A3-6, pas de rattrapage) : « Séance de lundi pas faite. Elle n'est pas rattrapée : on continue le plan. » Séance sautée : « Séance sautée. » Aucun choix « La faire aujourd'hui » (aucune règle ne le fonde).
> 4. Rubalise ambre si un avertissement de la semaine (`verifierSemaine` par C-01) cite la séance du jour. La ligne « Forme du jour » et les contrôles du jour viennent avec C-03 ; les boutons déplacer et sauter avec C-05.
> 5. Débrief : « Séance prévue : … · faite » et état d'envoi d'après `aEnvoyer` (« Enregistrée sur ce téléphone · envoyée » ou « · envoi au retour du réseau »).
> 6. (consolidation 18/11, F5) Aujourd'hui et l'aperçu de Programme montrent la séance à son **niveau affiché** (`niveauAffiche`, N-01 ; `partiesAffichees`, `recommandationAffichee`, C-01) : étapes, parties ou recommandation, avec les sous-titres de T-06 consolidé. Le choix de l'écran de séance se fait dans `App.tsx` : détaillé → `SeanceSolo` ; simple et grandes lignes → `SeanceEnBref`, qui arrive avec D-27 (jusque-là, ces séances s'ouvrent en `SeanceSolo` si elles ont des étapes ; sinon le bouton solo est masqué). Le téléphone ne change jamais le niveau.

## Vague 4.2

#### C-03 · Forme du jour et contrôles du jour
- **Modèle** : Sonnet · **Dépend de** : D-22, E-08, E-09, C-01 · **Texte** : [texte complet plus bas](#c-03-texte-complet)
- **Fichiers** : créer `src/donnees/formes.ts`, `formes.test.ts`, `src/ecrans/FormeDuJour.tsx` ; modifier `src/ecrans/Aujourdhui.tsx`, `src/miseEnPage/MiseEnPageTelephone.tsx`.

> **Amendements de consolidation** : tâche nouvelle (décision B10).

#### C-05 · Petits ajustements du plan sur téléphone
- **Modèle** : Sonnet · **Dépend de** : D-22 · **Texte** : [texte complet plus bas](#c-05-texte-complet)
- **Fichiers** : `src/donnees/plan.ts`, `src/donnees/plan.test.ts`, `src/ecrans/Programme.tsx`.

> **Amendements de consolidation** : tâche nouvelle (décision B11).

#### D-27 · Séance en bref sur téléphone (simple et grandes lignes) — consolidation 18/11
- **Modèle** : Sonnet · **Dépend de** : D-22, D-05, D-08, N-01, C-01 · **Texte** : [plus bas](#d-27-texte-complet)
- **Fichiers** : créer `src/moteur/seanceEnBref.ts`, `src/moteur/seanceEnBref.test.ts`, `src/ecrans/SeanceEnBref.tsx` ; modifier `src/App.tsx`, `src/index.css`.

> **Amendements de consolidation** : tâche nouvelle (décisions F4, F5). En parallèle de C-03 et C-05 : aucun fichier commun.

## Vague 4.3

#### C-04 · Douleurs déclarées
- **Modèle** : Sonnet · **Dépend de** : C-03, D-08 · **Texte** : [texte complet plus bas](#c-04-texte-complet)
- **Fichiers** : créer `src/donnees/douleurs.ts`, `douleurs.test.ts`, `src/ecrans/DeclarerDouleur.tsx` ; modifier `src/ecrans/Questions.tsx`, `src/ecrans/Profil.tsx`, `src/App.tsx`.

> **Amendements de consolidation** : tâche nouvelle (règles S-05, S-06, J-05 ; écran T-11).

## Fin de phase 4

**Sur un vrai téléphone (une semaine réelle)** : Aujourd'hui affiche la séance prévue, solo ou groupe selon le mode habituel, (consolidation 18/11) à son niveau de détail (faire au moins une séance simple et une en grandes lignes, chrono libre, « Stop, ça fait mal » visible) ; une séance à la salle en mode avion, puis le retour du réseau ; le débrief relié à la séance prévue ; la forme du jour remplie un matin et son effet (contrôle J-01) ; une séance déplacée puis une séance sautée sur le téléphone, visibles ensuite sur l'ordinateur ; une douleur déclarée puis marquée résolue.

**Audit Fable** : contrôles du jour conformes à B.8 et affichés sans bloquer ; parcours douleur (aucun diagnostic, signes d'alerte → arrêt et consultation, rien de médical en texte libre) ; ajustements du téléphone et règle « dernière modification gagne » (cas de conflit testé) ; aucune séance d'exemple restante ; fonctionnement hors ligne complet à la salle.

---

# Phase 5 — Assistant IA

**[ARTHUR] avant la vague 5.1** : créer sa propre clé API dans la Console Claude, dédiée à l'app, avec une date d'expiration et une limite de dépense. Guide pas à pas : `docs/cle-api.md` (écrit par C-06 ; en attendant, `docs/architecture-v2.md` § 5.2). Chaque ami fera de même pour lui.

## Vague 5.1

#### E-11 · Format et validation des réponses de l'assistant
- **Modèle** : Sonnet · **Dépend de** : — · **Texte** : [taches-entrainement.md, E-11](specs/entrainement/taches-entrainement.md#e-11--format-et-validation-des-réponses-de-lassistant)
- **Fichiers** : créer `src/assistant/format.ts`, `validerReponse.ts`, `validerReponse.test.ts`.

> **Amendements de consolidation**
> 1. D.4 consolidé : l'accent d'un brouillon de phase accepte `'technique'` (B13). Les clés JSON (`blocs`, `type: 'bloc'`) restent (R-2).
> 2. (consolidation 18/11, F4) Troisième forme de `SeanceBrouillon` (séance résumée : `niveau`, `recommandation`, `parties`) et règle **F-9** (D.4 consolidé). Tests : simple à 2 parties → A-01 ; partie avec un `ficheId` absent de la banque → A-02 ; recommandation de 121 caractères → A-01.

#### E-14 · Prompt système de l'assistant
- **Modèle** : Haiku · **Dépend de** : — · **Texte** : [taches-entrainement.md, E-14](specs/entrainement/taches-entrainement.md#e-14--prompt-système-de-lassistant)
- **Fichiers** : créer `src/assistant/promptSysteme.ts`, `promptSysteme.test.ts`.

> **Amendements de consolidation**
> 1. Le bloc D.6 a été corrigé (consolidation 17/11) : « phase » pour la période de 4 semaines dans les textes affichés, phase de technique possible (B13), livres cités seulement comme lecture conseillée, jamais comme source d'une règle. Recopier la version actuelle ; ajouter au test la phrase « Ne prête jamais à un livre une règle ou un chiffre ».
> 2. (consolidation 18/11) Le bloc D.6 a un paragraphe « # Niveaux de détail » : le recopier ; ajouter au test la phrase « Préfère toujours une séance type (seanceTypeId), à tous les niveaux ».

#### C-06 · Appel de l'assistant : clé, modèle, coût estimé
- **Modèle** : Sonnet · **Dépend de** : D-20 · **Texte** : [texte complet plus bas](#c-06-texte-complet)
- **Fichiers** : créer `src/assistant/appel.ts`, `appel.test.ts`, `src/assistant/cout.ts`, `cout.test.ts`, `docs/cle-api.md` ; modifier `src/ecrans/bureau/Reglages.tsx`, `index.html`.

> **Amendements de consolidation** : tâche nouvelle (« l'appel relève de l'architecte », mais aucune tâche ne l'écrivait ; décisions B5 à B7).

## Vague 5.2

#### E-12 · Développer un brouillon de l'assistant en plan vérifiable
- **Modèle** : Sonnet · **Dépend de** : E-01, E-10, E-11 · **Texte** : [taches-entrainement.md, E-12](specs/entrainement/taches-entrainement.md#e-12--développer-un-brouillon-de-lassistant-en-plan-vérifiable)
- **Fichiers** : créer `src/assistant/developperBrouillon.ts`, `developperBrouillon.test.ts`.

> **Amendements de consolidation**
> 1. La sortie reste un `PlanVerif` (vue du moteur, semaines `decharge`) ; la conversion en documents enregistrés (`allegee`, `PhaseCycle`, étapes recopiées) est faite par C-07.
> 2. (consolidation 18/11) Dépend aussi de G-03 : l'allègement de l'étape 4 **appelle** `allegerSeance` (`src/regles/allegement.ts`) au lieu d'être réécrit. Séance résumée : `VersionVerif` avec une étape résumée par partie qui a un `ficheId`, `etapesDetaillees: false`, `dureeMin` = somme des parties, `niveau` de la séance ; en semaine allégée, la durée de chaque partie × (1 − réduction).

#### E-13 · Contexte envoyé à l'assistant
- **Modèle** : Sonnet · **Dépend de** : E-03, E-10, E-11, C-01, C-02 · **Texte** : [taches-entrainement.md, E-13](specs/entrainement/taches-entrainement.md#e-13--contexte-envoyé-à-lassistant)
- **Fichiers** : créer `src/assistant/contexte.ts`, `contexte.test.ts`.

> **Amendements de consolidation**
> 1. Profil : `profilVersVerif` (C-01) ; `joursDisponibles` vient de `Profil.joursDisponibles` (F2-02) ; `pointsFaibles` (un texte dans le profil) est découpé aux virgules et retours à la ligne ; `objectifsPerso` = catalogue C-02 filtré par `manquesPrerequis` et les zones douloureuses.
> 2. Exercices personnels : `ficheDepuisExercicePerso` (C-01). Toujours sans prénom ni poids.
> 3. (consolidation 18/11, F3) **Ne pas réécrire le tri** : `trierFiches` et `seancesTypesDisponibles` viennent de `src/regles/banque.ts` (G-01) ; les étapes 1 et 2 du texte d'origine se réduisent à leur appel (les tests d'origine restent, ils passent par G-01). Contexte en plus (D.3 consolidé) : `niveauDetail`, `profil.lieux`, `recommandation` de chaque séance type, `niveau` de chaque séance à venir, raison `test`. Dépend aussi de G-01.
> 4. (consolidation 23/11, F6) `niveauDetail` = niveau du cycle en cours ; pour une demande « Brouillon de cycle », toujours `'detaille'` (le niveau du nouveau cycle se choisit après la réponse, D-23). Test : demande « Brouillon de cycle » avec un cycle en cours en simple → `niveauDetail: 'detaille'`.

## Vague 5.3

#### E-15 · Traitement d'une réponse de l'assistant
- **Modèle** : Sonnet · **Dépend de** : E-09, E-11, E-12 · **Texte** : [taches-entrainement.md, E-15](specs/entrainement/taches-entrainement.md#e-15--traitement-dune-réponse-de-lassistant)
- **Fichiers** : créer `src/assistant/traiterReponse.ts`, `traiterReponse.test.ts`.

> **Amendements de consolidation** : aucun.

#### C-07 · Du brouillon au plan : élément par élément
- **Modèle** : Sonnet · **Dépend de** : E-12, C-01, F2-12 · **Texte** : [texte complet plus bas](#c-07-texte-complet)
- **Fichiers** : créer `src/assistant/elements.ts`, `elements.test.ts`, `src/assistant/appliquer.ts`, `appliquer.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (contradiction tranchée : D.5 prévoyait « accepter tout, modifier, rejeter » ; le design, qui prime pour l'interface, trie élément par élément).
> 1. (consolidation 18/11, F4) Une séance type devient une séance avec ses étapes complètes et sa `recommandation`, sans `niveauDetail` (elle suit le cycle). Une séance résumée devient une `VersionSolo` avec `etapes: []`, `recommandation` et `parties` (`ficheId` → `principal`, source `bibliotheque` ou `perso` selon la liste d'origine) ; son `niveauDetail` n'est posé que s'il diffère de celui du cycle. Test : une séance simple gardée s'affiche en simple et garde sa fiche principale dans `marqueursVersionPlanifiee`.
> 2. (consolidation 23/11, F6) Un nouveau cycle ne reçoit **pas** le niveau du contexte : `appliquerElement` prend un paramètre `niveauCycle: NiveauDetail` pour l'élément qui crée le cycle, et l'écrit dans `Cycle.niveauDetail`. C'est le niveau affiché en tête du brouillon (D-23), présélectionné par `niveauPropose` (N-01) sur les accents des phases du brouillon. Fonction en plus : `accentsDuBrouillon(reponse): AccentPhase[]` (accents des `blocs`, dans l'ordre). Dépend aussi de N-01. Tests : brouillon endurance, résistance, technique → `niveauPropose(accentsDuBrouillon(r)).niveau === 'grandes_lignes'` ; garder la phase 1 avec `niveauCycle: 'simple'` → cycle créé en simple.

## Vague 5.4

#### D-23 · Panneau de l'assistant
- **Modèle** : Sonnet · **Dépend de** : D-16, D-18, D-20, E-13, E-14, E-15, C-06, C-07 · **Texte** : [taches-design.md, D-23](specs/design/taches-design.md#d-23--panneau-de-lassistant)
- **Fichiers** : créer `src/ecrans/bureau/Assistant.tsx`, `src/composants/ElementProposition.tsx` ; modifier `src/ecrans/bureau/VueSemaine.tsx`, `src/composants/BarreBureau.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. Chaîne : `construireContexte` (E-13) → `appelerAssistant` (C-06) → `traiterReponse` (E-15, au plus une relance) → `decouperEnElements` puis `appliquerElement` / `annulerElement` (C-07). Aucun document n'est écrit sans « Garder ».
> 2. **Coût avant chaque demande (B6)** : sous le champ, « Coût estimé : ≈ 0,01 $ avec Haiku (au plus 0,02 $ s'il faut une relance) » (`estimerCout`, C-06), mis à jour quand la demande change ; le modèle utilisé est nommé. En-tête : « CLÉ SUR CET APPAREIL ».
> 3. Demandes toutes faites : « Brouillon de cycle », « Brouillon de cette phase », « Ajuster cette semaine » (R-2).
> 4. Sources (D.4) : `fiche` ouvre la fiche (D-12) ; `methode` : auteur et idée ; `synthese` : « Synthèse du projet : … » ; `livre` : **titre seul, sous « Lecture conseillée »**, jamais rattaché à une phrase du brouillon.
> 5. Ordinateur seulement (B7) : le bouton « Assistant » n'existe pas sur téléphone. Un cycle créé par l'assistant reste `brouillon` jusqu'à « Valider le cycle » (D-14).
> 6. (consolidation 18/11) Sous le champ de demande : « Niveau : celui du cycle (grandes lignes) ». (consolidation 23/11, F6) Cette mention n'est pas modifiable dans le panneau (le niveau se change dans l'en-tête du cycle). Pour une demande « Brouillon de cycle », aucun niveau n'est demandé avant l'envoi (le contexte part en `'detaille'`, E-13) : la réponse de type cycle affiche en tête, au-dessus des éléments, « Niveau du cycle » en trois choix encre (mêmes lignes d'exemple que O-13), présélection `niveauPropose(accentsDuBrouillon(reponse))` (N-01, C-07) et sa ligne `pourquoi` ; garder le premier élément crée le cycle à ce niveau (`niveauCycle`, C-07). L'assistant ne choisit jamais le niveau.

## Fin de phase 5

**Sur un vrai téléphone** : rien de l'assistant n'y apparaît ; un cycle créé avec l'assistant, retouché puis validé sur l'ordinateur, arrive dans Programme. **Sur ordinateur** : un brouillon de cycle avec Haiku, coût affiché avant l'envoi, trois éléments gardés ou rejetés un par un, puis retouchés à la main.

**Audit Fable** : (1) clé API — jamais synchronisée, exportée, écrite dans la console ou un message d'erreur, connexions limitées par la politique de sécurité du contenu à l'app, Supabase et `api.anthropic.com` ; (2) contrôles A-01 à A-07, une seule relance, refus des demandes de perte de poids ; (3) **sources** — aucun livre cité comme source d'une règle ou d'un chiffre, auteurs de la liste fermée seulement ; (4) les règles de sécurité s'appliquent au brouillon comme au plan manuel (S-02 en fort pour l'assistant), (consolidation 18/11) à tous les niveaux de détail, et l'assistant ne pioche que dans la banque envoyée (G-01) ; (5) estimation du coût à comparer avec la facture réelle de quelques demandes.

---

# Phase 6 — Bilans

## Vague 6.1

#### C-08 · Catalogue des tests repères
- **Modèle** : Sonnet · **Dépend de** : recherche sur la bibliothèque (trou T-01), C-01, E-02 · **Texte** : [texte complet plus bas](#c-08-texte-complet)
- **Fichiers** : créer `src/donnees/testsReperes.ts`, `testsReperes.test.ts` ; modifier `src/regles/adaptateur.ts` (`estTest`), `src/regles/passerelles.ts` (résultats de tests).

> **Amendements de consolidation** : tâche nouvelle.

## Vague 6.2

#### D-24 · Bilans sur ordinateur et téléphone
- **Modèle** : Sonnet · **Dépend de** : F2-14, C-08 · **Texte** : [taches-design.md, D-24](specs/design/taches-design.md#d-24--bilans-sur-ordinateur-et-téléphone)
- **Fichiers** : créer `src/ecrans/bureau/Bilans.tsx`, `src/composants/PetitGraphique.tsx`, `src/ecrans/SaisirTest.tsx` ; modifier `src/ecrans/Historique.tsx`, `src/miseEnPage/MiseEnPageBureau.tsx`, `src/index.css`.

> **Amendements de consolidation**
> 1. R-2 : onglets « Qualités / Phases / Séances » ; « tests de fin de phase » ; séparations de phase en pointillé.
> 2. « Saisir un test repère » (ordinateur et téléphone) : catalogue C-08, enregistrement d'un `ResultatTest` (table `resultatsTests`).
> 3. Repère de traction (B14) : tracé seulement si `Profil.repereTraction` n'est pas `'aucun'`, en pointillé, légendé « repère : moyenne de population, pas un objectif ».

## Fin de phase 6

**Sur un vrai téléphone** : saisir les tests de fin de phase en semaine 4 ; la liste des séances groupée par semaine. **Sur ordinateur** : les courbes des cinq qualités, la comparaison de deux phases.

**Audit Fable** : protocoles de test sourcés et vérifiés (recherche B21) ; courbes exactes (recalcul à la main de deux points) ; repère de traction absent par défaut ; résumés lisibles par un lecteur d'écran.

---

# Tâches ajoutées par la consolidation (texte complet)

Elles suivent la même forme que les autres. Règles à joindre : `CLAUDE.md`, R-1 à R-8, et les « Règles communes » de `taches-entrainement.md` (fonctions pures, imports en `.ts`, aucune dépendance nouvelle, tests Vitest à côté du fichier). Les tâches des phases 4 à 6 seront relues par l'architecte et le concepteur au début de leur phase (plan v2, § 7).

### C-01 (texte complet)

**C-01 · Passerelles entre le modèle v2, la bibliothèque et le moteur** — phase 3, Sonnet.
- **Objectif** : convertir les documents enregistrés (architecture § 3.2) en vues du moteur de vérification (`moteur-verification.md` B.1) et inversement fabriquer des étapes et des séances planifiées à partir de la bibliothèque. C'est le seul endroit où les noms des deux mondes se rencontrent (R-2).
- **Dépend de** : E-02 (types, `ficheDepuisProtocole`, `marqueursVersion`, `zonesDouloureuses`), E-03 (`manquesPrerequis`), F2-12, C-02 ; E-10 pour `seanceDepuisType` (déjà livrée en vague 3.2).
- **Lire** : `docs/architecture-v2.md` § 3.2 et § 3.5 ; `docs/specs/entrainement/moteur-verification.md` B.1 à B.3 ; `src/donnees/modele.ts`, `src/donnees/profil.ts`, `src/moteur/types.ts`, `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/adaptateur.ts`, `src/regles/reglesParDefaut.ts`, `src/regles/verifSeanceProfil.ts`, `src/donnees/seancesTypes.ts`, `src/donnees/objectifsGroupe.ts`, `src/donnees/objectifsSpecifiques.ts`, `src/donnees/bibliotheque/index.ts`.
- **Créer** : `src/regles/passerelles.ts`, `src/regles/passerelles.test.ts`. Fonctions pures uniquement (les écrans lisent la base, puis appellent ces fonctions).
- **Étapes**
  1. `profilVersVerif(p: Profil): ProfilVerif` : `tractionsStrictes` → `tractionsStrictesMax`, `tient15sSur25mm` → `test15sSur25mm`, `majeur` → `adulte`, `niveauBloc` vide → `null` ; le reste tel quel.
  2. `ficheDepuisExercicePerso(e: ExercicePerso): FicheVerif` : `origine: 'perso'`, `marqueurs` tels quels (`null` possible), `prerequis ?? {}`, `contexte`, `contreIndications`, `reposEntreEffortsS`, `solliciteDoigts` selon B.2 (terrain bloc, voie, pan ou poutre). `toutesLesFiches(exercicesPerso)` = `fichesDeLaBibliotheque()` + exercices perso non supprimés.
  3. `etapeDepuisProtocole(p: Protocole, id: string, reglages?: ReglagesEtape): EtapeSeance` et `etapeDepuisExercicePerso(e, id, reglages?)` : recopie complète (titre = nom, `resume`, `consigne`, `preuve`, champs de la `Forme`), `dureeMin = reglages.dureeMin ?? dureeMin`, `reglages.series` appliqué à `config.series` d'un chrono, `reglages.reposS` à `reposS` d'une forme `essais`, `origine: { source, refId, reglages }`.
  4. `seanceDepuisType(st, variante, base: { id, cycleId, phaseId, semaine, date }): SeancePlanifiee` : déroulé solo (ou variante) recopié par l'étape 3, version groupe avec les objectifs du catalogue (`modeleId`, `ficheReference`, `blocs`, `essaisMaxParBloc`, `ecartCotation`, `reposConseilleS`, `accents`) et le mini-bloc, `qualite`, `durete`, `seanceTypeId`, `variante`.
  5. `marqueursVersionPlanifiee(v: VersionSolo | VersionGroupe, fiches): Marqueur[]` : union des marqueurs des fiches citées par `origine.refId` et des `ficheReference` des objectifs (sert à `SeanceRealisee.marqueurs`, D-22).
  6. `seanceVersVerif(s, fiches, realisee?)` et `realiseeVersVerif(r)` (séance hors plan) : `ficheId = origine?.refId ?? etape.id` (une étape sans origine déclenche S-01, c'est voulu), `moduleObjectifId = objectifSpecifiqueId`, groupe : étapes du mini-bloc, objectifs avec `accents ?? []` et marqueurs de leur `ficheReference` ; `realisee` : `version` = mode (`libre` → `solo`), `finLe = creeLe`, `dureeMin`, `effortPercu`, `marqueurs ?? []`, `peau`.
  7. `planVersVerif({ cycle, phases, seances, realisees, objectifs, origine, cycleSuivant? })` : semaines dans l'ordre (phase puis numéro), `lundi` calculé (F2-12), type `allegee` → `decharge`, `mesocycleOrdre`, `numero` ; `mesocycles` : `ordre`, `accent` (`null` possible), `objectifsPersoIds` (ids des `ObjectifSpecifique` de la phase) ; `mode` et `objectif` calculés (nombre de semaines `affutage`, réduction de la première) ; les séances **sautées** et supprimées sont exclues ; `cycleSuivantDebut` si un cycle suivant existe.
  8. `contexteVerif({ profil, reglages, exercicesPerso, douleurs, formes, resultatsTests, objectifs, aujourdhui, maintenant })` : `regles` = `REGLES_PAR_DEFAUT` surchargé par les valeurs de `reglages.reglesSecurite` **du même type** (les autres sont ignorées) ; `objectifsPerso` : catalogue C-02 converti (`objectifVersVerif`) plus les objectifs « écrits à la main » (marqueurs vides, prérequis vides) ; `douleurs` non supprimées ; `formes` ; `resultatsTests` vide tant que C-08 n'existe pas.
  9. `etatPrerequis(fiche: FicheVerif, profil, douleurs, aujourdhui): { manques: string[]; contreIndications: ZoneDouleur[] }` pour la bibliothèque (D-11, D-12).
  10. `cleAvertissement(a)` = `[code, seanceId, version, etapeIndex, lundi, mesocycleOrdre].join('|')` (vides pour les absents) ; `formeAffichage(a)` : `'arret'` pour S-04, S-05, S-06 et J-05 ; `'avertissement'` pour les autres de niveau `fort` ; `'information'` sinon.
  11. (consolidation 18/11) `profilVersVerif` : `lieux` recopiés ; `[]` → `['salle_bloc']` (prudence). `seanceDepuisType` recopie la `recommandation` de la séance type (celle de la variante si elle en a une) et ne pose pas `niveauDetail`.
  12. (consolidation 18/11) Créer `src/regles/resumes.ts` : `partiesDepuisEtapes(etapes, qualiteSeance, fiches)` (familles et fusion de `docs/specs/niveaux-de-detail.md` § 1.4) ; `recommandationParDefaut(version, qualite, durete, fiches)` (§ 1.3) ; `partiesAffichees(version, qualite, fiches)` = `parties` ou `partiesDepuisEtapes` ; `recommandationAffichee(...)` = `recommandation` ou `recommandationParDefaut`.
  13. (consolidation 18/11) `seanceVersVerif(s, fiches, realisee?, cycle?)` : version solo selon § 3.1 de `niveaux-de-detail.md` : étapes réelles s'il y en a ; sinon une étape résumée par partie qui a un `principal` (`ficheId` = `principal.refId`, `reglages.dureeMin` = durée de la partie), `etapesDetaillees: false`, `dureeMin` = somme des parties ; `niveau` = `niveauAffiche(s, cycle)` (N-01). Version groupe inchangée.
  14. (consolidation 18/11) `marqueursVersionPlanifiee` ajoute les fiches des `parties[].principal`.
- **Tests (consolidation 18/11, en plus)** : ST-DOI-02 → 3 parties (43, 47 et 20 min) ; chacune des 26 séances types → 2 à 5 parties ; séance simple écrite à la main avec `principal` `traction-simple-4x5` → une étape résumée et `etapesDetaillees: false` ; même séance détaillée passée en simple → `seanceVersVerif` identique sauf `niveau` ; profil sans lieux → `['salle_bloc']`.
- **Tests** : profil avec `tractionsStrictes: null` → S-03 « (non renseigné) » à travers `verifierSeance` ; aller-retour `etapeDepuisProtocole('doigts-echelles-3-6-9')` → `seanceVersVerif` retrouve le `ficheId` ; `reglages.series` appliqué au chrono ; `EXEMPLE_PHASES` (F2-02) → semaine 4 `decharge` ; séance sautée absente de `planVersVerif` ; réglage utilisateur `heuresEntreSeancesMax: 'x'` ignoré ; `formeAffichage` sur S-04 et W-01 ; ST-DOI-02 via `seanceDepuisType` puis `verifierSeance` sans avertissement (profil « tout rempli » de E-16).
- **Critères** : aucune lecture de base dans le fichier ; aucun champ calculable ajouté aux documents.

### C-02 (texte complet)

**C-02 · Catalogue des objectifs spécifiques** — phase 3, Sonnet.
- **Objectif** : la liste des objectifs spécifiques proposables (0 à 2 par phase, modules de 10 à 15 min), dont ont besoin la fenêtre O-09 (D-14), la règle P-12 et l'assistant (E-13).
- **Dépend de** : F2-02 ; **la recherche sur la bibliothèque (B21)** pour les objectifs aujourd'hui sans fiche.
- **Lire** : `docs/specs/entrainement/regles-planification.md` A.5 et A.7 ; `docs/specs/entrainement/seances-types.md` C.4 ; `src/donnees/bibliotheque/types.ts` et `index.ts`.
- **Créer** : `src/donnees/objectifsSpecifiques.ts`, `objectifsSpecifiques.test.ts`.
- **Étapes**
  1. Type `ObjectifSpecifiqueType { id: string /* "OS-01" */; nom: string; ficheModule: string; reglages?: ReglagesEtape; accents: AccentPhase[]; pourquoi: string /* une phrase */; testRepere?: string /* libellé du test, en clair */; remplacementId?: string }`. Les marqueurs, prérequis et contre-indications **ne sont pas saisis** : `objectifVersVerif(o)` les déduit de la fiche du module (même principe que E-10).
  2. Saisir seulement les objectifs dont la fiche existe (A.7) : bidoigts (`doigts-abrahangs`), traction à un bras (`traction-prises-decalees`), prévention des épaules (`antagonistes-legers`), prévention des coudes (`antagonistes-legers`, avec `pourquoi` qui dit que c'est partiel), peur de la chute en voie (`mental-ecole-de-vol`, 20 min : la règle S-24 le signalera). Remplacement par défaut : prévention des épaules.
  3. Les objectifs arqués, planche de gymnastique (B15), front lever, souplesse de hanches en 10 à 15 min et peur de la chute en bloc **attendent la recherche** : ne rien inventer ; ils seront ajoutés quand leurs fiches existeront.
- **Tests** : chaque `ficheModule` et `remplacementId` existe ; aucune fiche `exclureDeLaGeneration` ; deux objectifs d'une même liste proposée ne partagent pas de marqueur à quota (A7-4).

### C-03 (texte complet)

**C-03 · Forme du jour et contrôles du jour** — phase 4, Sonnet (décision B10).
- **Objectif** : quelques questions le matin, qui alimentent les contrôles du jour (J-01 à J-07) affichés sur Aujourd'hui, sans jamais bloquer.
- **Dépend de** : D-22, E-08, E-09, C-01 ; table `formes` (F2-04).
- **Lire** : `docs/architecture-v2.md` § 3.2 (`FormeDuJour`) ; `moteur-verification.md` B.8 ; `parcours-et-ecrans.md` T-06 ; `src/ecrans/Aujourdhui.tsx` ; `src/donnees/stockage.ts`.
- **Fichiers** : créer `src/donnees/formes.ts` (`lireForme(date)`, `enregistrerForme(forme)` par `ecrire('formes', …)` avec `id = date`, `lireFormesEntre(debut, fin)`), `formes.test.ts`, `src/ecrans/FormeDuJour.tsx` ; modifier `src/ecrans/Aujourdhui.tsx`, `src/miseEnPage/MiseEnPageTelephone.tsx` (ouverture de l'écran).
- **Étapes** : (1) écran de 5 questions de 1 à 5 en choix encre — « Sommeil cette nuit », « Fatigue », « Courbatures », « Douleur » (1 = forte, 5 = aucune), « Peau des doigts » (1 = abîmée) — plus « Heures de sommeil » facultatif ; « 30 secondes » ; action principale « Enregistrer » ; (2) ligne « Forme du jour » dans Aujourd'hui : « À renseigner » ou le résumé (« 2 voyants au rouge ») ; (3) contrôles : `verifierJour(seanceDuJour, contexteVerif(…), realisees)` affichés au-dessus de la fiche avec `formeAffichage` (C-01) ; texte des messages = celui du moteur ; aucun bouton désactivé.
- **Critères** : une seule forme par jour, même saisie sur deux appareils (identifiant = date) ; « 2 voyants au rouge » + séance dure → J-01 visible ; hors ligne, tout marche.

### C-04 (texte complet)

**C-04 · Douleurs déclarées** — phase 4, Sonnet.
- **Objectif** : déclarer une douleur datée (zone, signes d'alerte), la voir prise en compte par les règles (S-04 à S-06, J-05), la marquer résolue. Jamais de diagnostic.
- **Dépend de** : C-03, D-08 ; table `douleurs` (F2-04).
- **Lire** : `regles-planification.md` A.8 ; `moteur-verification.md` S-04 à S-06 et J-05 ; `parcours-et-ecrans.md` T-11 ; `src/ecrans/Questions.tsx`, `src/ecrans/MisesEnGarde.tsx`, `src/ecrans/Profil.tsx`.
- **Fichiers** : créer `src/donnees/douleurs.ts` (`declarerDouleur`, `marquerResolue`, `lireDouleursOuvertes(jour)`), `douleurs.test.ts`, `src/ecrans/DeclarerDouleur.tsx` ; modifier `src/ecrans/Questions.tsx`, `src/ecrans/Profil.tsx`, `src/App.tsx`.
- **Étapes** : (1) après « Oui » à la douleur dans Trois questions, proposer « Préciser » (facultatif) ; (2) écran : zone (`ZONES`), puis « As-tu un de ces signes ? » avec les signes d'arrêt de A.8 en cases à cocher (texte mot pour mot) ; au moins un coché → `niveau: 'alerte'` et signal d'arrêt « Arrête la séance et consulte un médecin ou un kiné qui connaît l'escalade. » ; aucun → `niveau: 'reduction'` et l'avertissement « Allège pendant 1 à 2 semaines » des mises en garde ; (3) Profil : liste des douleurs ouvertes avec leur date et « Marquer comme résolue » (`resolueLe` = aujourd'hui).
- **Critères** : aucun champ de texte libre médical ; aucune gravité ni nom de lésion affichés ; une douleur ouverte depuis 14 jours fait apparaître J-05 sur Aujourd'hui.

### C-05 (texte complet)

**C-05 · Petits ajustements du plan sur téléphone** — phase 4, Sonnet (décision B11).
- **Objectif** : depuis le téléphone, déplacer une séance à un autre jour de la même semaine, ou la sauter ; rien d'autre ne se modifie sur téléphone.
- **Dépend de** : D-22.
- **Lire** : `docs/architecture-v2.md` § 2.5 (exception B11) et § 3.5 (statuts) ; `regles-planification.md` A3-6 ; `src/donnees/plan.ts` ; `src/ecrans/Programme.tsx`.
- **Fichiers** : `src/donnees/plan.ts` (ajouter `deplacerSeance(id, nouvelleDate)`, `sauterSeance(id)`, `annulerSaut(id)`, tous par `ecrire`), `src/donnees/plan.test.ts`, `src/ecrans/Programme.tsx` (aperçu d'une séance).
- **Étapes** : (1) dans l'aperçu d'une séance à venir : « Déplacer » (choix d'un jour de la **même semaine**, pas avant aujourd'hui : une séance manquée ne se rattrape pas en fin de semaine, A3-6) et « Sauter cette séance » (`Confirmation`) ; une séance sautée affiche « Annuler » ; (2) après un déplacement, les avertissements de la semaine (W-01 surtout, par C-01 et E-09) s'affichent dans l'aperçu, sans bloquer ; (3) phrase « Ce changement sera aussi visible sur ton ordinateur. »
- **Critères** : statut « sautée » calculé (F2-12) ; un déplacement vers un jour passé ou une autre semaine est impossible ; le changement arrive sur l'ordinateur à la synchronisation suivante.

### C-06 (texte complet)

**C-06 · Appel de l'assistant : clé, modèle, coût estimé** — phase 5, Sonnet (décisions B5 à B7).
- **Objectif** : l'appel à l'API Claude depuis le navigateur avec la clé de l'utilisateur, la vérification de la clé, le coût estimé avant chaque demande, la protection de la page.
- **Dépend de** : D-20 (clé et choix du modèle enregistrés).
- **Lire** : `docs/architecture-v2.md` § 5.1, 5.2, 5.4 (version consolidée) ; `src/donnees/stockage.ts` (`lireAppareil`, `ecrireAppareil`) ; `src/ecrans/bureau/Reglages.tsx`.
- **Fichiers** : créer `src/assistant/appel.ts`, `appel.test.ts`, `src/assistant/cout.ts`, `cout.test.ts`, `docs/cle-api.md` ; modifier `src/ecrans/bureau/Reglages.tsx`, `index.html`.
- **Étapes**
  1. `cout.ts` : `MODELE_PAR_DEFAUT = 'claude-haiku-5-5'`, `MODELES` (Haiku, Sonnet) avec leurs prix par million de jetons (§ 5.4, commentaire « vérifié le 17/11/2026, à revérifier ») ; `estimerCout(texteEnvoye: string, modele): { probable: number; auPlus: number }` : jetons envoyés ≈ caractères / 3,5, jetons rendus = 8 000 au plus, `auPlus` = deux appels (une relance) ; `formaterCout(n)` → « moins de 0,01 $ », « ≈ 0,01 $ ».
  2. `appel.ts` : `appelerAssistant({ cle, modele, systeme, message, signal })` par `fetch` (§ 5.1), sans `output_config` (§ 5.1 consolidé), `max_tokens: 16000`, renvoie le texte du premier bloc `text` ; erreurs traduites : 401 « Ta clé a été refusée. Vérifie-la dans les réglages. », 429 et crédit épuisé « Ta clé n'a plus de crédit ou a atteint sa limite… », 5xx et réseau « Le service ne répond pas, ton plan n'a pas été modifié. », refus CORS d'organisation. La clé n'apparaît jamais dans un message, une erreur ou la console (test).
  3. Réglages : « Vérifier la clé » (un appel minimal à Haiku) → `appareil.cleApiEtat` = `{ etat: 'verifiee' | 'refusee', le }` ; affichage « Vérifiée le 17 nov. » / « Refusée ».
  4. `index.html` : `<meta http-equiv="Content-Security-Policy">` qui n'autorise les connexions (`connect-src`) que vers l'app, l'adresse Supabase du projet (`https://*.supabase.co`) et `https://api.anthropic.com` ; vérifier que l'app, la synchronisation et les polices marchent encore.
  5. `docs/cle-api.md` : guide pas à pas pour un ami peu technique : créer un compte sur la Console Claude, une clé dédiée à l'app avec une date d'expiration (30 jours) et une limite de dépense, la coller dans Profil → Assistant sur l'ordinateur, la retirer au moindre doute ; ce que coûte une demande.
- **Critères** : test de `fetch` simulé (en-têtes exacts, modèle choisi, aucune clé dans les erreurs) ; coût affiché cohérent avec le § 5.4 ; l'assistant n'est proposé que dans la mise en page ordinateur.

### C-07 (texte complet)

**C-07 · Du brouillon au plan : élément par élément** — phase 5, Sonnet.
- **Objectif** : découper une réponse de l'assistant en éléments que l'utilisateur garde, modifie ou rejette un par un (O-10), et appliquer un élément gardé au plan enregistré, de façon annulable.
- **Dépend de** : E-12, C-01, F2-12 (E-15 en parallèle : C-07 ne l'appelle pas).
- **Lire** : `docs/specs/entrainement/assistant-ia.md` D.4, D.5 ; `parcours-et-ecrans.md` P4 et O-10 ; `src/assistant/format.ts`, `developperBrouillon.ts` ; `src/regles/passerelles.ts` ; `src/donnees/plan.ts`.
- **Fichiers** : créer `src/assistant/elements.ts`, `elements.test.ts`, `src/assistant/appliquer.ts`, `appliquer.test.ts`.
- **Étapes**
  1. `decouperEnElements(reponse, planVerif)` : `cycle` → un élément par phase (3) ; `bloc` (brouillon de phase) → un élément par semaine (4) ; `semaine` → un élément par séance ; `ajustement` → un élément par opération. Chaque élément : `id`, `type` (`ajouter`, `retirer`, `deplacer`, `remplacer`, `regler`, `phase`, `semaine`), phrase de résumé en français (« Déplacer « Puissance au pan » de vendredi à samedi »), `raison`, numéros de sources, cible (`seanceId`, `lundi` ou ordre de phase), statut `en_attente`.
  2. `appliquerElement(element, planActuel)` → `{ aEcrire: documents; avant: documents }` : documents v2 (R-2) : nouveau cycle en `etat: 'brouillon'` avec `TraceAssistant` (sources en texte ; un livre par son titre seul), `PhaseCycle` (type `decharge` → `allegee`), séances par `seanceDepuisType` ou étapes recopiées par C-01 ; `avant` garde les versions précédentes pour `annulerElement`.
  3. Rien n'est écrit par ces fonctions : l'écran (D-23) écrit `aEcrire` par les fonctions de F2-12 après « Garder ».
- **Tests** : exemple 1 de D.9 → 3 éléments ; garder la phase 1 crée un cycle brouillon, une phase et 12 séances ; annuler restaure ; exemple 2 → 3 éléments `remplacer`, dates d'origine conservées.

### C-08 (texte complet)

**C-08 · Catalogue des tests repères** — phase 6, Sonnet.
- **Objectif** : les tests de fin de phase et de fin de cycle (A.5) sous forme de catalogue, pour saisir des résultats, activer la règle P-09 et tracer les courbes.
- **Dépend de** : **la recherche sur la bibliothèque (trou T-01)**, qui fournit des protocoles de test sourcés et vérifiés ; C-01, E-02.
- **Lire** : `regles-planification.md` A.5 ; `seances-types.md` C.4 (T-01) ; `docs/architecture-v2.md` § 3.2 (`ResultatTest`) ; `src/regles/adaptateur.ts`, `src/regles/passerelles.ts`.
- **Fichiers** : créer `src/donnees/testsReperes.ts`, `testsReperes.test.ts` ; modifier `src/regles/adaptateur.ts` (`estTest` pour les fiches de test), `src/regles/passerelles.ts` (`contexteVerif` : `resultatsTests` avec `testNom` et `sensProgres` du catalogue).
- **Étapes** : type `TestRepere { id; nom; unite; sensProgres: 'hausse' | 'baisse'; qualite; quand: 'fin_de_phase' | 'fin_de_cycle'; ficheId?: string }` ; saisir les tests de A.5 dont la fiche existe après la recherche ; aucun test inventé.
- **Critères** : P-09 s'active ; J-06 reçoit des résultats ; chaque test a sa source dans la fiche.

---

# Tâches ajoutées le 18/11 (texte complet)

Décisions F3 à F5 ; conception : `docs/specs/niveaux-de-detail.md` (à lire en entier pour chaque tâche ci-dessous). Règles à joindre : `CLAUDE.md`, R-1 à R-9, et les « Règles communes » de `taches-entrainement.md` pour N-01, G-01 à G-03 (fonctions pures, imports en `.ts`, aucune dépendance nouvelle, tests Vitest à côté du fichier), la section 0 de `taches-design.md` pour D-25 à D-27.

### N-01 (texte complet)

**N-01 · Niveaux de détail : types et fonctions de base** — phase 3, vague 3.0, Sonnet.
- **Objectif** : le modèle porte les trois niveaux ; quelques fonctions pures disent à quel niveau une séance s'affiche, sans lire la bibliothèque.
- **Dépend de** : F2-02.
- **Lire** : `docs/specs/niveaux-de-detail.md` § 1 (dont § 1.7, consolidation 23/11) et § 6 ; `docs/architecture-v2.md` § 3.2 et § 3.5 (consolidés 18/11) ; `src/donnees/modele.ts`, `src/donnees/plan.ts` (`dureeEtapes`), `docs/format-seance.md`.
- **Fichiers** : modifier `src/donnees/modele.ts`, `docs/format-seance.md`, `docs/modele-donnees.md` ; créer `src/donnees/niveaux.ts`, `src/donnees/niveaux.test.ts`.
- **Étapes**
  1. `modele.ts` : `NiveauDetail`, `NIVEAUX_DETAIL`, `PartieSeance`, `Cycle.niveauDetail?`, `SeancePlanifiee.niveauDetail?`, `VersionSolo.recommandation?`, `VersionSolo.parties?`, exactement comme l'architecture § 3.2 consolidée, avec leurs commentaires courts.
  2. `niveaux.ts` : (consolidation 23/11, F6) `ACCENTS_NERVEUX` et `niveauPropose(accents: (AccentPhase | null)[]): { niveau: NiveauDetail; pourquoi: string }`, exactement comme `niveaux-de-detail.md` § 1.7 (trois cas dans l'ordre, trois phrases `pourquoi` mot pour mot ; commentaire : « décision F6 d'Arthur : proposer selon les accents, jamais imposer ; jamais 'simple' ») ; `LONGUEUR_MAX_RECOMMANDATION = 120` ; `NB_PARTIES_MAX = 5` ; `ETIQUETTES_NIVEAU` (« Simple », « Grandes lignes », « Détaillé ») ; `EXEMPLES_NIVEAU` (les trois lignes d'exemple de O-13) ; `plusPetitNiveau(a, b)` ; `niveauChoisi(seance, cycle?)` ; `niveauDisponible(v: VersionSolo)` ; `niveauAffiche(seance, cycle?)` ; `dureeVersionSolo(v)` (étapes : `dureeEtapes` de `plan.ts` ; sinon somme des parties ; sinon 0).
  3. `docs/format-seance.md` : § 4.1 (`niveauDetail`), § 4.2 (`recommandation`, `parties`, `PartieSeance`) et une sous-section « Niveaux de détail » qui reprend `niveaux-de-detail.md` § 6 (si `etapes` est vide : recommandation et parties avec un chrono libre, ou ne pas proposer la séance). Ne pas toucher aux fichiers JSON de référence (l'exemple garde ses étapes, sans les nouveaux champs).
  4. `docs/modele-donnees.md` § 8 : une ligne qui renvoie aux niveaux de détail (architecture § 3.2, consolidation 18/11).
- **Tests** : document sans `niveauDetail` → `'detaille'` ; séance `simple` dans un cycle `detaille` → `'simple'` ; choisi `detaille` sans étapes avec des parties → `'grandes_lignes'` ; sans étapes ni parties → `'simple'` ; `dureeVersionSolo` avec étapes, avec deux parties (30 + 45 → 75), vide → 0 ; `NIVEAUX_DETAIL` dans l'ordre simple, grandes lignes, détaillé. (consolidation 23/11, F6) `niveauPropose` : `[]` et `[null, null, null]` → `detaille` (phrase 2) ; `['doigts', 'puissance', 'resistance']`, `['doigts', 'endurance', 'resistance']`, `['traction_gainage', 'endurance', 'puissance']` (les accents de départ) → `detaille` (phrase 1) ; `['endurance', null, 'technique']` → `detaille` (phrase 2) ; `['endurance', 'resistance', 'technique']` et `['technique', 'technique', 'technique']` → `grandes_lignes` (phrase 3) ; sur les 343 combinaisons de trois valeurs (six accents et `null`), jamais `simple`, et `pourquoi` jamais vide.
- **Critères** : `npm run build` et `npm run test` passent sans changer `format.test.ts` ni ses fichiers ; aucun champ calculable ajouté (R-8).

### G-01 (texte complet)

**G-01 · Banque d'exercices : tri commun** — phase 3, vague 3.7, Sonnet.
- **Objectif** : une seule fonction qui dit quelles fiches et quelles séances types le générateur et l'assistant peuvent proposer à ce grimpeur, et pourquoi les autres non.
- **Dépend de** : E-03 (`manquesPrerequis`), E-09 (`index.ts`), E-10 (catalogue), C-01 (`profilVersVerif`, `toutesLesFiches`), D-20 (`Profil.lieux`).
- **Lire** : `docs/specs/niveaux-de-detail.md` § 2.1 et § 2.2 ; `docs/specs/entrainement/taches-entrainement.md` E-13 (étapes 1 et 2, tests) ; `src/regles/types.ts`, `verifSeanceProfil.ts`, `base.ts`, `passerelles.ts` ; `src/donnees/seancesTypes.ts`.
- **Fichiers** : créer `src/regles/banque.ts`, `banque.test.ts` ; modifier `src/regles/index.ts` (une ligne d'export).
- **Étapes**
  1. `type RaisonIndisponible = 'a_verifier' | 'test' | 'prerequis' | 'douleur' | 'contexte'`.
  2. `lieuPermet(terrain, lieux): boolean` selon le tableau du § 2.2.
  3. `trierFiches(fiches: FicheVerif[], profil: ProfilVerif, zones: ZoneDouleur[]): { disponibles: FicheVerif[]; indisponibles: { fiche: FicheVerif; raison: RaisonIndisponible }[] }` : raisons dans l'ordre du § 2.1 (la première trouvée l'emporte).
  4. `seancesTypesDisponibles(disponibles: FicheVerif[]): { seanceType: SeanceType; variantes: string[] }[]` : toutes les fiches du solo et du mini-bloc sont disponibles ; une variante seulement si ses fiches le sont aussi.
- **Tests** : ceux de E-13 (étapes 1 et 2), ici ; plus : profil `lieux: ['salle_bloc']` → `endurance-4x4-voies` indisponible `contexte` ; `['salle_voie']` → disponible ; une fiche `estTest` → `test` ; une fiche à la fois `exclureDeLaGeneration` et à prérequis manquant → `a_verifier` ; disponibles + indisponibles = toutes les fiches, sans doublon.
- **Critères** : aucune lecture de base ; E-13 pourra appeler ces deux fonctions sans les réécrire.

### G-02 (texte complet)

**G-02 · Semaines types du générateur (données)** — phase 3, vague 3.6, Haiku.
- **Objectif** : recopier en données le tableau des choix du générateur.
- **Dépend de** : E-10.
- **Lire** : `docs/specs/niveaux-de-detail.md` § 2.4 (tableau, jours conseillés, accents, secours) ; `src/donnees/seancesTypes.ts` ; `src/donnees/profil.ts` (`JourSemaine`) ; `src/donnees/modele.ts` (`AccentPhase`).
- **Fichiers** : créer `src/donnees/semainesTypes.ts`, `semainesTypes.test.ts`.
- **Étapes**
  1. `interface ChoixSeance { seanceTypeId: string; variante?: string }` ; une **case** = `ChoixSeance[]` dans l'ordre de préférence. Le rôle d'une case (N, C, L, H) n'est pas saisi : c'est celui de sa première séance type (`seanceTypeParId`).
  2. `JOURS_CONSEILLES: Record<2 | 3 | 4 | 5, JourSemaine[]>` ; `SEMAINES_TYPES: Record<AccentPhase, Record<2 | 3 | 4, ChoixSeance[][]>>` (les 18 cases du tableau, identifiants complets « ST-DOI-02 ») ; `CASE_HORS_GRIMPE = [{ seanceTypeId: 'ST-HOR-01' }]` ; `SECOURS: Record<'N' | 'C' | 'L' | 'H', string[]>` ; `DERNIERE_SEANCE_VOIE = { seanceTypeId: 'ST-END-03' }`.
  3. `semaineType(accent, n: 2 | 3 | 4 | 5): ChoixSeance[][]` : pour 5, les cases de 4 avec `CASE_HORS_GRIMPE` en 4e position (vendredi).
  4. `accentsDeDepart(p: { anneesPratique: number; disciplinePrincipale: 'bloc' | 'voie' }): [AccentPhase, AccentPhase, AccentPhase]` (§ 2.4, point 1).
- **Tests** : chaque identifiant et chaque variante existent dans le catalogue ; les 6 accents × 3 nombres sont présents, avec autant de cases que de séances ; `semaineType('doigts', 5)` a 5 cases, ST-HOR-01 en 4e ; `accentsDeDepart` : 0,5 an → traction_gainage, endurance, puissance ; voie → doigts, endurance, resistance ; bloc → doigts, puissance, resistance.

### G-03 (texte complet)

**G-03 · Générateur de plan** — phase 3, vague 3.8, Sonnet.
- **Objectif** : proposer un cycle complet de 12 semaines, pioché dans la banque, vérifié par le moteur, prêt à retoucher. Rien n'est écrit : l'écran (D-25) enregistre.
- **Dépend de** : G-01, G-02, C-01 (`seanceDepuisType`, `etapeDepuisProtocole`, `planVersVerif`, `contexteVerif`), E-09 (`verifierPlan`), N-01.
- **Lire** : `docs/specs/niveaux-de-detail.md` § 2.3 à § 2.5 ; `regles-planification.md` A.1, A.3, A.4, A.6 ; `src/regles/passerelles.ts`, `banque.ts`, `index.ts` ; `src/donnees/semainesTypes.ts`, `seancesTypes.ts`, `plan.ts`.
- **Fichiers** : créer `src/regles/generateur.ts`, `generateur.test.ts`, `src/regles/allegement.ts`, `allegement.test.ts` ; modifier `src/regles/index.ts` (une ligne d'export).
- **Étapes**
  1. `allegement.ts` : `allegerSeance(s: SeancePlanifiee, reductionPct: number, type: 'allegee' | 'affutage', fiches): SeancePlanifiee` (copie, l'entrée n'est jamais modifiée) : chaque étape tirée de la bibliothèque est refaite par `etapeDepuisProtocole` avec `series = ceil(series / 2)` si le chrono a plus d'une série, et `dureeMin = max(1, round(dureeMin × (1 − réduction)))` ; **les étapes de qualité `echauffement` gardent leur durée** (décision F2, point 6 : échauffement complet avant un effort maximal) ; en `allegee`, note « Semaine allégée : niveau flash plutôt que projet. » sur les étapes dont la fiche porte `bloc_limite` ; même traitement pour le mini-bloc ; objectifs de groupe : `blocs` et `cible` divisés par deux (arrondi au-dessus) ; `dureeMin` annoncée du groupe et durée des `parties` × (1 − réduction). Effort prévu et dureté inchangés (A4-4).
  2. `generateur.ts` : `genererCycle(e: EntreesGenerateur): PlanGenere`. Entrées : `profil` (enregistré), `douleurs`, `exercicesPerso`, `reglages`, `debut`, `nom`, `seancesParSemaine`, `accents`, `niveauDetail`, `aujourdhui`, `maintenant`, `nouvelId: () => string`. Sortie : `{ cycle, phases, seances, avertissements, manques: string[] }`.
  3. Jours, choix des séances, secours, variante `lestee`, lecture voie, semaines 1 à 3 identiques, semaine 4 allégée si `dechargeActive` (réduction de `Reglages`, 50 % par défaut) : § 2.4, points 2 à 4, tels quels. Un `maxParSemaine` se compte sur les fiches des séances déjà choisies dans la semaine.
  4. Documents : `Cycle` (`etat: 'brouillon'`, `niveauDetail`, `nbSemaines: 12`, `avertissementsGardes: []`) ; 3 `PhaseCycle` (accent, semaines 3 charge + 1 allégée) ; `SeancePlanifiee` par `seanceDepuisType` (étapes complètes et recommandation, quel que soit le niveau ; sans `niveauDetail` propre).
  5. `avertissements = verifierPlan(planVersVerif(...), contexteVerif(...))` ; `manques` : phrases courtes (« Tu as 2 jours disponibles pour 3 séances : le plan en compte 2. », « Pas de séance possible le jeudi avec ton profil ou tes douleurs : repos. »).
- **Tests** : profil de référence (B.11), 3 séances, accent doigts → phase 1 = ST-DOI-02, ST-TRA-02, ST-END-02 mardi, jeudi, samedi ; pour chaque accent et 2 à 5 séances, aucun avertissement **fort** ; aucune fiche `exclureDeLaGeneration`, `estTest`, contre-indiquée ou hors lieux dans un plan généré (douleur `doigts` ; `lieux: ['salle_bloc']` avec discipline voie) ; aucun `maxParSemaine` dépassé ; poutre « aucune » → ST-DOI-01 ; semaine 4 : `puissance-bloc-limite` à 20 min, échauffement à 35 min, autant de séances maximales qu'en semaine 3 ; mêmes étapes aux niveaux simple et détaillé ; `allegerSeance` ne modifie pas son entrée.
- **Critères** : aucune lecture ni écriture de base ; aucun avertissement masqué ; cycle toujours en brouillon.

### D-25 (texte complet)

**D-25 · Nouveau cycle : accents et « Proposer un plan »** — phase 3, vague 3.9, Sonnet.
- **Objectif** : finir la fenêtre O-13 : le générateur remplit le cycle au niveau choisi.
- **Dépend de** : D-14 (fenêtre), G-03.
- **Lire** : `parcours-et-ecrans.md` O-13 (consolidé 18/11 et 23/11) ; `docs/specs/niveaux-de-detail.md` § 1.7, § 2.3 et § 4.1 ; `src/ecrans/bureau/NouveauCycle.tsx`, `Plan.tsx` ; `src/regles/index.ts` ; `src/donnees/plan.ts`, `src/donnees/niveaux.ts`.
- **Fichiers** : modifier `src/ecrans/bureau/NouveauCycle.tsx`, `src/ecrans/bureau/Plan.tsx`. Ne pas toucher `src/index.css` (classes Topo existantes seulement).
- **Étapes**
  1. Fenêtre : rappel des jours et des lieux du profil avec « Modifier dans ton profil » ; accents des 3 phases en listes (cinq qualités et technique), présélection `accentsDeDepart`. (consolidation 23/11, F6) Les accents sont placés **avant** le niveau de détail. Présélection du niveau : `niveauPropose(accents)` (N-01), avec sa ligne `pourquoi` sous le choix ; tant que l'utilisateur n'a pas touché au niveau, la présélection et la ligne suivent chaque changement d'accent ; dès qu'il choisit, son choix reste, et si la proposition diffère ensuite, la ligne devient « Ton choix. Pour ces accents, l'app propose {Niveau}. » (étiquette de `ETIQUETTES_NIVEAU`).
  2. Action principale « Proposer un plan » : `genererCycle`, puis écriture par `enregistrerCycle`, `enregistrerPhase`, `enregistrerSeancePlanifiee` ; ouvrir la vue 12 semaines du nouveau cycle. « Créer le cycle » devient l'action seconde « Commencer vide ».
  3. En tête de la vue : bandeau d'information « Plan proposé : {n} séances. {f} avertissements forts, {i} informations, à voir semaine par semaine. » et une ligne par manque (`Avertissement` niveau information). Rien n'est bloqué.
- **Critères** : le cycle proposé est en brouillon et n'apparaît pas sur le téléphone ; son niveau est celui choisi ; « Commencer vide » fait ce que faisait « Créer le cycle » ; tout au clavier ; R-6 (aucun lancement de séance). (consolidation 23/11, F6) Le niveau écrit est toujours celui affiché ; trois accents endurance, résistance, technique présélectionnent Grandes lignes ; changer un accent après avoir choisi un niveau ne change pas ce niveau.

### D-26 (texte complet)

**D-26 · Fiche de séance aux trois niveaux** — phase 3, vague 3.11, Sonnet.
- **Objectif** : sur ordinateur, choisir le niveau d'une séance et l'éditer à ce niveau, sans jamais rien perdre.
- **Dépend de** : D-18 (avertissements dans la fiche), N-01, C-01 (`resumes.ts`), G-01.
- **Lire** : `parcours-et-ecrans.md` O-05 (consolidé 18/11) ; `docs/specs/niveaux-de-detail.md` § 1.5 et § 4.1 ; `src/composants/FicheSeance.tsx`, `RailBibliotheque.tsx` ; `src/donnees/niveaux.ts` ; `src/regles/index.ts`.
- **Fichiers** : modifier `src/composants/FicheSeance.tsx`, `src/index.css` ; créer `src/composants/EditeurResume.tsx`.
- **Étapes**
  1. En-tête de la fiche : « Niveau : Comme le cycle ({niveau}) / Simple / Grandes lignes / Détaillé » (choix encre) → `niveauDetail` de la séance (« Comme le cycle » l'efface).
  2. `EditeurResume` : *simple* = recommandation (compteur sur 120), durée, exercice principal (« Choisir dans la bibliothèque », liste triée par `trierFiches`, étiquettes PRÉREQUIS et contre-indication, tout reste choisissable) ; *grandes lignes* = 1 à 5 parties (titre, durée, principal, consigne ; ajouter, monter, descendre, retirer). Une séance simple écrite à la main enregistre sa durée et son principal dans une seule partie (`titre: 'Séance'`).
  3. Séance avec étapes affichée en simple ou en grandes lignes : résumé calculé (`recommandationAffichee`, `partiesAffichees`), « Modifier le texte » (la valeur devient écrite), « Revenir au texte proposé » (efface le champ), « Voir les étapes ». Si des parties écrites coexistent avec des étapes : « Recalculer les grandes lignes » (efface `parties`).
  4. Séance sans étapes passée en détaillé : « Cette séance n'a pas encore d'étapes. » avec « Remplir depuis la séance type » (si `seanceTypeId` : étapes recopiées par C-01, recommandation et parties gardées) et « Ajouter une étape ».
  5. Avertissements : un avertissement qui vise une étape cachée s'affiche en tête de la fiche avec le nom de l'étape ; S-26 propose « Choisir l'exercice principal ».
- **Critères** : changer de niveau dans tous les sens ne supprime aucune étape, partie ni recommandation (test de composant ou test du fichier de données) ; aucune partie calculée n'est enregistrée (R-8) ; aucun avertissement ne disparaît ; tout au clavier, boutons de 48 px, focus visible.

### D-27 (texte complet)

**D-27 · Séance en bref sur téléphone (simple et grandes lignes)** — phase 4, vague 4.2, Sonnet.
- **Objectif** : écran T-16 : faire une séance simple ou en grandes lignes avec un chrono libre, les rappels de sécurité et le suivi habituel.
- **Dépend de** : D-22, D-05, D-08, N-01, C-01.
- **Lire** : `parcours-et-ecrans.md` T-16 et T-06 (consolidés 18/11) ; `docs/specs/niveaux-de-detail.md` § 4.2 ; `src/moteur/seanceSolo.ts`, `src/moteur/independance.test.ts`, `src/chrono/useRepos.ts`, `src/ecrans/SeanceSolo.tsx`, `src/App.tsx`.
- **Fichiers** : créer `src/moteur/seanceEnBref.ts`, `seanceEnBref.test.ts`, `src/ecrans/SeanceEnBref.tsx` ; modifier `src/App.tsx`, `src/index.css`.
- **Étapes**
  1. `seanceEnBref.ts` (pur, sans import d'écran, comme `seanceSolo.ts`) : état `{ parties: { titre; statut: 'faite' | 'passee' | 'a_faire'; refId? }[]; debutMs?; enPauseDepuisMs?; pausesMs }` ; `demarrer`, `pause`, `reprendre`, `marquerPartie(i, statut)`, `tempsEcouleS(etat, maintenantMs)`, `etapesRealisees(etat): EtapeRealisee[]`.
  2. `SeanceEnBref.tsx` : contenu de T-16 (chrono libre, recommandation ou parties cochables, « Lancer un repos » avec `useRepos`, rappels de sécurité d'une séance dure, rappel de sécurité du bloc s'il existe avant une séance `bloc_limite`, « Stop, ça fait mal » toujours visible, « Quitter » par `Confirmation`).
  3. `App.tsx` : « Je grimpe seul » ouvre `SeanceSolo` si le niveau affiché est détaillé, `SeanceEnBref` sinon ; « Terminer la séance » → Trois questions → Débrief ; la séance réalisée porte `mode: 'solo'`, la durée du chrono libre, `etapes` = `etapesRealisees`, `seancePlanifieeId`, `qualite`, `marqueurs` = `marqueursVersionPlanifiee` (C-01).
- **Tests** : `tempsEcouleS` avec une pause ; `etapesRealisees` d'une séance simple (une partie) et de trois parties ; `independance.test.ts` passe toujours.
- **Critères** : hors ligne, tout marche ; « Stop, ça fait mal » visible sur tout l'écran, au même endroit que dans le chrono ; boutons de séance de 64 px ; la séance faite apparaît « faite » dans Aujourd'hui et sur l'ordinateur.

---

# Tâche ajoutée le 23/11 (texte complet)

Deux trous signalés par les développeurs ; conception : `docs/specs/entrainement/moteur-verification.md` (ajouts « consolidation 23/11 » de B.1, B.2, B.3, B.6 et B.11). Règles à joindre : `CLAUDE.md`, R-1 à R-9, et les « Règles communes » de `taches-entrainement.md` (fonctions pures, imports en `.ts`, aucune dépendance nouvelle, tests Vitest à côté du fichier, rien dans `src/donnees/bibliotheque/`).

### E-17 (texte complet)

**E-17 · Plafond de résistance en voie (W-20) et sujet des avertissements** — phase 3, vague 3.5 bis, Sonnet.
- **Objectif** : (1) faire respecter la décision F2 d'Arthur, point 13 : au plus 1 séance de résistance en voie par semaine tant que le profil est « bloc », 2 en voie. Les fiches portent déjà le marqueur `resistance_voie` et `maxParSemaine: 1`, mais rien ne plafonnait le total. (2) Qu'aucune alerte légitime ne disparaisse au dédoublonnage quand une vérification en émet plusieurs pour la même cible (deux objectifs oubliés, deux fiches au-delà de leur plafond…).
- **Dépend de** : E-04, E-05, E-06, E-07, C-01 (livrées). E-09 dépend de E-17.
- **Lire** : `moteur-verification.md` B.1 (`Marqueur`), B.2 (`RESISTANCE_VOIE_PAR_SEMAINE`), B.3 (champ `sujet` et son tableau), B.6 (W-20 et ses précisions), B.11 (cas 17 et 18) ; `docs/recherche-b21/audit.md` (I-8, décision 13) ; `src/regles/types.ts`, `reglesParDefaut.ts`, `base.ts` (`marqueursSeance`), `verifSemaineQuotas.ts`, `verifSemaineContenu.ts`, `verifPlan.ts`, `verifSeanceDeroule.ts`, `passerelles.ts` ; `src/donnees/bibliotheque/resistance.ts` (les trois fiches de résistance en voie, en lecture seule).
- **Fichiers** : modifier `src/regles/types.ts`, `reglesParDefaut.ts`, `reglesParDefaut.test.ts`, `verifSemaineQuotas.ts`, `verifSemaineQuotas.test.ts`, `verifSemaineContenu.ts`, `verifSemaineContenu.test.ts`, `verifPlan.ts`, `verifPlan.test.ts`, `verifSeanceDeroule.ts`, `verifSeanceDeroule.test.ts`, `passerelles.ts`, `passerelles.test.ts`.
- **Étapes**
  1. `types.ts` : `Avertissement.sujet?: string`, avant `source`, commentaire « ce que vise l'alerte quand une vérification en émet plusieurs pour la même cible (B.3) ».
  2. `reglesParDefaut.ts` : `export const RESISTANCE_VOIE_PAR_SEMAINE: Record<'bloc' | 'voie', number> = { bloc: 1, voie: 2 }`, commentaire « Décision F2 d'Arthur, point 13 : 1 par semaine tant que le profil est « bloc », 2 si l'objectif devient la voie (Lattice : 2 au plus). Une constante, pas un réglage : elle dépend du profil. » `Regles`, `REGLES_PAR_DEFAUT` et `MARQUEURS_QUOTA` ne changent pas.
  3. `verifSemaineQuotas.ts`, dans `verifierQuotasSemaine`, après W-08 : **W-20** selon B.6. Compter les séances de `dansLaSemaine` dont `marqueursSeance(s, fiches)` contient `resistance_voie` ; plafond `RESISTANCE_VOIE_PAR_SEMAINE[ctx.profil.disciplinePrincipale]` ; niveau fort ; les deux messages de B.6 mot pour mot (`{n}` = nombre de séances) ; source « Décision d'Arthur (F2, point 13) ; audit B21, I-8 (Lattice) ». Mettre à jour le commentaire d'en-tête du fichier (W-01 à W-08, et W-20). La signature ne change pas.
  4. `sujet`, selon le tableau de B.3 et nulle part ailleurs : W-05 → `fiche.id` (`ajouter` reçoit un `sujet` facultatif) ; W-18 → identifiant de l'objectif (`verifSemaineContenu.ts`) ; P-11 → `` `${a.id}+${b.id}` ``, dans l'ordre de `objectifsPersoIds`, et P-12 → identifiant de l'objectif (`verifPlan.ts`, par `extra`) ; S-22 → rang de l'objectif dans `objectifs`, `String(i)` (`verifSeanceDeroule.ts`). Aucun message ne change.
  5. `passerelles.ts`, `cleAvertissement(a)` : ajouter `|${a.sujet}` à la fin **seulement si** `a.sujet` est présent. Une clé sans `sujet` reste identique : le test existant ne change pas.
- **Tests**
  - W-20 : cas 17 de B.11 et ses variantes (a), (b), (c), par `verifierQuotasSemaine`. Plus : profil bloc, une seule séance avec deux fiches de résistance en voie → muet (une séance compte une fois) ; profil bloc, une séance `resistance-4x4-blocs` et une `resistance-voies-repetees` → muet (la résistance en bloc ne compte pas) ; l'alerte a `portee: 'semaine'` et `lundi`, sans `mesocycleOrdre` ni `sujet`.
  - `sujet` : cas 18 de B.11 (deux W-18, `sujet` `'o1'` et `'o2'` ; deux W-05) ; trois objectifs portant `poutre` sur une phase → trois P-11 de `sujet` distincts ; deux objectifs inadaptés sur une phase → deux P-12 de `sujet` distincts ; deux objectifs de groupe `bloc_limite` sans plafond → deux S-22, `sujet` `'0'` et `'1'`.
  - `cleAvertissement` : avec `sujet: 'o1'` → finit par `|o1` ; deux W-18 de `sujet` différents → deux clés différentes ; sans `sujet` → clé inchangée.
  - `RESISTANCE_VOIE_PAR_SEMAINE` vaut `{ bloc: 1, voie: 2 }`.
- **Critères** : aucun message existant ne change ; les tests déjà livrés passent sans retouche ; `npm run build` et `npm run test` passent ; ligne « E-17 » au tableau « État » du README, en dernier (R-7).

---

# Points où Arthur agit

| Quand | Action | Guide |
|---|---|---|
| Entre les vagues 2.1 et 2.7 | Créer l'adresse Gmail dédiée ; créer le compte et le projet Supabase ; coller le script SQL et la vérification ; s'inscrire sur la liste d'invités ; régler la connexion par code, les modèles d'e-mail « Get me to 9a » et l'envoi par Gmail ; copier les deux valeurs publiques dans GitHub et dans `.env.local` (environ 1 h 15) | [`docs/supabase.md`](supabase.md), étapes 0 à 8 (écrit par F2-03 ; source : `docs/architecture-v2.md` § 9) |
| Après la vague 2.7 (F2-07) | Première connexion ; essai avec une adresse non invitée | `docs/supabase.md`, étape 9 |
| Après la vague 2.9 (F2-10) | Essai téléphone et ordinateur ; test d'isolement à deux comptes | `docs/supabase.md`, « Test d'isolement » |
| Fin de phase 2 | Recette complète ; inviter les amis (une ligne SQL chacun) ; réinstaller l'app pour voir le nom « Get me to 9a » **seulement après une synchronisation vérifiée** (supprimer l'icône efface les données de l'appareil) | `docs/recette-phase-2.md` (F2-16), `docs/supabase.md`, « Inviter un ami » |
| Avant la phase 3 | Lancer puis valider la recherche sur les trous de la bibliothèque (B21) | Section suivante |
| Avant la vague 3.0 (consolidation 18/11) | Fait le 18/11 (F6, F7), reporté le 23/11 : niveau proposé selon les accents ; séance dure sans exercice comptée comme séance dure ordinaire | `docs/specs/niveaux-de-detail.md` § 8 |
| Fin de phase 3 | Construire un cycle complet à la main sur l'ordinateur | Fin de phase 3 ci-dessus |
| Fin de phase 4 | Suivre une vraie semaine | Fin de phase 4 ci-dessus |
| Avant la vague 5.1 | Créer sa clé API Claude (expiration, limite de dépense) | `docs/cle-api.md` (écrit par C-06 ; source : `docs/architecture-v2.md` § 5.2) |
| Fin de phase 6 | Faire les tests de fin de phase en semaine 4 | Fin de phase 6 ci-dessus |
| À chaque fin de phase | Lancer l'audit Fable et le test réel | Encadrés « Fin de phase » |

---

# Tâches bloquées par les trous de la bibliothèque

La recherche sourcée (B21 ; même méthode que la bibliothèque : recherche, vérification à la source, audit) porte sur : tests de fin de phase (T-01) ; échauffement court de 15 à 20 min (T-02) ; modules de 10 à 15 min, dont souplesse des hanches et bidoigts dédiés (T-03) ; fiches de groupe (T-04) ; résistance en voie (T-06) ; planche de gymnastique et front lever (T-08, B15) ; arqués à faible charge (T-09) ; peur de la chute en bloc (T-10). Référence : `docs/specs/entrainement/seances-types.md` C.4. Elle doit être finie avant la phase 3.

| Tâche | Ce qui attend | Peut démarrer avant ? |
|---|---|---|
| C-02 · Catalogue des objectifs spécifiques | Objectifs arqués, planche de gymnastique, front lever, peur de la chute en bloc, modules de 10 à 15 min | Oui avec les 5 objectifs qui ont déjà une fiche ; complétée après la recherche |
| C-08 · Catalogue des tests repères | Toutes les fiches de test (T-01) | Non |
| D-24 · Bilans | Les tests (par C-08) | Non |
| E-07 (règle P-09) | Fiches de test | Oui : P-09 reste inactive, c'est prévu |
| E-10, E-16 · Séances types | Échauffement court, résistance en voie, fiches de groupe | Oui ; une tâche de mise à jour du catalogue suivra la recherche (consolidation 18/11 : avec la recommandation de chaque séance ajoutée et, si besoin, les cases du tableau de G-02) |
| G-02, G-03 · Générateur (consolidation 18/11) | Les mêmes séances (résistance en voie surtout) | Oui : le générateur tourne avec le catalogue actuel ; les fiches hors génération ne sont jamais proposées |
| E-13 · Contexte de l'assistant | Les mêmes catalogues (moins de séances proposables pour un grimpeur de voie) | Oui |
