import type { BlocGrimpe, ObjectifGroupe, SeanceGroupe } from './types.ts'

// Logique d'une séance en groupe. Fonctions pures : l'heure est toujours passée en paramètre.

export interface EtatSeanceGroupe { debutMs: number; blocs: BlocGrimpe[]; position: number }

export function demarrerSeanceGroupe(maintenantMs: number): EtatSeanceGroupe {
  return { debutMs: maintenantMs, blocs: [], position: 0 }
}

/** Ajoute un bloc noté à l'objectif en cours. Enchaîné en 1 essai = flash. */
export function noterBloc(etat: EtatSeanceGroupe, couleur: string, essais: number, enchaine: boolean): EtatSeanceGroupe {
  const resultat = !enchaine ? 'non_enchaine' : essais === 1 ? 'flash' : 'enchaine'
  return { ...etat, blocs: [...etat.blocs, { couleur, essais, resultat, objectif: etat.position }] }
}

export function annulerDernierBloc(etat: EtatSeanceGroupe): EtatSeanceGroupe {
  return { ...etat, blocs: etat.blocs.slice(0, -1) }
}

export function changerObjectif(etat: EtatSeanceGroupe, position: number): EtatSeanceGroupe {
  return { ...etat, position }
}

/** Combien de blocs comptent pour cet objectif (tous les blocs notés, ou seulement les flashs). */
export function avancement(objectif: ObjectifGroupe, position: number, blocs: BlocGrimpe[]): number {
  const lesSiens = blocs.filter((b) => b.objectif === position)
  return objectif.compte === 'flashs' ? lesSiens.filter((b) => b.resultat === 'flash').length : lesSiens.length
}

export function bilanObjectifs(seance: SeanceGroupe, blocs: BlocGrimpe[]): { libelle: string; cible: number; fait: number }[] {
  return seance.objectifs.map((o, p) => ({ libelle: o.libelle, cible: o.cible, fait: avancement(o, p, blocs) }))
}
