// Un bloc grimpé et noté pendant la séance.
export interface BlocGrimpe {
  couleur: string
  essais: number
  resultat: 'flash' | 'enchaine' | 'non_enchaine'
  objectif: number // position de l'objectif en cours au moment de la saisie
}

// Un objectif de groupe : un défi global, suivi par un simple compteur.
export interface ObjectifGroupe {
  libelle: string
  cible: number
  couleurConseillee?: string // présélectionnée dans la saisie
  // Ce qui fait avancer le compteur : chaque bloc noté, ou seulement les blocs flashés.
  compte: 'blocs_notes' | 'flashs'
}

export interface SeanceGroupe {
  nom: string
  reposConseilleS: number
  objectifs: ObjectifGroupe[]
}

// Séance d'exemple, cohérente avec un bloc de 4 semaines « force des doigts ».
export const SEANCE_GROUPE_EXEMPLE: SeanceGroupe = {
  nom: 'Doigts et bloc limite',
  reposConseilleS: 240,
  objectifs: [
    { libelle: '5 blocs durs à réglettes, 5 essais max chacun', cible: 5, couleurConseillee: 'Rouge', compte: 'blocs_notes' },
    { libelle: 'Flasher 3 violets', cible: 3, couleurConseillee: 'Violet', compte: 'flashs' },
  ],
}

export function avancement(objectif: ObjectifGroupe, position: number, blocs: BlocGrimpe[]): number {
  const lesSiens = blocs.filter((b) => b.objectif === position)
  return objectif.compte === 'flashs' ? lesSiens.filter((b) => b.resultat === 'flash').length : lesSiens.length
}
