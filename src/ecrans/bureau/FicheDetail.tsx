import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Avertissement } from '../../composants/Avertissement.tsx'
import { PanneauLateral } from '../../composants/PanneauLateral.tsx'
import { Chrono } from '../Chrono.tsx'
import {
  nomQualite, texteContreIndication, TERRAINS, type ContexteFiltre, type EntreeBibliotheque, type EtatEntree,
} from '../../donnees/bibliotheque/filtres.ts'
import { lignesContexte, lignesPrerequis, phraseLimiteSemaine, phraseReference } from '../../donnees/bibliotheque/lignesFiche.ts'
import {
  appliquerReglages, bornesReglages, decrireForme, dureeCourte, estCeluiDeLaFiche, type Borne, type DemandeReglages,
} from '../../donnees/bibliotheque/reglages.ts'
import type { Forme } from '../../donnees/bibliotheque/types.ts'
import type { ExercicePerso } from '../../donnees/modele.ts'
import { NOMS_ZONES } from '../../regles/reglesParDefaut.ts'

export interface DonneesFiche {
  entree: EntreeBibliotheque
  etat: EtatEntree
  forme: Forme // comment la fiche s'exécute : chrono, liste ou essais
  reference?: ExercicePerso['reference'] // exercice personnel seulement
  contexte: ContexteFiltre // profil et douleurs, pour dire l'état des prérequis
}

// Valeurs proposées dans une liste : de la borne basse à la borne haute, au pas de la borne.
function valeursDe(b: Borne): number[] {
  const valeurs: number[] = []
  for (let v = b.min; v <= b.max; v += b.pas) valeurs.push(v)
  return valeurs
}

function ChoixReglage({ id, libelle, aide, borne, valeur, formate, onChoisir }: {
  id: string; libelle: string; aide: string; borne: Borne; valeur: number; formate: (n: number) => string; onChoisir: (n: number) => void
}) {
  return (
    <div className="champ">
      <label htmlFor={id}>{libelle}</label>
      <select id={id} value={valeur} aria-describedby={`${id}-aide`} onChange={(e) => onChoisir(Number(e.target.value))}>
        {valeursDe(borne).map((v) => <option key={v} value={v}>{formate(v)}</option>)}
      </select>
      <span id={`${id}-aide`} className="texte-3">{aide}</span>
    </div>
  )
}

// Aperçu du chrono : la même horloge que sur le téléphone, mais rien n'est enregistré et ce n'est pas une séance (R-6).
// Échap est géré par le panneau (qui ferme l'aperçu d'abord).
function ApercuChrono({ entree, forme, onFermer }: { entree: EntreeBibliotheque; forme: Extract<Forme, { forme: 'chrono' }>; onFermer: () => void }) {
  const volet = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const origine = document.activeElement instanceof HTMLElement ? document.activeElement : null
    volet.current?.querySelector('button')?.focus()
    return () => { if (origine?.isConnected) origine.focus({ preventScroll: true }) }
  }, [])
  return (
    <div ref={volet} className="apercu-chrono" role="dialog" aria-modal="true" aria-label={`Aperçu du chrono : ${entree.nom}`}>
      <p className="apercu-bandeau surtitre">Aperçu · rien n’est enregistré · ce n’est pas une séance</p>
      <Chrono titre={entree.nom} detail={forme.detail} mot={forme.mot} config={forme.config} onQuitter={onFermer} />
    </div>
  )
}

// Écran O-07 : tout savoir d'un protocole avant de le poser dans le plan. Rien ne se lance d'ici (R-6).
export function FicheDetail({ donnees, onFermer }: { donnees: DonneesFiche; onFermer: () => void }) {
  const { entree, etat, forme, reference, contexte } = donnees
  const idTitre = useId()
  const idSeries = useId()
  const idRepos = useId()
  const [demande, setDemande] = useState<DemandeReglages>({})
  const [apercu, setApercu] = useState(false)

  const config = forme.forme === 'chrono' ? forme.config : undefined
  const bornes = useMemo(() => (config ? bornesReglages(config) : {}), [config])
  // Toujours ramenés dans les bornes de la fiche, même si la demande en sort.
  const reglee = useMemo(() => (config ? appliquerReglages(config, demande) : undefined), [config, demande])
  const modifie = config !== undefined && !estCeluiDeLaFiche(config, demande)

  const terrain = TERRAINS.find((t) => t.valeur === entree.terrain)?.nom
  const prerequis = lignesPrerequis(entree.fiche.prerequis, contexte.profil, contexte.aujourdhui)
  const zones = entree.fiche.contreIndications
  const phraseReferenceLivre = phraseReference(reference)

  const pied = (
    <>
      {/* Seule action en résine du panneau ; elle s'active avec l'éditeur de séance du plan (D-16). */}
      <button type="button" className="bouton principal" disabled>
        <strong>Ajouter au plan</strong>
        <span>Bientôt disponible : l’éditeur de séance arrive avec le plan</span>
      </button>
      {config && (
        <button type="button" className="bouton-second" aria-haspopup="dialog" onClick={() => setApercu(true)}>Essayer le chrono</button>
      )}
    </>
  )

  return (
    <PanneauLateral
      idTitre={idTitre}
      // Échap et croix : l'aperçu d'abord, puis le panneau.
      onFermer={() => (apercu ? setApercu(false) : onFermer())}
      onFermeture={onFermer}
      pied={pied}
      superposition={apercu && forme.forme === 'chrono' && reglee ? (
        <ApercuChrono entree={entree} forme={{ ...forme, config: reglee }} onFermer={() => setApercu(false)} />
      ) : undefined}
    >
      <article className="fiche-detail">
        <div className="pile">
          <p className="surtitre">{nomQualite(entree.qualite)} · {entree.dureeMin} min</p>
          <ul className="fiche-grille-etiquettes">
            <li><span className="etiquette contour">{entree.preuve}</span></li>
            {entree.origine === 'perso' && <li><span className="etiquette">Perso</span></li>}
            {entree.fiche.estTest && <li><span className="etiquette contour">Test</span></li>}
            {entree.aLaMain !== undefined && <li><span className="etiquette">À la main seulement</span></li>}
          </ul>
          <h2 id={idTitre} tabIndex={-1} className="titre moyen">{entree.nom}</h2>
        </div>

        {entree.aLaMain !== undefined && (
          <p className="texte-2">Ni le générateur ni l’assistant ne la proposent ; tu peux l’ajouter à la main. Raison : {entree.aLaMain}</p>
        )}

        <p>{entree.consigne}</p>

        {/* Contre-indication : signal d'arrêt, annoncé à l'ouverture. Il avertit, il ne bloque rien. */}
        {etat.contreIndications.length > 0 && (
          <Avertissement niveau="arret" titre={texteContreIndication(etat.contreIndications)}>
            Ne fais pas cet exercice avec cette douleur. Choisis-en un qui ne la sollicite pas, ou demande conseil à un professionnel.
          </Avertissement>
        )}

        <section className="fiche-detail-section" aria-labelledby={`${idTitre}-reglages`}>
          <h3 id={`${idTitre}-reglages`} className="surtitre">Réglages</h3>
          <p className="donnee fiche-detail-reglages" aria-live="polite">{reglee && forme.forme === 'chrono' ? decrireForme({ ...forme, config: reglee }) : decrireForme(forme)}</p>
          {config && (bornes.series || bornes.reposSeriesS) && (
            <div className="pile">
              <p className="texte-3">Pour l’essai du chrono, tu peux faire moins de séries ou te reposer plus. Jamais l’inverse : la fiche reste la limite.</p>
              {bornes.series && reglee && (
                <ChoixReglage id={idSeries} libelle="Séries" borne={bornes.series} valeur={reglee.series} formate={String}
                  aide={`La fiche en prévoit ${config.series}.`} onChoisir={(n) => setDemande((d) => ({ ...d, series: n }))} />
              )}
              {bornes.reposSeriesS && reglee && (
                <ChoixReglage id={idRepos} libelle="Repos entre deux séries" borne={bornes.reposSeriesS} valeur={reglee.reposSeriesS} formate={dureeCourte}
                  aide={`La fiche en prévoit ${dureeCourte(config.reposSeriesS)} au moins.`} onChoisir={(n) => setDemande((d) => ({ ...d, reposSeriesS: n }))} />
              )}
              {modifie && <button type="button" className="bouton-texte fiche-detail-retour" onClick={() => setDemande({})}>Revenir aux valeurs de la fiche</button>}
            </div>
          )}
        </section>

        <section className="fiche-detail-section" aria-labelledby={`${idTitre}-contexte`}>
          <h3 id={`${idTitre}-contexte`} className="surtitre">Matériel et avec qui</h3>
          <ul className="fiche-detail-liste">
            <li>{terrain ?? 'Une salle de bloc suffit'}</li>
            {lignesContexte(entree.fiche.contexte).map((l) => <li key={l}>{l}</li>)}
          </ul>
        </section>

        <section className="fiche-detail-section" aria-labelledby={`${idTitre}-prerequis`}>
          <h3 id={`${idTitre}-prerequis`} className="surtitre">Prérequis</h3>
          {prerequis.length === 0 ? (
            <p className="texte-2">Aucun prérequis.</p>
          ) : (
            <ul className="fiche-detail-liste">
              {prerequis.map((l) => (
                <li key={l.cle} className="fiche-detail-prerequis">
                  <span className={l.rempli ? 'etiquette contour' : 'etiquette attente'}>{l.rempli ? 'Rempli' : 'Manque'}</span>
                  <span>{l.phrase}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="fiche-detail-section" aria-labelledby={`${idTitre}-securite`}>
          <h3 id={`${idTitre}-securite`} className="surtitre">Sécurité</h3>
          <ul className="fiche-detail-liste">
            <li>
              {zones.length > 0
                ? `Déconseillé en cas de douleur : ${zones.map((z) => NOMS_ZONES[z]).join(', ')}.`
                : 'Aucune zone de douleur n’écarte cette fiche.'}
            </li>
            <li>{phraseLimiteSemaine(entree.fiche.maxParSemaine)}.</li>
          </ul>
          <div className="signal-arret fiche-detail-arret">
            <p className="texte-2">
              <strong>Arrête tout de suite</strong> au moindre claquement, douleur aiguë et soudaine, gonflement ou engourdissement.
              Les repères complets sont dans les mises en garde de ton profil.
            </p>
          </div>
        </section>

        {entree.progression && (
          <section className="fiche-detail-section" aria-labelledby={`${idTitre}-progression`}>
            <h3 id={`${idTitre}-progression`} className="surtitre">Pour progresser</h3>
            <p>{entree.progression}</p>
          </section>
        )}

        {entree.aVerifier && (
          <Avertissement niveau="avertissement" titre="À vérifier">{entree.aVerifier}</Avertissement>
        )}

        <section className="fiche-detail-section" aria-labelledby={`${idTitre}-source`}>
          <h3 id={`${idTitre}-source`} className="surtitre">Source</h3>
          <p className="texte-2">{entree.source}</p>
          {phraseReferenceLivre && <p className="texte-2">Référence : {phraseReferenceLivre}</p>}
          {entree.adresse && <a className="fiche-detail-lien" href={entree.adresse} target="_blank" rel="noopener noreferrer">Ouvrir la source (nouvel onglet)</a>}
        </section>
      </article>
    </PanneauLateral>
  )
}
