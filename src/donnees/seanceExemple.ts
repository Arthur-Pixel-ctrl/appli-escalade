import type { ConfigChrono } from '../chrono/sequence.ts'

// Une étape de séance guidée. Trois formes suffisent pour l'instant :
// - chrono : un exercice minuté (poutre, bloc de temps)
// - liste  : une routine à cocher (échauffement, antagonistes, mobilité)
// - essais : de la grimpe à essais comptés, avec un repos conseillé entre deux essais
export type Etape = { id: string; titre: string; resume: string; consigne: string } & (
  | { forme: 'chrono'; config: ConfigChrono; mot: string; detail: string; preuve: Preuve }
  | { forme: 'liste'; elements: string[] }
  | { forme: 'essais'; reposS: number; preuve: Preuve }
)

// D'où vient le protocole : une étude, l'avis d'un entraîneur, ou une synthèse maison.
export type Preuve = 'Étude' | 'Avis de coach' | 'Synthèse'

export interface SeanceGuidee {
  nom: string
  dureeMin: number
  etapes: Etape[]
}

// Séance d'exemple, en attendant le programme généré à partir du profil (lot 4).
// Valeurs prudentes pour quelqu'un qui débute la poutre ; à recontrôler avant de figer la bibliothèque.
export const SEANCE_EXEMPLE: SeanceGuidee = {
  nom: 'Doigts et bloc limite',
  dureeMin: 105,
  etapes: [
    {
      id: 'echauffement', forme: 'liste', titre: 'Échauffement', resume: '20 min',
      consigne: 'Monte en intensité petit à petit. Tu dois finir chaud, pas fatigué.',
      elements: [
        '5 min pour faire monter le cardio',
        'Mobilité dynamique : épaules, poignets, hanches',
        '8 à 12 blocs, du plus facile au plus dur',
        'Quelques suspensions courtes sur de grosses prises',
      ],
    },
    {
      id: 'pieds', forme: 'chrono', titre: 'Pieds silencieux', resume: '10 min',
      consigne: 'Sur des blocs faciles, pose chaque pied sans bruit et sans le replacer.',
      mot: 'GRIMPE', detail: 'Blocs faciles · technique', preuve: 'Avis de coach',
      config: { gabarit: 'repetition_unique', effortS: 600, series: 1, reposSeriesS: 0 },
    },
    {
      id: 'echelles', forme: 'chrono', titre: 'Échelles 3-6-9 à la poutre', resume: '9 échelles',
      consigne: 'Suspensions de 3, 6 puis 9 secondes, loin de l’échec. Poids du corps, épaules engagées. Change de prise à chaque échelle, en circuit.',
      mot: 'SUSPENDS-TOI', detail: 'Semi-arqué, main ouverte, 3 doigts · poids du corps', preuve: 'Avis de coach',
      config: { gabarit: 'echelle', dureesS: [3, 6, 9], creneauS: 45, reposEntrePaliersS: 6, series: 9, reposSeriesS: 0 },
    },
    {
      id: 'bloc-limite', forme: 'essais', titre: 'Bloc limite, blocs à réglettes', resume: '40 min',
      consigne: 'Des blocs à ta limite, peu d’essais mais de vrais essais. Arrête quand la qualité baisse.',
      reposS: 240, preuve: 'Avis de coach',
    },
    {
      id: 'antagonistes', forme: 'liste', titre: 'Antagonistes', resume: '12 min',
      consigne: 'Charges légères, mouvement propre. C’est de l’entretien, pas de la performance.',
      elements: [
        'Pompes : 3 séries de 8 à 12',
        'Rotations externes à l’élastique : 3 séries de 15',
        'Extenseurs du poignet : 3 séries de 15',
      ],
    },
    {
      id: 'mobilite', forme: 'liste', titre: 'Mobilité des hanches', resume: '15 min',
      consigne: 'Étirements tenus, sans douleur, en respirant calmement.',
      elements: [
        'Grenouille : 2 fois 60 s',
        'Pigeon : 2 fois 60 s par côté',
        'Fente basse : 2 fois 45 s par côté',
        'Ischios, jambe tendue : 2 fois 45 s par côté',
      ],
    },
  ],
}
