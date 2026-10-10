import { useEffect, useState } from 'react';
import { Utensils } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { getVendorPerformance } from '../../services/domain/analyticsService';
import { startOfDay, daysAgo } from '../../utils/dates';

export default function PerformanceVendeurs() {
  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getVendorPerformance(30, range));
      } catch (err) {
        setError(err.message || 'Impossible de charger les performances vendeurs.');
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const summary = data?.summary;
  const vendors = data?.vendors ?? [];

  return (
    <>
      <Topbar
        icon={Utensils}
        breadcrumb={[{ label: 'Par cantine', path: '/supervision/cantines/performance' }, { label: 'Performance vendeurs' }]}
      >
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Analyse cantines</div>
          <h1>Performance vendeurs</h1>
          <p>Volume de commandes et taux d&apos;annulation par cantine</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Cantines actives</div>
            <div className="kpi-value">{loading ? '—' : summary?.activeVendors}</div>
            <div className="kpi-sub">{loading ? '' : `sur ${summary?.totalVendors} affiliées`}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Commandes et annulations par cantine</div>
          <div className="card-sub">Taux d&apos;annulation : commandes annulées par la cantine parmi les commandes récupérées ou annulées</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cantine</th><th>Campus</th><th>Commandes</th><th>Annulation</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4}>Chargement...</td></tr>}
                {!loading && vendors.length === 0 && <tr><td colSpan={4}>Aucune cantine avec des commandes sur la période.</td></tr>}
                {!loading && vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="name-cell">
                      <strong>{v.name}</strong>
                    </td>
                    <td>{v.campusName}</td>
                    <td>{v.orders}</td>
                    <td>{v.cancellationRate}%</td>
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