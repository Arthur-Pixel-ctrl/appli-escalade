import { describe, expect, it } from 'vitest'
import { EXEMPLE_CYCLE, EXEMPLE_PHASES, EXEMPLE_SEANCE_PLANIFIEE } from './exemplesV2.ts'
import { LIVRES, QUALITES_PHYSIQUES } from './modele.ts'
import { PROFIL_VIDE, ZONES, completerProfil } from './profil.ts'

describe('modèle v2', () => {
  it('une séance planifiée ne contient que des données (aller-retour JSON identique)', () => {
    expect(JSON.parse(JSON.stringify(EXEMPLE_SEANCE_PLANIFIEE))).toEqual(EXEMPLE_SEANCE_PLANIFIEE)
  })

  it('la séance d’exemple n’a ni marqueurs ni avertissements vus (calculés ou portés par le cycle)', () => {
    expect(EXEMPLE_SEANCE_PLANIFIEE.solo).not.toHaveProperty('marqueurs')
    expect(EXEMPLE_SEANCE_PLANIFIEE).not.toHaveProperty('avertissementsVus')
    expect(EXEMPLE_SEANCE_PLANIFIEE.phaseId).toBe(EXEMPLE_PHASES[0].id)
  })

  it('complète un ancien profil : les quatre prérequis à null, le prénom gardé', () => {
    const p = completerProfil({ prenom: 'Léa' })
    expect(p.prenom).toBe('Léa')
    expect(p.tractionsStrictes).toBeNull()
    expect(p.tient15sSur25mm).toBeNull()
    expect(p.majeur).toBeNull()
    expect(p.grimpeEnTete).toBeNull()
  })

  it('complète un profil vide : jours disponibles vides, repère de traction « aucun »', () => {
    const p = completerProfil({})
    expect(p.joursDisponibles).toEqual([])
    expect(p.repereTraction).toBe('aucun')
    expect(p).toEqual(PROFIL_VIDE)
  })

  it('completerProfil ignore les champs étrangers au profil', () => {
    const p = completerProfil({ prenom: 'Léa', ...({ id: 'profil', modifieLe: 'x' } as object) })
    expect(p).not.toHaveProperty('id')
    expect(p).not.toHaveProperty('modifieLe')
  })

  it('chaque phase d’exemple a 4 semaines, la quatrième allégée à 50 %', () => {
    expect(EXEMPLE_PHASES).toHaveLength(3)
    for (const phase of EXEMPLE_PHASES) {
      expect(phase.semaines).toHaveLength(4)
      expect(phase.semaines[3]).toEqual({ numero: 4, type: 'allegee', reductionPct: 50 })
    }
  })

  it('le cycle d’exemple commence un lundi, sur 12 semaines', () => {
    expect(new Date(`${EXEMPLE_CYCLE.debut}T12:00:00Z`).getUTCDay()).toBe(1)
    expect(EXEMPLE_CYCLE.nbSemaines).toBe(12)
    expect(EXEMPLE_CYCLE.avertissementsGardes).toEqual([])
  })

  it('il y a 5 qualités physiques, 4 livres et le choix « Autre » dans les douleurs', () => {
    expect(QUALITES_PHYSIQUES).toHaveLength(5)
    expect(Object.keys(LIVRES)).toHaveLength(4)
    expect(ZONES.at(-1)).toEqual({ valeur: 'autre', nom: 'Autre' })
  })
})
