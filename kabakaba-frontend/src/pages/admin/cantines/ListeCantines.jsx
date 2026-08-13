import { useState } from 'react';
import { Utensils, Plus, Eye, Pencil, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const cantines = [
  { id: 1, initials: 'CC', init: 'init-indigo', name: 'Cantine Centrale', created: '12 jan. 2026', campus: 'UCAO', campusTone: 'badge-blue', owner: 'Koffi Agbénou', status: 'Actif', open: true, orders: 64, debt: null },
  { id: 2, initials: 'SR', init: 'init-indigo', name: 'Snack Resto', created: '5 fév. 2026', campus: 'UCAO', campusTone: 'badge-blue', owner: 'Yawa Mensah', status: 'Actif', open: true, orders: 48, debt: null },
  { id: 3, initials: 'BU', init: 'init-orange', name: 'Bistro UL', created: '20 fév. 2026', campus: 'UL', campusTone: 'badge-gray', owner: 'Kofi Dossou', status: 'Actif', open: true, orders: 41, debt: null },
  { id: 4, initials: 'SC', init: 'init-gray', name: 'Snack du Campus', created: '3 mars 2026', campus: 'UCAO', campusTone: 'badge-blue', owner: 'Ama Setodji', status: 'Actif', open: false, orders: 22, debt: '3 500 FCFA' },
  { id: 5, initials: 'KP', init: 'init-gray', name: 'Kiosque Plus', created: '15 mars 2026', campus: 'UL', campusTone: 'badge-gray', owner: 'Essi Kuma', status: 'Suspendu', open: false, orders: 11, debt: null },
];

export default function ListeCantines() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <>
      <Topbar icon={Utensils} breadcrumb={[{ label: 'Gestion' }, { label: 'Cantines' }]}>
        <button className="btn-primary-sm" onClick={() => navigate('/admin/cantines/creer')}>
          <Plus size={16} /> Créer une cantine
        </button>
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Cantines</div>
          <h1>Cantines</h1>
          <p>10 cantines enregistrées — 2 campus couverts</p>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Recherche</label>
            <div className="global-search-wrap">
              <input
                className="global-search-input"
                style={{ width: 220 }}
                placeholder="Nom, vendeur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={14} className="global-search-icon" />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Campus</label>
            <select className="filter-select">
              <option>Tous les campus</option>
              <option>UCAO</option>
              <option>UL</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              <button className="pill active">Tous</button>
              <button className="pill"><span className="status-dot dot-green" /> Actifs</button>
              <button className="pill"><span className="status-dot dot-orange" /> Suspendus</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Créances</label>
            <div className="tab-pills">
              <button className="pill active">Toutes</button>
              <button className="pill" style={{ color: '#DC2626' }}>Actives</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cantine</th><th>Campus</th><th>Vendeur</th><th>Statut compte</th>
                  <th>Ouverture</th><th>Cmd aujourd&apos;hui</th><th>Créance</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cantines.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/admin/cantines/${c.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="name-cell">
                      <span className={`initials ${c.init}`} style={{ width: 36, height: 36, borderRadius: 10 }}>{c.initials}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Créée le {c.created}</div>
                      </div>
                    </td>
                    <td><span className={c.campusTone}>{c.campus}</span></td>
                    <td style={{ fontWeight: 500 }}>{c.owner}</td>
                    <td>
                      {c.status === 'Actif' ? (
                        <span className="badge-green"><span className="status-dot dot-green" style={{ marginRight: 4 }} />Actif</span>
                      ) : (
                        <span style={{ background: '#FEF2F2', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                          <span className="status-dot" style={{ background: '#EF4444', marginRight: 4 }} />Suspendu
                        </span>
                      )}
                    </td>
                    <td><span className={c.open ? 'badge-green' : 'badge-gray'}>{c.open ? 'Ouverte' : 'Fermée'}</span></td>
                    <td style={{ fontWeight: 700, color: c.status === 'Actif' ? 'var(--indigo)' : 'var(--muted)' }}>{c.orders}</td>
                    <td>
                      {c.debt ? (
                        <>
                          <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 13 }}>{c.debt}</span>
                          <div style={{ fontSize: 11, color: '#EF4444' }}>Retrait bloqué</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn" title="Voir la fiche" onClick={() => navigate(`/admin/cantines/${c.id}`)}>
                          <Eye size={15} />
                        </button>
                        <button className="icon-btn" title="Modifier">
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Affichage 1–5 sur 10 cantines</span>
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