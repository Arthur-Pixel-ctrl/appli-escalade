import { Component, type ReactNode } from 'react'
import { Erreur } from './ecrans/Erreur.tsx'

// Si un écran plante, React efface tout et laisse un écran noir.
// Ce composant attrape le plantage et affiche à la place un message avec un bouton pour recharger.
export class FiletDeSecurite extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null }

  static getDerivedStateFromError(e: unknown) {
    return { message: e instanceof Error ? `${e.name} : ${e.message}` : String(e) }
  }

  render() {
    return this.state.message ? <Erreur message={this.state.message} /> : this.props.children
  }
}
