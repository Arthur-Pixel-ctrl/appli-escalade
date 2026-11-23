import type { ReglagesEtape } from '../moteur/types.ts'
import { protocoleParId, peutEtreGeneree } from './bibliotheque/index.ts'
import type { Marqueur, Protocole } from './bibliotheque/types.ts'
import type { AccentPhase } from './modele.ts'
import type { ObjectifPersoVerif } from '../regles/types.ts'
import { MARQUEURS_QUOTA } from '../regles/reglesParDefaut.ts'

// Le catalogue des objectifs spécifiques : ce qu'on peut ajouter à une phase (0 à 2 par phase),
// sous forme d'un module de 10 à 15 minutes. Un objectif ne recopie rien de sa fiche :
// marqueurs, prérequis et contre-indications se lisent dans la bibliothèque (rien de calculable n'est stocké).

export interface ObjectifSpecifiqueType {
  id: string // "OS-01"
  nom: string
  ficheModule: string // identifiant d'une fiche qui existe dans la bibliothèque
  reglages?: ReglagesEtape
  accents: AccentPhase[] // phases où on le propose en premier
  pourquoi: string // une phrase, affichée dans la fenêtre « Objectifs de la phase »
  testRepere?: string // libellé du test, en clair
  remplacementId?: string // objectif de prévention proposé à la place si un prérequis manque ou une douleur l'écarte
  // Présent seulement si la fiche du module est hors génération : l'objectif ne se propose qu'à la main,
  // avec ce message. Jamais choisi automatiquement (sécurité).
  avertissementALaMain?: string
}

/** Les modules légers (prévention, mental, mobilité) se glissent dans une phase quel que soit son accent. */
const TOUS_LES_ACCENTS: AccentPhase[] = ['doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance', 'technique']

export const OBJECTIFS_SPECIFIQUES: ObjectifSpecifiqueType[] = [
  {
    id: 'OS-01',
    nom: 'Bidoigts',
    ficheModule: 'doigts-abrahangs',
    accents: ['doigts'],
    pourquoi: 'Habituer les doigts à deux doigts seulement, avec des charges très faibles.',
    remplacementId: 'OS-03',
  },
  {
    id: 'OS-02',
    nom: 'Traction à un bras',
    ficheModule: 'traction-prises-decalees',
    accents: ['traction_gainage'],
    pourquoi: 'Préparer la traction à un bras avec des prises décalées, en séance dure, après la grimpe.',
    testRepere: 'Tractions propres au maximum',
    remplacementId: 'OS-03',
  },
  {
    id: 'OS-03',
    nom: 'Prévention des épaules',
    ficheModule: 'antagonistes-legers',
    accents: TOUS_LES_ACCENTS,
    pourquoi: 'Équilibrer le travail de traction pour ménager les épaules.',
  },
  {
    id: 'OS-04',
    nom: 'Prévention des coudes',
    ficheModule: 'antagonistes-legers',
    accents: TOUS_LES_ACCENTS,
    pourquoi: 'Partiel : seuls les extenseurs du poignet sont travaillés, aucun protocole propre au coude n’existe dans nos sources.',
    remplacementId: 'OS-03',
  },
  {
    id: 'OS-05',
    nom: 'Peur de la chute en voie',
    ficheModule: 'mental-ecole-de-vol',
    accents: TOUS_LES_ACCENTS,
    // 20 min : la règle S-24 (module trop long) le signalera, on avertit sans bloquer.
    pourquoi: 'Apprendre à chuter en tête par petites marches, avec un assureur formé.',
    remplacementId: 'OS-03',
  },
  {
    id: 'OS-06',
    nom: 'Souplesse de hanches',
    ficheModule: 'mobilite-hanches-module',
    accents: TOUS_LES_ACCENTS,
    pourquoi: 'Gagner en ouverture de hanches en 12 minutes ; compte 8 à 12 semaines avant un progrès mesurable.',
    testRepere: 'Test : écart debout',
    remplacementId: 'OS-03',
  },
  // Objectifs dont la fiche est hors génération : à la main seulement, avec avertissement.
  {
    id: 'OS-07',
    nom: 'Arqués',
    ficheModule: 'doigts-arque-doux-mur',
    accents: ['doigts'],
    pourquoi: 'Travailler la position arquée à faible charge, au mur, sur des prises faciles.',
    remplacementId: 'OS-03',
    avertissementALaMain:
      'Jamais proposé automatiquement : l’arqué expose les poulies des doigts. À ne choisir qu’après relecture de la fiche par un kiné qui connaît l’escalade.',
  },
  {
    id: 'OS-08',
    nom: 'Front lever',
    ficheModule: 'traction-front-lever-tenues',
    accents: ['traction_gainage'],
    pourquoi: 'Préparer le front lever par des tenues progressives à la barre.',
    remplacementId: 'OS-03',
    avertissementALaMain:
      'Fiche d’essai : les durées et le repos ne viennent d’aucune source concordante, et Arthur ne l’a pas encore validée. Choix à ta charge, avec prudence.',
  },
  {
    id: 'OS-09',
    nom: 'Planche de gymnastique (préparation)',
    ficheModule: 'gainage-planche-gym-preparation',
    accents: ['traction_gainage'],
    pourquoi: 'Préparer la planche de gymnastique par l’appui incliné ; la planche complète n’est pas visée.',
    remplacementId: 'OS-03',
    avertissementALaMain:
      'Fiche d’essai : une seule source, et le profil ne peut pas vérifier les prérequis. Arthur ne l’a pas encore validée. Choix à ta charge, avec prudence.',
  },
  {
    id: 'OS-10',
    nom: 'Peur de la chute en bloc',
    ficheModule: 'mental-chute-bloc-progressive',
    accents: TOUS_LES_ACCENTS,
    pourquoi: 'Apprendre à chuter en bloc par étapes (50, 80 puis 100 cm au plus), avec un partenaire.',
    remplacementId: 'OS-03',
    avertissementALaMain:
      'Les hauteurs de chute volontaire ne sont pas encore validées par Arthur. Apprends d’abord à te réceptionner (fiche « Apprendre à se réceptionner »), toujours avec un partenaire.',
  },
]

export function objectifParId(id: string): ObjectifSpecifiqueType | undefined {
  return OBJECTIFS_SPECIFIQUES.find((o) => o.id === id)
}

/** La fiche du module (la bibliothèque est la seule source des marqueurs, prérequis et contre-indications). */
function ficheDe(o: ObjectifSpecifiqueType): Protocole {
  const fiche = protocoleParId(o.ficheModule)
  if (!fiche) throw new Error(`Objectif ${o.id} : la fiche « ${o.ficheModule} » n’existe pas`)
  return fiche
}

/** Vrai si l'objectif ne peut être choisi qu'à la main (fiche hors génération). */
export function estProposeSeulementALaMain(o: ObjectifSpecifiqueType): boolean {
  return !peutEtreGeneree(ficheDe(o))
}

/** Les objectifs d'une phase d'un accent donné : ceux qu'on peut choisir automatiquement d'abord, puis ceux « à la main ». */
export function objectifsPourAccent(accent: AccentPhase): ObjectifSpecifiqueType[] {
  const liste = OBJECTIFS_SPECIFIQUES.filter((o) => o.accents.includes(accent))
  return [...liste.filter((o) => !estProposeSeulementALaMain(o)), ...liste.filter(estProposeSeulementALaMain)]
}

/** Forme lue par le moteur de vérification : un seul type, défini dans src/regles/types.ts. */
export type ObjectifVerif = ObjectifPersoVerif

/** Déduit de la fiche ce que le moteur de vérification doit savoir : rien n'est saisi deux fois. */
export function objectifVersVerif(o: ObjectifSpecifiqueType): ObjectifVerif {
  const fiche = ficheDe(o)
  const remplacement = o.remplacementId ? objectifParId(o.remplacementId) : undefined
  return {
    id: o.id,
    nom: o.nom,
    marqueurs: [...fiche.marqueurs],
    prerequis: { ...fiche.prerequis },
    contreIndications: [...fiche.contreIndications],
    ...(remplacement ? { remplacementNom: remplacement.nom } : {}),
  }
}

// Marqueurs qui comptent dans les quotas de la semaine (règle A6-2).
const MARQUEURS_A_QUOTA: Marqueur[] = MARQUEURS_QUOTA // une seule liste, celle du moteur de vérification

/** Deux objectifs d'une même phase ne doivent pas porter le même marqueur à quota (A7-4). */
export function partagentUnMarqueurAQuota(a: ObjectifSpecifiqueType, b: ObjectifSpecifiqueType): boolean {
  const marqueursB = ficheDe(b).marqueurs
  return ficheDe(a).marqueurs.some((m) => MARQUEURS_A_QUOTA.includes(m) && marqueursB.includes(m))
}
