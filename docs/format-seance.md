# Format d'une séance : planifiée, réalisée, et chrono

Ce document décrit les données qu'échange l'app « Get me to 9a » avec le serveur, pour qu'une future app native (Apple Watch) puisse **lire la séance du jour, faire tourner le chrono à l'identique, puis écrire la séance réalisée**. Il se lit sans connaître TypeScript.

Les fichiers de `docs/format-seance/` sont la référence : une autre implémentation doit produire exactement les mêmes phases. Ils sont vérifiés à chaque `npm run test` par `src/moteur/format.test.ts` : si le code change un champ ou une durée, le test échoue.

| Fichier | Contenu |
|---|---|
| `seance-planifiee.json` | Une séance planifiée complète (versions solo et groupe) |
| `seance-realisee.json` | Une séance réalisée en groupe (3 blocs), liée à la planifiée |
| `chrono-vecteurs.json` | Six réglages de chrono, chacun avec la liste exacte des phases attendues |

Régénérer les fichiers après un changement voulu : `REGENERER=1 npx vitest run src/moteur/format.test.ts`.

## 1. Principe : une séance planifiée est autonome

Une séance planifiée contient **tout ce qu'il faut pour être exécutée** : titres, consignes, durées, réglages de chrono déjà appliqués. L'app native n'a **jamais** besoin de la bibliothèque de protocoles.

Conséquence importante : les **marqueurs** d'une version (`poutre`, `bloc_limite`, `maximale`…), qui servent aux règles de sécurité (quotas par semaine, 48 h entre deux séances maximales), **ne sont pas dans le document**. Ils se calculent côté ordinateur depuis la bibliothèque, à partir de `origine.refId` des étapes. La montre n'en a pas besoin pour exécuter la séance : elle ne les lit pas et ne les écrit pas. (Seule la séance réalisée porte un champ `marqueurs` facultatif, voir § 6.)

De même ne sont pas stockés, car calculés : le statut d'une séance (faite, sautée, manquée…), la durée d'une version solo (somme des `dureeMin` de ses étapes), la date de début d'une phase.

## 2. Où lire et écrire

Tout vit dans la table `documents` de Supabase (même projet que l'app, même connexion par code reçu par e-mail).

| Colonne | Sens |
|---|---|
| `user_id` | Propriétaire. Posé par le serveur (`auth.uid()`). Chacun ne voit que ses lignes (règles d'accès au niveau de la ligne). |
| `type` | Nom de la table locale : `seancesPlanifiees`, `seancesRealisees`, `cycles`… |
| `id` | Identifiant du document (UUID). |
| `contenu` | Le document, en JSON : tout ce que décrit ce fichier. |
| `modifie_le` | Copie de `contenu.modifieLe`. |
| `supprime_le` | Copie de `contenu.supprimeLe`. |
| `recu_le` | Heure de réception, posée par le serveur : sert de curseur pour « ce qui a changé depuis ». |

Lire la séance du jour (PostgREST) :

```
GET /rest/v1/documents?type=eq.seancesPlanifiees&contenu->>date=eq.2026-11-17&select=contenu
```

La date est le **jour local** de l'utilisateur, au format `AAAA-MM-JJ`.

**Règle « dernière modification gagne »** : si un document existe déjà, celui dont `modifieLe` est le plus récent est gardé (le serveur refuse de remplacer une version plus récente). Une app native doit donc **toujours** poser `modifieLe` à l'heure de la modification, et ne jamais réécrire un document qu'elle n'a pas modifié.

**`versionFormat`** : présent sur chaque document, vaut 1. Si une app lit une valeur qu'elle ne connaît pas, elle ne doit pas interpréter le document (elle l'affiche comme « mise à jour de l'app nécessaire » et n'y touche pas).

### Ce que la montre doit ignorer ou vérifier

- Un document avec `supprimeLe` est supprimé : l'ignorer. (Les suppressions sont « douces » : la ligne reste.)
- **Une séance avec `sauteeLe` ne doit pas être proposée** : l'utilisateur a choisi de la sauter.
- Une séance déjà **faite** ne doit pas être reproposée : il existe un document `seancesRealisees` non supprimé dont `seancePlanifieeId` est l'`id` de la planifiée.
- Un cycle en **brouillon** n'apparaît jamais sur le téléphone : lire le document `cycles` d'identifiant `cycleId` et ne proposer la séance que si `etat = 'valide'` et `abandonneLe` est absent. Si le cycle est introuvable, ne rien proposer (prudence).

## 3. Champs communs à tout document

| Champ | Type | Sens |
|---|---|---|
| `id` | texte | UUID. |
| `versionFormat` | 1 | Forme du document (voir § 2). |
| `creeLe` | horodatage | Création, heure UTC : `2026-11-17T18:32:00.000Z`. |
| `modifieLe` | horodatage | Dernière modification, heure UTC. Sert à la règle « dernière modification gagne ». |
| `supprimeLe` | horodatage, facultatif | Présent = document supprimé (à ignorer). |

Une **date** (`date`) est un jour local `AAAA-MM-JJ`, sans heure ni fuseau. Un **horodatage** est toujours en UTC, avec `Z`.

## 4. Séance planifiée (`type = 'seancesPlanifiees'`)

Exemple complet : `docs/format-seance/seance-planifiee.json`.

### 4.1 `SeancePlanifiee`

| Champ | Type | Sens |
|---|---|---|
| (champs communs) | | Voir § 3. |
| `cycleId` | texte | Identifiant du cycle (document `cycles`). |
| `phaseId` | texte | Identifiant de la phase de 4 semaines (document `phases`). |
| `semaine` | 1 à 4 | Semaine dans la phase. |
| `date` | jour local | Jour prévu. |
| `qualite` | texte | Qualité dominante : `doigts`, `traction_gainage`, `puissance`, `resistance`, `endurance`, `technique`, `mental`, `antagonistes`, `mobilite`, `echauffement`. |
| `solo` | `VersionSolo` | Version à faire seul. Toujours présente. |
| `groupe` | `VersionGroupe` ou `null` | Version en groupe. `null` = pas de version groupe (séance à la maison). |
| `seanceTypeId` | texte, facultatif | Séance type du catalogue d'origine (`ST-DOI-02`). Information seulement. |
| `variante` | texte, facultatif | Variante choisie de cette séance type. Information seulement. |
| `sauteeLe` | horodatage, facultatif | L'utilisateur a choisi de sauter la séance : ne pas la proposer. |

L'utilisateur choisit la version (solo ou groupe) au moment de commencer.

### 4.2 `VersionSolo`

| Champ | Type | Sens |
|---|---|---|
| `nom` | texte | Titre de la séance. |
| `etapes` | liste d'`EtapeSeance` | Dans l'ordre d'exécution. |
| `durete` | `'dure'` ou `'legere'` | Séance dure ou légère. |
| `effortPrevu` | 1 à 10, facultatif | Effort annoncé. Absent = **7** si dure, **4** si légère. |

### 4.3 `VersionGroupe`

| Champ | Type | Sens |
|---|---|---|
| `nom` | texte | Titre de la séance. |
| `durete` | `'dure'` ou `'legere'` | Comme en solo. |
| `effortPrevu` | 1 à 10, facultatif | Absent = 7 si dure, 4 si légère. |
| `dureeMin` | minutes, facultatif | Durée **annoncée** (« 1 h 30 » = 90). Elle n'est pas calculable pour une séance de groupe : c'est une annonce, pas une somme. |
| `reposConseilleS` | secondes | Repos conseillé entre deux essais de bloc. |
| `objectifs` | 1 à 3 `ObjectifGroupe` | Défis suivis par un compteur. |
| `miniBloc` | facultatif | `{ moment: 'avant' ou 'apres', etapes: EtapeSeance[] }` : un petit bloc solo avant ou après les objectifs. |

L'échauffement en commun n'est jamais stocké : l'écran le rappelle toujours.

### 4.4 `ObjectifGroupe`

| Champ | Type | Sens |
|---|---|---|
| `libelle` | texte | Ce qu'on affiche : « 3 blocs durs à réglettes, 4 essais max chacun ». |
| `cible` | nombre | Nombre à atteindre. |
| `compte` | `'blocs_notes'` ou `'flashs'` | Ce qui compte : n'importe quel bloc noté enchaîné, ou seulement les flashs. |
| `couleurConseillee` | texte, facultatif | Couleur de prises conseillée (ne sert qu'à désigner les blocs). |
| `modeleId` | texte, facultatif | Objectif du catalogue (`OG-01`). Information. |
| `ficheReference` | texte, facultatif | Protocole solo équivalent ; les marqueurs de l'objectif s'en déduisent (jamais stockés). |
| `blocs` | nombre, facultatif | Nombre de blocs prévus. |
| `essaisMaxParBloc` | nombre, facultatif | Borne de sécurité à afficher pendant la séance. |
| `ecartCotation` | `[nombre, nombre]`, facultatif | Écart de cotation conseillé par rapport au niveau de l'utilisateur. |
| `reposConseilleS` | secondes, facultatif | Repos conseillé propre à cet objectif. |
| `accents` | liste de qualités, facultatif | Qualités que l'objectif travaille. |

Tous les champs facultatifs peuvent manquer : la montre doit fonctionner avec `libelle`, `cible` et `compte` seuls.

### 4.5 `EtapeSeance`

Une étape est **autonome** : elle ne relit jamais la bibliothèque. Champs communs :

| Champ | Type | Sens |
|---|---|---|
| `id` | texte | Unique dans la séance : `echelles`, `bloc-limite-2`. |
| `titre` | texte | Titre affiché. |
| `resume` | texte | Très court : `9 échelles`, `40 min`. |
| `consigne` | texte | Une ou deux phrases : quoi faire et pourquoi. |
| `dureeMin` | minutes | Durée indicative, repos compris. |
| `preuve` | texte, facultatif | `Étude`, `Avis de coach` ou `Synthèse` : solidité de la source des réglages. |
| `origine` | facultatif | `{ source: 'bibliotheque' ou 'perso', refId, reglages? }` : d'où vient l'étape. Information seulement ; `refId` sert à l'ordinateur pour retrouver les marqueurs. |
| `origine.reglages` | facultatif | Trace des réglages de l'utilisateur déjà appliqués à l'étape : `series`, `reposS`, `dureeMin` (tous facultatifs). **Ne pas les réappliquer** : la forme les contient déjà. |
| `objectifSpecifiqueId` | texte, facultatif | L'étape est le module d'un objectif spécifique de la phase. Information. |
| `note` | texte, facultatif | Courte note à afficher (« Semaine allégée : niveau flash plutôt que projet. »). |

Puis `forme`, qui prend **trois valeurs** et ajoute ses propres champs :

| `forme` | Champs en plus | Comment l'exécuter |
|---|---|---|
| `'chrono'` | `config` (voir § 5), `mot`, `detail` | Lancer le chrono décrit par `config`. `mot` est la consigne affichée pendant l'effort (« SUSPENDS-TOI »), `detail` une ligne de rappel (« Poids du corps »). |
| `'liste'` | `elements` : liste de textes | Afficher les éléments à cocher ou à lire, sans chrono. |
| `'essais'` | `reposS`, `essaisParSerie` (facultatif), `reposSeriesS` (facultatif) | Séance d'essais libres (bloc limite) avec un chrono de repos. `reposS` : repos après chaque essai, en secondes. Si `essaisParSerie` et `reposSeriesS` sont présents, un repos plus long (`reposSeriesS`) remplace le repos court tous les `essaisParSerie` essais (4 blocs de 4 essais : 2 min puis 5 min). |

## 5. Le chrono

### 5.1 `ConfigChrono` : quatre gabarits

Toutes les durées sont en **secondes**. `series` est le nombre de séries (à partir de 1). Le champ `gabarit` dit lequel des quatre est utilisé.

| Gabarit | Champs | Sens |
|---|---|---|
| `repetition_unique` | `effortS`, `series`, `reposSeriesS` | Un effort par série, puis un long repos (suspension maximale, essai de bloc). |
| `depart_minute` | `effortS`, `creneauS`, `repetitions`, `series`, `reposSeriesS` | Un départ toutes les `creneauS` secondes : 10 s d'effort toutes les 60 s. Le repos court vaut `max(0, creneauS − effortS)`. |
| `intermittent` | `effortS`, `reposRepetitionsS`, `repetitions`, `series`, `reposSeriesS` | Effort puis repos court, répétés (7 s / 3 s, six fois). |
| `echelle` | `dureesS` (liste), `creneauS`, `reposEntrePaliersS` (facultatif), `series`, `reposSeriesS` | Efforts de durées variables (3, 6, 9 s). Deux façons de compter le créneau, voir ci-dessous. |

Les deux façons de compter l'`echelle` :

- **Sans `reposEntrePaliersS`** : chaque suspension démarre toutes les `creneauS` secondes. Le repos après un effort de `d` secondes vaut `max(0, creneauS − d)` (Plan le plus simple de Bechtel : 5, 10, 15 s dans un créneau de 30 s = repos 25, 20, 15 s).
- **Avec `reposEntrePaliersS`** : toute l'échelle tient dans `creneauS`. Entre deux suspensions, le repos vaut `reposEntrePaliersS`. Ce qui reste du créneau après la dernière suspension s'ajoute au repos entre séries (voir l'algorithme). Exemple : 3-6-9 s avec 6 s de repos occupe 18 + 12 = 30 s sur un créneau de 45 s ; il reste 15 s.

### 5.2 Les phases

Le chrono se transforme d'abord en **liste de phases**. Chaque phase :

| Champ | Sens |
|---|---|
| `type` | `'preparation'`, `'effort'` ou `'repos'`. |
| `dureeS` | Durée en secondes. |
| `serie` | Numéro de la série en cours, à partir de 1. |
| `totalSeries` | Nombre de séries. |
| `repetition` | Numéro de la répétition (ou du palier) dans la série, à partir de 1. |
| `totalRepetitions` | Nombre de répétitions par série. |
| `entreSeries` | Présent et vrai seulement pour le long repos entre deux séries. |

### 5.3 Algorithme de construction (pseudo-code)

```
PREPARATION_S = 5          # valeur par défaut du décompte avant le premier effort

fonction efforts_d_une_serie(config) -> liste de (effortS, reposS):
    repetition_unique : [ (effortS, 0) ]
    depart_minute     : repetitions fois (effortS, max(0, creneauS - effortS))
    intermittent      : repetitions fois (effortS, reposRepetitionsS)
    echelle :
        si reposEntrePaliersS est présent : pour chaque d de dureesS -> (d, reposEntrePaliersS)
        sinon                             : pour chaque d de dureesS -> (d, max(0, creneauS - d))

fonction reste_du_creneau(config):
    si config n'est pas une echelle, ou sans reposEntrePaliersS : renvoyer 0
    occupe = somme(dureesS) + reposEntrePaliersS * (nombre de dureesS - 1)
    renvoyer max(0, creneauS - occupe)

fonction construire_sequence(config, preparationS = PREPARATION_S) -> liste de phases:
    efforts          = efforts_d_une_serie(config)
    repos_entre_series = config.reposSeriesS + reste_du_creneau(config)
    phases = []
    si preparationS > 0 :
        ajouter phase(preparation, preparationS, serie 1, repetition 1)

    pour s de 1 à config.series :
        pour chaque (i, (effortS, reposS)) dans efforts, i à partir de 1 :
            derniere_repetition = (i == nombre d'efforts)
            derniere_serie      = (s == config.series)
            ajouter phase(effort, effortS, serie s, repetition i)

            si NON derniere_repetition ET reposS > 0 :
                ajouter phase(repos, reposS, serie s, repetition i)
            sinon si derniere_repetition ET NON derniere_serie ET repos_entre_series > 0 :
                ajouter phase(repos, repos_entre_series, serie s, repetition i, entreSeries = vrai)

    renvoyer phases
```

Points à respecter exactement :

- La phase de préparation existe seulement si `preparationS > 0` ; elle porte `serie = 1` et `repetition = 1`. Elle ne compte pas dans les séries.
- **Une phase de durée zéro n'est jamais créée** : si le repos court vaut 0, il n'y a pas de phase de repos.
- Le long repos entre séries vient **après la dernière répétition** d'une série, **jamais après la dernière série**. Il remplace le repos court à cet endroit (on n'a jamais deux repos de suite).
- Il porte le numéro de répétition de la dernière répétition de sa série, et `entreSeries = vrai`. Dans les autres phases, `entreSeries` est **absent** (pas `false`).
- Avec `repetition_unique`, chaque série n'a qu'une répétition : c'est donc toujours le long repos qui sépare deux efforts.
- Pour une `echelle` sans `reposEntrePaliersS`, le repos qui suit la dernière suspension n'est pas `creneauS − d` : on met seulement `reposSeriesS` entre séries.
- `totalRepetitions` vaut le nombre d'efforts d'une série (3 pour une échelle de 3 paliers).

La durée totale d'un chrono est la somme des `dureeS` de toutes ses phases.

### 5.4 Où en est-on après un temps écoulé

On **recalcule toujours depuis le temps écoulé réel** (heure de départ et heure actuelle), jamais en décomptant seconde par seconde. Si l'écran se met en veille ou si l'app ralentit, le chrono retombe juste au réveil au lieu de prendre du retard. Une pause se gère en décalant l'heure de départ de la durée de la pause.

```
fonction etat_a(phases, ecouleS):
    debut = 0
    pour i de 0 à nombre de phases - 1 :
        fin = debut + phases[i].dureeS
        si ecouleS < fin :                      # strictement : à la seconde exacte de fin, on passe à la phase suivante
            renvoyer {
                termine: faux,
                index: i,
                phase: phases[i],
                suivante: phases[i+1] ou rien,
                resteS: arrondi_au_supérieur(fin - ecouleS),   # pour l'affichage du décompte
                ecouleDansPhaseS: ecouleS - debut
            }
        debut = fin
    renvoyer { termine: vrai, index: nombre de phases, phase: rien, suivante: rien, resteS: 0, ecouleDansPhaseS: 0 }
```

Les vibrations de la montre se déclenchent au **changement de `index`** (début de chaque phase) ; le contenu de l'étape suivante est `suivante`.

### 5.5 Vecteurs de référence

`chrono-vecteurs.json` est une liste d'objets `{ nom, config, preparationS, phases }`. Pour chacun, `construire_sequence(config, preparationS)` doit donner **exactement** `phases`. Cas couverts :

| `nom` | Ce qu'il vérifie |
|---|---|
| `repetition_unique` | 10 s, 3 séries, 180 s : le long repos remplace le repos court, pas de repos après la dernière série. |
| `depart_minute` | 10 s toutes les 60 s, 5 répétitions, 2 séries. |
| `intermittent` | 7 s / 3 s, 6 répétitions, 3 séries, 180 s. |
| `echelle_sans_repos_entre_paliers` | Plan le plus simple de Bechtel : 5-10-15 s, créneau de 30 s. |
| `echelle_avec_repos_entre_paliers` | Échelles 3-6-9 : le reste du créneau (15 s) s'ajoute au repos entre séries. |
| `sans_preparation` | `preparationS = 0` : aucune phase de préparation. |

Une app native valide son chrono en rejouant ces six cas, puis en vérifiant `etat_a` à quelques instants (début, fin exacte d'une phase, milieu, après la fin).

## 6. Séance réalisée (`type = 'seancesRealisees'`)

Exemple complet : `docs/format-seance/seance-realisee.json`.

| Champ | Type | Sens |
|---|---|---|
| (champs communs) | | Voir § 3. |
| `date` | jour local | Jour de la séance. |
| `mode` | `'solo'`, `'groupe'` ou `'libre'` | `libre` = séance sans plan. |
| `nom` | texte | Nom de la séance faite. |
| `durete` | `'dure'` ou `'legere'` | Dureté de la version exécutée. |
| `dureeMin` | minutes | Durée réelle. |
| `effortPercu` | 1 à 10 | Effort ressenti, saisi par l'utilisateur. |
| `peau` | 1, 2 ou 3 | 1 abîmée, 2 limite, 3 bonne. |
| `douleur` | vrai / faux | Une douleur a été signalée. |
| `etapes` | liste | Une entrée par étape : `{ titre, statut, refId? }`. `statut` : `'faite'`, `'passee'` ou `'a_faire'`. `refId` : `origine.refId` de l'étape planifiée. Vide en mode groupe sans mini-bloc. |
| `objectifs` | liste | Une entrée par objectif de groupe : `{ libelle, cible, fait }`. Vide en solo. |
| `blocs` | liste | Un bloc grimpé : `{ couleur, essais, resultat, objectif }`. `resultat` : `'flash'`, `'enchaine'` ou `'non_enchaine'`. `objectif` : position (à partir de 0) de l'objectif en cours à la saisie. Vide en solo. |
| `seancePlanifieeId` | texte, facultatif | `id` de la séance planifiée exécutée. Absent = séance hors plan. |
| `salleId` | texte, facultatif | Salle utilisée. |
| `qualite` | texte, facultatif | Qualité dominante (mêmes valeurs qu'en § 4.1). |
| `marqueurs` | liste, facultatif | Instantané des marqueurs de la version exécutée. **Facultatif pour une app native** : ne pas l'écrire si on ne le connaît pas ; l'ordinateur sait le recalculer. |

### Écrire une séance réalisée

1. `id` : un **UUID** nouveau (version 4), généré par l'appareil.
2. `versionFormat` : `1`. `creeLe` et `modifieLe` : l'heure UTC au format ISO avec millisecondes et `Z` (`2026-11-17T19:32:00.000Z`). `date` : le jour **local** (pas le jour UTC : à 00 h 30 à Paris, le jour UTC est la veille).
3. Insérer une ligne dans `documents` : `type = 'seancesRealisees'`, `id` identique à `contenu.id`, `contenu` = le document, `modifie_le` = `contenu.modifieLe`, `supprime_le` = `contenu.supprimeLe` (vide si absent). `user_id` est posé par le serveur. Utiliser un « upsert » sur `(user_id, type, id)`.
4. **Ne pas écrire de champ `aEnvoyer`** : ce drapeau n'existe que dans la base locale du téléphone (« à envoyer au serveur ») et n'est jamais envoyé. Le téléphone et l'ordinateur retrouvent la séance par leur synchronisation habituelle.
5. Pour corriger plus tard une séance réalisée : relire le document, changer les champs, mettre `modifieLe` à l'heure actuelle, renvoyer. Pour la supprimer : poser `supprimeLe` (et sa copie `supprime_le`), ne jamais effacer la ligne.

La séance planifiée n'est **pas modifiée** quand elle est faite : son statut « faite » se déduit de l'existence de la séance réalisée qui la cite.
