import { useEffect, useState } from 'react';
import { Star, AlertTriangle } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { getReviewsQuality } from '../../services/domain/analyticsService';

export default function NotesAlertes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getReviewsQuality(30));
      } catch (err) {
        setError(err.message || 'Impossible de charger les notes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = data?.summary;
  const vendors = data?.perVendor ?? [];
  const dailyAvg = data?.dailyTrend?.avgRating ?? [];
  const dayLabels = (data?.dailyTrend?.labels ?? []).map((d) =>
    new Date(d).toLocaleDateString('fr-FR', { weekday: 'short' }),
  );
  const maxRating = 5;

  return (
    <>
      <Topbar
        icon={Star}
        breadcrumb={[{ label: 'Avis & qualité', path: '/supervision/qualite/notes' }, { label: 'Notes & alertes' }]}
        badge={{ text: '30 derniers jours' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Notes & alertes</h1>
          <p>Note moyenne par vendeur, détection des cantines avec retours négatifs récurrents</p>
        </div>

        {error && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Note moyenne plateforme</div>
            <div className="kpi-value">{loading ? '—' : `${summary?.avgRating ?? '—'} / 5`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avis collectés (30j)</div>
            <div className="kpi-value">{loading ? '—' : summary?.totalReviews}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Cantines en alerte</div>
            <div className="kpi-value">{loading ? '—' : summary?.alertCount}</div>
            <div className="kpi-sub">note &lt; 3.5 sur 30 jours</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Tendance de la note moyenne (7 jours)</div>
          <div className="chart-wrap">
            <div className="chart-bars" style={{ marginTop: 12 }}>
              {dailyAvg.map((v, i) => (
                <div
                  key={i}
                  className="bar"
                  style={{
                    height: v !== null ? `${(v / maxRating) * 100}%` : '2%',
                    background: '#F59E0B',
                    opacity: v !== null ? 0.5 + v / 10 : 0.15,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="bar-labels">
            {dayLabels.map((d, i) => (
              <div key={i} className="bar-label">{d}</div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Classement par note</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Cantine</th><th>Campus</th><th>Note moyenne</th><th>Avis (30j)</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5}>Chargement...</td></tr>}
                {!loading && vendors.length === 0 && <tr><td colSpan={5}>Aucune donnée.</td></tr>}
                {!loading && vendors.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.campusName}</td>
                    <td>★ {v.avgRating}</td>
                    <td>{v.reviewCount}</td>
                    <td>
                      {v.alert ? (
                        <span className="badge-red"><AlertTriangle size={12} /> Retours négatifs récurrents</span>
                      ) : (
                        <span className="badge-green">Correcte</span>
                      )}
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