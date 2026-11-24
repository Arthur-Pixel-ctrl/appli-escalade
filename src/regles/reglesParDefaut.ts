// Réglages par défaut du moteur, et les libellés français de ses listes (moteur-verification.md, B.1 et B.2).
// Ces valeurs sont prudentes : une valeur absente ou hors plage est remplacée par celle-ci.
import type { Marqueur, Qualite } from '../donnees/bibliotheque/types.ts'
import { QUALITES_PHYSIQUES } from '../donnees/modele.ts'
import type { ZoneDouleur } from '../donnees/profil.ts'
import type { Regles } from './types.ts'

export { QUALITES_PHYSIQUES }

// Une ligne par valeur : sa source, comme dans moteur-verification.md B.1.
export const REGLES_PAR_DEFAUT: Regles = {
  heuresEntreSeancesMax: 48, // [SYN], [MOD]
  poutreIntensiveParSemaine: 2, // [SYN]
  blocLimiteParSemaine: 2, // [SYN]
  poutreParSemaine: 3, // [AUD I-8]
  joursDoigtsMaxParSemaine: 4, // [VER 9]
  reposEffortMaxS: 180, // [SYN] (3 à 5 min)
  dechargeActive: true, // [SYN]
  dechargeReductionPct: 50, // [SYN], [MOD] (40 à 60)
  seuilSommeilH: 7, // [SYN]
  hausseChargeMaxPct: 10, // [SYN] (repère FFME, non validé)
  dureeBlocNerveuxMaxMin: 60, // [SYN] (gabarit : 30 à 60 min)
  toleranceDechargePts: 10, // [CDC]
  seuilDechargeOublieePct: 90, // [CDC]
  joursSansPoutreAvantObjectif: 3, // [CDC]
}

/** Marqueurs qui rendent un bloc nerveux (effort intense). */
export const MARQUEURS_NERVEUX: Marqueur[] = ['maximale', 'poutre_intensive', 'bloc_limite', 'pan_gullich']

/** Marqueurs comptés dans les quotas par semaine (MARQUEURS_NERVEUX, plus la poutre simple). */
export const MARQUEURS_QUOTA: Marqueur[] = ['maximale', 'poutre_intensive', 'bloc_limite', 'pan_gullich', 'poutre']

/** Marqueurs interdits pendant une douleur déclarée : pas d'arqué, de pan, de trous ni d'effort maximal. */
export const MARQUEURS_RISQUE_DOULEUR: Marqueur[] = ['maximale', 'arque', 'pan_gullich', 'trou', 'pan']

export const NOMS_QUALITES: Record<Qualite, string> = {
  doigts: 'force des doigts',
  traction_gainage: 'traction et gainage',
  puissance: 'puissance',
  resistance: 'résistance',
  endurance: 'endurance',
  technique: 'technique',
  mental: 'mental',
  antagonistes: 'antagonistes',
  mobilite: 'mobilité',
  echauffement: 'échauffement',
}

export const NOMS_ZONES: Record<ZoneDouleur, string> = {
  doigts: 'doigts',
  poignet: 'poignet',
  coude: 'coude',
  epaule: 'épaule',
  hanche: 'hanche', // ajoutées à la liste de B.1 : ZoneDouleur (profil.ts) les contient, Record les exige
  genou: 'genou',
  cheville: 'cheville',
  dos: 'dos',
  autre: 'autre zone',
}

/** Effort prévu par défaut d'une version, selon sa dureté. Décidé par Arthur le 17/11 (B17). */
export const EFFORT_PREVU_PAR_DEFAUT = { dure: 7, legere: 4 }

/**
 * Décision F2 d'Arthur, point 13 : 1 par semaine tant que le profil est « bloc », 2 si l'objectif devient la voie
 * (Lattice : 2 au plus). Une constante, pas un réglage : elle dépend du profil.
 */
export const RESISTANCE_VOIE_PAR_SEMAINE: Record<'bloc' | 'voie', number> = { bloc: 1, voie: 2 }
