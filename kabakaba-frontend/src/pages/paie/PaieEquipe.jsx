import { Fragment, useEffect, useMemo, useState } from 'react';
import { Banknote, ChevronDown, ChevronRight, Play } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import {
  approveWithdrawal,
  getPayrollConfig,
  listAllWithdrawals,
  listPayrollRuns,
  rejectWithdrawal,
  runPayrollManually,
  setPayoutPercentage,
  setPayrollSchedule,
} from '../../services/domain/payrollService';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const ROLE_LABEL = { SUPERVISION: 'Supervision', ADMIN: 'Admin web' };

// PROCESSING = validé, payout envoyé à FedaPay, en attente de confirmation.
// Tant que ce n'est pas COMPLETED ou FAILED, l'argent est en transit.
const WITHDRAWAL_STATUS_LABEL = {
  PENDING: 'Demande en attente de validation',
  PROCESSING: 'Envoyé à FedaPay, en attente de confirmation',
  COMPLETED: 'Payé',
  FAILED: 'Échec / rejeté',
};
const WITHDRAWAL_STATUS_BADGE = {
  PENDING: 'badge-orange',
  PROCESSING: 'badge-amber',
  COMPLETED: 'badge-green',
  FAILED: 'badge-red',
};

export default function PaieEquipe() {
  const [config, setConfig] = useState(null);
  const [runs, setRuns] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [runningPayroll, setRunningPayroll] = useState(false);
  const [busyWithdrawalId, setBusyWithdrawalId] = useState(null);
  const [scheduleDraft, setScheduleDraft] = useState({ isEnabled: false, dayOfMonth: 1 });
  const [pctDraft, setPctDraft] = useState({});
  const [expandedRunId, setExpandedRunId] = useState(null);
  const [historyTab, setHistoryTab] = useState('PAIES');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfg, runList, withdrawalList] = await Promise.all([
        getPayrollConfig(),
        listPayrollRuns(),
        listAllWithdrawals(),
      ]);
      setConfig(cfg);
      setRuns(runList);
      setWithdrawals(withdrawalList);
      setScheduleDraft({
        isEnabled: cfg.schedule?.isEnabled ?? false,
        dayOfMonth: cfg.schedule?.dayOfMonth ?? 1,
      });
      const drafts = {};
      for (const a of cfg.accounts ?? []) drafts[a.id] = Number(a.payoutPercentage);
      setPctDraft(drafts);
    } catch (err) {
      setError(err.message || 'Impossible de charger la page paie.');
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
    if (!window.confirm('Déclencher la paie pour le mois précédent complet ? Cela crédite le solde interne de chaque employé selon sa part.')) return;
    setActionError(null);
    setActionNotice(null);
    setRunningPayroll(true);
    try {
      await runPayrollManually();
      setActionNotice('Paie exécutée avec succès.');
      await load();
    } catch (err) {
      // Le backend renvoie un message clair, notamment si le revenu net est nul ou négatif.
      setActionError(err.message || 'Échec du déclenchement manuel.');
    } finally {
      setRunningPayroll(false);
    }
  };

  const handleApproveWithdrawal = async (id) => {
    if (!window.confirm("Valider cette demande et envoyer le payout FedaPay ? Cette action déclenche un vrai transfert d'argent, irréversible.")) return;
    setActionError(null);
    setBusyWithdrawalId(id);
    try {
      await approveWithdrawal(id);
      await load();
    } catch (err) {
      setActionError(err.message || 'Validation impossible.');
    } finally {
      setBusyWithdrawalId(null);
    }
  };

  const handleRejectWithdrawal = async (id) => {
    const reason = window.prompt('Motif du rejet (obligatoire) :');
    if (!reason?.trim()) return;
    setActionError(null);
    setBusyWithdrawalId(id);
    try {
      await rejectWithdrawal(id, reason.trim());
      await load();
    } catch (err) {
      setActionError(err.message || 'Rejet impossible.');
    } finally {
      setBusyWithdrawalId(null);
    }
  };

  const accounts = config?.accounts ?? [];
  const platformBalance = config?.platformAccount?.balance ?? 0;

  const draftSum = useMemo(
    () => Object.values(pctDraft).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [pctDraft],
  );
  const draftRemaining = 100 - draftSum;
  const overAllocated = draftSum > 100;

  // Dernière demande de retrait par employé, pour l'afficher directement
  // dans le tableau "Employés" — c'est ce qui manquait pour savoir "où en
  // est le paiement de telle personne, et combien elle va recevoir".
  const latestWithdrawalByUser = useMemo(() => {
    const map = {};
    for (const w of withdrawals) {
      const uid = w.webUserId;
      if (!map[uid] || new Date(w.requestedAt) > new Date(map[uid].requestedAt)) {
        map[uid] = w;
      }
    }
    return map;
  }, [withdrawals]);

  const pendingWithdrawals = useMemo(() => withdrawals.filter((w) => w.status === 'PENDING'), [withdrawals]);
  const processingWithdrawals = useMemo(() => withdrawals.filter((w) => w.status === 'PROCESSING'), [withdrawals]);
  const finishedWithdrawals = useMemo(
    () => withdrawals.filter((w) => w.status === 'COMPLETED' || w.status === 'FAILED'),
    [withdrawals],
  );

  return (
    <>
      <Topbar
        icon={Banknote}
        breadcrumb={[{ label: 'Paie équipe' }]}
        badge={pendingWithdrawals.length > 0 ? { text: `${pendingWithdrawals.length} retrait(s) à valider`, tone: 'orange' } : undefined}
      />
      <PageContent>
        <div className="page-header">
          <h1>Paie de l'équipe (Admin & Supervision)</h1>
          <p>
            Chaque mois, le revenu net de la plateforme crédite le solde interne de chaque compte selon sa part (%).
            Un employé peut ensuite demander à retirer ce solde vers son Mobile Money — c'est cette demande que tu valides ci-dessous.
          </p>
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
        {actionNotice && (
          <div className="card" style={{ borderColor: 'var(--green, #16A34A)', color: 'var(--green, #16A34A)', marginBottom: 16 }}>
            {actionNotice}
          </div>
        )}

        {/* ── 1. Employés : vue d'ensemble ─────────────────────────── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Employés</div>
          <div className="card-sub">
            Part (%), solde disponible à retirer, et statut de leur dernière demande de retrait.
          </div>
          <div className="table-scroll" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Rôle</th>
                  <th>Part (%)</th>
                  <th>Solde disponible</th>
                  <th>Dernier retrait</th>
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
                  accounts.map((a) => {
                    const isDirty = Number(pctDraft[a.id] ?? 0) !== Number(a.payoutPercentage);
                    const lastWithdrawal = latestWithdrawalByUser[a.id];
                    return (
                      <tr key={a.id}>
                        <td>
                          <strong>
                            {a.firstName} {a.lastName}
                          </strong>
                        </td>
                        <td>{ROLE_LABEL[a.role] ?? a.role}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.01}
                              value={pctDraft[a.id] ?? 0}
                              onChange={(e) => setPctDraft((d) => ({ ...d, [a.id]: e.target.value }))}
                              className="fg-input"
                              style={{ width: 72, height: 32, borderColor: isDirty ? 'var(--orange, #f97316)' : undefined }}
                            />
                            <button
                              type="button"
                              className="btn-secondary-sm"
                              disabled={savingId === a.id || !isDirty}
                              onClick={() => savePercentage(a.id)}
                            >
                              {savingId === a.id ? '…' : 'Appliquer'}
                            </button>
                          </div>
                          {isDirty && (
                            <div style={{ fontSize: 11, color: 'var(--orange, #f97316)', marginTop: 2 }}>
                              non enregistré (actuel : {Number(a.payoutPercentage)}%)
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{formatFcfa(a.balance)}</strong>
                        </td>
                        <td>
                          {lastWithdrawal ? (
                            <>
                              <span className={WITHDRAWAL_STATUS_BADGE[lastWithdrawal.status] ?? 'badge-gray'}>
                                {WITHDRAWAL_STATUS_LABEL[lastWithdrawal.status] ?? lastWithdrawal.status}
                              </span>
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                                {formatFcfa(lastWithdrawal.amount)} — demandé le {formatDate(lastWithdrawal.requestedAt)}
                              </div>
                            </>
                          ) : (
                            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Aucune demande pour le moment</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="kpi-grid" style={{ marginTop: 16 }}>
            <div className="kpi-card">
              <div className="kpi-label">Réparti entre les comptes</div>
              <div className={`kpi-value kpi-value-sm ${overAllocated ? 'orange' : ''}`}>{loading ? '—' : `${draftSum} %`}</div>
              <div className="kpi-sub">
                {loading ? '' : overAllocated ? `Dépasse 100 % de ${Math.abs(draftRemaining)} pt` : 'Somme des champs ci-dessus'}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Part plateforme (le reste)</div>
              <div className="kpi-value kpi-value-sm">{loading ? '—' : `${Math.max(draftRemaining, 0)} %`}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Solde compte plateforme</div>
              <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(platformBalance)}</div>
            </div>
          </div>
        </div>

        {/* ── 2. Lancer la paie ─────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Lancer la paie</div>
          <div className="card-sub">
            Calcule le revenu net du mois précédent complet et crédite chaque employé selon sa part. Si le revenu net est nul ou négatif, rien n'est distribué et un message clair s'affiche.
          </div>

          <div className="form-grid" style={{ marginTop: 14, alignItems: 'end' }}>
            <div className="field-group">
              <label className="fg-label">Paie automatique mensuelle</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, height: 38 }}>
                <input
                  type="checkbox"
                  checked={scheduleDraft.isEnabled}
                  onChange={(e) => setScheduleDraft((s) => ({ ...s, isEnabled: e.target.checked }))}
                />
                Activée
              </label>
            </div>
            <div className="field-group">
              <label className="fg-label" htmlFor="payroll-day">
                Jour du mois (1–28)
              </label>
              <input
                id="payroll-day"
                type="number"
                min={1}
                max={28}
                value={scheduleDraft.dayOfMonth}
                onChange={(e) => setScheduleDraft((s) => ({ ...s, dayOfMonth: e.target.value }))}
                className="fg-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn-secondary-sm" onClick={saveSchedule}>
              Enregistrer la planification
            </button>
            <button type="button" className="action-btn" onClick={handleRunPayroll} disabled={runningPayroll}>
              <Play size={14} /> {runningPayroll ? 'Exécution…' : 'Lancer la paie manuellement'}
            </button>
          </div>

          {config?.schedule?.lastRunAt && (
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10 }}>
              Dernière exécution automatique : {formatDateTime(config.schedule.lastRunAt)}
            </p>
          )}
        </div>

        {/* ── 3. Retraits à valider ─────────────────────────────────── */}
        {(pendingWithdrawals.length > 0 || processingWithdrawals.length > 0) && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Retraits à valider</div>
            <div className="card-sub">
              Une demande de retrait transfère réellement l'argent du solde de l'employé vers son numéro Mobile Money via FedaPay.
            </div>
            <div className="table-scroll" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Montant</th>
                    <th>Numéro payout</th>
                    <th>Statut</th>
                    <th>Demandé le</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...pendingWithdrawals, ...processingWithdrawals].map((w) => (
                    <tr key={w.id}>
                      <td>
                        <strong>
                          {w.webUser?.firstName} {w.webUser?.lastName}
                        </strong>
                      </td>
                      <td>{formatFcfa(w.amount)}</td>
                      <td>{w.payoutNumber}</td>
                      <td>
                        <span className={WITHDRAWAL_STATUS_BADGE[w.status]}>{WITHDRAWAL_STATUS_LABEL[w.status]}</span>
                      </td>
                      <td>{formatDateTime(w.requestedAt)}</td>
                      <td>
                        {w.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="action-btn"
                              disabled={busyWithdrawalId === w.id}
                              onClick={() => handleApproveWithdrawal(w.id)}
                            >
                              {busyWithdrawalId === w.id ? '…' : 'Valider'}
                            </button>
                            <button
                              type="button"
                              className="btn-secondary-sm"
                              disabled={busyWithdrawalId === w.id}
                              onClick={() => handleRejectWithdrawal(w.id)}
                            >
                              Rejeter
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 4. Historique ─────────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">Historique</div>
          <div className="filter-pills" style={{ marginTop: 10 }}>
            <button
              type="button"
              className={`filter-pill ${historyTab === 'PAIES' ? 'active' : ''}`}
              onClick={() => setHistoryTab('PAIES')}
            >
              Paies exécutées
            </button>
            <button
              type="button"
              className={`filter-pill ${historyTab === 'RETRAITS' ? 'active' : ''}`}
              onClick={() => setHistoryTab('RETRAITS')}
            >
              Retraits terminés
            </button>
          </div>

          {historyTab === 'PAIES' && (
            <div className="table-scroll" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Période</th>
                    <th>Revenu net</th>
                    <th>Déclenchement</th>
                    <th>Par</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6}>Chargement...</td>
                    </tr>
                  )}
                  {!loading && runs.length === 0 && (
                    <tr>
                      <td colSpan={6}>Aucune paie exécutée pour le moment.</td>
                    </tr>
                  )}
                  {!loading &&
                    runs.map((r) => (
                      <Fragment key={r.id}>
                        <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedRunId(expandedRunId === r.id ? null : r.id)}>
                          <td>{expandedRunId === r.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                          <td>
                            {formatDate(r.periodStart)} → {formatDate(r.periodEnd)}
                          </td>
                          <td>{formatFcfa(r.netRevenue)}</td>
                          <td>{r.trigger === 'MANUAL' ? 'Manuel' : 'Automatique'}</td>
                          <td>{r.triggeredBy ? `${r.triggeredBy.firstName} ${r.triggeredBy.lastName}` : '—'}</td>
                          <td>{formatDateTime(r.createdAt)}</td>
                        </tr>
                        {expandedRunId === r.id && (
                          <tr>
                            <td colSpan={6} style={{ background: '#F8FAFC' }}>
                              <div style={{ padding: '8px 4px 12px 28px' }}>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>
                                  Répartition de cette paie
                                </div>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Compte</th>
                                      <th>Part appliquée</th>
                                      <th>Montant crédité</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(r.entries ?? []).map((e) => (
                                      <tr key={e.id}>
                                        <td>{e.webUser ? `${e.webUser.firstName} ${e.webUser.lastName}` : 'Compte plateforme'}</td>
                                        <td>{Number(e.percentage)} %</td>
                                        <td>{formatFcfa(e.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {historyTab === 'RETRAITS' && (
            <div className="table-scroll" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Demandé le</th>
                    <th>Traité par</th>
                  </tr>
                </thead>
                <tbody>
                  {finishedWithdrawals.length === 0 && (
                    <tr>
                      <td colSpan={5}>Aucun retrait terminé pour le moment.</td>
                    </tr>
                  )}
                  {finishedWithdrawals.map((w) => (
                    <tr key={w.id}>
                      <td>
                        {w.webUser?.firstName} {w.webUser?.lastName}
                      </td>
                      <td>{formatFcfa(w.amount)}</td>
                      <td>
                        <span className={WITHDRAWAL_STATUS_BADGE[w.status]}>{WITHDRAWAL_STATUS_LABEL[w.status]}</span>
                        {w.rejectionReason && (
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{w.rejectionReason}</div>
                        )}
                      </td>
                      <td>{formatDateTime(w.requestedAt)}</td>
                      <td>{w.processedBy ? `${w.processedBy.firstName} ${w.processedBy.lastName}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageContent>
    </>
  );
}