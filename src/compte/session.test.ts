import { beforeEach, describe, expect, it, vi } from 'vitest'

// Faux client : aucun appel réseau dans les tests.
const auth = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('./client.ts', () => ({ supabase: { auth }, comptesDisponibles: true }))

import { codeValide, emailValide, envoyerCode, messageErreur, nettoyerCode, seDeconnecter, verifierCode } from './session.ts'

describe('emailValide', () => {
  it('accepte une adresse correcte, espaces autour compris', () => {
    expect(emailValide('a@b.fr')).toBe(true)
    expect(emailValide(' a@b.fr ')).toBe(true)
  })
  it('refuse le reste', () => {
    expect(emailValide('a@b')).toBe(false)
    expect(emailValide('ab.fr')).toBe(false)
    expect(emailValide('')).toBe(false)
  })
})

describe('code', () => {
  it('nettoie la saisie', () => {
    expect(nettoyerCode('123 456')).toBe('123456')
    expect(nettoyerCode(' 12-34 56\n')).toBe('123456')
  })
  it('valide 6 à 10 chiffres', () => {
    expect(codeValide('123456')).toBe(true)
    expect(codeValide('12345')).toBe(false)
    expect(codeValide('12345a')).toBe(false)
  })
})

describe('messageErreur', () => {
  it('réseau absent', () => {
    expect(messageErreur(new TypeError('Failed to fetch'))).toMatch(/réseau/)
  })
  it('code faux ou expiré', () => {
    expect(messageErreur(new Error('Token has expired or is invalid'))).toMatch(/code/)
  })
  it('trop de demandes', () => {
    expect(messageErreur(new Error('email rate limit exceeded'))).toMatch(/minute/)
  })
  it('autre erreur', () => {
    expect(messageErreur(new Error('boom'))).toBe('La connexion a échoué. Réessaie dans un instant.')
  })
  it('adresse non invitée, quelle que soit la formulation du serveur', () => {
    const attendu = 'Cette adresse n’est pas sur la liste d’invités. Demande à Arthur de l’ajouter.'
    expect(messageErreur(new Error('Database error saving new user'))).toBe(attendu)
    expect(messageErreur(new Error('Adresse non invitée'))).toBe(attendu)
    expect(messageErreur(new Error('Signups not allowed for otp'))).toBe(attendu)
  })
})

describe('appels au service', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('envoie le code en créant le compte si besoin', async () => {
    auth.signInWithOtp.mockResolvedValue({ error: null })
    await envoyerCode(' a@b.fr ')
    expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: 'a@b.fr', options: { shouldCreateUser: true } })
  })
  it('traduit l’erreur de la liste d’invités', async () => {
    auth.signInWithOtp.mockResolvedValue({ error: new Error('Database error saving new user') })
    await expect(envoyerCode('a@b.fr')).rejects.toThrow('liste d’invités')
  })
  it('vérifie le code nettoyé', async () => {
    auth.verifyOtp.mockResolvedValue({ error: null })
    await verifierCode('a@b.fr', '123 456')
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'a@b.fr', token: '123456', type: 'email' })
  })
  it('traduit un code faux', async () => {
    auth.verifyOtp.mockResolvedValue({ error: new Error('Token has expired or is invalid') })
    await expect(verifierCode('a@b.fr', '123456')).rejects.toThrow('code')
  })
  it('traduit une coupure réseau', async () => {
    auth.signInWithOtp.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(envoyerCode('a@b.fr')).rejects.toThrow('réseau')
  })
  it('se déconnecte', async () => {
    auth.signOut.mockResolvedValue({ error: null })
    await seDeconnecter()
    expect(auth.signOut).toHaveBeenCalled()
  })
})
