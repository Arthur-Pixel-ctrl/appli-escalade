import { useEffect, useId, useRef, useState } from 'react'
import { jourLocal } from '../../donnees/base.ts'
import { NIVEAUX_DETAIL, type AccentPhase, type NiveauDetail } from '../../donnees/modele.ts'
import { ETIQUETTES_NIVEAU, EXEMPLES_NIVEAU, niveauPropose } from '../../donnees/niveaux.ts'
import {
  ACCENTS, ETIQUETTES_ACCENT, estUnLundi, lundiSuivant, phraseNiveau, type DemandeCycle,
} from './Plan.outils.ts'

// Fenêtre O-13 « Nouveau cycle », bâtie comme la fenêtre de Confirmation (<dialog> natif, focus piégé, Échap annule).
// Ordre : nom, début, séances par semaine, accents des 3 phases, puis le niveau de détail EN DERNIER (décision F6) :
// il est présélectionné d'après les accents, avec la phrase qui dit pourquoi, et jamais imposé.
export function NouveauCycle({ seancesParSemaineProfil, onCreer, onAnnuler }: {
  seancesParSemaineProfil: number
  onCreer: (demande: DemandeCycle) => Promise<void>
  onAnnuler: () => void
}) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const champNom = useRef<HTMLInputElement>(null)
  const champDebut = useRef<HTMLInputElement>(null)
  const idTitre = useId()
  const idAideNiveau = useId()
  const idPourquoi = useId()
  const idErreurNom = useId()
  const idErreurDebut = useId()

  const [nom, setNom] = useState('')
  const [debut, setDebut] = useState(() => lundiSuivant(jourLocal()))
  const [seances, setSeances] = useState(() => Math.min(5, Math.max(2, seancesParSemaineProfil)))
  const [accents, setAccents] = useState<(AccentPhase | null)[]>([null, null, null])
  // null = l'utilisateur n'a pas encore choisi : la présélection suit les accents.
  const [niveauChoisi, setNiveauChoisi] = useState<NiveauDetail | null>(null)
  const [erreurNom, setErreurNom] = useState('')
  const [erreurDebut, setErreurDebut] = useState('')
  const [echec, setEchec] = useState(false)
  const [enCours, setEnCours] = useState(false)

  const niveauAffiche = niveauChoisi ?? niveauPropose(accents).niveau

  // Ouverture à l'affichage ; le focus revient à l'élément d'origine à la fermeture.
  useEffect(() => {
    const retour = document.activeElement as HTMLElement | null
    dialogue.current?.showModal()
    champNom.current?.focus()
    return () => { retour?.focus() }
  }, [])

  const creer = async () => {
    const nomPropre = nom.trim()
    const manqueNom = nomPropre === ''
    const debutInvalide = !estUnLundi(debut)
    setErreurNom(manqueNom ? 'Donne un nom à ton cycle.' : '')
    setErreurDebut(debutInvalide ? 'Choisis un lundi : le cycle commence toujours en début de semaine.' : '')
    if (manqueNom) { champNom.current?.focus(); return }
    if (debutInvalide) { champDebut.current?.focus(); return }
    setEnCours(true)
    setEchec(false)
    try {
      // Le niveau écrit est toujours celui qui est affiché dans la fenêtre.
      await onCreer({ nom: nomPropre, debut, seancesParSemaine: seances, accents, niveauDetail: niveauAffiche })
    } catch {
      setEchec(true)
      setEnCours(false)
    }
  }

  return (
    <dialog
      ref={dialogue}
      className="confirmation fenetre-large"
      aria-labelledby={idTitre}
      onCancel={(e) => { e.preventDefault(); if (!enCours) onAnnuler() }}
    >
      <form className="fiche pile-large" noValidate onSubmit={(e) => { e.preventDefault(); void creer() }}>
        <h2 id={idTitre} className="titre moyen">Nouveau cycle</h2>

        <div className={erreurNom ? 'champ erreur' : 'champ'}>
          <label htmlFor="cycle-nom">Nom du cycle</label>
          <input id="cycle-nom" ref={champNom} value={nom} placeholder="Cycle d’hiver" maxLength={60}
            aria-invalid={erreurNom !== ''} aria-describedby={erreurNom ? idErreurNom : undefined}
            onChange={(e) => { setNom(e.target.value); setErreurNom('') }} />
          {erreurNom && <p className="message-erreur" id={idErreurNom}>{erreurNom}</p>}
        </div>

        <div className={erreurDebut ? 'champ erreur' : 'champ'}>
          <label htmlFor="cycle-debut">Début (un lundi)</label>
          <input id="cycle-debut" ref={champDebut} type="date" value={debut}
            aria-invalid={erreurDebut !== ''} aria-describedby={erreurDebut ? idErreurDebut : undefined}
            onChange={(e) => { setDebut(e.target.value); setErreurDebut('') }} />
          {erreurDebut && <p className="message-erreur" id={idErreurDebut}>{erreurDebut}</p>}
        </div>

        <fieldset className="question">
          <legend>Séances par semaine</legend>
          <div className="choix quatre">
            {[2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-pressed={seances === n} onClick={() => setSeances(n)}>{n}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="question">
          <legend>Accent de chaque phase</legend>
          <p className="texte-3">Tu pourras les changer ensuite. Un accent non choisi n’empêche pas de créer le cycle.</p>
          {accents.map((accent, i) => (
            <label key={i} className="champ">Phase {i + 1}
              <select value={accent ?? ''} onChange={(e) => {
                const valeur = e.target.value === '' ? null : (e.target.value as AccentPhase)
                setAccents(accents.map((a, j) => (j === i ? valeur : a)))
              }}>
                <option value="">Pas encore choisi</option>
                {ACCENTS.map((a) => <option key={a} value={a}>{ETIQUETTES_ACCENT[a]}</option>)}
              </select>
            </label>
          ))}
        </fieldset>

        <fieldset className="question">
          <legend id={idAideNiveau}>Niveau de détail des séances</legend>
          <div className="choix-niveau" role="group" aria-labelledby={idAideNiveau} aria-describedby={idPourquoi}>
            {NIVEAUX_DETAIL.map((n) => (
              <button key={n} type="button" aria-pressed={niveauAffiche === n} onClick={() => setNiveauChoisi(n)}>
                <strong>{ETIQUETTES_NIVEAU[n]}</strong>
                <span>{EXEMPLES_NIVEAU[n]}</span>
              </button>
            ))}
          </div>
          <p className="texte-2" id={idPourquoi} aria-live="polite">{phraseNiveau(accents, niveauChoisi)}</p>
          <p className="texte-3">Tu pourras changer le niveau du cycle ou d’une séance à tout moment. Rien n’est effacé.</p>
        </fieldset>

        {echec && <p className="message-erreur" role="alert">Le cycle n’a pas pu être enregistré. Réessaie.</p>}

        <div className="confirmation-actions">
          <button type="button" className="bouton-second" onClick={onAnnuler} disabled={enCours}>Annuler</button>
          <button type="submit" className="bouton principal centre" disabled={enCours}><strong>Créer le cycle</strong></button>
        </div>
      </form>
    </dialog>
  )
}
