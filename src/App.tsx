import { useState } from 'react'
import { MROC } from './donnees/salles.ts'
import { SEANCE_EXEMPLE } from './donnees/seanceExemple.ts'
import { SEANCE_GROUPE_EXEMPLE } from './donnees/seanceGroupeExemple.ts'
import { Aujourdhui } from './ecrans/Aujourdhui.tsx'
import { EnConstruction } from './ecrans/EnConstruction.tsx'
import { MisesEnGarde } from './ecrans/MisesEnGarde.tsx'
import { SeanceGroupe } from './ecrans/SeanceGroupe.tsx'
import { SeanceSolo, type StatutEtape } from './ecrans/SeanceSolo.tsx'

// Les quatre onglets de la barre du bas.
const ONGLETS = ['Aujourd’hui', 'Programme', 'Bilans', 'Profil'] as const
type Onglet = (typeof ONGLETS)[number]

// Ce qui occupe l'écran : les onglets, une séance en cours, ou son résumé.
type Vue =
  | { nom: 'onglets' }
  | { nom: 'seance_solo' }
  | { nom: 'mises_en_garde' }
  | { nom: 'seance_groupe' }
  | { nom: 'fin'; resume: string }

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
            setVue({ nom: 'fin', resume: `${statuts.filter((s) => s === 'faite').length} étapes faites sur ${statuts.length}, en ${dureeMin} min.` })
          }
        />
      </div>
    )
  }

  if (vue.nom === 'seance_groupe') {
    return (
      <div className="app">
        <SeanceGroupe
          seance={SEANCE_GROUPE_EXEMPLE}
          salle={MROC}
          onQuitter={() => {
            if (window.confirm('Quitter la séance ? Ce qui a été noté ne sera pas gardé.')) setVue({ nom: 'onglets' })
          }}
          onTerminer={(blocs, dureeMin) => {
            const enchaines = blocs.filter((b) => b.resultat !== 'non_enchaine').length
            const essais = blocs.reduce((total, b) => total + b.essais, 0)
            setVue({ nom: 'fin', resume: `${enchaines} blocs enchaînés sur ${blocs.length}, ${essais} essais, en ${dureeMin} min.` })
          }}
        />
      </div>
    )
  }

  if (vue.nom === 'mises_en_garde') {
    return <div className="app"><MisesEnGarde onFermer={() => setVue({ nom: 'onglets' })} /></div>
  }

  // Résumé provisoire : les trois questions et le débrief arrivent au lot 3.5.
  if (vue.nom === 'fin') {
    return (
      <div className="app">
        <main className="ecran">
          <div className="pile">
            <p className="surtitre">{SEANCE_EXEMPLE.nom}</p>
            <h1 className="titre">Séance terminée</h1>
            <p className="texte-2 chiffres">{vue.resume}</p>
          </div>
          <button className="bouton principal centre" onClick={() => setVue({ nom: 'onglets' })}><strong>Retour à l’accueil</strong></button>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      {onglet === 'Aujourd’hui'
        ? <Aujourdhui onSeanceSolo={() => setVue({ nom: 'seance_solo' })} onSeanceGroupe={() => setVue({ nom: 'seance_groupe' })} />
        : <EnConstruction titre={onglet} onMisesEnGarde={onglet === 'Profil' ? () => setVue({ nom: 'mises_en_garde' }) : undefined} />}
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
