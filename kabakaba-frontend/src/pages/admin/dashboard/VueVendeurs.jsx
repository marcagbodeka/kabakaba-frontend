import { useState } from 'react';
import { LayoutDashboard, TrendingUp, Trophy, AlertTriangle, Search } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const classement = [
  { rank: 1, name: 'Cantine Centrale', initials: 'CC', init: 'init-indigo', campus: 'UCAO', orders: 64, acceptance: '94%', status: 'green', label: 'Ouverte' },
  { rank: 2, name: 'Snack Resto', initials: 'SR', init: 'init-indigo', campus: 'UCAO', orders: 48, acceptance: '88%', status: 'green', label: 'Ouverte' },
  { rank: 3, name: 'Bistro UL', initials: 'BU', init: 'init-orange', campus: 'UL', orders: 41, acceptance: '85%', status: 'green', label: 'Ouverte' },
  { rank: 4, name: 'Snack du Campus', initials: 'SC', init: 'init-gray', campus: 'UCAO', orders: 22, acceptance: '71%', status: 'orange', label: 'Fermée' },
  { rank: 5, name: 'Kiosque Plus', initials: 'KP', init: 'init-gray', campus: 'UL', orders: 11, acceptance: '62%', status: 'orange', label: 'Fermée' },
];

const statutTempsReel = [
  { name: 'Cantine Centrale', open: true, orders: '64 cmd' },
  { name: 'Snack Resto', open: true, orders: '48 cmd' },
  { name: 'Bistro UL', open: true, orders: '41 cmd' },
  { name: 'Snack du Campus', open: false, orders: 'Fermée' },
  { name: 'Kiosque Plus', open: false, orders: 'Fermée' },
];

const alertes = [
  { level: 'red', title: 'Créance active — Snack du Campus', text: '3 500 FCFA · retrait bloqué' },
  { level: 'amber', title: "Taux d'acceptation bas — Kiosque Plus", text: "62% ce mois · seuil d'alerte : 70%" },
  { level: 'amber', title: '3 demandes ambassadeur en attente', text: 'Pièces reçues · en attente de décision' },
];

const statutsCommandes = [
  { label: 'Complétées', value: 145, pct: 78, color: '#22C55E' },
  { label: 'En cours', value: 21, pct: 11, color: '#F07840' },
  { label: 'Annulées', value: 13, pct: 7, color: '#F59E0B' },
  { label: 'Refusées', value: 7, pct: 4, color: '#EF4444' },
];

const notifications = [
  { type: 'Ambassadeur', tone: 'badge-blue', name: 'Ama Kokou', initials: 'AK', init: 'init-indigo', campus: 'UCAO', time: 'Il y a 2h', status: 'En attente', statusTone: 'badge-amber' },
  { type: 'Ambassadeur', tone: 'badge-blue', name: 'Komi Dodzi', initials: 'KD', init: 'init-orange', campus: 'UCAO', time: 'Il y a 5h', status: 'En attente', statusTone: 'badge-amber' },
  { type: 'Ambassadeur', tone: 'badge-blue', name: 'Efua Fianu', initials: 'EF', init: 'init-indigo', campus: 'UL', time: 'Hier', status: 'En attente', statusTone: 'badge-amber' },
  { type: 'Partenaire', tone: 'badge-peach', name: 'Resto Saveur', initials: 'RS', init: 'init-gray', campus: 'UCAO', time: 'Hier', status: 'Nouvelle', statusTone: 'badge-gray' },
  { type: 'Partenaire', tone: 'badge-peach', name: 'Fast Campus', initials: 'FC', init: 'init-gray', campus: 'UL', time: 'Avant-hier', status: 'Nouvelle', statusTone: 'badge-gray' },
];

export default function VueVendeurs() {
  const [search, setSearch] = useState('');

  return (
    <>
      <Topbar icon={LayoutDashboard} breadcrumb={[{ label: 'Tableau de bord' }]} badge={{ text: "Aujourd'hui" }}>
        <div className="global-search-wrap">
          <input
            className="global-search-input"
            placeholder="Rechercher cantine, vendeur..."
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
            <div className="kpi-value">7 <span style={{ fontSize: 16, color: '#94A3B8', fontWeight: 400 }}>/ 10</span></div>
            <div className="kpi-sub">3 fermées aujourd&apos;hui</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commandes du jour</div>
            <div className="kpi-value">
              186 <span className="badge-green"><TrendingUp size={13} /> 14%</span>
            </div>
            <div className="kpi-sub">vs hier : 163</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Taux d&apos;acceptation moyen</div>
            <div className="kpi-value orange">87%</div>
            <div className="kpi-sub">vs 82% la semaine dernière</div>
          </div>
          <div className="kpi-card alert-card-red">
            <div className="kpi-label">Créances actives</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>3 500 FCFA</div>
            <div className="kpi-sub">1 vendeur concerné · retrait bloqué</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div className="card-title" style={{ marginBottom: 0 }}>Classement vendeurs</div>
                <div className="card-sub" style={{ marginBottom: 0 }}>Volume de commandes — aujourd&apos;hui</div>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Rang</th><th>Cantine</th><th>Campus</th><th>Commandes</th><th>Acceptation</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {classement.map((v) => (
                    <tr key={v.rank} className={v.rank === 1 ? 'rank1' : ''}>
                      <td>
                        {v.rank === 1 ? (
                          <span className="rank-medal"><Trophy size={13} /> 1</span>
                        ) : (
                          <strong>{v.rank}</strong>
                        )}
                      </td>
                      <td className="name-cell">
                        <span className={`initials ${v.init}`}>{v.initials}</span>
                        <strong>{v.name}</strong>
                      </td>
                      <td><span className="badge-blue">{v.campus}</span></td>
                      <td>{v.orders}</td>
                      <td>
                        <span className={v.status === 'green' ? 'badge-green' : 'badge-orange'}>{v.acceptance}</span>
                      </td>
                      <td>
                        <span className={`status-dot dot-${v.status}`} /> {v.label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">Statut temps réel</div>
              <div className="card-sub">Cantines actives maintenant</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                {statutTempsReel.map((c, i) => (
                  <div key={c.name}>
                    {i === 3 && <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />}
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
            <div className="card-title">Commandes par jour — 7 jours</div>
            <div className="chart-wrap">
              <div className="chart-bars" style={{ marginTop: 12 }}>
                {[55, 72, 61, 88, 78, 100, 45].map((h, i) => (
                  <div
                    key={i}
                    className="bar"
                    style={{ height: `${h}%`, background: i === 5 ? '#F07840' : '#1B2A6B', opacity: i === 5 ? 1 : 0.5 + h / 300 }}
                  />
                ))}
              </div>
            </div>
            <div className="bar-labels">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => (
                <div key={d} className={`bar-label${i === 5 ? ' active' : ''}`}>{d}</div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Répartition des statuts commandes</div>
            <div className="card-sub">Aujourd&apos;hui — tous vendeurs</div>
            <div className="h-bars" style={{ marginTop: 14 }}>
              {statutsCommandes.map((s) => (
                <div className="h-bar-row" key={s.label}>
                  <div className="h-bar-label" style={{ width: 80 }}>{s.label}</div>
                  <div className="h-bar-wrap"><div className="h-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} /></div>
                  <div className="h-bar-val">{s.value} <span style={{ color: '#94A3B8' }}>({s.pct}%)</span></div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Acceptation par campus
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>UCAO</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--indigo)' }}>87%</div>
                  <div style={{ fontSize: 12, color: '#22C55E', marginTop: 2 }}>+5% vs hier</div>
                </div>
                <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>UL</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--indigo)' }}>74%</div>
                  <div style={{ fontSize: 12, color: '#EF4444', marginTop: 2 }}>-3% vs hier</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="card-title" style={{ marginBottom: 0 }}>Notifications à traiter</div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Demandes ambassadeur et candidatures partenaires en attente</div>
            </div>
            <span className="badge-orange">5 en attente</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Type</th><th>Nom</th><th>Campus</th><th>Reçu le</th><th>Statut</th><th></th></tr>
              </thead>
              <tbody>
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
