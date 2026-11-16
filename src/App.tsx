import { useState } from 'react'
import { SEANCE_EXEMPLE } from './donnees/seanceExemple.ts'
import { Aujourdhui } from './ecrans/Aujourdhui.tsx'
import { EnConstruction } from './ecrans/EnConstruction.tsx'
import { SeanceSolo, type StatutEtape } from './ecrans/SeanceSolo.tsx'

// Les quatre onglets de la barre du bas.
const ONGLETS = ['Aujourd’hui', 'Programme', 'Bilans', 'Profil'] as const
type Onglet = (typeof ONGLETS)[number]

// Ce qui occupe l'écran : les onglets, une séance en cours, ou son résumé.
type Vue =
  | { nom: 'onglets' }
  | { nom: 'seance_solo' }
  | { nom: 'fin'; faites: number; total: number; dureeMin: number }

export default function App() {
  const [onglet, setOnglet] = useState<Onglet>('Aujourd’hui')
  const [vue, setVue] = useState<Vue>({ nom: 'onglets' })

  // Pendant une séance, tout l'écran lui est réservé : pas de barre d'onglets.
  if (vue.nom === 'seance_solo') {
    return (
      <div className="app">
        <SeanceSolo
          seance={SEANCE_EXEMPLE}
          onQuitter={() => {
            if (window.confirm('Quitter la séance ? Ce qui a été fait ne sera pas gardé.')) setVue({ nom: 'onglets' })
          }}
          onTerminer={(statuts: StatutEtape[], dureeMin) =>
            setVue({ nom: 'fin', faites: statuts.filter((s) => s === 'faite').length, total: statuts.length, dureeMin })
          }
        />
      </div>
    )
  }

  // Résumé provisoire : les trois questions et le débrief arrivent au lot 3.5.
  if (vue.nom === 'fin') {
    return (
      <div className="app">
        <main className="ecran">
          <div className="pile">
            <p className="surtitre">{SEANCE_EXEMPLE.nom}</p>
            <h1 className="titre">Séance terminée</h1>
            <p className="texte-2 chiffres">{vue.faites} étapes faites sur {vue.total}, en {vue.dureeMin} min.</p>
          </div>
          <button className="bouton principal centre" onClick={() => setVue({ nom: 'onglets' })}><strong>Retour à l’accueil</strong></button>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      {onglet === 'Aujourd’hui'
        ? <Aujourdhui onSeanceSolo={() => setVue({ nom: 'seance_solo' })} />
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
