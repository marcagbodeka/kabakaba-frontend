import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const initial = [
  { id: 1, initials: 'KA', name: 'Koffi Amevor', phone: '+228 92 11 22 33', campus: 'UCAO', campusTone: 'badge-blue', motif: '3 annulations consécutives (récidive)', tickets: '200 tickets', since: "Aujourd'hui 09:14", until: 'Demain 09:14', remaining: '23h restantes', remainingTone: 'var(--muted)' },
  { id: 2, initials: 'YD', name: 'Yawa Dossou', phone: '+228 97 44 55 66', campus: 'UL', campusTone: 'badge-gray', motif: '3 annulations consécutives (récidive)', tickets: '200 tickets', since: 'Hier 14:32', until: "Aujourd'hui 14:32", remaining: 'Expire dans 2h', remainingTone: '#22C55E' },
];

export default function ComptesSuspendus() {
  const [rows, setRows] = useState(initial);

  const handleLift = (id) => {
    // TODO: appeler PATCH /admin/suspensions/:id une fois l'API prête
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <Topbar icon={ShieldAlert} breadcrumb={[{ label: 'Litiges', path: '/admin/litiges' }, { label: 'Comptes suspendus' }]} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Litiges</div>
          <h1>Comptes suspendus</h1>
          <p>Étudiants bloqués pour comportement abusif — {rows.length} actifs</p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Étudiant</th><th>Campus</th><th>Motif</th><th>Tickets déduits</th>
                  <th>Suspendu le</th><th>Levée prévue</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="name-cell">
                      <span className="initials init-gray" style={{ width: 28, height: 28, fontSize: 11 }}>{r.initials}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.phone}</div>
                      </div>
                    </td>
                    <td><span className={r.campusTone}>{r.campus}</span></td>
                    <td style={{ fontSize: 13, color: '#475569' }}>{r.motif}</td>
                    <td style={{ fontWeight: 700, color: '#DC2626' }}>{r.tickets}</td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{r.since}</td>
                    <td style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: 'var(--indigo)' }}>{r.until}</span>
                      <div style={{ fontSize: 11, color: r.remainingTone }}>{r.remaining}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-secondary-sm" style={{ padding: '7px 12px', fontSize: 13 }}>Modifier</button>
                        <button className="btn-danger-sm" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => handleLift(r.id)}>Lever</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>
                      Aucune suspension active.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageContent>
    </>
  );
}