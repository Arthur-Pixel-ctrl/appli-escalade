import { useCallback, useEffect, useRef, useState, type PointerEvent as EvenementPointeur } from 'react'
import { aDepasseLeSeuil, defilementAuBord, zonesSousLeDoigt } from './glisser.ts'

// Glisser-déposer aux événements de pointeur (souris, doigt, stylet) : l'API HTML de glisser-déposer ne marche pas au doigt.
// Le glisser démarre sur une poignée (`touch-action: none`) pour que le reste de la page continue de défiler au doigt.

export interface RappelsGlisser<C> {
  /** La charge peut-elle être déposée dans cette zone ? */
  estValable: (charge: C, zone: string) => boolean
  onDepot: (charge: C, zone: string) => void
  /** Échap, dépôt hors zone valable ou geste interrompu : rien n'a changé. */
  onAnnule: (charge: C, cause: 'echap' | 'hors-zone' | 'interrompu') => void
}

export interface EtatGlisser<C> {
  charge: C
  libelle: string
  x: number
  y: number
  /** La zone valable sous le pointeur, s'il y en a une. */
  zone: string | null
}

const CLASSE_CORPS = 'glisse-en-cours'

export function useGlisser<C>() {
  const [etat, setEtat] = useState<EtatGlisser<C> | null>(null)
  const arreter = useRef<(() => void) | null>(null)

  // Si l'écran disparaît au milieu d'un glisser, on retire les écouteurs et la classe du corps de page.
  useEffect(() => () => arreter.current?.(), [])

  const demarrer = useCallback((e: EvenementPointeur, charge: C, libelle: string, rappels: RappelsGlisser<C>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as Element).closest('button, input, select, textarea, a')) return
    arreter.current?.()
    // Évite la sélection de texte et le glisser d'image du navigateur à la souris.
    e.preventDefault()
    const depart = { x: e.clientX, y: e.clientY }
    const idPointeur = e.pointerId
    let enCours = false

    const finir = () => {
      window.removeEventListener('pointermove', bouger)
      window.removeEventListener('pointerup', lacher)
      window.removeEventListener('pointercancel', interrompre)
      window.removeEventListener('keydown', touche, true)
      document.body.classList.remove(CLASSE_CORPS)
      arreter.current = null
      setEtat(null)
    }
    const zoneValable = (x: number, y: number) => {
      // La première zone valable en remontant : un dépôt sur une étape peut compter pour sa séance.
      return zonesSousLeDoigt(document.elementFromPoint(x, y)).find((zone) => rappels.estValable(charge, zone)) ?? null
    }
    function bouger(ev: PointerEvent) {
      if (ev.pointerId !== idPointeur) return
      if (!enCours) {
        if (!aDepasseLeSeuil(ev.clientX - depart.x, ev.clientY - depart.y)) return
        enCours = true
        document.body.classList.add(CLASSE_CORPS)
      }
      const defile = defilementAuBord(ev.clientY, window.innerHeight)
      if (defile !== 0) window.scrollBy(0, defile)
      setEtat({ charge, libelle, x: ev.clientX, y: ev.clientY, zone: zoneValable(ev.clientX, ev.clientY) })
    }
    function lacher(ev: PointerEvent) {
      if (ev.pointerId !== idPointeur) return
      const zone = enCours ? zoneValable(ev.clientX, ev.clientY) : null
      const avaitGlisse = enCours
      finir()
      if (zone) rappels.onDepot(charge, zone)
      else if (avaitGlisse) rappels.onAnnule(charge, 'hors-zone')
    }
    function interrompre(ev: PointerEvent) {
      if (ev.pointerId !== idPointeur) return
      const avaitGlisse = enCours
      finir()
      if (avaitGlisse) rappels.onAnnule(charge, 'interrompu')
    }
    function touche(ev: KeyboardEvent) {
      if (ev.key !== 'Escape') return
      ev.preventDefault()
      ev.stopPropagation()
      const avaitGlisse = enCours
      finir()
      if (avaitGlisse) rappels.onAnnule(charge, 'echap')
    }

    window.addEventListener('pointermove', bouger)
    window.addEventListener('pointerup', lacher)
    window.addEventListener('pointercancel', interrompre)
    window.addEventListener('keydown', touche, true)
    arreter.current = finir
  }, [])

  return { etat, demarrer }
}
