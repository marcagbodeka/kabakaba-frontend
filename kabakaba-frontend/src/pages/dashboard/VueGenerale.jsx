import { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingDown, TrendingUp } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import LineChart from '../../components/LineChart';
import { chartPeriodTitle, formatChartDate } from '../../utils/chartLabels';
import { getOrdersSummary, getRevenueBreakdown } from '../../services/domain/analyticsService';
import { getSupervisionStats } from '../../services/domain/adminStatsService';
import { startOfDay, daysAgo, previousRange } from '../../utils/dates';

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
  const [orders, setOrders] = useState(null);
  const [prevOrders, setPrevOrders] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersData, prevOrdersData, revenueData, statsData] = await Promise.all([
          getOrdersSummary(range),
          getOrdersSummary(previousRange(range)),
          getRevenueBreakdown(undefined, range),
          getSupervisionStats(),
        ]);
        setOrders(ordersData);
        setPrevOrders(prevOrdersData);
        setRevenue(revenueData);
        setStats(statsData);
      } catch (err) {
        setError(err.message || 'Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const totals = orders?.totals;
  const revSummary = revenue?.summary;
  const revenueChange = totals && prevOrders ? pctChange(totals.revenueTickets, prevOrders.totals.revenueTickets) : null;

  const dailySeries = (orders?.daily ?? []).map((d) => d.orders);
  const dayLabels = (orders?.daily ?? []).map((d) => d.date);

  const totalOrders = totals?.orders ?? 0;
  const completedOrders = totals?.receivedOrders ?? 0;
  const cancelledOrders = totals?.cancelledOrders ?? 0;
  const otherOrders = Math.max(0, totalOrders - completedOrders - cancelledOrders);
  const pctOfOrders = (n) => (totalOrders > 0 ? Math.round((n / totalOrders) * 100) : 0);

  const revenueBreakdown = [
    { label: 'Revenus Générés', value: revSummary?.surplus ?? 0 },
    { label: 'Retraits couverts', value: revSummary?.uncoveredFees ?? 0 },
    { label: 'Bénéfices nets', value: revSummary?.net ?? 0, color: 'var(--indigo)' },
  ];

  const statusBars = [
    { value: `${pctOfOrders(completedOrders)}%`, height: `${pctOfOrders(completedOrders)}%`, color: '#1B2A6B', opacity: 0.88, label: 'Complétées' },
    { value: `${pctOfOrders(cancelledOrders)}%`, height: `${pctOfOrders(cancelledOrders)}%`, color: '#F59E0B', opacity: 0.88, label: 'Annulées' },
    { value: `${pctOfOrders(otherOrders)}%`, height: `${pctOfOrders(otherOrders)}%`, color: '#F07840', opacity: 0.85, label: 'En cours / autres' },
  ];

  return (
    <>
      <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Vue générale' }]}>
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Tableau de bord</div>
          <h1>Vue générale</h1>
          <p>Synthèse de l&apos;activité kabakaba</p>
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
              {loading ? '—' : formatFcfa(totals?.revenueTickets ?? 0)} {!loading && <TrendBadge value={revenueChange} />}
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
          <div className="kpi-card">
            <div className="kpi-label">Étudiants inscrits</div>
            <div className="kpi-value kpi-value-sm">
              {loading ? '—' : (stats?.totalStudents ?? 0).toLocaleString('fr-FR')}
            </div>
            <div className="kpi-sub">au total</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Vendeuses</div>
            <div className="kpi-value kpi-value-sm">
              {loading ? '—' : (stats?.totalVendors ?? 0).toLocaleString('fr-FR')}
            </div>
            <div className="kpi-sub">au total</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commandes annulées</div>
            <div className="kpi-value kpi-value-sm">
              {loading ? '—' : cancelledOrders.toLocaleString('fr-FR')}
            </div>
            <div className="kpi-sub">sur la période</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commandes non récupérées</div>
            <div className="kpi-value kpi-value-sm">
              {loading ? '—' : (totals?.unclaimedOrders ?? 0).toLocaleString('fr-FR')}
            </div>
            <div className="kpi-sub">sur la période</div>
          </div>
        </div>

        <div className="card-title" style={{ marginTop: 4 }}>
          Supervision des entrées et sorties
        </div>
        <div className="kpi-grid">
          {revenueBreakdown.map((item) => (
            <div key={item.label} className="kpi-card">
              <div className="kpi-label">{item.label}</div>
              <div className="kpi-value kpi-value-sm" style={item.color ? { color: item.color } : undefined}>
                {loading ? '—' : formatFcfa(item.value)}
              </div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">{chartPeriodTitle('Commandes / jour', dayLabels.length)}</div>
            <LineChart
              labels={dayLabels}
              values={dailySeries}
              color="#1B2A6B"
              formatLabel={formatChartDate}
              formatValue={(v) => `${v}`}
            />
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
          </div>
        </div>
      </PageContent>
    </>
  );
}
