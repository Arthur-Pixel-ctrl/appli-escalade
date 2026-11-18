# Guide Supabase : créer la base serveur de « Get me to 9a »

Ce guide est pour toi, Arthur. Il ne demande aucune connaissance technique : tu cliques, tu copies, tu colles, et à chaque étape on te dit ce que tu dois voir à l'écran.

- **Durée totale** : environ 1 h 15, en une ou deux fois. Tu peux t'arrêter entre deux étapes.
- **Quand le faire** : après la tâche F2-03 (le fichier SQL doit exister dans le dépôt) et avant la tâche F2-07 (la connexion a besoin du projet).
- **À préparer avant de commencer** : ton compte GitHub (celui du dépôt `appli-escalade`), un gestionnaire de mots de passe (ou un carnet sûr), ton téléphone (Google demande parfois une confirmation), et le dépôt ouvert sur ton ordinateur pour copier deux fichiers : `supabase/migrations/0001_documents.sql` et `supabase/verification.sql`.

Les noms des menus des sites Supabase et Google changent de temps en temps. Quand un nom ne correspond pas exactement, cherche le mot proche ; les endroits où le nom exact n'a pas pu être vérifié sont signalés par « (nom à confirmer à l'écran) ».

## Ce qui est public, ce qui est secret

**Public, tu peux le mettre dans le code et sur GitHub** : l'adresse du projet Supabase (`https://xxxxxxxx.supabase.co`) et la clé « publiable » (elle commence par `sb_publishable_`). Elles ne donnent accès qu'à ce que les règles de sécurité autorisent, c'est-à-dire, pour un visiteur non connecté, rien.

**Secret, à ne JAMAIS copier dans le dépôt, dans GitHub, dans un message ou dans un fichier du projet** :
- la clé qui commence par `sb_secret_` (l'app n'en a pas besoin) ;
- le mot de passe de la base de données (créé à l'étape 2) ;
- le « mot de passe d'application » Gmail (étape 5) : il ne vit que dans les réglages d'envoi d'e-mails de Supabase ;
- les clés API Claude des utilisateurs.

Règle simple : si une valeur ressemble à `sb_secret_…` ou à 16 lettres données par Google, elle ne sort pas de ton gestionnaire de mots de passe et des réglages Supabase.

## Étape 0 : créer l'adresse Gmail dédiée (10 min)

Cette adresse enverra les codes de connexion. Elle est réservée à l'app, pour ne pas mélanger avec ta boîte personnelle.

1. Va sur google.com, crée un nouveau compte Google, par exemple `getmeto9a.app@gmail.com` (ou ce qui est libre).
2. Sur ce compte, active la validation en deux étapes : ouvre `myaccount.google.com`, rubrique « Sécurité », et suis les écrans (le nom exact de la rubrique est à confirmer à l'écran). Google l'exige pour l'étape 5.
3. Range le mot de passe de ce compte dans ton gestionnaire de mots de passe.

Tu dois voir : la validation en deux étapes indiquée comme « activée » dans la page Sécurité.

## Étape 1 : créer le compte Supabase (5 min)

1. Va sur `supabase.com`, clique sur « Start your project » et connecte-toi avec ton compte GitHub.
2. Crée une organisation : nom **Get me to 9a**, offre **Free**.

Tu dois voir : le tableau de bord vide de l'organisation « Get me to 9a ».

## Étape 2 : créer le projet (5 min)

1. Clique sur « New project ». Nom : `appli-escalade` (ce nom ne change pas, même si l'app s'appelle « Get me to 9a »). Région : **West EU (Paris)**.
2. Mot de passe de la base : clique sur « Generate », puis range-le dans ton gestionnaire de mots de passe. L'app n'en a pas besoin : ne le donne à personne, ne le colle nulle part.
3. Clique pour créer le projet et attends une à deux minutes.

Tu dois voir : le tableau de bord du projet, sans message d'erreur ni indication « Setting up ».

## Étape 3 : créer la table et ses règles (5 min)

1. Dans le menu de gauche, ouvre « SQL Editor », puis « New query ».
2. Ouvre le fichier `supabase/migrations/0001_documents.sql` du dépôt, copie tout son contenu, colle-le dans l'éditeur, puis clique sur « Run ».
3. Si Supabase affiche un avertissement sur une requête « destructive » ou sur la sécurité, relis-le : le script ne supprime rien. Confirme.
4. Ouvre « Table Editor » dans le menu de gauche.

Tu dois voir : le message « Success. No rows returned » après le « Run », puis dans « Table Editor » les tables `documents` et `invites`, chacune avec la mention « RLS enabled » (RLS = règles qui isolent chaque utilisateur).

**Ne lance ce script qu'une seule fois.** Si tu le relances par erreur, Supabase répond « already exists » et ne change rien : ce n'est pas grave, tes données ne sont pas touchées.

### Vérifier que tout est bien protégé

1. « SQL Editor », « New query ».
2. Ouvre `supabase/verification.sql`. Copie **une requête à la fois** (chacune est précédée d'un commentaire qui dit le résultat attendu), colle-la, clique sur « Run » et compare.

| Requête | Résultat attendu |
|---|---|
| 1 | `true` |
| 2 | 4 lignes |
| 3 | une erreur « permission denied for table documents » (c'est le bon résultat) |
| 4 | une date |
| 5 | `true` |
| 6 | une erreur « permission denied for table invites » (c'est le bon résultat) |

Si l'un des résultats est différent, **arrête-toi** et dis-le dans la conversation de pilotage avant de continuer : la protection des données ne doit pas être approximative.

## Étape 3 bis : t'inscrire sur la liste d'invités (2 min)

Seules les adresses de la liste peuvent créer un compte. Inscris-toi **avant** ta première connexion.

1. « SQL Editor », « New query ».
2. Colle la ligne suivante, en remplaçant l'adresse par la tienne, **en minuscules**, puis « Run » :

```sql
insert into public.invites (email) values ('ton.adresse@exemple.fr');
```

Tu dois voir : « Success. No rows returned ». Dans « Table Editor », la table `invites` contient ta ligne.

Utilise l'adresse avec laquelle tu te connecteras dans l'app (pas forcément l'adresse Gmail dédiée, qui sert seulement à envoyer).

## Étape 4 : régler la connexion par e-mail (10 min)

1. Menu « Authentication », puis la page des fournisseurs de connexion (« Sign In / Providers ») et « Email ». Vérifie que « Email » est activé. Laisse la confirmation d'e-mail activée (« Confirm email »).
2. Sur cette page, trouve la durée de validité du code (« Email OTP Expiration ») et mets `3600` (une heure). Si tu vois aussi un réglage de longueur du code (« Email OTP Length », nom à confirmer à l'écran), mets `6`.
3. Dans « Authentication », ouvre « URL Configuration » (nom à confirmer à l'écran) : « Site URL » = `https://arthur-pixel-ctrl.github.io/appli-escalade/`.
4. Dans « Authentication », ouvre les modèles d'e-mails (« Email Templates »). Modifie **deux** modèles : « Confirm sign up » et « Magic link » (le nom peut s'afficher « Magic link or OTP »). Pour chacun :
   - Objet : `Ton code Get me to 9a : {{ .Token }}`
   - Contenu : `<p>Voici ton code pour te connecter à Get me to 9a :</p><p style="font-size:28px;letter-spacing:4px"><strong>{{ .Token }}</strong></p><p>Saisis-le dans l'app. Il est valable une heure. Si tu n'as rien demandé, ignore cet e-mail.</p>`
   - Enregistre (« Save »).

Pourquoi deux modèles : un nouvel utilisateur reçoit le modèle « Confirm sign up », un utilisateur déjà inscrit reçoit « Magic link ». Le code `{{ .Token }}` est le code à 6 chiffres : ne le modifie pas.

Tu dois voir : un message de confirmation après chaque enregistrement.

## Étape 5 : brancher l'envoi des e-mails par Gmail (15 min)

Sans cette étape, Supabase n'envoie des e-mails qu'aux membres de ton équipe Supabase, et 2 par heure au plus : tes amis ne recevraient rien.

1. Connecte-toi au compte Gmail dédié (étape 0) et vérifie que la validation en deux étapes est active.
2. Ouvre `myaccount.google.com/apppasswords`. Donne un nom, par exemple « Supabase », et crée le mot de passe d'application. Google affiche 16 caractères. Copie-les : ils ne s'affichent qu'une fois. Si la page n'existe pas pour toi, c'est que la validation en deux étapes n'est pas active (étape 0), ou que le compte est de type professionnel ou scolaire.
3. Dans Supabase, ouvre « Authentication », puis les réglages SMTP (« SMTP Settings », nom à confirmer à l'écran) et active le SMTP personnalisé (« Enable custom SMTP »). Remplis :
   - hôte : `smtp.gmail.com`
   - port : `587`
   - utilisateur : l'adresse Gmail dédiée
   - mot de passe : les 16 caractères de l'application (sans les coller ailleurs)
   - adresse d'expéditeur : l'adresse Gmail dédiée
   - nom d'expéditeur : `Get me to 9a`
4. Enregistre. Puis ouvre « Rate Limits » (dans « Authentication ») et laisse la limite d'e-mails par heure telle quelle (30 au départ, largement assez).

Tu dois voir : le réglage enregistré sans message d'erreur.

À savoir : tes amis verront l'adresse Gmail dédiée comme expéditeur. Plus tard, si tu veux un expéditeur plus propre, il faudra un nom de domaine (environ 10 € par an) et un service d'envoi comme Resend ; ce n'est pas prévu pour l'instant.

## Étape 6 : récupérer les deux valeurs publiques (2 min)

1. Dans les réglages du projet (« Project Settings »), ouvre « API Keys ». Copie la clé **publiable**, celle qui commence par `sb_publishable_`.
2. L'adresse du projet a la forme `https://xxxxxxxx.supabase.co`. Si tu ne la vois pas sur cette page, clique sur « Connect » en haut du tableau de bord du projet, ou cherche la page « Data API » dans les réglages.

**Ne copie jamais la clé qui commence par `sb_secret_`.** Ne la colle ni dans GitHub, ni dans un fichier du dépôt, ni dans une conversation.

## Étape 7 : les donner à GitHub (5 min)

1. Sur `github.com`, ouvre le dépôt `appli-escalade`, puis « Settings », « Secrets and variables », « Actions ».
2. Ouvre l'onglet **« Variables »** (pas « Secrets ») et clique sur « New repository variable » deux fois :
   - `VITE_SUPABASE_URL` = l'adresse du projet ;
   - `VITE_SUPABASE_CLE_PUBLIQUE` = la clé publiable.

Pourquoi des « variables » et pas des « secrets » : ces deux valeurs sont publiques par nature, elles seront lisibles dans l'app publiée.

Tu dois voir : les deux noms dans la liste des variables du dépôt.

## Étape 8 : lancer l'app sur ton ordinateur (2 min)

À la racine du dépôt, crée un fichier nommé `.env.local` (Git l'ignore, il ne sera pas publié) avec ces deux lignes, en remplaçant les `xxxxxxxx` par tes valeurs :

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_CLE_PUBLIQUE=sb_publishable_xxxxxxxx
```

Rien d'autre dans ce fichier : surtout pas de `sb_secret_`.

## Étape 9 : essayer (5 min, après la tâche F2-07)

1. Ouvre l'app, « Profil », « Compte », saisis ton adresse, reçois le code par e-mail et saisis-le. Dans Supabase, « Authentication », « Users » : ton adresse apparaît.
2. Essaie aussi une adresse **qui n'est pas** sur la liste d'invités. L'app doit afficher « Cette adresse n'est pas sur la liste d'invités ». **Note le message exact affiché** si c'est autre chose, et transmets-le : Supabase renvoie probablement une erreur générique, que l'app doit alors traduire (ce message n'a pas encore été vérifié).

## Inviter un ami (à tout moment)

1. « SQL Editor », « New query », colle la ligne suivante avec l'adresse de ton ami **en minuscules**, puis « Run » :

```sql
insert into public.invites (email) values ('prenom@exemple.fr');
```

2. L'ami reçoit ensuite son code en s'inscrivant depuis l'app. Sans cette ligne, l'app refuse son inscription.

Pour retirer une invitation non utilisée : `delete from public.invites where email = 'prenom@exemple.fr';`. Un compte déjà créé n'est pas affecté.

## Test d'isolement à deux comptes (après la tâche F2-10)

Ce test prouve que personne ne voit les données d'un autre.

1. Ajoute deux adresses à la liste d'invités (la tienne et une seconde que tu contrôles).
2. Ouvre l'app dans deux navigateurs différents (ou un navigateur et une fenêtre de navigation privée) et connecte-toi avec une adresse différente dans chacun.
3. Avec le premier compte, enregistre une séance.
4. Avec le second compte, regarde l'historique et lance une synchronisation.

Tu dois voir : aucune trace de la séance du premier compte dans le second. Si elle apparaît, **arrête tout** et signale-le immédiatement.

## Ce que tu peux voir (et ce que tu t'engages à ne pas regarder)

En tant qu'administrateur du projet, tu peux techniquement lire toutes les lignes de la table `documents` dans le tableau de bord (séances, douleurs, forme du jour des personnes invitées). L'app le dit à ses utilisateurs : « Tes données sont gardées sur un serveur en Europe administré par Arthur. Il peut techniquement les voir et s'engage à ne pas les consulter. Elles ne sont ni vendues ni partagées. »

Ton engagement : ne pas ouvrir la table `documents` pour lire les données des autres. Tu n'as besoin d'y aller que pour dépanner, avec l'accord de la personne.

## À savoir ensuite

- **Projet en pause** : sur l'offre gratuite, Supabase met un projet en pause après une période sans activité. Si l'app affiche « Synchronisation impossible » plusieurs jours de suite et que le tableau de bord indique « Paused », clique sur « Restore project ». Les données sont conservées et les téléphones renvoient ce qu'ils avaient en attente. Une petite tâche automatique hebdomadaire (F2-15) limite ce risque.
- **Assistant IA (phase 5)** : chaque utilisateur crée sa propre clé API dans la Console Claude ; tu n'as rien à faire pour les autres.
