import { BarChart3 } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const detailParCampus = [
  { campus: 'UCAO · Lomé', recharges: '182 400 FCFA', surplus: '182 100 FCFA', commissions: '412 FCFA', net: '181 688 FCFA' },
  { campus: 'Université de Lomé', recharges: '132 100 FCFA', surplus: '132 400 FCFA', commissions: '298 FCFA', net: '132 102 FCFA' },
];

export default function VolumeRevenus() {
  return (
    <>
      <Topbar
        icon={BarChart3}
        breadcrumb={[{ label: 'Par campus', path: '/supervision/campus' }, { label: 'Volume & revenus' }]}
      />
      <PageContent>
        <div className="page-header">
          <h1>Volume & revenus</h1>
          <p>Détail des recharges, surplus et commissions par campus et par période</p>
        </div>

        <div className="card">
          <div className="card-title">Décomposition des revenus — tous campus</div>
          <div className="card-sub">Sur les 30 derniers jours</div>
          <div className="revenue-breakdown">
            <div className="revenue-cell">
              <div className="revenue-cell-label">Surplus recharges</div>
              <div className="revenue-cell-value">314 500 FCFA</div>
              <div className="revenue-cell-sub">Revenu principal</div>
            </div>
            <div className="revenue-cell">
              <div className="revenue-cell-label">Frais retrait non couverts</div>
              <div className="revenue-cell-value orange">9 900 FCFA</div>
              <div className="revenue-cell-sub">Vendeurs sous 10 000 F</div>
            </div>
            <div className="revenue-cell">
              <div className="revenue-cell-label">Commissions ambassadeurs</div>
              <div className="revenue-cell-value">- 710 FCFA</div>
              <div className="revenue-cell-sub">Déduites du brut</div>
            </div>
            <div className="revenue-cell highlight">
              <div className="revenue-cell-label">Revenu net</div>
              <div className="revenue-cell-value indigo">303 890 FCFA</div>
              <div className="revenue-cell-sub">Après déductions</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Détail par campus</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Campus</th><th>Recharges (brut)</th><th>Surplus</th><th>Commissions versées</th><th>Net</th></tr>
              </thead>
              <tbody>
                {detailParCampus.map((c) => (
                  <tr key={c.campus}>
                    <td><strong>{c.campus}</strong></td>
                    <td>{c.recharges}</td>
                    <td>{c.surplus}</td>
                    <td>{c.commissions}</td>
                    <td>{c.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Évolution du revenu net (7 jours)</div>
          <div className="chart-wrap">
            <div className="chart-bars" style={{ marginTop: 12 }}>
              {[45, 55, 50, 68, 62, 90, 74].map((h, i) => (
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
      </PageContent>
    </>
  );
}