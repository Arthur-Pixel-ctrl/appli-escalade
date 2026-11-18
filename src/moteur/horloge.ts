// Horloge du chrono. Le temps écoulé est recalculé à partir de l'heure réelle passée en paramètre :
// une mise en veille du téléphone ne décale donc rien.

export type Marche = 'pret' | 'en_cours' | 'en_pause' | 'termine'
export interface Horloge {
  marche: Marche
  departMs: number // heure du dernier démarrage ou de la dernière reprise
  dejaEcouleS: number // temps accumulé avant la dernière pause
}

export const HORLOGE_PRETE: Horloge = { marche: 'pret', departMs: 0, dejaEcouleS: 0 }

export function demarrerHorloge(maintenantMs: number): Horloge {
  return { marche: 'en_cours', departMs: maintenantMs, dejaEcouleS: 0 }
}

export function mettreEnPause(h: Horloge, maintenantMs: number): Horloge {
  if (h.marche !== 'en_cours') return h
  return { ...h, marche: 'en_pause', dejaEcouleS: h.dejaEcouleS + (maintenantMs - h.departMs) / 1000 }
}

export function reprendreHorloge(h: Horloge, maintenantMs: number): Horloge {
  if (h.marche !== 'en_pause') return h
  return { ...h, marche: 'en_cours', departMs: maintenantMs }
}

export function terminerHorloge(h: Horloge): Horloge {
  return { ...h, marche: 'termine' }
}

/** En pause (ou prête, ou terminée) : le temps déjà écoulé, qui ne bouge plus. */
export function secondesEcoulees(h: Horloge, maintenantMs: number): number {
  return h.marche === 'en_cours' ? h.dejaEcouleS + (maintenantMs - h.departMs) / 1000 : h.dejaEcouleS
}
