// La rubrique ouverte (ordinateur) est gardée dans l'adresse, pour qu'un rechargement revienne au même écran.
// Elle vit dans la partie après « # » (#rubrique=Plan) et non dans « ? » : la Bibliothèque réécrit
// tout le « ? » à chaque filtre (elle y garde ses filtres) et effacerait la rubrique.
import { RUBRIQUES_BUREAU, type RubriqueBureau } from './navigation.ts'

const CLE = 'rubrique'

/** La rubrique écrite dans l'adresse ; `null` si elle manque ou si elle est inconnue (on retombe sur le Tableau de bord). */
export function rubriqueDepuisAdresse(hash: string): RubriqueBureau | null {
  const valeur = new URLSearchParams(hash.replace(/^#/, '')).get(CLE)
  return RUBRIQUES_BUREAU.find((r) => r === valeur) ?? null
}

/** Le « # » à écrire pour cette rubrique, en gardant les autres paramètres du « # » (s'il y en a). */
export function hashAvecRubrique(hash: string, rubrique: RubriqueBureau): string {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  params.set(CLE, rubrique)
  return `#${params.toString()}`
}
