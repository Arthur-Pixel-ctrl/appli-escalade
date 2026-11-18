// Les entrées de navigation des deux mises en page, et le lien entre elles.
// Dans un fichier à part : les fichiers de composants ne doivent exporter que des composants.

// Les quatre onglets de la barre du bas (téléphone).
export const ONGLETS = [
  { nom: 'Aujourd’hui', icone: 'aujourdhui' },
  { nom: 'Programme', icone: 'programme' },
  { nom: 'Bilans', icone: 'bilans' },
  { nom: 'Profil', icone: 'profil' },
] as const
export type Onglet = (typeof ONGLETS)[number]['nom']

// Les rubriques de la barre du haut (ordinateur).
export const RUBRIQUES_BUREAU = ['Tableau de bord', 'Plan', 'Bibliothèque', 'Bilans', 'Profil'] as const
export type RubriqueBureau = (typeof RUBRIQUES_BUREAU)[number]

// Quand l'écran change de taille, on garde l'écran courant : chaque onglet a sa rubrique jumelle.
export function rubriquePourOnglet(onglet: Onglet): RubriqueBureau {
  const jumelles: Record<Onglet, RubriqueBureau> = {
    'Aujourd’hui': 'Tableau de bord', Programme: 'Plan', Bilans: 'Bilans', Profil: 'Profil',
  }
  return jumelles[onglet]
}
// La Bibliothèque n'existe pas sur téléphone : on retombe sur Aujourd'hui.
export function ongletPourRubrique(rubrique: RubriqueBureau): Onglet {
  const jumelles: Record<RubriqueBureau, Onglet> = {
    'Tableau de bord': 'Aujourd’hui', Plan: 'Programme', 'Bibliothèque': 'Aujourd’hui', Bilans: 'Bilans', Profil: 'Profil',
  }
  return jumelles[rubrique]
}
