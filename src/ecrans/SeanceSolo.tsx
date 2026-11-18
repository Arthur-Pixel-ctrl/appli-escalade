import { useEffect, useState } from 'react'
import {
  bilanEtapes, demarrerSeanceSolo, etapeEnCours, marquerEtape, minutesEcoulees, type StatutEtape,
} from '../moteur/seanceSolo.ts'
import type { EtapeSeance, SeanceGuidee } from '../moteur/types.ts'
import { useRepos } from '../chrono/useRepos.ts'
import { Chrono } from './Chrono.tsx'
import { MisesEnGarde } from './MisesEnGarde.tsx'

export type { StatutEtape }

interface Props {
  seance: SeanceGuidee
  // douleur = true quand la séance se termine après « Stop, ça fait mal ».
  onTerminer: (statuts: StatutEtape[], dureeMin: number, douleur?: boolean) => void
  onQuitter: () => void
}

// Séance guidée : la liste des étapes, celle en cours ouverte avec son action principale.
export function SeanceSolo({ seance, onTerminer, onQuitter }: Props) {
  const [etat, setEtat] = useState(() => demarrerSeanceSolo(seance, Date.now()))
  const [chronoOuvert, setChronoOuvert] = useState(false)
  const [gardeOuverte, setGardeOuverte] = useState(false)
  // L'heure est un état : elle se met à jour toutes les 30 s, donc la durée affichée aussi.
  const [maintenant, setMaintenant] = useState(() => Date.now())
  useEffect(() => {
    const minuteur = setInterval(() => setMaintenant(Date.now()), 30000)
    return () => clearInterval(minuteur)
  }, [])

  const { statuts } = etat
  const enCours = etapeEnCours(etat) // -1 si tout est fait
  const etape: EtapeSeance | undefined = seance.etapes[enCours]
  const minutes = minutesEcoulees(etat, maintenant)
  const marquer = (statut: 'faite' | 'passee') => setEtat((avant) => marquerEtape(avant, statut))
  const terminer = (douleur?: boolean) => onTerminer(bilanEtapes(seance, etat).map((e) => e.statut), minutes, douleur)

  if (chronoOuvert && etape?.forme === 'chrono') {
    return (
      <Chrono
        titre={etape.titre}
        detail={etape.detail}
        mot={etape.mot}
        config={etape.config}
        onQuitter={(raison) => {
          setChronoOuvert(false)
          if (raison === 'termine') marquer('faite')
          if (raison === 'douleur') setGardeOuverte(true)
        }}
      />
    )
  }

  // Les mises en garde passent par-dessus la séance : la liste reste montée mais cachée,
  // donc l'étape en cours et le compteur d'essais sont gardés.
  return (
    <>
    {gardeOuverte && (
      <MisesEnGarde apresDouleur onFermer={() => setGardeOuverte(false)} onTerminer={() => terminer(true)} />
    )}
    <main className="ecran serre" hidden={gardeOuverte}>
      <button className="bouton arret centre stop-seance" onClick={() => setGardeOuverte(true)}>Stop, ça fait mal</button>
      <div className="pile">
        <div className="entete">
          <button className="bouton-discret" onClick={onQuitter}>Quitter</button>
          <span className="surtitre chiffres">
            {minutes} min · {enCours === -1 ? 'tout est fait' : `étape ${enCours + 1} sur ${seance.etapes.length}`}
          </span>
        </div>
        <h1 className="titre moyen">{seance.nom}</h1>
        <div className="jauge" role="img" aria-label={`${statuts.filter((s) => s !== 'a_faire').length} étapes traitées sur ${statuts.length}`}>
          {statuts.map((s, i) => (
            <span key={i} className={i === enCours ? 'actif' : s === 'passee' ? 'passe' : s === 'faite' ? 'fait' : ''} />
          ))}
        </div>
      </div>

      <ol className="etapes">
        {seance.etapes.map((e, i) =>
          i === enCours ? (
            <li key={e.id} className="etape ouverte">
              <div className="entete">
                <span className="etiquette-etape"><span className="repere en-cours">{i + 1}</span><span className="etiquette">En cours</span></span>
                {'preuve' in e && <span className="surtitre">{e.preuve}</span>}
              </div>
              <h2 className="titre moyen">{e.titre}</h2>
              <p className="texte-2">{e.consigne}</p>

              {e.forme === 'liste' && (
                <ul className="liste-simple">{e.elements.map((el) => <li key={el}>{el}</li>)}</ul>
              )}
              {e.forme === 'essais' && <Essais reposS={e.reposS} />}

              {e.forme === 'chrono' ? (
                <button className="bouton principal centre" onClick={() => setChronoOuvert(true)}><strong>Lancer le chrono</strong></button>
              ) : (
                <button className="bouton principal centre" onClick={() => marquer('faite')}><strong>C’est fait</strong></button>
              )}

            </li>
          ) : (
            <li key={e.id} className={statuts[i] === 'a_faire' ? 'etape' : 'etape traitee'}>
              <span className="repere" aria-hidden="true">{i + 1}</span>
              <span className="etape-titre">{e.titre}</span>
              <span className="donnee">{statuts[i] === 'faite' ? 'Fait' : statuts[i] === 'passee' ? 'Passée' : e.resume}</span>
            </li>
          ),
        )}
      </ol>

      <div className="deux-boutons bas">
        {enCours !== -1 && <button className="bouton-second" onClick={() => marquer('passee')}>Passer l’étape</button>}
        <button className={enCours === -1 ? 'bouton principal centre' : 'bouton-second'} onClick={() => terminer()}>
          {enCours === -1 ? <strong>Terminer la séance</strong> : 'Terminer la séance'}
        </button>
      </div>
    </main>
    </>
  )
}

// Compteur d'essais avec repos conseillé entre deux essais.
function Essais({ reposS }: { reposS: number }) {
  const [essais, setEssais] = useState(0)
  const repos = useRepos(reposS)

  return (
    <div className="essais">
      <div>
        <p className="surtitre">Essais</p>
        <p className="grand-chiffre chiffres">{essais}</p>
      </div>
      <div>
        <p className="surtitre">{repos.enCours ? 'Repos restant' : 'Repos conseillé'}</p>
        <p className="grand-chiffre chiffres">{repos.texte}</p>
      </div>
      <button className="bouton-second" onClick={() => { setEssais((n) => n + 1); repos.lancer() }}>Essai fait, lancer le repos</button>
    </div>
  )
}
