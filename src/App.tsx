import { useEffect, useState } from 'react'
import { enregistrerProfil, enregistrerSeance, lireProfil, type Brouillon } from './donnees/base.ts'
import type { Profil as TypeProfil } from './donnees/profil.ts'
import { salleParId } from './donnees/salles.ts'
import { appliquerMiseAJour, surMiseAJourDisponible } from './miseAJour.ts'
import { SEANCE_EXEMPLE } from './donnees/seanceExemple.ts'
import { SEANCE_GROUPE_EXEMPLE } from './donnees/seanceGroupeExemple.ts'
import { bilanObjectifs } from './moteur/seanceGroupe.ts'
import { Aujourdhui } from './ecrans/Aujourdhui.tsx'
import { Bienvenue } from './ecrans/Bienvenue.tsx'
import { Debrief } from './ecrans/Debrief.tsx'
import { EnConstruction } from './ecrans/EnConstruction.tsx'
import { Chargement, Erreur } from './ecrans/Erreur.tsx'
import { Historique } from './ecrans/Historique.tsx'
import { MisesEnGarde } from './ecrans/MisesEnGarde.tsx'
import { Profil } from './ecrans/Profil.tsx'
import { Icone } from './composants/Icone.tsx'
import { Confirmation } from './composants/Confirmation.tsx'
import { Questions } from './ecrans/Questions.tsx'
import { SeanceGroupe } from './ecrans/SeanceGroupe.tsx'
import { SeanceSolo } from './ecrans/SeanceSolo.tsx'

// Les quatre onglets de la barre du bas.
const ONGLETS = [
  { nom: 'Aujourd’hui', icone: 'aujourdhui' },
  { nom: 'Programme', icone: 'programme' },
  { nom: 'Bilans', icone: 'bilans' },
  { nom: 'Profil', icone: 'profil' },
] as const
type Onglet = (typeof ONGLETS)[number]['nom']

// Ce qui occupe l'écran. Une séance suit toujours le même chemin :
// séance → trois questions → (mises en garde si douleur) → débrief.
type Vue =
  | { nom: 'onglets' }
  | { nom: 'seance_solo' }
  | { nom: 'seance_groupe' }
  | { nom: 'questions'; brouillon: Brouillon }
  | { nom: 'mises_en_garde'; puisDebrief?: string; premierLancement?: boolean }
  | { nom: 'debrief'; seanceId: string }

export default function App() {
  const [onglet, setOnglet] = useState<Onglet>('Aujourd’hui')
  const [vue, setVue] = useState<Vue>({ nom: 'onglets' })
  // undefined = lecture en cours ; null = pas encore de profil (premier lancement)
  const [profil, setProfil] = useState<TypeProfil | null | undefined>(undefined)
  const [erreurDemarrage, setErreurDemarrage] = useState<string | null>(null)
  useEffect(() => {
    lireProfil()
      .then(setProfil)
      .catch((e: unknown) => setErreurDemarrage(e instanceof Error ? `${e.name} : ${e.message}` : String(e)))
  }, [])
  const [majPrete, setMajPrete] = useState(false)
  useEffect(() => surMiseAJourDisponible(() => setMajPrete(true)), [])
  // Erreur d'enregistrement, affichée dans l'écran Questions (les réponses restent gardées).
  const [erreurEnregistrement, setErreurEnregistrement] = useState<string | undefined>(undefined)
  const accueil = () => { setErreurEnregistrement(undefined); setVue({ nom: 'onglets' }) }
  // Quitter une séance demande confirmation ; la séance reste affichée (donc intacte) derrière la fenêtre.
  const [confirmeQuitter, setConfirmeQuitter] = useState(false)
  const quitter = () => setConfirmeQuitter(true)
  const fenetreQuitter = (
    <Confirmation
      ouverte={confirmeQuitter}
      titre="Quitter la séance ?"
      texte="Elle ne sera pas enregistrée."
      libelleAction="Quitter la séance"
      danger
      onRester={() => setConfirmeQuitter(false)}
      onAction={() => { setConfirmeQuitter(false); accueil() }}
    />
  )

  if (erreurDemarrage) return <Erreur message={erreurDemarrage} />
  if (profil === undefined) return <Chargement />

  // Premier lancement : le profil, puis les mises en garde, une seule fois.
  if (profil === null) {
    return (
      <div className="app">
        <Bienvenue
          onValider={async (p) => {
            await enregistrerProfil(p)
            setProfil(p)
            setVue({ nom: 'mises_en_garde', premierLancement: true })
          }}
        />
      </div>
    )
  }
  const salle = salleParId(profil.salleHabituelleId)

  // Pendant une séance, tout l'écran lui est réservé : pas de barre d'onglets.
  if (vue.nom === 'seance_solo') {
    return (
      <div className="app">
        <SeanceSolo
          seance={SEANCE_EXEMPLE}
          onQuitter={quitter}
          onTerminer={(statuts, dureeMin) =>
            setVue({
              nom: 'questions',
              brouillon: {
                mode: 'solo', nom: SEANCE_EXEMPLE.nom, durete: 'dure', dureeMin,
                etapes: SEANCE_EXEMPLE.etapes.map((e, i) => ({ titre: e.titre, statut: statuts[i] })),
                objectifs: [], blocs: [],
              },
            })
          }
        />
        {fenetreQuitter}
      </div>
    )
  }

  if (vue.nom === 'seance_groupe') {
    return (
      <div className="app">
        <SeanceGroupe
          seance={SEANCE_GROUPE_EXEMPLE}
          salle={salle}
          onQuitter={quitter}
          onTerminer={(blocs, dureeMin) =>
            setVue({
              nom: 'questions',
              brouillon: {
                mode: 'groupe', nom: SEANCE_GROUPE_EXEMPLE.nom, durete: 'dure', dureeMin,
                etapes: [], blocs,
                objectifs: bilanObjectifs(SEANCE_GROUPE_EXEMPLE, blocs),
              },
            })
          }
        />
        {fenetreQuitter}
      </div>
    )
  }

  if (vue.nom === 'questions') {
    const { brouillon } = vue
    return (
      <div className="app">
        <Questions
          contexte={`${brouillon.nom} · ${brouillon.mode === 'groupe' ? 'en groupe' : 'seul'}`}
          erreur={erreurEnregistrement}
          onValider={async (reponses) => {
            let seanceId: string
            try {
              seanceId = await enregistrerSeance(brouillon, reponses)
            } catch {
              setErreurEnregistrement('La séance n’a pas pu être enregistrée. Tes réponses sont gardées : réessaie.')
              return
            }
            setErreurEnregistrement(undefined)
            // En cas de douleur, on montre d'abord les repères, puis le débrief.
            setVue(reponses.douleur ? { nom: 'mises_en_garde', puisDebrief: seanceId } : { nom: 'debrief', seanceId })
          }}
        />
      </div>
    )
  }

  if (vue.nom === 'mises_en_garde') {
    const { puisDebrief, premierLancement } = vue
    return (
      <div className="app">
        <MisesEnGarde
          libelleFermer={puisDebrief ? 'Voir le débrief' : premierLancement ? 'J’ai compris' : 'Fermer'}
          onFermer={() => (puisDebrief ? setVue({ nom: 'debrief', seanceId: puisDebrief }) : accueil())}
        />
      </div>
    )
  }

  if (vue.nom === 'debrief') {
    return <div className="app"><Debrief seanceId={vue.seanceId} salle={salle} onFermer={accueil} /></div>
  }

  return (
    <div className="app">
      {/* Proposée seulement ici, jamais pendant une séance, pour ne rien faire perdre. */}
      {majPrete && (
        <button className="bandeau" onClick={appliquerMiseAJour}>Nouvelle version disponible · <b>Mettre à jour</b></button>
      )}
      {onglet === 'Aujourd’hui' && (
        <Aujourdhui grimpeSouventEnGroupe={profil.grimpeSouventEnGroupe} onSeanceSolo={() => setVue({ nom: 'seance_solo' })} onSeanceGroupe={() => setVue({ nom: 'seance_groupe' })} />
      )}
      {onglet === 'Bilans' && <Historique onOuvrir={(seanceId) => setVue({ nom: 'debrief', seanceId })} />}
      {onglet === 'Programme' && <EnConstruction titre="Programme" />}
      {onglet === 'Profil' && (
        <Profil
          profil={profil}
          onEnregistrer={async (p) => { await enregistrerProfil(p); setProfil(p) }}
          onMisesEnGarde={() => setVue({ nom: 'mises_en_garde' })}
          onDonneesImportees={() => void lireProfil().then((p) => p && setProfil(p)).catch(() => {})}
        />
      )}
      <nav className="onglets" aria-label="Navigation principale">
        {ONGLETS.map(({ nom, icone }) => (
          <button key={nom} className="onglet" aria-current={nom === onglet ? 'page' : undefined} onClick={() => setOnglet(nom)}>
            <Icone nom={icone} />
            {nom}
          </button>
        ))}
      </nav>
    </div>
  )
}
