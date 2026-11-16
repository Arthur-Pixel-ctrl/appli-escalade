// Les salles et leurs couleurs de blocs, de la plus facile à la plus dure.
// Fourchettes approximatives, à confirmer sur place ; chacun pourra les modifier (lot 3.6).
export interface CouleurSalle { nom: string; hex: string; cotationMin: string; cotationMax: string }
export interface Salle { id: string; nom: string; couleurs: CouleurSalle[] }

export const MROC: Salle = {
  id: 'salle-mroc',
  nom: 'Mroc',
  couleurs: [
    { nom: 'Jaune', hex: '#E8D44A', cotationMin: '3', cotationMax: '4C' },
    { nom: 'Vert', hex: '#5FA052', cotationMin: '4C', cotationMax: '5B' },
    { nom: 'Bleu', hex: '#4A7BD0', cotationMin: '5B', cotationMax: '6A' },
    { nom: 'Violet', hex: '#8E5CC2', cotationMin: '6A+', cotationMax: '6C+' },
    { nom: 'Rouge', hex: '#C8443C', cotationMin: '7A', cotationMax: '7B' },
    { nom: 'Noir', hex: '#000000', cotationMin: '7B+', cotationMax: '8A' },
  ],
}

// Même suite de fourchettes que Mroc, avec le noir avant le violet.
export const ARKOSE: Salle = {
  id: 'salle-arkose',
  nom: 'Arkose',
  couleurs: [
    { nom: 'Jaune', hex: '#E8D44A', cotationMin: '3', cotationMax: '4C' },
    { nom: 'Vert', hex: '#5FA052', cotationMin: '4C', cotationMax: '5B' },
    { nom: 'Bleu', hex: '#4A7BD0', cotationMin: '5B', cotationMax: '6A' },
    { nom: 'Rouge', hex: '#C8443C', cotationMin: '6A+', cotationMax: '6C+' },
    { nom: 'Noir', hex: '#000000', cotationMin: '7A', cotationMax: '7B' },
    { nom: 'Violet', hex: '#8E5CC2', cotationMin: '7B+', cotationMax: '8A' },
  ],
}

// Les salles proposées dans le profil. D'autres enseignes et la salle personnalisée viendront ensuite.
export const SALLES: Salle[] = [MROC, ARKOSE]

export function salleParId(id: string | undefined): Salle {
  return SALLES.find((s) => s.id === id) ?? MROC
}
