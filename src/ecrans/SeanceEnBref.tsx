import { useEffect, useState } from 'react'
import { useRepos } from '../chrono/useRepos.ts'
import { RappelSecuriteBloc } from '../composants/RappelSecuriteBloc.tsx'
import { protocoleParId } from '../donnees/bibliotheque/index.ts'
import { nomQualite } from '../donnees/bibliotheque/filtres.ts'
import type { ExercicePerso, SeancePlanifiee } from '../donnees/modele.ts'
import { dureeVersionSolo } from '../donnees/niveaux.ts'
import {
  demarrerChrono, dureeMinutes, etapesRealisees, marquerPartie, mettreEnPauseChrono, ouvrirSeanceEnBref,
  reprendreChrono, tempsEcouleS,
} from '../moteur/seanceEnBref.ts'
import type { StatutEtape } from '../moteur/seanceSolo.ts'
import { marqueursVersionPlanifiee, partiesAffichees, recommandationAffichee, type FicheVerif } from '../regles/index.ts'
import { formaterDuree } from './Aujourdhui.outils.ts'
import { MisesEnGarde } from './MisesEnGarde.tsx'

interface Props {
  seance: SeancePlanifiee
  niveau: 'simple' | 'grandes_lignes'
  fiches: Record<string, FicheVerif>
  exercicesPerso: ExercicePerso[]
  rappelBloc: boolean
  // douleur = true quand la séance se termine après « Stop, ça fait mal ».
  onTerminer: (etapes: { titre: string; statut: StatutEtape; refId?: string }[], dureeMin: number, douleur?: boolean) => void
  onQuitter: () => void
}

// Les trois rappels d'une séance dure ou maximale (T-16) : le chrono est libre, donc le moteur ne vérifie ni l'ordre ni les repos.
const A_RESPECTER = [
  'Échauffe-toi 20 à 30 min, de plus en plus dur, avant tout effort maximal.',
  'Entre deux efforts maximaux : 3 à 5 min de repos.',
  'Arrête l’effort maximal quand deux essais de suite sont nettement moins bons que le meilleur.',
]

const temps = (s: number) => {
  const total = Math.floor(s)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

// Séance en bref (T-16) : un chrono libre, la recommandation (simple) ou les parties à cocher (grandes lignes).
export function SeanceEnBref({ seance, niveau, fiches, exercicesPerso, rappelBloc, onTerminer, onQuitter }: Props) {
  const { solo } = seance
  const [etat, setEtat] = useState(() => {
    if (niveau === 'simple') {
      // Une seule partie ; son exercice principal, seulement s'il n'y a qu'une partie écrite.
      const refId = solo.parties?.length === 1 ? solo.parties[0].principal?.refId : undefined
      return ouvrirSeanceEnBref([{ titre: solo.nom, ...(refId ? { refId } : {}) }], Date.now())
    }
    return ouvrirSeanceEnBref(
      partiesAffichees(solo, seance.qualite, fiches).map((p) => ({ titre: p.titre, ...(p.principal ? { refId: p.principal.refId } : {}) })),
      Date.now(),
    )
  })
  const parties = partiesAffichees(solo, seance.qualite, fiches)
  const [maintenant, setMaintenant] = useState(() => Date.now())
  // Le temps se rafraîchit chaque seconde, seulement quand le chrono tourne.
  const enMarche = etat.horloge.marche === 'en_cours'
  useEffect(() => {
    if (!enMarche) return
    const minuteur = setInterval(() => setMaintenant(Date.now()), 1000)
    return () => clearInterval(minuteur)
  }, [enMarche])

  const [reposMin, setReposMin] = useState(3)
  const repos = useRepos(reposMin * 60)
  const [gardeOuverte, setGardeOuverte] = useState(false)
  const [fichesOuvertes, setFichesOuvertes] = useState<number[]>([])

  const marqueurs = marqueursVersionPlanifiee(solo, fiches)
  const arespecter = solo.durete === 'dure' || marqueurs.includes('maximale')
  const duree = dureeVersionSolo(solo)

  const actionChrono = () => {
    const ms = Date.now()
    setMaintenant(ms)
    setEtat((e) => (e.horloge.marche === 'en_cours' ? mettreEnPauseChrono(e, ms) : e.horloge.marche === 'en_pause' ? reprendreChrono(e, ms) : demarrerChrono(e, ms)))
  }
  const libelleChrono = etat.horloge.marche === 'en_cours' ? 'Pause' : etat.horloge.marche === 'en_pause' ? 'Reprendre' : 'Démarrer'

  // Simple : la séance a été faite, donc la partie unique passe à « faite ». Grandes lignes : les statuts tels quels.
  const terminer = (douleur?: boolean, statutsTelsQuels = false) => {
    const ms = Date.now()
    const final = niveau === 'simple' && !statutsTelsQuels ? marquerPartie(etat, 0, 'faite') : etat
    onTerminer(etapesRealisees(final), dureeMinutes(final, ms), douleur)
  }

  // Le contenu d'une fiche : la bibliothèque, sinon l'exercice personnel de même identifiant.
  const ficheDe = (refId: string) => protocoleParId(refId) ?? exercicesPerso.find((e) => e.id === refId)

  return (
    <>
    {gardeOuverte && (
      <MisesEnGarde apresDouleur onFermer={() => setGardeOuverte(false)} onTerminer={() => terminer(true, true)} />
    )}
    <main className="ecran serre" hidden={gardeOuverte}>
      <button className="bouton arret centre stop-seance" onClick={() => setGardeOuverte(true)}>Stop, ça fait mal</button>

      <div className="pile">
        <div className="entete">
          <button className="bouton-discret" onClick={onQuitter}>Quitter</button>
        </div>
        <h1 className="titre moyen">{solo.nom}</h1>
        <p className="mention">
          {nomQualite(seance.qualite)} · {solo.durete === 'dure' ? 'dure' : 'légère'}{duree > 0 ? ` · ${formaterDuree(duree)}` : ''}
        </p>
      </div>

      {rappelBloc && <RappelSecuriteBloc />}

      <section className="chrono-libre" aria-label="Chrono libre">
        <p className="temps-libre chiffres" aria-live="off">{temps(tempsEcouleS(etat, maintenant))}</p>
        <button className="bouton-second" onClick={actionChrono}>{libelleChrono}</button>
      </section>

      {niveau === 'simple' ? (
        <p className="recommandation">{recommandationAffichee(solo, seance.qualite, solo.durete, fiches)}</p>
      ) : (
        <ol className="parties-en-bref">
          {etat.parties.map((p, i) => {
            const partie = parties[i]
            const fiche = p.refId ? ficheDe(p.refId) : undefined
            const ouverte = fichesOuvertes.includes(i)
            const nomExercice = p.refId ? fiches[p.refId]?.nom : undefined
            const basculer = (statut: 'faite' | 'passee') =>
              setEtat((e) => marquerPartie(e, i, e.parties[i].statut === statut ? 'a_faire' : statut))
            return (
              <li key={i} className={p.statut === 'a_faire' ? 'partie-en-bref' : 'partie-en-bref traitee'}>
                <div className="entete">
                  <h2 className="sous-titre">{p.titre}</h2>
                  <span className="donnee">{partie.dureeMin} min</span>
                </div>
                {nomExercice && <p className="texte-2"><strong>{nomExercice}</strong></p>}
                {partie.consigne && <p className="texte-2">{partie.consigne}</p>}
                <div className="deux-boutons egaux">
                  <button className="bouton-second" aria-pressed={p.statut === 'faite'} aria-label={`${p.titre} fait`} onClick={() => basculer('faite')}>Fait</button>
                  <button className="bouton-second" aria-pressed={p.statut === 'passee'} aria-label={`${p.titre} passé`} onClick={() => basculer('passee')}>Passé</button>
                </div>
                {p.refId && fiche && (
                  <>
                    <button
                      className="bouton-texte" aria-expanded={ouverte} aria-controls={`fiche-partie-${i}`}
                      onClick={() => setFichesOuvertes((o) => (ouverte ? o.filter((x) => x !== i) : [...o, i]))}
                    >
                      Voir la fiche
                    </button>
                    {ouverte && (
                      <div className="carte pile" id={`fiche-partie-${i}`}>
                        <p className="texte-2">{fiche.consigne}</p>
                        {fiche.forme === 'liste' && <ul className="liste-simple">{fiche.elements.map((el) => <li key={el}>{el}</li>)}</ul>}
                      </div>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {arespecter && (
        <section className="fiche encre" aria-labelledby="titre-a-respecter">
          <span className="vis g" aria-hidden="true" /><span className="vis d" aria-hidden="true" />
          <h2 className="sous-titre titre-fiche" id="titre-a-respecter">À respecter</h2>
          <ul className="liste-simple">{A_RESPECTER.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      )}

      <section className="pile repos-bref" aria-label="Repos">
        <div className="choix cinq" role="group" aria-label="Durée du repos, en minutes">
          {[1, 2, 3, 4, 5].map((m) => (
            <button key={m} aria-pressed={reposMin === m} aria-label={`${m} min`} onClick={() => setReposMin(m)}>{m}</button>
          ))}
        </div>
        <button className="bouton-second" onClick={repos.enCours ? repos.arreter : repos.lancer}>
          {repos.enCours ? `Repos en cours (${repos.texte}), arrêter` : 'Lancer un repos'}
        </button>
      </section>

      <button className="bouton principal centre bas" onClick={() => terminer()}><strong>Terminer la séance</strong></button>
    </main>
    </>
  )
}
