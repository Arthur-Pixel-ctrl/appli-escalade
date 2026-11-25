import { useEffect, useId, useRef, useState, type PointerEvent } from 'react'
import { Avertissement } from './Avertissement.tsx'
import { PastillePrise } from './PastillePrise.tsx'
import { idZone, type ListeEtapesNom } from './glisser.ts'
import { Icone } from './Icone.tsx'
import { Confirmation } from './Confirmation.tsx'
import { ChoixExercice, EditeurResume } from './EditeurResume.tsx'
import {
  ajouterEtapeDepuisFiche, changerNiveau, etapesDepuisSeanceType, poserPrincipal, recalculerGrandesLignes,
} from './EditeurResume.outils.ts'
import { nomQualite, QUALITES, texteContreIndication, etatDe, type ContexteFiltre, type EntreeBibliotheque } from '../donnees/bibliotheque/filtres.ts'
import type { Cycle, ExercicePerso, NiveauDetail, SeancePlanifiee, VersionGroupe } from '../donnees/modele.ts'
import { ETIQUETTES_NIVEAU, dureeVersionSolo, niveauAffiche, niveauChoisi } from '../donnees/niveaux.ts'
import { OBJECTIFS_GROUPE } from '../donnees/objectifsGroupe.ts'
import type { CouleurSalle } from '../donnees/salles.ts'
import type { EtapeSeance, ObjectifGroupe } from '../moteur/types.ts'
import type { FicheVerif } from '../regles/index.ts'
import { formatDuree } from '../ecrans/bureau/VuePhase.outils.ts'
import { nombreDuRepere, phraseCompte, compter, scinderMessage, type EntreeAvertissement } from '../ecrans/bureau/avertissementsPlan.ts'
import {
  NB_OBJECTIFS_GROUPE_MAX, TEXTE_ECHAUFFEMENT_COMMUN, copierSoloVersGroupe, duretePropose, effortParDefaut, groupePasRempli, groupeVide,
  monterOuDescendre, objectifDepuisType, objectifVide, qualiteProposee, retirerDe,
} from '../ecrans/bureau/VueSemaine.outils.ts'

/** Ce que la fiche sait d'un glisser en cours (D-17) : quelles zones sont valables, avec quel texte. */
export interface GlisseFiche {
  /** Texte de la zone « séance entière » quand une fiche du rail est en main ; `null` sinon. */
  texteSeance: string | null
  /** Zone valable sous le pointeur. */
  zoneActive: string | null
  /** Étape saisie dans cette séance. */
  source: { liste: ListeEtapesNom; index: number } | null
  /** Texte de la ligne `index` de la liste si on peut y déposer l'étape saisie ; `null` sinon. */
  texteEtape: (liste: ListeEtapesNom, index: number) => string | null
}

/** Ce que la fiche montre des avertissements du moteur (D-18) ; les écritures restent à `Plan.tsx`. */
export interface AvertissementsFiche {
  /** Ceux que le moteur vise sur cette séance (portée séance ou étape). */
  propres: EntreeAvertissement[]
  /** Ceux d'une autre séance qui la citent (W-01 : la séance d'après). */
  liees: EntreeAvertissement[]
  peutDecaler: (e: EntreeAvertissement) => boolean
  onDecaler: (e: EntreeAvertissement) => void
  onGarder: (e: EntreeAvertissement) => void
  onRouvrir: (e: EntreeAvertissement) => void
}

// Un avertissement du moteur : phrase, « Pourquoi ? » = la source, correction en un clic pour W-01 seulement.
export function AvertissementDuMoteur({ entree, actions }: { entree: EntreeAvertissement; actions: AvertissementsFiche }) {
  const decalable = actions.peutDecaler(entree)
  // S-01 sur l'exercice principal d'une partie (portée séance) : il n'y a pas d'étape à supprimer (E-18).
  const messageAffiche = entree.avertissement.code === 'S-01' && entree.avertissement.portee === 'seance'
    ? entree.avertissement.message.replace('Remplace-le ou supprime l\'étape.', 'Remplace l\'exercice principal de cette partie.')
    : entree.avertissement.message
  const { titre, suite } = scinderMessage(messageAffiche)
  return (
    <Avertissement
      niveau={entree.forme}
      titre={titre}
      pourquoi={entree.forme === 'information' ? undefined : `Source : ${entree.avertissement.source}`}
      {...(decalable ? { correction: { libelle: 'Décaler au lendemain', action: () => actions.onDecaler(entree) } } : {})}
      {...(entree.forme === 'avertissement' ? { onGarder: () => actions.onGarder(entree), replie: entree.garde, onRouvrir: () => actions.onRouvrir(entree) } : {})}
    >
      {suite !== '' ? suite : undefined}
    </Avertissement>
  )
}

interface Props {
  seance: SeancePlanifiee
  cycle: Cycle
  fiches: Record<string, FicheVerif>
  entrees: Map<string, EntreeBibliotheque>
  contexte: ContexteFiltre
  couleurs: CouleurSalle[]
  /** Position de l'étape que le rail va remplacer, si un remplacement est en cours sur cette séance. */
  remplacement: number | null
  glisse?: GlisseFiche | null
  avertissements?: AvertissementsFiche
  /** Exercices personnels : sans eux, « Ajouter une étape » ne propose que la bibliothèque. */
  persos?: ExercicePerso[]
  onGlisserEtape?: (e: PointerEvent<HTMLElement>, liste: ListeEtapesNom, index: number, titre: string) => void
  onChanger: (s: SeancePlanifiee) => void
  onSupprimer: () => void
  onVoirFiche: (ficheId: string) => void
  onRemplacer: (index: number) => void
  onAnnulerRemplacement: () => void
}

// Menu « … » d'une étape : un bouton, une liste ; Échap ferme et rend le focus au bouton.
function MenuActions({ nom, actions }: { nom: string; actions: { libelle: string; action: () => void; inactif?: boolean }[] }) {
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useRef<HTMLDivElement>(null)
  const declencheur = useRef<HTMLButtonElement>(null)
  const idMenu = useId()
  useEffect(() => {
    if (!ouvert) return
    const dehors = (e: MouseEvent) => { if (!conteneur.current?.contains(e.target as Node)) setOuvert(false) }
    document.addEventListener('mousedown', dehors)
    return () => document.removeEventListener('mousedown', dehors)
  }, [ouvert])
  return (
    <div className="menu-case menu-etape" ref={conteneur}
      onKeyDown={(e) => { if (e.key === 'Escape' && ouvert) { e.stopPropagation(); setOuvert(false); declencheur.current?.focus() } }}>
      <button ref={declencheur} type="button" className="menu-case-bouton" aria-expanded={ouvert} aria-controls={ouvert ? idMenu : undefined}
        aria-label={`Menu de l’étape, ${nom}`} onClick={() => setOuvert(!ouvert)}>…</button>
      {ouvert && (
        <ul className="menu-case-liste droite" id={idMenu}>
          {actions.map((a) => (
            <li key={a.libelle}>
              <button type="button" disabled={a.inactif} onClick={() => { setOuvert(false); declencheur.current?.focus(); a.action() }}>{a.libelle}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ListeEtapes({ seanceId, liste, etapes, entrees, contexte, remplacement, glisse, avertissements, onGlisserEtape, onChanger, onVoirFiche, onRemplacer }: {
  seanceId: string; liste: ListeEtapesNom; avertissements?: { de: (index: number) => EntreeAvertissement[]; actions: AvertissementsFiche }
  etapes: EtapeSeance[]; entrees: Map<string, EntreeBibliotheque>; contexte: ContexteFiltre; remplacement: number | null
  glisse?: GlisseFiche | null; onGlisserEtape?: Props['onGlisserEtape']
  onChanger: (e: EtapeSeance[]) => void; onVoirFiche: (id: string) => void; onRemplacer: (i: number) => void
}) {
  return (
    <ol className="etapes-liste">
      {etapes.map((e, i) => {
        const entree = e.origine ? entrees.get(e.origine.refId) : undefined
        const etat = entree ? etatDe(entree, contexte) : undefined
        const texteDepot = glisse?.texteEtape(liste, i) ?? null
        const saisie = glisse?.source?.liste === liste && glisse.source.index === i
        const zone = idZone('etape', seanceId, liste, i)
        const duMoteur = avertissements?.de(i) ?? []
        return (
          <li key={e.id} data-zone={zone}
            className={`etape-ligne${duMoteur.length > 0 ? ' fautive' : ''}${remplacement === i ? ' a-remplacer' : ''}${texteDepot !== null ? ' zone-valable' : ''}${glisse?.zoneActive === zone ? ' zone-survolee' : ''}${saisie ? ' glisse-source' : ''}`}>
            {/* La poignée s'ajoute au numéro sans le remplacer : l'ordre des étapes reste lisible. */}
            <span className="etape-tete">
              {onGlisserEtape && etapes.length > 1 && (
                <span className="poignee" aria-hidden="true" title="Glisser pour changer l’ordre" onContextMenu={(ev) => ev.preventDefault()}
                  onPointerDown={(ev) => onGlisserEtape(ev, liste, i, e.titre)}>⠿</span>
              )}
              <span className="repere" aria-hidden="true">{i + 1}</span>
            </span>
            <div className="etape-corps">
              <p className="etape-titre"><span className="cache">Étape {i + 1} : </span>{e.titre}</p>
              <ul className="fiche-grille-etiquettes">
                {etat && etat.manques.length > 0 && <li><span className="etiquette attente" title={etat.manques.join(' ; ')}>Prérequis</span></li>}
                {entree?.aVerifier !== undefined && <li><span className="etiquette contour">À vérifier</span></li>}
                {e.origine?.source === 'perso' && <li><span className="etiquette">Perso</span></li>}
              </ul>
              {etat && etat.contreIndications.length > 0 && <p className="texte-3 message-erreur">{texteContreIndication(etat.contreIndications)}</p>}
              {remplacement === i && <p className="texte-3">Choisis dans la bibliothèque la fiche qui la remplace.</p>}
              {texteDepot !== null && <p className="zone-texte">{texteDepot}</p>}
              {avertissements && duMoteur.length > 0 && (
                <div className="pile etape-avertissements">
                  {duMoteur.map((x) => <AvertissementDuMoteur key={x.cle} entree={x} actions={avertissements.actions} />)}
                </div>
              )}
            </div>
            <span className="donnee">{formatDuree(e.dureeMin) ?? '—'}</span>
            <MenuActions nom={e.titre} actions={[
              { libelle: 'Voir la fiche', action: () => e.origine && onVoirFiche(e.origine.refId), inactif: !e.origine },
              { libelle: 'Remplacer', action: () => onRemplacer(i) },
              { libelle: 'Monter', action: () => onChanger(monterOuDescendre(etapes, i, -1)), inactif: i === 0 },
              { libelle: 'Descendre', action: () => onChanger(monterOuDescendre(etapes, i, 1)), inactif: i === etapes.length - 1 },
              { libelle: 'Retirer', action: () => onChanger(retirerDe(etapes, i)) },
            ]} />
          </li>
        )
      })}
    </ol>
  )
}

function ChampNombre({ libelle, valeur, options, formate, vide, onChoisir }: {
  libelle: string; valeur: number | undefined; options: number[]; formate: (n: number) => string; vide?: string; onChoisir: (n: number | undefined) => void
}) {
  const id = useId()
  return (
    <div className="champ">
      <label htmlFor={id}>{libelle}</label>
      <select id={id} value={valeur ?? ''} onChange={(e) => onChoisir(e.target.value === '' ? undefined : Number(e.target.value))}>
        {vide !== undefined && <option value="">{vide}</option>}
        {options.map((n) => <option key={n} value={n}>{formate(n)}</option>)}
      </select>
    </div>
  )
}

function ObjectifGroupeEditeur({ numero, objectif, peutRetirer, couleurs, fichesGroupe, onChanger, onRetirer }: {
  numero: number; objectif: ObjectifGroupe; peutRetirer: boolean; couleurs: CouleurSalle[]; fichesGroupe: EntreeBibliotheque[]
  onChanger: (o: ObjectifGroupe) => void; onRetirer: () => void
}) {
  const idLibelle = useId()
  const idType = useId()
  const idFiche = useId()
  const idCouleur = useId()
  const couleur = couleurs.find((c) => c.nom === objectif.couleurConseillee)
  const change = (partiel: Partial<ObjectifGroupe>) => onChanger({ ...objectif, ...partiel })
  const sans = (cle: 'couleurConseillee' | 'blocs' | 'essaisMaxParBloc' | 'ficheReference'): ObjectifGroupe => {
    const { [cle]: _retire, ...reste } = objectif
    return reste
  }
  return (
    <fieldset className="objectif-groupe">
      <legend className="libelle">Objectif {numero}</legend>
      <div className="champ">
        <label htmlFor={idLibelle}>Libellé</label>
        <input id={idLibelle} value={objectif.libelle} maxLength={120} placeholder="3 blocs à ta limite, 4 essais max chacun"
          onChange={(e) => change({ libelle: e.target.value })} />
      </div>
      <div className="objectif-grille">
        <ChampNombre libelle="Cible" valeur={objectif.cible} options={Array.from({ length: 12 }, (_, i) => i + 1)} formate={String}
          onChoisir={(n) => n !== undefined && change({ cible: n })} />
        <div className="champ">
          <label htmlFor={`${idLibelle}-compte`}>Ce qu’on compte</label>
          <select id={`${idLibelle}-compte`} value={objectif.compte} onChange={(e) => change({ compte: e.target.value as ObjectifGroupe['compte'] })}>
            <option value="blocs_notes">Blocs réussis</option>
            <option value="flashs">Flashs</option>
          </select>
        </div>
        <ChampNombre libelle="Blocs" valeur={objectif.blocs} options={Array.from({ length: 10 }, (_, i) => i + 1)} formate={String} vide="Non précisé"
          onChoisir={(n) => onChanger(n === undefined ? sans('blocs') : { ...objectif, blocs: n })} />
        <ChampNombre libelle="Essais max par bloc" valeur={objectif.essaisMaxParBloc} options={[1, 2, 3, 4, 5, 6]} formate={String} vide="Non précisé"
          onChoisir={(n) => onChanger(n === undefined ? sans('essaisMaxParBloc') : { ...objectif, essaisMaxParBloc: n })} />
        <div className="champ">
          <label htmlFor={idCouleur}>Couleur conseillée</label>
          <div className="objectif-couleur">
            {couleur && <PastillePrise couleur={couleur.hex} nom={couleur.nom} />}
            <select id={idCouleur} value={objectif.couleurConseillee ?? ''}
              onChange={(e) => onChanger(e.target.value === '' ? sans('couleurConseillee') : { ...objectif, couleurConseillee: e.target.value })}>
              <option value="">Aucune</option>
              {couleurs.map((c) => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="objectif-grille">
        <div className="champ">
          <label htmlFor={idType}>Choisir un objectif type</label>
          {/* La valeur suit le modèle appliqué : au clavier, les flèches passent d'un objectif type au suivant. */}
          <select id={idType} value={objectif.modeleId ?? ''} onChange={(e) => { const t = OBJECTIFS_GROUPE.find((o) => o.id === e.target.value); if (t) onChanger(objectifDepuisType(t)) }}>
            <option value="">Catalogue…</option>
            {OBJECTIFS_GROUPE.map((o) => <option key={o.id} value={o.id}>{o.libelle}</option>)}
          </select>
        </div>
        <div className="champ">
          <label htmlFor={idFiche}>Tiré d’un protocole</label>
          <select id={idFiche} value={objectif.ficheReference ?? ''} onChange={(e) => {
            if (e.target.value === '') { onChanger(sans('ficheReference')); return }
            const fiche = fichesGroupe.find((f) => f.id === e.target.value)
            change({ ficheReference: e.target.value, ...(objectif.libelle.trim() === '' && fiche ? { libelle: fiche.nom } : {}) })
          }}>
            <option value="">Aucun</option>
            {fichesGroupe.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        </div>
      </div>
      {peutRetirer && <button type="button" className="bouton-texte objectif-retirer" onClick={onRetirer}>Retirer l’objectif {numero}</button>}
    </fieldset>
  )
}

// Le nom se modifie en place ; il est enregistré à la sortie du champ. La `key` le remet à jour quand le nom enregistré change.
function NomEditable({ nom, onChanger }: { nom: string; onChanger: (nom: string) => void }) {
  const [saisie, setSaisie] = useState(nom)
  const valider = () => {
    const propre = saisie.trim()
    if (propre === '') setSaisie(nom)
    else if (propre !== nom) onChanger(propre)
  }
  return (
    <input className="fiche-seance-nom" aria-label="Nom de la séance" value={saisie} maxLength={60}
      onChange={(e) => setSaisie(e.target.value)} onBlur={valider} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} />
  )
}

// La fiche d'une séance (O-05) : en-tête, réglages choisis, puis la version solo ou la version groupe.
// Le niveau choisi décide de l'éditeur de la version solo ; changer de niveau n'efface rien (R-9).
export function FicheSeance({ seance, cycle, fiches, entrees, contexte, couleurs, remplacement, glisse, avertissements, persos, onGlisserEtape, onChanger, onSupprimer, onVoirFiche, onRemplacer, onAnnulerRemplacement }: Props) {
  const [version, setVersion] = useState<'solo' | 'groupe'>('solo')
  // « Voir les étapes » ouvre l'éditeur détaillé sans changer le niveau choisi (rien n'est écrit).
  const [etapesOuvertes, setEtapesOuvertes] = useState(false)
  const [recalculer, setRecalculer] = useState(false)
  const [choixS26, setChoixS26] = useState(false)
  const [ajoutEtape, setAjoutEtape] = useState(false)
  const sectionEtapes = useRef<HTMLElement>(null)
  const idQualite = useId()
  const surGroupe = version === 'groupe'
  const groupe = seance.groupe
  const actuelle = surGroupe && groupe ? groupe : seance.solo
  const nomEnregistre = actuelle.nom

  const changerSolo = (partiel: Partial<SeancePlanifiee['solo']>) => onChanger({ ...seance, solo: { ...seance.solo, ...partiel } })
  const changerGroupe = (g: VersionGroupe) => onChanger({ ...seance, groupe: g })
  const changerVersion = (partiel: { durete?: 'dure' | 'legere'; effortPrevu?: number | undefined; nom?: string }) => {
    const { effortPrevu: _e, ...sansEffort } = actuelle
    const base = 'effortPrevu' in partiel ? sansEffort : actuelle
    const suivant = { ...base, ...(partiel.durete ? { durete: partiel.durete } : {}), ...(partiel.nom !== undefined ? { nom: partiel.nom } : {}),
      ...(partiel.effortPrevu !== undefined ? { effortPrevu: partiel.effortPrevu } : {}) }
    if (surGroupe && groupe) changerGroupe(suivant as VersionGroupe)
    else changerSolo(suivant)
  }

  const proposeeQualite = qualiteProposee(seance.solo.etapes, fiches)
  const proposeeDurete = duretePropose(seance.solo, fiches)
  const niveau = niveauAffiche(seance, cycle)
  const choisi = niveauChoisi(seance, cycle)
  // L'éditeur des étapes se montre au niveau détaillé, quand on le demande, et pendant un remplacement d'étape.
  const etapesVisibles = choisi === 'detaille' || etapesOuvertes || remplacement !== null
  const changerSoloEntier = (solo: SeancePlanifiee['solo']) => onChanger({ ...seance, solo })
  const choisirNiveau = (n: NiveauDetail | null) => { setEtapesOuvertes(false); onChanger(changerNiveau(seance, n)) }
  const voirLesEtapes = () => {
    setEtapesOuvertes(true)
    // Le focus suit l'ouverture : au clavier, on arrive sur les étapes.
    setTimeout(() => sectionEtapes.current?.focus(), 0)
  }
  const duree = surGroupe ? (groupe?.dureeMin ?? 0) : dureeVersionSolo(seance.solo)
  const fichesGroupe = [...entrees.values()].filter((e) => e.groupe)

  // Avertissements du moteur : ceux de la séance en haut, ceux d'une étape sous sa ligne (niveau le plus précis).
  const propres = avertissements?.propres ?? []
  const deSeance = propres.filter((e) => e.avertissement.etapeIndex === undefined)
  // Un avertissement qui vise une étape cachée monte en tête de la fiche, avec le nom de l'étape : aucun ne disparaît.
  const surEtapeCachee = surGroupe || etapesVisibles
    ? []
    : propres.filter((e) => e.avertissement.etapeIndex !== undefined && e.avertissement.version !== 'groupe')
  const deEtape = (liste: ListeEtapesNom) => (index: number) =>
    propres.filter((e) => e.avertissement.etapeIndex === index && (e.avertissement.version === 'groupe') === (liste === 'minibloc'))
  const etapesAvert = (liste: ListeEtapesNom) => (avertissements ? { de: deEtape(liste), actions: avertissements } : undefined)
  const nbRepere = nombreDuRepere([...propres, ...(avertissements?.liees ?? [])])

  return (
    <article className={`fiche fiche-seance${nbRepere > 0 ? ' avertie' : ''}${glisse?.texteSeance != null ? ' zone-valable' : ''}${glisse?.zoneActive === idZone('seance', seance.id) ? ' zone-survolee' : ''}`}
      data-zone={idZone('seance', seance.id)} data-seance={seance.id} tabIndex={-1} aria-label={`Séance : ${seance.solo.nom}`}>
      {glisse?.texteSeance != null && <p className="zone-texte">{glisse.texteSeance}</p>}
      <header className="fiche-seance-tete">
        <span className={actuelle.durete === 'dure' ? 'etiquette' : 'etiquette contour'}>{actuelle.durete === 'dure' ? 'Dure' : 'Légère'}</span>
        <NomEditable key={`${version}-${nomEnregistre}`} nom={nomEnregistre} onChanger={(nom) => changerVersion({ nom })} />
        {avertissements && nbRepere > 0 && (
          <span className="repere-avertissements" role="img" aria-label={phraseCompte(compter([...propres, ...avertissements.liees]))}>
            <Icone nom="avertissement" taille={20} /><span aria-hidden="true">{nbRepere}</span>
          </span>
        )}
        <span className="donnee" aria-label={surGroupe && duree === 0 ? 'Durée non précisée' : `Durée ${formatDuree(duree) ?? 'nulle'}`}>{formatDuree(duree) ?? '—'}</span>
        <div className="choix deux fiche-seance-version" role="group" aria-label="Version affichée">
          <button type="button" aria-pressed={!surGroupe} onClick={() => setVersion('solo')}>SOLO</button>
          <button type="button" aria-pressed={surGroupe} onClick={() => setVersion('groupe')}>GROUPE</button>
        </div>
      </header>

      {!surGroupe && (
        <fieldset className="question fiche-seance-niveau">
          <legend className="libelle">Niveau</legend>
          <div className="choix quatre">
            <button type="button" aria-pressed={seance.niveauDetail === undefined} onClick={() => choisirNiveau(null)}>
              Comme le cycle ({ETIQUETTES_NIVEAU[cycle.niveauDetail ?? 'detaille']})
            </button>
            {(['simple', 'grandes_lignes', 'detaille'] as const).map((n) => (
              <button key={n} type="button" aria-pressed={seance.niveauDetail === n} onClick={() => choisirNiveau(n)}>{ETIQUETTES_NIVEAU[n]}</button>
            ))}
          </div>
        </fieldset>
      )}

      {avertissements && (deSeance.length > 0 || surEtapeCachee.length > 0 || avertissements.liees.length > 0) && (
        <section className="pile" aria-label="Avertissements de la séance">
          {deSeance.map((e) => {
            const code = e.avertissement.code
            return (
              <div key={e.cle} className="pile">
                <AvertissementDuMoteur entree={e} actions={avertissements} />
                {code === 'S-26' && !surGroupe && (
                  <button type="button" className="bouton-texte" onClick={() => setChoixS26(true)}>Choisir l’exercice principal</button>
                )}
                {code === 'S-27' && !surGroupe && (
                  <div className="avertissement-suite">
                    {(seance.solo.parties?.length ?? 0) > 0 && (
                      <button type="button" className="bouton-texte" onClick={() => setRecalculer(true)}>Recalculer les grandes lignes</button>
                    )}
                    <button type="button" className="bouton-texte" onClick={voirLesEtapes}>Voir les étapes</button>
                  </div>
                )}
              </div>
            )
          })}
          {surEtapeCachee.map((e) => (
            <div key={e.cle} className="pile">
              <p className="texte-3">Étape « {seance.solo.etapes[e.avertissement.etapeIndex ?? 0]?.titre ?? 'inconnue'} »</p>
              <AvertissementDuMoteur entree={e} actions={avertissements} />
            </div>
          ))}
          {choixS26 && !surGroupe && (
            <ChoixExercice titre="Choisir l’exercice principal" entrees={[...entrees.values()]} contexte={contexte}
              onChoisir={(entree) => { changerSoloEntier(poserPrincipal(seance.solo, 0, { source: entree.origine, refId: entree.id })); setChoixS26(false) }}
              onFermer={() => setChoixS26(false)} />
          )}
          {avertissements.liees.map((e) => (
            <p key={e.cle} className="texte-3 repere-lie">Cette séance est citée par l’avertissement de la séance qui la suit.</p>
          ))}
        </section>
      )}

      <section className="fiche-seance-reglages" aria-label="Réglages de la séance">
        <fieldset className="question">
          <legend className="libelle">Dureté</legend>
          <div className="choix deux">
            <button type="button" aria-pressed={actuelle.durete === 'dure'} onClick={() => changerVersion({ durete: 'dure' })}>Dure</button>
            <button type="button" aria-pressed={actuelle.durete === 'legere'} onClick={() => changerVersion({ durete: 'legere' })}>Légère</button>
          </div>
          {!surGroupe && proposeeDurete !== seance.solo.durete && (
            <p className="texte-3">
              Les étapes proposent « {proposeeDurete === 'dure' ? 'dure' : 'légère'} ».{' '}
              <button type="button" className="bouton-texte bouton-en-ligne" onClick={() => changerVersion({ durete: proposeeDurete })}>La prendre</button>
            </p>
          )}
        </fieldset>
        <div className="champ">
          <label htmlFor={idQualite}>Qualité dominante</label>
          <select id={idQualite} value={seance.qualite} onChange={(e) => onChanger({ ...seance, qualite: e.target.value as SeancePlanifiee['qualite'] })}>
            {QUALITES.map((q) => <option key={q} value={q}>{nomQualite(q)}</option>)}
          </select>
          {proposeeQualite !== undefined && proposeeQualite !== seance.qualite && (
            <span className="texte-3">
              La première étape travaille « {nomQualite(proposeeQualite).toLowerCase()} ».{' '}
              <button type="button" className="bouton-texte bouton-en-ligne" onClick={() => onChanger({ ...seance, qualite: proposeeQualite })}>La prendre</button>
            </span>
          )}
        </div>
        <ChampNombre libelle="Effort prévu" valeur={actuelle.effortPrevu} options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} formate={(n) => `${n} sur 10`}
          vide={`Par défaut (${effortParDefaut(actuelle.durete)})`} onChoisir={(n) => changerVersion({ effortPrevu: n })} />
      </section>

      {!surGroupe && choisi === 'detaille' && niveau !== 'detaille' && (
        <p className="texte-3">Sur le téléphone, cette séance s’affiche en {ETIQUETTES_NIVEAU[niveau].toLowerCase()} tant qu’elle n’a pas d’étapes.</p>
      )}

      {!surGroupe && !etapesVisibles && (
        <EditeurResume seance={seance} niveau={choisi === 'simple' ? 'simple' : 'grandes_lignes'} fiches={fiches} entrees={entrees} contexte={contexte}
          onChanger={changerSoloEntier} onVoirEtapes={voirLesEtapes} />
      )}

      {!surGroupe && etapesVisibles && (
        <section ref={sectionEtapes} tabIndex={-1} aria-label="Étapes de la version solo" className="pile">
          {choisi !== 'detaille' && remplacement === null && (
            <button type="button" className="bouton-texte" onClick={() => setEtapesOuvertes(false)}>Revenir au résumé</button>
          )}
          {seance.solo.etapes.length === 0
            ? (
              <div className="pile">
                <p className="texte-2">Cette séance n’a pas encore d’étapes.</p>
                <div className="etapes-vides-actions">
                  {etapesDepuisSeanceType(seance) !== undefined && (
                    <button type="button" className="bouton-second" onClick={() => changerSoloEntier({ ...seance.solo, etapes: etapesDepuisSeanceType(seance) ?? [] })}>
                      Remplir depuis la séance type
                    </button>
                  )}
                  <button type="button" className="bouton-second" onClick={() => setAjoutEtape(true)}>Ajouter une étape</button>
                </div>
              </div>
            )
            : <ListeEtapes seanceId={seance.id} liste="solo" glisse={glisse} avertissements={etapesAvert('solo')} onGlisserEtape={onGlisserEtape} etapes={seance.solo.etapes} entrees={entrees} contexte={contexte} remplacement={remplacement}
                onChanger={(etapes) => changerSolo({ etapes })} onVoirFiche={onVoirFiche} onRemplacer={onRemplacer} />}
          {seance.solo.etapes.length > 0 && (
            <button type="button" className="bouton-texte" onClick={() => setAjoutEtape(true)}>Ajouter une étape</button>
          )}
          {ajoutEtape && (
            <ChoixExercice titre="Ajouter une étape" entrees={[...entrees.values()]} contexte={contexte}
              filtre={(e) => ajouterEtapeDepuisFiche(seance.solo, e.id, persos ?? []) !== undefined}
              onChoisir={(e) => { const suite = ajouterEtapeDepuisFiche(seance.solo, e.id, persos ?? []); if (suite) changerSoloEntier(suite); setAjoutEtape(false) }}
              onFermer={() => setAjoutEtape(false)} />
          )}
          {remplacement !== null && <button type="button" className="bouton-texte" onClick={onAnnulerRemplacement}>Annuler le remplacement</button>}
        </section>
      )}

      <Confirmation ouverte={recalculer} titre="Recalculer les grandes lignes ?"
        texte="Tes grandes lignes écrites seront remplacées par celles calculées depuis les étapes."
        libelleAction="Recalculer" onRester={() => setRecalculer(false)}
        onAction={() => { setRecalculer(false); changerSoloEntier(recalculerGrandesLignes(seance.solo)) }} />

      {surGroupe && !groupe && (
        <section className="pile">
          <p className="texte-2">Cette séance n’a pas de version groupe.</p>
          <button type="button" className="bouton-second" onClick={() => changerGroupe(groupeVide(seance.solo))}>Créer la version groupe</button>
        </section>
      )}

      {surGroupe && groupe && (
        <section aria-label="Version groupe" className="pile-large">
          <p className="information"><Icone nom="groupe" taille={20} /><span>{TEXTE_ECHAUFFEMENT_COMMUN}</span></p>
          <div className="pile">
            <fieldset className="question">
              <legend className="libelle">Mini-bloc solo</legend>
              <div className="choix trois">
                <button type="button" aria-pressed={groupe.miniBloc === undefined}
                  onClick={() => { const { miniBloc: _m, ...reste } = groupe; changerGroupe(reste) }}>Aucun</button>
                {(['avant', 'apres'] as const).map((m) => (
                  <button key={m} type="button" aria-pressed={groupe.miniBloc?.moment === m}
                    onClick={() => changerGroupe({ ...groupe, miniBloc: { moment: m, etapes: groupe.miniBloc?.etapes ?? [] } })}>{m === 'avant' ? 'Avant' : 'Après'}</button>
                ))}
              </div>
            </fieldset>
            {groupe.miniBloc && (groupe.miniBloc.etapes.length === 0
              ? <p className="texte-3">Mini-bloc vide : « Ajouter à… » dans la bibliothèque propose « mini-bloc de la version groupe ».</p>
              : <ListeEtapes seanceId={seance.id} liste="minibloc" glisse={glisse} avertissements={etapesAvert('minibloc')} onGlisserEtape={onGlisserEtape} etapes={groupe.miniBloc.etapes} entrees={entrees} contexte={contexte} remplacement={null}
                  onChanger={(etapes) => changerGroupe({ ...groupe, miniBloc: { moment: groupe.miniBloc!.moment, etapes } })}
                  onVoirFiche={onVoirFiche} onRemplacer={() => {}} />)}
          </div>
          <div className="pile-large">
            {groupe.objectifs.map((o, i) => (
              <ObjectifGroupeEditeur key={i} numero={i + 1} objectif={o} peutRetirer={groupe.objectifs.length > 1} couleurs={couleurs} fichesGroupe={fichesGroupe}
                onChanger={(n) => changerGroupe({ ...groupe, objectifs: groupe.objectifs.map((x, j) => (j === i ? n : x)) })}
                onRetirer={() => changerGroupe({ ...groupe, objectifs: retirerDe(groupe.objectifs, i) })} />
            ))}
            {groupe.objectifs.length < NB_OBJECTIFS_GROUPE_MAX && (
              <button type="button" className="bouton-second" onClick={() => changerGroupe({ ...groupe, objectifs: [...groupe.objectifs, objectifVide()] })}>Ajouter un objectif</button>
            )}
          </div>
          <ChampNombre libelle="Durée annoncée" valeur={groupe.dureeMin} options={Array.from({ length: 11 }, (_, i) => 30 + i * 15)} formate={(n) => formatDuree(n) ?? ''} vide="Non précisée"
            onChoisir={(n) => { const { dureeMin: _d, ...reste } = groupe; changerGroupe(n === undefined ? reste : { ...reste, dureeMin: n }) }} />
          <ChampNombre libelle="Repos conseillé entre deux blocs" valeur={groupe.reposConseilleS} options={Array.from({ length: 11 }, (_, i) => 60 + i * 30)}
            formate={(n) => `${Math.floor(n / 60)} min${n % 60 ? ` ${n % 60} s` : ''}`} onChoisir={(n) => n !== undefined && changerGroupe({ ...groupe, reposConseilleS: n })} />
        </section>
      )}

      {surGroupe && (
        <footer className="fiche-seance-pied">
          {groupePasRempli(groupe) && <p className="information"><Icone nom="information" taille={20} /><span>La version groupe n’est pas encore remplie.</span></p>}
          {groupe && <button type="button" className="bouton-second" onClick={() => changerGroupe(copierSoloVersGroupe(seance.solo, groupe))}>Copier depuis la version solo</button>}
          {groupe && <p className="texte-3">Copie le nom, la dureté et l’effort prévu de la version solo.</p>}
        </footer>
      )}

      <button type="button" className="bouton-texte fiche-seance-retirer" onClick={onSupprimer}>Retirer la séance</button>
    </article>
  )
}
