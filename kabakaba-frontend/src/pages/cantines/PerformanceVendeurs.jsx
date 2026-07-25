import { useEffect, useState } from 'react';
import { Utensils } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { getVendorPerformance } from '../../services/domain/analyticsService';

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}min ${s}s` : `${s}s`;
}

export default function PerformanceVendeurs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getVendorPerformance(30));
      } catch (err) {
        setError(err.message || 'Impossible de charger les performances vendeurs.');
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
        icon={Utensils}
        breadcrumb={[{ label: 'Par cantine', path: '/supervision/cantines/performance' }, { label: 'Performance vendeurs' }]}
        badge={{ text: '30 derniers jours' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Performance vendeurs</h1>
          <p>Volume de commandes, taux d&apos;acceptation, de refus et d&apos;annulation par cantine</p>
        </div>

        {error && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Cantines actives</div>
            <div className="kpi-value">{loading ? '—' : summary?.activeVendors}</div>
            <div className="kpi-sub">{loading ? '' : `sur ${summary?.totalVendors} affiliées`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Acceptation moyenne</div>
            <div className="kpi-value">{loading ? '—' : `${summary?.avgAcceptanceRate}%`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Temps moyen d&apos;acceptation</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatDuration(summary?.avgAcceptanceSeconds)}</div>
            <div className="kpi-sub">limite réglementaire : 5min</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Cantines sous surveillance</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : summary?.watchCount}</div>
            <div className="kpi-sub">{loading ? '' : `+ ${summary?.alertCount} en alerte`}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Classement par réactivité</div>
          <div className="card-sub">Temps moyen d&apos;acceptation — indicateur clé de réactivité</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cantine</th><th>Campus</th><th>Commandes</th><th>Acceptation</th>
                  <th>Refus</th><th>Annulation</th><th>Temps moyen</th><th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8}>Chargement...</td></tr>}
                {!loading && vendors.length === 0 && <tr><td colSpan={8}>Aucune cantine avec des commandes sur la période.</td></tr>}
                {!loading && vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="name-cell">
                      <span className={`status-dot dot-${v.status}`} />
                      <strong>{v.name}</strong>
                    </td>
                    <td>{v.campusName}</td>
                    <td>{v.orders}</td>
                    <td>{v.acceptanceRate}%</td>
                    <td>{v.refusalRate}%</td>
                    <td>{v.cancellationRate}%</td>
                    <td>{formatDuration(v.avgAcceptanceSeconds)}</td>
                    <td>
                      {v.status === 'green' && <span className="badge-green">Bonne</span>}
                      {v.status === 'orange' && <span className="badge-orange">À surveiller</span>}
                      {v.status === 'red' && <span className="badge-red">Alerte</span>}
                    </td>
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