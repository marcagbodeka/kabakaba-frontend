import { useEffect, useState } from 'react';
import { Banknote, Play, RefreshCw } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import {
  getPayrollConfig,
  listPayrollRuns,
  runPayrollManually,
  setPayrollSchedule,
  setPayoutPercentage,
} from '../../services/domain/payrollService';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const ROLE_LABEL = { SUPERVISION: 'Supervision', ADMIN: 'Admin web' };

export default function ConfigurationPaie() {
  const [config, setConfig] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [runningPayroll, setRunningPayroll] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({ isEnabled: false, dayOfMonth: 1 });
  const [pctDraft, setPctDraft] = useState({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfg, runList] = await Promise.all([getPayrollConfig(), listPayrollRuns()]);
      setConfig(cfg);
      setRuns(runList);
      setScheduleDraft({
        isEnabled: cfg.schedule?.isEnabled ?? false,
        dayOfMonth: cfg.schedule?.dayOfMonth ?? 1,
      });
      const drafts = {};
      for (const a of cfg.accounts ?? []) drafts[a.id] = Number(a.payoutPercentage);
      setPctDraft(drafts);
    } catch (err) {
      setError(err.message || 'Impossible de charger la configuration paie.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const savePercentage = async (webUserId) => {
    setActionError(null);
    setSavingId(webUserId);
    try {
      await setPayoutPercentage(webUserId, Number(pctDraft[webUserId] ?? 0));
      await load();
    } catch (err) {
      setActionError(err.message || 'Impossible de mettre à jour le pourcentage.');
    } finally {
      setSavingId(null);
    }
  };

  const saveSchedule = async () => {
    setActionError(null);
    try {
      await setPayrollSchedule(scheduleDraft.isEnabled, Number(scheduleDraft.dayOfMonth));
      await load();
    } catch (err) {
      setActionError(err.message || 'Impossible de mettre à jour la planification.');
    }
  };

  const handleRunPayroll = async () => {
    if (!window.confirm('Déclencher la paie pour le mois précédent complet ?')) return;
    setActionError(null);
    setRunningPayroll(true);
    try {
      await runPayrollManually();
      await load();
    } catch (err) {
      setActionError(err.message || 'Échec du déclenchement manuel.');
    } finally {
      setRunningPayroll(false);
    }
  };

  const accounts = config?.accounts ?? [];
  const platformBalance = config?.platformAccount?.balance ?? 0;

  return (
    <>
      <Topbar icon={Banknote} breadcrumb={[{ label: 'Paie', path: '/supervision/paie/config' }, { label: 'Configuration' }]} />
      <PageContent>
        <div className="page-header">
          <h1>Configuration de la paie</h1>
          <p>Répartition des revenus nets entre les comptes WebUser et le compte plateforme</p>
        </div>

        {error && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {error}
          </div>
        )}
        {actionError && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {actionError}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Part plateforme (reste)</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : `${config?.platformPercentage ?? 0} %`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Somme des parts comptes</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : `${config?.sumPercentage ?? 0} %`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Solde compte plateforme</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(platformBalance)}</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Paie automatique mensuelle</div>
          <div className="card-sub">Déclenchement planifié sur le revenu net du mois précédent</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginTop: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={scheduleDraft.isEnabled}
                onChange={(e) => setScheduleDraft((s) => ({ ...s, isEnabled: e.target.checked }))}
              />
              Activée
            </label>
            <label style={{ fontSize: 13 }}>
              Jour du mois (1–28)
              <input
                type="number"
                min={1}
                max={28}
                value={scheduleDraft.dayOfMonth}
                onChange={(e) => setScheduleDraft((s) => ({ ...s, dayOfMonth: e.target.value }))}
                style={{ marginLeft: 8, width: 64 }}
              />
            </label>
            <button type="button" className="btn-secondary-sm" onClick={saveSchedule}>
              Enregistrer
            </button>
            <button type="button" className="btn-secondary-sm" onClick={handleRunPayroll} disabled={runningPayroll}>
              <Play size={14} /> {runningPayroll ? 'Exécution…' : 'Lancer la paie manuellement'}
            </button>
          </div>
          {config?.schedule?.lastRunAt && (
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10 }}>
              Dernière exécution auto : {formatDateTime(config.schedule.lastRunAt)}
            </p>
          )}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Parts par compte</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Compte</th>
                  <th>Rôle</th>
                  <th>Solde</th>
                  <th>Part (%)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5}>Chargement...</td>
                  </tr>
                )}
                {!loading && accounts.length === 0 && (
                  <tr>
                    <td colSpan={5}>Aucun compte actif.</td>
                  </tr>
                )}
                {!loading &&
                  accounts.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>
                          {a.firstName} {a.lastName}
                        </strong>
                      </td>
                      <td>{ROLE_LABEL[a.role] ?? a.role}</td>
                      <td>{formatFcfa(a.balance)}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          value={pctDraft[a.id] ?? 0}
                          onChange={(e) => setPctDraft((d) => ({ ...d, [a.id]: e.target.value }))}
                          style={{ width: 72 }}
                        />
                      </td>
                      <td>
                        <button type="button" className="action-btn" disabled={savingId === a.id} onClick={() => savePercentage(a.id)}>
                          {savingId === a.id ? '…' : 'Appliquer'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Historique des paies
            <button type="button" className="acct-icon-btn" onClick={load} title="Actualiser">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Revenu net base</th>
                  <th>Déclenchement</th>
                  <th>Par</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5}>Chargement...</td>
                  </tr>
                )}
                {!loading && runs.length === 0 && (
                  <tr>
                    <td colSpan={5}>Aucune paie exécutée pour le moment.</td>
                  </tr>
                )}
                {!loading &&
                  runs.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {formatDateTime(r.periodStart).slice(0, 12)} → {formatDateTime(r.periodEnd).slice(0, 12)}
                      </td>
                      <td>{formatFcfa(r.netRevenue)}</td>
                      <td>{r.trigger === 'MANUAL' ? 'Manuel' : 'Automatique'}</td>
                      <td>
                        {r.triggeredBy ? `${r.triggeredBy.firstName} ${r.triggeredBy.lastName}` : '—'}
                      </td>
                      <td>{formatDateTime(r.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContent>
    </>
  );
}
