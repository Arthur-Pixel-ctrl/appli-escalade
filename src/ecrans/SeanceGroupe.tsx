import { useEffect, useState } from 'react'
import { useRepos } from '../chrono/useRepos.ts'
import { Avertissement } from '../composants/Avertissement.tsx'
import { PastillePrise } from '../composants/PastillePrise.tsx'
import type { Salle } from '../donnees/salles.ts'
import {
  annulerDernierBloc, avancement, changerObjectif as changerObjectifMoteur, demarrerSeanceGroupe, noterBloc,
} from '../moteur/seanceGroupe.ts'
import { minutesEcoulees } from '../moteur/seanceSolo.ts'
import type { BlocGrimpe, SeanceGroupe as Seance } from '../moteur/types.ts'

interface Props {
  seance: Seance
  salle: Salle
  onTerminer: (blocs: BlocGrimpe[], dureeMin: number) => void
  onQuitter: () => void
}

// Séance en groupe : un objectif à la fois, et la saisie d'un bloc en trois gestes
// (couleur, essais, résultat). On peut noter au fil de l'eau ou tout à la fin.
export function SeanceGroupe({ seance, salle, onTerminer, onQuitter }: Props) {
  const [etat, setEtat] = useState(() => demarrerSeanceGroupe(Date.now()))
  const { blocs, position } = etat // position = objectif affiché
  const [couleur, setCouleur] = useState(seance.objectifs[0].couleurConseillee ?? salle.couleurs[0].nom)
  const [essais, setEssais] = useState(1)
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const repos = useRepos(seance.reposConseilleS)

  useEffect(() => {
    const minuteur = setInterval(() => setMaintenant(Date.now()), 30000)
    return () => clearInterval(minuteur)
  }, [])
  const minutes = minutesEcoulees(etat, maintenant)

  const objectif = seance.objectifs[position]
  const fait = avancement(objectif, position, blocs)

  const changerObjectif = (p: number) => {
    setEtat((avant) => changerObjectifMoteur(avant, p))
    setCouleur(seance.objectifs[p].couleurConseillee ?? couleur)
    setEssais(1)
  }
  const noter = (enchaine: boolean) => {
    setEtat((avant) => noterBloc(avant, couleur, essais, enchaine))
    setEssais(1)
  }

  return (
    <main className="ecran serre">
      <div className="entete">
        <button className="bouton-discret" onClick={onQuitter}>Quitter</button>
        <span className="surtitre chiffres">{minutes} min · {blocs.length} {blocs.length > 1 ? 'blocs notés' : 'bloc noté'}</span>
      </div>

      <div className="pile">
        <p className="surtitre">Objectif {position + 1} sur {seance.objectifs.length}</p>
        <h1 className="titre moyen">{objectif.libelle}</h1>
        {/* Borne de sécurité : on la rappelle sans jamais empêcher d'ajouter un essai. */}
        {objectif.essaisMaxParBloc !== undefined && (
          <p className="mention">{objectif.essaisMaxParBloc} {objectif.essaisMaxParBloc > 1 ? 'ESSAIS MAX' : 'ESSAI MAX'} PAR BLOC</p>
        )}
        <div className="jauge" role="img" aria-label={`${Math.min(fait, objectif.cible)} sur ${objectif.cible}`}>
          {Array.from({ length: objectif.cible }, (_, i) => <span key={i} className={i < fait ? 'actif' : ''} />)}
        </div>
      </div>

      <section className="fiche pile-large" aria-labelledby="titre-noter">
        <span className="vis g" aria-hidden="true" /><span className="vis d" aria-hidden="true" />
        <h2 className="sous-titre titre-fiche" id="titre-noter">Noter un bloc</h2>

        <div className="couleurs" role="group" aria-label="Couleur du bloc">
          {salle.couleurs.map((c) => (
            <button key={c.nom} className="choix-couleur" aria-pressed={c.nom === couleur} onClick={() => setCouleur(c.nom)}>
              <PastillePrise couleur={c.hex} nom={c.nom} />{c.nom}
            </button>
          ))}
        </div>

        <div className="entete">
          <p className="libelle">Essais</p>
          <div className="compteur">
            <button aria-label="Un essai de moins" disabled={essais <= 1} onClick={() => setEssais((n) => Math.max(1, n - 1))}>−</button>
            <p className="chiffres" aria-live="polite">{essais}</p>
            <button aria-label="Un essai de plus" onClick={() => setEssais((n) => n + 1)}>+</button>
          </div>
        </div>

        {objectif.essaisMaxParBloc !== undefined && essais > objectif.essaisMaxParBloc && (
          <Avertissement niveau="avertissement" titre={`Plus de ${objectif.essaisMaxParBloc} essais`}>
            Au-delà, la fatigue des doigts augmente le risque de blessure. Passe au bloc suivant si tu peux.
          </Avertissement>
        )}

        {/* Côte à côte : le second à gauche, le principal à droite, plus facile d'une main. */}
        <div className="deux-boutons egaux">
          <button className="bouton-second" onClick={() => noter(false)}>Pas encore</button>
          <button className="bouton principal centre" onClick={() => noter(true)}><strong>{essais === 1 ? 'Flashé' : 'Enchaîné'}</strong></button>
        </div>
      </section>

      <div>
        <button className="ligne" onClick={repos.enCours ? repos.arreter : repos.lancer}>
          <span>{repos.enCours ? 'Repos en cours, toucher pour arrêter' : 'Lancer un repos'}</span>
          <span className="chiffres">{repos.texte}</span>
        </button>
        {seance.objectifs.map((o, p) => p !== position && (
          <button key={o.libelle} className="ligne" onClick={() => changerObjectif(p)}>
            <span>Objectif {p + 1} : {o.libelle}</span>
            <span className="chiffres">{Math.min(avancement(o, p, blocs), o.cible)} sur {o.cible}</span>
          </button>
        ))}
        {blocs.length > 0 && (
          <button className="ligne" onClick={() => setEtat(annulerDernierBloc)}>
            <span>Annuler le dernier bloc</span>
            <span>{blocs[blocs.length - 1].couleur}, {blocs[blocs.length - 1].essais} {blocs[blocs.length - 1].essais > 1 ? 'essais' : 'essai'}</span>
          </button>
        )}
      </div>

      <button className="bouton-texte bas" onClick={() => onTerminer(blocs, minutes)}>Terminer la séance</button>
    </main>
  )
}
