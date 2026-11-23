import { useEffect, useId, useState } from 'react'
import { Confirmation } from '../../composants/Confirmation.tsx'
import type { Profil as TypeProfil } from '../../donnees/profil.ts'
import { lireUn } from '../../donnees/stockage.ts'
import { Profil } from '../Profil.tsx'
import {
  MODELE_HAIKU, MODELE_SONNET, REDUCTIONS_DECHARGE, changerMemorisation, enregistrerCle, enregistrerModele, enregistrerRegles,
  lireCle, lireReglages, masquerCle, memoriserCleActive, modeleDepuis, reglesDepuis, ressembleAUneCle, supprimerCle,
  type ReglesChoisies,
} from './Reglages.outils.ts'

interface Props {
  profil: TypeProfil
  onEnregistrerProfil: (p: TypeProfil) => void
  onMisesEnGarde: () => void
  onCompte: () => void
  onDonneesImportees: () => void
}

const SOMMAIRE = [
  { id: 'section-toi', nom: 'Toi' },
  { id: 'titre-prerequis', nom: 'Prérequis' },
  { id: 'section-regles', nom: 'Règles' },
  { id: 'section-assistant', nom: 'Assistant' },
  { id: 'section-donnees', nom: 'Données' },
]

// Section Règles : la semaine allégée de fin de phase. Valeurs prudentes par défaut.
function SectionRegles() {
  const [regles, setRegles] = useState<ReglesChoisies | null>(null)
  const [message, setMessage] = useState('')
  useEffect(() => { void lireReglages().then((r) => setRegles(reglesDepuis(r))).catch(() => setRegles(reglesDepuis(undefined))) }, [])
  if (!regles) return null
  const changer = (suite: Partial<ReglesChoisies>) => { setRegles({ ...regles, ...suite }); setMessage('') }
  return (
    <section className="fiche pile-large" id="section-regles" aria-labelledby="titre-regles" tabIndex={-1}>
      <h2 className="sous-titre" id="titre-regles">Règles</h2>
      <fieldset className="question">
        <legend>Semaine allégée en fin de phase</legend>
        <div className="choix deux">
          <button type="button" aria-pressed={regles.dechargeActive} onClick={() => changer({ dechargeActive: true })}>Oui</button>
          <button type="button" aria-pressed={!regles.dechargeActive} onClick={() => changer({ dechargeActive: false })}>Non</button>
        </div>
      </fieldset>
      {regles.dechargeActive && (
        <fieldset className="question">
          <legend>Réduction de la semaine allégée</legend>
          <div className="choix trois">
            {REDUCTIONS_DECHARGE.map((n) => (
              <button type="button" key={n} aria-pressed={regles.dechargeReductionPct === n} onClick={() => changer({ dechargeReductionPct: n })}>{n} %</button>
            ))}
          </div>
        </fieldset>
      )}
      <p className="texte-3">Valeurs prudentes par défaut.</p>
      <button type="button" className="bouton-second" onClick={async () => {
        try { await enregistrerRegles(regles); setMessage('Règles enregistrées.') } catch { setMessage('Les règles n’ont pas pu être enregistrées. Réessaie.') }
      }}>Enregistrer les règles</button>
      <p className="texte-3" role="status" aria-live="polite">{message}</p>
    </section>
  )
}

// Section Assistant : la clé reste sur cet ordinateur. Une fois saisie, on n'en montre que le début et la fin.
function SectionAssistant() {
  const idAide = useId()
  const [pret, setPret] = useState(false)
  const [cleEnregistree, setCleEnregistree] = useState<string | null>(null)
  const [saisie, setSaisie] = useState('')
  const [afficher, setAfficher] = useState(false)
  const [memoriser, setMemoriser] = useState(true)
  const [modele, setModele] = useState(MODELE_HAIKU)
  const [confirmer, setConfirmer] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void (async () => {
      try {
        setCleEnregistree(await lireCle())
        setMemoriser(await memoriserCleActive())
        setModele(modeleDepuis(await lireReglages()))
      } catch { /* l'écran reste utilisable : on repart des valeurs par défaut */ }
      setPret(true)
    })()
  }, [])
  if (!pret) return null

  const enregistrer = async () => {
    const cle = saisie.trim()
    if (cle === '') { setMessage('Colle ta clé dans le champ.'); return }
    try {
      await enregistrerCle(cle, memoriser)
      setCleEnregistree(cle)
      setSaisie(''); setAfficher(false)
      setMessage(ressembleAUneCle(cle) ? 'Clé enregistrée sur cet ordinateur.' : 'Clé enregistrée. Elle ne commence pas par « sk-ant- » : vérifie que c’est la bonne.')
    } catch { setMessage('La clé n’a pas pu être enregistrée. Réessaie.') }
  }
  const choisirModele = async (m: string) => {
    setModele(m)
    try { await enregistrerModele(m); setMessage('') } catch { setMessage('Le choix du modèle n’a pas pu être enregistré. Réessaie.') }
  }

  return (
    <section className="fiche pile-large" id="section-assistant" aria-labelledby="titre-assistant" tabIndex={-1}>
      <h2 className="sous-titre" id="titre-assistant">Assistant</h2>

      {cleEnregistree ? (
        <div className="pile">
          <p className="libelle">Clé API Claude</p>
          <p className="donnee" data-testid="cle-masquee">{masquerCle(cleEnregistree)}</p>
          <button type="button" className="bouton-texte" onClick={() => setConfirmer(true)}>Retirer la clé</button>
        </div>
      ) : (
        <div className="pile">
          <label className="champ">Clé API Claude
            <input name="cleApiClaude" type={afficher ? 'text' : 'password'} autoComplete="off" spellCheck={false} autoCapitalize="off"
              aria-describedby={idAide} value={saisie} onChange={(e) => { setSaisie(e.target.value); setMessage('') }} />
          </label>
          <button type="button" className="bouton-texte" aria-pressed={afficher} onClick={() => setAfficher(!afficher)}>{afficher ? 'Masquer' : 'Afficher'}</button>
          <button type="button" className="bouton-second" onClick={enregistrer}>Enregistrer la clé</button>
        </div>
      )}
      <p className="texte-3" id={idAide}>Elle reste sur cet appareil. Elle n’est jamais envoyée à notre serveur ni synchronisée, ni mise dans tes sauvegardes. Chaque demande à l’assistant est payée avec ta clé.</p>

      <label className="case">
        <input type="checkbox" checked={memoriser} onChange={async (e) => {
          setMemoriser(e.target.checked)
          try { await changerMemorisation(e.target.checked) } catch { setMessage('Le choix n’a pas pu être enregistré. Réessaie.') }
        }} />
        <span>Mémoriser la clé sur cet ordinateur</span>
      </label>
      <p className="texte-3">Décochée, la clé reste en mémoire le temps de l’onglet, puis elle disparaît.</p>

      <fieldset className="question">
        <legend>Modèle de l’assistant</legend>
        <div className="choix deux">
          <button type="button" aria-pressed={modele === MODELE_HAIKU} onClick={() => void choisirModele(MODELE_HAIKU)}>Haiku (par défaut, le moins cher)</button>
          <button type="button" aria-pressed={modele === MODELE_SONNET} onClick={() => void choisirModele(MODELE_SONNET)}>Sonnet (plus soigné, environ 15 fois plus cher)</button>
        </div>
      </fieldset>
      <p className="texte-3">L’assistant ne fonctionne que sur ordinateur.</p>
      <p className="texte-3" role="status" aria-live="polite">{message}</p>

      <Confirmation
        ouverte={confirmer}
        titre="Retirer la clé ?"
        texte="La clé sera effacée de cet ordinateur. L’assistant ne marchera plus tant que tu n’en auras pas remis une."
        libelleAction="Retirer la clé"
        danger
        onRester={() => setConfirmer(false)}
        onAction={async () => {
          try { await supprimerCle(); setCleEnregistree(null); setMessage('Clé supprimée.') } catch { setMessage('La clé n’a pas pu être supprimée. Réessaie.') }
          setConfirmer(false)
        }}
      />
    </section>
  )
}

// Profil et réglages sur ordinateur (O-12) : sommaire à gauche, sections à droite.
export function Reglages({ profil, onEnregistrerProfil, onMisesEnGarde, onCompte, onDonneesImportees }: Props) {
  const [modifieLe, setModifieLe] = useState<string | undefined>()
  // La date du prérequis est celle de la dernière modification du profil.
  useEffect(() => {
    void lireUn<{ modifieLe?: string }>('reglages', 'profil').then((d) => setModifieLe(d?.modifieLe)).catch(() => {})
  }, [profil])

  const aller = (id: string) => {
    const cible = document.getElementById(id)
    if (!cible) return
    cible.setAttribute('tabindex', '-1') // un titre n'est pas focusable : on lui donne le focus pour les lecteurs d'écran
    cible.scrollIntoView({ block: 'start' })
    cible.focus({ preventScroll: true })
  }

  return (
    <div className="reglages">
      <nav className="reglages-sommaire" aria-label="Sections du profil">
        {SOMMAIRE.map((s) => <button type="button" key={s.id} className="bouton-texte" onClick={() => aller(s.id)}>{s.nom}</button>)}
      </nav>
      <div className="reglages-corps">
        <Profil
          profil={profil}
          onEnregistrer={onEnregistrerProfil}
          onMisesEnGarde={onMisesEnGarde}
          onCompte={onCompte}
          onDonneesImportees={onDonneesImportees}
          bureau
          modifieLe={modifieLe}
          sectionsEnPlus={<><SectionRegles /><SectionAssistant /></>}
        />
      </div>
    </div>
  )
}
