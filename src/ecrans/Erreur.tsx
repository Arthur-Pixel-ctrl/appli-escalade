import { appliquerMiseAJour, miseAJourEnAttente } from '../miseAJour.ts'

// Écran affiché quand quelque chose empêche l'app de fonctionner,
// au lieu d'un écran noir sans explication.
export function Erreur({ message }: { message: string }) {
  return (
    <div className="app">
      <main className="ecran">
        <div className="pile">
          <p className="surtitre">Un problème est survenu</p>
          <h1 className="titre moyen">L’app n’a pas pu s’afficher</h1>
          <p className="texte-2">Tes séances enregistrées ne sont pas effacées. Recharge l’app ; si le problème revient, ferme-la complètement puis rouvre-la.</p>
        </div>
        <button className="bouton principal centre" onClick={() => (miseAJourEnAttente() ? appliquerMiseAJour() : window.location.reload())}><strong>Recharger l’app</strong></button>
        <div className="pile">
          <p className="surtitre">Détail à transmettre si ça continue</p>
          <p className="texte-3 detail-erreur">{message}</p>
        </div>
      </main>
    </div>
  )
}

/** Écran d'attente : texte discret, affiché seulement si le chargement dure. */
export function Chargement() {
  return (
    <div className="app">
      <main className="ecran chargement" aria-busy="true">
        <p className="texte-3">Chargement…</p>
      </main>
    </div>
  )
}
