import { useEffect, useState } from 'react'
import { Confirmation } from '../composants/Confirmation.tsx'
import { Avertissement } from '../composants/Avertissement.tsx'
import { comptesDisponibles } from '../compte/client.ts'
import { codeValide, emailValide, envoyerCode, nettoyerCode, seDeconnecter, useSession, verifierCode } from '../compte/session.ts'

const DELAI_RENVOI_S = 60

// Vrai tant que le téléphone a du réseau ; suit les changements sans recharger l'écran.
function useEnLigne(): boolean {
  const [enLigne, setEnLigne] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false)
  useEffect(() => {
    const maj = () => setEnLigne(navigator.onLine)
    window.addEventListener('online', maj)
    window.addEventListener('offline', maj)
    return () => { window.removeEventListener('online', maj); window.removeEventListener('offline', maj) }
  }, [])
  return enLigne
}

const PHRASE_CONFIDENTIALITE =
  'Tes données sont gardées sur un serveur en Europe administré par Arthur. Il peut techniquement les voir et s’engage à ne pas les consulter. Elles ne sont ni vendues ni partagées.'

// Écran Compte : se connecter avec un code reçu par e-mail, voir l'adresse, se déconnecter.
// Il ne synchronise rien et ne lie pas les données de l'appareil (autres tâches).
export function Compte({ onRetour }: { onRetour: () => void }) {
  const session = useSession()
  const enLigne = useEnLigne()
  const [email, setEmail] = useState('')
  const [emailTouche, setEmailTouche] = useState(false)
  const [code, setCode] = useState('')
  const [codeEnvoye, setCodeEnvoye] = useState(false)
  const [occupe, setOccupe] = useState(false)
  const [erreur, setErreur] = useState('')
  // Secondes restantes avant de pouvoir redemander un code.
  const [attente, setAttente] = useState(0)
  const [confirmeDeconnexion, setConfirmeDeconnexion] = useState(false)

  useEffect(() => {
    if (attente <= 0) return
    const minuteur = setTimeout(() => setAttente((s) => s - 1), 1000)
    return () => clearTimeout(minuteur)
  }, [attente])

  const retour = <button className="bouton-discret" onClick={onRetour}>Retour</button>
  const confidentialite = <p className="texte-3">{PHRASE_CONFIDENTIALITE}</p>
  const zoneErreur = (
    <div role="status" aria-live="polite">
      {erreur && <p className="message-erreur">{erreur}</p>}
    </div>
  )

  // Sans configuration (version de développement) : on le dit simplement, rien ne casse.
  if (!comptesDisponibles) {
    return (
      <main className="ecran">
        {retour}
        <div className="pile">
          <h1 className="titre moyen">Ton compte</h1>
          <p>Les comptes ne sont pas disponibles sur cette version. L’app marche très bien sans : tout reste sur cet appareil.</p>
        </div>
      </main>
    )
  }

  if (session.chargement) {
    return <main className="ecran">{retour}<p className="texte-3" role="status">Chargement…</p></main>
  }

  if (session.userId) {
    return (
      <main className="ecran">
        {retour}
        <div className="pile">
          <h1 className="titre moyen">Ton compte</h1>
          <p>Connecté avec</p>
          <p className="donnee">{session.email}</p>
        </div>
        {zoneErreur}
        <button className="bouton-second" onClick={() => setConfirmeDeconnexion(true)}>Me déconnecter</button>
        {confidentialite}
        <Confirmation
          ouverte={confirmeDeconnexion}
          titre="Te déconnecter ?"
          texte="Tes données restent sur cet appareil."
          libelleAction="Me déconnecter"
          libelleRester="Rester connecté"
          onRester={() => setConfirmeDeconnexion(false)}
          onAction={async () => {
            setConfirmeDeconnexion(false)
            try { await seDeconnecter(); setErreur('') } catch (e) { setErreur(e instanceof Error ? e.message : String(e)) }
          }}
        />
      </main>
    )
  }

  const demanderCode = async () => {
    setOccupe(true)
    setErreur('')
    try {
      await envoyerCode(email)
      setCodeEnvoye(true)
      setCode('')
      setAttente(DELAI_RENVOI_S)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e))
    } finally {
      setOccupe(false)
    }
  }
  const connecter = async () => {
    setOccupe(true)
    setErreur('')
    try {
      await verifierCode(email, code)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e))
    } finally {
      setOccupe(false)
    }
  }
  const messageHorsLigne = !enLigne && (
    <Avertissement niveau="information" titre="Il faut du réseau pour se connecter." >
      Tu peux continuer à utiliser l’app sans compte.
    </Avertissement>
  )

  if (!codeEnvoye) {
    const adresseFausse = emailTouche && email.trim() !== '' && !emailValide(email)
    return (
      <main className="ecran">
        {retour}
        <form className="pile-large" onSubmit={(e) => { e.preventDefault(); if (emailValide(email) && enLigne && !occupe) void demanderCode() }}>
          <div className="pile">
            <h1 className="titre moyen">Ton compte</h1>
            <p>On t’envoie un code à 6 chiffres. Pas de mot de passe.</p>
            <p className="texte-3">Avec un compte, tes séances et ton plan se retrouvent sur ton téléphone et ton ordinateur. Sans compte, tout reste sur cet appareil.</p>
          </div>
          <label className={`champ${adresseFausse ? ' erreur' : ''}`}>
            Adresse e-mail
            <input
              type="email" autoComplete="email" inputMode="email" value={email}
              aria-invalid={adresseFausse} aria-describedby={adresseFausse ? 'erreur-adresse' : undefined}
              onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouche(true)}
            />
            {adresseFausse && <span id="erreur-adresse" className="message-erreur">Vérifie l’adresse.</span>}
          </label>
          {messageHorsLigne}
          {zoneErreur}
          <button type="submit" className="bouton principal centre" disabled={!emailValide(email) || !enLigne || occupe}>
            <strong>Recevoir mon code de connexion</strong>
          </button>
        </form>
        {confidentialite}
      </main>
    )
  }

  return (
    <main className="ecran">
      {retour}
      <form className="pile-large" onSubmit={(e) => { e.preventDefault(); if (codeValide(nettoyerCode(code)) && enLigne && !occupe) void connecter() }}>
        <div className="pile">
          <h1 className="titre moyen">Regarde ta boîte mail</h1>
          <p className="donnee">{email.trim()}</p>
          <p>Saisis le code reçu. Il est valable 1 h.</p>
          <p className="texte-3">Rien reçu ? Regarde dans les indésirables.</p>
        </div>
        <label className="champ">
          Code
          <input type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} />
        </label>
        {messageHorsLigne}
        {zoneErreur}
        <button type="submit" className="bouton principal centre" disabled={!codeValide(nettoyerCode(code)) || !enLigne || occupe}>
          <strong>Me connecter</strong>
        </button>
        <button type="button" className="bouton-second" disabled={attente > 0 || !enLigne || occupe} onClick={() => void demanderCode()}>
          {attente > 0 ? `Renvoyer le code (${attente} s)` : 'Renvoyer le code'}
        </button>
        <button type="button" className="bouton-texte" onClick={() => { setCodeEnvoye(false); setCode(''); setErreur(''); setAttente(0) }}>Changer d’adresse</button>
      </form>
      {confidentialite}
    </main>
  )
}
