// Le profil du grimpeur. Il est rempli au premier lancement et sert de point de départ à tout le reste :
// salle et couleurs aujourd'hui, programme et prérequis des exercices dans les lots suivants.
export type ZoneDouleur = 'doigts' | 'poignet' | 'coude' | 'epaule' | 'genou' | 'dos' | 'autre'
export type JourSemaine = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'

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
  // Prérequis des protocoles exigeants. null = pas encore renseigné : compte comme « non rempli », par prudence.
  tractionsStrictes: number | null // nombre maximal de tractions strictes d'affilée
  tient15sSur25mm: boolean | null // tient 15 s sur une réglette de 25 mm, poids du corps
  majeur: boolean | null // 18 ans révolus : lest et pan Güllich
  grimpeEnTete: boolean | null // sait grimper et chuter en tête
  joursDisponibles: JourSemaine[] // vide = pas renseigné ; sert au placement des séances
  repereTraction: 'aucun' | 'hommes' | 'femmes' // repère facultatif dans les bilans, « aucun » par défaut
}

export const PROFIL_VIDE: Profil = {
  prenom: '', disciplinePrincipale: 'bloc', niveauBloc: '6A', niveauVoie: '6a', objectif: '',
  anneesPratique: 2, experiencePoutre: 'aucune', poidsCorpsKg: null, pointsFaibles: '',
  douleursEnCours: [], seancesParSemaine: 3, grimpeSouventEnGroupe: true, salleHabituelleId: 'salle-mroc',
  tractionsStrictes: null, tient15sSur25mm: null, majeur: null, grimpeEnTete: null,
  joursDisponibles: [], repereTraction: 'aucun',
}

/** Complète un profil enregistré avant la v2 : les champs absents prennent la valeur de PROFIL_VIDE. */
export function completerProfil(p: Partial<Profil>): Profil {
  const complet: Profil = { ...PROFIL_VIDE }
  // On ne recopie que les champs connus et présents, pour ignorer `id`, `modifieLe`, etc.
  for (const cle of Object.keys(PROFIL_VIDE) as (keyof Profil)[]) {
    if (p[cle] !== undefined) (complet as unknown as Record<string, unknown>)[cle] = p[cle]
  }
  return complet
}

// Réponse à une question à trois issues. `null` (pas de réponse) devient « inconnu » à l'écran,
// parce que le composant de choix ne sait pas porter `null`.
export type Reponse3 = 'oui' | 'non' | 'inconnu'
export const versReponse3 = (v: boolean | null): Reponse3 => (v === null ? 'inconnu' : v ? 'oui' : 'non')
export const depuisReponse3 = (r: Reponse3): boolean | null => (r === 'inconnu' ? null : r === 'oui')

export const COTATIONS_BLOC = ['4', '5A', '5B', '5C', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A']
export const COTATIONS_VOIE = ['5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a']

export const ZONES: { valeur: ZoneDouleur; nom: string }[] = [
  { valeur: 'doigts', nom: 'Doigts' }, { valeur: 'poignet', nom: 'Poignet' }, { valeur: 'coude', nom: 'Coude' },
  { valeur: 'epaule', nom: 'Épaule' }, { valeur: 'genou', nom: 'Genou' }, { valeur: 'dos', nom: 'Dos' },
  { valeur: 'autre', nom: 'Autre' },
]
