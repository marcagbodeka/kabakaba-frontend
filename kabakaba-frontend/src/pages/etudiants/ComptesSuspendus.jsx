import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const initialSuspensions = [
  { id: 1, initials: 'KA', name: 'K. Amegan', campus: 'UCAO · Lomé', motif: 'Annulations répétées (6 en 10 min)', date: '12 juil. 2026', ends: 'dans 8h', active: true },
  { id: 2, initials: 'ML', name: 'M. Lawson', campus: 'Université de Lomé', motif: 'Annulations répétées (6 en 10 min)', date: '11 juil. 2026', ends: 'dans 22h', active: true },
  { id: 3, initials: 'SD', name: 'S. Dossou', campus: 'UCAO · Lomé', motif: 'Annulations répétées (6 en 10 min)', date: '10 juil. 2026', ends: 'expirée', active: false },
];

export default function ComptesSuspendus() {
  const [suspensions, setSuspensions] = useState(initialSuspensions);
  const activeCount = suspensions.filter((s) => s.active).length;

  const handleLift = (id) => {
    // TODO: appeler PATCH /admin/suspensions/:id une fois l'API prête
    setSuspensions((prev) => prev.map((s) => (s.id === id ? { ...s, active: false, ends: 'levée manuellement' } : s)));
  };

  return (
    <>
      <Topbar
        icon={ShieldAlert}
        breadcrumb={[{ label: 'Étudiants', path: '/supervision/etudiants' }, { label: 'Comptes suspendus' }]}
        badge={{ text: `${activeCount} actives`, tone: activeCount > 0 ? 'red' : 'default' }}
      />
      <PageContent>
        <div className="page-header">
          <h1>Comptes suspendus</h1>
          <p>Liste des étudiants suspendus, avec motif et durée (règle anti-abus, section 6 du CDC)</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Suspensions actives</div>
            <div className="kpi-value">{activeCount}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Suspensions (30 jours)</div>
            <div className="kpi-value">7</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Tickets déduits (30 jours)</div>
            <div className="kpi-value kpi-value-sm">1 400</div>
            <div className="kpi-sub">200 tickets par récidive</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Étudiants suspendus</div>
          <div className="card-sub">Possibilité d&apos;annuler ou d&apos;ajuster manuellement une suspension</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Étudiant</th><th>Campus</th><th>Motif</th><th>Date</th><th>Fin</th><th>Statut</th><th></th></tr>
              </thead>
              <tbody>
                {suspensions.map((s) => (
                  <tr key={s.id}>
                    <td className="name-cell">
                      <span className="initials init-indigo">{s.initials}</span>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.campus}</td>
                    <td>{s.motif}</td>
                    <td>{s.date}</td>
                    <td>{s.ends}</td>
                    <td>
                      {s.active ? (
                        <span className="badge-red">Suspendu</span>
                      ) : (
                        <span className="badge-gray">Terminée</span>
                      )}
                    </td>
                    <td>
                      {s.active && (
                        <button className="action-btn" onClick={() => handleLift(s.id)}>
                          Lever la suspension
                        </button>
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