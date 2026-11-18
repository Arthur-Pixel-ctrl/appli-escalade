# Audit de fin de phase 2 — « Get me to 9a »

18 novembre 2026 · Auditeur indépendant · Copie auditée : `/home/claude/audit-phase-2` (commit `512cf4c`, « Fusion de F2-16 »). Aucun fichier du dépôt n'a été modifié.

## Verdict

**Prêt pour la recette d'Arthur : oui, avec réserves.**
Aucune perte de données sur les parcours courants et aucune fuite trouvée : la base serveur isole bien chaque compte (essais réels sur PostgreSQL 16), aucun secret dans le dépôt ni dans l'historique.
Deux réserves à traiter tôt : « Sauvegarder puis effacer » efface sans savoir si le fichier existe, et la séance en groupe n'a pas de bouton « Stop, ça fait mal ».

| Gravité | Nombre |
|---|---|
| Bloquant | 0 |
| Important | 2 |
| Mineur | 11 |

## Commandes lancées

- `npm ci` : réussi. `npm audit --omit=dev` : 0 vulnérabilité.
- `npm run test` : 20 fichiers, 199 tests, tous passent.
- `npm run build` : réussi (PWA générée, 15 fichiers précachés).
- `npm run lint` (oxlint) : 0 erreur, 1 avertissement sans gravité (`src/chrono/useRepos.ts:19`, `setState` dans un effet).
- Script SQL `supabase/migrations/0001_documents.sql` exécuté sur un PostgreSQL 16 local, avec une imitation minimale de Supabase (schéma `auth`, rôles `anon` et `authenticated`, `auth.uid()`, droits par défaut de Supabase). Scripts dans `/home/claude/audits/preuves/` (`shim.sql`, `tests.sql`).
- Deux tests de l'auditeur, lancés dans la copie seulement : `/home/claude/audits/preuves/audit.test.ts`.
- Calcul des contrastes des variables de `src/index.css` : `/home/claude/audits/preuves/contraste.py`.

---

## Constats importants

### I-1. « Sauvegarder puis effacer » efface même si le fichier n'a pas été enregistré

**Ce qui peut arriver.** Sur un appareil lié au compte A, quelqu'un se connecte avec le compte B. L'app propose « Sauvegarder dans un fichier puis effacer ». Si le téléchargement est annulé ou échoue, l'appareil est quand même vidé. Les modifications pas encore envoyées au compte A n'existent alors plus nulle part. La fenêtre a pourtant annoncé qu'elles seraient « seulement dans le fichier de sauvegarde ».

**Où.** `src/ecrans/Compte.tsx:204-210` (`telechargerFichier`) et `src/ecrans/Compte.tsx:445-452` (`sauvegarderPuisEffacer`).

**Preuve.** `lien.click()` lance le téléchargement et rend la main tout de suite. Le code ne peut pas savoir si le fichier a été écrit, et il efface juste après :

```ts
// Compte.tsx:204-209
lien.download = `appli-escalade-sauvegarde-${jourLocal()}.json`
lien.click()
URL.revokeObjectURL(lien.href)

// Compte.tsx:450-452
telechargerFichier(await sauvegardeComplete())
// On n'efface que ce que l'utilisateur a vu dans la confirmation.
await effacerDonneesLocales({ enAttenteAcceptees: e.enAttente })
```

Le commentaire « Le fichier d'abord : si la sauvegarde échoue, rien n'est effacé » (ligne 449) ne couvre que l'échec de `sauvegardeComplete()`. Il ne couvre pas un téléchargement refusé : demande de confirmation sur iPhone, boîte « Enregistrer sous » annulée sur ordinateur, ou app installée qui ne gère pas le téléchargement.
Portée limitée : ce qui a déjà été envoyé reste sur le compte A. Seules les modifications « en attente » (`enAttente`) sont perdues. Sans modification en attente, rien n'est perdu.
Même défaut, sans effacement : `src/ecrans/Profil.tsx:22-29`. Le message « Sauvegarde créée dans tes téléchargements. » s'affiche toujours, même si rien n'a été enregistré. `exporterDonnees()` n'y est pas non plus protégée par un `try` : une erreur ne donne aucun message.

**Correction proposée.** Faire deux étapes : 1) « Créer le fichier » ; 2) une fois le fichier créé, la question « As-tu bien le fichier dans Fichiers > Téléchargements ? » avec le bouton « Oui, effacer cet appareil ». Mieux encore : s'il reste des modifications en attente, désactiver l'effacement et proposer d'abord « Revenir au compte d'origine pour les envoyer ». Sur iPhone, on peut aussi envoyer le fichier par `navigator.share({ files })` : l'app sait alors si le partage a été annulé. Dans `Profil.tsx`, mettre `exporter` dans un `try` et écrire « Fichier proposé au téléchargement : vérifie qu'il est bien dans tes fichiers ».
À ajouter à la recette (A11 et B) : vérifier que le fichier est bien dans l'app Fichiers de l'iPhone, en mode installé (icône de l'écran d'accueil). Ne pas se fier seulement au message.

### I-2. Pas de « Stop, ça fait mal » pendant une séance en groupe, ni dans les étapes solo sans chrono

**Ce qui peut arriver.** Pendant une séance en groupe, la plus risquée pour les doigts (« 3 blocs durs à réglettes »), le grimpeur qui sent un « pop » n'a aucun bouton vers les signaux d'arrêt. Il ne peut que « Quitter », et sa séance n'est alors pas enregistrée, ou aller au bout pour répondre « Oui » à la question sur la douleur. Même chose dans une séance solo, pour les étapes « liste » et « essais » (poutre, bloc).

**Où.** `src/ecrans/SeanceGroupe.tsx:48-121` (aucun bouton `.bouton.arret`). `src/ecrans/SeanceSolo.tsx:54-110` : le bouton n'existe que dans le chrono, `src/ecrans/Chrono.tsx:138`.

**Preuve.**
```
$ grep -n -iE "ça fait mal|douleur" src/ecrans/SeanceGroupe.tsx src/ecrans/SeanceSolo.tsx src/ecrans/Chrono.tsx
src/ecrans/SeanceSolo.tsx:37:  if (gardeOuverte) return <MisesEnGarde apresDouleur ... />
src/ecrans/SeanceSolo.tsx:49:          if (raison === 'douleur') setGardeOuverte(true)
src/ecrans/Chrono.tsx:138:  <button className="bouton arret centre" onClick={() => onQuitter('douleur')}>Stop, ça fait mal</button>
```
La consigne de `CLAUDE.md` (« afficher les signaux d'arrêt ») et le parcours P5 de `docs/specs/design/parcours-et-ecrans.md:100` (« Stop, ça fait mal » mène aux mises en garde) ne sont donc tenus que dans le chrono.

**Correction proposée.** Ajouter un bouton `.bouton.arret` « Stop, ça fait mal » dans l'en-tête ou en bas de `SeanceGroupe` et de `SeanceSolo`. Il ouvrirait `MisesEnGarde apresDouleur` par-dessus la séance, sans la perdre, comme le fait déjà `SeanceSolo` avec `gardeOuverte`. En sortant, proposer « Terminer et enregistrer » (la question douleur sera alors pré-cochée sur « Oui ») ou « Revenir à la séance ».

---

## Constats mineurs

### M-1. Un seul document refusé par le serveur arrête toute la synchronisation, réception comprise

**Ce qui peut arriver.** Le serveur peut refuser un document : identifiant de plus de 100 caractères, contenu de plus de 200 ko, caractère interdit. Cela peut venir d'un fichier de sauvegarde rechargé. Le paquet entier est alors refusé à chaque essai, et l'app ne reçoit plus rien des autres appareils, car l'envoi passe avant la réception. L'indicateur affiche en boucle un message technique en anglais.
**Où.** `src/synchro/synchro.ts:54-55` (envoi, puis réception), `:86` (un paquet de 100 entier), `src/donnees/base.ts:162-175` (l'import ne vérifie ni la longueur de `id` ni la taille).
**Preuve.** Test de l'auditeur `preuves/audit.test.ts`, « un seul document refusé… » (réussi). Un import avec `id` de 101 caractères fait échouer deux synchros de suite, et la séance « venue-du-pc » n'arrive jamais. La contrainte SQL refuse bien la ligne : `ERROR: new row for relation "documents" violates check constraint "documents_id_check"`.
**Correction.** Dans `pousser`, si un paquet échoue, le renvoyer document par document et marquer les refusés (par exemple dans `etatSynchro`, clé `refuses`) sans les bloquer. Faire `tirer` même si `pousser` a échoué. À l'import, écarter les documents dont `id` dépasse 100 caractères. Traduire le message d'erreur dans l'indicateur. À faire avant la phase 5 : les brouillons de l'assistant (`TraceAssistant`) grossiront les documents.

### M-2. Après la suppression du compte, un échec silencieux peut faire croire que les données sont encore sur le serveur

**Ce qui peut arriver.** Deux cas : `delierAppareil()` échoue, ou l'app est fermée entre la suppression sur le serveur et cette ligne. L'appareil garde alors l'identifiant du compte supprimé. Plus tard, avec un nouveau compte, l'écran « Cet appareil est lié à un autre compte » dit « Elles restent sur le compte d'origine » et propose d'effacer. Or ce compte n'existe plus.
**Où.** `src/ecrans/Compte.tsx:333` (erreur avalée ; le commentaire « le prochain lien repartira de zéro » est faux : il partira en « autre compte »), `src/ecrans/Reprise.tsx:127`.
**Correction.** En cas d'échec, réessayer `delierAppareil()` et prévenir. Noter, avant d'appeler `supprimer_mon_compte`, un état `compteSupprimeEnCours` dans `etatSynchro`, et terminer le détachement au démarrage suivant s'il est encore là.

### M-3. Après un premier lien interrompu, la synchronisation automatique ne démarre qu'au prochain lancement de l'app
**Ce qui peut arriver.** Le réseau coupe pendant le premier lien d'un appareil sans séance. L'utilisateur touche « Relier mes données à mon compte », puis « Synchroniser maintenant ». Rien ne se passe, et l'erreur reste affichée tant que l'app n'est pas relancée. Aucune donnée n'est perdue.
**Où.** `src/ecrans/Compte.tsx:426-429` : dans le cas `meme_compte`, `synchroniserMaintenant()` ne fait rien, car la synchro automatique n'a jamais démarré. `signalerCompteLie()` n'est appelé que dans `lier` (ligne 399), et `App.tsx:72-82` n'a démarré la synchro que si `compteId` valait déjà `userId`.
**Correction.** Dans `verifier`, cas `meme_compte` : appeler `signalerCompteLie()` avant `synchroniserMaintenant()`.

### M-4. « Me déconnecter » déconnecte aussi les autres appareils
**Ce qui peut arriver.** Arthur se déconnecte sur son téléphone, et son ordinateur est déconnecté lui aussi, sans prévenir. Les modifications restent sur l'ordinateur et partiront à la reconnexion.
**Où.** `src/compte/session.ts:78` : `client.auth.signOut()` sans option. Dans la version installée, l'option par défaut est `global` (`node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:3439` : `async signOut(options = { scope: 'global' })`).
**Correction.** `client.auth.signOut({ scope: 'local' })`.

### M-5. Un profil supprimé est encore lu comme s'il existait
**Ce qui peut arriver.** Aucun écran ne supprime le profil aujourd'hui. Si une version future le fait, sur un appareil ou sur l'autre, l'app continuera de l'afficher.
**Où.** `src/donnees/base.ts:126-130` (`lireProfil` ne regarde pas `supprimeLe`), alors que `lireUn` (`stockage.ts:48-51`) le fait.
**Preuve.** Test de l'auditeur « lireProfil renvoie un profil supprimé » (réussi).
**Correction.** `lireProfil` passe par `lireUn('reglages', 'profil')`.

### M-6. Une sauvegarde rechargée ne part pas tout de suite au serveur, et les écrans ne se relisent pas
**Ce qui peut arriver.** Après « Recharger une sauvegarde », les séances n'apparaissent dans Bilans qu'en changeant d'onglet, et ne partent au compte qu'au prochain tour (jusqu'à 5 minutes).
**Où.** `src/donnees/base.ts:205-217` : `importerDonnees` écrit sans prévenir les abonnés (ni `surEcriture`, ni `signalerDonneesChangees`).
**Correction.** À la fin de `importerDonnees`, appeler les deux, en exportant de `stockage.ts` une fonction `signalerEcriture()`.

### M-7. Rien ne demande au navigateur de garder les données
**Ce qui peut arriver.** Si l'app est utilisée sans compte dans un onglet de navigateur, et non installée, le navigateur peut effacer ses données : manque de place, ou Safari après 7 jours sans visite. L'app installée sur l'écran d'accueil de l'iPhone n'est pas concernée par la règle des 7 jours.
**Où.** Aucun appel à `navigator.storage.persist()` (`grep -rn "storage.persist" src` ne trouve rien).
**Correction.** Appeler `navigator.storage?.persist?.()` après le premier enregistrement, dans `enregistrerProfil` ou au démarrage.

### M-8. La protection contre une clé secrète n'agit qu'au lancement de l'app et ne reconnaît pas l'ancienne clé `service_role`
**Ce qui peut arriver.** Si une clé secrète est collée par erreur dans la variable GitHub `VITE_SUPABASE_CLE_PUBLIQUE`, elle est quand même écrite dans les fichiers publiés sur GitHub Pages. L'app refuse seulement de s'en servir, ce qui n'empêche pas qu'on la lise. Une ancienne clé `service_role` (texte qui commence par `eyJ…`) n'est même pas refusée : elle passerait outre toutes les règles d'accès.
**Où.** `src/compte/client.ts:7-11` (`configurationValide` ne teste que `sb_secret_`), `.github/workflows/mise-en-ligne.yml` (étape `npm run build`).
**Correction.** Refuser aussi toute clé qui ne commence pas par `sb_publishable_`. Ajouter avant `npm run build`, dans le workflow, une étape qui échoue si `VITE_SUPABASE_CLE_PUBLIQUE` ne commence pas par `sb_publishable_`.

### M-9. Séance en groupe : « Terminer la séance » sans aucun bloc noté ne demande pas de confirmation
**Ce qui peut arriver.** Un appui par erreur sur « Terminer la séance » enregistre une séance vide.
**Où.** `src/ecrans/SeanceGroupe.tsx:120`. La spécification T-09 (`docs/specs/design/parcours-et-ecrans.md`, « puis confirmation si aucun bloc n'est noté ») n'est pas appliquée.
**Correction.** Si `blocs.length === 0`, ouvrir `Confirmation` (« Aucun bloc noté. Terminer quand même ? »).

### M-10. Vocabulaire : « en blocs de 4 à 12 semaines » dans un texte de la bibliothèque
**Ce qui peut arriver.** Le texte de progression d'un protocole parle de « blocs » de semaines, alors que l'app dit « Phase » (décision B9, règle R-2). Il apparaîtra dans la fiche protocole en phase 3.
**Où.** `src/donnees/bibliotheque/puissance.ts:115`.
**Correction.** « …sur des périodes de 4 à 12 semaines… » (ou « sur 1 à 3 phases »).

### M-11. Lecteur d'écran : le focus ne suit pas les changements d'écran
**Ce qui peut arriver.** Avec VoiceOver, après « Je grimpe seul » ou la fin d'une séance, le focus reste sur un bouton disparu. Le nouvel écran n'est pas annoncé.
**Où.** `src/App.tsx` : aucun déplacement du focus quand `vue` change. Seuls `Confirmation.tsx:27`, `ProfilFormulaire.tsx:42` et le lien d'évitement de `BarreBureau.tsx:52` déplacent le focus.
**Correction.** Mettre `tabIndex={-1}` sur le `h1` de chaque écran et le focaliser au montage, avec un petit crochet `useFocusTitre()`.

---

## Vérifié et trouvé correct

**Données locales**
- Migration Dexie v2 → v3 (`src/donnees/base.ts:41-72`) : elle ne fait qu'ajouter des champs (`aEnvoyer`, `versionFormat`, `creeLe`, champs récents du profil). Rien n'est retiré, aucune clé primaire ne change. Les séances v1 avaient déjà `creeLe` et `modifieLe` (vérifié dans le commit `aaa07fe`). Couvert par `migration.test.ts`.
- Écriture unique : en dehors de `ecrire()` et `supprimer()`, les seuls `put`, `modify` et `clear` sur les tables synchronisées sont la migration, l'import, la synchro, le choix « profil du compte » et `effacerDonneesLocales`. Tous sont voulus (`grep` sur `.put(` `.modify(` `.clear(` …). Aucun écran n'écrit directement dans Dexie.
- Suppressions douces : le document reste, `supprimeLe` est envoyé, `lireTous` et `lireUn` le masquent (sauf `lireProfil`, voir M-5).
- Synchronisation : la marque « à envoyer » n'est retirée que si `modifieLe` n'a pas bougé pendant l'envoi (`synchro.ts:98-107`, dans une transaction). Le curseur n'avance qu'une fois la page appliquée. La pagination repart de la dernière ligne reçue, avec 60 s de marge entre deux synchros. Une seule synchro tourne à la fois. Une ligne de type inconnu est ignorée. Une ligne sans `modifieLe` valable ne remplace jamais le local.
- Synchro pendant une séance : la séance en cours ne vit que dans l'état React (`App.tsx`, `vue`). L'arrivée de données ne relit que le profil (`App.tsx:63-67`) et ne démonte pas l'écran de séance. Aucun rechargement de page hors de l'écran Compte. Mise à jour de l'app en mode « prompt » (`vite.config.ts`).
- Reprise : lier ne supprime rien. Le choix de profil est demandé quand les deux diffèrent. `effacerDonneesLocales` refuse s'il y a plus de modifications en attente que le nombre accepté, et utilise `clear` sans supprimer la base. L'écran « autre compte » annonce le nombre de modifications en attente.
- Sauvegarde : un fichier v1 (`{version:1, tables:{seancesRealisees, reglages}}`) est relu. Un fichier v2 contient les 11 tables et les suppressions, sans `aEnvoyer`, ni `etatSynchro`, ni `appareil`. La règle « le plus récent gagne » est appliquée à l'import. « J'ai une sauvegarde » sur l'accueil recharge le fichier avant toute création de profil.

**Serveur** (essais réels sur PostgreSQL 16 avec `preuves/tests.sql` ; tous les résultats attendus obtenus)
- B ne lit, ne modifie ni ne supprime aucune ligne de A. B ne peut pas écrire une ligne au nom de A (insertion ou `upsert`), ni déplacer sa propre ligne vers A. Erreur obtenue : `new row violates row-level security policy`.
- `recu_le` envoyé par l'app est ignoré : le déclencheur le remplace par l'heure du serveur. Un `upsert` plus ancien que la version du serveur ne change rien, ni le contenu ni `recu_le`. Une date `modifie_le` falsifiée ne touche que les données de celui qui la falsifie.
- `anon` : `permission denied` sur `documents`, sur `invites` et sur `supprimer_mon_compte` ; `ping()` répond. `authenticated` ne lit pas `invites`.
- Les quatre fonctions ont `search_path=""`. `supprimer_mon_compte` (`security definer`) n'est exécutable que par `authenticated` (et `service_role`), et ne supprime que le compte appelant. `verifier_invitation` refuse une adresse absente et accepte une adresse invitée, quelle que soit la casse. Les fonctions de déclencheur ne peuvent pas être appelées directement.
- Déclencheur sur `auth.users` : Supabase autorise toujours la création de déclencheurs sur `auth.users` depuis les restrictions du 21 avril 2025. Seules la création de tables et de fonctions dans le schéma `auth` et les écritures sur les tables de migration sont interdites ([changelog Supabase](https://supabase.com/changelog/34270-restricting-access-on-auth-storage-and-realtime-schemas-on-april-21-2025)). Les deux fonctions vivent dans `public` : c'est compatible. Le message renvoyé par Supabase (« Database error saving new user ») est bien traduit (`session.ts:27`).

**Secrets**
- Aucune clé `sb_secret_…`, `sk-ant-…`, JWT ni mot de passe dans les fichiers ou l'historique (`git log -p --all | grep`). Seules occurrences : des valeurs d'exemple dans les tests et `.env.exemple`. `.env.local` est ignoré par git (`*.local`). `dist/` ne contient aucune clé.
- La clé API Claude vit dans la table `appareil` : elle n'est ni dans `TABLES_SYNCHRONISEES` ni dans l'export (tests `stockage.test.ts:92-106`, `sauvegarde.test.ts:31-40`), et elle est effacée avec l'appareil.
- Les workflows GitHub n'utilisent que des `vars` publiques et des permissions minimales.

**Moteur** : `src/moteur/` n'importe que des types et n'utilise ni `window`, ni `document`, ni `Date.now()` : l'heure est passée en paramètre (`horloge.ts`). Le test `independance.test.ts` le vérifie.

**Sécurité de l'entraînement**
- Le composant `Avertissement` ne bloque jamais. L'alerte « Plus de 4 essais » laisse ajouter des essais. Les signaux d'arrêt (`role="alert"`) sont visibles dans `MisesEnGarde`, depuis le profil, après une douleur déclarée et depuis le chrono.
- Prérequis par défaut à `null` (« non rempli ») dans `PROFIL_VIDE`, et « Je ne sais pas » remet à `null`. La douleur déclarée aux trois questions mène aux mises en garde avant le débrief.

**Accessibilité**
- Anneau de focus de 3 px sur tous les éléments interactifs ; anneau clair sur les fonds sombres du chrono.
- Toutes les cibles font au moins 48 px (boutons 56 à 76 px, `.bouton-texte` et `.bouton-discret` 48 px, `.choix` 52 px, compteur 56 px).
- `Confirmation` utilise un `<dialog>` modal natif : le focus reste dans la fenêtre et revient à l'origine. Le focus démarre sur « Rester ». Échap appelle `onRester`.
- Avertissements : `role="status"` ; signal d'arrêt : `role="alert"`.
- Contrastes : texte ≥ 5,4:1 partout (texte-3 sur fond 5,99 ; sur bouton désactivé 5,37 ; brique sur son fond 5,66 ; blanc sur résine 8,04). Bords de champs 3,35:1. Focus clair sur repos 4,02:1.
- Aucune couleur en dur dans les écrans (seule la pastille de prise reçoit la couleur de la salle, comme prévu), et aucun `window.confirm` ni `alert`.

**Règles** : « Phase » à l'écran (`Aujourdhui.tsx`, `EnConstruction`), interface en français. Sur ordinateur, aucun bouton de séance (`MiseEnPageBureau.tsx` ne reçoit pas `onSeanceSolo`) et la phrase « Les séances se lancent depuis ton téléphone » est affichée (R-6). R-8 : rien de calculable n'est stocké dans les nouvelles tables (statut de séance planifiée, durées, marqueurs absents des types). Les `objectifs[].fait` d'une séance réalisée sont un instantané historique, déjà présent en v1.

---

## Ce que je n'ai pas pu vérifier sans le vrai projet Supabase (ou un vrai iPhone)

- Le vrai comportement de `supprimer_mon_compte` : le rôle `postgres` de Supabase a-t-il bien le droit de supprimer dans `auth.users` ? (Rien ne l'interdit d'après le changelog. À tester en recette B : suppression du compte, puis vérification dans le tableau de bord.)
- L'exécution du déclencheur `verifier_invitation` par `supabase_auth_admin` sur un vrai `signInWithOtp`, et le message d'erreur exact renvoyé.
- Le modèle d'e-mail (présence de `{{ .Token }}`, code à 6 chiffres, durée de validité, adresse d'envoi Gmail) et les limites d'envoi.
- La région du serveur (« Europe », annoncée dans `Compte.tsx:34`).
- Les valeurs `vars.VITE_SUPABASE_URL` et `vars.VITE_SUPABASE_CLE_PUBLIQUE` de GitHub, et le contenu du vrai `dist/` publié. Ma construction locale n'a pas de configuration : je n'ai donc pas pu vérifier que la clé publiée commence par `sb_publishable_`.
- Le réglage PostgREST « Max rows » du projet (la page de 500 lignes suppose une limite d'au moins 500 ; elle est de 1 000 par défaut).
- Le réveil (`reveil-supabase.yml`) sur le vrai projet.
- Sur iPhone, en mode installé : le téléchargement du fichier de sauvegarde (voir I-1), la reprise de la base après un long passage en arrière-plan (`avecReprise`), le maintien de l'écran allumé et les bips.
