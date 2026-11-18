// Écran provisoire pour les onglets pas encore construits.
export function EnConstruction({ titre, texte = 'Cet écran arrive dans un prochain lot.' }: { titre: string; texte?: string }) {
  return (
    <main className="ecran">
      <div className="pile">
        <p className="surtitre">En construction</p>
        <h1 className="titre">{titre}</h1>
        <p className="texte-2">{texte}</p>
      </div>
    </main>
  )
}
