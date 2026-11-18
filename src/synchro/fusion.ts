// Règles pures de la synchronisation : qui gagne, et comment passer d'un document local à une ligne du serveur.
// Pourquoi à part : ces fonctions ne touchent ni la base ni le réseau, donc elles se testent sans rien préparer.
import type { TableSynchronisee } from '../donnees/stockage.ts'
import type { LigneEnvoyee, LigneRecue } from './synchro.ts'

export type Decision = 'prendre_distant' | 'garder_local'

/**
 * La version la plus récente gagne, entière. À égalité, on garde la locale (rien à faire).
 * On compare avec `Date.parse` : les dates du serveur n'ont pas toujours le même format que les nôtres.
 */
export function decider(local: { modifieLe: string } | undefined, distant: { modifieLe: string }): Decision {
  if (!local) return 'prendre_distant'
  return Date.parse(distant.modifieLe) > Date.parse(local.modifieLe) ? 'prendre_distant' : 'garder_local'
}

/** Prépare un document local pour le serveur : retire `aEnvoyer`, recopie `modifie_le` et `supprime_le`. */
export function versLigne(userId: string, table: TableSynchronisee, doc: Record<string, unknown>): LigneEnvoyee {
  // `aEnvoyer` n'a de sens que sur cet appareil : il ne part jamais au serveur.
  const { aEnvoyer: _aEnvoyer, ...contenu } = doc
  return {
    user_id: userId,
    type: table,
    id: String(doc.id),
    contenu,
    modifie_le: String(doc.modifieLe),
    supprime_le: typeof doc.supprimeLe === 'string' ? doc.supprimeLe : null,
  }
}

/** Document reçu → document local à jour (`aEnvoyer = 0` : il vient du serveur, rien à renvoyer). */
export function depuisLigne(ligne: LigneRecue): Record<string, unknown> {
  return { ...ligne.contenu, aEnvoyer: 0 }
}

/** Le curseur moins une marge, pour ne rien rater si deux écritures arrivent presque en même temps. */
export function curseurAvecMarge(curseur: string | null, margeS = 60): string | null {
  if (curseur === null) return null
  return new Date(Date.parse(curseur) - margeS * 1000).toISOString()
}
