// Écran provisoire pour les onglets pas encore construits.
// L'onglet Profil donne déjà accès aux mises en garde.
export function EnConstruction({ titre, onMisesEnGarde }: { titre: string; onMisesEnGarde?: () => void }) {
  return (
    <main className="ecran">
      <div className="pile">
        <h1 className="titre">{titre}</h1>
        <p className="texte-2">Cet écran arrive dans un prochain lot.</p>
      </div>
      {onMisesEnGarde && (
        <div>
          <button className="ligne" onClick={onMisesEnGarde}><span>Mises en garde</span><span>Les douleurs à repérer</span></button>
        </div>
      )}
    </main>
  )
}
