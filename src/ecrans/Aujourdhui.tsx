import { useEffect, useMemo, useState } from 'react'
import { comptesDisponibles } from '../compte/client.ts'
import { useSession } from '../compte/session.ts'
import { useEnLigne } from '../compte/useEnLigne.ts'
import { Avertissement } from '../composants/Avertissement.tsx'
import { jourLocal } from '../donnees/base.ts'
import { chiffresBlocs } from '../donnees/debrief.ts'
import { dureeVersionSolo, niveauAffiche } from '../donnees/niveaux.ts'
import { ZONES, type Profil } from '../donnees/profil.ts'
import { lireEtat, surDonneesChangees, surEcriture } from '../donnees/stockage.ts'
import { toutesLesFiches } from '../regles/index.ts'
import { etatSynchroCourt, surEtatSynchro, synchroEnCours } from '../synchro/automatique.ts'
import { compterEnAttente } from '../synchro/synchro.ts'
import { nomDuJour, scinderMessage } from './bureau/avertissementsPlan.ts'
import { contenuDeLaSeance } from './bureau/TableauDeBord.outils.ts'
import {
  avertissementsDeLaSeance, dateDuPlanConnu, formaterDuree, joursDeLaSemaine, libelleDurete, majuscule, mentionPhase,
  peutLancerGroupe, peutLancerSolo, prochaineAVenir, seanceManquee, sousTitreGroupe, sousTitreSolo, vueDuJour,
  type EtatJour,
} from './Aujourdhui.outils.ts'
import { useDonneesTelephone, useSynchroEnCours } from './donneesTelephone.ts'
import { BoutonMode, Chargement, ContenuFiche, SansPlan } from './ElementsTelephone.tsx'
import type { DemandeLancement } from './lancement.ts'

// Le bandeau « crée ton compte » masqué par le « × » le reste jusqu'à la fermeture de l'app (pas d'un onglet à l'autre).
let invitationMasquee = false

// La mention « À JOUR », « HORS LIGNE »… : seulement si l'appareil est lié à un compte (sinon rien n'est envoyé).
function useMentionSynchro(userId: string | null): string | null {
  const enLigne = useEnLigne()
  const [lie, setLie] = useState(false)
  const [enAttente, setEnAttente] = useState(0)
  const [enCours, setEnCours] = useState(synchroEnCours())
  useEffect(() => {
    if (!comptesDisponibles || !userId) return
    let actif = true
    const relire = () => {
      setEnCours(synchroEnCours())
      lireEtat<string | null>('compteId').then((id) => { if (actif) setLie(id === userId) }).catch(() => {})
      compterEnAttente().then((n) => { if (actif) setEnAttente(n) }).catch(() => {})
    }
    relire()
    const arrets = [surEtatSynchro(relire), surEcriture(relire), surDonneesChangees(relire)]
    return () => { actif = false; arrets.forEach((arreter) => arreter()) }
  }, [userId])
  if (!comptesDisponibles || !userId || !lie) return null
  return etatSynchroCourt({ enLigne, enCours, enAttente })
}


interface Props {
  profil: Profil
  onCompte: () => void
  onLancer: (demande: DemandeLancement) => void
  /** Revoir le débrief d'une séance déjà faite. */
  onOuvrirSeance: (seanceId: string) => void
  onMisesEnGarde: () => void
  onVoirProgramme: () => void
}

const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
const MARQUES: Record<EtatJour, string> = {
  fait: 'coche', aujourdhui: 'point', prevu: 'carre', repos: 'tiret', manque: 'pointille', saute: 'tiret',
}

// Aujourd'hui : la séance prévue par le plan en cours, ou le repos, ou une séance libre s'il n'y a pas de plan.
export function Aujourdhui({ profil, onCompte, onLancer, onOuvrirSeance, onMisesEnGarde, onVoirProgramme }: Props) {
  const session = useSession()
  const mentionSynchro = useMentionSynchro(session.userId)
  const [invitationVisible, setInvitationVisible] = useState(!invitationMasquee)
  const afficherInvitation = comptesDisponibles && !session.chargement && session.userId === null && invitationVisible
  // Lue une seule fois à l'ouverture de l'écran.
  const [maintenant] = useState(() => new Date())
  const aujourdhui = jourLocal(maintenant)
  const date = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(maintenant)
  const enLigne = useEnLigne()
  const synchroTourne = useSynchroEnCours()
  const { donnees, echec } = useDonneesTelephone(aujourdhui)

  const plan = donnees?.plan ?? null
  const vue = useMemo(() => (donnees && plan ? vueDuJour(plan.seances, donnees.realisees, aujourdhui) : null), [donnees, plan, aujourdhui])
  // Ce que le moteur dit de la semaine, gardé pour la séance du jour : on avertit, on ne bloque rien.
  const avertissements = useMemo(() => {
    if (!donnees || !plan || vue?.type !== 'seance') return []
    return avertissementsDeLaSeance({
      cycle: plan.cycle, phases: plan.phases, seances: plan.seances, objectifs: donnees.objectifs, profil,
      ...(donnees.reglages ? { reglages: { reglesSecurite: donnees.reglages.reglesSecurite } } : {}),
      exercicesPerso: donnees.exercicesPerso, douleurs: donnees.douleurs, formes: donnees.formes, realisees: donnees.realisees,
      aujourdhui, maintenant: maintenant.toISOString(),
    }, vue.seance.id)
  }, [donnees, plan, vue, profil, aujourdhui, maintenant])

  if (!donnees) {
    if (!echec) return <Chargement titre="Chargement de ton plan…" />
    return (
      <main className="ecran">
        <Avertissement niveau="avertissement" titre="Ton plan ne s’est pas chargé">Ferme complètement l’app puis rouvre-la.</Avertissement>
      </main>
    )
  }

  const invitation = afficherInvitation && (
    <div className="invitation-compte">
      <button className="invitation-texte" onClick={onCompte}>Crée ton compte pour retrouver ton plan sur ordinateur</button>
      <button className="invitation-fermer" aria-label="Masquer cette invitation" onClick={() => { invitationMasquee = true; setInvitationVisible(false) }}>×</button>
    </div>
  )
  const ligneDate = (
    <div className="ligne-date">
      <p className="mention">{majuscule(date)}</p>
      {mentionSynchro && <p className="mention" role="status" aria-live="polite">{mentionSynchro}</p>}
    </div>
  )
  // Une douleur déclarée dans le profil : signal d'arrêt tout en haut, quel que soit l'état de l'écran.
  const zones = profil.douleursEnCours.map((z) => ZONES.find((x) => x.valeur === z)?.nom.toLowerCase() ?? z)
  const signalDouleur = zones.length > 0 && (
    <Avertissement
      niveau="arret"
      titre={`Douleur déclarée : ${zones.join(', ')}.`}
      correction={{ libelle: 'Voir les mises en garde', action: onMisesEnGarde }}
    >
      Ménage cette zone et arrête-toi dès que ça fait mal.
    </Avertissement>
  )

  if (!plan || !vue) {
    return (
      <main className="ecran" aria-labelledby="titre-jour">
        {invitation}
        {ligneDate}
        {signalDouleur}
        <SansPlan grimpeSouventEnGroupe={profil.grimpeSouventEnGroupe} enAttente={synchroTourne} onLancer={onLancer} />
      </main>
    )
  }

  const { cycle, phases, seances } = plan
  const { realisees } = donnees
  const mention = mentionPhase(cycle, phases, aujourdhui)
  const manquee = seanceManquee(seances, realisees, aujourdhui)
  const prochaine = prochaineAVenir(seances, realisees, aujourdhui)
  const habituel = profil.grimpeSouventEnGroupe ? 'groupe' : 'solo'
  const libre = () => onLancer({ type: 'libre', mode: habituel })

  const entete = (titre: string) => (
    <div className="pile">
      {ligneDate}
      {mention && <p className="mention">{mention.phase}{mention.type && <> · <b>{mention.type}</b></>}</p>}
      {!enLigne && <p className="mention">Plan à jour au {dateCourte.format(new Date(dateDuPlanConnu(cycle, seances)))}</p>}
      <h1 className="titre" id="titre-jour">{titre}</h1>
    </div>
  )
  const infoManquee = manquee && (
    <Avertissement niveau="information" titre={`Séance de ${manquee.jour} pas faite.`}>Elle n’est pas rattrapée : on continue le plan.</Avertissement>
  )

  const semaine = (
    <section className="pile" aria-labelledby="titre-semaine">
      <h2 className="mention" id="titre-semaine">Cette semaine</h2>
      <ul className="semaine" aria-label="Séances de la semaine">
        {joursDeLaSemaine(seances, realisees, aujourdhui).map((c) => (
          <li key={c.date} className={`jour ${c.etat}`} aria-label={c.libelle}>
            <b aria-hidden="true">{c.initiale}</b>
            <i className={`marque ${MARQUES[c.etat]}`} aria-hidden="true" />
          </li>
        ))}
      </ul>
      {/* Au repos, la phrase du haut dit déjà la prochaine séance. */}
      {prochaine && vue.type !== 'repos' && (
        <p className="texte-2">Prochaine : {nomDuJour(prochaine.date)}, {prochaine.solo.nom} ({prochaine.solo.durete === 'dure' ? 'dure' : 'légère'})</p>
      )}
    </section>
  )

  // ——— Séance déjà faite ———
  if (vue.type === 'faite') {
    const r = vue.realisee
    const groupe = r.mode === 'groupe'
    const blocs = chiffresBlocs(r)
    return (
      <main className="ecran" aria-labelledby="titre-jour">
        {invitation}
        {signalDouleur}
        {entete('Séance faite')}
        <p className="texte-2">{vue.seance.solo.nom}</p>
        <div className="chiffres-cles chiffres">
          {groupe
            ? <div><b className="accent">{blocs.enchaines}/{blocs.tentes}</b><span>blocs enchaînés</span></div>
            : <div><b className="accent">{r.etapes.filter((e) => e.statut === 'faite').length}/{r.etapes.length}</b><span>étapes faites</span></div>}
          <div><b>{r.dureeMin}</b><span>minutes</span></div>
          <div><b>{r.effortPercu}/10</b><span>effort</span></div>
        </div>
        <button className="bouton principal centre" onClick={() => onOuvrirSeance(r.id)}><strong>Revoir le débrief</strong></button>
        {infoManquee}
        {semaine}
      </main>
    )
  }

  // ——— Repos ———
  if (vue.type === 'repos') {
    return (
      <main className="ecran" aria-labelledby="titre-jour">
        {invitation}
        {signalDouleur}
        {entete('Repos')}
        {vue.sautee && <Avertissement niveau="information" titre="Séance sautée." />}
        {infoManquee}
        <p className="texte-2">
          {prochaine ? `Prochaine séance : ${nomDuJour(prochaine.date)}, ${prochaine.solo.nom}.` : 'Aucune autre séance prévue dans ce cycle.'}
        </p>
        <div className="pile">
          <button className="bouton principal centre" onClick={onVoirProgramme}><strong>Voir la semaine</strong></button>
          <button className="bouton-texte" onClick={libre}>Faire une séance quand même</button>
        </div>
        {semaine}
      </main>
    )
  }

  // ——— Séance du jour ———
  const seance = vue.seance
  const contenu = contenuDeLaSeance(seance, cycle, toutesLesFiches(donnees.exercicesPerso))
  const duree = dureeVersionSolo(seance.solo)
  const niveau = niveauAffiche(seance, cycle)
  const disponibles = { solo: peutLancerSolo(seance), groupe: peutLancerGroupe(seance) }
  // Le mode habituel du profil est le bouton principal (le seul en résine) s'il existe pour cette séance.
  const modes = ([habituel, habituel === 'groupe' ? 'solo' : 'groupe'] as const).filter((m) => disponibles[m])
  return (
    <main className="ecran" aria-labelledby="titre-jour">
      {invitation}
      {signalDouleur}
      {entete(seance.solo.nom)}
      {infoManquee}

      {avertissements.length > 0 && (
        <div className="pile">
          {avertissements.map(({ avertissement: a, forme, garde }) => {
            const { titre, suite } = scinderMessage(a.message)
            return <Avertissement key={`${a.code}|${a.message}`} niveau={forme} titre={titre} replie={garde}>{suite || undefined}</Avertissement>
          })}
        </div>
      )}

      <article className="fiche" aria-label="Séance du jour">
        <span className="vis g" aria-hidden="true" />
        <span className="vis d" aria-hidden="true" />
        <div className="fiche-tete">
          <span className="etiquette">{libelleDurete(seance.solo.durete)}</span>
          {duree > 0 && <span className="donnee">{formaterDuree(duree)}</span>}
        </div>
        <ContenuFiche contenu={contenu} />
      </article>

      <div className="pile">
        {modes.map((mode, i) => (
          <BoutonMode
            key={mode}
            mode={mode}
            principal={i === 0}
            sousTitre={mode === 'solo' ? sousTitreSolo(niveau) : sousTitreGroupe(seance.groupe!)}
            onClick={() => onLancer({ type: 'plan', seance, mode })}
          />
        ))}
        {modes.length === 0 && (
          <>
            <p className="texte-2">Cette séance n’a pas encore d’étapes. Complète-la sur ordinateur, ou fais une séance libre.</p>
            <button className="bouton-texte" onClick={libre}>Faire une séance libre</button>
          </>
        )}
      </div>

      {/* Forme du jour : revient en phase 4, utile aux contrôles du jour (tâche C-03, décision B10). */}

      {semaine}
    </main>
  )
}
