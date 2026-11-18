import { useEffect, useRef } from 'react'
import { Avertissement } from '../composants/Avertissement.tsx'

// Mises en garde : les douleurs à repérer. Page de référence, consultable à tout moment
// depuis le profil, et affichée quand on appuie sur « Stop, ça fait mal ».
// Contenu tiré de la synthèse théorique (consignes de cliniciens). Ce n'est pas un avis médical.
const ARRET = [
  'Claquement ou « pop » dans un doigt',
  'Douleur aiguë et soudaine à la base d’un doigt',
  'Gonflement ou bleu',
  'Tendon qui fait saillie',
  'Doigt impossible à plier ou à tendre complètement',
  'Genou qui gonfle ou se bloque',
  'Épaule instable',
  'Engourdissements',
]
const REDUCTION = [
  'Douleur au-dessus de 2 sur 10 pendant l’effort',
  'Douleur qui dure plus de 10 minutes après l’effort',
  'Raideur inhabituelle d’une articulation le lendemain',
  'Douleur au coude quand tu serres une prise',
]

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
          <ul className="liste-simple">{ARRET.map((s) => <li key={s}>{s}</li>)}</ul>
        </Avertissement>
        <p className="texte-3">Pour un doigt, vois un professionnel qui connaît l’escalade : le diagnostic se fait à l’échographie.</p>
      </section>

      <section className="pile">
        <h2 className="sous-titre">Allège pendant 1 à 2 semaines</h2>
        <Avertissement niveau="avertissement" titre="Signes à prendre au sérieux">
          <ul className="liste-simple">{REDUCTION.map((s) => <li key={s}>{s}</li>)}</ul>
        </Avertissement>
        <p className="texte-3">Retire les arqués, le pan Güllich, les trous et les efforts maximaux. Garde de la grimpe facile et sans douleur. Sans nette amélioration en 14 jours, consulte.</p>
      </section>

      <button className="bouton principal centre" onClick={onFermer}><strong>{libelleFermer ?? (apresDouleur ? 'Revenir à la séance' : 'Fermer')}</strong></button>
      {onTerminer && <button className="bouton-second" onClick={onTerminer}>Terminer et enregistrer</button>}
    </main>
  )
}
