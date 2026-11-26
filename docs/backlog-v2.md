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
9. **Consolidation du 24/11, séance avec étapes et grandes lignes** (point signalé par les développeurs de C-01 et E-09 ; règle dans `docs/specs/niveaux-de-detail.md` § 3.4, détail dans `docs/specs/entrainement/moteur-verification.md` B.1 à B.6 et B.11) : une tâche nouvelle, **E-18** (vague 3.8 : l'exercice principal d'une partie absent des étapes est vérifié comme un exercice de la séance, sans place dans l'ordre ; information **S-27**) ; amendement marqué « (consolidation 24/11) » dans D-26.
10. **Consolidation du 24/11, prompt de l'assistant** (deux trous signalés par le développeur de E-14 ; détail dans `docs/specs/entrainement/assistant-ia.md`, encadré « consolidation 24/11 », D.3, D.4 règle F-10, D.6, D.7) : aucune tâche nouvelle. L'assistant ne choisit jamais le niveau de détail : il répond au niveau envoyé (celui du cycle, ou celui de la séance qu'il remplace), et F-10 refuse tout autre niveau ; amendements marqués « (consolidation 24/11) » dans E-11, E-13, E-14 et C-07. Le prompt nomme la source des repères d'assiette (synthèse, vérification 7) et ne donne plus de chiffre de boisson, jamais relu à la source ; `VERSION_PROMPT` passe à `2026-11-24`.
11. **Consolidation du 25/11, audit de fin de phase 3** (`docs/audits/audit-phase-3.md` : 0 bloquant, 1 important, 12 mineurs). Les corrections sans décision de conception ont été confiées directement le 25/11 (I-1 et M-9 ; M-1, M-10 côté code et le premier point de M-12 ; M-4, M-5 et M-11) et ne sont pas décrites ici. Les autres sont décidées par le concepteur dans les spécifications, en amendements marqués « (consolidation 25/11, audit phase 3) » : `docs/specs/entrainement/moteur-verification.md` (B.1, B.2, B.3, B.5, B.6, B.7, B.11), `docs/specs/design/parcours-et-ecrans.md` (§ 4, § 5, O-02, O-03, O-05, O-07, O-08, T-08), `docs/specs/design/taches-design.md` (D-12, D-16), `docs/specs/niveaux-de-detail.md` (§ 3.4, § 4.1). Cinq tâches nouvelles, **AUD3-01 à AUD3-05** (vague 3.12, texte complet dans la section « Tâches ajoutées le 25/11 ») ; amendements de **D-22** (M-10 : Aujourd'hui ne lit que le cycle validé en cours), de **D-13** (M-12 : « Bidoigts ? » séparé), et rappels sous D-18, C-03 et la vague 4.1.
12. **Consolidation du 26/11, cadrage de la phase 4** (après l'essai réel de la phase 3 ; tâches relues contre le code de `main` au commit `700e58b` et contre la livraison de D-22, branche `tache/D-22`, commit `fe7ab49`) : amendements marqués « (consolidation 26/11, cadrage phase 4) » dans **C-03, C-05, D-27 et C-04** (signatures réelles, fichiers exacts, tests, textes), et dans `moteur-verification.md` (B.4, B.8 : S-06 entre dans `verifierJour` ; `verifierJourSansSeance` pour qu'un signal d'arrêt reste visible un jour sans séance), `parcours-et-ecrans.md` (T-06, T-07, T-09, T-11, T-14, T-16), `niveaux-de-detail.md` (§ 4.2) et `architecture-v2.md` (§ 3.2 : `SeanceRealisee.mode`, `DouleurDeclaree.signes`). Une tâche nouvelle, **D-28** (vague 4.3 : le mini-bloc d'une version groupe, que D-22 ne joue pas). Ordre : C-03, C-05 et D-27 en parallèle (vague 4.2, listes de fichiers corrigées, sans fichier commun) ; C-04 et D-28 en parallèle (vague 4.3). C-04 ne touche plus `App.tsx`. Une question pour Arthur, sous C-04.
13. **Consolidation du 26/11, décision G2** (Arthur : la question du profil « Une douleur en ce moment ? », des zones sans date, est remplacée par les douleurs déclarées et datées de C-04 ; une seule source pour les règles). Deux tâches nouvelles, vague 4.3, l'une après l'autre après C-04 et en parallèle de D-28 : **G2-01** (Sonnet : la question ne reste qu'au premier lancement, où chaque zone cochée devient une douleur déclarée du jour ; le profil, sur téléphone et sur ordinateur, ne montre plus que les douleurs déclarées ; les zones déjà notées sont reprises une seule fois en douleurs déclarées, datées du jour de création du profil, à la lecture du profil) et **G2-02** (Haiku : le moteur n'a plus qu'une entrée pour les douleurs). Amendements marqués « (consolidation 26/11, décision G2) » dans C-04 (place de la section « Douleurs déclarées », sommaire de l'ordinateur) et E-13, et dans `moteur-verification.md` (encadré, B.1, B.2, B.11), `architecture-v2.md` (§ 3.2, § 3.4, § 3.5, § 4.4 nouveau), `parcours-et-ecrans.md` (T-05, T-06, T-14, O-12, § 5) et `assistant-ia.md` (D.3). La question pour Arthur sous C-04 est tranchée.

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
| 3. Plateforme ordinateur | 36 | 14 | Un plan complet se construit à la main ou avec le générateur sur ordinateur, au niveau de détail choisi |
| 4. Téléphone sur le plan | 8 | 3 | Une semaine réelle se suit de bout en bout, à chaque niveau de détail |
| 5. Assistant IA | 8 | 4 | Un plan se crée avec l'assistant puis se retouche à la main |
| 6. Bilans | 2 | 2 | Les tests de fin de phase s'affichent en courbes |
| **Total** | **80** | **35** | (D-10 est fusionnée dans F2-14 ; les phases 7 et 8 n'ont pas encore de tâches ; 7 tâches ajoutées le 18/11, 1 le 23/11 : E-17, 1 le 24/11 : E-18, 5 le 25/11 : AUD3-01 à AUD3-05, vague 3.12, 1 le 26/11 : D-28, vague 4.3, 2 le 26/11, décision G2 : G2-01 et G2-02, vague 4.3 ; les corrections d'audit confiées directement le 25/11 ne sont pas comptées) |

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

> (consolidation 24/11) Point tranché par le concepteur (`docs/specs/niveaux-de-detail.md` § 3.4) et confié à **E-18** (vague 3.8). Précision sur le constat : `marqueursVersionPlanifiee` ne sert qu'à la séance réalisée ; la vue de la séance prévue ignorait ce principal partout, W-01 et quotas compris.

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
> 3. (consolidation 25/11, audit de fin de phase 3, M-12) **« Bidoigts ? » devient une question à part.** « Arqué, bidoigts ou trous ? » donnait les trois marqueurs ensemble : un exercice arqué à effort maximal recevait `bidoigts` et déclenchait S-18 fort (« Les bidoigts se travaillent à faible charge seulement… ») sans être en bidoigts. Elle est remplacée par deux questions, dans cet ordre : **« Arqué ou trous ? »** → `arque`, `trou` ; **« Bidoigts ? »** → `bidoigts`. « Je ne sais pas » compte toujours comme « oui » pour chacune : sans réponse, `bidoigts` est posé et S-18 avertit (valeur prudente). Pourquoi séparer plutôt qu'enlever `bidoigts` de la question : un exercice lesté en bidoigts doit rester signalé (S-18 fort), et seule la réponse de l'utilisateur peut le dire. Ordre complet des questions : O-08 consolidé (`parcours-et-ecrans.md`). Les exercices déjà créés gardent leurs marqueurs : ce sont des réponses de l'utilisateur, pas des valeurs calculées (R-8), et l'app ne peut pas deviner lesquels étaient en bidoigts. Code : **AUD3-03** (vague 3.12).

#### G-01 · Banque d'exercices : tri commun — consolidation 18/11
- **Modèle** : Sonnet · **Dépend de** : E-03, E-09, E-10, C-01, D-20 (lieux) · **Texte** : [plus bas](#g-01-texte-complet)
- **Fichiers** : créer `src/regles/banque.ts`, `src/regles/banque.test.ts` ; modifier `src/regles/index.ts` (une ligne d'export).

> **Amendements de consolidation** : tâche nouvelle (décision F3).

## Vagues 3.8 à 3.11 (consolidation 18/11 : D-16, D-17, D-18, D-19 y restent, une par vague, avec G-03, D-25 et D-26 à côté)

(consolidation 24/11) E-18 rejoint la vague 3.8, en troisième tâche à côté de D-16 et G-03 : aucun fichier commun. Elle ne touche pas `src/regles/index.ts`, que G-01 (vague 3.7) puis G-03 modifient. Pas en vague 3.7 : celle-ci compte déjà trois tâches (E-16, D-13, G-01). Aucun écran n'écrit de parties avant D-26 (vague 3.11) : le trou ne peut pas toucher de vraies données d'ici là.

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

#### E-18 · Exercice principal des grandes lignes absent des étapes — vague 3.8 (consolidation 24/11)
- **Modèle** : Sonnet · **Dépend de** : C-01, E-09, E-17 (livrées) · **Texte** : [plus bas](#e-18-texte-complet)
- **Fichiers** : modifier `src/regles/types.ts`, `base.ts`, `base.test.ts`, `passerelles.ts`, `passerelles.test.ts`, `verifSeanceProfil.ts`, `verifSeanceProfil.test.ts`, `verifSeanceDeroule.ts`, `verifSeanceDeroule.test.ts`, `verifSemaineQuotas.ts`, `verifSemaineQuotas.test.ts`, `integration.test.ts`. Pas `index.ts`.

> **Amendements de consolidation** : tâche nouvelle (point signalé par les développeurs de C-01 et E-09). En parallèle de D-16 et G-03 : aucun fichier commun. D-26 en dépend.

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

> (livraison 25/11, validé par le gérant) Plus d'option « Pas encore choisi » : le générateur exige trois accents, donc « Commencer vide » les écrit aussi. Si l'écriture du plan proposé s'interrompt, le cycle est retiré (suppression douce) et la fenêtre propose de réessayer. Le lien « Modifier dans ton profil » passe par la prop `onOuvrirProfil` de `Plan`, branchée par le gérant dans `MiseEnPageBureau.tsx`.

#### D-18 · Avertissements de sécurité en direct — vague 3.10
- **Modèle** : Sonnet · **Dépend de** : D-17, E-09, C-01 · **Texte** : [taches-design.md, D-18](specs/design/taches-design.md#d-18--avertissements-de-sécurité-en-direct)
- **Fichiers** : `VueSemaine.tsx`, `FicheSeance.tsx`, `VuePhase.tsx`, `VueCycle.tsx`, `src/composants/Avertissement.tsx`.

> **Amendements de consolidation** (forme de la sortie : celle du moteur, B.3)
> 1. Calcul : `planVersVerif` + `contexteVerif` (C-01) puis `verifierPlan` (E-09) avec l'origine `'utilisateur'`, recalculé à chaque changement (mémorisé).
> 2. Affichage : `formeAffichage(a)` (C-01) donne `'information'`, `'avertissement'` ou `'arret'` pour le composant `Avertissement` (niveau « information » ajouté par D-03). Placement par `portee` et cible (`seanceId`, `etapeIndex`, `lundi`, `mesocycleOrdre`).
> 3. « Pourquoi ? » affiche le champ `source` du moteur (pas de texte d'explication séparé). **Correction en un clic seulement pour W-01** : « Décaler au lendemain » (date + 1 jour) ; les autres avertissements n'en ont pas. Critère d'acceptation adapté en conséquence.
> 4. « Je garde ce choix » ajoute `cleAvertissement(a)` (C-01) à `Cycle.avertissementsGardes` ; l'avertissement replié reste compté dans les résumés.
> 5. (livraison 25/11, validé par le gérant) Le moteur ne donne pour W-01 que la séance qui arrive trop tôt. L'écran retrouve l'autre séance par le nom cité dans le message (la dernière de ce nom avant la séance visée) : juste en pratique, mais lié au texte du message. **À reprendre** (conception, Opus) : exposer `seanceLieeId` dans l'avertissement W-01 (B.3) et s'en servir dans `avertissementsPlan.ts` ; à vérifier à l'audit de fin de phase 3. Ajouts acceptés : bouton « Revoir » pour défaire « Je garde ce choix » ; « Décaler au lendemain » absent si le lendemain sort du cycle.
> 6. (consolidation 25/11, audit de fin de phase 3, M-2) Point repris : W-01 porte `seanceLieeId` (B.3 et B.6 de `moteur-verification.md`), absent quand la séance d'avant a été faite hors plan ; `ranger` le reprend tel quel et `seanceDAvantPourW01` disparaît. `cleAvertissement` ne change pas. Code : **AUD3-01** (vague 3.12).

#### D-19 · Tableau de bord — vague 3.11
- **Modèle** : Sonnet · **Dépend de** : D-14, D-18, F2-12 · **Texte** : [taches-design.md, D-19](specs/design/taches-design.md#d-19--tableau-de-bord)
- **Fichiers** : créer `src/ecrans/bureau/TableauDeBord.tsx` ; modifier `src/miseEnPage/MiseEnPageBureau.tsx` (au lieu de `App.tsx`).

> **Amendements de consolidation**
> 1. R-6 (B12) : **pas de « Faire la séance ici »** ; la fiche « Prochaine séance » est en lecture, avec « Les séances se lancent depuis ton téléphone ».
> 2. « Derniers tests » : état vide « Les tests de fin de phase arrivent en phase 6. » ; « Demander un brouillon à l'assistant » désactivé (« Arrive en phase 5 »).
> 3. Titre « Semaine 6 sur 12 », mention « Phase 2 · puissance » (R-2) ; cycle terminé par `cycleTermine` (F2-12).
> 4. (consolidation 18/11) La fiche « Prochaine séance » suit le niveau affiché (`niveauAffiche`, N-01 ; `partiesAffichees`, `recommandationAffichee`, C-01) : étapes, parties ou recommandation. Toujours aucun bouton de lancement (R-6).

> (livraison D-11, 24/11) Au rechargement de la page sur ordinateur, l'app revient au Tableau de bord ; les filtres de la bibliothèque restent dans l'adresse. Garder la rubrique ouverte au rechargement (état de rubrique dans l'adresse) : à faire ici, puisque D-19 modifie `MiseEnPageBureau.tsx`.

> (livraison 25/11, validé par le gérant) Rubrique gardée dans `#rubrique=` (le `?` appartient aux filtres de la bibliothèque, qui le réécrivent). `Plan` reçoit `semaineInitiale` pour s'ouvrir sur une semaine. « Reprendre un cycle précédent » est visible mais désactivé tant qu'aucune reprise n'existe ; les lignes « Avertissements ouverts » ne mènent pas encore au plan.

#### D-26 · Fiche de séance aux trois niveaux — vague 3.11 (consolidation 18/11)
- **Modèle** : Sonnet · **Dépend de** : D-18, N-01, C-01, G-01 · **Texte** : [plus bas](#d-26-texte-complet)
- **Fichiers** : modifier `src/composants/FicheSeance.tsx`, `src/index.css` ; créer `src/composants/EditeurResume.tsx` (simple et grandes lignes).

> **Amendements de consolidation** : tâche nouvelle (décisions F4, F5). En parallèle de D-19 : aucun fichier commun.
> 1. (consolidation 24/11) Dépend aussi de **E-18**. Étape 5 : **S-27** (un exercice des grandes lignes absent des étapes, `niveaux-de-detail.md` § 3.4) s'affiche en tête de la fiche, comme tout avertissement de portée séance, avec deux boutons texte : « Recalculer les grandes lignes » (`Confirmation`, R-4 : titre « Recalculer les grandes lignes ? », texte « Tes grandes lignes écrites seront remplacées par celles calculées depuis les étapes. », action « Recalculer » ; puis `parties` effacé) et « Voir les étapes ». L'écran ne bloque rien et ne vérifie rien lui-même : choisir un principal absent des étapes reste permis, l'avertissement vient du moteur (D-18). Test en plus : séance avec étapes et une partie dont le principal manque dans les étapes → S-27 visible dans la fiche ; « Recalculer » confirmé → S-27 disparaît, étapes et recommandation intactes.

> (livraison 25/11, validé par le gérant) Partie « Séance » créée avec 30 min si le principal est choisi avant la durée ; une séance simple à plusieurs parties montre sa durée totale en lecture seule (renvoi vers « Grandes lignes ») ; une ligne « n étapes enregistrées, cachées à ce niveau » avec « Voir les étapes ». `FicheSeance` reçoit `persos` (branché par le gérant dans `VueSemaine.tsx`).

## Vague 3.12 — corrections de l'audit de fin de phase 3 (consolidation 25/11)

Rapport : `docs/audits/audit-phase-3.md`. Décisions et textes : amendements « (consolidation 25/11, audit phase 3) » des spécifications (point 11 de l'introduction).

**Déjà lancées le 25/11, hors de ce texte** (copies de travail en cours ; leurs fichiers comptent pour l'ordre ci-dessous) :
- Sonnet, **I-1 et M-9** : `src/regles/verifJour.ts` (et son test), `src/regles/banque.ts` (et son test) ;
- Sonnet, **M-1, M-10 (code) et M-12 (premier point)** : `src/ecrans/bureau/TableauDeBord.tsx`, `src/composants/FicheSeance.tsx`, `src/ecrans/bureau/VuePhase.tsx`, `src/ecrans/bureau/VueCycle.tsx`, `src/ecrans/bureau/Plan.tsx`, et sans doute `src/ecrans/bureau/VueSemaine.tsx` (sa zone `aria-live` sert à l'annonce de « Monter » et « Descendre ») ;
- Haiku, **M-4, M-5 et M-11** : `src/regles/verifSemaineContenu.ts`, `src/regles/verifSemaineQuotas.ts` (et leurs tests), `src/assistant/format.ts`, `src/assistant/validerReponse.ts`.

**Ordre** (trois tâches au plus en même temps, règle 1 de l'introduction ; aucune ne partage de fichier avec une autre du même temps) :
1. **AUD3-02** et **AUD3-03** peuvent démarrer tout de suite : aucun fichier commun avec les tâches en cours ni entre elles. **AUD3-01** démarre quand la tâche Haiku M-4, M-5, M-11 est fusionnée (`verifSemaineQuotas.ts`). Les trois peuvent tourner ensemble.
2. **AUD3-04** et **AUD3-05**, ensemble, quand AUD3-01 et la tâche Sonnet M-1, M-10, M-12 sont fusionnées.

Aucune tâche de cette vague ne touche `src/index.css` : les écrans reprennent les classes existantes.

#### AUD3-01 · Moteur : séance liée de W-01, prérequis non renseignés de S-03, S-01 d'un exercice principal — vague 3.12
- **Modèle** : Sonnet · **Dépend de** : la tâche Haiku en cours M-4, M-5, M-11 (`verifSemaineQuotas.ts`) · **Texte** : [plus bas](#aud3-01-texte-complet)
- **Fichiers** : modifier `src/regles/types.ts`, `src/regles/index.ts` (une ligne de réexport de type), `verifSemaineQuotas.ts`, `verifSemaineQuotas.test.ts`, `passerelles.ts`, `passerelles.test.ts`, `verifSeanceProfil.ts`, `verifSeanceProfil.test.ts`, `integration.test.ts`, `src/ecrans/bureau/avertissementsPlan.ts`, `src/ecrans/bureau/avertissementsPlan.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (audit M-2, M-3 partie moteur, M-12 troisième point). En parallèle d'AUD3-02 et AUD3-03 : aucun fichier commun. AUD3-04 et AUD3-05 en dépendent.

#### AUD3-02 · Messages sans identifiant technique : S-21, P-11 et P-01 — vague 3.12
- **Modèle** : Haiku · **Dépend de** : — · **Texte** : [plus bas](#aud3-02-texte-complet)
- **Fichiers** : modifier `src/regles/reglesParDefaut.ts`, `reglesParDefaut.test.ts`, `verifSeanceDeroule.ts`, `verifSeanceDeroule.test.ts`, `verifPlan.ts`, `verifPlan.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (audit M-6, M-7). En parallèle d'AUD3-01 et AUD3-03 : aucun fichier commun.

#### AUD3-03 · Exercice personnel : « Bidoigts ? » séparé — vague 3.12
- **Modèle** : Sonnet · **Dépend de** : — · **Texte** : [plus bas](#aud3-03-texte-complet)
- **Fichiers** : modifier `src/donnees/exercicePerso.ts`, `src/donnees/exercicePerso.test.ts`, `src/ecrans/bureau/ExercicePerso.tsx`.

> **Amendements de consolidation** : tâche nouvelle (audit M-12 deuxième point ; D-13, amendement 3). En parallèle d'AUD3-01 et AUD3-02 : aucun fichier commun.

#### AUD3-04 · Profil non renseigné et S-03 regroupés — vague 3.12
- **Modèle** : Sonnet · **Dépend de** : AUD3-01 ; la tâche Sonnet en cours M-1, M-10, M-12 (`TableauDeBord.tsx`, `VueCycle.tsx`, `Plan.tsx`, `VueSemaine.tsx`) · **Texte** : [plus bas](#aud3-04-texte-complet)
- **Fichiers** : modifier `src/ecrans/bureau/avertissementsPlan.ts`, `src/ecrans/bureau/avertissementsPlan.test.ts`, `src/ecrans/bureau/VueSemaine.tsx`, `src/ecrans/bureau/VueCycle.tsx`, `src/ecrans/bureau/TableauDeBord.tsx`, `src/ecrans/bureau/Plan.tsx`, `src/miseEnPage/MiseEnPageBureau.tsx`.

> **Amendements de consolidation** : tâche nouvelle (audit M-3, règle d'affichage). En parallèle d'AUD3-05 : aucun fichier commun.

#### AUD3-05 · Fiche de séance : « Réglage estimé » et messages du moteur tels quels — vague 3.12
- **Modèle** : Haiku · **Dépend de** : AUD3-01 (message de S-01) ; la tâche Sonnet en cours M-1, M-10, M-12 (`FicheSeance.tsx`) · **Texte** : [plus bas](#aud3-05-texte-complet)
- **Fichiers** : modifier `src/composants/FicheSeance.tsx`, `src/composants/EditeurResume.outils.ts`, `src/composants/EditeurResume.outils.test.ts`, `src/ecrans/bureau/FicheDetail.tsx`.

> **Amendements de consolidation** : tâche nouvelle (audit M-8, M-12 troisième point côté écran). En parallèle d'AUD3-04 : aucun fichier commun.

## Fin de phase 3

**Sur un vrai téléphone** : rien de nouveau ne doit apparaître ; vérifier qu'aucune régression n'est venue des tâches partagées (séance solo, groupe, débrief, profil), et qu'un cycle **brouillon** construit sur l'ordinateur reste invisible sur le téléphone. **Sur ordinateur** : construire à la main un cycle de 12 semaines complet (3 phases, objectifs, versions solo et groupe), provoquer un avertissement des 48 h et le corriger en un clic, valider le cycle. (consolidation 18/11) Puis créer un second cycle avec « Proposer un plan » au niveau **grandes lignes**, passer une séance en simple puis en détaillé (rien ne se perd), écrire une séance simple à la main sans exercice et voir S-26. (consolidation 23/11) Dans la fenêtre « Nouveau cycle », vérifier que le niveau proposé passe de Détaillé à Grandes lignes quand les trois accents sont endurance, résistance ou technique, avec sa ligne « pourquoi » (F6) ; placer la séance dure sans exercice le lendemain d'une séance maximale : S-26 seul, pas d'avertissement des 48 h (F7).

**Audit Fable** : (1) entraînement — les 65 vérifications du moteur contre `moteur-verification.md` (code, niveau, message, source), les 12 cas de B.11, les 26 séances types sans avertissement (E-16) ; (2) « avertir sans bloquer » — aucun bouton désactivé par un avertissement, signaux d'arrêt visibles ; (3) passerelles C-01 — un `null` du profil compte comme non rempli, conversion `allegee` ↔ `decharge`, marqueurs jamais stockés ; (4) exercices personnels — « je ne sais pas » produit les marqueurs prudents, aucun contenu de livre recopié ; (5) accessibilité du glisser-déposer (tout au clavier) ; (6) (consolidation 18/11) niveaux et banque — changer de niveau n'efface rien, aucun avertissement de semaine ou de plan ne disparaît en simple ou en grandes lignes, le générateur ne place aucune fiche à vérifier, de test, contre-indiquée ou hors lieux, aucun `maxParSemaine` dépassé ; (7) (consolidation 23/11) le niveau d'un cycle est toujours celui affiché dans O-13, présélectionné par `niveauPropose` (F6) ; une séance dure sans exercice connu n'a aucun marqueur et S-26 ne parle pas d'effort maximal (F7) ; (8) (consolidation 24/11) un exercice des grandes lignes absent des étapes donne ses prérequis, ses douleurs et la règle des 48 h, et S-27, à tous les niveaux affichés (cas 19 de B.11).

(consolidation 25/11) **Audit fait** : `docs/audits/audit-phase-3.md` (prêt pour l'essai réel d'Arthur, avec réserves). Corrections : vague 3.12 et tâches confiées directement le 25/11. Le gérant vérifie chaque livraison contre les amendements « (consolidation 25/11, audit phase 3) ». I-1 doit être fusionnée avant C-03 (phase 4).

---

# Phase 4 — Téléphone sur le plan

## Vague 4.1

> (livraison E-18, 24/11) Si l'exercice principal d'une partie a une fiche inconnue, S-01 est émis en portée séance avec le message des étapes (« supprime l'étape ») : dans la fiche, afficher plutôt « remplace l'exercice principal de cette partie », sans changer le code de l'avertissement.

> (consolidation 25/11, audit de fin de phase 3, M-12) Remplacé : le moteur écrit lui-même ce message (B.5, S-01 « exercice principal d'une partie », aussi pour une étape résumée d'une séance sans étapes) : AUD3-01. L'écran l'affiche tel quel : AUD3-05. D-22 et D-27 n'ont rien à réécrire.

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
> 7. (consolidation 25/11, audit de fin de phase 3, M-10) **Seulement le cycle validé en cours.** Aujourd'hui et Programme ne lisent que les phases et les séances du cycle rendu par `cycleEnCours(cycles, aujourdhui)` (F2-12 : `etat === 'valide'`, ni supprimé ni abandonné, qui couvre la date du jour) : jamais un cycle brouillon, jamais une séance orpheline. Orpheline = séance dont le cycle n'est pas ce cycle en cours, ou dont la phase n'est pas une phase non supprimée de ce cycle (par exemple les phases et séances restées après un « Proposer un plan » interrompu, avant la correction de M-10 ; ou des séances d'un cycle supprimé). Pourquoi : `lireSeancesEntre` (F2-12) ne regarde ni le cycle ni son état ; s'en servir ferait apparaître dans Aujourd'hui un brouillon jamais validé ou les restes d'un plan avorté, alors que l'architecture veut un brouillon invisible sur le téléphone.
>    - Ajouter à `src/donnees/plan.ts` : `lirePlanEnCours(aujourdhui: DateISO): Promise<{ cycle: Cycle; phases: PhaseCycle[]; seances: SeancePlanifiee[] } | null>` = `cycleEnCours(await lireCycles(), aujourdhui)` ; `null` s'il n'y en a pas ; sinon `lirePlanDuCycle(cycle.id)`, puis seulement les séances dont `phaseId` est l'identifiant d'une des phases lues. Commentaire : « Aujourd'hui et Programme ne lisent que le cycle validé en cours (amendement 7 de D-22). »
>    - Aujourd'hui et Programme passent **uniquement** par `lirePlanEnCours`. `lireSeancesEntre` n'y sert pas : ajouter au-dessus d'elle le commentaire « Ne regarde ni le cycle ni son état : ne pas s'en servir pour afficher le plan (Aujourd'hui, Programme). » Les statuts (`statutSeance`), la rubalise de l'amendement 4 (`verifierSemaine` par C-01) et le choix de l'écran de séance se calculent sur ce même plan.
>    - Tests dans `src/donnees/plan.test.ts` : un cycle brouillon qui couvre aujourd'hui, avec une séance aujourd'hui → `null` ; un cycle validé et, le même jour, une séance d'un autre cycle resté brouillon → seule la séance du cycle validé ; une séance du cycle validé dont la phase est supprimée → absente ; le cycle validé supprimé par `supprimerCycle` → `null` ; aucun cycle → `null`.
>    - Fichiers en plus : `src/donnees/plan.ts`, `src/donnees/plan.test.ts` (C-05 y ajoute ses fonctions à la vague suivante : pas de conflit).

## Vague 4.2

> (consolidation 26/11, cadrage phase 4) **Ordre et fichiers.** C-03, C-05 et D-27 tournent en parallèle, sur `main` après la fusion de D-22 (commit `e45d167`). Les listes de fichiers ci-dessous (amendements « Fichiers ») ont été vérifiées contre le code livré par D-22 : aucun fichier commun. Chaque fichier partagé de la vague n'a qu'un propriétaire : `src/ecrans/Aujourdhui.tsx` et `src/regles/index.ts` → C-03 ; `src/donnees/plan.ts`, `src/ecrans/Programme.tsx`, `Programme.outils.ts` → C-05 ; `src/App.tsx`, `src/index.css`, `src/ecrans/Aujourdhui.outils.ts`, `src/ecrans/lancement.ts`, `SeanceSolo.tsx`, `SeanceGroupe.tsx` → D-27. Personne ne touche `MiseEnPageTelephone.tsx` ni `donneesTelephone.ts`.
>
> **Code livré par D-22, à lire avant chacune des trois** : `src/ecrans/donneesTelephone.ts` (`useDonneesTelephone(aujourdhui)` : plan en cours par `lirePlanEnCours`, séances réalisées, exercices personnels, douleurs, formes, objectifs des phases, réglages ; tout est relu après chaque écriture ; `useCompteLie()`) ; `src/ecrans/Aujourdhui.outils.ts` (`DonneesVerifJour`, `AvertissementDuJour`, `avertissementsDeLaSeance`, `vueDuJour`, `peutLancerSolo`, `formaterDuree`, `sousTitreSolo`) ; `src/ecrans/lancement.ts` (`DemandeLancement`, `Lancement`, `LienPlan`, `lancementDepuisPlan`, `brouillonSolo`, `brouillonGroupe`) ; `src/ecrans/ElementsTelephone.tsx` ; `src/ecrans/Programme.tsx`, `Programme.outils.ts` ; dans `src/donnees/plan.ts`, `lirePlanEnCours` et `lireSeancePlanifiee`. `src/ecrans/EnConstruction.tsx` n'est plus utilisé (ne pas s'en servir). Une séance libre en groupe garde `mode: 'groupe'` sans `seancePlanifieeId` (écart de D-22 accepté, architecture § 3.2) : `realiseeVersVerif` la lit comme une séance hors plan, rien à faire.

#### C-03 · Forme du jour et contrôles du jour
- **Modèle** : Sonnet · **Dépend de** : D-22, E-08, E-09, C-01 · **Texte** : [texte complet plus bas](#c-03-texte-complet)
- **Fichiers** : créer `src/donnees/formes.ts`, `formes.test.ts`, `src/ecrans/FormeDuJour.tsx` ; modifier `src/ecrans/Aujourdhui.tsx`, `src/miseEnPage/MiseEnPageTelephone.tsx`.

> **Amendements de consolidation** : tâche nouvelle (décision B10).
> 1. (consolidation 25/11, audit de fin de phase 3) Dépend aussi de la correction **I-1** de l'audit (J-02 et J-04 muettes pour une séance dont seule la version groupe est maximale, `src/regles/verifJour.ts`), confiée le 25/11 : elle doit être fusionnée avant de brancher les contrôles du jour. La séance du jour vient de `lirePlanEnCours` (D-22, amendement 7).
> 2. (consolidation 26/11, cadrage phase 4) **Décalages relevés dans le code.**
>    - I-1 est fusionnée (commit `fe51c75` ; `src/regles/verifJour.ts:27-30`, test « audit I-1 » dans `verifJour.test.ts:197`) : la dépendance de l'amendement 1 est levée.
>    - `verifierJour` (`src/regles/index.ts:103`) prend des **vues du moteur**, pas des documents : `verifierJour(seanceVersVerif(s, ctx.fiches, undefined, cycle), ctx, realisees)` où `realisees` = les séances réalisées non supprimées passées par `realiseeVersVerif` (`passerelles.ts:341`). Elle suffit pour toutes : J-04 et J-07 ne lisent que `realisee` (marqueurs de l'instantané, `finLe`, `peau`) et `date` (`verifJour.ts:74-91` et `:130-133`).
>    - `verifierJour` ne garde que S-04 et S-05 (`index.ts:104`). **S-06** (effort à risque pendant une douleur en réduction, signal d'arrêt) n'apparaissait donc jamais sur le téléphone : il entre dans `verifierJour` (B.4, consolidé 26/11).
>    - Un jour **sans séance à faire** (repos, séance faite ou sautée, pas de plan), `verifierJour` n'était jamais appelée : **J-05** (« consulte ») restait caché. Nouveau point d'entrée `verifierJourSansSeance` (B.4, consolidé 26/11).
>    - `itemsRouges` (`src/regles/base.ts:184`) n'est pas exporté par `index.ts` (les écrans n'importent que ce fichier).
>    - D-22 passe déjà à Aujourd'hui `profil` et `onMisesEnGarde` (`MiseEnPageTelephone.tsx`), et lit déjà les tables `formes` et `douleurs` (`donneesTelephone.ts:24-31`) : `MiseEnPageTelephone.tsx` n'est plus à modifier, et `lireForme` ne sert pas à Aujourd'hui.
>    - La rubalise de D-22 (`avertissementsDeLaSeance`, `Aujourdhui.outils.ts:152`) écarte les informations ; les contrôles du jour, eux, doivent les montrer (J-01, J-02, J-03, J-06, J-07 sont des informations).
>    - Le commentaire « Forme du jour : revient en phase 4… » est à `Aujourdhui.tsx:273`, dans l'état « séance » seulement ; les états « faite », « repos » et « pas de plan » n'ont pas de place prévue.
> 3. **Fichiers** (remplace la ligne ci-dessus) : créer `src/donnees/formes.ts`, `src/donnees/formes.test.ts`, `src/ecrans/FormeDuJour.tsx`, `src/ecrans/controlesDuJour.ts`, `src/ecrans/controlesDuJour.test.ts` ; modifier `src/ecrans/Aujourdhui.tsx`, `src/regles/index.ts`, `src/regles/integration.test.ts`. **Pas** `Aujourdhui.outils.ts`, `App.tsx`, `index.css` (D-27), ni `MiseEnPageTelephone.tsx`. Classes existantes : `.question`, `.choix.cinq`, `.ligne`, `.champ`, `.texte-3`.
> 4. **Données**, `src/donnees/formes.ts` : `lireForme(date: DateISO): Promise<FormeDuJour | undefined>` (`lireUn`) ; `enregistrerForme(f: Omit<FormeDuJour, 'id' | 'versionFormat' | 'creeLe' | 'modifieLe'>): Promise<void>` = `ecrire('formes', { ...f, id: f.date })` (identifiant = date : une seule forme par jour, même saisie sur deux appareils ; `ecrire` garde le `creeLe` du premier enregistrement) ; `lireFormesEntre(debut: DateISO, fin: DateISO): Promise<FormeDuJour[]>` (index `date`, bornes incluses, sans les supprimées) ; `resumeForme(nbRouges: number): string` : 0 → « Aucun voyant au rouge », 1 → « 1 voyant au rouge », n → « {n} voyants au rouge ». Aucune lecture de `src/regles/` dans ce fichier.
> 5. **Moteur**, `src/regles/index.ts` (et rien d'autre dans `src/regles/` hors du test) :
>    - réexport `export { itemsRouges } from './base.ts'` ;
>    - `verifierJour` garde `S-04`, `S-05` **et `S-06`** de `verifierSeanceProfil` ; commentaire : « J-01 à J-07, plus S-04, S-05 et S-06 sur la séance du jour (B.4, consolidation 26/11). » ;
>    - `export function verifierJourSansSeance(ctx: ContexteVerif): Avertissement[]` = `verifierJour` sur une séance neutre `{ id: 'jour-' + ctx.aujourdhui, nom: 'Jour sans séance', date: ctx.aujourdhui, qualite: 'technique', solo: { durete: 'legere', etapes: [] } }` et `realisees: []` ; commentaire : « Un jour sans séance à faire : seules J-05 et J-06 peuvent sortir. Un signal d'arrêt reste visible même un jour de repos (B.4). »
> 6. **Contrôles**, `src/ecrans/controlesDuJour.ts` (pur) : `controlesDuJour(e: EntreesContexteVerif, realisees: SeanceRealisee[], duJour?: { seance: SeancePlanifiee; cycle: Cycle }): { avertissement: Avertissement; forme: 'information' | 'avertissement' | 'arret' }[]`. `ctx = contexteVerif(e)` ; avec `duJour` → `verifierJour` comme au point 2 ; sans → `verifierJourSansSeance(ctx)` ; `forme = formeAffichage(a)` ; ordre : arrêts, puis avertissements, puis informations, l'ordre du moteur gardé dans chaque groupe (le moteur trie par code à niveau égal : J-04 passerait avant S-04). `duJour` n'est donné que quand `vueDuJour` rend `type: 'seance'` (une séance faite ou sautée n'est plus « à faire » : J-04 parlerait de la séance qu'on vient de finir).
> 7. **Écran Aujourd'hui** (`Aujourdhui.tsx`) :
>    - Une seule pile au-dessus de la fiche, sous le signal de douleur de D-22 : les contrôles du jour et la rubalise de D-22 ensemble, dans l'ordre arrêts, avertissements (un W gardé reste replié, comme aujourd'hui), informations. Jamais limitée en nombre ; un arrêt n'est jamais replié. Titre et suite par `scinderMessage`, message du moteur tel quel. Un arrêt porte la correction « Voir les mises en garde » (`onMisesEnGarde`, comme le signal de douleur) ; « Pourquoi ? » = `Source : {source}` pour un arrêt ou un avertissement, rien pour une information. Aucun « Je garde ce choix » : un contrôle du jour ne se garde pas. Aucun bouton désactivé.
>    - Les jours sans séance à faire (états « faite », « repos » et « pas de plan »), les contrôles de `verifierJourSansSeance` s'affichent sous le signal de douleur, même forme.
>    - Ligne « Forme du jour » (`button.ligne`) dans **tous** les états (J-02 a besoin de trois matins de suite, jours de repos compris) : juste avant la section « Cette semaine » (à la place du commentaire de `:273` dans l'état « séance »), et à la fin dans l'état « pas de plan ». À gauche « Forme du jour » ; à droite « À renseigner » ou `resumeForme(itemsRouges(forme))` pour la forme dont la date est aujourd'hui.
>    - Toucher la ligne ouvre `FormeDuJour` à la place du contenu de l'onglet (état local d'Aujourd'hui ; la barre d'onglets reste) ; « Plus tard » ou « Enregistrer » y revient. Après l'enregistrement, `useDonneesTelephone` relit tout (`surEcriture`) : J-01 apparaît sans autre code.
>    - Le signal de douleur de D-22 (`:114-124`) ne change pas ici (texte repris dans T-06, consolidé 26/11 ; C-04 l'étend aux douleurs déclarées).
> 8. **Écran** `src/ecrans/FormeDuJour.tsx` : props `{ date: DateISO; initiale?: FormeDuJour; onFini: () => void }`. Titre `h1` « Forme du jour » (le focus y va à l'ouverture, comme `MisesEnGarde`), mention « 30 secondes ». Cinq `fieldset.question` en `.choix.cinq` (1 à 5, sélection en encre), dans cet ordre, chacun avec son aide en `.texte-3` : « Sommeil cette nuit » (« 1 = très mauvais · 5 = très bon ») ; « Fatigue » (« 1 = épuisé · 5 = reposé ») ; « Courbatures » (« 1 = fortes · 5 = aucune ») ; « Douleur » (« 1 = forte · 5 = aucune ») ; « Peau des doigts » (« 1 = abîmée · 5 = en bon état »). Puis « Heures de sommeil (facultatif) » : `input.champ`, `inputMode="decimal"`, de 0 à 14 (virgule acceptée) ; hors bornes : « Entre 0 et 14 h. » sous le champ, focus dessus, rien n'est enregistré ; vide → pas de `heuresSommeil`. Action principale « Enregistrer » (`enregistrerForme`), désactivée tant qu'une des cinq notes manque, avec « Réponds aux cinq questions pour enregistrer. » dessous (même règle que Trois questions) ; bouton discret « Plus tard ». Pré-remplie avec la forme du jour si elle existe (la modifier la remplace). Échec d'écriture : « La forme du jour n'a pas été enregistrée. Réessaie. » dans l'écran, réponses gardées.
> 9. **Tests**
>    - `formes.test.ts` (`fake-indexeddb`) : enregistrer puis `lireForme` → mêmes valeurs, `id` = date, `aEnvoyer` 1 ; deux enregistrements le même jour → un seul document, le second gagne, `creeLe` du premier gardé ; `lireFormesEntre` bornes incluses, sans les supprimées ; `resumeForme` 0, 1 et 2.
>    - `controlesDuJour.test.ts` : forme du jour sommeil 2, fatigue 2, le reste 4, séance du jour `EXEMPLE_SEANCE_PLANIFIEE` (dure) → J-01, forme `information`, message « Deux voyants sont au rouge ce matin. Fais plutôt la version légère, ou une séance technique. » ; même forme, séance légère → pas de J-01 ; forme avec douleur 1, séance dure → J-03 ; sans séance du jour, douleur `reduction` au coude déclarée il y a 14 jours → J-05, forme `arret`, « Ta douleur (coude) dure depuis 14 jours. Consulte un médecin ou un kiné qui connaît l'escalade. » ; 13 jours → rien ; ordre : séance du jour avec une étape `puissance-bloc-limite` (marqueur `maximale`), profil `douleursEnCours: ['coude']`, forme à deux rouges, une séance réalisée de marqueurs `['maximale']` finie il y a 12 h → S-04 (`arret`), puis J-04 (`avertissement`), puis J-01 (`information`).
>    - `integration.test.ts` : séance du jour avec `puissance-bloc-limite`, douleur `reduction` au dos déclarée 3 jours avant (zone que la fiche ne contre-indique pas) → `verifierJour` rend S-06 fort, `formeAffichage` `'arret'`, sans S-04 ; même douleur au coude → S-04 et S-06 ; `verifierJourSansSeance` avec une douleur `reduction` de 14 jours → J-05 seul ; avec une forme du jour à deux rouges → rien (J-01 demande une séance dure).
> 10. **Critères** en plus : J-01 visible sur Aujourd'hui le matin où la forme a deux voyants au rouge et la séance est dure ; un jour de repos avec une douleur en réduction de 14 jours → J-05 en signal d'arrêt ; un contrôle du jour ne désactive rien ; une seule action en résine par écran (Forme du jour : « Enregistrer ») ; boutons de 48 px, focus visible ; hors ligne, tout marche.

#### C-05 · Petits ajustements du plan sur téléphone
- **Modèle** : Sonnet · **Dépend de** : D-22 · **Texte** : [texte complet plus bas](#c-05-texte-complet)
- **Fichiers** : `src/donnees/plan.ts`, `src/donnees/plan.test.ts`, `src/ecrans/Programme.tsx`.

> **Amendements de consolidation** : tâche nouvelle (décision B11).
> 1. (consolidation 26/11, cadrage phase 4) **Décalages relevés dans le code.**
>    - `deplacerSeance(id, nouvelleDate)` ne peut pas appliquer « pas avant aujourd'hui » sans la date du jour (pas d'horloge cachée, comme le moteur) ; et `plan.ts` n'a pas `lundiDe` (il est dans `src/donnees/debrief.ts:11`, sans dépendance circulaire).
>    - Une séance **manquée** de la semaine en cours aurait encore des jours libres devant elle : sans garde, « Déplacer » la ferait rattraper (contraire à A3-6, et au texte de D-22 « Elle n'est pas rattrapée »).
>    - W-01 se pose sur la séance d'**après** et cite celle d'avant par `seanceLieeId` (AUD3-01) : après un déplacement, l'avertissement qui concerne la séance déplacée peut être porté par sa voisine.
>    - `Programme.tsx` existe (D-22) : l'aperçu est le bloc `if (ouverte)` (`Programme.tsx:77-116`) ; `LancerCetteSeance` pour les statuts `aujourdhui` et `a_venir`, `PHRASES_STATUT` pour `sautee` et `manquee`.
>    - `avertissementsDeLaSeance` (`Aujourdhui.outils.ts:152`) ne regarde que la semaine du jour et `seanceId` ; D-27 modifie ce fichier dans la même vague : ne pas le toucher, écrire la variante dans `Programme.outils.ts`.
>    - Sur l'ordinateur, le tableau de bord affiche déjà « Sautée » (`TableauDeBord.outils.ts:99`) ; la vue Semaine ne marque pas une séance sautée (hors de cette tâche : signalé au gérant).
> 2. **Fichiers** (remplace la ligne ci-dessus) : modifier `src/donnees/plan.ts`, `src/donnees/plan.test.ts`, `src/ecrans/Programme.tsx`, `src/ecrans/Programme.outils.ts`, `src/ecrans/Programme.outils.test.ts`. **Pas** `index.css`, `Aujourdhui.outils.ts`, `App.tsx`.
> 3. **Données**, `src/donnees/plan.ts`, section « Écriture ». Commentaire au-dessus : « Petits ajustements du téléphone (B11, architecture § 2.5) : le document entier est réécrit ; si l'ordinateur modifie la même séance sans réseau, la modification la plus récente gagne. »
>    - `joursPossibles(s: SeancePlanifiee, aujourdhui: DateISO): DateISO[]` (pure) : `[]` si `s.date < aujourdhui` (manquée : pas de rattrapage, A3-6) ou si `s.sauteeLe` ; sinon, dans l'ordre, les jours du lundi au dimanche de la semaine de `s.date` (`lundiDe`) qui sont `>= aujourdhui`, sauf `s.date`. Un jour qui a déjà une séance reste possible : les avertissements le diront.
>    - `deplacerSeance(id: string, nouvelleDate: DateISO, aujourdhui: DateISO): Promise<void>` : relit la séance par `lireSeancePlanifiee` ; absente → `Error('Séance introuvable.')` ; `nouvelleDate` hors de `joursPossibles(s, aujourdhui)` → `Error('Ce jour n’est pas possible : même semaine, pas avant aujourd’hui.')` et rien n'est écrit ; sinon `ecrire('seancesPlanifiees', { ...s, date: nouvelleDate })`. `semaine` et `phaseId` ne changent pas (même semaine).
>    - `sauterSeance(id: string): Promise<void>` : `sauteeLe` = l'instant présent (ISO). Absente → même erreur.
>    - `annulerSaut(id: string): Promise<void>` : réécrit la séance **sans** le champ `sauteeLe` (`const { sauteeLe: _s, ...reste } = s`).
> 4. **Écran**, aperçu de `Programme.tsx` :
>    - Statut `aujourdhui` ou `a_venir` (la séance du jour se déplace et se saute aussi : c'est le cas le plus courant) : sous `LancerCetteSeance`, deux boutons seconds côte à côte (`.deux-boutons.egaux`) : « Déplacer » (absent si `joursPossibles` est vide) et « Sauter cette séance ».
>    - « Déplacer » ouvre en place la liste des jours possibles, un bouton de 48 px par jour, « mercredi 26 » (`nomDuJour` de `bureau/avertissementsPlan.ts` et numéro du jour, comme la semaine), et un bouton discret « Annuler ». Toucher un jour déplace tout de suite (c'est réversible : on peut redéplacer).
>    - « Sauter cette séance » passe par `Confirmation` (R-4) : titre « Sauter cette séance ? », texte « Elle ne sera pas rattrapée : on continue le plan. Tu pourras annuler jusqu’à la fin de son jour. », action « Sauter la séance », rester « Garder la séance ». Pas `danger` : rien n'est effacé.
>    - Statut `sautee` et date `>= aujourdhui` : sous « Séance sautée. », bouton second « Annuler » (`aria-label` « Annuler le saut de cette séance »). Statut `manquee` : rien de plus que la phrase de D-22.
>    - Après une écriture réussie, en `role="status"` : « Séance déplacée à {jour} {n}. », « Séance sautée. » ou « Saut annulé. » ; puis, seulement si `useCompteLie()`, « Ce changement sera aussi visible sur ton ordinateur. » (sans compte, ce serait faux). L'aperçu reste ouvert (la séance reste dans la semaine affichée) ; les données se relisent seules (`useDonneesTelephone`, `surEcriture`). Échec : `Avertissement` « Le changement n’a pas été enregistré. Réessaie. », rien d'autre ne change.
> 5. **Avertissements dans l'aperçu**, `Programme.outils.ts` : `avertissementsAutourDe(d: DonneesVerifJour, seance: SeancePlanifiee): AvertissementDuJour[]` (types importés de `Aujourdhui.outils.ts`, sans modifier ce fichier) : même construction et même règle que `avertissementsDeLaSeance` (contexte, `planVersVerif`, informations écartées, avertissement gardé replié, arrêt jamais replié), mais sur `verifierSemaine(lundiDe(seance.date), …)` et pour `a.seanceId === seance.id || a.seanceLieeId === seance.id`. Affichés au-dessus des boutons de l'aperçu d'une séance `aujourdhui` ou `a_venir`, toujours (avant un déplacement aussi : on voit pourquoi avant de choisir), titre et suite par `scinderMessage`, comme sur Aujourd'hui. Rien n'est bloqué.
> 6. **Tests**
>    - `plan.test.ts` : `joursPossibles` sur la séance du mardi 17/11 (`EXEMPLE_SEANCE_PLANIFIEE`) : aujourd'hui lundi 16 → 16, 18, 19, 20, 21, 22 ; samedi 21 → 21, 22 ; mercredi 18 (séance manquée) → `[]` ; séance sautée → `[]`. `deplacerSeance` vers le jeudi 19 (aujourd'hui 16) → `date` changée, `semaine`, `phaseId` et étapes identiques, `modifieLe` plus récent, `aEnvoyer` 1 ; vers le dimanche 15 ou le lundi 23 → erreur, base inchangée ; identifiant inconnu → erreur. `sauterSeance` puis `statutSeance` → `sautee` ; `annulerSaut` → champ `sauteeLe` absent du document, statut `a_venir`.
>    - `plan.test.ts`, **conflit** (règle « dernière modification gagne », architecture § 2.5), avec `serveurMemoire` et `synchroniser` comme dans `synchro.test.ts` : séance déplacée sur le téléphone, puis une version de l'ordinateur **plus récente** (autre date) posée sur le serveur → après synchronisation, la version de l'ordinateur, entière ; une version de l'ordinateur **plus ancienne** → le déplacement reste, et il est sur le serveur.
>    - `Programme.outils.test.ts` : ST-DOI-02 mardi et ST-TRA-02 jeudi d'une même semaine (`seanceDepuisType`, toutes deux maximales) ; la séance du jeudi déplacée au mercredi (date changée en mémoire) → `avertissementsAutourDe` de la séance du mardi contient le W-01 porté par celle du mercredi (`seanceLieeId` = mardi), et celui de la séance du mercredi aussi ; avant le déplacement, ni l'un ni l'autre.
> 7. **Critères** en plus : aucun jour passé ni d'une autre semaine n'est proposé ; une séance manquée ne propose ni « Déplacer » ni « Sauter » ; la séance déplacée apparaît au bon jour dans Aujourd'hui (« Cette semaine ») et, après synchronisation, sur l'ordinateur ; une séance sautée y est « Sautée » au tableau de bord ; « Déplacer » et « Sauter » marchent à tous les niveaux de détail ; boutons de 48 px, une seule action en résine par écran (celle de `LancerCetteSeance`).

#### D-27 · Séance en bref sur téléphone (simple et grandes lignes) — consolidation 18/11
- **Modèle** : Sonnet · **Dépend de** : D-22, D-05, D-08, N-01, C-01 · **Texte** : [plus bas](#d-27-texte-complet)
- **Fichiers** : créer `src/moteur/seanceEnBref.ts`, `src/moteur/seanceEnBref.test.ts`, `src/ecrans/SeanceEnBref.tsx` ; modifier `src/App.tsx`, `src/index.css`.

> **Amendements de consolidation** : tâche nouvelle (décisions F4, F5). En parallèle de C-03 et C-05 : aucun fichier commun.
> 1. (consolidation 26/11, cadrage phase 4) **Décalages relevés dans le code.**
>    - Le masquage du bouton solo d'une séance sans étapes (amendement 6 de D-22) est **une seule fonction**, `peutLancerSolo` (`src/ecrans/Aujourdhui.outils.ts:126`), employée par Aujourd'hui (`Aujourdhui.tsx:226`) et Programme (`Programme.tsx:175`) ; et `lancementDepuisPlan` (`src/ecrans/lancement.ts:63-74`) rend `undefined` en solo sans étapes. D-27 change ces deux fichiers, pas `Aujourdhui.tsx` ni `Programme.tsx` (C-03 et C-05) : les sous-titres par niveau existent déjà (`sousTitreSolo`).
>    - `App.tsx` (`lancer`, D-22) ne connaît pas le cycle d'une séance : il faut le relire pour calculer le niveau affiché, sans toucher à `DemandeLancement` (que construisent Aujourd'hui et Programme).
>    - `src/moteur/horloge.ts` a déjà démarrage, pause, reprise et temps écoulé (`demarrerHorloge`, `mettreEnPause`, `reprendreHorloge`, `secondesEcoulees`) : l'état `{ debutMs?; enPauseDepuisMs?; pausesMs }` du texte d'origine le referait.
>    - `EtapeRealisee` est dans `src/donnees/modele.ts:141` : le moteur de séance rend la même forme sans l'importer (indépendance pour la montre, comme `seanceSolo.ts`).
>    - **Rappel de sécurité du bloc** « comme en détaillé » : rien ne l'affiche aujourd'hui, ni en détaillé ni en groupe (aucun écran ne lit la fiche `technique-rappel-securite-bloc`, `src/donnees/bibliotheque/technique.ts:208`). Décision F2 d'Arthur, point 11 : l'afficher avant chaque séance de bloc limite. D-27 le fait pour les trois écrans de séance.
>    - « Stop, ça fait mal » « au même endroit que dans le chrono » : le chrono le met dans ses actions du bas (`Chrono.tsx:138`), les écrans de séance tout en haut, collé (`.stop-seance`, `SeanceSolo.tsx:62`, `SeanceGroupe.tsx:69`, `index.css:254-255`).
>    - « Voir la fiche » : le téléphone n'a pas de lecteur de fiche (`FicheProtocole.tsx` est la carte de la grille de l'ordinateur ; « Voir la fiche » de T-08 n'a jamais été fait).
>    - `dureeMin` « modifiable dans les trois questions » (`niveaux-de-detail.md` § 4.2) : `Questions.tsx` n'a pas de champ de durée, et C-04 modifie ce fichier.
>    - Le texte « rien à résumer » de T-16 est déjà la phrase par défaut de `recommandationParDefaut` (`src/regles/resumes.ts:87`), rendue par `recommandationAffichee`.
> 2. **Fichiers** (remplace la ligne ci-dessus) : créer `src/moteur/seanceEnBref.ts`, `src/moteur/seanceEnBref.test.ts`, `src/ecrans/SeanceEnBref.tsx`, `src/composants/RappelSecuriteBloc.tsx` ; modifier `src/ecrans/lancement.ts`, `src/ecrans/lancement.test.ts`, `src/ecrans/Aujourdhui.outils.ts`, `src/ecrans/Aujourdhui.outils.test.ts`, `src/App.tsx`, `src/ecrans/SeanceSolo.tsx`, `src/ecrans/SeanceGroupe.tsx`, `src/index.css`. **Pas** `Aujourdhui.tsx`, `Programme.tsx`, `Questions.tsx`.
> 3. **Moteur de séance**, `src/moteur/seanceEnBref.ts` (pur ; n'importe que `./horloge.ts` et le type `StatutEtape` de `./seanceSolo.ts`) :
>    - `interface PartieEnBref { titre: string; refId?: string; statut: StatutEtape }` ; `interface EtatSeanceEnBref { ouvertLeMs: number; horloge: Horloge; parties: PartieEnBref[] }` ;
>    - `ouvrirSeanceEnBref(parties: { titre: string; refId?: string }[], maintenantMs: number)` (horloge `HORLOGE_PRETE`, statuts `a_faire`) ; `demarrerChrono(etat, ms)`, `mettreEnPauseChrono(etat, ms)`, `reprendreChrono(etat, ms)` (par les fonctions de `horloge.ts`) ; `marquerPartie(etat, i, statut: StatutEtape)` (une nouvelle valeur remplace l'ancienne : on peut se corriger) ;
>    - `tempsEcouleS(etat, ms)` = `secondesEcoulees(etat.horloge, ms)` ; `dureeMinutes(etat, ms)` : chrono jamais démarré → `minutesEcoulees({ debutMs: etat.ouvertLeMs }, ms)` (même règle que la séance guidée : sans elle, un oubli de « Démarrer » enregistrerait 0 min et fausserait la charge) ; sinon `Math.round(tempsEcouleS / 60)` ;
>    - `etapesRealisees(etat): { titre: string; statut: StatutEtape; refId?: string }[]` (forme de `EtapeRealisee`).
> 4. **Lancement**, `src/ecrans/lancement.ts` :
>    - `Lancement` gagne `| { mode: 'en_bref'; seance: SeancePlanifiee; niveau: 'simple' | 'grandes_lignes'; durete: Durete; lien: LienPlan }` ;
>    - `lancementDepuisPlan(planifiee, mode, fiches, cycle?: Pick<Cycle, 'niveauDetail'>)` : en solo, `niveauAffiche(planifiee, cycle)` ; `detaille` → le lancement solo actuel (il a des étapes par définition) ; `simple` ou `grandes_lignes` → `en_bref`, avec le même `lien` (marqueurs `marqueursVersionPlanifiee(planifiee.solo, fiches)`). Plus jamais `undefined` en solo ; le groupe ne change pas ;
>    - `brouillonEnBref(l, etapes, dureeMin, salleId?)` : `mode: 'solo'`, `nom`, `durete`, `dureeMin`, `etapes`, `objectifs: []`, `blocs: []` et les champs du lien (`seancePlanifieeId`, `qualite`, `marqueurs`, `salleId`) ;
>    - `rappelBlocPour(l: Lancement): boolean` = `l.lien?.marqueurs.includes('bloc_limite') === true` (l'instantané de la version lancée).
> 5. **Boutons** : `peutLancerSolo` (`Aujourdhui.outils.ts`) rend toujours vrai pour une séance du plan, commentaire « Depuis D-27, toute séance solo s'ouvre : SeanceSolo en détaillé, SeanceEnBref en simple et en grandes lignes. » ; le test « le bouton solo est masqué sans étapes (jusqu'à D-27) » (`Aujourdhui.outils.test.ts:86`) devient « le bouton solo existe sans étapes ; le groupe seulement avec une version groupe ».
> 6. **App** (`App.tsx`) : `lancer` relit le cycle de la séance (`(await lireCycles()).find((c) => c.id === demande.seance.cycleId)`, en cas d'échec sans cycle : niveau de la séance seule) et le passe à `lancementDepuisPlan` ; nouvelle vue `{ nom: 'seance_en_bref'; lancement; fiches; exercicesPerso }` (les exercices sont déjà lus dans `lancer`) ; `SeanceEnBref` → `onTerminer(etapes, dureeMin, douleur?)` → vue `questions` avec `brouillonEnBref(…, profil.salleHabituelleId)` et `douleurInitiale`, puis débrief, comme les autres ; « Quitter » = `quitter` (même `Confirmation`). `rappelBloc={rappelBlocPour(lancement)}` donné à `SeanceSolo`, `SeanceGroupe` et `SeanceEnBref`.
> 7. **Écran** `src/ecrans/SeanceEnBref.tsx`, props `{ seance: SeancePlanifiee; niveau: 'simple' | 'grandes_lignes'; fiches: Record<string, FicheVerif>; exercicesPerso: ExercicePerso[]; rappelBloc: boolean; onTerminer: (etapes, dureeMin: number, douleur?: boolean) => void; onQuitter: () => void }` :
>    - parties : grandes lignes → `partiesAffichees(seance.solo, seance.qualite, fiches)`, une partie par ligne (`refId` = `principal?.refId`) ; simple → une seule partie `{ titre: seance.solo.nom, refId }`, `refId` = le principal de la partie écrite s'il n'y en a qu'une ;
>    - de haut en bas : « Stop, ça fait mal » (`.bouton.arret.centre.stop-seance`, collé en haut, **comme `SeanceSolo` et `SeanceGroupe`**, toujours visible) ; « Quitter » discret et le nom en `h1` ; mention « {Qualité} · {dure | légère} · {durée} » (`nomQualite`, `formaterDuree(dureeVersionSolo(seance.solo))`, rien si 0) ; `RappelSecuriteBloc` si `rappelBloc` ; chrono libre : temps écoulé en chiffres de 72 px (`aria-live="off"`), « Démarrer » / « Pause » / « Reprendre » en bouton second (la seule résine est « Terminer la séance ») ;
>    - simple : `recommandationAffichee(…)` en `.recommandation` (classe de D-22) ; grandes lignes : chaque partie en ligne : titre, durée, nom de l'exercice principal (`fiches[refId]?.nom`), consigne ; « Fait » et « Passé » de 64 px, `aria-pressed`, libellés accessibles « {titre} fait » et « {titre} passé » ; « Voir la fiche » (si `refId`) déplie sous la partie la consigne de la fiche (`protocoleParId(refId)`, sinon l'exercice personnel de même id) et, pour une liste, ses éléments ; pas d'écran nouveau ;
>    - « À respecter » (fiche encre) si `seance.solo.durete === 'dure'` ou si les marqueurs du lien contiennent `maximale` : les trois phrases de T-16, mot pour mot ;
>    - « Lancer un repos » : `useRepos(minutes × 60)`, durée choisie en `.choix.cinq` de 1 à 5 min, 3 par défaut ;
>    - « Terminer la séance » (principal) : en simple, la partie unique passe à `faite` (la séance a été faite) ; en grandes lignes, les statuts tels quels ; puis `onTerminer(etapesRealisees(etat), dureeMinutes(etat, Date.now()))`. « Stop » ouvre `MisesEnGarde apresDouleur` par-dessus, comme `SeanceSolo` (« Terminer et enregistrer » → `onTerminer(…, true)`, statuts tels quels).
> 8. **Rappel de sécurité du bloc**, `src/composants/RappelSecuriteBloc.tsx` : sans props ; lit `protocoleParId('technique-rappel-securite-bloc')` ; `.fiche` avec son `nom` en titre et ses `elements` en `ul.liste-simple`, mot pour mot ; rien si la fiche manque. Affiché sous le titre dans `SeanceSolo` (avant les étapes), `SeanceGroupe` (avant l'objectif) et `SeanceEnBref`, par une prop facultative `rappelBloc?: boolean` (absente = rien : les séances libres n'en ont pas).
> 9. **Durée** : pas de champ de durée dans Trois questions (T-11 inchangé) ; `dureeMinutes` du point 3. `niveaux-de-detail.md` § 4.2 est consolidé en ce sens.
> 10. **Tests** : `seanceEnBref.test.ts` : ouvert à 0, démarré à 1 000 ms, pause à 61 000, reprise à 121 000, lu à 181 000 → `tempsEcouleS` 120, `dureeMinutes` 2 ; jamais démarré, lu 30 min après l'ouverture → `tempsEcouleS` 0, `dureeMinutes` 30 ; une partie marquée `faite` → `etapesRealisees` d'une entrée ; trois parties `faite`, `passee`, `a_faire` → trois entrées dans l'ordre, `refId` gardé ; `marquerPartie` sur une partie déjà faite la change. `lancement.test.ts` : séance simple écrite à la main (`niveauDetail: 'simple'`, sans étapes, une partie « Séance » de principal `traction-simple-4x5`) → `en_bref`, niveau `simple`, lien avec ses marqueurs ; la même sans `niveauDetail`, cycle sans niveau → `en_bref` `grandes_lignes` (des parties, pas d'étapes : `niveauDisponible`) ; `EXEMPLE_SEANCE_PLANIFIEE` avec un cycle `grandes_lignes` → `en_bref` `grandes_lignes` ; sans cycle → solo (détaillé) ; `brouillonEnBref` → `mode: 'solo'`, `seancePlanifieeId`, `qualite`, `marqueurs`, `salleId`, étapes données ; `rappelBlocPour` vrai pour une version qui contient `puissance-bloc-limite`, faux pour une séance libre. `independance.test.ts` passe sans retouche (il voit `seanceEnBref.ts`). Le test existant « une version qui n'existe pas ne se lance pas » change pour le solo sans étapes (seule retouche admise) : il rend désormais `en_bref`.
> 11. **Critères** en plus : une séance simple et une en grandes lignes se font de bout en bout, hors ligne, et apparaissent « faites » dans Aujourd'hui et sur l'ordinateur ; le rappel de sécurité du bloc s'affiche au début d'une séance de bloc limite, en détaillé, en bref et en groupe ; « Stop, ça fait mal » au même endroit que dans `SeanceSolo` ; boutons de séance de 64 px, une seule action en résine.

## Vague 4.3

> (consolidation 26/11, cadrage phase 4) **Ordre et fichiers.** C-04 et D-28 tournent en parallèle quand la vague 4.2 est fusionnée : aucun fichier commun (C-04 : `Aujourdhui.tsx`, `Questions.tsx`, `Profil.tsx`, `MisesEnGarde.tsx` et ses fichiers nouveaux ; D-28 : `lancement.ts`, `App.tsx`, `SeanceSolo.tsx` et leurs tests). Aucune ne touche `src/index.css`. C-04 pourrait démarrer plus tôt (elle ne dépend d'aucun code de C-03) ; elle reste en 4.3 pour garder trois tâches au plus et pour que son `Aujourdhui.tsx` parte de celui de C-03.
>
> (consolidation 26/11, décision G2) **Ordre avec G2-01 et G2-02.** C-04 et D-28 démarrent ensemble (C-04 touche en plus `src/ecrans/bureau/Reglages.tsx`, une ligne, amendement 12 : D-28 ne le touche pas). **G2-01** démarre quand C-04 est fusionnée : elle modifie `douleurs.ts`, `douleurs.test.ts`, `Profil.tsx` et `Aujourdhui.tsx` de C-04 et appelle ses fonctions. Elle n'attend pas D-28 : aucun fichier commun. **G2-02** démarre quand G2-01 est fusionnée : avant, le moteur ne verrait plus les zones encore présentes dans le profil. Elle n'attend pas D-28 non plus : aucun fichier commun. Jamais plus de deux tâches en même temps. À chaque fusion, `main` reste sûr : les zones du profil comptent dans les règles jusqu'à G2-01, qui les reprend en douleurs déclarées dans la même livraison.

#### C-04 · Douleurs déclarées
- **Modèle** : Sonnet · **Dépend de** : C-03, D-08 · **Texte** : [texte complet plus bas](#c-04-texte-complet)
- **Fichiers** : créer `src/donnees/douleurs.ts`, `douleurs.test.ts`, `src/ecrans/DeclarerDouleur.tsx` ; modifier `src/ecrans/Questions.tsx`, `src/ecrans/Profil.tsx`, `src/App.tsx`.

> **Amendements de consolidation** : tâche nouvelle (règles S-05, S-06, J-05 ; écran T-11).
> 1. (consolidation 26/11, cadrage phase 4) **Décalages relevés dans le code.**
>    - Les signes d'arrêt sont aujourd'hui une constante privée de `src/ecrans/MisesEnGarde.tsx:7-16` (`ARRET`, 8 signes, avec `REDUCTION` à `:17-22`), en mots plus simples que A.8 (`regles-planification.md:319` : « gonflement ou ecchymose », la liste dit « Gonflement ou bleu ») : « mot pour mot » ne peut pas viser les deux.
>    - Le texte enregistré dans `DouleurDeclaree.signes` ressort tel quel dans le message de S-05 (`verifSeanceProfil.ts:256-266`, signes joints par « , ») : il doit être court et lisible.
>    - `marquerResolue` n'a ni identifiant ni date dans le texte d'origine.
>    - `App.tsx` n'est pas nécessaire : la précision peut s'ouvrir dans Trois questions (état local), et `App.tsx` appartient à D-28 dans la même vague.
>    - Le signal de douleur d'Aujourd'hui (D-22, `Aujourdhui.tsx:114-124`) ne lit que `profil.douleursEnCours` : une douleur déclarée par C-04 n'y apparaîtrait pas ; et un **signe d'alerte** y recevrait le texte de réduction (« Ménage cette zone… »), trop faible.
>    - `Profil.tsx` sert aussi à l'ordinateur (`bureau/Reglages.tsx:182`) : la liste des douleurs y apparaîtra aussi (voulu : l'architecture laisse les deux appareils écrire les douleurs, § 3.1).
>    - Le profil a déjà une question « Une douleur en ce moment ? » (zones sans date, `ProfilFormulaire.tsx:108-114`) : voir la question pour Arthur ci-dessous.
>    - Plus de dépendance au **code** de C-03 : J-05 et S-06 sur Aujourd'hui viennent de C-03 (lecture de la table `douleurs` par D-22, `verifierJour` et `verifierJourSansSeance`). C-04 garde C-03 comme dépendance pour partir de son `Aujourdhui.tsx`.
> 2. **Fichiers** (remplace la ligne ci-dessus) : créer `src/donnees/douleurs.ts`, `src/donnees/douleurs.test.ts`, `src/ecrans/DeclarerDouleur.tsx` ; modifier `src/ecrans/Questions.tsx`, `src/ecrans/Profil.tsx`, `src/ecrans/MisesEnGarde.tsx`, `src/ecrans/Aujourdhui.tsx`. **Pas** `App.tsx` (D-28), ni `index.css` (cases à cocher : classe `.case` existante, `index.css:417-418`).
> 3. **Données**, `src/donnees/douleurs.ts` :
>    - `SIGNES_ARRET` et `SIGNES_REDUCTION` : les deux listes de `MisesEnGarde.tsx`, déplacées ici mot pour mot (une seule source) ; `CONDUITE_REDUCTION` = « Retire les arqués, le pan Güllich, les trous et les efforts maximaux. Garde de la grimpe facile et sans douleur. Sans nette amélioration en 14 jours, consulte. » (texte actuel de `MisesEnGarde.tsx:56`). `MisesEnGarde.tsx` les importe ; son affichage ne change pas. Les cases de C-04 sont les 8 `SIGNES_ARRET` (mêmes signes que A.8, dans les mots que l'utilisateur lit déjà ; architecture § 3.2 consolidée).
>    - `declarerDouleur(d: { date: DateISO; zone: ZoneDouleur; signes: string[] }): Promise<DouleurDeclaree>` : un signe absent de `SIGNES_ARRET` → `Error('Signe inconnu.')`, rien n'est écrit (aucun texte libre ne peut entrer) ; `niveau` = `'alerte'` s'il y a au moins un signe, sinon `'reduction'` (la seule règle, ici) ; `id` = `crypto.randomUUID()` ; écrit par `ecrire('douleurs', …)` ; rend le document.
>    - `douleursOuvertes(douleurs: DouleurDeclaree[], jour: DateISO): DouleurDeclaree[]` (pure) : non supprimées, `date <= jour`, `resolueLe` absent ou `> jour` (même définition que `zonesDouloureuses`, `regles/base.ts:174`), par date croissante ; `lireDouleursOuvertes(jour)` = la même chose sur `lireTous('douleurs')`.
>    - `marquerResolue(id: string, jour: DateISO): Promise<void>` : relit (`lireUn`), absente → erreur ; écrit `resolueLe: jour` (fermée dès ce jour, pour toutes les règles).
>    - `signalDouleur(zonesProfil: ZoneDouleur[], ouvertes: DouleurDeclaree[]): { titre: string; texte: string } | null` (pure) : une douleur ouverte de niveau `alerte` → titre « Signe d’alerte déclaré : {zones des alertes}. », texte « Pas de séance dure avant d’avoir consulté un médecin ou un kiné qui connaît l’escalade. » (la phrase de S-05) ; sinon, s'il y a des zones (profil ∪ douleurs ouvertes en réduction, sans doublon, dans l'ordre de `ZONES`) → titre « Douleur déclarée : {zones}. », texte « Ménage cette zone et arrête-toi dès que ça fait mal. » (texte de D-22) ; sinon `null`. Zones en minuscules (`ZONES[].nom`), jointes par « , ».
> 4. **Trois questions** (`Questions.tsx`) : quand « Oui » est choisi à la douleur, un bouton second « Préciser la douleur (facultatif) » apparaît sous la question. Il affiche `DeclarerDouleur` à la place des questions (état local : les trois réponses restent gardées) ; « Enregistrer la douleur » puis « Continuer », ou « Annuler », reviennent aux questions. La suite ne change pas : « Enregistrer et voir le débrief » → mises en garde (douleur) → débrief (`App.tsx` inchangé). Props de `Questions` inchangées.
> 5. **Écran** `src/ecrans/DeclarerDouleur.tsx`, props `{ date: DateISO; onFini: () => void }` : titre `h1` « Préciser la douleur » (focus à l'ouverture) ; « Où ? » : les 9 zones de `ZONES` en `.choix.trois` (une seule, obligatoire) ; « As-tu un de ces signes ? » : les 8 `SIGNES_ARRET` en `label.case` + `input type="checkbox"` ; aide « Coche seulement ce que tu as remarqué. » ; action principale « Enregistrer la douleur » (désactivée sans zone, avec « Choisis la zone pour enregistrer. » dessous) ; discret « Annuler ». Aucun champ de texte. Après l'enregistrement, en place du formulaire : au moins un signe → `Avertissement niveau="arret"` titre « Arrête la séance et consulte un médecin ou un kiné qui connaît l’escalade. » ; aucun → `Avertissement niveau="avertissement"` titre « Allège pendant 1 à 2 semaines », texte `CONDUITE_REDUCTION` ; puis principal « Continuer » (`onFini`). Aucune gravité, aucun nom de lésion.
> 6. **Profil** (`Profil.tsx`), section « Douleurs déclarées » avant « À savoir et données » : les douleurs de `lireDouleursOuvertes(jourLocal())`, une ligne chacune : « {Zone} · depuis le {12 novembre} » et un bouton second « Marquer comme résolue » → `Confirmation` (R-4) titre « Douleur résolue ? », texte « Les règles n’en tiendront plus compte à partir d’aujourd’hui. », action « Marquer comme résolue » ; sans douleur ouverte : « Aucune douleur déclarée. » ; bouton second « Déclarer une douleur » qui ouvre `DeclarerDouleur` (date du jour) à la place du profil (une douleur apparaît aussi hors séance, et sans date ni S-06 ni J-05 ne la verraient). La liste se relit après chaque action. Le niveau n'est pas affiché.
> 7. **Aujourd'hui** (`Aujourdhui.tsx`) : le signal de douleur de D-22 devient `signalDouleur(profil.douleursEnCours, douleursOuvertes(donnees.douleurs, aujourdhui))` (même forme : `Avertissement niveau="arret"`, correction « Voir les mises en garde » ; titre et texte de la fonction ; affiché dans tous les états, comme aujourd'hui). Rien d'autre ne change dans cet écran.
> 8. **Tests** (`douleurs.test.ts`, `fake-indexeddb`) : sans signe → `reduction`, avec un signe → `alerte`, `aEnvoyer` 1 ; un signe hors liste → erreur, rien d'écrit ; `douleursOuvertes` : supprimée, résolue le jour même, déclarée demain → absentes ; résolue demain → présente ; `marquerResolue` → `resolueLe` posé, les autres champs intacts, plus dans `lireDouleursOuvertes` ; `signalDouleur` : alerte au coude → titre « Signe d’alerte déclaré : coude. » et la phrase de S-05 ; profil doigts et réduction au coude → « Douleur déclarée : doigts, coude. » ; rien → `null`. Chaîne moteur (`contexteVerif` puis `verifierJour` de `regles/index.ts`) : douleur `alerte` déclarée, séance dure → S-05 fort dont le message cite le signe coché, `formeAffichage` `'arret'` ; douleur `reduction` déclarée il y a 3 jours, séance avec `puissance-bloc-limite` → S-06 fort ; même douleur marquée résolue → ni S-05 ni S-06.
> 9. **Critères** en plus : aucun champ de texte dans le parcours douleur ; les signes sont exactement ceux des mises en garde ; une douleur déclarée dans Trois questions apparaît dans le signal d'Aujourd'hui, dans Profil, et dans les avertissements du plan sur l'ordinateur (S-04, S-06) ; marquée résolue, elle disparaît partout ; boutons de 48 px, focus visible, une seule action en résine par écran.
> 10. (consolidation 26/11, décision G2) **Place de la section « Douleurs déclarées »** (remplace la place donnée au point 6) : juste après `ProfilFormulaire`, avant `sectionsEnPlus` ; `<section className="pile" id="section-douleurs" aria-labelledby="titre-douleurs">`, titre `h2.sous-titre` d'`id` `titre-douleurs`. Sur téléphone, rien ne change : elle reste juste avant « À savoir et données ». Sur ordinateur, elle vient avant « Règles », comme O-12 (consolidé). `src/ecrans/bureau/Reglages.tsx` : entrée `{ id: 'section-douleurs', nom: 'Douleurs' }` dans `SOMMAIRE`, juste après « Prérequis ». Pourquoi : la section remplace la question du profil (G2). Sans entrée de sommaire, elle serait sous « Règles » et « Assistant », loin du profil.
> 11. (consolidation 26/11, décision G2) **Ce qui reste à G2-01.** La question du profil et `profil.douleursEnCours` restent jusqu'à G2-01, qui suit C-04 : C-04 n'y touche pas (pas de reprise, formulaire inchangé). Entre les deux fusions, les deux entrées coexistent et comptent toutes les deux, comme le prévoyait le choix par défaut. `signalDouleur(zonesProfil, ouvertes)` garde ses deux paramètres (point 3) : G2-01 retire le premier. N'ajouter aucune autre lecture de `profil.douleursEnCours`.
> 12. **Fichiers en plus** : `src/ecrans/bureau/Reglages.tsx` (une ligne, point 10).
>
> **Question tranchée (cadrage phase 4)** : Arthur a répondu le 26/11 (décision G2, `docs/decisions-phase-1.md`). La question du profil « Une douleur en ce moment ? » est **remplacée** par les douleurs déclarées et datées. Mise en œuvre : G2-01 et G2-02 (vague 4.3, après C-04). La question était : le profil garde-t-il « Une douleur en ce moment ? » (zones sans date, `ProfilFormulaire.tsx:108`) à côté des douleurs déclarées et datées de C-04, sachant qu'une zone sans date ne compte jamais pour S-06 ni pour J-05 ?

#### D-28 · Mini-bloc de la séance en groupe sur téléphone — vague 4.3 (consolidation 26/11, cadrage phase 4)
- **Modèle** : Sonnet · **Dépend de** : D-22, D-27 (`lancement.ts`, `App.tsx`, `SeanceSolo.tsx`) · **Texte** : [plus bas](#d-28-texte-complet)
- **Fichiers** : modifier `src/ecrans/lancement.ts`, `src/ecrans/lancement.test.ts`, `src/App.tsx`, `src/ecrans/SeanceSolo.tsx`.

> **Amendements de consolidation** : tâche nouvelle (écart signalé à la livraison de D-22 : 11 séances types sur 26 ont un mini-bloc en version groupe, souvent de la poutre ou des tractions lestées, et le téléphone ne le montrait pas). En parallèle de C-04 : aucun fichier commun.

#### G2-01 · Douleurs : une seule source, reprise des zones du profil — vague 4.3 (consolidation 26/11, décision G2)
- **Modèle** : Sonnet · **Dépend de** : C-04, C-03 · **Texte** : [plus bas](#g2-01-texte-complet)
- **Fichiers** : créer `src/donnees/repriseDouleurs.test.ts` ; modifier `src/donnees/profil.ts`, `src/donnees/base.ts`, `src/donnees/migration.test.ts`, `src/donnees/douleurs.ts`, `src/donnees/douleurs.test.ts`, `src/ecrans/ProfilFormulaire.tsx`, `src/ecrans/Bienvenue.tsx`, `src/ecrans/Profil.tsx`, `src/ecrans/Aujourdhui.tsx`, `src/ecrans/controlesDuJour.test.ts`, `src/ecrans/bureau/VueSemaine.tsx`, `src/regles/passerelles.ts` (une ligne), `src/regles/generateur.test.ts` (un test).

> **Amendements de consolidation** : tâche nouvelle (décision G2 d'Arthur, 26/11). Démarre quand C-04 est fusionnée ; en parallèle de D-28 : aucun fichier commun.

#### G2-02 · Moteur : une seule entrée pour les douleurs — vague 4.3 (consolidation 26/11, décision G2)
- **Modèle** : Haiku · **Dépend de** : G2-01, C-03 · **Texte** : [plus bas](#g2-02-texte-complet)
- **Fichiers** : modifier `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/banque.ts`, `src/regles/passerelles.ts`, `src/regles/exemples.ts`, `src/assistant/format.ts` ; tests `src/regles/base.test.ts`, `src/regles/banque.test.ts`, `src/regles/verifSeanceProfil.test.ts`, `src/regles/verifPlan.test.ts`, `src/regles/integration.test.ts`, `src/donnees/bibliotheque/lignesFiche.test.ts`, `src/donnees/seancesTypes.moteur.test.ts`.

> **Amendements de consolidation** : tâche nouvelle (décision G2 d'Arthur, 26/11). Démarre quand G2-01 est fusionnée ; en parallèle de D-28 si elle tourne encore : aucun fichier commun.

## Fin de phase 4

**Sur un vrai téléphone (une semaine réelle)** : Aujourd'hui affiche la séance prévue, solo ou groupe selon le mode habituel, (consolidation 18/11) à son niveau de détail (faire au moins une séance simple et une en grandes lignes, chrono libre, « Stop, ça fait mal » visible) ; une séance à la salle en mode avion, puis le retour du réseau ; le débrief relié à la séance prévue ; la forme du jour remplie un matin et son effet (contrôle J-01) ; une séance déplacée puis une séance sautée sur le téléphone, visibles ensuite sur l'ordinateur ; une douleur déclarée puis marquée résolue.

**Audit Fable** : contrôles du jour conformes à B.8 et affichés sans bloquer ; parcours douleur (aucun diagnostic, signes d'alerte → arrêt et consultation, rien de médical en texte libre) ; ajustements du téléphone et règle « dernière modification gagne » (cas de conflit testé) ; aucune séance d'exemple restante ; fonctionnement hors ligne complet à la salle.

(consolidation 26/11, cadrage phase 4) **En plus, sur le téléphone** : une séance en groupe avec mini-bloc (ST-DOI-02 ou ST-TRA-02) jouée en entier (D-28) ; une forme du jour un jour de repos (la ligne est là) ; une douleur en réduction déclarée, puis une séance avec un effort maximal : S-06 en signal d'arrêt sur Aujourd'hui ; le rappel de sécurité du bloc au début d'une séance de bloc limite, à chaque niveau. **En plus, pour l'audit** : S-06 dans `verifierJour` et J-05 un jour sans séance (`verifierJourSansSeance`, B.4 consolidé) ; aucun texte ne dit que l'app retire des exercices (T-06 consolidé) ; une séance manquée ne propose ni « Déplacer » ni « Sauter » (A3-6) ; les signes cochés sont ceux des mises en garde, rien d'autre ne peut être enregistré.

(consolidation 26/11, décision G2) **En plus, sur le téléphone et l'ordinateur** : le profil n'a plus « Une douleur en ce moment ? » ; au premier lancement d'un appareil vide, une zone cochée apparaît dans Profil avec la date du jour ; si un ancien profil avait une zone, elle est devenue une douleur déclarée, avec la mention de reprise, une seule fois, même avec deux appareils synchronisés. **En plus, pour l'audit** : une seule source de douleurs pour les règles (`grep -rn douleursEnCours src` ne trouve que la reprise et ses tests) ; une douleur reprise n'est jamais datée après la création du profil ; une sauvegarde ancienne se recharge et ses zones sont reprises.

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
> 3. (consolidation 24/11, F5 et F6) Règle **F-10** (D.4 consolidé) : l'assistant ne choisit jamais le niveau. `IdsAutorises` reçoit deux champs, tirés du contexte envoyé : `niveauDetail: NiveauDetail` (`contexte.niveauDetail`) et `niveauxSeancesAVenir: Map<string, NiveauDetail>` (id → `niveau` de `planEnCours.seancesAVenir`). Niveau attendu : celui de la séance visée pour le `par` d'un `remplacer_seance`, `niveauDetail` partout ailleurs. Une séance résumée dont le `niveau` diffère du niveau attendu, ou toute séance résumée quand le niveau attendu est `detaille` → `invalide`, `A-01`, erreur « séance du jeudi : niveau simple reçu, grandes_lignes attendu » (ou « séance du jeudi : séance résumée, detaille attendu »). Séances types et séances par étapes : acceptées à tous les niveaux. Tests : contexte `grandes_lignes`, semaine avec une séance résumée `simple` → `A-01`, erreur contenant « simple » et « grandes_lignes » ; contexte `detaille` (brouillon de cycle) avec une séance résumée → `A-01` ; `remplacer_seance` sur une séance de niveau `simple` dans un cycle `grandes_lignes`, `par` résumée `simple` à 1 partie → `ok`, même `par` en `grandes_lignes` à 3 parties → `A-01` ; exemple 1 de D.9 avec `niveauDetail: 'simple'` → `ok`. Les tests de l'amendement 2 prennent comme `niveauDetail` le niveau de la séance testée. E-11 est en cours : à intégrer avant sa livraison ; si elle est déjà fusionnée, petite reprise de `validerReponse.ts` après elle, sans tâche nouvelle.
> 4. (livraison 25/11, validé par le gérant) Bornes non chiffrées par la spec, choisies prudemment : séries 1 à 20, repos 0 à 1 200 s, durée d'étape 1 à 180 min, blocs 1 à 20, essais 1 à 10, cible 1 à 50, 1 à 30 étapes, 1 à 7 séances par semaine, 1 à 4 semaines d'affûtage, textes courts 200 caractères, question 300. Seule la phrase standard de refus est exemptée de A-07 (l'exemple 3 de D.9 la contient). Une source `fiche` ou `methode` inconnue est retirée avec une information. Titres de livres comparés après normalisation de l'apostrophe et des espaces. **E-13 et E-15 doivent remplir** `niveauDetail` et `niveauxSeancesAVenir` de `IdsAutorises`.

#### E-14 · Prompt système de l'assistant
- **Modèle** : Haiku · **Dépend de** : — · **Texte** : [taches-entrainement.md, E-14](specs/entrainement/taches-entrainement.md#e-14--prompt-système-de-lassistant)
- **Fichiers** : créer `src/assistant/promptSysteme.ts`, `promptSysteme.test.ts`.

> **Amendements de consolidation**
> 1. Le bloc D.6 a été corrigé (consolidation 17/11) : « phase » pour la période de 4 semaines dans les textes affichés, phase de technique possible (B13), livres cités seulement comme lecture conseillée, jamais comme source d'une règle. Recopier la version actuelle ; ajouter au test la phrase « Ne prête jamais à un livre une règle ou un chiffre ».
> 2. (consolidation 18/11) Le bloc D.6 a un paragraphe « # Niveaux de détail » : le recopier ; ajouter au test la phrase « Préfère toujours une séance type (seanceTypeId), à tous les niveaux ».
> 3. (consolidation 24/11) Bloc D.6 corrigé et déjà recopié dans `src/assistant/promptSysteme.ts` : phrase « Tu ne choisis jamais le niveau de détail » et niveau de réponse (F5, F6, règle F-10) ; repères d'assiette rattachés à leur source (synthèse « Manger assez : l'assiette suit la dureté de la séance », vérification 7) et ajoutés aux repères sourcés ; « environ 250 mL par heure » retiré (jamais relu à la source). `VERSION_PROMPT = '2026-11-24'`. Tests ajoutés : la phrase sur le niveau ; aucun chiffre dans la partie « Alimentation et poids ».

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
> 5. (consolidation 24/11, F-10) `planEnCours.seancesAVenir[].niveau` = niveau **choisi** (`niveauChoisi(seance, cycle)`, N-01), et non plus le niveau affiché : une séance qui en remplace une autre se compose à ce niveau. Les mêmes valeurs remplissent `niveauDetail` et `niveauxSeancesAVenir` de `IdsAutorises` (E-11). Test : séance choisie `detaille`, sans étapes, avec des parties → `niveau: 'detaille'`.
> 6. (consolidation 26/11, décision G2) `profil.douleursEnCours` n'existe plus, ni dans le profil (G2-01), ni dans `ProfilVerif` ni dans `ContexteAssistant.profil` (G2-02, `format.ts`). Les douleurs arrivent à l'assistant seulement par `douleursOuvertes` = `douleursOuvertes(douleurs, aujourdhui)` (C-04), avec `depuisJours` = `joursEntre(d.date, aujourdhui)`. Le filtre des fiches et des objectifs par zone = `zonesDouloureuses` (douleurs déclarées seulement). Une douleur reprise d'un ancien profil est une douleur comme les autres (rien à signaler à l'assistant). Test : une douleur déclarée au coude, ouverte → `douleursOuvertes` d'une entrée, et aucune clé `douleursEnCours` dans `profil`.

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
> 3. (consolidation 24/11, F5 et F6) C-07 n'écrit **jamais** un `niveauDetail` de séance tiré de la réponse : avec F-10, le `niveau` d'une séance résumée ne fait que répéter le niveau envoyé. Une séance nouvelle (cycle, phase, semaine) n'a pas de `niveauDetail` : elle suit le cycle. Un `remplacer_seance` garde le `niveauDetail` de la séance visée (choix de l'utilisateur), quel que soit le contenu de `par`. Cette règle remplace « son `niveauDetail` n'est posé que s'il diffère de celui du cycle » (amendement 1). Seul `niveauCycle` (amendement 2), choisi à l'écran, écrit un niveau. Tests : `remplacer_seance` par une séance type sur une séance en `detaille` dans un cycle `simple` → la séance reste en `detaille` ; une séance résumée gardée dans une semaine d'un cycle `grandes_lignes` → aucun `niveauDetail`.

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

**Audit Fable** : (1) clé API — jamais synchronisée, exportée, écrite dans la console ou un message d'erreur, connexions limitées par la politique de sécurité du contenu à l'app, Supabase et `api.anthropic.com` ; (2) contrôles A-01 à A-07, une seule relance, refus des demandes de perte de poids, (consolidation 24/11) aucun niveau de détail choisi par l'assistant (F-10) ; (3) **sources** — aucun livre cité comme source d'une règle ou d'un chiffre, auteurs de la liste fermée seulement, (consolidation 24/11) aucun chiffre d'alimentation hors des repères d'assiette sourcés ; (4) les règles de sécurité s'appliquent au brouillon comme au plan manuel (S-02 en fort pour l'assistant), (consolidation 18/11) à tous les niveaux de détail, et l'assistant ne pioche que dans la banque envoyée (G-01) ; (5) estimation du coût à comparer avec la facture réelle de quelques demandes.

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
- (consolidation 26/11, cadrage phase 4) Les amendements 2 à 10 de l'entrée (vague 4.2) priment : fichiers, signatures, S-06 et `verifierJourSansSeance`, tests.
- **Objectif** : quelques questions le matin, qui alimentent les contrôles du jour (J-01 à J-07) affichés sur Aujourd'hui, sans jamais bloquer.
- **Dépend de** : D-22, E-08, E-09, C-01 ; table `formes` (F2-04).
- **Lire** : `docs/architecture-v2.md` § 3.2 (`FormeDuJour`) ; `moteur-verification.md` B.8 ; `parcours-et-ecrans.md` T-06 ; `src/ecrans/Aujourdhui.tsx` ; `src/donnees/stockage.ts`.
- **Fichiers** : créer `src/donnees/formes.ts` (`lireForme(date)`, `enregistrerForme(forme)` par `ecrire('formes', …)` avec `id = date`, `lireFormesEntre(debut, fin)`), `formes.test.ts`, `src/ecrans/FormeDuJour.tsx` ; modifier `src/ecrans/Aujourdhui.tsx`, `src/miseEnPage/MiseEnPageTelephone.tsx` (ouverture de l'écran).
- **Étapes** : (1) écran de 5 questions de 1 à 5 en choix encre — « Sommeil cette nuit », « Fatigue », « Courbatures », « Douleur » (1 = forte, 5 = aucune), « Peau des doigts » (1 = abîmée) — plus « Heures de sommeil » facultatif ; « 30 secondes » ; action principale « Enregistrer » ; (2) ligne « Forme du jour » dans Aujourd'hui : « À renseigner » ou le résumé (« 2 voyants au rouge ») ; (3) contrôles : `verifierJour(seanceDuJour, contexteVerif(…), realisees)` affichés au-dessus de la fiche avec `formeAffichage` (C-01) ; texte des messages = celui du moteur ; aucun bouton désactivé.
- **Critères** : une seule forme par jour, même saisie sur deux appareils (identifiant = date) ; « 2 voyants au rouge » + séance dure → J-01 visible ; hors ligne, tout marche.

### C-04 (texte complet)

**C-04 · Douleurs déclarées** — phase 4, Sonnet.
- (consolidation 26/11, cadrage phase 4) Les amendements 1 à 9 de l'entrée (vague 4.3) priment : plus d'`App.tsx`, liste des signes unique (`SIGNES_ARRET`), signal d'Aujourd'hui, tests ; question pour Arthur sous l'entrée.
- (consolidation 26/11, décision G2) Amendements 10 à 12 : place de la section « Douleurs déclarées » et entrée « Douleurs » du sommaire de l'ordinateur. La question du profil est tranchée (remplacée) ; son retrait et la reprise des zones déjà cochées sont dans G2-01, après C-04.
- **Objectif** : déclarer une douleur datée (zone, signes d'alerte), la voir prise en compte par les règles (S-04 à S-06, J-05), la marquer résolue. Jamais de diagnostic.
- **Dépend de** : C-03, D-08 ; table `douleurs` (F2-04).
- **Lire** : `regles-planification.md` A.8 ; `moteur-verification.md` S-04 à S-06 et J-05 ; `parcours-et-ecrans.md` T-11 ; `src/ecrans/Questions.tsx`, `src/ecrans/MisesEnGarde.tsx`, `src/ecrans/Profil.tsx`.
- **Fichiers** : créer `src/donnees/douleurs.ts` (`declarerDouleur`, `marquerResolue`, `lireDouleursOuvertes(jour)`), `douleurs.test.ts`, `src/ecrans/DeclarerDouleur.tsx` ; modifier `src/ecrans/Questions.tsx`, `src/ecrans/Profil.tsx`, `src/App.tsx`.
- **Étapes** : (1) après « Oui » à la douleur dans Trois questions, proposer « Préciser » (facultatif) ; (2) écran : zone (`ZONES`), puis « As-tu un de ces signes ? » avec les signes d'arrêt de A.8 en cases à cocher (texte mot pour mot) ; au moins un coché → `niveau: 'alerte'` et signal d'arrêt « Arrête la séance et consulte un médecin ou un kiné qui connaît l'escalade. » ; aucun → `niveau: 'reduction'` et l'avertissement « Allège pendant 1 à 2 semaines » des mises en garde ; (3) Profil : liste des douleurs ouvertes avec leur date et « Marquer comme résolue » (`resolueLe` = aujourd'hui).
- **Critères** : aucun champ de texte libre médical ; aucune gravité ni nom de lésion affichés ; une douleur ouverte depuis 14 jours fait apparaître J-05 sur Aujourd'hui.

### C-05 (texte complet)

**C-05 · Petits ajustements du plan sur téléphone** — phase 4, Sonnet (décision B11).
- (consolidation 26/11, cadrage phase 4) Les amendements 1 à 7 de l'entrée (vague 4.2) priment : `joursPossibles`, `deplacerSeance(id, nouvelleDate, aujourdhui)`, avertissements de l'aperçu, test de conflit.
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
- (consolidation 26/11, cadrage phase 4) Les amendements 1 à 11 de l'entrée (vague 4.2) priment : état du chrono par `horloge.ts`, `lancement.ts` et `peutLancerSolo` au lieu des écrans, rappel de sécurité du bloc dans les trois écrans de séance, durée, place de « Stop ».
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

# Tâche ajoutée le 24/11 (texte complet)

Point signalé par les développeurs de C-01 et E-09 ; règle : `docs/specs/niveaux-de-detail.md` § 3.4 ; détail : `docs/specs/entrainement/moteur-verification.md` (ajouts « consolidation 24/11 » de B.1, B.2, B.3, B.5, B.6 et B.11). Règles à joindre : `CLAUDE.md`, R-1 à R-9, et les « Règles communes » de `taches-entrainement.md` (fonctions pures, imports en `.ts`, aucune dépendance nouvelle, tests Vitest à côté du fichier, rien dans `src/donnees/bibliotheque/`).

### E-18 (texte complet)

**E-18 · Exercice principal des grandes lignes absent des étapes** — phase 3, vague 3.8, Sonnet.
- **Objectif** : une séance qui a des étapes et des parties écrites ne perd aucun avertissement de sécurité. L'exercice principal d'une partie absent des étapes (« principal hors étapes ») est vérifié comme un exercice de la séance (prérequis, douleurs, marqueurs), sans place dans l'ordre ; S-27 signale l'écart. Aujourd'hui, la séance prévue l'ignore partout (cas 19 de B.11 : aucun avertissement au lieu de S-03, S-27 et W-01).
- **Dépend de** : C-01, E-09, E-17 (livrées). D-26 dépend de E-18.
- **Lire** : `docs/specs/niveaux-de-detail.md` § 3.1 et § 3.4 ; `moteur-verification.md` B.1 (`VersionVerif`), B.2 (`marqueursVersion`, `seanceSolliciteDoigts`, `sansContenuConnu`), B.3 (tableau `sujet`), B.5 (paragraphe « Principaux hors étapes », S-27), B.6 (W-05), B.11 (cas 19) ; `src/regles/types.ts`, `base.ts`, `passerelles.ts`, `verifSeanceProfil.ts`, `verifSeanceDeroule.ts`, `verifSemaineQuotas.ts`, `integration.test.ts`, `exemples.ts`.
- **Fichiers** : modifier `src/regles/types.ts`, `base.ts`, `base.test.ts`, `passerelles.ts`, `passerelles.test.ts`, `verifSeanceProfil.ts`, `verifSeanceProfil.test.ts`, `verifSeanceDeroule.ts`, `verifSeanceDeroule.test.ts`, `verifSemaineQuotas.ts`, `verifSemaineQuotas.test.ts`, `integration.test.ts`. **Ne pas toucher** `src/regles/index.ts` (G-01 puis G-03 y ajoutent leur export) : `verifierSeance`, `verifierPlan` et `verifierJour` reprennent les nouvelles alertes sans changement.
- **Étapes**
  1. `types.ts`, `VersionVerif` : `principauxHorsEtapes?: string[]`, avec le commentaire de B.1.
  2. `passerelles.ts`, `soloVersVerif` : quand la version a des étapes réelles, `principauxHorsEtapes` = les `parties[].principal.refId`, dans l'ordre des parties, sans doublon, qui ne sont le `ficheId` d'aucune étape de la vue. Champ posé seulement s'il n'est pas vide. Sans étapes : rien ne change (étapes résumées). `marqueursVersionPlanifiee` ne change pas.
  3. `base.ts` : `marqueursVersion` ajoute les marqueurs des principaux hors étapes connus ; `seanceSolliciteDoigts` est vrai aussi si un principal hors étapes connu a `solliciteDoigts`. `sansContenuConnu`, `dureeVersion` et `chargePrevue` ne changent pas (étapes seulement).
  4. `verifSemaineQuotas.ts`, `fichesDeLaSeance` (W-05) : ajoute les principaux hors étapes de chaque version comptée.
  5. `verifSeanceProfil.ts` : S-01 à S-04 et S-06 à S-09 sur chaque principal hors étapes, mêmes conditions et mêmes messages qu'à une étape ; alerte de portée `'seance'`, `version: 'solo'`, **sans** `etapeIndex`, `sujet` = identifiant de la fiche. `verifierEtape` reçoit pour cela une cible `{ version, etapeIndex }` ou `{ version, sujet }`.
  6. `verifSeanceDeroule.ts` : S-18 et S-19 sur les principaux hors étapes, même cible qu'à l'étape 5. **S-27** (B.5) : une information par principal hors étapes dont la fiche est connue, même cible, message mot pour mot, source « Choix de l'app ». `verifsOrdre` et `verifRepos` (S-10 à S-16, S-24, S-25) ne lisent toujours que `v.etapes`.
  7. Commentaires d'en-tête des fichiers modifiés : une ligne sur les principaux hors étapes, et S-27 ajouté à la liste des codes.
- **Tests**
  - `passerelles.test.ts` : étapes `echauffement-general`, `traction-simple-4x5` et une partie de principal `doigts-suspensions-max-lestees` → `principauxHorsEtapes: ['doigts-suspensions-max-lestees']`, étapes de la vue inchangées ; principal déjà dans les étapes → champ absent ; deux parties au même principal → une seule fois ; sans étapes → comme avant (étapes résumées, champ absent). Pour chacune de ces séances, `marqueursVersion(vue.solo)` et `marqueursVersionPlanifiee(solo)` donnent les mêmes marqueurs (la séance prévue et la séance réalisée comptent pareil).
  - `base.test.ts` : marqueurs et doigts d'une version avec un principal hors étapes ; principal inconnu → aucun marqueur ; `sansContenuConnu` et `dureeVersion` inchangés.
  - `verifSeanceProfil.test.ts` : S-03 et S-04 sur un principal hors étapes (portée séance, `sujet`, pas d'`etapeIndex`) ; principal inconnu → S-01 seul, même cible.
  - `verifSeanceDeroule.test.ts` : S-27, message exact ; muette si le principal est dans les étapes, si sa fiche est inconnue, ou sans parties ; S-11 muette pour un principal `poutre_intensive` hors étapes ; S-17 sur une séance légère dont le principal hors étapes est maximal.
  - `verifSemaineQuotas.test.ts` : W-05 compte un principal hors étapes ; W-01 entre une séance maximale et, le lendemain, une séance dont seul le principal hors étapes est maximal.
  - `integration.test.ts` : cas 19 de B.11 et ses variantes (a), (b), (c), la séance du 25 construite comme `SeancePlanifiee` et passée par `seanceVersVerif`.
- **Critères** : aucun message existant ne change ; les tests déjà livrés passent sans retouche (aucune séance type n'a de parties écrites) ; aucun champ calculé n'est écrit dans un document (R-8) ; `npm run build` et `npm run test` passent ; ligne « E-18 » au tableau « État » du README, en dernier (R-7).

---

# Tâches ajoutées le 25/11 (texte complet)

Corrections de l'audit de fin de phase 3 (`docs/audits/audit-phase-3.md`) qui demandaient une décision de conception ; décisions dans les amendements « (consolidation 25/11, audit phase 3) » de `docs/specs/entrainement/moteur-verification.md`, `docs/specs/design/parcours-et-ecrans.md`, `docs/specs/design/taches-design.md` et `docs/specs/niveaux-de-detail.md`. Règles à joindre : `CLAUDE.md`, R-1 à R-9 ; pour AUD3-01 et AUD3-02, les « Règles communes » de `taches-entrainement.md` (fonctions pures, imports en `.ts`, aucune dépendance nouvelle, tests Vitest à côté du fichier, rien dans `src/donnees/bibliotheque/`) ; pour AUD3-03 à AUD3-05, la section 0 de `taches-design.md` (variables de `src/index.css` seulement, boutons de 48 px au moins, focus visible, une seule action en résine par écran). Pour toutes : avertir sans bloquer ; aucun avertissement du moteur n'est retiré, masqué ou décompté ; `cleAvertissement` ne change pas (les choix déjà gardés par Arthur doivent tenir).

### AUD3-01 (texte complet)

**AUD3-01 · Moteur : séance liée de W-01, prérequis non renseignés de S-03, S-01 d'un exercice principal** — phase 3, vague 3.12, Sonnet.
- **Objectif** : trois corrections du moteur, toutes sur la forme de sa sortie (B.3), sans nouvelle vérification.
  1. **M-2** : W-01 dit par identifiant quelle séance d'avant il cite (`seanceLieeId`), au lieu que l'écran la cherche par le nom écrit dans le message. Aujourd'hui, le repère « Cette séance est citée par l'avertissement de la séance qui la suit » se pose sur la mauvaise séance avec deux séances homonymes (cas courant : le générateur donne le même nom chaque semaine), ou nulle part avec un nom qui contient « » ou ( ), ou sur une vieille séance du plan quand la séance d'avant a été faite hors plan.
  2. **M-3, partie moteur** : S-03 dit quels prérequis demandés le profil laisse vides (`nonRenseignes`), pour qu'AUD3-04 écrive une seule ligne « Ton profil ne dit pas encore : … ».
  3. **M-12, troisième point** : S-01 sur l'exercice principal d'une partie a son propre message, écrit par le moteur ; l'écran ne le réécrira plus (AUD3-05).
- **Dépend de** : la tâche Haiku en cours M-4, M-5, M-11 (elle modifie `verifSemaineQuotas.ts`). AUD3-04 et AUD3-05 dépendent d'AUD3-01.
- **Lire** : `docs/audits/audit-phase-3.md` (M-2, M-3, M-12) et `docs/audits/preuves-phase-3/w01lien.mjs.txt` (les trois cas qui trompent l'écran) ; `moteur-verification.md` : encadré « consolidation 25/11, audit phase 3 » en tête, B.1 (`SeanceVerif.horsPlan`), B.3 (champs `seanceLieeId`, `nonRenseignes`, type `PrerequisNonRenseigne`, paragraphe « Champs pour l'écran »), B.5 (lignes S-01 et S-03, paragraphe « Principaux hors étapes »), B.6 (W-01), B.11 (cas 2, 3, 5, 19 variante d, 20) ; `src/regles/types.ts`, `index.ts`, `verifSemaineQuotas.ts`, `passerelles.ts` (`realiseeVersVerif`, `planVersVerif`, `cleAvertissement`), `verifSeanceProfil.ts`, `integration.test.ts` ; `src/ecrans/bureau/avertissementsPlan.ts` et son test.
- **Fichiers** : modifier `src/regles/types.ts`, `src/regles/index.ts` (une ligne), `verifSemaineQuotas.ts`, `verifSemaineQuotas.test.ts`, `passerelles.ts`, `passerelles.test.ts`, `verifSeanceProfil.ts`, `verifSeanceProfil.test.ts`, `integration.test.ts`, `src/ecrans/bureau/avertissementsPlan.ts`, `src/ecrans/bureau/avertissementsPlan.test.ts`. Rien d'autre (AUD3-02 tourne en même temps sur `reglesParDefaut.ts`, `verifSeanceDeroule.ts`, `verifPlan.ts`).
- **Étapes**
  1. `types.ts` : `SeanceVerif.horsPlan?: true`, après `realisee`, avec le commentaire de B.1 ; `export type PrerequisNonRenseigne = 'tractionsStrictesMax' | 'test15sSur25mm' | 'niveauBloc' | 'adulte'` ; dans `Avertissement`, après `sujet` et avant `source`, `seanceLieeId?: string` et `nonRenseignes?: PrerequisNonRenseigne[]`, avec les commentaires de B.3 (« ni dans la cible, ni dans `cleAvertissement` »). `index.ts` : ajouter `PrerequisNonRenseigne` à la liste `export type { … } from './types.ts'` ; aucune autre ligne.
  2. `passerelles.ts` : `realiseeVersVerif` pose `horsPlan: true` (elle ne sert qu'aux séances réalisées sans séance planifiée dans ce plan) ; `seanceVersVerif` ne le pose jamais. `cleAvertissement` ne change pas ; ajouter au-dessus le commentaire « `seanceLieeId` et `nonRenseignes` n'entrent pas dans la clé : les choix déjà gardés tiennent (B.3). »
  3. `verifSemaineQuotas.ts`, `verifierEspacement` : l'alerte W-01 reçoit `seanceLieeId: a.id`, sauf si `a.horsPlan` (B.6). Le message ne change pas. Commentaire d'une ligne.
  4. `verifSeanceProfil.ts` :
     - `export function prerequisNonRenseignes(prerequis: Prerequis, profil: ProfilVerif): PrerequisNonRenseigne[]`, juste après `manquesPrerequis`, selon B.5 (S-03) : `tractionsStrictesMax` si `tractionsStrictesMin` est demandé et `profil.tractionsStrictesMax === null` ; `test15sSur25mm` si `prerequis.test15sSur25mm` et `profil.test15sSur25mm === null` ; `niveauBloc` si `niveauBlocMin` est demandé et `profil.niveauBloc === null` ; `adulte` si `prerequis.adulte` et `profil.adulte === null` ; dans cet ordre. Une valeur `false` ou trop basse n'y est pas (elle est renseignée).
     - S-03 : ajouter `nonRenseignes` à l'alerte quand cette liste n'est pas vide. Message inchangé.
     - S-01 : une seule fonction qui écrit le message, avec deux formes (B.5) : étape réelle, message actuel ; **exercice principal d'une partie** — principal hors étapes (alerte de portée séance) ou étape d'une version `etapesDetaillees === false` (étape résumée, portée étape) — « Cet exercice n'existe pas dans ta bibliothèque ({ficheId}). Choisis un autre exercice principal pour la partie qui le cite. » Cible, niveau et source inchangés.
  5. `src/ecrans/bureau/avertissementsPlan.ts` : dans `ranger`, la séance liée est `a.seanceLieeId` s'il désigne une séance de `seances`, sinon rien. Supprimer `seanceDAvantPourW01` et son commentaire. Commentaire de `EntreeAvertissement.seanceLieeId` : « Pour W-01 : l'autre séance de la paire, celle d'avant, donnée par le moteur (B.3). » Le reste du fichier ne change pas (AUD3-04 y ajoutera ses fonctions).
  6. En-têtes de `verifSemaineQuotas.ts` et `verifSeanceProfil.ts` : une ligne « (consolidation 25/11) … » sur ce qui a changé.
- **Tests**
  - `verifSemaineQuotas.test.ts` : W-01 entre deux séances prévues → `seanceLieeId` = identifiant de la première ; la première est réalisée hors plan (`horsPlan: true`) → W-01 **sans** `seanceLieeId` ; la première est prévue et faite (`realisee` présent, sans `horsPlan`) → `seanceLieeId` présent ; une séance légère homonyme de la première, le jour de la seconde → `seanceLieeId` inchangé ; message identique au test existant.
  - `passerelles.test.ts` : `realiseeVersVerif(r).horsPlan === true` ; par `planVersVerif`, une séance réalisée qui cite une séance planifiée de ce plan → une seule vue, sans `horsPlan` ; une séance réalisée sans séance planifiée → `horsPlan: true` ; `cleAvertissement` identique avec ou sans `seanceLieeId` et `nonRenseignes`.
  - `verifSeanceProfil.test.ts` : `prerequisNonRenseignes`, un cas par champ, et `false` → absent ; cas 5 de B.11 → S-03 avec `nonRenseignes: ['tractionsStrictesMax']`, et sa variante à 5 tractions → sans `nonRenseignes` ; profil `PROFIL_DE_REFERENCE` modifié avec `adulte: null` et une fiche qui demande `adulte` → `['adulte']` ; S-01 sur une étape réelle → message actuel (test existant, sans retouche) ; principal hors étapes inconnu → nouveau message, même cible qu'avant ; séance sans étapes dont une partie a un principal inconnu (`etapesDetaillees: false`) → S-01 de portée étape, nouveau message.
  - `integration.test.ts` : cas 20 de B.11 et ses variantes (a) à (c), par `verifierPlan` ; cas 19, variante (d), les deux formes ; cas 2 et 3 : `seanceLieeId`.
  - `avertissementsPlan.test.ts` : les trois cas de `w01lien.mjs.txt`, refaits par `calculerAvertissements` puis `ranger` : homonyme le jour de la seconde séance → lien vers la bonne séance ; nom « Bloc « dur » (salle) » → lien vers la bonne séance ; séance d'avant faite hors plan (une `SeanceRealisee` sans `seancePlanifieeId`, marqueurs `['maximale']`) et une vieille séance planifiée du même nom → aucun lien. Le test existant « vise la séance du mardi et lie celle du lundi » passe sans retouche.
- **Critères** : seul le message de S-01 sur un exercice principal de partie change ; codes, niveaux, cibles, tri et dédoublonnage inchangés ; `cleAvertissement` inchangée ; `grep -rn "seanceDAvantPourW01" src` ne trouve rien ; `horsPlan`, `seanceLieeId` et `nonRenseignes` ne sont écrits dans aucun document (R-8) ; les tests déjà livrés passent sans retouche ; `npm run build` et `npm run test` passent ; ligne « AUD3-01 » au tableau « État » du README, en dernier (R-7).

### AUD3-02 (texte complet)

**AUD3-02 · Messages sans identifiant technique : S-21, P-11 et P-01** — phase 3, vague 3.12, Haiku.
- **Objectif** : (1) **M-6** : plus d'identifiant brut dans un message. Aujourd'hui S-21 affiche « (bloc_limite, dureté) » et P-11 « (poutre_intensive) ». (2) **M-7** : P-01 dit « 3 phases de 4 », pas « 3 blocs de 4 » (R-2 : « bloc » ne désigne plus qu'un bloc d'escalade).
- **Dépend de** : — (aucun fichier commun avec les tâches en cours, ni avec AUD3-01 et AUD3-03).
- **Lire** : `moteur-verification.md` B.2 (ligne `NOMS_MARQUEURS`), B.5 (ligne S-21), B.7 (lignes P-01 et P-11) ; `src/regles/reglesParDefaut.ts` (`NOMS_QUALITES`, `MARQUEURS_QUOTA`), `verifSeanceDeroule.ts` (`verifIntensiteSoloGroupe`, `marqueursQuota`), `verifPlan.ts` (P-01, P-11).
- **Fichiers** : modifier `src/regles/reglesParDefaut.ts`, `reglesParDefaut.test.ts`, `verifSeanceDeroule.ts`, `verifSeanceDeroule.test.ts`, `verifPlan.ts`, `verifPlan.test.ts`.
- **Étapes**
  1. `reglesParDefaut.ts`, juste après `NOMS_QUALITES` : `export const NOMS_MARQUEURS: Record<Marqueur, string>`, valeurs de B.2 mot pour mot : `maximale` « effort maximal », `poutre_intensive` « poutre intensive », `bloc_limite` « bloc limite », `pan_gullich` « pan sans pieds », `poutre` « poutre », `arque` « arqué », `bidoigts` « bidoigts », `trou` « trous », `pan` « pan pieds posés », `resistance_voie` « résistance en voie ». Commentaire : « Un message n'affiche jamais l'identifiant brut d'un marqueur (B.2, consolidation 25/11). »
  2. `verifSeanceDeroule.ts`, S-21 : `{différence}` selon B.5. Parcourir `MARQUEURS_QUOTA` dans son ordre ; pour un marqueur présent dans la version solo seulement : « {nom} en solo seulement » ; dans la version groupe seulement : « {nom} en groupe seulement » ; puis, si les duretés diffèrent : « solo {dure | légère}, groupe {dure | légère} » ; morceaux joints par « ; ». Le cadre du message ne change pas. Exemple : « Les versions solo et groupe de « Doigts et bloc » n'ont pas la même intensité (effort maximal en groupe seulement ; solo légère, groupe dure). Aligne-les pour que la semaine reste équilibrée quel que soit ton choix. »
  3. `verifPlan.ts` : P-11 écrit `NOMS_MARQUEURS[commun]` au lieu de `commun` ; P-01 : « Ton cycle s'écarte du format 12 semaines en 3 phases de 4. C'est possible, mais les repères de l'app sont faits pour ce format. »
- **Tests**
  - `reglesParDefaut.test.ts` : chaque marqueur de `MARQUEURS_QUOTA` et de `MARQUEURS_RISQUE_DOULEUR` a un libellé non vide ; aucun libellé ne contient « _ » ; `NOMS_MARQUEURS.poutre_intensive === 'poutre intensive'`.
  - `verifSeanceDeroule.test.ts` : les deux tests S-21 existants changent leur attente de message, et seulement elle (seule retouche admise) : « (bloc limite en solo seulement) » au lieu de « bloc_limite », et « (solo {…}, groupe {…}) » selon les duretés du test au lieu de « (dureté) » ; en plus : un marqueur en groupe seulement et des duretés différentes → message exact de l'exemple de l'étape 2 (nom de séance du test) ; deux marqueurs d'un même côté → dans l'ordre de `MARQUEURS_QUOTA` ; aucun message S-21 ne contient « _ ».
  - `verifPlan.test.ts` : P-01, message exact ; P-11 sur deux objectifs qui partagent `poutre_intensive` → « (poutre intensive) » ; le test existant « (poutre) » passe sans retouche.
- **Critères** : seuls les messages de S-21, de P-11 (quand le libellé diffère de l'identifiant) et de P-01 changent ; codes, niveaux, cibles et `sujet` inchangés ; `grep -rn "blocs de 4" src` ne trouve rien ; `npm run build` et `npm run test` passent ; ligne « AUD3-02 » au tableau « État » du README, en dernier (R-7).

### AUD3-03 (texte complet)

**AUD3-03 · Exercice personnel : « Bidoigts ? » séparé** — phase 3, vague 3.12, Sonnet.
- **Objectif** : **M-12, deuxième point** (amendement 3 de D-13). La question « Arqué, bidoigts ou trous ? » donne les trois marqueurs ensemble : un exercice personnel « arqué, effort maximal » reçoit aussi `bidoigts` et déclenche S-18 fort (« Retire le lest… des bidoigts ») à tort. Elle devient deux questions ; « Je ne sais pas » reste prudent pour chacune.
- **Dépend de** : — (aucun fichier commun avec les tâches en cours, ni avec AUD3-01 et AUD3-02).
- **Lire** : backlog, D-13, amendements 1 et 3 ; `parcours-et-ecrans.md` O-08 (consolidé 25/11) ; `moteur-verification.md` B.5 (S-18) ; `src/donnees/exercicePerso.ts`, `exercicePerso.test.ts`, `src/ecrans/bureau/ExercicePerso.tsx`.
- **Fichiers** : modifier `src/donnees/exercicePerso.ts`, `src/donnees/exercicePerso.test.ts`, `src/ecrans/bureau/ExercicePerso.tsx`.
- **Étapes**
  1. `exercicePerso.ts`, `ReponsesSecurite` : `prises` devient `arqueOuTrous` (commentaire « « Arqué ou trous ? » ») ; ajouter `bidoigts: Reponse` juste après (commentaire « « Bidoigts ? » (séparée le 25/11 : S-18 à tort sur un arqué maximal) »). `REPONSES_PRUDENTES` : les deux à `'je_ne_sais_pas'`. Ces réponses ne sont pas enregistrées : seuls les marqueurs le sont, rien à reprendre dans la base.
  2. `marqueursDepuisReponses` : `arqueOuTrous` (oui ou je ne sais pas) → `arque`, `trou` ; `bidoigts` (oui ou je ne sais pas) → `bidoigts`. Ordre des marqueurs rendus : `maximale`, `poutre`, `poutre_intensive`, `bloc_limite`, `arque`, `trou`, `bidoigts`, `pan_gullich`.
  3. `ExercicePerso.tsx`, `QUESTIONS`, dans cet ordre : « Effort maximal des doigts ? », « Sur poutre ? », « Bloc à ta limite ? », « Arqué ou trous ? », « Bidoigts ? », « Sans pieds au pan ? ». L'aide « Je ne sais pas compte comme oui, par prudence… » ne change pas ; mêmes choix Oui / Non / Je ne sais pas, même mise en forme.
  4. Les exercices déjà créés gardent leurs marqueurs (réponses de l'utilisateur) : aucune migration, aucun recalcul.
- **Tests** (`exercicePerso.test.ts`) : « Arqué ou trous ? » oui, le reste non → `['arque', 'trou']`, sans `bidoigts` ; « Bidoigts ? » oui, le reste non → `['bidoigts']` ; « Bidoigts ? » je ne sais pas, le reste non → `['bidoigts']` (prudence) ; tout « Je ne sais pas » = tout « Oui » (test existant, clés mises à jour), même ensemble trié qu'avant ; le cas de l'audit : effort maximal oui, arqué ou trous oui, bidoigts non → marqueurs sans `bidoigts`, et par `ficheDepuisExercicePerso` puis `verifierSeance` (C-01, E-09) aucun S-18 ; même exercice avec bidoigts « Je ne sais pas » → S-18 fort.
- **Critères** : six questions dans l'ordre de l'étape 3 ; « Je ne sais pas » est la réponse de départ de chacune ; un exercice arqué à effort maximal sans bidoigts n'a plus de S-18 ; `grep -rn "Arqué, bidoigts ou trous" src` ne trouve rien ; boutons de 48 px, focus visible ; `npm run build` et `npm run test` passent ; ligne « AUD3-03 » au tableau « État » du README, en dernier (R-7).

### AUD3-04 (texte complet)

**AUD3-04 · Profil non renseigné et S-03 regroupés** — phase 3, vague 3.12, Sonnet.
- **Objectif** : **M-3**. Avec un profil peu rempli, une fiche exigeante donne un S-03 fort dans chaque séance qui la contient (24 S-03 sur 40 avertissements dans l'exemple de l'audit) : le message utile, « complète ton profil », se noie. Deux règles d'affichage (`parcours-et-ecrans.md` § 4, consolidé 25/11) : une ligne « Ton profil ne dit pas encore : … » avec un lien vers Profil ; les S-03 identiques regroupés en une ligne dans les listes de la semaine. **Rien n'est retiré du moteur** : chaque S-03 reste compté et visible sur son étape, dans la fiche de séance.
- **Dépend de** : AUD3-01 (`Avertissement.nonRenseignes`, type `PrerequisNonRenseigne`, `avertissementsPlan.ts`) ; la tâche Sonnet en cours M-1, M-10, M-12 (elle modifie `TableauDeBord.tsx`, `VueCycle.tsx`, `Plan.tsx` et sans doute `VueSemaine.tsx` : partir de sa version fusionnée, garder ses changements, en particulier les signaux d'arrêt d'abord et hors limite dans le tableau de bord).
- **Lire** : `parcours-et-ecrans.md` § 4 (paragraphe « Profil non renseigné et S-03 répétés »), § 5, O-02, O-03, O-05 ; `moteur-verification.md` B.3 (`nonRenseignes`) ; `src/ecrans/bureau/avertissementsPlan.ts`, `VueSemaine.tsx` (section « semaine-avertissements »), `VueCycle.tsx` (`ResumeAvertissements`), `TableauDeBord.tsx` (« Avertissements ouverts »), `Plan.tsx` (prop `onOuvrirProfil`), `src/miseEnPage/MiseEnPageBureau.tsx`, `src/composants/Avertissement.tsx`.
- **Fichiers** : modifier `src/ecrans/bureau/avertissementsPlan.ts`, `avertissementsPlan.test.ts`, `VueSemaine.tsx`, `VueCycle.tsx`, `TableauDeBord.tsx`, `Plan.tsx`, `src/miseEnPage/MiseEnPageBureau.tsx`. **Pas** `src/index.css` : classes existantes (`.avertissement-resume`, `.bouton-texte.bouton-en-ligne`, composant `Avertissement`).
- **Étapes**
  1. `avertissementsPlan.ts`, fonctions pures (section « Profil et regroupement ») :
     - `LIBELLES_NON_RENSEIGNES: Record<PrerequisNonRenseigne, string>` : `tractionsStrictesMax` « combien de tractions strictes tu fais » ; `test15sSur25mm` « si tu tiens 15 s sur une réglette de 25 mm » ; `niveauBloc` « ton niveau en bloc » ; `adulte` « si tu as 18 ans ou plus » ;
     - `enumerer(mots: readonly string[]): string` : « a », « a et b », « a, b et c » ;
     - `nonRenseignesDe(entrees: readonly EntreeAvertissement[]): PrerequisNonRenseigne[]` : réunion des `nonRenseignes` des entrées de code S-03, gardées comprises, sans doublon, dans l'ordre `tractionsStrictesMax`, `test15sSur25mm`, `niveauBloc`, `adulte` ;
     - `phraseProfilIncomplet(champs): string` : « Ton profil ne dit pas encore : {enumerer(libellés)}. » ;
     - `type LigneAvertissement = { type: 'seule'; entree: EntreeAvertissement } | { type: 'groupe'; entrees: EntreeAvertissement[]; seanceIds: string[] }` et `regrouperS03(entrees, seances: readonly SeancePlanifiee[]): LigneAvertissement[]` : les entrées S-03 de message identique qui visent au moins deux séances distinctes forment un groupe, à la place de la première ; `seanceIds` = séances distinctes, dans l'ordre de leur date ; tout le reste, y compris les S-03 d'une seule séance, reste en `'seule'`, dans l'ordre reçu ;
     - `nomDuJour(date: DateISO): string` : « mardi » (jour seul, en minuscules).
  2. `VueSemaine.tsx`, section des avertissements de la semaine : sous le titre (le compte `phraseCompte(compter(deLaSemaine))` ne change pas), si `nonRenseignesDe(deLaSemaine)` n'est pas vide, `<Avertissement niveau="information" titre={phraseProfilIncomplet(…)}>` avec la suite « Ce qui n'est pas renseigné compte comme non rempli, par prudence. » et, si `onOuvrirProfil` est fourni, le bouton texte « Compléter mon profil » (`bouton-texte bouton-en-ligne`). Puis la liste, rendue depuis `regrouperS03(deLaSemaine, seances)` : une ligne `'seule'` comme aujourd'hui ; une ligne `'groupe'` = `<p className="avertissement-resume">` (avec `garde` si tous les S-03 du groupe sont gardés), icône avertissement, `<strong>Dans {n} séances</strong> ({enumerer(jours)}) : {titre}`, « (gardé) » si tous sont gardés, et le bouton « Voir la séance » vers la première séance du groupe ; clé React = `cle` de la première entrée.
  3. `VueCycle.tsx`, `ResumeAvertissements` : sous la ligne du compte, la même ligne d'information, calculée sur toutes les entrées du plan. Pas de regroupement ici (la vue n'a pas de liste de séances). Repères et comptes inchangés.
  4. `TableauDeBord.tsx`, « Avertissements ouverts » : sous la phrase du compte, la même ligne d'information, calculée sur les avertissements de la semaine affichée. Dans la liste (signaux d'arrêt d'abord et hors limite, comme l'a fait M-1), les S-03 passent par `regrouperS03` : un groupe = une rubalise `<Avertissement niveau="avertissement" titre={titre}>Dans {n} séances ({jours}).</Avertissement>`, qui compte pour **une** ligne dans la limite ; la phrase « et {k} autre(s), à voir dans le Plan » compte les avertissements du moteur non montrés (un groupe montré montre tous ses S-03).
  5. Props : `onOuvrirProfil?: () => void` sur `VueSemaine`, `VueCycle` et `TableauDeBord` ; `Plan` passe le sien aux deux vues ; `MiseEnPageBureau` passe `() => onChoisirRubrique('Profil')` au tableau de bord. Sans la prop, pas de bouton, le texte reste.
  6. Rien d'autre : la fiche de séance ne change pas (chaque S-03 sur son étape, avec « Je garde ce choix ») ; aucune clé, aucun compte, aucun repère ne change ; les signaux d'arrêt ne sont jamais regroupés ni repliés.
- **Tests** (`avertissementsPlan.test.ts`)
  - `phraseProfilIncomplet(['tractionsStrictesMax'])` → « Ton profil ne dit pas encore : combien de tractions strictes tu fais. » ; `(['tractionsStrictesMax', 'adulte'])` → « Ton profil ne dit pas encore : combien de tractions strictes tu fais et si tu as 18 ans ou plus. » ; les quatre → « Ton profil ne dit pas encore : combien de tractions strictes tu fais, si tu tiens 15 s sur une réglette de 25 mm, ton niveau en bloc et si tu as 18 ans ou plus. »
  - `nonRenseignesDe` : un S-03 `['adulte']` puis un S-03 `['tractionsStrictesMax', 'adulte']` → `['tractionsStrictesMax', 'adulte']` ; un S-03 gardé compte ; les autres codes sont ignorés ; aucun → `[]`.
  - `regrouperS03`, par `calculerAvertissements` avec `PROFIL_VIDE` et ST-TRA-02 (`seanceDepuisType`) mardi, jeudi et samedi d'une même semaine : les S-03 de même message forment un groupe de 3 séances dans l'ordre des dates ; `compter` de la semaine est le même avant et après regroupement ; une même fiche à deux étapes d'une seule séance → pas de groupe ; deux messages différents → deux lignes ; un S-04 n'est jamais regroupé ; l'ordre des lignes `'seule'` est celui reçu.
  - `nomDuJour('2026-11-24')` → « mardi » ; `enumerer` à 1, 2 et 3 mots.
- **Critères** : à 1280 × 800, avec `PROFIL_VIDE`, un cycle commencé vide et la séance type ST-TRA-02 ajoutée mardi, jeudi et samedi de la semaine en cours : une ligne « Ton profil ne dit pas encore : combien de tractions strictes tu fais et si tu as 18 ans ou plus. » (ou plus de libellés selon les fiches) en tête de la vue 12 semaines, de la liste de la semaine et des avertissements ouverts du tableau de bord ; « Compléter mon profil » ouvre Profil ; la liste de la semaine montre une ligne « Dans 3 séances (mardi, jeudi et samedi) : … » par fiche répétée, au lieu de trois ; les comptes (« n avertissements dont … ») sont identiques à ceux d'avant la tâche ; après avoir rempli tractions et âge dans le profil, la ligne disparaît ; une seule action en résine par écran ; `npm run build` et `npm run test` passent ; ligne « AUD3-04 » au tableau « État » du README, en dernier (R-7).

### AUD3-05 (texte complet)

**AUD3-05 · Fiche de séance : « Réglage estimé » et messages du moteur tels quels** — phase 3, vague 3.12, Haiku.
- **Objectif** : (1) **M-8** : l'étiquette « À VÉRIFIER » d'une étape lit le champ `aVerifier` (réglage que la source ne confirme pas), pas `exclureDeLaGeneration` (fiche écartée) : sur un plan proposé, Arthur peut croire que le générateur a placé des fiches à vérifier. Elle devient « RÉGLAGE ESTIMÉ » ; dans la fiche protocole, la rubalise ambre « À vérifier » devient une section « Réglage estimé » (vocabulaire : O-07 consolidé). (2) **M-12, troisième point, côté écran** : la fiche n'écrit plus par-dessus le message de S-01 (le moteur l'écrit depuis AUD3-01). (3) Trouvé en spécifiant M-12 : pour une séance **sans étapes**, la ligne au-dessus d'un avertissement d'étape cachée dit « Étape « inconnue » » ; elle doit nommer la partie.
- **Dépend de** : AUD3-01 (sans elle, retirer la réécriture ferait réapparaître « supprime l'étape ») ; la tâche Sonnet en cours M-1, M-10, M-12 (elle modifie `FicheSeance.tsx` : partir de sa version fusionnée).
- **Lire** : `parcours-et-ecrans.md` O-05 et O-07 (consolidés 25/11, avec le « Vocabulaire ») ; `niveaux-de-detail.md` § 3.1, § 3.4 (« Exercice principal inconnu ») et § 4.1 ; `moteur-verification.md` B.5 (S-01) ; `src/composants/FicheSeance.tsx` (`AvertissementDuMoteur`, `ListeEtapes`, bloc « Avertissements de la séance ») ; `src/composants/EditeurResume.outils.ts` ; `src/ecrans/bureau/FicheDetail.tsx` ; `src/regles/passerelles.ts` (`soloVersVerif` : une étape résumée par partie qui a un exercice principal, dans l'ordre).
- **Fichiers** : modifier `src/composants/FicheSeance.tsx`, `src/composants/EditeurResume.outils.ts`, `src/composants/EditeurResume.outils.test.ts`, `src/ecrans/bureau/FicheDetail.tsx`.
- **Étapes**
  1. `FicheSeance.tsx`, étiquettes d'une étape : « À vérifier » devient « Réglage estimé » (même classe `etiquette contour`), avec `title={entree.aVerifier}`.
  2. `FicheSeance.tsx`, `AvertissementDuMoteur` : retirer la réécriture du message de S-01 et son commentaire ; le message affiché est `entree.avertissement.message`, tel quel.
  3. `EditeurResume.outils.ts` : `export function nomCibleCachee(seance: SeancePlanifiee, etapeIndex: number): string` : si la version solo a des étapes réelles, « Étape « {titre de l'étape} » » ; sinon (étapes résumées), « Partie « {titre} » », la partie étant la `etapeIndex`-ième de `(seance.solo.parties ?? []).filter((p) => p.principal)` ; introuvable : « Étape « inconnue » ». `FicheSeance.tsx` l'emploie partout où elle écrit le nom d'une étape cachée au-dessus d'un avertissement (bloc `surEtapeCachee`, et le bloc ajouté par M-1 pour l'onglet GROUPE s'il écrit aussi ce nom).
  4. `FicheDetail.tsx` : la rubalise `<Avertissement niveau="avertissement" titre="À vérifier">` devient une section comme « Pour progresser » (`fiche-detail-section`, titre `h3.surtitre` « Réglage estimé », texte `entree.aVerifier`), placée juste avant « Source ». L'import d'`Avertissement` reste (signal d'arrêt des contre-indications).
  5. « à vérifier » ne reste que pour les fiches écartées : message S-02 du moteur (inchangé) et étiquette « À la main seulement » (inchangée).
- **Tests** (`EditeurResume.outils.test.ts`) : `nomCibleCachee` sur une séance avec étapes → « Étape « … » » ; sur une séance sans étapes dont les parties sont « Échauffement » (sans principal) puis « Effort principal » (avec principal), `etapeIndex` 0 → « Partie « Effort principal » » ; index hors liste → « Étape « inconnue » ».
- **Critères** : `grep -rn "À vérifier" src --include=*.tsx` ne trouve rien ; `grep -n "Remplace l'exercice principal de cette partie" src/composants/FicheSeance.tsx` ne trouve rien ; sur un plan proposé (O-13, « Proposer un plan »), aucune étape n'affiche « À VÉRIFIER », les étapes concernées affichent « RÉGLAGE ESTIMÉ » ; la fiche protocole d'une fiche qui a `aVerifier` montre la section « Réglage estimé » sans ambre ; une séance simple sans étapes dont le principal est un exercice personnel supprimé montre « Partie « Séance » » puis le message de S-01 du moteur, tel quel ; `npm run build` et `npm run test` passent ; ligne « AUD3-05 » au tableau « État » du README, en dernier (R-7).

---

# Tâche ajoutée le 26/11 (texte complet)

Écart signalé à la livraison de D-22 et retenu au cadrage de la phase 4. Règles à joindre : `CLAUDE.md`, R-1 à R-9, la section 0 de `taches-design.md` (variables de `src/index.css` seulement, boutons de 48 px au moins et 64 px pour les actions de séance, focus visible, une seule action en résine par écran). Avertir sans bloquer ; « Stop, ça fait mal » toujours visible.

### D-28 (texte complet)

**D-28 · Mini-bloc de la séance en groupe sur téléphone** — phase 4, vague 4.3, Sonnet.
- **Objectif** : une version groupe peut porter un **mini-bloc** solo, joué avant ou après le groupe (`VersionGroupe.miniBloc`, architecture § 3.2 ; 11 des 26 séances types en ont un (toutes les séances de doigts, de traction et de puissance, et ST-RES-04), par exemple l'échauffement à la poutre et la réglette minimale de López avant ST-DOI-02 en groupe). D-22 lance la version groupe sans lui (`lancementDepuisPlan` passe la version à `SeanceGroupe`, qui ne lit que `nom`, `reposConseilleS` et `objectifs`) : le grimpeur ne voit jamais cette partie du plan, alors que le moteur la compte (marqueurs, S-04, 48 h). Le téléphone la fait jouer comme une séance guidée, avant ou après la notation des blocs.
- **Dépend de** : D-22 ; D-27 (elle modifie `lancement.ts`, `App.tsx` et `SeanceSolo.tsx` : partir de sa version fusionnée).
- **Lire** : `parcours-et-ecrans.md` T-08 et T-09 (consolidé 26/11) ; `src/ecrans/lancement.ts` et son test, `src/App.tsx` (vues de séance, `lancer`), `src/ecrans/SeanceSolo.tsx`, `src/ecrans/SeanceGroupe.tsx` (lecture seule), `src/moteur/seanceSolo.ts`, `src/donnees/modele.ts` (`VersionGroupe`).
- **Fichiers** : modifier `src/ecrans/lancement.ts`, `src/ecrans/lancement.test.ts`, `src/App.tsx`, `src/ecrans/SeanceSolo.tsx`. Pas `SeanceGroupe.tsx`, pas `index.css`.
- **Étapes**
  1. `lancement.ts` : le lancement `groupe` gagne `miniBloc?: { moment: 'avant' | 'apres'; seance: SeanceGuidee }`, rempli par `lancementDepuisPlan` quand `planifiee.groupe.miniBloc` a au moins une étape (`seance` = `{ nom: '{nom de la séance} · avant le groupe' | '… · après le groupe', etapes }`). `brouillonGroupe(l, blocs, dureeMin, salleId?, statutsMiniBloc?: StatutEtape[])` : avec un mini-bloc, `etapes` = ses étapes (`titre`, statut donné ou `a_faire`, `refId` = `origine.refId`) ; sans, `[]` comme aujourd'hui. Les marqueurs du lien ne changent pas (toute la version groupe, par prudence).
  2. `SeanceSolo.tsx` : prop facultative `libelleTerminer?: string` (défaut « Terminer la séance »), employée par les deux boutons « Terminer la séance ». Rien d'autre ne change.
  3. `App.tsx` : nouvelle vue `{ nom: 'mini_bloc'; lancement; temps: 'avant' | 'apres'; blocs?: BlocGrimpe[]; minutesGroupe?: number }` ; la vue `seance_groupe` garde le résultat du mini-bloc d'avant (`{ statuts; minutes }`).
     - **Avant** : lancer → `SeanceSolo` du mini-bloc, `libelleTerminer` « Passer au groupe » ; à la fin → `SeanceGroupe` ; à la fin du groupe → Trois questions avec `brouillonGroupe(…, minutes des deux, …, statuts du mini-bloc)`.
     - **Après** : `SeanceGroupe` d'abord ; à la fin → `SeanceSolo` du mini-bloc, « Terminer la séance » ; puis Trois questions, même brouillon.
     - « Stop, ça fait mal » puis « Terminer et enregistrer », dans l'un ou l'autre écran → Trois questions tout de suite, douleur pré-cochée, avec ce qui a été fait (les étapes du mini-bloc non jouées restent `a_faire`, les blocs non notés n'existent pas). « Quitter » : la même confirmation qu'aujourd'hui (rien n'est enregistré).
     - On peut passer tout le mini-bloc (« Passer l'étape », ou « Passer au groupe » tout de suite) : il reste `a_faire` dans le débrief, rien n'est bloqué.
     - Le rappel de sécurité du bloc (D-27) reste sur l'écran du groupe, et sur le mini-bloc seulement si ses étapes ont `bloc_limite` (même règle : marqueurs du lien).
- **Tests** (`lancement.test.ts`) : ST-DOI-02 par `seanceDepuisType`, mode groupe → `miniBloc.moment` `'avant'`, ses deux étapes (`echauffement-doigts-poutre`, `doigts-reglette-minimale-lopez`), et le nom « … · avant le groupe » ; ST-TRA-01 (mini-bloc après) → `'apres'` ; une version groupe sans mini-bloc, ou avec un mini-bloc vide → pas de `miniBloc` ; `brouillonGroupe` avec statuts du mini-bloc → étapes dans l'ordre avec `refId`, `dureeMin` donnée ; sans statuts → étapes `a_faire` ; le test groupe existant passe sans retouche.
- **Critères** : sur un vrai téléphone, ST-DOI-02 en groupe montre d'abord l'échauffement à la poutre et la réglette minimale avec leur chrono, puis les objectifs ; le débrief montre « étapes faites » et les blocs ; la séance apparaît « faite » dans Aujourd'hui et sur l'ordinateur ; « Stop, ça fait mal » visible sur les deux écrans ; `npm run build` et `npm run test` passent ; ligne « D-28 » au tableau « État » du README, en dernier (R-7).

---

# Tâches ajoutées le 26/11, décision G2 (texte complet)

Décision G2 d'Arthur (`docs/decisions-phase-1.md`, section G) : la question du profil « Une douleur en ce moment ? » (des zones, sans date) est remplacée par les douleurs déclarées et datées de C-04, seule source pour les règles. Conception : amendements « (consolidation 26/11, décision G2) » de `docs/architecture-v2.md` (§ 3.2, § 3.4, § 3.5, § 4.4), `docs/specs/entrainement/moteur-verification.md` (encadré, B.1, B.2, B.11) et `docs/specs/design/parcours-et-ecrans.md` (T-05, T-06, T-14, O-12, § 5). Règles à joindre : `CLAUDE.md`, R-1 à R-9 ; pour G2-01, la section 0 de `taches-design.md` (variables de `src/index.css` seulement, boutons de 48 px au moins, focus visible, une seule action en résine par écran) ; pour G2-02, les « Règles communes » de `taches-entrainement.md` (fonctions pures, imports en `.ts`, aucune dépendance nouvelle, tests Vitest à côté du fichier). Pour les deux : avertir sans bloquer ; aucun diagnostic ; aucun message, code, niveau ni `cleAvertissement` du moteur ne change ; une douleur n'est jamais perdue.

### G2-01 (texte complet)

**G2-01 · Douleurs : une seule source, reprise des zones du profil** — phase 4, vague 4.3, Sonnet (décision G2).
- **Objectif** : la question « Une douleur en ce moment ? » quitte le profil, sur téléphone et sur ordinateur. Une douleur n'existe plus que comme douleur déclarée et datée (C-04). C'est la seule source des règles (S-04 à S-06, J-05, P-12), du signal d'Aujourd'hui, de la banque du générateur et de la bibliothèque. Au premier lancement, la question reste : chaque zone cochée devient une douleur déclarée du jour. Les zones déjà notées dans un profil sont reprises **une seule fois** en douleurs déclarées, datées prudemment, sans perte, d'où que vienne le profil (base de l'appareil, sauvegarde ancienne, serveur).
- **Dépend de** : C-04 (`src/donnees/douleurs.ts` : `declarerDouleur`, `douleursOuvertes`, `signalDouleur`, `marquerResolue` ; section « Douleurs déclarées » de `Profil.tsx`, amendement 10) ; C-03 (`verifierJourSansSeance`, `src/ecrans/controlesDuJour.test.ts`). En parallèle de D-28 : aucun fichier commun.
- **Lire** : `docs/decisions-phase-1.md` G2 ; `docs/architecture-v2.md` § 3.2 (`Profil`, `DouleurDeclaree`) et § 4.4 (reprise, consolidé 26/11) ; `parcours-et-ecrans.md` T-05, T-06, T-14, O-12 et § 5 (consolidés 26/11, décision G2) ; `moteur-verification.md`, encadré « consolidation 26/11, décision G2 », B.2 (`zonesDouloureuses`), B.8 (J-05) ; `src/donnees/base.ts` (`lireProfil`, et `importerDonnees` pour le modèle de transaction et de signaux), `profil.ts`, `douleurs.ts`, `migration.test.ts` ; `src/ecrans/ProfilFormulaire.tsx`, `Bienvenue.tsx`, `Profil.tsx`, `Aujourdhui.tsx`, `bureau/VueSemaine.tsx` (`lireContexte`) ; `src/regles/passerelles.ts` (`profilVersVerif`).
- **Fichiers** : créer `src/donnees/repriseDouleurs.test.ts` ; modifier `src/donnees/profil.ts`, `src/donnees/base.ts`, `src/donnees/migration.test.ts`, `src/donnees/douleurs.ts`, `src/donnees/douleurs.test.ts`, `src/ecrans/ProfilFormulaire.tsx`, `src/ecrans/Bienvenue.tsx`, `src/ecrans/Profil.tsx`, `src/ecrans/Aujourdhui.tsx`, `src/ecrans/controlesDuJour.test.ts` (un cas), `src/ecrans/bureau/VueSemaine.tsx`, `src/regles/passerelles.ts` (une ligne), `src/regles/generateur.test.ts` (un test). **Pas** `App.tsx` (D-28), `index.css`, `Reglages.tsx` (l'entrée du sommaire vient de C-04), `src/synchro/` (rien à changer : la reprise se fait à la lecture du profil), ni le reste de `src/regles/` (G2-02). Aucune nouvelle version de la base Dexie.
- **Étapes**
  1. **Profil** (`profil.ts`) : retirer `douleursEnCours` de `Profil` et de `PROFIL_VIDE`. `ZoneDouleur` et `ZONES` restent (C-04, premier lancement). Commentaire au-dessus de `Profil` : « (décision G2, 26/11) Plus de zones de douleur dans le profil : une douleur est un document daté (table `douleurs`, C-04). Les zones d'un ancien profil sont reprises par `lireProfil` (base.ts). » `completerProfil` ne change pas : il ignore déjà les champs inconnus, donc l'ancien champ ne sort plus d'un profil lu.
  2. **Reprise** (`base.ts`, section « Reprise des zones de l'ancien profil (décision G2) », juste avant `lireProfil`) :
     - `export const PREFIXE_DOULEUR_REPRISE = 'reprise-profil-'` et `export const estRepriseDuProfil = (d: { id: string }): boolean => d.id.startsWith(PREFIXE_DOULEUR_REPRISE)`, avec le commentaire « Calculé depuis l'identifiant : rien de plus n'est stocké (R-8). »
     - `export function dateDeReprise(profil: { creeLe?: unknown; modifieLe?: unknown }, aujourdhui: DateISO): DateISO` (pure) : le jour local (`jourLocal`) de `creeLe` ; à défaut, celui de `modifieLe`. Une valeur compte si c'est un texte lisible par `Date.parse` et pas avant `2020-01-01T00:00:00.000Z` : avant, c'est le 1970 de repli d'un fichier sans date (`completerImporte`). Si aucune ne compte : 14 jours avant `aujourdhui`. Calcul par la formule d'`ajouterJours` de `plan.ts`, recopiée en une ligne : `base.ts` ne doit pas importer `plan.ts`, qui l'importe. Un jour après `aujourdhui` (horloge fausse) est ramené à `aujourdhui`. Commentaire : « La zone a été cochée entre la création du profil et sa dernière modification, on ne sait pas quand. On prend la date la plus ancienne possible : la douleur ne paraît jamais plus récente qu'elle n'est, et J-05 (« consulte ») ne vient jamais trop tard. »
     - `async function reprendreZonesDuProfil(): Promise<void>` :
       - lit le document brut `reglages/profil` (`base.reglages.get`, sans `completerProfil`) ;
       - ne fait rien s'il manque, s'il est supprimé, ou si `douleursEnCours` n'est pas un tableau non vide. C'est le cas courant : aucune transaction, aucune écriture ;
       - sinon, dans **une** transaction `rw` sur `reglages` et `douleurs` (dans `avecReprise`, comme `importerDonnees`), relit le profil (un autre appel a pu passer avant) puis :
         - `zones` = les valeurs du tableau qui sont des `ZoneDouleur` connues (`ZONES`), sans doublon ; les autres sont ignorées ;
         - pour chaque zone : si **aucun** document `douleurs` d'identifiant `PREFIXE_DOULEUR_REPRISE + zone` n'existe (`base.douleurs.get`, qui voit aussi les supprimés), `put` de `{ id, date: dateDeReprise(profil, jourLocal()), zone, niveau: 'reduction', signes: [], versionFormat: 1, creeLe: maintenant, modifieLe: maintenant, aEnvoyer: 1 }`. Un document existant, même résolu ou supprimé, n'est jamais réécrit : la reprise ne se fait qu'une fois par zone ;
         - `put` du profil **sans** le champ (`const { douleursEnCours: _ancien, ...reste } = brut`), avec `modifieLe: maintenant` et `aEnvoyer: 1` : il doit l'emporter sur l'ancien profil du serveur ;
       - après la transaction, s'il y a eu une écriture : `signalerEcriture()` et `signalerDonneesChangees()`, comme `importerDonnees` (synchronisation, et les écrans relisent les douleurs).
       Pas d'`ecrire` dans la transaction : il appelle `avecReprise`, qui fermerait la base en cas d'erreur.
     - `lireProfil()` appelle d'abord `await reprendreZonesDuProfil()`, puis lit comme aujourd'hui. Commentaire : « Avant de lire : les zones de l'ancienne question « Une douleur en ce moment ? » deviennent des douleurs datées (décision G2). Tout profil passe par ici, d'où qu'il vienne : base de l'appareil, sauvegarde rechargée, profil reçu du serveur. » Un échec de la reprise remonte comme un échec de lecture : l'app affiche son écran d'erreur, plutôt que d'oublier une douleur sans le dire.
     - Pourquoi un identifiant fixe (`reprise-profil-coude`) et pas `crypto.randomUUID()` : le téléphone et l'ordinateur reprennent le même profil chacun de leur côté. Avec le même identifiant, la synchronisation garde une seule douleur au lieu de deux (architecture § 4.4).
  3. **Premier lancement**
     - `ProfilFormulaire.tsx` : prop `premierLancement?: boolean` ; `onValider: (p: Profil, zonesDouleur: ZoneDouleur[]) => void`. La question « Une douleur en ce moment ? » (même place, mêmes boutons `aria-pressed` en `.choix.trois`) n'est affichée **que** si `premierLancement`. Son état est local (`useState<ZoneDouleur[]>([])`), hors du profil ; à l'envoi, `onValider(p, zones)`. Aide (`.texte-3`), mot pour mot : « Ne touche rien si tout va bien. Une zone cochée devient une douleur déclarée aujourd’hui : l’app te prévient quand un exercice la sollicite. Tu la marqueras comme résolue dans Profil. » Sans `premierLancement` (Profil, téléphone et ordinateur), pas de question. Mettre à jour le commentaire d'en-tête du composant.
     - `Bienvenue.tsx` : `<ProfilFormulaire premierLancement … onValider={valider} />`. `valider(p, zones)` : pour chaque zone pas encore notée, `await declarerDouleur({ date: jourLocal(), zone, signes: [] })` (C-04 : niveau `reduction`, sans signe), et la retient dans un `useRef<Set<ZoneDouleur>>`. Ainsi, un second « Continuer » après un échec du profil ne la déclare pas deux fois. Puis `onValider(p)`. Si une déclaration échoue : rien d'autre n'est fait, « Ta douleur n’a pas été enregistrée. Réessaie. » s'affiche dans la ligne d'état existante (classe `message-erreur`), et le formulaire reste rempli. Les props de `Bienvenue` ne changent pas (`App.tsx` inchangé).
  4. **Profil** (`Profil.tsx`, section « Douleurs déclarées » de C-04)
     - Sous le titre, aide `.texte-3`, mot pour mot : « Tant qu’elle n’est pas marquée comme résolue, une douleur déclarée compte dans les avertissements de ton plan et du jour. »
     - Sous la ligne d'une douleur reprise (`estRepriseDuProfil(d)`), `.texte-3` : « Reprise de ton ancien profil, sans date : datée du jour où tu as créé ton profil, par prudence. »
     - Rien d'autre ne change (liste, « Marquer comme résolue », « Déclarer une douleur »).
  5. **Aujourd'hui** : dans `douleurs.ts`, `signalDouleur(ouvertes: DouleurDeclaree[])` perd son paramètre `zonesProfil`. Titres et textes inchangés ; les zones sont celles des douleurs ouvertes en réduction. Dans `Aujourdhui.tsx` : `signalDouleur(douleursOuvertes(donnees.douleurs, aujourdhui))`. Retirer les imports devenus inutiles.
  6. **Ordinateur, vue Semaine** (`VueSemaine.tsx`, `lireContexte`) : `zones` = les zones de `douleursOuvertes(douleurs, aujourdhui)` (C-04), sans doublon ; plus de `verif.douleursEnCours`. Commentaire : « Mêmes zones que le moteur : les douleurs déclarées ouvertes aujourd'hui (décision G2). »
  7. **Passerelle** (`passerelles.ts`, `profilVersVerif`) : `douleursEnCours: []`, avec le commentaire « (décision G2) Le profil n'a plus de zones : toutes les douleurs viennent de `douleurs`. Champ retiré du moteur par G2-02. » `contexteVerif` ne change pas : il lit déjà les douleurs déclarées (`EntreesContexteVerif.douleurs`).
  8. **Tests existants** (seules retouches admises)
     - `generateur.test.ts`, « aucune fiche … contre-indiquée par une douleur (doigts) » : `profil: { ...PROFIL, douleursEnCours: ['doigts'] }` devient `douleurs: [une DouleurDeclaree complète, id 'd-doigts', date '2026-11-24', zone 'doigts', niveau 'reduction', signes []]` ; mêmes attentes.
     - `controlesDuJour.test.ts` (C-03), cas de l'ordre : le profil `douleursEnCours: ['coude']` devient une douleur déclarée `reduction` au coude, datée du jour. Attendu : S-04 puis S-06 (`arret`, dans l'ordre du moteur), puis J-04 (`avertissement`), puis J-01 (`information`). S-06 s'ajoute parce qu'une douleur déclarée de moins de 14 jours compte pour lui, ce qu'une zone du profil ne faisait pas.
     - `douleurs.test.ts` (C-04), `signalDouleur` : le cas « profil doigts et réduction au coude » devient « réductions au coude puis aux doigts » → « Douleur déclarée : doigts, coude. » (ordre de `ZONES`) ; les autres cas, sans le premier argument.
     - `migration.test.ts` :
       - le test du profil garde son attente sur le document brut, lu **avant** `lireProfil` : la montée de version de Dexie ne retire rien ;
       - après `lireProfil()`, le profil n'a plus `douleursEnCours` (`'douleursEnCours' in profil` est faux) et la table `douleurs` contient un seul document, `reprise-profil-coude`, avec `date` = `jourLocal(new Date(PROFIL_ANCIEN.creeLe))`, `niveau: 'reduction'`, `signes: []`, `aEnvoyer: 1` ;
       - « crée les nouvelles tables, vides » : `douleurs` sort de la liste, car elle contient la douleur reprise, déjà vérifiée ;
       - « exporte puis réimporte » : l'export contient la douleur reprise, donc `{ seances: 3, autres: 2, ecartes: 0 }`. Le fichier ancien est accepté comme avant (`{ seances: 1, autres: 1, ecartes: 0 }`). Après un nouveau `lireProfil()`, la table `douleurs` a toujours un seul document : le profil du fichier, plus ancien, n'a pas remplacé celui de l'appareil.
     - Tout autre test fusionné entre-temps qui construit un `Profil` avec `douleursEnCours` : même conversion en douleur déclarée, attentes ajustées et signalées dans le rapport de livraison.
- **Tests** (`repriseDouleurs.test.ts`, `fake-indexeddb`, tables vidées avant chaque cas)
  - Profil brut (`base.reglages.put`) avec `douleursEnCours: ['coude', 'doigts']` et `creeLe: '2026-11-03T10:00:00.000Z'` → après `lireProfil()` : le profil rendu n'a pas `douleursEnCours` ; le document brut non plus, avec `aEnvoyer` 1 et un `modifieLe` plus récent ; la table `douleurs` a `reprise-profil-coude` et `reprise-profil-doigts`, chacune avec `date` = `jourLocal(new Date('2026-11-03T10:00:00.000Z'))`, `niveau: 'reduction'`, `signes: []`, sans `resolueLe`, `aEnvoyer` 1.
  - Un second `lireProfil()` n'écrit rien : les trois documents gardent leur `modifieLe`.
  - `marquerResolue('reprise-profil-coude', '2026-11-26')`, puis le profil brut reçoit de nouveau `douleursEnCours: ['coude']` (comme s'il revenait d'un ancien appareil) → après `lireProfil()`, `reprise-profil-coude` reste résolue et inchangée, aucun document nouveau, le champ est retiré. Même chose si le document existant est supprimé (`supprimeLe`).
  - `douleursEnCours: []` → rien n'est écrit, le profil garde son `modifieLe`. Un profil sans le champ → rien.
  - `['coude', 'pied']` → seulement `reprise-profil-coude` ; le champ est retiré.
  - Sauvegarde ancienne (`version: 1`, un profil avec `douleursEnCours: ['genou']` et un `creeLe`) chargée par `importerDonnees` dans une base vide → `lireProfil()` crée `reprise-profil-genou`, datée du jour de création du profil du fichier.
  - `dateDeReprise` : `creeLe` lisible → son jour local ; `creeLe` `'1970-01-01T00:00:00.000Z'` et `modifieLe` lisible → le jour de `modifieLe` ; aucun des deux → 14 jours avant `aujourdhui` ; `creeLe` après `aujourdhui` → `aujourdhui`.
  - Chaîne avec le moteur : douleur reprise au coude datée de 20 jours avant `aujourdhui` → `contexteVerif` puis `verifierJourSansSeance` donne J-05 fort, « Ta douleur (coude) dure depuis 20 jours. Consulte un médecin ou un kiné qui connaît l'escalade. », `formeAffichage` `'arret'`. Datée de 3 jours avant → pas de J-05.
- **Critères**
  - Au premier lancement, « Coude » coché → après « Continuer » : la ligne « Coude · depuis le {jour même} » dans Profil, et « Douleur déclarée : coude. » sur Aujourd'hui.
  - Profil (téléphone et ordinateur) n'a plus la question.
  - Un ancien profil avec une zone (base de l'appareil ou sauvegarde rechargée) donne une seule douleur, datée du jour de création du profil, avec la mention de reprise. Elle reste unique après plusieurs ouvertures de l'app et après la synchronisation des deux appareils. Marquée résolue, elle ne revient pas.
  - Une sauvegarde ancienne se recharge sans erreur. `base.verno` reste 3.
  - `grep -rn "douleursEnCours" src` ne trouve plus que `src/donnees/base.ts` (reprise), `src/donnees/migration.test.ts`, `src/donnees/repriseDouleurs.test.ts`, `src/assistant/format.ts` et des fichiers de `src/regles/` (G2-02).
  - Boutons de 48 px, focus visible, une seule action en résine par écran ; `npm run build` et `npm run test` passent ; ligne « G2-01 » au tableau « État » du README, en dernier (R-7).

### G2-02 (texte complet)

**G2-02 · Moteur : une seule entrée pour les douleurs** — phase 4, vague 4.3, Haiku (décision G2).
- **Objectif** : depuis G2-01, `profilVersVerif` donne toujours `douleursEnCours: []`. Retirer ce champ du moteur : les douleurs n'y entrent plus que par `ContexteVerif.douleurs`. Aucun message, code, niveau ni clé ne change. Pour l'app, aucun comportement ne change.
- **Dépend de** : G2-01 (sans elle, le profil porterait encore des zones que le moteur ne verrait plus) ; C-03 (S-06 dans `verifierJour`, pour le cas 19 (b)). En parallèle de D-28 si elle tourne encore.
- **Lire** : `moteur-verification.md`, encadré « consolidation 26/11, décision G2 », B.1 (`ProfilVerif`), B.2 (`zonesDouloureuses`), B.11 cas 6 et 19 (b) ; `src/regles/types.ts`, `base.ts`, `banque.ts`, `passerelles.ts`, `exemples.ts` et les tests listés.
- **Fichiers** : modifier `src/regles/types.ts`, `src/regles/base.ts`, `src/regles/banque.ts`, `src/regles/passerelles.ts`, `src/regles/exemples.ts`, `src/assistant/format.ts` ; tests `src/regles/base.test.ts`, `src/regles/banque.test.ts`, `src/regles/verifSeanceProfil.test.ts`, `src/regles/verifPlan.test.ts`, `src/regles/integration.test.ts`, `src/donnees/bibliotheque/lignesFiche.test.ts`, `src/donnees/seancesTypes.moteur.test.ts`. Rien d'autre.
- **Étapes**
  1. `types.ts` : retirer `douleursEnCours` de `ProfilVerif`.
  2. `base.ts`, `zonesDouloureuses(ctx, jour)` : seulement les zones des douleurs de `ctx.douleurs` ouvertes ce jour-là et déclarées ce jour-là ou avant (le `Set` part vide). Commentaire : « Une seule source (décision G2) : les douleurs déclarées. »
  3. `banque.ts` : `raisonDe` et `phraseRaison` ne lisent plus `profil.douleursEnCours` : `fiche.contreIndications.some((z) => zones.includes(z))` et `.filter((z) => zones.includes(z))`. Dans le commentaire de `trierFiches`, retirer « celles du profil comptent toujours aussi ».
  4. `passerelles.ts` : retirer de `profilVersVerif` la ligne `douleursEnCours: []` et son commentaire.
  5. `exemples.ts` : retirer `douleursEnCours: []` de `PROFIL_DE_REFERENCE`.
  6. `src/assistant/format.ts` : retirer `douleursEnCours` de `ContexteAssistant.profil`. Les douleurs n'arrivent à l'assistant que par `douleursOuvertes` (E-13, amendement 6). Le prompt ne cite pas ce champ : `VERSION_PROMPT` ne change pas.
- **Tests** (seules retouches admises ; aucune attente de message ne change). Une « douleur déclarée » est `{ date, zone, niveau: 'reduction', signes: [] }`, placée dans `douleurs` du contexte.
  - `lignesFiche.test.ts`, `seancesTypes.moteur.test.ts` : retirer `douleursEnCours: []` du profil.
  - `base.test.ts`, test de `zonesDouloureuses` : le profil aux doigts devient une douleur déclarée aux doigts du `2026-11-01`, ouverte. Nouveau titre : « zonesDouloureuses : douleurs ouvertes, déclarées avant le jour ». Mêmes attentes (`['coude', 'doigts']` le 23, `['coude', 'doigts', 'epaule']` le 20).
  - `banque.test.ts` : supprimer « douleur : une douleur du profil compte même si la liste des zones est vide » (la règle n'existe plus). « douleur : zone déclarée du jour » ne change pas.
  - `verifSeanceProfil.test.ts` : chaque `profil({ douleursEnCours: [...] })` devient `douleurs: [douleur({ zone: … }), …]`, avec l'assistant `douleur` du fichier (déclarée le `2026-11-20`, trois jours avant la séance), en gardant les autres champs du profil. Le test « douleur du profil et fiche qui la sollicite » devient « douleur déclarée et fiche qui la sollicite ». Attentes inchangées : S-06 peut s'ajouter, mais les tests filtrent par code, et « la fiche inconnue est ignorée… » reste `['S-01']`.
  - `verifPlan.test.ts`, P-12 (deux tests) : `douleursEnCours: ['coude']` devient une douleur déclarée au coude du `2026-11-20` ; messages identiques.
  - `integration.test.ts`, cas 6 et « à niveau égal : par date, puis par code » : une douleur déclarée aux doigts du `2026-11-20`. Dans le cas 6, le `verifierJour` du 24 reçoit les mêmes `douleurs`.
  - `integration.test.ts`, cas 19 (b) : douleur déclarée aux doigts du `2026-11-25` (le jour même). Attendu : `verifierJour` rend exactement S-04 puis S-06, forts, de même cible (portée séance, version solo, `sujet` P, sans `etapeIndex`), tous deux `formeAffichage` `'arret'` ; toujours ni S-27 ni S-03 (B.11 consolidé).
- **Critères** : `grep -rn "douleursEnCours" src` ne trouve plus que `src/donnees/base.ts`, `src/donnees/migration.test.ts` et `src/donnees/repriseDouleurs.test.ts` (l'ancien champ des documents, repris par G2-01) ; aucun message, code, niveau ni `cleAvertissement` ne change ; les autres tests passent sans retouche ; `npm run build` et `npm run test` passent ; ligne « G2-02 » au tableau « État » du README, en dernier (R-7).

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

(consolidation 26/11, décision G2) La ligne « Avant ou pendant la vague 4.3 : dire si la question du profil « Une douleur en ce moment ? » reste à côté des douleurs déclarées » est retirée : Arthur a tranché le 26/11 (décision G2 : remplacer par les douleurs datées). Mise en œuvre : G2-01 et G2-02, vague 4.3.

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
