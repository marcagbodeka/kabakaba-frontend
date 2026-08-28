import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Loader2, Mail, Lock, Moon, Sun } from 'lucide-react';
import styles from './Login.module.css';
import { useAuth } from '../../context/AuthContext';
import * as webAuth from '../../services/webAuthService';
import { ApiError } from '../../services/httpClient';
import useAuthTheme from './useAuthTheme';

const OTP_LENGTH = 6;
const OTP_DURATION = 30;

const STEPS = ['Identifiant', 'Vérification', 'Accès'];

function Stepper({ current }) {
  return (
    <div className={styles.stepper}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? 'done' : n === current ? 'current' : '';
        return (
          <div key={label} style={{ display: 'contents' }}>
            <div className={`${styles.step} ${styles[state] || ''}`}>
              <div className={styles.stepCircle}>{n < current ? '✓' : n}</div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${n < current ? styles.done : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SupervisionIllustration() {
  return (
    <svg viewBox="0 0 230 230" fill="none" aria-hidden="true">
      <circle cx="115" cy="115" r="98" fill="var(--auth-illu-2)" />
      <rect x="46" y="128" width="138" height="14" rx="7" fill="var(--peach)" />
      <rect x="60" y="108" width="42" height="24" rx="6" fill="var(--orange)" />
      <rect x="110" y="98" width="60" height="34" rx="6" fill="var(--indigo)" />
      <circle cx="130" cy="115" r="7" fill="#fff" fillOpacity=".9" />
      <g transform="translate(78,40)">
        <path d="M37 0 L70 12 V38 C70 62 54 78 37 86 C20 78 4 62 4 38 V12 Z" fill="var(--indigo)" />
        <path d="M37 6 L64 16 V38 C64 58 50 72 37 79 C24 72 10 58 10 38 V16 Z" fill="var(--indigo-dark)" />
        <path
          d="M22 40 L32 50 L54 26"
          stroke="var(--orange)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      <circle cx="58" cy="70" r="5" fill="var(--orange)" />
      <circle cx="172" cy="76" r="4" fill="var(--indigo)" />
      <circle cx="180" cy="150" r="5" fill="var(--orange-dark)" />
    </svg>
  );
}

function LoginShell({ theme, onToggleTheme, children }) {
  return (
    <div className={styles.wrap} data-theme={theme}>
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />

      <button type="button" className={styles.themeToggle} onClick={onToggleTheme}>
        <span className={styles.themeToggleKnob}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </span>
        <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
      </button>

      <div className={styles.card}>
        <div className={styles.illuSide}>
          <div className={styles.brandRow}>
            <picture>
              <source srcSet="/site/logo-64.webp" type="image/webp" />
              <img className={styles.logoImg} src="/site/logo-64.png" alt="kabakaba" />
            </picture>
            <div className={styles.brandWord}>
              kaba<span>kaba</span>
            </div>
          </div>

          <div className={styles.illuScene}>
            <SupervisionIllustration />
          </div>

          <div className={styles.illuCopy}>
            <div className={styles.illuEyebrow}>Accès restreint</div>
            <div className={styles.illuTitle}>
              Cet espace est réservé au personnel kabakaba autorisé.
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.form}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Login({ onSuccess, onFirstLogin, onForgotPassword }) {
  const { applySession } = useAuth();
  const [theme, toggleTheme] = useAuthTheme();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [challengeToken, setChallengeToken] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(OTP_DURATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step !== 2) return;
    setTimer(OTP_DURATION);
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== 3) return;
    const id = setTimeout(() => onSuccess?.(), 700);
    return () => clearTimeout(id);
  }, [step, onSuccess]);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await webAuth.login(email, password);
      setChallengeToken(result.challengeToken);
      setFirstName(result.firstName || result.webUser?.firstName || result.user?.firstName || null);
      setStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        onFirstLogin?.();
        return;
      }
      setError(err.message || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const code = otp.join('');
      const result = await webAuth.verify2fa(challengeToken, code);
      applySession(result.accessToken, result.webUser);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <LoginShell theme={theme} onToggleTheme={toggleTheme}>
        <Stepper current={1} />
        <div className={styles.formTitle}>
          Bienvenue<span className={styles.accent}>.</span>
        </div>
        <div className={styles.formSub}>Connecte-toi à ton espace kabakaba</div>
        <form onSubmit={handleCredentialsSubmit} className={styles.formStep}>
          <div className={styles.field}>
            <div className={styles.inputWrap}>
              <Mail size={16} />
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse e-mail"
              />
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.inputWrap}>
              <Lock size={16} />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
              />
            </div>
          </div>
          {error && <div className={styles.fieldError}>{error}</div>}
          <a className={styles.linkSmall} onClick={onForgotPassword}>Mot de passe oublié ?</a>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Connexion...' : 'Continuer'}
          </button>
          {onFirstLogin && (
            <a className={styles.linkCenter} onClick={onFirstLogin}>
              Première connexion avec un <b>mot de passe temporaire</b> ?
            </a>
          )}
        </form>
      </LoginShell>
    );
  }

  if (step === 2) {
    return (
      <LoginShell theme={theme} onToggleTheme={toggleTheme}>
        <Stepper current={2} />
        <div className={styles.formTitle}>
          {firstName ? `Bienvenue, ${firstName}` : 'Vérification'}
          <span className={styles.accent}>.</span>
        </div>
        <div className={styles.formSub}>
          Entrez le code à 6 chiffres généré par votre application d&apos;authentification.
        </div>
        <form onSubmit={handleOtpSubmit} className={styles.formStep}>
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
          {error && <div className={styles.fieldError}>{error}</div>}
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            <ShieldCheck size={15} /> {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>
        <a className={styles.linkCenter} onClick={() => setStep(1)}>
          Retour
        </a>
      </LoginShell>
    );
  }

  return (
    <LoginShell theme={theme} onToggleTheme={toggleTheme}>
      <Stepper current={3} />
      <div className={styles.redirecting}>
        <Loader2 size={20} className={styles.spinner} />
        <span>Accès autorisé, redirection en cours…</span>
      </div>
    </LoginShell>
  );
}
