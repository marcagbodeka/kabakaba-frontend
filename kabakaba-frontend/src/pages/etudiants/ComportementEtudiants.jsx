import { useEffect, useState } from 'react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { getStudentBehavior } from '../../services/domain/analyticsService';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

const DAY_LABELS_FR = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam', 0: 'Dim' };

export default function ComportementEtudiants() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getStudentBehavior(30));
      } catch (err) {
        setError(err.message || 'Impossible de charger le comportement étudiants.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = data?.summary;
  const perCampus = data?.perCampus ?? [];
  const dailyValues = data?.dailyRegistrations?.values ?? [];
  const maxDaily = Math.max(1, ...dailyValues);
  const dayLabels = (data?.dailyRegistrations?.labels ?? []).map((d) => DAY_LABELS_FR[new Date(d).getDay()]);

  return (
    <>
      <Topbar
        icon={Users}
        breadcrumb={[{ label: 'Étudiants', path: '/supervision/etudiants' }, { label: 'Comportement étudiants' }]}
        badge={{ text: '30 derniers jours' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Comportement étudiants</h1>
          <p>Fréquence de commande, montant moyen rechargé, nombre d&apos;inscrits par campus</p>
        </div>

        {error && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Étudiants inscrits</div>
            <div className="kpi-value">{loading ? '—' : summary?.totalEnrolled}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Actifs (30 jours)</div>
            <div className="kpi-value">
              {loading ? '—' : summary?.totalActive}{' '}
              {summary?.activeChangePct !== null && summary?.activeChangePct !== undefined && (
                <span className={summary.activeChangePct >= 0 ? 'badge-green' : 'badge-red'}>
                  {summary.activeChangePct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{' '}
                  {Math.abs(summary.activeChangePct)}%
                </span>
              )}
            </div>
            <div className="kpi-sub">{loading ? '' : `${summary?.activeShare}% des inscrits`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Montant moyen rechargé</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.avgRecharge ?? 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Fréquence moyenne</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : `${summary?.avgFrequency} / semaine`}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Évolution des inscriptions (7 jours)</div>
          <div className="chart-wrap">
            <div className="chart-bars" style={{ marginTop: 12 }}>
              {dailyValues.map((v, i) => (
                <div
                  key={i}
                  className="bar"
                  style={{ height: `${Math.max(4, (v / maxDaily) * 100)}%`, background: '#F07840', opacity: 0.55 + v / (maxDaily * 2.5) }}
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

        <div className="card">
          <div className="card-title">Détail par campus</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Campus</th><th>Inscrits</th><th>Actifs (30j)</th><th>Montant moyen rechargé</th><th>Fréquence moyenne</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5}>Chargement...</td></tr>}
                {!loading && perCampus.length === 0 && <tr><td colSpan={5}>Aucune donnée.</td></tr>}
                {!loading && perCampus.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.enrolled}</td>
                    <td>{c.active}</td>
                    <td>{formatFcfa(c.avgRecharge)}</td>
                    <td>{c.avgFrequency} / semaine</td>
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