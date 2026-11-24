// Réglages d'une fiche : les dire en français, et les ajuster dans des bornes prudentes.
// Des fonctions pures : le panneau (FicheDetail) ne fait que les afficher.
import type { ConfigChrono } from '../../chrono/sequence.ts'
import type { Forme } from './types.ts'

// ——— Dire les réglages ———

/** « 45 s », « 3 min », « 2 min 30 ». */
export function dureeCourte(s: number): string {
  if (s < 60) return `${s} s`
  const minutes = Math.floor(s / 60)
  const reste = s % 60
  return reste === 0 ? `${minutes} min` : `${minutes} min ${String(reste).padStart(2, '0')}`
}

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

/** « 3, 6 puis 9 s » ; une seule durée : « 10 s ». */
function listeDurees(dureesS: number[]): string {
  if (dureesS.length === 1) return dureeCourte(dureesS[0])
  const debut = dureesS.slice(0, -1).join(', ')
  return `${debut} puis ${dureesS[dureesS.length - 1]} s`
}

/** Une ligne de chasse fixe par gabarit, séparée par « · » : « 9 échelles de 3, 6 puis 9 s · créneau de 45 s · 6 s entre deux suspensions ». */
export function decrireReglages(c: ConfigChrono): string {
  const reposSeries = c.reposSeriesS > 0 ? `${dureeCourte(c.reposSeriesS)} de repos entre deux séries` : undefined
  switch (c.gabarit) {
    case 'repetition_unique':
      return [
        c.series === 1 ? `1 effort de ${dureeCourte(c.effortS)}` : `${pluriel(c.series, 'série')} d’un effort de ${dureeCourte(c.effortS)}`,
        reposSeries,
      ].filter(Boolean).join(' · ')
    case 'depart_minute':
      return [
        `${pluriel(c.series, 'série')} de ${pluriel(c.repetitions, 'départ')}`,
        `${dureeCourte(c.effortS)} d’effort ${c.creneauS === 60 ? 'toutes les minutes' : `toutes les ${dureeCourte(c.creneauS)}`}`,
        reposSeries,
      ].filter(Boolean).join(' · ')
    case 'intermittent':
      return [
        `${pluriel(c.series, 'série')} de ${pluriel(c.repetitions, 'répétition')}`,
        `${dureeCourte(c.effortS)} d’effort, ${dureeCourte(c.reposRepetitionsS)} de repos`,
        reposSeries,
      ].filter(Boolean).join(' · ')
    case 'echelle':
      return [
        `${pluriel(c.series, 'échelle')} de ${listeDurees(c.dureesS)}`,
        `créneau de ${dureeCourte(c.creneauS)}`,
        c.reposEntrePaliersS !== undefined ? `${dureeCourte(c.reposEntrePaliersS)} entre deux suspensions` : undefined,
        c.reposSeriesS > 0 ? `${dureeCourte(c.reposSeriesS)} de repos entre deux échelles` : undefined,
      ].filter(Boolean).join(' · ')
  }
}

/** Les réglages d'une fiche, quelle que soit sa forme (chrono, liste à cocher, essais comptés). */
export function decrireForme(f: Forme): string {
  if (f.forme === 'chrono') return decrireReglages(f.config)
  if (f.forme === 'liste') return `${pluriel(f.elements.length, 'élément')} à cocher, dans l’ordre`
  const parties = [`${dureeCourte(f.reposS)} de repos après chaque essai`]
  if (f.essaisParSerie !== undefined && f.reposSeriesS !== undefined) {
    parties.push(`${dureeCourte(f.reposSeriesS)} de repos tous les ${f.essaisParSerie} essais`)
  }
  return parties.join(' · ')
}

// ——— Ajuster dans des bornes prudentes ———
// Règle de prudence : on peut faire MOINS de séries que la fiche, jamais plus ;
// on peut se reposer PLUS entre deux séries, jamais moins. L'effort lui-même ne se règle pas.

export interface Borne { min: number; max: number; pas: number }

export interface BornesReglages {
  series?: Borne // absent : la fiche n'a qu'une série, rien à régler
  reposSeriesS?: Borne // absent : pas de repos entre séries dans cette fiche
}

export interface DemandeReglages { series?: number; reposSeriesS?: number }

const PAS_REPOS_S = 15
const REPOS_MAX_S = 900 // 15 min : au-delà, ce n'est plus un repos de séance

/** Les bornes d'une fiche, calculées depuis ses propres valeurs (la fiche reste la référence). */
export function bornesReglages(c: ConfigChrono): BornesReglages {
  const bornes: BornesReglages = {}
  if (c.series > 1) bornes.series = { min: 1, max: c.series, pas: 1 }
  if (c.series > 1 && c.reposSeriesS > 0) {
    // Le double de la fiche, arrondi au pas, sans dépasser le plafond (ni descendre sous la valeur de la fiche).
    const double = Math.ceil((c.reposSeriesS * 2) / PAS_REPOS_S) * PAS_REPOS_S
    bornes.reposSeriesS = { min: c.reposSeriesS, max: Math.max(c.reposSeriesS, Math.min(double, REPOS_MAX_S)), pas: PAS_REPOS_S }
  }
  return bornes
}

function dansLaBorne(valeur: number | undefined, defaut: number, b: Borne | undefined): number {
  if (b === undefined || valeur === undefined || !Number.isFinite(valeur)) return defaut
  const alignee = b.min + Math.round((valeur - b.min) / b.pas) * b.pas
  return Math.min(b.max, Math.max(b.min, alignee))
}

/** Applique une demande de réglage : toute valeur hors bornes (ou absurde) est ramenée dans les bornes, sans jamais lever d'erreur. */
export function appliquerReglages(c: ConfigChrono, demande: DemandeReglages): ConfigChrono {
  const bornes = bornesReglages(c)
  return {
    ...c,
    series: dansLaBorne(demande.series, c.series, bornes.series),
    reposSeriesS: dansLaBorne(demande.reposSeriesS, c.reposSeriesS, bornes.reposSeriesS),
  }
}

/** Vrai si la demande ne change rien à la fiche : sert à afficher « Valeurs de la fiche ». */
export function estCeluiDeLaFiche(c: ConfigChrono, demande: DemandeReglages): boolean {
  const r = appliquerReglages(c, demande)
  return r.series === c.series && r.reposSeriesS === c.reposSeriesS
}
