import { describe, expect, it } from 'vitest'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES, EXEMPLE_SEANCE_PLANIFIEE } from '../../donnees/exemplesV2.ts'
import type { SeanceRealisee } from '../../donnees/modele.ts'
import { fichesDeLaBibliotheque } from '../../regles/index.ts'
import {
  casesDeLaBande, contenuDeLaSeance, etatTableau, prochaineSeance, semaineAffichee, seancesDeLaSemaine,
} from './TableauDeBord.outils.ts'

// Le cycle d'exemple commence le lundi 16/11/2026 et finit le dimanche 07/02/2027.
const seance = EXEMPLE_SEANCE_PLANIFIEE // 17/11, phase 1, semaine 1
const faite = { id: 'r1', seancePlanifieeId: seance.id } as SeanceRealisee

describe('etatTableau', () => {
  it('distingue aucun cycle, en cours et terminé', () => {
    expect(etatTableau(undefined, '2026-11-25')).toBe('aucun')
    expect(etatTableau(EXEMPLE_CYCLE, '2026-11-25')).toBe('en_cours')
    expect(etatTableau(EXEMPLE_CYCLE, '2027-02-07')).toBe('en_cours')
    expect(etatTableau(EXEMPLE_CYCLE, '2027-02-08')).toBe('termine')
    expect(etatTableau({ ...EXEMPLE_CYCLE, abandonneLe: '2026-12-01' }, '2027-03-01')).toBe('en_cours')
  })
})

describe('semaineAffichee', () => {
  it('donne la semaine du jour, ou la semaine 1 avant le début', () => {
    expect(semaineAffichee(EXEMPLE_CYCLE, '2026-12-16')).toMatchObject({ numero: 5, phase: 2, semaine: 1, commence: true })
    expect(semaineAffichee(EXEMPLE_CYCLE, '2026-11-01')).toMatchObject({ numero: 1, commence: false })
  })
})

describe('casesDeLaBande', () => {
  it('marque faite une semaine entièrement passée', () => {
    const cases = casesDeLaBande(EXEMPLE_CYCLE, EXEMPLE_PHASES, '2026-11-25')
    expect(cases).toHaveLength(12)
    expect(cases[0]?.faite).toBe(true)
    expect(cases[1]?.faite).toBe(false)
  })
})

describe('seances et statuts', () => {
  it('range les séances de la semaine avec leur statut', () => {
    expect(seancesDeLaSemaine(1, EXEMPLE_PHASES, [seance], [], '2026-11-25')[0]?.statut).toBe('manquee')
    expect(seancesDeLaSemaine(1, EXEMPLE_PHASES, [seance], [faite], '2026-11-25')[0]?.statut).toBe('faite')
    expect(seancesDeLaSemaine(2, EXEMPLE_PHASES, [seance], [], '2026-11-25')).toEqual([])
  })
  it('la prochaine séance ignore le passé, le fait et le sauté', () => {
    expect(prochaineSeance([seance], [], '2026-11-17')?.id).toBe(seance.id)
    expect(prochaineSeance([seance], [], '2026-11-18')).toBeUndefined()
    expect(prochaineSeance([seance], [faite], '2026-11-17')).toBeUndefined()
    expect(prochaineSeance([{ ...seance, sauteeLe: '2026-11-16T10:00:00.000Z' }], [], '2026-11-16')).toBeUndefined()
  })
})

describe('contenuDeLaSeance (niveau affiché, R-9)', () => {
  const fiches = fichesDeLaBibliotheque()
  it('détaillé : les étapes', () => {
    const c = contenuDeLaSeance(seance, { niveauDetail: 'detaille' }, fiches)
    expect(c.niveau).toBe('detaille')
    expect(c.niveau === 'detaille' && c.lignes.length).toBe(seance.solo.etapes.length)
  })
  it('grandes lignes : des parties calculées depuis les étapes', () => {
    const c = contenuDeLaSeance(seance, { niveauDetail: 'grandes_lignes' }, fiches)
    expect(c.niveau).toBe('grandes_lignes')
    expect(c.niveau === 'grandes_lignes' && c.parties.length).toBeGreaterThan(0)
  })
  it('simple : une recommandation, sans toucher aux étapes', () => {
    const c = contenuDeLaSeance(seance, { niveauDetail: 'simple' }, fiches)
    expect(c.niveau).toBe('simple')
    expect(c.niveau === 'simple' && c.recommandation.length).toBeGreaterThan(0)
    expect(seance.solo.etapes.length).toBeGreaterThan(0)
  })
})
