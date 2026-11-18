import { describe, expect, it } from 'vitest'
import { configurationValide } from './client.ts'

describe('configurationValide', () => {
  it('refuse une configuration absente', () => {
    expect(configurationValide(undefined, 'sb_publishable_abc')).toBe(false)
    expect(configurationValide('https://x.supabase.co', undefined)).toBe(false)
  })

  it('refuse une clé secrète', () => {
    expect(configurationValide('https://x.supabase.co', 'sb_secret_abc')).toBe(false)
  })

  it('refuse une adresse non sécurisée', () => {
    expect(configurationValide('http://x.supabase.co', 'sb_publishable_abc')).toBe(false)
  })

  it('accepte une adresse https avec la clé publiable', () => {
    expect(configurationValide('https://x.supabase.co', 'sb_publishable_abc')).toBe(true)
  })
})
