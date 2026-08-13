import { useState } from 'react';
import { UserPlus, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const STATUSES = ['Nouvelle', 'Contactée', 'Acceptée', 'Refusée'];

const nouvelles = [
  {
    id: 'part-1', initials: 'RS', name: 'Resto Saveur',
    meta: 'Contact : Akua Mensah · Campus visé : UCAO · Reçu hier',
    contact: 'Akua Mensah', phone: '+228 90 12 34 56', email: 'akua@restosaveur.tg', campus: 'UCAO',
    message: "Bonjour, je tiens une cantine à l'entrée de l'UCAO depuis 2 ans. Je souhaitais rejoindre la plateforme pour faciliter les commandes des étudiants.",
    status: 'Nouvelle',
  },
  {
    id: 'part-2', initials: 'FC', name: 'Fast Campus',
    meta: 'Contact : Kofi Amessou · Campus visé : UL · Reçu avant-hier',
    contact: 'Kofi Amessou', phone: '+228 91 22 33 44', email: 'kofi@fastcampus.tg', campus: 'UL',
    message: "Nous proposons des repas rapides près du campus UL depuis 1 an et souhaiterions être référencés sur kabakaba.",
    status: 'Nouvelle',
  },
];

const contactees = [
  { initials: 'BK', init: 'init-orange', name: 'Bistro Kouka', contact: 'Yawa Kouka', campus: 'UCAO', campusTone: 'badge-blue', time: 'Il y a 5j' },
  { initials: 'LC', init: 'init-gray', name: 'Le Coin', contact: 'Mawuli Koffi', campus: 'UL', campusTone: 'badge-gray', time: 'Il y a 8j' },
  { initials: 'MF', init: 'init-gray', name: 'Miam Food', contact: 'Ama Fianu', campus: 'UCAO', campusTone: 'badge-blue', time: 'Il y a 12j' },
];

export default function Candidatures() {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState(nouvelles);
  const [openId, setOpenId] = useState('part-1');

  const setStatus = (id, status) => {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  return (
    <>
      <Topbar icon={UserPlus} breadcrumb={[{ label: 'Partenaires' }]} badge={{ text: '2 nouvelles', tone: 'red' }} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Partenaires</div>
          <h1>Candidatures partenaires</h1>
          <p>Soumises via le formulaire kabakaba.com · Traitement manuel</p>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">Nouvelles</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>{demandes.filter((d) => d.status === 'Nouvelle').length}</div>
            <div className="kpi-sub">non traitées</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Contactées</div>
            <div className="kpi-value" style={{ color: 'var(--orange)' }}>3</div>
            <div className="kpi-sub">en discussion</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Acceptées</div>
            <div className="kpi-value" style={{ color: '#22C55E' }}>8</div>
            <div className="kpi-sub">devenues cantines</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Refusées</div>
            <div className="kpi-value">4</div>
            <div className="kpi-sub">ce mois</div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              <button className="pill active">Tous</button>
              <button className="pill">Nouvelles</button>
              <button className="pill">Contactées</button>
              <button className="pill">Acceptées</button>
              <button className="pill">Refusées</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Campus visé</label>
            <select className="filter-select"><option>Tous</option><option>UCAO</option><option>UL</option></select>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
          Nouvelles — à traiter
        </div>

        {demandes.map((d) => {
          const open = openId === d.id;
          return (
            <div className="demande-card" key={d.id}>
              <div className="demande-header" onClick={() => setOpenId(open ? null : d.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="initials init-gray" style={{ width: 40, height: 40, borderRadius: 12, fontSize: 13 }}>{d.initials}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{d.meta}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={d.status === 'Nouvelle' ? 'badge-gray' : d.status === 'Acceptée' ? 'badge-green' : 'badge-amber'}>{d.status}</span>
                  <ChevronDown size={18} className={`dem-chevron ${open ? 'open' : ''}`} />
                </div>
              </div>

              {open && (
                <div className="demande-body">
                  <div className="two-col" style={{ marginTop: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Structure</span><strong>{d.name}</strong></div>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Contact</span><strong>{d.contact}</strong></div>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Téléphone</span><strong>{d.phone}</strong></div>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Email</span><strong>{d.email}</strong></div>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Campus visé</span><span className="badge-blue">{d.campus}</span></div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Message</div>
                      <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, color: '#475569', lineHeight: 1.7, fontStyle: 'italic' }}>
                        &quot;{d.message}&quot;
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>Faire évoluer le statut</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          className={`pill ${d.status === s ? 'active' : ''}`}
                          style={s === 'Acceptée' && d.status !== s ? { color: '#16A34A' } : s === 'Refusée' && d.status !== s ? { color: '#DC2626' } : undefined}
                          onClick={() => setStatus(d.id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                      <button className="btn-primary-sm" onClick={() => navigate('/admin/cantines/creer')}>
                        <Plus size={14} /> Accepter &amp; créer la cantine
                      </button>
                      <button className="btn-secondary-sm">Enregistrer le statut</button>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                      L&apos;acceptation ne crée pas de compte vendeur automatiquement — vous devrez le créer manuellement.
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '20px 0 10px' }}>
          Contactées — en discussion
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Structure</th><th>Contact</th><th>Campus</th><th>Reçu le</th><th>Statut</th><th>Action</th></tr>
              </thead>
              <tbody>
                {contactees.map((c) => (
                  <tr key={c.name}>
                    <td className="name-cell"><span className={`initials ${c.init}`} style={{ width: 28, height: 28, fontSize: 11 }}>{c.initials}</span><strong>{c.name}</strong></td>
                    <td>{c.contact}</td>
                    <td><span className={c.campusTone}>{c.campus}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{c.time}</td>
                    <td><span className="badge-amber">Contactée</span></td>
                    <td><button className="action-btn">Voir →</button></td>
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