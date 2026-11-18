// Un faux serveur pour les tests (et pour F2-09, F2-11) : mêmes règles que le déclencheur SQL, sans réseau.
import type { LigneEnvoyee, LigneRecue, ServeurDocuments } from './synchro.ts'

export type LigneMemoire = LigneRecue & { modifie_le: string; supprime_le: string | null }

export type ServeurMemoire = ServeurDocuments & {
  /** Les lignes stockées, par clé « type/id ». */
  lignes: Map<string, LigneMemoire>
  /** Appelé au début d'`envoyer` : sert à simuler une écriture locale pendant l'envoi. */
  avantEnvoi?: () => Promise<void>
  /** Nombre d'appels à `envoyer` (pour vérifier qu'on n'envoie pas deux fois). */
  nombreEnvois: number
}

export function serveurMemoire(): ServeurMemoire {
  let horloge = 0 // horloge fictive : une seconde de plus à chaque écriture
  const serveur: ServeurMemoire = {
    lignes: new Map(),
    nombreEnvois: 0,

    async envoyer(lignes: LigneEnvoyee[]) {
      serveur.nombreEnvois++
      await serveur.avantEnvoi?.()
      for (const ligne of lignes) {
        const cle = `${ligne.type}/${ligne.id}`
        const existante = serveur.lignes.get(cle)
        // Comme le déclencheur SQL : une version plus ancienne ne remplace pas la version gardée.
        if (existante && Date.parse(ligne.modifie_le) < Date.parse(existante.modifie_le)) continue
        horloge++
        serveur.lignes.set(cle, {
          type: ligne.type,
          id: ligne.id,
          contenu: structuredClone(ligne.contenu),
          modifie_le: ligne.modifie_le,
          supprime_le: ligne.supprime_le,
          recu_le: new Date(Date.UTC(2026, 0, 1) + horloge * 1000).toISOString(),
        })
      }
    },

    async recevoirApres(apres, limite) {
      const seuil = apres === null ? -Infinity : Date.parse(apres)
      return [...serveur.lignes.values()]
        .filter((l) => Date.parse(l.recu_le) > seuil)
        .sort((a, b) => Date.parse(a.recu_le) - Date.parse(b.recu_le))
        .slice(0, limite)
        .map((l) => structuredClone({ type: l.type, id: l.id, contenu: l.contenu, recu_le: l.recu_le }))
    },

    async lireUn(type, id) {
      const l = serveur.lignes.get(`${type}/${id}`)
      return l ? structuredClone({ type: l.type, id: l.id, contenu: l.contenu, recu_le: l.recu_le }) : null
    },
  }
  return serveur
}
