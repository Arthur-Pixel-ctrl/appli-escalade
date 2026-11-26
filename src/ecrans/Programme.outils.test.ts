import { describe, expect, it } from 'vitest'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES, EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import { PROFIL_VIDE } from '../donnees/profil.ts'
import { seanceTypeParId } from '../donnees/seancesTypes.ts'
import type { SeancePlanifiee } from '../donnees/modele.ts'
import { seanceDepuisType } from '../regles/passerelles.ts'
import type { DonneesVerifJour } from './Aujourdhui.outils.ts'
import { avertissementsAutourDe, joursDeLaSemaineOuverte, mentionSemaine } from './Programme.outils.ts'

describe('semaine ouverte', () => {
  const seances = [EXEMPLE_SEANCE_PLANIFIEE, { ...EXEMPLE_SEANCE_PLANIFIEE, id: 'jeu', date: '2026-11-19' }]
  it('7 jours à partir du lundi, les séances rangées par date avec leur statut', () => {
    const jours = joursDeLaSemaineOuverte(EXEMPLE_CYCLE, EXEMPLE_PHASES, seances, [], 1, '2026-11-18')
    expect(jours.map((j) => j.date)).toEqual(['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'])
    expect(jours[1].lignes.map((l) => l.statut)).toEqual(['manquee'])
    expect(jours[3].lignes.map((l) => l.statut)).toEqual(['a_venir'])
    expect(jours[0].lignes).toEqual([])
  })
  it('la mention dit la phase, l’accent et la semaine allégée', () => {
    expect(mentionSemaine(EXEMPLE_PHASES, 2)).toBe('Phase 1 · doigts')
    expect(mentionSemaine(EXEMPLE_PHASES, 4)).toBe('Phase 1 · doigts · semaine allégée')
    expect(mentionSemaine(EXEMPLE_PHASES, 5)).toBe('Phase 2 · puissance')
  })
})

describe('avertissementsAutourDe (W-01 porté par la voisine)', () => {
  const PROFIL_COMPLET = {
    ...PROFIL_VIDE, niveauBloc: '7B', anneesPratique: 8, experiencePoutre: 'reguliere', tractionsStrictes: 20,
    tient15sSur25mm: true, majeur: true, grimpeEnTete: true, lieux: ['salle_bloc', 'salle_voie', 'maison'], seancesParSemaine: 3,
  } satisfies Parameters<typeof avertissementsAutourDe>[0]['profil']
  const MAINTENANT = '2026-11-16T08:00:00.000Z'
  const creer = (id: string, type: string, date: string): SeancePlanifiee =>
    seanceDepuisType(seanceTypeParId(type)!, undefined, {
      id, cycleId: EXEMPLE_CYCLE.id, phaseId: EXEMPLE_PHASES[0].id, semaine: 1, date, maintenant: MAINTENANT,
    })
  const donnees = (seances: SeancePlanifiee[]): DonneesVerifJour => ({
    cycle: EXEMPLE_CYCLE, phases: EXEMPLE_PHASES, seances, objectifs: [], profil: PROFIL_COMPLET,
    exercicesPerso: [], douleurs: [], formes: [], realisees: [], aujourdhui: '2026-11-16', maintenant: MAINTENANT,
  })
  const w01 = (d: DonneesVerifJour, s: SeancePlanifiee) => avertissementsAutourDe(d, s).filter((a) => a.avertissement.code === 'W-01')

  const mardi = creer('mardi', 'ST-DOI-02', '2026-11-17')
  const jeudi = creer('jeudi', 'ST-TRA-02', '2026-11-19')

  it('avant le déplacement, aucun W-01', () => {
    const d = donnees([mardi, jeudi])
    expect(w01(d, mardi)).toEqual([])
    expect(w01(d, jeudi)).toEqual([])
  })
  it('après le déplacement du jeudi au mercredi, les deux séances voient le W-01', () => {
    const mercredi = { ...jeudi, date: '2026-11-18' }
    const d = donnees([mardi, mercredi])
    const surMercredi = w01(d, mercredi)
    expect(surMercredi.length).toBeGreaterThan(0)
    expect(surMercredi[0].avertissement.seanceId).toBe('jeudi')
    expect(surMercredi[0].avertissement.seanceLieeId).toBe('mardi')
    // La séance d'avant voit le même avertissement, porté par sa voisine.
    expect(w01(d, mardi).map((a) => a.avertissement.seanceId)).toEqual(['jeudi'])
  })
})
