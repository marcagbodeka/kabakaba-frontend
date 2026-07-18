import { Trophy, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const ambassadeurs = [
  { id: 1, initials: 'AK', init: 'init-indigo', name: 'Ama Kokou', phone: '+228 91 23 45 67', campus: 'UCAO', campusTone: 'badge-blue', level: 'or', volume: '187 400 FCFA', total: 42, active: '28 actifs', status: 'Actif', opacity: 1 },
  { id: 2, initials: 'KD', init: 'init-orange', name: 'Komi Dodzi', phone: '+228 97 88 99 00', campus: 'UCAO', campusTone: 'badge-blue', level: 'or', volume: '162 000 FCFA', total: 38, active: '24 actifs', status: 'Actif', opacity: 1 },
  { id: 3, initials: 'EF', init: 'init-gray', name: 'Efua Fianu', phone: '+228 92 34 56 78', campus: 'UL', campusTone: 'badge-gray', level: 'argent', volume: '94 500 FCFA', total: 29, active: '18 actifs', status: 'Actif', opacity: 1 },
  { id: 4, initials: 'YA', init: 'init-gray', name: 'Yawa Agbo', phone: '+228 90 77 88 99', campus: 'UCAO', campusTone: 'badge-blue', level: 'bronze', volume: '12 000 FCFA', total: 8, active: '1 actif', status: 'Suspendu', opacity: 0.7 },
];

export default function ListeAmbassadeurs() {
  const navigate = useNavigate();

  return (
    <>
      <Topbar icon={Trophy} breadcrumb={[{ label: 'Gestion' }, { label: 'Ambassadeurs' }]}>
        <button className="btn-primary-sm" onClick={() => navigate('/admin/ambassadeurs/demandes')}>
          3 demandes en attente
        </button>
      </Topbar>
      <PageContent>
        <div className="page-header">
          <h1>Ambassadeurs</h1>
          <p>14 ambassadeurs actifs · 2 suspendus · 3 demandes en attente</p>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">Actifs</div>
            <div className="kpi-value" style={{ color: '#22C55E' }}>14</div>
            <div className="kpi-sub">sur 2 campus</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Niveau Or</div>
            <div className="kpi-value" style={{ color: '#F59E0B' }}>2</div>
            <div className="kpi-sub">vol. 30j &gt; 150 000 FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Niveau Argent</div>
            <div className="kpi-value" style={{ color: '#94A3B8' }}>5</div>
            <div className="kpi-sub">50k–149k FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Niveau Bronze</div>
            <div className="kpi-value" style={{ color: '#CD7C2F' }}>7</div>
            <div className="kpi-sub">&lt; 50 000 FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Suspendus</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>2</div>
            <div className="kpi-sub">inactivité parrainage</div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Niveau</label>
            <div className="tab-pills">
              <button className="pill active">Tous</button>
              <button className="pill" style={{ color: '#F59E0B' }}>Or</button>
              <button className="pill" style={{ color: '#94A3B8' }}>Argent</button>
              <button className="pill" style={{ color: '#CD7C2F' }}>Bronze</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              <button className="pill active">Tous</button>
              <button className="pill">Actifs</button>
              <button className="pill">Suspendus</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Campus</label>
            <select className="filter-select"><option>Tous les campus</option><option>UCAO</option><option>UL</option></select>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ambassadeur</th><th>Campus</th><th>Niveau</th><th>Vol. 30j (affiliés)</th>
                  <th>Affiliés totaux</th><th>Affiliés actifs</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ambassadeurs.map((a) => (
                  <tr key={a.id} onClick={() => navigate(`/admin/ambassadeurs/${a.id}`)} style={{ cursor: 'pointer', opacity: a.opacity }}>
                    <td className="name-cell">
                      <span className={`initials ${a.init}`} style={{ width: 34, height: 34, borderRadius: 10 }}>{a.initials}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.phone}</div>
                      </div>
                    </td>
                    <td><span className={a.campusTone}>{a.campus}</span></td>
                    <td><span className={`level-badge ${a.level}`}>{a.level === 'or' ? 'Or' : a.level === 'argent' ? 'Argent' : 'Bronze'}</span></td>
                    <td style={{ fontWeight: 700, color: a.status === 'Actif' ? 'var(--indigo)' : 'var(--muted)' }}>{a.volume}</td>
                    <td>{a.total}</td>
                    <td><span className={a.status === 'Actif' ? 'badge-green' : 'badge-gray'}>{a.active}</span></td>
                    <td>
                      {a.status === 'Actif' ? (
                        <span className="badge-green"><span className="status-dot dot-green" style={{ marginRight: 4 }} />Actif</span>
                      ) : (
                        <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span className="status-dot" style={{ background: '#EF4444' }} />Suspendu
                        </span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn" title="Voir la fiche" onClick={() => navigate(`/admin/ambassadeurs/${a.id}`)}>
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Affichage 1–4 sur 16 ambassadeurs</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="icon-btn">←</button>
              <button className="icon-btn" style={{ background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' }}>1</button>
              <button className="icon-btn">2</button>
              <button className="icon-btn">→</button>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}