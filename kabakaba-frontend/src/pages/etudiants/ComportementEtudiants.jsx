import { useEffect, useState } from 'react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { getStudentBehavior } from '../../services/domain/analyticsService';
import { formatChartDayLabels, chartPeriodTitle } from '../../utils/chartLabels';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
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

export default function ComportementEtudiants() {
  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getStudentBehavior(30, range));
      } catch (err) {
        setError(err.message || 'Impossible de charger le comportement étudiants.');
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const summary = data?.summary;

  const registrationValues = data?.dailyRegistrations?.values ?? [];
  const maxRegistrations = Math.max(1, ...registrationValues);
  const registrationLabels = formatChartDayLabels(data?.dailyRegistrations?.labels);

  const rechargeValues = data?.dailyRecharges?.values ?? [];
  const maxRecharge = Math.max(1, ...rechargeValues);
  const rechargeLabels = formatChartDayLabels(data?.dailyRecharges?.labels);

  return (
    <>
      <Topbar
        icon={Users}
        breadcrumb={[{ label: 'Étudiants', path: '/supervision/etudiants' }, { label: 'Comportement étudiants' }]}
        hidePeriodSelect
      >
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Étudiants</div>
          <h1>Comportement étudiants</h1>
          <p>Recharges, montant moyen, nombre d&apos;inscrits par campus</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Étudiants inscrits</div>
            <div className="kpi-value">{loading ? '—' : summary?.totalEnrolled}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Actifs</div>
            <div className="kpi-value">
              {loading ? '—' : summary?.totalActive}{' '}
              {summary?.activeChangePct !== null && summary?.activeChangePct !== undefined && (
                <span className={summary.activeChangePct >= 0 ? 'badge-green' : 'badge-red'}>
                  {summary.activeChangePct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{' '}
                  {Math.abs(summary.activeChangePct)}%
                </span>
              )}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Montant moyen rechargé</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.avgRecharge ?? 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Recharge minimale</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.minRecharge ?? 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Recharge maximale</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.maxRecharge ?? 0)}</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">{chartPeriodTitle('Évolution des inscriptions', registrationLabels.length)}</div>
            <div className="chart-wrap">
              <div className="chart-bars" style={{ marginTop: 12 }}>
                {registrationValues.map((v, i) => (
                  <div
                    key={i}
                    className="bar"
                    style={{ height: `${Math.max(4, (v / maxRegistrations) * 100)}%`, background: '#F07840', opacity: 0.55 + v / (maxRegistrations * 2.5) }}
                  />
                ))}
              </div>
            </div>
            <div className="bar-labels">
              {registrationLabels.map((d, i) => (
                <div key={i} className="bar-label">{d}</div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">{chartPeriodTitle('Évolution des recharges', rechargeLabels.length)}</div>
            <div className="chart-wrap">
              <div className="chart-bars" style={{ marginTop: 12 }}>
                {rechargeValues.map((v, i) => (
                  <div
                    key={i}
                    className="bar"
                    style={{ height: `${Math.max(4, (v / maxRecharge) * 100)}%`, background: '#1B2A6B', opacity: 0.55 + v / (maxRecharge * 2.5) }}
                  />
                ))}
              </div>
            </div>
            <div className="bar-labels">
              {rechargeLabels.map((d, i) => (
                <div key={i} className="bar-label">{d}</div>
              ))}
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
