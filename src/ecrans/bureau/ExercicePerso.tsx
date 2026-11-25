import { Fragment, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Avertissement } from '../../composants/Avertissement.tsx'
import { Confirmation } from '../../composants/Confirmation.tsx'
import { ApercuChrono } from './FicheDetail.tsx'
import { FicheProtocole } from '../../composants/FicheProtocole.tsx'
import { QUALITES, TERRAINS, entreesDepuis, etatDe, nomQualite, type ContexteFiltre, type EntreeBibliotheque } from '../../donnees/bibliotheque/filtres.ts'
import {
  BROUILLON_VIDE, ZONES_PROPOSEES, brouillonModifie, entier, erreursDuBrouillon, exerciceDepuisBrouillon, premierChampEnErreur,
  type BrouillonExercice, type ChampErreur, type FormeChoisie, type GabaritSimple, type Reponse, type ReponsesSecurite,
} from '../../donnees/exercicePerso.ts'
import { LIVRES, type ExercicePerso as ExercicePersoEnregistre, type LivreReference } from '../../donnees/modele.ts'
import { enregistrerExercicePerso } from '../../donnees/plan.ts'
import { NOMS_ZONES } from '../../regles/reglesParDefaut.ts'

const LIMITE_CONSIGNE_CONSEILLEE = 280

const FORMES: { valeur: FormeChoisie; nom: string }[] = [
  { valeur: 'chrono', nom: 'Chrono' }, { valeur: 'liste', nom: 'Liste à cocher' }, { valeur: 'essais', nom: 'Essais avec repos' },
]
const GABARITS: { valeur: GabaritSimple; nom: string }[] = [
  { valeur: 'repetition_unique', nom: 'Un effort, puis un long repos' },
  { valeur: 'depart_minute', nom: 'Un départ à chaque créneau' },
  { valeur: 'intermittent', nom: 'Effort et repos répétés' },
]
const LIVRES_CHOISIS: LivreReference[] = ['planification', 'cent_exercices', 'alimentation', 'autre']
const REPONSES: { valeur: Reponse; nom: string }[] = [
  { valeur: 'oui', nom: 'Oui' }, { valeur: 'non', nom: 'Non' }, { valeur: 'je_ne_sais_pas', nom: 'Je ne sais pas' },
]
const QUESTIONS: { cle: keyof ReponsesSecurite; question: string }[] = [
  { cle: 'effortMaximal', question: 'Effort maximal des doigts ?' },
  { cle: 'poutre', question: 'Sur poutre ?' },
  { cle: 'blocLimite', question: 'Bloc à ta limite ?' },
  { cle: 'prises', question: 'Arqué, bidoigts ou trous ?' },
  { cle: 'sansPieds', question: 'Sans pieds au pan ?' },
]

// Hors du composant : ces deux appels ne sont pas purs, ils ne doivent pas se lire comme du rendu.
const horodatageMaintenant = () => new Date().toISOString()
const nouvelIdentifiant = () => `perso-${crypto.randomUUID()}`

/** Pour l'aperçu seulement : on complète ce qui manque ou ne se lit pas, sans jamais l'enregistrer. */
function brouillonPourApercu(b: BrouillonExercice): BrouillonExercice {
  const nombre = (texte: string, secours: string) => (Number.isNaN(entier(texte)) ? secours : texte)
  return {
    ...b,
    nom: b.nom.trim() === '' ? 'Nom de l’exercice' : b.nom,
    qualite: b.qualite === '' ? 'technique' : b.qualite,
    forme: b.forme === '' ? 'liste' : b.forme,
    elements: b.elements.trim() === '' ? 'Un élément' : b.elements,
    effortS: nombre(b.effortS, '10'), creneauS: nombre(b.creneauS, '60'), reposRepetitionsS: nombre(b.reposRepetitionsS, '0'),
    repetitions: nombre(b.repetitions, '1'), series: nombre(b.series, '1'), reposSeriesS: nombre(b.reposSeriesS, '0'),
    reposEssaisS: nombre(b.reposEssaisS, '0'), dureeMin: nombre(b.dureeMin, '1'),
  }
}

// Écran O-08 : créer un exercice à soi, par exemple tiré d'un livre. On y cite le titre et la page, jamais le texte.
export function ExercicePerso({ contexte, onCree, onQuitter }: {
  contexte: ContexteFiltre
  onCree: (e: ExercicePersoEnregistre) => void
  onQuitter: () => void
}) {
  const [b, setB] = useState<BrouillonExercice>(BROUILLON_VIDE)
  const [erreurs, setErreurs] = useState<ReturnType<typeof erreursDuBrouillon>>({})
  const [enCours, setEnCours] = useState(false)
  const [echec, setEchec] = useState(false)
  const [confirmerSortie, setConfirmerSortie] = useState(false)
  // Le réglage essayé : une copie prise au clic, pour que l'aperçu ne bouge pas pendant qu'il tourne.
  const [essai, setEssai] = useState<{ entree: EntreeBibliotheque; forme: Parameters<typeof ApercuChrono>[0]['forme'] } | undefined>(undefined)
  const champs = useRef(new Map<ChampErreur, HTMLElement>())
  const idPrefixe = useId()
  const id = (nom: string) => `${idPrefixe}-${nom}`

  const maj = (partiel: Partial<BrouillonExercice>) => {
    setB((avant) => ({ ...avant, ...partiel }))
    // L'erreur d'un champ disparaît dès qu'on le corrige : on revalide à l'envoi suivant.
    setErreurs((avant) => (Object.keys(avant).length === 0 ? avant : erreursDuBrouillon({ ...b, ...partiel })))
  }

  // L'aperçu : la même fiche que dans la bibliothèque, calculée depuis le brouillon.
  const apercu = useMemo(() => {
    const exercice = exerciceDepuisBrouillon(brouillonPourApercu(b), 'apercu', 'apercu')
    const entree = entreesDepuis([], [exercice])[0]
    return entree ? { entree, etat: etatDe(entree, contexte) } : undefined
  }, [b, contexte])

  // L'aperçu n'est pas une boîte de dialogue native : Échap se gère ici.
  useEffect(() => {
    if (!essai) return
    const surTouche = (e: KeyboardEvent) => { if (e.key === 'Escape') setEssai(undefined) }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [essai])

  const focusSurErreur = (trouvees: ReturnType<typeof erreursDuBrouillon>) => {
    const premier = premierChampEnErreur(trouvees)
    if (premier === undefined) return false
    // Le focus va au premier champ en erreur ; pour un groupe de boutons, à son premier bouton.
    const element = champs.current.get(premier)
    const cible = element?.matches('input, select, textarea, button') ? element : element?.querySelector('button')
    ;(cible as HTMLElement | null | undefined)?.focus()
    return true
  }

  const essayerLeChrono = () => {
    const trouvees = erreursDuBrouillon(b)
    setErreurs(trouvees)
    // Réglage incohérent (0 série…) : rien ne se lance, on montre le champ et son message.
    if (focusSurErreur(trouvees)) return
    const exercice = exerciceDepuisBrouillon(b, 'essai', 'essai')
    const entree = entreesDepuis([], [exercice])[0]
    if (entree && exercice.forme === 'chrono') setEssai({ entree, forme: exercice })
  }

  const retour = () => { if (brouillonModifie(b)) setConfirmerSortie(true); else onQuitter() }

  const envoyer = async (evenement: FormEvent) => {
    evenement.preventDefault()
    if (enCours) return
    const trouvees = erreursDuBrouillon(b)
    setErreurs(trouvees)
    if (focusSurErreur(trouvees)) return
    setEnCours(true)
    setEchec(false)
    try {
      const exercice = exerciceDepuisBrouillon(b, nouvelIdentifiant(), horodatageMaintenant())
      await enregistrerExercicePerso(exercice)
      onCree(exercice)
    } catch {
      setEchec(true)
      setEnCours(false)
    }
  }

  // Un champ texte ou nombre avec son étiquette, son aide et son message d'erreur.
  const champ = (cle: ChampErreur, libelle: string, valeur: string, onChange: (v: string) => void, options?: { aide?: string; nombre?: boolean; unite?: string }) => {
    const erreur = erreurs[cle]
    return (
      <div className={`champ${erreur ? ' erreur' : ''}`}>
        <label htmlFor={id(cle)}>{libelle}{options?.unite ? ` (${options.unite})` : ''}</label>
        {options?.aide && <span className="texte-3" id={id(`${cle}-aide`)}>{options.aide}</span>}
        <input
          id={id(cle)} ref={(el) => { if (el) champs.current.set(cle, el) }} value={valeur} autoComplete="off"
          {...(options?.nombre ? { inputMode: 'numeric' as const } : {})}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={[options?.aide ? id(`${cle}-aide`) : '', erreur ? id(`${cle}-erreur`) : ''].filter(Boolean).join(' ') || undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {erreur && <p className="message-erreur" id={id(`${cle}-erreur`)}>{erreur}</p>}
      </div>
    )
  }

  // Un groupe de boutons à choix unique : qualité, forme, gabarit, réponses.
  const groupe = (cle: ChampErreur | undefined, titre: string, enfants: ReactNode, aide?: string) => {
    const erreur = cle ? erreurs[cle] : undefined
    // Sans espace : un identifiant avec espace casserait aria-labelledby.
    const idTitre = id(`${cle ?? titre.replace(/[^a-zA-Z0-9]+/g, '-')}-titre`)
    return (
      <div className={`perso-groupe${erreur ? ' erreur' : ''}`}>
        <p className="surtitre" id={idTitre}>{titre}</p>
        {aide && <p className="texte-3">{aide}</p>}
        <div role="group" aria-labelledby={idTitre} className="choix libre" ref={(el) => { if (el && cle) champs.current.set(cle, el) }}>{enfants}</div>
        {erreur && cle && <p className="message-erreur" id={id(`${cle}-erreur`)}>{erreur}</p>}
      </div>
    )
  }

  const bouton = (actif: boolean, onClic: () => void, texte: string) => (
    <button key={texte} type="button" aria-pressed={actif} onClick={onClic}>{texte}</button>
  )

  const caracteres = b.consigne.length

  return (
    <main className="ecran biblio perso">
      <header className="biblio-entete">
        <div className="pile">
          <p className="surtitre">Bibliothèque</p>
          <h1 className="titre">Créer un exercice</h1>
          <p className="texte-2">Ajoute un exercice à toi, par exemple tiré d’un livre. Note le titre et la page du livre, pas son texte.</p>
        </div>
        <button type="button" className="bouton-second perso-retour" onClick={retour}>Retour à la bibliothèque</button>
      </header>

      <div className="perso-corps">
        <form className="pile-large perso-formulaire" inert={essai ? true : undefined} onSubmit={(e) => { void envoyer(e) }} noValidate aria-label="Nouvel exercice personnel">
          {champ('nom', 'Nom', b.nom, (v) => maj({ nom: v }))}

          {groupe('qualite', 'Qualité travaillée', QUALITES.map((q) => bouton(b.qualite === q, () => maj({ qualite: q }), nomQualite(q))))}

          {groupe('forme', 'Comment il se déroule', FORMES.map((f) => bouton(b.forme === f.valeur, () => maj({ forme: f.valeur }), f.nom)))}

          {b.forme === 'chrono' && (
            <fieldset className="perso-sous-champs">
              <legend className="surtitre">Réglage du chrono</legend>
              {groupe(undefined, 'Gabarit', GABARITS.map((g) => bouton(b.gabarit === g.valeur, () => maj({ gabarit: g.valeur }), g.nom)))}
              <div className="perso-grille-nombres">
                {champ('effortS', 'Effort', b.effortS, (v) => maj({ effortS: v }), { nombre: true, unite: 's' })}
                {b.gabarit === 'depart_minute' && champ('creneauS', 'Créneau', b.creneauS, (v) => maj({ creneauS: v }), { nombre: true, unite: 's' })}
                {b.gabarit === 'intermittent' && champ('reposRepetitionsS', 'Repos entre efforts', b.reposRepetitionsS, (v) => maj({ reposRepetitionsS: v }), { nombre: true, unite: 's' })}
                {b.gabarit !== 'repetition_unique' && champ('repetitions', 'Répétitions par série', b.repetitions, (v) => maj({ repetitions: v }), { nombre: true })}
                {champ('series', 'Séries', b.series, (v) => maj({ series: v }), { nombre: true })}
                {champ('reposSeriesS', 'Repos entre séries', b.reposSeriesS, (v) => maj({ reposSeriesS: v }), { nombre: true, unite: 's' })}
              </div>
              <label className="champ" htmlFor={id('mot')}>
                Mot affiché pendant l’effort
                <input id={id('mot')} value={b.mot} placeholder="SUSPENDS-TOI" autoComplete="off" onChange={(e) => maj({ mot: e.target.value })} />
              </label>
              <button type="button" className="bouton-second perso-essai" aria-haspopup="dialog" onClick={essayerLeChrono}>Essayer le chrono</button>
            </fieldset>
          )}

          {b.forme === 'liste' && (
            <div className={`champ${erreurs.elements ? ' erreur' : ''}`}>
              <label htmlFor={id('elements')}>Éléments à cocher</label>
              <span className="texte-3" id={id('elements-aide')}>Un élément par ligne.</span>
              <textarea
                id={id('elements')} rows={5} value={b.elements} ref={(el) => { if (el) champs.current.set('elements', el) }}
                aria-invalid={erreurs.elements ? true : undefined}
                aria-describedby={`${id('elements-aide')}${erreurs.elements ? ` ${id('elements-erreur')}` : ''}`}
                onChange={(e) => maj({ elements: e.target.value })}
              />
              {erreurs.elements && <p className="message-erreur" id={id('elements-erreur')}>{erreurs.elements}</p>}
            </div>
          )}

          {b.forme === 'essais' && champ('reposEssaisS', 'Repos entre essais', b.reposEssaisS, (v) => maj({ reposEssaisS: v }), { nombre: true, unite: 's' })}

          <div className="champ">
            <label htmlFor={id('consigne')}>Consigne</label>
            <span className="texte-3" id={id('consigne-aide')}>Écris avec tes mots. Ne recopie pas le livre : note plutôt sa page. Deux phrases suffisent.</span>
            <textarea id={id('consigne')} rows={3} value={b.consigne} aria-describedby={`${id('consigne-aide')} ${id('consigne-compteur')}`} onChange={(e) => maj({ consigne: e.target.value })} />
            <span className="texte-3 donnee" id={id('consigne-compteur')}>
              {caracteres} caractère{caracteres > 1 ? 's' : ''}{caracteres > LIMITE_CONSIGNE_CONSEILLEE ? ' : plutôt long, deux phrases suffisent' : ''}
            </span>
          </div>

          {champ('dureeMin', 'Durée indicative', b.dureeMin, (v) => maj({ dureeMin: v }), { nombre: true, unite: 'min' })}

          <label className="champ" htmlFor={id('terrain')}>
            Matériel ou terrain
            <select id={id('terrain')} value={b.terrain} onChange={(e) => maj({ terrain: e.target.value as BrouillonExercice['terrain'] })}>
              <option value="">Pas précisé</option>
              {TERRAINS.map((t) => <option key={t.valeur} value={t.valeur}>{t.nom}</option>)}
            </select>
          </label>

          <fieldset className="perso-sous-champs">
            <legend className="surtitre">Référence (facultatif)</legend>
            <label className="champ" htmlFor={id('livre')}>
              Livre
              <select id={id('livre')} value={b.livre} onChange={(e) => maj({ livre: e.target.value as BrouillonExercice['livre'] })}>
                <option value="">Aucun</option>
                {LIVRES_CHOISIS.map((l) => <option key={l} value={l}>{l === 'autre' ? 'Autre' : LIVRES[l]}</option>)}
              </select>
            </label>
            {b.livre === 'autre' && (
              <label className="champ" htmlFor={id('titre-autre')}>
                Titre de l’ouvrage
                <input id={id('titre-autre')} value={b.titreAutre} autoComplete="off" onChange={(e) => maj({ titreAutre: e.target.value })} />
              </label>
            )}
            {b.livre !== '' && champ('page', 'Page', b.page, (v) => maj({ page: v }), { nombre: true })}
          </fieldset>

          <fieldset className="perso-sous-champs">
            <legend className="surtitre">Sécurité</legend>
            <p className="texte-3">Je ne sais pas compte comme oui, par prudence : les règles avertiront davantage. Tu peux répondre Non quand tu es sûr.</p>
            {QUESTIONS.map(({ cle, question }) => (
              <Fragment key={cle}>
                {groupe(undefined, question, REPONSES.map((r) => bouton(b.reponses[cle] === r.valeur, () => maj({ reponses: { ...b.reponses, [cle]: r.valeur } }), r.nom)))}
              </Fragment>
            ))}
            <div className="perso-groupe">
              <p className="surtitre" id={id('zones-titre')}>Déconseillé en cas de douleur à…</p>
              <div role="group" aria-labelledby={id('zones-titre')} className="choix libre">
                {ZONES_PROPOSEES.map((z) => bouton(b.zones.includes(z), () => maj({ zones: b.zones.includes(z) ? b.zones.filter((x) => x !== z) : [...b.zones, z] }), NOMS_ZONES[z].charAt(0).toUpperCase() + NOMS_ZONES[z].slice(1)))}
              </div>
            </div>
          </fieldset>

          {echec && <Avertissement niveau="avertissement" titre="L’exercice n’a pas été enregistré">Réessaie dans un instant.</Avertissement>}
          <button type="submit" className="bouton principal" disabled={enCours}><strong>{enCours ? 'Enregistrement…' : 'Créer l’exercice'}</strong></button>
        </form>

        <aside className="perso-apercu" aria-label="Aperçu de la fiche" inert={essai ? true : undefined}>
          <p className="surtitre">Aperçu</p>
          {/* L'aperçu ne se manipule pas : `inert` le sort du parcours au clavier. */}
          <div inert>
            {apercu && <FicheProtocole entree={apercu.entree} etat={apercu.etat} onOuvrir={() => undefined} />}
          </div>
          <p className="texte-3">Voici comment la fiche apparaîtra dans la bibliothèque.</p>
        </aside>
      </div>

      {essai && <ApercuChrono entree={essai.entree} forme={essai.forme} onFermer={() => setEssai(undefined)} />}

      <Confirmation
        ouverte={confirmerSortie} titre="Quitter sans créer l’exercice ?" texte="Ce que tu as écrit ici sera perdu."
        libelleAction="Quitter" libelleRester="Rester" danger onAction={onQuitter} onRester={() => setConfirmerSortie(false)}
      />
    </main>
  )
}
