import { protocoleParId } from './bibliotheque/index.ts'
import type { Marqueur, Qualite } from './bibliotheque/types.ts'

// Le catalogue des objectifs de groupe : des défis à plusieurs, suivis par un compteur.
// Chaque objectif reprend la difficulté, le volume et le repos d'une fiche solo (`ficheReference`).
// Les marqueurs ne sont jamais recopiés ici : ils se lisent dans la fiche (rien de calculable n'est stocké).
// Les noms des champs sont ceux de `ObjectifGroupe` (src/moteur/types.ts) : la conversion vers une séance
// en groupe enregistrée se fera dans la passerelle C-01.
// Source : docs/specs/entrainement/seances-types.md, C.1 ; OG-03, OG-08 et OG-19 à OG-21 : recherche B21.

export interface ObjectifGroupeType {
  id: string // "OG-01"
  libelle: string
  cible: number
  compte: 'blocs_notes' | 'flashs'
  ficheReference?: string // fiche solo équivalente ; absente = pas de marqueur
  blocs?: number
  essaisMaxParBloc?: number // borne de sécurité affichée pendant la séance
  ecartCotation?: [number, number] // par rapport au niveau maximal, seulement quand la fiche s'exprime ainsi
  reposConseilleS?: number
  accents: Qualite[] // qualités travaillées ; vide = volet technique
}

export const OBJECTIFS_GROUPE: ObjectifGroupeType[] = [
  {
    id: 'OG-01', libelle: '3 blocs à ta limite, 4 essais max chacun', cible: 3, compte: 'blocs_notes',
    ficheReference: 'puissance-bloc-limite', blocs: 3, essaisMaxParBloc: 4, ecartCotation: [1, 2], reposConseilleS: 240,
    accents: ['doigts', 'traction_gainage', 'puissance'],
  },
  {
    id: 'OG-02', libelle: '6 blocs connus, 3 passages chacun', cible: 6, compte: 'blocs_notes',
    ficheReference: 'puissance-intervalles-force', blocs: 6, essaisMaxParBloc: 3, ecartCotation: [-2, -1], reposConseilleS: 180,
    accents: ['puissance', 'traction_gainage'],
  },
  {
    // Rattaché à la fiche de groupe « Défi flash » (décision F2-12, recherche B21).
    id: 'OG-03', libelle: 'Flasher 3 blocs juste sous ton niveau', cible: 3, compte: 'flashs',
    ficheReference: 'groupe-flash-defi', blocs: 3, essaisMaxParBloc: 1, reposConseilleS: 120,
    accents: [],
  },
  {
    id: 'OG-04', libelle: '6 blocs triplés à ton niveau flash', cible: 6, compte: 'blocs_notes',
    ficheReference: 'resistance-boulder-triples', blocs: 6, reposConseilleS: 180,
    accents: ['resistance'],
  },
  {
    id: 'OG-05', libelle: '4 séries de 4 blocs enchaînés', cible: 4, compte: 'blocs_notes',
    ficheReference: 'resistance-4x4-blocs', blocs: 4, reposConseilleS: 240,
    accents: ['resistance'],
  },
  {
    id: 'OG-06', libelle: 'Traversée à deux : 1 min chacun, 10 fois', cible: 10, compte: 'blocs_notes',
    ficheReference: 'endurance-1-on-1-off', blocs: 10, reposConseilleS: 60,
    accents: ['endurance'],
  },
  {
    id: 'OG-07', libelle: '15 min de blocs faciles enchaînés en relais', cible: 1, compte: 'blocs_notes',
    ficheReference: 'endurance-continuite-fin-de-seance', blocs: 1,
    accents: ['endurance'],
  },
  {
    // Rattaché à la fiche de groupe « Contacts à deux » (décision F2-12, recherche B21).
    id: 'OG-08', libelle: 'Pieds silencieux : l\'autre compte les bruits', cible: 4, compte: 'blocs_notes',
    ficheReference: 'groupe-contacts-a-deux', blocs: 4, ecartCotation: [-3, -2], reposConseilleS: 120,
    accents: [],
  },
  {
    id: 'OG-09', libelle: '4 blocs moyens, 4 fois chacun, de plus en plus propre', cible: 4, compte: 'blocs_notes',
    ficheReference: 'technique-volume-blocs', blocs: 4, reposConseilleS: 120,
    accents: [],
  },
  {
    id: 'OG-10', libelle: '5 blocs connus sans lâcher les pieds', cible: 5, compte: 'blocs_notes',
    ficheReference: 'gainage-blocs-pieds-colles', blocs: 5, reposConseilleS: 120,
    accents: ['traction_gainage'],
  },
  {
    // Option manuelle pour alléger davantage une semaine allégée : pas de fiche de référence.
    id: 'OG-11', libelle: 'Flasher 3 blocs de ton niveau, 2 essais max', cible: 3, compte: 'flashs',
    blocs: 3, essaisMaxParBloc: 2, reposConseilleS: 240,
    accents: ['puissance', 'doigts'],
  },
  {
    // Pas de fiche de référence : marqueurs vides (le « trois essais » dur est l'OG-19).
    id: 'OG-12', libelle: '4 blocs jamais faits, 3 essais chacun', cible: 4, compte: 'blocs_notes',
    blocs: 4, essaisMaxParBloc: 3, reposConseilleS: 180,
    accents: [],
  },
  {
    id: 'OG-13', libelle: '3 blocs sur la planche, 4 essais max chacun', cible: 3, compte: 'blocs_notes',
    ficheReference: 'puissance-planche', blocs: 3, essaisMaxParBloc: 4, reposConseilleS: 240,
    accents: ['puissance', 'doigts'],
  },
  {
    id: 'OG-14', libelle: 'Un bloc facile sans les pieds, 4 séries de 3', cible: 4, compte: 'blocs_notes',
    ficheReference: 'puissance-bloc-sans-pieds', blocs: 4, essaisMaxParBloc: 3, ecartCotation: [-6, -5], reposConseilleS: 180,
    accents: ['puissance', 'traction_gainage'],
  },
  {
    id: 'OG-15', libelle: 'Bloc à la minute : 8 départs', cible: 8, compte: 'blocs_notes',
    ficheReference: 'resistance-a-la-minute', blocs: 8,
    accents: ['resistance'],
  },
  {
    id: 'OG-16', libelle: 'Blocs longs : 3 séries de 4 passages', cible: 3, compte: 'blocs_notes',
    ficheReference: 'resistance-capacite-anaerobie', blocs: 3, reposConseilleS: 120,
    accents: ['resistance'],
  },
  {
    id: 'OG-17', libelle: 'Deux blocs enchaînés, 4 passages en relais', cible: 4, compte: 'blocs_notes',
    ficheReference: 'resistance-enchainement-deux-blocs', blocs: 4, reposConseilleS: 300,
    accents: ['resistance'],
  },
  {
    id: 'OG-18', libelle: 'Voies faciles : 3 séries de 3 voies', cible: 3, compte: 'blocs_notes',
    ficheReference: 'endurance-4x4-voies', blocs: 3, reposConseilleS: 480,
    accents: ['endurance'],
  },
  {
    // Nouveau (B21). Libellé corrigé par l'audit (M-11) pour ne pas se confondre avec OG-12.
    // Mêmes bornes que le bloc limite solo : 4 blocs × 3 essais = 12 essais durs au plus, comme OG-01.
    id: 'OG-19', libelle: '4 blocs déjà réussis, parmi tes plus durs : 3 essais max', cible: 4, compte: 'blocs_notes',
    ficheReference: 'groupe-trois-essais-tour-de-role', blocs: 4, essaisMaxParBloc: 3, ecartCotation: [-1, 0], reposConseilleS: 180,
    accents: ['puissance', 'doigts'],
  },
  {
    // Nouveau (B21). Une manche = un bloc noté.
    id: 'OG-20', libelle: 'Ajout de mouvement : 3 manches', cible: 3, compte: 'blocs_notes',
    ficheReference: 'groupe-ajout-de-mouvement', blocs: 3, ecartCotation: [-3, -2], reposConseilleS: 120,
    accents: [],
  },
  {
    // Nouveau (B21).
    id: 'OG-21', libelle: 'Beta miroir : 4 blocs', cible: 4, compte: 'blocs_notes',
    ficheReference: 'groupe-beta-miroir', blocs: 4, reposConseilleS: 120,
    accents: [],
  },
]

/** Retrouve un objectif de groupe par son identifiant ; undefined s'il n'existe pas. */
export function objectifGroupeParId(id: string): ObjectifGroupeType | undefined {
  return OBJECTIFS_GROUPE.find((o) => o.id === id)
}

/** Marqueurs d'un objectif : ceux de sa fiche de référence (vide s'il n'en a pas). Jamais stockés. */
export function marqueursObjectif(o: ObjectifGroupeType): Marqueur[] {
  if (o.ficheReference === undefined) return []
  return protocoleParId(o.ficheReference)?.marqueurs ?? []
}
