import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Icone } from './Icone.tsx'

type Niveau = 'information' | 'avertissement' | 'arret'

// Les trois niveaux préviennent sans jamais bloquer : aucun bouton « J'accepte », aucune action désactivée.
// `onGarder` ajoute « Je garde ce choix » ; `replie` montre alors une seule ligne (l'avertissement reste compté ailleurs).
// Un signal d'arrêt ne se replie pas : on ne lui donne jamais `onGarder`.
export function Avertissement({ niveau, titre, children, pourquoi, correction, onGarder, replie, onRouvrir }: {
  niveau: Niveau
  titre: string
  children?: ReactNode
  pourquoi?: ReactNode
  correction?: { libelle: string; action: () => void }
  onGarder?: () => void
  replie?: boolean
  onRouvrir?: () => void
}) {
  const [ouvert, setOuvert] = useState(false)
  const idPourquoi = useId()
  const boutonRouvrir = useRef<HTMLButtonElement>(null)
  const etaitReplie = useRef(replie)

  // Quand l'avertissement se replie, le bouton « Je garde ce choix » disparaît : le focus passe à « Revoir ».
  useEffect(() => {
    if (replie && !etaitReplie.current) boutonRouvrir.current?.focus()
    etaitReplie.current = replie
  }, [replie])

  // Information : simple ligne, sans rubalise, annoncée poliment.
  if (niveau === 'information') {
    return (
      <div className="information" role="status">
        <Icone nom="information" taille={20} />
        <p><strong>{titre}</strong>{children ? <> {children}</> : null}</p>
      </div>
    )
  }

  if (niveau === 'avertissement' && replie) {
    return (
      <div className="avertissement-replie" role="status">
        <Icone nom="avertissement" taille={20} />
        <span className="avertissement-replie-texte">{titre} <span className="mention">Gardé.</span></span>
        {onRouvrir && <button ref={boutonRouvrir} type="button" className="bouton-discret" onClick={onRouvrir}>Revoir</button>}
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
      {(pourquoi || correction || onGarder) && (
        <div className="avertissement-actions">
          {pourquoi && (
            <button type="button" className="bouton-discret" aria-expanded={ouvert} aria-controls={idPourquoi} onClick={() => setOuvert(!ouvert)}>
              Pourquoi ?
            </button>
          )}
          {correction && (
            <button type="button" className="bouton-discret" onClick={correction.action}>{correction.libelle}</button>
          )}
          {onGarder && <button type="button" className="bouton-discret" onClick={onGarder}>Je garde ce choix</button>}
        </div>
      )}
      {pourquoi && ouvert && <div id={idPourquoi} className="avertissement-pourquoi">{pourquoi}</div>}
    </div>
  )
}
