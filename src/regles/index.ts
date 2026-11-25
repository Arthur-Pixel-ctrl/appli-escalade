// Point d'entrée unique du moteur de vérification : les écrans n'importent que ce fichier.
// Fonctions pures : on avertit, on ne bloque jamais (moteur-verification.md, B.3 et B.4).
import { lundiDe } from './base.ts'
import type {
  Avertissement, ContexteVerif, Jour, PlanVerif, SeanceVerif,
} from './types.ts'
import { verifierSeanceDeroule } from './verifSeanceDeroule.ts'
import { verifierSeanceProfil } from './verifSeanceProfil.ts'
import { verifierContenuSemaine } from './verifSemaineContenu.ts'
import { verifierEspacement, verifierQuotasSemaine } from './verifSemaineQuotas.ts'
import { verifierStructurePlan } from './verifPlan.ts'
import { verifierJour as verifierJourBrut } from './verifJour.ts'

type Origine = 'utilisateur' | 'assistant'

// ——— Dédoublonnage et tri (B.3) ———

/**
 * Clé d'unicité : même code pour la même cible. Un champ absent compte comme vide.
 * Le `sujet` fait partie de la cible : deux objectifs oubliés la même semaine sont deux problèmes.
 */
function cleUnique(a: Avertissement): string {
  return [a.code, a.seanceId, a.version, a.etapeIndex, a.lundi, a.mesocycleOrdre, a.sujet].map((v) => v ?? '').join('|')
}

/** Garde la première alerte de chaque clé (l'ordre d'arrivée est conservé). */
function dedoublonner(alertes: Avertissement[]): Avertissement[] {
  const vues = new Set<string>()
  return alertes.filter((a) => {
    const cle = cleUnique(a)
    if (vues.has(cle)) return false
    vues.add(cle)
    return true
  })
}

/**
 * Tri : `fort` d'abord, puis date (celle de la séance, sinon le `lundi`, sinon `repere`), puis code.
 * Une alerte sans date (plan, phase) prend la date de repère : début du plan ou jour de vérification.
 */
function trier(alertes: Avertissement[], dateDeSeance: Map<string, Jour>, repere: Jour): Avertissement[] {
  const dateDe = (a: Avertissement): Jour =>
    (a.seanceId !== undefined ? dateDeSeance.get(a.seanceId) : undefined) ?? a.lundi ?? repere
  const rang = (a: Avertissement) => (a.niveau === 'fort' ? 0 : 1)
  return [...alertes].sort(
    (a, b) =>
      rang(a) - rang(b) ||
      (dateDe(a) < dateDe(b) ? -1 : dateDe(a) > dateDe(b) ? 1 : 0) ||
      (a.code < b.code ? -1 : a.code > b.code ? 1 : 0),
  )
}

function datesDesSeances(seances: SeanceVerif[]): Map<string, Jour> {
  return new Map(seances.map((s) => [s.id, s.date]))
}

function finaliser(alertes: Avertissement[], seances: SeanceVerif[], repere: Jour): Avertissement[] {
  return trier(dedoublonner(alertes), datesDesSeances(seances), repere)
}

// ——— Points d'entrée ———

/** S-01 à S-26 sur chaque version présente de la séance. */
export function verifierSeance(s: SeanceVerif, ctx: ContexteVerif, origine: Origine = 'utilisateur'): Avertissement[] {
  return finaliser([...verifierSeanceProfil(s, ctx, origine), ...verifierSeanceDeroule(s, ctx)], [s], s.date)
}

/** W-01 (calculé sur toute la frise, gardé pour les séances de la semaine) et W-02 à W-20, sans dédoublonnage ni tri. */
function alertesDeLaSemaine(lundi: Jour, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  const dansLaSemaine = new Set(plan.seances.filter((s) => lundiDe(s.date) === lundi).map((s) => s.id))
  const w01 = verifierEspacement(plan.seances, ctx).filter((a) => a.seanceId !== undefined && dansLaSemaine.has(a.seanceId))
  return [
    ...w01,
    ...verifierQuotasSemaine(lundi, plan.seances, plan.seancesParSemaine, ctx),
    ...verifierContenuSemaine(lundi, plan, ctx),
  ]
}

/** W-01 à W-20 pour la semaine qui commence le `lundi`. */
export function verifierSemaine(lundi: Jour, plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  return finaliser(alertesDeLaSemaine(lundi, plan, ctx), plan.seances, lundi)
}

/** Toutes les séances, W-01 une seule fois sur la frise, chaque semaine, puis la structure (P-01 à P-15). */
export function verifierPlan(plan: PlanVerif, ctx: ContexteVerif): Avertissement[] {
  const origine: Origine = plan.origine
  const alertes: Avertissement[] = plan.seances.flatMap((s) => [
    ...verifierSeanceProfil(s, ctx, origine),
    ...verifierSeanceDeroule(s, ctx),
  ])
  alertes.push(...verifierEspacement(plan.seances, ctx)) // W-01 : une fois, pas une fois par semaine
  for (const semaine of plan.semaines) {
    alertes.push(
      ...verifierQuotasSemaine(semaine.lundi, plan.seances, plan.seancesParSemaine, ctx),
      ...verifierContenuSemaine(semaine.lundi, plan, ctx),
    )
  }
  alertes.push(...verifierStructurePlan(plan, ctx))
  return finaliser(alertes, plan.seances, plan.debut)
}

/** J-01 à J-07, plus S-04 et S-05 (douleur, signe d'alerte) sur la séance du jour. */
export function verifierJour(seanceDuJour: SeanceVerif, ctx: ContexteVerif, realisees: SeanceVerif[]): Avertissement[] {
  const douleur = verifierSeanceProfil(seanceDuJour, ctx, 'utilisateur').filter((a) => a.code === 'S-04' || a.code === 'S-05')
  return finaliser([...verifierJourBrut(seanceDuJour, ctx, realisees), ...douleur], [seanceDuJour], ctx.aujourdhui)
}

// ——— Réexports pour les écrans ———
export * from './allegement.ts'
export * from './banque.ts'
export * from './generateur.ts'
export * from './passerelles.ts'
export * from './resumes.ts'
export { REGLES_PAR_DEFAUT } from './reglesParDefaut.ts'
export { manquesPrerequis } from './verifSeanceProfil.ts'
export { fichesDeLaBibliotheque } from './adaptateur.ts'
export type {
  Avertissement, ContexteVerif, DouleurVerif, EtapeVerif, FicheVerif, FormeVerif, Jour, Marqueur, Niveau,
  ObjectifGroupeVerif, ObjectifPersoVerif, PlanVerif, PrerequisNonRenseigne, ProfilVerif, Qualite, Regles, ResultatTestVerif,
  SeanceVerif, SemaineVerif, VersionVerif, ZoneDouleur,
} from './types.ts'
