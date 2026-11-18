# Recette de fin de phase 2 : « Get me to 9a »

Pour Arthur. Tu coches chaque case quand le résultat est bien celui qui est écrit. Une case non cochée n'est pas grave : note ce qui s'est passé (voir « Que faire si ça ne marche pas », en bas).

Cette recette n'a encore été faite par personne. Les cases sont toutes vides.

## Avant de commencer : protéger tes données

- [ ] **Fais une sauvegarde.** Onglet **Profil**, touche **Sauvegarder mes données**. Le message « Sauvegarde créée dans tes téléchargements. » doit apparaître. Garde le fichier.
- [ ] **Ne réinstalle jamais l'app sans sauvegarde récente.** Supprimer l'icône de l'app efface les données du téléphone.
- [ ] **En cas de souci, recharge la sauvegarde.** Dans **Profil**, touche **Recharger une sauvegarde**. Sur l'écran d'accueil, touche **J'ai une sauvegarde**.
- **À savoir : le nouveau nom sur l'écran d'accueil** (« Get me to 9a ») ne s'affiche qu'après une réinstallation. Ne réinstalle que lorsque la synchronisation a été vérifiée (partie B).

## Résultats des contrôles automatiques

Faits le 18/11/2026 sur la branche `tache/F2-16`, avant la recette manuelle.

| Commande ou contrôle | Résultat |
|---|---|
| `npm ci` | Réussi |
| `npm run lint` | Réussi, avec 1 avertissement : `src/chrono/useRepos.ts`, ligne 19 (règle `set-state-in-effect`). Pas de correction faite ici. |
| `npm run test` | Réussi : 20 fichiers de tests, 199 tests (31 au départ) |
| `npm run build` | Réussi |
| `grep` de `sb_secret_` dans `src` et `.github` | Seulement le refus dans `src/compte/client.ts` (lignes 9 et 17) et son test dans `client.test.ts`. Rien dans `.github`. |
| `grep` de `supabase-js` dans `src` | `src/compte/client.ts` et le type importé dans `src/synchro/serveurSupabase.ts`. Rien d'autre. |
| `grep` de `from 'react'` dans `src/moteur` et `src/chrono/sequence.ts` | Rien |
| `grep` de `cleApiClaude` dans `src` | Seulement dans les tests (`sauvegarde.test.ts`, `stockage.test.ts`, `synchro.test.ts`). Rien dans le code de production. |
| Versions 1 et 2 de la base | Toujours déclarées dans `src/donnees/base.ts` (lignes 37 et 39) |
| `window.confirm` et `window.alert` | Aucun appel. Seulement un commentaire dans `src/composants/Confirmation.tsx`. |
| `Mesocycle` ou `mesocycle` dans `src` | Rien |
| « Appli escalade » dans `src`, `index.html`, `vite.config.ts` | Rien |
| Nom de la base `'appli-escalade'` | Gardé dans `src/donnees/base.ts` |

## Partie A : iPhone, sans compte (à faire tout de suite)

Ouvre l'app installée sur l'écran d'accueil. Les onglets du bas sont **Aujourd’hui**, **Programme**, **Bilans**, **Profil**.

### A1. Mise à jour et anciennes données

- [ ] Onglet **Profil**, tout en bas : la ligne « Version du… » affiche la date de la mise à jour.
- [ ] Onglet **Bilans** : tes anciennes séances sont là, groupées par « Semaine du… ».
- [ ] Onglet **Profil** : tes réponses sont toutes là, comme avant la mise à jour.

### A2. Séance solo, avec chrono

1. Onglet **Aujourd’hui**, touche **Je grimpe seul**.
2. Touche **Lancer le chrono** sur une étape de chrono.
3. Touche **Démarrer**. Le compte à rebours commence.
4. Touche **Pause**, puis **Reprendre**. Le chrono repart là où il s'était arrêté.
5. Touche **Stop, ça fait mal**. L'écran **Tu as bien fait d’arrêter** s'affiche, puis **Revenir à la séance**.
6. Termine les étapes. Touche **Terminer la séance**.

- [ ] Les étapes 1 à 6 se font sans bug ni blocage.

### A3. Chrono : bips, écran, couleurs, chiffres

Fais un tour de chrono complet.

- [ ] **Bips** : un bip à chaque seconde du compte à rebours (3, 2, 1), puis un bip au début de l'effort, puis un bip au début du repos, puis un bip de fin.
- [ ] **Vibrations** : sur iPhone, les vibrations ne sont souvent pas disponibles. Si rien ne vibre, ce n'est pas un bug : note-le seulement.
- [ ] **Écran allumé** : l'écran ne s'éteint pas pendant le chrono.
- [ ] **Trois fonds** : la préparation a un fond sombre (encre), l'effort un fond clair (craie), le repos un fond vert (résine). La barre du haut du téléphone prend la même couleur.
- [ ] **Chiffres lisibles** : le temps restant se lit d'un coup d'œil, et les chiffres ne bougent pas quand ils changent.
- [ ] Si tu n'entends aucun bip, vérifie que le téléphone n'est pas en mode silencieux, puis note-le.

### A4. Séance en groupe

1. Onglet **Aujourd’hui**, touche **Je grimpe en groupe**.
2. Objectif 1 : « 3 blocs durs à réglettes, 4 essais max chacun ». Choisis une couleur.
3. Touche **+** dans **Essais** jusqu'à 5 essais.
4. Touche **Enchaîné** ou **Flashé** pour noter un bloc, ou **Pas encore**.
5. Touche **Annuler le dernier bloc** dans la liste du bas.
6. Touche **Objectif 2 : Flasher 3 violets** dans la liste pour changer d'objectif.
7. Touche **Terminer la séance**.

- [ ] Au-delà de 4 essais, l'avertissement **Plus de 4 essais** apparaît, avec un texte sur la fatigue des doigts.
- [ ] Même avec l'avertissement, tu peux continuer d'ajouter des essais. Rien n'est bloqué.
- [ ] Le bloc noté apparaît bien, et **Annuler le dernier bloc** le retire.
- [ ] Le changement d'objectif fonctionne, et l'objectif quitté garde son avancement.

### A5. Les trois questions

Après la séance, l'écran **Trois questions** s'ouvre.

- [ ] Tant qu'une des trois questions n'a pas de réponse, le bouton **Enregistrer et voir le débrief** est grisé, avec la phrase « Réponds aux trois questions pour continuer. »
- [ ] Les réponses de la question de difficulté vont de 1 à 10.
- [ ] La question sur la peau propose **Abîmée**, **Limite**, **Bonne**.
- [ ] La question sur la douleur propose **Non, rien** et **Oui**.

### A6. Débrief et Bilans

- [ ] Après **Enregistrer et voir le débrief**, l'écran **Débrief** s'ouvre avec les parties **Objectifs**, **Étapes**, **Blocs par couleur**, **Ta semaine**, **La suite**. Touche **Terminer** pour revenir à l'accueil.
- [ ] La séance que tu viens de faire est dans l'onglet **Bilans**, en tête de sa semaine.
- [ ] Touche cette séance dans **Bilans** : son débrief se rouvre.

### A7. Douleur : mises en garde

Refais une séance solo et réponds **Oui** à la question sur la douleur.

- [ ] Les mises en garde s'affichent avant le débrief, avec le bouton **Voir le débrief**.
- [ ] Touche **Voir le débrief** : le débrief s'ouvre.

### A8. Mises en garde depuis le profil

- [ ] Onglet **Profil** > **Mises en garde** : la page **Mises en garde** s'ouvre, avec les rubriques « Arrête la séance et consulte » et « Allège pendant 1 à 2 semaines ».
- [ ] Touche **Fermer** : tu reviens au profil.

### A9. Profil et les quatre prérequis

- [ ] Onglet **Profil** : change une réponse, touche **Enregistrer le profil**, puis quitte et rouvre l'onglet. La réponse est gardée.
- [ ] La partie **Pour débloquer les exercices exigeants** contient quatre questions : tractions strictes, tenir 15 s sur une réglette de 25 mm, avoir 18 ans ou plus, savoir grimper et chuter en tête.
- [ ] Pour les tractions, la touche **Je ne sais pas** remet la réponse à « ? ».

### A10. Fenêtre « Quitter la séance ? »

1. Lance une séance solo, puis touche **Quitter** en haut.
2. Refais la même chose dans une séance en groupe.

- [ ] La fenêtre **Quitter la séance ?** s'ouvre, avec « Elle ne sera pas enregistrée. ».
- [ ] Touche **Rester** : la séance reprend, intacte.
- [ ] Touche **Quitter la séance** : tu reviens à l'accueil, et la séance n'apparaît pas dans **Bilans**.

### A11. Sauvegarde et rechargement

1. Onglet **Profil** > **Sauvegarder mes données** : le message « Sauvegarde créée dans tes téléchargements. » apparaît.
2. Onglet **Profil** > **Recharger une sauvegarde**, puis choisis le fichier.

- [ ] Le message « Sauvegarde rechargée : … séances et … autres éléments. » apparaît.
- [ ] Tes séances et ton profil sont toujours là.

### A12. Bandeau de mise à jour

- [ ] Quand une nouvelle version existe, le bandeau **Nouvelle version disponible · Mettre à jour** apparaît en haut. Touche-le. Ne le fais pas pendant une séance.
- [ ] Si le bandeau n'apparaît pas pendant la recette, ce n'est pas une erreur. Coche la case et note « pas de nouvelle version ».

## Partie B : iPhone, avec compte

Cette partie demande d'avoir suivi `docs/supabase.md` jusqu'à l'étape 9 (premier essai). Si ce n'est pas fait, passe à la partie C et reviens-y plus tard.

Les pages « Compte » se trouvent dans **Profil** > **Compte**, ou sur l'accueil avec **Crée ton compte pour retrouver ton plan sur ordinateur**.

### B1. Connexion par code

1. Touche **Recevoir mon code de connexion**.
2. Saisis ton adresse, puis touche le bouton d'envoi. L'écran **Regarde ta boîte mail** s'affiche.
3. Ouvre le mail, copie le code, saisis-le et valide.

- [ ] Le code arrive par e-mail.
- [ ] Après le code, l'écran **Ton compte** s'affiche avec ton adresse.
- [ ] Touche **Changer d’adresse** : tu peux recommencer avec une autre adresse.

### B2. Adresse non invitée

Essaie avec une adresse qui n'est **pas** sur la liste d'invités.

- [ ] Le message affiché est : « Cette adresse n’est pas sur la liste d’invités. Demande à Arthur de l’ajouter. »
- [ ] Ce message n'est pas une erreur de l'app. Si tu vois autre chose (par exemple un message technique), copie-le exactement et envoie-le.

### B3. Reprise des séances

Sur un téléphone qui a déjà des séances, la première connexion affiche **On a trouvé tes séances**.

- [ ] L'écran indique la période et si un profil existe.
- [ ] Touche **Ajouter à mon compte** : tes séances sont liées au compte. Rien n'est effacé.
- [ ] Touche **Plus tard** : tu reviens à l'accueil, sans rien perdre.

### B4. Synchronisation

Ouvre l'onglet **Aujourd’hui**, sous la date.

- [ ] La mention **À JOUR** s'affiche.
- [ ] Ouvre **Compte** : **Synchroniser maintenant** lance une synchronisation, et le texte indique « À jour, … ».

### B5. Mode avion, puis retour du réseau

1. Active le **mode avion** du téléphone.
2. Fais une séance solo complète ou ajoute un profil modifié.
3. Regarde l'onglet **Aujourd’hui**, puis **Compte**.
4. Désactive le mode avion.

- [ ] Hors ligne : la mention **HORS LIGNE** s'affiche, et une bannière en haut dit « Hors ligne. Tout est gardé sur cet appareil, l’envoi se fera au retour du réseau. ».
- [ ] La séance faite hors ligne est bien enregistrée : elle est dans **Bilans**.
- [ ] Pendant le mode avion, la mention indique « 1 CHANGEMENT EN ATTENTE » (ou le nombre correspondant).
- [ ] Au retour du réseau, la mention repasse à **À JOUR** sans rien toucher.

### B6. Déconnexion avec modifications en attente

1. Refais le mode avion, fais une modification, puis reviens en ligne **sans** attendre la synchronisation.
2. Ouvre **Compte**, touche **Me déconnecter**.

- [ ] La fenêtre **Te déconnecter ?** indique le nombre de modifications qui ne sont pas encore envoyées.
- [ ] Touche **Rester connecté** : rien ne change.

### B7. Reconnexion

- [ ] Reconnecte-toi avec la même adresse (partie B1).
- [ ] Tes séances et ton profil sont toujours là, et les modifications en attente sont envoyées.

### B8. Suppression d'un compte d'essai

**Utilise un compte d'essai, jamais ton compte principal.** La suppression efface le compte et ses données sur le serveur.

1. **Compte** > **Supprimer mon compte**.
2. Lis le texte. Tu peux d'abord toucher **Sauvegarder dans un fichier**.
3. Tape **supprimer** dans le champ, puis touche **Supprimer définitivement**.
4. Confirme dans la fenêtre **Supprimer ton compte ?** avec **Supprimer définitivement**.
5. Écran **Compte supprimé** : choisis **Garder mes données sur cet appareil** (recommandé pour la recette).

- [ ] Le compte d'essai est supprimé, et l'écran **Compte supprimé** s'affiche.
- [ ] Les données du téléphone sont toujours là après **Garder mes données sur cet appareil**.

### B9. Adresse non invitée refusée

Cette vérification est déjà faite en B2. Coche-la ici seulement si B2 a bien affiché le message attendu.

- [ ] Le message de B2 a été vu.

## Partie C : ordinateur

Ouvre la même adresse dans le navigateur de l'ordinateur. Pour cette partie, la fenêtre doit être large.

### C1. Mise en page ordinateur

- [ ] Une barre du haut avec cinq rubriques : **Tableau de bord**, **Plan**, **Bibliothèque**, **Bilans**, **Profil**.
- [ ] Sur **Tableau de bord**, le texte « Les séances se lancent depuis ton téléphone. » est affiché.

### C2. Bascule à 1 024 px

1. Réduis la largeur de la fenêtre sous 1 024 px.
2. Élargis-la de nouveau.

- [ ] En dessous de 1 024 px, la barre d'onglets du bas (Aujourd’hui, Programme, Bilans, Profil) remplace la barre du haut.
- [ ] La bascule se fait sans recharger la page, et l'écran courant reste le même.

### C3. Aucun lancement de séance sur ordinateur

- [ ] Sur ordinateur, aucun bouton ne lance une séance (ni **Je grimpe seul**, ni **Je grimpe en groupe**, ni « Faire la séance ici »).

### C4. Même compte, même historique

- [ ] Connecte-toi au même compte que sur le téléphone (**Profil** > **Compte**).
- [ ] La rubrique **Bilans** affiche les séances faites sur le téléphone.
- [ ] Modifie une réponse du **Profil** sur l'ordinateur, puis vérifie sur le téléphone, après la synchronisation, que le changement est là.

### C5. Test d'isolement à deux comptes

Suis la section « Test d'isolement à deux comptes » de `docs/supabase.md`.

- [ ] Avec le second compte, l'historique du premier compte n'apparaît pas.

### C6. Suppression d'un compte d'essai

- [ ] Même vérification que B8, faite depuis l'ordinateur, avec un compte d'essai.

## Connu, pas encore fait

Ce qui suit n'est pas un bug de la recette. Ne le note pas comme une erreur.

- **Aujourd’hui** : la séance du jour, « Phase 1 · doigts · semaine 2 sur 4 », « Cette semaine » et « 2 objectifs, 1 h 30 » sont des données d'exemple. Le vrai plan arrivera en phase 3.
- **Programme** (téléphone) : écran « En construction ». Le plan réel arrivera en phase 3.
- **Ordinateur** : **Tableau de bord**, **Plan** et **Bibliothèque** affichent « En construction ».
- **Icône de l'écran d'accueil iPhone** : pas encore changée. Elle reste l'ancienne.
- **« Voir la fiche »** sur chaque étape : pas encore présent.
- **Filtre des Bilans** : pas encore présent.

## Que faire si ça ne marche pas

1. Note l'écran où le problème est apparu (par exemple « Séance solo, écran Chrono »).
2. Note l'heure, et ce que tu as touché juste avant (par exemple « Pause, puis Reprendre »).
3. Fais une capture d'écran.
4. Envoie la capture et les notes au gérant.

Ne réinstalle pas l'app pour régler le problème. Recharge d'abord une sauvegarde (voir le début de cette recette).
