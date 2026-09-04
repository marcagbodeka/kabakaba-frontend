import { useEffect, useMemo, useState } from 'react';
import { Monitor, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getTransactionsStats, getActiveDebts, getTransactions } from '../../../services/domain/transactionsService';
import { getOrders } from '../../../services/domain/ordersService';
import { findAllCampuses } from '../../../services/domain/campusesService';
import { getVendors } from '../../../services/domain/vendorsService';

const PAGE_SIZE = 10;
const ESCROWED_STATUSES = ['PENDING', 'ACCEPTED', 'IN_PREPARATION', 'READY'];

const TYPE_LABEL = {
  DEPOSIT: 'Recharge', ESCROW_LOCK: 'Séquestre', ESCROW_RELEASE: 'Libération séquestre',
  PAYMENT: 'Commande', REFUND: 'Remboursement', WITHDRAWAL: 'Retrait',
  COMMISSION: 'Commission', AMBASSADOR_COMMISSION: 'Commission ambassadeur',
  DEBT_RECOVERY: 'Recouvrement créance', TRANSFER: 'Transfert',
};
// Unité d'affichage par type : les mouvements d'argent (recharge, retrait,
// commissions) sont en FCFA ; les mouvements liés aux commandes (séquestre,
// débit, remboursement) sont en tickets, l'unité interne de l'app.
const TICKET_TYPES = new Set(['ESCROW_LOCK', 'ESCROW_RELEASE', 'PAYMENT', 'REFUND', 'TRANSFER']);
const COMPLETED_LABEL = {
  PAYMENT: 'Débité', DEPOSIT: 'Confirmé', REFUND: 'Effectué', WITHDRAWAL: 'Versé',
  ESCROW_LOCK: 'Séquestré', ESCROW_RELEASE: 'Libéré', COMMISSION: 'Versé',
  AMBASSADOR_COMMISSION: 'Versé', DEBT_RECOVERY: 'Recouvré', TRANSFER: 'Effectué',
};
const ORDER_STATUS_LABEL = {
  PENDING: 'En attente vendeur', ACCEPTED: 'Acceptée', IN_PREPARATION: 'En préparation', READY: 'Prête',
};

function initialsOf(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}
function formatAmount(n, type) {
  const value = Number(n || 0);
  return `${value.toLocaleString('fr-FR')} ${TICKET_TYPES.has(type) ? 'tickets' : 'FCFA'}`;
}
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function minutesAgo(iso) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function typeBadge(type) {
  if (type === 'REFUND') return <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{TYPE_LABEL[type]}</span>;
  if (type === 'WITHDRAWAL') return <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{TYPE_LABEL[type]}</span>;
  if (type === 'DEPOSIT') return <span className="badge-peach">{TYPE_LABEL[type]}</span>;
  if (type === 'ESCROW_LOCK' || type === 'ESCROW_RELEASE') return <span className="badge-amber">{TYPE_LABEL[type]}</span>;
  if (type === 'PAYMENT') return <span className="badge-blue">{TYPE_LABEL[type]}</span>;
  return <span className="badge-gray">{TYPE_LABEL[type] || type}</span>;
}

export default function Transactions() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);

  const [campuses, setCampuses] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Onglet "Toutes"
  const [typeFilter, setTypeFilter] = useState('all');
  const [campusFilter, setCampusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txMeta, setTxMeta] = useState({ total: 0, totalPages: 1 });

  // Onglet "Séquestres"
  const [escrowLoading, setEscrowLoading] = useState(true);
  const [escrowOrders, setEscrowOrders] = useState([]);

  // Onglet "Remboursements"
  const [refundLoading, setRefundLoading] = useState(true);
  const [refundOrders, setRefundOrders] = useState([]);

  // Onglet "Créances"
  const [debtsLoading, setDebtsLoading] = useState(true);
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    getTransactionsStats().then(setStats).catch((err) => setStatsError(err.message));
    findAllCampuses().then(setCampuses).catch(() => setCampuses([]));
    getVendors(1, 100).then((res) => setVendors(res.data)).catch(() => setVendors([]));
  }, []);

  useEffect(() => { setPage(1); }, [typeFilter, campusFilter, vendorFilter]);

  useEffect(() => {
    if (tab !== 'all') return;
    setTxLoading(true);
    setTxError(null);
    getTransactions(page, PAGE_SIZE, {
      type: typeFilter !== 'all' ? typeFilter : undefined,
      campusId: campusFilter !== 'all' ? campusFilter : undefined,
      vendorId: vendorFilter !== 'all' ? vendorFilter : undefined,
    })
      .then((res) => { setTransactions(res.data); setTxMeta(res.meta); })
      .catch((err) => setTxError(err.message || 'Impossible de charger les transactions.'))
      .finally(() => setTxLoading(false));
  }, [tab, page, typeFilter, campusFilter, vendorFilter]);

  useEffect(() => {
    if (tab !== 'seq') return;
    setEscrowLoading(true);
    getOrders(1, 50, { statuses: ESCROWED_STATUSES })
      .then((res) => setEscrowOrders(res.data))
      .finally(() => setEscrowLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'remb') return;
    setRefundLoading(true);
    getOrders(1, 50, { status: 'REFUNDED' })
      .then((res) => setRefundOrders(res.data))
      .finally(() => setRefundLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'creances') return;
    setDebtsLoading(true);
    getActiveDebts().then(setDebts).finally(() => setDebtsLoading(false));
  }, [tab]);

  const escrowTotal = useMemo(() => escrowOrders.reduce((s, o) => s + Number(o.escrowAmount), 0), [escrowOrders]);

  return (
    <>
      <Topbar icon={Monitor} breadcrumb={[{ label: 'Transactions' }]} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Transactions</div>
          <h1>Transactions</h1>
          <p>Suivi en temps réel · Séquestres, débits, remboursements, créances</p>
        </div>

        {statsError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{statsError}</p>}

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">Transactions aujourd&apos;hui</div>
            <div className="kpi-value">{stats ? stats.transactionsToday : '…'}</div>
            <div className="kpi-sub">toutes catégories</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">En séquestre</div>
            <div className="kpi-value" style={{ color: 'var(--orange)' }}>{stats ? `${stats.escrow.total.toLocaleString('fr-FR')} tickets` : '…'}</div>
            <div className="kpi-sub">{stats ? `${stats.escrow.count} commande${stats.escrow.count === 1 ? '' : 's'} en cours` : '—'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Débits complétés</div>
            <div className="kpi-value" style={{ color: '#22C55E' }}>{stats ? `${stats.debitsCompleted.toLocaleString('fr-FR')} tickets` : '…'}</div>
            <div className="kpi-sub">commandes livrées</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Remboursements</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>{stats ? `${stats.refunds.total.toLocaleString('fr-FR')} tickets` : '…'}</div>
            <div className="kpi-sub">{stats ? `${stats.refunds.count} remboursement${stats.refunds.count === 1 ? '' : 's'}` : '—'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Créances actives</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>{stats ? `${stats.activeDebts.total.toLocaleString('fr-FR')} FCFA` : '…'}</div>
            <div className="kpi-sub">{stats ? `${stats.activeDebts.vendorCount} vendeur${stats.activeDebts.vendorCount === 1 ? '' : 's'}` : '—'}</div>
          </div>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>Toutes ({txMeta.total})</button>
          <button className={`tab-btn ${tab === 'seq' ? 'active' : ''}`} onClick={() => setTab('seq')}>Séquestres {stats ? `(${stats.escrow.count})` : ''}</button>
          <button className={`tab-btn ${tab === 'remb' ? 'active' : ''}`} onClick={() => setTab('remb')}>Remboursements {stats ? `(${stats.refunds.count})` : ''}</button>
          <button className={`tab-btn ${tab === 'creances' ? 'active' : ''}`} onClick={() => setTab('creances')}>Créances {stats ? `(${stats.activeDebts.vendorCount})` : ''}</button>
        </div>

        {tab === 'all' && (
          <>
            <div className="filter-bar">
              <div className="filter-group">
                <label className="filter-label">Type</label>
                <div className="tab-pills">
                  <button className={`pill${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>Tous</button>
                  <button className={`pill${typeFilter === 'DEPOSIT' ? ' active' : ''}`} onClick={() => setTypeFilter('DEPOSIT')}>Recharge</button>
                  <button className={`pill${typeFilter === 'PAYMENT' ? ' active' : ''}`} onClick={() => setTypeFilter('PAYMENT')}>Commande</button>
                  <button className={`pill${typeFilter === 'REFUND' ? ' active' : ''}`} onClick={() => setTypeFilter('REFUND')}>Remboursement</button>
                  <button className={`pill${typeFilter === 'WITHDRAWAL' ? ' active' : ''}`} onClick={() => setTypeFilter('WITHDRAWAL')}>Retrait</button>
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Campus</label>
                <select className="filter-select" value={campusFilter} onChange={(e) => setCampusFilter(e.target.value)}>
                  <option value="all">Tous</option>
                  {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Cantine</label>
                <select className="filter-select" value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
                  <option value="all">Toutes</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.canteenName}</option>)}
                </select>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr><th>Réf.</th><th>Type</th><th>Étudiant / Vendeur</th><th>Cantine</th><th>Montant</th><th>Opérateur</th><th>Statut</th><th>Horodatage</th><th></th></tr>
                  </thead>
                  <tbody>
                    {txLoading && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>Chargement…</td></tr>}
                    {txError && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px 0', color: '#DC2626' }}>{txError}</td></tr>}
                    {!txLoading && !txError && transactions.length === 0 && (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>Aucune transaction ne correspond à ces filtres.</td></tr>
                    )}
                    {!txLoading && !txError && transactions.map((t) => {
                      const personName = `${t.user?.firstName ?? ''} ${t.user?.lastName ?? ''}`.trim() || '—';
                      const statusLabel = t.status === 'COMPLETED' ? (COMPLETED_LABEL[t.type] || 'Terminé') : t.status === 'PENDING' ? 'En attente' : 'Échoué';
                      const statusTone = t.status === 'FAILED' ? 'badge-gray' : t.status === 'PENDING' ? 'badge-amber' : 'badge-green';
                      return (
                        <tr key={t.id} onClick={() => navigate(`/admin/transactions/${t.id}`)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 700, color: 'var(--indigo)', fontFamily: 'monospace', fontSize: 12 }}>#{t.id.slice(0, 8)}</td>
                          <td>{typeBadge(t.type)}</td>
                          <td className="name-cell"><span className="initials init-indigo" style={{ width: 24, height: 24, borderRadius: 6, fontSize: 10 }}>{initialsOf(personName)}</span>{personName}</td>
                          <td style={{ fontSize: 13, color: t.relatedOrder?.vendor?.canteenName ? 'inherit' : 'var(--muted)' }}>{t.relatedOrder?.vendor?.canteenName || '—'}</td>
                          <td style={{ fontWeight: 700, color: t.type === 'REFUND' ? '#DC2626' : t.type === 'WITHDRAWAL' ? '#22C55E' : 'var(--indigo)' }}>
                            {t.type === 'REFUND' ? '−' : ''}{formatAmount(t.amount, t.type)}
                          </td>
                          <td><span className="badge-gray" style={{ fontSize: 11 }}>{t.relatedPayment?.operator || '—'}</span></td>
                          <td><span className={statusTone}>{statusLabel}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDateTime(t.createdAt)}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => navigate(`/admin/transactions/${t.id}`)}>
                              <Eye size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
                <span>Affichage {txMeta.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, txMeta.total)} sur {txMeta.total} transaction{txMeta.total === 1 ? '' : 's'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="icon-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>←</button>
                  {Array.from({ length: Math.min(txMeta.totalPages, 7) }, (_, i) => i + 1).map((n) => (
                    <button key={n} className="icon-btn" style={n === page ? { background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' } : undefined} onClick={() => setPage(n)}>{n}</button>
                  ))}
                  <button className="icon-btn" disabled={page >= txMeta.totalPages} onClick={() => setPage((p) => Math.min(txMeta.totalPages, p + 1))}>→</button>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'seq' && (
          <div className="card">
            <div className="card-title">Séquestres actifs</div>
            <div className="card-sub">Tickets réservés pour des commandes en cours — non encore débités</div>
            {escrowLoading && <p style={{ color: 'var(--muted)' }}>Chargement…</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!escrowLoading && escrowOrders.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>Aucune commande en séquestre actuellement.</p>}
              {escrowOrders.map((o) => {
                const studentName = `${o.student?.firstName ?? ''} ${o.student?.lastName ?? ''}`.trim() || '—';
                return (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="initials init-indigo" style={{ width: 28, height: 28, fontSize: 11 }}>{initialsOf(studentName)}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{studentName} · {o.vendor?.canteenName}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Commande #{o.id.slice(0, 8)} · {ORDER_STATUS_LABEL[o.status] || o.status} · depuis {minutesAgo(o.createdAt)} min</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{o.totalTickets} tickets</span>
                  </div>
                );
              })}
            </div>
            {!escrowLoading && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, fontSize: 14, color: '#475569' }}>
                Total en séquestre : <strong style={{ color: 'var(--indigo)' }}>{escrowTotal.toLocaleString('fr-FR')} tickets</strong> · {escrowOrders.length} commande{escrowOrders.length === 1 ? '' : 's'} active{escrowOrders.length === 1 ? '' : 's'}
              </div>
            )}
          </div>
        )}

        {tab === 'remb' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-scroll">
              <table>
                <thead><tr><th>Réf.</th><th>Étudiant</th><th>Vendeur</th><th>Montant</th><th>Date</th><th>Motif</th></tr></thead>
                <tbody>
                  {refundLoading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>Chargement…</td></tr>}
                  {!refundLoading && refundOrders.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>Aucun remboursement.</td></tr>}
                  {refundOrders.map((o) => {
                    const studentName = `${o.student?.firstName ?? ''} ${o.student?.lastName ?? ''}`.trim() || '—';
                    return (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--indigo)' }}>#{o.id.slice(0, 8)}</td>
                        <td>{studentName}</td>
                        <td>{o.vendor?.canteenName || '—'}</td>
                        <td style={{ fontWeight: 700, color: '#DC2626' }}>{o.totalTickets} tickets</td>
                        <td style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDateTime(o.updatedAt)}</td>
                        <td style={{ fontSize: 13, color: '#475569' }}>{o.reason || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'creances' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {debtsLoading && <div className="card"><p style={{ color: 'var(--muted)' }}>Chargement…</p></div>}
            {!debtsLoading && debts.length === 0 && <div className="card"><p style={{ color: 'var(--muted)' }}>Aucune créance active.</p></div>}
            {debts.map((d) => {
              const pct = d.amount > 0 ? Math.round((d.recoveredAmount / d.amount) * 100) : 0;
              return (
                <div className="card" key={d.id}>
                  <div className="card-title">Créance active</div>
                  <div className="card-sub">Montant avancé par la plateforme en attente de récupération sur le solde vendeur</div>
                  <div style={{ padding: 16, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FCA5A5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{d.canteenName}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{d.ownerName} · {d.campusName} · Créance ouverte le {formatDateTime(d.createdAt)}</div>
                        <div style={{ fontSize: 13, color: '#DC2626', marginTop: 4, fontWeight: 500 }}>Retrait bloqué jusqu&apos;au remboursement intégral</div>
                        {d.reason && <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Motif : {d.reason}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>{d.remainingAmount.toLocaleString('fr-FR')} FCFA</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Solde vendeur actuel : {d.vendorBalance.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, height: 8, background: '#FEE2E2', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#DC2626', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>Progression : {d.recoveredAmount.toLocaleString('fr-FR')} / {d.amount.toLocaleString('fr-FR')} FCFA récupérés ({pct}%)</div>
                  </div>
                  <div style={{ marginTop: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, fontSize: 14, color: '#475569' }}>
                    La créance sera récupérée automatiquement dès que le solde du vendeur l&apos;atteint, à chaque nouvelle commande.
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContent>
    </>
  );
}
