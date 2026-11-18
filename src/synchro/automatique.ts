// Synchronisation automatique : décide QUAND lancer `synchroniser`, jamais comment.
// Elle ne bloque jamais l'écran : tout se passe en arrière-plan, les erreurs sont déjà notées
// dans `etatSynchro` (derniereErreur) par `synchroniser`, on les avale donc ici.
import { surEcriture } from '../donnees/stockage.ts'

const DELAI_APRES_ECRITURE_MS = 3_000
const PERIODE_MS = 5 * 60_000

/** Regroupe des demandes rapprochées en un seul lancement, `delaiMs` après la dernière. */
export function regrouper(action: () => void, delaiMs: number): { demander(): void; arreter(): void } {
  let minuteur: ReturnType<typeof setTimeout> | null = null
  const arreter = () => {
    if (minuteur !== null) clearTimeout(minuteur)
    minuteur = null
  }
  return {
    demander() {
      arreter()
      minuteur = setTimeout(() => { minuteur = null; action() }, delaiMs)
    },
    arreter,
  }
}

// ——— Texte de l'indicateur ———

const deuxChiffres = (n: number) => String(n).padStart(2, '0')
const heureLocale = (d: Date) => `${d.getHours()} h ${deuxChiffres(d.getMinutes())}`
const debutDuJour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

/** « à l'instant », « il y a 5 min », « à 14 h 05 », « hier à 18 h 40 » (ou « le 3 nov. à 18 h 40 » au-delà). */
export function depuisQuand(iso: string, maintenant: Date): string {
  const date = new Date(iso)
  const minutes = Math.floor((maintenant.getTime() - date.getTime()) / 60_000)
  if (minutes < 1) return 'à l’instant' // inclut une petite avance de l'horloge
  if (minutes < 60) return `il y a ${minutes} min`
  const joursEcart = Math.round((debutDuJour(maintenant).getTime() - debutDuJour(date).getTime()) / 86_400_000)
  if (joursEcart <= 0) return `à ${heureLocale(date)}`
  if (joursEcart === 1) return `hier à ${heureLocale(date)}`
  return `le ${dateCourte.format(date)} à ${heureLocale(date)}`
}

/** La mention courte d'en-tête, par ordre de priorité : hors ligne, envoi, attente, à jour. */
export function etatSynchroCourt(e: { enLigne: boolean; enCours: boolean; enAttente: number }): string {
  if (!e.enLigne) return 'HORS LIGNE'
  if (e.enCours) return 'ENVOI EN COURS…'
  if (e.enAttente === 1) return '1 CHANGEMENT EN ATTENTE'
  if (e.enAttente > 1) return `${e.enAttente} CHANGEMENTS EN ATTENTE`
  return 'À JOUR'
}

// ——— Lancements ———

// Vrai pendant qu'un lancement tourne ; `changements` prévient les écrans qui affichent l'indicateur.
let lancementEnCours = false
let relanceDemandee = false
let lancerMaintenant: (() => Promise<void>) | null = null
const abonnesEtat = new Set<() => void>()
const abonnesLien = new Set<() => void>()

/** Vrai pendant qu'un lancement de `demarrerSynchroAutomatique` tourne. */
export function synchroEnCours(): boolean {
  return lancementEnCours
}

/** L'état de la synchro a changé (début ou fin d'un lancement) : à relire. Renvoie la fonction qui désabonne. */
export function surEtatSynchro(rappel: () => void): () => void {
  abonnesEtat.add(rappel)
  return () => { abonnesEtat.delete(rappel) }
}

/** L'appareil vient d'être lié à un compte : l'app peut (re)démarrer la synchro automatique. */
export function signalerCompteLie(): void {
  for (const rappel of [...abonnesLien]) rappel()
}
export function surCompteLie(rappel: () => void): () => void {
  abonnesLien.add(rappel)
  return () => { abonnesLien.delete(rappel) }
}

/**
 * Lance une synchro tout de suite si la synchro automatique tourne (sinon ne fait rien).
 * Ne renvoie jamais d'erreur : l'échec est noté dans `derniereErreur`.
 */
export function synchroniserMaintenant(): Promise<void> {
  return lancerMaintenant ? lancerMaintenant() : Promise.resolve()
}

function prevenirEtat() {
  for (const rappel of [...abonnesEtat]) rappel()
}

/**
 * Lance `lancer` : tout de suite, au retour du réseau, au retour au premier plan, 3 s après une écriture locale,
 * et toutes les 5 minutes tant que l'app est visible. Renvoie la fonction qui arrête tout.
 * Les erreurs sont avalées ici (elles sont déjà enregistrées dans etatSynchro par synchroniser).
 */
export function demarrerSynchroAutomatique(lancer: () => Promise<unknown>): () => void {
  let actif = true
  const aUneFenetre = typeof window !== 'undefined' && typeof document !== 'undefined'
  const enLigne = () => typeof navigator === 'undefined' || navigator.onLine !== false
  const visible = () => !aUneFenetre || document.visibilityState !== 'hidden'

  // Une seule synchro à la fois. Une demande arrivée pendant un lancement en prépare un seul de plus.
  const executer = async (): Promise<void> => {
    if (!actif || !enLigne()) return // hors ligne : on attend l'événement « online », sans boucle
    if (lancementEnCours) { relanceDemandee = true; return }
    lancementEnCours = true
    relanceDemandee = false
    prevenirEtat()
    let reussi = false
    try {
      await lancer()
      reussi = true
    } catch { /* déjà noté dans derniereErreur ; le prochain tour (5 min ou événement) réessaiera */ }
    lancementEnCours = false
    prevenirEtat()
    // Une écriture a eu lieu pendant l'envoi : on repart une fois, mais jamais en boucle après un échec.
    if (reussi && relanceDemandee && actif) { relanceDemandee = false; void executer() }
  }

  const apresEcriture = regrouper(() => { void executer() }, DELAI_APRES_ECRITURE_MS)
  const desabonnerEcriture = surEcriture(() => { if (actif) apresEcriture.demander() })

  const auRetourDuReseau = () => { void executer() }
  const auChangementDeVisibilite = () => { if (visible()) void executer() }
  let minuteur: ReturnType<typeof setInterval> | null = null
  if (aUneFenetre) {
    window.addEventListener('online', auRetourDuReseau)
    document.addEventListener('visibilitychange', auChangementDeVisibilite)
    minuteur = setInterval(() => { if (visible()) void executer() }, PERIODE_MS)
  }

  lancerMaintenant = executer
  void executer()

  return () => {
    actif = false
    apresEcriture.arreter()
    desabonnerEcriture()
    if (aUneFenetre) {
      window.removeEventListener('online', auRetourDuReseau)
      document.removeEventListener('visibilitychange', auChangementDeVisibilite)
    }
    if (minuteur !== null) clearInterval(minuteur)
    if (lancerMaintenant === executer) lancerMaintenant = null
    relanceDemandee = false
  }
}
