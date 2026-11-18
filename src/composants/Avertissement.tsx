import { useId, useState, type ReactNode } from 'react'
import { Icone } from './Icone.tsx'

type Niveau = 'information' | 'avertissement' | 'arret'

// Les trois niveaux préviennent sans jamais bloquer : aucun bouton « J'accepte », aucune action désactivée.
export function Avertissement({ niveau, titre, children, pourquoi, correction }: {
  niveau: Niveau
  titre: string
  children?: ReactNode
  pourquoi?: ReactNode
  correction?: { libelle: string; action: () => void }
}) {
  const [ouvert, setOuvert] = useState(false)
  const idPourquoi = useId()

  // Information : simple ligne, sans rubalise, annoncée poliment.
  if (niveau === 'information') {
    return (
      <div className="information" role="status">
        <Icone nom="information" taille={20} />
        <p><strong>{titre}</strong>{children ? <> {children}</> : null}</p>
      </div>
    )
  }

  const classe = niveau === 'arret' ? 'signal-arret' : 'avertissement'
  return (
    <div className={classe} role={niveau === 'arret' ? 'alert' : 'status'}>
      <div className="avertissement-tete">
        <Icone nom={niveau} />
        <strong>{titre}</strong>
      </div>
      {children ? <div className="avertissement-texte">{children}</div> : null}
      {(pourquoi || correction) && (
        <div className="avertissement-actions">
          {pourquoi && (
            <button type="button" className="bouton-discret" aria-expanded={ouvert} aria-controls={idPourquoi} onClick={() => setOuvert(!ouvert)}>
              Pourquoi ?
            </button>
          )}
          {correction && (
            <button type="button" className="bouton-discret" onClick={correction.action}>{correction.libelle}</button>
          )}
        </div>
      )}
      {pourquoi && ouvert && <div id={idPourquoi} className="avertissement-pourquoi">{pourquoi}</div>}
    </div>
  )
}
