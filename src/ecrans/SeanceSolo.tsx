import { useEffect, useState } from 'react'
import type { Etape, SeanceGuidee } from '../donnees/seanceExemple.ts'
import { garderEcranAllume, preparerSon, signal } from '../chrono/signaux.ts'
import { Chrono } from './Chrono.tsx'

export type StatutEtape = 'a_faire' | 'faite' | 'passee'

interface Props {
  seance: SeanceGuidee
  onTerminer: (statuts: StatutEtape[], dureeMin: number) => void
  onQuitter: () => void
}

function minutesDepuis(debutMs: number) {
  return Math.max(0, Math.round((Date.now() - debutMs) / 60000))
}

// Séance guidée : la liste des étapes, celle en cours ouverte avec son action principale.
export function SeanceSolo({ seance, onTerminer, onQuitter }: Props) {
  const [statuts, setStatuts] = useState<StatutEtape[]>(() => seance.etapes.map(() => 'a_faire'))
  const [debutMs] = useState(() => Date.now())
  const [chronoOuvert, setChronoOuvert] = useState(false)
  const [signauxVisibles, setSignauxVisibles] = useState(false)
  const [, rafraichir] = useState(0)

  // Met à jour la durée affichée une fois par minute.
  useEffect(() => {
    const minuteur = setInterval(() => rafraichir((n) => n + 1), 30000)
    return () => clearInterval(minuteur)
  }, [])

  const enCours = statuts.indexOf('a_faire') // première étape pas encore traitée ; -1 si tout est fait
  const etape: Etape | undefined = seance.etapes[enCours]
  const marquer = (statut: StatutEtape) => {
    setStatuts((avant) => avant.map((s, i) => (i === enCours ? statut : s)))
    setSignauxVisibles(false)
  }
  const terminer = () => onTerminer(statuts, minutesDepuis(debutMs))

  if (chronoOuvert && etape?.forme === 'chrono') {
    return (
      <Chrono
        titre={etape.titre}
        detail={etape.detail}
        mot={etape.mot}
        config={etape.config}
        signauxArret={etape.signauxArret}
        onQuitter={(raison) => {
          setChronoOuvert(false)
          if (raison === 'termine') marquer('faite')
        }}
      />
    )
  }

  return (
    <main className="ecran serre">
      <div className="pile">
        <div className="entete">
          <button className="bouton-discret" onClick={onQuitter}>Quitter</button>
          <span className="surtitre chiffres">
            {minutesDepuis(debutMs)} min · {enCours === -1 ? 'tout est fait' : `étape ${enCours + 1} sur ${seance.etapes.length}`}
          </span>
        </div>
        <h1 className="titre moyen">{seance.nom}</h1>
        <div className="jauge" role="img" aria-label={`${statuts.filter((s) => s !== 'a_faire').length} étapes traitées sur ${statuts.length}`}>
          {statuts.map((s, i) => (
            <span key={i} className={i === enCours ? 'actif' : s !== 'a_faire' ? 'fait' : ''} />
          ))}
        </div>
      </div>

      <ol className="etapes">
        {seance.etapes.map((e, i) =>
          i === enCours ? (
            <li key={e.id} className="etape ouverte">
              <div className="entete">
                <span className="etiquette">{i + 1} · En cours</span>
                {'preuve' in e && <span className="surtitre">{e.preuve}</span>}
              </div>
              <h2>{e.titre}</h2>
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

              {'signauxArret' in e && e.signauxArret.length > 0 && (
                <>
                  <button className="bouton-texte" aria-expanded={signauxVisibles} onClick={() => setSignauxVisibles((v) => !v)}>
                    Quand s’arrêter : {signauxVisibles ? 'masquer' : 'voir les signaux'}
                  </button>
                  {signauxVisibles && <ul className="liste-simple">{e.signauxArret.map((s) => <li key={s}>{s}</li>)}</ul>}
                </>
              )}
            </li>
          ) : (
            <li key={e.id} className={statuts[i] === 'a_faire' ? 'etape' : 'etape traitee'}>
              <span>{i + 1} · {e.titre}</span>
              <span>{statuts[i] === 'faite' ? 'Fait' : statuts[i] === 'passee' ? 'Passée' : e.resume}</span>
            </li>
          ),
        )}
      </ol>

      <div className="deux-boutons bas">
        {enCours !== -1 && <button className="bouton-second" onClick={() => marquer('passee')}>Passer l’étape</button>}
        <button className={enCours === -1 ? 'bouton principal centre' : 'bouton-second'} onClick={terminer}>
          {enCours === -1 ? <strong>Terminer la séance</strong> : 'Terminer la séance'}
        </button>
      </div>
    </main>
  )
}

// Compteur d'essais avec repos conseillé entre deux essais.
function Essais({ reposS }: { reposS: number }) {
  const [essais, setEssais] = useState(0)
  const [finReposMs, setFinReposMs] = useState<number | null>(null)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  useEffect(() => {
    if (finReposMs === null) return
    const relacherEcran = garderEcranAllume()
    const minuteur = setInterval(() => setMaintenant(Date.now()), 250)
    return () => { clearInterval(minuteur); relacherEcran() }
  }, [finReposMs])

  const resteS = finReposMs === null ? 0 : Math.max(0, Math.ceil((finReposMs - maintenant) / 1000))
  useEffect(() => {
    if (finReposMs !== null && resteS === 0) { signal.fin(); setFinReposMs(null) }
  }, [finReposMs, resteS])

  const essaiFait = () => {
    preparerSon()
    setEssais((n) => n + 1)
    setMaintenant(Date.now())
    setFinReposMs(Date.now() + reposS * 1000)
  }

  return (
    <div className="essais">
      <div>
        <p className="surtitre">Essais</p>
        <p className="grand-chiffre chiffres">{essais}</p>
      </div>
      <div>
        <p className="surtitre">{finReposMs === null ? 'Repos conseillé' : 'Repos restant'}</p>
        <p className="grand-chiffre chiffres">
          {finReposMs === null ? `${reposS / 60} min` : `${Math.floor(resteS / 60)}:${String(resteS % 60).padStart(2, '0')}`}
        </p>
      </div>
      <button className="bouton-second" onClick={essaiFait}>Essai fait, lancer le repos</button>
    </div>
  )
}
