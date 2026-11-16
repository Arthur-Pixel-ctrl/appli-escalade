import { useState } from 'react'
import { Aujourdhui } from './ecrans/Aujourdhui.tsx'
import { EnConstruction } from './ecrans/EnConstruction.tsx'

// Les quatre onglets de la barre du bas.
const ONGLETS = ['Aujourd’hui', 'Programme', 'Bilans', 'Profil'] as const
type Onglet = (typeof ONGLETS)[number]

export default function App() {
  const [onglet, setOnglet] = useState<Onglet>('Aujourd’hui')

  return (
    <div className="app">
      {onglet === 'Aujourd’hui' ? <Aujourdhui /> : <EnConstruction titre={onglet} />}
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
