# Tâches de réalisation du design (D-01 à D-24)

Découpage du système « Topo » (`DESIGN.md`) et des écrans (`parcours-et-ecrans.md`) en tâches autonomes.
Chaque tâche peut être confiée à un agent qui ne lit que : **la section 0 ci-dessous, la tâche, `CLAUDE.md`, et les
fichiers que la tâche cite.**

## Avant de distribuer (pour le gérant)

> **(consolidation 17/11)** L'ordre réel, les dépendances avec les vrais identifiants et les amendements de chaque tâche sont dans `docs/backlog-v2.md`, qui prime sur ce fichier. Points 1 à 3 ci-dessous : faits (les documents sont dans `docs/specs/design/`, et non `docs/design/` : lire ces chemins ainsi ; `CLAUDE.md` est aligné ; les dépendances sont reliées dans le tableau). Décisions appliquées : nom de l'app « Get me to 9a » (titre, manifeste, en-tête ordinateur, icône, accueil) ; « Phase » pour la période de 4 semaines (B9) ; connexion par code (B1), réalisée en phase 2 par F2-07 et F2-09, D-21 étant réduite ; D-10 fusionnée avec F2-14 ; aucune séance lancée sur ordinateur (B12) ; « Forme du jour » revient en phase 4 (B10, C-03).

1. Copier dans le dépôt, dossier `docs/design/` : `DESIGN.md`, `parcours-et-ecrans.md`, `audit-redesign.md`,
   les trois `demo-*.html` et leurs `demo-*.png`. Les tâches citent ces chemins.
2. Mettre à jour la ligne « Design » de `CLAUDE.md` : la règle « un seul accent » devient « un rôle par couleur ;
   `--accent` (résine) seulement pour l'action principale, l'en-cours et le focus ; sélection en encre ;
   variables de `src/index.css` uniquement ». Sinon les agents verront une contradiction entre `CLAUDE.md` et leur tâche.
3. Les dépendances notées « **[archi]** » ou « **[entraînement]** » désignent des tâches de l'architecte ou de l'expert
   entraînement, décrites par ce qu'elles doivent fournir ; le gérant les relie à leurs identifiants.
4. Ordre conseillé : D-01 → D-02 → D-03 → D-04, puis D-05 à D-09 (une à la fois : elles touchent toutes
   `src/index.css`), puis D-10, puis la phase 3. Jamais deux tâches en parallèle sur `src/index.css` ou `src/App.tsx`.

| Id | Titre | Phase | Modèle | Dépend de (consolidation 17/11 : vrais identifiants) |
|---|---|---|---|---|
| D-01 | Polices et jetons de couleur | 2 | Sonnet | — |
| D-02 | Composants de base en CSS | 2 | Sonnet | D-01 |
| D-03 | Icônes, pastille de prise, avertissement (composants React) | 2 | Sonnet | D-02 |
| D-04 | Fenêtre de confirmation et erreurs en ligne | 2 | Sonnet | D-02 |
| D-05 | Chrono plein écran à trois phases | 2 | Sonnet | D-02, D-03 |
| D-06 | Barre d'onglets et écran Aujourd'hui | 2 | Sonnet | D-03 |
| D-07 | Séance solo et séance en groupe | 2 | Sonnet | D-03, D-04, F2-01 |
| D-08 | Trois questions, débrief, bilans, mises en garde | 2 | Sonnet | D-03, D-04 |
| D-09 | Profil, bienvenue, erreur, chargement, icône de l'app | 2 | Haiku | D-02, F2-05 |
| D-10 | Coquille « bureau » (≥ 1024 px) | 2 | Sonnet | **fusionnée dans F2-14** (F2-05, F2-10, D-06, D-09) |
| D-11 | Bibliothèque filtrable | 3 | Sonnet | F2-14, C-01 (prérequis : E-03) |
| D-12 | Fiche protocole en panneau latéral | 3 | Sonnet | D-11 |
| D-13 | Création d'un exercice personnel | 3 | Sonnet | D-12, F2-12 |
| D-14 | Plan : vue 12 semaines | 3 | Sonnet | F2-12, F2-14, C-02 |
| D-15 | Plan : vue phase (« vue bloc ») | 3 | Sonnet | D-14 |
| D-16 | Plan : vue semaine et éditeur de séance | 3 | Sonnet | D-15, D-12, C-01, E-10 |
| D-17 | Plan : glisser-déposer et alternatives clavier | 3 | Sonnet | D-16 |
| D-18 | Avertissements de sécurité en direct (affichage) | 3 | Sonnet | D-17, E-09, C-01 |
| D-19 | Tableau de bord | 3 | Sonnet | D-14, D-18, F2-12 |
| D-20 | Profil et réglages sur ordinateur, clé de l'assistant | 3 | Sonnet | F2-14, F2-05, D-09 |
| D-21 | Compte, bienvenue et états réseau (réduite ; connexion par code) | **2** | Sonnet | F2-11, F2-14 (F2-07, F2-09 font les écrans T-02 à T-04) |
| D-22 | Aujourd'hui et Programme branchés sur le plan | 4 | Sonnet | D-06, D-07, D-14, F2-12, F2-14, C-01, E-09 |
| D-23 | Panneau de l'assistant | 5 | Sonnet | D-16, D-18, D-20, E-13, E-14, E-15, C-06, C-07 |
| D-24 | Bilans sur ordinateur et téléphone | 6 | Sonnet | F2-14, C-08 |

---

## 0. Règles communes (à transmettre avec chaque tâche)

- Lire `CLAUDE.md`. Code, commentaires, noms métier et messages de commit en français. Commentaires courts qui disent pourquoi.
- **Couleurs** : uniquement `var(--…)` définies dans `src/index.css`. Seules exceptions : la couleur d'une prise
  (elle vient des données de la salle) et les valeurs `theme-color` de `index.html` et `vite.config.ts` (le navigateur
  n'y lit pas les variables) ; dans ces deux cas, un commentaire dit à quelle variable la valeur correspond.
- **Résine** (`--accent`) : un seul bouton principal par écran ; plus « en cours », « aujourd'hui » et l'anneau de
  focus. Un élément **sélectionné** (choix, filtre, onglet de vue) est en **encre pleine** (`--texte` en fond,
  `--fond` en texte).
- **Tailles tactiles** : tout bouton, lien ou champ fait au moins **48 px** de haut ; les actions de séance au moins **64 px**.
- **Focus** : visible partout (`:focus-visible`), anneau résine 3 px décalé de 2 px ; sur fond encre ou résine,
  `--focus-sur-sombre`.
- **Textes** : tutoiement, phrases courtes, pas de point d'exclamation, pas d'emoji, « … » et non « ... ».
- **Polices** : titres `var(--police-titre)` jamais sous 22 px ; texte `var(--police)` ; chiffres, durées, cotations,
  étiquettes `var(--police-fixe)` ; manuscrit `var(--police-main)` seulement pour les annotations décoratives
  (`aria-hidden="true"`, jamais d'information unique).
- **Mouvement** : seulement `transform` et `opacity`, jamais `transition: all` ; rien sous `prefers-reduced-motion`.
- **Fini quand** : `npm run build` et `npm run test` passent, les critères d'acceptation sont vérifiés, le tableau
  « État » du README est à jour (selon `CLAUDE.md`).

### Outils de vérification

Contraste de deux couleurs (rapport WCAG) :
```bash
node -e "const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);const L=x=>{const[r,g,b]=h(x);return .2126*r+.7152*g+.0722*b};const[a,b]=process.argv.slice(1).map(L).sort((p,q)=>q-p);console.log(((a+.05)/(b+.05)).toFixed(2))" '#1D1C19' '#F1EFE9'
```
Exigences : texte ≥ 4,5:1 (≥ 3:1 au-dessus de 24 px gras) ; bords de contrôles et icônes ≥ 3:1.

Liste des éléments cliquables trop petits (après `npm run build`, lancer `npx vite preview --port 4173` dans un autre
terminal, puis arrêter le serveur à la fin) :
```bash
node --input-type=module -e "
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } })
await p.goto('http://localhost:4173/'); await p.waitForTimeout(1000)
const petits = await p.\$\$eval('button, a, input, select, [role=button]', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height < 48 }).map(e => (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 40) + ' : ' + Math.round(e.getBoundingClientRect().height) + ' px'))
console.log(petits.length ? petits.join('\n') : 'Aucun élément sous 48 px'); await b.close()"
```
Adapter l'adresse ou les clics pour atteindre l'écran de la tâche. Pour une capture : `await p.screenshot({ path: 'capture.png', fullPage: true })`.

---

## Phase 2 : le système dans le code et les écrans du téléphone

### D-01 · Polices et jetons de couleur
- **Objectif** : remplacer le thème sombre et la police Geist par les jetons du système Topo, sans encore toucher aux composants.
- **Dépend de** : rien. **Modèle** : Sonnet.
- **Fichiers** : `package.json`, `src/main.tsx`, `src/index.css` (bloc `:root` et règles `body`, `h1, h2`, `.chiffres`
  seulement), `index.html`, `vite.config.ts`. Lire `docs/design/DESIGN.md` §2 et §3.
- **Étapes** :
  1. `npm uninstall @fontsource-variable/geist` puis
     `npm install @fontsource-variable/big-shoulders-display @fontsource-variable/atkinson-hyperlegible-next @fontsource-variable/atkinson-hyperlegible-mono @fontsource/gochi-hand`.
  1 bis. (consolidation 17/11) Nom de l'app : `index.html` → `<title>Get me to 9a</title>` et
     `<meta name="apple-mobile-web-app-title" content="Get me to 9a" />` ; manifeste de `vite.config.ts` → `name` et
     `short_name` « Get me to 9a ». Ne renommer ni le dépôt, ni l'adresse, ni la base Dexie `appli-escalade`.
  2. Dans `src/main.tsx`, remplacer l'import de Geist par :
     ```ts
     import '@fontsource-variable/big-shoulders-display/wght.css'
     import '@fontsource-variable/atkinson-hyperlegible-next/wght.css'
     import '@fontsource-variable/atkinson-hyperlegible-mono/wght.css'
     import '@fontsource/gochi-hand/400.css'
     ```
  3. Remplacer le bloc `:root` de `src/index.css` par :
     ```css
     :root {
       color-scheme: light;
       /* Neutres : une seule famille de gris chaude (teinte pierre). */
       --fond: #F1EFE9;            /* magnésie */
       --surface: #FBFAF7;         /* papier : cartes, champs */
       --surface-creuse: #E6E3DA;  /* pierre : zones en retrait */
       --texte: #1D1C19;           /* encre */
       --texte-2: #4B4943;
       --texte-3: #5D5A52;
       --filet: #C9C5BA;           /* séparateurs décoratifs */
       --filet-fort: #8C8980;      /* bords des champs (3:1 au moins) */
       /* Un rôle par couleur. */
       --accent: #0F5A54;          /* résine : action principale, en cours, focus */
       --accent-presse: #0B4540;
       --accent-doux: #D5E6E2;     /* fait, ou zone de dépôt */
       --sur-accent: #FFFFFF;
       --relief: #1D1C19;          /* ombre dure des éléments en relief */
       --annotation: #7A4420;      /* sépia : notes manuscrites */
       --avertissement: #8A5200;
       --avertissement-fond: #FBEFD5;
       --rubalise-avertissement: #E9A23B;
       --arret: #A32E1E;
       --arret-fond: #F8E1DC;
       --rubalise-arret: #A32E1E;
       --focus-sur-sombre: #7FC4BA;
       /* Chrono : trois phases reconnaissables de loin. */
       --chrono-preparation-fond: #1D1C19;  --chrono-preparation-texte: #F6F4EE;
       --chrono-effort-fond: #F6F4EE;       --chrono-effort-texte: #1D1C19;
       --chrono-repos-fond: #0F5A54;        --chrono-repos-texte: #FBFAF7;
       /* Ancien nom, gardé le temps que les écrans soient repris (D-02 à D-09). */
       --surface-haute: var(--surface-creuse);
       /* Formes */
       --rayon-etiquette: 2px; --rayon-controle: 4px; --rayon-bouton: 6px; --rayon-carte: 6px;
       --ombre-bouton: 0 4px 0 var(--relief);
       --ombre-carte: 0 3px 0 var(--relief);
       --ombre-flottante: 0 6px 0 var(--relief);
       /* Espacements, base 4 px */
       --espace-1: 4px; --espace-2: 8px; --espace-3: 12px; --espace-4: 16px;
       --espace-5: 24px; --espace-6: 32px; --espace-7: 48px; --espace-8: 64px;
       /* Polices */
       --police-titre: 'Big Shoulders Display Variable', 'Arial Narrow', sans-serif;
       --police: 'Atkinson Hyperlegible Next Variable', system-ui, sans-serif;
       --police-fixe: 'Atkinson Hyperlegible Mono Variable', ui-monospace, monospace;
       --police-main: 'Gochi Hand', cursive;
       /* Mouvement */
       --duree-appui: 100ms; --duree-etat: 180ms; --duree-panneau: 240ms;
       --courbe: cubic-bezier(0.2, 0.8, 0.2, 1);
       /* Grain de magnésie : tuile de bruit très légère. */
       --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.11 0 0 0 0 0.11 0 0 0 0 0.10 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
     }
     ```
  4. `body` : `background: var(--fond) var(--grain);` (pas de `background-attachment: fixed`), `font-family: var(--police)`,
     `font-size: 16px`, `line-height: 1.5`. `h1, h2` : `font-family: var(--police-titre); font-weight: 800; letter-spacing: 0.005em; text-wrap: balance`.
     Ajouter `p { text-wrap: pretty; }`. `.chiffres` : ajouter `font-family: var(--police-fixe)`.
  5. `index.html` : `<meta name="theme-color" content="#F1EFE9" />` avec un commentaire `<!-- = --fond -->`.
     `vite.config.ts` : `background_color` et `theme_color` à `'#F1EFE9'` (commentaire : `// = --fond dans index.css`) ;
     ajouter dans `VitePWA({...})` : `workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] }` pour que les polices
     marchent hors ligne.
  6. Ne pas toucher aux autres règles : les écrans seront repris par les tâches suivantes.
- **Critères d'acceptation** :
  - `npm run build` et `npm run test` passent ; `grep -r "geist" src package.json` ne trouve rien.
  - Dans `dist/sw.js`, les fichiers `.woff2` figurent dans la liste à mettre en cache.
  - À l'écran (aperçu à 390 px) : fond gris craie, texte encre, titres en police étroite et grasse.
  - Contraste vérifié avec l'outil : `--texte` sur `--fond` ≥ 14:1 ; `--texte-3` sur `--surface-creuse` ≥ 5:1.
- **Pièges** : le nom de famille des paquets variables finit par « Variable » ; ne pas importer `index.css` des paquets
  (il charge aussi l'italique inutile) ; l'écran du chrono paraîtra provisoirement faux (il est repris en D-05).

### D-02 · Composants de base en CSS
- **Objectif** : donner aux classes existantes l'apparence Topo et ajouter les classes nouvelles, sans changer le JSX.
- **Dépend de** : D-01. **Modèle** : Sonnet.
- **Fichiers** : `src/index.css` (tout sauf la section « Écran de chrono », reprise en D-05). Lire `docs/design/DESIGN.md`
  §4 et §5, et regarder `docs/design/demo-aujourdhui.html` (son CSS est la référence visuelle).
- **Étapes** (valeurs exactes dans `DESIGN.md`, en-tête `components`) :
  1. **Titres** : `.titre` en `--police-titre` 800, 44 px, interligne 0,95 ; `.titre.moyen` 28 px ; `.sous-titre` en
     `--police-titre` 800, 22 px, capitales, espacement 0,03 em. `.surtitre` devient une **mention** : `--police-fixe`,
     13 px, 600, capitales, espacement 0,06 em, couleur `--texte-3` ; supprimer la règle `.surtitre::first-letter`.
  2. **Boutons** : `.bouton` : fond `--surface`, bord 2 px `--texte`, rayon `--rayon-bouton`, ombre `--ombre-bouton`,
     hauteur 64 px min ; `:hover` (souris) : fond `--surface-creuse` ; `:active` : `transform: translateY(4px)` et
     `box-shadow: none` ; transition `transform var(--duree-appui) var(--courbe), box-shadow var(--duree-appui)`.
     `.bouton.principal` : fond `--accent`, texte `--sur-accent` (y compris `span`), `:hover` fond `--accent-presse`.
     `.bouton-second` : même traitement que `.bouton` (papier, bord, ombre), 56 px. `.bouton-texte` et `.bouton-discret` :
     texte `--texte` en gras, souligné 2 px, décalé de 4 px, 48 px de haut. **Désactivé** (`.bouton:disabled`) : fond
     `--surface-creuse`, bord pointillé `--filet-fort`, texte `--texte-3`, pas d'ombre, **pas d'opacité**.
     Nouvelle classe `.bouton.arret` : fond `--arret-fond`, texte et bord `--arret`, ombre `0 4px 0 var(--arret)`.
  3. **Focus** : `:focus-visible` sur `button, a, input, select, textarea, [tabindex]` : `outline: 3px solid var(--accent); outline-offset: 2px`.
  4. **Lignes** : `.ligne` filet `--filet` ; `button.ligne` reçoit un chevron à droite (pseudo-élément `::after`, bordure
     2 px tournée de 45°) et `:hover` fond `--surface-creuse` ; `div.ligne` n'en a pas. La valeur de droite
     (`span:last-child`) en `--police-fixe` 15 px, couleur `--texte-3`.
  5. **Cartes** : `.carte` = carte simple (fond `--surface`, bord 1 px `--filet`, rayon `--rayon-carte`). Nouvelle
     `.fiche` : fond `--surface`, bord 2 px `--texte`, rayon 6 px, ombre `--ombre-carte`, `position: relative`,
     padding 16 px. Nouvelle `.vis` (décor) : rond de 10 px, bord 1,5 px `--texte`, fond `--surface-creuse`, fente
     (`::after`, trait de 1,5 px tourné de −35°), positionnée `top: 8px` et `left: 8px` (`.vis.g`) ou `right: 8px` (`.vis.d`).
  6. **Étiquettes et repères** : `.etiquette` (fond `--texte`, texte `--fond`, `--police-fixe` 13 px 600 capitales,
     padding 3 px 8 px, rayon 2 px) ; `.etiquette.contour` (fond transparent, bord 1,5 px `--texte`) ;
     `.etiquette.attente` (bord pointillé `--filet-fort`, texte `--texte-3`). `.repere` : carré de 24 px, fond `--texte`,
     chiffre `--fond` en `--police-fixe` 13 px 700, rayon 2 px. `.mention` : comme `.surtitre`. `.donnee` :
     `--police-fixe` 15 px 500, chiffres tabulaires.
  7. **Choix** (`.choix button`, `.pastille`) : fond `--surface`, bord 2 px `--filet-fort`, rayon 4 px, 52 px ;
     `[aria-pressed='true']` : fond `--texte`, texte `--fond`, bord `--texte`. (Les couleurs de prises seront reprises en D-07.)
  8. **Champs** (`.champ input, .champ select, textarea`) : fond `--surface`, bord 2 px `--filet-fort`, rayon 4 px,
     52 px ; focus : bord `--accent` + anneau. Nouvelle `.champ.erreur` : bord `--arret`, et `.message-erreur`
     (texte `--arret`, 14 px, gras).
  9. **Compteurs** (`.compteur button`) : 56 × 56 px, fond `--surface`, bord 2 px `--texte`, ombre `--ombre-bouton`, appui comme les boutons.
  10. **Jauges** (`.jauge span`) : 8 px de haut, rayon 1 px, fond `--surface-creuse`, bord 1 px `--filet-fort` ;
      `.fait` fond et bord `--texte` (remplace `#8b8f94`) ; `.actif` fond et bord `--accent` ; nouvelle `.passe` :
      hachures `repeating-linear-gradient(-45deg, var(--surface-creuse) 0 3px, var(--filet-fort) 3px 4px)`.
  11. **Avertissement et signal d'arrêt** : `.avertissement` (fond `--avertissement-fond`, rayon 4 px, padding
      12 px 14 px 12 px 26 px, `position: relative`, `::before` bande de 12 px à gauche en
      `repeating-linear-gradient(-45deg, var(--rubalise-avertissement) 0 6px, var(--texte) 6px 12px)`) ;
      `.signal-arret` (fond `--arret-fond`, bande en `var(--rubalise-arret) 0 6px, var(--surface) 6px 12px`).
  12. **Barre d'onglets** (`.onglets`, `.onglet`) : fond `--surface`, filet du haut 2 px `--texte`, onglets de 64 px,
      14 px ; actif : gras, couleur `--texte`, trait `--accent` de 4 px en haut (`::before`).
  13. **Bandeau de mise à jour** (`.bandeau`) : fond `--accent`, texte `--sur-accent`. Nouveau `.bandeau.hors-ligne` :
      fond `--texte`, texte `--fond`.
  14. **Silhouettes de chargement** : `.silhouette` (fond `--surface-creuse`, rayon 4 px, animation d'opacité
      0,6 ↔ 1 en 1,2 s, coupée sous `prefers-reduced-motion`).
  15. **Débrief** : `.chiffres-cles b` en `--police-fixe` 700, 32 px ; `.chiffres-cles b.accent` couleur `--accent` ;
      légendes 14 px (plus de 13 px). Tableaux : en-têtes en `.mention`.
  16. Supprimer toutes les tailles de texte sous 14 px, sauf `.mention`, `.etiquette`, `.repere` (13 px en chasse fixe).
- **Critères d'acceptation** :
  - `grep -nE "#[0-9a-fA-F]{3,6}" src/index.css` ne trouve de couleurs que dans le bloc `:root` (et la section chrono, reprise en D-05).
  - L'outil de taille ne liste aucun élément sous 48 px sur Aujourd'hui, Profil, Trois questions.
  - Bouton désactivé de Trois questions : fond gris pierre, bord pointillé, sans transparence.
  - Capture d'Aujourd'hui à 390 px : boutons en relief encre, le principal en résine.
- **Pièges** : ne pas toucher à la section chrono ; `button.ligne` et `div.ligne` doivent rester distincts ; le pseudo-élément
  chevron ne doit pas recouvrir le texte de droite (garder un `padding-right` de 24 px sur `button.ligne`).

### D-03 · Icônes, pastille de prise, avertissement (composants React)
- **Objectif** : créer les trois composants partagés dont les écrans auront besoin.
- **Dépend de** : D-02. **Modèle** : Sonnet.
- **Fichiers à créer** : `src/composants/Icone.tsx`, `src/composants/PastillePrise.tsx`,
  `src/composants/Avertissement.tsx` ; à modifier : `src/index.css` (classes `.prise`, `.choix-couleur`).
  Lire `docs/design/DESIGN.md` §5 (« Pastille de prise », « Avertissement ») et §6.
- **Étapes** :
  1. `npm install @phosphor-icons/react`.
  2. `Icone.tsx` : `export function Icone({ nom, taille = 24, libelle }: { nom: NomIcone; taille?: number; libelle?: string })`.
     `NomIcone` = `'aujourdhui' | 'programme' | 'bilans' | 'profil' | 'bibliotheque' | 'assistant' | 'chrono' | 'avertissement' | 'arret' | 'hors-ligne' | 'synchronise' | 'glisser' | 'ajouter' | 'fermer' | 'source' | 'groupe' | 'solo' | 'filtre' | 'recherche' | 'cle' | 'suivant' | 'prise' | 'poutre' | 'vis'`.
     Correspondances Phosphor (graisse `"bold"`) : Sun, CalendarBlank, ChartLineUp, User, Books, ChatCircleText, Timer,
     Warning, HandPalm, CloudSlash, CloudCheck, DotsSixVertical, Plus, X, BookOpen, UsersThree, UserCircle, Funnel,
     MagnifyingGlass, Key, CaretRight. Les trois dernières (`prise`, `poutre`, `vis`) sont des SVG maison 24 × 24, trait
     2 px `currentColor`, bouts arrondis : prise = forme irrégulière avec un rond au centre ; poutre = rectangle arrondi
     avec trois creux en haut ; vis = cercle et une fente. Sans `libelle` : `aria-hidden="true"` ; avec : `role="img"` et `aria-label`.
  3. `PastillePrise.tsx` : `({ couleur, nom, taille = 'normale' }: { couleur: string; nom: string; taille?: 'normale' | 'petite' })`
     rend `<span className="prise" style={{ background: couleur }} aria-hidden="true" />` suivi de rien (le nom est écrit
     par l'appelant) ; commentaire : « la couleur vient des données de la salle, seule couleur écrite hors des variables ».
     CSS `.prise` : 30 × 24 px (petite : 20 × 16), bord 1,5 px `--texte`, `border-radius: 64% 36% 58% 42% / 42% 60% 40% 58%`,
     `transform: rotate(-12deg)`, `position: relative`, `flex: none` ; `::after` = trou de vis : rond de 6 px (petite :
     4 px) centré, fond `--surface`, bord 1 px `--texte`.
  4. `Avertissement.tsx` : `({ niveau, titre, children, pourquoi, correction }: { niveau: 'avertissement' | 'arret'; titre: string; children?: ReactNode; pourquoi?: ReactNode; correction?: { libelle: string; action: () => void } })`.
     Rend un bloc `.avertissement` ou `.signal-arret`, `role="status"` (avertissement) ou `role="alert"` (arrêt), icône
     `avertissement` ou `arret` à gauche (couleur `--avertissement` ou `--arret`), titre en gras, texte ; si `pourquoi` :
     bouton discret « Pourquoi ? » qui déplie le texte (`aria-expanded`) ; si `correction` : bouton discret avec son libellé.
     **Jamais** de bouton qui bloque ou qui dit « J'accepte ».
- **Critères d'acceptation** : build et tests passent ; une page de test n'est pas demandée, mais la tâche D-06 doit
  pouvoir importer ces composants sans les modifier ; aucune couleur en dur hors `PastillePrise` ; un lecteur d'écran
  n'annonce pas les icônes décoratives.
- **Pièges** : importer chaque icône Phosphor nommément (`import { Sun } from '@phosphor-icons/react'`) pour ne pas
  embarquer tout le jeu ; ne pas utiliser d'emoji comme repli.

### D-04 · Fenêtre de confirmation et erreurs en ligne
- **Objectif** : remplacer `window.confirm` et `window.alert` par des éléments de l'app.
- **Dépend de** : D-02. **Modèle** : Sonnet.
- **Fichiers** : créer `src/composants/Confirmation.tsx` ; modifier `src/App.tsx` (lignes de `quitter` et du `catch`
  de l'enregistrement), `src/ecrans/Questions.tsx`, `src/index.css`. Lire `docs/design/DESIGN.md` §5 (« Fenêtre de confirmation »).
- **Étapes** :
  1. `Confirmation.tsx` : utilise l'élément natif `<dialog>` ouvert par `showModal()` ; props `{ ouverte, titre, texte, libelleAction, libelleRester = 'Rester', onAction, onRester, danger?: boolean }`.
     Fiche centrée (classe `.fiche`), ombre `--ombre-flottante`, titre en `.titre.moyen`, texte, deux boutons empilés
     sur téléphone : action (`.bouton.principal`, ou `.bouton.arret` si `danger`) et « Rester » (`.bouton-second`).
     Focus initial sur « Rester » ; Échap = `onRester` ; voile `::backdrop` en `rgb(29 28 25 / 0.5)` (commentaire : encre à 50 %).
     `overscroll-behavior: contain`.
  2. `App.tsx` : `quitter` ouvre la confirmation (« Quitter la séance ? », « Elle ne sera pas enregistrée. »,
     « Quitter la séance », danger) au lieu de `window.confirm`.
  3. Échec d'enregistrement : au lieu de `window.alert`, l'écran Questions reçoit une erreur à afficher. Ajouter à
     `Questions` une prop `erreur?: string` affichée au-dessus du bouton dans un `.signal-arret` (`role="alert"`) :
     « La séance n'a pas pu être enregistrée. Tes réponses sont gardées : réessaie. » ; le bouton devient
     « Réessayer l'enregistrement ». Les réponses ne sont pas perdues.
- **Critères d'acceptation** : `grep -rn "window.confirm\|window.alert" src` ne trouve rien ; au clavier, Tab reste dans
  la fenêtre, Échap la ferme ; boutons ≥ 56 px ; test manuel : « Quitter » pendant une séance solo, puis « Rester » → la séance continue.
- **Pièges** : `<dialog>` doit être fermé par `close()` quand `ouverte` repasse à `false` ; ne pas perdre l'état de la
  séance en ouvrant la fenêtre.

### D-05 · Chrono plein écran à trois phases
- **Objectif** : rendre le chrono lisible à deux mètres, avec trois fonds distincts.
- **Dépend de** : D-02, D-03. **Modèle** : Sonnet.
- **Fichiers** : `src/ecrans/Chrono.tsx`, section « Écran de chrono » de `src/index.css`. Lire `docs/design/DESIGN.md`
  §2 (« Chrono plein écran ») et §3 (règle des chiffres), et ouvrir `docs/design/demo-chrono.html` (référence visuelle exacte).
- **Étapes** :
  1. Classe de l'écran selon la phase : `chrono preparation`, `chrono effort`, `chrono repos` ; en pause, la classe de la
     phase est gardée **et** `en-pause` s'ajoute. Fonds et textes avec les variables `--chrono-*`.
  2. `theme-color` : lire la valeur dans le CSS au lieu de l'écrire en dur :
     `getComputedStyle(document.documentElement).getPropertyValue('--chrono-effort-fond').trim()` (idem pour les autres
     phases) ; au démontage, remettre `--fond`.
  3. Chiffres : écrire une petite fonction `decouperChiffres(texte: string)` qui rend un `<span className="c">` par
     chiffre et un `<span className="dp">` pour « : ». CSS : `.chrono-nombre { font-family: var(--police-titre); font-weight: 900; line-height: 0.85; font-size: min(76vw, 300px); }`,
     `.chrono-nombre .c { display: inline-block; width: 0.5em; text-align: center; }`, `.chrono-nombre .dp { display: inline-block; width: 0.24em; text-align: center; }`,
     `.long` : `min(48vw, 190px)`, `.tres-long` : `min(38vw, 150px)`. Commentaire : « Big Shoulders n'a pas de chiffres
     de même largeur : chaque chiffre a sa case pour que le nombre ne bouge pas. »
  4. Consigne (`.chrono-consigne`) : `--police-titre` 900, 44 px, capitales, espacement 0,04 em. En-tête en
     `--police-fixe` 15 px capitales ; jauge des séries sous l'en-tête (un segment par série, plein si fait, en `currentColor`).
  5. Boutons : grille `2fr 1fr`, 76 px de haut. « Pause » / « Reprendre » : fond = couleur du texte de la phase, texte =
     couleur du fond de la phase. « Stop, ça fait mal » : classe `.bouton.arret` (même rendu dans les trois phases).
  6. Pause : bande de rubalise de 14 px en haut de l'écran (`repeating-linear-gradient(-45deg, var(--rubalise-avertissement) 0 12px, var(--texte) 12px 24px)`),
     mot « En pause » en `--police-titre`, « Reprendre » principal, « Quitter l'exercice » en lien discret.
  7. Focus sur fond sombre : `.chrono.preparation :focus-visible, .chrono.repos :focus-visible { outline-color: var(--focus-sur-sombre); }`.
  8. Annonce pour lecteur d'écran : un `<p className="pour-lecteur" aria-live="assertive">` (classe visuellement cachée à
     créer : `position:absolute; width:1px; height:1px; overflow:hidden; clip-path: inset(50%)`) mis à jour **seulement**
     quand le type de phase change : « Effort, 7 secondes », « Repos, 2 minutes », « Préparation ».
  9. Écrans « prêt » et « terminé » : fond `--fond`, titre, réglages en `.donnee`, « Démarrer » / « Continuer » en
     `.bouton.principal` de 72 px.
- **Critères d'acceptation** :
  - Capture des trois phases à 390 × 844 conforme à `demo-chrono.png` (fonds encre, craie, résine).
  - « 10:00 » tient dans la largeur à 360 px de large (pas de retour à la ligne, pas de débordement).
  - Pendant 10 s de chrono, la largeur du nombre ne change pas (mesure `getBoundingClientRect().width` stable).
  - Contrastes : craie sur encre ≥ 15:1, papier sur résine ≥ 7,5:1 ; anneau de focus visible sur fond encre.
  - `grep -n "#" src/ecrans/Chrono.tsx` ne trouve plus de couleur.
  - Les tests existants du chrono passent sans modification.
- **Pièges** : ne pas toucher à `useChrono.ts` ni `sequence.ts` (le moteur doit rester indépendant de l'affichage, pour
  la future montre) ; la transition entre phases est **instantanée** (pas de fondu).

### D-06 · Barre d'onglets et écran Aujourd'hui
- **Objectif** : appliquer Topo à la navigation et à Aujourd'hui, retirer les boutons morts, préparer le branchement au plan.
- **Dépend de** : D-03. **Modèle** : Sonnet.
- **Fichiers** : `src/App.tsx` (barre d'onglets, passage du profil à Aujourd'hui), `src/ecrans/Aujourdhui.tsx`, `src/index.css`.
  Lire `docs/design/parcours-et-ecrans.md` T-06 et ouvrir `docs/design/demo-aujourdhui.html` (référence visuelle).
- **Étapes** :
  1. Onglets : icône 24 px au-dessus du nom (`Icone` : aujourdhui, programme, bilans, profil), libellé 14 px.
  2. Aujourd'hui : en-tête `.mention` avec la **date du jour** (`Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })`),
     mention « Phase 1 · doigts · semaine 2 sur 4 » (consolidation 17/11, B9), titre `.titre` (44 px), **fiche de la séance** (`.fiche` avec deux
     `.vis`, `.etiquette` de dureté, durée en `.donnee`, liste des étapes de `SEANCE_EXEMPLE` avec `.repere` et durée).
  3. Deux boutons : le **mode habituel** est principal. Passer `profil.grimpeSouventEnGroupe` à `Aujourdhui` : si vrai,
     « Je grimpe en groupe » est principal et « Je grimpe seul » second ; sinon l'inverse. Icône `suivant` dans le
     principal, `groupe` ou `solo` dans le second.
  4. Supprimer les lignes « Forme du jour » et « Assiette du jour » (boutons sans action). Laisser un commentaire :
     « Forme du jour : revient en phase 4, utile aux contrôles du jour (tâche C-03, décision B10). » (consolidation 17/11)
  5. « Cette semaine » : titre de section en `<h2 className="mention">` ; 7 cases (L, M, M, J, V, S, D) en grille de
     7 colonnes : fait (fond `--accent-doux`, coche), aujourd'hui (bord 2 px `--accent`, carré résine), prévu (carré
     contour encre), repos (bord pointillé, fond creux, tiret). Chaque case a un `aria-label` complet (« Jeudi, technique »).
     Dessous : « Prochaine : jeudi, technique (facile) ». Données d'exemple dans une constante en haut du fichier, avec le
     commentaire « remplacé par le plan réel en D-22 ».
- **Critères d'acceptation** : capture à 390 × 844 proche de `demo-aujourdhui.png` (colonne de gauche) ; une seule
  action en résine ; aucun bouton sans action ; la date affichée est celle du jour ; outil de taille : rien sous 48 px.
- **Pièges** : ne pas casser `onSeanceSolo` / `onSeanceGroupe` ; garder les noms de jours lisibles par un lecteur d'écran.

### D-07 · Séance solo et séance en groupe
- **Objectif** : appliquer Topo aux deux écrans de séance.
- **Dépend de** : D-03, D-04. **Modèle** : Sonnet.
- **Fichiers** : `src/ecrans/SeanceSolo.tsx`, `src/ecrans/SeanceGroupe.tsx`, `src/ecrans/Debrief.tsx` (pastilles du tableau
  seulement), `src/index.css`. Lire `docs/design/parcours-et-ecrans.md` T-08 et T-09 ; ouvrir `docs/design/demo-aujourdhui.html` (colonne de droite).
- **Étapes** :
  1. Solo : étape en cours = `.fiche` avec bord `--accent` 2 px (au lieu de l'encre), `.repere` résine pour son numéro,
     titre `.titre.moyen` ; étapes suivantes en lignes avec `.repere` encre et durée `.donnee` ; jauge d'étapes
     (fait, actif, `passe` pour les étapes passées). « Passer l'étape » et « Terminer la séance » en `.bouton-second`
     côte à côte ; « Terminer la séance » devient `.bouton.principal` quand tout est traité.
  2. Groupe : titre de l'objectif en `.titre.moyen` ; carte « Noter un bloc » en `.fiche` avec deux vis ; grille des
     couleurs `repeat(3, minmax(0, 1fr))`, chaque bouton `.choix-couleur` (52 px, bord 2 px `--filet-fort`, fond papier,
     `PastillePrise` + nom en gras 15 px) ; sélectionné : bord 3 px `--texte` et coin encre 20 × 20 px en haut à droite avec une
     coche couleur `--fond` ; compteur d'essais ; « Pas encore » (second) et « Flashé » / « Enchaîné » (principal) **côte à
     côte** en grille 1fr 1fr, 64 px.
  3. Débrief : remplacer `.carre` par `PastillePrise taille="petite"`.
- **Critères d'acceptation** : capture du groupe conforme à la démo ; le nom de chaque couleur reste entier à 360 px de
  large ; la pastille noire est visible (bord encre) ; boutons de séance ≥ 64 px ; « Quitter » ouvre la confirmation (D-04).
- **Pièges** : la couleur de la pastille ne change jamais à la sélection ; ne pas utiliser `--accent` pour la sélection d'une couleur.

### D-08 · Trois questions, débrief, bilans, mises en garde
- **Objectif** : appliquer Topo aux écrans de fin de séance et de consultation.
- **Dépend de** : D-03, D-04. **Modèle** : Sonnet.
- **Fichiers** : `src/ecrans/Questions.tsx`, `src/ecrans/Debrief.tsx`, `src/ecrans/Historique.tsx`, `src/ecrans/MisesEnGarde.tsx`,
  `src/index.css`. Lire `docs/design/parcours-et-ecrans.md` T-11, T-12, T-13, T-15.
- **Étapes** :
  1. Questions : choix sélectionnés en encre (déjà fait par D-02, vérifier) ; sous le bouton désactivé, `.texte-3` :
     « Réponds aux trois questions pour continuer. » (masqué quand tout est rempli).
  2. Débrief : si `s.douleur`, `Avertissement niveau="arret"` en tête : « Douleur signalée », « Relis les repères avant ta
     prochaine séance. », avec un bouton qui ouvre les mises en garde (ajouter une prop `onMisesEnGarde` si nécessaire).
     Chiffres clés : légende sur une ligne (« étapes faites », et « sur 6 » dans le chiffre : `1/6` en `.donnee`).
     Remplacer le `<main aria-busy>` vide par 3 `.silhouette` (une grande, deux lignes).
  3. Bilans : groupement par semaine (titre de groupe `.mention` « Semaine du 10 nov. · charge 1 240 ») ; « Chargement… »
     remplacé par des silhouettes de lignes ; état vide inchangé dans le texte.
  4. Mises en garde : « Arrête la séance et consulte » dans un `Avertissement niveau="arret"` contenant la liste ;
     « Allège pendant 1 à 2 semaines » dans un `Avertissement niveau="avertissement"`.
- **Critères d'acceptation** : aucune page vide pendant un chargement ; contrastes vérifiés sur `--avertissement-fond`
  et `--arret-fond` (texte ≥ 14:1) ; titres de section en `<h2>` ; tests existants (`debrief.test.ts`) inchangés et verts.
- **Pièges** : ne pas changer les calculs de `debrief.ts` ; garder les textes de mises en garde mot pour mot.

### D-09 · Profil, bienvenue, erreur, chargement, icône de l'app
- **Objectif** : finir la reprise des écrans existants.
- **Dépend de** : D-02. **Modèle** : Haiku.
- **Fichiers** : `src/ecrans/ProfilFormulaire.tsx`, `src/ecrans/Profil.tsx`, `src/ecrans/Bienvenue.tsx`,
  `src/ecrans/Erreur.tsx`, `src/ecrans/EnConstruction.tsx`, `public/favicon.svg`, `src/index.css`.
- **Étapes** :
  1. Formulaire : si le prénom est vide à l'envoi, ne pas valider : classe `.champ.erreur`, message sous le champ
     « Écris ton prénom pour continuer. », focus sur le champ. Les choix utilisent le rendu de D-02.
  2. Profil : la phrase « Tes données restent sur cet appareil… » est gardée (elle changera en D-21).
  3. Chargement : remplacer « Chargement… » par une silhouette de titre et deux de lignes (`.silhouette`), après 400 ms (garder l'animation d'apparition).
  4. `favicon.svg` : carré arrondi fond `#F1EFE9`, une prise (forme irrégulière) en `#0F5A54` bordée de `#1D1C19` (3 px à
     l'échelle 512), avec son trou de vis `#FBFAF7` ; commentaire XML qui nomme les variables correspondantes.
     (consolidation 17/11) L'app s'appelle « Get me to 9a » : ajouter « 9a » en tracés `#FBFAF7` sous le trou de vis,
     lisible à 48 px, et `<title>Get me to 9a</title>`. Le manifeste et le titre de page sont renommés par D-01.
- **Critères d'acceptation** : envoyer un profil sans prénom affiche l'erreur et ne passe pas à l'écran suivant ; l'icône
  se voit sur fond clair et foncé ; outil de taille : rien sous 48 px sur Profil.
- **Pièges** : `onValider` ne doit pas être appelé si le prénom est vide (Bienvenue l'utilise pour le premier lancement).

### D-10 · Coquille « bureau » (≥ 1024 px)
- **Objectif** : donner à l'app une mise en page d'ordinateur, prête à recevoir les écrans de la phase 3.
- **Dépend de** : D-06 ; la tâche de **navigation de l'architecte** [archi] (routes ou état de navigation) — si elle existe,
  utiliser ses noms d'écrans ; sinon garder l'état actuel de `App.tsx`. **Modèle** : Sonnet.
- **Fichiers** : `src/App.tsx`, créer `src/composants/BarreBureau.tsx`, `src/index.css`. Lire `docs/design/parcours-et-ecrans.md`
  §0 (navigation) et §3 (mise en page commune) ; ouvrir `docs/design/demo-constructeur.html` (barre du haut).
- **Étapes** :
  1. Détecter la largeur avec `matchMedia('(min-width: 1024px)')` (écouter les changements).
  0. (consolidation 17/11) Tâche fusionnée avec F2-14 (fichiers `src/miseEnPage/`) : voir `docs/backlog-v2.md`. Rubrique
     « Tableau de bord » : pas l'écran Aujourd'hui (il lance des séances, B12) mais un écran « En construction ».
  2. Au-dessus de 1024 px : barre du haut de 64 px (fond `--fond`, filet bas 2 px `--texte`) : marque « Get me to 9a » (consolidation 17/11)
     (`--police-titre` 900, 26 px, icône `prise`), liens « Tableau de bord », « Plan », « Bibliothèque », « Bilans »,
     « Profil » (gras, 48 px de haut, actif souligné résine 3 px, `aria-current="page"`), à droite un emplacement pour
     l'état de synchronisation et le bouton « Assistant » (`.bouton-second` petit, désactivé pour l'instant avec
     `title` « Arrive en phase 5 »). La barre d'onglets du bas est masquée.
  3. Contenu : conteneur `max-width: 1280px`, marges 32 px. « Tableau de bord » affiche pour l'instant l'écran Aujourd'hui ;
     « Plan » et « Bibliothèque » affichent `EnConstruction`.
  4. Écrans de séance, chrono, questions, débrief : colonne centrée de 480 px même sur grand écran.
  5. Lien d'évitement « Aller au contenu » en premier élément focalisable (visible au focus).
- **Critères d'acceptation** : à 1366 × 860, barre du haut visible, pas de barre du bas ; à 390 px, rendu téléphone inchangé ;
  passer de l'un à l'autre en redimensionnant ne perd pas l'écran courant ; Tab depuis le haut atteint « Aller au contenu » en premier.
- **Pièges** : ne pas dupliquer les écrans (même composant, mise en page différente) ; ne pas lancer de séance en
  redimensionnant.

---

## Phase 3 : les écrans de l'ordinateur

Pour toutes ces tâches : écran décrit dans `docs/design/parcours-et-ecrans.md` (section citée), style dans
`docs/design/DESIGN.md`, référence visuelle `docs/design/demo-constructeur.html`. Données : utiliser les fonctions
fournies par les tâches [archi] et [entraînement] citées ; **ne pas** inventer de règle d'entraînement.

### D-11 · Bibliothèque filtrable
- **Objectif** : écran O-06.
- **Dépend de** : D-10 ; [entraînement] une fonction qui dit, pour un protocole et un profil, si les prérequis sont
  remplis et la liste des manques en texte clair, et si une contre-indication est active. **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/Bibliotheque.tsx`, `src/composants/FicheProtocole.tsx` (fiche de grille),
  `src/donnees/bibliotheque/filtres.ts` (+ `filtres.test.ts`) ; modifier `src/App.tsx` (brancher l'écran), `src/index.css`.
  Lire `src/donnees/bibliotheque/types.ts` et `index.ts`.
- **Étapes** :
  1. `filtres.ts` : type `Filtres` (texte, qualités[], terrains[], dureeMax, prerequis: 'tous' | 'conviennent' | 'pas_encore',
     preuves[], groupe: boolean, origine) et `filtrer(protocoles, filtres, profil)` ; recherche sans accents ni casse sur
     nom, consigne, auteur. Tests : au moins un cas par filtre et une combinaison.
  2. Colonne de filtres de 280 px (choix en `.filtre`, sélection encre), compteur « 12 protocoles · 9 te conviennent »
     annoncé (`aria-live="polite"`), grille de fiches (3 colonnes à ≥ 1280 px, 2 en dessous).
  3. Fiche de grille (`FicheProtocole`) : `.fiche` avec **une** vis, étiquette « QUALITÉ · DURÉE », nom, résumé,
     étiquette de preuve, terrain, prérequis manquants (`.etiquette.attente` « PRÉREQUIS » + texte), contre-indication
     active (`Avertissement niveau="arret"` compact). Fiche entière cliquable (`<button>` ou lien) → D-12.
  4. Filtres reflétés dans l'adresse (`?qualite=doigts&duree=20`) pour retrouver la même vue.
  5. Action principale « Créer un exercice » (désactivée tant que D-13 n'est pas faite, avec la raison en `title`).
  6. États : silhouettes de 6 fiches ; aucun résultat → « Aucun protocole ne correspond. Retire un filtre. » et les
     filtres actifs en boutons « × qualité : doigts ».
- **Critères d'acceptation** : tests de `filtres.ts` verts ; « Seulement ceux qui me conviennent » cache les protocoles
  aux prérequis non remplis ; recharger la page garde les filtres ; 60 fiches s'affichent sans saccade.

### D-12 · Fiche protocole en panneau latéral
- **Objectif** : écran O-07.
- **Dépend de** : D-11. **Modèle** : Sonnet.
- **Fichiers** : créer `src/composants/PanneauLateral.tsx`, `src/ecrans/bureau/FicheDetail.tsx`,
  `src/donnees/bibliotheque/reglages.ts` (+ test) ; `src/index.css`.
- **Étapes** :
  1. `PanneauLateral` : 560 px à droite, bord gauche 2 px encre, ombre flottante, croix de fermeture (`aria-label`
     « Fermer »), Échap ferme, focus piégé, focus rendu à l'élément d'origine, `overscroll-behavior: contain`.
  2. `reglages.ts` : `decrireReglages(config: ConfigChrono): string` en français (« 9 échelles de 3, 6 puis 9 s · créneau
     de 45 s · 6 s entre deux suspensions »), un cas de test par gabarit.
  3. Contenu dans l'ordre de O-07, prérequis un par ligne avec l'état pour le profil ; « À vérifier » en avertissement.
     (consolidation 25/11, audit phase 3) Remplacé : section « Réglage estimé » (texte `aVerifier`), sans rubalise ambre,
     juste avant la source (O-07 consolidé, et son vocabulaire). Code : AUD3-05.
  4. Action principale « Ajouter au plan » (désactivée avec la raison tant que D-16 n'existe pas) ; « Essayer le chrono »
     (second) ouvre l'écran Chrono avec la config du protocole.
- **Critères d'acceptation** : tests verts ; le panneau s'ouvre depuis une fiche de la bibliothèque, se ferme à Échap,
  et le focus revient sur la fiche.

### D-13 · Création d'un exercice personnel
- **Objectif** : écran O-08.
- **Dépend de** : D-12 ; [archi] l'enregistrement des exercices personnels (forme et fonctions). **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/ExercicePerso.tsx` ; modifier `Bibliotheque.tsx` (bouton), `src/index.css`.
- **Étapes** : formulaire en 2 colonnes (formulaire 7/12, aperçu `FicheProtocole` en direct 5/12) ; champs et aides de O-08
  dans l'ordre ; questions de sécurité en choix « Oui / Non / Je ne sais pas » avec l'aide « Je ne sais pas compte comme
  oui, par prudence » ; référence livre (liste des 3 titres + « Autre ») et page (`inputMode="numeric"`) ; validation
  en ligne (nom, qualité, forme), focus sur la première erreur ; confirmation si on quitte avec des changements.
- **Critères d'acceptation** : un exercice créé apparaît dans la bibliothèque avec l'étiquette « PERSO » et sa référence ;
  « Je ne sais pas » à « effort maximal » produit le marqueur prudent (vérifié par un test sur la conversion réponses →
  marqueurs, si [archi] fournit la fonction, sinon l'écrire dans `src/donnees/exercicePerso.ts` avec un test).

### D-14 · Plan : vue 12 semaines
- **Objectif** : écran O-03.
- **Dépend de** : D-10 ; [archi] lecture et écriture du cycle, des blocs (mésocycles) et de leurs objectifs. **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/Plan.tsx` (sélecteur de vue), `src/ecrans/bureau/VueCycle.tsx`,
  `src/composants/BandeSemaines.tsx` (la bande S1 à S12, réutilisée par le téléphone en D-22) ; `src/index.css`.
- (consolidation 17/11) « Phase » au lieu de « Bloc » (B9), accent technique possible (B13), bouton « Valider le cycle »
  (le cycle reste brouillon, invisible sur le téléphone, jusque-là).
- **Étapes** : en-tête (nom modifiable en place, date de début, séances par semaine en choix 2 à 5) ; trois colonnes de
  blocs (accent en liste, deux emplacements d'objectifs → fenêtre O-09, 4 semaines avec étiquettes de dureté et barre de
  charge, 4e semaine hachurée « ALLÉGÉE » avec son réglage) ; sélecteur de vue « 12 semaines / Bloc / Semaine » (encre) ;
  action principale « Ouvrir la semaine en cours ». `BandeSemaines` : cases de 30 px, faite = `--accent-doux`, ouverte =
  encre avec un trait résine en bas, allégée = hachures, `aria-current` sur la semaine en cours.
- **Critères d'acceptation** : un cycle vide se crée et s'enregistre ; un 3e objectif est impossible et le dit ; la bande
  est lisible au clavier (chaque case est un bouton avec « Semaine 4, allégée »).

### D-15 · Plan : vue bloc
- **Objectif** : écran O-04.
- **Dépend de** : D-14. **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/VueBloc.tsx` ; `src/index.css`.
- (consolidation 17/11) Fichier `VuePhase.tsx` et libellés « Phase » (B9) ; la recopie de la semaine 1 est une copie
  identique (aucune fonction de progression n'existe), l'écran le dit.
- **Étapes** : tableau 4 × 7 (`<table>` avec en-têtes de lignes et colonnes), étiquettes compactes de séance, charge par
  semaine, bouton « Recopier la semaine 1 sur les semaines 2 et 3 » (la progression est appliquée par la fonction
  [entraînement] si elle existe, et l'écran le dit), menu de case (Ajouter, Copier, Coller, Vider), bouton « Déplacer »
  par séance (choix semaine + jour). Le glisser-déposer viendra en D-17.
- **Critères d'acceptation** : toutes les actions marchent au clavier ; « Vider » demande confirmation (D-04).

### D-16 · Plan : vue semaine et éditeur de séance
- **Objectif** : écran O-05 sans le glisser-déposer.
- **Dépend de** : D-15, D-12. **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/VueSemaine.tsx`, `src/composants/FicheSeance.tsx`, `src/composants/RailBibliotheque.tsx`
  (version compacte de D-11 pour la colonne de gauche) ; `src/index.css`.
- **Étapes** : disposition 312 px / reste / (404 px réservés à l'assistant plus tard) ; 7 lignes de jours ; repos en bande
  creuse ; `FicheSeance` comme la démo : étiquette de dureté (calculée), nom modifiable, durée (calculée), bascule
  « SOLO | GROUPE » (encre), étapes avec `.repere`, étiquettes PRÉREQUIS / RÉGLAGE ESTIMÉ (consolidation 25/11, audit
  phase 3 : « À VÉRIFIER » avant ; champ `aVerifier`, voir O-07 ; code AUD3-05) / PERSO, menu par étape (Voir la
  fiche, Remplacer, Monter, Descendre, Retirer) ; version groupe : échauffement commun, objectifs (libellé, cible, couleur
  conseillée avec `PastillePrise`, essais max), « Ajouter un objectif », « Copier depuis la version solo » ;
  dans le rail, bouton « Ajouter à… » sur chaque fiche ; action principale « Ajouter une séance ».
- **Critères d'acceptation** : une semaine complète (3 séances, versions solo et groupe) se compose au clavier seul ; la
  durée et la dureté se mettent à jour à chaque changement ; rien n'est stocké qui puisse être calculé (durée, dureté).

### D-17 · Plan : glisser-déposer et alternatives clavier
- **Objectif** : glisser des protocoles et des séances, à la souris et au doigt.
- **Dépend de** : D-16. **Modèle** : Sonnet.
- **Fichiers** : `VueSemaine.tsx`, `VueBloc.tsx`, `RailBibliotheque.tsx`, `FicheSeance.tsx`, `src/index.css`.
- **Étapes** : utiliser les événements de pointeur (`pointerdown`, `pointermove`, `pointerup`) plutôt que l'API HTML de
  glisser-déposer (qui ne marche pas au doigt) — ou une petite bibliothèque si l'architecte en a retenu une ; fiche saisie :
  ombre flottante, `scale(1.02)`, contour résine ; zones valables : fond `--accent-doux`, bord pointillé résine 2 px, texte
  qui dit l'effet (« Dépose ici pour ajouter Échelles 3-6-9 à samedi ») ; Échap annule ; pendant le glisser :
  `user-select: none` ; annonce `aria-live` au dépôt (« Échelles 3-6-9 ajouté à samedi »).
- **Critères d'acceptation** : glisser depuis le rail vers un jour vide crée une séance ; réordonner les étapes d'une
  séance ; tout ce qui se fait au glisser se fait aussi par les boutons de D-15 et D-16.

### D-18 · Avertissements de sécurité en direct
- **Objectif** : afficher les avertissements calculés par les règles, aux bons endroits, sans bloquer.
- **Dépend de** : D-16 ; [entraînement] la fonction qui calcule, pour un plan, la liste des avertissements (niveau,
  portée, cible, titre, explication, source, correction proposée). **Modèle** : Sonnet.
- **Fichiers** : `VueSemaine.tsx`, `FicheSeance.tsx`, `VueBloc.tsx`, `VueCycle.tsx`, `src/composants/Avertissement.tsx`
  (ajout de « Je garde ce choix »). Lire `docs/design/parcours-et-ecrans.md` §4.
- **Étapes** : recalcul à chaque changement (mémorisé) ; en tête de semaine la liste ; sur la fiche de séance un repère
  « triangle + nombre » et la ligne fautive surlignée ; sur la vue bloc et la vue 12 semaines un repère ambre sur la case ;
  « Je garde ce choix » replie l'avertissement en une ligne (état mémorisé selon [archi]) ; correction en un clic ;
  aucun bouton désactivé à cause d'un avertissement.
- **Critères d'acceptation** : poser deux séances maximales à moins de 48 h affiche l'avertissement en moins d'une
  seconde, sur la semaine et sur les deux séances (ouvert au niveau le plus précis, résumé ailleurs) ; l'enregistrement
  reste possible ; la correction proposée déplace la séance et l'avertissement disparaît.

### D-19 · Tableau de bord
- **Objectif** : écran O-02. **Dépend de** : D-14, D-18. **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/TableauDeBord.tsx` ; `src/App.tsx` (remplace Aujourd'hui sur ordinateur).
- **Étapes** : grille 8/4 de O-02 ; états « aucun cycle » (trois fiches de départ) et « cycle terminé » ; action principale
  « Ouvrir la semaine en cours » ; (consolidation 17/11, B12) pas de « Faire la séance ici » : « Les séances se lancent
  depuis ton téléphone ».
- **Critères d'acceptation** : les trois états s'affichent avec des données d'essai ; une seule action en résine.

### D-20 · Profil et réglages sur ordinateur, clé de l'assistant
- **Objectif** : écran O-12. **Dépend de** : D-10 ; [archi] profil v2 (prérequis) et stockage local de la clé.
  **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/Reglages.tsx` ; réutiliser `ProfilFormulaire.tsx` (ajouter les prérequis si
  [archi] les a ajoutés au profil).
- **Étapes** : sommaire à gauche, sections de O-12 ; section Assistant : champ `type="password"` avec « Afficher »,
  `autoComplete="off"`, `spellCheck={false}`, aide sur la confidentialité, états vérifiée / pas vérifiée / refusée,
  « Vérifier la clé » (second), « Retirer la clé » (confirmation) ; confirmation si on quitte une section modifiée.
- **Critères d'acceptation** : la clé n'apparaît jamais en clair sans action, n'est pas dans l'export de données et
  n'est pas envoyée à la synchronisation (vérifier avec l'architecte) ; « Supprimer mon compte » exige de taper « supprimer ».

---

## Phases 4 à 6

### D-21 · Connexion par lien e-mail et reprise des données
- **(consolidation 17/11)** Connexion par **code** (B1), dès la phase 2 : les écrans T-02, T-03, T-04 et O-01 sont faits
  par F2-07 (écran Compte) et F2-09 (écran Reprise) avec les textes de `parcours-et-ecrans.md` ; D-21 est réduite à
  l'accueil T-01, au bandeau P2, à la section Compte du profil et aux états réseau. Texte qui fait foi : `docs/backlog-v2.md`.
- **Objectif** : écrans T-01 à T-04 et O-01. **Dépend de** : D-04 ; [archi] comptes (envoi du lien, session, reprise).
  **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/Connexion.tsx`, `src/ecrans/LienEnvoye.tsx`, `src/ecrans/Reprise.tsx` ; modifier
  `Bienvenue.tsx`, `Profil.tsx` (section Compte), `src/App.tsx`.
- **Étapes** : suivre P1, P2 et T-01 à T-04 mot pour mot (textes de `parcours-et-ecrans.md` §5) ; champ e-mail
  `type="email"`, `autoComplete="email"`, `spellCheck={false}` ; « Renvoyer le lien » actif après 60 s avec décompte ;
  reprise avec jauge « n sur N », reprise interrompue reprenable ; rien n'est effacé du téléphone ; bandeau hors ligne.
- **Critères d'acceptation** : un téléphone avec 14 séances locales les retrouve dans le compte après connexion ; couper
  le réseau pendant la reprise puis le rétablir finit la reprise sans doublon ; tous les états de T-02 à T-04 s'affichent.

### D-22 · Aujourd'hui et Programme branchés sur le plan
- **Objectif** : écrans T-06 et T-07 sur les vraies données ; séances lancées depuis le plan. **Dépend de** : D-06, D-07,
  D-14 ; [archi] lecture du plan sur téléphone et lien séance prévue → séance réalisée. **Modèle** : Sonnet.
- **Fichiers** : `Aujourdhui.tsx`, créer `src/ecrans/Programme.tsx` (remplace `EnConstruction`), `src/App.tsx`,
  `SeanceSolo.tsx`, `SeanceGroupe.tsx`, `Debrief.tsx` ; supprimer l'usage de `seanceExemple.ts` et `seanceGroupeExemple.ts`
  dans les écrans.
- **Étapes** : tous les états de T-06 (pas de plan, repos, faite, manquée, chargement, hors ligne) ; signal d'arrêt si
  douleur déclarée ; T-07 avec `BandeSemaines` (D-14) et aperçu de séance « Faire cette séance maintenant » ; débrief :
  ligne « Séance prévue : … · faite » et état d'envoi.
- **Critères d'acceptation** : une semaine réelle se suit de bout en bout (fin de phase 4 du plan) ; plus aucune donnée
  d'exemple affichée ; hors ligne, Aujourd'hui s'affiche avec la dernière version du plan et sa date.

### D-23 · Panneau de l'assistant
- **Objectif** : écran O-10. **Dépend de** : D-16, D-18, D-20 ; [entraînement] format des propositions et sources ;
  [archi] appel du modèle depuis le navigateur. **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/Assistant.tsx`, `src/composants/ElementProposition.tsx` ; `VueSemaine.tsx`
  (surlignage de la case visée) ; `BarreBureau.tsx` (activer le bouton).
- (consolidation 17/11) Coût estimé affiché avant chaque demande et modèle nommé (Haiku par défaut, B5, B6) ; ordinateur
  seulement (B7) ; un livre s'affiche sous « Lecture conseillée », jamais comme source d'une règle.
- **Étapes** : panneau de 404 px (par-dessus le contenu sous 1280 px, avec voile) ; messages ; étiquette sépia
  « BROUILLON » et compteur ; éléments avec Garder (encre plein), Modifier, Rejeter, statut et « Annuler » ; « Garder tout
  ce qui reste » en discret ; sources numérotées (livres par leur titre seulement) ; avertissements dans l'élément ;
  demandes toutes faites ; tous les états d'erreur de O-10 ; aucun changement du plan sans « Garder ».
- **Critères d'acceptation** : une proposition de 3 éléments se trie élément par élément, chaque choix est annulable ;
  une proposition qui viole une règle affiche la rubalise dans l'élément et dans le plan une fois gardée ; sans clé, l'état
  vide renvoie aux réglages ; hors ligne, le champ est désactivé avec la raison.

### D-24 · Bilans sur ordinateur et téléphone
- **Objectif** : écrans O-11 et T-13. **Dépend de** : D-10 ; [archi] tests repères. **Modèle** : Sonnet.
- **Fichiers** : créer `src/ecrans/bureau/Bilans.tsx`, `src/composants/PetitGraphique.tsx` (SVG fait main, sans
  bibliothèque) ; `Historique.tsx`.
- **Étapes** : onglets Qualités / Phases / Séances (consolidation 17/11) (état dans l'adresse) ; 5 petits graphiques (une couleur : encre, dernière
  valeur en résine, séparations de blocs en pointillé `--filet-fort`), résumé texte et tableau accessible par graphique ;
  tableau comparatif des blocs ; historique triable ; « Saisir un test repère » ; états vides de O-11.
- **Critères d'acceptation** : aucun graphique multicolore ; chaque graphique a un résumé lisible par un lecteur d'écran ;
  contrastes des traits ≥ 3:1 sur `--surface`.
