// Les contrôles du jour (J-01 à J-07, plus S-04 à S-06) pour l'écran Aujourd'hui. Fonction pure.
import type { Cycle, SeancePlanifiee, SeanceRealisee } from '../donnees/modele.ts'
import {
  contexteVerif, formeAffichage, realiseeVersVerif, seanceVersVerif, verifierJour, verifierJourSansSeance,
  type Avertissement, type EntreesContexteVerif,
} from '../regles/index.ts'

export type FormeControle = 'information' | 'avertissement' | 'arret'
export interface ControleDuJour { avertissement: Avertissement; forme: FormeControle }

const RANG: Record<FormeControle, number> = { arret: 0, avertissement: 1, information: 2 }

/**
 * `duJour` n'est donné que pour une séance encore à faire : une séance faite ou sautée n'est plus « à faire »
 * (J-04 parlerait de la séance qu'on vient de finir). Sans elle, seuls J-05 et J-06 peuvent sortir.
 * Ordre : arrêts, avertissements, informations ; l'ordre du moteur est gardé dans chaque groupe.
 */
export function controlesDuJour(
  e: EntreesContexteVerif,
  realisees: SeanceRealisee[],
  duJour?: { seance: SeancePlanifiee; cycle: Cycle },
): ControleDuJour[] {
  const ctx = contexteVerif(e)
  const alertes = duJour
    ? verifierJour(
      seanceVersVerif(duJour.seance, ctx.fiches, undefined, duJour.cycle),
      ctx,
      realisees.filter((r) => !r.supprimeLe).map(realiseeVersVerif),
    )
    : verifierJourSansSeance(ctx)
  const controles = alertes.map((avertissement) => ({ avertissement, forme: formeAffichage(avertissement) }))
  // Tri stable : à rang égal, l'ordre du moteur reste.
  return controles.sort((a, b) => RANG[a.forme] - RANG[b.forme])
}
