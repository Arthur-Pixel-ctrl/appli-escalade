# Audit « redesign » : l'app actuelle, puis la proposition Topo

Méthode : grille de la compétence *redesign-existing-projects* (typographie, couleurs et surfaces, mise en page,
interactions et états, contenu, composants, icônes, qualité du code, oublis) complétée par les *Web Interface
Guidelines* (accessibilité, focus, formulaires, mouvement, tactile). Les contrastes sont calculés (formule WCAG 2.1).
Captures de l'app actuelle (téléphone 390 × 844, et ordinateur 1366 × 860) : dossier `captures-actuelles/`.
Les constats sont classés : **[majeur]** gêne l'usage ou la sécurité, **[moyen]** gêne la lecture ou la cohérence,
**[mineur]** finition.

---

## Partie 1. L'app actuelle (état du 17/11/2026)

### Ce qui est déjà bien
- Une action principale claire par écran, boutons de 64 à 76 px, compteurs de 52 px : la règle des gros doigts est tenue.
- Chiffres tabulaires sur le chrono et les tableaux (`.chiffres`).
- Focus visible sur boutons et champs (`index.css:48`, `index.css:180`).
- Textes : tutoiement, phrases courtes, aucun point d'exclamation, erreurs qui disent quoi faire
  (`Erreur.tsx`, `Debrief.tsx:22-26`).
- Mouvement réduit respecté (`index.css:82`), `touch-action: manipulation` sur les boutons, `lang="fr"`, `theme-color`.
- Le chrono en plein écran avec bascule de fond à l'effort : bonne idée, à garder et renforcer.

### Typographie
1. **[moyen]** Une seule police (Geist) et une seule voix pour tout : titres, données, consignes, étiquettes.
   Rien ne distingue une durée, une cotation ou une étiquette du texte courant ; les chiffres clés du débrief se
   lisent comme du texte (`captures-actuelles/09-debrief.png`).
2. **[moyen]** Tailles de 12 et 13 px pour des informations utiles : jours de la semaine (`index.css:79`, 12 px),
   durées des étapes (`index.css:116`), légendes des chiffres clés (`index.css:163`), en-têtes de tableau
   (`index.css:167`), sous-lignes (`index.css:172`). À la salle, à bout de bras, c'est trop petit.
3. **[mineur]** Légende des chiffres clés qui se coupe en deux lignes (« étapes faites sur / 6 »,
   `09-debrief.png`) : le chiffre et son unité se séparent.
4. **[mineur]** Majuscule forcée par `.surtitre::first-letter` (`index.css:173`) : contournement fragile, la
   majuscule devrait venir du texte.

### Couleurs et surfaces
5. **[majeur]** **L'accent jaune `#E9F55B` concurrence les prises jaunes** (`#E8D44A`) : écart de couleur ΔE 17, c'est-à-dire
   presque la même couleur. Sur l'écran de séance en groupe (`10-seance-groupe.png`), le bouton « Flashé » jaune est
   juste sous la pastille « Jaune » : on peut croire qu'il s'agit de la couleur du bloc. Le plan v2 interdit
   exactement ce cas.
6. **[majeur]** **Le chrono ne distingue pas la préparation du repos** : les deux sont noirs (`06-chrono-prep.png`),
   seul le mot change. De loin, on sait seulement « effort ou pas ».
7. **[moyen]** Surfaces presque invisibles : bouton second `#232528` sur fond `#0C0D0E` = 1,27:1, carte `#17181A` =
   1,09:1, jauge vide = 1,63:1, filets = 1,39:1. Les limites des boutons seconds et des cartes se devinent à peine
   (`03-aujourdhui.png`, bouton « Je grimpe en groupe »).
8. **[moyen]** Bouton désactivé = accent à 40 % d'opacité (`index.css:157`) : il devient **olive**
   (`08-questions.png`), une couleur nouvelle qui ne dit pas « désactivé », et aucun texte n'explique ce qui manque.
9. **[moyen]** La pastille « Noir » (`#000000`) sur fond de bouton `#232528` = 1,37:1 : seule la bordure grise de 1 px la
   rend visible.
10. **[mineur]** Thème entièrement sombre et plat, sans texture ni profondeur : correct mais sans identité, loin de la
    direction choisie (fond clair possible, carnet, papier).

### Mise en page
11. **[majeur]** **Sur ordinateur, l'app est une colonne de téléphone de 480 px** perdue au milieu d'un écran noir, avec la
    barre d'onglets en bas (`14-aujourdhui-ordinateur.png`). Il n'existe aucune mise en page « bureau », alors que la
    v2 en fait l'usage principal de la planification.
12. **[moyen]** Le débrief est un long défilement de listes à poids égal (`09-debrief.png`) : étapes, semaine, suite,
    sans hiérarchie entre l'essentiel (charge, douleur, prochaine séance dure) et le détail.
13. **[mineur]** « Cette semaine » sur Aujourd'hui : 4 colonnes pour 4 séances, mais pas les jours de repos ; on ne voit
    pas le rythme de la semaine.

### Interactions et états
14. **[majeur]** **Boutons morts** : « Forme du jour » et « Assiette du jour » (`Aujourdhui.tsx:37-38`) sont des boutons sans
    action. Ils promettent quelque chose et ne font rien.
15. **[majeur]** `window.confirm` pour quitter une séance (`App.tsx:49`) et `window.alert` en cas d'échec d'enregistrement
    (`App.tsx:126`) : fenêtres du navigateur, petites, hors du style, difficiles à toucher avec de la magnésie, et
    l'alerte d'échec ne propose pas de réessayer.
16. **[moyen]** Aucun état de survol (souris) ; l'appui ne fait que descendre de 1 px (`index.css:70`) ; aucune
    transition. Sur ordinateur, l'interface paraît inerte.
17. **[moyen]** Chargement du débrief : écran vide (`Debrief.tsx:30`, `<main aria-busy>` sans contenu) ; Bilans affiche
    « Chargement… » en texte (`Historique.tsx:20`). Pas de silhouettes.
18. **[moyen]** Le chrono n'annonce pas les changements de phase aux lecteurs d'écran (`Chrono.tsx:73`, `aria-live="off"`
    sans zone d'annonce séparée).
19. **[mineur]** Onglet « Programme » = écran « en construction » (`App.tsx:163`) : impasse visible pour les testeurs.

### Contenu
20. **[moyen]** Date d'exemple figée : Aujourd'hui affiche « Lundi 17 novembre » (`Aujourdhui.tsx:4`) alors que le débrief
    du même jour dit « Mardi 17 novembre » (`09-debrief.png`). Les données d'exemple doivent disparaître (plan v2, §5).
21. **[mineur]** « Tes données restent sur cet appareil » (Profil, Bienvenue) deviendra faux avec les comptes.

### Composants
22. **[moyen]** Même composant `.ligne` pour une ligne cliquable (`Profil.tsx:43`, bouton) et une ligne d'information
    (`Debrief.tsx:72`, `div`) : rien ne les distingue à l'œil (pas de chevron, pas de survol).
23. **[moyen]** Sélection d'une couleur de bloc = bordure blanche de 2 px seulement (`index.css:139`) : peu visible en
    plein jour, et la pastille carrée de 14 px est petite.
24. **[mineur]** Tous les boutons sont de grands rectangles arrondis de même forme : principal, second, choix, compteur ;
    seule la couleur les distingue.

### Icônes
25. **[mineur]** Aucune icône : barre d'onglets en texte seul de 13 px (`index.css:56`), aucun repère visuel pour
    « solo », « groupe », « repos », « avertissement ».

### Qualité du code (côté interface)
26. **[moyen]** Couleurs écrites en dur hors des variables : `Chrono.tsx:29-30` (`#E9F55B`, `#0C0D0E`), `vite.config.ts:26-27`,
    `index.html:7`, `index.css:112` (`#8b8f94`). Changer de thème oblige à les chercher.
27. **[mineur]** Styles en ligne pour les couleurs de prises (`SeanceGroupe.tsx:67`, `Debrief.tsx:97`) : acceptable car la
    couleur vient des données ; à garder mais à encapsuler dans un composant `PastillePrise`.
28. **[mineur]** Les sections d'écran n'ont pas de titre (Aujourd'hui : « Cette semaine » est un `<p>`), la hiérarchie
    `h1` → `h2` est incomplète pour les lecteurs d'écran.

### Oublis
29. **[moyen]** Formulaire de profil sans validation : on peut valider un prénom vide (`ProfilFormulaire.tsx:37`, aucun contrôle avant `onValider`).
30. **[mineur]** Pas de lien d'évitement ; acceptable sur téléphone, à ajouter pour l'ordinateur (barre de navigation longue).
31. **[mineur]** `overscroll-behavior: none` sur tout le `body` (`index.css:33`) : voulu pour l'app installée, à limiter aux
    pointeurs fins si on veut garder le geste de rafraîchissement sur le site web.

### Synthèse de la partie 1
Les fondations d'usage sont bonnes (une action par écran, cibles larges, textes clairs). Les quatre problèmes à régler
en priorité : **l'accent jaune qui se confond avec les prises (5)**, **l'absence de mise en page ordinateur (11)**,
**les phases du chrono indistinctes hors effort (6)**, **les boutons morts et fenêtres du navigateur (14, 15)**.

---

## Partie 2. La proposition Topo, première version

Même grille passée sur `DESIGN.md` et les trois démos dans leur premier jet. Chaque constat a été **corrigé** dans les
fichiers livrés ; la colonne « Correction » dit comment.

| # | Grille | Constat sur le premier jet | Gravité | Correction appliquée |
|---|---|---|---|---|
| A1 | Couleurs | La résine servait à la fois à l'action, à la sélection (filtres, choix, semaine ouverte, interrupteur) et au bouton « Garder » de l'assistant : sur la démo du constructeur, six zones résine, l'action principale ne ressortait plus | majeur | **Sélection en encre pleine**, résine réservée à l'action principale, à « en cours » et au focus (`DESIGN.md` §2 et composant « Choix ») |
| A2 | Couleurs | Un vert « succès » (lichen) prévu pour l'état « fait » était à ΔE 21 du vert de prise | majeur | Pas de couleur de succès : « fait » = encre pleine ou résine douce + coche (`DESIGN.md` §2, « État ») |
| A3 | Couleurs | Gris mélangés : textes verdâtres (`#1C1E1D`, `#5B5E58`), bords et fonds chauds (`#8C8980`, `#E6E3DA`) | moyen | **Une seule famille de gris chaude** : texte `#1D1C19`, `#4B4943`, `#5D5A52` ; contrastes recalculés (14,8:1 ; 7,8:1 ; 6,0:1) |
| A4 | Couleurs | Le jaune de prise sur le fond magnésie : 1,3:1, pastille invisible sans aide | majeur | Bord encre obligatoire sur toute pastille (14,8:1) et nom écrit à côté |
| A5 | Couleurs | La rubalise « ambre et encre » en `#8A5200` et encre : deux couleurs sombres, rayures illisibles | moyen | Rayures en `--rubalise-avertissement` `#E9A23B` et encre ; rubalise d'arrêt brique et papier (comme le vrai ruban rouge et blanc) |
| A6 | Typographie | Big Shoulders n'a pas de chiffres tabulaires (mesure : le « 1 » fait 55 % des autres) : le chrono aurait sauté à chaque seconde | majeur | Chiffres du chrono posés dans des cases de 0,5 em (deux-points 0,24 em), règle écrite dans `DESIGN.md` §3 et appliquée dans `demo-chrono.html` |
| A7 | Typographie | Titres de 44 px en Big Shoulders sur ordinateur, qui passaient sur deux lignes et poussaient le sélecteur de vue hors du cadre | moyen | Titre de page du constructeur à 38 px sans retour à la ligne, en-tête qui passe à la ligne proprement (`flex-wrap`) |
| A8 | Typographie | Risque « capitales partout » : mentions, étiquettes, titres de carte en capitales | moyen | Capitales limitées à `titre-3`, `mention` et la consigne du chrono ; texte courant et boutons en phrase normale (`DESIGN.md` §3) |
| A9 | Composants | La pastille de prise ronde ressemblait à un simple rond de couleur, sans rapport avec une prise | moyen | Forme de prise irrégulière, inclinée, avec son **trou de vis** au centre (`demo-aujourdhui.png`) |
| A10 | Composants | La coche de sélection d'une couleur recouvrait le nom (« Rouge ») ; les noms débordaient de la grille | moyen | Coche dans un coin encre en haut à droite ; grille `repeat(3, minmax(0, 1fr))` |
| A11 | Composants | Bandeau « Cette semaine » à 7 colonnes avec le nom des séances : texte coupé (« Tech- ») | moyen | Cases à symbole (coche, carré résine, carré vide, tiret) + phrase « Prochaine : jeudi, technique (facile) » ; nom complet pour les lecteurs d'écran |
| A12 | Composants | « Carte générique bord + ombre + fond blanc » : si tout est en fiche, tout est en relief et plus rien ne ressort | moyen | Fiche réservée aux objets que l'on manipule (séance, protocole) ; regroupements en lignes ou carte simple sans ombre ; **une seule vis** dans les listes denses |
| A13 | Mise en page | Trois colonnes égales pour les blocs du cycle (motif « trois cartes » à éviter) | mineur | Gardé volontairement : les trois blocs ont la même durée, l'égalité visuelle dit une vérité du plan. Le bloc en cours est distingué (ombre, semaine ouverte) |
| A14 | Mise en page | Panneau d'assistant de 404 px qui écrase la semaine sous 1280 px | moyen | En dessous de 1280 px, le panneau passe par-dessus le contenu avec un voile (`parcours-et-ecrans.md` §3) |
| A15 | Interactions | Glisser-déposer seul pour composer une séance : impossible au clavier et pénible au doigt | majeur | Alternatives « Ajouter à… », « Déplacer », « Monter », « Descendre » sur chaque fiche (`parcours-et-ecrans.md` O-04, O-05) |
| A16 | Interactions | Avertissements répétés à trois niveaux (semaine, séance, étape) : bruit | moyen | Ouvert au niveau le plus précis, résumé ailleurs ; repliable par « Je garde ce choix » sans disparaître (`parcours-et-ecrans.md` §4) |
| A17 | Interactions | « Garder tout » de l'assistant en bouton principal aurait poussé à accepter sans lire | majeur | « Garder tout ce qui reste » en bouton discret, après les éléments ; aucun bouton résine dans le panneau |
| A18 | Accessibilité | Annotations manuscrites porteuses d'information (illisibles pour un lecteur d'écran, `aria-hidden`) | moyen | Règle : une annotation ne porte jamais une information unique ; une par écran au plus ; retirée après le premier usage |
| A19 | Accessibilité | Anneau de focus résine invisible sur le fond encre ou résine du chrono (2,1:1) | majeur | `--focus-sur-sombre` `#7FC4BA` (8,5:1 sur encre), montré sur la démo |
| A20 | Performance | Grain de fond en `background-attachment: fixed` : repeint coûteux sur téléphone | mineur | Tuile répétée, sans `fixed`, jamais sur le chrono |
| A21 | Identité | Risque de ressemblance avec l'inspiration (fond crème, cartes à ombre dure, notes à la main) | majeur | Chaque signe remplacé (tableau `DESIGN.md` §10) : fond gris craie, ombre verticale sans rotation, vis au lieu du ruban adhésif, repères carrés au lieu des cercles, sépia au lieu du bleu, trait de topo au lieu de la flèche, bouton résine sans bord orange, aucun emoji, autres polices |
| A22 | Contenu | Les textes d'exemple de la démo citaient un livre dans une source : il doit l'être par son titre seulement | mineur | Source écrite « cité par son titre », sans contenu du livre |
| A23 | Contenu | « Bloc » désigne à la fois la période de 4 semaines (« Bloc 1 · doigts ») et un bloc d'escalade (« bloc limite », « noter un bloc ») : risque de confusion sur un même écran | moyen | Gardé, c'est le mot d'Arthur ; la période porte toujours son numéro (« Bloc 1 ») et n'apparaît qu'en mention ou en titre de plan, jamais dans un écran de séance. Question posée à Arthur (Q9) |

### Points vérifiés et conformes après correction
- Contrastes texte ≥ 4,5:1 partout (le plus faible : `--texte-3` sur `--surface-creuse`, 5,4:1) ; bords des contrôles
  ≥ 3:1 (`--filet-fort` 3,0:1 sur fond, 3,4:1 sur surface) ; blanc sur résine 8,0:1 ; chrono 15,5:1 et 7,7:1.
- Cibles tactiles : 48 px minimum, 56 à 76 px pour les actions de séance (démos mesurées : boutons 60 à 76 px,
  compteurs 56 px, choix de couleur 52 px).
- Une seule action en résine par écran sur les trois démos.
- Aucun emoji, aucun point d'exclamation, pas de « Oups ».
- Icônes Phosphor (pas le jeu par défaut des générateurs), une seule graisse.
- Mouvement : `transform` et `opacity` seulement, durées 100 à 240 ms, rien sous `prefers-reduced-motion`.

### Risques qui restent (à surveiller pendant la réalisation)
- Lisibilité de Big Shoulders sous 22 px : la règle l'interdit, à vérifier en revue de code.
- Le brique d'arrêt reste proche du rouge de prise (ΔE 12) : il ne doit jamais apparaître dans une grille de pastilles.
- Le fond clair en salle très sombre ou le soir : à faire tester par Arthur (question Q3 de `parcours-et-ecrans.md`).
- Polices embarquées : environ 4 fichiers `woff2` latins (112 Ko au total, mesuré) dans le cache hors ligne ; à vérifier
  dans la configuration de l'app installée.
