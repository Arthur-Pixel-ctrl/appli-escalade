import type { Protocole } from './types.ts'
import { DOIGTS } from './doigts.ts'
import { TRACTION_GAINAGE } from './traction-gainage.ts'
import { PUISSANCE } from './puissance.ts'
import { RESISTANCE } from './resistance.ts'
import { ENDURANCE } from './endurance.ts'
import { TECHNIQUE } from './technique.ts'
import { MENTAL } from './mental.ts'
import { ANTAGONISTES } from './antagonistes.ts'
import { MOBILITE } from './mobilite.ts'
import { ECHAUFFEMENT } from './echauffement.ts'

// Toute la bibliothèque en une seule liste : les cinq qualités physiques d’abord,
// puis les volets transversaux.
export const BIBLIOTHEQUE: Protocole[] = [
  ...DOIGTS,
  ...TRACTION_GAINAGE,
  ...PUISSANCE,
  ...RESISTANCE,
  ...ENDURANCE,
  ...TECHNIQUE,
  ...MENTAL,
  ...ANTAGONISTES,
  ...MOBILITE,
  ...ECHAUFFEMENT,
]

/** Retrouve un protocole par son identifiant ; undefined s’il n’existe pas. */
export function protocoleParId(id: string): Protocole | undefined {
  return BIBLIOTHEQUE.find((p) => p.id === id)
}
