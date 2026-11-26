import { useEffect, useRef } from 'react'
import { Avertissement } from '../composants/Avertissement.tsx'
import { CONDUITE_REDUCTION, SIGNES_ARRET, SIGNES_REDUCTION } from '../donnees/douleurs.ts'

// Mises en garde : les douleurs à repérer. Page de référence, consultable à tout moment
// depuis le profil, et affichée quand on appuie sur « Stop, ça fait mal ».
// Les listes de signes sont dans `donnees/douleurs.ts` (une seule source). Ce n'est pas un avis médical.

// `onTerminer` (facultatif) ajoute « Terminer et enregistrer » : utilisé quand les mises en garde
// s'ouvrent par-dessus une séance en cours, pour finir la séance avec la douleur déjà signalée.
export function MisesEnGarde({ onFermer, apresDouleur = false, libelleFermer, onTerminer }: {
  onFermer: () => void
  apresDouleur?: boolean
  libelleFermer?: string
  onTerminer?: () => void
}) {
  // Le titre prend le focus à l'ouverture : le lecteur d'écran annonce le nouvel écran.
  const titre = useRef<HTMLHeadingElement>(null)
  useEffect(() => { titre.current?.focus() }, [])
  return (
    <main className="ecran">
      <div className="pile">
        <p className="surtitre">Les douleurs à repérer</p>
        <h1 ref={titre} tabIndex={-1} className="titre moyen">{apresDouleur ? 'Tu as bien fait d’arrêter' : 'Mises en garde'}</h1>
        <p className="texte-2">Ces repères aident à décider quoi faire. Ils ne remplacent pas l’avis d’un professionnel de santé.</p>
      </div>

      <section className="pile">
        <h2 className="sous-titre">Arrête la séance et consulte</h2>
        <Avertissement niveau="arret" titre="Signaux d’arrêt">
          <ul className="liste-simple">{SIGNES_ARRET.map((s) => <li key={s}>{s}</li>)}</ul>
        </Avertissement>
        <p className="texte-3">Pour un doigt, vois un professionnel qui connaît l’escalade : le diagnostic se fait à l’échographie.</p>
      </section>

      <section className="pile">
        <h2 className="sous-titre">Allège pendant 1 à 2 semaines</h2>
        <Avertissement niveau="avertissement" titre="Signes à prendre au sérieux">
          <ul className="liste-simple">{SIGNES_REDUCTION.map((s) => <li key={s}>{s}</li>)}</ul>
        </Avertissement>
        <p className="texte-3">{CONDUITE_REDUCTION}</p>
      </section>

      <button className="bouton principal centre" onClick={onFermer}><strong>{libelleFermer ?? (apresDouleur ? 'Revenir à la séance' : 'Fermer')}</strong></button>
      {onTerminer && <button className="bouton-second" onClick={onTerminer}>Terminer et enregistrer</button>}
    </main>
  )
}
