// Signaux du chrono : bips, vibrations et écran qui reste allumé.
// Tout est facultatif : si le téléphone ne sait pas faire, on continue sans.

let audio: AudioContext | null = null

/** À appeler lors d'un appui de l'utilisateur : les navigateurs refusent le son sinon. */
export function preparerSon() {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume()
  } catch {
    audio = null
  }
}

export function bip(frequenceHz: number, dureeMs: number) {
  if (!audio) return
  const oscillateur = audio.createOscillator()
  const volume = audio.createGain()
  oscillateur.frequency.value = frequenceHz
  volume.gain.value = 0.25
  oscillateur.connect(volume).connect(audio.destination)
  oscillateur.start()
  oscillateur.stop(audio.currentTime + dureeMs / 1000)
}

export function vibrer(motifMs: number | number[]) {
  try {
    navigator.vibrate?.(motifMs)
  } catch {
    // pas de vibreur : rien à faire
  }
}

export const signal = {
  decompte: () => bip(660, 90), // 3, 2, 1
  debutEffort: () => { bip(990, 350); vibrer(250) },
  debutRepos: () => { bip(440, 350); vibrer([120, 80, 120]) },
  fin: () => { bip(990, 700); vibrer([200, 100, 200, 100, 400]) },
}

/** Empêche l'écran de s'éteindre. Renvoie une fonction pour relâcher. */
export function garderEcranAllume(): () => void {
  let verrou: WakeLockSentinel | null = null
  let actif = true

  const demander = async () => {
    try {
      if (actif && document.visibilityState === 'visible') {
        verrou = await navigator.wakeLock?.request('screen')
      }
    } catch {
      // refusé (batterie faible, navigateur ancien) : le chrono reste juste, l'écran peut s'éteindre
    }
  }
  // Le verrou est perdu quand on quitte l'app : on le redemande au retour.
  document.addEventListener('visibilitychange', demander)
  void demander()

  return () => {
    actif = false
    document.removeEventListener('visibilitychange', demander)
    void verrou?.release()
  }
}
