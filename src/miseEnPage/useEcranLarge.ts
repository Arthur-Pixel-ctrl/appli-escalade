import { useSyncExternalStore } from 'react'

// Au-dessus de ce seuil, l'app prend la mise en page « ordinateur » (un iPad en paysage y entre).
export const LARGEUR_BUREAU_PX = 1024

export function estEcranLarge(largeurPx: number): boolean {
  return largeurPx >= LARGEUR_BUREAU_PX
}

const requete = `(min-width: ${LARGEUR_BUREAU_PX}px)`

function lireEcranLarge(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(requete).matches
}

function suivre(rappel: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  const media = window.matchMedia(requete)
  media.addEventListener('change', rappel)
  return () => media.removeEventListener('change', rappel)
}

/** Vrai sur grand écran ; suit les changements de largeur (redimensionnement, rotation) sans recharger. */
export function useEcranLarge(): boolean {
  return useSyncExternalStore(suivre, lireEcranLarge, () => false)
}
