// Passerelles entre le modèle v2 (documents enregistrés), la bibliothèque et le moteur de vérification.
// C'est le seul endroit où les noms des deux mondes se rencontrent (R-2) : « allégée » devient `decharge`,
// `tractionsStrictes` devient `tractionsStrictesMax`, etc.
// Fonctions pures : les écrans lisent la base, puis appellent ces fonctions. Rien de calculable n'est écrit
// dans les documents (R-8). Spécification : docs/backlog-v2.md, C-01 ; docs/specs/niveaux-de-detail.md § 3.
import { protocoleParId } from '../donnees/bibliotheque/index.ts'
import type { Protocole } from '../donnees/bibliotheque/types.ts'
import type {
  Cycle, DateISO, DouleurDeclaree, ExercicePerso, FormeDuJour, Horodatage, ObjectifSpecifique,
  PhaseCycle, Profil, Reglages, SeancePlanifiee, SeanceRealisee, VersionGroupe, VersionSolo,
} from '../donnees/modele.ts'
import { dureeVersionSolo, niveauAffiche } from '../donnees/niveaux.ts'
import { objectifGroupeParId } from '../donnees/objectifsGroupe.ts'
import { objectifParId, objectifVersVerif } from '../donnees/objectifsSpecifiques.ts'
import { debutSemaine } from '../donnees/plan.ts'
import { recommandationSeanceType, type EtapeType, type MiniBlocType, type SeanceType } from '../donnees/seancesTypes.ts'
import type { EtapeSeance, ObjectifGroupe, ReglagesEtape } from '../moteur/types.ts'
import { fichesDeLaBibliotheque, solliciteDoigtsPerso } from './adaptateur.ts'
import { marqueursDe, zonesDouloureuses } from './base.ts'
import { REGLES_PAR_DEFAUT } from './reglesParDefaut.ts'
import type {
  Avertissement, ContexteVerif, DouleurVerif, EtapeVerif, FicheVerif, FormeVerif, Marqueur,
  ObjectifGroupeVerif, ObjectifPersoVerif, PlanVerif, ProfilVerif, Regles, SemaineVerif, SeanceVerif,
  VersionVerif, ZoneDouleur,
} from './types.ts'
import { manquesPrerequis } from './verifSeanceProfil.ts'

type Fiches = Record<string, FicheVerif>

// ——— 1. Profil ———

/** Le profil enregistré, dans les mots du moteur. `null` reste `null` : il compte comme « non rempli ». */
export function profilVersVerif(p: Profil): ProfilVerif {
  return {
    disciplinePrincipale: p.disciplinePrincipale,
    niveauBloc: p.niveauBloc === '' ? null : p.niveauBloc,
    anneesPratique: p.anneesPratique,
    experiencePoutre: p.experiencePoutre,
    tractionsStrictesMax: p.tractionsStrictes,
    test15sSur25mm: p.tient15sSur25mm,
    adulte: p.majeur,
    grimpeEnTete: p.grimpeEnTete,
    douleursEnCours: [...p.douleursEnCours],
    seancesParSemaine: p.seancesParSemaine,
    // Prudence : sans lieu renseigné, on suppose une salle de bloc seulement (pas de corde, rien à la maison).
    lieux: p.lieux.length === 0 ? ['salle_bloc'] : [...p.lieux],
  }
}

// ——— 2. Fiches ———

/** Un exercice personnel, ramené à la forme d'une fiche. `marqueurs: null` = pas encore qualifié. */
export function ficheDepuisExercicePerso(e: ExercicePerso): FicheVerif {
  const fiche: FicheVerif = {
    id: e.id,
    nom: e.nom,
    origine: 'perso',
    qualite: e.qualite,
    dureeMin: e.dureeMin,
    marqueurs: e.marqueurs,
    prerequis: e.prerequis ?? {},
    contreIndications: e.contreIndications,
    solliciteDoigts: solliciteDoigtsPerso(e.contexte?.terrain),
  }
  if (e.contexte) fiche.contexte = e.contexte
  if (e.reposEntreEffortsS !== undefined) fiche.reposEntreEffortsS = e.reposEntreEffortsS
  return fiche
}

/** Toute la bibliothèque plus les exercices personnels non supprimés. En cas d'identifiant commun, la bibliothèque l'emporte. */
export function toutesLesFiches(exercicesPerso: ExercicePerso[]): Fiches {
  const perso = Object.fromEntries(
    exercicesPerso.filter((e) => !e.supprimeLe).map((e) => [e.id, ficheDepuisExercicePerso(e)]),
  )
  return { ...perso, ...fichesDeLaBibliotheque() }
}

// ——— 3. Étapes ———

/** Ce qu'il faut pour fabriquer une étape : un protocole ou un exercice personnel. */
type SourceEtape = Protocole | ExercicePerso

/** Recopie complète d'une source en étape : l'étape ne relira jamais la bibliothèque (architecture § 3.2). */
function etapeDepuis(
  source: 'bibliotheque' | 'perso',
  p: SourceEtape,
  id: string,
  reglages?: ReglagesEtape,
): EtapeSeance {
  const commun = {
    id,
    titre: p.nom,
    resume: p.resume,
    consigne: p.consigne,
    dureeMin: reglages?.dureeMin ?? p.dureeMin,
    origine: { source, refId: p.id, ...(reglages ? { reglages } : {}) },
    ...('preuve' in p && p.preuve !== undefined ? { preuve: p.preuve } : {}),
  }
  switch (p.forme) {
    case 'chrono': {
      // Les séries réglées s'appliquent au chrono lui-même : c'est lui que l'écran lance.
      const config = reglages?.series !== undefined ? { ...p.config, series: reglages.series } : { ...p.config }
      return { ...commun, forme: 'chrono', config, mot: p.mot, detail: p.detail }
    }
    case 'liste':
      return { ...commun, forme: 'liste', elements: [...p.elements] }
    case 'essais':
      return {
        ...commun,
        forme: 'essais',
        reposS: reglages?.reposS ?? p.reposS,
        ...(p.essaisParSerie !== undefined ? { essaisParSerie: p.essaisParSerie } : {}),
        ...(p.reposSeriesS !== undefined ? { reposSeriesS: p.reposSeriesS } : {}),
      }
  }
}

export function etapeDepuisProtocole(p: Protocole, id: string, reglages?: ReglagesEtape): EtapeSeance {
  return etapeDepuis('bibliotheque', p, id, reglages)
}

export function etapeDepuisExercicePerso(e: ExercicePerso, id: string, reglages?: ReglagesEtape): EtapeSeance {
  return etapeDepuis('perso', e, id, reglages)
}

// ——— 4. Séance planifiée depuis une séance type ———

/** Les étapes d'une liste du catalogue ; l'identifiant est celui de la fiche, suivi de -2, -3… si elle revient. */
function etapesDepuisTypes(liste: EtapeType[], prefixe = ''): EtapeSeance[] {
  const vus = new Map<string, number>()
  return liste.map((e) => {
    const protocole = protocoleParId(e.ficheId)
    if (!protocole) throw new Error(`Fiche inconnue dans une séance type : ${e.ficheId}`)
    const n = (vus.get(e.ficheId) ?? 0) + 1
    vus.set(e.ficheId, n)
    return etapeDepuisProtocole(protocole, `${prefixe}${e.ficheId}${n > 1 ? `-${n}` : ''}`, e.reglages)
  })
}

/** Un objectif du catalogue devient un objectif enregistré : seuls les champs présents sont recopiés. */
function objectifDepuisCatalogue(id: string): ObjectifGroupe {
  const o = objectifGroupeParId(id)
  if (!o) throw new Error(`Objectif de groupe inconnu : ${id}`)
  return {
    libelle: o.libelle,
    cible: o.cible,
    compte: o.compte,
    modeleId: o.id,
    ...(o.ficheReference !== undefined ? { ficheReference: o.ficheReference } : {}),
    ...(o.blocs !== undefined ? { blocs: o.blocs } : {}),
    ...(o.essaisMaxParBloc !== undefined ? { essaisMaxParBloc: o.essaisMaxParBloc } : {}),
    ...(o.ecartCotation !== undefined ? { ecartCotation: [...o.ecartCotation] as [number, number] } : {}),
    ...(o.reposConseilleS !== undefined ? { reposConseilleS: o.reposConseilleS } : {}),
    accents: [...o.accents],
  }
}

/** Repos conseillé en groupe quand aucun objectif n'en donne : 3 min, la borne basse des efforts intenses. */
const REPOS_GROUPE_PAR_DEFAUT_S = 180

/**
 * Une séance planifiée à partir d'une séance type (et de sa variante). Les étapes sont recopiées complètes.
 * `maintenant` sert aux dates du document : la fonction reste pure (pas d'horloge ici).
 * Le niveau de détail n'est pas posé : la séance suit celui du cycle (R-9).
 */
export function seanceDepuisType(
  st: SeanceType,
  variante: string | undefined,
  base: { id: string; cycleId: string; phaseId: string; semaine: 1 | 2 | 3 | 4; date: DateISO; maintenant: Horodatage },
): SeancePlanifiee {
  const v = variante === undefined ? undefined : st.variantes[variante]
  if (variante !== undefined && v === undefined) throw new Error(`Variante inconnue pour ${st.id} : ${variante}`)

  const solo: VersionSolo = {
    nom: st.nom,
    etapes: etapesDepuisTypes(v?.solo ?? st.solo),
    durete: st.durete,
    recommandation: recommandationSeanceType(st, variante),
  }

  let groupe: VersionGroupe | null = null
  if (st.groupe !== null) {
    const objectifs = st.groupe.objectifIds.map(objectifDepuisCatalogue)
    const miniBloc: MiniBlocType | undefined = v?.miniBloc ?? st.groupe.miniBloc
    groupe = {
      nom: st.nom,
      durete: st.durete,
      reposConseilleS: Math.max(REPOS_GROUPE_PAR_DEFAUT_S, ...objectifs.map((o) => o.reposConseilleS ?? 0)),
      objectifs,
      ...(miniBloc ? { miniBloc: { moment: miniBloc.moment, etapes: etapesDepuisTypes(miniBloc.etapes, 'groupe-') } } : {}),
    }
  }

  return {
    id: base.id,
    versionFormat: 1,
    creeLe: base.maintenant,
    modifieLe: base.maintenant,
    cycleId: base.cycleId,
    phaseId: base.phaseId,
    semaine: base.semaine,
    date: base.date,
    qualite: st.qualite,
    solo,
    groupe,
    seanceTypeId: st.id,
    ...(variante !== undefined ? { variante } : {}),
  }
}

// ——— 5. Marqueurs d'une version planifiée ———

/** Marqueurs d'une fiche citée, sans doublon ; une fiche inconnue n'en apporte aucun. */
function marqueursDesFiches(ids: string[], fiches: Fiches): Marqueur[] {
  const marqueurs = new Set<Marqueur>()
  for (const id of ids) {
    const fiche = fiches[id]
    if (fiche) marqueursDe(fiche).forEach((m) => marqueurs.add(m))
  }
  return [...marqueurs]
}

/**
 * Marqueurs d'une version planifiée : fiches citées par les étapes (`origine.refId`), par les exercices principaux
 * des parties, et par les fiches de référence des objectifs de groupe. Calculés à chaque fois, jamais stockés ;
 * ils servent à remplir `SeanceRealisee.marqueurs` quand la séance est lancée.
 */
export function marqueursVersionPlanifiee(v: VersionSolo | VersionGroupe, fiches: Fiches): Marqueur[] {
  const ids: string[] = []
  if ('objectifs' in v) {
    v.miniBloc?.etapes.forEach((e) => e.origine && ids.push(e.origine.refId))
    v.objectifs.forEach((o) => o.ficheReference !== undefined && ids.push(o.ficheReference))
  } else {
    v.etapes.forEach((e) => e.origine && ids.push(e.origine.refId))
    v.parties?.forEach((p) => p.principal && ids.push(p.principal.refId))
  }
  return marqueursDesFiches(ids, fiches)
}

// ——— 6. Séances vers la vue du moteur ———

/** Réglages que le moteur lit pour une étape : ce que l'étape contient vraiment (durée, repos), plus les séries réglées. */
function reglagesVerif(e: EtapeSeance): EtapeVerif['reglages'] {
  const reglages: NonNullable<EtapeVerif['reglages']> = { dureeMin: e.dureeMin }
  const series = e.forme === 'chrono' ? e.config.series : e.origine?.reglages?.series
  if (series !== undefined) reglages.series = series
  const reposS = e.forme === 'essais' ? e.reposS : e.origine?.reglages?.reposS
  if (reposS !== undefined) reglages.reposS = reposS
  return reglages
}

/** Une étape sans origine garde son propre identifiant : la fiche sera inconnue et S-01 le dira (voulu). */
function etapeVersVerif(e: EtapeSeance): EtapeVerif {
  const etape: EtapeVerif = { ficheId: e.origine?.refId ?? e.id, reglages: reglagesVerif(e) }
  if (e.objectifSpecifiqueId !== undefined) etape.moduleObjectifId = e.objectifSpecifiqueId
  return etape
}

/**
 * Version solo vue par le moteur (niveaux-de-detail.md § 3.1) : le contenu le plus fin qui existe.
 * Étapes réelles s'il y en a ; sinon une étape résumée par partie qui a un exercice principal.
 */
function soloVersVerif(solo: VersionSolo, niveau: VersionVerif['niveau']): VersionVerif {
  const v: VersionVerif = { durete: solo.durete, etapes: [], niveau }
  if (solo.effortPrevu !== undefined) v.effortPrevu = solo.effortPrevu
  if (solo.etapes.length > 0) {
    v.etapes = solo.etapes.map(etapeVersVerif)
    return v
  }
  // Pas d'étapes : l'ordre réel est inconnu (P-15 le dit), et la durée vient des parties.
  v.etapesDetaillees = false
  v.dureeMin = dureeVersionSolo(solo)
  v.etapes = (solo.parties ?? []).flatMap((p) =>
    p.principal ? [{ ficheId: p.principal.refId, reglages: { dureeMin: p.dureeMin } }] : [],
  )
  return v
}

function groupeVersVerif(g: VersionGroupe, fiches: Fiches): VersionVerif {
  const objectifs: ObjectifGroupeVerif[] = g.objectifs.map((o) => ({
    libelle: o.libelle,
    accents: o.accents ?? [],
    marqueurs: o.ficheReference !== undefined ? marqueursDesFiches([o.ficheReference], fiches) : [],
    ...(o.blocs !== undefined ? { blocs: o.blocs } : {}),
    ...(o.essaisMaxParBloc !== undefined ? { essaisMaxParBloc: o.essaisMaxParBloc } : {}),
    ...(o.reposConseilleS !== undefined ? { reposConseilleS: o.reposConseilleS } : {}),
  }))
  const v: VersionVerif = { durete: g.durete, etapes: (g.miniBloc?.etapes ?? []).map(etapeVersVerif), objectifs }
  if (g.effortPrevu !== undefined) v.effortPrevu = g.effortPrevu
  if (g.dureeMin !== undefined) v.dureeMin = g.dureeMin
  return v
}

/** Ce que le moteur sait d'une séance réalisée : le réel (durée, effort, marqueurs de l'instantané). */
function realiseeVerif(r: SeanceRealisee): NonNullable<SeanceVerif['realisee']> {
  const realisee: NonNullable<SeanceVerif['realisee']> = {
    version: r.mode === 'groupe' ? 'groupe' : 'solo', // une séance libre se compte comme du solo
    finLe: r.creeLe,
    dureeMin: r.dureeMin,
    effortPercu: r.effortPercu,
    marqueurs: r.marqueurs ?? [],
  }
  if (r.peau !== undefined) realisee.peau = r.peau
  return realisee
}

/**
 * Une séance planifiée (et, si elle a été faite, sa séance réalisée) dans la vue du moteur.
 * `cycle` donne le niveau choisi par défaut ; le niveau affiché ne change que `niveau`, jamais les étapes (R-9).
 */
export function seanceVersVerif(
  s: SeancePlanifiee,
  fiches: Fiches,
  realisee?: SeanceRealisee,
  cycle?: Pick<Cycle, 'niveauDetail'>,
): SeanceVerif {
  const seance: SeanceVerif = {
    id: s.id,
    nom: s.solo.nom,
    date: s.date,
    qualite: s.qualite,
    solo: soloVersVerif(s.solo, niveauAffiche(s, cycle)),
  }
  if (s.groupe) seance.groupe = groupeVersVerif(s.groupe, fiches)
  if (realisee) seance.realisee = realiseeVerif(realisee)
  return seance
}

/**
 * Une séance réalisée hors plan (ou dont la séance planifiée n'existe plus), dans la vue du moteur.
 * Seules les étapes faites qui citent une fiche comptent : ce qui n'a pas de fiche ne déclenche pas S-01 dans l'historique.
 */
export function realiseeVersVerif(r: SeanceRealisee): SeanceVerif {
  const etapes: EtapeVerif[] = r.etapes
    .filter((e) => e.statut === 'faite' && e.refId !== undefined)
    .map((e) => ({ ficheId: e.refId as string }))
  const seance: SeanceVerif = {
    id: r.id,
    nom: r.nom,
    date: r.date,
    // Séance libre sans qualité : « technique », la qualité qui n'ajoute ni quota ni repos.
    qualite: r.qualite ?? 'technique',
    solo: { durete: r.durete, etapes, dureeMin: r.dureeMin },
    realisee: realiseeVerif(r),
  }
  if (r.mode === 'groupe') {
    seance.groupe = {
      durete: r.durete,
      etapes: [],
      objectifs: r.objectifs.map((o) => ({ libelle: o.libelle, accents: [], marqueurs: r.marqueurs ?? [] })),
    }
  }
  return seance
}

// ——— 7. Plan ———

const TYPE_SEMAINE: Record<'charge' | 'allegee' | 'affutage' | 'transition', SemaineVerif['type']> = {
  charge: 'charge',
  allegee: 'decharge', // « allégée » à l'écran, `decharge` dans le moteur (R-2)
  affutage: 'affutage',
  transition: 'transition',
}

export interface EntreesPlanVerif {
  cycle: Cycle
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  realisees: SeanceRealisee[]
  objectifs: ObjectifSpecifique[] // les objectifs spécifiques des phases
  origine: 'utilisateur' | 'assistant'
  fiches: Fiches // sert aux marqueurs des objectifs de groupe
  cycleSuivant?: Pick<Cycle, 'debut'>
}

/**
 * Le plan d'un cycle dans la vue du moteur. Calculés ici, jamais stockés : le lundi de chaque semaine,
 * le mode (objectif daté ou accent tournant) et la réduction d'affûtage.
 * Une séance supprimée est exclue ; une séance sautée aussi, sauf si elle a été faite (« faite » l'emporte).
 */
export function planVersVerif(entrees: EntreesPlanVerif): PlanVerif {
  const { cycle, seances, realisees, objectifs } = entrees
  const phases = entrees.phases.filter((p) => !p.supprimeLe).sort((a, b) => a.ordre - b.ordre)
  const faites = realisees.filter((r) => !r.supprimeLe)

  const semaines: SemaineVerif[] = phases.flatMap((phase) =>
    [...phase.semaines]
      .sort((a, b) => a.numero - b.numero)
      .map((w): SemaineVerif => ({
        lundi: debutSemaine(cycle, phase, w.numero),
        type: TYPE_SEMAINE[w.type],
        ...(w.reductionPct !== undefined ? { reductionPct: w.reductionPct } : {}),
        mesocycleOrdre: phase.ordre,
        numero: w.numero,
      })),
  )

  const planifiees = seances
    .filter((s) => !s.supprimeLe)
    .map((s) => ({ s, realisee: faites.find((r) => r.seancePlanifieeId === s.id) }))
    .filter(({ s, realisee }) => !s.sauteeLe || realisee !== undefined)
  const idsPlanifiees = new Set(planifiees.map(({ s }) => s.id))
  // Une séance faite compte même sans séance planifiée dans le plan (hors plan, ou séance planifiée supprimée).
  const horsPlan = faites.filter((r) => r.seancePlanifieeId === undefined || !idsPlanifiees.has(r.seancePlanifieeId))

  const seancesVerif = [
    ...planifiees.map(({ s, realisee }) => seanceVersVerif(s, entrees.fiches, realisee, cycle)),
    ...horsPlan.map(realiseeVersVerif),
  ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  const plan: PlanVerif = {
    origine: entrees.origine,
    debut: cycle.debut,
    nbSemaines: cycle.nbSemaines,
    seancesParSemaine: cycle.seancesParSemaine,
    mode: cycle.objectif?.date !== undefined ? 'objectif_date' : 'accent_tournant',
    mesocycles: phases.map((p) => ({
      ordre: p.ordre,
      accent: p.accent,
      objectifsPersoIds: objectifs.filter((o) => o.phaseId === p.id && !o.supprimeLe).map((o) => o.id),
    })),
    semaines,
    seances: seancesVerif,
  }
  if (cycle.objectif?.date !== undefined) {
    const affutages = phases.flatMap((p) => p.semaines.filter((w) => w.type === 'affutage'))
    plan.objectif = {
      date: cycle.objectif.date,
      semainesAffutage: affutages.length,
      reductionVolumePct: affutages[0]?.reductionPct ?? REGLES_PAR_DEFAUT.dechargeReductionPct,
    }
  }
  if (entrees.cycleSuivant) plan.cycleSuivantDebut = entrees.cycleSuivant.debut
  return plan
}

// ——— 8. Contexte ———

/** Les réglages de l'utilisateur sur les défauts : une valeur d'un autre type (ou non finie) est ignorée. */
function reglesAvecReglages(reglesSecurite: Record<string, number | boolean>): Regles {
  const regles: Record<string, number | boolean> = { ...REGLES_PAR_DEFAUT }
  for (const cle of Object.keys(REGLES_PAR_DEFAUT)) {
    const valeur = reglesSecurite[cle]
    const defaut = regles[cle]
    if (valeur === undefined || typeof valeur !== typeof defaut) continue
    if (typeof valeur === 'number' && !Number.isFinite(valeur)) continue
    regles[cle] = valeur
  }
  return regles as unknown as Regles
}

/**
 * Les objectifs spécifiques d'un plan, par identifiant de document (celui des étapes et de `objectifsPersoIds`).
 * Un objectif du catalogue (C-02) se déduit de sa fiche ; un objectif écrit à la main n'a ni marqueur ni prérequis connus.
 */
function objectifsVersVerif(objectifs: ObjectifSpecifique[]): Record<string, ObjectifPersoVerif> {
  const resultat: Record<string, ObjectifPersoVerif> = {}
  for (const o of objectifs) {
    if (o.supprimeLe) continue
    const modele = o.modeleId !== undefined ? objectifParId(o.modeleId) : undefined
    resultat[o.id] = modele
      ? { ...objectifVersVerif(modele), id: o.id, nom: o.libelle }
      : { id: o.id, nom: o.libelle, marqueurs: [], prerequis: {}, contreIndications: [] }
  }
  return resultat
}

function douleurVersVerif(d: DouleurDeclaree): DouleurVerif {
  return {
    date: d.date,
    zone: d.zone,
    niveau: d.niveau,
    signes: [...d.signes],
    ...(d.resolueLe !== undefined ? { resolueLe: d.resolueLe } : {}),
  }
}

function formeVersVerif(f: FormeDuJour): FormeVerif {
  return {
    date: f.date,
    sommeil: f.sommeil,
    fatigue: f.fatigue,
    courbatures: f.courbatures,
    douleur: f.douleur,
    peau: f.peau,
    ...(f.heuresSommeil !== undefined ? { heuresSommeil: f.heuresSommeil } : {}),
  }
}

export interface EntreesContexteVerif {
  profil: Profil
  reglages?: Pick<Reglages, 'reglesSecurite'>
  exercicesPerso: ExercicePerso[]
  douleurs: DouleurDeclaree[]
  formes: FormeDuJour[]
  objectifs: ObjectifSpecifique[]
  aujourdhui: DateISO
  maintenant: Horodatage
}

/** Tout ce que le moteur a besoin de savoir, construit depuis les documents. Les résultats de tests attendent C-08 : vides. */
export function contexteVerif(e: EntreesContexteVerif): ContexteVerif {
  return {
    aujourdhui: e.aujourdhui,
    maintenant: e.maintenant,
    profil: profilVersVerif(e.profil),
    fiches: toutesLesFiches(e.exercicesPerso),
    objectifsPerso: objectifsVersVerif(e.objectifs),
    douleurs: e.douleurs.filter((d) => !d.supprimeLe).map(douleurVersVerif),
    formes: e.formes.filter((f) => !f.supprimeLe).map(formeVersVerif),
    resultatsTests: [],
    regles: reglesAvecReglages(e.reglages?.reglesSecurite ?? {}),
  }
}

// ——— 9. Prérequis et douleurs d'une fiche (bibliothèque, fiche d'exercice) ———

/**
 * Pourquoi une fiche ne convient pas encore : prérequis manquants en clair, et zones de douleur en cause.
 * `douleurs` doit déjà être sans les douleurs supprimées.
 */
export function etatPrerequis(
  fiche: FicheVerif,
  profil: ProfilVerif,
  douleurs: DouleurVerif[],
  aujourdhui: DateISO,
): { manques: string[]; contreIndications: ZoneDouleur[] } {
  // zonesDouloureuses ne lit que le profil et les douleurs du contexte.
  const zones = zonesDouloureuses({ profil, douleurs } as ContexteVerif, aujourdhui)
  return {
    manques: manquesPrerequis(fiche.prerequis, profil),
    contreIndications: fiche.contreIndications.filter((z) => zones.includes(z)),
  }
}

// ——— 10. Avertissements : clé et forme d'affichage ———

/** Clé stable d'un avertissement, enregistrée dans `Cycle.avertissementsGardes` par « Je garde ce choix ». */
export function cleAvertissement(a: Avertissement): string {
  const cle = [a.code, a.seanceId, a.version, a.etapeIndex, a.lundi, a.mesocycleOrdre].map((v) => v ?? '').join('|')
  // Le sujet n'est ajouté que s'il existe : les clés déjà gardées par l'utilisateur ne changent pas.
  return a.sujet === undefined ? cle : `${cle}|${a.sujet}`
}

const CODES_ARRET = ['S-04', 'S-05', 'S-06', 'J-05']

/** Comment l'écran montre l'avertissement : signal d'arrêt, avertissement, ou simple information. */
export function formeAffichage(a: Avertissement): 'information' | 'avertissement' | 'arret' {
  if (CODES_ARRET.includes(a.code)) return 'arret'
  return a.niveau === 'fort' ? 'avertissement' : 'information'
}
