import { describe, expect, it } from 'vitest'
import { curseurAvecMarge, decider, depuisLigne, versLigne } from './fusion.ts'

describe('decider', () => {
  const local = { modifieLe: '2026-11-18T10:00:00.000Z' }
  it('prend le distant si le local n’existe pas', () => {
    expect(decider(undefined, local)).toBe('prendre_distant')
  })
  it('prend le distant s’il est plus récent', () => {
    expect(decider(local, { modifieLe: '2026-11-18T10:00:01.000Z' })).toBe('prendre_distant')
  })
  it('garde le local si le distant est plus ancien', () => {
    expect(decider(local, { modifieLe: '2026-11-18T09:59:59.000Z' })).toBe('garder_local')
  })
  it('garde le local à égalité, même si les formats de date diffèrent', () => {
    expect(decider(local, { modifieLe: '2026-11-18T10:00:00.000Z' })).toBe('garder_local')
    expect(decider(local, { modifieLe: '2026-11-18T10:00:00+00:00' })).toBe('garder_local')
  })
})

describe('versLigne', () => {
  it('n’envoie pas aEnvoyer et recopie les dates', () => {
    const ligne = versLigne('u1', 'salles', { id: 's1', nom: 'Salle', modifieLe: '2026-11-18T10:00:00.000Z', aEnvoyer: 1 })
    expect(ligne.contenu).not.toHaveProperty('aEnvoyer')
    expect(ligne).toMatchObject({ user_id: 'u1', type: 'salles', id: 's1', modifie_le: '2026-11-18T10:00:00.000Z', supprime_le: null })
    expect(ligne.contenu.nom).toBe('Salle')
  })
  it('recopie supprimeLe', () => {
    const ligne = versLigne('u1', 'formes', {
      id: 'f1', modifieLe: '2026-11-18T10:00:00.000Z', supprimeLe: '2026-11-18T10:00:00.000Z', aEnvoyer: 1,
    })
    expect(ligne.supprime_le).toBe('2026-11-18T10:00:00.000Z')
  })
})

describe('depuisLigne', () => {
  it('met aEnvoyer à 0', () => {
    const doc = depuisLigne({ type: 'salles', id: 's1', contenu: { id: 's1', nom: 'X', modifieLe: '2026-11-18T10:00:00.000Z' }, recu_le: '2026-11-18T10:00:05+00:00' })
    expect(doc.aEnvoyer).toBe(0)
    expect(doc.nom).toBe('X')
  })
})

describe('curseurAvecMarge', () => {
  it('renvoie null sans curseur', () => {
    expect(curseurAvecMarge(null)).toBeNull()
  })
  it('retire 60 secondes par défaut, au format du serveur ou non', () => {
    expect(curseurAvecMarge('2026-11-18T10:01:00.000Z')).toBe('2026-11-18T10:00:00.000Z')
    expect(curseurAvecMarge('2026-11-18T10:01:00.123456+00:00', 30)).toBe('2026-11-18T10:00:30.123Z')
  })
})
