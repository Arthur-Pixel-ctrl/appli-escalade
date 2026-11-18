import { useEffect, useState } from 'react'
import { comptesDisponibles } from '../compte/client.ts'
import { useSession } from '../compte/session.ts'
import { useEnLigne } from '../compte/useEnLigne.ts'
import { Icone } from '../composants/Icone.tsx'
import { SEANCE_EXEMPLE } from '../donnees/seanceExemple.ts'
import { lireEtat, surDonneesChangees, surEcriture } from '../donnees/stockage.ts'
import { etatSynchroCourt, surEtatSynchro, synchroEnCours } from '../synchro/automatique.ts'
import { compterEnAttente } from '../synchro/synchro.ts'

// Données d'exemple : remplacé par le plan réel en D-22.
const EXEMPLE = {
  durete: 'Séance dure',
  phase: 'Phase 1 · doigts · semaine 2 sur 4',
  groupe: '2 objectifs, 1 h 30',
  // Jours de la semaine (0 = lundi) qui ont une séance prévue.
  seances: [
    { jour: 0, nom: 'doigts', durete: 'dure' },
    { jour: 1, nom: 'technique', durete: 'facile' },
    { jour: 3, nom: 'pan', durete: 'moyenne' },
    { jour: 5, nom: 'voies', durete: 'moyenne' },
  ],
}

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const INITIALES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

type EtatJour = 'fait' | 'aujourdhui' | 'prevu' | 'repos'

// 1 h 45 à partir de 105 minutes.
function formaterDuree(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

// Le bandeau « crée ton compte » masqué par le « × » le reste jusqu'à la fermeture de l'app (pas d'un onglet à l'autre).
let invitationMasquee = false

// La mention « À JOUR », « HORS LIGNE »… : seulement si l'appareil est lié à un compte (sinon rien n'est envoyé).
function useMentionSynchro(userId: string | null): string | null {
  const enLigne = useEnLigne()
  const [lie, setLie] = useState(false)
  const [enAttente, setEnAttente] = useState(0)
  const [enCours, setEnCours] = useState(synchroEnCours())
  useEffect(() => {
    if (!comptesDisponibles || !userId) return
    let actif = true
    const relire = () => {
      setEnCours(synchroEnCours())
      lireEtat<string | null>('compteId').then((id) => { if (actif) setLie(id === userId) }).catch(() => {})
      compterEnAttente().then((n) => { if (actif) setEnAttente(n) }).catch(() => {})
    }
    relire()
    const arrets = [surEtatSynchro(relire), surEcriture(relire), surDonneesChangees(relire)]
    return () => { actif = false; arrets.forEach((arreter) => arreter()) }
  }, [userId])
  if (!comptesDisponibles || !userId || !lie) return null
  return etatSynchroCourt({ enLigne, enCours, enAttente })
}

export function Aujourdhui({ grimpeSouventEnGroupe, onCompte, onSeanceSolo, onSeanceGroupe }: {
  grimpeSouventEnGroupe: boolean
  onCompte: () => void
  onSeanceSolo: () => void
  onSeanceGroupe: () => void
}) {
  const session = useSession()
  const mentionSynchro = useMentionSynchro(session.userId)
  const [invitationVisible, setInvitationVisible] = useState(!invitationMasquee)
  const afficherInvitation = comptesDisponibles && !session.chargement && session.userId === null && invitationVisible
  // Lue une seule fois à l'ouverture de l'écran.
  const [maintenant] = useState(() => new Date())
  const date = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(maintenant)
  const jourAujourdhui = (maintenant.getDay() + 6) % 7 // dimanche = 0 en JS, lundi = 0 chez nous

  const dureeTotale = SEANCE_EXEMPLE.etapes.reduce((somme, e) => somme + e.dureeMin, 0)

  // La séance du titre est celle d'aujourd'hui, quel que soit le jour réel (exemple fixe).
  const etatDuJour = (jour: number): EtatJour => {
    if (jour === jourAujourdhui) return 'aujourdhui'
    if (!EXEMPLE.seances.some((s) => s.jour === jour)) return 'repos'
    return jour < jourAujourdhui ? 'fait' : 'prevu'
  }
  const prochaine = EXEMPLE.seances.find((s) => s.jour > jourAujourdhui)

  const boutonSolo = (principal: boolean) => (
    <button className={principal ? 'bouton principal avec-icone' : 'bouton avec-icone'} onClick={onSeanceSolo}>
      <div className="bouton-libelles">
        <strong>Je grimpe seul</strong>
        <span>Séance guidée, chrono intégré</span>
      </div>
      <Icone nom={principal ? 'suivant' : 'solo'} taille={26} />
    </button>
  )
  const boutonGroupe = (principal: boolean) => (
    <button className={principal ? 'bouton principal avec-icone' : 'bouton avec-icone'} onClick={onSeanceGroupe}>
      <div className="bouton-libelles">
        <strong>Je grimpe en groupe</strong>
        <span>{EXEMPLE.groupe}</span>
      </div>
      <Icone nom={principal ? 'suivant' : 'groupe'} taille={26} />
    </button>
  )

  return (
    <main className="ecran" aria-labelledby="titre-jour">
      {afficherInvitation && (
        <div className="invitation-compte">
          <button className="invitation-texte" onClick={onCompte}>Crée ton compte pour retrouver ton plan sur ordinateur</button>
          <button className="invitation-fermer" aria-label="Masquer cette invitation" onClick={() => { invitationMasquee = true; setInvitationVisible(false) }}>×</button>
        </div>
      )}
      <div className="pile">
        <div className="ligne-date">
          <p className="mention">{majuscule(date)}</p>
          {mentionSynchro && <p className="mention" role="status" aria-live="polite">{mentionSynchro}</p>}
        </div>
        <p className="mention">{EXEMPLE.phase}</p>
        <h1 className="titre" id="titre-jour">{SEANCE_EXEMPLE.nom}</h1>
      </div>

      <article className="fiche" aria-label="Séance du jour">
        <span className="vis g" aria-hidden="true" />
        <span className="vis d" aria-hidden="true" />
        <div className="fiche-tete">
          <span className="etiquette">{EXEMPLE.durete}</span>
          <span className="donnee">{formaterDuree(dureeTotale)}</span>
        </div>
        <ol className="etapes-apercu">
          {SEANCE_EXEMPLE.etapes.map((etape, i) => (
            <li key={etape.id}>
              <span className="repere">{i + 1}</span>
              <span>{etape.titre}</span>
              <span className="donnee">{etape.dureeMin} min</span>
            </li>
          ))}
        </ol>
      </article>

      {/* Le mode habituel du profil est le bouton principal (le seul en résine). */}
      <div className="pile">
        {grimpeSouventEnGroupe ? <>{boutonGroupe(true)}{boutonSolo(false)}</> : <>{boutonSolo(true)}{boutonGroupe(false)}</>}
      </div>

      {/* Forme du jour : revient en phase 4, utile aux contrôles du jour (tâche C-03, décision B10). */}

      <section className="pile" aria-labelledby="titre-semaine">
        <h2 className="mention" id="titre-semaine">Cette semaine</h2>
        <ul className="semaine" aria-label="Séances de la semaine">
          {JOURS.map((jour, i) => {
            const etat = etatDuJour(i)
            const seance = EXEMPLE.seances.find((s) => s.jour === i)
            const libelles: Record<EtatJour, string> = {
              fait: `${majuscule(jour)}, ${seance?.nom}, fait`,
              aujourdhui: `${majuscule(jour)}, aujourd’hui`,
              prevu: `${majuscule(jour)}, ${seance?.nom}`,
              repos: `${majuscule(jour)}, repos`,
            }
            return (
              <li key={jour} className={`jour ${etat}`} aria-label={libelles[etat]}>
                <b aria-hidden="true">{INITIALES[i]}</b>
                <i className={`marque ${{ fait: 'coche', aujourdhui: 'point', prevu: 'carre', repos: 'tiret' }[etat]}`} aria-hidden="true" />
              </li>
            )
          })}
        </ul>
        {prochaine && (
          <p className="texte-2">Prochaine : {JOURS[prochaine.jour]}, {prochaine.nom} ({prochaine.durete})</p>
        )}
      </section>
    </main>
  )
}
