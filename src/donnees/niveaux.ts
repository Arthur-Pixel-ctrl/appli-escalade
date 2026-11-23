// Niveaux de détail (simple, grandes lignes, détaillé) : fonctions pures, sans lecture de la bibliothèque.
// Le niveau ne change que l'affichage : aucune de ces fonctions n'efface ni n'écrit quoi que ce soit (R-9).
// Conception : docs/specs/niveaux-de-detail.md § 1.
import {
  NIVEAUX_DETAIL,
  type AccentPhase,
  type Cycle,
  type NiveauDetail,
  type SeancePlanifiee,
  type VersionSolo,
} from './modele.ts'
import { dureeEtapes } from './plan.ts'

/** Une recommandation ou une consigne tient en une ligne. */
export const LONGUEUR_MAX_RECOMMANDATION = 120
/** Une séance en grandes lignes compte 1 à 5 parties. */
export const NB_PARTIES_MAX = 5

export const ETIQUETTES_NIVEAU: Record<NiveauDetail, string> = {
  simple: 'Simple',
  grandes_lignes: 'Grandes lignes',
  detaille: 'Détaillé',
}

/** Une ligne d'exemple par niveau, montrée sous chaque choix (fenêtre « Nouveau cycle »). */
export const EXEMPLES_NIVEAU: Record<NiveauDetail, string> = {
  simple: 'Jeudi · Doigts · dure · 1 h 30 : Bloc limite sur réglettes, 4 essais max.',
  grandes_lignes: 'Échauffement 30 min · Bloc limite 45 min · Antagonistes 15 min.',
  detaille: 'Chaque étape avec son chrono, ses séries et ses repos.',
}

/** Accents dont le cœur est un effort court et intense, réglé au chrono (« accent nerveux »). */
export const ACCENTS_NERVEUX: AccentPhase[] = ['doigts', 'traction_gainage', 'puissance']

/**
 * Niveau présélectionné à la création d'un cycle, et la phrase qui dit pourquoi.
 * Décision F6 d'Arthur : proposer selon les accents, jamais imposer ; jamais 'simple'.
 * Les trois cas sont testés dans l'ordre : le premier vrai l'emporte.
 */
export function niveauPropose(accents: (AccentPhase | null)[]): { niveau: NiveauDetail; pourquoi: string } {
  if (accents.some((a) => a !== null && ACCENTS_NERVEUX.includes(a))) {
    return {
      niveau: 'detaille',
      pourquoi: 'Une de tes phases travaille les doigts, la traction ou la puissance : en Détaillé, le chrono règle les temps d\'effort et les repos.',
    }
  }
  if (accents.length === 0 || accents.some((a) => a === null)) {
    // Valeur prudente : on ne sait pas encore ce que la phase contiendra.
    return {
      niveau: 'detaille',
      pourquoi: 'Les accents de tes phases ne sont pas tous choisis : l\'app propose le niveau le plus guidé.',
    }
  }
  return {
    niveau: 'grandes_lignes',
    pourquoi: 'Tes phases visent l\'endurance, la résistance ou la technique : les grandes parties suffisent. Tu peux passer une séance de poutre en Détaillé.',
  }
}

/** Le moins détaillé des deux niveaux. */
export function plusPetitNiveau(a: NiveauDetail, b: NiveauDetail): NiveauDetail {
  return NIVEAUX_DETAIL.indexOf(a) <= NIVEAUX_DETAIL.indexOf(b) ? a : b
}

/** Niveau voulu : celui de la séance, sinon celui du cycle, sinon « détaillé » (comme avant les niveaux). */
export function niveauChoisi(
  seance: Pick<SeancePlanifiee, 'niveauDetail'>,
  cycle?: Pick<Cycle, 'niveauDetail'>,
): NiveauDetail {
  return seance.niveauDetail ?? cycle?.niveauDetail ?? 'detaille'
}

/** Niveau que le contenu permet : des étapes → détaillé ; sinon des parties → grandes lignes ; sinon simple. */
export function niveauDisponible(v: VersionSolo): NiveauDetail {
  if (v.etapes.length > 0) return 'detaille'
  if (v.parties !== undefined && v.parties.length > 0) return 'grandes_lignes'
  return 'simple'
}

/** Niveau réellement affiché : le plus petit entre le niveau choisi et le niveau disponible. */
export function niveauAffiche(
  seance: Pick<SeancePlanifiee, 'niveauDetail' | 'solo'>,
  cycle?: Pick<Cycle, 'niveauDetail'>,
): NiveauDetail {
  return plusPetitNiveau(niveauChoisi(seance, cycle), niveauDisponible(seance.solo))
}

/** Durée de la version solo : somme des étapes ; sinon somme des parties ; sinon 0 (séance vide permise). */
export function dureeVersionSolo(v: VersionSolo): number {
  if (v.etapes.length > 0) return dureeEtapes(v.etapes)
  return (v.parties ?? []).reduce((total, p) => total + p.dureeMin, 0)
}
