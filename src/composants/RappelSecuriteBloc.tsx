import { protocoleParId } from '../donnees/bibliotheque/index.ts'

// Le rappel de sécurité du bloc (décision F2, point 11), en tête d'une séance de bloc limite.
// Il reprend la fiche de la bibliothèque mot pour mot : rien n'est écrit en double ici.
export function RappelSecuriteBloc() {
  const fiche = protocoleParId('technique-rappel-securite-bloc')
  if (!fiche || fiche.forme !== 'liste') return null
  return (
    <section className="fiche rappel-bloc" aria-labelledby="titre-rappel-bloc">
      <span className="vis g" aria-hidden="true" /><span className="vis d" aria-hidden="true" />
      <h2 className="sous-titre titre-fiche" id="titre-rappel-bloc">{fiche.nom}</h2>
      <ul className="liste-simple">{fiche.elements.map((e) => <li key={e}>{e}</li>)}</ul>
    </section>
  )
}
