// Moteur de chrono, partie « calcul ».
// Aucune horloge ici : ces fonctions transforment un réglage en liste de phases,
// puis disent où on en est après un temps écoulé donné. Elles sont donc faciles à tester.

/** Les quatre gabarits de chrono, avec leurs valeurs déjà choisies (en secondes). */
export type ConfigChrono =
  // Un effort, puis un long repos (suspension maximale, essai de bloc)
  | { gabarit: 'repetition_unique'; effortS: number; series: number; reposSeriesS: number }
  // Un départ par créneau fixe (ex. 10 s d'effort toutes les minutes)
  | { gabarit: 'depart_minute'; effortS: number; creneauS: number; repetitions: number; series: number; reposSeriesS: number }
  // Effort / repos répété (ex. 7 s / 3 s, six fois)
  | { gabarit: 'intermittent'; effortS: number; reposRepetitionsS: number; repetitions: number; series: number; reposSeriesS: number }
  // Durées variables (ex. échelle 3-6-9 s). Deux façons de compter le créneau :
  // - sans reposEntrePaliersS : chaque suspension démarre toutes les `creneauS` secondes ;
  // - avec reposEntrePaliersS : toute l'échelle tient dans `creneauS` (façon Bechtel),
  //   avec ce repos court entre les suspensions, et le reste du créneau après la dernière.
  | { gabarit: 'echelle'; dureesS: number[]; creneauS: number; reposEntrePaliersS?: number; series: number; reposSeriesS: number }

export type TypePhase = 'preparation' | 'effort' | 'repos'

export interface Phase {
  type: TypePhase
  dureeS: number
  serie: number // numéro de la série en cours, à partir de 1
  totalSeries: number
  repetition: number // numéro de la répétition dans la série, à partir de 1
  totalRepetitions: number
  entreSeries?: boolean // vrai pour le long repos entre deux séries
}

/** Décompte avant le premier effort, pour avoir le temps de se placer. */
export const PREPARATION_S = 5

/** Liste des efforts d'une série et du repos qui suit chacun (sauf le dernier). */
function effortsDUneSerie(c: ConfigChrono): { effortS: number; reposS: number }[] {
  switch (c.gabarit) {
    case 'repetition_unique':
      return [{ effortS: c.effortS, reposS: 0 }]
    case 'depart_minute':
      return Array.from({ length: c.repetitions }, () => ({
        effortS: c.effortS,
        reposS: Math.max(0, c.creneauS - c.effortS),
      }))
    case 'intermittent':
      return Array.from({ length: c.repetitions }, () => ({
        effortS: c.effortS,
        reposS: c.reposRepetitionsS,
      }))
    case 'echelle':
      if (c.reposEntrePaliersS !== undefined) {
        return c.dureesS.map((d) => ({ effortS: d, reposS: c.reposEntrePaliersS! }))
      }
      return c.dureesS.map((d) => ({ effortS: d, reposS: Math.max(0, c.creneauS - d) }))
  }
}

/** Transforme un réglage en suite de phases : préparation, puis efforts et repos. */
/** Échelle « façon Bechtel » : le temps qui reste dans le créneau une fois l'échelle finie. */
function resteDuCreneauS(c: ConfigChrono): number {
  if (c.gabarit !== 'echelle' || c.reposEntrePaliersS === undefined) return 0
  const occupe = c.dureesS.reduce((t, d) => t + d, 0) + c.reposEntrePaliersS * (c.dureesS.length - 1)
  return Math.max(0, c.creneauS - occupe)
}

export function construireSequence(c: ConfigChrono, preparationS = PREPARATION_S): Phase[] {
  const efforts = effortsDUneSerie(c)
  const reposApresSerieS = c.reposSeriesS + resteDuCreneauS(c)
  const phases: Phase[] = []
  const repere = { totalSeries: c.series, totalRepetitions: efforts.length }

  if (preparationS > 0) {
    phases.push({ type: 'preparation', dureeS: preparationS, serie: 1, repetition: 1, ...repere })
  }

  for (let s = 1; s <= c.series; s++) {
    efforts.forEach((e, i) => {
      const repetition = i + 1
      const derniereRepetition = repetition === efforts.length
      const derniereSerie = s === c.series
      phases.push({ type: 'effort', dureeS: e.effortS, serie: s, repetition, ...repere })

      if (!derniereRepetition && e.reposS > 0) {
        phases.push({ type: 'repos', dureeS: e.reposS, serie: s, repetition, ...repere })
      } else if (derniereRepetition && !derniereSerie && reposApresSerieS > 0) {
        // Après la dernière répétition d'une série : le long repos, pas le repos court.
        phases.push({ type: 'repos', dureeS: reposApresSerieS, serie: s, repetition, entreSeries: true, ...repere })
      }
    })
  }
  return phases
}

export function dureeTotaleS(phases: Phase[]): number {
  return phases.reduce((total, p) => total + p.dureeS, 0)
}

export interface EtatChrono {
  termine: boolean
  index: number // position de la phase en cours dans la séquence
  phase: Phase | null
  suivante: Phase | null
  resteS: number // secondes restantes dans la phase, arrondies vers le haut pour l'affichage
  ecouleDansPhaseS: number
}

/**
 * Où en est-on après `ecouleS` secondes de chrono ?
 * On repart toujours du temps écoulé réel : si le téléphone se met en veille ou ralentit,
 * le chrono retombe juste au réveil au lieu de prendre du retard.
 */
export function etatA(phases: Phase[], ecouleS: number): EtatChrono {
  let debut = 0
  for (let i = 0; i < phases.length; i++) {
    const fin = debut + phases[i].dureeS
    if (ecouleS < fin) {
      return {
        termine: false,
        index: i,
        phase: phases[i],
        suivante: phases[i + 1] ?? null,
        resteS: Math.ceil(fin - ecouleS),
        ecouleDansPhaseS: ecouleS - debut,
      }
    }
    debut = fin
  }
  return { termine: true, index: phases.length, phase: null, suivante: null, resteS: 0, ecouleDansPhaseS: 0 }
}
