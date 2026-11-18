import { useState } from 'react'
import { Avertissement } from '../composants/Avertissement.tsx'
import { Confirmation } from '../composants/Confirmation.tsx'
import { masquerEmail, type ResumeAppareil } from '../synchro/reprise.ts'

// Écrans de la reprise des données (parcours T-04). Cet écran n'agit pas : il affiche et renvoie
// les choix de l'utilisateur à `Compte`, qui lance le lien, la sauvegarde et l'effacement.

/** « 2026-11-03 » → « 3 novembre 2026 ». */
function dateLisible(iso: string | null): string {
  if (!iso) return '—'
  const [a, m, j] = iso.slice(0, 10).split('-').map(Number)
  if (!a || !m || !j) return iso
  return new Date(a, m - 1, j).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function pluriel(n: number, mot: string): string {
  return `${n} ${mot}${n > 1 ? 's' : ''}`
}

const RAISON_HORS_LIGNE = 'Il faut du réseau pour envoyer tes données.'

interface Commun { enLigne: boolean; occupe: boolean; erreur: string }

function Etat({ occupe, erreur }: { occupe: boolean; erreur: string }) {
  return (
    <div role="status" aria-live="polite">
      {occupe && <p className="texte-3">Envoi en cours…</p>}
      {erreur && <p className="message-erreur">{erreur}</p>}
    </div>
  )
}

export function ReprisePremierLien({ resume, enLigne, occupe, erreur, onAjouter, onPlusTard }: Commun & {
  resume: ResumeAppareil
  onAjouter: () => void
  onPlusTard: () => void
}) {
  return (
    <main className="ecran">
      <div className="pile">
        <h1 className="titre moyen">On a trouvé tes séances</h1>
        <p>Ce que ton compte contient déjà arrivera aussi ici. Rien n’est effacé de cet appareil.</p>
      </div>
      <section className="fiche pile" aria-label="Sur cet appareil">
        <p className="mention">Sur cet appareil</p>
        <p className="donnee">{pluriel(resume.nbSeances, 'séance')}</p>
        <p className="texte-2">De {dateLisible(resume.premiereDate)} à {dateLisible(resume.derniereDate)}</p>
        <p className="texte-2">Profil : {resume.aUnProfil ? 'oui' : 'non'}</p>
      </section>
      <Etat occupe={occupe} erreur={erreur} />
      {!enLigne && <Avertissement niveau="information" titre={RAISON_HORS_LIGNE}>Réessaie quand le réseau revient.</Avertissement>}
      <div className="pile-large">
        <button type="button" className="bouton principal centre" disabled={!enLigne || occupe} onClick={onAjouter}>
          <strong>Ajouter à mon compte</strong>
        </button>
        <button type="button" className="bouton-texte" disabled={occupe} onClick={onPlusTard}>Plus tard</button>
      </div>
    </main>
  )
}

export interface InfosProfil { niveauBloc: string; seancesParSemaine: number; modifieLe: string | null }

export function RepriseChoixProfil({ appareil, compte, enLigne, occupe, erreur, onValider }: Commun & {
  appareil: InfosProfil
  compte: InfosProfil
  onValider: (choix: 'appareil' | 'compte') => void
}) {
  // Présélection : le plus récent. À égalité ou sans date, celui de l'appareil (on ne remplace rien sans raison).
  const plusRecent = (compte.modifieLe && (!appareil.modifieLe || Date.parse(compte.modifieLe) > Date.parse(appareil.modifieLe)))
    ? 'compte' : 'appareil'
  const [choix, setChoix] = useState<'appareil' | 'compte'>(plusRecent)
  const carte = (cle: 'appareil' | 'compte', titre: string, infos: InfosProfil) => (
    <button type="button" aria-pressed={choix === cle} disabled={occupe} onClick={() => setChoix(cle)}>
      {/* Pas de classes de gris ici : le bouton choisi passe en encre, le texte doit hériter de sa couleur. */}
      <span className="pile">
        <strong>{titre}</strong>
        <span>Niveau bloc {infos.niveauBloc} · {pluriel(infos.seancesParSemaine, 'séance')} par semaine</span>
        <span>Modifié le {dateLisible(infos.modifieLe)}</span>
      </span>
    </button>
  )
  return (
    <main className="ecran">
      <div className="pile">
        <h1 className="titre moyen">Deux profils différents</h1>
        <p>Cet appareil et ton compte ont chacun un profil. Lequel garder ?</p>
      </div>
      <div className="choix" role="group" aria-label="Profil à garder">
        {carte('appareil', 'Garder celui de cet appareil', appareil)}
        {carte('compte', 'Garder celui du compte', compte)}
      </div>
      <Etat occupe={occupe} erreur={erreur} />
      {!enLigne && <Avertissement niveau="information" titre={RAISON_HORS_LIGNE}>Réessaie quand le réseau revient.</Avertissement>}
      <button type="button" className="bouton principal centre" disabled={!enLigne || occupe} onClick={() => onValider(choix)}>
        <strong>Ajouter à mon compte</strong>
      </button>
    </main>
  )
}

export function RepriseAutreCompte({ emailAutre, nouvelEmail, resume, enAttente, enLigne, occupe, erreur, onSauvegarderEfface, onAnnuler }: Commun & {
  emailAutre: string | null
  nouvelEmail: string | null
  resume: ResumeAppareil
  /** Modifications pas encore envoyées au compte d'origine : elles seront perdues de l'appareil (mais gardées dans le fichier). */
  enAttente: number
  onSauvegarderEfface: () => void
  onAnnuler: () => void
}) {
  const [confirme, setConfirme] = useState(false)
  const origine = emailAutre ? masquerEmail(emailAutre) : 'un autre compte'
  const texteConfirmation =
    `Seront effacés de cet appareil : ${pluriel(resume.nbSeances, 'séance')}, ton profil et ton plan. ` +
    (enAttente > 0
      ? `${pluriel(enAttente, 'modification')} pas encore envoyée${enAttente > 1 ? 's' : ''} au compte d’origine ne ${enAttente > 1 ? 'partiront' : 'partira'} plus : elle${enAttente > 1 ? 's seront' : ' sera'} seulement dans le fichier de sauvegarde. `
      : 'Tout est déjà envoyé au compte d’origine. ') +
    'On crée d’abord le fichier de sauvegarde ; rien n’est effacé tant que tu n’as pas confirmé l’avoir.'
  return (
    <main className="ecran">
      <div className="pile">
        <h1 className="titre moyen">Cet appareil est lié à un autre compte</h1>
        <p>
          Il contient les données de <span className="donnee">{origine}</span>. Pour te connecter avec{' '}
          <span className="donnee">{nouvelEmail ?? 'ce nouveau compte'}</span>, il faut d’abord les effacer de cet appareil.
          Elles restent sur le compte d’origine.
        </p>
      </div>
      {enAttente > 0 && (
        <Avertissement niveau="avertissement" titre={`${pluriel(enAttente, 'modification')} pas encore envoyée${enAttente > 1 ? 's' : ''}`}>
          Elles ne sont pas sur le compte d’origine. Le fichier de sauvegarde les garde.
        </Avertissement>
      )}
      <Etat occupe={occupe} erreur={erreur} />
      <div className="pile-large">
        <button type="button" className="bouton principal centre" disabled={!enLigne || occupe} onClick={() => setConfirme(true)}>
          <strong>Sauvegarder dans un fichier puis effacer</strong>
        </button>
        <button type="button" className="bouton-second" disabled={occupe} onClick={onAnnuler}>Annuler</button>
      </div>
      {!enLigne && <Avertissement niveau="information" titre={RAISON_HORS_LIGNE}>Réessaie quand le réseau revient.</Avertissement>}
      <Confirmation
        ouverte={confirme}
        titre="D'abord, une sauvegarde"
        texte={texteConfirmation}
        libelleAction="Créer le fichier de sauvegarde"
        libelleRester="Ne rien effacer"
        onRester={() => setConfirme(false)}
        onAction={() => { setConfirme(false); onSauvegarderEfface() }}
      />
    </main>
  )
}

export function RepriseFin({ message, onContinuer }: { message: string; onContinuer: () => void }) {
  return (
    <main className="ecran">
      <div className="pile">
        <h1 className="titre moyen">C’est fait</h1>
        <p role="status">{message}</p>
      </div>
      <button type="button" className="bouton principal centre" onClick={onContinuer}><strong>Continuer</strong></button>
    </main>
  )
}
