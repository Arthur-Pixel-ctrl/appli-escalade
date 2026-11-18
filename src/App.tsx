import { useEffect, useState } from 'react'
import { enregistrerProfil, enregistrerSeance, lireProfil, type Brouillon } from './donnees/base.ts'
import type { Profil as TypeProfil } from './donnees/profil.ts'
import { salleParId } from './donnees/salles.ts'
import { surMiseAJourDisponible } from './miseAJour.ts'
import { SEANCE_EXEMPLE } from './donnees/seanceExemple.ts'
import { SEANCE_GROUPE_EXEMPLE } from './donnees/seanceGroupeExemple.ts'
import { bilanObjectifs } from './moteur/seanceGroupe.ts'
import { Bienvenue } from './ecrans/Bienvenue.tsx'
import { Compte } from './ecrans/Compte.tsx'
import { Debrief } from './ecrans/Debrief.tsx'
import { Chargement, Erreur } from './ecrans/Erreur.tsx'
import { MisesEnGarde } from './ecrans/MisesEnGarde.tsx'
import { supabase } from './compte/client.ts'
import { useSession } from './compte/session.ts'
import { lireEtat, surDonneesChangees } from './donnees/stockage.ts'
import { demarrerSynchroAutomatique, surCompteLie } from './synchro/automatique.ts'
import { serveurSupabase } from './synchro/serveurSupabase.ts'
import { synchroniser } from './synchro/synchro.ts'
import { Confirmation } from './composants/Confirmation.tsx'
import { Questions } from './ecrans/Questions.tsx'
import { SeanceGroupe } from './ecrans/SeanceGroupe.tsx'
import { SeanceSolo } from './ecrans/SeanceSolo.tsx'
import { MiseEnPageBureau } from './miseEnPage/MiseEnPageBureau.tsx'
import { MiseEnPageTelephone } from './miseEnPage/MiseEnPageTelephone.tsx'
import { ongletPourRubrique, rubriquePourOnglet, type Onglet, type RubriqueBureau } from './miseEnPage/navigation.ts'
import { useEcranLarge } from './miseEnPage/useEcranLarge.ts'

// Ce qui occupe l'écran. Une séance suit toujours le même chemin :
// séance → trois questions → (mises en garde si douleur) → débrief.
type Vue =
  | { nom: 'onglets' }
  | { nom: 'seance_solo' }
  | { nom: 'seance_groupe' }
  | { nom: 'questions'; brouillon: Brouillon }
  | { nom: 'mises_en_garde'; puisDebrief?: string; premierLancement?: boolean }
  | { nom: 'debrief'; seanceId: string }
  | { nom: 'compte' }

// Ordinateur pour organiser, téléphone pour exécuter : les séances se lancent depuis le téléphone.
export default function App() {
  const [onglet, setOnglet] = useState<Onglet>('Aujourd’hui')
  const [rubrique, setRubrique] = useState<RubriqueBureau>('Tableau de bord')
  const large = useEcranLarge()
  // Les deux mises en page partagent l'écran courant : changer de l'une met l'autre à jour,
  // pour qu'un redimensionnement ou une rotation retombe sur le même écran.
  const choisirOnglet = (o: Onglet) => { setOnglet(o); setRubrique(rubriquePourOnglet(o)) }
  const choisirRubrique = (r: RubriqueBureau) => {
    setRubrique(r)
    if (r !== 'Bibliothèque') setOnglet(ongletPourRubrique(r))
  }
  const [vue, setVue] = useState<Vue>({ nom: 'onglets' })
  // undefined = lecture en cours ; null = pas encore de profil (premier lancement)
  const [profil, setProfil] = useState<TypeProfil | null | undefined>(undefined)
  const [erreurDemarrage, setErreurDemarrage] = useState<string | null>(null)
  useEffect(() => {
    lireProfil()
      .then(setProfil)
      .catch((e: unknown) => setErreurDemarrage(e instanceof Error ? `${e.name} : ${e.message}` : String(e)))
  }, [])
  // Des données arrivées d'un autre appareil : on relit seulement le profil (jamais l'écran de séance).
  // Si rien n'a changé, on garde le même objet : aucun nouvel affichage.
  useEffect(() => surDonneesChangees(() => {
    lireProfil()
      .then((p) => { if (p) setProfil((avant) => (JSON.stringify(avant) === JSON.stringify(p) ? avant : p)) })
      .catch(() => {})
  }), [])
  // Synchronisation automatique : seulement si connecté ET appareil lié à ce compte (la reprise passe d'abord).
  const session = useSession()
  const [versionLien, setVersionLien] = useState(0)
  useEffect(() => surCompteLie(() => setVersionLien((v) => v + 1)), [])
  useEffect(() => {
    const userId = session.userId
    if (!supabase || !userId) return
    let annule = false
    let arreter: (() => void) | undefined
    lireEtat<string | null>('compteId').then((compteId) => {
      if (annule || compteId !== userId) return
      arreter = demarrerSynchroAutomatique(() => synchroniser(serveurSupabase(supabase!), userId))
    }).catch(() => {})
    return () => { annule = true; arreter?.() }
  }, [session.userId, versionLien])
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

  if (vue.nom === 'compte') {
    return <div className="app"><Compte onRetour={accueil} /></div>
  }

  if (vue.nom === 'debrief') {
    return <div className="app"><Debrief seanceId={vue.seanceId} salle={salle} onFermer={accueil} /></div>
  }

  const actions = {
    profil, majPrete,
    onOuvrirSeance: (seanceId: string) => setVue({ nom: 'debrief', seanceId }),
    onEnregistrerProfil: async (p: TypeProfil) => { await enregistrerProfil(p); setProfil(p) },
    onMisesEnGarde: () => setVue({ nom: 'mises_en_garde' }),
    onCompte: () => setVue({ nom: 'compte' }),
    onDonneesImportees: () => void lireProfil().then((p) => p && setProfil(p)).catch(() => {}),
  }

  if (large) {
    return <MiseEnPageBureau {...actions} rubrique={rubrique} onChoisirRubrique={choisirRubrique} avecCompte={session.userId !== null} />
  }
  return (
    <MiseEnPageTelephone
      {...actions}
      onglet={onglet}
      onChoisirOnglet={choisirOnglet}
      onSeanceSolo={() => setVue({ nom: 'seance_solo' })}
      onSeanceGroupe={() => setVue({ nom: 'seance_groupe' })}
    />
  )
}
