import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Mail, Lock, Eye, EyeOff, Info, Smartphone, KeyRound, Copy, ShieldCheck,
  ArrowRight, ArrowLeft, Check, Clock, Moon, Sun,
} from 'lucide-react';
import styles from './FirstLoginOnboarding.module.css';
import { useAuth } from '../../context/AuthContext';
import * as webAuth from '../../services/webAuthService';
import useAuthTheme from './useAuthTheme';

const OTP_LENGTH = 6;
const OTP_DURATION = 30;

function StepTracker({ internalStep }) {
  const visualStep = internalStep >= 5 ? 4 : internalStep >= 3 ? 3 : internalStep;
  const labels = ['Bienvenue', 'Mot de passe', 'Authentification', 'Confirmation'];

  return (
    <div className={styles.steps}>
      {[1, 2, 3, 4].map((n) => {
        const state = n < visualStep ? 'done' : n === visualStep ? 'active' : '';
        return (
          <div key={n} style={{ display: 'contents' }}>
            <div className={styles.step}>
              <div className={`${styles.stepNum} ${styles[state] || ''}`}>
                {state === 'done' ? <Check size={12} strokeWidth={3} /> : n}
              </div>
              <div className={styles.stepContent}>
                <div className={`${styles.stepTitle} ${styles[state] || ''}`}>{labels[n - 1]}</div>
              </div>
            </div>
            {n < 4 && <div className={styles.stepLine} />}
          </div>
        );
      })}
    </div>
  );
}

function Shell({ internalStep, footer, theme, onToggleTheme, children }) {
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
        <div className={styles.left}>
          <div className={styles.brandRow}>
            <picture>
              <source srcSet="/site/logo-64.webp" type="image/webp" />
              <img className={styles.logoImg} src="/site/logo-64.png" alt="kabakaba" />
            </picture>
            <div className={styles.brandWord}>
              kaba<span>kaba</span>
            </div>
          </div>

          <div className={styles.leftBottom}>
            <div className={styles.leftTag}>Première connexion</div>
            <h3 className={styles.leftHeadline}>Sécurisons ton compte avant de commencer.</h3>
            <p className={styles.leftSub}>Trois étapes rapides, à faire une seule fois.</p>
            <StepTracker internalStep={internalStep} />
            {footer && <div className={styles.leftFooter}>{footer}</div>}
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
  const label = ['Trop faible', 'Faible', 'Moyen', 'Bon', 'Excellent'][score];
  return { reqs, score, label };
}

export default function FirstLoginOnboarding({ userName = 'Kofi Mensah', onDone, expectedRole }) {
  const { applySession } = useAuth();
  const [theme, toggleTheme] = useAuthTheme();
  const [internalStep, setInternalStep] = useState(1);
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showTempPw, setShowTempPw] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const strength = useMemo(() => checkPasswordStrength(newPw), [newPw]);
  const passwordsMatch = confirmPw.length > 0 && newPw === confirmPw;

  const [tfaTab, setTfaTab] = useState('qr'); // 'qr' | 'key'
  const [keyCopied, setKeyCopied] = useState(false);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(OTP_DURATION);
  const otpRefs = useRef([]);

  const [onboardingToken, setOnboardingToken] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [manualKey, setManualKey] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (internalStep !== 4) return;
    setTimer(OTP_DURATION);
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : OTP_DURATION)), 1000);
    return () => clearInterval(id);
  }, [internalStep]);

  useEffect(() => {
    if (internalStep !== 5) return;
    const id = setTimeout(() => onDone?.(), 3000);
    return () => clearTimeout(id);
  }, [internalStep, onDone]);

  const handleCopyKey = async () => {
    if (!manualKey) return;
    try {
      await navigator.clipboard.writeText(manualKey.replace(/\s/g, ''));
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } catch {
      // silencieux si l'API clipboard est indisponible (contexte non sécurisé, etc.)
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

  // ─── Étape 1 : identifiants temporaires ───────────────────────────
  if (internalStep === 1) {
    return (
      <Shell
        internalStep={1}
        theme={theme}
        onToggleTheme={toggleTheme}
        footer={
          <>
            Vos identifiants vous ont été transmis par l&apos;équipe dirigeante de kabakaba.
            <br />
            Contactez-les si vous ne les avez pas reçus.
          </>
        }
      >
        <div className={styles.formTitle}>Bienvenue</div>
        <div className={styles.formSub}>Entrez les identifiants temporaires reçus par e-mail</div>

        <div className={styles.infoBox}>
          <Info size={16} />
          <span>
            Il s&apos;agit de votre première connexion. Vous serez invité à définir votre propre
            mot de passe à l&apos;étape suivante.
          </span>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            setLoading(true);
            try {
              const result = await webAuth.firstLogin(email, tempPassword, expectedRole);
              setOnboardingToken(result.onboardingToken);
              setInternalStep(2);
            } catch (err) {
              setFormError(err.message || 'Identifiants temporaires invalides.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className={styles.field}>
            <label>Adresse e-mail</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.fieldIcon} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Mot de passe temporaire</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.fieldIcon} />
              <input
                type={showTempPw ? 'text' : 'password'}
                required
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Mot de passe temporaire"
              />
              <button type="button" className={styles.togglePw} onClick={() => setShowTempPw((v) => !v)}>
                {showTempPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className={styles.fieldHint}>
              <Info size={12} /> Ce mot de passe vous a été transmis par l&apos;équipe dirigeante
            </div>
          </div>

          {formError && <div className={styles.fieldError}>{formError}</div>}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Vérification...' : 'Continuer'} <ArrowRight size={15} />
          </button>
        </form>
      </Shell>
    );
  }

  // ─── Étape 2 : changer le mot de passe ────────────────────────────
  if (internalStep === 2) {
    const reqLabel = (ok, label) => (
      <div className={`${styles.pwReq} ${ok ? styles.pwReqOk : ''}`}>
        <span className={styles.dot} /> {label}
      </div>
    );

    return (
      <Shell
        internalStep={2}
        theme={theme}
        onToggleTheme={toggleTheme}
        footer={
          <>
            Choisissez un mot de passe fort que vous n&apos;utilisez nulle part ailleurs.
            <br />
            Il sera demandé à chaque connexion avec votre code 2FA.
          </>
        }
      >
        <div className={styles.formTitle}>Créez votre mot de passe</div>
        <div className={styles.formSub}>Ce mot de passe remplace définitivement le mot de passe temporaire</div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            setLoading(true);
            try {
              await webAuth.setOnboardingPassword(onboardingToken, newPw);
              const setupResult = await webAuth.setupTwoFactor(onboardingToken);
              setQrCodeDataUrl(setupResult.qrCodeDataUrl);
              setManualKey(setupResult.manualKey);
              setInternalStep(3);
            } catch (err) {
              setFormError(err.message || 'Erreur lors de la mise à jour du mot de passe.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className={styles.field}>
            <label>Nouveau mot de passe</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.fieldIcon} />
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Minimum 12 caractères"
              />
              <button type="button" className={styles.togglePw} onClick={() => setShowNewPw((v) => !v)}>
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.pwStrengthWrap}>
              <div className={styles.pwBars}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={styles.pwBar}
                    style={{
                      background:
                        i < strength.score
                          ? ['#EF4444', '#F59E0B', '#F59E0B', '#22C55E'][strength.score - 1]
                          : 'var(--border)',
                    }}
                  />
                ))}
              </div>
              <div className={styles.pwLabel}>
                {newPw.length === 0 ? 'Commencez à saisir votre mot de passe' : strength.label}
              </div>
              <div className={styles.pwReqs}>
                {reqLabel(strength.reqs.len, 'Au moins 12 caractères')}
                {reqLabel(strength.reqs.maj, 'Au moins une majuscule')}
                {reqLabel(strength.reqs.num, 'Au moins un chiffre')}
                {reqLabel(strength.reqs.spe, 'Au moins un caractère spécial (!@#$...)')}
              </div>
            </div>
          </div>

          <div className={styles.field} style={{ marginTop: 18 }}>
            <label>Confirmer le mot de passe</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.fieldIcon} />
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Répétez votre mot de passe"
              />
            </div>
            {confirmPw.length > 0 && !passwordsMatch && (
              <div className={styles.fieldError}>Les mots de passe ne correspondent pas</div>
            )}
          </div>

          {formError && <div className={styles.fieldError}>{formError}</div>}

          <button
            type="submit"
            className={styles.btnPrimary}
            style={{ marginTop: 10 }}
            disabled={strength.score < 4 || !passwordsMatch || loading}
          >
            {loading ? 'Enregistrement...' : 'Continuer'} <ArrowRight size={15} />
          </button>
          <button type="button" className={styles.btnBack} onClick={() => setInternalStep(1)}>
            <ArrowLeft size={15} /> Retour
          </button>
        </form>
      </Shell>
    );
  }

  // ─── Étape 3 : configurer Google Authenticator ────────────────────
  if (internalStep === 3) {
    return (
      <Shell
        internalStep={3}
        theme={theme}
        onToggleTheme={toggleTheme}
        footer={
          <>
            Google Authenticator génère un code à 6 chiffres valide 30 secondes.
            <br />
            Sans ce code, l&apos;accès à l&apos;interface admin est impossible.
          </>
        }
      >
        <div className={styles.formTitle}>Sécurisez votre compte</div>
        <div className={styles.formSub}>Configurez Google Authenticator pour protéger votre accès admin</div>

        <div className={styles.tabGroup}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tfaTab === 'qr' ? styles.tabBtnActive : ''}`}
            onClick={() => setTfaTab('qr')}
          >
            <Smartphone size={14} /> Scanner le QR code
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tfaTab === 'key' ? styles.tabBtnActive : ''}`}
            onClick={() => setTfaTab('key')}
          >
            <KeyRound size={14} /> Copier la clé
          </button>
        </div>

        {tfaTab === 'qr' ? (
          <div>
            <div className={styles.infoBox} style={{ marginBottom: 16 }}>
              <Smartphone size={16} />
              <span>
                Ouvrez <strong>Google Authenticator</strong> sur votre téléphone, appuyez sur{' '}
                <strong>« + »</strong> puis <strong>« Scanner un QR code »</strong>
              </span>
            </div>
            <div className={styles.qrWrap}>
              <div className={styles.qrFrame}>
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR code 2FA" width={148} height={148} />
                ) : (
                  <QrPlaceholder />
                )}
              </div>
              <div className={styles.qrTag}>kabakaba · Administration</div>
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.infoBox} style={{ marginBottom: 16 }}>
              <KeyRound size={16} />
              <span>
                Ouvrez <strong>Google Authenticator</strong>, appuyez sur <strong>« + »</strong> puis{' '}
                <strong>« Entrer une clé de configuration »</strong>
              </span>
            </div>
            <div className={styles.keyBoxLabel}>Votre clé secrète</div>
            <div className={styles.keyBox}>{manualKey || '—'}</div>
            <button type="button" className={styles.copyBtn} onClick={handleCopyKey}>
              <Copy size={14} /> {keyCopied ? 'Copiée !' : 'Copier la clé'}
            </button>
            <div className={styles.keyMeta}>
              <span><Clock size={12} /> Type : TOTP</span>
              <span>Période : 30 s</span>
              <span>6 chiffres</span>
            </div>
          </div>
        )}

        <button type="button" className={styles.btnPrimary} style={{ marginTop: 20 }} onClick={() => setInternalStep(4)}>
          Continuer <ArrowRight size={15} />
        </button>
        <button type="button" className={styles.btnBack} onClick={() => setInternalStep(2)}>
          <ArrowLeft size={15} /> Retour
        </button>
      </Shell>
    );
  }

  // ─── Étape 4 : vérification du code ───────────────────────────────
  if (internalStep === 4) {
    return (
      <Shell
        internalStep={4}
        theme={theme}
        onToggleTheme={toggleTheme}
        footer={
          <>
            Le code change toutes les 30 secondes.
            <br />
            Entrez le code actuellement affiché dans Google Authenticator.
          </>
        }
      >
        <div className={styles.formTitle}>Vérification 2FA</div>
        <div className={styles.formSub}>
          Entrez le code à 6 chiffres affiché dans Google Authenticator pour <strong>kabakaba</strong>
        </div>

        <div className={styles.infoBox}>
          <ShieldCheck size={16} />
          <span>
            Ouvrez Google Authenticator et entrez le code affiché pour <strong>kabakaba Admin</strong>
          </span>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            setLoading(true);
            try {
              const code = otp.join('');
              const result = await webAuth.verifyTwoFactorSetup(onboardingToken, code);

              // Le contrôle d'espace est fait côté backend, dès l'étape
              // mot de passe temporaire (firstLogin) — voir Login.jsx pour
              // le raisonnement complet. Rien à revérifier ni à afficher
              // ici qui mentionnerait le rôle réel du compte.
              applySession(result.accessToken, result.webUser);
              setBackupCodes(result.backupCodes || []);
              setInternalStep(5);
            } catch (err) {
              setFormError(err.message || 'Code invalide.');
            } finally {
              setLoading(false);
            }
          }}
        >
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
            Code valide encore <strong>{timer}s</strong>
          </div>

          {formError && <div className={styles.fieldError}>{formError}</div>}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            <ShieldCheck size={15} /> {loading ? 'Vérification...' : 'Vérifier et accéder'}
          </button>
          <button type="button" className={styles.btnBack} onClick={() => setInternalStep(3)}>
            <ArrowLeft size={15} /> Retour, reconfigurer le 2FA
          </button>
        </form>
      </Shell>
    );
  }

  // ─── Étape 5 : succès ──────────────────────────────────────────────
  return (
    <Shell
      internalStep={5}
      theme={theme}
      onToggleTheme={toggleTheme}
      footer={<>Votre compte est maintenant sécurisé.<br />Conservez votre clé de secours 2FA dans un endroit sûr.</>}
    >
      <div className={styles.successWrap}>
        <div className={styles.successRing}>
          <Check size={28} strokeWidth={2.5} />
        </div>
        <div className={styles.formTitle} style={{ textAlign: 'center' }}>Compte configuré</div>
        <div className={styles.formSub} style={{ textAlign: 'center' }}>
          Bienvenue sur kabakaba Administration,
          <br />
          <strong>{userName}</strong>
        </div>

        <div className={styles.infoBox} style={{ textAlign: 'left' }}>
          <KeyRound size={16} />
          <div style={{ width: '100%' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Clés de secours 2FA (10)</div>
            <div
              className={styles.keyBox}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', textAlign: 'left' }}
            >
              {backupCodes.length > 0 ? (
                backupCodes.map((c) => <span key={c}>{c}</span>)
              ) : (
                <span>—</span>
              )}
            </div>
            {backupCodes.length > 0 && (
              <button
                type="button"
                className={styles.copyBtn}
                style={{ marginTop: 8 }}
                onClick={() => navigator.clipboard?.writeText(backupCodes.join('\n'))}
              >
                <Copy size={13} /> Copier les 10 clés
              </button>
            )}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              Conservez ces clés en lieu sûr. Chacune ne peut être utilisée qu'une seule fois pour récupérer
              l&apos;accès si vous perdez votre téléphone. Elles ne seront plus jamais réaffichées.
            </div>
          </div>
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Redirection en cours...</div>

        <button type="button" className={styles.btnPrimary} onClick={() => onDone?.()}>
          Accéder au tableau de bord <ArrowRight size={15} />
        </button>
      </div>
    </Shell>
  );
}

function QrPlaceholder() {
  return (
    <svg width="148" height="148" viewBox="0 0 148 148" fill="none" aria-label="QR code de configuration Google Authenticator">
      <rect x="4" y="4" width="44" height="44" rx="4" fill="none" stroke="#0D1438" strokeWidth="6" />
      <rect x="16" y="16" width="20" height="20" rx="2" fill="#0D1438" />
      <rect x="100" y="4" width="44" height="44" rx="4" fill="none" stroke="#0D1438" strokeWidth="6" />
      <rect x="112" y="16" width="20" height="20" rx="2" fill="#0D1438" />
      <rect x="4" y="100" width="44" height="44" rx="4" fill="none" stroke="#0D1438" strokeWidth="6" />
      <rect x="16" y="112" width="20" height="20" rx="2" fill="#0D1438" />
      {[
        [56, 4], [68, 4], [56, 16], [80, 16], [56, 28], [68, 28], [80, 28], [56, 40],
        [4, 56], [16, 56], [28, 56], [44, 56], [56, 56], [68, 56], [80, 56], [100, 56], [112, 56], [136, 56],
        [68, 68], [80, 68], [100, 68], [124, 68], [136, 68], [4, 68], [28, 68], [44, 68],
        [56, 80], [80, 80], [100, 80], [112, 80], [16, 80], [4, 80],
        [56, 100], [68, 100], [80, 100], [100, 100], [124, 100],
        [56, 112], [80, 112], [112, 112], [124, 112], [136, 112],
        [68, 124], [80, 124], [100, 124], [136, 124],
        [56, 136], [68, 136], [112, 136], [124, 136], [136, 136],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="8" height="8" rx="1" fill="#0D1438" />
      ))}
    </svg>
  );
}