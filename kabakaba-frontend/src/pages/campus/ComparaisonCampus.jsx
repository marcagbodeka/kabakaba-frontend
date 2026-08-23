import { useEffect, useState } from 'react';
import { Building2, TrendingUp, TrendingDown } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { getCampusComparison, getTopCanteens } from '../../services/domain/analyticsService';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

function pctChange(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

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

const DAY_LABELS_FR = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam', 0: 'Dim' };

export default function ComparaisonCampus() {
  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
  const [data, setData] = useState(null);
  const [topCanteens, setTopCanteens] = useState([]);
  const [selected, setSelected] = useState('Tous les campus');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [comparison, canteens] = await Promise.all([getCampusComparison(30, range), getTopCanteens(30, 10, range)]);
        setData(comparison);
        setTopCanteens(canteens);
      } catch (err) {
        setError(err.message || 'Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const summary = data?.summary;
  const ordersChange = summary ? pctChange(summary.totalOrders, summary.totalOrdersPrevPeriod) : null;
  const revenueChange = summary ? pctChange(summary.totalRevenue, summary.totalRevenuePrevPeriod) : null;

  const dailySeries = data?.dailyVolume?.series?.[selected] ?? [];
  const maxDaily = Math.max(1, ...dailySeries);
  const dayLabels = (data?.dailyVolume?.labels ?? []).map((d) => DAY_LABELS_FR[new Date(d).getDay()]);

  return (
    <>
      <Topbar
        icon={Building2}
        breadcrumb={[{ label: 'Par campus', path: '/supervision/campus' }, { label: 'Comparaison campus' }]}
        hidePeriodSelect
      >
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Analyse campus</div>
          <h1>Comparaison campus</h1>
          <p>Performances comparées entre les campus actifs</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Campus actifs</div>
            <div className="kpi-value">{loading ? '—' : summary?.activeCampuses}</div>
            <div className="kpi-sub">{loading ? '' : `sur ${summary?.totalCampuses} enregistrés`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commandes totales</div>
            <div className="kpi-value">
              {loading ? '—' : summary?.totalOrders}{' '}
              {ordersChange !== null && (
                <span className={ordersChange >= 0 ? 'badge-green' : 'badge-red'}>
                  {ordersChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {Math.abs(ordersChange)}%
                </span>
              )}
            </div>
            <div className="kpi-sub">période sélectionnée</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Revenus générés</div>
            <div className="kpi-value kpi-value-sm">
              {loading ? '—' : formatFcfa(summary?.totalRevenue ?? 0)}{' '}
              {revenueChange !== null && (
                <span className={revenueChange >= 0 ? 'badge-green' : 'badge-red'}>
                  {revenueChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {Math.abs(revenueChange)}%
                </span>
              )}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Étudiants inscrits</div>
            <div className="kpi-value">{loading ? '—' : summary?.totalStudents}</div>
            <div className="kpi-sub">{loading ? '' : `actifs : ${summary?.activeStudents}`}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Tous les campus</div>
          <div className="card-sub">Comparaison détaillée des campus affiliés</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Campus</th><th>Cantines</th><th>Commandes</th><th>Taux complétion</th>
                  <th>Revenus (FCFA)</th><th>Inscrits</th><th>Actifs</th><th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8}>Chargement...</td></tr>}
                {!loading && (data?.campuses?.length ?? 0) === 0 && <tr><td colSpan={8}>Aucun campus.</td></tr>}
                {!loading && data?.campuses?.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.cantines}</td>
                    <td>{c.orders}</td>
                    <td>{c.completionRate}%</td>
                    <td>{formatFcfa(c.revenue)}</td>
                    <td>{c.enrolled}</td>
                    <td>{c.active}</td>
                    <td>
                      {c.isActive ? <span className="badge-green">Actif</span> : <span className="badge-gray">Inactif</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Volume commandes / 7 jours</div>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{
                fontSize: 13, fontWeight: 600, color: 'var(--indigo)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '6px 10px', fontFamily: 'inherit', background: 'var(--surface)',
              }}
            >
              {Object.keys(data?.dailyVolume?.series ?? { 'Tous les campus': [] }).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="chart-wrap">
            <div className="chart-bars" style={{ marginTop: 12 }}>
              {dailySeries.map((v, i) => (
                <div key={i} className="bar" style={{ height: `${(v / maxDaily) * 100}%`, background: '#1B2A6B', opacity: 0.55 + v / (maxDaily * 2.5) }} />
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
          <div className="card-title">Top cantines — tous campus</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Cantine</th><th>Campus</th><th>Commandes</th><th>Acceptation</th><th>Note</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5}>Chargement...</td></tr>}
                {!loading && topCanteens.length === 0 && <tr><td colSpan={5}>Aucune donnée.</td></tr>}
                {!loading && topCanteens.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.campusName}</td>
                    <td>{c.orders}</td>
                    <td>{c.acceptanceRate}%</td>
                    <td>{c.avgRating !== null ? `★ ${c.avgRating}` : '—'}</td>
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