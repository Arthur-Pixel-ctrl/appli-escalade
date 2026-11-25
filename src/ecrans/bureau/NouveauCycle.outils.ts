// Fonctions pures de la fenêtre « Nouveau cycle » et du bandeau « Plan proposé » (D-25).
// Rien ici ne lit ni n'écrit en base : Plan.tsx s'en charge.
import type { AccentPhase, Profil } from '../../donnees/modele.ts'
import type { JourSemaine, LieuEntrainement } from '../../donnees/profil.ts'
import { accentsDeDepart } from '../../donnees/semainesTypes.ts'
import type { PlanGenere } from '../../regles/generateur.ts'

const NOMS_JOURS: Record<JourSemaine, string> = {
  lundi: 'lundi', mardi: 'mardi', mercredi: 'mercredi', jeudi: 'jeudi', vendredi: 'vendredi', samedi: 'samedi', dimanche: 'dimanche',
}
const ORDRE_JOURS: JourSemaine[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const NOMS_LIEUX: Record<LieuEntrainement, string> = {
  salle_bloc: 'salle de bloc', salle_voie: 'salle avec des voies', maison: 'maison',
}

/** Les accents présélectionnés : ceux de départ selon le profil (A.2). Sans profil, on suppose un débutant en bloc. */
export function accentsPreselectionnes(profil: Pick<Profil, 'anneesPratique' | 'disciplinePrincipale'> | null): [AccentPhase, AccentPhase, AccentPhase] {
  return accentsDeDepart(profil ?? { anneesPratique: 0, disciplinePrincipale: 'bloc' })
}

/** Rappel des jours du profil, dans l'ordre de la semaine. Vide = pas renseigné : le générateur les compte tous libres. */
export function rappelJours(jours: JourSemaine[]): string {
  if (jours.length === 0) return 'Jours disponibles : pas renseignés, tous les jours comptent comme libres.'
  return `Jours disponibles : ${ORDRE_JOURS.filter((j) => jours.includes(j)).map((j) => NOMS_JOURS[j]).join(', ')}.`
}

/** Rappel des lieux du profil. Vide = pas renseigné : compte comme salle de bloc (même règle que le moteur). */
export function rappelLieux(lieux: LieuEntrainement[]): string {
  if (lieux.length === 0) return 'Lieux : pas renseignés, compte comme salle de bloc.'
  return `Lieux : ${lieux.map((l) => NOMS_LIEUX[l]).join(', ')}.`
}

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`

/** Phrase du bandeau en tête de la vue 12 semaines après « Proposer un plan ». Rien n'est caché : tous les avertissements sont comptés. */
export function phraseBandeauPlanPropose(plan: Pick<PlanGenere, 'seances' | 'avertissements'>): string {
  const forts = plan.avertissements.filter((a) => a.niveau === 'fort').length
  const infos = plan.avertissements.length - forts
  return `Plan proposé : ${pluriel(plan.seances.length, 'séance', 'séances')}. `
    + `${pluriel(forts, 'avertissement fort', 'avertissements forts')}, ${pluriel(infos, 'information', 'informations')}, à voir semaine par semaine.`
}
