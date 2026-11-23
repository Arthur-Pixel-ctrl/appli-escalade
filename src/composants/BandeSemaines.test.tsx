import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BandeSemaines } from './BandeSemaines.tsx'

describe('BandeSemaines', () => {
  const semaines = [
    { numero: 3, type: 'charge' as const, faite: true },
    { numero: 4, type: 'allegee' as const, faite: false },
  ]
  it('donne à chaque case un bouton au nom clair, avec la semaine allégée', () => {
    const html = renderToStaticMarkup(<BandeSemaines semaines={semaines} numeroEnCours={4} onChoisir={() => {}} />)
    expect(html).toContain('aria-label="Semaine 3, faite"')
    expect(html).toContain('aria-label="Semaine 4, allégée, en cours"')
    expect(html).toContain('aria-current="date"')
    expect(html.match(/<button/g)).toHaveLength(2)
  })
})
