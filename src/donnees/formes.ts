// Forme du jour (décision B10, architecture § 3.2) : une seule forme par jour.
// Aucune lecture de `src/regles/` ici : le moteur lit les formes par `contexteVerif`.
import { avecReprise, base } from './base.ts'
import type { DateISO, FormeDuJour } from './modele.ts'
import { ecrire, lireUn } from './stockage.ts'

export function lireForme(date: DateISO): Promise<FormeDuJour | undefined> {
  return lireUn<FormeDuJour>('formes', date)
}

/**
 * L'identifiant est la date : saisir deux fois le même jour (même sur deux appareils) remplace la forme.
 * `ecrire` garde le `creeLe` du premier enregistrement.
 */
export function enregistrerForme(f: Omit<FormeDuJour, 'id' | 'versionFormat' | 'creeLe' | 'modifieLe'>): Promise<void> {
  return ecrire('formes', { ...f, id: f.date } as FormeDuJour)
}

/** Les formes dont la date est comprise entre `debut` et `fin` (incluses), sans les supprimées. */
export async function lireFormesEntre(debut: DateISO, fin: DateISO): Promise<FormeDuJour[]> {
  const trouvees = await avecReprise(() => base.formes.where('date').between(debut, fin, true, true).toArray())
  return trouvees.filter((f) => !f.supprimeLe)
}

/** Le texte de la ligne « Forme du jour » une fois renseignée. */
export function resumeForme(nbRouges: number): string {
  if (nbRouges === 0) return 'Aucun voyant au rouge'
  return nbRouges === 1 ? '1 voyant au rouge' : `${nbRouges} voyants au rouge`
}
