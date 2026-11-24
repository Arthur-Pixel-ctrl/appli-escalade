import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { BandeSemaines } from '../../composants/BandeSemaines.tsx'
import { Confirmation } from '../../composants/Confirmation.tsx'
import { Icone } from '../../composants/Icone.tsx'
import type { Cycle, DateISO, PhaseCycle, SeancePlanifiee } from '../../donnees/modele.ts'
import { dureeVersionSolo } from '../../donnees/niveaux.ts'
import { ajouterJours, debutSemaine } from '../../donnees/plan.ts'
import {
  ETIQUETTES_ACCENT, ETIQUETTES_TYPE_SEMAINE, chargeRelative, dateCourte, resumeSemaine, semaineDuJour, semainesAPlat,
} from './Plan.outils.ts'
import {
  JOURS_COURTS, JOURS_LONGS, SEMAINES_DE_PHASE, TEXTE_COPIE_IDENTIQUE, copierSurCase, dateDeLaCase, deplacerSurCase, formatDuree,
  ligneContenu, nouvelleSeanceVide, premiereCaseLibre, recopierSemaine1, seancesDeLaCase, type NumeroSemaine,
} from './VuePhase.outils.ts'

/** Ce que l'écran demande d'écrire : Plan.tsx s'occupe de l'affichage immédiat et de l'enregistrement. */
export interface ChangementSeances { ecrites: SeancePlanifiee[]; retirees: string[] }

interface Props {
  cycle: Cycle
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  aujourdhui: DateISO
  ordre: 1 | 2 | 3
  selecteurVue: ReactNode
  onChoisirPhase: (ordre: 1 | 2 | 3) => void
  onChangerSeances: (changement: ChangementSeances) => void
}

interface Case { semaine: NumeroSemaine; jour: number }

// Écran O-04 : les 4 semaines d'une phase, jour par jour. Aucun lancement de séance ici (R-6).
export function VuePhase({ cycle, phases, seances, aujourdhui, ordre, selecteurVue, onChoisirPhase, onChangerSeances }: Props) {
  const phase = phases.find((p) => p.ordre === ordre) ?? phases[0]
  const [presse, setPresse] = useState<SeancePlanifiee | null>(null) // presse-papiers : une séance copiée
  const [menu, setMenu] = useState<string | null>(null)
  const [aVider, setAVider] = useState<{ cible: Case; seances: SeancePlanifiee[] } | null>(null)
  const [aDeplacer, setADeplacer] = useState<SeancePlanifiee | null>(null)
  const [message, setMessage] = useState('')
  const [semaineOuverte, setSemaineOuverte] = useState<number | null>(null)
  const lignes = useRef(new Map<number, HTMLElement>())
  const idTitre = useId()
  const idNoteRecopie = useId()

  if (!phase) return null
  const maintenant = () => new Date().toISOString()
  const position = semaineDuJour(cycle, aujourdhui)
  const minutesMax = Math.max(0, ...phases.flatMap((p) => p.semaines.map((s) => resumeSemaine(seances, p.id, s.numero).minutes)))
  const seancesPhase = seances.filter((s) => s.phaseId === phase.id)
  const debutPhaseDate = debutSemaine(cycle, phase, 1)
  const libre = premiereCaseLibre(seances, phase, cycle)
  const nbSemaine1 = seancesPhase.filter((s) => s.semaine === 1).length

  const dansLaCase = (c: Case) => seancesDeLaCase(seances, phase, cycle, c.semaine, c.jour)
  const nomCase = (c: Case) => `${JOURS_LONGS[c.jour]} de la semaine ${(phase.ordre - 1) * 4 + c.semaine}`

  const ajouter = (c: Case) => {
    const s = nouvelleSeanceVide(cycle, phase, c.semaine, c.jour, maintenant(), crypto.randomUUID())
    onChangerSeances({ ecrites: [s], retirees: [] })
    setMessage(`Séance ajoutée : ${nomCase(c)}.`)
  }
  const coller = (c: Case) => {
    if (!presse) return
    onChangerSeances({ ecrites: [copierSurCase(presse, cycle, phase, c.semaine, c.jour, maintenant(), crypto.randomUUID())], retirees: [] })
    setMessage(`Séance collée : ${nomCase(c)}.`)
  }
  const recopier = () => {
    const { nouvelles, ignorees } = recopierSemaine1(seances, phase, cycle, maintenant(), () => crypto.randomUUID())
    if (nouvelles.length > 0) onChangerSeances({ ecrites: nouvelles, retirees: [] })
    setMessage(
      `${nouvelles.length} séance${nouvelles.length > 1 ? 's recopiées' : ' recopiée'} sur les semaines 2 et 3.` +
      (ignorees > 0 ? ` ${ignorees} case${ignorees > 1 ? 's déjà prises n’ont' : ' déjà prise n’a'} pas été touchée${ignorees > 1 ? 's' : ''}.` : ''),
    )
  }
  const allerALaSemaine = (numero: number) => {
    const phaseVisee = (Math.floor((numero - 1) / 4) + 1) as 1 | 2 | 3
    if (phaseVisee !== phase.ordre) onChoisirPhase(phaseVisee)
    setSemaineOuverte(numero)
    // La ligne n'existe qu'après l'affichage de la phase visée.
    window.setTimeout(() => { const l = lignes.current.get(numero); l?.scrollIntoView({ block: 'center' }); l?.focus() }, 0)
  }

  return (
    <div className="plan-vue">
      <header className="plan-entete pile-large">
        <p className="mention">{cycle.nom}</p>
        <div className="plan-entete-ligne">
          <h1 className="titre moyen" id={idTitre}>
            Phase {phase.ordre}{phase.accent ? ` · ${ETIQUETTES_ACCENT[phase.accent]}` : ''}
          </h1>
          <span className="donnee">{dateCourte(debutPhaseDate)} → {dateCourte(ajouterJours(debutPhaseDate, 27))}</span>
        </div>
        {phase.accent === null && <p className="annotation">Choisis l’accent de la phase dans la vue 12 semaines</p>}
        <div className="plan-actions">
          <button type="button" className="bouton principal centre" disabled={libre === null} onClick={() => libre && ajouter(libre)}>
            <strong>Ajouter une séance</strong>
          </button>
        </div>
        {libre === null && <p className="texte-3">Toutes les cases de la phase sont prises.</p>}
        <p className="texte-3">Les séances se lancent depuis ton téléphone.</p>
      </header>

      <div className="plan-selecteur pile">{selecteurVue}</div>

      <div className="choix trois phase-choix" role="group" aria-label="Phase à afficher">
        {phases.map((p) => (
          <button key={p.id} type="button" aria-pressed={p.ordre === phase.ordre} onClick={() => onChoisirPhase(p.ordre)}>
            Phase {p.ordre}{p.accent ? ` · ${ETIQUETTES_ACCENT[p.accent]}` : ''}
          </button>
        ))}
      </div>

      <BandeSemaines
        semaines={semainesAPlat(phases).map((s) => ({
          numero: s.numero, type: s.type,
          faite: ajouterJours(debutSemaine(cycle, { ordre: s.phase }, s.semaine), 6) < aujourdhui,
        }))}
        numeroEnCours={position?.numero ?? null}
        numeroOuvert={semaineOuverte}
        onChoisir={allerALaSemaine}
      />

      <section className="pile-large" aria-labelledby={idTitre}>
        {seancesPhase.length === 0 && <p className="annotation">Commence par la semaine 1</p>}
        <table className="phase-tableau">
          <caption className="cache">Séances de la phase {phase.ordre}, par semaine et par jour</caption>
          <thead>
            <tr>
              <th scope="col">Semaine</th>
              {JOURS_COURTS.map((j, i) => <th scope="col" key={j}><span aria-hidden="true">{j}</span><span className="cache">{JOURS_LONGS[i]}</span></th>)}
              <th scope="col">Charge</th>
            </tr>
          </thead>
          <tbody>
            {SEMAINES_DE_PHASE.map((semaine) => {
              const numero = (phase.ordre - 1) * 4 + semaine
              const type = phase.semaines.find((s) => s.numero === semaine)?.type ?? 'charge'
              const resume = resumeSemaine(seances, phase.id, semaine)
              const lundi = debutSemaine(cycle, phase, semaine)
              return (
                <tr key={semaine}
                  ref={(el) => { if (el) lignes.current.set(numero, el); else lignes.current.delete(numero) }}
                  tabIndex={-1}
                  className={`${type !== 'charge' ? 'allegee' : ''}${numero === position?.numero ? ' en-cours' : ''}`}
                  aria-current={numero === position?.numero ? 'date' : undefined}>
                  <th scope="row">
                    <span className="mention">S{numero}</span>
                    <span className="texte-3">{dateCourte(lundi)}</span>
                    {type !== 'charge' && <span className="etiquette contour">{ETIQUETTES_TYPE_SEMAINE[type]}</span>}
                  </th>
                  {JOURS_COURTS.map((_, jour) => {
                    const c: Case = { semaine, jour }
                    const dedans = dansLaCase(c)
                    const cle = `${semaine}-${jour}`
                    return (
                      <td key={jour} className={`case-jour${dateDeLaCase(cycle, phase, semaine, jour) === aujourdhui ? ' aujourdhui' : ''}`}>
                        {dedans.map((s) => (
                          <EtiquetteSeance key={s.id} seance={s} cycle={cycle} onDeplacer={() => setADeplacer(s)} />
                        ))}
                        {dedans.length === 0 && (
                          <button type="button" className="case-ajouter" aria-label={`Ajouter une séance, ${nomCase(c)}`} onClick={() => ajouter(c)}>
                            <Icone nom="ajouter" taille={20} />
                          </button>
                        )}
                        <MenuCase
                          ouvert={menu === cle}
                          nom={nomCase(c)}
                          droite={jour >= 3}
                          vide={dedans.length === 0}
                          peutColler={presse !== null}
                          onBasculer={() => setMenu(menu === cle ? null : cle)}
                          onFermer={() => setMenu(null)}
                          onAjouter={() => ajouter(c)}
                          onCopier={() => { setPresse(dedans[0]); setMessage(`Séance copiée : « ${dedans[0].solo.nom} ».`) }}
                          onColler={() => coller(c)}
                          onVider={() => setAVider({ cible: c, seances: dedans })}
                        />
                      </td>
                    )
                  })}
                  <td className="case-charge">
                    <span className="donnee">{resume.nb === 0 ? 'Aucune' : `${resume.nb} séance${resume.nb > 1 ? 's' : ''}`}</span>
                    <span className="texte-3">{formatDuree(resume.minutes) ?? '—'}{resume.dures > 0 ? ` · ${resume.dures} dure${resume.dures > 1 ? 's' : ''}` : ''}</span>
                    <div className="barre-charge" role="img" aria-label={resume.minutes === 0 ? 'Charge : aucune' : `Charge : ${resume.minutes} minutes`}>
                      <span style={{ width: `${Math.round(chargeRelative(resume.minutes, minutesMax) * 100)}%` }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="pile">
          <button type="button" className="bouton-second phase-recopier" disabled={nbSemaine1 === 0} aria-describedby={idNoteRecopie} onClick={recopier}>
            Recopier la semaine 1 sur les semaines 2 et 3
          </button>
          <p className="texte-3" id={idNoteRecopie}>{TEXTE_COPIE_IDENTIQUE}</p>
          {presse && <p className="texte-3">Dans le presse-papiers : « {presse.solo.nom} ». Utilise « Coller » dans le menu d’une case libre.</p>}
          <p className="mention" role="status" aria-live="polite">{message}</p>
        </div>
      </section>

      <Confirmation
        ouverte={aVider !== null}
        titre="Vider la case ?"
        texte={aVider ? `« ${aVider.seances.map((s) => s.solo.nom).join(' », « ')} » sera retirée du plan : ${nomCase(aVider.cible)}. Les séances déjà faites ne bougent pas.` : ''}
        libelleAction="Vider la case"
        onRester={() => setAVider(null)}
        onAction={() => {
          if (aVider) onChangerSeances({ ecrites: [], retirees: aVider.seances.map((s) => s.id) })
          setMessage('Case vidée.')
          setAVider(null)
        }}
      />

      {aDeplacer && (
        <DeplacerSeance
          seance={aDeplacer}
          cycle={cycle}
          phase={phase}
          seances={seances}
          onAnnuler={() => setADeplacer(null)}
          onDeplacer={(semaine, jour) => {
            onChangerSeances({ ecrites: [deplacerSurCase(aDeplacer, cycle, phase, semaine, jour)], retirees: [] })
            setMessage(`Séance déplacée : ${nomCase({ semaine, jour })}.`)
            setADeplacer(null)
          }}
        />
      )}
    </div>
  )
}

// L'étiquette compacte : dureté, icônes de version, nom, durée, et une ligne de contenu selon le niveau.
function EtiquetteSeance({ seance, cycle, onDeplacer }: { seance: SeancePlanifiee; cycle: Cycle; onDeplacer: () => void }) {
  const duree = formatDuree(dureeVersionSolo(seance.solo))
  return (
    <div className="seance-etiquette">
      <div className="seance-etiquette-tete">
        <span className={seance.solo.durete === 'dure' ? 'etiquette' : 'etiquette contour'}>{seance.solo.durete === 'dure' ? 'Dure' : 'Légère'}</span>
        <span className="seance-icones">
          <Icone nom="solo" taille={16} libelle="Version solo" />
          {seance.groupe && <Icone nom="groupe" taille={16} libelle="Version groupe" />}
        </span>
      </div>
      <p className="seance-nom">{seance.solo.nom}</p>
      <p className="texte-3">{duree ?? 'Durée libre'}</p>
      <p className="texte-3 seance-contenu">{ligneContenu(seance, cycle)}</p>
      <button type="button" className="bouton-discret" onClick={onDeplacer} aria-label={`Déplacer « ${seance.solo.nom} »`}>Déplacer</button>
    </div>
  )
}

// Menu de case : Ajouter, Copier, Coller, Vider. Échap ferme et rend le focus au bouton du menu.
function MenuCase({ ouvert, nom, droite, vide, peutColler, onBasculer, onFermer, onAjouter, onCopier, onColler, onVider }: {
  ouvert: boolean; nom: string; droite: boolean; vide: boolean; peutColler: boolean
  onBasculer: () => void; onFermer: () => void
  onAjouter: () => void; onCopier: () => void; onColler: () => void; onVider: () => void
}) {
  const conteneur = useRef<HTMLDivElement>(null)
  const declencheur = useRef<HTMLButtonElement>(null)
  const idMenu = useId()
  useEffect(() => {
    if (!ouvert) return
    const dehors = (e: MouseEvent) => { if (!conteneur.current?.contains(e.target as Node)) onFermer() }
    document.addEventListener('mousedown', dehors)
    return () => document.removeEventListener('mousedown', dehors)
  }, [ouvert, onFermer])
  const choisir = (action: () => void) => () => { onFermer(); declencheur.current?.focus(); action() }
  return (
    <div className="menu-case" ref={conteneur}
      onKeyDown={(e) => { if (e.key === 'Escape' && ouvert) { e.stopPropagation(); onFermer(); declencheur.current?.focus() } }}>
      <button ref={declencheur} type="button" className="menu-case-bouton" aria-expanded={ouvert} aria-controls={ouvert ? idMenu : undefined}
        aria-label={`Menu de la case, ${nom}`} onClick={onBasculer}>…</button>
      {ouvert && (
        <ul className={`menu-case-liste${droite ? ' droite' : ''}`} id={idMenu}>
          <li><button type="button" disabled={!vide} onClick={choisir(onAjouter)}>Ajouter une séance</button></li>
          <li><button type="button" disabled={vide} onClick={choisir(onCopier)}>Copier</button></li>
          <li><button type="button" disabled={!vide || !peutColler} onClick={choisir(onColler)}>Coller</button></li>
          <li><button type="button" disabled={vide} onClick={onVider}>Vider</button></li>
        </ul>
      )}
    </div>
  )
}

// Alternative au glisser-déposer (D-17) : choisir la semaine et le jour. On avertit sans bloquer,
// sauf une case déjà prise (une case = une séance).
function DeplacerSeance({ seance, cycle, phase, seances, onAnnuler, onDeplacer }: {
  seance: SeancePlanifiee; cycle: Cycle; phase: PhaseCycle; seances: SeancePlanifiee[]
  onAnnuler: () => void; onDeplacer: (semaine: NumeroSemaine, jour: number) => void
}) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const idTitre = useId()
  const idAide = useId()
  const jourActuel = Math.max(0, JOURS_COURTS.findIndex((_, j) => dateDeLaCase(cycle, phase, seance.semaine, j) === seance.date))
  const [semaine, setSemaine] = useState<NumeroSemaine>(seance.semaine)
  const [jour, setJour] = useState(jourActuel)
  useEffect(() => {
    const retour = document.activeElement as HTMLElement | null
    dialogue.current?.showModal()
    return () => { retour?.focus() }
  }, [])
  const memePlace = semaine === seance.semaine && jour === jourActuel
  const prise = !memePlace && seancesDeLaCase(seances, phase, cycle, semaine, jour).length > 0
  const aide = memePlace ? 'C’est déjà sa place.' : prise ? 'Cette case est déjà prise : choisis-en une libre.' : `Nouvelle place : ${JOURS_LONGS[jour]} de la semaine ${(phase.ordre - 1) * 4 + semaine}.`
  return (
    <dialog ref={dialogue} className="confirmation fenetre-large" aria-labelledby={idTitre} onCancel={(e) => { e.preventDefault(); onAnnuler() }}>
      <div className="fiche pile-large">
        <h2 id={idTitre} className="titre moyen">Déplacer « {seance.solo.nom} »</h2>
        <fieldset className="question">
          <legend className="libelle">Semaine</legend>
          <div className="choix quatre">
            {SEMAINES_DE_PHASE.map((n) => (
              <button key={n} type="button" aria-pressed={semaine === n} onClick={() => setSemaine(n)}>S{(phase.ordre - 1) * 4 + n}</button>
            ))}
          </div>
        </fieldset>
        <fieldset className="question">
          <legend className="libelle">Jour</legend>
          <div className="choix sept">
            {JOURS_COURTS.map((j, i) => (
              <button key={j} type="button" aria-pressed={jour === i} aria-label={JOURS_LONGS[i]} onClick={() => setJour(i)}>{j.slice(0, 3)}</button>
            ))}
          </div>
        </fieldset>
        <p className={prise ? 'message-erreur' : 'texte-3'} id={idAide} aria-live="polite">{aide}</p>
        <div className="confirmation-actions">
          <button type="button" className="bouton-second" onClick={onAnnuler}>Annuler</button>
          <button type="button" className="bouton principal centre" disabled={memePlace || prise} aria-describedby={idAide} onClick={() => onDeplacer(semaine, jour)}>
            <strong>Déplacer</strong>
          </button>
        </div>
      </div>
    </dialog>
  )
}
