// Banque d'exercices : le tri commun au générateur, au menu « Ajouter une séance type » et à l'assistant (décision F3).
// Fonctions pures, aucune lecture de base. On avertit sans bloquer : une fiche indisponible reste visible,
// avec sa raison ; elle n'est simplement jamais proposée automatiquement.
// Spécification : docs/specs/niveaux-de-detail.md § 2.1 et § 2.2 ; docs/backlog-v2.md, G-01.
import type { Contexte } from '../donnees/bibliotheque/types.ts'
import { objectifGroupeParId } from '../donnees/objectifsGroupe.ts'
import { SEANCES_TYPES, type EtapeType, type SeanceType } from '../donnees/seancesTypes.ts'
import { NOMS_ZONES } from './reglesParDefaut.ts'
import type { FicheVerif, ProfilVerif, ZoneDouleur } from './types.ts'
import { manquesPrerequis } from './verifSeanceProfil.ts'

/** Pourquoi une fiche n'est pas proposée automatiquement (la première raison trouvée l'emporte). */
export type RaisonIndisponible = 'a_verifier' | 'test' | 'prerequis' | 'douleur' | 'contexte'

type Lieu = ProfilVerif['lieux'][number]

/**
 * Le terrain de la fiche est-il possible là où le grimpeur s'entraîne ? (niveaux-de-detail.md § 2.2)
 * Une liste de lieux vide n'est pas renseignée : par prudence on suppose une salle de bloc seulement.
 */
export function lieuPermet(terrain: Contexte['terrain'], lieux: readonly Lieu[]): boolean {
  const lieuxConnus: readonly Lieu[] = lieux.length === 0 ? ['salle_bloc'] : lieux
  const aSalle = lieuxConnus.includes('salle_bloc') || lieuxConnus.includes('salle_voie')
  switch (terrain) {
    case undefined: // pas de terrain précisé : on grimpe, donc une salle suffit
    case 'bloc':
    case 'pan':
      return aSalle
    case 'voie': // la corde et l'assureur n'existent qu'en salle avec des voies
      return lieuxConnus.includes('salle_voie')
    case 'poutre':
    case 'barre':
      return aSalle || lieuxConnus.includes('maison')
    case 'sol':
      return true
  }
}

/** La première raison qui écarte la fiche, ou `null` si le générateur peut la proposer. */
function raisonDe(fiche: FicheVerif, profil: ProfilVerif, zones: readonly ZoneDouleur[]): RaisonIndisponible | null {
  // Même règle que `peutEtreGeneree` (bibliothèque) : une fiche exclue le reste même si le profil remplit tout.
  if (fiche.exclureDeLaGeneration !== undefined) return 'a_verifier'
  if (fiche.estTest === true) return 'test'
  if (manquesPrerequis(fiche.prerequis, profil).length > 0) return 'prerequis'
  if (fiche.contreIndications.some((z) => zones.includes(z) || profil.douleursEnCours.includes(z))) return 'douleur'
  // S-07 : la grimpe en tête exige un grimpeur prêt (une donnée non renseignée compte comme « non prêt »).
  if (fiche.contexte?.grimpeEnTete === true && profil.grimpeEnTete !== true) return 'contexte'
  if (!lieuPermet(fiche.contexte?.terrain, profil.lieux)) return 'contexte'
  return null
}

export interface FicheIndisponible {
  fiche: FicheVerif
  raison: RaisonIndisponible
}

/**
 * Range chaque fiche en disponible ou indisponible (avec sa raison). L'ordre d'entrée est conservé :
 * disponibles + indisponibles = toutes les fiches, sans doublon.
 * `zones` : les zones douloureuses du jour (`zonesDouloureuses`) ; celles du profil comptent toujours aussi.
 */
export function trierFiches(
  fiches: FicheVerif[],
  profil: ProfilVerif,
  zones: ZoneDouleur[],
): { disponibles: FicheVerif[]; indisponibles: FicheIndisponible[] } {
  const disponibles: FicheVerif[] = []
  const indisponibles: FicheIndisponible[] = []
  for (const fiche of fiches) {
    const raison = raisonDe(fiche, profil, zones)
    if (raison === null) disponibles.push(fiche)
    else indisponibles.push({ fiche, raison })
  }
  return { disponibles, indisponibles }
}

/** La raison en clair, à afficher à côté de la fiche (« avertir sans bloquer »). */
export function phraseRaison(
  { fiche, raison }: FicheIndisponible,
  profil: ProfilVerif,
  zones: ZoneDouleur[],
): string {
  switch (raison) {
    case 'a_verifier':
      return `À la main seulement : ${fiche.exclureDeLaGeneration}`
    case 'test':
      return 'À la main seulement : test de fin de phase, proposé par « faire mes tests ».'
    case 'prerequis':
      return `Prérequis manquants : ${manquesPrerequis(fiche.prerequis, profil).join(' ; ')}.`
    case 'douleur': {
      const touchees = fiche.contreIndications.filter((z) => zones.includes(z) || profil.douleursEnCours.includes(z))
      return `Déconseillé : douleur déclarée (${touchees.map((z) => NOMS_ZONES[z]).join(', ')}).`
    }
    case 'contexte':
      return fiche.contexte?.grimpeEnTete === true && profil.grimpeEnTete !== true
        ? 'Demande de savoir grimper et tomber en tête : à faire après une formation.'
        : 'Ne se fait pas là où tu t\'entraînes (lieux de ton profil).'
  }
}

// ——— Séances types ———

const idsDesEtapes = (etapes: EtapeType[]): string[] => etapes.map((e) => e.ficheId)

/**
 * Fiches du solo et du mini-bloc de la version groupe (la variante peut remplacer l'un et l'autre), plus les
 * fiches de référence des objectifs de groupe : un objectif « en voie » ne doit pas aller à qui n'a pas de voie.
 */
function fichesDeLaSeance(st: SeanceType, variante?: string): string[] {
  const v = variante === undefined ? undefined : st.variantes[variante]
  const miniBloc = v?.miniBloc ?? st.groupe?.miniBloc
  const fichesObjectifs = (st.groupe?.objectifIds ?? []).flatMap((id) => {
    const ref = objectifGroupeParId(id)?.ficheReference
    return ref === undefined ? [] : [ref]
  })
  return [...idsDesEtapes(v?.solo ?? st.solo), ...idsDesEtapes(miniBloc?.etapes ?? []), ...fichesObjectifs]
}

/**
 * Les séances types que le générateur et l'assistant peuvent proposer : toutes les fiches du solo et du mini-bloc
 * sont disponibles. Une variante n'est gardée que si ses propres fiches le sont aussi. Si la séance de base ne
 * convient pas, elle disparaît avec ses variantes (prudence : on ne propose pas une variante sans sa base).
 */
export function seancesTypesDisponibles(
  disponibles: FicheVerif[],
  catalogue: SeanceType[] = SEANCES_TYPES,
): { seanceType: SeanceType; variantes: string[] }[] {
  const ids = new Set(disponibles.map((f) => f.id))
  const toutesDisponibles = (st: SeanceType, variante?: string) => fichesDeLaSeance(st, variante).every((id) => ids.has(id))
  return catalogue
    .filter((st) => toutesDisponibles(st))
    .map((st) => ({
      seanceType: st,
      variantes: Object.keys(st.variantes).filter((nom) => toutesDisponibles(st, nom)),
    }))
}
