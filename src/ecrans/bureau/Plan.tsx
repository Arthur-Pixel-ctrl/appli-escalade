import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Avertissement } from '../../composants/Avertissement.tsx'
import { jourLocal, lireProfil } from '../../donnees/base.ts'
import type { AccentPhase, Cycle, DouleurDeclaree, ExercicePerso, FormeDuJour, NiveauDetail, ObjectifSpecifique, PhaseCycle, Profil, Reglages, SeancePlanifiee, SeanceRealisee } from '../../donnees/modele.ts'
import { PROFIL_VIDE } from '../../donnees/profil.ts'
import { enregistrerCycle, enregistrerPhase, enregistrerSeancePlanifiee, lireCycles, lireExercicesPerso, lirePlanDuCycle, supprimerCycle } from '../../donnees/plan.ts'
import { ecrire, lireTous, lireUn, supprimer, surDonneesChangees } from '../../donnees/stockage.ts'
import { genererCycle } from '../../regles/index.ts'
import { AUCUN_AVERTISSEMENT, avecGarde, calculerAvertissements, decalerAuLendemain, ranger } from './avertissementsPlan.ts'
import { NouveauCycle } from './NouveauCycle.tsx'
import { phraseBandeauPlanPropose } from './NouveauCycle.outils.ts'
import { cycleAMontrer, nouveauCycleVide, type DemandeCycle } from './Plan.outils.ts'
import { positionDeLaSemaine, semaineAChange } from './VueSemaine.outils.ts'
import { VueCycle, type ObjectifChoisi } from './VueCycle.tsx'
import { VuePhase, type ChangementSeances } from './VuePhase.tsx'
import { VueSemaine } from './VueSemaine.tsx'

const DELAI_NOUVEL_ESSAI_MS = 5000

type Vue = 'cycle' | 'phase' | 'semaine'

const borner = (numero: number, max: number) => Math.min(Math.max(1, Math.round(numero)), max)

// Choix de vue (encre = sélectionné).
function SelecteurVue({ vue, onChoisir }: { vue: Vue; onChoisir: (v: Vue) => void }) {
  return (
    <div className="choix trois" role="group" aria-label="Vue du plan">
      <button type="button" aria-pressed={vue === 'cycle'} onClick={() => onChoisir('cycle')}>12 semaines</button>
      <button type="button" aria-pressed={vue === 'phase'} onClick={() => onChoisir('phase')}>Phase</button>
      <button type="button" aria-pressed={vue === 'semaine'} onClick={() => onChoisir('semaine')}>Semaine</button>
    </div>
  )
}

interface Donnees {
  cycle: Cycle
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  objectifs: ObjectifSpecifique[]
}

async function lireDonnees(): Promise<Donnees | null> {
  const cycle = cycleAMontrer(await lireCycles())
  if (!cycle) return null
  const { phases, seances } = await lirePlanDuCycle(cycle.id)
  const ids = new Set(phases.map((p) => p.id))
  const objectifs = (await lireTous<ObjectifSpecifique>('objectifsSpecifiques')).filter((o) => ids.has(o.phaseId))
  return { cycle, phases, seances, objectifs }
}

// Ce que le moteur a besoin de savoir en plus du plan : douleurs, forme du jour, séances faites, réglages, exercices perso.
interface DonneesMoteur {
  exercicesPerso: ExercicePerso[]
  douleurs: DouleurDeclaree[]
  formes: FormeDuJour[]
  realisees: SeanceRealisee[]
  reglages: Reglages | undefined
  maintenant: string // l'instant de la lecture : le moteur n'a pas d'horloge
}

async function lireDonneesMoteur(): Promise<DonneesMoteur> {
  const [exercicesPerso, douleurs, formes, realisees, reglages] = await Promise.all([
    lireExercicesPerso(), lireTous<DouleurDeclaree>('douleurs'), lireTous<FormeDuJour>('formes'),
    lireTous<SeanceRealisee>('seancesRealisees'), lireUn<Reglages>('reglages', 'reglages'),
  ])
  return { exercicesPerso, douleurs, formes, realisees, reglages, maintenant: new Date().toISOString() }
}

// Rubrique Plan (ordinateur) : le cycle de 12 semaines. Les écritures passent par `src/donnees/plan.ts`.
// `onOuvrirProfil` : ouvre la rubrique Profil (donné par la mise en page) ; sans lui, la fenêtre n'affiche pas le lien.
// `semaineInitiale` : ouvre le Plan en vue Semaine sur ce numéro (borné au cycle) ; sans elle, rien ne change.
export function Plan({ onOuvrirProfil, semaineInitiale }: { onOuvrirProfil?: () => void; semaineInitiale?: number } = {}) {
  const [donnees, setDonnees] = useState<Donnees | null | undefined>(undefined) // undefined = chargement
  const [echecLecture, setEchecLecture] = useState(false)
  const [echecEcriture, setEchecEcriture] = useState(false)
  const [nouveau, setNouveau] = useState(false)
  const [vue, setVue] = useState<Vue>(semaineInitiale !== undefined ? 'semaine' : 'cycle')
  const [ordrePhase, setOrdrePhase] = useState<1 | 2 | 3>(semaineInitiale !== undefined ? positionDeLaSemaine(borner(semaineInitiale, 12)).ordre : 1)
  const [numeroSemaine, setNumeroSemaine] = useState(semaineInitiale !== undefined ? borner(semaineInitiale, 12) : 1)
  const [changeSurTelephone, setChangeSurTelephone] = useState(false)
  // La demande du Tableau de bord change alors que le Plan est déjà là : il suit. On compare pendant l'affichage
  // (et non dans un effet) pour ne pas faire un second affichage.
  const [semaineVue, setSemaineVue] = useState(semaineInitiale)
  if (semaineInitiale !== semaineVue) {
    setSemaineVue(semaineInitiale)
    if (semaineInitiale !== undefined) {
      setNumeroSemaine(borner(semaineInitiale, 12))
      setOrdrePhase(positionDeLaSemaine(borner(semaineInitiale, 12)).ordre)
      setVue('semaine')
    }
  }
  const vueRef = useRef<Vue>(semaineInitiale !== undefined ? 'semaine' : 'cycle')
  const numeroRef = useRef(semaineInitiale !== undefined ? borner(semaineInitiale, 12) : 1)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [moteur, setMoteur] = useState<DonneesMoteur | null>(null)
  // Ce que le générateur vient de proposer : montré en tête de la vue 12 semaines (jamais bloquant).
  const [planPropose, setPlanPropose] = useState<{ cycleId: string; phrase: string; manques: string[] } | null>(null)
  // Les écritures en attente, une par document : un changement n'est jamais perdu, il est retenté.
  const enAttente = useRef(new Map<string, () => Promise<void>>())
  const minuteur = useRef<number | undefined>(undefined)

  const recharger = useCallback(() => {
    lireDonnees().then((d) => { setDonnees(d); setEchecLecture(false); setChangeSurTelephone(false) }).catch(() => setEchecLecture(true))
  }, [])
  useEffect(() => {
    recharger()
    lireProfil().then(setProfil).catch(() => {})
    const lireMoteur = () => lireDonneesMoteur().then(setMoteur).catch(() => {})
    void lireMoteur()
    const arreterMoteur = surDonneesChangees(() => { void lireMoteur() })
    // Un changement venu d'un autre appareil : dans la vue Semaine, on ne remplace pas ce que tu édites,
    // on le signale si la semaine affichée a changé (la dernière modification gagne).
    const arreterPlan = surDonneesChangees(() => {
      if (enAttente.current.size > 0) return
      lireDonnees().then((d) => {
        setEchecLecture(false)
        setDonnees((ancien) => {
          if (vueRef.current === 'semaine' && ancien && d && semaineAChange(ancien, d, numeroRef.current)) {
            setChangeSurTelephone(true)
            return ancien
          }
          return d
        })
      }).catch(() => setEchecLecture(true))
    })
    return () => { arreterMoteur(); arreterPlan() }
  }, [recharger])
  useEffect(() => { vueRef.current = vue; numeroRef.current = numeroSemaine }, [vue, numeroSemaine])
  useEffect(() => () => window.clearTimeout(minuteur.current), [])

  const viderLaFile = useCallback(async function vider() {
    for (const [cle, ecriture] of [...enAttente.current]) {
      try { await ecriture(); enAttente.current.delete(cle) } catch { /* elle reste en file, on réessaie */ }
    }
    setEchecEcriture(enAttente.current.size > 0)
    if (enAttente.current.size > 0) minuteur.current = window.setTimeout(() => void vider(), DELAI_NOUVEL_ESSAI_MS)
  }, [])
  const sauver = (cle: string, ecriture: () => Promise<void>) => {
    enAttente.current.set(cle, ecriture)
    window.clearTimeout(minuteur.current)
    void viderLaFile()
  }

  // Chaque changement s'affiche tout de suite, puis s'enregistre.
  const changerCycle = (c: Cycle) => {
    setDonnees((d) => d && { ...d, cycle: c })
    sauver(`cycle-${c.id}`, () => enregistrerCycle(c))
  }
  const changerPhase = (p: PhaseCycle) => {
    setDonnees((d) => d && { ...d, phases: d.phases.map((x) => (x.id === p.id ? p : x)) })
    sauver(`phase-${p.id}`, () => enregistrerPhase(p))
  }
  const changerObjectifs = (phaseId: string, choisis: ObjectifChoisi[]) => {
    if (!donnees) return
    const maintenant = new Date().toISOString()
    const anciens = donnees.objectifs.filter((o) => o.phaseId === phaseId)
    // Un objectif déjà là (même fiche, même libellé) garde son identifiant ; les autres sont nouveaux.
    const nouveaux: ObjectifSpecifique[] = choisis.map((c) => anciens.find((o) => o.modeleId === c.modeleId && o.libelle === c.libelle) ?? {
      id: crypto.randomUUID(), versionFormat: 1, creeLe: maintenant, modifieLe: maintenant, phaseId, libelle: c.libelle,
      ...(c.modeleId ? { modeleId: c.modeleId } : {}),
    })
    const retires = anciens.filter((o) => !nouveaux.some((n) => n.id === o.id))
    const ajoutes = nouveaux.filter((n) => !anciens.some((o) => o.id === n.id))
    setDonnees((d) => d && { ...d, objectifs: [...d.objectifs.filter((o) => o.phaseId !== phaseId), ...nouveaux] })
    sauver(`objectifs-${phaseId}`, async () => {
      for (const o of retires) await supprimer('objectifsSpecifiques', o.id)
      for (const o of ajoutes) await ecrire('objectifsSpecifiques', o)
    })
  }
  // Séances posées, copiées, déplacées ou retirées depuis la vue Phase.
  const changerSeances = ({ ecrites, retirees }: ChangementSeances) => {
    setDonnees((d) => {
      if (!d) return d
      const gardees = d.seances.filter((s) => !retirees.includes(s.id) && !ecrites.some((e) => e.id === s.id))
      return { ...d, seances: [...gardees, ...ecrites].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)) }
    })
    for (const s of ecrites) sauver(`seance-${s.id}`, () => enregistrerSeancePlanifiee(s))
    for (const id of retirees) sauver(`seance-${id}`, () => supprimer('seancesPlanifiees', id))
  }
  // R-9 : changer de niveau n'efface ni étape ni partie ; seul le champ `niveauDetail` bouge.
  const changerNiveau = (niveau: NiveauDetail, effacerNiveauxPropres: boolean) => {
    if (!donnees) return
    changerCycle({ ...donnees.cycle, niveauDetail: niveau })
    if (!effacerNiveauxPropres) return
    const aEffacer = donnees.seances.filter((s) => s.niveauDetail !== undefined)
    const misesAJour = aEffacer.map((s) => { const { niveauDetail: _retire, ...reste } = s; return reste as SeancePlanifiee })
    setDonnees((d) => d && { ...d, seances: d.seances.map((s) => misesAJour.find((m) => m.id === s.id) ?? s) })
    for (const s of misesAJour) sauver(`seance-${s.id}`, () => enregistrerSeancePlanifiee(s))
  }

  const creer = async (demande: DemandeCycle) => {
    const { cycle, phases } = nouveauCycleVide(demande, new Date().toISOString(), () => crypto.randomUUID())
    await enregistrerCycle(cycle)
    for (const p of phases) await enregistrerPhase(p)
    setNouveau(false)
    recharger()
  }

  // « Proposer un plan » : le générateur compose, puis on enregistre tout. Rien n'est écrit tant qu'il n'a pas fini.
  const proposer = async (demande: DemandeCycle) => {
    const [a, b, c] = demande.accents
    if (!a || !b || !c) throw new Error('Accents incomplets')
    const accents: [AccentPhase, AccentPhase, AccentPhase] = [a, b, c]
    const [douleurs, exercicesPerso, reglages] = await Promise.all([
      lireTous<DouleurDeclaree>('douleurs'), lireExercicesPerso(), lireUn<Reglages>('reglages', 'reglages'),
    ])
    const maintenant = new Date().toISOString()
    const plan = genererCycle({
      profil: profil ?? PROFIL_VIDE, douleurs, exercicesPerso,
      ...(reglages ? { reglages: { reglesSecurite: reglages.reglesSecurite } } : {}),
      debut: demande.debut, nom: demande.nom.trim(), seancesParSemaine: demande.seancesParSemaine,
      accents, niveauDetail: demande.niveauDetail,
      aujourdhui: jourLocal(), maintenant, nouvelId: () => crypto.randomUUID(),
    })
    try {
      await enregistrerCycle(plan.cycle)
      for (const p of plan.phases) await enregistrerPhase(p)
      for (const s of plan.seances) await enregistrerSeancePlanifiee(s)
    } catch (erreur) {
      // Écriture interrompue : on retire tout le cycle (phases et séances comprises), sans rien laisser d'orphelin.
      await supprimerCycle(plan.cycle.id).catch(() => {})
      throw erreur
    }
    setPlanPropose({ cycleId: plan.cycle.id, phrase: phraseBandeauPlanPropose(plan), manques: plan.manques })
    setVue('cycle')
    setNouveau(false)
    recharger()
  }

  // D-18 : les avertissements sont calculés ici, une seule fois, et passés aux trois vues.
  // Le calcul se refait à chaque changement du plan ; il n'empêche jamais d'enregistrer.
  const avertissements = useMemo(() => {
    if (!donnees || !moteur) return AUCUN_AVERTISSEMENT
    const brut = calculerAvertissements({
      cycle: donnees.cycle, phases: donnees.phases, seances: donnees.seances, objectifs: donnees.objectifs,
      profil: profil ?? PROFIL_VIDE, ...(moteur.reglages ? { reglages: { reglesSecurite: moteur.reglages.reglesSecurite } } : {}),
      exercicesPerso: moteur.exercicesPerso, douleurs: moteur.douleurs, formes: moteur.formes, realisees: moteur.realisees,
      aujourdhui: jourLocal(), maintenant: moteur.maintenant,
    })
    return ranger(brut, donnees.cycle.avertissementsGardes, donnees)
  }, [donnees, moteur, profil])

  // « Je garde ce choix » (ou « Revoir ») : seule la clé change dans le cycle.
  const garderAvertissement = (cle: string, garder: boolean) => {
    if (!donnees) return
    changerCycle({ ...donnees.cycle, avertissementsGardes: avecGarde(donnees.cycle.avertissementsGardes, cle, garder) })
  }
  // Correction en un clic de W-01 : la séance passe au lendemain (date + 1 jour).
  const decalerSeance = (seanceId: string): boolean => {
    const seance = donnees?.seances.find((s) => s.id === seanceId)
    const decalee = donnees && seance ? decalerAuLendemain(seance, donnees.cycle, donnees.phases) : null
    if (!decalee) return false
    changerSeances({ ecrites: [decalee], retirees: [] })
    return true
  }

  const fenetre = nouveau && (
    <NouveauCycle profil={profil} onProposer={proposer} onCommencerVide={creer} onAnnuler={() => setNouveau(false)} onOuvrirProfil={onOuvrirProfil} />
  )

  if (donnees === undefined) {
    return (
      <main className="ecran chargement" aria-busy={!echecLecture}>
        {echecLecture
          ? <Avertissement niveau="avertissement" titre="Ton plan ne s’est pas chargé">Recharge la page pour réessayer.</Avertissement>
          : <div className="chargement-forme"><div className="silhouette titre-silhouette" /></div>}
      </main>
    )
  }

  if (donnees === null) {
    return (
      <main className="ecran">
        <div className="pile-large">
          <p className="surtitre">Plan</p>
          <h1 className="titre">Ton cycle de 12 semaines</h1>
          <p className="texte-2">Trois phases de 4 semaines, chacune avec son accent. Crée ton premier cycle, puis remplis-le séance par séance.</p>
          <p className="annotation">Laisse l’app proposer un plan, ou commence par un cycle vide</p>
          <button type="button" className="bouton principal centre" onClick={() => setNouveau(true)}><strong>Crée ton premier cycle</strong></button>
        </div>
        {fenetre}
      </main>
    )
  }

  const selecteurVue = <SelecteurVue vue={vue} onChoisir={setVue} />
  const ouvrirSemaine = (numero: number) => { setNumeroSemaine(numero); setOrdrePhase(positionDeLaSemaine(numero).ordre); setVue('semaine') }
  return (
    <main className="ecran plan-ecran">
      {echecEcriture && (
        <Avertissement niveau="avertissement" titre="Changement pas encore enregistré">Nouvel essai dans quelques secondes. Tes changements restent à l’écran.</Avertissement>
      )}
      {planPropose && planPropose.cycleId === donnees.cycle.id && vue === 'cycle' && (
        <div className="pile">
          <Avertissement niveau="information" titre={planPropose.phrase} />
          {planPropose.manques.map((m) => <Avertissement key={m} niveau="information" titre={m} />)}
        </div>
      )}
      {vue === 'semaine' ? (
        <VueSemaine
          cycle={donnees.cycle}
          phases={donnees.phases}
          seances={donnees.seances}
          aujourdhui={jourLocal()}
          numero={borner(numeroSemaine, donnees.cycle.nbSemaines)}
          selecteurVue={selecteurVue}
          changeSurTelephone={changeSurTelephone}
          onVoirNouvelle={recharger}
          onChoisirSemaine={ouvrirSemaine}
          onChangerSeances={changerSeances}
          avertissements={avertissements}
          onDecaler={decalerSeance}
          onGarder={garderAvertissement}
        />
      ) : vue === 'phase' ? (
        <VuePhase
          cycle={donnees.cycle}
          phases={donnees.phases}
          seances={donnees.seances}
          aujourdhui={jourLocal()}
          ordre={ordrePhase}
          selecteurVue={selecteurVue}
          onChoisirPhase={setOrdrePhase}
          onChangerSeances={changerSeances}
          avertissements={avertissements}
        />
      ) : (
        <VueCycle
          cycle={donnees.cycle}
          phases={donnees.phases}
          seances={donnees.seances}
          objectifs={donnees.objectifs}
          aujourdhui={jourLocal()}
          onCycle={changerCycle}
          onPhase={changerPhase}
          onObjectifs={changerObjectifs}
          onNiveau={changerNiveau}
          onNouveauCycle={() => setNouveau(true)}
          onOuvrirSemaine={ouvrirSemaine}
          selecteurVue={selecteurVue}
          avertissements={avertissements}
          onGarder={garderAvertissement}
        />
      )}
      {fenetre}
    </main>
  )
}
