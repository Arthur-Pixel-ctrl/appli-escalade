// Fonctions de base du moteur de vérification (moteur-verification.md, B.2).
// Toutes sont pures : elles ne lisent ni la base, ni le navigateur. Les fonctions qui ont besoin
// d'une fiche reçoivent `fiches` et ignorent une étape dont la fiche est inconnue.
import {
  EFFORT_PREVU_PAR_DEFAUT,
  MARQUEURS_NERVEUX,
} from './reglesParDefaut.ts'
import type {
  ContexteVerif,
  EtapeVerif,
  FicheVerif,
  FormeVerif,
  Jour,
  Marqueur,
  SeanceVerif,
  VersionVerif,
  ZoneDouleur,
} from './types.ts'

type Fiches = Record<string, FicheVerif>

const MS_PAR_JOUR = 86_400_000

// --- Dates : tout se calcule en UTC, pour ne pas être faussé par le changement d'heure ---

/** Date UTC (minuit) d'un jour « 2026-11-17 ». */
function enUtc(jour: Jour): number {
  const [a, m, j] = jour.split('-').map(Number)
  return Date.UTC(a, m - 1, j)
}

/** Nombre de jours calendaires de a à b (b − a). */
export function joursEntre(a: Jour, b: Jour): number {
  return Math.round((enUtc(b) - enUtc(a)) / MS_PAR_JOUR)
}

/** Jour obtenu en ajoutant n jours (n peut être négatif). */
export function ajouterJours(jour: Jour, n: number): Jour {
  return new Date(enUtc(jour) + n * MS_PAR_JOUR).toISOString().slice(0, 10)
}

/** Lundi de la semaine du jour donné (un lundi reste lui-même). */
export function lundiDe(jour: Jour): Jour {
  const joursDepuisLundi = (new Date(enUtc(jour)).getUTCDay() + 6) % 7
  return ajouterJours(jour, -joursDepuisLundi)
}

/** Heures écoulées entre deux horodatages ISO (négatif si b est avant a). */
export function heuresEntre(isoA: string, isoB: string): number {
  return (Date.parse(isoB) - Date.parse(isoA)) / 3_600_000
}

// --- Marqueurs et nature des exercices ---

/** Marqueurs d'une fiche ; une fiche perso non qualifiée (null) n'en a aucun. */
export function marqueursDe(f: FicheVerif): Marqueur[] {
  return f.marqueurs ?? []
}

/** Un exercice est nerveux s'il porte un marqueur d'effort intense. */
export function estNerveuse(f: FicheVerif): boolean {
  return marqueursDe(f).some((m) => MARQUEURS_NERVEUX.includes(m))
}

/** Durée d'une étape : le réglage de l'étape, sinon la durée de la fiche. */
export function dureeEtape(e: EtapeVerif, f: FicheVerif): number {
  return e.reglages?.dureeMin ?? f.dureeMin
}

/** Résistance, ou endurance de 20 min et plus : un travail qui congestionne les avant-bras. */
export function estCongestionnante(e: EtapeVerif, f: FicheVerif): boolean {
  return f.qualite === 'resistance' || (f.qualite === 'endurance' && dureeEtape(e, f) >= 20)
}

/** Les étapes d'une version dont la fiche est connue, avec leur fiche. */
function etapesConnues(v: VersionVerif, fiches: Fiches): { etape: EtapeVerif; fiche: FicheVerif }[] {
  return v.etapes.flatMap((etape) => {
    const fiche = fiches[etape.ficheId]
    return fiche ? [{ etape, fiche }] : []
  })
}

/** Version solo dont aucune étape n'a de fiche connue (étapes vides ou toutes inconnues). */
export function sansContenuConnu(v: VersionVerif, fiches: Fiches): boolean {
  return etapesConnues(v, fiches).length === 0
}

/**
 * Marqueurs d'une version : ceux des fiches connues et des objectifs de groupe.
 * Décision F7 (23/11) : une version sans contenu connu n'en a aucun, même dure (séance dure ordinaire).
 */
export function marqueursVersion(v: VersionVerif, fiches: Fiches): Marqueur[] {
  const marqueurs = new Set<Marqueur>()
  for (const { fiche } of etapesConnues(v, fiches)) marqueursDe(fiche).forEach((m) => marqueurs.add(m))
  for (const o of v.objectifs ?? []) o.marqueurs.forEach((m) => marqueurs.add(m))
  return [...marqueurs]
}

/** Séance réalisée : ses marqueurs réels. Séance prévue : ceux des deux versions, par prudence. */
export function marqueursSeance(s: SeanceVerif, fiches: Fiches): Marqueur[] {
  if (s.realisee) return s.realisee.marqueurs
  const versions = s.groupe ? [s.solo, s.groupe] : [s.solo]
  return [...new Set(versions.flatMap((v) => marqueursVersion(v, fiches)))]
}

/** Séance qui contient un effort maximal. */
export function estMaximale(s: SeanceVerif, fiches: Fiches): boolean {
  return marqueursSeance(s, fiches).includes('maximale')
}

/** Séance qui contient de la poutre intensive. */
export function estPoutreIntensive(s: SeanceVerif, fiches: Fiches): boolean {
  return marqueursSeance(s, fiches).includes('poutre_intensive')
}

/** Dure si une version est déclarée dure, ou si elle est maximale (même déclarée légère). */
export function estDure(s: SeanceVerif, fiches: Fiches): boolean {
  return s.solo.durete === 'dure' || s.groupe?.durete === 'dure' || estMaximale(s, fiches)
}

// --- Durée et charge ---

/** Durée d'une version : la durée annoncée si elle existe, sinon la somme des étapes connues. */
export function dureeVersion(v: VersionVerif, fiches: Fiches): number {
  if (v.dureeMin !== undefined) return v.dureeMin
  return etapesConnues(v, fiches).reduce((total, { etape, fiche }) => total + dureeEtape(etape, fiche), 0)
}

/** Effort prévu (1 à 10) ; sans valeur : 7 pour une version dure, 4 pour une légère (décision B17). */
export function effortPrevu(v: VersionVerif): number {
  return v.effortPrevu ?? EFFORT_PREVU_PAR_DEFAUT[v.durete]
}

/** Charge d'une séance = effort × minutes. Réalisée : le réel. Prévue : la plus lourde des deux versions. */
export function chargePrevue(s: SeanceVerif, fiches: Fiches): number {
  if (s.realisee) return s.realisee.effortPercu * s.realisee.dureeMin
  const chargeSolo = effortPrevu(s.solo) * dureeVersion(s.solo, fiches)
  if (!s.groupe) return chargeSolo
  return Math.max(chargeSolo, effortPrevu(s.groupe) * dureeVersion(s.groupe, fiches))
}

/** Charge de la semaine : somme des séances du lundi au dimanche. */
export function chargeSemaine(lundi: Jour, seances: SeanceVerif[], fiches: Fiches): number {
  return seances
    .filter((s) => {
      const decalage = joursEntre(lundi, s.date)
      return decalage >= 0 && decalage <= 6
    })
    .reduce((total, s) => total + chargePrevue(s, fiches), 0)
}

// --- Doigts, douleurs, forme ---

/** Une séance sollicite les doigts si une étape connue ou un objectif de groupe les sollicite. */
export function seanceSolliciteDoigts(s: SeanceVerif, fiches: Fiches): boolean {
  if (etapesConnues(s.solo, fiches).some(({ fiche }) => fiche.solliciteDoigts)) return true
  if (s.groupe?.objectifs && s.groupe.objectifs.length > 0) return true
  // Prudence : sans exercice connu, on suppose les doigts sollicités, sauf mobilité et antagonistes.
  return sansContenuConnu(s.solo, fiches) && s.qualite !== 'mobilite' && s.qualite !== 'antagonistes'
}

/** Zones de douleur du profil, plus celles des douleurs déclarées avant le jour et pas encore résolues. */
export function zonesDouloureuses(ctx: ContexteVerif, jour: Jour): ZoneDouleur[] {
  const zones = new Set<ZoneDouleur>(ctx.profil.douleursEnCours)
  for (const d of ctx.douleurs) {
    const ouverte = d.resolueLe === undefined || d.resolueLe > jour
    if (ouverte && d.date <= jour) zones.add(d.zone)
  }
  return [...zones]
}

/** Nombre de voyants rouges (valeur de 1 ou 2) parmi sommeil, fatigue, courbatures, douleur et peau. */
export function itemsRouges(forme: FormeVerif): number {
  return [forme.sommeil, forme.fatigue, forme.courbatures, forme.douleur, forme.peau].filter((v) => v <= 2).length
}

// --- Plafonds de la semaine ---

/** Nombre maximal de séances dures pour n séances : 2 → 2, 3 → 3, 4 et plus → 3. */
export function nbDuresMax(n: number): number {
  return Math.min(n, 3)
}

/** Séances de poutre autorisées selon les années de pratique (0 avant un an, 3 à partir de sept ans). */
export function capPoutreAnciennete(annees: number): number {
  if (annees < 1) return 0
  if (annees < 4) return 1
  if (annees < 7) return 2
  return 3
}
