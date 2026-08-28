import { useEffect, useRef, useState } from 'react';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, Moon, Sun, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import styles from './Login.module.css';
import * as webAuth from '../../services/webAuthService';
import { ApiError } from '../../services/httpClient';
import useAuthTheme from './useAuthTheme';

const OTP_LENGTH = 6;

function ForgotPasswordShell({ theme, onToggleTheme, children }) {
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
            <ShieldCheck size={72} strokeWidth={1.4} color="var(--auth-accent)" />
          </div>
          <div className={styles.illuCopy}>
            <div className={styles.illuEyebrow}>Accès restreint</div>
            <div className={styles.illuTitle}>
              Votre application d'authentification suffit à prouver qui vous êtes — aucun email n'est envoyé.
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

function checkPasswordStrength(pw) {
  const reqs = {
    len: pw.length >= 12,
    maj: /[A-Z]/.test(pw),
    num: /[0-9]/.test(pw),
    spe: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(reqs).filter(Boolean).length;
  return { reqs, score };
}

function ReqLabel({ ok, children }) {
  return (
    <div className={styles.fieldHint} style={{ color: ok ? 'var(--green)' : undefined }}>
      {ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {children}
    </div>
  );
}

export default function ForgotPassword({ onBackToLogin }) {
  const [theme, toggleTheme] = useAuthTheme();
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'password' | 'done'

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [resetSessionToken, setResetSessionToken] = useState(null);
  const [warning, setWarning] = useState(null);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const otpRefs = useRef([]);

  const strength = checkPasswordStrength(newPw);
  const passwordsMatch = newPw.length > 0 && newPw === confirmPw;

  useEffect(() => {
    if (step === 'code') setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }, [step]);

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

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setStep('code');
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const code = otp.join('');
      const result = await webAuth.verifyPasswordReset(email, code);
      setResetSessionToken(result.resetSessionToken);
      if (result.warning) setWarning(result.warning);
      setStep('password');
    } catch (err) {
      // Message volontairement générique — le backend ne distingue pas
      // "compte inexistant" de "code invalide" (anti-énumération), le
      // frontend ne doit pas réintroduire cette distinction non plus.
      setError('Identifiants ou code invalides.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (strength.score < 4) {
      setError('Le mot de passe ne respecte pas tous les critères ci-dessous.');
      return;
    }
    setLoading(true);
    try {
      await webAuth.confirmPasswordReset(resetSessionToken, newPw);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Le jeton a expiré — recommencez depuis le début.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <ForgotPasswordShell theme={theme} onToggleTheme={toggleTheme}>
        <div className={styles.formTitle}>
          Mot de passe oublié<span className={styles.accent}>.</span>
        </div>
        <div className={styles.formSub}>
          Entrez votre email, puis le code de votre application d'authentification.
        </div>
        <form onSubmit={handleEmailSubmit} className={styles.formStep}>
          <div className={styles.field}>
            <div className={styles.inputWrap}>
              <Mail size={16} />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse e-mail"
              />
            </div>
          </div>
          <button type="submit" className={styles.btnPrimary}>
            Continuer
          </button>
        </form>
        <a className={styles.linkCenter} onClick={onBackToLogin}>
          <ArrowLeft size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
          Retour à la connexion
        </a>
      </ForgotPasswordShell>
    );
  }

  if (step === 'code') {
    return (
      <ForgotPasswordShell theme={theme} onToggleTheme={toggleTheme}>
        <div className={styles.formTitle}>
          Vérification<span className={styles.accent}>.</span>
        </div>
        <div className={styles.formSub}>
          Entrez le code à 6 chiffres de votre application d'authentification, ou l'une de vos clés de secours.
        </div>
        <form onSubmit={handleCodeSubmit} className={styles.formStep}>
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
          <div style={{ fontSize: 12, color: 'var(--auth-muted)', marginBottom: 16, textAlign: 'center' }}>
            Vous pouvez aussi coller une clé de secours (ex. A1B2-C3D4-E5F6-G7H8) dans le premier champ.
          </div>
          {error && <div className={styles.fieldError}>{error}</div>}
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            <ShieldCheck size={15} /> {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>
        <a className={styles.linkCenter} onClick={() => setStep('email')}>
          <ArrowLeft size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
          Retour
        </a>
      </ForgotPasswordShell>
    );
  }

  if (step === 'password') {
    return (
      <ForgotPasswordShell theme={theme} onToggleTheme={toggleTheme}>
        <div className={styles.formTitle}>
          Nouveau mot de passe<span className={styles.accent}>.</span>
        </div>
        <div className={styles.formSub}>Toutes vos sessions actives seront déconnectées après ce changement.</div>
        {warning && (
          <div className={styles.fieldHint} style={{ marginBottom: 14, color: 'var(--orange-dark)' }}>
            {warning}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} className={styles.formStep}>
          <div className={styles.field}>
            <div className={styles.inputWrap} style={{ position: 'relative' }}>
              <Lock size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                autoFocus
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Minimum 12 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--auth-muted-light)',
                  cursor: 'pointer',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <ReqLabel ok={strength.reqs.len}>Au moins 12 caractères</ReqLabel>
              <ReqLabel ok={strength.reqs.maj}>Au moins une majuscule</ReqLabel>
              <ReqLabel ok={strength.reqs.num}>Au moins un chiffre</ReqLabel>
              <ReqLabel ok={strength.reqs.spe}>Au moins un caractère spécial (!@#$...)</ReqLabel>
            </div>
          </div>

          <div className={styles.field} style={{ marginTop: 16 }}>
            <div className={styles.inputWrap}>
              <Lock size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Répétez le mot de passe"
              />
            </div>
            {confirmPw.length > 0 && !passwordsMatch && (
              <div className={styles.fieldError}>Les mots de passe ne correspondent pas</div>
            )}
          </div>

          {error && <div className={styles.fieldError}>{error}</div>}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </ForgotPasswordShell>
    );
  }

  // step === 'done'
  return (
    <ForgotPasswordShell theme={theme} onToggleTheme={toggleTheme}>
      <div className={styles.formTitle}>
        Terminé<span className={styles.accent}>.</span>
      </div>
      <div className={styles.formSub}>
        Votre mot de passe a été mis à jour. Toutes vos sessions précédentes ont été déconnectées — reconnectez-vous
        avec votre nouveau mot de passe.
      </div>
      <button className={styles.btnPrimary} onClick={onBackToLogin}>
        Aller à la connexion
      </button>
    </ForgotPasswordShell>
  );
}
