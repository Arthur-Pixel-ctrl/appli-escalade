import { useEffect, useMemo, useRef, useState } from 'react'
import {
  demarrerHorloge, HORLOGE_PRETE, mettreEnPause, reprendreHorloge, secondesEcoulees, terminerHorloge, type Horloge,
} from '../moteur/horloge.ts'
import { construireSequence, etatA, type ConfigChrono } from './sequence.ts'
import { garderEcranAllume, preparerSon, signal } from './signaux.ts'

/**
 * Fait tourner un chrono à partir d'un réglage.
 * Le temps écoulé est toujours recalculé à partir de l'heure réelle,
 * donc une mise en veille du téléphone ne décale rien.
 */
export function useChrono(config: ConfigChrono) {
  const phases = useMemo(() => construireSequence(config), [config])
  // L'horloge est une donnée simple manipulée par les fonctions du moteur ; le ref sert aux callbacks.
  const [horloge, setHorloge] = useState<Horloge>(HORLOGE_PRETE)
  const [ecouleS, setEcouleS] = useState(0)
  const { marche } = horloge
  const horlogeRef = useRef(horloge)
  const changerHorloge = (h: Horloge) => {
    horlogeRef.current = h
    setHorloge(h)
  }
  const dernierSignal = useRef('') // évite de rejouer deux fois le même signal

  const etat = etatA(phases, ecouleS)

  // Horloge : on relit l'heure dix fois par seconde tant que le chrono tourne.
  useEffect(() => {
    if (marche !== 'en_cours') return
    const relacherEcran = garderEcranAllume()
    const minuteur = setInterval(() => {
      setEcouleS(secondesEcoulees(horlogeRef.current, Date.now()))
    }, 100)
    return () => {
      clearInterval(minuteur)
      relacherEcran()
    }
  }, [marche])

  // Signaux sonores et vibrations aux changements de phase et sur les 3 dernières secondes.
  useEffect(() => {
    if (marche !== 'en_cours') return
    if (etat.termine) {
      signal.fin()
      changerHorloge(terminerHorloge(horlogeRef.current))
      return
    }
    const cle = `${etat.index}:${etat.resteS}`
    if (cle === dernierSignal.current) return
    dernierSignal.current = cle

    const debutDePhase = etat.resteS === etat.phase!.dureeS
    if (debutDePhase && etat.phase!.type === 'effort') signal.debutEffort()
    else if (debutDePhase && etat.phase!.type === 'repos') signal.debutRepos()
    else if (etat.resteS <= 3 && etat.phase!.type !== 'effort') signal.decompte()
  }, [marche, etat.index, etat.resteS, etat.termine, etat.phase])

  return {
    marche,
    etat,
    phases,
    demarrer() {
      preparerSon()
      dernierSignal.current = ''
      setEcouleS(0)
      changerHorloge(demarrerHorloge(Date.now()))
    },
    pause() {
      changerHorloge(mettreEnPause(horlogeRef.current, Date.now()))
    },
    reprendre() {
      preparerSon()
      changerHorloge(reprendreHorloge(horlogeRef.current, Date.now()))
    },
  }
}
