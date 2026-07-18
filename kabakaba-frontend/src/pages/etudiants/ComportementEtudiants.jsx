import { Users, TrendingUp } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const parCampus = [
  { campus: 'UCAO · Lomé', signed: '1 540', active: '1 120', avgRecharge: '1 180 FCFA', freq: '2.4 / semaine' },
  { campus: 'Université de Lomé', signed: '1 300', active: '860', avgRecharge: '980 FCFA', freq: '2.0 / semaine' },
];

export default function ComportementEtudiants() {
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

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Étudiants inscrits</div>
            <div className="kpi-value">2 840</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Actifs (30 jours)</div>
            <div className="kpi-value">
              1 980 <span className="badge-green"><TrendingUp size={13} /> 9%</span>
            </div>
            <div className="kpi-sub">70% des inscrits</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Montant moyen rechargé</div>
            <div className="kpi-value kpi-value-sm">1 090 FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Fréquence moyenne</div>
            <div className="kpi-value kpi-value-sm">2.2 / semaine</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Évolution des inscriptions (7 jours)</div>
          <div className="chart-wrap">
            <div className="chart-bars" style={{ marginTop: 12 }}>
              {[38, 42, 35, 50, 58, 66, 72].map((h, i) => (
                <div key={i} className="bar" style={{ height: `${h}%`, background: '#F07840', opacity: 0.55 + h / 250 }} />
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
          <div className="card-title">Détail par campus</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Campus</th><th>Inscrits</th><th>Actifs (30j)</th><th>Montant moyen rechargé</th><th>Fréquence moyenne</th></tr>
              </thead>
              <tbody>
                {parCampus.map((c) => (
                  <tr key={c.campus}>
                    <td><strong>{c.campus}</strong></td>
                    <td>{c.signed}</td>
                    <td>{c.active}</td>
                    <td>{c.avgRecharge}</td>
                    <td>{c.freq}</td>
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