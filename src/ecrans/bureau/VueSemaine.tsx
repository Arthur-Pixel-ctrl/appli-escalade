import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { BandeSemaines } from '../../composants/BandeSemaines.tsx'
import { Confirmation } from '../../composants/Confirmation.tsx'
import { AvertissementDuMoteur, FicheSeance, type AvertissementsFiche, type GlisseFiche } from '../../composants/FicheSeance.tsx'
import { idZone, lireZone, reordonnerEtapes, type ListeEtapesNom } from '../../composants/glisser.ts'
import { FantomeGlisse } from '../../composants/FantomeGlisse.tsx'
import { useGlisser, type RappelsGlisser } from '../../composants/useGlisser.ts'
import { RailBibliotheque } from '../../composants/RailBibliotheque.tsx'
import { Avertissement } from '../../composants/Avertissement.tsx'
import { Icone } from '../../composants/Icone.tsx'
import { BIBLIOTHEQUE } from '../../donnees/bibliotheque/index.ts'
import { entreesDepuis, etatDe, nomQualite, type ContexteFiltre, type EntreeBibliotheque } from '../../donnees/bibliotheque/filtres.ts'
import { jourLocal, lireProfil } from '../../donnees/base.ts'
import type { Cycle, DateISO, DouleurDeclaree, ExercicePerso, PhaseCycle, SallePerso, SeancePlanifiee } from '../../donnees/modele.ts'
import { ajouterJours, debutSemaine, lireExercicesPerso, lireSallesPerso, salleEffective } from '../../donnees/plan.ts'
import { PROFIL_VIDE } from '../../donnees/profil.ts'
import { dureeSeanceType } from '../../donnees/seancesTypes.ts'
import { lireTous, surDonneesChangees } from '../../donnees/stockage.ts'
import { profilVersVerif, seanceDepuisType, toutesLesFiches, type DouleurVerif, type ZoneDouleur } from '../../regles/index.ts'
import { compter, nombreDuRepere, phraseCompte, scinderMessage, type AvertissementsDuPlan, type EntreeAvertissement } from './avertissementsPlan.ts'
import { decalerAuLendemain } from './avertissementsPlan.ts'
import { FicheDetail, type DonneesFiche } from './FicheDetail.tsx'
import { ETIQUETTES_ACCENT, ETIQUETTES_TYPE_SEMAINE, dateCourte, resumeSemaine, semaineDuJour, semainesAPlat } from './Plan.outils.ts'
import { JOURS_LONGS, dateDeLaCase, formatDuree, nouvelleSeanceVide, seancesDeLaCase } from './VuePhase.outils.ts'
import type { ChangementSeances } from './VuePhase.tsx'
import {
  ajouterEtape, choixSeancesTypes, duretePropose, etapeDepuisFiche, positionDeLaSemaine, remplacerEtape, type ChoixSeanceType,
} from './VueSemaine.outils.ts'

interface Props {
  cycle: Cycle
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  aujourdhui: DateISO
  numero: number // 1 à 12
  selecteurVue: ReactNode
  /** Un autre appareil a modifié le plan pendant l'édition (règle : la dernière modification gagne). */
  changeSurTelephone: boolean
  onVoirNouvelle: () => void
  onChoisirSemaine: (numero: number) => void
  onChangerSeances: (changement: ChangementSeances) => void
  /** Avertissements du moteur, calculés une fois par `Plan` (D-18). */
  avertissements: AvertissementsDuPlan
  /** « Décaler au lendemain » (W-01) : `Plan` écrit ; `false` si le lendemain sort du cycle. */
  onDecaler: (seanceId: string) => boolean
  /** « Je garde ce choix » (`garder`) ou « Revoir » : `Plan` met à jour `Cycle.avertissementsGardes`. */
  onGarder: (cle: string, garder: boolean) => void
}

interface Contexte {
  persos: ExercicePerso[]
  sallesPerso: SallePerso[]
  filtre: ContexteFiltre
  salleId: string | undefined
  zones: ZoneDouleur[]
}

async function lireContexte(): Promise<Contexte> {
  const [profil, persos, douleurs, sallesPerso] = await Promise.all([
    lireProfil(), lireExercicesPerso(), lireTous<DouleurDeclaree>('douleurs'), lireSallesPerso(),
  ])
  const vues: DouleurVerif[] = douleurs.filter((d) => !d.supprimeLe).map((d) => ({
    date: d.date, zone: d.zone, niveau: d.niveau, signes: [...d.signes], ...(d.resolueLe !== undefined ? { resolueLe: d.resolueLe } : {}),
  }))
  const verif = profilVersVerif(profil ?? PROFIL_VIDE)
  const aujourdhui = jourLocal()
  // Mêmes zones que le moteur : celles du profil, plus les douleurs déclarées et pas encore résolues.
  const zones = [...new Set<ZoneDouleur>([...verif.douleursEnCours, ...vues.filter((d) => d.resolueLe === undefined || d.resolueLe > aujourdhui).map((d) => d.zone)])]
  return { persos, sallesPerso, filtre: { profil: verif, douleurs: vues, aujourdhui }, salleId: profil?.salleHabituelleId, zones }
}

const horodatage = () => new Date().toISOString()

// Fenêtre modale simple (même mécanique que « Déplacer » de la vue Phase) : <dialog> natif, focus rendu à la fermeture.
function Fenetre({ titre, onFermer, children }: { titre: string; onFermer: () => void; children: ReactNode }) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const idTitre = useId()
  useEffect(() => {
    const retour = document.activeElement as HTMLElement | null
    dialogue.current?.showModal()
    return () => { retour?.focus() }
  }, [])
  return (
    <dialog ref={dialogue} className="confirmation fenetre-large" aria-labelledby={idTitre} onCancel={(e) => { e.preventDefault(); onFermer() }}>
      <div className="fiche pile-large">
        <h2 id={idTitre} className="titre moyen">{titre}</h2>
        {children}
      </div>
    </dialog>
  )
}

interface Jour { index: number; date: DateISO; seances: SeancePlanifiee[] }

// Ce qu'on tient en main pendant un glisser : une fiche du rail, ou une étape d'une séance (pour la réordonner).
type Charge =
  | { type: 'fiche'; entree: EntreeBibliotheque }
  | { type: 'etape'; seanceId: string; liste: ListeEtapesNom; index: number; titre: string }

// « Ajouter à… » : choisir le jour, puis la séance existante ou une nouvelle, puis où (solo ou mini-bloc).
function AjouterA({ entree, jours, onAnnuler, onValider }: {
  entree: EntreeBibliotheque; jours: Jour[]; onAnnuler: () => void
  onValider: (jour: number, seanceId: string | null, ou: 'solo' | 'minibloc') => void
}) {
  const premier = Math.max(0, jours.findIndex((j) => j.seances.length > 0))
  const [jour, setJour] = useState(premier)
  const [seanceId, setSeanceId] = useState<string | null>(jours[premier].seances[0]?.id ?? null)
  const [ou, setOu] = useState<'solo' | 'minibloc'>('solo')
  const choisirJour = (i: number) => { setJour(i); setSeanceId(jours[i].seances[0]?.id ?? null); setOu('solo') }
  const cible = jours[jour].seances.find((s) => s.id === seanceId)
  return (
    <Fenetre titre={`Ajouter « ${entree.nom} » à…`} onFermer={onAnnuler}>
      <fieldset className="question">
        <legend className="libelle">Jour</legend>
        <div className="choix sept">
          {jours.map((j) => (
            <button key={j.index} type="button" aria-pressed={jour === j.index} aria-label={`${JOURS_LONGS[j.index]}${j.seances.length ? ', une séance' : ', repos'}`} onClick={() => choisirJour(j.index)}>
              {JOURS_LONGS[j.index].slice(0, 3)}
            </button>
          ))}
        </div>
      </fieldset>
      <p className="texte-2" aria-live="polite">
        {cible ? `Elle ira à la fin de « ${cible.solo.nom} ».` : `Une nouvelle séance sera créée le ${JOURS_LONGS[jour]}.`}
      </p>
      {cible?.groupe && (
        <fieldset className="question">
          <legend className="libelle">Où</legend>
          <div className="choix deux">
            <button type="button" aria-pressed={ou === 'solo'} onClick={() => setOu('solo')}>Version solo</button>
            <button type="button" aria-pressed={ou === 'minibloc'} onClick={() => setOu('minibloc')}>Mini-bloc groupe</button>
          </div>
        </fieldset>
      )}
      <div className="confirmation-actions">
        <button type="button" className="bouton-second" onClick={onAnnuler}>Annuler</button>
        <button type="button" className="bouton principal centre" onClick={() => onValider(jour, cible?.id ?? null, ou)}><strong>Ajouter</strong></button>
      </div>
    </Fenetre>
  )
}

function libelleSeanceType(c: ChoixSeanceType): string {
  return c.variante !== undefined ? `${c.seanceType.nom} · ${c.variante}` : c.seanceType.nom
}

// « Ajouter une séance type » : d'abord celles que le moteur propose, puis les autres en pointillé avec leur raison.
function AjouterSeanceType({ jour, choix, onAnnuler, onChoisir }: {
  jour: string; choix: ChoixSeanceType[]; onAnnuler: () => void; onChoisir: (c: ChoixSeanceType) => void
}) {
  const bons = choix.filter((c) => c.disponible)
  const autres = choix.filter((c) => !c.disponible)
  const ligne = (c: ChoixSeanceType) => (
    <li key={`${c.seanceType.id}-${c.variante ?? ''}`}>
      <button type="button" className={`choix-seance-type${c.disponible ? '' : ' pointille'}`} onClick={() => onChoisir(c)}>
        <strong>{libelleSeanceType(c)}</strong>
        <span className="donnee">{nomQualite(c.seanceType.qualite)} · {c.seanceType.durete === 'dure' ? 'dure' : 'légère'} · {formatDuree(dureeSeanceType(c.seanceType, c.variante)) ?? '—'}</span>
        {c.disponible
          ? <span className="texte-3">{c.seanceType.recommandation}</span>
          : <span className="texte-3">{c.raison} Tu peux l’ajouter quand même.</span>}
      </button>
    </li>
  )
  return (
    <Fenetre titre={`Ajouter une séance type, ${jour}`} onFermer={onAnnuler}>
      <section className="pile" aria-label="Séances types proposées">
        <h3 className="surtitre">Proposées pour toi</h3>
        {bons.length === 0 ? <p className="texte-2">Aucune ne passe tous tes prérequis : les autres restent ajoutables à la main.</p> : <ul className="liste-choix">{bons.map(ligne)}</ul>}
      </section>
      {autres.length > 0 && (
        <section className="pile" aria-label="Autres séances types">
          <h3 className="surtitre">À la main seulement</h3>
          <p className="texte-3">Une fiche manque ou ne convient pas encore. L’app te le dit, elle ne bloque rien.</p>
          <ul className="liste-choix">{autres.map(ligne)}</ul>
        </section>
      )}
      <button type="button" className="bouton-second" onClick={onAnnuler}>Annuler</button>
    </Fenetre>
  )
}

// Écran O-05 : composer les séances de la semaine. Aucun lancement de séance ici (R-6).
export function VueSemaine({ cycle, phases, seances, aujourdhui, numero, selecteurVue, changeSurTelephone, onVoirNouvelle, onChoisirSemaine, onChangerSeances, avertissements, onDecaler, onGarder }: Props) {
  const { ordre, semaine } = positionDeLaSemaine(numero)
  const phase = phases.find((p) => p.ordre === ordre) ?? phases[0]
  const [contexte, setContexte] = useState<Contexte | undefined>(undefined)
  const [ficheOuverte, setFicheOuverte] = useState<string | undefined>(undefined)
  const [aAjouter, setAAjouter] = useState<EntreeBibliotheque | null>(null)
  const [jourSeanceType, setJourSeanceType] = useState<number | null>(null)
  const [remplacement, setRemplacement] = useState<{ seanceId: string; index: number } | null>(null)
  const [aRetirer, setARetirer] = useState<SeancePlanifiee | null>(null)
  const [message, setMessage] = useState('')
  const aFocaliser = useRef<string | null>(null)
  const glisse = useGlisser<Charge>()

  // Après « Décaler au lendemain », l'avertissement disparaît avec son bouton : le focus va à la séance, ou au titre de la semaine si elle a changé de semaine.
  useEffect(() => {
    if (!aFocaliser.current) return
    const cible = document.querySelector<HTMLElement>(`[data-seance="${aFocaliser.current}"]`) ?? document.getElementById('titre-semaine')
    cible?.focus()
    aFocaliser.current = null
  }, [seances])

  useEffect(() => {
    const lire = () => lireContexte().then(setContexte).catch(() => {})
    void lire()
    return surDonneesChangees(() => { void lire() })
  }, [])

  const persos = contexte?.persos
  const entrees = useMemo(() => entreesDepuis(BIBLIOTHEQUE, persos ?? []), [persos])
  const parId = useMemo(() => new Map(entrees.map((e) => [e.id, e])), [entrees])
  const fiches = useMemo(() => toutesLesFiches(persos ?? []), [persos])
  const choixTypes = useMemo(
    () => (contexte ? choixSeancesTypes(entrees.map((e) => e.fiche), contexte.filtre.profil, contexte.zones) : []),
    [entrees, contexte],
  )

  if (!phase || !contexte) return <div className="plan-vue"><div className="chargement-forme"><div className="silhouette titre-silhouette" /></div></div>

  const couleurs = salleEffective(contexte.salleId, contexte.sallesPerso).couleurs
  const position = semaineDuJour(cycle, aujourdhui)
  const lundi = debutSemaine(cycle, phase, semaine)
  const typeSemaine = phase.semaines.find((s) => s.numero === semaine)?.type ?? 'charge'
  const resume = resumeSemaine(seances, phase.id, semaine)
  const jours: Jour[] = Array.from({ length: 7 }, (_, index) => ({
    index, date: dateDeLaCase(cycle, phase, semaine, index), seances: seancesDeLaCase(seances, phase, cycle, semaine, index),
  }))
  const premierLibre = jours.find((j) => j.seances.length === 0)
  const nomJour = (j: Jour) => `${JOURS_LONGS[j.index]} ${dateCourte(j.date)}`
  // La date courte finit souvent par un point (« 2 déc. ») : on n'en ajoute pas un second.
  const finDePhrase = (texte: string) => (texte.endsWith('.') ? texte : `${texte}.`)

  const ecrire = (s: SeancePlanifiee) => onChangerSeances({ ecrites: [s], retirees: [] })
  const vide = (j: Jour) => nouvelleSeanceVide(cycle, phase, semaine, j.index, horodatage(), crypto.randomUUID())

  const ajouterVide = (j: Jour) => { ecrire(vide(j)); setMessage(finDePhrase(`Séance ajoutée : ${nomJour(j)}`)) }

  const ajouterSeanceType = (c: ChoixSeanceType) => {
    if (jourSeanceType === null) return
    const j = jours[jourSeanceType]
    ecrire(seanceDepuisType(c.seanceType, c.variante, {
      id: crypto.randomUUID(), cycleId: cycle.id, phaseId: phase.id, semaine, date: j.date, maintenant: horodatage(),
    }))
    setMessage(finDePhrase(`Séance type ajoutée : « ${libelleSeanceType(c)} », ${nomJour(j)}`))
    setJourSeanceType(null)
  }

  // Une fiche du rail : ajoutée à une séance, ou créant une nouvelle séance ce jour-là.
  const ajouterFiche = (entree: EntreeBibliotheque, jourIndex: number, seanceId: string | null, ou: 'solo' | 'minibloc') => {
    const j = jours[jourIndex]
    const cible = j.seances.find((s) => s.id === seanceId)
    const etape = etapeDepuisFiche(entree.id, contexte.persos, cible?.solo.etapes ?? [])
    if (!etape) return
    if (cible) {
      ecrire(ajouterEtape(cible, etape, ou))
      setMessage(`« ${entree.nom} » ajoutée à « ${cible.solo.nom} ».`)
    } else {
      const base = vide(j)
      const avecEtape = ajouterEtape({ ...base, solo: { ...base.solo, nom: entree.nom } }, etape, 'solo')
      // Défauts proposés (modifiables dans la fiche) : qualité de la fiche, dureté selon la règle du moteur.
      ecrire({
        ...avecEtape,
        qualite: entree.qualite === 'echauffement' ? avecEtape.qualite : entree.qualite,
        solo: { ...avecEtape.solo, durete: duretePropose(avecEtape.solo, fiches) },
      })
      setMessage(finDePhrase(`Séance créée avec « ${entree.nom} » : ${nomJour(j)}`))
    }
    setAAjouter(null)
    setFicheOuverte(undefined)
  }

  const clicRail = (entree: EntreeBibliotheque) => {
    if (remplacement) {
      const cible = seances.find((s) => s.id === remplacement.seanceId)
      const etape = cible && etapeDepuisFiche(entree.id, contexte.persos, cible.solo.etapes)
      if (cible && etape) {
        ecrire({ ...cible, solo: { ...cible.solo, etapes: remplacerEtape(cible.solo.etapes, remplacement.index, etape) } })
        setMessage(`Étape remplacée par « ${entree.nom} ».`)
      }
      setRemplacement(null)
      return
    }
    setAAjouter(entree)
  }

  // ——— Glisser-déposer (D-17) : mêmes fonctions que les boutons (`ajouterFiche`, `monterOuDescendre` via `reordonnerEtapes`) ———
  const toutesLesSeances = jours.flatMap((j) => j.seances)
  const textePour = (charge: Charge, zone: string): string | null => {
    const { type, parties } = lireZone(zone)
    if (charge.type === 'fiche') {
      if (type === 'jour') {
        const j = jours[Number(parties[0])]
        return j && j.seances.length === 0 ? `Dépose ici pour créer une séance avec ${charge.entree.nom}, ${JOURS_LONGS[j.index]}` : null
      }
      if (type === 'seance') {
        const cible = toutesLesSeances.find((x) => x.id === parties[0])
        return cible ? `Dépose ici pour ajouter ${charge.entree.nom} à « ${cible.solo.nom} »${cible.groupe ? ' (version solo)' : ''}` : null
      }
      return null
    }
    if (type === 'etape' && parties[0] === charge.seanceId && parties[1] === charge.liste && Number(parties[2]) !== charge.index) {
      return `Dépose ici pour placer « ${charge.titre} » en position ${Number(parties[2]) + 1}`
    }
    return null
  }
  const rappelsGlisser: RappelsGlisser<Charge> = {
    estValable: (charge, zone) => textePour(charge, zone) !== null,
    onDepot: (charge, zone) => {
      const { type, parties } = lireZone(zone)
      if (charge.type === 'fiche') {
        if (type === 'jour') ajouterFiche(charge.entree, Number(parties[0]), null, 'solo')
        else {
          const jour = jours.find((j) => j.seances.some((x) => x.id === parties[0]))
          if (jour) ajouterFiche(charge.entree, jour.index, parties[0], 'solo')
        }
        return
      }
      const cible = toutesLesSeances.find((x) => x.id === charge.seanceId)
      if (!cible) return
      ecrire(reordonnerEtapes(cible, charge.liste, charge.index, Number(parties[2])))
      setMessage(`« ${charge.titre} » déplacée en position ${Number(parties[2]) + 1}.`)
    },
    onAnnule: (_charge, cause) => setMessage(cause === 'echap' ? 'Glisser annulé, rien n’a changé.' : 'Rien n’a été déposé : aucune zone valable.'),
  }
  const enMain = glisse.etat?.charge
  const glisseDe = (s: SeancePlanifiee): GlisseFiche | null => (!glisse.etat || !enMain ? null : {
    texteSeance: enMain.type === 'fiche' ? textePour(enMain, idZone('seance', s.id)) : null,
    zoneActive: glisse.etat.zone,
    source: enMain.type === 'etape' && enMain.seanceId === s.id ? { liste: enMain.liste, index: enMain.index } : null,
    texteEtape: (liste, index) => (enMain.type === 'etape' ? textePour(enMain, idZone('etape', s.id, liste, index)) : null),
  })

  // Sans séance : les avertissements de portée semaine (en tête), qui n'ont ni correction ni séance propre.
  const actionsFiche = (s?: SeancePlanifiee): AvertissementsFiche => ({
    propres: s ? avertissements.parSeance.get(s.id) ?? [] : [],
    liees: s ? avertissements.lieesParSeance.get(s.id) ?? [] : [],
    peutDecaler: (e) => s !== undefined && e.avertissement.code === 'W-01' && e.seanceId === s.id && decalerAuLendemain(s, cycle, phases) !== null,
    onDecaler: (e) => {
      if (e.seanceId && onDecaler(e.seanceId)) { setMessage('Séance décalée au lendemain.'); aFocaliser.current = e.seanceId }
    },
    onGarder: (e) => onGarder(e.cle, true),
    onRouvrir: (e) => onGarder(e.cle, false),
  })
  const deLaSemaine = avertissements.parSemaine.get(numero) ?? []
  const nomDeSeance = (e: EntreeAvertissement) => seances.find((x) => x.id === e.seanceId)?.solo.nom
  const voirLaSeance = (id: string | undefined) => {
    const el = id ? document.querySelector<HTMLElement>(`[data-seance="${id}"]`) : null
    el?.scrollIntoView({ block: 'center' })
    el?.focus()
  }

  const fiche = ficheOuverte !== undefined ? parId.get(ficheOuverte) : undefined
  const donneesFiche: DonneesFiche | undefined = fiche && {
    entree: fiche, etat: etatDe(fiche, contexte.filtre), contexte: contexte.filtre,
    forme: (BIBLIOTHEQUE.find((p) => p.id === fiche.id) ?? contexte.persos.find((p) => p.id === fiche.id))!,
    ...(() => { const p = contexte.persos.find((x) => x.id === fiche.id); return p?.reference !== undefined ? { reference: p.reference } : {} })(),
  }

  const seanceARemplacer = remplacement ? seances.find((s) => s.id === remplacement.seanceId) : undefined
  const nomARemplacer = seanceARemplacer?.solo.etapes[remplacement?.index ?? -1]?.titre ?? null

  return (
    <div className="plan-vue">
      <header className="plan-entete pile-large">
        <p className="mention">{cycle.nom}</p>
        <h1 className="titre moyen">
          Phase {phase.ordre}{phase.accent ? ` · ${ETIQUETTES_ACCENT[phase.accent]}` : ''} · semaine {semaine} sur 4
        </h1>
        <p className="texte-3">Les séances se lancent depuis ton téléphone.</p>
      </header>

      {changeSurTelephone && (
        <div className="avertissement-ligne">
          <Avertissement niveau="information" titre="Ce plan a changé sur ton téléphone.">
            <button type="button" className="bouton-texte bouton-en-ligne" onClick={onVoirNouvelle}>Voir la nouvelle version</button>
          </Avertissement>
        </div>
      )}

      <div className="plan-selecteur pile">{selecteurVue}</div>

      <BandeSemaines
        semaines={semainesAPlat(phases).map((s) => ({
          numero: s.numero, type: s.type, faite: ajouterJours(debutSemaine(cycle, { ordre: s.phase }, s.semaine), 6) < aujourdhui,
        }))}
        numeroEnCours={position?.numero ?? null}
        numeroOuvert={numero}
        onChoisir={onChoisirSemaine}
      />

      <div className="semaine-corps">
        <RailBibliotheque entrees={entrees} contexte={contexte.filtre} remplacementDe={nomARemplacer}
          onGlisser={remplacement ? undefined : (e, entree) => glisse.demarrer(e, { type: 'fiche', entree }, entree.nom, rappelsGlisser)}
          onVoir={setFicheOuverte} onAjouter={clicRail} onAnnulerRemplacement={() => setRemplacement(null)} />

        <section className="semaine-colonne pile-large" aria-labelledby="titre-semaine">
          <div className="semaine-resume">
            <div className="pile">
              <h2 className="titre moyen" id="titre-semaine" tabIndex={-1}>Semaine {numero} · {dateCourte(lundi)} au {dateCourte(ajouterJours(lundi, 6))}</h2>
              <p className="donnee">
                {resume.nb === 0 ? 'Aucune séance' : `${resume.nb} séance${resume.nb > 1 ? 's' : ''} · ${resume.dures} dure${resume.dures > 1 ? 's' : ''}`}
                {typeSemaine !== 'charge' && <> <span className="etiquette contour">{ETIQUETTES_TYPE_SEMAINE[typeSemaine]}</span></>}
              </p>
            </div>
            <button type="button" className="bouton principal centre semaine-ajouter" disabled={!premierLibre} onClick={() => premierLibre && ajouterVide(premierLibre)}>
              <strong>Ajouter une séance</strong>
            </button>
          </div>
          {!premierLibre && <p className="texte-3">Tous les jours de la semaine ont une séance.</p>}
          <div className="semaine-navigation">
            <button type="button" className="bouton-second" disabled={numero <= 1} onClick={() => onChoisirSemaine(numero - 1)}>Semaine précédente</button>
            <button type="button" className="bouton-second" disabled={numero >= cycle.nbSemaines} onClick={() => onChoisirSemaine(numero + 1)}>Semaine suivante</button>
          </div>
          {resume.nb === 0 && <p className="texte-2">Semaine vide. Ajoute une séance type ou une séance vide, puis pose-y des protocoles de la bibliothèque.</p>}
          <p className="mention" role="status" aria-live="polite">{message}</p>

          {deLaSemaine.length > 0 && (
            <section className="semaine-avertissements pile" aria-labelledby="titre-avertissements-semaine">
              <h3 className="surtitre" id="titre-avertissements-semaine">
                {nombreDuRepere(deLaSemaine) > 0 && <span className="repere-avertissements"><Icone nom="avertissement" taille={20} /></span>}
                {phraseCompte(compter(deLaSemaine))}
              </h3>
              <ul className="liste-simple pile">
                {deLaSemaine.map((e) => (
                  <li key={e.cle}>
                    {e.seanceId === undefined ? (
                      // Portée semaine : c'est ici le niveau le plus précis, on l'ouvre.
                      <AvertissementDuMoteur entree={e} actions={actionsFiche()} />
                    ) : (
                      <p className={`avertissement-resume${e.garde ? ' garde' : ''}`}>
                        <Icone nom={e.forme === 'arret' ? 'arret' : e.forme === 'information' ? 'information' : 'avertissement'} taille={20} />
                        <span><strong>{nomDeSeance(e)}</strong> : {scinderMessage(e.avertissement.message).titre}{e.garde ? ' (gardé)' : ''}</span>
                        <button type="button" className="bouton-discret" onClick={() => voirLaSeance(e.seanceId)}>Voir la séance</button>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ol className="semaine-jours">
            {jours.map((j) => (
              <li key={j.index} className={`jour-ligne${j.date === aujourdhui ? ' aujourdhui' : ''}`} aria-current={j.date === aujourdhui ? 'date' : undefined}>
                <div className="jour-nom">
                  <span className="mention">{JOURS_LONGS[j.index].slice(0, 3)}</span>
                  <span className="donnee">{dateCourte(j.date)}</span>
                </div>
                {j.seances.length === 0 ? (
                  <div className={`jour-repos${enMain && textePour(enMain, idZone('jour', j.index)) ? ' zone-valable' : ''}${glisse.etat?.zone === idZone('jour', j.index) ? ' zone-survolee' : ''}`}
                    data-zone={idZone('jour', j.index)}>
                    <span className="texte-2">Repos</span>
                    {enMain && textePour(enMain, idZone('jour', j.index)) && <p className="zone-texte">{textePour(enMain, idZone('jour', j.index))}</p>}
                    <div className="jour-actions">
                      <button type="button" className="bouton-texte" aria-label={`Ajouter une séance type, ${nomJour(j)}`} onClick={() => setJourSeanceType(j.index)}>Ajouter une séance type</button>
                      <button type="button" className="bouton-texte" aria-label={`Ajouter une séance vide, ${nomJour(j)}`} onClick={() => ajouterVide(j)}>Séance vide</button>
                    </div>
                  </div>
                ) : (
                  <div className="pile-large jour-seances">
                    {j.seances.map((s) => (
                      <FicheSeance key={s.id} seance={s} cycle={cycle} fiches={fiches} entrees={parId} contexte={contexte.filtre} couleurs={couleurs}
                        remplacement={remplacement?.seanceId === s.id ? remplacement.index : null}
                        glisse={glisseDe(s)}
                        avertissements={actionsFiche(s)}
                        onGlisserEtape={(e, liste, index, titre) => glisse.demarrer(e, { type: 'etape', seanceId: s.id, liste, index, titre }, titre, rappelsGlisser)}
                        onChanger={ecrire} onSupprimer={() => setARetirer(s)} onVoirFiche={setFicheOuverte}
                        onRemplacer={(index) => setRemplacement({ seanceId: s.id, index })} onAnnulerRemplacement={() => setRemplacement(null)} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>

      {aAjouter && (
        <AjouterA entree={aAjouter} jours={jours} onAnnuler={() => setAAjouter(null)}
          onValider={(jour, seanceId, ou) => ajouterFiche(aAjouter, jour, seanceId, ou)} />
      )}
      {jourSeanceType !== null && (
        <AjouterSeanceType jour={nomJour(jours[jourSeanceType])} choix={choixTypes} onAnnuler={() => setJourSeanceType(null)} onChoisir={ajouterSeanceType} />
      )}
      {donneesFiche && <FicheDetail donnees={donneesFiche} onFermer={() => setFicheOuverte(undefined)} onAjouter={() => { setAAjouter(donneesFiche.entree); setFicheOuverte(undefined) }} />}

      {glisse.etat && <FantomeGlisse libelle={glisse.etat.libelle} x={glisse.etat.x} y={glisse.etat.y} />}

      <Confirmation
        ouverte={aRetirer !== null}
        titre="Retirer la séance ?"
        texte={aRetirer ? `« ${aRetirer.solo.nom} » sera retirée du plan. Les séances déjà faites ne bougent pas.` : ''}
        libelleAction="Retirer la séance"
        onRester={() => setARetirer(null)}
        onAction={() => {
          if (aRetirer) onChangerSeances({ ecrites: [], retirees: [aRetirer.id] })
          setMessage('Séance retirée.')
          setARetirer(null)
        }}
      />
    </div>
  )
}
