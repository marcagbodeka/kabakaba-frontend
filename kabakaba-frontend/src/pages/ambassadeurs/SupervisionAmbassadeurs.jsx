import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { getAmbassadorRanking } from '../../services/domain/analyticsService';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

const levelLabel = { GOLD: 'Or', SILVER: 'Argent', BRONZE: 'Bronze' };
const levelBadge = { GOLD: 'badge-amber', SILVER: 'badge-gray', BRONZE: 'badge-peach' };

export default function SupervisionAmbassadeurs() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getAmbassadorRanking(30));
      } catch (err) {
        setError(err.message || 'Impossible de charger les ambassadeurs.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = data?.summary;
  const ranking = data?.ranking ?? [];
  const levelCounts = summary?.levelCounts ?? { GOLD: 0, SILVER: 0, BRONZE: 0 };
  const maxCount = Math.max(1, levelCounts.GOLD, levelCounts.SILVER, levelCounts.BRONZE);
  const levelRows = [
    { key: 'GOLD', label: 'Or' },
    { key: 'SILVER', label: 'Argent' },
    { key: 'BRONZE', label: 'Bronze' },
  ];

  return (
    <>
      <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs' }]} badge={{ text: '30 derniers jours' }} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Ambassadeurs</div>
          <h1>Supervision du programme ambassadeur</h1>
          <p>Ambassadeurs actifs, volume de recharges générées via parrainage, commissions versées</p>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Ambassadeurs actifs</div>
            <div className="kpi-value">{loading ? '—' : summary?.activeAmbassadors}</div>
            <div className="kpi-sub">{loading ? '' : `${summary?.campusCount} campus`}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Volume parrainage (30j)</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.totalVolume ?? 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commissions versées</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : formatFcfa(summary?.totalCommission ?? 0)}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Répartition par niveau</div>
          <div className="card-sub">Nombre d'ambassadeurs actifs par niveau</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {levelRows.map(({ key, label }) => {
              const count = levelCounts[key] ?? 0;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 70, fontSize: 13, color: 'var(--muted)' }}>{label}</div>
                  <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        background: key === 'GOLD' ? '#F59E0B' : key === 'SILVER' ? '#94A3B8' : '#C08552',
                        height: '100%',
                      }}
                    />
                  </div>
                  <div style={{ width: 24, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Classement des ambassadeurs</div>
          <div className="card-sub">Basé sur le volume de recharges des affiliés — 30 derniers jours glissants</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Rang</th><th>Ambassadeur</th><th>Campus</th><th>Niveau</th><th>Affiliés</th><th>Volume</th><th>Commission</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7}>Chargement...</td></tr>}
                {!loading && ranking.length === 0 && <tr><td colSpan={7}>Aucun ambassadeur actif.</td></tr>}
                {!loading && ranking.map((a) => (
                  <tr
                    key={a.id}
                    className={a.rank === 1 ? 'rank1' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/supervision/ambassadeurs/${a.id}`)}
                  >
                    <td>#{a.rank}</td>
                    <td><strong>{a.name}</strong></td>
                    <td>{a.campusName}</td>
                    <td><span className={levelBadge[a.level]}>{levelLabel[a.level]}</span></td>
                    <td>{a.affiliates}</td>
                    <td>{formatFcfa(a.volume)}</td>
                    <td>{formatFcfa(a.commission)}</td>
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