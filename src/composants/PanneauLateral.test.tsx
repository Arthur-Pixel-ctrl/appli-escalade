import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PanneauLateral } from './PanneauLateral.tsx'

describe('PanneauLateral', () => {
  const html = renderToStaticMarkup(<PanneauLateral idTitre="t1" onFermer={() => {}} pied={<button>Action</button>}><h2 id="t1">Titre</h2></PanneauLateral>)
  it('annonce son titre et offre une croix « Fermer »', () => {
    expect(html).toContain('aria-labelledby="t1"')
    expect(html).toContain('aria-label="Fermer"')
  })
  it('garde le pied d’actions hors du défilement', () => {
    expect(html).toContain('panneau-pied')
    expect(html).not.toContain('inert')
  })
  it('rend le panneau inerte quand une superposition est posée dessus', () => {
    const avec = renderToStaticMarkup(<PanneauLateral idTitre="t1" onFermer={() => {}} superposition={<p>Aperçu</p>}><h2 id="t1">Titre</h2></PanneauLateral>)
    expect(avec).toContain('inert')
    expect(avec).toContain('Aperçu')
  })
})
