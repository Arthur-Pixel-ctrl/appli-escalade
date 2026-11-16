import { useEffect } from 'react'
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

// Écran de chrono plein écran : fond accent pendant l'effort, sombre le reste du temps.
export function Chrono({ titre, detail, mot, config, onQuitter }: Props) {
  const CONSIGNE = { preparation: 'PRÊT', effort: mot, repos: 'REPOS' }
  const chrono = useChrono(config)
  const { etat, marche } = chrono
  const phase = etat.phase
  const enEffort = phase?.type === 'effort' && marche === 'en_cours'

  // La barre du haut du téléphone prend la couleur de l'écran (jaune pendant l'effort).
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', enEffort ? '#E9F55B' : '#0C0D0E')
    return () => meta?.setAttribute('content', '#0C0D0E')
  }, [enEffort])

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
  const taille = texteReste.length >= 5 ? 'tres-long' : texteReste.length >= 3 ? 'long' : ''
  return (
    <main className={enEffort ? 'chrono effort' : 'chrono'}>
      <div className="chrono-tete">
        <span>{titre}</span>
        <span className="chiffres">Série {phase.serie} sur {phase.totalSeries}</span>
      </div>

      <div className="chrono-centre" aria-live="off">
        <p className="chrono-consigne">{marche === 'en_pause' ? 'EN PAUSE' : CONSIGNE[phase.type]}</p>
        <p className={`chrono-nombre chiffres ${taille}`}>{texteReste}</p>
        <p className="chrono-sous">
          {phase.totalRepetitions > 1 ? `Répétition ${phase.repetition} sur ${phase.totalRepetitions}` : detail}
        </p>
      </div>

      <p className="chrono-suite">
        {etat.suivante
          ? `Ensuite : ${etat.suivante.type === 'effort' ? 'effort' : 'repos'} de ${duree(etat.suivante.dureeS)}`
          : 'Dernier effort'}
      </p>

      <div className="chrono-actions">
        {marche === 'en_cours'
          ? <button className="bouton-chrono large" onClick={chrono.pause}>Pause</button>
          : <button className="bouton-chrono large" onClick={chrono.reprendre}>Reprendre</button>}
        <button className="bouton-chrono contour" onClick={() => onQuitter('douleur')}>Stop,<br />ça fait mal</button>
      </div>
      {marche === 'en_pause' && (
        <button className="bouton-texte" onClick={() => onQuitter('abandon')}>Quitter l’exercice</button>
      )}
    </main>
  )
}
