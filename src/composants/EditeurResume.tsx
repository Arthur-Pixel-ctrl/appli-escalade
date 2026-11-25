import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Confirmation } from './Confirmation.tsx'
import {
  etatDe, nomQualite, normaliser, texteContreIndication, type ContexteFiltre, type EntreeBibliotheque,
} from '../donnees/bibliotheque/filtres.ts'
import type { PartieSeance, SeancePlanifiee, VersionSolo } from '../donnees/modele.ts'
import { LONGUEUR_MAX_RECOMMANDATION, NB_PARTIES_MAX, dureeVersionSolo } from '../donnees/niveaux.ts'
import { formatDuree } from '../ecrans/bureau/VuePhase.outils.ts'
import { partiesAffichees, phraseRaison, recommandationAffichee, trierFiches, type FicheVerif } from '../regles/index.ts'
import {
  DUREES_PARTIE, LONGUEUR_MAX_TITRE_PARTIE, aPlusieursParties, ajouterPartie, ecrireDureeSimple, ecrireRecommandation, figerParties,
  figerRecommandation, modifierPartie, monterPartie, peutAjouterPartie, poserPrincipal, recalculerGrandesLignes, retirerPartie,
  revenirAuTexteProposé,
} from './EditeurResume.outils.ts'

type Principal = NonNullable<PartieSeance['principal']>

// Liste de choix d'un exercice, triée par `trierFiches` (G-01) : ceux qui te conviennent d'abord, puis les autres
// avec leur raison. Tout reste choisissable : on avertit sans bloquer, l'avertissement vient du moteur (D-18).
export function ChoixExercice({ titre, entrees, contexte, filtre, onChoisir, onFermer }: {
  titre: string
  entrees: EntreeBibliotheque[]
  contexte: ContexteFiltre
  /** Garde seulement certaines entrées (par exemple celles qu'on sait recopier en étape). */
  filtre?: (e: EntreeBibliotheque) => boolean
  onChoisir: (e: EntreeBibliotheque) => void
  onFermer: () => void
}) {
  const [recherche, setRecherche] = useState('')
  const idRecherche = useId()
  const champ = useRef<HTMLInputElement>(null)
  useEffect(() => { champ.current?.focus() }, [])

  const { convenables, autres } = useMemo(() => {
    const mot = normaliser(recherche)
    const gardees = entrees.filter((e) => (filtre ? filtre(e) : true) && (mot === '' || normaliser(`${e.nom} ${e.consigne}`).includes(mot)))
    const parId = new Map(gardees.map((e) => [e.fiche.id, e]))
    const zones = contexte.douleurs.filter((d) => d.resolueLe === undefined).map((d) => d.zone)
    const tri = trierFiches(gardees.map((e) => e.fiche), contexte.profil, zones)
    return {
      convenables: tri.disponibles.flatMap((f) => parId.get(f.id) ?? []),
      autres: tri.indisponibles.flatMap((x) => {
        const e = parId.get(x.fiche.id)
        return e ? [{ entree: e, raison: phraseRaison(x, contexte.profil, zones) }] : []
      }),
    }
  }, [entrees, filtre, recherche, contexte])

  const ligne = (e: EntreeBibliotheque, raison?: string) => {
    const etat = etatDe(e, contexte)
    return (
      <li key={e.id} className={`fiche choix-exercice-ligne${raison ? ' pointille' : ''}`}>
        <div className="choix-exercice-texte">
          <p className="surtitre">{nomQualite(e.qualite)} · {e.dureeMin} min</p>
          <p className="rail-nom">{e.nom}</p>
          <ul className="fiche-grille-etiquettes">
            {etat.manques.length > 0 && <li><span className="etiquette attente" title={etat.manques.join(' ; ')}>Prérequis</span></li>}
            {e.origine === 'perso' && <li><span className="etiquette">Perso</span></li>}
          </ul>
          {etat.contreIndications.length > 0 && <p className="texte-3 message-erreur">{texteContreIndication(etat.contreIndications)}</p>}
          {raison && <p className="texte-3">{raison}</p>}
        </div>
        <button type="button" className="bouton-second" aria-label={`Choisir : ${e.nom}`} onClick={() => onChoisir(e)}>Choisir</button>
      </li>
    )
  }

  return (
    <section className="choix-exercice pile" aria-label={titre}
      onKeyDown={(ev) => { if (ev.key === 'Escape') { ev.stopPropagation(); onFermer() } }}>
      <h3 className="libelle">{titre}</h3>
      <div className="champ">
        <label htmlFor={idRecherche}>Chercher dans la bibliothèque</label>
        <input ref={champ} id={idRecherche} type="search" value={recherche} autoComplete="off" placeholder="Nom ou consigne"
          onChange={(e) => setRecherche(e.target.value)} />
      </div>
      <p className="texte-3" aria-live="polite">{convenables.length + autres.length} exercices · {convenables.length} te conviennent</p>
      <div className="choix-exercice-liste">
        {convenables.length > 0 && <ul className="pile">{convenables.map((e) => ligne(e))}</ul>}
        {autres.length > 0 && (
          <>
            <p className="surtitre">À la main seulement ou déconseillés : tu peux quand même les choisir</p>
            <ul className="pile">{autres.map((x) => ligne(x.entree, x.raison))}</ul>
          </>
        )}
        {convenables.length + autres.length === 0 && <p className="texte-2">Aucun exercice ne correspond.</p>}
      </div>
      <button type="button" className="bouton-texte" onClick={onFermer}>Fermer la liste</button>
    </section>
  )
}

function ChampDuree({ libelle, valeur, onChoisir }: { libelle: string; valeur: number | undefined; onChoisir: (n: number) => void }) {
  const id = useId()
  // Une durée écrite avant (par exemple 43 min, recopiée d'un calcul) reste choisissable.
  const options = valeur !== undefined && !DUREES_PARTIE.includes(valeur) ? [...DUREES_PARTIE, valeur].sort((a, b) => a - b) : DUREES_PARTIE
  return (
    <div className="champ">
      <label htmlFor={id}>{libelle}</label>
      <select id={id} value={valeur ?? ''} onChange={(e) => e.target.value !== '' && onChoisir(Number(e.target.value))}>
        {valeur === undefined && <option value="">Non précisée</option>}
        {options.map((n) => <option key={n} value={n}>{formatDuree(n) ?? `${n} min`}</option>)}
      </select>
    </div>
  )
}

function ChampTexteCourt({ libelle, valeur, max, placeholder, onChanger }: {
  libelle: string; valeur: string; max: number; placeholder?: string; onChanger: (texte: string) => void
}) {
  const id = useId()
  return (
    <div className="champ">
      <label htmlFor={id}>{libelle}</label>
      <input id={id} value={valeur} maxLength={max} {...(placeholder ? { placeholder } : {})} onChange={(e) => onChanger(e.target.value)} />
      <span className="texte-3 donnee" aria-live="polite">{valeur.length} sur {max}</span>
    </div>
  )
}

// L'exercice principal choisi, avec ses étiquettes ; « Choisir » ouvre la liste, « Retirer » l'enlève.
function ExercicePrincipal({ principal, entrees, contexte, contexteNom, onChoisir, onRetirer }: {
  principal: Principal | undefined; entrees: Map<string, EntreeBibliotheque>; contexte: ContexteFiltre; contexteNom: string
  onChoisir: () => void; onRetirer: () => void
}) {
  const entree = principal ? entrees.get(principal.refId) : undefined
  const etat = entree ? etatDe(entree, contexte) : undefined
  return (
    <div className="exercice-principal">
      <p className="libelle">Exercice principal <span className="texte-3">(facultatif)</span></p>
      <p className="texte-2">{principal ? (entree?.nom ?? `Exercice inconnu (${principal.refId})`) : 'Aucun exercice choisi.'}</p>
      {etat && (
        <>
          <ul className="fiche-grille-etiquettes">
            {etat.manques.length > 0 && <li><span className="etiquette attente" title={etat.manques.join(' ; ')}>Prérequis</span></li>}
          </ul>
          {etat.contreIndications.length > 0 && <p className="texte-3 message-erreur">{texteContreIndication(etat.contreIndications)}</p>}
        </>
      )}
      <div className="exercice-principal-actions">
        <button type="button" className="bouton-second" aria-label={`${principal ? 'Changer' : 'Choisir'} l’exercice principal${contexteNom}`} onClick={onChoisir}>
          {principal ? 'Changer' : 'Choisir dans la bibliothèque'}
        </button>
        {principal && <button type="button" className="bouton-texte" aria-label={`Retirer l’exercice principal${contexteNom}`} onClick={onRetirer}>Retirer l’exercice</button>}
      </div>
    </div>
  )
}

interface Props {
  seance: SeancePlanifiee
  niveau: 'simple' | 'grandes_lignes'
  fiches: Record<string, FicheVerif>
  entrees: Map<string, EntreeBibliotheque>
  contexte: ContexteFiltre
  onChanger: (solo: VersionSolo) => void
  onVoirEtapes: () => void
}

// Éditeur des niveaux « simple » et « grandes lignes » de la version solo (O-05).
// Il n'écrit que `recommandation` et `parties` ; les étapes restent intactes (R-9).
export function EditeurResume({ seance, niveau, fiches, entrees, contexte, onChanger, onVoirEtapes }: Props) {
  const solo = seance.solo
  const aDesEtapes = solo.etapes.length > 0
  // Partie dont on choisit l'exercice principal (0 en simple) ; `null` = liste fermée.
  const [choixPour, setChoixPour] = useState<number | null>(null)
  const [recalculer, setRecalculer] = useState(false)
  const declencheur = useRef<HTMLElement | null>(null)
  const listeEntrees = useMemo(() => [...entrees.values()], [entrees])

  const ouvrirChoix = (index: number) => { declencheur.current = document.activeElement as HTMLElement | null; setChoixPour(index) }
  const fermerChoix = () => { setChoixPour(null); declencheur.current?.focus() }
  const choisir = (entree: EntreeBibliotheque) => {
    if (choixPour === null) return
    onChanger(poserPrincipal(solo, choixPour, { source: entree.origine, refId: entree.id }))
    fermerChoix()
  }

  const lignesEtapes = aDesEtapes && (
    <p className="texte-3">
      {solo.etapes.length} étape{solo.etapes.length > 1 ? 's' : ''} enregistrée{solo.etapes.length > 1 ? 's' : ''}, cachée{solo.etapes.length > 1 ? 's' : ''} à ce niveau.{' '}
      <button type="button" className="bouton-texte bouton-en-ligne" onClick={onVoirEtapes}>Voir les étapes</button>
    </p>
  )

  const selecteur = choixPour !== null && (
    <ChoixExercice titre="Choisir l’exercice principal" entrees={listeEntrees} contexte={contexte} onChoisir={choisir} onFermer={fermerChoix} />
  )

  // ——— Simple : recommandation, durée, exercice principal ———
  if (niveau === 'simple') {
    const ecrite = solo.recommandation !== undefined && solo.recommandation.trim() !== ''
    const proposee = recommandationAffichee(solo, seance.qualite, solo.durete, fiches)
    const partie = solo.parties?.[0]
    return (
      <section className="editeur-resume pile-large" aria-label="Séance simple">
        <div className="pile">
          {aDesEtapes && !ecrite ? (
            <>
              <p className="libelle">Recommandation (proposée depuis les étapes)</p>
              <p className="texte-2 recommandation-proposee">{proposee}</p>
              <button type="button" className="bouton-texte" onClick={() => onChanger(figerRecommandation(solo, proposee))}>Modifier le texte</button>
            </>
          ) : (
            <>
              <ChampTexteCourt libelle="Recommandation" valeur={solo.recommandation ?? ''} max={LONGUEUR_MAX_RECOMMANDATION} placeholder={proposee}
                onChanger={(t) => onChanger(ecrireRecommandation(solo, t))} />
              {ecrite && <button type="button" className="bouton-texte" onClick={() => onChanger(revenirAuTexteProposé(solo))}>Revenir au texte proposé</button>}
            </>
          )}
        </div>
        {aDesEtapes ? (
          <p className="texte-2">Durée : <span className="donnee">{formatDuree(dureeVersionSolo(solo)) ?? '—'}</span> (somme des étapes)</p>
        ) : aPlusieursParties(solo) ? (
          <p className="texte-2">
            Durée : <span className="donnee">{formatDuree(dureeVersionSolo(solo)) ?? '—'}</span> ({solo.parties?.length} parties). Pour les retoucher, choisis « Grandes lignes ».
          </p>
        ) : (
          <>
            <ChampDuree libelle="Durée" valeur={partie?.dureeMin} onChoisir={(n) => onChanger(ecrireDureeSimple(solo, n))} />
            <ExercicePrincipal principal={partie?.principal} entrees={entrees} contexte={contexte} contexteNom=""
              onChoisir={() => ouvrirChoix(0)} onRetirer={() => onChanger(poserPrincipal(solo, 0, null))} />
            {selecteur}
          </>
        )}
        {lignesEtapes}
      </section>
    )
  }

  // ——— Grandes lignes : 1 à 5 parties ———
  const ecrites = solo.parties !== undefined && solo.parties.length > 0
  if (aDesEtapes && !ecrites) {
    const calculees = partiesAffichees(solo, seance.qualite, fiches)
    return (
      <section className="editeur-resume pile-large" aria-label="Grandes lignes">
        <p className="libelle">Grandes lignes (proposées depuis les étapes)</p>
        <ol className="parties-liste">
          {calculees.map((p, i) => (
            <li key={i} className="fiche partie-ligne">
              <p className="rail-nom">{p.titre} <span className="donnee">{formatDuree(p.dureeMin) ?? `${p.dureeMin} min`}</span></p>
              {p.principal && <p className="texte-3">Principal : {entrees.get(p.principal.refId)?.nom ?? p.principal.refId}</p>}
              {p.consigne && <p className="texte-3">{p.consigne}</p>}
            </li>
          ))}
        </ol>
        <button type="button" className="bouton-texte" onClick={() => onChanger(figerParties(solo, calculees))}>Modifier le texte</button>
        {lignesEtapes}
      </section>
    )
  }

  const parties = solo.parties ?? []
  return (
    <section className="editeur-resume pile-large" aria-label="Grandes lignes">
      {parties.length === 0 && <p className="texte-2">Aucune partie pour l’instant. Ajoute-en une : une séance compte 1 à {NB_PARTIES_MAX} parties.</p>}
      <ol className="parties-liste">
        {parties.map((p, i) => {
          const nom = `, partie ${i + 1}`
          return (
            <li key={i}>
              <fieldset className="objectif-groupe partie-editeur">
                <legend className="libelle">Partie {i + 1}</legend>
                <ChampTexteCourt libelle="Titre" valeur={p.titre} max={LONGUEUR_MAX_TITRE_PARTIE} onChanger={(t) => onChanger(modifierPartie(solo, i, { titre: t }))} />
                <ChampDuree libelle="Durée" valeur={p.dureeMin} onChoisir={(n) => onChanger(modifierPartie(solo, i, { dureeMin: n }))} />
                <ExercicePrincipal principal={p.principal} entrees={entrees} contexte={contexte} contexteNom={nom}
                  onChoisir={() => ouvrirChoix(i)} onRetirer={() => onChanger(poserPrincipal(solo, i, null))} />
                <ChampTexteCourt libelle="Consigne" valeur={p.consigne ?? ''} max={LONGUEUR_MAX_RECOMMANDATION} onChanger={(t) => onChanger(modifierPartie(solo, i, { consigne: t }))} />
                <div className="partie-actions">
                  <button type="button" className="bouton-texte" disabled={i === 0} aria-label={`Monter la partie ${i + 1}`} onClick={() => onChanger(monterPartie(solo, i, -1))}>Monter</button>
                  <button type="button" className="bouton-texte" disabled={i === parties.length - 1} aria-label={`Descendre la partie ${i + 1}`} onClick={() => onChanger(monterPartie(solo, i, 1))}>Descendre</button>
                  <button type="button" className="bouton-texte" aria-label={`Retirer la partie ${i + 1}`} onClick={() => onChanger(retirerPartie(solo, i))}>Retirer</button>
                </div>
              </fieldset>
              {choixPour === i && selecteur}
            </li>
          )
        })}
      </ol>
      {peutAjouterPartie(solo) && <button type="button" className="bouton-second" onClick={() => onChanger(ajouterPartie(solo))}>Ajouter une partie</button>}
      {aDesEtapes && (
        <>
          <button type="button" className="bouton-texte" onClick={() => setRecalculer(true)}>Recalculer les grandes lignes</button>
          <Confirmation ouverte={recalculer} titre="Recalculer les grandes lignes ?"
            texte="Tes grandes lignes écrites seront remplacées par celles calculées depuis les étapes."
            libelleAction="Recalculer" onRester={() => setRecalculer(false)}
            onAction={() => { setRecalculer(false); onChanger(recalculerGrandesLignes(solo)) }} />
        </>
      )}
      {lignesEtapes}
    </section>
  )
}
