import { useEffect, useRef, type ReactNode } from 'react'
import { Icone } from './Icone.tsx'

// Panneau latéral de 560 px (O-07). C'est un <dialog> modal : le navigateur piège le focus,
// gère Échap et rend le reste de la page inerte. Il n'existe que tant qu'il est ouvert :
// le parent le monte pour l'ouvrir et le démonte pour le fermer.
// Le focus va sur le titre à l'ouverture (annoncé par le lecteur d'écran) et revient
// à l'élément d'origine à la fermeture, à la main puisque le <dialog> disparaît de la page.
export function PanneauLateral({ idTitre, onFermer, onFermeture, children, pied, superposition }: {
  idTitre: string // identifiant du titre (h2 à tabIndex -1) rendu par le contenu
  onFermer: () => void // Échap, croix, fond : ferme ce qui est au-dessus, puis le panneau
  onFermeture?: () => void // le navigateur a fermé le panneau de lui-même (deux Échap de suite) : le parent le démonte
  children: ReactNode
  pied?: ReactNode // actions toujours visibles en bas
  // Un volet plein écran posé par-dessus (l'aperçu du chrono). Il reste dans le même <dialog> : deux <dialog> modaux
  // l'un dans l'autre, ou l'un sur l'autre, se ferment ensemble au premier Échap. Le panneau dessous devient inerte.
  superposition?: ReactNode
}) {
  const dialogue = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialogue.current
    if (!d) return
    const origine = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (!d.open) d.showModal()
    document.getElementById(idTitre)?.focus({ preventScroll: true })
    return () => {
      d.close()
      if (origine?.isConnected) origine.focus({ preventScroll: true })
    }
  }, [idTitre])

  return (
    <dialog
      ref={dialogue}
      className="panneau"
      aria-labelledby={idTitre}
      // Échap : le parent démonte le panneau, pas le navigateur.
      onCancel={(e) => { e.preventDefault(); onFermer() }}
      // Un clic sur le fond (le ::backdrop désigne le <dialog> lui-même) ferme aussi.
      onClose={() => (onFermeture ?? onFermer)()}
      onClick={(e) => { if (e.target === e.currentTarget) onFermer() }}
    >
      <div className="panneau-contenu" inert={superposition ? true : undefined}>
        <div className="panneau-tete">
          <button type="button" className="bouton-second panneau-fermer" aria-label="Fermer" onClick={onFermer}>
            <Icone nom="fermer" taille={24} />
          </button>
        </div>
        <div className="panneau-corps">{children}</div>
        {pied && <div className="panneau-pied">{pied}</div>}
      </div>
      {superposition}
    </dialog>
  )
}
