import type { Protocole } from './types.ts'

// Antagonistes : les muscles qui poussent et qui ouvrent la main, peu sollicités en grimpe.
// Deux séances courtes par semaine, après les jours de grimpe. C’est de l’entretien :
// charges modérées, mouvement propre, jamais douloureux.

export const ANTAGONISTES: Protocole[] = [
  {
    id: 'antagonistes-lattice',
    nom: 'Antagonistes, 3 séries',
    qualite: 'antagonistes',
    resume: '20 min',
    consigne: 'Après une séance de grimpe, pas un jour de repos. Quatre exercices en circuit, trois tours, en gardant quelques répétitions en réserve.',
    forme: 'liste',
    elements: [
      'Développé épaules ou haussements d’épaules : 3 séries de 8 à 12',
      'Pompes ou développé couché : 3 séries de 8 à 12',
      'Rotations externes à l’élastique ou I-Y-T : 3 séries de 8 à 12',
      'Extenseurs du poignet : 3 séries de 8 à 12',
    ],
    dureeMin: 20,
    preuve: 'Avis de coach',
    source: { auteur: 'Lattice Training', adresse: 'https://latticetraining.com/blog/training-tips-for-climbers-the-importance-of-antagonist-training-during-performance-phase' },
    prerequis: {},
    contreIndications: ['epaule', 'coude', 'poignet'],
    marqueurs: [],
    maxParSemaine: 2,
    progression: 'Augmente un peu la charge quand 12 répétitions deviennent faciles.',
    aVerifier: 'Lattice dit « quelques minutes » de repos entre séries sans chiffrer : le circuit et la durée de 20 min sont notre choix. Dips retirés de la liste par défaut, plus exigeants pour l’épaule : posé par l’audit.',
  },
  {
    id: 'antagonistes-legers',
    nom: 'Antagonistes légers',
    qualite: 'antagonistes',
    resume: '10 min',
    consigne: 'Charges légères, beaucoup de répétitions, sans forcer. Bonne option pour commencer.',
    forme: 'liste',
    elements: [
      'Pompes : 1 à 2 séries de 20 à 25',
      'Développé épaules léger : 1 à 2 séries de 20 à 25',
      'Rotations externes à l’élastique : 1 à 2 séries de 20 à 25',
      'Extenseurs du poignet : 1 à 2 séries de 20 à 25',
    ],
    dureeMin: 10,
    preuve: 'Avis de coach',
    source: { auteur: 'Nicros', adresse: 'https://nicros.com/training/training-articles/physical/antagonist-muscle-training-to-prevent-injury/' },
    prerequis: {},
    contreIndications: ['epaule', 'coude', 'poignet'],
    marqueurs: [],
    maxParSemaine: 3,
    progression: 'Passe à la version en 3 séries de 8 à 12 quand ces séries deviennent faciles.',
    aVerifier: 'La source ne nomme pas les exercices : nous reprenons les quatre groupes de Lattice. Durée estimée par nous.',
  },
]
