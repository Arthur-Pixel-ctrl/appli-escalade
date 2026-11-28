# Audit de fin de phase 4 — « Get me to 9a »

28 novembre 2026 · Auditeur indépendant · Copie auditée : `/home/claude/wt/AUDIT-4` (branche `tache/AUDIT-4`, à jour avec `main` au commit `9bc9e4c`, « Décision G3 d'Arthur »). Aucun fichier de code n'a été modifié.

Cet audit reprend celui d'un premier auditeur, interrompu au parcours 4. Son travail a été relu puis vérifié :
- ses scripts Node ont été relancés, avec les mêmes résultats ;
- les parcours 0 à 3 avaient tourné sur le même commit : leurs résultats sont repris tels quels ;
- le parcours 4 et ses compléments sont nouveaux.

Scripts, captures et états du navigateur : `/home/claude/audits/phase-4/`. Les scripts et leurs résultats sont copiés en `.txt` dans `docs/audits/preuves-phase-4/`.

## Verdict

**Prêt pour la semaine réelle d'Arthur : oui, avec réserves.**

Le téléphone suit le plan de bout en bout, hors ligne compris, à chaque niveau de détail.
- Les contrôles du jour sont conformes. Les 11 messages J-01 à J-07 et S-04 à S-06 sont identiques à la spécification, vérifiés par script.
- Le parcours douleur ne contient aucun texte libre ni aucun diagnostic. Un signe d'alerte mène à l'arrêt et à la consultation.
- Une séance manquée ne se rattrape pas.
- Aucun avertissement ne désactive un bouton.
- Rien n'a régressé sur l'ordinateur ni sur la séance libre.

Réserves :
- **I-1.** Si l'ancien profil d'Arthur avait une zone cochée à « Une douleur en ce moment ? », le second appareil ouvert après la mise à jour peut rouvrir une douleur résolue et effacer un changement du profil. **Parade pour la semaine** : ouvrir la nouvelle version une fois sur le téléphone **et** sur l'ordinateur, avant de marquer une douleur résolue, de modifier le profil ou de faire un transfert.
- **Sans compte**, rien ne passe seul d'un appareil à l'autre : tout se fait par fichier de sauvegarde (voir plus bas). Sur l'ordinateur, une séance sautée ou faite n'apparaît alors que dans le tableau de bord (M-1).

| Gravité | Nombre |
|---|---|
| Bloquant | 0 |
| Important | 1 |
| Mineur | 3 |

## Sans compte de synchronisation : ce qui change pour la semaine réelle

Arthur n'a pas encore de compte (Supabase reporté). L'app le sait. Aucun écran ne prétend qu'une donnée est partie :
- le débrief dit « Enregistrée sur ce téléphone », sans « envoyée » ;
- Programme ne dit pas « Ce changement sera aussi visible sur ton ordinateur ».

**Ce que l'absence de compte empêche.**
- Aucune synchronisation automatique. Une séance faite, déplacée ou sautée sur le téléphone n'arrive pas seule sur l'ordinateur, et un changement du plan n'arrive pas seul sur le téléphone.
- « Une séance à la salle en mode avion, puis le retour du réseau » (fin de phase 4) : au retour du réseau, rien n'est envoyé. Les séances restent marquées « à envoyer » sur le téléphone, sans effet visible. L'envoi au retour du réseau est seulement vérifié par les tests (`src/synchro/automatique.test.ts:149`), pas en vrai.
- Aucune copie de secours hors de l'appareil. Vider les données du navigateur efface tout ; l'écran Profil le rappelle.

**Ce qui reste possible.**
- Toute la semaine sur le téléphone seul, hors ligne compris : le plan est lu dans la base locale.
- Le transfert par fichier, dans les deux sens : Profil → « Sauvegarder mes données » sur un appareil, puis Profil → « Recharger une sauvegarde » sur l'autre. Essayé dans le parcours 4 :
  - l'ordinateur a reçu la séance déplacée, la séance sautée, les 3 séances faites, la forme du jour et le profil (« 3 séances et 42 autres éléments ») ;
  - le tableau de bord montre « Faite » et « Sautée ».
- Un téléphone neuf se remplit depuis l'écran de bienvenue, avec « J'ai une sauvegarde ». Cela marche aussi avec une sauvegarde ancienne.

**Règles à suivre pour les transferts.** Pour chaque élément (une séance, le profil, une douleur), la version modifiée le plus récemment gagne, en entier.
- Si la même séance est déplacée sur le téléphone, puis modifiée sur l'ordinateur avant le transfert, le déplacement est perdu (vérifié, `resultat-deux-appareils.txt`). C'est la règle voulue (architecture § 2.5).
- Conseil : modifier le plan seulement sur l'ordinateur, puis le transférer. Sur le téléphone, seulement déplacer, sauter et faire les séances. Faire un transfert après chaque série de changements.

## Commandes lancées

- `npm ci` : réussi. Il signale 4 vulnérabilités « modérées », toutes dans les outils de développement. `npm audit --omit=dev` : 0 vulnérabilité.
- `npm run test` : 69 fichiers, 1 281 tests, tous passent.
- `npm run build` : réussi (PWA, 15 fichiers précachés). L'avis de Vite sur la taille du fichier principal (1,07 Mo) revient. Il est sans effet hors ligne.
- `npm run lint` (oxlint) : 0 erreur, 1 avertissement, déjà signalé aux phases 2 et 3 (`src/chrono/useRepos.ts:19`).
- Scripts Node de l'auditeur, qui appellent directement le code de `src/` :
  - `messages.mjs` et `spec.mjs` : lisent les tableaux de `moteur-verification.md`, déclenchent J-01 à J-07 et S-04 à S-06 par `controlesDuJour` (le chemin d'Aujourd'hui), puis comparent le niveau, la forme et le message ;
  - `groupe-douleur.mjs` : chaque séance type avec une version groupe, croisée avec chaque zone de douleur ;
  - `deux-appareils.mjs` : un téléphone, un ordinateur et un serveur en mémoire, avec le vrai code `synchroniser`.
- Parcours Playwright sur la version construite (`vite preview`, port 4193), à 1 280 × 800 (ordinateur) et 390 × 844 (téléphone), sans compte, l'heure fixée par `page.clock` :
  - `p0` : premier lancement avec une douleur ;
  - `p1` : plan proposé puis validé ;
  - `p2` : semaine 1 sur le téléphone ;
  - `p3` : douleur, niveaux de détail, hors ligne ;
  - `p4-sauvegardes` : ordinateur après import, deux appareils, sauvegarde ancienne ;
  - `p4-complements` : douleur vue sur l'ordinateur, séance libre seule ;
  - `p4-semaine-ordinateur`.

  Le serveur est arrêté à la fin.

---

## Constat important

### I-1. La reprise des zones de l'ancien profil peut rouvrir une douleur résolue et effacer un changement du profil

**Ce qui peut arriver.** Le téléphone et l'ordinateur ont le même ancien profil, avec « coude » coché à « Une douleur en ce moment ? ». Arthur ouvre la nouvelle version sur le téléphone. La zone devient une douleur déclarée, comme prévu. Il la marque résolue, passe son niveau de bloc à 7B, puis sauvegarde. Le soir, il ouvre l'ordinateur pour la première fois depuis la mise à jour et recharge le fichier du téléphone. Résultat :
- sur l'ordinateur, la douleur reste ouverte et le profil garde 7A ;
- le lendemain, le fichier de l'ordinateur est rechargé sur le téléphone. La douleur s'y rouvre, avec « Douleur déclarée : coude. » et J-05 « consulte » sur Aujourd'hui, et le profil revient à 7A.

Avec la synchronisation, c'est pareil, car l'app lit le profil avant de synchroniser.

**Où.** `src/donnees/base.ts:175`, `:181-182` et `:187` (`reprendreZonesDuProfil`). La douleur reprise et le profil réécrit portent `modifieLe = maintenant`, c'est-à-dire l'heure de la première ouverture de **chaque** appareil. Celle du second appareil est plus récente que la résolution et que la modification faites entre-temps sur le premier. Elle gagne donc partout (« dernière modification gagne »). La protection `if (await base.douleurs.get(id)) continue` (`:180`) ne joue que si la douleur de l'autre appareil est déjà arrivée. Le code suit G2-01 (étape 2) et l'architecture § 4.4 (« Le profil réécrit (`modifieLe` = maintenant…) »). Mais il contredit la promesse du même § 4.4 : « une zone renvoyée par un ancien appareil ne rouvre pas une douleur résolue ».

**Preuve.**
- Par fichier, dans l'interface (`resultat-p4.txt`, `resultat-p4-b.txt`, capture `p4-3-telephone-rouverte.png`) :
  ```
  Ordinateur après import du fichier du téléphone : reprise-profil-coude resolueLe = (aucun : douleur encore ouverte)
  Ordinateur après import : niveauBloc = 7A (7B sur le téléphone)
  Téléphone après import du fichier de l'ordinateur : reprise-profil-coude resolueLe = (aucun : douleur rouverte) ; niveauBloc = 7A ; signal « Douleur déclarée : coude. » sur Aujourd'hui : oui
  ```
- Par synchronisation (`resultat-deux-appareils.txt`, cas 4, et cas 5 en témoin) :
  ```
  Appareil resté ancien, ouvert après la résolution : … resolueLe = (aucun : rouverte) ; douleurs ouvertes le 27 : ["coude"] ; niveauBloc du profil = "6A" (changé en 7A sur le téléphone)
  Témoin (synchro avant la lecture du profil) : reprise-profil-coude resolueLe = 2026-11-26
  ```

**Risque.** Il n'existe que si l'ancien profil d'un des appareils avait une zone cochée. On ne le sait pas pour Arthur. Dans ce cas :
- une douleur résolue revient. C'est prudent, mais c'est une fausse alerte « consulte » qui use la confiance dans les signaux d'arrêt ;
- les changements du profil faits entre les deux ouvertures sont perdus sans message (niveau, prérequis, jours). Les avertissements S-03 dépendent de ces prérequis.

Sans zone dans l'ancien profil, la reprise n'écrit rien et le problème n'existe pas.

**Correction proposée.** Rendre la reprise identique sur les deux appareils et toujours plus ancienne qu'une vraie modification :
- douleur reprise : `creeLe` = `modifieLe` = le `modifieLe` de l'ancien profil (et non « maintenant ») ;
- profil réécrit : `modifieLe` = ancien `modifieLe` + 1 ms. Il bat le même ancien profil resté sur le serveur ou dans un fichier, mais perd contre une vraie modification faite ailleurs.

Il faut aussi ajouter à `repriseDouleurs.test.ts` le cas de deux appareils, par fichier (`exporterDonnees` puis `importerDonnees`) et par `serveurMemoire`, comme le cas 4 de `deux-appareils.mjs`.

**Qui.**
- Opus : amender l'architecture § 4.4 et G2-01.
- Sonnet : le code et les tests.
- En attendant, la parade du verdict.

---

## Constats mineurs

### M-1. Sur l'ordinateur, la vue Semaine ne dit pas qu'une séance est faite ou sautée

**Ce qui peut arriver.** Arthur recharge sur l'ordinateur la sauvegarde du téléphone.
- Le tableau de bord montre « mardi 8 · Faite », « vendredi 11 · Faite » et « samedi 12 · Sautée ».
- La vue Semaine montre les mêmes séances comme des séances ordinaires, modifiables, sans aucune marque. Elle affiche aussi « Cette semaine ne contient rien pour : résistance, endurance », sans dire que c'est parce que la séance d'endurance a été sautée.

La fin de phase 4 demande une séance sautée « visible ensuite sur l'ordinateur » : elle l'est, mais seulement dans le tableau de bord.

**Où.** `src/ecrans/bureau/VueSemaine.tsx` : aucun appel à `statutSeance`, à comparer avec `src/ecrans/bureau/TableauDeBord.outils.ts:99`. L'écart était déjà relevé dans C-05 (amendement 1, « signalé au gérant »), mais il n'a été confié à aucune tâche.

**Preuve.** `resultat-p4-semaine-ordinateur.txt` : « statuts dans la semaine : aucun » (samedi 12 : « LÉGÈRE / 1 h 24 / SOLO / GROUPE / Niveau… »). En regard, `resultat-p4.txt`, étape Tableau de bord : « samedi 12 déc. / 1 min / 1 min et continuité / Sautée ».

**Risque.** Faible. Arthur peut retoucher une séance passée en la croyant à venir. L'information sur la semaine paraît alors fausse.

**Correction proposée.** Dans la vue Semaine, une mention « Faite », « Sautée » ou « Manquée » sur la case du jour, par `statutSeance`, comme le tableau de bord. Le contenu de la séance reste modifiable.

**Qui.** Opus : une ligne dans O-05. Sonnet : le code.

### M-2. Une version groupe sans mini-bloc n'est jamais vérifiée contre une douleur

**Ce qui peut arriver.** Arthur écrit à la main une séance légère de technique en solo, avec en groupe l'objectif type « 3 blocs à ta limite » (fiche `puissance-bloc-limite`, effort maximal). Il a une douleur au coude ou au dos déclarée il y a 3 jours. Le matin, aucun S-04 ni S-06 ne nomme l'objectif. Seul reste le signal général « Douleur déclarée : coude. Ménage cette zone et arrête-toi dès que ça fait mal. »

**Où.** `src/regles/verifSeanceProfil.ts:248` et `:271` : S-01 à S-09 lisent, pour le groupe, les seules étapes du mini-bloc. C'est **conforme** à B.5 (« Dans la version groupe, les "étapes" sont celles du mini-bloc »). C'est donc un trou de la spécification, pas du code.

**Preuve.** `resultat-groupe-douleur.txt` :
- pour les 26 séances types, les 82 cas (séance × zone × objectif à risque) sont tous signalés, car la même fiche est dans la version solo ;
- contre-épreuve sur une séance écrite à la main : « douleur coude 3 j : aucun contrôle », de même pour le dos.

**Risque.** Faible : seulement pour une séance écrite à la main, et le signal général reste affiché.

**Correction proposée.** Décider dans B.5 si S-04 et S-06 lisent aussi, en version groupe, la fiche de référence et les marqueurs des objectifs. Message suggéré : « retire l'objectif « … » ».

**Qui.** Opus (spécification), puis Sonnet.

### M-3. La variante « lestée » de ST-DOI-02 garde le nom et la recommandation de la réglette minimale

**Ce qui peut arriver.** Le profil d'Arthur dit « poutre régulière ». Le générateur choisit donc la variante `lestee` de ST-DOI-02 : ses étapes sont « Suspensions max lestées (López) », dans le solo comme dans le mini-bloc. Mais :
- la séance s'appelle « Suspensions max (réglette minimale) + bloc limite » ;
- au niveau simple, le téléphone n'affiche que la recommandation « Suspensions max sur réglette minimale, puis bloc à ta limite ».

Arthur peut donc faire un autre protocole que celui du plan.

**Où.** `src/donnees/seancesTypes.ts:71-86` : la variante `lestee` n'a pas de `recommandation` propre. Le champ existe pourtant (`:35`, « seulement si elle diffère de celle de la séance »).

**Preuve.**
- `resultat-p1.txt` : « 2026-12-08 Suspensions max (réglette minimale) + bloc limite … solo=…,doigts-suspensions-max-lestees,… » ;
- `resultat-p3.txt`, séance simple : « Suspensions max sur réglette minimale, puis bloc à ta limite : 4 essais max par bloc. ».

**Risque.** Faible. Les deux protocoles sont des suspensions maximales et portent les mêmes marqueurs : la règle des 48 h et les quotas ne changent pas. Mais ce qui est fait ne correspond pas à ce qui est prévu.

**Correction proposée.** Une recommandation propre à la variante `lestee`, par exemple « Suspensions max lestées, puis bloc à ta limite : 4 essais max par bloc. ». Décider aussi si le nom de la séance suit la variante.

**Qui.** Opus (texte, `seances-types.md` C.2), puis Sonnet (données).

---

## Vérifié et trouvé conforme

**1. Contrôles du jour (C-03, B.4, B.8)**
- Les 11 messages ont été déclenchés par `controlesDuJour`, puis comparés au texte de la spécification par expression régulière : **0 écart** sur le niveau, la forme d'affichage et le message (`resultat-messages.txt`). La liste : J-01, J-02, J-03, J-04, J-05 (avec et sans séance), J-06 (moteur direct : pas de résultat de test sur le téléphone avant la phase 6), J-07, S-04, S-05 et S-06.
- S-06 est dans `verifierJour` (`src/regles/index.ts:102-104`). Un jour sans séance, tous les signaux réunis ne donnent que J-05 (`verifierJourSansSeance`).
- L'ordre de la pile est : arrêts (S-04, S-06), puis avertissement (J-04), puis information (J-01). Une douleur résolue ce jour-là, ou supprimée, ne donne plus rien.
- Sur le téléphone :
  - la Forme du jour a 5 questions et la mention « 30 secondes » ; « Enregistrer » reste désactivé tant qu'il manque une note ; des heures hors bornes sont refusées ; deux voyants rouges donnent « 2 voyants au rouge » et J-01 en information ;
  - la ligne Forme du jour est présente les jours de repos et sans plan ;
  - J-05 s'affiche en signal d'arrêt un jour sans plan (parcours 4 C : « Ta douleur (genou) dure depuis 74 jours. ») ;
  - S-06 et S-05 apparaissent en signal d'arrêt avec « Voir les mises en garde » et « Pourquoi ? » ; aucun bouton n'est désactivé ; le focus va au titre.

**2. Parcours douleur (C-04)**
- Aucun champ de texte. Les 8 cases sont exactement `SIGNES_ARRET` : une seule liste, importée aussi par `MisesEnGarde.tsx`.
- `declarerDouleur` refuse un signe hors liste. La zone est obligatoire.
- Aucun signe : « Allège pendant 1 à 2 semaines » et la conduite. Un signe d'alerte : « Arrête la séance et consulte un médecin ou un kiné qui connaît l'escalade. », puis « Signe d'alerte déclaré : doigts. » et la phrase de S-05 sur Aujourd'hui.
- Aucun nom de lésion, aucune gravité affichée.
- Depuis Trois questions, « Préciser la douleur » garde les réponses. Après « Stop, ça fait mal », la douleur est pré-cochée.
- Une douleur marquée résolue disparaît partout :
  - sur le téléphone ;
  - sur l'ordinateur : 10 S-04 et 10 S-06 dans la vue Semaine après la déclaration, 0 après la résolution (`resultat-p4-complements.txt`).
- Aucun texte de l'interface ne dit que l'app retire des exercices (T-06).

**3. Une seule source de douleurs, reprise de l'ancien profil (G2-01, G2-02)**
- `grep -rn douleursEnCours src` ne trouve que `src/donnees/base.ts` (la reprise), `migration.test.ts` et `repriseDouleurs.test.ts`.
- La question « Une douleur en ce moment ? » n'existe qu'au premier lancement. Coude coché donne une douleur déclarée datée du jour. La question n'est plus dans Profil, ni sur le téléphone ni sur l'ordinateur.
- La douleur reprise est datée du jour de création du profil, jamais après (« Coude · depuis le 1 décembre » pour un profil créé le 1er décembre). La mention de reprise est présente.
- Deux appareils synchronisés gardent un seul document `reprise-profil-coude` (cas 3 de `deux-appareils`).
- Une sauvegarde ancienne (version 1, zone « genou ») se recharge sur un téléphone neuf, depuis l'écran de bienvenue :
  - douleur `reprise-profil-genou` datée du 1er octobre, avec J-05 ;
  - le champ est retiré du profil ;
  - toujours une seule douleur après trois réouvertures.

**4. Ajustements du téléphone (C-05) et règle « dernière modification gagne »**
- « Déplacer » propose seulement les jours de la semaine à partir d'aujourd'hui. « Sauter » passe par une confirmation, sans style « danger ». « Annuler » le saut fonctionne. Les messages en `role="status"` sont présents.
- Après un déplacement, l'aperçu montre W-01, sur la séance déplacée et sur sa voisine (`seanceLieeId`), sans rien bloquer.
- Une séance manquée n'a ni « Déplacer », ni « Sauter », ni « Faire cette séance maintenant ». Aujourd'hui dit « Séance de mardi pas faite. Elle n'est pas rattrapée : on continue le plan. »
- Le conflit est testé dans `src/donnees/plan.test.ts:319` et refait dans les deux ordres par `deux-appareils.mjs` : la version la plus récente gagne en entier, sur les deux appareils et sur le serveur.
- Une séance sautée sur le téléphone a le statut `sautee` sur l'ordinateur, après synchronisation comme après transfert par fichier (tableau de bord).

**5. Lecture du plan**
- `lirePlanEnCours` est le seul chemin vers le plan (`src/ecrans/donneesTelephone.ts:25`). `lireSeancesEntre` n'est appelée par aucun écran. Les cas brouillon, orpheline et cycle supprimé sont testés (`plan.test.ts:185-214`).
- **Aucune séance d'exemple restante** :
  - `exemplesV2.ts` et `seanceExemple.ts` ne sont importés que par des tests ;
  - ni « Doigts et bloc limite » ni « Cycle d'automne » n'est dans le fichier construit ;
  - un téléphone neuf montre « Pas encore de plan ».

**6. Hors ligne**
- Le service worker est actif et contrôle la page.
- Hors ligne, après rechargement, Aujourd'hui lit le plan dans la base locale (« Plan à jour au … »).
- Une séance en grandes lignes, faite hors ligne, est enregistrée (`aEnvoyer: 1`) et apparaît « Séance faite » après un nouveau rechargement.
- L'envoi au retour du réseau n'est vérifié que par les tests (`automatique.test.ts:149`), faute de compte.

**7. Mini-bloc de groupe (D-28)**
- ST-DOI-02 en groupe : le mini-bloc vient d'abord (échauffement des doigts, suspensions), avec « Stop, ça fait mal » en haut et « Passer au groupe ». Viennent ensuite les objectifs, puis le débrief : « 1/2 étapes faites », blocs par couleur, « Séance prévue : mardi … · faite ».
- ST-TRA-02 (déplacée au vendredi) : le groupe d'abord, puis le mini-bloc « après le groupe ».
- Le rappel du bloc est sur l'écran du groupe, et pas sur un mini-bloc de poutre (règle de D-28).

**8. Rappel de sécurité du bloc à chaque niveau (D-27)**
- Présent en tête de la séance en détaillé, en simple, en grandes lignes et en groupe, mot pour mot.
- Absent des séances libres.

**9. Séance en bref (D-27)**
- Simple : la recommandation, un chrono libre, « Démarrer » en bouton second, « À respecter » mot pour mot, « Stop » en haut.
- Grandes lignes : 3 parties avec « Fait » et « Passé » de 64 px et leurs libellés accessibles, « Voir la fiche » qui se déplie.
- La séance terminée est reliée au plan (`seancePlanifieeId`, marqueurs).

**10. Aucune régression**
- Ordinateur :
  - plan proposé puis validé, puis sauvegarde du téléphone rechargée ;
  - tableau de bord, vue Semaine, Bibliothèque et Bilans s'ouvrent sans erreur ;
  - « Les séances se lancent depuis ton téléphone », sans bouton de lancement (R-6).
- Séance libre : en groupe un jour de repos, et seule après la fin du cycle (`mode: 'libre'`, sans lien au plan, sans rappel du bloc).
- Aucune erreur de page dans les parcours 0 à 4.

**Design et règles**
- Aucun bouton ni lien de moins de 48 px sur les écrans parcourus, au téléphone comme à l'ordinateur.
- Focus visible au clavier (contour de 3 px) sur les 10 premiers éléments d'Aujourd'hui.
- Une seule action en résine par écran (revue du code des écrans de la phase 4).
- Aucune couleur en dur dans les fichiers de la phase 4. Aucun `window.confirm` ni `alert`.
- Les textes de référence du § 5 qui concernent la phase 4 sont présents mot pour mot. Seule différence : l'apostrophe droite de « La forme du jour n'a pas été enregistrée. Réessaie. », qui suit le texte de C-03.
- Rien de calculable n'est stocké. Le statut d'une séance planifiée se calcule (`statutSeance`), et une douleur reprise se reconnaît à son identifiant (`estRepriseDuProfil`).
