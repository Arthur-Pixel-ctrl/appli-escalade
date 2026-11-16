import { PROFIL_VIDE, type Profil } from '../donnees/profil.ts'
import { ProfilFormulaire } from './ProfilFormulaire.tsx'

// Premier lancement : deux phrases d'accueil, puis le profil.
export function Bienvenue({ onValider }: { onValider: (p: Profil) => void }) {
  return (
    <main className="ecran">
      <div className="pile">
        <p className="surtitre">Bienvenue</p>
        <p className="texte-2">
          Cette app guide tes séances d’escalade, seul ou en groupe, et garde la trace de ta progression.
          Tes réponses restent sur ton téléphone. Tu pourras tout modifier ensuite dans l’onglet Profil.
        </p>
      </div>
      <ProfilFormulaire initial={PROFIL_VIDE} titre="Parle-moi de ta grimpe" libelleValider="Continuer" onValider={onValider} />
    </main>
  )
}
