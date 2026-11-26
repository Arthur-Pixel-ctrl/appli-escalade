// Petits morceaux partagés par Aujourd'hui et Programme : bouton de mode, contenu d'une fiche, état « pas de plan ».
import { Icone } from '../composants/Icone.tsx'
import type { ContenuSeance } from './bureau/TableauDeBord.outils.ts'
import type { DemandeLancement } from './lancement.ts'

/** « Je grimpe seul » / « Je grimpe en groupe » : le mode habituel du profil est le seul bouton en résine. */
export function BoutonMode({ mode, principal, titre, sousTitre, onClick }: {
  mode: 'solo' | 'groupe'
  principal: boolean
  titre?: string
  sousTitre: string
  onClick: () => void
}) {
  const libelle = titre ?? (mode === 'solo' ? 'Je grimpe seul' : 'Je grimpe en groupe')
  return (
    <button className={principal ? 'bouton principal avec-icone' : 'bouton avec-icone'} onClick={onClick}>
      <div className="bouton-libelles">
        <strong>{libelle}</strong>
        <span>{sousTitre}</span>
      </div>
      <Icone nom={principal ? 'suivant' : mode === 'solo' ? 'solo' : 'groupe'} taille={26} />
    </button>
  )
}

/** Les étapes, les parties ou la recommandation, selon le niveau affiché de la séance (R-9). */
export function ContenuFiche({ contenu }: { contenu: ContenuSeance }) {
  if (contenu.niveau === 'simple') return <p className="recommandation">{contenu.recommandation}</p>
  const lignes = contenu.niveau === 'detaille' ? contenu.lignes : contenu.parties
  return (
    <ol className="etapes-apercu">
      {lignes.map((ligne, i) => (
        <li key={i}>
          <span className="repere">{i + 1}</span>
          <span>{ligne.titre}</span>
          <span className="donnee">{ligne.dureeMin} min</span>
        </li>
      ))}
    </ol>
  )
}

/** Silhouettes de la fiche et des boutons pendant la lecture. */
export function Chargement({ titre }: { titre: string }) {
  return (
    <main className="ecran" aria-busy="true">
      <p className="pour-lecteur" role="status">{titre}</p>
      <div className="silhouette titre-silhouette" />
      <div className="silhouette grande" />
      <div className="silhouette ligne-silhouette" />
      <div className="silhouette ligne-silhouette" />
    </main>
  )
}

/**
 * Pas de plan : on propose une séance libre (le mode habituel du profil d'abord) et on renvoie vers l'ordinateur.
 * `enAttente` : le plan arrive peut-être du serveur, la synchronisation tourne.
 */
export function SansPlan({ grimpeSouventEnGroupe, enAttente, onLancer }: {
  grimpeSouventEnGroupe: boolean
  enAttente: boolean
  onLancer: (demande: DemandeLancement) => void
}) {
  const adresse = `${window.location.origin}${window.location.pathname}`
  const habituel = grimpeSouventEnGroupe ? 'groupe' : 'solo'
  const autre = grimpeSouventEnGroupe ? 'solo' : 'groupe'
  const sousTitre = (mode: 'solo' | 'groupe') => (mode === 'solo' ? 'Seul : échauffement, puis essais' : 'En groupe : tu notes tes blocs')
  return (
    <>
      <div className="pile">
        <h1 className="titre" id="titre-jour">{enAttente ? 'Ton plan arrive…' : 'Pas encore de plan'}</h1>
        <p className="texte-2" role={enAttente ? 'status' : undefined}>
          {enAttente
            ? 'Ton plan est en cours de réception. En attendant, tu peux faire une séance libre.'
            : 'Prépare ton cycle sur ordinateur. En attendant, fais une séance libre.'}
        </p>
      </div>
      <div className="pile">
        <BoutonMode mode={habituel} principal titre="Faire une séance libre" sousTitre={sousTitre(habituel)} onClick={() => onLancer({ type: 'libre', mode: habituel })} />
        <BoutonMode mode={autre} principal={false} titre={autre === 'solo' ? 'Séance libre, seul' : 'Séance libre, en groupe'} sousTitre={sousTitre(autre)} onClick={() => onLancer({ type: 'libre', mode: autre })} />
      </div>
      <p className="texte-3">Pour créer ton cycle, ouvre <b>{adresse}</b> sur un ordinateur.</p>
    </>
  )
}
