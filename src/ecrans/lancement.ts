// Ce qu'on lance sur le téléphone : une version d'une séance prévue, ou une séance libre.
// Fonctions pures : l'écran lit la base, ici on prépare ce que la séance exécute et ce qu'on enregistre à la fin.
import type { Brouillon } from '../donnees/base.ts'
import type { Marqueur, Qualite } from '../donnees/bibliotheque/types.ts'
import type { Durete, SeancePlanifiee } from '../donnees/modele.ts'
import type { BlocGrimpe, SeanceGroupe, SeanceGuidee } from '../moteur/types.ts'
import { bilanObjectifs } from '../moteur/seanceGroupe.ts'
import { marqueursVersionPlanifiee, type FicheVerif } from '../regles/index.ts'
import type { StatutEtape } from '../moteur/seanceSolo.ts'

/** Le lien avec la séance prévue : il est écrit dans la séance réalisée (amendement 1 de D-22). */
export interface LienPlan {
  seancePlanifieeId: string
  qualite: Qualite
  /** Instantané des marqueurs de la version exécutée, calculé au lancement (jamais lu dans le plan après coup). */
  marqueurs: Marqueur[]
}

export type Lancement =
  | { mode: 'solo'; seance: SeanceGuidee; durete: Durete; lien?: LienPlan }
  | { mode: 'groupe'; seance: SeanceGroupe; durete: Durete; lien?: LienPlan }

/** Ce que demande un bouton : la version d'une séance du plan, ou une séance libre. */
export type DemandeLancement =
  | { type: 'plan'; seance: SeancePlanifiee; mode: 'solo' | 'groupe' }
  | { type: 'libre'; mode: 'solo' | 'groupe' }

// ——— Séances libres (pas de plan : on grimpe, on note) ———

/** Échauffement puis essais à ta limite : de quoi grimper sans plan, avec des valeurs prudentes. */
export const SEANCE_LIBRE_SOLO: SeanceGuidee = {
  nom: 'Séance libre',
  etapes: [
    {
      id: 'echauffement', dureeMin: 20, forme: 'liste', titre: 'Échauffement', resume: '20 min',
      consigne: 'Monte en intensité petit à petit. Tu dois finir chaud, pas fatigué.',
      elements: [
        '5 min pour faire monter le cardio',
        'Mobilité dynamique : épaules, poignets, hanches',
        '8 à 12 blocs, du plus facile au plus dur',
      ],
    },
    {
      id: 'essais', dureeMin: 40, forme: 'essais', titre: 'Essais', resume: '40 min',
      consigne: 'Des blocs à ton rythme. Arrête quand la qualité baisse ou si quelque chose fait mal.',
      reposS: 180,
    },
  ],
}

/** Sans objectif : on note juste les blocs grimpés. */
export const SEANCE_LIBRE_GROUPE: SeanceGroupe = { nom: 'Séance libre en groupe', reposConseilleS: 240, objectifs: [] }

export function lancementLibre(mode: 'solo' | 'groupe'): Lancement {
  return mode === 'solo'
    ? { mode, seance: SEANCE_LIBRE_SOLO, durete: 'legere' }
    : { mode, seance: SEANCE_LIBRE_GROUPE, durete: 'legere' }
}

// ——— Séances du plan ———

/** Le mode demandé n'existe pas dans cette séance (pas d'étapes, ou pas de version groupe) : `undefined`. */
export function lancementDepuisPlan(
  planifiee: SeancePlanifiee, mode: 'solo' | 'groupe', fiches: Record<string, FicheVerif>,
): Lancement | undefined {
  if (mode === 'solo') {
    if (planifiee.solo.etapes.length === 0) return undefined
    const lien = { seancePlanifieeId: planifiee.id, qualite: planifiee.qualite, marqueurs: marqueursVersionPlanifiee(planifiee.solo, fiches) }
    return { mode, seance: planifiee.solo, durete: planifiee.solo.durete, lien }
  }
  if (!planifiee.groupe) return undefined
  const lien = { seancePlanifieeId: planifiee.id, qualite: planifiee.qualite, marqueurs: marqueursVersionPlanifiee(planifiee.groupe, fiches) }
  return { mode, seance: planifiee.groupe, durete: planifiee.groupe.durete, lien }
}

/** Les champs du lien, seulement pour une séance du plan : une séance libre n'en porte aucun. */
function champsDuLien(lien: LienPlan | undefined, salleId: string | undefined): Partial<Brouillon> {
  return {
    ...(lien ? { seancePlanifieeId: lien.seancePlanifieeId, qualite: lien.qualite, marqueurs: lien.marqueurs } : {}),
    ...(salleId !== undefined ? { salleId } : {}),
  }
}

/** Séance solo terminée : une séance libre solo est de mode « libre » (elle se compte comme du solo). */
export function brouillonSolo(
  l: Extract<Lancement, { mode: 'solo' }>, statuts: StatutEtape[], dureeMin: number, salleId?: string,
): Brouillon {
  return {
    mode: l.lien ? 'solo' : 'libre', nom: l.seance.nom, durete: l.durete, dureeMin,
    etapes: l.seance.etapes.map((e, i) => ({
      titre: e.titre, statut: statuts[i], ...(e.origine ? { refId: e.origine.refId } : {}),
    })),
    objectifs: [], blocs: [],
    ...champsDuLien(l.lien, salleId),
  }
}

/** Séance en groupe terminée : sans objectif, elle garde le mode « groupe » (les blocs sont notés comme d'habitude). */
export function brouillonGroupe(
  l: Extract<Lancement, { mode: 'groupe' }>, blocs: BlocGrimpe[], dureeMin: number, salleId?: string,
): Brouillon {
  return {
    mode: 'groupe', nom: l.seance.nom, durete: l.durete, dureeMin,
    etapes: [], blocs, objectifs: bilanObjectifs(l.seance, blocs),
    ...champsDuLien(l.lien, salleId),
  }
}
