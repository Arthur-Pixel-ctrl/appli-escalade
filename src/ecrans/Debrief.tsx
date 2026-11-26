import { useEffect, useState } from 'react'
import { lireSeances, type SeanceRealisee } from '../donnees/base.ts'
import type { SeancePlanifiee } from '../donnees/modele.ts'
import { lireSeancePlanifiee } from '../donnees/plan.ts'
import { surDonneesChangees } from '../donnees/stockage.ts'
import { surEtatSynchro } from '../synchro/automatique.ts'
import { nomDuJour } from './bureau/avertissementsPlan.ts'
import { useCompteLie } from './donneesTelephone.ts'
import { chargeSeance, chiffresBlocs, parCouleur, precedente, prochaineSeanceDurePossible, resume, seancesDeLaSemaine } from '../donnees/debrief.ts'
import { PastillePrise } from '../composants/PastillePrise.tsx'
import { Avertissement } from '../composants/Avertissement.tsx'
import { MisesEnGarde } from './MisesEnGarde.tsx'
import type { Salle } from '../donnees/salles.ts'

const dateLongue = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const jourEtHeure = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', hour: 'numeric' })
const nombre = new Intl.NumberFormat('fr-FR')

function duree(min: number) {
  return min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`
}

// Où en est la séance : toujours gardée sur ce téléphone ; envoyée seulement si l'appareil est lié à un compte (`aEnvoyer`).
function mentionEnvoi(s: SeanceRealisee, compteLie: boolean): string {
  const base = 'Enregistrée sur ce téléphone'
  if (!compteLie) return base
  return (s as { aEnvoyer?: number }).aEnvoyer === 1 ? `${base} · envoi au retour du réseau` : `${base} · envoyée`
}

// Fin de séance, second temps : le débrief complet. Tout est calculé à partir des séances enregistrées.
export function Debrief({ seanceId, salle, onFermer }: { seanceId: string; salle: Salle; onFermer: () => void }) {
  const [toutes, setToutes] = useState<SeanceRealisee[] | null>(null)
  const [echec, setEchec] = useState(false)
  // Les repères s'ouvrent ici même : pas besoin de changer l'écran affiché par l'app.
  const [reperesOuverts, setReperesOuverts] = useState(false)
  const [prevue, setPrevue] = useState<SeancePlanifiee | undefined>(undefined)
  const compteLie = useCompteLie()
  // Relu quand l'envoi avance : la mention « envoyée » remplace « envoi au retour du réseau » sans quitter l'écran.
  useEffect(() => {
    const lire = () => { lireSeances().then(setToutes).catch(() => setEchec(true)) }
    lire()
    const arrets = [surEtatSynchro(lire), surDonneesChangees(lire)]
    return () => arrets.forEach((arreter) => arreter())
  }, [seanceId])
  const idPrevue = toutes?.find((x) => x.id === seanceId)?.seancePlanifieeId
  useEffect(() => {
    if (idPrevue === undefined) return
    let actif = true
    lireSeancePlanifiee(idPrevue).then((p) => { if (actif) setPrevue(p) }).catch(() => {})
    return () => { actif = false }
  }, [idPrevue])

  if (reperesOuverts) return <MisesEnGarde libelleFermer="Retour au débrief" onFermer={() => setReperesOuverts(false)} />

  if (echec) {
    return (
      <main className="ecran">
        <h1 className="titre moyen">Débrief indisponible</h1>
        <p className="texte-2">Les séances n’ont pas pu être lues. Ferme complètement l’app puis rouvre-la.</p>
        <button className="bouton principal centre" onClick={onFermer}><strong>Retour</strong></button>
      </main>
    )
  }

  if (!toutes) {
    // Silhouettes à la place d'une page vide : une grande, deux lignes.
    return (
      <main className="ecran" aria-busy="true">
        <p className="pour-lecteur" role="status">Chargement du débrief…</p>
        <div className="silhouette grande" />
        <div className="silhouette ligne-silhouette" />
        <div className="silhouette ligne-silhouette" />
      </main>
    )
  }
  const s = toutes.find((x) => x.id === seanceId)
  if (!s) {
    return (
      <main className="ecran">
        <h1 className="titre moyen">Séance introuvable</h1>
        <button className="bouton principal centre" onClick={onFermer}><strong>Retour</strong></button>
      </main>
    )
  }

  const blocs = chiffresBlocs(s)
  const semaine = seancesDeLaSemaine(s, toutes)
  const chargeSemaine = semaine.reduce((total, x) => total + chargeSeance(x), 0)
  const dures = semaine.filter((x) => x.durete === 'dure').length
  const avant = precedente(s, toutes)
  const etapesFaites = s.etapes.filter((e) => e.statut === 'faite').length
  const couleurs = parCouleur(s, salle.couleurs.map((c) => c.nom))
  const hex = (nom: string) => salle.couleurs.find((c) => c.nom === nom)?.hex

  return (
    <main className="ecran">
      <div className="pile">
        <p className="surtitre">{dateLongue.format(new Date(s.creeLe))} · {s.mode === 'groupe' ? 'en groupe' : 'seul'} · {duree(s.dureeMin)}</p>
        <h1 className="titre">Débrief</h1>
        <p className="texte-2">{resume(s)}</p>
        {s.seancePlanifieeId !== undefined && (
          <p className="texte-2">Séance prévue : {prevue ? `${nomDuJour(prevue.date)}, ${prevue.solo.nom}` : 'séance du plan'} · faite</p>
        )}
        <p className="mention" role="status">{mentionEnvoi(s, compteLie)}</p>
      </div>

      {s.douleur && (
        <Avertissement niveau="arret" titre="Douleur signalée" correction={{ libelle: 'Relire les mises en garde', action: () => setReperesOuverts(true) }}>
          Relis les repères avant ta prochaine séance.
        </Avertissement>
      )}

      {/* Le total est dans le chiffre (« 1/6 ») : la légende tient sur une ligne. */}
      <div className="chiffres-cles chiffres">
        {s.mode === 'groupe'
          ? <><div><b className="accent">{blocs.enchaines}/{blocs.tentes}</b><span>blocs enchaînés</span></div>
              <div><b>{blocs.essais}</b><span>essais</span></div></>
          : <><div><b className="accent">{etapesFaites}/{s.etapes.length}</b><span>étapes faites</span></div>
              <div><b>{s.dureeMin}</b><span>minutes</span></div></>}
        <div><b>{s.effortPercu}/10</b><span>effort</span></div>
      </div>

      {s.objectifs.length > 0 && (
        <section className="pile">
          <h2 className="sous-titre">Objectifs</h2>
          <div>
            {s.objectifs.map((o) => (
              <div key={o.libelle} className="ligne"><span>{o.libelle}</span><span className="chiffres">{Math.min(o.fait, o.cible)} sur {o.cible}</span></div>
            ))}
          </div>
        </section>
      )}

      {s.mode !== 'groupe' && (
        <section className="pile">
          <h2 className="sous-titre">Étapes</h2>
          <div>
            {s.etapes.map((e) => (
              <div key={e.titre} className="ligne"><span>{e.titre}</span><span>{e.statut === 'faite' ? 'Faite' : e.statut === 'passee' ? 'Passée' : 'Non faite'}</span></div>
            ))}
          </div>
        </section>
      )}

      {couleurs.length > 0 && (
        <section className="pile">
          <h2 className="sous-titre">Blocs par couleur</h2>
          <table className="tableau chiffres">
            <thead><tr><th scope="col">Couleur</th><th scope="col">Tentés</th><th scope="col">Flash</th><th scope="col">Enchaînés</th></tr></thead>
            <tbody>
              {couleurs.map((l) => (
                <tr key={l.couleur}>
                  <th scope="row"><PastillePrise taille="petite" couleur={hex(l.couleur) ?? 'var(--surface-creuse)'} nom={l.couleur} />{l.couleur}</th>
                  <td>{l.tentes}</td><td>{l.flashs}</td><td>{l.enchaines}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="pile">
        <h2 className="sous-titre">Ta semaine</h2>
        <div>
          <div className="ligne"><span>Charge de cette séance</span><span className="chiffres">{nombre.format(chargeSeance(s))}</span></div>
          <div className="ligne"><span>Charge de la semaine</span><span className="chiffres">{nombre.format(chargeSemaine)}</span></div>
          <div className="ligne"><span>Séances cette semaine</span><span className="chiffres">{semaine.length}, dont {dures} dure{dures > 1 ? 's' : ''}</span></div>
        </div>
        <p className="texte-3">
          {avant
            ? s.mode === 'groupe'
              ? `Séance en groupe précédente : ${chiffresBlocs(avant).enchaines} blocs enchaînés sur ${chiffresBlocs(avant).tentes}, ${chiffresBlocs(avant).essais} essais, charge ${nombre.format(chargeSeance(avant))}.`
              : `Séance solo précédente : ${avant.etapes.filter((e) => e.statut === 'faite').length} étapes faites sur ${avant.etapes.length}, charge ${nombre.format(chargeSeance(avant))}.`
            : 'Première séance de ce type : la comparaison apparaîtra dès la prochaine.'}
          {' '}La charge est l’effort ressenti multiplié par la durée en minutes.
        </p>
      </section>

      <section className="pile">
        <h2 className="sous-titre">La suite</h2>
        <div>
          {s.durete === 'dure' && <div className="ligne"><span>Ce soir</span><span>Féculents et protéines au repas</span></div>}
          {s.durete === 'dure' && <div className="ligne"><span>Prochaine séance dure</span><span>Pas avant {jourEtHeure.format(prochaineSeanceDurePossible(s))}</span></div>}
          {s.peau < 3 && <div className="ligne"><span>Peau</span><span>{s.peau === 1 ? 'Abîmée : laisse-la récupérer' : 'À surveiller'}</span></div>}
          {s.douleur && <div className="ligne"><span>Douleur signalée</span><span>Relis les mises en garde</span></div>}
        </div>
      </section>

      <button className="bouton principal centre" onClick={onFermer}><strong>Terminer</strong></button>
    </main>
  )
}
