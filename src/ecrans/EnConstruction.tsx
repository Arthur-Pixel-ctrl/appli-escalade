// Écran provisoire pour les onglets pas encore construits.
export function EnConstruction({ titre }: { titre: string }) {
  return (
    <main className="ecran">
      <div className="pile">
        <h1 className="titre">{titre}</h1>
        <p className="texte-2">Cet écran arrive dans un prochain lot.</p>
      </div>
    </main>
  )
}
