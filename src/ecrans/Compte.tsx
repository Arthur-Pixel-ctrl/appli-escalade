import { useEffect, useState } from 'react'
import { Confirmation } from '../composants/Confirmation.tsx'
import { Avertissement } from '../composants/Avertissement.tsx'
import { comptesDisponibles, supabase } from '../compte/client.ts'
import { jourLocal } from '../donnees/base.ts'
import { lireEtat } from '../donnees/stockage.ts'
import {
  effacerDonneesLocales, lierCompte, profilsACompare, resumerAppareil, sauvegardeComplete, situationReprise,
  type ResumeAppareil,
} from '../synchro/reprise.ts'
import { serveurSupabase } from '../synchro/serveurSupabase.ts'
import { compterEnAttente } from '../synchro/synchro.ts'
import { RepriseAutreCompte, RepriseChoixProfil, RepriseFin, ReprisePremierLien, type InfosProfil } from './Reprise.tsx'
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

const MESSAGE_ECHEC_REPRISE = 'La reprise s’est arrêtée. Rien n’est perdu : réessaie quand le réseau revient.'

// Écran Compte : se connecter avec un code reçu par e-mail, voir l'adresse, se déconnecter.
// Une fois connecté, `CompteConnecte` relie les données de l'appareil au compte (reprise).
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
      <CompteConnecte
        userId={session.userId} email={session.email ?? ''} enLigne={enLigne}
        onRetour={onRetour} retour={retour} confidentialite={confidentialite}
      />
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

type Etape =
  | { nom: 'verification' }
  | { nom: 'premier_lien'; resume: ResumeAppareil }
  | { nom: 'choix_profil'; resume: ResumeAppareil; appareil: InfosProfil; compte: InfosProfil }
  | { nom: 'autre_compte'; resume: ResumeAppareil; emailAutre: string | null; enAttente: number }
  | { nom: 'fin'; message: string; recharger: boolean }
  // `nonLie` : connecté, mais les données de l'appareil ne sont pas (encore) reliées au compte.
  | { nom: 'normal'; nonLie: boolean; message?: string }

function infosProfil(doc: Record<string, unknown>): InfosProfil {
  return {
    niveauBloc: String(doc.niveauBloc ?? '—'),
    seancesParSemaine: Number(doc.seancesParSemaine ?? 0),
    modifieLe: typeof doc.modifieLe === 'string' ? doc.modifieLe : null,
  }
}

/** Même geste que « Sauvegarder mes données » de l'écran Profil, avec toutes les tables. */
function telechargerFichier(contenu: string): void {
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([contenu], { type: 'application/json' }))
  lien.download = `appli-escalade-sauvegarde-${jourLocal()}.json`
  lien.click()
  URL.revokeObjectURL(lien.href)
}

// Vue « connecté » : décide quoi faire des données de l'appareil, puis affiche le compte.
function CompteConnecte({ userId, email, enLigne, onRetour, retour, confidentialite }: {
  userId: string; email: string; enLigne: boolean
  onRetour: () => void; retour: React.ReactNode; confidentialite: React.ReactNode
}) {
  const [etape, setEtape] = useState<Etape>({ nom: 'verification' })
  const [occupe, setOccupe] = useState(false)
  const [erreur, setErreur] = useState('')
  const [confirmeDeconnexion, setConfirmeDeconnexion] = useState(false)
  const [enAttenteDeconnexion, setEnAttenteDeconnexion] = useState(0)

  const session = { userId, email }
  const serveur = () => serveurSupabase(supabase!)

  // Lie (ou re-synchronise) et passe à l'écran suivant. `resume` sert à dire combien de séances ont été ajoutées.
  const lier = async (resume: ResumeAppareil, choix?: 'appareil' | 'compte', apresEffacement = false) => {
    setOccupe(true)
    setErreur('')
    try {
      const { resultat, bilan } = await lierCompte(serveur(), session, choix)
      if (resultat === 'choix_profil_requis') {
        const { appareil, compte } = await profilsACompare(serveur())
        if (appareil && compte) {
          setEtape({ nom: 'choix_profil', resume, appareil: infosProfil(appareil), compte: infosProfil(compte) })
          return
        }
      }
      if (resultat !== 'lie') return
      const recharger = apresEffacement || choix === 'compte' || (bilan?.appliques ?? 0) > 0
      let message = `Tes données sont reliées à ton compte : ${bilan?.envoyes ?? 0} envoyée${(bilan?.envoyes ?? 0) > 1 ? 's' : ''}.`
      if (resume.nbSeances > 0) {
        message = `${resume.nbSeances} séance${resume.nbSeances > 1 ? 's ajoutées' : ' ajoutée'}. Elles restent aussi sur cet appareil.`
      } else if (apresEffacement) {
        message = 'Ton compte est relié à cet appareil. Tes données arrivent ici.'
      }
      setEtape({ nom: 'fin', message, recharger })
    } catch {
      // Rien n'a été effacé : on propose de réessayer.
      setErreur(MESSAGE_ECHEC_REPRISE)
      setEtape((e) => (e.nom === 'verification' ? { nom: 'normal', nonLie: true } : e))
    } finally {
      setOccupe(false)
    }
  }

  // Au passage : que faut-il faire des données de l'appareil ?
  const verifier = async (plusTard = false) => {
    const resume = await resumerAppareil()
    const situation = situationReprise(await lireEtat<string | null>('compteId'), userId)
    if (situation === 'autre_compte') {
      setEtape({
        nom: 'autre_compte', resume, enAttente: await compterEnAttente(),
        emailAutre: (await lireEtat<string | null>('compteEmail')) ?? null,
      })
    } else if (situation === 'meme_compte') {
      // Déjà lié : on rattrape simplement ce qui n'est pas parti (réseau coupé la dernière fois).
      setEtape({ nom: 'normal', nonLie: false })
      if (enLigne) {
        try {
          const { bilan } = await lierCompte(serveur(), session)
          const n = bilan?.envoyes ?? 0
          setEtape({ nom: 'normal', nonLie: false, message: `Tes données sont reliées à ton compte : ${n} envoyée${n > 1 ? 's' : ''}.` })
        } catch { /* l'envoi se refera plus tard ; rien n'est perdu */ }
      }
    } else if (resume.nbSeances > 0 && !plusTard) {
      setEtape({ nom: 'premier_lien', resume })
    } else if (plusTard || !enLigne) {
      setEtape({ nom: 'normal', nonLie: true })
    } else {
      await lier(resume) // aucune séance sur l'appareil : on lie directement
    }
  }

  useEffect(() => {
    void verifier()
    // Une seule vérification par ouverture de l'écran et par compte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const sauvegarderPuisEffacer = async (e: Extract<Etape, { nom: 'autre_compte' }>) => {
    setOccupe(true)
    setErreur('')
    try {
      // Le fichier d'abord : si la sauvegarde échoue, rien n'est effacé.
      telechargerFichier(await sauvegardeComplete())
      // On n'efface que ce que l'utilisateur a vu dans la confirmation.
      await effacerDonneesLocales({ enAttenteAcceptees: e.enAttente })
    } catch {
      setErreur('Rien n’a été effacé. Tes données sont toujours sur cet appareil : réessaie.')
      setOccupe(false)
      return
    }
    setOccupe(false)
    await lier({ ...e.resume, nbSeances: 0 }, undefined, true)
  }

  const annulerChangement = async () => {
    try { await seDeconnecter() } catch (e) { setErreur(e instanceof Error ? e.message : String(e)) }
  }

  const demanderDeconnexion = async () => {
    setEnAttenteDeconnexion(await compterEnAttente())
    setConfirmeDeconnexion(true)
  }

  if (etape.nom === 'verification') {
    return <main className="ecran">{retour}<p className="texte-3" role="status">Mise en lien de tes données…</p></main>
  }
  if (etape.nom === 'premier_lien') {
    return (
      <ReprisePremierLien
        resume={etape.resume} enLigne={enLigne} occupe={occupe} erreur={erreur}
        onAjouter={() => void lier(etape.resume)}
        onPlusTard={() => { setErreur(''); setEtape({ nom: 'normal', nonLie: true }) }}
      />
    )
  }
  if (etape.nom === 'choix_profil') {
    return (
      <RepriseChoixProfil
        appareil={etape.appareil} compte={etape.compte} enLigne={enLigne} occupe={occupe} erreur={erreur}
        onValider={(choix) => void lier(etape.resume, choix)}
      />
    )
  }
  if (etape.nom === 'autre_compte') {
    return (
      <RepriseAutreCompte
        emailAutre={etape.emailAutre} nouvelEmail={email} resume={etape.resume} enAttente={etape.enAttente}
        enLigne={enLigne} occupe={occupe} erreur={erreur}
        onSauvegarderEfface={() => void sauvegarderPuisEffacer(etape)}
        onAnnuler={() => void annulerChangement()}
      />
    )
  }
  if (etape.nom === 'fin') {
    // Si des données du compte sont arrivées, on recharge l'app pour les afficher.
    return <RepriseFin message={etape.message} onContinuer={() => (etape.recharger ? window.location.reload() : onRetour())} />
  }

  const texteDeconnexion = enAttenteDeconnexion > 0
    ? `${enAttenteDeconnexion} modification${enAttenteDeconnexion > 1 ? 's ne sont pas encore envoyées. Elles partiront' : ' n’est pas encore envoyée. Elle partira'} à ta prochaine connexion. Te déconnecter quand même ?`
    : 'Tes données restent sur cet appareil.'
  return (
    <main className="ecran">
      {retour}
      <div className="pile">
        <h1 className="titre moyen">Ton compte</h1>
        <p>Connecté avec</p>
        <p className="donnee">{email}</p>
      </div>
      <div role="status" aria-live="polite">
        {etape.message && <p className="texte-2">{etape.message}</p>}
        {erreur && <p className="message-erreur">{erreur}</p>}
      </div>
      {etape.nonLie && (
        <div className="pile">
          <Avertissement niveau="information" titre="Tes séances ne sont pas encore reliées à ton compte." />
          <button className="bouton-second" disabled={!enLigne || occupe} onClick={() => { setErreur(''); void verifier() }}>
            Relier mes données à mon compte
          </button>
        </div>
      )}
      <button className="bouton-second" onClick={() => void demanderDeconnexion()}>Me déconnecter</button>
      {confidentialite}
      <Confirmation
        ouverte={confirmeDeconnexion}
        titre="Te déconnecter ?"
        texte={texteDeconnexion}
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
