import { LayoutDashboard, TrendingUp } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const WEEKLY_ORDERS = [
  { height: '45%', opacity: 0.5 },
  { height: '62%', opacity: 0.6 },
  { height: '54%', opacity: 0.55 },
  { height: '80%', opacity: 0.75 },
  { height: '70%', opacity: 0.7 },
  { height: '95%', opacity: 1, highlight: true },
  { height: '78%', opacity: 0.8 },
];

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const STATUS_DISTRIBUTION = [
  { value: '82%', height: '82%', color: '#1B2A6B', opacity: 0.88 },
  { value: '11%', height: '11%', color: '#F07840', opacity: 0.85 },
  { value: '7%', height: '7%', color: '#CBD5E1', opacity: 1 },
];

const REVENUE_BREAKDOWN = [
  { label: 'Surplus recharges', value: '7 056 FCFA', sub: 'revenu principal' },
  { label: 'Frais retrait non couverts', value: '450 FCFA', sub: 'vendeurs sous seuil 10k' },
  { label: 'Commissions ambassadeurs', value: '− 900 FCFA', color: 'var(--orange)', sub: 'déduit du surplus' },
  { label: 'Revenus nets', value: '6 606 FCFA', color: 'var(--indigo)', sub: 'après déductions' },
];

function TrendBadge({ value }) {
  return (
    <span className="badge-green">
      <TrendingUp size={14} />
      {value}
    </span>
  );
}

export default function VueGenerale() {
  return (
    <>
      <Topbar
        icon={LayoutDashboard}
        breadcrumb={[{ label: 'Vue générale' }]}
        badge={{ text: '7 derniers jours' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Vue générale</h1>
          <p>Synthèse de l&apos;activité kabakaba sur l&apos;ensemble des campus</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Commandes</div>
            <div className="kpi-value">
              248 <TrendBadge value="12%" />
            </div>
            <div className="kpi-sub">vs période précédente : 221</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">CA brut plateforme</div>
            <div className="kpi-value kpi-value-sm">
              159 200 FCFA <TrendBadge value="11%" />
            </div>
            <div className="kpi-sub">volume transactionnel</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Tickets en circulation</div>
            <div className="kpi-value kpi-value-sm">284 500</div>
            <div className="kpi-sub">dont 12 000 en séquestre</div>
          </div>
        </div>

        <div className="card-title" style={{ marginTop: 4 }}>Décomposition des revenus</div>
        <div className="card-sub">Ventilation par source</div>
        <div className="kpi-grid">
          {REVENUE_BREAKDOWN.map((item) => (
            <div key={item.label} className="kpi-card">
              <div className="kpi-label">{item.label}</div>
              <div className="kpi-value kpi-value-sm" style={item.color ? { color: item.color } : undefined}>
                {item.value}
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
                {WEEKLY_ORDERS.map((bar, i) => (
                  <div
                    key={WEEK_DAYS[i]}
                    className="bar"
                    style={{
                      height: bar.height,
                      background: bar.highlight ? '#F07840' : '#1B2A6B',
                      opacity: bar.opacity,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="bar-labels">
              {WEEK_DAYS.map((day, i) => (
                <div key={day} className={`bar-label${i === 5 ? ' active' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Répartition statuts</div>
            <div className="chart-stacked">
              {STATUS_DISTRIBUTION.map((item) => (
                <div key={item.value} className="chart-stacked-col">
                  <span className="chart-stacked-val">{item.value}</span>
                  <div
                    className="chart-stacked-bar"
                    style={{
                      height: item.height,
                      background: item.color,
                      opacity: item.opacity,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#1B2A6B' }} />
                Complétées
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#F07840' }} />
                Annulées
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#ccc' }} />
                Refusées
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}