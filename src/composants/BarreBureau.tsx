import { useEffect, useState } from 'react'
import { Icone } from './Icone.tsx'
import { surDonneesChangees, surEcriture } from '../donnees/stockage.ts'
import { etatSynchroCourt, surEtatSynchro, synchroEnCours } from '../synchro/automatique.ts'
import { compterEnAttente } from '../synchro/synchro.ts'

interface Props {
  rubriques: readonly string[]
  rubrique: string
  onChoisir: (rubrique: string) => void
  /** Vrai si un compte est connecté : sinon la mention dit « PAS DE COMPTE ». */
  avecCompte: boolean
  /** Identifiant de la zone de contenu, cible du lien d'évitement. */
  idContenu: string
}

// Mention d'état : relue à chaque écriture, fin de synchro, arrivée de données, et toutes les 30 s.
function useEtatSynchroCourt(actif: boolean): string {
  const [enLigne, setEnLigne] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false)
  const [enAttente, setEnAttente] = useState(0)
  const [enCours, setEnCours] = useState(synchroEnCours())
  useEffect(() => {
    const maj = () => setEnLigne(navigator.onLine !== false)
    window.addEventListener('online', maj)
    window.addEventListener('offline', maj)
    return () => { window.removeEventListener('online', maj); window.removeEventListener('offline', maj) }
  }, [])
  useEffect(() => {
    if (!actif) return
    let vivant = true
    const relire = () => {
      setEnCours(synchroEnCours())
      compterEnAttente().then((n) => { if (vivant) setEnAttente(n) }).catch(() => {})
    }
    relire()
    const minuteur = setInterval(relire, 30_000)
    const desabonnements = [surEcriture(relire), surDonneesChangees(relire), surEtatSynchro(relire)]
    return () => { vivant = false; clearInterval(minuteur); desabonnements.forEach((f) => f()) }
  }, [actif])
  return etatSynchroCourt({ enLigne, enCours, enAttente })
}

// Barre du haut de la mise en page ordinateur : marque, rubriques, état de synchro, assistant.
export function BarreBureau({ rubriques, rubrique, onChoisir, avecCompte, idContenu }: Props) {
  const mention = useEtatSynchroCourt(avecCompte)
  return (
    <>
      {/* Premier élément focalisable : saute la barre pour aller droit au contenu. */}
      <a
        className="lien-evitement"
        href={`#${idContenu}`}
        onClick={(e) => { e.preventDefault(); document.getElementById(idContenu)?.focus() }}
      >
        Aller au contenu
      </a>
      <header className="bureau-barre">
        <p className="bureau-marque"><Icone nom="prise" taille={28} />Get me to 9a</p>
        <nav className="bureau-liens" aria-label="Navigation principale">
          {rubriques.map((nom) => (
            <button key={nom} className="bureau-lien" aria-current={nom === rubrique ? 'page' : undefined} onClick={() => onChoisir(nom)}>
              {nom}
            </button>
          ))}
        </nav>
        <div className="bureau-droite">
          <span className="mention" role="status">{avecCompte ? mention : 'PAS DE COMPTE'}</span>
          {/* L'assistant arrive en phase 5. */}
          <button className="bouton-second" disabled title="Arrive en phase 5">Assistant</button>
        </div>
      </header>
    </>
  )
}
