import { describe, expect, it } from 'vitest'
import { EXEMPLE_SEANCE_PLANIFIEE } from '../donnees/exemplesV2.ts'
import type { BlocGrimpe } from '../moteur/types.ts'
import { toutesLesFiches } from '../regles/index.ts'
import {
  brouillonEnBref, brouillonGroupe, brouillonSolo, lancementDepuisPlan, lancementLibre, rappelBlocPour, SEANCE_LIBRE_SOLO,
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
  })
  it('solo sans étapes ni parties : il s’ouvre en bref, au niveau simple', () => {
    const sansEtapes = { ...prevue, solo: { ...prevue.solo, etapes: [] } }
    const l = lancementDepuisPlan(sansEtapes, 'solo', fiches)
    expect(l).toMatchObject({ mode: 'en_bref', niveau: 'simple' })
  })
})

describe('séance en bref', () => {
  const parties = [{ titre: 'Séance', dureeMin: 60, principal: { source: 'bibliotheque' as const, refId: 'traction-simple-4x5' } }]
  const ecrite = { ...prevue, niveauDetail: 'simple' as const, solo: { ...prevue.solo, etapes: [], parties } }
  it('séance simple écrite à la main : en_bref simple, avec le lien et ses marqueurs', () => {
    const l = lancementDepuisPlan(ecrite, 'solo', fiches)
    if (l?.mode !== 'en_bref') throw new Error('attendu : en_bref')
    expect(l.niveau).toBe('simple')
    expect(l.lien).toMatchObject({ seancePlanifieeId: prevue.id, qualite: 'doigts' })
    expect(Array.isArray(l.lien.marqueurs)).toBe(true)
  })
  it('sans niveau choisi, des parties et pas d’étapes : grandes lignes', () => {
    const sansNiveau = { ...ecrite, niveauDetail: undefined }
    expect(lancementDepuisPlan(sansNiveau, 'solo', fiches, {})).toMatchObject({ mode: 'en_bref', niveau: 'grandes_lignes' })
  })
  it('cycle en grandes lignes : l’exemple s’ouvre en bref, sans cycle il reste guidé', () => {
    expect(lancementDepuisPlan(prevue, 'solo', fiches, { niveauDetail: 'grandes_lignes' })).toMatchObject({ mode: 'en_bref', niveau: 'grandes_lignes' })
    expect(lancementDepuisPlan(prevue, 'solo', fiches)?.mode).toBe('solo')
  })
  it('le brouillon relie la séance prévue et garde les étapes données', () => {
    const l = lancementDepuisPlan(ecrite, 'solo', fiches)
    if (l?.mode !== 'en_bref') throw new Error('attendu : en_bref')
    const etapes = [{ titre: 'Séance', statut: 'faite' as const, refId: 'traction-simple-4x5' }]
    const brouillon = brouillonEnBref(l, etapes, 45, 'salle-mroc')
    expect(brouillon).toMatchObject({
      mode: 'solo', seancePlanifieeId: prevue.id, qualite: 'doigts', salleId: 'salle-mroc', dureeMin: 45, etapes, objectifs: [], blocs: [],
    })
    expect(brouillon.marqueurs).toEqual(l.lien.marqueurs)
  })
  it('le rappel du bloc : vrai pour une version avec bloc limite, faux pour une séance libre', () => {
    const bloc = { ...ecrite, solo: { ...ecrite.solo, parties: [{ titre: 'Bloc', dureeMin: 40, principal: { source: 'bibliotheque' as const, refId: 'puissance-bloc-limite' } }] } }
    const l = lancementDepuisPlan(bloc, 'solo', fiches)
    expect(l && rappelBlocPour(l)).toBe(true)
    expect(rappelBlocPour(lancementLibre('solo'))).toBe(false)
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
