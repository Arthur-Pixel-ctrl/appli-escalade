import { useEffect, useMemo, useRef, useState } from 'react'
import { useEnLigne } from '../compte/useEnLigne.ts'
import { BandeSemaines } from '../composants/BandeSemaines.tsx'
import { Avertissement } from '../composants/Avertissement.tsx'
import { Confirmation } from '../composants/Confirmation.tsx'
import { jourLocal } from '../donnees/base.ts'
import { dureeVersionSolo, niveauAffiche } from '../donnees/niveaux.ts'
import type { Profil } from '../donnees/profil.ts'
import type { SeancePlanifiee } from '../donnees/modele.ts'
import { annulerSaut, deplacerSeance, joursPossibles, sauterSeance, type StatutSeance } from '../donnees/plan.ts'
import { toutesLesFiches } from '../regles/index.ts'
import { nomDuJour, scinderMessage } from './bureau/avertissementsPlan.ts'
import { semaineDuJour } from './bureau/Plan.outils.ts'
import { casesDeLaBande, contenuDeLaSeance, ETIQUETTES_STATUT } from './bureau/TableauDeBord.outils.ts'
import {
  dateDuPlanConnu, formaterDuree, libelleDurete, majuscule, peutLancerGroupe, peutLancerSolo, sousTitreGroupe, sousTitreSolo,
} from './Aujourdhui.outils.ts'
import { useCompteLie, useDonneesTelephone, useSynchroEnCours } from './donneesTelephone.ts'
import { BoutonMode, Chargement, ContenuFiche, SansPlan } from './ElementsTelephone.tsx'
import type { DemandeLancement } from './lancement.ts'
import { avertissementsAutourDe, joursDeLaSemaineOuverte, mentionSemaine } from './Programme.outils.ts'

const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
const jourDuMois = (date: string) => String(Number(date.slice(8, 10)))

// Phrases sous l'aperçu d'une séance qu'on ne peut plus lancer : aucune ne propose de la rattraper (règle A3-6).
const PHRASES_STATUT: Partial<Record<StatutSeance, string>> = {
  manquee: 'Séance manquée. Elle n’est pas rattrapée : on continue le plan.',
  sautee: 'Séance sautée.',
}

interface Props {
  profil: Profil
  onLancer: (demande: DemandeLancement) => void
  onOuvrirSeance: (seanceId: string) => void
}

// Programme : le plan en cours, semaine par semaine. On le lit ici ; on le modifie sur ordinateur.
export function Programme({ profil, onLancer, onOuvrirSeance }: Props) {
  // Lue une seule fois à l'ouverture de l'écran.
  const [maintenant] = useState(() => new Date())
  const aujourdhui = jourLocal(maintenant)
  const enLigne = useEnLigne()
  const compteLie = useCompteLie()
  const synchroTourne = useSynchroEnCours()
  const { donnees, echec } = useDonneesTelephone(aujourdhui)
  const plan = donnees?.plan ?? null
  const position = useMemo(() => (plan ? semaineDuJour(plan.cycle, aujourdhui) : null), [plan, aujourdhui])
  const [choisie, setChoisie] = useState<number | null>(null)
  const [ouverteId, setOuverteId] = useState<string | null>(null)
  // Ce qui a été fait dans l'aperçu (« Séance déplacée… ») ou ce qui a échoué : propre à la séance ouverte.
  const [retour, setRetour] = useState<{ type: 'ok' | 'echec'; texte: string } | null>(null)
  const ouvrir = (id: string | null) => { setOuverteId(id); setRetour(null) }

  // Ce que le moteur dit de la semaine de la séance ouverte, avant comme après un déplacement : on avertit, on ne bloque rien.
  const avertissements = useMemo(() => {
    const cible = plan?.seances.find((x) => x.id === ouverteId)
    if (!donnees || !plan || !cible) return []
    return avertissementsAutourDe({
      cycle: plan.cycle, phases: plan.phases, seances: plan.seances, objectifs: donnees.objectifs, profil,
      ...(donnees.reglages ? { reglages: { reglesSecurite: donnees.reglages.reglesSecurite } } : {}),
      exercicesPerso: donnees.exercicesPerso, douleurs: donnees.douleurs, formes: donnees.formes, realisees: donnees.realisees,
      aujourdhui, maintenant: maintenant.toISOString(),
    }, cible)
  }, [donnees, plan, ouverteId, profil, aujourdhui, maintenant])

  if (!donnees) {
    if (!echec) return <Chargement titre="Chargement de ton plan…" />
    return (
      <main className="ecran">
        <Avertissement niveau="avertissement" titre="Ton plan ne s’est pas chargé">Ferme complètement l’app puis rouvre-la.</Avertissement>
      </main>
    )
  }
  if (!plan) {
    return (
      <main className="ecran" aria-labelledby="titre-jour">
        <SansPlan grimpeSouventEnGroupe={profil.grimpeSouventEnGroupe} enAttente={synchroTourne} onLancer={onLancer} />
      </main>
    )
  }

  const { cycle, phases, seances } = plan
  const { realisees } = donnees
  // Par défaut, la semaine du jour (le cycle en cours en contient toujours une).
  const numero = choisie ?? position?.numero ?? 1
  const semaines = casesDeLaBande(cycle, phases, aujourdhui)
  const jours = joursDeLaSemaineOuverte(cycle, phases, seances, realisees, numero, aujourdhui)
  const habituel = profil.grimpeSouventEnGroupe ? 'groupe' : 'solo'
  const planAJour = !enLigne && <p className="mention">Plan à jour au {dateCourte.format(new Date(dateDuPlanConnu(cycle, seances)))}</p>

  // ——— Aperçu d'une séance ———
  const ouverte = ouverteId ? jours.flatMap((j) => j.lignes).find((l) => l.seance.id === ouverteId) : undefined
  if (ouverte) {
    const { seance, statut } = ouverte
    const contenu = contenuDeLaSeance(seance, cycle, toutesLesFiches(donnees.exercicesPerso))
    const niveau = niveauAffiche(seance, cycle)
    const duree = dureeVersionSolo(seance.solo)
    const realisee = realisees.find((r) => !r.supprimeLe && r.seancePlanifieeId === seance.id)
    return (
      <main className="ecran" aria-labelledby="titre-programme">
        <div className="pile">
          <button className="bouton-discret retour" onClick={() => ouvrir(null)}>← Retour à la semaine</button>
          <p className="mention">{majuscule(nomDuJour(seance.date))} {jourDuMois(seance.date)} · {ETIQUETTES_STATUT[statut]}</p>
          <h1 className="titre moyen" id="titre-programme">{seance.solo.nom}</h1>
        </div>
        <article className="fiche" aria-label="Version seul">
          <span className="vis g" aria-hidden="true" />
          <span className="vis d" aria-hidden="true" />
          <div className="fiche-tete">
            <span className="etiquette">{libelleDurete(seance.solo.durete)}</span>
            {duree > 0 && <span className="donnee">{formaterDuree(duree)}</span>}
          </div>
          <ContenuFiche contenu={contenu} />
        </article>
        {seance.groupe && (
          <section className="pile" aria-labelledby="titre-groupe">
            <h2 className="sous-titre" id="titre-groupe">Version en groupe</h2>
            <ul className="liste-simple">
              {seance.groupe.objectifs.map((o) => <li key={o.libelle}>{o.libelle}</li>)}
            </ul>
          </section>
        )}
        {(statut === 'aujourdhui' || statut === 'a_venir') && avertissements.length > 0 && (
          <div className="pile">
            {avertissements.map(({ avertissement: a, forme, garde }) => {
              const { titre, suite } = scinderMessage(a.message)
              return <Avertissement key={`${a.code}|${a.message}`} niveau={forme} titre={titre} replie={garde}>{suite || undefined}</Avertissement>
            })}
          </div>
        )}
        {(statut === 'aujourdhui' || statut === 'a_venir') ? (
          <>
            <LancerCetteSeance seance={seance} habituel={habituel} niveau={niveau} onLancer={onLancer} />
            <Ajustements seance={seance} sautee={false} aujourdhui={aujourdhui} compteLie={compteLie} retour={retour} onRetour={setRetour} />
          </>
        ) : (
          <div className="pile">
            {PHRASES_STATUT[statut] && !(statut === 'sautee' && retour) && <p className="texte-2">{PHRASES_STATUT[statut]}</p>}
            {statut === 'sautee' && seance.date >= aujourdhui && (
              <Ajustements seance={seance} sautee aujourdhui={aujourdhui} compteLie={compteLie} retour={retour} onRetour={setRetour} />
            )}
            {statut === 'faite' && realisee && (
              <button className="bouton-second" onClick={() => onOuvrirSeance(realisee.id)}>Revoir le débrief</button>
            )}
          </div>
        )}
      </main>
    )
  }

  // ——— La semaine ———
  return (
    <main className="ecran" aria-labelledby="titre-programme">
      <div className="pile">
        <p className="mention">{cycle.nom}</p>
        <h1 className="titre" id="titre-programme">Programme</h1>
        {planAJour}
      </div>

      <div className="bande-telephone">
        <BandeSemaines semaines={semaines} numeroEnCours={position?.numero ?? null} numeroOuvert={numero} onChoisir={setChoisie} />
      </div>

      <section className="pile" aria-labelledby="titre-semaine-ouverte">
        <h2 className="titre moyen" id="titre-semaine-ouverte">Semaine {numero} sur {cycle.nbSemaines}</h2>
        <p className="mention">{mentionSemaine(phases, numero)}</p>
        <div className="deux-boutons egaux">
          <button className="bouton-second" disabled={numero <= 1} onClick={() => setChoisie(numero - 1)}>Semaine précédente</button>
          <button className="bouton-second" disabled={numero >= cycle.nbSemaines} onClick={() => setChoisie(numero + 1)}>Semaine suivante</button>
        </div>
        <ol className="semaine-jours">
          {jours.map((j) => (
            <li key={j.date} className={`jour-ligne${j.date === aujourdhui ? ' aujourdhui' : ''}`} aria-current={j.date === aujourdhui ? 'date' : undefined}>
              <div className="jour-nom">
                <span className="mention">{j.nom}</span>
                <span className="donnee">{jourDuMois(j.date)}</span>
              </div>
              {j.lignes.length === 0 ? (
                <div className="jour-repos"><span className="texte-2">Repos</span></div>
              ) : (
                <div className="pile">
                  {j.lignes.map(({ seance, statut }) => (
                    <button key={seance.id} className="bouton" onClick={() => ouvrir(seance.id)}>
                      <strong>{seance.solo.nom}</strong>
                      <span>{libelleDurete(seance.solo.durete)} · {ETIQUETTES_STATUT[statut]}</span>
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <p className="texte-3">Pour modifier le reste de ton plan, ouvre l’app sur un ordinateur.</p>
    </main>
  )
}

// « Faire cette séance maintenant » : le mode habituel d'abord, l'autre en bouton second s'il existe.
function LancerCetteSeance({ seance, habituel, niveau, onLancer }: {
  seance: SeancePlanifiee
  habituel: 'solo' | 'groupe'
  niveau: Parameters<typeof sousTitreSolo>[0]
  onLancer: (demande: DemandeLancement) => void
}) {
  const disponibles = { solo: peutLancerSolo(seance), groupe: peutLancerGroupe(seance) }
  const modes = ([habituel, habituel === 'groupe' ? 'solo' : 'groupe'] as const).filter((m) => disponibles[m])
  if (modes.length === 0) return <p className="texte-2">Cette séance n’a pas encore d’étapes. Complète-la sur ordinateur.</p>
  return (
    <div className="pile">
      {modes.map((mode, i) => (
        <BoutonMode
          key={mode}
          mode={mode}
          principal={i === 0}
          titre={i === 0 ? 'Faire cette séance maintenant' : mode === 'solo' ? 'La faire seul' : 'La faire en groupe'}
          sousTitre={mode === 'solo' ? `Seul : ${sousTitreSolo(niveau).toLowerCase()}` : `En groupe : ${sousTitreGroupe(seance.groupe!)}`}
          onClick={() => onLancer({ type: 'plan', seance, mode })}
        />
      ))}
    </div>
  )
}

// Déplacer ou sauter (B11) : les seuls changements permis sur téléphone. Les données se relisent seules après l'écriture.
function Ajustements({ seance, sautee, aujourdhui, compteLie, retour, onRetour }: {
  seance: SeancePlanifiee
  sautee: boolean
  aujourdhui: string
  compteLie: boolean
  retour: { type: 'ok' | 'echec'; texte: string } | null
  onRetour: (r: { type: 'ok' | 'echec'; texte: string } | null) => void
}) {
  const [choixDuJour, setChoixDuJour] = useState(false)
  const [confirmerSaut, setConfirmerSaut] = useState(false)
  const zoneRetour = useRef<HTMLParagraphElement>(null)
  const jours = joursPossibles(seance, aujourdhui)

  // Après une action, le focus va sur le message : le bouton touché a disparu, on ne veut pas perdre le clavier.
  useEffect(() => { if (retour) zoneRetour.current?.focus() }, [retour])

  async function agir(action: () => Promise<void>, texteOk: string) {
    try {
      await action()
      onRetour({ type: 'ok', texte: texteOk })
    } catch {
      onRetour({ type: 'echec', texte: 'Le changement n’a pas été enregistré. Réessaie.' })
    }
    setChoixDuJour(false)
  }

  return (
    <div className="pile">
      {retour?.type === 'echec' && <Avertissement niveau="avertissement" titre={retour.texte} />}
      {retour?.type === 'ok' && (
        <p className="texte-2" role="status" tabIndex={-1} ref={zoneRetour}>
          {retour.texte}{compteLie ? ' Ce changement sera aussi visible sur ton ordinateur.' : ''}
        </p>
      )}
      {sautee ? (
        <button className="bouton-second" aria-label="Annuler le saut de cette séance" onClick={() => void agir(() => annulerSaut(seance.id), 'Saut annulé.')}>Annuler</button>
      ) : choixDuJour ? (
        <div className="pile" role="group" aria-label="Déplacer cette séance au…">
          {jours.map((jour) => (
            <button
              key={jour}
              className="bouton-second"
              onClick={() => void agir(() => deplacerSeance(seance.id, jour, aujourdhui), `Séance déplacée à ${nomDuJour(jour)} ${jourDuMois(jour)}.`)}
            >
              {nomDuJour(jour)} {jourDuMois(jour)}
            </button>
          ))}
          <button className="bouton-discret" onClick={() => setChoixDuJour(false)}>Annuler</button>
        </div>
      ) : (
        <div className="deux-boutons egaux">
          {jours.length > 0 && <button className="bouton-second" onClick={() => { onRetour(null); setChoixDuJour(true) }}>Déplacer</button>}
          <button className="bouton-second" onClick={() => setConfirmerSaut(true)}>Sauter cette séance</button>
        </div>
      )}
      <Confirmation
        ouverte={confirmerSaut}
        titre="Sauter cette séance ?"
        texte="Elle ne sera pas rattrapée : on continue le plan. Tu pourras annuler jusqu’à la fin de son jour."
        libelleAction="Sauter la séance"
        libelleRester="Garder la séance"
        onAction={() => { setConfirmerSaut(false); void agir(() => sauterSeance(seance.id), 'Séance sautée.') }}
        onRester={() => setConfirmerSaut(false)}
      />
    </div>
  )
}
