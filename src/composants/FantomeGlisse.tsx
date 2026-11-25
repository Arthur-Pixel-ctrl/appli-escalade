/** La fiche qui suit le pointeur : ombre flottante, contour résine (styles `.glisse-fantome`). */
export function FantomeGlisse({ libelle, x, y }: { libelle: string; x: number; y: number }) {
  return <div className="glisse-fantome" aria-hidden="true" style={{ left: x, top: y }}>{libelle}</div>
}
