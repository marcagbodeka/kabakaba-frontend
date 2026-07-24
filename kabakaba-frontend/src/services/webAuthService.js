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