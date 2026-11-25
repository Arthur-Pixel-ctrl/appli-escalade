import { useId, useMemo, useState, type PointerEvent } from 'react'
import {
  DUREES, FILTRES_VIDES, QUALITES, convient, etatDe, filtrer, nomQualite, phraseCompteur, type ContexteFiltre, type EntreeBibliotheque, type Filtres,
} from '../donnees/bibliotheque/filtres.ts'

// Version compacte de la bibliothèque (D-11) pour la colonne de gauche du plan : recherche, deux filtres rapides,
// interrupteur « Seulement ceux qui me conviennent », fiches avec « Voir la fiche » et « Ajouter à… ».
// Une fiche dont les prérequis manquent reste ajoutable (avertir sans bloquer).
export function RailBibliotheque({ entrees, contexte, remplacementDe, onGlisser, onVoir, onAjouter, onAnnulerRemplacement }: {
  entrees: EntreeBibliotheque[]
  contexte: ContexteFiltre
  /** Nom de l'étape en cours de remplacement : les boutons deviennent « Remplacer par celle-ci ». */
  remplacementDe: string | null
  /** Début d'un glisser depuis la poignée d'une fiche (D-17) ; absent = pas de poignée (ex. pendant un remplacement). */
  onGlisser?: (e: PointerEvent<HTMLElement>, entree: EntreeBibliotheque) => void
  onVoir: (id: string) => void
  onAjouter: (entree: EntreeBibliotheque) => void
  onAnnulerRemplacement: () => void
}) {
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_VIDES)
  const idRecherche = useId()
  const idQualite = useId()
  const idDuree = useId()
  const resultats = useMemo(() => filtrer(entrees, filtres, contexte), [entrees, filtres, contexte])
  const quiConviennent = resultats.filter((e) => convient(e, contexte)).length
  const seulementConvenables = filtres.prerequis === 'conviennent'
  const maj = (partiel: Partial<Filtres>) => setFiltres((f) => ({ ...f, ...partiel }))
  const filtreActif = filtres.texte !== '' || filtres.qualites.length > 0 || filtres.duree !== null || seulementConvenables

  return (
    <aside className="rail" aria-label="Bibliothèque">
      <h2 className="titre moyen rail-titre">Bibliothèque</h2>
      {remplacementDe !== null && (
        <div className="information rail-remplacement" role="status">
          <span>Tu remplaces « {remplacementDe} ». Choisis la nouvelle fiche.</span>
          <button type="button" className="bouton-texte bouton-en-ligne" onClick={onAnnulerRemplacement}>Annuler</button>
        </div>
      )}
      <label className="champ" htmlFor={idRecherche}>
        Recherche
        <input id={idRecherche} type="search" value={filtres.texte} placeholder="Nom, consigne, auteur" autoComplete="off" onChange={(e) => maj({ texte: e.target.value })} />
      </label>
      <div className="rail-filtres">
        <div className="champ">
          <label htmlFor={idQualite}>Qualité</label>
          <select id={idQualite} value={filtres.qualites[0] ?? ''} onChange={(e) => maj({ qualites: e.target.value === '' ? [] : [e.target.value as Filtres['qualites'][number]] })}>
            <option value="">Toutes</option>
            {QUALITES.map((q) => <option key={q} value={q}>{nomQualite(q)}</option>)}
          </select>
        </div>
        <div className="champ">
          <label htmlFor={idDuree}>Durée</label>
          <select id={idDuree} value={filtres.duree === null ? '' : String(filtres.duree)} onChange={(e) => {
            const v = e.target.value
            maj({ duree: v === '' ? null : v === 'plus' ? 'plus' : (Number(v) as 10 | 20 | 40) })
          }}>
            <option value="">Toutes</option>
            {DUREES.map((d) => <option key={d.valeur} value={String(d.valeur)}>{d.nom}</option>)}
          </select>
        </div>
      </div>
      <label className="case">
        <input type="checkbox" checked={seulementConvenables} onChange={(e) => maj({ prerequis: e.target.checked ? 'conviennent' : 'tous' })} />
        Seulement ceux qui me conviennent
      </label>
      <p className="donnee rail-compteur" aria-live="polite" aria-atomic="true">{phraseCompteur(resultats.length, quiConviennent)}</p>
      {filtreActif && resultats.length === 0 && <p className="texte-2">Aucun protocole ne correspond.</p>}
      {filtreActif && <button type="button" className="bouton-texte rail-vider" onClick={() => setFiltres(FILTRES_VIDES)}>Retirer les filtres</button>}
      <ul className="rail-liste">
        {resultats.map((e) => {
          const manques = etatDe(e, contexte).manques
          return (
            <li key={e.id} className={`fiche rail-fiche${manques.length > 0 ? ' pointille' : ''}`}>
              {onGlisser && (
                <span className="poignee rail-poignee" aria-hidden="true" title="Glisser vers un jour ou une séance" onContextMenu={(ev) => ev.preventDefault()}
                  onPointerDown={(ev) => onGlisser(ev, e)}>⠿</span>
              )}
              <p className="surtitre">{nomQualite(e.qualite)} · {e.dureeMin} min</p>
              <p className="rail-nom">{e.nom}</p>
              <ul className="fiche-grille-etiquettes">
                {manques.length > 0 && <li><span className="etiquette attente">Prérequis</span></li>}
                {e.aLaMain !== undefined && <li><span className="etiquette contour">À la main</span></li>}
                {e.origine === 'perso' && <li><span className="etiquette">Perso</span></li>}
              </ul>
              {manques.length > 0 && <p className="texte-3">{manques.join(' ; ')}</p>}
              <div className="rail-actions">
                <button type="button" className="bouton-texte" aria-haspopup="dialog" aria-label={`Voir la fiche : ${e.nom}`} onClick={() => onVoir(e.id)}>Voir la fiche</button>
                <button type="button" className="bouton-second" aria-label={`${remplacementDe !== null ? 'Remplacer par' : 'Ajouter à'} : ${e.nom}`} onClick={() => onAjouter(e)}>
                  {remplacementDe !== null ? 'Remplacer par celle-ci' : 'Ajouter à…'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
