import { useEffect, useId, useMemo, useState } from 'react'
import { FicheProtocole } from '../../composants/FicheProtocole.tsx'
import { Icone } from '../../composants/Icone.tsx'
import { Avertissement } from '../../composants/Avertissement.tsx'
import { FicheDetail, type DonneesFiche } from './FicheDetail.tsx'
import { BIBLIOTHEQUE } from '../../donnees/bibliotheque/index.ts'
import {
  DUREES, FILTRES_VIDES, PREUVES, QUALITES, TERRAINS, convient, entreesDepuis, etatDe, filtresActifs, filtresDepuisRecherche, filtrer,
  nomQualite, phraseCompteur, rechercheDepuisFiltres, type ContexteFiltre, type Filtres,
} from '../../donnees/bibliotheque/filtres.ts'
import { jourLocal, lireProfil } from '../../donnees/base.ts'
import type { DouleurDeclaree, ExercicePerso } from '../../donnees/modele.ts'
import { lireExercicesPerso } from '../../donnees/plan.ts'
import { PROFIL_VIDE } from '../../donnees/profil.ts'
import { lireTous, surDonneesChangees } from '../../donnees/stockage.ts'
import { profilVersVerif } from '../../regles/passerelles.ts'
import type { DouleurVerif } from '../../regles/types.ts'

interface Donnees { persos: ExercicePerso[]; contexte: ContexteFiltre }

async function lireDonnees(): Promise<Donnees> {
  const [profil, persos, douleurs] = await Promise.all([lireProfil(), lireExercicesPerso(), lireTous<DouleurDeclaree>('douleurs')])
  const vues: DouleurVerif[] = douleurs.filter((d) => !d.supprimeLe).map((d) => ({
    date: d.date, zone: d.zone, niveau: d.niveau, signes: [...d.signes], ...(d.resolueLe !== undefined ? { resolueLe: d.resolueLe } : {}),
  }))
  // Sans profil, on compare avec un profil vide : tout ce qui est exigeant « manque », par prudence.
  return { persos, contexte: { profil: profilVersVerif(profil ?? PROFIL_VIDE), douleurs: vues, aujourdhui: jourLocal() } }
}

// Un groupe de choix : plusieurs réponses possibles (qualité, terrain, preuve) ou une seule (durée, prérequis, origine).
function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <fieldset className="biblio-groupe">
      <legend className="surtitre">{titre}</legend>
      <div className="choix libre">{children}</div>
    </fieldset>
  )
}

function Choix({ actif, onClic, children }: { actif: boolean; onClic: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={actif} onClick={onClic}>{children}</button>
}

const bascule = <T,>(liste: T[], v: T): T[] => (liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v])

// Écran O-06 : la banque d'exercices. Rien ne se lance d'ici (R-6) ; le plan et l'assistant y piochent.
// Les filtres vivent dans l'adresse (?qualite=doigts&duree=20) pour retrouver la même vue.
export function Bibliotheque() {
  const [donnees, setDonnees] = useState<Donnees | undefined>(undefined)
  const [echec, setEchec] = useState(false)
  const [filtres, setFiltres] = useState<Filtres>(() => filtresDepuisRecherche(window.location.search))
  const [ouverteId, setOuverteId] = useState<string | undefined>(undefined)
  const idRecherche = useId()
  const idTri = useId()

  useEffect(() => {
    const lire = () => lireDonnees().then((d) => { setDonnees(d); setEchec(false) }).catch(() => setEchec(true))
    void lire()
    return surDonneesChangees(() => { void lire() })
  }, [])

  // L'adresse suit les filtres, sans ajouter d'entrée à l'historique.
  useEffect(() => {
    const url = `${window.location.pathname}${rechercheDepuisFiltres(filtres)}${window.location.hash}`
    window.history.replaceState(window.history.state, '', url)
  }, [filtres])

  const entrees = useMemo(() => entreesDepuis(BIBLIOTHEQUE, donnees?.persos ?? []), [donnees])
  const resultats = useMemo(() => (donnees ? filtrer(entrees, filtres, donnees.contexte) : []), [entrees, filtres, donnees])
  const etats = useMemo(() => new Map(resultats.map((e) => [e.id, donnees ? etatDe(e, donnees.contexte) : { manques: [], contreIndications: [] }])), [resultats, donnees])

  // La fiche ouverte dans le panneau : retrouvée par son identifiant, avec de quoi la jouer et la comparer au profil.
  const ficheOuverte = useMemo((): DonneesFiche | undefined => {
    if (!donnees || ouverteId === undefined) return undefined
    const entree = entrees.find((e) => e.id === ouverteId)
    const source = BIBLIOTHEQUE.find((p) => p.id === ouverteId) ?? donnees.persos.find((p) => p.id === ouverteId)
    if (!entree || !source) return undefined
    return {
      entree, etat: etatDe(entree, donnees.contexte), forme: source, contexte: donnees.contexte,
      ...('reference' in source && source.reference !== undefined ? { reference: source.reference } : {}),
    }
  }, [donnees, entrees, ouverteId])

  if (donnees === undefined) {
    return (
      <main className="ecran chargement biblio" aria-busy={!echec}>
        {echec
          ? <Avertissement niveau="avertissement" titre="La bibliothèque ne s’est pas chargée">Recharge la page pour réessayer.</Avertissement>
          : <div className="biblio-grille" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <div key={i} className="silhouette grande" />)}</div>}
      </main>
    )
  }

  const maj = (partiel: Partial<Filtres>) => setFiltres((f) => ({ ...f, ...partiel }))
  const actifs = filtresActifs(filtres)
  const quiConviennent = resultats.filter((e) => convient(e, donnees.contexte)).length
  const aDesPersos = entrees.some((e) => e.origine === 'perso')
  const persosVides = filtres.origine === 'perso' && !aDesPersos

  return (
    <main className="ecran biblio">
      <header className="biblio-entete">
        <div className="pile">
          <p className="surtitre">Bibliothèque</p>
          <h1 className="titre">Les exercices</h1>
          <p className="texte-2">La banque dans laquelle ton plan puis l’assistant piochent. Les séances se lancent depuis ton téléphone.</p>
        </div>
        {/* Seule action en résine de l'écran ; elle s'active avec D-13. */}
        <button type="button" className="bouton principal biblio-creer" disabled title="Disponible dans un prochain lot : la création d’un exercice personnel">
          <strong>Créer un exercice</strong>
          <span>Bientôt disponible</span>
        </button>
      </header>

      <div className="biblio-corps">
        <aside className="biblio-filtres" aria-label="Filtres">
          <label className="champ" htmlFor={idRecherche}>
            Recherche
            <input id={idRecherche} type="search" value={filtres.texte} placeholder="Nom, consigne, auteur" autoComplete="off"
              onChange={(e) => maj({ texte: e.target.value })} />
          </label>

          <Groupe titre="Qualité">
            {QUALITES.map((q) => <Choix key={q} actif={filtres.qualites.includes(q)} onClic={() => maj({ qualites: bascule(filtres.qualites, q) })}>{nomQualite(q)}</Choix>)}
          </Groupe>
          <Groupe titre="Matériel ou terrain">
            {TERRAINS.map((t) => <Choix key={t.valeur} actif={filtres.terrains.includes(t.valeur)} onClic={() => maj({ terrains: bascule(filtres.terrains, t.valeur) })}>{t.nom}</Choix>)}
          </Groupe>
          <Groupe titre="Durée">
            {DUREES.map((d) => <Choix key={d.valeur} actif={filtres.duree === d.valeur} onClic={() => maj({ duree: filtres.duree === d.valeur ? null : d.valeur })}>{d.nom}</Choix>)}
          </Groupe>
          <Groupe titre="Prérequis">
            <Choix actif={filtres.prerequis === 'tous'} onClic={() => maj({ prerequis: 'tous' })}>Tous</Choix>
            <Choix actif={filtres.prerequis === 'conviennent'} onClic={() => maj({ prerequis: 'conviennent' })}>Seulement ceux qui me conviennent</Choix>
            <Choix actif={filtres.prerequis === 'pas_encore'} onClic={() => maj({ prerequis: 'pas_encore' })}>Ceux qui ne me conviennent pas encore</Choix>
          </Groupe>
          <Groupe titre="Preuve">
            {PREUVES.map((p) => <Choix key={p} actif={filtres.preuves.includes(p)} onClic={() => maj({ preuves: bascule(filtres.preuves, p) })}>{p}</Choix>)}
          </Groupe>
          <Groupe titre="Avec d’autres">
            <Choix actif={filtres.groupe} onClic={() => maj({ groupe: !filtres.groupe })}>Se prête au groupe</Choix>
            <Choix actif={filtres.partenaire} onClic={() => maj({ partenaire: !filtres.partenaire })}>Partenaire nécessaire</Choix>
          </Groupe>
          <Groupe titre="Origine">
            <Choix actif={filtres.origine === 'toutes'} onClic={() => maj({ origine: 'toutes' })}>Toutes</Choix>
            <Choix actif={filtres.origine === 'bibliotheque'} onClic={() => maj({ origine: 'bibliotheque' })}>Bibliothèque</Choix>
            <Choix actif={filtres.origine === 'perso'} onClic={() => maj({ origine: 'perso' })}>Mes exercices</Choix>
          </Groupe>
        </aside>

        <section className="biblio-resultats" aria-label="Résultats">
          <div className="biblio-barre">
            <p className="biblio-compteur donnee" aria-live="polite" aria-atomic="true">{phraseCompteur(resultats.length, quiConviennent)}</p>
            <label className="champ biblio-tri" htmlFor={idTri}>
              Trier par
              <select id={idTri} value={filtres.tri} onChange={(e) => maj({ tri: e.target.value as Filtres['tri'] })}>
                <option value="qualite">Qualité</option>
                <option value="duree">Durée</option>
                <option value="nom">Nom</option>
              </select>
            </label>
          </div>

          {actifs.length > 0 && (
            <ul className="biblio-actifs" aria-label="Filtres actifs">
              {actifs.map((a) => (
                <li key={a.cle}>
                  <button type="button" className="bouton-second" onClick={() => setFiltres(a.sans)} aria-label={`Retirer le filtre ${a.libelle}`}>
                    <Icone nom="fermer" taille={16} /> {a.libelle}
                  </button>
                </li>
              ))}
              <li><button type="button" className="bouton-texte" onClick={() => setFiltres({ ...FILTRES_VIDES, tri: filtres.tri })}>Tout retirer</button></li>
            </ul>
          )}

          {resultats.length === 0 ? (
            <div className="pile">
              {persosVides ? (
                <>
                  <p className="texte-2">Tu n’as pas encore d’exercice personnel. Ajoute ceux de tes livres avec leur page.</p>
                  <p className="annotation" aria-hidden="true">tes livres, ta page</p>
                </>
              ) : (
                <p className="texte-2">Aucun protocole ne correspond. Retire un filtre.</p>
              )}
            </div>
          ) : (
            <div className="biblio-grille">
              {resultats.map((e) => <FicheProtocole key={e.id} entree={e} etat={etats.get(e.id) ?? { manques: [], contreIndications: [] }} onOuvrir={() => setOuverteId(e.id)} />)}
            </div>
          )}
        </section>
      </div>
      {ficheOuverte && <FicheDetail donnees={ficheOuverte} onFermer={() => setOuverteId(undefined)} />}
    </main>
  )
}
