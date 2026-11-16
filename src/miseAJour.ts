import { registerSW } from 'virtual:pwa-register'

// Mise à jour de l'app installée.
// Le téléphone garde l'app en mémoire pour fonctionner hors ligne ; il faut donc aller chercher
// les nouvelles versions, puis laisser l'utilisateur choisir le moment de les appliquer.

let prevenir: (() => void) | null = null
let disponible = false

const appliquer = registerSW({
  onNeedRefresh() {
    disponible = true
    prevenir?.()
  },
  onRegisteredSW(_adresse, enregistrement) {
    if (!enregistrement) return
    // On vérifie à chaque retour dans l'app, et une fois par heure si elle reste ouverte.
    const verifier = () => { if (navigator.onLine) void enregistrement.update() }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') verifier() })
    setInterval(verifier, 60 * 60 * 1000)
  },
})

/** Appelle `rappel` dès qu'une nouvelle version est prête. */
export function surMiseAJourDisponible(rappel: () => void) {
  prevenir = rappel
  if (disponible) rappel()
}

/** Installe la nouvelle version et recharge l'app. */
export function appliquerMiseAJour() {
  let recharge = false
  const recharger = () => { if (!recharge) { recharge = true; window.location.reload() } }
  // Dès que la nouvelle version a pris la main, on recharge la page pour l'afficher.
  navigator.serviceWorker?.addEventListener('controllerchange', recharger)
  void appliquer(true)
  // Filet de sécurité si le téléphone ne signale pas le changement.
  setTimeout(recharger, 4000)
}
