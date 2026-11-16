// Écran d'accueil : la séance du jour et le choix « seul » ou « en groupe ».
// Les données ci-dessous sont un exemple fixe ; elles viendront du programme au lot 4.
const EXEMPLE = {
  date: 'Lundi 17 novembre',
  durete: 'séance dure',
  nom: 'Doigts et bloc limite',
  contexte: 'Bloc de 4 semaines « force des doigts », semaine 2.',
  semaine: [
    { jour: 'Lun', seance: 'Doigts', actif: true },
    { jour: 'Mar', seance: 'Technique', actif: false },
    { jour: 'Jeu', seance: 'Pan', actif: false },
    { jour: 'Sam', seance: 'Voies', actif: false },
  ],
}

export function Aujourdhui({ onEssayerChrono }: { onEssayerChrono: () => void }) {
  return (
    <main className="ecran">
      <div className="pile">
        <p className="surtitre">{EXEMPLE.date} · {EXEMPLE.durete}</p>
        <h1 className="titre">{EXEMPLE.nom}</h1>
        <p className="texte-2">{EXEMPLE.contexte}</p>
      </div>

      <div className="pile">
        <button className="bouton principal">
          <strong>Je grimpe seul</strong>
          <span>Séance guidée, 1 h 45</span>
        </button>
        <button className="bouton">
          <strong>Je grimpe en groupe</strong>
          <span>2 objectifs, 1 h 30</span>
        </button>
      </div>

      <div>
        <button className="ligne"><span>Forme du jour</span><span>À renseigner</span></button>
        <button className="ligne"><span>Assiette du jour</span><span>Plus de féculents</span></button>
        {/* Ligne provisoire pour tester le chrono, retirée quand la séance guidée existera. */}
        <button className="ligne" onClick={onEssayerChrono}><span>Essayer le chrono</span><span>Échelles 3-6-9</span></button>
      </div>

      <div className="pile">
        <p className="surtitre">Cette semaine</p>
        <div className="semaine">
          {EXEMPLE.semaine.map((j) => (
            <div key={j.jour} className={j.actif ? 'jour actif' : 'jour'}>
              <small>{j.jour}</small>
              <b>{j.seance}</b>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
