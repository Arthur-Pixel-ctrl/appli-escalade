import { useState } from 'react'
import type { ConfigChrono } from './chrono/sequence.ts'
import { Aujourdhui } from './ecrans/Aujourdhui.tsx'
import { Chrono } from './ecrans/Chrono.tsx'
import { EnConstruction } from './ecrans/EnConstruction.tsx'

// Les quatre onglets de la barre du bas.
const ONGLETS = ['Aujourd’hui', 'Programme', 'Bilans', 'Profil'] as const
type Onglet = (typeof ONGLETS)[number]

// Chrono d'essai, en attendant la séance guidée (lot 3.3).
// Créneau de 45 s et repos de 2 min : valeurs à recontrôler dans la source avant de figer la bibliothèque.
const ESSAI_ECHELLES: ConfigChrono = { gabarit: 'echelle', dureesS: [3, 6, 9], creneauS: 45, series: 3, reposSeriesS: 120 }
const SIGNAUX_ARRET = [
  'Douleur à la base d’un doigt',
  'Sensation de claquement',
  'Épaules qui ne restent plus engagées',
  'Glissade non contrôlée',
]

export default function App() {
  const [onglet, setOnglet] = useState<Onglet>('Aujourd’hui')
  const [chronoOuvert, setChronoOuvert] = useState(false)

  // Pendant un chrono, tout l'écran lui est réservé : pas de barre d'onglets.
  if (chronoOuvert) {
    return (
      <div className="app">
        <Chrono
          titre="Échelles 3-6-9"
          detail="Semi-arqué 20 mm · poids du corps"
          config={ESSAI_ECHELLES}
          signauxArret={SIGNAUX_ARRET}
          onQuitter={() => setChronoOuvert(false)}
        />
      </div>
    )
  }

  return (
    <div className="app">
      {onglet === 'Aujourd’hui'
        ? <Aujourdhui onEssayerChrono={() => setChronoOuvert(true)} />
        : <EnConstruction titre={onglet} />}
      <nav className="onglets" aria-label="Navigation principale">
        {ONGLETS.map((nom) => (
          <button
            key={nom}
            className="onglet"
            aria-current={nom === onglet ? 'page' : undefined}
            onClick={() => setOnglet(nom)}
          >
            {nom}
          </button>
        ))}
      </nav>
    </div>
  )
}
