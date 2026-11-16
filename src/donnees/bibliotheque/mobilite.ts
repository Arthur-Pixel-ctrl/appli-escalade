import type { Protocole } from './types.ts'

// Mobilité : surtout les hanches, l’amplitude la plus liée au niveau.
// Ce qui compte est le temps cumulé : environ 10 min par semaine et par zone suffisent.
// L’inconfort n’est pas nécessaire : étire sans douleur.

export const MOBILITE: Protocole[] = [
  {
    id: 'mobilite-grand-ecart-lattice',
    nom: 'Grand écart latéral',
    qualite: 'mobilite',
    resume: '25 min',
    consigne: 'En séance séparée. Monte la tension progressivement. Arrête et consulte un kiné si tu as mal à l’intérieur du genou.',
    forme: 'liste',
    elements: [
      'Rouleau sur fessiers, ischios, mollets : 30 s par côté, 30 s de repos',
      'Squat cosaque lent (3 s en descente, 2 s en bas, 2 s en montée, 1 s en haut) : 3 × 4, 60 s de repos',
      'Demi-écart à genoux : 3 × 30 s par côté, 30 s de repos',
      'Position du cavalier tenue : 3 × 30 s, 30 s de repos',
      'Grand écart debout sans les mains : 3 × 30 s, 30 s de repos',
      'Planche de Copenhague, jambe fléchie : 2 × 2 tenues de 15 s par côté',
    ],
    dureeMin: 25,
    preuve: 'Avis de coach',
    source: { auteur: 'Lattice Training', adresse: 'https://latticetraining.com/blog/flexibility-for-climbers-how-to-improve-your-side-split' },
    prerequis: {},
    contreIndications: ['genou'],
    marqueurs: [],
    maxParSemaine: 2,
    progression: 'Progrès mesurables en 8 à 12 semaines. Cavalier et Copenhague jambe fléchie pendant 4 à 6 semaines, puis charge légère et jambe tendue.',
  },
  {
    id: 'mobilite-etirements-du-soir',
    nom: 'Étirements du soir',
    qualite: 'mobilite',
    resume: '15 à 20 min',
    consigne: 'Après la séance ou le soir. Tiens chaque position 60 s, à intensité modérée, en respirant calmement.',
    forme: 'liste',
    elements: [
      'Adducteurs (grenouille) : 2 à 3 × 60 s',
      'Ischio-jambiers : 2 à 3 × 60 s',
      'Fléchisseurs de hanche (fente basse) : 2 à 3 × 60 s par côté',
      'Fessiers : 2 à 3 × 60 s par côté',
      'Mollets : 2 à 3 × 60 s par côté',
      'Pectoraux : 2 à 3 × 60 s',
      'Grand dorsal : 2 à 3 × 60 s',
    ],
    dureeMin: 20,
    preuve: 'Synthèse',
    source: { auteur: 'Synthèse du projet (d’après Ingram et al., 2024)', adresse: 'https://fisiologiadelejercicio.com/wp-content/uploads/2024/12/Optimising-the-Dose-of-Static-Stretching-to-Improve-Flexibility.pdf' },
    prerequis: {},
    contreIndications: [],
    marqueurs: [],
    maxParSemaine: 3,
    progression: 'Trois fois par semaine donnent 6 à 9 min par zone. Mesure tes progrès tous les 2 à 3 mois.',
  },
]
