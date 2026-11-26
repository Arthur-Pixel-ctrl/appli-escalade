import { describe, expect, it } from 'vitest'
import { EXEMPLE_CYCLE, EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import { protocoleParId } from '../donnees/bibliotheque/index.ts'
import type { DouleurDeclaree, FormeDuJour, SeancePlanifiee, SeanceRealisee } from '../donnees/modele.ts'
import { PROFIL_VIDE } from '../donnees/profil.ts'
import { etapeDepuisProtocole } from '../regles/index.ts'
import { controlesDuJour } from './controlesDuJour.ts'

const AUJOURDHUI = '2026-11-17'
const MAINTENANT = '2026-11-17T08:00:00.000Z'
const entrees = (extra: Partial<Parameters<typeof controlesDuJour>[0]> = {}): Parameters<typeof controlesDuJour>[0] => ({
  profil: { ...PROFIL_VIDE, anneesPratique: 4, experiencePoutre: 'occasionnelle', tractionsStrictes: 12, tient15sSur25mm: true, majeur: true, grimpeEnTete: false },
  exercicesPerso: [], douleurs: [], formes: [], objectifs: [], aujourdhui: AUJOURDHUI, maintenant: MAINTENANT, ...extra,
})
const forme = (extra: Partial<FormeDuJour> = {}): FormeDuJour => ({
  id: AUJOURDHUI, versionFormat: 1, creeLe: 'x', modifieLe: 'x', date: AUJOURDHUI,
  sommeil: 4, fatigue: 4, courbatures: 4, douleur: 4, peau: 4, ...extra,
})
const douleur = (date: string, zone: DouleurDeclaree['zone']): DouleurDeclaree => ({
  id: 'd-' + zone, versionFormat: 1, creeLe: 'x', modifieLe: 'x', date, zone, niveau: 'reduction', signes: [],
})
const duJour = (seance: SeancePlanifiee = EXEMPLE_SEANCE_PLANIFIEE) => ({ seance, cycle: EXEMPLE_CYCLE })
const codes = (r: ReturnType<typeof controlesDuJour>) => r.map((c) => c.avertissement.code)

describe('controlesDuJour', () => {
  it('J-01 : deux voyants au rouge et séance dure, en information', () => {
    const r = controlesDuJour(entrees({ formes: [forme({ sommeil: 2, fatigue: 2 })] }), [], duJour())
    const j01 = r.find((c) => c.avertissement.code === 'J-01')
    expect(j01?.forme).toBe('information')
    expect(j01?.avertissement.message).toBe('Deux voyants sont au rouge ce matin. Fais plutôt la version légère, ou une séance technique.')
  })

  it('pas de J-01 pour une séance légère', () => {
    const legere: SeancePlanifiee = { ...EXEMPLE_SEANCE_PLANIFIEE, solo: { ...EXEMPLE_SEANCE_PLANIFIEE.solo, durete: 'legere' }, groupe: null }
    const r = controlesDuJour(entrees({ formes: [forme({ sommeil: 2, fatigue: 2 })] }), [], duJour(legere))
    expect(codes(r)).not.toContain('J-01')
  })

  it('J-03 : douleur signalée ce matin, séance dure', () => {
    const r = controlesDuJour(entrees({ formes: [forme({ douleur: 1 })] }), [], duJour())
    expect(codes(r)).toContain('J-03')
  })

  it('J-05 sans séance du jour : signal d’arrêt après 14 jours, rien à 13 jours', () => {
    const r = controlesDuJour(entrees({ douleurs: [douleur('2026-11-03', 'coude')] }), [])
    expect(r).toHaveLength(1)
    expect(r[0].forme).toBe('arret')
    expect(r[0].avertissement.message).toBe("Ta douleur (coude) dure depuis 14 jours. Consulte un médecin ou un kiné qui connaît l'escalade.")
    expect(controlesDuJour(entrees({ douleurs: [douleur('2026-11-04', 'coude')] }), [])).toEqual([])
  })

  it('ordre : arrêt (S-04, S-06), puis avertissement (J-04), puis information (J-01)', () => {
    const protocole = protocoleParId('puissance-bloc-limite')!
    const seance: SeancePlanifiee = {
      ...EXEMPLE_SEANCE_PLANIFIEE, groupe: null,
      solo: { nom: 'Bloc limite', durete: 'dure', etapes: [etapeDepuisProtocole(protocole, 'e1')] },
    }
    const realisee: SeanceRealisee = {
      id: 'r1', versionFormat: 1, creeLe: '2026-11-16T20:00:00.000Z', modifieLe: 'x', date: '2026-11-16', mode: 'solo', nom: 'Hier',
      durete: 'dure', dureeMin: 60, effortPercu: 8, peau: 3, douleur: false, etapes: [], objectifs: [], blocs: [],
      marqueurs: ['maximale'],
    } as SeanceRealisee
    const e = entrees({
      // Douleur déclarée au coude, du jour (décision G2) : S-06 s'ajoute à S-04.
      douleurs: [douleur(AUJOURDHUI, 'coude')],
      formes: [forme({ sommeil: 2, fatigue: 2 })],
    })
    const r = controlesDuJour(e, [realisee], duJour(seance))
    const attendu = codes(r).filter((c) => ['S-04', 'S-06', 'J-04', 'J-01'].includes(c))
    expect(attendu).toEqual(['S-04', 'S-06', 'J-04', 'J-01'])
    expect(r.find((c) => c.avertissement.code === 'S-04')?.forme).toBe('arret')
    expect(r.find((c) => c.avertissement.code === 'S-06')?.forme).toBe('arret')
    expect(r.find((c) => c.avertissement.code === 'J-04')?.forme).toBe('avertissement')
  })
})
