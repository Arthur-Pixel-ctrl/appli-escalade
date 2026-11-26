// Exemples réutilisables par les tests du moteur (sans import de Vitest).
import { fichesDeLaBibliotheque } from './adaptateur.ts'
import { estNerveuse } from './base.ts'
import { REGLES_PAR_DEFAUT } from './reglesParDefaut.ts'
import type { ContexteVerif, FicheVerif, Jour, ProfilVerif, Qualite, SeanceVerif, VersionVerif } from './types.ts'

/** Grimpeur de bloc de 7A, 4 ans de pratique, sans douleur : il remplit les prérequis courants. */
export const PROFIL_DE_REFERENCE: ProfilVerif = {
  disciplinePrincipale: 'bloc',
  niveauBloc: '7A',
  anneesPratique: 4,
  experiencePoutre: 'occasionnelle',
  tractionsStrictesMax: 12,
  test15sSur25mm: true,
  adulte: true,
  grimpeEnTete: false,
  seancesParSemaine: 3,
  lieux: ['salle_bloc'],
}

/** Contexte de référence (le 23/11/2026 à 8 h) ; `surcharges` remplace les champs voulus. */
export function contexteDeReference(surcharges: Partial<ContexteVerif> = {}): ContexteVerif {
  return {
    aujourdhui: '2026-11-23',
    maintenant: '2026-11-23T08:00:00.000Z',
    profil: PROFIL_DE_REFERENCE,
    fiches: fichesDeLaBibliotheque(),
    objectifsPerso: {},
    douleurs: [],
    formes: [],
    resultatsTests: [],
    regles: REGLES_PAR_DEFAUT,
    ...surcharges,
  }
}

export interface OptionsSeanceSolo {
  nom?: string
  qualite?: Qualite
  durete?: VersionVerif['durete']
  effortPrevu?: number
  dureeMin?: number
  groupe?: VersionVerif
  realisee?: SeanceVerif['realisee']
  fiches?: Record<string, FicheVerif> // pour deviner qualité et dureté ; bibliothèque par défaut
}

/**
 * Fabrique une séance solo à partir d'identifiants de fiches.
 * Qualité par défaut : celle de la première fiche qui n'est pas un échauffement.
 * Dureté par défaut : dure si une fiche est nerveuse, sinon légère.
 */
export function seanceSolo(id: string, date: Jour, ficheIds: string[], options: OptionsSeanceSolo = {}): SeanceVerif {
  const fiches = options.fiches ?? fichesDeLaBibliotheque()
  const connues = ficheIds.flatMap((f) => (fiches[f] ? [fiches[f]] : []))
  const principale = connues.find((f) => f.qualite !== 'echauffement') ?? connues[0]
  const solo: VersionVerif = {
    durete: options.durete ?? (connues.some(estNerveuse) ? 'dure' : 'legere'),
    etapes: ficheIds.map((ficheId) => ({ ficheId })),
  }
  if (options.effortPrevu !== undefined) solo.effortPrevu = options.effortPrevu
  if (options.dureeMin !== undefined) solo.dureeMin = options.dureeMin
  const seance: SeanceVerif = {
    id,
    nom: options.nom ?? id,
    date,
    qualite: options.qualite ?? principale?.qualite ?? 'technique',
    solo,
  }
  if (options.groupe) seance.groupe = options.groupe
  if (options.realisee) seance.realisee = options.realisee
  return seance
}
