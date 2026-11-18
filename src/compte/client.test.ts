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

  it('refuse une clé qui n’est pas publiable, dont l’ancienne clé service_role', () => {
    expect(configurationValide('https://x.supabase.co', 'eyJhbGciOiJIUzI1NiJ9.service_role.abc')).toBe(false)
    expect(configurationValide('https://x.supabase.co', 'abc')).toBe(false)
    expect(configurationValide('https://x.supabase.co', 'SB_PUBLISHABLE_abc')).toBe(false)
  })

  it('refuse une adresse non sécurisée', () => {
    expect(configurationValide('http://x.supabase.co', 'sb_publishable_abc')).toBe(false)
  })

  it('accepte une adresse https avec la clé publiable', () => {
    expect(configurationValide('https://x.supabase.co', 'sb_publishable_abc')).toBe(true)
  })
})
