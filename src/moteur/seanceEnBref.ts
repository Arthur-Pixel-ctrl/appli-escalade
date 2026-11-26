import { demarrerHorloge, HORLOGE_PRETE, mettreEnPause, reprendreHorloge, secondesEcoulees, type Horloge } from './horloge.ts'
import { minutesEcoulees, type StatutEtape } from './seanceSolo.ts'

// Logique d'une séance en bref (niveaux simple et grandes lignes) : un chrono libre et des parties à cocher.
// Fonctions pures, l'heure est toujours passée en paramètre (comme `seanceSolo.ts`, pour pouvoir être reprise par une montre).

export interface PartieEnBref { titre: string; refId?: string; statut: StatutEtape }
export interface EtatSeanceEnBref {
  ouvertLeMs: number // heure d'ouverture de l'écran : sert de repli si le chrono n'a jamais été démarré
  horloge: Horloge
  parties: PartieEnBref[]
}

export function ouvrirSeanceEnBref(parties: { titre: string; refId?: string }[], maintenantMs: number): EtatSeanceEnBref {
  return {
    ouvertLeMs: maintenantMs,
    horloge: HORLOGE_PRETE,
    parties: parties.map((p) => ({ titre: p.titre, ...(p.refId ? { refId: p.refId } : {}), statut: 'a_faire' as const })),
  }
}

export const demarrerChrono = (etat: EtatSeanceEnBref, ms: number): EtatSeanceEnBref =>
  ({ ...etat, horloge: demarrerHorloge(ms) })
export const mettreEnPauseChrono = (etat: EtatSeanceEnBref, ms: number): EtatSeanceEnBref =>
  ({ ...etat, horloge: mettreEnPause(etat.horloge, ms) })
export const reprendreChrono = (etat: EtatSeanceEnBref, ms: number): EtatSeanceEnBref =>
  ({ ...etat, horloge: reprendreHorloge(etat.horloge, ms) })

/** Une nouvelle valeur remplace l'ancienne : on peut se corriger. */
export function marquerPartie(etat: EtatSeanceEnBref, i: number, statut: StatutEtape): EtatSeanceEnBref {
  return { ...etat, parties: etat.parties.map((p, j) => (j === i ? { ...p, statut } : p)) }
}

export const tempsEcouleS = (etat: EtatSeanceEnBref, ms: number): number => secondesEcoulees(etat.horloge, ms)

/**
 * Durée à enregistrer. Chrono jamais démarré : le temps depuis l'ouverture (même règle que la séance guidée ;
 * sans elle, un oubli de « Démarrer » enregistrerait 0 min et fausserait la charge).
 */
export function dureeMinutes(etat: EtatSeanceEnBref, ms: number): number {
  if (etat.horloge.marche === 'pret') return minutesEcoulees({ debutMs: etat.ouvertLeMs }, ms)
  return Math.round(tempsEcouleS(etat, ms) / 60)
}

/** Même forme que `EtapeRealisee` (modele.ts), sans l'importer : le moteur reste indépendant. */
export function etapesRealisees(etat: EtatSeanceEnBref): { titre: string; statut: StatutEtape; refId?: string }[] {
  return etat.parties.map((p) => ({ titre: p.titre, statut: p.statut, ...(p.refId ? { refId: p.refId } : {}) }))
}
