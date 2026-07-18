import { useState } from 'react';
import { Building2, TrendingUp } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const campuses = [
  { name: 'UCAO · Lomé', cantines: 2, orders: '3 120', completion: '84%', revenue: '168 450', signed: '1 540', active: '1 120', status: 'Actif' },
  { name: 'Université de Lomé', cantines: 2, orders: '2 336', completion: '79%', revenue: '122 232', signed: '1 300', active: '860', status: 'Actif' },
];

const topCantines = [
  { name: 'Cantine Centrale UCAO', campus: 'UCAO · Lomé', orders: '1 840', acceptance: '86%', note: '4.2' },
  { name: 'Resto U Lomé 1', campus: 'Université de Lomé', orders: '1 402', acceptance: '81%', note: '4.0' },
  { name: 'Snack du Campus', campus: 'UCAO · Lomé', orders: '1 280', acceptance: '81%', note: '3.8' },
];

// Une seule série par option — jamais N séries simultanées, peu importe
// le nombre de campus. Ajouter un campus = ajouter une entrée ici,
// pas une nouvelle couleur/barre dans le graphique.
const volumeByOption = {
  'Tous les campus': [70, 82, 68, 92, 85, 98, 79],
  'UCAO · Lomé': [60, 75, 65, 90, 80, 95, 70],
  'Université de Lomé': [40, 50, 45, 65, 55, 72, 48],
};

export default function ComparaisonCampus() {
  const [selected, setSelected] = useState('Tous les campus');
  const values = volumeByOption[selected];

  return (
    <>
      <Topbar
        icon={Building2}
        breadcrumb={[{ label: 'Par campus', path: '/supervision/campus' }, { label: 'Comparaison campus' }]}
        badge={{ text: '30 derniers jours' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Comparaison campus</h1>
          <p>Performances comparées entre les campus actifs</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Campus actifs</div>
            <div className="kpi-value">2</div>
            <div className="kpi-sub">sur 2 enregistrés</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commandes totales</div>
            <div className="kpi-value">
              5 456 <span className="badge-green"><TrendingUp size={13} /> 18%</span>
            </div>
            <div className="kpi-sub">sur 30 jours</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Revenus générés</div>
            <div className="kpi-value kpi-value-sm">
              290 682 FCFA <span className="badge-green"><TrendingUp size={13} /> 11%</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Étudiants inscrits</div>
            <div className="kpi-value">2 840</div>
            <div className="kpi-sub">actifs : 1 980</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Tous les campus</div>
          <div className="card-sub">Comparaison détaillée des campus affiliés</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Campus</th>
                  <th>Cantines</th>
                  <th>Commandes</th>
                  <th>Taux complétion</th>
                  <th>Revenus (FCFA)</th>
                  <th>Inscrits</th>
                  <th>Actifs</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {campuses.map((c) => (
                  <tr key={c.name}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.cantines}</td>
                    <td>{c.orders}</td>
                    <td>{c.completion}</td>
                    <td>{c.revenue}</td>
                    <td>{c.signed}</td>
                    <td>{c.active}</td>
                    <td><span className="badge-green">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Volume commandes / 7 jours</div>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{
                fontSize: 13, fontWeight: 600, color: 'var(--indigo)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '6px 10px', fontFamily: 'inherit', background: 'var(--surface)',
              }}
            >
              {Object.keys(volumeByOption).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="chart-wrap">
            <div className="chart-bars" style={{ marginTop: 12 }}>
              {values.map((h, i) => (
                <div key={i} className="bar" style={{ height: `${h}%`, background: '#1B2A6B', opacity: 0.55 + h / 250 }} />
              ))}
            </div>
          </div>
          <div className="bar-labels">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
              <div key={d} className="bar-label">{d}</div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Top cantines — tous campus</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Cantine</th><th>Campus</th><th>Commandes</th><th>Acceptation</th><th>Note</th></tr>
              </thead>
              <tbody>
                {topCantines.map((c) => (
                  <tr key={c.name}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.campus}</td>
                    <td>{c.orders}</td>
                    <td>{c.acceptance}</td>
                    <td>★ {c.note}</td>
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