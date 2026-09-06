import { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, Trophy, AlertTriangle, Search } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import DateRangePicker from '../../../components/DateRangePicker';
import LineChart from '../../../components/LineChart';
import { chartPeriodTitle, formatChartDate } from '../../../utils/chartLabels';
import { getCampusComparison, getTopCanteens, getVendorPerformance, getVendorFinancials } from '../../../services/domain/analyticsService';
import { getVendors } from '../../../services/domain/vendorsService';
import { getPendingAmbassadors, getNewPartnerApplications } from '../../../services/domain/applicationsService';
import { countOrdersByStatus } from '../../../services/domain/ordersService';

const ACCEPTANCE_ALERT_THRESHOLD = 70;

// Regroupement des statuts bruts de commande en 4 catégories affichées.
// Compteurs cumulés (l'API ne filtre pas encore ces totaux par date).
const STATUS_GROUPS = {
  'Complétées': ['RECEIVED', 'AUTO_RECEIVED'],
  'En cours': ['PENDING', 'ACCEPTED', 'IN_PREPARATION', 'READY'],
  'Annulées': ['CANCELLED_VENDOR', 'REFUNDED'],
  'Refusées': ['REFUSED'],
};
const STATUS_COLOR = { 'Complétées': '#22C55E', 'En cours': '#F07840', 'Annulées': '#F59E0B', 'Refusées': '#EF4444' };

function initialsOf(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

function formatFcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
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

  // Bloc temps réel : cantines, alertes, notifications — indépendant de la
  // plage de dates choisie ci-dessous, toujours "maintenant".
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [live, setLive] = useState(null);

  // Bloc analyse : classement, graphe, acceptation par campus — piloté par
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
          todayPerf,
          weekPerf,
          financials,
          campusComparison1d,
          pendingAmbassadors,
          newPartners,
          statusCounts,
        ] = await Promise.all([
          getVendors(1, 100),
          getTopCanteens(1, 5),
          getVendorPerformance(1),
          getVendorPerformance(7),
          getVendorFinancials(),
          getCampusComparison(1),
          getPendingAmbassadors(),
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
          todayPerf,
          weekPerf,
          financials,
          campusComparison1d,
          pendingAmbassadors: pendingAmbassadors.data || [],
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
        <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Tableau de bord' }]} badge={{ text: "Aujourd'hui" }} hidePeriodSelect>
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
        <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Tableau de bord' }]} badge={{ text: "Aujourd'hui" }} hidePeriodSelect />
        <PageContent><div className="notice-banner notice-error">{error}</div></PageContent>
      </>
    );
  }

  const {
    vendors,
    todayCanteens,
    todayPerf,
    weekPerf,
    financials,
    campusComparison1d,
    pendingAmbassadors,
    newPartners,
    statusCounts,
  } = live;

  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const openCount = vendors.filter((v) => v.isOpen).length;

  const ordersToday = campusComparison1d.summary.totalOrders;
  const ordersYesterday = campusComparison1d.summary.totalOrdersPrevPeriod;
  const ordersDeltaPct = ordersYesterday > 0 ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100) : null;

  const statutTempsReel = vendors
    .slice()
    .sort((a, b) => Number(b.isOpen) - Number(a.isOpen))
    .slice(0, 5)
    .map((v) => {
      const todayStats = todayCanteens.find((c) => c.id === v.id);
      return { name: v.canteenName, open: v.isOpen, orders: v.isOpen ? `${todayStats?.orders ?? 0} cmd` : 'Fermée' };
    });

  const blockedVendors = financials.vendors.filter((v) => v.blocked);
  const lowAcceptanceVendors = weekPerf.vendors.filter((v) => v.acceptanceRate < ACCEPTANCE_ALERT_THRESHOLD);

  const alertes = [
    ...blockedVendors.map((v) => ({
      level: 'red',
      title: `Créance active — ${v.name}`,
      text: `${formatFcfa(v.debt)} · retrait bloqué`,
    })),
    ...lowAcceptanceVendors.map((v) => ({
      level: 'amber',
      title: `Taux d'acceptation bas — ${v.name}`,
      text: `${v.acceptanceRate}% sur 7 jours · seuil d'alerte : ${ACCEPTANCE_ALERT_THRESHOLD}%`,
    })),
    ...(pendingAmbassadors.length > 0
      ? [{ level: 'amber', title: `${pendingAmbassadors.length} demande(s) ambassadeur en attente`, text: 'En attente de décision' }]
      : []),
  ];

  const notifications = [
    ...pendingAmbassadors.map((a) => {
      const fullName = [a.user?.firstName, a.user?.lastName].filter(Boolean).join(' ') || `Candidature #${a.id.slice(0, 8)}`;
      return {
        type: 'Ambassadeur',
        tone: 'badge-blue',
        name: fullName,
        initials: initialsOf(fullName),
        init: 'init-indigo',
        campus: a.user?.campus?.name || '—',
        time: timeAgo(a.createdAt),
        status: 'En attente',
        statusTone: 'badge-amber',
        createdAt: a.createdAt,
      };
    }),
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
        acceptance: `${c.acceptanceRate}%`,
        status: c.acceptanceRate >= ACCEPTANCE_ALERT_THRESHOLD ? 'green' : 'orange',
        isOpen: vendor?.isOpen ?? null,
      };
    });

  const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Tableau de bord' }]} badge={{ text: "Aujourd'hui" }} hidePeriodSelect>
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
            <div className="kpi-sub">{vendors.length - openCount} fermée(s) actuellement</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commandes (24h)</div>
            <div className="kpi-value kpi-value-sm">
              {ordersToday} {ordersDeltaPct !== null && <TrendBadge value={ordersDeltaPct} />}
            </div>
            <div className="kpi-sub">vs 24h précédentes : {ordersYesterday}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Taux d&apos;acceptation moyen</div>
            <div className="kpi-value orange">{todayPerf.summary.avgAcceptanceRate}%</div>
            <div className="kpi-sub">vs {weekPerf.summary.avgAcceptanceRate}% sur 7 jours</div>
          </div>
          <div className={`kpi-card${financials.summary.totalDebt > 0 ? ' alert-card-red' : ''}`}>
            <div className="kpi-label">Créances actives</div>
            <div className="kpi-value" style={{ color: financials.summary.totalDebt > 0 ? '#DC2626' : 'inherit' }}>
              {formatFcfa(financials.summary.totalDebt)}
            </div>
            <div className="kpi-sub">{financials.summary.blockedCount} vendeur(s) concerné(s) · retrait bloqué</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '20px 22px 0' }}>
              <div>
                <div className="card-title" style={{ marginBottom: 0 }}>Classement vendeurs</div>
                <div className="card-sub" style={{ marginBottom: 0 }}>{chartPeriodTitle('Volume de commandes', dayLabels.length)}</div>
              </div>
              <DateRangePicker value={range} onChange={setRange} />
            </div>

            {rangeError && (
              <div className="notice-banner notice-error" style={{ margin: '14px 22px 0' }}>{rangeError}</div>
            )}

            <div className="table-scroll" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr><th>Rang</th><th>Cantine</th><th>Campus</th><th>Commandes</th><th>Acceptation</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {rangeLoading && (
                    <tr><td colSpan={6} style={{ color: 'var(--muted)', padding: '24px 0' }}>Chargement…</td></tr>
                  )}
                  {!rangeLoading && classement.length === 0 && (
                    <tr><td colSpan={6} style={{ color: 'var(--muted)', padding: '24px 0' }}>Aucune commande sur cette période.</td></tr>
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
                        <span className={v.status === 'green' ? 'badge-green' : 'badge-orange'}>{v.acceptance}</span>
                      </td>
                      <td>
                        {v.isOpen === null ? '—' : (
                          <><span className={`status-dot dot-${v.isOpen ? 'green' : 'orange'}`} /> {v.isOpen ? 'Ouverte' : 'Fermée'}</>
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
                        <span className={`status-dot ${c.open ? 'dot-green' : 'dot-orange'}`} />
                        <span style={{ fontSize: 14, fontWeight: c.open ? 500 : 400, color: c.open ? 'inherit' : 'var(--muted)' }}>
                          {c.name}
                        </span>
                      </div>
                      <span className={c.open ? 'badge-green' : 'badge-gray'}>{c.orders}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card alert-card-red" style={{ marginBottom: 0 }}>
              <div className="alert-header">
                <AlertTriangle size={17} color="#DC2626" />
                <div className="card-title" style={{ color: '#DC2626', marginBottom: 0 }}>Alertes</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alertes.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Aucune alerte active.</div>}
                {alertes.map((a) => (
                  <div
                    key={a.title}
                    style={{
                      fontSize: 13,
                      padding: '10px 12px',
                      background: a.level === 'red' ? '#FEF2F2' : '#FFF7ED',
                      borderRadius: 8,
                      borderLeft: `3px solid ${a.level === 'red' ? '#EF4444' : '#F59E0B'}`,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: a.level === 'red' ? '#B91C1C' : '#92400E', marginBottom: 2 }}>
                      {a.title}
                    </div>
                    <div style={{ color: '#64748B' }}>{a.text}</div>
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

            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Acceptation par campus — {dayLabels.length} jour{dayLabels.length > 1 ? 's' : ''}
              </div>
              {rangeLoading ? (
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Chargement…</p>
              ) : (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {campusRange.campuses.map((c) => (
                    <div key={c.id} style={{ flex: '1 1 100px', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>{c.name}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--indigo)' }}>{c.acceptanceRate}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="card-title" style={{ marginBottom: 0 }}>Notifications à traiter</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Demandes ambassadeur et candidatures partenaires en attente</div>
            </div>
            <span className="badge-orange">{notifications.length} en attente</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Type</th><th>Nom</th><th>Campus</th><th>Reçu le</th><th>Statut</th><th></th></tr>
              </thead>
              <tbody>
                {notifications.length === 0 && (
                  <tr><td colSpan={6} style={{ color: 'var(--muted)' }}>Aucune notification en attente.</td></tr>
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
                    <td><button className="action-btn">Traiter →</button></td>
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
