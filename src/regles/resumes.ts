// Résumés d'une séance solo pour les niveaux « grandes lignes » et « simple » (docs/specs/niveaux-de-detail.md, § 1.3 et § 1.4).
// Tout est calculé à partir des étapes : rien n'est stocké (R-8), donc rien ne peut diverger quand on retouche une étape.
// Fonctions pures : elles reçoivent les fiches, elles ne lisent pas la base.
import type { PartieSeance, VersionSolo } from '../donnees/modele.ts'
import { LONGUEUR_MAX_RECOMMANDATION, NB_PARTIES_MAX } from '../donnees/niveaux.ts'
import { dureeEtapes } from '../donnees/plan.ts'
import type { EtapeSeance } from '../moteur/types.ts'
import { estNerveuse } from './base.ts'
import { NOMS_QUALITES } from './reglesParDefaut.ts'
import type { FicheVerif, Qualite } from './types.ts'

type Fiches = Record<string, FicheVerif>

/** Les familles de parties, dans l'ordre du gabarit d'une séance (A3-7). */
type Famille = 'Échauffement' | 'Effort principal' | 'Technique' | 'Antagonistes' | 'Retour au calme' | 'Complément'

/** Une phrase tient en une ligne : on coupe proprement si elle dépasse. */
function enUneLigne(texte: string): string {
  if (texte.length <= LONGUEUR_MAX_RECOMMANDATION) return texte
  return `${texte.slice(0, LONGUEUR_MAX_RECOMMANDATION - 1).trimEnd()}…`
}

/** Famille d'une étape. Une étape sans origine ou dont la fiche est inconnue va en « Complément ». */
function familleDe(etape: EtapeSeance, qualiteSeance: Qualite, fiches: Fiches): Famille {
  const fiche = etape.origine ? fiches[etape.origine.refId] : undefined
  if (!fiche) return 'Complément'
  if (fiche.qualite === 'echauffement') return 'Échauffement'
  // Une fiche nerveuse, ou de la qualité dominante de la séance, est l'effort principal.
  if (estNerveuse(fiche) || fiche.qualite === qualiteSeance) return 'Effort principal'
  if (fiche.qualite === 'technique' || fiche.qualite === 'mental') return 'Technique'
  if (fiche.qualite === 'antagonistes') return 'Antagonistes'
  if (fiche.qualite === 'mobilite') return 'Retour au calme'
  return 'Complément'
}

/** Une partie : durée = somme des étapes, exercice principal = l'étape la plus longue, consigne = leurs titres. */
function partieDepuis(titre: Famille, etapes: EtapeSeance[]): PartieSeance {
  const plusLongue = etapes.reduce((a, b) => (b.dureeMin > a.dureeMin ? b : a))
  const partie: PartieSeance = {
    titre,
    dureeMin: dureeEtapes(etapes),
    consigne: enUneLigne(etapes.map((e) => e.titre).join(', ')),
  }
  if (plusLongue.origine) partie.principal = { source: plusLongue.origine.source, refId: plusLongue.origine.refId }
  return partie
}

/**
 * Parties d'une séance qui a des étapes : chaque étape va dans sa famille, puis les étapes
 * consécutives d'une même famille fusionnent. Jamais plus de 5 parties : au-delà, la fin est regroupée.
 */
export function partiesDepuisEtapes(etapes: EtapeSeance[], qualiteSeance: Qualite, fiches: Fiches): PartieSeance[] {
  const groupes: { famille: Famille; etapes: EtapeSeance[] }[] = []
  for (const etape of etapes) {
    const famille = familleDe(etape, qualiteSeance, fiches)
    const dernier = groupes[groupes.length - 1]
    if (dernier && dernier.famille === famille) dernier.etapes.push(etape)
    else groupes.push({ famille, etapes: [etape] })
  }
  if (groupes.length > NB_PARTIES_MAX) {
    // Une séance retouchée à la main peut mélanger les familles : on garde les premières parties
    // et on range le reste ensemble, pour respecter la limite de 5 parties.
    const reste = groupes.splice(NB_PARTIES_MAX - 1).flatMap((g) => g.etapes)
    groupes.push({ famille: 'Complément', etapes: reste })
  }
  return groupes.map((g) => partieDepuis(g.famille, g.etapes))
}

/**
 * Recommandation par défaut (une ligne) quand l'utilisateur n'en a pas écrit.
 * Avec des étapes : les titres de l'effort principal. Avec des parties écrites : les deux premières, reliées par « puis ».
 * Sans rien : une phrase prudente qui laisse libre.
 */
export function recommandationParDefaut(
  version: VersionSolo,
  qualite: Qualite,
  durete: 'dure' | 'legere',
  fiches: Fiches,
): string {
  if (version.etapes.length > 0) {
    const effort = version.etapes.filter((e) => familleDe(e, qualite, fiches) === 'Effort principal')
    // Sans effort principal reconnu (fiches inconnues, séance d'échauffement seul…), on cite toutes les étapes.
    return enUneLigne((effort.length > 0 ? effort : version.etapes).map((e) => e.titre).join(', '))
  }
  const parties = version.parties ?? []
  if (parties.length > 0) return enUneLigne(parties.slice(0, 2).map((p) => p.titre).join(' puis '))
  return `Séance ${NOMS_QUALITES[qualite]}, ${durete === 'dure' ? 'dure' : 'légère'} : grimpe à ton idée.`
}

/** Les parties que le téléphone montre : celles écrites à la main, sinon celles calculées depuis les étapes. */
export function partiesAffichees(version: VersionSolo, qualite: Qualite, fiches: Fiches): PartieSeance[] {
  if (version.parties !== undefined && version.parties.length > 0) return version.parties
  return partiesDepuisEtapes(version.etapes, qualite, fiches)
}

/** La recommandation que le niveau simple montre : celle écrite, sinon celle calculée. */
export function recommandationAffichee(
  version: VersionSolo,
  qualite: Qualite,
  durete: 'dure' | 'legere',
  fiches: Fiches,
): string {
  if (version.recommandation !== undefined && version.recommandation.trim() !== '') return version.recommandation
  return recommandationParDefaut(version, qualite, durete, fiches)
}
