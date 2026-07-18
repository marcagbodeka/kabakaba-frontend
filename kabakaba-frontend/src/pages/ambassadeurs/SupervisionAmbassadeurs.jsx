import { Trophy } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const ranking = [
  { rank: 1, name: 'E. Kodjo', campus: 'UCAO · Lomé', level: 'Or', affiliates: 42, volume: '182 400 FCFA', commission: '2 189 FCFA' },
  { rank: 2, name: 'A. Mensah', campus: 'Université de Lomé', level: 'Argent', affiliates: 27, volume: '96 200 FCFA', commission: '770 FCFA' },
  { rank: 3, name: 'R. Adjovi', campus: 'UCAO · Lomé', level: 'Argent', affiliates: 19, volume: '68 900 FCFA', commission: '551 FCFA' },
  { rank: 4, name: 'C. Bakoa', campus: 'Université de Lomé', level: 'Bronze', affiliates: 8, volume: '24 100 FCFA', commission: '120 FCFA' },
];

const levelBadge = { Or: 'badge-amber', Argent: 'badge-gray', Bronze: 'badge-peach' };

export default function SupervisionAmbassadeurs() {
  return (
    <>
      <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs' }]} badge={{ text: '30 derniers jours' }} />
      <PageContent>
        <div className="page-header">
          <h1>Supervision du programme ambassadeur</h1>
          <p>Ambassadeurs actifs, volume de recharges générées via parrainage, commissions versées</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Ambassadeurs actifs</div>
            <div className="kpi-value">14</div>
            <div className="kpi-sub">2 campus</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Volume parrainage (30j)</div>
            <div className="kpi-value kpi-value-sm">371 600 FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Commissions versées</div>
            <div className="kpi-value kpi-value-sm">3 630 FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Répartition par niveau</div>
            <div className="kpi-value kpi-value-sm">1 Or · 6 Argent · 7 Bronze</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Classement des ambassadeurs</div>
          <div className="card-sub">Basé sur le volume de recharges des affiliés — 30 derniers jours glissants</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Rang</th><th>Ambassadeur</th><th>Campus</th><th>Niveau</th><th>Affiliés actifs</th><th>Volume</th><th>Commission</th></tr>
              </thead>
              <tbody>
                {ranking.map((a) => (
                  <tr key={a.rank} className={a.rank === 1 ? 'rank1' : ''}>
                    <td>#{a.rank}</td>
                    <td><strong>{a.name}</strong></td>
                    <td>{a.campus}</td>
                    <td><span className={levelBadge[a.level]}>{a.level}</span></td>
                    <td>{a.affiliates}</td>
                    <td>{a.volume}</td>
                    <td>{a.commission}</td>
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