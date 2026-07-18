import { useNavigate, useParams } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

export default function TransactionDetail() {
  const navigate = useNavigate();
  const { ref } = useParams();

  return (
    <>
      <Topbar
        icon={Monitor}
        breadcrumb={[{ label: 'Transactions', path: '/admin/transactions' }, { label: `#${ref || 'TX-9821'}` }]}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/transactions')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Transaction #{ref || 'TX-9821'}</h1>
          <span className="badge-blue">Commande</span>
          <span className="badge-green">Débité</span>
        </div>

        <div className="two-col" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-title">Détail de la transaction</div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
              {[
                { label: 'Référence', value: `#${ref || 'TX-9821'}`, mono: true },
                { label: 'Type', badge: 'badge-blue', value: 'Commande' },
                { label: 'Montant', value: '800 tickets', big: true },
                { label: 'Statut', badge: 'badge-green', value: 'Débité' },
                { label: 'Horodatage', value: "Aujourd'hui · 11:22:34" },
                { label: 'Commande liée', value: '#CMD-2847', link: true },
                { label: 'Campus', badge: 'badge-blue', value: 'UCAO' },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--muted)' }}>{row.label}</span>
                  {row.badge ? (
                    <span className={row.badge}>{row.value}</span>
                  ) : (
                    <span
                      style={{
                        fontWeight: row.big || row.mono || row.link ? 700 : 400,
                        fontSize: row.big ? 18 : 14,
                        fontFamily: row.mono ? 'monospace' : 'inherit',
                        color: row.mono || row.big || row.link ? 'var(--indigo)' : 'var(--text)',
                        cursor: row.link ? 'pointer' : 'default',
                      }}
                    >
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
                    Étudiant (débiteur)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="initials init-indigo" style={{ width: 32, height: 32, fontSize: 12 }}>AK</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Ama Kokou</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Solde après : 1 450 tickets</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                    Vendeur (créditeur)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="initials init-orange" style={{ width: 32, height: 32, fontSize: 12 }}>CC</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Cantine Centrale</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Solde après : 42 300 FCFA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: '#F8FAFC' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                Actions disponibles
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn-secondary-sm" style={{ justifyContent: 'center' }} onClick={() => navigate('/admin/litiges/LIT-0041')}>
                  Ouvrir un litige sur cette transaction
                </button>
                <button className="btn-secondary-sm" style={{ justifyContent: 'center' }}>
                  Exporter les détails (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
