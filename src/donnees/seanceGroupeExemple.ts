import type { SeanceGroupe } from '../moteur/types.ts'

// Séance d'exemple, cohérente avec un bloc de 4 semaines « force des doigts ».
export const SEANCE_GROUPE_EXEMPLE: SeanceGroupe = {
  nom: 'Doigts et bloc limite',
  reposConseilleS: 240,
  objectifs: [
    {
      libelle: '3 blocs durs à réglettes, 4 essais max chacun', cible: 3, couleurConseillee: 'Rouge', compte: 'blocs_notes',
      modeleId: 'OG-01', ficheReference: 'puissance-bloc-limite', blocs: 3, essaisMaxParBloc: 4,
    },
    { libelle: 'Flasher 3 violets', cible: 3, couleurConseillee: 'Violet', compte: 'flashs' },
  ],
}
