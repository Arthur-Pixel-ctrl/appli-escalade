// Le nom de la couleur est écrit par l'appelant, à côté de la pastille.
export function PastillePrise({ couleur, taille = 'normale' }: { couleur: string; nom: string; taille?: 'normale' | 'petite' }) {
  // La couleur vient des données de la salle : seule couleur écrite hors des variables.
  return <span className={taille === 'petite' ? 'prise petite' : 'prise'} style={{ background: couleur }} aria-hidden="true" />
}
