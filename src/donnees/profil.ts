// Le profil du grimpeur. Il est rempli au premier lancement et sert de point de départ à tout le reste :
// salle et couleurs aujourd'hui, programme et prérequis des exercices dans les lots suivants.
export type ZoneDouleur = 'doigts' | 'poignet' | 'coude' | 'epaule' | 'genou' | 'dos'

export interface Profil {
  prenom: string
  disciplinePrincipale: 'bloc' | 'voie'
  niveauBloc: string // cotation Fontainebleau, "7A"
  niveauVoie: string // cotation française, "6c"
  objectif: string
  anneesPratique: number
  experiencePoutre: 'aucune' | 'occasionnelle' | 'reguliere'
  poidsCorpsKg: number | null // facultatif ; sert à exprimer les tests en % du poids du corps
  pointsFaibles: string
  douleursEnCours: ZoneDouleur[] // vide = aucune douleur
  seancesParSemaine: number
  grimpeSouventEnGroupe: boolean
  salleHabituelleId: string
}

export const PROFIL_VIDE: Profil = {
  prenom: '', disciplinePrincipale: 'bloc', niveauBloc: '6A', niveauVoie: '6a', objectif: '',
  anneesPratique: 2, experiencePoutre: 'aucune', poidsCorpsKg: null, pointsFaibles: '',
  douleursEnCours: [], seancesParSemaine: 3, grimpeSouventEnGroupe: true, salleHabituelleId: 'salle-mroc',
}

export const COTATIONS_BLOC = ['4', '5A', '5B', '5C', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A']
export const COTATIONS_VOIE = ['5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a']

export const ZONES: { valeur: ZoneDouleur; nom: string }[] = [
  { valeur: 'doigts', nom: 'Doigts' }, { valeur: 'poignet', nom: 'Poignet' }, { valeur: 'coude', nom: 'Coude' },
  { valeur: 'epaule', nom: 'Épaule' }, { valeur: 'genou', nom: 'Genou' }, { valeur: 'dos', nom: 'Dos' },
]
