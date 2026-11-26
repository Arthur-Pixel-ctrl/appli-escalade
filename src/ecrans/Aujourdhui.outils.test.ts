import { describe, expect, it } from 'vitest'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES, EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import type { SeancePlanifiee, SeanceRealisee } from '../donnees/modele.ts'
import {
  dateDuPlanConnu, joursDeLaSemaine, mentionPhase, peutLancerGroupe, peutLancerSolo, prochaineAVenir, seanceManquee,
  sousTitreGroupe, sousTitreSolo, vueDuJour,
} from './Aujourdhui.outils.ts'

// Semaine du lundi 2026-11-16 au dimanche 2026-11-22 (semaine 1 de la phase 1).
const seance = (id: string, date: string, extra: Partial<SeancePlanifiee> = {}): SeancePlanifiee =>
  ({ ...EXEMPLE_SEANCE_PLANIFIEE, id, date, ...extra })
const realisee = (seancePlanifieeId: string, extra: Partial<SeanceRealisee> = {}): SeanceRealisee => ({
  id: `r-${seancePlanifieeId}`, versionFormat: 1, creeLe: 'x', modifieLe: 'x', date: '2026-11-17', mode: 'solo', nom: 'Séance',
  durete: 'dure', dureeMin: 60, effortPercu: 7, peau: 3, douleur: false, etapes: [], objectifs: [], blocs: [], seancePlanifieeId, ...extra,
})

describe('vueDuJour', () => {
  const lundi = seance('lun', '2026-11-16')
  const mardi = seance('mar', '2026-11-17')
  it('une séance à faire aujourd’hui', () => {
    expect(vueDuJour([lundi, mardi], [], '2026-11-17')).toMatchObject({ type: 'seance', seance: { id: 'mar' } })
  })
  it('une séance déjà faite', () => {
    expect(vueDuJour([mardi], [realisee('mar')], '2026-11-17')).toMatchObject({ type: 'faite', realisee: { id: 'r-mar' } })
  })
  it('un jour sans séance : repos', () => {
    expect(vueDuJour([lundi, mardi], [], '2026-11-18')).toEqual({ type: 'repos', sautee: false })
  })
  it('une séance sautée aujourd’hui : repos, et on le dit', () => {
    expect(vueDuJour([seance('s', '2026-11-18', { sauteeLe: 'x' })], [], '2026-11-18')).toEqual({ type: 'repos', sautee: true })
  })
})

describe('séance manquée (pas de rattrapage)', () => {
  it('la séance de lundi, vue le mardi', () => {
    expect(seanceManquee([seance('lun', '2026-11-16')], [], '2026-11-17')).toMatchObject({ jour: 'lundi', seance: { id: 'lun' } })
  })
  it('rien si elle est faite, sautée, ou vieille de plus d’une semaine', () => {
    expect(seanceManquee([seance('lun', '2026-11-16')], [realisee('lun')], '2026-11-17')).toBeUndefined()
    expect(seanceManquee([seance('lun', '2026-11-16', { sauteeLe: 'x' })], [], '2026-11-17')).toBeUndefined()
    expect(seanceManquee([seance('lun', '2026-11-16')], [], '2026-11-30')).toBeUndefined()
  })
})

describe('la semaine et la suite', () => {
  const seances = [seance('lun', '2026-11-16'), seance('mar', '2026-11-17'), seance('jeu', '2026-11-19'), seance('sam', '2026-11-21', { sauteeLe: 'x' })]
  const faites = [realisee('lun')]
  it('7 cases, du lundi au dimanche, avec leur état', () => {
    const cases = joursDeLaSemaine(seances, faites, '2026-11-17')
    expect(cases).toHaveLength(7)
    expect(cases.map((c) => c.etat)).toEqual(['fait', 'aujourdhui', 'repos', 'prevu', 'repos', 'saute', 'repos'])
    expect(cases[1].libelle).toBe('Mardi, aujourd’hui')
    expect(cases[5].libelle).toContain('sautée')
  })
  it('une séance manquée a sa propre case', () => {
    expect(joursDeLaSemaine(seances, [], '2026-11-18')[0].etat).toBe('manque')
  })
  it('la prochaine séance est après aujourd’hui, ni faite ni sautée', () => {
    expect(prochaineAVenir(seances, faites, '2026-11-17')?.id).toBe('jeu')
    expect(prochaineAVenir(seances, faites, '2026-11-20')).toBeUndefined()
  })
})

describe('mention de phase', () => {
  it('« Phase 1 · doigts · semaine 2 sur 4 »', () => {
    expect(mentionPhase(EXEMPLE_CYCLE, EXEMPLE_PHASES, '2026-11-24')).toEqual({ phase: 'Phase 1 · doigts · semaine 2 sur 4', type: null })
  })
  it('semaine allégée', () => {
    expect(mentionPhase(EXEMPLE_CYCLE, EXEMPLE_PHASES, '2026-12-08')).toEqual({ phase: 'Phase 1 · doigts · semaine 4 sur 4', type: 'SEMAINE ALLÉGÉE' })
  })
  it('hors du cycle : rien', () => {
    expect(mentionPhase(EXEMPLE_CYCLE, EXEMPLE_PHASES, '2026-11-01')).toBeNull()
  })
})

describe('boutons de lancement', () => {
  it('sous-titres par niveau', () => {
    expect(sousTitreSolo('detaille')).toBe('Séance guidée, chrono intégré')
    expect(sousTitreSolo('grandes_lignes')).toBe('Grandes lignes, chrono libre')
    expect(sousTitreSolo('simple')).toBe('Recommandation, chrono libre')
  })
  it('sous-titre du groupe, avec ou sans durée annoncée', () => {
    expect(sousTitreGroupe({ objectifs: [{}, {}] as never, dureeMin: 90 })).toBe('2 objectifs, 1 h 30')
    expect(sousTitreGroupe({ objectifs: [{}] as never })).toBe('1 objectif')
  })
  it('le bouton solo existe sans étapes ; le groupe seulement avec une version groupe', () => {
    const vide = seance('v', '2026-11-17', { solo: { ...EXEMPLE_SEANCE_PLANIFIEE.solo, etapes: [] }, groupe: null })
    expect(peutLancerSolo(vide)).toBe(true)
    expect(peutLancerGroupe(vide)).toBe(false)
    expect(peutLancerSolo(EXEMPLE_SEANCE_PLANIFIEE)).toBe(true)
    expect(peutLancerGroupe(EXEMPLE_SEANCE_PLANIFIEE)).toBe(true)
  })
})

it('la date du plan connu est la dernière modification', () => {
  expect(dateDuPlanConnu(EXEMPLE_CYCLE, [seance('a', '2026-11-17', { modifieLe: '2026-12-01T10:00:00.000Z' })])).toBe('2026-12-01T10:00:00.000Z')
})
