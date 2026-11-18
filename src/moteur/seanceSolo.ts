import type { SeanceGuidee } from './types.ts'

// Logique d'une séance guidée en solo. Fonctions pures : l'heure est toujours passée en paramètre.

export type StatutEtape = 'a_faire' | 'faite' | 'passee'
export interface EtatSeanceSolo { debutMs: number; statuts: StatutEtape[] }

export function demarrerSeanceSolo(seance: SeanceGuidee, maintenantMs: number): EtatSeanceSolo {
  return { debutMs: maintenantMs, statuts: seance.etapes.map(() => 'a_faire') }
}

/** Première étape pas encore traitée ; -1 si tout est traité. */
export function etapeEnCours(etat: EtatSeanceSolo): number {
  return etat.statuts.indexOf('a_faire')
}

/** Marque l'étape en cours. Ne change rien quand tout est déjà traité. */
export function marquerEtape(etat: EtatSeanceSolo, statut: 'faite' | 'passee'): EtatSeanceSolo {
  const enCours = etapeEnCours(etat)
  if (enCours === -1) return etat
  return { ...etat, statuts: etat.statuts.map((s, i) => (i === enCours ? statut : s)) }
}

/** Minutes écoulées, arrondies, jamais négatives. */
export function minutesEcoulees(etat: { debutMs: number }, maintenantMs: number): number {
  return Math.max(0, Math.round((maintenantMs - etat.debutMs) / 60000))
}

export function bilanEtapes(seance: SeanceGuidee, etat: EtatSeanceSolo): { titre: string; statut: StatutEtape }[] {
  return seance.etapes.map((e, i) => ({ titre: e.titre, statut: etat.statuts[i] }))
}
