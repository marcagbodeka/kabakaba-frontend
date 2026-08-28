import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { getRevenueBreakdown } from '../../services/domain/analyticsService';

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

const DAY_LABELS_FR = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam', 0: 'Dim' };

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
  const maxAbs = Math.max(1, ...dailyValues.map((v) => Math.abs(v)));
  const dayLabels = (data?.dailyNet?.labels ?? []).map((d) => DAY_LABELS_FR[new Date(d).getDay()]);

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
          <p>Détail des recharges, surplus et commissions par campus et par période</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-title">Supervision des entrées et sorties — tous campus</div>
          <div className="revenue-breakdown">
            <div className="revenue-cell">
              <div className="revenue-cell-label">Revenus Générés</div>
              <div className="revenue-cell-value">{loading ? '—' : formatFcfa(summary?.surplus ?? 0)}</div>
            </div>
            <div className="revenue-cell">
              <div className="revenue-cell-label">Retraits couverts</div>
              <div className="revenue-cell-value orange">{loading ? '—' : formatFcfa(summary?.uncoveredFees ?? 0)}</div>
            </div>
            <div className="revenue-cell">
              <div className="revenue-cell-label">Revenus ambassadeurs</div>
              <div className="revenue-cell-value">{loading ? '—' : formatFcfa(summary?.commissions ?? 0)}</div>
            </div>
            <div className="revenue-cell highlight">
              <div className="revenue-cell-label">Bénéfices nets</div>
              <div className="revenue-cell-value indigo">{loading ? '—' : formatFcfa(summary?.net ?? 0)}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Détail par campus</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Campus</th><th>Recharges (brut)</th><th>Surplus</th><th>Commissions versées</th><th>Net</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5}>Chargement...</td></tr>}
                {!loading && (data?.perCampus?.length ?? 0) === 0 && <tr><td colSpan={5}>Aucune donnée.</td></tr>}
                {!loading && data?.perCampus?.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{formatFcfa(c.rechargesGross)}</td>
                    <td>{formatFcfa(c.surplus)}</td>
                    <td>{formatFcfa(c.commissions)}</td>
                    <td>{formatFcfa(c.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Évolution du revenu net (7 jours)</div>
          <div className="chart-wrap">
            <div className="chart-bars" style={{ marginTop: 12 }}>
              {dailyValues.map((v, i) => (
                <div
                  key={i}
                  className="bar"
                  style={{
                    height: `${Math.max(4, (Math.abs(v) / maxAbs) * 100)}%`,
                    background: v < 0 ? '#EF4444' : '#1B2A6B',
                    opacity: 0.55 + Math.abs(v) / (maxAbs * 2.5),
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
      </PageContent>
    </>
  );
}