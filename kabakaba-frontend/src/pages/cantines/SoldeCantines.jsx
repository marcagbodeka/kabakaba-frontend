import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { getVendorFinancials } from '../../services/domain/analyticsService';
import { startOfDay, daysAgo } from '../../utils/dates';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

export default function SoldeCantines() {
  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getVendorFinancials(30, range));
      } catch (err) {
        setError(err.message || 'Impossible de charger les données vendeurs.');
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
        icon={Wallet}
        breadcrumb={[{ label: 'Par cantine', path: '/supervision/cantines/performance' }, { label: 'Solde des cantines' }]}
      >
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Analyse cantines</div>
          <h1>Solde des cantines</h1>
          <p>Solde actuel et retraits par cantine</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Solde total vendeurs</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.totalBalance ?? 0)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Solde par cantine</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Cantine</th><th>Campus</th><th>Solde</th><th>Retraits (période)</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4}>Chargement...</td></tr>}
                {!loading && vendors.length === 0 && <tr><td colSpan={4}>Aucun vendeur.</td></tr>}
                {!loading && vendors.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.campusName}</td>
                    <td>{formatFcfa(v.balance)}</td>
                    <td>{v.withdrawals30d}</td>
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