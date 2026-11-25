// Validation d'une réponse de l'assistant avant tout usage (règles F-1 à F-9, contrôles A-01 à A-07).
// Écrite à la main, sans bibliothèque de schéma : une fonction par sujet, chacune ajoute des erreurs en français.
// Jamais d'exception : toute surprise devient un résultat « invalide ». Rien n'est accepté en silence :
// un champ inconnu, une valeur hors bornes ou un identifiant absent de la banque envoyée est une erreur.
// Conception : docs/specs/entrainement/assistant-ia.md (D.4, D.5, D.9) et moteur-verification.md (B.9).
import { LONGUEUR_MAX_RECOMMANDATION, NB_PARTIES_MAX } from '../donnees/niveaux.ts'
import type { NiveauDetail } from '../donnees/modele.ts'
import {
  AUTEURS_CONNUS,
  TITRES_LIVRES,
  type ReponseAssistant,
  type SourceCitee,
} from './format.ts'

/** Ce que l'assistant a le droit de citer : exactement ce qu'on lui a envoyé. */
export interface IdsAutorises {
  /** La banque envoyée : fichesDisponibles + exercicesPerso. Jamais une fiche de fichesIndisponibles. */
  fiches: Set<string>
  /** Id de séance type → ses variantes. */
  seancesTypes: Map<string, string[]>
  objectifsGroupe: Set<string>
  /** Ids de planEnCours.seancesAVenir. */
  seancesAVenir: Set<string>
  objectifsPerso: Set<string>
  /** Date du jour, "AAAA-MM-JJ". */
  aujourdhui: string
  /** Niveau de détail envoyé à l'assistant (contexte.niveauDetail ; 'detaille' pour un brouillon de cycle). */
  niveauDetail: NiveauDetail
  /** Id → niveau choisi par l'utilisateur (`niveauChoisi`), pas le niveau affiché, de chaque séance de planEnCours.seancesAVenir (niveau attendu du `par` d'un remplacer_seance). */
  niveauxSeancesAVenir: Map<string, NiveauDetail>
}

export type ResultatValidation =
  | { etat: 'ok'; reponse: ReponseAssistant; informations: string[] }
  | { etat: 'invalide'; code: 'A-01' | 'A-02' | 'A-04'; erreurs: string[] }
  | { etat: 'interdit'; reponse: ReponseAssistant }

/** Message standard de A-07 (moteur-verification.md, B.9). */
export const MESSAGE_A07 =
  "Je ne donne pas de conseils de perte de poids. Pour progresser, mange assez, surtout les jours durs : je peux t'expliquer les repères d'assiette."
const INFO_A05 = 'Les livres sont cités par leur titre seulement.'
const INFO_A06 = "Une source citée par l'assistant n'est pas reconnue : elle a été retirée."

// Garde-fou : une réponse légitime tient largement sous cette taille.
const TAILLE_MAX = 200_000

const QUALITES = [
  'doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance',
  'technique', 'mental', 'antagonistes', 'mobilite', 'echauffement',
]
const ACCENTS = ['doigts', 'traction_gainage', 'puissance', 'resistance', 'endurance', 'technique']
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const TYPES_REPONSE = ['cycle', 'bloc', 'semaine', 'ajustement', 'explication', 'refus', 'question']
const TYPES_AVEC_BROUILLON = ['cycle', 'bloc', 'semaine', 'ajustement']

// Bornes que la spec ne chiffre pas (choix prudents, signalés dans le compte rendu de la tâche E-11).
const MAX_ETAPES = 30
const MAX_TEXTE_COURT = 200 // nom, titre, libelle, sujet
const MAX_QUESTION = 300

// ——— Rapport d'erreurs ———

interface Rapport {
  forme: string[] // A-01
  dates: string[] // A-04
  ids: string[] // A-02
  informations: string[]
}

type Objet = Record<string, unknown>

function estObjet(v: unknown): v is Objet {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// ——— Dates ———

function dateValide(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [a, m, j] = s.split('-').map(Number)
  const d = new Date(Date.UTC(a, m - 1, j))
  return d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === j
}

function jourDeSemaine(s: string): number {
  return new Date(`${s}T00:00:00Z`).getUTCDay() // 0 = dimanche, 1 = lundi
}

function ajouterJours(s: string, n: number): string {
  const d = new Date(`${s}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function lundiDeLaSemaine(s: string): string {
  return ajouterJours(s, -((jourDeSemaine(s) + 6) % 7))
}

/** Date au bon format, réelle (pas de 31 février), et qui tombe un lundi. Erreurs de date = A-04. */
function verifLundi(v: unknown, chemin: string, ids: IdsAutorises, r: Rapport): void {
  if (!dateValide(v)) {
    r.dates.push(`${chemin} : date « ${String(v)} » invalide (format AAAA-MM-JJ attendu).`)
    return
  }
  if (jourDeSemaine(v) !== 1) {
    r.dates.push(`${chemin} : le ${v} n'est pas un lundi.`)
    return
  }
  // Un plan proposé ne commence pas avant la semaine en cours.
  if (v < lundiDeLaSemaine(ids.aujourdhui)) {
    r.dates.push(`${chemin} : le ${v} est avant la semaine en cours.`)
  }
}

// ——— Briques de validation ———

function verifCles(o: Objet, obligatoires: string[], facultatives: string[], chemin: string, r: Rapport): void {
  for (const k of obligatoires) {
    if (!(k in o)) r.forme.push(`${chemin} : champ « ${k} » manquant.`)
  }
  for (const k of Object.keys(o)) {
    if (obligatoires.includes(k) || facultatives.includes(k)) continue
    if (k === 'niveauDetail') {
      r.forme.push(`${chemin} : l'assistant ne choisit pas le niveau de détail (champ « niveauDetail » refusé).`)
    } else {
      r.forme.push(`${chemin} : champ inconnu « ${k} ».`)
    }
  }
}

function verifTexte(v: unknown, chemin: string, max: number, r: Rapport): v is string {
  if (typeof v !== 'string') {
    r.forme.push(`${chemin} : un texte est attendu.`)
    return false
  }
  if (v.trim() === '') {
    r.forme.push(`${chemin} : texte vide.`)
    return false
  }
  if (v.length > max) {
    r.forme.push(`${chemin} : ${v.length} caractères, ${max} au plus.`)
    return false
  }
  return true
}

function verifEntier(v: unknown, chemin: string, min: number, max: number, r: Rapport): v is number {
  if (typeof v !== 'number' || !Number.isInteger(v)) {
    r.forme.push(`${chemin} : un nombre entier est attendu.`)
    return false
  }
  if (v < min || v > max) {
    r.forme.push(`${chemin} : ${v} hors bornes (de ${min} à ${max}).`)
    return false
  }
  return true
}

function verifChoix(v: unknown, permis: readonly string[], chemin: string, r: Rapport): v is string {
  if (typeof v !== 'string' || !permis.includes(v)) {
    r.forme.push(`${chemin} : « ${String(v)} » n'est pas une valeur permise (${permis.join(', ')}).`)
    return false
  }
  return true
}

function verifTableau(v: unknown, chemin: string, min: number, max: number, r: Rapport): unknown[] | null {
  if (!Array.isArray(v)) {
    r.forme.push(`${chemin} : une liste est attendue.`)
    return null
  }
  if (v.length < min || v.length > max) {
    const attendu = min === max ? `${min}` : `de ${min} à ${max}`
    r.forme.push(`${chemin} : ${attendu} éléments attendus, ${v.length} reçus.`)
    return null
  }
  return v
}

/** Un objet attendu ; sinon erreur et null. */
function verifObjet(v: unknown, chemin: string, r: Rapport): Objet | null {
  if (!estObjet(v)) {
    r.forme.push(`${chemin} : un objet est attendu.`)
    return null
  }
  return v
}

// F-6 : identifiants. Un identifiant hors de la banque envoyée est une erreur A-02.
function verifFiche(v: unknown, chemin: string, ids: IdsAutorises, r: Rapport): void {
  if (typeof v !== 'string' || v === '') {
    r.forme.push(`${chemin} : un identifiant de fiche est attendu.`)
  } else if (!ids.fiches.has(v)) {
    r.ids.push(`${chemin} : fiche « ${v} » inconnue (absente de la banque envoyée).`)
  }
}

function verifPresenceDans(
  v: unknown, ensemble: Set<string>, nom: string, chemin: string, r: Rapport,
): void {
  if (typeof v !== 'string' || v === '') {
    r.forme.push(`${chemin} : un identifiant de ${nom} est attendu.`)
  } else if (!ensemble.has(v)) {
    r.ids.push(`${chemin} : ${nom} « ${v} » inconnu(e) (absent(e) des données envoyées).`)
  }
}

// ——— Séances ———

function verifEtape(v: unknown, chemin: string, ids: IdsAutorises, r: Rapport): void {
  const o = verifObjet(v, chemin, r)
  if (!o) return
  verifCles(o, ['ficheId'], ['reglages', 'note', 'moduleObjectifId'], chemin, r)
  if ('ficheId' in o) verifFiche(o.ficheId, `${chemin}.ficheId`, ids, r)
  if ('note' in o) verifTexte(o.note, `${chemin}.note`, 120, r)
  if ('moduleObjectifId' in o) {
    verifPresenceDans(o.moduleObjectifId, ids.objectifsPerso, 'objectif spécifique', `${chemin}.moduleObjectifId`, r)
  }
  if ('reglages' in o) {
    const g = verifObjet(o.reglages, `${chemin}.reglages`, r)
    if (!g) return
    verifCles(g, [], ['series', 'reposS', 'dureeMin'], `${chemin}.reglages`, r)
    if ('series' in g) verifEntier(g.series, `${chemin}.reglages.series`, 1, 20, r)
    if ('reposS' in g) verifEntier(g.reposS, `${chemin}.reglages.reposS`, 0, 1200, r)
    if ('dureeMin' in g) verifEntier(g.dureeMin, `${chemin}.reglages.dureeMin`, 1, 180, r)
  }
}

function verifEtapes(v: unknown, chemin: string, min: number, ids: IdsAutorises, r: Rapport): void {
  const liste = verifTableau(v, chemin, min, MAX_ETAPES, r)
  liste?.forEach((e, i) => verifEtape(e, `${chemin}[${i + 1}]`, ids, r))
}

function verifObjectifGroupe(v: unknown, chemin: string, ids: IdsAutorises, r: Rapport): void {
  const o = verifObjet(v, chemin, r)
  if (!o) return
  if ('objectifId' in o) {
    verifCles(o, ['objectifId'], [], chemin, r)
    verifPresenceDans(o.objectifId, ids.objectifsGroupe, 'objectif de groupe', `${chemin}.objectifId`, r)
    return
  }
  verifCles(o, ['libelle', 'cible', 'compte', 'ficheReference'], ['blocs', 'essaisMaxParBloc', 'reposConseilleS'], chemin, r)
  if ('libelle' in o) verifTexte(o.libelle, `${chemin}.libelle`, MAX_TEXTE_COURT, r)
  if ('cible' in o) verifEntier(o.cible, `${chemin}.cible`, 1, 50, r)
  if ('compte' in o) verifChoix(o.compte, ['blocs_notes', 'flashs'], `${chemin}.compte`, r)
  if ('ficheReference' in o) verifFiche(o.ficheReference, `${chemin}.ficheReference`, ids, r)
  if ('blocs' in o) verifEntier(o.blocs, `${chemin}.blocs`, 1, 20, r)
  if ('essaisMaxParBloc' in o) verifEntier(o.essaisMaxParBloc, `${chemin}.essaisMaxParBloc`, 1, 10, r)
  if ('reposConseilleS' in o) verifEntier(o.reposConseilleS, `${chemin}.reposConseilleS`, 0, 600, r)
}

function verifGroupe(v: unknown, chemin: string, ids: IdsAutorises, r: Rapport): void {
  if (v === null) return
  const o = verifObjet(v, chemin, r)
  if (!o) return
  verifCles(o, ['objectifs'], ['miniBloc'], chemin, r)
  // F-7 : 1 à 3 objectifs de groupe.
  const objectifs = verifTableau(o.objectifs, `${chemin}.objectifs`, 1, 3, r)
  objectifs?.forEach((x, i) => verifObjectifGroupe(x, `${chemin}.objectifs[${i + 1}]`, ids, r))
  if ('miniBloc' in o) {
    const m = verifObjet(o.miniBloc, `${chemin}.miniBloc`, r)
    if (!m) return
    verifCles(m, ['moment', 'etapes'], [], `${chemin}.miniBloc`, r)
    if ('moment' in m) verifChoix(m.moment, ['avant', 'apres'], `${chemin}.miniBloc.moment`, r)
    verifEtapes(m.etapes, `${chemin}.miniBloc.etapes`, 1, ids, r)
  }
}

// F-10 : l'assistant ne choisit jamais le niveau. `niveauAttendu` est celui du contexte, ou celui de la séance remplacée.
function verifSeance(v: unknown, chemin: string, ids: IdsAutorises, r: Rapport, niveauAttendu: NiveauDetail = ids.niveauDetail): void {
  const o = verifObjet(v, chemin, r)
  if (!o) return
  // Trois formes : séance type, séance composée (solo), séance résumée (parties).
  if ('seanceTypeId' in o) {
    verifCles(o, ['jour', 'seanceTypeId'], ['variante'], chemin, r)
    if ('jour' in o) verifChoix(o.jour, JOURS, `${chemin}.jour`, r)
    const id = o.seanceTypeId
    if (typeof id !== 'string' || id === '') {
      r.forme.push(`${chemin}.seanceTypeId : un identifiant de séance type est attendu.`)
      return
    }
    const variantes = ids.seancesTypes.get(id)
    if (!variantes) {
      r.ids.push(`${chemin}.seanceTypeId : séance type « ${id} » inconnue (absente des séances envoyées).`)
      return
    }
    if ('variante' in o && (typeof o.variante !== 'string' || !variantes.includes(o.variante))) {
      r.ids.push(`${chemin}.variante : variante « ${String(o.variante)} » inconnue pour la séance type « ${id} ».`)
    }
    return
  }

  const commun = ['jour', 'nom', 'qualite', 'durete', 'effortPrevu', 'groupe']
  const resumee = !('solo' in o) && ('parties' in o || 'niveau' in o || 'recommandation' in o)
  if (!('solo' in o) && !resumee) {
    r.forme.push(`${chemin} : forme de séance non reconnue (séance type, séance composée ou séance résumée attendue).`)
    return
  }
  if (resumee) verifCles(o, [...commun, 'niveau', 'recommandation', 'parties'], [], chemin, r)
  else verifCles(o, [...commun, 'solo'], [], chemin, r)

  if ('jour' in o) verifChoix(o.jour, JOURS, `${chemin}.jour`, r)
  if ('nom' in o) verifTexte(o.nom, `${chemin}.nom`, MAX_TEXTE_COURT, r)
  if ('qualite' in o) verifChoix(o.qualite, QUALITES, `${chemin}.qualite`, r)
  if ('durete' in o) verifChoix(o.durete, ['dure', 'legere'], `${chemin}.durete`, r)
  // F-7 : effort prévu entier de 1 à 10.
  if ('effortPrevu' in o) verifEntier(o.effortPrevu, `${chemin}.effortPrevu`, 1, 10, r)
  if ('groupe' in o) verifGroupe(o.groupe, `${chemin}.groupe`, ids, r)

  if (!resumee) {
    const solo = verifObjet(o.solo, `${chemin}.solo`, r)
    if (solo) {
      verifCles(solo, ['etapes'], [], `${chemin}.solo`, r)
      verifEtapes(solo.etapes, `${chemin}.solo.etapes`, 1, ids, r)
    }
    return
  }

  // F-9 : séance résumée.
  if ('recommandation' in o) verifTexte(o.recommandation, `${chemin}.recommandation`, LONGUEUR_MAX_RECOMMANDATION, r)
  let niveau: unknown
  if ('niveau' in o && verifChoix(o.niveau, ['simple', 'grandes_lignes'], `${chemin}.niveau`, r)) {
    niveau = o.niveau
    const nom = `séance du ${typeof o.jour === 'string' && JOURS.includes(o.jour) ? o.jour : chemin}`
    if (niveauAttendu === 'detaille') r.forme.push(`${nom} : séance résumée, detaille attendu.`)
    else if (o.niveau !== niveauAttendu) r.forme.push(`${nom} : niveau ${o.niveau} reçu, ${niveauAttendu} attendu.`)
  }
  const nbMin = niveau === 'simple' ? 1 : 2
  const nbMax = niveau === 'simple' ? 1 : NB_PARTIES_MAX
  const parties = niveau === undefined
    ? (Array.isArray(o.parties) ? o.parties : null)
    : verifTableau(o.parties, `${chemin}.parties`, nbMin, nbMax, r)
  if (niveau === undefined && !Array.isArray(o.parties) && 'parties' in o) {
    r.forme.push(`${chemin}.parties : une liste est attendue.`)
  }
  let uneFiche = false
  parties?.forEach((p, i) => {
    const c = `${chemin}.parties[${i + 1}]`
    const po = verifObjet(p, c, r)
    if (!po) return
    verifCles(po, ['titre', 'dureeMin'], ['ficheId', 'consigne'], c, r)
    if ('titre' in po) verifTexte(po.titre, `${c}.titre`, MAX_TEXTE_COURT, r)
    if ('dureeMin' in po) verifEntier(po.dureeMin, `${c}.dureeMin`, 5, 180, r)
    if ('consigne' in po) verifTexte(po.consigne, `${c}.consigne`, LONGUEUR_MAX_RECOMMANDATION, r)
    if ('ficheId' in po) {
      verifFiche(po.ficheId, `${c}.ficheId`, ids, r)
      uneFiche = true
    }
  })
  // Une séance dure garde au moins une fiche : sans elle, le moteur ne verrait ni ses efforts maximaux ni ses quotas.
  if (parties && o.durete === 'dure' && !uneFiche) {
    r.forme.push(`${chemin} : une séance dure doit avoir au moins une partie avec une fiche (ficheId).`)
  }
}

/** F-5 : pas deux séances le même jour ; au plus `max` séances. */
function verifSemaineDeSeances(v: unknown, chemin: string, max: number, ids: IdsAutorises, r: Rapport): void {
  const liste = verifTableau(v, chemin, 1, 7, r)
  if (!liste) return
  const vus = new Set<string>()
  liste.forEach((s, i) => {
    verifSeance(s, `${chemin}[${i + 1}]`, ids, r)
    const jour = estObjet(s) ? s.jour : undefined
    if (typeof jour === 'string' && JOURS.includes(jour)) {
      if (vus.has(jour)) r.forme.push(`${chemin} : deux séances le même jour (${jour}).`)
      vus.add(jour)
    }
  })
  if (liste.length > max) {
    r.forme.push(`${chemin} : ${liste.length} séances, ${max} au plus.`)
  }
}

// ——— Plans ———

/** reductionPct : 40 à 60 en décharge et en affûtage, absent sinon. */
function verifReduction(o: Objet, type: unknown, chemin: string, r: Rapport): void {
  if (!('reductionPct' in o)) return
  if (type === 'decharge' || type === 'affutage') verifEntier(o.reductionPct, `${chemin}.reductionPct`, 40, 60, r)
  else r.forme.push(`${chemin}.reductionPct : réservé aux semaines decharge et affutage.`)
}

function verifBloc(v: unknown, chemin: string, ids: IdsAutorises, r: Rapport, seancesParSemaine: number): void {
  const o = verifObjet(v, chemin, r)
  if (!o) return
  verifCles(o, ['ordre', 'accent', 'objectifsPersoIds', 'semaines', 'semaineType'], [], chemin, r)
  if ('ordre' in o) verifEntier(o.ordre, `${chemin}.ordre`, 1, 3, r)
  if ('accent' in o) verifChoix(o.accent, ACCENTS, `${chemin}.accent`, r)
  const perso = verifTableau(o.objectifsPersoIds, `${chemin}.objectifsPersoIds`, 0, 2, r)
  perso?.forEach((x, i) => verifPresenceDans(x, ids.objectifsPerso, 'objectif spécifique', `${chemin}.objectifsPersoIds[${i + 1}]`, r))
  const semaines = verifTableau(o.semaines, `${chemin}.semaines`, 4, 4, r)
  semaines?.forEach((s, i) => {
    const c = `${chemin}.semaines[${i + 1}]`
    const so = verifObjet(s, c, r)
    if (!so) return
    verifCles(so, ['type'], ['reductionPct'], c, r)
    if ('type' in so) verifChoix(so.type, ['charge', 'decharge', 'affutage'], `${c}.type`, r)
    verifReduction(so, so.type, c, r)
  })
  verifSemaineDeSeances(o.semaineType, `${chemin}.semaineType`, seancesParSemaine, ids, r)
}

function verifCycle(o: Objet, ids: IdsAutorises, r: Rapport): void {
  const chemin = 'brouillon'
  verifCles(o, ['debut', 'seancesParSemaine', 'mode', 'blocs'], ['objectif'], chemin, r)
  if ('debut' in o) verifLundi(o.debut, `${chemin}.debut`, ids, r)
  const n = 'seancesParSemaine' in o && verifEntier(o.seancesParSemaine, `${chemin}.seancesParSemaine`, 1, 7, r)
    ? o.seancesParSemaine as number
    : 7
  const mode = 'mode' in o && verifChoix(o.mode, ['accent_tournant', 'objectif_date'], `${chemin}.mode`, r) ? o.mode : null

  if (mode === 'objectif_date' && !('objectif' in o)) r.forme.push(`${chemin}.objectif : obligatoire en mode objectif_date.`)
  if (mode === 'accent_tournant' && 'objectif' in o) r.forme.push(`${chemin}.objectif : réservé au mode objectif_date.`)
  if ('objectif' in o) {
    const c = `${chemin}.objectif`
    const ob = verifObjet(o.objectif, c, r)
    if (ob) {
      verifCles(ob, ['libelle', 'date', 'semainesAffutage', 'reductionVolumePct'], [], c, r)
      if ('libelle' in ob) verifTexte(ob.libelle, `${c}.libelle`, MAX_TEXTE_COURT, r)
      if ('date' in ob) {
        if (!dateValide(ob.date)) r.dates.push(`${c}.date : date « ${String(ob.date)} » invalide (format AAAA-MM-JJ attendu).`)
        else if (dateValide(o.debut) && ob.date <= o.debut) r.dates.push(`${c}.date : l'objectif (${ob.date}) doit être après le début du cycle (${o.debut}).`)
      }
      if ('semainesAffutage' in ob) verifEntier(ob.semainesAffutage, `${c}.semainesAffutage`, 1, 4, r)
      if ('reductionVolumePct' in ob) verifEntier(ob.reductionVolumePct, `${c}.reductionVolumePct`, 40, 60, r)
    }
  }

  // F-4 : 3 phases en accent tournant (1 à 3 en mode objectif daté), numérotées 1, 2, 3 dans l'ordre.
  const blocs = mode === 'accent_tournant'
    ? verifTableau(o.blocs, `${chemin}.blocs`, 3, 3, r)
    : verifTableau(o.blocs, `${chemin}.blocs`, 1, 3, r)
  blocs?.forEach((b, i) => {
    const c = `${chemin}.blocs[${i + 1}]`
    verifBloc(b, c, ids, r, n)
    if (estObjet(b) && typeof b.ordre === 'number' && b.ordre !== i + 1) {
      r.forme.push(`${c}.ordre : ${b.ordre} reçu, ${i + 1} attendu (numérotation 1, 2, 3 dans l'ordre).`)
    }
  })
}

function verifBrouillonSemaine(o: Objet, ids: IdsAutorises, r: Rapport): void {
  const chemin = 'brouillon'
  verifCles(o, ['lundi', 'type', 'seances'], ['reductionPct'], chemin, r)
  if ('lundi' in o) verifLundi(o.lundi, `${chemin}.lundi`, ids, r)
  if ('type' in o) verifChoix(o.type, ['charge', 'decharge', 'affutage', 'transition'], `${chemin}.type`, r)
  verifReduction(o, o.type, chemin, r)
  verifSemaineDeSeances(o.seances, `${chemin}.seances`, 7, ids, r)
}

function verifOperation(v: unknown, chemin: string, ids: IdsAutorises, r: Rapport): void {
  const o = verifObjet(v, chemin, r)
  if (!o) return
  const op = o.op
  const base = ['op', 'raison']
  if ('raison' in o) verifTexte(o.raison, `${chemin}.raison`, 120, r)
  const version = (): void => {
    if ('version' in o) verifChoix(o.version, ['solo', 'groupe'], `${chemin}.version`, r)
  }
  const seance = (): void => {
    if ('seanceId' in o) verifPresenceDans(o.seanceId, ids.seancesAVenir, 'séance', `${chemin}.seanceId`, r)
  }
  const index = (): void => {
    if ('index' in o) verifEntier(o.index, `${chemin}.index`, 0, MAX_ETAPES, r)
  }
  switch (op) {
    case 'remplacer_seance':
      verifCles(o, [...base, 'seanceId', 'par'], [], chemin, r)
      seance()
      // Son jour est ignoré, mais doit rester valide. Niveau attendu : celui de la séance visée.
      if ('par' in o) {
        const visee = typeof o.seanceId === 'string' ? ids.niveauxSeancesAVenir.get(o.seanceId) : undefined
        verifSeance(o.par, `${chemin}.par`, ids, r, visee ?? ids.niveauDetail)
      }
      break
    case 'remplacer_etape':
      verifCles(o, [...base, 'seanceId', 'version', 'index', 'par'], [], chemin, r)
      seance(); version(); index()
      if ('par' in o) verifEtape(o.par, `${chemin}.par`, ids, r)
      break
    case 'retirer_etape':
      verifCles(o, [...base, 'seanceId', 'version', 'index'], [], chemin, r)
      seance(); version(); index()
      break
    case 'ajouter_etape':
      verifCles(o, [...base, 'seanceId', 'version', 'index', 'etape'], [], chemin, r)
      seance(); version(); index()
      if ('etape' in o) verifEtape(o.etape, `${chemin}.etape`, ids, r)
      break
    case 'deplacer_seance':
      verifCles(o, [...base, 'seanceId', 'nouvelleDate'], [], chemin, r)
      seance()
      if ('nouvelleDate' in o) {
        if (!dateValide(o.nouvelleDate)) r.dates.push(`${chemin}.nouvelleDate : date « ${String(o.nouvelleDate)} » invalide (format AAAA-MM-JJ attendu).`)
        else if (o.nouvelleDate < ids.aujourdhui) r.dates.push(`${chemin}.nouvelleDate : le ${o.nouvelleDate} est dans le passé.`)
      }
      break
    case 'alleger_seance':
      verifCles(o, [...base, 'seanceId', 'reductionPct'], [], chemin, r)
      seance()
      if ('reductionPct' in o) verifEntier(o.reductionPct, `${chemin}.reductionPct`, 10, 60, r)
      break
    case 'changer_semaine':
      verifCles(o, [...base, 'lundi', 'type'], ['reductionPct'], chemin, r)
      if ('lundi' in o) verifLundi(o.lundi, `${chemin}.lundi`, ids, r)
      if ('type' in o) verifChoix(o.type, ['charge', 'decharge', 'affutage', 'transition'], `${chemin}.type`, r)
      verifReduction(o, o.type, chemin, r)
      break
    default:
      r.forme.push(`${chemin}.op : opération « ${String(op)} » inconnue.`)
  }
}

function verifAjustement(o: Objet, ids: IdsAutorises, r: Rapport): void {
  verifCles(o, ['operations'], [], 'brouillon', r)
  const ops = verifTableau(o.operations, 'brouillon.operations', 1, 10, r)
  ops?.forEach((x, i) => verifOperation(x, `brouillon.operations[${i + 1}]`, ids, r))
}

// ——— Sources (A-05, A-06) ———

function normaliserTitre(t: string): string {
  return t.replace(/[\u2018\u2019\u02bc]/g, "'").replace(/\s+/g, ' ').trim()
}

/** Contrôle la forme des sources, puis retire ce qui n'est pas reconnu (avec une information). */
function nettoyerSources(v: unknown, ids: IdsAutorises, r: Rapport): SourceCitee[] {
  const liste = verifTableau(v, 'sources', 0, 6, r)
  if (!liste) return []
  const gardees: SourceCitee[] = []
  liste.forEach((s, i) => {
    const c = `sources[${i + 1}]`
    const o = verifObjet(s, c, r)
    if (!o) return
    switch (o.type) {
      case 'synthese':
        verifCles(o, ['type', 'sujet'], [], c, r)
        if (verifTexte(o.sujet, `${c}.sujet`, MAX_TEXTE_COURT, r)) gardees.push({ type: 'synthese', sujet: o.sujet })
        break
      case 'fiche':
        verifCles(o, ['type', 'ficheId'], [], c, r)
        if (typeof o.ficheId !== 'string' || o.ficheId === '') {
          r.forme.push(`${c}.ficheId : un identifiant de fiche est attendu.`)
        } else if (ids.fiches.has(o.ficheId)) {
          gardees.push({ type: 'fiche', ficheId: o.ficheId })
        } else {
          // Une fiche que l'assistant n'a pas reçue ne peut pas être ouverte : source retirée, pas d'erreur bloquante.
          r.informations.push(INFO_A06)
        }
        break
      case 'methode':
        verifCles(o, ['type', 'auteur', 'idee'], [], c, r)
        if (!verifTexte(o.idee, `${c}.idee`, 120, r)) break
        if (typeof o.auteur !== 'string') {
          r.forme.push(`${c}.auteur : un texte est attendu.`)
        } else if ((AUTEURS_CONNUS as readonly string[]).includes(o.auteur)) {
          gardees.push({ type: 'methode', auteur: o.auteur as typeof AUTEURS_CONNUS[number], idee: o.idee })
        } else {
          r.informations.push(INFO_A06)
        }
        break
      case 'livre': {
        if (typeof o.titre !== 'string') {
          r.forme.push(`${c}.titre : un texte est attendu.`)
          break
        }
        // A-06 : le titre doit être l'un des trois. Apostrophe typographique et espaces multiples tolérés ;
        // la réponse validée garde le titre canonique.
        const titre = TITRES_LIVRES.find((t) => normaliserTitre(t) === normaliserTitre(o.titre as string))
        if (titre === undefined) {
          r.informations.push(INFO_A06)
          break
        }
        // A-05 : tout champ autre que type et titre est retiré.
        if (Object.keys(o).some((k) => k !== 'type' && k !== 'titre')) r.informations.push(INFO_A05)
        gardees.push({ type: 'livre', titre })
        break
      }
      default:
        r.forme.push(`${c}.type : « ${String(o.type)} » n'est pas un type de source permis (synthese, fiche, methode, livre).`)
    }
  })
  return gardees
}

// ——— Contenu interdit (A-07) ———

function normaliser(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const MOTIFS_INTERDITS: RegExp[] = [
  /perte de poids/,
  /perdre du poids/,
  /perdre \d+ ?(kg|kilos?)/,
  /poids (cible|ideal|de forme)/,
  /maigrir/,
  /mincir/,
  /regime (amaigrissant|hypocalorique|restrictif)/,
  /deficit calorique/,
  /(reduire|couper|limiter) (les|tes) calories/,
  /\bseche\b/, // mot entier : « sécher » ne doit pas déclencher
]

// Le refus standard du prompt contient « perte de poids » : cette seule phrase est permise
// (sinon le refus attendu, exemple 3 de D.9, serait lui-même interdit).
const PHRASE_REFUS_STANDARD = normaliser('Je ne donne pas de conseils de perte de poids')

function textesLibres(v: unknown, sortie: string[]): void {
  if (typeof v === 'string') sortie.push(v)
  else if (Array.isArray(v)) v.forEach((x) => textesLibres(x, sortie))
  else if (estObjet(v)) Object.values(v).forEach((x) => textesLibres(x, sortie))
}

/** Cherche un motif interdit dans tous les textes de la réponse (résumé, justification, notes, noms, consignes…). */
function contientInterdit(reponse: unknown): boolean {
  const textes: string[] = []
  textesLibres(reponse, textes)
  return textes.some((t) => {
    const n = normaliser(t).split(PHRASE_REFUS_STANDARD).join(' ')
    return MOTIFS_INTERDITS.some((m) => m.test(n))
  })
}

// ——— Lecture et point d'entrée ———

/** Retire un bloc de code Markdown qui entoure toute la réponse ; ne tolère rien d'autre autour. */
function retirerBlocDeCode(texte: string): string {
  const t = texte.trim()
  const m = /^```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n?```$/.exec(t)
  return m ? m[1] : t
}

function invalide(code: 'A-01' | 'A-02' | 'A-04', erreurs: string[]): ResultatValidation {
  return { etat: 'invalide', code, erreurs }
}

function validerSansProtection(texte: string, ids: IdsAutorises): ResultatValidation {
  if (typeof texte !== 'string' || texte.trim() === '') return invalide('A-01', ['réponse : texte vide.'])
  if (texte.length > TAILLE_MAX) return invalide('A-01', [`réponse : ${texte.length} caractères, ${TAILLE_MAX} au plus.`])
  if (!dateValide(ids.aujourdhui)) return invalide('A-01', [`date du jour « ${String(ids.aujourdhui)} » invalide : validation impossible.`])

  // 1. Lecture
  let brut: unknown
  try {
    brut = JSON.parse(retirerBlocDeCode(texte))
  } catch {
    return invalide('A-01', ["réponse : ce n'est pas un objet JSON lisible (un seul objet JSON, sans texte autour)."])
  }
  if (!estObjet(brut)) return invalide('A-01', ["réponse : un objet JSON est attendu."])

  // 2. Forme (F-1 à F-9)
  const r: Rapport = { forme: [], dates: [], ids: [], informations: [] }
  const racine = 'réponse'
  verifCles(brut, ['version', 'type', 'resume', 'justification', 'sources'], ['brouillon', 'miseEnGarde', 'questions', 'texte'], racine, r)
  if (brut.version !== 1) r.forme.push(`${racine}.version : 1 attendu, « ${String(brut.version)} » reçu.`)
  const type = 'type' in brut && verifChoix(brut.type, TYPES_REPONSE, `${racine}.type`, r) ? brut.type : null
  if ('resume' in brut) verifTexte(brut.resume, `${racine}.resume`, 300, r)
  const justif = verifTableau(brut.justification, `${racine}.justification`, 0, 5, r)
  justif?.forEach((j, i) => verifTexte(j, `${racine}.justification[${i + 1}]`, 200, r))
  if ('miseEnGarde' in brut) verifTexte(brut.miseEnGarde, `${racine}.miseEnGarde`, 400, r)

  // F-2
  if (type === 'question') {
    if (!('questions' in brut)) r.forme.push(`${racine}.questions : obligatoire pour une réponse de type question.`)
  } else if ('questions' in brut) {
    r.forme.push(`${racine}.questions : réservé au type question.`)
  }
  if ('questions' in brut) {
    const qs = verifTableau(brut.questions, `${racine}.questions`, 1, 3, r)
    qs?.forEach((q, i) => verifTexte(q, `${racine}.questions[${i + 1}]`, MAX_QUESTION, r))
  }
  const avecTexte = type === 'explication' || type === 'refus'
  if (avecTexte && !('texte' in brut)) r.forme.push(`${racine}.texte : obligatoire pour une réponse de type ${String(type)}.`)
  if (!avecTexte && type !== null && 'texte' in brut) r.forme.push(`${racine}.texte : réservé aux types explication et refus.`)
  if ('texte' in brut) verifTexte(brut.texte, `${racine}.texte`, 1500, r)

  // F-1 : brouillon si et seulement si cycle, bloc, semaine ou ajustement, et de la forme du type.
  const attendBrouillon = type !== null && TYPES_AVEC_BROUILLON.includes(type)
  if (attendBrouillon && !('brouillon' in brut)) {
    r.forme.push(`${racine}.brouillon : obligatoire pour une réponse de type ${type}.`)
  } else if (type !== null && !attendBrouillon && 'brouillon' in brut) {
    r.forme.push(`${racine}.brouillon : interdit pour une réponse de type ${type}.`)
  } else if (attendBrouillon && 'brouillon' in brut) {
    const b = verifObjet(brut.brouillon, 'brouillon', r)
    if (b) {
      if (type === 'cycle') verifCycle(b, ids, r)
      else if (type === 'bloc') {
        verifBloc(b, 'brouillon', ids, r, 7)
      } else if (type === 'semaine') verifBrouillonSemaine(b, ids, r)
      else verifAjustement(b, ids, r)
    }
  }

  const sources = nettoyerSources(brut.sources, ids, r)

  // A-01 d'abord, puis A-04 (dates), puis A-02 (identifiants) : on liste toutes les erreurs.
  const toutes = [...r.forme, ...r.dates, ...r.ids]
  if (toutes.length > 0) {
    const code = r.forme.length > 0 ? 'A-01' : r.dates.length > 0 ? 'A-04' : 'A-02'
    return invalide(code, toutes)
  }

  const reponse = { ...brut, sources } as unknown as ReponseAssistant

  // 4. Contenu interdit (A-07)
  if (contientInterdit(reponse)) {
    return {
      etat: 'interdit',
      reponse: { version: 1, type: 'refus', resume: MESSAGE_A07, texte: MESSAGE_A07, justification: [], sources: [] },
    }
  }
  return { etat: 'ok', reponse, informations: r.informations }
}

/**
 * Valide le texte renvoyé par l'assistant. Ne lève jamais d'exception.
 * Ordre : lecture (A-01), forme et dates (A-01, A-04), identifiants (A-02), sources (A-05, A-06), contenu interdit (A-07).
 * L'expansion en plan et le moteur de vérification se font après, ailleurs (E-12, E-15).
 */
export function validerReponse(texte: string, ids: IdsAutorises): ResultatValidation {
  try {
    return validerSansProtection(texte, ids)
  } catch {
    return invalide('A-01', ['réponse : erreur inattendue pendant la vérification ; la réponse est refusée par prudence.'])
  }
}
