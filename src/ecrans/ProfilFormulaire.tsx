import { useState } from 'react'
import { COTATIONS_BLOC, COTATIONS_VOIE, ZONES, type Profil } from '../donnees/profil.ts'
import { SALLES } from '../donnees/salles.ts'

interface Props {
  initial: Profil
  titre: string
  libelleValider: string
  onValider: (p: Profil) => void
}

// Un groupe de boutons où l'on choisit une seule valeur.
function Choix<T extends string | number | boolean>({ legende, options, valeur, onChange, colonnes }: {
  legende: string; options: { valeur: T; nom: string }[]; valeur: T; onChange: (v: T) => void; colonnes: 'deux' | 'trois' | 'cinq'
}) {
  return (
    <fieldset className="question">
      <legend>{legende}</legend>
      <div className={`choix ${colonnes}`}>
        {options.map((o) => (
          <button type="button" key={String(o.valeur)} aria-pressed={o.valeur === valeur} onClick={() => onChange(o.valeur)}>{o.nom}</button>
        ))}
      </div>
    </fieldset>
  )
}

// Formulaire du profil, utilisé au premier lancement puis dans l'onglet Profil.
export function ProfilFormulaire({ initial, titre, libelleValider, onValider }: Props) {
  const [p, setP] = useState<Profil>(initial)
  const [enregistre, setEnregistre] = useState(false)
  const modifier = <C extends keyof Profil>(champ: C, valeur: Profil[C]) => { setP((avant) => ({ ...avant, [champ]: valeur })); setEnregistre(false) }
  const basculerDouleur = (zone: Profil['douleursEnCours'][number]) =>
    modifier('douleursEnCours', p.douleursEnCours.includes(zone) ? p.douleursEnCours.filter((z) => z !== zone) : [...p.douleursEnCours, zone])

  return (
    <form className="pile-large" onSubmit={(e) => { e.preventDefault(); onValider(p); setEnregistre(true) }}>
      <h1 className="titre moyen">{titre}</h1>

      <label className="champ">Prénom
        <input name="prenom" autoComplete="off" value={p.prenom} onChange={(e) => modifier('prenom', e.target.value)} />
      </label>

      <Choix legende="Tu grimpes surtout" colonnes="deux" valeur={p.disciplinePrincipale} onChange={(v) => modifier('disciplinePrincipale', v)}
        options={[{ valeur: 'bloc', nom: 'En bloc' }, { valeur: 'voie', nom: 'En voie' }]} />

      <div className="deux-champs">
        <label className="champ">Niveau max en bloc
          <select name="niveauBloc" value={p.niveauBloc} onChange={(e) => modifier('niveauBloc', e.target.value)}>
            {COTATIONS_BLOC.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="champ">Niveau max en voie
          <select name="niveauVoie" value={p.niveauVoie} onChange={(e) => modifier('niveauVoie', e.target.value)}>
            {COTATIONS_VOIE.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <div className="entete">
        <p className="libelle">Années de pratique</p>
        <div className="compteur">
          <button type="button" aria-label="Une année de moins" disabled={p.anneesPratique <= 0} onClick={() => modifier('anneesPratique', Math.max(0, p.anneesPratique - 1))}>−</button>
          <p className="chiffres" aria-live="polite">{p.anneesPratique}</p>
          <button type="button" aria-label="Une année de plus" onClick={() => modifier('anneesPratique', p.anneesPratique + 1)}>+</button>
        </div>
      </div>

      <Choix legende="La poutre, tu en fais" colonnes="trois" valeur={p.experiencePoutre} onChange={(v) => modifier('experiencePoutre', v)}
        options={[{ valeur: 'aucune', nom: 'Jamais' }, { valeur: 'occasionnelle', nom: 'Parfois' }, { valeur: 'reguliere', nom: 'Souvent' }]} />

      <Choix legende="Séances par semaine" colonnes="cinq" valeur={p.seancesParSemaine} onChange={(v) => modifier('seancesParSemaine', v)}
        options={[1, 2, 3, 4, 5].map((n) => ({ valeur: n, nom: String(n) }))} />

      <Choix legende="Tu grimpes souvent avec d’autres ?" colonnes="deux" valeur={p.grimpeSouventEnGroupe} onChange={(v) => modifier('grimpeSouventEnGroupe', v)}
        options={[{ valeur: true, nom: 'Oui' }, { valeur: false, nom: 'Non' }]} />

      <fieldset className="question">
        <legend>Une douleur en ce moment ?</legend>
        <div className="choix trois">
          {ZONES.map((z) => (
            <button type="button" key={z.valeur} aria-pressed={p.douleursEnCours.includes(z.valeur)} onClick={() => basculerDouleur(z.valeur)}>{z.nom}</button>
          ))}
        </div>
        <p className="texte-3">Ne touche rien si tout va bien. Une douleur déclarée écartera plus tard les exercices à risque.</p>
      </fieldset>

      <label className="champ">Ta salle
        <select name="salle" value={p.salleHabituelleId} onChange={(e) => modifier('salleHabituelleId', e.target.value)}>
          {SALLES.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
      </label>

      <label className="champ">Poids du corps en kg (facultatif)
        <input name="poids" inputMode="decimal" autoComplete="off" placeholder="Par exemple 68…" value={p.poidsCorpsKg ?? ''}
          onChange={(e) => { const n = Number(e.target.value.replace(',', '.')); modifier('poidsCorpsKg', e.target.value.trim() === '' || Number.isNaN(n) ? null : n) }} />
        <span className="texte-3">Sert seulement à comparer tes tests de force. Aucun objectif de poids dans l’app.</span>
      </label>

      <label className="champ">Ton point faible (facultatif)
        <input name="pointsFaibles" autoComplete="off" placeholder="Par exemple les bidoigts…" value={p.pointsFaibles} onChange={(e) => modifier('pointsFaibles', e.target.value)} />
      </label>

      <label className="champ">Ton objectif (facultatif)
        <input name="objectif" autoComplete="off" placeholder="Par exemple 7B en bloc…" value={p.objectif} onChange={(e) => modifier('objectif', e.target.value)} />
      </label>

      <button className="bouton principal centre" type="submit"><strong>{libelleValider}</strong></button>
      <p className="texte-3" role="status" aria-live="polite">{enregistre ? 'Profil enregistré.' : ''}</p>
    </form>
  )
}
