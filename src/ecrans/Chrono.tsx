import { useEffect, useRef, useState } from 'react'
import type { ConfigChrono } from '../chrono/sequence.ts'
import { useChrono } from '../chrono/useChrono.ts'

interface Props {
  titre: string // "Échelles 3-6-9"
  detail: string // "Semi-arqué 20 mm · poids du corps"
  mot: string // consigne affichée pendant l'effort : "SUSPENDS-TOI", "GRIMPE"
  config: ConfigChrono
  onQuitter: (raison: 'termine' | 'abandon' | 'douleur') => void
}


function duree(s: number) {
  return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')}` : `${s} s`
}

// Durée dite à voix haute pour le lecteur d'écran : « 7 secondes », « 2 minutes ».
function dureeParlee(s: number) {
  const minutes = Math.floor(s / 60)
  const reste = s % 60
  const mots = (n: number, unite: string) => `${n} ${unite}${n > 1 ? 's' : ''}`
  if (minutes === 0) return mots(reste, 'seconde')
  return reste === 0 ? mots(minutes, 'minute') : `${mots(minutes, 'minute')} ${mots(reste, 'seconde')}`
}

// Big Shoulders n'a pas de chiffres de même largeur : chaque chiffre a sa case pour que le nombre ne bouge pas.
function decouperChiffres(texte: string) {
  return [...texte].map((caractere, i) =>
    caractere === ':'
      ? <span key={i} className="dp">:</span>
      : <span key={i} className="c">{caractere}</span>,
  )
}

// Écran de chrono plein écran : un fond par phase (préparation sur encre, effort sur craie, repos sur résine).
export function Chrono({ titre, detail, mot, config, onQuitter }: Props) {
  const CONSIGNE = { preparation: 'Prêt', effort: mot, repos: 'Repos' }
  const chrono = useChrono(config)
  const { etat, marche } = chrono
  const phase = etat.phase
  const typePhase = phase?.type
  const dureePhase = phase?.dureeS ?? 0
  const enAction = marche === 'en_cours' || marche === 'en_pause'

  // La barre du haut du téléphone prend la couleur du fond de la phase, lue dans le CSS (pas de couleur en dur).
  useEffect(() => {
    const variable = enAction && typePhase ? `--chrono-${typePhase}-fond` : '--fond'
    const couleur = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', couleur)
  }, [enAction, typePhase])
  useEffect(() => () => {
    const fond = getComputedStyle(document.documentElement).getPropertyValue('--fond').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', fond)
  }, [])

  // Annonce pour lecteur d'écran : seulement quand le type de phase change (pas à chaque seconde).
  const [annonce, setAnnonce] = useState('')
  const dureePhaseRef = useRef(dureePhase)
  useEffect(() => { dureePhaseRef.current = dureePhase }, [dureePhase])
  useEffect(() => {
    if (!typePhase || !enAction) return
    setAnnonce(typePhase === 'preparation'
      ? 'Préparation'
      : `${typePhase === 'effort' ? 'Effort' : 'Repos'}, ${dureeParlee(dureePhaseRef.current)}`)
  }, [typePhase, enAction])

  if (marche === 'pret') {
    return (
      <main className="chrono">
        <div className="pile">
          <p className="surtitre">{detail}</p>
          <h1 className="titre">{titre}</h1>
        </div>
        <div className="pile bas">
          <button className="bouton principal centre" onClick={chrono.demarrer}><strong>Démarrer</strong></button>
          <button className="bouton-texte" onClick={() => onQuitter('abandon')}>Retour</button>
        </div>
      </main>
    )
  }

  if (marche === 'termine' || !phase) {
    return (
      <main className="chrono">
        <div className="pile">
          <p className="surtitre">{titre}</p>
          <h1 className="titre">Terminé</h1>
          <p className="texte-2">Toutes les séries sont faites.</p>
        </div>
        <div className="pile bas">
          <button className="bouton principal centre" onClick={() => onQuitter('termine')}><strong>Continuer</strong></button>
        </div>
      </main>
    )
  }

  // Au-delà d'une minute on affiche « 9:56 » : le texte est plus long, donc écrit plus petit.
  const texteReste = etat.resteS >= 60 ? `${Math.floor(etat.resteS / 60)}:${String(etat.resteS % 60).padStart(2, '0')}` : String(etat.resteS)
  const taille = texteReste.length >= 6 ? 'extra-long' : texteReste.length >= 5 ? 'tres-long' : texteReste.length >= 3 ? 'long' : ''
  const enPause = marche === 'en_pause'
  return (
    <main className={`chrono ${phase.type}${enPause ? ' en-pause' : ''}`}>
      {enPause && <div className="chrono-rubalise" aria-hidden="true" />}
      <p className="pour-lecteur" aria-live="assertive">{annonce}</p>

      <div className="chrono-tete">
        <span>{titre}</span>
        <span>Série {phase.serie} sur {phase.totalSeries}</span>
      </div>
      {/* Une case par série : pleine si la série est faite. */}
      <div className="chrono-jauge" aria-hidden="true">
        {Array.from({ length: phase.totalSeries }, (_, i) => <span key={i} className={i < phase.serie - 1 ? 'fait' : ''} />)}
      </div>

      <div className="chrono-centre" aria-live="off">
        <p className={enPause ? 'chrono-pause-mot' : 'chrono-consigne'}>{enPause ? 'En pause' : CONSIGNE[phase.type]}</p>
        <p className={`chrono-nombre ${taille}`}>{decouperChiffres(texteReste)}</p>
        <p className="chrono-sous">
          {enPause
            ? 'Reprends quand tu es prêt'
            : phase.totalRepetitions > 1 ? `Répétition ${phase.repetition} sur ${phase.totalRepetitions}` : detail}
        </p>
      </div>

      {!enPause && (
        <p className="chrono-suite">
          {etat.suivante
            ? `Ensuite : ${etat.suivante.type === 'effort' ? 'effort' : 'repos'} de ${duree(etat.suivante.dureeS)}`
            : 'Dernier effort'}
        </p>
      )}

      <div className="chrono-actions">
        {enPause
          ? <button className="bouton-chrono" onClick={chrono.reprendre}>Reprendre</button>
          : <button className="bouton-chrono" onClick={chrono.pause}>Pause</button>}
        <button className="bouton arret centre" onClick={() => onQuitter('douleur')}>Stop, ça fait mal</button>
      </div>
      {enPause && (
        <button className="bouton-texte" onClick={() => onQuitter('abandon')}>Quitter l’exercice</button>
      )}
    </main>
  )
}
