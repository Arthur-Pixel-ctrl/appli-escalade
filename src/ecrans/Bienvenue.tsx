import { useRef, useState } from 'react'
import { comptesDisponibles } from '../compte/client.ts'
import { useEnLigne } from '../compte/useEnLigne.ts'
import { importerDonnees, lireProfil } from '../donnees/base.ts'
import { PROFIL_VIDE, type Profil } from '../donnees/profil.ts'
import { ProfilFormulaire } from './ProfilFormulaire.tsx'

interface Props {
  onValider: (p: Profil) => void
  /** Une sauvegarde rechargée contenait un profil : l'app passe à la suite sans formulaire. */
  onProfilRetrouve: (p: Profil) => void
  onCompte: () => void
}

// Premier lancement. Avec les comptes : accueil (connexion ou « Continuer sans compte »), puis le profil.
// Sans comptes : directement le profil, sans aucune mention de compte.
export function Bienvenue({ onValider, onProfilRetrouve, onCompte }: Props) {
  const [etape, setEtape] = useState<'accueil' | 'formulaire'>(comptesDisponibles ? 'accueil' : 'formulaire')
  const enLigne = useEnLigne()
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState(false)
  const fichier = useRef<HTMLInputElement>(null)

  // On recharge la sauvegarde AVANT de créer un profil : sinon le nouveau profil, plus récent, ferait ignorer celui du fichier.
  const recharger = async (f: File | undefined) => {
    if (!f) return
    try {
      const { seances, autres } = await importerDonnees(await f.text())
      const resume = `Sauvegarde rechargée : ${seances} séance${seances > 1 ? 's' : ''} et ${autres} autre${autres > 1 ? 's' : ''} élément${autres > 1 ? 's' : ''}.`
      const profil = await lireProfil()
      if (profil) { onProfilRetrouve(profil); return }
      setErreur(false)
      setMessage(`${resume} Il n’y a pas de profil dedans : remplis le formulaire.`)
      setEtape('formulaire')
    } catch (e) {
      setErreur(true)
      setMessage(e instanceof Error ? `Import impossible. ${e.message}` : 'Import impossible : fichier illisible.')
    }
  }

  const sauvegarde = (
    <div className="pile">
      <button type="button" className="bouton-texte" onClick={() => fichier.current?.click()}>J’ai une sauvegarde</button>
      <input ref={fichier} type="file" accept="application/json,.json" hidden aria-label="Fichier de sauvegarde"
        onChange={(e) => { void recharger(e.target.files?.[0]); e.target.value = '' }} />
      <p className={erreur ? 'message-erreur' : 'texte-3'} role="status" aria-live="polite">{message}</p>
    </div>
  )

  if (etape === 'accueil') {
    return (
      <main className="ecran">
        <div className="pile">
          <p className="surtitre">Get me to 9a</p>
          <h1 className="titre">Ton carnet d’entraînement</h1>
          <p className="texte-2">
            Tu prépares ton plan sur ordinateur, tu le suis ici, à la salle, même sans réseau. Tes séances restent à toi.
          </p>
        </div>
        <div className="pile bas">
          <button className="bouton principal centre" disabled={!enLigne} aria-describedby={enLigne ? undefined : 'aide-hors-ligne'} onClick={onCompte}>
            <strong>Recevoir mon code de connexion</strong>
          </button>
          {!enLigne && (
            <p id="aide-hors-ligne" className="texte-3">La connexion demande du réseau. Tu peux commencer sans compte et te connecter plus tard.</p>
          )}
          <button className="bouton-texte" onClick={() => setEtape('formulaire')}>Continuer sans compte</button>
          {sauvegarde}
        </div>
      </main>
    )
  }

  return (
    <main className="ecran">
      <div className="pile">
        <p className="surtitre">Get me to 9a</p>
        <p className="texte-2">
          Cette app guide tes séances d’escalade, seul ou en groupe, et garde la trace de ta progression.
          Tes réponses restent sur cet appareil. Tu pourras tout modifier ensuite dans Profil.
        </p>
        {sauvegarde}
      </div>
      <ProfilFormulaire initial={PROFIL_VIDE} titre="Parle-moi de ta grimpe" libelleValider="Continuer" onValider={onValider} />
    </main>
  )
}
