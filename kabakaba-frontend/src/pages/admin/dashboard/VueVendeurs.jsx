import { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, Trophy, Search } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import DateRangePicker from '../../../components/DateRangePicker';
import LineChart from '../../../components/LineChart';
import { chartPeriodTitle, formatChartDate } from '../../../utils/chartLabels';
import { getCampusComparison, getTopCanteens } from '../../../services/domain/analyticsService';
import { getVendors } from '../../../services/domain/vendorsService';
import { getNewPartnerApplications } from '../../../services/domain/applicationsService';
import { countOrdersByStatus } from '../../../services/domain/ordersService';
import { startOfDay, daysAgo } from '../../../utils/dates';
import { CAPACITY_BADGE, CAPACITY_DOT, CAPACITY_LABEL, CAPACITY_RANK } from '../../../utils/vendorCapacity';

// Regroupement des statuts bruts de commande en 3 catégories affichées.
// Compteurs cumulés (l'API ne filtre pas encore ces totaux par date).
const STATUS_GROUPS = {
  'Complétées': ['RECEIVED'],
  'En cours': ['CONFIRMED', 'IN_PREPARATION', 'READY'],
  'Annulées': ['CANCELLED'],
};
const STATUS_COLOR = { 'Complétées': '#22C55E', 'En cours': '#F07840', 'Annulées': '#F59E0B' };

function initialsOf(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "À l'instant";
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days === 2) return 'Avant-hier';
  return `Il y a ${days}j`;
}

function TrendBadge({ value }) {
  if (value == null) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={up ? 'badge-green' : 'badge-orange'}>
      <Icon size={13} /> {Math.abs(value)}%
    </span>
  );
}

export default function VueVendeurs() {
  const [search, setSearch] = useState('');

  // Bloc temps réel : cantines, notifications — indépendant de la
  // plage de dates choisie ci-dessous, toujours "maintenant".
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [live, setLive] = useState(null);

  // Bloc analyse : classement, graphe — piloté par
  // la plage de dates, même logique que /supervision.
  const [range, setRange] = useState({ from: daysAgo(6), to: startOfDay(new Date()) });
  const [rangeLoading, setRangeLoading] = useState(true);
  const [rangeError, setRangeError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          vendorsRes,
          todayCanteens,
          campusComparison1d,
          newPartners,
          statusCounts,
        ] = await Promise.all([
          getVendors(1, 100),
          getTopCanteens(1, 5),
          getCampusComparison(1),
          getNewPartnerApplications(),
          Promise.all(
            Object.entries(STATUS_GROUPS).map(async ([label, statuses]) => {
              const counts = await Promise.all(statuses.map(countOrdersByStatus));
              return [label, counts.reduce((a, b) => a + b, 0)];
            }),
          ).then(Object.fromEntries),
        ]);
        setLive({
          vendors: vendorsRes.data || [],
          todayCanteens,
          campusComparison1d,
          newPartners: newPartners.data || [],
          statusCounts,
        });
      } catch (err) {
        setError(err.message || 'Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setRangeLoading(true);
      setRangeError(null);
      try {
        const [campusComparisonRange, topCanteensRange] = await Promise.all([
          getCampusComparison(undefined, range),
          getTopCanteens(undefined, 50, range),
        ]);
        setAnalysis({ campusComparisonRange, topCanteensRange });
      } catch (err) {
        setRangeError(err.message || "Impossible de charger l'analyse sur cette période.");
      } finally {
        setRangeLoading(false);
      }
    })();
  }, [range]);

  if (loading) {
    return (
      <>
        <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Tableau de bord' }]} badge={{ text: "Aujourd'hui" }}>
          <div className="global-search-wrap">
            <input className="global-search-input" placeholder="Rechercher une cantine..." disabled />
            <Search size={14} className="global-search-icon" />
          </div>
        </Topbar>
        <PageContent><p style={{ color: 'var(--muted)' }}>Chargement…</p></PageContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Tableau de bord' }]} badge={{ text: "Aujourd'hui" }} />
        <PageContent><div className="notice-banner notice-error">{error}</div></PageContent>
      </>
    );
  }

  const {
    vendors,
    todayCanteens,
    campusComparison1d,
    newPartners,
    statusCounts,
  } = live;

  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const openCount = vendors.filter((v) => v.capacityStatus === 'OPEN').length;
  const busyCount = vendors.filter((v) => v.capacityStatus === 'BUSY').length;
  const closedCount = vendors.filter((v) => v.capacityStatus === 'CLOSED').length;

  const ordersToday = campusComparison1d.summary.totalOrders;
  const ordersYesterday = campusComparison1d.summary.totalOrdersPrevPeriod;
  const ordersDeltaPct = ordersYesterday > 0 ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100) : null;

  const statutTempsReel = vendors
    .slice()
    .sort((a, b) => CAPACITY_RANK[a.capacityStatus] - CAPACITY_RANK[b.capacityStatus])
    .slice(0, 5)
    .map((v) => {
      const todayStats = todayCanteens.find((c) => c.id === v.id);
      return { name: v.canteenName, capacity: v.capacityStatus, orders: v.capacityStatus !== 'CLOSED' ? `${todayStats?.orders ?? 0} cmd` : 'Fermée' };
    });

  const notifications = [
    ...newPartners.map((p) => ({
      type: 'Partenaire',
      tone: 'badge-peach',
      name: p.structureName,
      initials: initialsOf(p.structureName),
      init: 'init-gray',
      campus: p.targetCampus,
      time: timeAgo(p.createdAt),
      status: 'Nouvelle',
      statusTone: 'badge-gray',
      createdAt: p.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // --- Bloc analyse (dépend de `range`) ---
  const campusRange = analysis?.campusComparisonRange;
  const topCanteensRange = analysis?.topCanteensRange ?? [];

  const dayLabels = campusRange?.dailyVolume?.labels ?? [];
  const dailySeries = campusRange?.dailyVolume?.series?.['Tous les campus'] ?? [];

  const classement = topCanteensRange
    .filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    .map((c, i) => {
      const vendor = vendorById.get(c.id);
      return {
        rank: i + 1,
        name: c.name,
        initials: initialsOf(c.name),
        campus: c.campusName,
        orders: c.orders,
        capacityStatus: vendor?.capacityStatus ?? null,
      };
    });

  const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Tableau de bord' }]} badge={{ text: "Aujourd'hui" }}>
        <DateRangePicker value={range} onChange={setRange} />
        <div className="global-search-wrap">
          <input
            className="global-search-input"
            placeholder="Rechercher une cantine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} className="global-search-icon" />
        </div>
      </Topbar>
      <PageContent>
        <div className="page-header">
          <div className="eyebrow">Admin web · Tableau de bord</div>
          <h1>Tableau de bord</h1>
          <p>Supervision des vendeurs — tous campus</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Cantines ouvertes</div>
            <div className="kpi-value">{openCount} <span style={{ fontSize: 16, color: '#94A3B8', fontWeight: 400 }}>/ {vendors.length}</span></div>
            <div className="kpi-sub">{busyCount} occupée(s) · {closedCount} fermée(s)</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commandes (24h)</div>
            <div className="kpi-value kpi-value-sm">
              {ordersToday} {ordersDeltaPct !== null && <TrendBadge value={ordersDeltaPct} />}
            </div>
            <div className="kpi-sub">vs 24h précédentes : {ordersYesterday}</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 0' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Classement vendeurs</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>{chartPeriodTitle('Volume de commandes', dayLabels.length)}</div>
            </div>

            {rangeError && (
              <div className="notice-banner notice-error" style={{ margin: '14px 22px 0' }}>{rangeError}</div>
            )}

            <div className="table-scroll" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr><th>Rang</th><th>Cantine</th><th>Campus</th><th>Commandes</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {rangeLoading && (
                    <tr><td colSpan={5} style={{ color: 'var(--muted)', padding: '24px 0' }}>Chargement…</td></tr>
                  )}
                  {!rangeLoading && classement.length === 0 && (
                    <tr><td colSpan={5} style={{ color: 'var(--muted)', padding: '24px 0' }}>Aucune commande sur cette période.</td></tr>
                  )}
                  {!rangeLoading && classement.map((v) => (
                    <tr key={v.rank} className={v.rank === 1 ? 'rank1' : ''}>
                      <td>
                        {v.rank === 1 ? (
                          <span className="rank-medal"><Trophy size={13} /> 1</span>
                        ) : (
                          <strong>{v.rank}</strong>
                        )}
                      </td>
                      <td className="name-cell">
                        <span className="initials init-indigo">{v.initials}</span>
                        <strong>{v.name}</strong>
                      </td>
                      <td><span className="badge-blue">{v.campus}</span></td>
                      <td>{v.orders}</td>
                      <td>
                        {v.capacityStatus === null ? '—' : (
                          <><span className={`status-dot ${CAPACITY_DOT[v.capacityStatus]}`} /> {CAPACITY_LABEL[v.capacityStatus]}</>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ height: 20 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">Statut temps réel</div>
              <div className="card-sub">Cantines — vue d&apos;ensemble</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                {statutTempsReel.map((c) => (
                  <div key={c.name}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`status-dot ${CAPACITY_DOT[c.capacity]}`} />
                        <span style={{ fontSize: 14, fontWeight: c.capacity !== 'CLOSED' ? 500 : 400, color: c.capacity !== 'CLOSED' ? 'inherit' : 'var(--muted)' }}>
                          {c.name}
                        </span>
                      </div>
                      <span className={CAPACITY_BADGE[c.capacity]}>{c.orders}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">{chartPeriodTitle('Commandes / jour', dayLabels.length)}</div>
            {rangeLoading ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Chargement…</p>
            ) : (
              <LineChart
                labels={dayLabels}
                values={dailySeries}
                color="#1B2A6B"
                formatLabel={formatChartDate}
                formatValue={(v) => `${v}`}
              />
            )}
          </div>

          <div className="card">
            <div className="card-title">Répartition des statuts commandes</div>
            <div className="card-sub">Depuis le lancement — tous vendeurs confondus</div>
            <div className="h-bars" style={{ marginTop: 14 }}>
              {Object.entries(statusCounts).map(([label, count]) => {
                const pct = totalStatusCount > 0 ? Math.round((count / totalStatusCount) * 100) : 0;
                return (
                  <div className="h-bar-row" key={label}>
                    <div className="h-bar-label" style={{ width: 80 }}>{label}</div>
                    <div className="h-bar-wrap"><div className="h-bar-fill" style={{ width: `${pct}%`, background: STATUS_COLOR[label] }} /></div>
                    <div className="h-bar-val">{count} <span style={{ color: '#94A3B8' }}>({pct}%)</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="card-title" style={{ marginBottom: 0 }}>Notifications à traiter</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Candidatures partenaires en attente</div>
            </div>
            <span className="badge-orange">{notifications.length} en attente</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Type</th><th>Nom</th><th>Campus</th><th>Reçu le</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {notifications.length === 0 && (
                  <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>Aucune notification en attente.</td></tr>
                )}
                {notifications.map((n, i) => (
                  <tr key={i}>
                    <td><span className={n.tone}>{n.type}</span></td>
                    <td className="name-cell">
                      <span className={`initials ${n.init}`}>{n.initials}</span>
                      {n.name}
                    </td>
                    <td>{n.campus}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{n.time}</td>
                    <td><span className={n.statusTone}>{n.status}</span></td>
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
