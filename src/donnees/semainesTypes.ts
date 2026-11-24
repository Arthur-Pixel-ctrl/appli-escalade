// Les semaines types du générateur : pour chaque accent de phase et chaque nombre de séances,
// une « case » par jour, dans l'ordre de préférence. Le générateur (G-03) pioche dedans.
// Source : docs/specs/niveaux-de-detail.md, § 2.4 (tableau des choix) ; séances de seances-types.md, C.3.
// Rien n'est calculé ici : seulement des données.

import type { AccentPhase } from './modele.ts'
import type { JourSemaine } from './profil.ts'

/** Une séance type possible pour un jour, avec sa variante éventuelle (« entretien », « lestee »…). */
export interface ChoixSeance {
  seanceTypeId: string
  variante?: string
}

/** Une case : la première séance disponible de la liste est prise (« a | b » dans la spec). */
type Case = ChoixSeance[]

// Petit raccourci pour garder le tableau lisible.
const ch = (seanceTypeId: string, variante?: string): ChoixSeance =>
  variante === undefined ? { seanceTypeId } : { seanceTypeId, variante }

/** Les jours conseillés selon le nombre de séances (A.3.4 à A.3.7). */
export const JOURS_CONSEILLES: Record<2 | 3 | 4 | 5, JourSemaine[]> = {
  2: ['mardi', 'samedi'],
  3: ['mardi', 'jeudi', 'samedi'],
  4: ['lundi', 'mardi', 'jeudi', 'samedi'],
  5: ['lundi', 'mardi', 'jeudi', 'vendredi', 'samedi'],
}

/** Le vendredi à 5 séances : une séance hors grimpe, jamais une séance dure. */
export const CASE_HORS_GRIMPE: Case = [ch('ST-HOR-01')]

/** Séance de repli par rôle, quand une case ne peut pas être remplie. */
export const SECOURS: Record<'N' | 'C' | 'L' | 'H', string[]> = {
  N: ['ST-TRA-01', 'ST-END-02'],
  C: ['ST-RES-01', 'ST-END-02', 'ST-END-01'],
  L: ['ST-END-01', 'ST-END-05'],
  H: ['ST-HOR-01'],
}

/** La séance d'un grimpeur de voie le dernier jour, à la place de la séance habituelle. */
export const DERNIERE_SEANCE_VOIE: ChoixSeance = ch('ST-END-03')

// Recopié du tableau de niveaux-de-detail.md § 2.4. À 2 séances, le samedi peut porter une séance
// nerveuse (rôle N) : mardi et samedi sont espacés de 4 jours (décision du gérant, 24/11).
export const SEMAINES_TYPES: Record<AccentPhase, Record<2 | 3 | 4, Case[]>> = {
  doigts: {
    2: [[ch('ST-DOI-02'), ch('ST-DOI-01')], [ch('ST-PUI-04'), ch('ST-END-02')]],
    3: [[ch('ST-DOI-02'), ch('ST-DOI-01')], [ch('ST-TRA-02'), ch('ST-TRA-01')], [ch('ST-END-02')]],
    4: [[ch('ST-DOI-02'), ch('ST-DOI-01')], [ch('ST-TEC-01')], [ch('ST-PUI-02'), ch('ST-PUI-01')], [ch('ST-END-02')]],
  },
  traction_gainage: {
    2: [[ch('ST-TRA-02'), ch('ST-TRA-01')], [ch('ST-PUI-04'), ch('ST-END-02')]],
    3: [[ch('ST-TRA-02'), ch('ST-TRA-01')], [ch('ST-TRA-03'), ch('ST-TRA-01')], [ch('ST-END-02')]],
    4: [[ch('ST-TRA-02'), ch('ST-TRA-01')], [ch('ST-TEC-01')], [ch('ST-TRA-03'), ch('ST-TRA-01')], [ch('ST-END-02')]],
  },
  puissance: {
    2: [[ch('ST-PUI-02', 'poutre_entretien'), ch('ST-PUI-02'), ch('ST-PUI-01')], [ch('ST-TRA-02'), ch('ST-TRA-01')]],
    3: [[ch('ST-PUI-02', 'poutre_entretien'), ch('ST-PUI-02'), ch('ST-PUI-01')], [ch('ST-TRA-02'), ch('ST-TRA-01')], [ch('ST-END-02')]],
    4: [
      [ch('ST-PUI-03'), ch('ST-PUI-01')],
      [ch('ST-END-01')],
      [ch('ST-PUI-02', 'poutre_entretien'), ch('ST-PUI-02'), ch('ST-TRA-02')],
      [ch('ST-RES-01')],
    ],
  },
  resistance: {
    2: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01'), ch('ST-PUI-01')], [ch('ST-RES-01')]],
    3: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01'), ch('ST-PUI-01')], [ch('ST-RES-01')], [ch('ST-RES-03'), ch('ST-RES-02')]],
    4: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01')], [ch('ST-TEC-01')], [ch('ST-RES-02')], [ch('ST-RES-01')]],
  },
  endurance: {
    2: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01'), ch('ST-PUI-01')], [ch('ST-END-02')]],
    3: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01'), ch('ST-PUI-01')], [ch('ST-END-02')], [ch('ST-END-01')]],
    4: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01')], [ch('ST-END-01')], [ch('ST-TRA-01')], [ch('ST-END-02')]],
  },
  technique: {
    2: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01')], [ch('ST-TEC-01')]],
    3: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01')], [ch('ST-TEC-01')], [ch('ST-END-01')]],
    4: [[ch('ST-DOI-02', 'entretien'), ch('ST-DOI-01')], [ch('ST-TEC-01')], [ch('ST-TRA-01')], [ch('ST-END-01')]],
  },
}

/** Les cases d'une semaine type pour un accent et un nombre de séances (5 : les 4 cases plus le vendredi hors grimpe). */
export function semaineType(accent: AccentPhase, n: 2 | 3 | 4 | 5): Case[] {
  const copie = (cases: Case[]): Case[] => cases.map((cas) => cas.map((c) => ({ ...c })))
  if (n === 5) {
    const quatre = copie(SEMAINES_TYPES[accent][4])
    return [...quatre.slice(0, 3), copie([CASE_HORS_GRIMPE])[0], ...quatre.slice(3)]
  }
  return copie(SEMAINES_TYPES[accent][n])
}

/**
 * Accents de départ selon l'expérience et la discipline (A.2).
 * Moins d'un an de pratique : on commence par la force des tractions et l'endurance.
 */
export function accentsDeDepart(p: { anneesPratique: number; disciplinePrincipale: 'bloc' | 'voie' }): [AccentPhase, AccentPhase, AccentPhase] {
  if (p.anneesPratique < 1) return ['traction_gainage', 'endurance', 'puissance']
  if (p.disciplinePrincipale === 'voie') return ['doigts', 'endurance', 'resistance']
  return ['doigts', 'puissance', 'resistance']
}
