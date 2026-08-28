import { apiFetch } from './httpClient';

export function login(email, password) {
  return apiFetch('/web-auth/login', { method: 'POST', body: { email, password }, auth: false });
}

export function verify2fa(challengeToken, code) {
  return apiFetch('/web-auth/verify-2fa', { method: 'POST', body: { challengeToken, code }, auth: false });
}

export function firstLogin(email, temporaryPassword) {
  return apiFetch('/web-auth/first-login', { method: 'POST', body: { email, temporaryPassword }, auth: false });
}

export function setOnboardingPassword(onboardingToken, newPassword) {
  return apiFetch('/web-auth/first-login/password', {
    method: 'POST',
    body: { newPassword },
    auth: false,
    headers: { Authorization: `Bearer ${onboardingToken}` },
  });
}

export function setupTwoFactor(onboardingToken) {
  return apiFetch('/web-auth/first-login/2fa/setup', {
    method: 'POST',
    auth: false,
    headers: { Authorization: `Bearer ${onboardingToken}` },
  });
}

export function verifyTwoFactorSetup(onboardingToken, code) {
  return apiFetch('/web-auth/first-login/2fa/verify', {
    method: 'POST',
    body: { code },
    auth: false,
    headers: { Authorization: `Bearer ${onboardingToken}` },
  });
}

export function getMe() {
  return apiFetch('/web-auth/me');
}

// ─── Réinitialisation de mot de passe (TOTP ou clé de secours) ──────
// Facteur unique volontaire : voir web-auth.service.ts côté backend pour
// le détail du compromis de sécurité (pas de canal externe email/SMS).

export function verifyPasswordReset(email, code) {
  return apiFetch('/web-auth/password-reset/verify', { method: 'POST', body: { email, code }, auth: false });
}

export function confirmPasswordReset(resetSessionToken, newPassword) {
  return apiFetch('/web-auth/password-reset/confirm', {
    method: 'POST',
    body: { resetSessionToken, newPassword },
    auth: false,
  });
}