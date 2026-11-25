import { useCallback, useEffect, useMemo, useState } from 'react'
import { Avertissement } from '../../composants/Avertissement.tsx'
import { BandeSemaines } from '../../composants/BandeSemaines.tsx'
import { jourLocal, lireProfil } from '../../donnees/base.ts'
import type {
  Cycle, DouleurDeclaree, ExercicePerso, FormeDuJour, ObjectifSpecifique, PhaseCycle, Profil, Reglages, SeancePlanifiee, SeanceRealisee,
} from '../../donnees/modele.ts'
import { ETIQUETTES_NIVEAU, dureeVersionSolo, niveauAffiche } from '../../donnees/niveaux.ts'
import { PROFIL_VIDE } from '../../donnees/profil.ts'
import { lireCycles, lireExercicesPerso, lirePlanDuCycle } from '../../donnees/plan.ts'
import { lireTous, lireUn, surDonneesChangees } from '../../donnees/stockage.ts'
import { toutesLesFiches } from '../../regles/index.ts'
import {
  AUCUN_AVERTISSEMENT, calculerAvertissements, nombreDuRepere, phraseCompte, compter, ranger, scinderMessage,
} from './avertissementsPlan.ts'
import { cycleAMontrer, dateLongue, ETIQUETTES_ACCENT } from './Plan.outils.ts'
import {
  casesDeLaBande, contenuDeLaSeance, ETIQUETTES_STATUT, etatTableau, objectifsDeLaPhase, prochaineSeance,
  semaineAffichee, seancesDeLaSemaine,
} from './TableauDeBord.outils.ts'
import { formatDuree } from './VuePhase.outils.ts'

interface Donnees {
  cycles: Cycle[]
  cycle: Cycle | undefined
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  objectifs: ObjectifSpecifique[]
  realisees: SeanceRealisee[]
  exercicesPerso: ExercicePerso[]
  douleurs: DouleurDeclaree[]
  formes: FormeDuJour[]
  reglages: Reglages | undefined
  profil: Profil | null
  maintenant: string // le moteur n'a pas d'horloge : on lui donne l'instant de la lecture
}

async function lireDonnees(): Promise<Donnees> {
  const cycles = await lireCycles()
  const cycle = cycleAMontrer(cycles)
  const plan = cycle ? await lirePlanDuCycle(cycle.id) : { phases: [], seances: [] }
  const ids = new Set(plan.phases.map((p) => p.id))
  const [objectifs, realisees, exercicesPerso, douleurs, formes, reglages, profil] = await Promise.all([
    lireTous<ObjectifSpecifique>('objectifsSpecifiques'), lireTous<SeanceRealisee>('seancesRealisees'), lireExercicesPerso(),
    lireTous<DouleurDeclaree>('douleurs'), lireTous<FormeDuJour>('formes'), lireUn<Reglages>('reglages', 'reglages'), lireProfil(),
  ])
  return {
    cycles, cycle, ...plan, objectifs: objectifs.filter((o) => ids.has(o.phaseId)), realisees, exercicesPerso, douleurs, formes,
    reglages, profil, maintenant: new Date().toISOString(),
  }
}

const jourLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
function enJour(date: string): string {
  const [a, m, j] = date.split('-').map(Number)
  return jourLong.format(new Date(a, m - 1, j))
}

interface Props {
  /** Mène au Plan (vue Semaine, sur la semaine donnée : voir la note dans MiseEnPageBureau). */
  onOuvrirSemaine: (numero: number) => void
  onOuvrirPlan: () => void
  onOuvrirBilans: () => void
}

// Écran O-02 : où j'en suis, et le chemin vers le bon endroit. Aucune séance ne se lance d'ici (R-6).
export function TableauDeBord({ onOuvrirSemaine, onOuvrirPlan, onOuvrirBilans }: Props) {
  const [donnees, setDonnees] = useState<Donnees | undefined>(undefined)
  const [echec, setEchec] = useState(false)
  const aujourdhui = jourLocal()

  const lire = useCallback(
    () => lireDonnees().then((d) => { setDonnees(d); setEchec(false) }).catch(() => setEchec(true)),
    [],
  )
  useEffect(() => {
    void lire()
    return surDonneesChangees(() => { void lire() })
  }, [lire])

  // Avertissements de la semaine : les mêmes règles que dans le Plan, rien n'est bloqué.
  const avertissements = useMemo(() => {
    if (!donnees?.cycle) return AUCUN_AVERTISSEMENT
    const d = donnees
    const brut = calculerAvertissements({
      cycle: d.cycle!, phases: d.phases, seances: d.seances, objectifs: d.objectifs, profil: d.profil ?? PROFIL_VIDE,
      ...(d.reglages ? { reglages: { reglesSecurite: d.reglages.reglesSecurite } } : {}),
      exercicesPerso: d.exercicesPerso, douleurs: d.douleurs, formes: d.formes, realisees: d.realisees,
      aujourdhui, maintenant: d.maintenant,
    })
    return ranger(brut, d.cycle!.avertissementsGardes, { cycle: d.cycle!, phases: d.phases, seances: d.seances })
  }, [donnees, aujourdhui])

  if (donnees === undefined) {
    return (
      <main className="ecran chargement" aria-busy={!echec}>
        {echec
          ? <Avertissement niveau="avertissement" titre="Ton tableau de bord ne s’est pas chargé">Recharge la page pour réessayer.</Avertissement>
          : <div className="chargement-forme"><div className="silhouette titre-silhouette" /></div>}
      </main>
    )
  }

  const { cycle } = donnees
  const etat = etatTableau(cycle, aujourdhui)

  // ——— État 1 : aucun cycle, trois fiches de départ ———
  if (etat === 'aucun' || !cycle) {
    const ancien = donnees.cycles.some((c) => !c.supprimeLe)
    return (
      <main className="ecran">
        <div className="pile-large">
          <p className="surtitre">Tableau de bord</p>
          <h1 className="titre">Crée ton premier cycle</h1>
          <p className="texte-2">Un cycle, ce sont trois phases de 4 semaines. Choisis comment commencer.</p>
        </div>
        <div className="tableau-depart">
          <button type="button" className="bouton principal" onClick={onOuvrirPlan}>
            <strong>Partir de zéro</strong>
            <span>Tu composes ton plan, ou l’app te le propose.</span>
          </button>
          <button type="button" className="bouton" disabled>
            <strong>Demander un brouillon à l’assistant</strong>
            <span>Arrive en phase 5</span>
          </button>
          <button type="button" className="bouton" disabled>
            <strong>Reprendre un cycle précédent</strong>
            <span>{ancien ? 'Arrive dans une prochaine version' : 'Aucun cycle précédent'}</span>
          </button>
        </div>
      </main>
    )
  }

  // ——— État 2 : cycle terminé ———
  if (etat === 'termine') {
    return (
      <main className="ecran">
        <div className="pile-large">
          <p className="surtitre">{cycle.nom}</p>
          <h1 className="titre">Ton cycle est fini.</h1>
          <p className="texte-2">Il s’est terminé le {dateLongue(donnees.phases.length > 0 ? finDuCycle(cycle) : cycle.debut)}.</p>
        </div>
        <div className="tableau-depart">
          <button type="button" className="bouton principal" onClick={onOuvrirBilans}><strong>Voir le bilan</strong></button>
          <button type="button" className="bouton" onClick={onOuvrirPlan}><strong>Préparer le cycle suivant</strong></button>
        </div>
      </main>
    )
  }

  // ——— État 3 : cycle en cours (ou pas encore commencé) ———
  const semaine = semaineAffichee(cycle, aujourdhui)
  const phase = donnees.phases.find((p) => p.ordre === semaine.phase)
  const accent = phase?.accent ? ETIQUETTES_ACCENT[phase.accent].toLowerCase() : 'accent à choisir'
  const jours = seancesDeLaSemaine(semaine.numero, donnees.phases, donnees.seances, donnees.realisees, aujourdhui)
  const prochaine = prochaineSeance(donnees.seances, donnees.realisees, aujourdhui)
  const objectifs = objectifsDeLaPhase(donnees.phases, donnees.objectifs, semaine.phase)
  const delaSemaine = avertissements.parSemaine.get(semaine.numero) ?? []
  const ouverts = delaSemaine.filter((e) => e.forme !== 'information')
  const libelleAction = semaine.commence ? 'Ouvrir la semaine en cours' : 'Ouvrir la semaine 1'

  return (
    <main className="ecran">
      <div className="tableau-bord">
        <div className="tableau-gauche pile-large">
          <div className="pile">
            <p className="surtitre">
              {cycle.nom}{cycle.etat === 'brouillon' ? ' · Brouillon' : ''}
            </p>
            <h1 className="titre">{semaine.commence ? `Semaine ${semaine.numero} sur ${cycle.nbSemaines}` : 'Ton cycle va commencer'}</h1>
            <p className="mention">
              {semaine.commence
                ? `Phase ${semaine.phase} · ${accent} · semaine ${semaine.semaine} sur 4`
                : `Début le ${dateLongue(cycle.debut)}`}
            </p>
          </div>

          <BandeSemaines
            semaines={casesDeLaBande(cycle, donnees.phases, aujourdhui)}
            numeroEnCours={semaine.commence ? semaine.numero : null}
            onChoisir={onOuvrirSemaine}
          />

          <button type="button" className="bouton principal tableau-action" onClick={() => onOuvrirSemaine(semaine.numero)}>
            <strong>{libelleAction}</strong>
          </button>

          <section className="pile" aria-labelledby="tdb-semaine">
            <h2 className="sous-titre" id="tdb-semaine">Cette semaine</h2>
            {jours.length === 0 ? (
              <p className="texte-2">Aucune séance prévue cette semaine.</p>
            ) : (
              <ul className="liste-lignes">
                {jours.map(({ seance, statut }) => (
                  <li key={seance.id} className="ligne haute">
                    <span>
                      {enJour(seance.date)}
                      <small>{seance.solo.nom}</small>
                    </span>
                    <span className="donnee">{ETIQUETTES_STATUT[statut]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pile" aria-labelledby="tdb-avert">
            <h2 className="sous-titre" id="tdb-avert">Avertissements ouverts</h2>
            {ouverts.length === 0 ? (
              <p className="texte-2">Aucun avertissement cette semaine.</p>
            ) : (
              <>
                <p className="texte-2">{phraseCompte(compter(delaSemaine))}</p>
                {ouverts.slice(0, 3).map((e) => (
                  <Avertissement key={e.cle} niveau={e.forme === 'arret' ? 'arret' : 'avertissement'} titre={scinderMessage(e.avertissement.message).titre} />
                ))}
                {nombreDuRepere(delaSemaine) > 3 && <p className="texte-3">et {nombreDuRepere(delaSemaine) - 3} autre(s), à voir dans le Plan.</p>}
              </>
            )}
          </section>
        </div>

        <div className="tableau-droite pile-large">
          <section className="fiche pile" aria-labelledby="tdb-prochaine">
            <span className="vis g" aria-hidden="true" />
            <span className="vis d" aria-hidden="true" />
            <h2 className="sous-titre" id="tdb-prochaine">Prochaine séance</h2>
            {prochaine ? <ProchaineSeance seance={prochaine} cycle={cycle} persos={donnees.exercicesPerso} /> : (
              <p className="texte-2">Plus de séance prévue dans ce cycle.</p>
            )}
            <p className="annotation">Les séances se lancent depuis ton téléphone</p>
          </section>

          <section className="carte pile" aria-labelledby="tdb-tests">
            <h2 className="sous-titre" id="tdb-tests">Derniers tests</h2>
            <p className="texte-2">Les tests de fin de phase arrivent en phase 6.</p>
          </section>

          <section className="carte pile" aria-labelledby="tdb-objectifs">
            <h2 className="sous-titre" id="tdb-objectifs">Objectifs de la phase</h2>
            {objectifs.length === 0 ? (
              <p className="texte-2">Pas d’objectif choisi pour cette phase.</p>
            ) : (
              <ul className="liste-simple">
                {objectifs.map((o) => (
                  <li key={o.id}>
                    {o.libelle}
                    {o.indicateur?.cible !== undefined && (
                      <small className="texte-3"> · {o.indicateur.nom} : {o.indicateur.depart ?? '?'} vers {o.indicateur.cible} {o.indicateur.unite}</small>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

// Fin du cycle, pour la phrase « Il s'est terminé le… ».
function finDuCycle(cycle: Cycle): string {
  const [a, m, j] = cycle.debut.split('-').map(Number)
  const fin = new Date(a, m - 1, j + cycle.nbSemaines * 7 - 1)
  return jourLocal(fin)
}

// La fiche en lecture : le contenu suit le niveau affiché (R-9) ; aucun bouton de lancement (R-6).
function ProchaineSeance({ seance, cycle, persos }: { seance: SeancePlanifiee; cycle: Cycle; persos: ExercicePerso[] }) {
  const fiches = useMemo(() => toutesLesFiches(persos), [persos])
  const contenu = contenuDeLaSeance(seance, cycle, fiches)
  const duree = formatDuree(dureeVersionSolo(seance.solo))
  const niveau = niveauAffiche(seance, cycle)
  return (
    <div className="pile">
      <p className="libelle">{seance.solo.nom}</p>
      <p className="mention">
        {enJour(seance.date)} · {seance.solo.durete === 'dure' ? 'dure' : 'légère'}{duree ? ` · ${duree}` : ''}
      </p>
      <p className="mention">Niveau : {ETIQUETTES_NIVEAU[niveau]}</p>
      {contenu.niveau === 'detaille' && (
        contenu.lignes.length === 0 ? <p className="texte-2">Pas encore d’étape.</p> : (
          <ul className="liste-simple">
            {contenu.lignes.map((l, i) => <li key={i}>{l.titre} <span className="donnee">{l.dureeMin} min</span></li>)}
          </ul>
        )
      )}
      {contenu.niveau === 'grandes_lignes' && (
        contenu.parties.length === 0 ? <p className="texte-2">Pas encore de partie.</p> : (
          <ul className="liste-simple">
            {contenu.parties.map((p, i) => <li key={i}>{p.titre} <span className="donnee">{p.dureeMin} min</span></li>)}
          </ul>
        )
      )}
      {contenu.niveau === 'simple' && <p className="texte-2">{contenu.recommandation}</p>}
    </div>
  )
}
