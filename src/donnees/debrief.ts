import type { SeanceRealisee } from './base.ts'

// Calculs du débrief. Rien de tout cela n'est stocké : tout est recalculé à l'affichage.

/** Charge d'une séance : effort perçu × durée en minutes (7 × 95 = 665). */
export function chargeSeance(s: Pick<SeanceRealisee, 'effortPercu' | 'dureeMin'>): number {
  return s.effortPercu * s.dureeMin
}

/** Le lundi de la semaine d'un jour donné, au format "2026-11-16". */
export function lundiDe(jour: string): string {
  const [a, m, j] = jour.split('-').map(Number)
  const d = new Date(a, m - 1, j)
  const depuisLundi = (d.getDay() + 6) % 7 // lundi = 0 … dimanche = 6
  d.setDate(d.getDate() - depuisLundi)
  const deux = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`
}

export function chiffresBlocs(s: Pick<SeanceRealisee, 'blocs'>) {
  return {
    tentes: s.blocs.length,
    enchaines: s.blocs.filter((b) => b.resultat !== 'non_enchaine').length,
    flashs: s.blocs.filter((b) => b.resultat === 'flash').length,
    essais: s.blocs.reduce((total, b) => total + b.essais, 0),
  }
}

export interface LigneCouleur { couleur: string; tentes: number; flashs: number; enchaines: number }

/** Regroupe les blocs par couleur, de la plus dure à la plus facile selon l'ordre de la salle. */
export function parCouleur(s: Pick<SeanceRealisee, 'blocs'>, ordreFacileVersDur: string[]): LigneCouleur[] {
  const lignes = new Map<string, LigneCouleur>()
  for (const b of s.blocs) {
    const l = lignes.get(b.couleur) ?? { couleur: b.couleur, tentes: 0, flashs: 0, enchaines: 0 }
    l.tentes += 1
    if (b.resultat === 'flash') l.flashs += 1
    if (b.resultat !== 'non_enchaine') l.enchaines += 1
    lignes.set(b.couleur, l)
  }
  return [...lignes.values()].sort((x, y) => ordreFacileVersDur.indexOf(y.couleur) - ordreFacileVersDur.indexOf(x.couleur))
}

/** Les séances de la même semaine (du lundi au dimanche) que la séance donnée. */
export function seancesDeLaSemaine(s: SeanceRealisee, toutes: SeanceRealisee[]): SeanceRealisee[] {
  const lundi = lundiDe(s.date)
  return toutes.filter((x) => lundiDe(x.date) === lundi)
}

/** La séance précédente du même mode, pour comparer. */
export function precedente(s: SeanceRealisee, toutes: SeanceRealisee[]): SeanceRealisee | undefined {
  return toutes
    .filter((x) => x.id !== s.id && x.mode === s.mode && x.creeLe < s.creeLe)
    .sort((x, y) => y.creeLe.localeCompare(x.creeLe))[0]
}

/** Phrase de résumé en tête du débrief. */
export function resume(s: SeanceRealisee): string {
  if (s.mode === 'solo') {
    const faites = s.etapes.filter((e) => e.statut === 'faite').length
    return faites === s.etapes.length
      ? 'Séance complète : toutes les étapes sont faites.'
      : `${faites} étape${faites > 1 ? 's' : ''} faite${faites > 1 ? 's' : ''} sur ${s.etapes.length}.`
  }
  const atteints = s.objectifs.filter((o) => o.fait >= o.cible).length
  if (s.objectifs.length === 0) return 'Séance libre notée.'
  if (atteints === s.objectifs.length) return atteints === 1 ? 'Ton objectif est atteint.' : `Tes ${atteints} objectifs sont atteints.`
  return `${atteints} objectif${atteints > 1 ? 's' : ''} atteint${atteints > 1 ? 's' : ''} sur ${s.objectifs.length}.`
}

/** Premier jour où une nouvelle séance dure respecte les 48 h de récupération. */
export function prochaineSeanceDurePossible(s: SeanceRealisee): Date {
  return new Date(new Date(s.creeLe).getTime() + 48 * 3600 * 1000)
}
