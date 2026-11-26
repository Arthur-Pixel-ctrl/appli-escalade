import { describe, expect, it } from 'vitest'
import { EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import type { BlocGrimpe } from '../moteur/types.ts'
import { toutesLesFiches } from '../regles/index.ts'
import {
  brouillonGroupe, brouillonSolo, lancementDepuisPlan, lancementLibre, SEANCE_LIBRE_SOLO,
} from './lancement.ts'

const fiches = toutesLesFiches([])
const prevue = EXEMPLE_SEANCE_PLANIFIEE

describe('séance lancée depuis le plan', () => {
  it('solo : le brouillon relie la séance prévue, sa qualité, sa salle et ses marqueurs', () => {
    const l = lancementDepuisPlan(prevue, 'solo', fiches)
    if (l?.mode !== 'solo') throw new Error('attendu : solo')
    const brouillon = brouillonSolo(l, prevue.solo.etapes.map(() => 'faite' as const), 62, 'salle-mroc')
    expect(brouillon).toMatchObject({
      mode: 'solo', nom: prevue.solo.nom, durete: 'dure', dureeMin: 62,
      seancePlanifieeId: prevue.id, qualite: 'doigts', salleId: 'salle-mroc',
    })
    expect(Array.isArray(brouillon.marqueurs)).toBe(true)
    expect(brouillon.etapes).toHaveLength(prevue.solo.etapes.length)
  })
  it('groupe : même lien, et les objectifs viennent de la version groupe', () => {
    const l = lancementDepuisPlan(prevue, 'groupe', fiches)
    if (l?.mode !== 'groupe') throw new Error('attendu : groupe')
    const blocs: BlocGrimpe[] = [{ couleur: 'Rouge', essais: 2, resultat: 'enchaine', objectif: 0 }]
    const brouillon = brouillonGroupe(l, blocs, 70, 'salle-mroc')
    expect(brouillon).toMatchObject({ mode: 'groupe', seancePlanifieeId: prevue.id, qualite: 'doigts' })
    expect(brouillon.objectifs.map((o) => o.libelle)).toEqual(prevue.groupe!.objectifs.map((o) => o.libelle))
    expect(brouillon.objectifs[0].fait).toBe(1)
  })
  it('une version qui n’existe pas ne se lance pas', () => {
    expect(lancementDepuisPlan({ ...prevue, groupe: null }, 'groupe', fiches)).toBeUndefined()
    expect(lancementDepuisPlan({ ...prevue, solo: { ...prevue.solo, etapes: [] } }, 'solo', fiches)).toBeUndefined()
  })
})

describe('séance libre', () => {
  it('solo : mode « libre », aucun lien avec le plan', () => {
    const l = lancementLibre('solo')
    if (l.mode !== 'solo') throw new Error('attendu : solo')
    const brouillon = brouillonSolo(l, SEANCE_LIBRE_SOLO.etapes.map(() => 'faite' as const), 40)
    expect(brouillon.mode).toBe('libre')
    expect(brouillon).not.toHaveProperty('seancePlanifieeId')
    expect(brouillon).not.toHaveProperty('marqueurs')
  })
  it('groupe sans objectif : on note seulement les blocs', () => {
    const l = lancementLibre('groupe')
    if (l.mode !== 'groupe') throw new Error('attendu : groupe')
    const brouillon = brouillonGroupe(l, [{ couleur: 'Bleu', essais: 1, resultat: 'flash', objectif: 0 }], 30)
    expect(brouillon).toMatchObject({ mode: 'groupe', objectifs: [] })
    expect(brouillon.blocs).toHaveLength(1)
    expect(brouillon).not.toHaveProperty('seancePlanifieeId')
  })
})
