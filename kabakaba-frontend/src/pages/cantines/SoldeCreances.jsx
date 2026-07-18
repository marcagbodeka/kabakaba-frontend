import { Wallet } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const vendors = [
  { name: 'Cantine Centrale UCAO', campus: 'UCAO · Lomé', solde: '84 200 FCFA', creance: '0 FCFA', retraits: 12, blocked: false },
  { name: 'Resto U Lomé 1', campus: 'Université de Lomé', solde: '62 900 FCFA', creance: '0 FCFA', retraits: 9, blocked: false },
  { name: 'Snack du Campus', campus: 'UCAO · Lomé', solde: '18 400 FCFA', creance: '12 500 FCFA', retraits: 5, blocked: true },
  { name: 'Cantine du Lac', campus: 'Université de Lomé', solde: '9 100 FCFA', creance: '0 FCFA', retraits: 3, blocked: false },
];

export default function SoldeCreances() {
  return (
    <>
      <Topbar
        icon={Wallet}
        breadcrumb={[{ label: 'Par cantine', path: '/supervision/cantines/performance' }, { label: 'Solde & créances' }]}
        badge={{ text: 'En temps réel' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Solde & créances</h1>
          <p>Solde actuel, historique des retraits et créances actives par vendeur</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Solde total vendeurs</div>
            <div className="kpi-value kpi-value-sm">174 600 FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Créances actives</div>
            <div className="kpi-value kpi-value-sm">12 500 FCFA</div>
            <div className="kpi-sub">1 vendeur concerné</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Retraits ce mois</div>
            <div className="kpi-value">29</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Vendeurs bloqués</div>
            <div className="kpi-value">1</div>
            <div className="kpi-sub">retrait suspendu (créance active)</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Solde par cantine</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Cantine</th><th>Campus</th><th>Solde</th><th>Créance</th><th>Retraits (30j)</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.name}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.campus}</td>
                    <td>{v.solde}</td>
                    <td>{v.creance}</td>
                    <td>{v.retraits}</td>
                    <td>
                      {v.blocked ? (
                        <span className="badge-red">Retrait bloqué</span>
                      ) : (
                        <span className="badge-green">Disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12 }}>
            Une créance active bloque le retrait tant qu&apos;elle n&apos;est pas régularisée
            (récupération automatique dès que le solde vendeur l&apos;atteint).
          </p>
        </div>
      </PageContent>
    </>
  );
}