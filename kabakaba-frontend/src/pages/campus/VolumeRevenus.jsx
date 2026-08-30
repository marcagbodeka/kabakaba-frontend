import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { getRevenueBreakdown } from '../../services/domain/analyticsService';
import LineChart from '../../components/LineChart';
import { chartPeriodTitle, formatChartDate } from '../../utils/chartLabels';

function formatFcfa(n) {
  return `${Math.round(Number(n)).toLocaleString('fr-FR')} FCFA`;
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

export default function VolumeRevenus() {
  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getRevenueBreakdown(30, range));
      } catch (err) {
        setError(err.message || 'Impossible de charger les revenus.');
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const summary = data?.summary;
  const dailyValues = data?.dailyNet?.values ?? [];
  const dayLabels = data?.dailyNet?.labels ?? [];

  return (
    <>
      <Topbar
        icon={BarChart3}
        breadcrumb={[{ label: 'Par campus', path: '/supervision/campus' }, { label: 'Volume & revenus' }]}
        hidePeriodSelect
      >
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Analyse campus</div>
          <h1>Volume & revenus</h1>
          <p>Détails financiers de l'application</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Revenus Générés</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.surplus ?? 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Revenus ambassadeurs</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.commissions ?? 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Bénéfices nets</div>
            <div className="kpi-value kpi-value-sm" style={{ color: 'var(--indigo)' }}>
              {loading ? '—' : formatFcfa(summary?.net ?? 0)}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Détail par campus</div>
          <div className="table-scroll">
            <table style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '34%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>
              <thead>
                <tr><th>Campus</th><th>Recharges (brut)</th><th>Commissions versées</th><th>Net</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4}>Chargement...</td></tr>}
                {!loading && (data?.perCampus?.length ?? 0) === 0 && <tr><td colSpan={4}>Aucune donnée.</td></tr>}
                {!loading && data?.perCampus?.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{formatFcfa(c.rechargesGross)}</td>
                    <td>{formatFcfa(c.commissions)}</td>
                    <td>{formatFcfa(c.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{chartPeriodTitle('Évolution du revenu net', dayLabels.length)}</div>
          <LineChart
            labels={data?.dailyNet?.labels ?? []}
            values={dailyValues}
            color="#1B2A6B"
            formatLabel={formatChartDate}
            formatValue={(v) => formatFcfa(v)}
          />
        </div>
      </PageContent>
    </>
  );
}