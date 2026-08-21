import { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingDown, TrendingUp } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { getCampusComparison, getRevenueBreakdown, getVendorPerformance } from '../../services/domain/analyticsService';
import { getSupervisionStats } from '../../services/domain/adminStatsService';

const DAY_LABELS_FR = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam', 0: 'Dim' };

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

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

function pctChange(current, previous) {
  if (previous == null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function TrendBadge({ value }) {
  if (value == null) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={up ? 'badge-green' : 'badge-orange'}>
      <Icon size={14} />
      {Math.abs(value)}%
    </span>
  );
}

export default function VueGenerale() {
  const [range, setRange] = useState({ from: daysAgo(6), to: startOfDay(new Date()) });
  const [campus, setCampus] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [vendorPerf, setVendorPerf] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [campusData, revenueData, perfData, statsData] = await Promise.all([
          getCampusComparison(undefined, range),
          getRevenueBreakdown(undefined, range),
          getVendorPerformance(undefined, range),
          getSupervisionStats(),
        ]);
        setCampus(campusData);
        setRevenue(revenueData);
        setVendorPerf(perfData);
        setStats(statsData);
      } catch (err) {
        setError(err.message || 'Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const summary = campus?.summary;
  const revSummary = revenue?.summary;
  const revenueChange = summary ? pctChange(summary.totalRevenue, summary.totalRevenuePrevPeriod) : null;

  const dailySeries = campus?.dailyVolume?.series?.['Tous les campus'] ?? [];
  const maxDaily = Math.max(1, ...dailySeries);
  const dayLabels = (campus?.dailyVolume?.labels ?? []).map((d) => DAY_LABELS_FR[new Date(d).getDay()]);

  let completedOrders = 0;
  for (const c of campus?.campuses ?? []) {
    completedOrders += Math.round((c.orders * c.completionRate) / 100);
  }
  const totalOrders = summary?.totalOrders ?? 0;
  const otherOrders = Math.max(0, totalOrders - completedOrders);
  const completedPct = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const otherPct = totalOrders > 0 ? 100 - completedPct : 0;

  const acceptanceRate = vendorPerf?.summary?.avgAcceptanceRate ?? 0;

  const revenueBreakdown = [
    { label: 'Surplus recharges', value: revSummary?.surplus ?? 0, sub: 'revenu principal' },
    { label: 'Frais retrait non couverts', value: revSummary?.uncoveredFees ?? 0, sub: 'vendeurs sous seuil 10k' },
    { label: 'Commissions ambassadeurs', value: -(revSummary?.commissions ?? 0), sub: 'déduit du surplus', color: 'var(--orange)' },
    { label: 'Revenus nets', value: revSummary?.net ?? 0, sub: 'après déductions', color: 'var(--indigo)' },
  ];

  const statusBars = [
    { value: `${completedPct}%`, height: `${completedPct}%`, color: '#1B2A6B', opacity: 0.88, label: 'Complétées' },
    { value: `${otherPct}%`, height: `${otherPct}%`, color: '#F07840', opacity: 0.85, label: 'En cours / autres' },
  ];

  return (
    <>
      <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Vue générale' }]} hidePeriodSelect>
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Tableau de bord</div>
          <h1>Vue générale</h1>
          <p>Synthèse de l&apos;activité kabakaba sur l&apos;ensemble des campus</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Commandes</div>
            <div className="kpi-value">
              {loading ? '—' : totalOrders.toLocaleString('fr-FR')}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Chiffre d&apos;affaires</div>
            <div className="kpi-value kpi-value-sm">
              {loading ? '—' : formatFcfa(summary?.totalRevenue ?? 0)} {!loading && <TrendBadge value={revenueChange} />}
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Étudiants actifs</div>
            <div className="kpi-value kpi-value-sm">
              {loading ? '—' : (stats?.activeStudents30d ?? 0).toLocaleString('fr-FR')}
            </div>
            <div className="kpi-sub">30 derniers jours</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Cantines actives</div>
            <div className="kpi-value kpi-value-sm">
              {loading ? '—' : (stats?.activeVendors30d ?? 0).toLocaleString('fr-FR')}
            </div>
            <div className="kpi-sub">30 derniers jours</div>
          </div>
        </div>

        <div className="card-title" style={{ marginTop: 4 }}>
          Décomposition des revenus
        </div>
        <div className="card-sub">Ventilation par source (période sélectionnée)</div>
        <div className="kpi-grid">
          {revenueBreakdown.map((item) => (
            <div key={item.label} className="kpi-card">
              <div className="kpi-label">{item.label}</div>
              <div className="kpi-value kpi-value-sm" style={item.color ? { color: item.color } : undefined}>
                {loading ? '—' : typeof item.value === 'number' && item.label.includes('Commissions')
                  ? `${item.value <= 0 ? '− ' : ''}${Math.abs(item.value).toLocaleString('fr-FR')} FCFA`
                  : formatFcfa(item.value)}
              </div>
              <div className="kpi-sub">{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">Commandes / jour</div>
            <div className="chart-wrap">
              <div className="chart-bars" style={{ marginTop: 12 }}>
                {dailySeries.map((count, i) => (
                  <div
                    key={dayLabels[i] ?? i}
                    className="bar"
                    style={{
                      height: `${Math.max(4, (count / maxDaily) * 100)}%`,
                      background: '#1B2A6B',
                      opacity: 0.5 + (count / maxDaily) * 0.5,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="bar-labels">
              {dayLabels.map((day, i) => (
                <div key={day + i} className="bar-label">
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Répartition statuts</div>
            <div className="chart-stacked">
              {statusBars.map((item) => (
                <div key={item.label} className="chart-stacked-col">
                  <span className="chart-stacked-val">{loading ? '—' : item.value}</span>
                  <div
                    className="chart-stacked-bar"
                    style={{
                      height: loading ? '10%' : item.height,
                      background: item.color,
                      opacity: item.opacity,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="legend">
              {statusBars.map((item) => (
                <div key={item.label} className="legend-item">
                  <div className="legend-dot" style={{ background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12 }}>
              Taux d&apos;acceptation vendeurs (décisions) : {loading ? '—' : `${acceptanceRate} %`}
            </p>
          </div>
        </div>
      </PageContent>
    </>
  );
}
