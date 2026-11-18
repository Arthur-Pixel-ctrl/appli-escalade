import { useEffect, useId, useRef } from 'react'

// Fenêtre de confirmation : remplace window.confirm. Le <dialog> natif gère
// seul le piège du focus et le retour du focus à l'élément d'origine à la fermeture.
export function Confirmation({ ouverte, titre, texte, libelleAction, libelleRester = 'Rester', onAction, onRester, danger = false }: {
  ouverte: boolean
  titre: string
  texte: string
  libelleAction: string
  libelleRester?: string
  onAction: () => void
  onRester: () => void
  danger?: boolean
}) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const boutonRester = useRef<HTMLButtonElement>(null)
  const idTitre = useId()
  const idTexte = useId()

  // La fenêtre suit la prop : ouverte → showModal(), sinon close().
  useEffect(() => {
    const d = dialogue.current
    if (!d) return
    if (ouverte && !d.open) {
      d.showModal()
      // Action sûre d'abord : le focus démarre sur « Rester ».
      boutonRester.current?.focus()
    } else if (!ouverte && d.open) {
      d.close()
    }
  }, [ouverte])

  return (
    <dialog
      ref={dialogue}
      className="confirmation"
      aria-labelledby={idTitre}
      aria-describedby={idTexte}
      // Échap : on garde le contrôle, c'est le parent qui ferme via `ouverte`.
      onCancel={(e) => { e.preventDefault(); onRester() }}
    >
      <div className="fiche pile-large">
        <h2 id={idTitre} className="titre moyen">{titre}</h2>
        <p id={idTexte}>{texte}</p>
        <div className="confirmation-actions">
          <button ref={boutonRester} type="button" className="bouton-second" onClick={onRester}>{libelleRester}</button>
          <button type="button" className={danger ? 'bouton arret centre' : 'bouton principal centre'} onClick={onAction}>
            <strong>{libelleAction}</strong>
          </button>
        </div>
      </div>
    </dialog>
  )
}
