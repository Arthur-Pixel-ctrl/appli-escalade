import { useEffect, useState } from 'react'
import { garderEcranAllume, preparerSon, signal } from './signaux.ts'

/** Petit minuteur de repos : on le lance, il décompte, il sonne à la fin. */
export function useRepos(dureeS: number) {
  const [finMs, setFinMs] = useState<number | null>(null)
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const enCours = finMs !== null
  const resteS = finMs === null ? 0 : Math.max(0, Math.ceil((finMs - maintenant) / 1000))

  useEffect(() => {
    if (finMs === null) return
    const relacherEcran = garderEcranAllume()
    const minuteur = setInterval(() => setMaintenant(Date.now()), 250)
    return () => { clearInterval(minuteur); relacherEcran() }
  }, [finMs])

  useEffect(() => {
    if (finMs !== null && resteS === 0) { signal.fin(); setFinMs(null) }
  }, [finMs, resteS])

  return {
    enCours,
    resteS,
    texte: enCours ? `${Math.floor(resteS / 60)}:${String(resteS % 60).padStart(2, '0')}` : `${Math.round(dureeS / 60)} min`,
    lancer() { preparerSon(); setMaintenant(Date.now()); setFinMs(Date.now() + dureeS * 1000) },
    arreter() { setFinMs(null) },
  }
}
