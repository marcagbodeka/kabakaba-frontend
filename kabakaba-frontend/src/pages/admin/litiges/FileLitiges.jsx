import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const litiges = [
  { id: 'LIT-0041', student: 'Ama Kokou', init: 'init-indigo', initials: 'AK', vendor: 'Cantine Centrale', campus: 'UCAO', campusTone: 'badge-blue', motif: 'Commande préparée mais non reçue', amount: '800 tickets', status: 'Ouvert', time: 'Il y a 1h', urgency: '#EF4444', action: 'Traiter →' },
  { id: 'LIT-0040', student: 'Komi Dodzi', init: 'init-orange', initials: 'KD', vendor: 'Snack Resto', campus: 'UCAO', campusTone: 'badge-blue', motif: 'Article manquant dans la commande', amount: '200 tickets', status: 'Ouvert', time: 'Il y a 2h', urgency: '#EF4444', action: 'Traiter →' },
  { id: 'LIT-0039', student: 'Efua Fianu', init: 'init-gray', initials: 'EF', vendor: 'Bistro UL', campus: 'UL', campusTone: 'badge-gray', motif: 'Débit effectué sans livraison', amount: '1 200 tickets', status: 'En cours', time: 'Il y a 4h', urgency: 'var(--orange)', action: 'Continuer →' },
  { id: 'LIT-0038', student: 'Yawa Agbo', init: 'init-gray', initials: 'YA', vendor: 'Cantine Centrale', campus: 'UCAO', campusTone: 'badge-blue', motif: 'Commande annulée sans remboursement', amount: '500 tickets', status: 'Traité', time: 'Hier', urgency: '#22C55E', action: 'Voir →' },
  { id: 'LIT-0037', student: 'Mawuli Sossou', init: 'init-gray', initials: 'MS', vendor: 'Kiosque Plus', campus: 'UL', campusTone: 'badge-gray', motif: 'Qualité non conforme', amount: null, status: 'Traité', time: 'Hier', urgency: '#22C55E', action: 'Voir →' },
];

const statusStyle = {
  Ouvert: { background: '#FEE2E2', color: '#B91C1C' },
  'En cours': { background: '#FFEDD5', color: '#C2410C' },
};

export default function FileLitiges() {
  const navigate = useNavigate();

  return (
    <>
      <Topbar icon={AlertTriangle} breadcrumb={[{ label: 'Gestion' }, { label: 'Litiges' }]} />
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div className="eyebrow">Admin web · Litiges</div>
            <h1>Litiges</h1>
            <p>8 litiges ouverts · 3 en cours de traitement · 47 traités ce mois</p>
          </div>
          <button className="btn-secondary-sm" onClick={() => navigate('/admin/litiges/suspensions')}>
            <ShieldAlert size={15} /> Comptes suspendus
          </button>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">Ouverts</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>8</div>
            <div className="kpi-sub">dont 2 urgents</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">En cours</div>
            <div className="kpi-value" style={{ color: 'var(--orange)' }}>3</div>
            <div className="kpi-sub">prise en charge</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Traités ce mois</div>
            <div className="kpi-value">47</div>
            <div className="kpi-sub">dont 38 remboursés</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Délai moyen</div>
            <div className="kpi-value">2h14</div>
            <div className="kpi-sub">de résolution</div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              <button className="pill active">Tous</button>
              <button className="pill">Ouverts</button>
              <button className="pill">En cours</button>
              <button className="pill">Traités</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Campus</label>
            <select className="filter-select"><option>Tous les campus</option><option>UCAO</option><option>UL</option></select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Période</label>
            <select className="filter-select"><option>Aujourd&apos;hui</option><option>7 jours</option><option>30 jours</option></select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Type</label>
            <div className="tab-pills">
              <button className="pill active">Tous</button>
              <button className="pill">Commande</button>
              <button className="pill">Remboursement</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ref. litige</th><th>Étudiant</th><th>Cantine</th><th>Campus</th>
                  <th>Motif</th><th>Montant</th><th>Statut</th><th>Signalé le</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {litiges.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => navigate(`/admin/litiges/${l.id}`)}
                    style={{ cursor: 'pointer', borderLeft: `3px solid ${l.urgency}` }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--indigo)' }}>#{l.id}</td>
                    <td className="name-cell">
                      <span className={`initials ${l.init}`} style={{ width: 28, height: 28, fontSize: 11 }}>{l.initials}</span>
                      {l.student}
                    </td>
                    <td style={{ fontWeight: 500 }}>{l.vendor}</td>
                    <td><span className={l.campusTone}>{l.campus}</span></td>
                    <td style={{ maxWidth: 160, fontSize: 13, color: '#475569' }}>{l.motif}</td>
                    <td style={{ fontWeight: l.status === 'Traité' ? 500 : 700, color: l.status === 'Traité' ? 'var(--muted)' : '#DC2626' }}>
                      {l.amount || '—'}
                    </td>
                    <td>
                      {l.status === 'Traité' ? (
                        <span className="badge-green">Traité</span>
                      ) : (
                        <span style={{ ...statusStyle[l.status], fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                          {l.status}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{l.time}</td>
                    <td>
                      <button
                        className="action-btn"
                        style={l.status === 'Traité' ? { color: 'var(--muted)', borderColor: 'var(--border)' } : undefined}
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/litiges/${l.id}`); }}
                      >
                        {l.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Affichage 1–5 sur 58 litiges</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="icon-btn">←</button>
              <button className="icon-btn" style={{ background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' }}>1</button>
              <button className="icon-btn">2</button>
              <button className="icon-btn">3</button>
              <button className="icon-btn">→</button>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}