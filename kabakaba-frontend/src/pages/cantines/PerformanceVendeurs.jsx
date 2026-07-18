import { Utensils } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const vendors = [
  { name: 'Cantine Centrale UCAO', campus: 'UCAO · Lomé', orders: '1 840', acceptance: '86%', refus: '8%', annulation: '6%', avgTime: '1min 40s', status: 'green' },
  { name: 'Resto U Lomé 1', campus: 'Université de Lomé', orders: '1 402', acceptance: '81%', refus: '11%', annulation: '8%', avgTime: '2min 10s', status: 'green' },
  { name: 'Snack du Campus', campus: 'UCAO · Lomé', orders: '1 280', acceptance: '81%', refus: '12%', annulation: '7%', avgTime: '2min 50s', status: 'orange' },
  { name: 'Cantine du Lac', campus: 'Université de Lomé', orders: '934', acceptance: '74%', refus: '18%', annulation: '9%', avgTime: '3min 40s', status: 'red' },
];

export default function PerformanceVendeurs() {
  return (
    <>
      <Topbar
        icon={Utensils}
        breadcrumb={[{ label: 'Par cantine', path: '/supervision/cantines/performance' }, { label: 'Performance vendeurs' }]}
        badge={{ text: '30 derniers jours' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Performance vendeurs</h1>
          <p>Volume de commandes, taux d&apos;acceptation, de refus et d&apos;annulation par cantine</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Cantines actives</div>
            <div className="kpi-value">4</div>
            <div className="kpi-sub">sur 4 affiliées</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Acceptation moyenne</div>
            <div className="kpi-value">80.5%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Temps moyen d&apos;acceptation</div>
            <div className="kpi-value kpi-value-sm">2min 35s</div>
            <div className="kpi-sub">limite réglementaire : 5min</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Cantine sous surveillance</div>
            <div className="kpi-value kpi-value-sm">1</div>
            <div className="kpi-sub">réactivité en baisse</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Classement par réactivité</div>
          <div className="card-sub">Temps moyen d&apos;acceptation — indicateur clé de réactivité</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cantine</th>
                  <th>Campus</th>
                  <th>Commandes</th>
                  <th>Acceptation</th>
                  <th>Refus</th>
                  <th>Annulation</th>
                  <th>Temps moyen</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.name}>
                    <td className="name-cell">
                      <span className={`status-dot dot-${v.status}`} />
                      <strong>{v.name}</strong>
                    </td>
                    <td>{v.campus}</td>
                    <td>{v.orders}</td>
                    <td>{v.acceptance}</td>
                    <td>{v.refus}</td>
                    <td>{v.annulation}</td>
                    <td>{v.avgTime}</td>
                    <td>
                      {v.status === 'green' && <span className="badge-green">Bonne</span>}
                      {v.status === 'orange' && <span className="badge-orange">À surveiller</span>}
                      {v.status === 'red' && <span className="badge-red">Alerte</span>}
                    </td>
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