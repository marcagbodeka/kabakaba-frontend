import { useState } from 'react';
import Login from './Login';
import FirstLoginOnboarding from './FirstLoginOnboarding';

/**
 * Point d'entrée d'un espace (Supervision ou Admin web). Par défaut, login
 * classique (email + mot de passe + 2FA). Si la personne clique sur
 * "Première connexion...", on passe au flux d'onboarding complet
 * (changement de mot de passe obligatoire + configuration 2FA).
 *
 * TODO: une fois l'API prête, ce choix ne sera plus manuel — le backend
 * renverra un flag (ex: `mustChangePassword: true`) après vérification des
 * identifiants temporaires, et on basculera automatiquement vers
 * FirstLoginOnboarding sans que la personne ait à cliquer sur le lien.
 */
export default function LoginPage({ subtitle, onSuccess, userName }) {
  const [mode, setMode] = useState('standard');

  if (mode === 'first') {
    return <FirstLoginOnboarding userName={userName} onDone={onSuccess} />;
  }

  return <Login subtitle={subtitle} onSuccess={onSuccess} onFirstLogin={() => setMode('first')} />;
}
