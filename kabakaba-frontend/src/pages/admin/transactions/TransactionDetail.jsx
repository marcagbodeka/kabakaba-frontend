import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getTransaction } from '../../../services/domain/transactionsService';

const TYPE_LABEL = {
  DEPOSIT: 'Recharge', ESCROW_LOCK: 'Séquestre', ESCROW_RELEASE: 'Libération séquestre',
  PAYMENT: 'Commande', REFUND: 'Remboursement', WITHDRAWAL: 'Retrait',
  COMMISSION: 'Commission', AMBASSADOR_COMMISSION: 'Commission ambassadeur',
  DEBT_RECOVERY: 'Recouvrement créance', TRANSFER: 'Transfert',
};
const TICKET_TYPES = new Set(['ESCROW_LOCK', 'ESCROW_RELEASE', 'PAYMENT', 'REFUND', 'TRANSFER']);
const TYPE_BADGE_CLASS = {
  DEPOSIT: 'badge-peach', PAYMENT: 'badge-blue', ESCROW_LOCK: 'badge-amber', ESCROW_RELEASE: 'badge-amber',
};
const COMPLETED_LABEL = {
  PAYMENT: 'Débité', DEPOSIT: 'Confirmé', REFUND: 'Effectué', WITHDRAWAL: 'Versé',
  ESCROW_LOCK: 'Séquestré', ESCROW_RELEASE: 'Libéré', COMMISSION: 'Versé',
  AMBASSADOR_COMMISSION: 'Versé', DEBT_RECOVERY: 'Recouvré', TRANSFER: 'Effectué',
};

function initialsOf(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}
function formatAmount(n, type) {
  return `${Number(n || 0).toLocaleString('fr-FR')} ${TICKET_TYPES.has(type) ? 'tickets' : 'FCFA'}`;
}
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function TransactionDetail() {
  const navigate = useNavigate();
  const { ref } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [t, setT] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTransaction(ref)
      .then(setT)
      .catch((err) => setError(err.message || 'Transaction introuvable.'))
      .finally(() => setLoading(false));
  }, [ref]);

  if (loading) {
    return (
      <>
        <Topbar icon={Monitor} breadcrumb={[{ label: 'Transactions', path: '/admin/transactions' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (error || !t) {
    return (
      <>
        <Topbar icon={Monitor} breadcrumb={[{ label: 'Transactions', path: '/admin/transactions' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error || 'Transaction introuvable.'}</p></PageContent>
      </>
    );
  }

  const shortRef = `#${t.id.slice(0, 8).toUpperCase()}`;
  const statusLabel = t.status === 'COMPLETED' ? (COMPLETED_LABEL[t.type] || 'Terminé') : t.status === 'PENDING' ? 'En attente' : 'Échoué';
  const statusBadgeClass = t.status === 'FAILED' ? 'badge-gray' : t.status === 'PENDING' ? 'badge-amber' : 'badge-green';
  const typeBadgeClass = TYPE_BADGE_CLASS[t.type] || 'badge-gray';

  const detailRows = [
    { label: 'Référence', value: shortRef, mono: true },
    { label: 'Type', badge: typeBadgeClass, value: TYPE_LABEL[t.type] || t.type },
    { label: 'Montant', value: formatAmount(t.amount, t.type), big: true },
    { label: 'Statut', badge: statusBadgeClass, value: statusLabel },
    { label: 'Horodatage', value: formatDateTime(t.createdAt) },
    ...(t.relatedOrder ? [{ label: 'Commande liée', value: `#${t.relatedOrder.id.slice(0, 8).toUpperCase()}`, mono: true }] : []),
    ...(t.relatedPayment ? [{ label: 'Opérateur', badge: 'badge-gray', value: t.relatedPayment.operator }] : []),
    ...(t.user?.campus?.name ? [{ label: 'Campus', badge: 'badge-blue', value: t.user.campus.name }] : []),
    ...(t.description ? [{ label: 'Description', value: t.description }] : []),
  ];

  const ownerName = `${t.user?.firstName ?? ''} ${t.user?.lastName ?? ''}`.trim() || '—';
  const vendorName = t.relatedOrder?.vendor?.canteenName;

  return (
    <>
      <Topbar breadcrumb={[{ label: 'Transactions', path: '/admin/transactions' }, { label: shortRef }]} icon={Monitor}>
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/transactions')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Transaction {shortRef}</h1>
          <span className={typeBadgeClass}>{TYPE_LABEL[t.type] || t.type}</span>
          <span className={statusBadgeClass}>{statusLabel}</span>
        </div>

        <div className="two-col" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-title">Détail de la transaction</div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
              {detailRows.map((row, i) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderBottom: i < detailRows.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--muted)' }}>{row.label}</span>
                  {row.badge ? (
                    <span className={row.badge}>{row.value}</span>
                  ) : (
                    <span style={{ fontWeight: row.big || row.mono ? 700 : 400, fontSize: row.big ? 18 : 14, fontFamily: row.mono ? 'monospace' : 'inherit', color: row.mono || row.big ? 'var(--indigo)' : 'var(--text)' }}>
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title">Parties</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                    Compte propriétaire
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="initials init-indigo" style={{ width: 32, height: 32, fontSize: 12 }}>{initialsOf(ownerName)}</span>
                    <div style={{ fontWeight: 600 }}>{ownerName}</div>
                  </div>
                </div>

                {vendorName && (
                  <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                      Cantine liée
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="initials init-orange" style={{ width: 32, height: 32, fontSize: 12 }}>{initialsOf(vendorName)}</span>
                      <div style={{ fontWeight: 600 }}>{vendorName}</div>
                    </div>
                  </div>
                )}

                {t.sender && (
                  <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Expéditeur</div>
                    <div style={{ fontWeight: 600 }}>{`${t.sender.firstName ?? ''} ${t.sender.lastName ?? ''}`.trim() || '—'}</div>
                  </div>
                )}
                {t.receiver && (
                  <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Destinataire</div>
                    <div style={{ fontWeight: 600 }}>{`${t.receiver.firstName ?? ''} ${t.receiver.lastName ?? ''}`.trim() || '—'}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ background: '#F8FAFC' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                Actions disponibles
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn-secondary-sm" style={{ justifyContent: 'center', opacity: 0.6, cursor: 'not-allowed' }} disabled title="Pas encore disponible : aucun formulaire de création de litige n'existe dans le dashboard admin">
                  Ouvrir un litige sur cette transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
