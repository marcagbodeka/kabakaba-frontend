import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import LoginIllustration from './LoginIllustration';
import styles from './Login.module.css';

const OTP_LENGTH = 6;
const OTP_DURATION = 30; // secondes

function LoginShell({ subtitle, children }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div className={styles.leftGlow} />
        <div className={styles.leftCenter}>
          <LoginIllustration />
          <div className={styles.logo}>
            kaba<span>kaba</span>
          </div>
          <div className={styles.tagline}>{subtitle}</div>
        </div>
        <div className={styles.leftFooter}>
          Outil interne réservé aux équipes kabakaba
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.form}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Composant de login réutilisé par les deux espaces (/supervision/login et
 * /admin/login) — c'est App.jsx qui décide, via `onSuccess` + le routeur,
 * vers quel dashboard atterrir. Le composant lui-même ne connaît pas le rôle.
 *
 * Props :
 * - subtitle : texte affiché sous le logo ("Supervision" / "Admin web")
 * - onSuccess : appelé une fois la 2FA validée
 */
export default function Login({ subtitle = 'kabakaba', onSuccess, onFirstLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = identifiants, 2 = 2FA, 3 = redirection
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(OTP_DURATION);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step !== 2) return;
    setTimer(OTP_DURATION);
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  // Redirection automatique une fois la 2FA validée — pas d'écran à cliquer.
  useEffect(() => {
    if (step !== 3) return;
    const id = setTimeout(() => {
      onSuccess?.();
    }, 700);
    return () => clearTimeout(id);
  }, [step, onSuccess]);

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    // TODO: appeler POST /auth/login une fois l'API prête
    setStep(2);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    // TODO: appeler POST /auth/verify-2fa une fois l'API prête
    setStep(3);
  };

  if (step === 1) {
    return (
      <LoginShell subtitle={subtitle}>
        <div className={styles.formTitle}>Se connecter</div>
        <div className={styles.formSub}>Accédez à votre espace kabakaba</div>
        <form onSubmit={handleCredentialsSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@kabakaba.app"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>
          <button type="submit" className={styles.btnPrimary}>
            Continuer
          </button>
          <a className={styles.linkSmall}>Mot de passe oublié ?</a>
          {onFirstLogin && (
            <a className={styles.linkCenter} onClick={onFirstLogin} style={{ marginTop: 4 }}>
              Première connexion avec un mot de passe temporaire ?
            </a>
          )}
        </form>
      </LoginShell>
    );
  }

  if (step === 2) {
    return (
      <LoginShell subtitle={subtitle}>
        <div className={styles.formTitle}>Code de vérification</div>
        <div className={styles.formSub}>
          Entrez le code à 6 chiffres généré par votre application d&apos;authentification.
        </div>
        <form onSubmit={handleOtpSubmit}>
          <div className={styles.otpRow}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                className={`${styles.otpBox} ${digit ? styles.filled : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
              />
            ))}
          </div>
          <div className={styles.timerRow}>
            <span>Code valide {timer}s</span>
            <a className={styles.linkInline}>Renvoyer</a>
          </div>
          <button type="submit" className={styles.btnPrimary}>
            <ShieldCheck size={15} /> Vérifier
          </button>
        </form>
        <a className={styles.linkCenter} onClick={() => setStep(1)}>
          Retour
        </a>
      </LoginShell>
    );
  }

  return (
    <LoginShell subtitle={subtitle}>
      <div className={styles.redirecting}>
        <Loader2 size={20} className={styles.spinner} />
        <span>Accès autorisé — redirection…</span>
      </div>
    </LoginShell>
  );
}