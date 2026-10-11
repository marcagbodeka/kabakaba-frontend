import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, Trophy } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { getStockAnalytics } from '../../services/domain/analyticsService';
import { startOfDay, daysAgo } from '../../utils/dates';

const WEEKDAY_LABEL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
// Lundi en premier, comme le calendrier du sélecteur de période.
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function hourLabel(hour) {
  return `${String(hour).padStart(2, '0')}h`;
}

// Barres horizontales : une ligne par entrée, largeur proportionnelle au maximum affiché.
function Bars({ rows, color }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="h-bars" style={{ gap: 8 }}>
      {rows.map((row) => (
        <div className="h-bar-row" key={row.label} style={{ gridTemplateColumns: '90px 1fr auto' }}>
          <div className="h-bar-label">{row.label}</div>
          <div className="h-bar-wrap">
            <div className="h-bar-fill" style={{ width: `${Math.round((row.value / max) * 100)}%`, background: color }} />
          </div>
          <div className="h-bar-val">{row.value}</div>
        </div>
      ))}
    </div>
  );
}

function RankTable({ rows, valueLabel, valueKey, loading, emptyText }) {
  return (
    <div className="table-scroll" style={{ marginTop: 16 }}>
      <table>
        <thead>
          <tr><th>Rang</th><th>Composant</th><th>Cantine</th><th>{valueLabel}</th></tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={4} style={{ color: 'var(--muted)', padding: '24px 0' }}>Chargement…</td></tr>}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={4} style={{ color: 'var(--muted)', padding: '24px 0' }}>{emptyText}</td></tr>
          )}
          {!loading && rows.map((row, i) => (
            <tr key={row.componentId} className={i === 0 ? 'rank1' : ''}>
              <td>
                {i === 0 ? <span className="rank-medal"><Trophy size={13} /> 1</span> : <strong>{i + 1}</strong>}
              </td>
              <td><strong>{row.name}</strong></td>
              <td>{row.canteenName}</td>
              <td>{row[valueKey]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SuiviStock() {
  const { pathname } = useLocation();
  const space = pathname.startsWith('/admin') ? 'Admin web' : 'Supervision';

  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getStockAnalytics(range, 10));
      } catch (err) {
        setError(err.message || 'Impossible de charger le suivi du stock.');
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  const hourRows = (data?.peakHours ?? []).map((h) => ({ label: hourLabel(h.hour), value: h.orders }));
  const weekdayByIndex = new Map((data?.peakWeekdays ?? []).map((d) => [d.weekday, d.orders]));
  const weekdayRows = WEEKDAY_ORDER.map((weekday) => ({
    label: WEEKDAY_LABEL[weekday],
    value: weekdayByIndex.get(weekday) ?? 0,
  }));

  return (
    <>
      <Topbar icon={Package} breadcrumb={[{ label: 'Suivi du stock' }]}>
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
          <div className="eyebrow">{space} · Suivi du stock</div>
          <h1>Suivi du stock</h1>
          <p>Composants les plus vendus, ruptures fréquentes et périodes de forte demande</p>
        </div>

        {error && <div className="notice-banner notice-error">{error}</div>}

        <div className="two-col">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 0' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Composants les plus vendus</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Unités des commandes prêtes ou récupérées</div>
            </div>
            <RankTable
              rows={data?.topComponents ?? []}
              valueLabel="Unités vendues"
              valueKey="unitsSold"
              loading={loading}
              emptyText="Aucune vente sur cette période."
            />
            <div style={{ height: 20 }} />
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 0' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Ruptures fréquentes</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Nombre de fois où un composant est tombé à zéro</div>
            </div>
            <RankTable
              rows={data?.ruptures ?? []}
              valueLabel="Ruptures"
              valueKey="count"
              loading={loading}
              emptyText="Aucune rupture sur cette période."
            />
            <div style={{ height: 20 }} />
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">Jours de forte demande</div>
            <div className="card-sub">Commandes par jour de la semaine</div>
            {loading ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Chargement…</p> : <Bars rows={weekdayRows} color="#1B2A6B" />}
          </div>

          <div className="card">
            <div className="card-title">Heures de forte demande</div>
            <div className="card-sub">Commandes par heure (UTC)</div>
            {loading ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Chargement…</p> : <Bars rows={hourRows} color="#F07840" />}
          </div>
        </div>
      </PageContent>
    </>
  );
}
