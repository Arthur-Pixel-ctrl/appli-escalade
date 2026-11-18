---
version: 1.0
name: Topo, système de design de Get me to 9a
description: |
  Un carnet de salle d'escalade. Fond « magnésie » gris craie à grain de poudre, encre presque noire,
  une seule couleur d'action, la « résine » (vert pétrole sombre), qui ne ressemble à aucune couleur de prise.
  Titres très gras et étroits comme les panneaux d'une salle, chiffres et cotations en chasse fixe,
  annotations au feutre sépia. Quatre signes tirés de la salle font l'identité : l'étiquette de voie
  (les fiches), la pastille de prise (seul endroit où les couleurs de blocs apparaissent), la rubalise
  (les avertissements) et le trait de topo (les annotations). Le relief vient d'une ombre dure verticale,
  comme une prise vissée qui dépasse du mur.

# Les clés correspondent aux variables CSS de src/index.css (--fond, --surface…).
colors:
  fond: "#F1EFE9"            # magnésie : fond de page
  surface: "#FBFAF7"         # papier : cartes, champs, panneaux
  surface-creuse: "#E6E3DA"  # pierre : zones en retrait, choix non sélectionnés, cases vides du calendrier
  texte: "#1D1C19"           # encre : texte principal, bords forts, ombre de relief
  texte-2: "#4B4943"         # texte secondaire
  texte-3: "#5D5A52"         # mentions, aides, métadonnées
  filet: "#C9C5BA"           # séparateurs décoratifs (pas de contraste exigé)
  filet-fort: "#8C8980"      # bord des champs et des contrôles (contraste 3:1 au moins)
  accent: "#0F5A54"          # résine : action principale, en cours, aujourd'hui, focus
  accent-presse: "#0B4540"   # bouton principal appuyé
  accent-doux: "#D5E6E2"     # fond d'un élément fait ou sélectionné sans être l'action
  sur-accent: "#FFFFFF"      # texte sur la résine
  relief: "#1D1C19"          # ombre dure des éléments en relief (= encre)
  annotation: "#7A4420"      # sépia : notes manuscrites, trait de topo
  avertissement: "#8A5200"   # ambre : avertissement non bloquant
  avertissement-fond: "#FBEFD5"
  rubalise-avertissement: "#E9A23B" # rayures de la rubalise ambre (décor, alterne avec l'encre)
  arret: "#A32E1E"           # brique : signal d'arrêt, douleur, « Stop, ça fait mal »
  arret-fond: "#F8E1DC"
  rubalise-arret: "#A32E1E"  # rayures de la rubalise d'arrêt (alterne avec le papier, comme la vraie rubalise rouge et blanche)
  chrono-preparation-fond: "#1D1C19"
  chrono-preparation-texte: "#F6F4EE"
  chrono-effort-fond: "#F6F4EE"
  chrono-effort-texte: "#1D1C19"
  chrono-repos-fond: "#0F5A54"
  chrono-repos-texte: "#FBFAF7"
  focus-sur-sombre: "#7FC4BA" # anneau de focus sur fond encre ou résine

typography:
  affiche:
    fontFamily: Big Shoulders Display
    fontSize: 44px
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: 0.005em
  titre-1:
    fontFamily: Big Shoulders Display
    fontSize: 36px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: 0.005em
  titre-2:
    fontFamily: Big Shoulders Display
    fontSize: 28px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: 0.01em
  titre-3:
    fontFamily: Big Shoulders Display
    fontSize: 22px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: 0.03em
    textTransform: uppercase
  texte-grand:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.45
  texte:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  texte-fort:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.5
  texte-petit:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  bouton:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.2
  mention:
    fontFamily: Atkinson Hyperlegible Mono
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.06em
    textTransform: uppercase
  donnee:
    fontFamily: Atkinson Hyperlegible Mono
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.4
  chiffre-cle:
    fontFamily: Atkinson Hyperlegible Mono
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.0
  chrono-nombre:
    fontFamily: Big Shoulders Display
    fontSize: min(76vw, 300px)
    fontWeight: 900
    lineHeight: 0.85
    chiffres: chaque chiffre dans une case de 0.5em, le deux-points dans une case de 0.24em (la police n'a pas de chiffres tabulaires)
  chrono-consigne:
    fontFamily: Big Shoulders Display
    fontSize: 40px
    fontWeight: 900
    lineHeight: 1.0
    letterSpacing: 0.04em
    textTransform: uppercase
  manuscrit:
    fontFamily: Gochi Hand
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.2

rounded:
  etiquette: 2px   # étiquettes, mentions, repères numérotés
  champ: 4px       # champs, choix, cases du calendrier
  carte: 6px       # cartes, panneaux
  bouton: 6px      # boutons
  rond: 999px      # anneau de focus des pastilles, points de jauge

spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 24px
  6: 32px
  7: 48px
  8: 64px

shadows:
  relief-bouton: "0 4px 0 #1D1C19"     # bouton au repos
  relief-bouton-appuye: "0 0 0 #1D1C19" # bouton appuyé : il descend de 4px
  relief-carte: "0 3px 0 #1D1C19"       # fiche, carte en relief
  relief-flottant: "0 6px 0 #1D1C19"    # panneau d'assistant, menu, élément glissé

components:
  bouton-principal:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.sur-accent}"
    border: 2px solid {colors.texte}
    shadow: "{shadows.relief-bouton}"
    typography: "{typography.bouton}"
    rounded: "{rounded.bouton}"
    minHeight: 64px
    padding: 14px 20px
  bouton-principal-appuye:
    backgroundColor: "{colors.accent-presse}"
    transform: translateY(4px)
    shadow: "{shadows.relief-bouton-appuye}"
  bouton-second:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.texte}"
    border: 2px solid {colors.texte}
    shadow: "{shadows.relief-bouton}"
    typography: "{typography.bouton}"
    rounded: "{rounded.bouton}"
    minHeight: 56px
  bouton-discret:
    backgroundColor: transparent
    textColor: "{colors.texte}"
    textDecoration: underline 2px, décalage 4px
    typography: "{typography.texte-fort}"
    minHeight: 48px
  bouton-arret:
    backgroundColor: "{colors.arret-fond}"
    textColor: "{colors.arret}"
    border: 2px solid {colors.arret}
    shadow: 0 4px 0 {colors.arret}
    typography: "{typography.texte-fort}"
    minHeight: 64px
  bouton-desactive:
    backgroundColor: "{colors.surface-creuse}"
    textColor: "{colors.texte-3}"
    border: 2px dashed {colors.filet-fort}
    shadow: none
  fiche:
    backgroundColor: "{colors.surface}"
    border: 2px solid {colors.texte}
    shadow: "{shadows.relief-carte}"
    rounded: "{rounded.carte}"
    padding: 16px
  carte-simple:
    backgroundColor: "{colors.surface}"
    border: 1px solid {colors.filet}
    rounded: "{rounded.carte}"
    padding: 16px
  etiquette:
    backgroundColor: "{colors.texte}"
    textColor: "{colors.fond}"
    typography: "{typography.mention}"
    rounded: "{rounded.etiquette}"
    padding: 3px 8px
  etiquette-contour:
    backgroundColor: transparent
    textColor: "{colors.texte}"
    border: 1.5px solid {colors.texte}
    typography: "{typography.mention}"
    rounded: "{rounded.etiquette}"
    padding: 2px 7px
  repere-numero:
    backgroundColor: "{colors.texte}"
    textColor: "{colors.fond}"
    typography: "{typography.donnee}"
    size: 28px
    rounded: "{rounded.etiquette}"
  pastille-prise:
    width: 30px
    height: 24px
    border: 1.5px solid {colors.texte}
    rounded: 64% 36% 58% 42% / 42% 60% 40% 58%
    transform: rotate(-12deg)
    trouDeVis: rond de 6px au centre, fond {colors.surface}, bord 1px {colors.texte}
  choix:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.texte}"
    border: 2px solid {colors.filet-fort}
    rounded: "{rounded.champ}"
    minHeight: 52px
  choix-selectionne:
    backgroundColor: "{colors.texte}"
    textColor: "{colors.fond}"
    border: 2px solid {colors.texte}
  champ:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.texte}"
    border: 2px solid {colors.filet-fort}
    rounded: "{rounded.champ}"
    minHeight: 52px
    padding: 0 14px
  champ-focus:
    border: 2px solid {colors.accent}
    outline: 3px solid {colors.accent}, décalage 2px
  champ-erreur:
    border: 2px solid {colors.arret}
  ligne:
    minHeight: 56px
    borderTop: 1px solid {colors.filet}
    typography: "{typography.texte}"
  avertissement:
    backgroundColor: "{colors.avertissement-fond}"
    textColor: "{colors.texte}"
    bandeGauche: rubalise 12px, rayures à -45° de 6px, {colors.rubalise-avertissement} et {colors.texte}
    rounded: "{rounded.champ}"
    padding: 12px 14px 12px 22px
  signal-arret:
    backgroundColor: "{colors.arret-fond}"
    textColor: "{colors.texte}"
    bandeGauche: rubalise 12px, rayures à -45° de 6px, {colors.rubalise-arret} et {colors.surface}
    rounded: "{rounded.champ}"
  jauge-etapes:
    height: 8px
    gap: 4px
    fait: "{colors.texte}"
    en-cours: "{colors.accent}"
    a-faire: "{colors.surface-creuse}, bord 1px {colors.filet-fort}"
  barre-onglets-telephone:
    backgroundColor: "{colors.surface}"
    borderTop: 2px solid {colors.texte}
    minHeight: 64px
  barre-haut-bureau:
    backgroundColor: "{colors.fond}"
    borderBottom: 2px solid {colors.texte}
    height: 64px
  panneau-assistant:
    backgroundColor: "{colors.surface}"
    border: 2px solid {colors.texte}
    shadow: "{shadows.relief-flottant}"
    width: 420px
  calendrier-case:
    backgroundColor: "{colors.surface}"
    border: 1px solid {colors.filet-fort}
    rounded: "{rounded.champ}"
    minHeight: 72px
---

# Topo, le système de design de Get me to 9a

> (consolidation 17/11) L'app s'appelle « Get me to 9a » (décision du 18/11) : marque de la barre du haut, titre, icône. Fond clair validé, thème sombre du soir reporté après la phase 4 (B8). La période de 4 semaines s'appelle « Phase » (B9).

Ce document décrit l'identité visuelle de l'app : couleurs, polices, tailles, formes, composants et règles.
Il fait foi pour tout écran. Les valeurs de l'en-tête deviennent les variables de `src/index.css`.
Les maquettes `demo-*.html` du même dossier montrent le système appliqué.

## 1. Ambiance

L'app ressemble à un **carnet de salle** : le papier est poudré de magnésie, les fiches sont vissées
au mur comme les étiquettes de voies, les notes sont écrites au feutre, et les zones à surveiller sont
barrées de rubalise comme un secteur fermé pendant l'ouverture des voies.

- **Fond magnésie** (`--fond`, `#F1EFE9`) : un gris craie, presque blanc, avec un grain de poudre très léger.
  Il reste neutre pour que les couleurs de prises gardent toute leur force.
- **Encre** (`--texte`, `#1D1C19`) : texte, bords, ombres. Presque noire, jamais `#000`.
- **Une seule famille de gris**, chaude (teinte pierre, environ 45°) : du fond au texte, tous les neutres ont la même
  teinte, seule la clarté change. (L'audit a repéré un premier jet qui mélangeait des gris verdâtres et des gris chauds.)
- **Résine** (`--accent`, `#0F5A54`) : la seule couleur vive de l'interface. Elle dit « c'est ici qu'on agit ».
  Ce vert pétrole sombre ne ressemble à aucune couleur de prise courante.
- **Relief** : une ombre dure, sans flou, **toujours verticale** (lumière du plafond de la salle).
  Un bouton appuyé descend et perd son ombre : on le sent sous le doigt.
- **Titres** étroits et très gras (Big Shoulders Display), comme les panneaux de secteur.
- **Chiffres, cotations, durées** en chasse fixe (Atkinson Hyperlegible Mono) : ils s'alignent et se lisent vite.
- **Texte courant** en Atkinson Hyperlegible Next, une police conçue pour être lue par tous, même de loin et fatigué.

### Les quatre signes de l'identité

| Signe | Origine en salle | Où il apparaît | Règle |
|---|---|---|---|
| **L'étiquette de voie** | La plaquette vissée au pied d'une voie : couleur, cotation, nom de l'ouvreur | Fiches de protocole, séance du jour, cases du constructeur | Bord encre 2 px, ombre dure, en haut une **étiquette** noire en chasse fixe (« DOIGTS · 7 MIN »), deux **vis** dessinées dans les coins hauts (cercle 8 px, bord encre, fente). Réservée aux objets « posés » : on ne visse pas une simple ligne de liste. |
| **La pastille de prise** | Une prise de couleur | Partout où une couleur de bloc est montrée (séance en groupe, débrief, salle) | Forme irrégulière (pas un rond, pas un carré), bord encre 1,5 px, toujours suivie du **nom** de la couleur. C'est le seul endroit où les couleurs de prises existent dans l'app. |
| **La rubalise** | Le ruban rayé qui ferme un secteur pendant l'ouverture | Avertissements (ambre) et signaux d'arrêt (brique) | Bande de 12 px à gauche, rayures à −45° : ambre et encre pour avertir, brique et papier pour arrêter ; icône et titre en gras. Elle avertit, elle ne bloque jamais. |
| **Le trait de topo** | La ligne pointillée qui dessine une voie sur un topo, avec ses relais | Annotations manuscrites, conseils de l'assistant, aide au premier usage | Feutre sépia (`--annotation`), police Gochi Hand, trait pointillé qui se termine par un **petit cercle** (le relais), jamais par une flèche. Une annotation par écran au plus. |

## 2. Couleurs

Chaque couleur a **un seul rôle**. Une couleur n'est jamais le seul moyen de comprendre : toujours un mot, une icône ou une forme avec elle.

### Rôles

| Rôle | Variable | Valeur | Emploi | Contraste vérifié |
|---|---|---|---|---|
| Fond | `--fond` | `#F1EFE9` | Fond de page | — |
| Surface | `--surface` | `#FBFAF7` | Cartes, champs, panneaux | — |
| Surface creuse | `--surface-creuse` | `#E6E3DA` | Zones en retrait, choix non sélectionné, case vide | — |
| Texte | `--texte` | `#1D1C19` | Texte principal, bords forts | 14,8:1 sur fond ; 16,3:1 sur surface ; 13,3:1 sur creux |
| Texte secondaire | `--texte-2` | `#4B4943` | Paragraphes secondaires | 7,8:1 sur fond ; 7,0:1 sur creux |
| Mention | `--texte-3` | `#5D5A52` | Aides, métadonnées, unités | 6,0:1 sur fond ; 5,4:1 sur creux ; 6,6:1 sur surface |
| Filet | `--filet` | `#C9C5BA` | Séparateurs décoratifs uniquement | décoratif |
| Filet fort | `--filet-fort` | `#8C8980` | Bord des champs et choix | 3,0:1 sur fond ; 3,4:1 sur surface (seuil 3:1 des contrôles) |
| **Action** | `--accent` | `#0F5A54` | Bouton principal (un par écran), étape en cours, jour d'aujourd'hui, anneau de focus | blanc dessus 8,0:1 ; sur fond 7,0:1 ; sur surface 7,7:1 |
| Action appuyée | `--accent-presse` | `#0B4540` | Bouton principal appuyé | 9,4:1 sur fond |
| Action douce | `--accent-doux` | `#D5E6E2` | Fond d'un élément fait ou sélectionné | texte dessus 13,0:1 ; résine dessus 6,2:1 |
| **Relief** | `--relief` | `#1D1C19` | Ombre dure des boutons et fiches | — |
| **Annotation** | `--annotation` | `#7A4420` | Notes manuscrites, trait de topo, voix de l'assistant | 6,8:1 sur fond ; 7,5:1 sur surface |
| **Avertissement** | `--avertissement` / `--avertissement-fond` | `#8A5200` / `#FBEFD5` | Avertissement de sécurité non bloquant | ambre sur son fond 5,6:1 ; texte sur ce fond 14,7:1 |
| **Arrêt** | `--arret` / `--arret-fond` | `#A32E1E` / `#F8E1DC` | Signaux d'arrêt, douleur, bouton « Stop, ça fait mal » | brique sur fond 6,2:1 ; sur son fond 5,7:1 |
| Focus sur sombre | `--focus-sur-sombre` | `#7FC4BA` | Anneau de focus sur fond encre ou résine (chrono) | 8,5:1 sur encre |
| Rubalise ambre | `--rubalise-avertissement` | `#E9A23B` | Rayures des avertissements et de la pause du chrono (avec l'encre) | décor : le sens est porté par l'icône et le texte |
| Rubalise d'arrêt | `--rubalise-arret` | `#A32E1E` | Rayures des signaux d'arrêt (avec le papier) | décor |

**Sélection** : un élément choisi (filtre, choix, onglet de vue, version solo ou groupe, semaine affichée) passe
**en encre pleine** (fond `--texte`, texte `--fond`, 14,8:1). La résine reste réservée à l'action et à « en cours » :
sinon elle se multiplie et l'action principale ne ressort plus (constat fait sur la démo du constructeur).

**État** : il n'y a pas de couleur « succès » à part. Une chose **faite** prend l'encre pleine (jauge) ou le fond
`--accent-doux` avec une coche ; une chose **en cours** prend la résine ; une chose **passée** prend des hachures
sur `--surface-creuse`. On évite ainsi un vert « succès » qui se confondrait avec les prises vertes
(distance mesurée : un vert lichen tombait à ΔE 21 du vert de prise, trop près).

### Les couleurs de prises ne sont pas des couleurs d'interface

Les couleurs de blocs viennent de la salle (`src/donnees/salles.ts`). Elles ne servent **que** dans une pastille de prise.

- Distance de l'action (résine) à la couleur de prise la plus proche : ΔE 41 (noir) et 47 (vert). L'ancien accent jaune
  `#E9F55B` était à ΔE 17 du jaune de prise : c'est la raison principale du changement.
- Le brique d'arrêt est proche du rouge de prise (ΔE 12) : c'est accepté, parce qu'un signal d'arrêt porte toujours la
  rubalise, une icône et un titre, et qu'il ne s'affiche jamais dans une grille de pastilles.
- Sur le fond magnésie, le jaune de prise n'a que 1,3:1 : le bord encre de la pastille assure le contraste (14,8:1).
- Sur les écrans qui montrent des pastilles (séance en groupe, débrief), aucune autre surface colorée que la résine
  du bouton principal.

### Chrono plein écran à fort contraste

Trois phases, trois fonds, reconnaissables du coin de l'œil sans lire :

| Phase | Fond | Chiffres et texte | Contraste | Barre du téléphone (`theme-color`) |
|---|---|---|---|---|
| Préparation | encre `#1D1C19` | craie `#F6F4EE` | 15,5:1 | `#1D1C19` |
| **Effort** | craie `#F6F4EE` | encre `#1D1C19` | 15,5:1 | `#F6F4EE` |
| Repos | résine `#0F5A54` | papier `#FBFAF7` | 7,7:1 | `#0F5A54` |

Le passage à l'effort est le plus grand saut de luminosité possible (sombre vers clair) : il se voit en vision
périphérique, même pour une personne qui ne distingue pas les couleurs. Le mot de consigne (« SUSPENDS-TOI »,
« REPOS ») est toujours écrit en plus. En pause, une bande de rubalise ambre traverse le haut de l'écran.

## 3. Typographie

Les trois familles sont sur Google Fonts et existent en paquets `@fontsource` (l'app doit marcher hors ligne :
on embarque les polices, on n'appelle pas Google Fonts au lancement).

| Rôle | Police | Paquet à installer | Graisses |
|---|---|---|---|
| Titres et chrono | **Big Shoulders Display** | `@fontsource-variable/big-shoulders-display` | 800, 900 |
| Texte | **Atkinson Hyperlegible Next** | `@fontsource-variable/atkinson-hyperlegible-next` | 400, 700 |
| Chasse fixe | **Atkinson Hyperlegible Mono** | `@fontsource-variable/atkinson-hyperlegible-mono` | 500, 600, 700 |
| Manuscrite | **Gochi Hand** | `@fontsource/gochi-hand` | 400 |

Pourquoi : Big Shoulders rappelle la signalétique des salles et permet des chiffres très hauts dans peu de largeur
(chrono lisible de loin). Atkinson Hyperlegible a été dessinée pour distinguer les caractères proches (1, l, I ; 0, O) :
utile avec des yeux qui piquent de sueur, à 2 m du téléphone. Gochi Hand ressemble à une écriture au feutre rapide
mais reste lisible.

### Échelle

| Jeton | Police | Téléphone | Ordinateur (≥ 1024 px) | Graisse | Interligne | Emploi |
|---|---|---|---|---|---|---|
| `affiche` | Big Shoulders | 44 px | 64 px | 800 | 0,95 | Titre de l'écran Aujourd'hui, tableau de bord |
| `titre-1` | Big Shoulders | 36 px | 44 px | 800 | 1,0 | Titre d'écran |
| `titre-2` | Big Shoulders | 28 px | 32 px | 800 | 1,05 | Titre de section, nom de séance |
| `titre-3` | Big Shoulders | 22 px | 24 px | 800 | 1,1 | Titre de carte, en capitales |
| `texte-grand` | Atkinson Next | 18 px | 18 px | 400 | 1,45 | Consigne d'exercice |
| `texte` | Atkinson Next | 16 px | 16 px | 400 | 1,5 | Texte courant |
| `texte-fort` | Atkinson Next | 16 px | 16 px | 700 | 1,5 | Libellés, lignes |
| `texte-petit` | Atkinson Next | 14 px | 14 px | 400 | 1,45 | Aides (jamais en dessous de 14 px) |
| `bouton` | Atkinson Next | 18 px | 17 px | 700 | 1,2 | Libellés de boutons |
| `mention` | Atkinson Mono | 13 px | 13 px | 600 | 1,3 | Étiquettes, en capitales, espacement 0,06 em |
| `donnee` | Atkinson Mono | 15 px | 15 px | 500 | 1,4 | Durées, cotations, séries |
| `chiffre-cle` | Atkinson Mono | 32 px | 40 px | 700 | 1,0 | Chiffres du débrief et des bilans |
| `chrono-nombre` | Big Shoulders | min(76vw, 300 px) ; « 9:56 » à min(48vw, 190 px) ; « 10:00 » à min(40vw, 160 px) | 360 px | 900 | 0,85 | Compte à rebours |
| `chrono-consigne` | Big Shoulders | 40 px | 56 px | 900 | 1,0 | « SUSPENDS-TOI », « REPOS » |
| `manuscrit` | Gochi Hand | 20 px | 22 px | 400 | 1,2 | Annotations |

Règles :
- Tous les nombres qui changent ou qui s'alignent : `font-variant-numeric: tabular-nums` (Atkinson Mono l'est déjà).
- **Chrono** : Big Shoulders n'a pas de chiffres tabulaires (mesuré : le « 1 » fait 55 % de la largeur des autres chiffres).
  Le nombre du chrono est donc découpé : chaque chiffre dans un `<span class="c">` de `0.5em` de large, centré ; le
  deux-points dans un `<span class="dp">` de `0.24em`. Le nombre ne bouge plus d'une seconde à l'autre.
- Titres : `text-wrap: balance`. Paragraphes : `text-wrap: pretty`, largeur maximale 65 caractères (`max-width: 65ch`).
- Capitales réservées à `titre-3`, `mention`, `chrono-consigne`. Le reste en phrase normale (pas de Majuscule À Chaque Mot).
- Big Shoulders jamais sous 22 px : en dessous, la police de texte en gras prend le relais.
- Langue : `lang="fr"`, espaces fines insécables avant `: ; ? !` et dans `1 h 45`, `7 min`.

## 4. Espacements, grille, formes

- **Base 4 px** : 4, 8, 12, 16, 24, 32, 48, 64 (`--espace-1` à `--espace-8`).
- **Téléphone** : marges latérales 20 px, colonne max 480 px, 24 px entre blocs d'un écran, 12 px dans un bloc.
- **Ordinateur** : conteneur max 1280 px centré, marges 32 px, grille de 12 colonnes, gouttière 24 px.
- **Rayons** : 2 px (étiquettes, repères), 4 px (champs, choix, cases), 6 px (cartes, boutons). Rien de plus rond :
  les prises sont rondes, l'interface reste « vissée ».
- **Bords** : 2 px encre pour ce qui est en relief ou cliquable ; 1 px filet pour les séparateurs.
- **Ombres** : seulement des ombres dures verticales en encre (voir l'en-tête). Pas de flou, pas de rotation, pas d'ombre diagonale.
- **Texture** : grain de magnésie, une petite tuile SVG de bruit (`feTurbulence`, fréquence 0,9, opacité 0,06) répétée en
  `background-image` du `body`, **sans** `background-attachment: fixed` (coûteux sur téléphone). Jamais sur les cartes,
  jamais sur le chrono. Valeur exacte : variable `--grain` de `demo-aujourdhui.html`.
- **Échelle de profondeur** (`z-index`) : contenu 0, barre d'onglets 10, panneau latéral 20, menu 30, fenêtre de confirmation 40, bandeau de mise à jour 50.

## 5. Composants

Chaque composant existe dans `src/index.css` sous une classe en français. Les états sont tous obligatoires :
repos, survol (souris), appuyé, focus clavier, désactivé.

### Boutons
- **Principal** (`.bouton.principal`) : résine, texte blanc, bord encre 2 px, ombre `0 4px 0` encre, hauteur 64 px
  (téléphone) ou 52 px (ordinateur). Appuyé : descend de 4 px, ombre nulle, fond `--accent-presse`.
  Survol : fond `--accent-presse`. **Un seul par écran.**
- **Second** (`.bouton.second`) : papier, texte encre, même bord et même ombre. 56 px de haut.
- **Discret** (`.bouton-discret`) : texte souligné 2 px, 48 px de zone tactile.
- **Arrêt** (`.bouton.arret`) : fond `--arret-fond`, texte et bord brique, ombre brique. Pour « Stop, ça fait mal » seulement.
- **Désactivé** : fond creux, bord pointillé, pas d'ombre, texte `--texte-3`, avec en dessous une phrase qui dit ce qui manque.
- Libellé = verbe + objet (« Lancer le chrono », « Garder cette séance »), jamais « OK » ni « Continuer » seul.

### Fiche (étiquette de voie)
Fond papier, bord encre 2 px, ombre `0 3px 0`, rayon 6 px, deux vis en haut (décor `aria-hidden`) ; **une seule vis**
(en haut à droite) quand les fiches sont nombreuses (bibliothèque, constructeur), pour ne pas charger l'écran.
En haut à gauche une **étiquette** noire en chasse fixe : qualité et durée (« DOIGTS · 7 MIN »).
Titre en `titre-3`, consigne en `texte`, pied de fiche en `donnee` (preuve, matériel). Sert à : séance du jour,
fiche protocole, case de séance du constructeur.

### Carte simple
Fond papier, bord filet 1 px, sans ombre, sans vis. Pour regrouper des informations qui ne se manipulent pas.

### Lignes et listes
Ligne de 56 px minimum, filet en haut, libellé à gauche en `texte-fort`, valeur à droite en `donnee` couleur `--texte-3`.
Une ligne cliquable affiche un chevron à droite et change de fond au survol (`--surface-creuse`).

### Repère numéroté
Carré encre de 28 px, chiffre craie en chasse fixe, rayon 2 px. Numérote les étapes d'une séance et les semaines d'un bloc.
(Pas de cercle : c'est volontairement différent des numéros encerclés de notre inspiration.)

### Champs
Fond papier, bord `--filet-fort` 2 px, 52 px de haut, libellé au-dessus en `texte-fort`, aide en dessous en `texte-petit`.
Focus : bord résine et anneau résine 3 px décalé de 2 px. Erreur : bord brique et message en dessous, avec icône,
qui dit quoi corriger. Les listes déroulantes natives gardent `background-color` et `color` explicites.

### Choix (boutons à valeur unique ou multiple)
Grille de boutons de 52 px, fond papier, bord `--filet-fort`. Sélectionné : fond encre, texte magnésie, bord encre.
Utilise `aria-pressed` (ou `role="radio"` dans un `role="radiogroup"`). Les filtres de la bibliothèque, l'interrupteur
« seulement ceux qui me conviennent », les vues (12 semaines, bloc, semaine) et la bascule solo / groupe suivent la même règle.

### Pastille de prise
Forme de prise de 30 × 24 px (rayons `64% 36% 58% 42% / 42% 60% 40% 58%`, tournée de −12°), bord encre 1,5 px,
avec au centre son **trou de vis** (rond de 6 px, fond papier, bord encre). Toujours suivie du nom de la couleur.
Dans un bouton de choix de couleur, la sélection se marque par le bord encre 3 px du bouton et un coin encre avec
une coche en haut à droite, jamais par un changement de la couleur de la pastille. Grille de 3 colonnes
`repeat(3, minmax(0, 1fr))` pour que le nom ne déborde pas.

### Étiquette et mention
`.etiquette` : fond encre, texte magnésie, `mention`. `.etiquette.contour` : bord encre, fond transparent.
Pour la qualité, le matériel, la preuve (« ÉTUDE », « AVIS DE COACH »), « SOLO », « GROUPE », « ALLÉGÉE ».

### Jauges
- **Étapes** : segments de 8 px, 4 px d'écart. Fait = encre pleine, en cours = résine, à faire = creux bordé, passé = hachures.
- **Objectif de groupe** : même jauge, un segment par bloc visé.
- **Charge de semaine** (ordinateur) : barre horizontale de 12 px, graduée ; au-delà du repère prudent, la partie en trop
  prend la rubalise ambre, avec un texte « Au-dessus du repère : 3 séances dures, repère 2 ».
- Toute jauge a un `role="img"` et un `aria-label` qui dit la valeur en mots.

### Onglets
- **Téléphone** : barre en bas, fond papier, filet encre 2 px en haut, 4 onglets de 64 px, icône 24 px au-dessus du nom.
  L'onglet actif : nom en gras, icône pleine, trait résine de 4 px au-dessus. `aria-current="page"`.
- **Ordinateur** : barre en haut de 64 px, liens en `texte-fort`, l'actif souligné résine 3 px.

### Avertissement (rubalise ambre) et signal d'arrêt (rubalise brique)
Bloc à fond coloré clair, bande rayée de 12 px à gauche (rayures de 6 px à −45°), icône triangle (avertissement) ou main levée (arrêt),
titre en `texte-fort`, une phrase d'explication, un lien « Pourquoi ? » qui déplie la règle et sa source.
**Jamais bloquant** : il n'y a pas de bouton « J'accepte ». L'utilisateur peut continuer.
`role="status"` pour un avertissement apparu en direct, `role="alert"` réservé aux signaux d'arrêt.

### Panneau de l'assistant
Panneau latéral droit de 420 px sur ordinateur (plein écran sur téléphone), bord encre et ombre flottante.
Les messages de l'assistant ont un liseré gauche sépia et une mention « BROUILLON ». Chaque proposition est une
liste d'éléments ; chaque élément a trois boutons : **Garder**, **Modifier**, **Rejeter**. Les sources sont en bas de
chaque proposition, en `texte-petit`, sous forme de liste numérotée. Les avertissements de sécurité y apparaissent
avec la même rubalise qu'ailleurs. Voir `parcours-et-ecrans.md` pour le détail.

### Calendrier de plan
- **Vue 12 semaines** : 3 colonnes de blocs, chacune avec 4 lignes de semaines ; la semaine allégée est hachurée
  et porte l'étiquette « ALLÉGÉE ». Chaque semaine montre ses séances en petites étiquettes.
- **Vue semaine** : 7 colonnes (lundi à dimanche), cases de 72 px minimum, une fiche par séance, glissable.
- Case vide : fond creux et texte « Repos » ; case survolée pendant un glisser : bord résine pointillé 2 px.

### Bandeaux
- **Hors ligne** : bande encre en haut, texte magnésie « Hors ligne. Tes séances sont gardées sur ce téléphone. »
- **Synchronisation** : mention discrète dans la barre du haut (« À jour », « Envoi en cours… »).
- **Mise à jour** : bande résine, texte blanc, toute la largeur, 48 px.

### Fenêtre de confirmation
Remplace `window.confirm`. Fiche centrée, fond papier, ombre flottante, titre, une phrase, deux boutons : l'action
(« Quitter la séance ») et « Rester ». `role="dialog"`, `aria-modal="true"`, focus sur « Rester », Échap ferme.

### États de chargement, vide, erreur
- **Chargement** : silhouettes de cartes en `--surface-creuse` (pas de rond qui tourne), affichées après 400 ms seulement.
- **Vide** : une phrase qui dit pourquoi c'est vide, une annotation au trait de topo vers l'action principale, le bouton.
- **Erreur** : ce qui s'est passé, si les données sont perdues ou non, quoi faire. Pas de « Oups ».

## 6. Icônes

- Jeu **Phosphor**, graisse « bold » (`@phosphor-icons/react`), 24 px dans les boutons et onglets, 20 px dans les lignes.
- Trois icônes maison dans le même trait (2 px, bouts arrondis), dessinées en SVG dans `src/composants/Icone.tsx` :
  **prise** (forme irrégulière), **poutre** (barre à réglettes), **vis** (cercle et fente, décor des fiches).
- Correspondances : Aujourd'hui `Sun`, Programme `CalendarBlank`, Bilans `ChartLineUp`, Profil `User`, Bibliothèque
  `Books`, Assistant `ChatCircleText`, Chrono `Timer`, Avertissement `Warning`, Arrêt `HandPalm`,
  Hors ligne `CloudSlash`, Synchronisé `CloudCheck`, Glisser `DotsSixVertical`, Ajouter `Plus`, Fermer `X`,
  Source `BookOpen`, Groupe `UsersThree`, Solo `UserCircle`, Filtre `Funnel`, Recherche `MagnifyingGlass`, Clé `Key`.
- Une icône seule dans un bouton porte un `aria-label`. Une icône à côté d'un texte porte `aria-hidden="true"`.
- **Aucun emoji** dans l'interface.

## 7. Mouvement

- Durées : 100 ms (appui), 180 ms (changement d'état), 240 ms (panneau qui s'ouvre). Courbe `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- On n'anime que `transform` et `opacity`. Jamais `transition: all`.
- Appui : le bouton descend de 4 px et perd son ombre.
- Glisser-déposer : la fiche saisie monte (ombre flottante, `scale(1.02)`), la case cible prend un bord pointillé résine.
- Chrono : le changement de phase est **instantané** (pas de fondu : il doit se voir tout de suite), accompagné du bip
  et de la vibration existants.
- `prefers-reduced-motion: reduce` : plus aucun déplacement, seulement des changements de couleur.

## 8. Mise en page et adaptation

| Largeur | Mise en page |
|---|---|
| < 600 px | Téléphone : une colonne, barre d'onglets en bas. |
| 600 à 1023 px | Tablette : même mise en page que le téléphone, colonne de 560 px centrée. |
| ≥ 1024 px | Bureau : barre en haut, écrans de planification en plusieurs colonnes, panneau d'assistant à droite. |

L'écran du chrono, la séance solo et la séance en groupe gardent la mise en page téléphone à toutes les largeurs
(colonne de 480 px centrée, fond plein écran). Sur ordinateur, les écrans de planification ne sont pas « étirés » :
ils ont leur propre disposition (voir `parcours-et-ecrans.md`).

Zones tactiles : **48 px minimum** partout, 64 px pour les actions de séance (on a de la magnésie sur les doigts).
`touch-action: manipulation` sur tous les boutons. `env(safe-area-inset-*)` respecté en haut et en bas.
Le zoom n'est jamais bloqué.

## 9. À faire et à éviter

**À faire**
- Un écran = une action principale résine. Le reste en second, en discret ou en lignes.
- Écrire le mot à côté de chaque couleur, de chaque icône d'état, de chaque pastille.
- Garder le chrono en noir, craie et résine, sans autre décor.
- Utiliser le trait de topo pour guider la première fois, puis le retirer.
- Vérifier chaque nouveau couple de couleurs à 4,5:1 (texte) ou 3:1 (bords, icônes, grands titres).

**À éviter**
- Une deuxième couleur vive. Le jaune, le vert vif, le bleu, le violet, le rouge vif, l'orange et le rose appartiennent aux prises.
- Des cartes qui penchent, du ruban adhésif, des numéros dans des cercles, des flèches manuscrites bleues, un bouton vert
  à bord orange : ce sont les signes de notre inspiration, pas les nôtres.
- Des ombres floues ou diagonales, des dégradés.
- Les majuscules dans le texte courant et les boutons.
- Des emoji, des points d'exclamation, « Oups ».
- `window.alert` et `window.confirm` : on utilise la fenêtre de confirmation et les messages en ligne.

## 10. Ce qui nous distingue de notre inspiration

Nous aimons chez Sisyf le papier, les titres massifs, la chasse fixe, les cartes à ombre dure et les notes à la main.
Nous gardons l'**esprit** (un outil chaleureux, concret, imprimé) et changeons chaque **signe** :

| Chez notre inspiration | Chez nous |
|---|---|
| Fond crème beige `#ede4d2`, grain de papier | Fond gris craie `#F1EFE9`, grain de magnésie plus fin et plus froid |
| Cartes qui penchent, ruban adhésif aux coins, ombre diagonale | Fiches droites, **vissées** (deux vis), ombre dure **verticale** |
| En-tête de carte en bandeau gris | **Étiquette de voie** noire en chasse fixe dans le coin |
| Numéros d'étape dans un cercle à trait épais | **Repère carré** encre plein |
| Annotations bleues, flèche dessinée | Annotations **sépia** au feutre, **trait de topo** pointillé terminé par un relais |
| Bouton vert, bord bas orange, libellé en chasse fixe | Bouton **résine** pétrole, bord et ombre encre, libellé en police de texte grasse |
| Emoji dans les titres | Aucun emoji ; icônes Phosphor et trois icônes d'escalade |
| Polices : linéale condensée, sans-serif arrondie | Big Shoulders Display, Atkinson Hyperlegible Next et Mono, Gochi Hand |
| — | **Pastille de prise** et **rubalise** : deux signes qui n'existent que chez nous |

Le nom, le logo et les textes de Sisyf ne sont repris nulle part.

## 11. Méthode de travail sur ce système

1. Un composant à la fois : lire son entrée dans l'en-tête, vérifier que chaque valeur passe par une variable.
2. Aucune couleur écrite en dur dans un écran : uniquement `var(--…)`. Seule exception : la couleur d'une prise, qui vient des données de la salle.
3. Nouveau couple de couleurs : vérifier le contraste avant de livrer (outil en ligne ou script).
4. Nouveau composant : d'abord essayer avec fiche, carte simple, ligne, étiquette. N'ajouter une variable qu'en dernier recours.

## 12. Limites connues

- Les rapports de contraste sont calculés sur les valeurs exactes ; le grain de fond les baisse de moins de 0,1.
- Big Shoulders n'a pas de chiffres tabulaires : voir la règle des cases de largeur fixe (section 3). Si cette règle
  posait problème, le chrono passerait en Atkinson Hyperlegible Mono 800 (un peu moins haut à largeur égale).
- Google Fonts n'a pas pu être joint depuis l'espace de conception : les captures des démos utilisent les mêmes polices,
  tirées des paquets `@fontsource`. Les pages HTML, elles, chargent Google Fonts.
- Pas de thème sombre en v2 : le chrono garde son plein écran contrasté. (consolidation 17/11) Thème sombre du soir reporté après la phase 4 (B8).
