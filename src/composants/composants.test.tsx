import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Icone } from './Icone.tsx'
import { PastillePrise } from './PastillePrise.tsx'
import { Avertissement } from './Avertissement.tsx'

describe('Icone', () => {
  it('est cachée aux lecteurs d’écran sans libellé', () => {
    expect(renderToStaticMarkup(<Icone nom="chrono" />)).toContain('aria-hidden="true"')
    expect(renderToStaticMarkup(<Icone nom="prise" />)).toContain('aria-hidden="true"')
  })
  it('porte un nom accessible avec libellé', () => {
    const html = renderToStaticMarkup(<Icone nom="arret" libelle="Arrêt" />)
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Arrêt"')
    expect(html).not.toContain('aria-hidden')
  })
})

describe('PastillePrise', () => {
  it('pose la couleur de la salle et reste décorative', () => {
    const html = renderToStaticMarkup(<PastillePrise couleur="#ff0000" nom="Rouge" />)
    expect(html).toContain('class="prise"')
    expect(html).toContain('aria-hidden="true"')
    expect(renderToStaticMarkup(<PastillePrise couleur="#fff" nom="x" taille="petite" />)).toContain('prise petite')
  })
})

describe('Avertissement', () => {
  it('utilise le bon rôle selon le niveau', () => {
    expect(renderToStaticMarkup(<Avertissement niveau="information" titre="t" />)).toContain('role="status"')
    const av = renderToStaticMarkup(<Avertissement niveau="avertissement" titre="t" />)
    expect(av).toContain('role="status"')
    expect(av).toContain('class="avertissement"')
    const ar = renderToStaticMarkup(<Avertissement niveau="arret" titre="t" />)
    expect(ar).toContain('role="alert"')
    expect(ar).toContain('signal-arret')
  })
  it('propose Pourquoi et la correction, sans bouton bloquant', () => {
    const html = renderToStaticMarkup(
      <Avertissement niveau="avertissement" titre="t" pourquoi="règle" correction={{ libelle: 'Décaler', action: () => {} }}>texte</Avertissement>,
    )
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('Décaler')
    expect(html).not.toContain('disabled')
    expect(html).not.toContain('règle') // replié par défaut
  })
})
