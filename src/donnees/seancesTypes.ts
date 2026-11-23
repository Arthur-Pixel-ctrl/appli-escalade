import { protocoleParId } from './bibliotheque/index.ts'
import type { Marqueur, Prerequis, Qualite } from './bibliotheque/types.ts'
import type { ZoneDouleur } from './profil.ts'
import { COTATIONS_BLOC } from './profil.ts'
import { objectifGroupeParId } from './objectifsGroupe.ts'

// Le catalogue des séances types : des séances prêtes à glisser dans un plan.
// Chaque séance a un déroulé solo (fiches de la bibliothèque, dans l'ordre) et, en général, une version
// groupe (1 à 3 objectifs de groupe, plus un mini-bloc solo si besoin).
// Rien de calculable n'est stocké : durée, marqueurs, prérequis et contre-indications se déduisent des fiches.
// Source : docs/specs/entrainement/seances-types.md, C.2 ; recommandations : niveaux-de-detail.md, § 2.5.

export type RoleSeance = 'N' | 'C' | 'L' | 'H' // nerveuse, capacité, légère, hors grimpe

export interface EtapeType {
  ficheId: string
  reglages?: { dureeMin?: number; series?: number; reposS?: number }
}

/** Un petit exercice solo, avant ou après l'objectif de groupe (il se fait après l'échauffement en commun). */
export interface MiniBlocType {
  moment: 'avant' | 'apres'
  etapes: EtapeType[]
}

export interface GroupeType {
  objectifIds: string[] // 1 à 3, du catalogue OBJECTIFS_GROUPE
  miniBloc?: MiniBlocType
}

/** Une variante donne le déroulé solo complet de remplacement et, si besoin, le mini-bloc de groupe de remplacement. */
export interface VarianteType {
  solo: EtapeType[]
  miniBloc?: MiniBlocType
  recommandation?: string // seulement si elle diffère de celle de la séance
}

export interface SeanceType {
  id: string // "ST-DOI-02"
  nom: string
  qualite: Qualite
  role: RoleSeance
  durete: 'dure' | 'legere'
  recommandation: string // une ligne, 120 caractères au plus : le niveau Simple l'affiche telle quelle
  solo: EtapeType[]
  groupe: null | GroupeType // null = sans objet (séance à la maison, projet individuel)
  variantes: Record<string, VarianteType>
}

// Raccourci : une étape sans réglage.
const e = (ficheId: string): EtapeType => ({ ficheId })

const ECHAUFFEMENT = e('echauffement-general')
const ANTAGONISTES_LEGERS = e('antagonistes-legers')
const ANTAGONISTES_LATTICE = e('antagonistes-lattice')
const MINI_BLOC_POUTRE_LOPEZ: MiniBlocType = {
  moment: 'avant',
  etapes: [e('echauffement-doigts-poutre'), e('doigts-reglette-minimale-lopez')],
}

export const SEANCES_TYPES: SeanceType[] = [
  // ---- Doigts ----
  {
    id: 'ST-DOI-01', nom: 'Doigts découverte + bloc limite', qualite: 'doigts', role: 'N', durete: 'dure',
    recommandation: 'Échelles 3-6-9 sur la poutre, puis bloc à ta limite : 4 essais max par bloc.',
    solo: [ECHAUFFEMENT, e('doigts-echelles-3-6-9'), e('puissance-bloc-limite'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-01'], miniBloc: { moment: 'avant', etapes: [e('doigts-echelles-3-6-9')] } },
    variantes: {},
  },
  {
    id: 'ST-DOI-02', nom: 'Suspensions max (réglette minimale) + bloc limite', qualite: 'doigts', role: 'N', durete: 'dure',
    recommandation: 'Suspensions max sur réglette minimale, puis bloc à ta limite : 4 essais max par bloc.',
    solo: [
      ECHAUFFEMENT, e('echauffement-doigts-poutre'), e('doigts-reglette-minimale-lopez'),
      e('puissance-bloc-limite'), ANTAGONISTES_LATTICE,
    ],
    groupe: { objectifIds: ['OG-01'], miniBloc: MINI_BLOC_POUTRE_LOPEZ },
    variantes: {
      // Poutre régulière : la suspension lestée remplace la réglette minimale, aussi dans le mini-bloc.
      lestee: {
        solo: [
          ECHAUFFEMENT, e('echauffement-doigts-poutre'), e('doigts-suspensions-max-lestees'),
          e('puissance-bloc-limite'), ANTAGONISTES_LATTICE,
        ],
        miniBloc: { moment: 'avant', etapes: [e('echauffement-doigts-poutre'), e('doigts-suspensions-max-lestees')] },
      },
      // Semaine d'accent résistance ou endurance : bloc limite court (20 min), solo seulement.
      entretien: {
        solo: [
          ECHAUFFEMENT, e('echauffement-doigts-poutre'), e('doigts-reglette-minimale-lopez'),
          { ficheId: 'puissance-bloc-limite', reglages: { dureeMin: 20 } }, ANTAGONISTES_LATTICE,
        ],
        recommandation: 'Suspensions max sur réglette minimale, puis bloc limite court (20 min) : 4 essais max par bloc.',
      },
    },
  },
  {
    id: 'ST-DOI-03', nom: 'Réglette minimale (Hörst) + gainage', qualite: 'doigts', role: 'N', durete: 'dure',
    recommandation: 'Réglette minimale sur la poutre (méthode Hörst), puis blocs raides sans lâcher les pieds.',
    solo: [
      ECHAUFFEMENT, e('echauffement-doigts-poutre'), e('doigts-reglette-minimale-horst'),
      e('gainage-blocs-pieds-colles'), ANTAGONISTES_LEGERS,
    ],
    // Le protocole de Hörst (31 min) ne tient pas dans un mini-bloc : on prend la réglette de López (même intention).
    // Le prérequis « adulte » de López s'ajoute donc en groupe.
    groupe: { objectifIds: ['OG-10'], miniBloc: MINI_BLOC_POUTRE_LOPEZ },
    variantes: {},
  },
  {
    id: 'ST-DOI-04', nom: 'Doigts en force-endurance + 1 min / 1 min', qualite: 'doigts', role: 'C', durete: 'dure',
    recommandation: 'Suspensions 7 s / 3 s sur la poutre, puis 1 min de grimpe, 1 min de repos, 10 fois.',
    solo: [
      ECHAUFFEMENT, e('echauffement-doigts-poutre'), e('doigts-repeaters-7-3'),
      e('technique-un-seul-contact'), e('endurance-1-on-1-off'), ANTAGONISTES_LEGERS,
    ],
    // 17 min : au-delà des 15 min du modèle de mini-bloc, à accepter ou à raccourcir.
    groupe: {
      objectifIds: ['OG-06'],
      miniBloc: { moment: 'avant', etapes: [e('echauffement-doigts-poutre'), e('doigts-repeaters-7-3')] },
    },
    variantes: {},
  },
  {
    id: 'ST-DOI-05', nom: 'Doigts légers à la maison', qualite: 'doigts', role: 'L', durete: 'legere',
    recommandation: 'Suspensions légères pieds au sol, puis étirements. 6 h d\'écart avec toute autre séance.',
    solo: [e('doigts-abrahangs'), e('mobilite-etirements-du-soir')],
    groupe: null,
    variantes: {},
  },

  // ---- Traction et gainage ----
  {
    id: 'ST-TRA-01', nom: 'Tractions de base et gainage', qualite: 'traction_gainage', role: 'N', durete: 'dure',
    recommandation: 'Blocs sans lâcher les pieds, puis tractions 4 × 5 et tractions négatives.',
    solo: [
      ECHAUFFEMENT, e('technique-tout-en-drapeau'), e('gainage-blocs-pieds-colles'),
      e('traction-simple-4x5'), e('traction-negatives'), ANTAGONISTES_LEGERS,
    ],
    groupe: { objectifIds: ['OG-10'], miniBloc: { moment: 'apres', etapes: [e('traction-simple-4x5')] } },
    variantes: {},
  },
  {
    id: 'ST-TRA-02', nom: 'Bloc limite + tractions lestées', qualite: 'traction_gainage', role: 'N', durete: 'dure',
    recommandation: 'Bloc à ta limite, 4 essais max par bloc, puis tractions lestées 4 × 3.',
    solo: [ECHAUFFEMENT, e('puissance-bloc-limite'), e('traction-lestee-force-lattice'), ANTAGONISTES_LATTICE],
    groupe: { objectifIds: ['OG-01'], miniBloc: { moment: 'apres', etapes: [e('traction-lestee-force-lattice')] } },
    variantes: {},
  },
  {
    id: 'ST-TRA-03', nom: 'Vers la traction à un bras', qualite: 'traction_gainage', role: 'N', durete: 'dure',
    recommandation: 'Blocs sans lâcher les pieds, puis tractions à prises décalées.',
    solo: [
      ECHAUFFEMENT, e('technique-formes-de-hanches'), e('gainage-blocs-pieds-colles'),
      e('traction-prises-decalees'), ANTAGONISTES_LEGERS,
    ],
    groupe: { objectifIds: ['OG-10'], miniBloc: { moment: 'apres', etapes: [e('traction-prises-decalees')] } },
    variantes: {},
  },

  // ---- Puissance ----
  {
    id: 'ST-PUI-01', nom: 'Bloc limite + tractions explosives', qualite: 'puissance', role: 'N', durete: 'dure',
    recommandation: 'Bloc à ta limite, 4 essais max par bloc, puis tractions explosives 3 × 3.',
    solo: [ECHAUFFEMENT, e('puissance-bloc-limite'), e('puissance-tractions-explosives'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-01'], miniBloc: { moment: 'apres', etapes: [e('puissance-tractions-explosives')] } },
    variantes: {},
  },
  {
    id: 'ST-PUI-02', nom: 'Planche', qualite: 'puissance', role: 'N', durete: 'dure',
    recommandation: 'Bloc limite sur planche d\'escalade : 4 essais max par bloc, 4 min de repos.',
    solo: [ECHAUFFEMENT, e('puissance-planche'), ANTAGONISTES_LATTICE],
    groupe: { objectifIds: ['OG-13'] },
    variantes: {
      // S1 d'un bloc puissance : la poutre d'entretien se glisse avant la planche (prérequis de ST-DOI-02).
      poutre_entretien: {
        solo: [
          ECHAUFFEMENT, e('echauffement-doigts-poutre'), e('doigts-reglette-minimale-lopez'),
          e('puissance-planche'), ANTAGONISTES_LATTICE,
        ],
        miniBloc: MINI_BLOC_POUTRE_LOPEZ,
      },
    },
  },
  {
    id: 'ST-PUI-03', nom: 'Pan Güllich (initiation) + bloc limite', qualite: 'puissance', role: 'N', durete: 'dure',
    recommandation: 'Pan Güllich d\'initiation en début de séance, puis bloc à ta limite : 4 essais max par bloc.',
    solo: [ECHAUFFEMENT, e('puissance-pan-gullich-initiation'), e('puissance-bloc-limite'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-01'], miniBloc: { moment: 'avant', etapes: [e('puissance-pan-gullich-initiation')] } },
    variantes: {},
  },
  {
    id: 'ST-PUI-04', nom: 'Intervalles de force', qualite: 'puissance', role: 'N', durete: 'dure',
    recommandation: 'Intervalles de force : 6 blocs connus, 3 passages chacun, 3 min de repos.',
    solo: [ECHAUFFEMENT, e('puissance-intervalles-force'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-02'] },
    variantes: {},
  },
  {
    id: 'ST-PUI-05', nom: 'Bloc sans pieds + gainage', qualite: 'puissance', role: 'N', durete: 'dure',
    recommandation: 'Bloc sans pieds en début de séance, 4 séries de 3, puis blocs sans lâcher les pieds.',
    solo: [ECHAUFFEMENT, e('puissance-bloc-sans-pieds'), e('gainage-blocs-pieds-colles'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-14', 'OG-10'] },
    variantes: {},
  },

  // ---- Résistance ----
  {
    id: 'ST-RES-01', nom: 'Blocs triplés', qualite: 'resistance', role: 'C', durete: 'dure',
    recommandation: 'Blocs triplés à ton niveau flash : 6 séries, 1 min entre deux passages.',
    solo: [ECHAUFFEMENT, e('technique-un-seul-contact'), e('resistance-boulder-triples'), ANTAGONISTES_LATTICE],
    groupe: { objectifIds: ['OG-04'] },
    variantes: {},
  },
  {
    id: 'ST-RES-02', nom: 'Bloc à la minute + 4 × 4', qualite: 'resistance', role: 'C', durete: 'dure',
    recommandation: 'Bloc à la minute, 8 départs, puis 4 × 4 de blocs un peu sous ton niveau.',
    solo: [ECHAUFFEMENT, e('resistance-a-la-minute'), e('resistance-4x4-blocs'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-15', 'OG-05'] },
    variantes: {},
  },
  {
    id: 'ST-RES-03', nom: 'Blocs longs (capacité anaérobie)', qualite: 'resistance', role: 'C', durete: 'dure',
    recommandation: 'Blocs longs répétés : 3 séries de 4 passages de 30 à 50 s.',
    solo: [ECHAUFFEMENT, e('resistance-capacite-anaerobie'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-16'] },
    variantes: {},
  },
  {
    id: 'ST-RES-04', nom: 'Enchaînement de deux blocs + pan pieds posés', qualite: 'resistance', role: 'C', durete: 'dure',
    recommandation: 'Enchaînement de deux blocs, 4 passages, puis pan Güllich pieds posés.',
    solo: [ECHAUFFEMENT, e('resistance-enchainement-deux-blocs'), e('resistance-pan-pieds-poses'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-17'], miniBloc: { moment: 'apres', etapes: [e('resistance-pan-pieds-poses')] } },
    variantes: {},
  },

  // ---- Endurance ----
  {
    id: 'ST-END-01', nom: 'Continuité et technique', qualite: 'endurance', role: 'L', durete: 'legere',
    recommandation: 'Technique des pieds et grimpe au ralenti, puis 20 min de continuité facile.',
    solo: [
      e('echauffement-dynamique-vagy'), e('technique-pieds-silencieux'), e('technique-grimpe-au-ralenti'),
      e('endurance-arc'), e('mobilite-etirements-du-soir'),
    ],
    groupe: { objectifIds: ['OG-08', 'OG-07'] },
    variantes: {},
  },
  {
    id: 'ST-END-02', nom: '1 min / 1 min et continuité', qualite: 'endurance', role: 'L', durete: 'legere',
    recommandation: '1 min de grimpe, 1 min de repos, 10 fois, puis 10 min de continuité facile.',
    solo: [
      ECHAUFFEMENT, e('technique-tout-en-drapeau'), e('endurance-1-on-1-off'),
      e('endurance-continuite-fin-de-seance'), ANTAGONISTES_LEGERS,
    ],
    groupe: { objectifIds: ['OG-06', 'OG-07'] },
    variantes: {},
  },
  {
    id: 'ST-END-03', nom: 'Voies faciles en séries', qualite: 'endurance', role: 'C', durete: 'dure',
    recommandation: 'Voies faciles en séries : 3 séries de 3 voies, 8 min de repos entre les séries.',
    solo: [
      ECHAUFFEMENT, e('technique-lecture-a-vue'), e('endurance-4x4-voies'),
      e('mental-bilan-a-vue'), ANTAGONISTES_LEGERS,
    ],
    groupe: { objectifIds: ['OG-18'] },
    variantes: {},
  },
  {
    id: 'ST-END-04', nom: 'Voies doublées faciles', qualite: 'endurance', role: 'C', durete: 'dure',
    recommandation: 'Voies faciles doublées : 6 séries. Séance longue, garde de la marge.',
    solo: [ECHAUFFEMENT, e('endurance-volume-voies'), ANTAGONISTES_LEGERS],
    groupe: { objectifIds: ['OG-18'] },
    variantes: {},
  },
  {
    id: 'ST-END-05', nom: 'Récupération active', qualite: 'endurance', role: 'L', durete: 'legere',
    recommandation: 'Échauffement dynamique, grimpe de récupération 3 × 5 min, puis étirements.',
    solo: [e('echauffement-dynamique-vagy'), e('endurance-regeneration-5x3'), e('mobilite-etirements-du-soir')],
    groupe: { objectifIds: ['OG-07'] },
    variantes: {},
  },

  // ---- Technique (séances légères) ----
  {
    id: 'ST-TEC-01', nom: 'Technique en bloc', qualite: 'technique', role: 'L', durete: 'legere',
    recommandation: 'Un seul contact par prise, puis volume de blocs 4 × 4, de plus en plus propre.',
    solo: [
      ECHAUFFEMENT, e('technique-un-seul-contact'), e('technique-volume-blocs'), e('endurance-continuite-fin-de-seance'),
    ],
    groupe: { objectifIds: ['OG-09', 'OG-12', 'OG-07'] },
    variantes: {},
  },
  {
    id: 'ST-TEC-02', nom: 'Technique en voie', qualite: 'technique', role: 'L', durete: 'legere',
    recommandation: 'Lecture avant l\'à-vue, puis faire la course sur une voie connue, 5 passages.',
    solo: [
      ECHAUFFEMENT, e('technique-lecture-a-vue'), e('technique-faire-la-course'),
      e('mental-bilan-a-vue'), e('mobilite-etirements-du-soir'),
    ],
    // En groupe : OG-18 avec la consigne de faire la course (même voie, 10 % plus vite).
    groupe: { objectifIds: ['OG-18'] },
    variantes: {},
  },
  {
    id: 'ST-TEC-03', nom: 'Projet après travail', qualite: 'technique', role: 'C', durete: 'dure',
    recommandation: 'Échauffement complet, puis essais sur ton projet après travail.',
    solo: [ECHAUFFEMENT, e('technique-apres-travail')],
    groupe: null, // le projet est individuel : la version solo sert aussi quand on grimpe à plusieurs
    variantes: {},
  },

  // ---- Hors grimpe ----
  {
    id: 'ST-HOR-01', nom: 'Hanches', qualite: 'mobilite', role: 'H', durete: 'legere',
    recommandation: 'Échauffement dynamique, puis 25 min de grand écart latéral.',
    solo: [e('echauffement-dynamique-vagy'), e('mobilite-grand-ecart-lattice')],
    groupe: null,
    variantes: {},
  },
]

/** Retrouve une séance type par son identifiant ; undefined si elle n'existe pas. */
export function seanceTypeParId(id: string): SeanceType | undefined {
  return SEANCES_TYPES.find((s) => s.id === id)
}

// ---------- Valeurs déduites (rien de tout cela n'est stocké) ----------

/** Durée d'une étape : le réglage s'il y en a un, sinon la durée de la fiche. */
function dureeEtapeType(etape: EtapeType): number {
  return etape.reglages?.dureeMin ?? protocoleParId(etape.ficheId)?.dureeMin ?? 0
}

function varianteOuErreur(st: SeanceType, variante: string): VarianteType {
  const v = st.variantes[variante]
  if (v === undefined) throw new Error(`Variante inconnue pour ${st.id} : ${variante}`)
  return v
}

/** Durée du déroulé solo, en minutes, pour la séance ou l'une de ses variantes. */
export function dureeSeanceType(st: SeanceType, variante?: string): number {
  const etapes = variante === undefined ? st.solo : varianteOuErreur(st, variante).solo
  return etapes.reduce((total, etape) => total + dureeEtapeType(etape), 0)
}

/** Recommandation d'une ligne : celle de la variante si elle en a une, sinon celle de la séance. */
export function recommandationSeanceType(st: SeanceType, variante?: string): string {
  if (variante === undefined) return st.recommandation
  return varianteOuErreur(st, variante).recommandation ?? st.recommandation
}

/**
 * Identifiants des fiches de la version choisie. Solo : les étapes. Groupe : le mini-bloc (la variante
 * peut le remplacer) et les fiches de référence des objectifs ; l'échauffement en commun n'est pas stocké.
 */
function fichesDeLaVersion(st: SeanceType, version: 'solo' | 'groupe', variante?: string): string[] {
  const v = variante === undefined ? undefined : varianteOuErreur(st, variante)
  if (version === 'solo') return (v?.solo ?? st.solo).map((etape) => etape.ficheId)
  if (st.groupe === null) return []
  const miniBloc = v?.miniBloc ?? st.groupe.miniBloc
  const fichesMiniBloc = miniBloc?.etapes.map((etape) => etape.ficheId) ?? []
  const fichesObjectifs = st.groupe.objectifIds.flatMap((id) => {
    const reference = objectifGroupeParId(id)?.ficheReference
    return reference === undefined ? [] : [reference]
  })
  return [...fichesMiniBloc, ...fichesObjectifs]
}

/** Union des marqueurs des fiches de la version (sans doublon). */
export function marqueursSeanceType(st: SeanceType, version: 'solo' | 'groupe', variante?: string): Marqueur[] {
  const marqueurs = new Set<Marqueur>()
  for (const id of fichesDeLaVersion(st, version, variante)) {
    for (const m of protocoleParId(id)?.marqueurs ?? []) marqueurs.add(m)
  }
  return [...marqueurs]
}

/** Union des contre-indications des fiches de la version (sans doublon). */
export function contreIndicationsSeanceType(st: SeanceType, version: 'solo' | 'groupe' = 'solo', variante?: string): ZoneDouleur[] {
  const zones = new Set<ZoneDouleur>()
  for (const id of fichesDeLaVersion(st, version, variante)) {
    for (const z of protocoleParId(id)?.contreIndications ?? []) zones.add(z)
  }
  return [...zones]
}

/**
 * Prérequis de la séance : le plus exigeant de chaque champ parmi ses fiches
 * (maximum des nombres, poutre régulière avant occasionnelle, vrai si l'une l'exige).
 */
export function prerequisSeanceType(st: SeanceType, version: 'solo' | 'groupe' = 'solo', variante?: string): Prerequis {
  const total: Prerequis = {}
  for (const id of fichesDeLaVersion(st, version, variante)) {
    const p = protocoleParId(id)?.prerequis
    if (p === undefined) continue
    if (p.anneesPratiqueMin !== undefined) total.anneesPratiqueMin = Math.max(total.anneesPratiqueMin ?? 0, p.anneesPratiqueMin)
    if (p.tractionsStrictesMin !== undefined) total.tractionsStrictesMin = Math.max(total.tractionsStrictesMin ?? 0, p.tractionsStrictesMin)
    if (p.experiencePoutreMin !== undefined && total.experiencePoutreMin !== 'reguliere') total.experiencePoutreMin = p.experiencePoutreMin
    if (p.test15sSur25mm) total.test15sSur25mm = true
    if (p.adulte) total.adulte = true
    if (p.niveauBlocMin !== undefined) {
      const rangActuel = total.niveauBlocMin === undefined ? -1 : COTATIONS_BLOC.indexOf(total.niveauBlocMin)
      if (COTATIONS_BLOC.indexOf(p.niveauBlocMin) > rangActuel) total.niveauBlocMin = p.niveauBlocMin
    }
  }
  return total
}
