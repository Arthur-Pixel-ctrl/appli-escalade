// Logique pure du glisser-déposer du plan (D-17). Rien ici ne touche à l'écran ni à la base :
// le glisser appelle les mêmes fonctions que les boutons (« Monter », « Descendre »…), il ne les double pas.
import type { SeancePlanifiee } from '../donnees/modele.ts'
import type { EtapeSeance } from '../moteur/types.ts'
import { monterOuDescendre } from '../ecrans/bureau/VueSemaine.outils.ts'

/** Distance (px) à partir de laquelle un appui devient un glisser : en dessous, c'est un simple clic ou une main qui tremble. */
export const SEUIL_DEPART_PX = 6

/** Zone du bord de l'écran (px) où la page défile toute seule pendant un glisser. */
export const MARGE_DEFILEMENT_PX = 72
const PAS_DEFILEMENT_PX = 16

export type ListeEtapesNom = 'solo' | 'minibloc'

export function aDepasseLeSeuil(dx: number, dy: number, seuil = SEUIL_DEPART_PX): boolean {
  return Math.hypot(dx, dy) >= seuil
}

/** Défilement vertical à appliquer (négatif = vers le haut) quand le pointeur est près du bord de la fenêtre. */
export function defilementAuBord(y: number, hauteurFenetre: number): number {
  if (y < MARGE_DEFILEMENT_PX) return -PAS_DEFILEMENT_PX
  if (y > hauteurFenetre - MARGE_DEFILEMENT_PX) return PAS_DEFILEMENT_PX
  return 0
}

// ——— Identifiants de zones : « type:partie:partie », écrits dans `data-zone` ———

export function idZone(type: string, ...parties: (string | number)[]): string {
  return [type, ...parties].join(':')
}

export function lireZone(zone: string): { type: string; parties: string[] } {
  const [type, ...parties] = zone.split(':')
  return { type, parties }
}

/** Les zones de dépôt qui contiennent un élément, de la plus proche à la plus large (une étape est dans une séance, qui est dans un jour). */
export function zonesSousLeDoigt(element: Element | null): string[] {
  const zones: string[] = []
  for (let e = element?.closest('[data-zone]') ?? null; e; e = e.parentElement?.closest('[data-zone]') ?? null) {
    const zone = e.getAttribute('data-zone')
    if (zone) zones.push(zone)
  }
  return zones
}

// ——— Réordonner ———

/** Déplace un élément de la place `de` à la place `vers`, en répétant « Monter » ou « Descendre » (même fonction que le menu). */
export function deplacerElement<T>(liste: T[], de: number, vers: number): T[] {
  if (de === vers || de < 0 || vers < 0 || de >= liste.length || vers >= liste.length) return liste
  const sens = vers > de ? 1 : -1
  let resultat = liste
  for (let i = de; i !== vers; i += sens) resultat = monterOuDescendre(resultat, i, sens)
  return resultat
}

/** La séance dont une liste d'étapes (solo ou mini-bloc du groupe) a été réordonnée. */
export function reordonnerEtapes(seance: SeancePlanifiee, liste: ListeEtapesNom, de: number, vers: number): SeancePlanifiee {
  if (liste === 'minibloc') {
    const mini = seance.groupe?.miniBloc
    if (!seance.groupe || !mini) return seance
    const etapes: EtapeSeance[] = deplacerElement(mini.etapes, de, vers)
    return { ...seance, groupe: { ...seance.groupe, miniBloc: { ...mini, etapes } } }
  }
  return { ...seance, solo: { ...seance.solo, etapes: deplacerElement(seance.solo.etapes, de, vers) } }
}
