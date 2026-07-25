import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { getVendorFinancials } from '../../services/domain/analyticsService';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

export default function SoldeCreances() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getVendorFinancials(30));
      } catch (err) {
        setError(err.message || 'Impossible de charger les données vendeurs.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = data?.summary;
  const vendors = data?.vendors ?? [];

  return (
    <>
      <Topbar
        icon={Wallet}
        breadcrumb={[{ label: 'Par cantine', path: '/supervision/cantines/performance' }, { label: 'Solde & créances' }]}
        badge={{ text: '30 derniers jours' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Solde & créances</h1>
          <p>Solde actuel, créances actives et retraits par vendeur</p>
        </div>

        {error && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Solde total vendeurs</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.totalBalance ?? 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Créances actives</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.totalDebt ?? 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Vendeurs bloqués</div>
            <div className="kpi-value">{loading ? '—' : summary?.blockedCount}</div>
            <div className="kpi-sub">retrait suspendu (créance active)</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Solde par cantine</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Cantine</th><th>Campus</th><th>Solde</th><th>Créance</th><th>Retraits (30j)</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6}>Chargement...</td></tr>}
                {!loading && vendors.length === 0 && <tr><td colSpan={6}>Aucun vendeur.</td></tr>}
                {!loading && vendors.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.campusName}</td>
                    <td>{formatFcfa(v.balance)}</td>
                    <td>{formatFcfa(v.debt)}</td>
                    <td>{v.withdrawals30d}</td>
                    <td>
                      {v.blocked ? <span className="badge-red">Retrait bloqué</span> : <span className="badge-green">Disponible</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12 }}>
            Une créance active bloque le retrait tant qu&apos;elle n&apos;est pas régularisée.
          </p>
        </div>
      </PageContent>
    </>
  );
}