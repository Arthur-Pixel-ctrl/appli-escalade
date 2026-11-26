// Lecture, pour les écrans du téléphone (Aujourd'hui, Programme), du plan en cours et de ce qui sert à le vérifier.
// Un seul chemin vers le plan : `lirePlanEnCours` (amendement 7 de D-22), jamais `lireSeancesEntre`.
import { useCallback, useEffect, useState } from 'react'
import type {
  Cycle, DateISO, DouleurDeclaree, ExercicePerso, FormeDuJour, ObjectifSpecifique, PhaseCycle, Reglages, SeancePlanifiee,
  SeanceRealisee,
} from '../donnees/modele.ts'
import { comptesDisponibles } from '../compte/client.ts'
import { useSession } from '../compte/session.ts'
import { lireExercicesPerso, lirePlanEnCours } from '../donnees/plan.ts'
import { lireEtat, lireTous, lireUn, surDonneesChangees, surEcriture } from '../donnees/stockage.ts'
import { surEtatSynchro, synchroEnCours } from '../synchro/automatique.ts'

export interface DonneesTelephone {
  plan: { cycle: Cycle; phases: PhaseCycle[]; seances: SeancePlanifiee[] } | null
  realisees: SeanceRealisee[]
  exercicesPerso: ExercicePerso[]
  douleurs: DouleurDeclaree[]
  formes: FormeDuJour[]
  objectifs: ObjectifSpecifique[]
  reglages: Reglages | undefined
}

async function lire(aujourdhui: DateISO): Promise<DonneesTelephone> {
  const plan = await lirePlanEnCours(aujourdhui)
  const [realisees, exercicesPerso, douleurs, formes, objectifs, reglages] = await Promise.all([
    lireTous<SeanceRealisee>('seancesRealisees'), lireExercicesPerso(), lireTous<DouleurDeclaree>('douleurs'),
    lireTous<FormeDuJour>('formes'), lireTous<ObjectifSpecifique>('objectifsSpecifiques'), lireUn<Reglages>('reglages', 'reglages'),
  ])
  const idsPhases = new Set(plan?.phases.map((p) => p.id))
  return { plan, realisees, exercicesPerso, douleurs, formes, objectifs: objectifs.filter((o) => idsPhases.has(o.phaseId)), reglages }
}

/** Les données du plan en cours ; `donnees` reste `undefined` pendant la première lecture. Relues après chaque écriture ou arrivée du serveur. */
export function useDonneesTelephone(aujourdhui: DateISO): { donnees: DonneesTelephone | undefined; echec: boolean } {
  const [donnees, setDonnees] = useState<DonneesTelephone | undefined>(undefined)
  const [echec, setEchec] = useState(false)
  const relire = useCallback(
    () => lire(aujourdhui).then((d) => { setDonnees(d); setEchec(false) }).catch(() => setEchec(true)),
    [aujourdhui],
  )
  useEffect(() => {
    void relire()
    const arrets = [surDonneesChangees(() => { void relire() }), surEcriture(() => { void relire() })]
    return () => arrets.forEach((arreter) => arreter())
  }, [relire])
  return { donnees, echec }
}

/** Vrai pendant qu'une synchronisation tourne : sans plan encore, l'écran dit « Ton plan arrive… ». */
export function useSynchroEnCours(): boolean {
  const [enCours, setEnCours] = useState(synchroEnCours())
  useEffect(() => surEtatSynchro(() => setEnCours(synchroEnCours())), [])
  return enCours
}

/** Vrai quand cet appareil est lié au compte connecté : seulement alors, les séances partent au serveur. */
export function useCompteLie(): boolean {
  const session = useSession()
  const [lie, setLie] = useState(false)
  useEffect(() => {
    if (!comptesDisponibles || !session.userId) return
    let actif = true
    lireEtat<string | null>('compteId').then((id) => { if (actif) setLie(id === session.userId) }).catch(() => {})
    return () => { actif = false }
  }, [session.userId])
  return comptesDisponibles && session.userId !== null && lie
}
