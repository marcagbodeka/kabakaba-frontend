import { useEffect, useState } from 'react';
import { Star, AlertTriangle } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import LineChart from '../../components/LineChart';
import { getReviewsQuality } from '../../services/domain/analyticsService';
import { chartPeriodTitle, formatChartDate } from '../../utils/chartLabels';

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export default function NotesAlertes() {
  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getReviewsQuality(30, range));
      } catch (err) {
        setError(err.message || 'Impossible de charger les notes.');
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const summary = data?.summary;
  const vendors = data?.perVendor ?? [];
  const rawDailyAvg = data?.dailyTrend?.avgRating ?? [];
  const rawDayLabels = data?.dailyTrend?.labels ?? [];
  // On ne trace que les jours où au moins un avis a été laissé — un jour
  // sans avis n'est pas une note de 0, c'est une absence de donnée.
  const dailyAvg = [];
  const dayLabels = [];
  rawDailyAvg.forEach((v, i) => {
    if (v !== null && v !== undefined) {
      dailyAvg.push(v);
      dayLabels.push(rawDayLabels[i]);
    }
  });

  return (
    <>
      <Topbar
        icon={Star}
        breadcrumb={[{ label: 'Avis & qualité', path: '/supervision/qualite/notes' }, { label: 'Notes & alertes' }]}
        hidePeriodSelect
      >
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Qualité</div>
          <h1>Notes & alertes</h1>
          <p>Note moyenne par vendeur, détection des cantines avec retours négatifs récurrents</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Note moyenne plateforme</div>
            <div className="kpi-value">{loading ? '—' : `${summary?.avgRating ?? '—'} / 5`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avis collectés</div>
            <div className="kpi-value">{loading ? '—' : summary?.totalReviews}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Cantines en alerte</div>
            <div className="kpi-value">{loading ? '—' : summary?.alertCount}</div>
            <div className="kpi-sub">note &lt; 3.5 sur la période</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{chartPeriodTitle('Tendance de la note moyenne', dayLabels.length)}</div>
          {dailyAvg.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 8 }}>Aucun avis sur la période.</p>
          ) : (
            <LineChart
              labels={dayLabels}
              values={dailyAvg}
              color="#F59E0B"
              formatLabel={formatChartDate}
              formatValue={(v) => `${v} / 5`}
            />
          )}
        </div>

        <div className="card">
          <div className="card-title">Classement par note</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Cantine</th><th>Campus</th><th>Note moyenne</th><th>Avis (période)</th><th>Statut</th></tr>
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