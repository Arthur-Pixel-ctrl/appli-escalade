import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Avertissement } from '../../composants/Avertissement.tsx'
import { BandeSemaines } from '../../composants/BandeSemaines.tsx'
import { Confirmation } from '../../composants/Confirmation.tsx'
import { NIVEAUX_DETAIL, type AccentPhase, type Cycle, type DateISO, type NiveauDetail, type ObjectifSpecifique, type PhaseCycle, type SemainePlan, type SeancePlanifiee } from '../../donnees/modele.ts'
import { ETIQUETTES_NIVEAU } from '../../donnees/niveaux.ts'
import { ajouterJours, debutPhase, debutSemaine, finCycle } from '../../donnees/plan.ts'
import { estProposeSeulementALaMain, objectifsPourAccent } from '../../donnees/objectifsSpecifiques.ts'
import {
  ACCENTS, ETIQUETTES_ACCENT, ETIQUETTES_TYPE_SEMAINE, NB_OBJECTIFS_MAX, REDUCTIONS_ALLEGEE, REDUCTION_PAR_DEFAUT,
  chargeRelative, dateCourte, dateLongue, estUnLundi, resumeSemaine, semaineDuJour, semainesAPlat, seancesAvecNiveauPropre,
} from './Plan.outils.ts'

/** Un objectif tel que la fenêtre O-09 le rend : du catalogue (`modeleId`) ou écrit à la main. */
export interface ObjectifChoisi { modeleId?: string; libelle: string }

interface Props {
  cycle: Cycle
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  objectifs: ObjectifSpecifique[]
  aujourdhui: DateISO
  onCycle: (c: Cycle) => void
  onPhase: (p: PhaseCycle) => void
  onObjectifs: (phaseId: string, choisis: ObjectifChoisi[]) => void
  /** Change le niveau du cycle ; `effacerNiveauxPropres` remet aussi les séances au niveau du cycle. */
  onNiveau: (niveau: NiveauDetail, effacerNiveauxPropres: boolean) => void
  onNouveauCycle: () => void
}

const TYPES_CHOISIS: SemainePlan['type'][] = ['charge', 'allegee', 'affutage']

// Écran O-03 : la structure du cycle, en trois colonnes de phases.
export function VueCycle({ cycle, phases, seances, objectifs, aujourdhui, onCycle, onPhase, onObjectifs, onNiveau, onNouveauCycle }: Props) {
  const [niveauDemande, setNiveauDemande] = useState<NiveauDetail | null>(null)
  const [validation, setValidation] = useState(false)
  const [phaseObjectifs, setPhaseObjectifs] = useState<PhaseCycle | null>(null)
  const [ligneChoisie, setLigneChoisie] = useState<number | null>(null)
  const lignes = useRef(new Map<number, HTMLElement>())
  const enregistrerLigne = useCallback((numero: number, el: HTMLElement | null) => {
    if (el) lignes.current.set(numero, el); else lignes.current.delete(numero)
  }, [])
  const idNoteVues = useId()

  const position = semaineDuJour(cycle, aujourdhui)
  const plat = semainesAPlat(phases)
  const minutesMax = Math.max(0, ...phases.flatMap((p) => p.semaines.map((s) => resumeSemaine(seances, p.id, s.numero).minutes)))
  const aDesSeances = seances.length > 0
  const numeroAOuvrir = position?.numero ?? (aujourdhui > finCycle(cycle) ? cycle.nbSemaines : 1)

  const allerALaSemaine = (numero: number) => {
    setLigneChoisie(numero)
    const ligne = lignes.current.get(numero)
    ligne?.scrollIntoView({ block: 'center' })
    ligne?.focus()
  }

  const niveauCycle = cycle.niveauDetail ?? 'detaille'

  return (
    <div className="plan-vue">
      <header className="plan-entete pile-large">
        <div className="plan-entete-ligne">
          <NomDuCycle key={cycle.nom} nom={cycle.nom} onChanger={(nom) => onCycle({ ...cycle, nom })} />
          {cycle.etat === 'brouillon' && <span className="etiquette contour">Brouillon</span>}
        </div>

        <div className="plan-entete-grille">
          <DebutDuCycle key={cycle.id} cycle={cycle} verrouille={aDesSeances} onChanger={(debut) => onCycle({ ...cycle, debut })} />
          <fieldset className="question">
            <legend className="libelle">Séances par semaine</legend>
            <div className="choix quatre">
              {[2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-pressed={cycle.seancesParSemaine === n}
                  onClick={() => n !== cycle.seancesParSemaine && onCycle({ ...cycle, seancesParSemaine: n })}>{n}</button>
              ))}
            </div>
          </fieldset>
          <fieldset className="question">
            <legend className="libelle">Niveau : {ETIQUETTES_NIVEAU[niveauCycle]}</legend>
            <div className="choix trois">
              {NIVEAUX_DETAIL.map((n) => (
                <button key={n} type="button" aria-pressed={niveauCycle === n}
                  onClick={() => n !== niveauCycle && setNiveauDemande(n)}>{ETIQUETTES_NIVEAU[n]}</button>
              ))}
            </div>
          </fieldset>
          <ObjectifDuCycle cycle={cycle} onChanger={(objectif) => onCycle({ ...cycle, objectif })} />
        </div>

        <div className="plan-actions">
          {cycle.etat === 'brouillon' && (
            <button type="button" className="bouton-second" onClick={() => setValidation(true)}>Valider le cycle</button>
          )}
          <button type="button" className="bouton-second" onClick={onNouveauCycle}>Nouveau cycle</button>
          <button type="button" className="bouton principal centre" onClick={() => allerALaSemaine(numeroAOuvrir)}>
            <strong>{position ? 'Ouvrir la semaine en cours' : `Ouvrir la semaine ${numeroAOuvrir}`}</strong>
          </button>
        </div>
        <p className="texte-3">Les séances se lancent depuis ton téléphone.</p>
      </header>

      <div className="plan-selecteur pile">
        <div className="choix trois" role="group" aria-label="Vue du plan" aria-describedby={idNoteVues}>
          <button type="button" aria-pressed="true">12 semaines</button>
          <button type="button" aria-pressed="false" disabled>Phase</button>
          <button type="button" aria-pressed="false" disabled>Semaine</button>
        </div>
        <p className="texte-3" id={idNoteVues}>La vue Phase et la vue Semaine arrivent dans un prochain lot.</p>
      </div>

      <BandeSemaines
        semaines={plat.map((s) => ({
          numero: s.numero,
          type: s.type,
          faite: ajouterJours(debutSemaine(cycle, { ordre: s.phase }, s.semaine), 6) < aujourdhui,
        }))}
        numeroEnCours={position?.numero ?? null}
        numeroOuvert={ligneChoisie}
        onChoisir={allerALaSemaine}
      />

      <div className="plan-phases">
        {phases.map((phase) => (
          <ColonnePhase
            key={phase.id}
            cycle={cycle}
            phase={phase}
            seances={seances}
            objectifs={objectifs.filter((o) => o.phaseId === phase.id)}
            minutesMax={minutesMax}
            numeroEnCours={position?.numero ?? null}
            enregistrerLigne={enregistrerLigne}
            onPhase={onPhase}
            onChoisirObjectifs={() => setPhaseObjectifs(phase)}
          />
        ))}
      </div>

      <Confirmation
        ouverte={validation}
        titre="Valider le cycle ?"
        texte="Ton cycle apparaîtra sur ton téléphone. Tu pourras encore le modifier."
        libelleAction="Valider le cycle"
        onRester={() => setValidation(false)}
        onAction={() => { setValidation(false); onCycle({ ...cycle, etat: 'valide' }) }}
      />

      {niveauDemande && (
        <ChangerNiveau
          niveau={niveauDemande}
          nbAvecNiveauPropre={seancesAvecNiveauPropre(seances, niveauDemande)}
          onRester={() => setNiveauDemande(null)}
          onChanger={(effacer) => { onNiveau(niveauDemande, effacer); setNiveauDemande(null) }}
        />
      )}

      {phaseObjectifs && phaseObjectifs.accent && (
        <ChoisirObjectifs
          phase={phaseObjectifs}
          accent={phaseObjectifs.accent}
          actuels={objectifs.filter((o) => o.phaseId === phaseObjectifs.id)}
          onGarder={(choisis) => { onObjectifs(phaseObjectifs.id, choisis); setPhaseObjectifs(null) }}
          onAnnuler={() => setPhaseObjectifs(null)}
        />
      )}
    </div>
  )
}

// ——— En-tête ———

// Le nom se modifie en place : on enregistre en quittant le champ ou sur Entrée, jamais un nom vide.
function NomDuCycle({ nom, onChanger }: { nom: string; onChanger: (nom: string) => void }) {
  const [saisie, setSaisie] = useState(nom)
  const valider = () => {
    const propre = saisie.trim()
    if (propre === '') setSaisie(nom)
    else if (propre !== nom) onChanger(propre)
  }
  return (
    <input className="plan-nom" aria-label="Nom du cycle" value={saisie} maxLength={60}
      onChange={(e) => setSaisie(e.target.value)} onBlur={valider}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} />
  )
}

// Changer le début déplacerait les dates des séances déjà posées (elles sont enregistrées avec leur date) :
// tant qu'il y en a, la date est en lecture seule.
function DebutDuCycle({ cycle, verrouille, onChanger }: { cycle: Cycle; verrouille: boolean; onChanger: (debut: DateISO) => void }) {
  const [saisie, setSaisie] = useState(cycle.debut)
  const [erreur, setErreur] = useState('')
  const idErreur = useId()
  const fin = finCycle(cycle)
  if (verrouille) {
    return (
      <div className="pile">
        <p className="libelle">Dates</p>
        <p className="donnee">{dateLongue(cycle.debut)} → {dateLongue(fin)}</p>
        <p className="texte-3">Des séances sont déjà posées : pour décaler le cycle, crée-en un nouveau.</p>
      </div>
    )
  }
  return (
    <div className={erreur ? 'champ erreur' : 'champ'}>
      <label htmlFor="plan-debut">Début (un lundi)</label>
      <input id="plan-debut" type="date" value={saisie} aria-invalid={erreur !== ''} aria-describedby={erreur ? idErreur : undefined}
        onChange={(e) => {
          setSaisie(e.target.value)
          if (e.target.value === '') return
          if (estUnLundi(e.target.value)) { setErreur(''); if (e.target.value !== cycle.debut) onChanger(e.target.value) }
          else setErreur('Choisis un lundi : le cycle commence toujours en début de semaine.')
        }} />
      {erreur ? <p className="message-erreur" id={idErreur}>{erreur}</p> : <p className="texte-3">Fin : {dateLongue(fin)}</p>}
    </div>
  )
}

// Objectif du cycle (facultatif) : un libellé libre et une date. Sans libellé, pas de date.
function ObjectifDuCycle({ cycle, onChanger }: { cycle: Cycle; onChanger: (o: Cycle['objectif']) => void }) {
  const [libelle, setLibelle] = useState(cycle.objectif?.libelle ?? '')
  const [date, setDate] = useState(cycle.objectif?.date ?? '')
  const enregistrer = (l: string, d: string) => {
    const propre = l.trim()
    const nouveau = propre === '' ? undefined : { libelle: propre, ...(d ? { date: d } : {}) }
    if (JSON.stringify(nouveau) !== JSON.stringify(cycle.objectif)) onChanger(nouveau)
  }
  return (
    <div className="deux-champs plan-objectif">
      <label className="champ">Objectif (facultatif)
        <input value={libelle} maxLength={80} placeholder="Ex. Enchaîner mon 7a" onChange={(e) => setLibelle(e.target.value)}
          onBlur={() => enregistrer(libelle, libelle.trim() === '' ? '' : date)} />
      </label>
      <label className="champ">Date de l’objectif
        <input type="date" value={date} disabled={libelle.trim() === ''}
          onChange={(e) => { setDate(e.target.value); enregistrer(libelle, e.target.value) }} />
      </label>
    </div>
  )
}

// ——— Colonne d'une phase ———

function ColonnePhase({ cycle, phase, seances, objectifs, minutesMax, numeroEnCours, enregistrerLigne, onPhase, onChoisirObjectifs }: {
  cycle: Cycle
  phase: PhaseCycle
  seances: SeancePlanifiee[]
  objectifs: ObjectifSpecifique[]
  minutesMax: number
  numeroEnCours: number | null
  enregistrerLigne: (numero: number, el: HTMLElement | null) => void
  onPhase: (p: PhaseCycle) => void
  onChoisirObjectifs: () => void
}) {
  const idTitre = useId()
  const idAideObjectifs = useId()
  const pleine = objectifs.length >= NB_OBJECTIFS_MAX
  const debut = debutPhase(cycle, phase)

  const changerSemaine = (numero: number, modif: Partial<SemainePlan>) => {
    onPhase({
      ...phase,
      semaines: phase.semaines.map((s) => {
        if (s.numero !== numero) return s
        const suivante = { ...s, ...modif }
        // Une semaine de charge n'a pas de réduction ; les autres gardent la leur, 50 % par défaut.
        if (suivante.type === 'charge') delete suivante.reductionPct
        else suivante.reductionPct = suivante.reductionPct ?? REDUCTION_PAR_DEFAUT
        return suivante
      }),
    })
  }

  return (
    <section className="fiche pile-large phase-colonne" aria-labelledby={idTitre}>
      <div className="pile">
        <h2 className="sous-titre" id={idTitre}>Phase {phase.ordre}</h2>
        <p className="donnee">{dateCourte(debut)} → {dateCourte(ajouterJours(debut, 27))}</p>
      </div>

      <label className="champ">Accent de la phase
        <select value={phase.accent ?? ''} onChange={(e) => onPhase({ ...phase, accent: e.target.value === '' ? null : (e.target.value as AccentPhase) })}>
          <option value="">Pas encore choisi</option>
          {ACCENTS.map((a) => <option key={a} value={a}>{ETIQUETTES_ACCENT[a]}</option>)}
        </select>
      </label>
      {phase.accent === null && <p className="annotation">Choisis l’accent de la phase</p>}

      <div className="pile">
        <p className="libelle">Objectifs de la phase</p>
        {objectifs.length === 0
          ? <p className="texte-3">Aucun objectif choisi.</p>
          : <ul className="liste-simple">{objectifs.map((o) => <li key={o.id}>{o.libelle}</li>)}</ul>}
        <button type="button" className="bouton-second" disabled={phase.accent === null || pleine} aria-describedby={idAideObjectifs} onClick={onChoisirObjectifs}>
          Choisir un objectif
        </button>
        <p className="texte-3" id={idAideObjectifs}>
          {phase.accent === null
            ? 'Choisis d’abord l’accent de la phase.'
            : pleine ? 'Deux objectifs au plus par phase : retire-en un pour en choisir un autre.' : `${objectifs.length} sur ${NB_OBJECTIFS_MAX}`}
        </p>
      </div>

      <ol className="plan-semaines">
        {phase.semaines.map((s) => {
          const numero = (phase.ordre - 1) * 4 + s.numero
          const resume = resumeSemaine(seances, phase.id, s.numero)
          const allegee = s.type !== 'charge'
          return (
            <li
              key={s.numero}
              ref={(el) => enregistrerLigne(numero, el)}
              tabIndex={-1}
              className={`semaine-ligne${allegee ? ' allegee' : ''}${numero === numeroEnCours ? ' en-cours' : ''}`}
              aria-current={numero === numeroEnCours ? 'date' : undefined}
            >
              <div className="semaine-tete">
                <span className="mention">S{numero} · {dateCourte(debutSemaine(cycle, phase, s.numero))}</span>
                {allegee && <span className="etiquette contour">{ETIQUETTES_TYPE_SEMAINE[s.type]}</span>}
              </div>
              <p className="semaine-resume">
                <span className="donnee">{resume.nb === 0 ? 'Aucune séance' : `${resume.nb} séance${resume.nb > 1 ? 's' : ''}`}</span>
                {resume.dures > 0 && <span className="etiquette">{resume.dures} dure{resume.dures > 1 ? 's' : ''}</span>}
                {resume.legeres > 0 && <span className="etiquette contour">{resume.legeres} légère{resume.legeres > 1 ? 's' : ''}</span>}
              </p>
              <div className="barre-charge" role="img" aria-label={resume.minutes === 0 ? 'Charge : aucune' : `Charge : ${resume.minutes} minutes`}>
                <span style={{ width: `${Math.round(chargeRelative(resume.minutes, minutesMax) * 100)}%` }} />
              </div>
              <label className="champ semaine-type">Type de semaine {numero}
                <select value={s.type} onChange={(e) => changerSemaine(s.numero, { type: e.target.value as SemainePlan['type'] })}>
                  {TYPES_CHOISIS.concat(s.type === 'transition' ? ['transition'] : []).map((t) => (
                    <option key={t} value={t}>{ETIQUETTES_TYPE_SEMAINE[t]}</option>
                  ))}
                </select>
              </label>
              {allegee && (
                <fieldset className="question">
                  <legend className="libelle">Réduction de la charge</legend>
                  <div className="choix trois">
                    {REDUCTIONS_ALLEGEE.map((r) => (
                      <button key={r} type="button" aria-pressed={(s.reductionPct ?? REDUCTION_PAR_DEFAUT) === r}
                        onClick={() => changerSemaine(s.numero, { reductionPct: r })}>{r} %</button>
                    ))}
                  </div>
                </fieldset>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

// ——— Fenêtres ———

// Changement de niveau : même fenêtre que Confirmation, avec en plus le lien « Les passer aussi en … ».
function ChangerNiveau({ niveau, nbAvecNiveauPropre, onRester, onChanger }: {
  niveau: NiveauDetail
  nbAvecNiveauPropre: number
  onRester: () => void
  onChanger: (effacerNiveauxPropres: boolean) => void
}) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const boutonRester = useRef<HTMLButtonElement>(null)
  const idTitre = useId()
  const idTexte = useId()
  useEffect(() => {
    const retour = document.activeElement as HTMLElement | null
    dialogue.current?.showModal()
    boutonRester.current?.focus() // action sûre d'abord
    return () => { retour?.focus() }
  }, [])
  const texte = nbAvecNiveauPropre === 0
    ? 'Les séances suivront ce niveau. Rien n’est effacé.'
    : `Les séances suivront ce niveau. Rien n’est effacé. ${nbAvecNiveauPropre} séance${nbAvecNiveauPropre > 1 ? 's gardent' : ' garde'} ${nbAvecNiveauPropre > 1 ? 'leur' : 'son'} propre niveau.`
  return (
    <dialog ref={dialogue} className="confirmation" aria-labelledby={idTitre} aria-describedby={idTexte}
      onCancel={(e) => { e.preventDefault(); onRester() }}>
      <div className="fiche pile-large">
        <h2 id={idTitre} className="titre moyen">Passer le cycle en {ETIQUETTES_NIVEAU[niveau]} ?</h2>
        <p id={idTexte}>{texte}</p>
        <div className="confirmation-actions">
          <button ref={boutonRester} type="button" className="bouton-second" onClick={onRester}>Rester</button>
          <button type="button" className="bouton principal centre" onClick={() => onChanger(false)}><strong>Changer le niveau</strong></button>
          {nbAvecNiveauPropre > 0 && (
            <button type="button" className="bouton-texte" onClick={() => onChanger(true)}>Les passer aussi en {ETIQUETTES_NIVEAU[niveau]}</button>
          )}
        </div>
      </div>
    </dialog>
  )
}

// Fenêtre O-09 : 0 à 2 objectifs. On avertit sans bloquer : pas de filtrage par prérequis ici (la règle P-12 le signalera).
function ChoisirObjectifs({ phase, accent, actuels, onGarder, onAnnuler }: {
  phase: PhaseCycle
  accent: AccentPhase
  actuels: ObjectifSpecifique[]
  onGarder: (choisis: ObjectifChoisi[]) => void
  onAnnuler: () => void
}) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const idTitre = useId()
  const [choisis, setChoisis] = useState<ObjectifChoisi[]>(() => actuels.map((o) => ({ modeleId: o.modeleId, libelle: o.libelle })))
  const [mien, setMien] = useState('')
  useEffect(() => {
    const retour = document.activeElement as HTMLElement | null
    dialogue.current?.showModal()
    return () => { retour?.focus() }
  }, [])

  const pleine = choisis.length >= NB_OBJECTIFS_MAX
  const propositions = objectifsPourAccent(accent)
  const dejaChoisi = (id: string) => choisis.some((c) => c.modeleId === id)
  const mesObjectifs = choisis.filter((c) => !propositions.some((o) => o.id === c.modeleId))
  const basculer = (id: string, nom: string) => {
    setChoisis(dejaChoisi(id) ? choisis.filter((c) => c.modeleId !== id) : pleine ? choisis : [...choisis, { modeleId: id, libelle: nom }])
  }
  const ajouterLeMien = () => {
    const propre = mien.trim()
    if (propre === '' || pleine) return
    setChoisis([...choisis, { libelle: propre }])
    setMien('')
  }

  return (
    <dialog ref={dialogue} className="confirmation fenetre-large" aria-labelledby={idTitre} onCancel={(e) => { e.preventDefault(); onAnnuler() }}>
      <div className="fiche pile-large">
        <h2 id={idTitre} className="titre moyen">Objectifs de la phase {phase.ordre}</h2>
        <p className="mention" aria-live="polite">{choisis.length} sur {NB_OBJECTIFS_MAX}</p>
        {pleine && <p className="texte-3">Deux objectifs au plus par phase : retire-en un pour en choisir un autre.</p>}

        <ul className="liste-objectifs">
          {propositions.map((o) => {
            const coche = dejaChoisi(o.id)
            const alaMain = estProposeSeulementALaMain(o)
            return (
              <li key={o.id}>
                <label className="case">
                  <input type="checkbox" checked={coche} disabled={!coche && pleine} onChange={() => basculer(o.id, o.nom)} />
                  <span>{o.nom}{alaMain && <> <span className="etiquette contour">À la main seulement</span></>}</span>
                </label>
                <p className="texte-3">{o.pourquoi}{o.testRepere ? ` ${o.testRepere}.` : ''}</p>
                {alaMain && o.avertissementALaMain && <Avertissement niveau="avertissement" titre="À choisir avec prudence">{o.avertissementALaMain}</Avertissement>}
              </li>
            )
          })}
        </ul>

        <div className="pile">
          <label className="champ">Écrire le mien
            <input value={mien} maxLength={80} onChange={(e) => setMien(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterLeMien() } }} />
          </label>
          <button type="button" className="bouton-second" disabled={mien.trim() === '' || pleine} onClick={ajouterLeMien}>Ajouter le mien</button>
          {mesObjectifs.map((c) => (
            <div className="ligne" key={c.libelle}>
              <span>{c.libelle}</span>
              <button type="button" className="bouton-discret" onClick={() => setChoisis(choisis.filter((x) => x !== c))}>Retirer</button>
            </div>
          ))}
        </div>

        <div className="confirmation-actions">
          <button type="button" className="bouton-second" onClick={onAnnuler}>Annuler</button>
          <button type="button" className="bouton principal centre" onClick={() => onGarder(choisis)}><strong>Garder ces objectifs</strong></button>
        </div>
      </div>
    </dialog>
  )
}
