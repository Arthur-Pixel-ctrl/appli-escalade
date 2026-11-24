import { useId, useState } from 'react'
import { nomQualite, texteContreIndication, TERRAINS, type EntreeBibliotheque, type EtatEntree } from '../donnees/bibliotheque/filtres.ts'
import { Icone } from './Icone.tsx'

// Fiche de la grille de la bibliothèque (O-06). Elle dit tout ce qui compte avant de choisir :
// ce qui manque, ce qui est déconseillé, ce qui reste « à la main » et pourquoi, d'où vient l'exercice.
// Le panneau latéral complet (D-12) remplacera le bouton « Détails ».
export function FicheProtocole({ entree, etat }: { entree: EntreeBibliotheque; etat: EtatEntree }) {
  const [ouverte, setOuverte] = useState(false)
  const idDetails = useId()
  const terrain = TERRAINS.find((t) => t.valeur === entree.terrain)?.nom
  const { manques, contreIndications } = etat

  return (
    <article className="fiche fiche-grille">
      <span className="vis g" aria-hidden="true" />
      <p className="surtitre">{nomQualite(entree.qualite)} · {entree.dureeMin} min</p>
      <h2 className="fiche-grille-nom">{entree.nom}</h2>
      {entree.resume !== '' && <p className="texte-2">{entree.resume}</p>}

      <ul className="fiche-grille-etiquettes">
        <li><span className="etiquette contour">{entree.preuve}</span></li>
        {terrain && <li><span className="etiquette contour">{terrain}</span></li>}
        {entree.groupe && <li><span className="etiquette contour">Groupe</span></li>}
        {entree.partenaire && <li><span className="etiquette contour">Partenaire</span></li>}
        {entree.fiche.estTest && <li><span className="etiquette contour">Test</span></li>}
        {entree.aLaMain !== undefined && <li><span className="etiquette">À la main seulement</span></li>}
      </ul>

      {/* Jamais cachée sans le dire : l'étiquette et sa raison restent à côté de la fiche. */}
      {entree.aLaMain !== undefined && (
        <p className="texte-3 fiche-grille-raison">Ni le générateur ni l’assistant ne la proposent. Raison : {entree.aLaMain}</p>
      )}

      {manques.length > 0 && (
        <p className="fiche-grille-prerequis">
          <span className="etiquette attente">Prérequis</span> <span className="texte-2">{manques.join(' ; ')}</span>
        </p>
      )}
      {contreIndications.length > 0 && (
        // Pas de role="alert" : 60 fiches pourraient l'annoncer d'un coup. Le texte est lu avec la fiche.
        <div className="signal-arret fiche-grille-arret">
          <div className="avertissement-tete"><Icone nom="arret" /><strong>{texteContreIndication(contreIndications)}</strong></div>
        </div>
      )}

      <p className="texte-3 fiche-grille-source">Source : {entree.source}</p>

      <button type="button" className="bouton-texte fiche-grille-details" aria-expanded={ouverte} aria-controls={idDetails} onClick={() => setOuverte(!ouverte)}>
        {ouverte ? 'Masquer les détails' : 'Détails'}
      </button>
      {ouverte && (
        <div id={idDetails} className="fiche-grille-corps">
          <p>{entree.consigne}</p>
          {entree.progression && <p className="texte-2"><strong>Pour progresser.</strong> {entree.progression}</p>}
          {entree.aVerifier && <p className="texte-2"><strong>À vérifier.</strong> {entree.aVerifier}</p>}
          {entree.adresse && (
            <p className="texte-2"><a href={entree.adresse} target="_blank" rel="noopener noreferrer">Ouvrir la source (nouvel onglet)</a></p>
          )}
        </div>
      )}
    </article>
  )
}
