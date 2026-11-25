// Logique pure de D-18 : les avertissements du moteur, rangés pour les trois vues du plan.
// Rien ici n'écrit ni ne bloque : on avertit, on ne bloque jamais (CLAUDE.md).
// Le moteur (`verifierPlan`) calcule ; ce fichier regroupe par portée et par cible, compte, et applique « Je garde ce choix ».
import type { Cycle, DateISO, DouleurDeclaree, ExercicePerso, FormeDuJour, ObjectifSpecifique, PhaseCycle, Profil, Reglages, SeancePlanifiee, SeanceRealisee } from '../../donnees/modele.ts'
import { ajouterJours, debutSemaine } from '../../donnees/plan.ts'
import {
  cleAvertissement, contexteVerif, formeAffichage, planVersVerif, toutesLesFiches, verifierPlan,
  type Avertissement,
} from '../../regles/index.ts'

export type FormeAvertissement = 'information' | 'avertissement' | 'arret'

/** Un avertissement du moteur, avec ce dont les écrans ont besoin pour le placer et le replier. */
export interface EntreeAvertissement {
  avertissement: Avertissement
  cle: string
  forme: FormeAvertissement
  /** Replié par « Je garde ce choix » : une ligne, mais toujours compté. Un signal d'arrêt n'est jamais replié. */
  garde: boolean
  /** Séance qui porte l'avertissement (celle que le moteur vise). */
  seanceId?: string
  /** Pour W-01 : l'autre séance de la paire, celle d'avant. */
  seanceLieeId?: string
  /** Numéro de semaine du cycle (1 à 12), quand l'avertissement se rattache à une semaine. */
  semaine: number | null
  /** Ordre de la phase (1 à 3), quand il se rattache à une phase. */
  phaseOrdre: number | null
}

export interface AvertissementsDuPlan {
  entrees: EntreeAvertissement[]
  /** Séance visée (portée séance ou étape). */
  parSeance: Map<string, EntreeAvertissement[]>
  /** Séance « liée » (W-01 : la séance d'avant). Sert au repère, jamais au texte détaillé. */
  lieesParSeance: Map<string, EntreeAvertissement[]>
  /** Tout ce qui touche une semaine : portée semaine, séances de la semaine. */
  parSemaine: Map<number, EntreeAvertissement[]>
  /** Tout ce qui touche une phase (portée plan avec `mesocycleOrdre`, et ce qui tombe dans ses semaines). */
  parPhase: Map<number, EntreeAvertissement[]>
  /** Portée plan, sans phase ni semaine. */
  duPlan: EntreeAvertissement[]
}

export const AUCUN_AVERTISSEMENT: AvertissementsDuPlan = {
  entrees: [], parSeance: new Map(), lieesParSeance: new Map(), parSemaine: new Map(), parPhase: new Map(), duPlan: [],
}

// ——— Calcul ———

export interface DonneesDeVerification {
  cycle: Cycle
  phases: PhaseCycle[]
  seances: SeancePlanifiee[]
  objectifs: ObjectifSpecifique[]
  profil: Profil
  reglages?: Pick<Reglages, 'reglesSecurite'>
  exercicesPerso: ExercicePerso[]
  douleurs: DouleurDeclaree[]
  formes: FormeDuJour[]
  realisees: SeanceRealisee[]
  aujourdhui: DateISO
  maintenant: string
}

/** Le plan passe par les règles du moteur, avec l'origine « utilisateur » : c'est lui qui l'a composé à la main. */
export function calculerAvertissements(d: DonneesDeVerification): Avertissement[] {
  const ctx = contexteVerif({
    profil: d.profil, ...(d.reglages ? { reglages: d.reglages } : {}), exercicesPerso: d.exercicesPerso,
    douleurs: d.douleurs, formes: d.formes, objectifs: d.objectifs, aujourdhui: d.aujourdhui, maintenant: d.maintenant,
  })
  const plan = planVersVerif({
    cycle: d.cycle, phases: d.phases, seances: d.seances, realisees: d.realisees, objectifs: d.objectifs,
    origine: 'utilisateur', fiches: toutesLesFiches(d.exercicesPerso),
  })
  return verifierPlan(plan, ctx)
}

// ——— Rangement ———

/** Numéro de semaine (1 à 12) du lundi donné, `null` s'il n'est pas dans le cycle. */
function semaineDuLundi(cycle: Cycle, phases: PhaseCycle[], lundi: DateISO): number | null {
  for (const p of phases) {
    for (const w of p.semaines) if (debutSemaine(cycle, p, w.numero) === lundi) return (p.ordre - 1) * 4 + w.numero
  }
  return null
}

/**
 * W-01 vise la séance qui arrive trop tôt ; le message nomme celle d'avant (« après « X » (jour) »).
 * Le moteur ne donne pas son identifiant : on prend la dernière séance de ce nom avant la séance visée.
 */
export function seanceDAvantPourW01(a: Avertissement, seances: SeancePlanifiee[]): string | undefined {
  if (a.code !== 'W-01' || a.seanceId === undefined) return undefined
  const visee = seances.find((s) => s.id === a.seanceId)
  const nom = /après « (.+?) » \(/.exec(a.message)?.[1]
  if (!visee || nom === undefined) return undefined
  const avant = seances
    .filter((s) => !s.supprimeLe && s.id !== visee.id && s.solo.nom === nom && s.date <= visee.date)
    .sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0))
  return avant[0]?.id
}

function ajouterA<K>(table: Map<K, EntreeAvertissement[]>, cle: K, e: EntreeAvertissement) {
  const liste = table.get(cle)
  if (liste) liste.push(e)
  else table.set(cle, [e])
}

/** Un signal d'arrêt reste toujours visible : « Je garde ce choix » ne le replie pas. Une simple information n'a pas ce bouton. */
const peutEtreGarde = (forme: FormeAvertissement) => forme === 'avertissement'

export function ranger(
  avertissements: Avertissement[],
  gardes: readonly string[],
  contexte: { cycle: Cycle; phases: PhaseCycle[]; seances: SeancePlanifiee[] },
): AvertissementsDuPlan {
  const { cycle, phases, seances } = contexte
  const resultat: AvertissementsDuPlan = {
    entrees: [], parSeance: new Map(), lieesParSeance: new Map(), parSemaine: new Map(), parPhase: new Map(), duPlan: [],
  }
  const gardesSet = new Set(gardes)
  for (const a of avertissements) {
    const cle = cleAvertissement(a)
    const forme = formeAffichage(a)
    const seance = a.seanceId !== undefined ? seances.find((s) => s.id === a.seanceId) : undefined
    const phaseDeLaSeance = seance ? phases.find((p) => p.id === seance.phaseId) : undefined
    const semaine =
      a.lundi !== undefined ? semaineDuLundi(cycle, phases, a.lundi)
        : phaseDeLaSeance && seance ? (phaseDeLaSeance.ordre - 1) * 4 + seance.semaine
          : null
    const phaseOrdre = a.mesocycleOrdre ?? (semaine !== null ? Math.floor((semaine - 1) / 4) + 1 : null)
    const liee = seanceDAvantPourW01(a, seances)
    const e: EntreeAvertissement = {
      avertissement: a, cle, forme, garde: peutEtreGarde(forme) && gardesSet.has(cle), semaine, phaseOrdre,
      ...(seance ? { seanceId: seance.id } : {}),
      ...(liee ? { seanceLieeId: liee } : {}),
    }
    resultat.entrees.push(e)
    if (seance) ajouterA(resultat.parSeance, seance.id, e)
    if (liee) ajouterA(resultat.lieesParSeance, liee, e)
    if (semaine !== null) ajouterA(resultat.parSemaine, semaine, e)
    if (phaseOrdre !== null) ajouterA(resultat.parPhase, phaseOrdre, e)
    if (semaine === null && phaseOrdre === null) resultat.duPlan.push(e)
  }
  return resultat
}

// ——— Comptes ———

export interface ComptesAvertissements {
  total: number
  arrets: number
  avertissements: number
  informations: number
  /** Parmi le total : ceux que « Je garde ce choix » a repliés. Ils restent comptés. */
  gardes: number
}

export function compter(entrees: readonly EntreeAvertissement[]): ComptesAvertissements {
  return {
    total: entrees.length,
    arrets: entrees.filter((e) => e.forme === 'arret').length,
    avertissements: entrees.filter((e) => e.forme === 'avertissement').length,
    informations: entrees.filter((e) => e.forme === 'information').length,
    gardes: entrees.filter((e) => e.garde).length,
  }
}

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`

/** « 2 avertissements dont 1 gardé », « 1 signal d’arrêt », « Aucun avertissement ». */
export function phraseCompte(c: ComptesAvertissements): string {
  if (c.total === 0) return 'Aucun avertissement'
  const morceaux: string[] = []
  if (c.arrets > 0) morceaux.push(pluriel(c.arrets, 'signal d’arrêt', 'signaux d’arrêt'))
  if (c.avertissements > 0) morceaux.push(pluriel(c.avertissements, 'avertissement', 'avertissements'))
  if (c.informations > 0) morceaux.push(pluriel(c.informations, 'information', 'informations'))
  const base = morceaux.join(', ')
  return c.gardes > 0 ? `${base} dont ${pluriel(c.gardes, 'gardé', 'gardés')}` : base
}

/** Le nombre du repère « triangle + nombre » : informations exclues (elles n'alertent pas), gardés inclus. */
export function nombreDuRepere(entrees: readonly EntreeAvertissement[]): number {
  return entrees.filter((e) => e.forme !== 'information').length
}

/** Les entrées d'une liste de séances, sans doublon (une même entrée peut viser une séance et en lier une autre). */
export function entreesDesSeances(plan: AvertissementsDuPlan, ids: readonly string[]): EntreeAvertissement[] {
  const vues = new Set<EntreeAvertissement>()
  for (const id of ids) {
    for (const e of plan.parSeance.get(id) ?? []) vues.add(e)
    for (const e of plan.lieesParSeance.get(id) ?? []) vues.add(e)
  }
  return [...vues]
}

// ——— « Je garde ce choix » ———

/** Ajoute (ou retire) la clé d'un avertissement dans la liste du cycle. Ne change rien si l'état est déjà celui demandé. */
export function avecGarde(gardes: readonly string[], cle: string, garder: boolean): string[] {
  const sans = gardes.filter((c) => c !== cle)
  return garder ? [...sans, cle] : sans
}

// ——— Texte ———

/** Le moteur donne un message entier ; l'écran en montre la première phrase en gras, la suite en texte courant. */
export function scinderMessage(message: string): { titre: string; suite: string } {
  const coupure = /[.!?](?=\s+[A-ZÀ-ÖØ-Þ«])/.exec(message)
  if (!coupure) return { titre: message, suite: '' }
  const fin = coupure.index + 1
  return { titre: message.slice(0, fin), suite: message.slice(fin).trim() }
}

// ——— Correction en un clic (W-01 seulement) ———

/**
 * « Décaler au lendemain » : la même séance, un jour plus tard, rangée dans la bonne phase et la bonne semaine
 * (un dimanche décalé passe au lundi suivant). `null` si le lendemain sort du cycle : on ne propose alors rien.
 */
export function decalerAuLendemain(seance: SeancePlanifiee, cycle: Cycle, phases: PhaseCycle[]): SeancePlanifiee | null {
  const date = ajouterJours(seance.date, 1)
  for (const p of phases) {
    for (const w of p.semaines) {
      const lundi = debutSemaine(cycle, p, w.numero)
      if (date >= lundi && date <= ajouterJours(lundi, 6)) return { ...seance, phaseId: p.id, semaine: w.numero, date }
    }
  }
  return null
}

/** La correction n'existe que pour W-01 ; les autres avertissements n'en ont pas. */
export function peutDecaler(e: EntreeAvertissement, cycle: Cycle, phases: PhaseCycle[], seances: SeancePlanifiee[]): boolean {
  if (e.avertissement.code !== 'W-01' || e.seanceId === undefined) return false
  const s = seances.find((x) => x.id === e.seanceId)
  return s !== undefined && decalerAuLendemain(s, cycle, phases) !== null
}
