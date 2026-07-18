import { Star, AlertTriangle } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const vendors = [
  { name: 'Cantine Centrale UCAO', campus: 'UCAO · Lomé', note: '4.2', reviews: 312, alert: false },
  { name: 'Resto U Lomé 1', campus: 'Université de Lomé', note: '4.0', reviews: 268, alert: false },
  { name: 'Snack du Campus', campus: 'UCAO · Lomé', note: '3.8', reviews: 190, alert: false },
  { name: 'Cantine du Lac', campus: 'Université de Lomé', note: '3.2', reviews: 104, alert: true },
];

export default function NotesAlertes() {
  return (
    <>
      <Topbar
        icon={Star}
        breadcrumb={[{ label: 'Avis & qualité', path: '/supervision/qualite/notes' }, { label: 'Notes & alertes' }]}
        badge={{ text: '30 derniers jours' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Notes & alertes</h1>
          <p>Note moyenne par vendeur, détection des cantines avec retours négatifs récurrents</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Note moyenne plateforme</div>
            <div className="kpi-value">3.8 / 5</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avis collectés (30j)</div>
            <div className="kpi-value">874</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Cantines en alerte</div>
            <div className="kpi-value">1</div>
            <div className="kpi-sub">note &lt; 3.5 sur 30 jours</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Classement par note</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Cantine</th><th>Campus</th><th>Note moyenne</th><th>Avis (30j)</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.name}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.campus}</td>
                    <td>★ {v.note}</td>
                    <td>{v.reviews}</td>
                    <td>
                      {v.alert ? (
                        <span className="badge-red"><AlertTriangle size={12} /> Retours négatifs récurrents</span>
                      ) : (
                        <span className="badge-green">Correcte</span>
                      )}
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