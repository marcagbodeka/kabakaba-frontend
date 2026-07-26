import { apiFetch } from '../httpClient';

export function getPayrollConfig() {
  return apiFetch('/payroll/config');
}

export function setPayoutPercentage(webUserId, percentage) {
  return apiFetch(`/payroll/accounts/${webUserId}/percentage`, {
    method: 'POST',
    body: { percentage },
  });
}

export function setPayrollSchedule(isEnabled, dayOfMonth) {
  return apiFetch('/payroll/schedule', { method: 'POST', body: { isEnabled, dayOfMonth } });
}

export function runPayrollManually() {
  return apiFetch('/payroll/run', { method: 'POST' });
}

export function listPayrollRuns() {
  return apiFetch('/payroll/runs');
}

export function listAllWithdrawals() {
  return apiFetch('/payroll/withdrawals');
}

export function listMyWithdrawals() {
  return apiFetch('/payroll/withdrawals/mine');
}

export function requestWithdrawal(amount, payoutNumber) {
  return apiFetch('/payroll/withdrawals', { method: 'POST', body: { amount, payoutNumber } });
}

export function approveWithdrawal(id) {
  return apiFetch(`/payroll/withdrawals/${id}/approve`, { method: 'POST' });
}

export function rejectWithdrawal(id, reason) {
  return apiFetch(`/payroll/withdrawals/${id}/reject`, { method: 'POST', body: { reason } });
}
