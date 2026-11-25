// Fonctions pures de l'éditeur « simple » et « grandes lignes » (D-26).
// Règle de fond (R-9) : changer de niveau n'écrit que `niveauDetail`. Ici, chaque fonction ne touche qu'un champ
// (recommandation, parties ou étapes) et jamais les deux autres. Rien de calculable n'est stocké (R-8).
import type { NiveauDetail, PartieSeance, SeancePlanifiee, VersionSolo } from '../donnees/modele.ts'
import { LONGUEUR_MAX_RECOMMANDATION, NB_PARTIES_MAX } from '../donnees/niveaux.ts'
import { seanceTypeParId } from '../donnees/seancesTypes.ts'
import type { EtapeSeance } from '../moteur/types.ts'
import { seanceDepuisType } from '../regles/index.ts'
import { etapeDepuisFiche, monterOuDescendre, retirerDe } from '../ecrans/bureau/VueSemaine.outils.ts'
import type { ExercicePerso } from '../donnees/modele.ts'

type Principal = NonNullable<PartieSeance['principal']>

/** Titre de la partie unique d'une séance simple écrite à la main. */
export const TITRE_SEANCE_SIMPLE = 'Séance'
/** Durée proposée quand on choisit un exercice avant d'avoir donné une durée : une partie doit en avoir une (5 à 180). */
export const DUREE_PARTIE_PAR_DEFAUT_MIN = 30
/** Durées proposées dans les listes : de 5 en 5 minutes, de 5 à 180. */
export const DUREES_PARTIE: number[] = Array.from({ length: 36 }, (_, i) => (i + 1) * 5)
export const LONGUEUR_MAX_TITRE_PARTIE = 60

/** Une copie de l'objet sans une clé (un champ facultatif « effacé » n'existe plus, il n'est pas `undefined`). */
function sans<T extends object, K extends keyof T>(objet: T, cle: K): Omit<T, K> {
  const { [cle]: _retire, ...reste } = objet
  return reste
}

// ——— Niveau de la séance ———

/** « Comme le cycle » (`null`) efface le niveau de la séance ; sinon on l'écrit. Rien d'autre ne change (R-9). */
export function changerNiveau(seance: SeancePlanifiee, niveau: NiveauDetail | null): SeancePlanifiee {
  if (niveau === null) return sans(seance, 'niveauDetail')
  return { ...seance, niveauDetail: niveau }
}

// ——— Recommandation (niveau simple) ———

/** Une recommandation vide redevient calculée : le champ disparaît. */
export function ecrireRecommandation(solo: VersionSolo, texte: string): VersionSolo {
  const coupe = texte.slice(0, LONGUEUR_MAX_RECOMMANDATION)
  if (coupe.trim() === '') return sans(solo, 'recommandation')
  return { ...solo, recommandation: coupe }
}

/** « Modifier le texte » : la valeur calculée devient une valeur écrite, qu'on peut retoucher. */
export function figerRecommandation(solo: VersionSolo, proposee: string): VersionSolo {
  return { ...solo, recommandation: proposee.slice(0, LONGUEUR_MAX_RECOMMANDATION) }
}

/** « Revenir au texte proposé » : efface le champ, la recommandation redevient calculée. */
export function revenirAuTexteProposé(solo: VersionSolo): VersionSolo {
  return sans(solo, 'recommandation')
}

// ——— Parties (niveau grandes lignes, et séance simple écrite à la main) ———

/** Remplace les parties ; une liste vide efface le champ (les parties redeviennent calculées). */
export function avecParties(solo: VersionSolo, parties: PartieSeance[]): VersionSolo {
  if (parties.length === 0) return sans(solo, 'parties')
  return { ...solo, parties: parties.slice(0, NB_PARTIES_MAX) }
}

/** « Modifier le texte » sur des grandes lignes calculées : on les recopie telles quelles pour les retoucher. */
export function figerParties(solo: VersionSolo, calculees: PartieSeance[]): VersionSolo {
  return avecParties(solo, calculees.map((p) => ({ ...p })))
}

/** « Recalculer les grandes lignes » : les parties écrites sont effacées, étapes et recommandation restent. */
export function recalculerGrandesLignes(solo: VersionSolo): VersionSolo {
  return sans(solo, 'parties')
}

export function peutAjouterPartie(solo: VersionSolo): boolean {
  return (solo.parties?.length ?? 0) < NB_PARTIES_MAX
}

export function ajouterPartie(solo: VersionSolo): VersionSolo {
  if (!peutAjouterPartie(solo)) return solo
  const parties = solo.parties ?? []
  return avecParties(solo, [...parties, { titre: `Partie ${parties.length + 1}`, dureeMin: 15 }])
}

export interface ChangementPartie {
  titre?: string
  dureeMin?: number
  /** `null` ou texte vide : on retire la consigne. */
  consigne?: string | null
  /** `null` : on retire l'exercice principal. */
  principal?: Principal | null
}

export function modifierPartie(solo: VersionSolo, index: number, changement: ChangementPartie): VersionSolo {
  const parties = solo.parties ?? []
  const actuelle = parties[index]
  if (!actuelle) return solo
  let suivante: PartieSeance = { ...actuelle }
  if (changement.titre !== undefined) suivante.titre = changement.titre
  if (changement.dureeMin !== undefined) suivante.dureeMin = changement.dureeMin
  if (changement.consigne !== undefined) {
    suivante = changement.consigne === null || changement.consigne.trim() === ''
      ? sans(suivante, 'consigne')
      : { ...suivante, consigne: changement.consigne.slice(0, LONGUEUR_MAX_RECOMMANDATION) }
  }
  if (changement.principal !== undefined) {
    suivante = changement.principal === null ? sans(suivante, 'principal') : { ...suivante, principal: { ...changement.principal } }
  }
  return avecParties(solo, parties.map((p, i) => (i === index ? suivante : p)))
}

export function monterPartie(solo: VersionSolo, index: number, sens: -1 | 1): VersionSolo {
  return avecParties(solo, monterOuDescendre(solo.parties ?? [], index, sens))
}

export function retirerPartie(solo: VersionSolo, index: number): VersionSolo {
  return avecParties(solo, retirerDe(solo.parties ?? [], index))
}

// ——— Séance simple écrite à la main : une seule partie « Séance » ———

/** Le principal et la durée d'une séance simple vivent dans la première partie ; plusieurs parties = on passe en grandes lignes. */
export function aPlusieursParties(solo: VersionSolo): boolean {
  return (solo.parties?.length ?? 0) > 1
}

/** Donne la durée à la partie unique (elle est créée au besoin, avec le titre « Séance »). */
export function ecrireDureeSimple(solo: VersionSolo, dureeMin: number): VersionSolo {
  if (aPlusieursParties(solo)) return solo
  const partie = solo.parties?.[0]
  return avecParties(solo, [partie ? { ...partie, dureeMin } : { titre: TITRE_SEANCE_SIMPLE, dureeMin }])
}

/**
 * Pose (ou retire, avec `null`) l'exercice principal de la partie `index` ; sans partie, la partie unique est créée.
 * Aucun contrôle de prérequis ni de douleur : le choix reste libre, l'avertissement vient du moteur (D-18).
 */
export function poserPrincipal(solo: VersionSolo, index: number, principal: Principal | null): VersionSolo {
  if ((solo.parties?.length ?? 0) === 0) {
    if (principal === null) return solo
    return avecParties(solo, [{ titre: TITRE_SEANCE_SIMPLE, dureeMin: DUREE_PARTIE_PAR_DEFAUT_MIN, principal: { ...principal } }])
  }
  return modifierPartie(solo, index, { principal })
}

// ——— Étapes (niveau détaillé) ———

/**
 * « Remplir depuis la séance type » : les étapes du catalogue, recopiées par C-01. `undefined` si la séance n'a pas
 * de séance type connue. Recommandation et parties ne sont pas touchées : l'appelant n'écrit que `etapes`.
 */
export function etapesDepuisSeanceType(seance: SeancePlanifiee): EtapeSeance[] | undefined {
  if (seance.seanceTypeId === undefined) return undefined
  const type = seanceTypeParId(seance.seanceTypeId)
  if (!type) return undefined
  // Seules les étapes de la copie servent : le reste (id, dates) est un gabarit jetable.
  const modele = seanceDepuisType(type, seance.variante, {
    id: seance.id, cycleId: seance.cycleId, phaseId: seance.phaseId, semaine: seance.semaine, date: seance.date, maintenant: seance.modifieLe,
  })
  return modele.solo.etapes
}

/**
 * Le nom de l'étape visée par un avertissement, pour la ligne qui le précède. Sans étapes détaillées, l'étape visée
 * est l'exercice principal d'une partie (AUD3-05) : on nomme donc la partie, dans le même ordre que le moteur.
 */
export function nomCibleCachee(seance: SeancePlanifiee, etapeIndex: number): string {
  const etapes = seance.solo.etapes
  if (etapes.length > 0) {
    const titre = etapes[etapeIndex]?.titre
    return titre !== undefined ? `Étape « ${titre} »` : 'Étape « inconnue »'
  }
  const partie = (seance.solo.parties ?? []).filter((p) => p.principal)[etapeIndex]
  return partie ? `Partie « ${partie.titre} »` : 'Étape « inconnue »'
}

/** Ajoute une étape recopiée depuis une fiche ; `undefined` si la fiche est introuvable (exercice perso sans sa liste). */
export function ajouterEtapeDepuisFiche(solo: VersionSolo, ficheId: string, persos: ExercicePerso[]): VersionSolo | undefined {
  const etape = etapeDepuisFiche(ficheId, persos, solo.etapes)
  return etape ? { ...solo, etapes: [...solo.etapes, etape] } : undefined
}
