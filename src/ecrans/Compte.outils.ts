// Petites fonctions de l'écran Compte, dans un fichier à part pour pouvoir les tester sans afficher l'écran.
import { jourLocal } from '../donnees/base.ts'
import { ecrireEtat, lireEtat } from '../donnees/stockage.ts'
import { delierAppareil, sauvegardeComplete } from '../synchro/reprise.ts'

/** Même geste que « Sauvegarder mes données » de l'écran Profil, avec toutes les tables. */
function telechargerFichier(contenu: string): void {
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([contenu], { type: 'application/json' }))
  lien.download = `appli-escalade-sauvegarde-${jourLocal()}.json`
  lien.click()
  URL.revokeObjectURL(lien.href)
}

/**
 * Premier temps de « sauvegarder puis effacer » : crée le fichier, et seulement cela.
 * Le navigateur ne dit pas si le fichier a vraiment été enregistré : l'effacement est un second temps, après une question.
 */
export async function creerFichierDeSauvegarde(): Promise<void> {
  telechargerFichier(await sauvegardeComplete())
}

/** La question posée une fois le fichier proposé : dit clairement ce qui n'existe que dans le fichier. */
export function texteQuestionFichier(enAttente: number): string {
  const base = 'Le fichier a été proposé au téléchargement, mais ton navigateur ne dit pas s’il a bien été enregistré. Cherche-le dans Fichiers > Téléchargements.'
  if (enAttente > 0) {
    const pluriel = enAttente > 1
    return `${base} Attention : ${enAttente} modification${pluriel ? 's' : ''} pas encore envoyée${pluriel ? 's' : ''} au compte d’origine ${pluriel ? 'n’existent' : 'n’existe'} que dans ce fichier. Si tu effaces cet appareil sans l’avoir, ${pluriel ? 'elles seront perdues' : 'elle sera perdue'}.`
  }
  return `${base} Tout est déjà envoyé au compte d’origine : le fichier n’est qu’une copie de précaution.`
}

// ——— Suppression du compte : détacher l'appareil, même si l'app est fermée en route (M-2) ———

export const CLE_DETACHEMENT = 'compteSupprimeEnCours'

/** Détache l'appareil (une seconde tentative si besoin). Renvoie faux s'il reste à finir : la marque reste alors posée. */
export async function detacherAppareilApresSuppression(): Promise<boolean> {
  for (let essai = 0; essai < 2; essai++) {
    try {
      await delierAppareil()
      await ecrireEtat(CLE_DETACHEMENT, null)
      return true
    } catch { /* on réessaie une fois */ }
  }
  return false
}

/** À l'ouverture de l'écran : si un détachement a été interrompu, on le termine avant de décider quoi faire des données. */
export async function terminerDetachementEnSuspens(): Promise<void> {
  if (await lireEtat<boolean | null>(CLE_DETACHEMENT)) await detacherAppareilApresSuppression()
}
