import { useEffect, useMemo, useRef, useState } from 'react'
import { construireSequence, etatA, type ConfigChrono } from './sequence.ts'
import { garderEcranAllume, preparerSon, signal } from './signaux.ts'

type Marche = 'pret' | 'en_cours' | 'en_pause' | 'termine'

/**
 * Fait tourner un chrono à partir d'un réglage.
 * Le temps écoulé est toujours recalculé à partir de l'heure réelle,
 * donc une mise en veille du téléphone ne décale rien.
 */
export function useChrono(config: ConfigChrono) {
  const phases = useMemo(() => construireSequence(config), [config])
  const [marche, setMarche] = useState<Marche>('pret')
  const [ecouleS, setEcouleS] = useState(0)

  const departMs = useRef(0) // heure du dernier démarrage ou de la dernière reprise
  const dejaEcouleS = useRef(0) // temps accumulé avant la dernière pause
  const dernierSignal = useRef('') // évite de rejouer deux fois le même signal

  const etat = etatA(phases, ecouleS)

  // Horloge : on relit l'heure dix fois par seconde tant que le chrono tourne.
  useEffect(() => {
    if (marche !== 'en_cours') return
    const relacherEcran = garderEcranAllume()
    const minuteur = setInterval(() => {
      setEcouleS(dejaEcouleS.current + (Date.now() - departMs.current) / 1000)
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
      setMarche('termine')
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
      dejaEcouleS.current = 0
      departMs.current = Date.now()
      dernierSignal.current = ''
      setEcouleS(0)
      setMarche('en_cours')
    },
    pause() {
      dejaEcouleS.current += (Date.now() - departMs.current) / 1000
      setMarche('en_pause')
    },
    reprendre() {
      preparerSon()
      departMs.current = Date.now()
      setMarche('en_cours')
    },
  }
}
