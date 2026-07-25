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
const levelColor = { GOLD: '#F59E0B', SILVER: '#94A3B8', BRONZE: '#C08552' };

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
  const totalLevels = Math.max(1, levelCounts.GOLD + levelCounts.SILVER + levelCounts.BRONZE);

  return (
    <>
      <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs' }]} badge={{ text: '30 derniers jours' }} />
      <PageContent>
        <div className="page-header">
          <h1>Supervision du programme ambassadeur</h1>
          <p>Ambassadeurs actifs, volume de recharges générées via parrainage, commissions versées</p>
        </div>

        {error && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
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
          <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', margin: '12px 0' }}>
            {(['GOLD', 'SILVER', 'BRONZE']).map((lvl) => (
              <div
                key={lvl}
                style={{ width: `${(levelCounts[lvl] / totalLevels) * 100}%`, background: levelColor[lvl] }}
                title={`${levelLabel[lvl]} : ${levelCounts[lvl]}`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {(['GOLD', 'SILVER', 'BRONZE']).map((lvl) => (
              <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: levelColor[lvl], display: 'inline-block' }} />
                <strong>{levelCounts[lvl]}</strong> <span style={{ color: 'var(--muted)' }}>{levelLabel[lvl]}</span>
              </div>
            ))}
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