import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { findUsers, extractList } from '../../services/domain/usersService';
import { findAllCampuses } from '../../services/domain/campusesService';
import { getSupervisionStats } from '../../services/domain/adminStatsService';

function initials(firstName, lastName) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTickets(n) {
  return `${n.toLocaleString('fr-FR')} tickets`;
}

export default function ComptesSuspendus() {
  const [students, setStudents] = useState([]);
  const [campusById, setCampusById] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResponse, campuses, supervisionStats] = await Promise.all([
        findUsers({ role: 'STUDENT', isSuspended: true, limit: 100 }),
        findAllCampuses(),
        getSupervisionStats(),
      ]);
      const { items } = extractList(usersResponse);
      setStudents(items);
      setCampusById(Object.fromEntries(campuses.map((c) => [c.id, c.name])));
      setStats(supervisionStats);
    } catch (err) {
      setError(err.message || 'Impossible de charger les comptes suspendus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // walletBalance uniquement : escrowBalance n'existe plus côté backend
  // (champ mort supprimé — il valait toujours 0, jamais maintenu).
  const blockedFunds = students.reduce((sum, s) => sum + (s.walletBalance || 0), 0);

  return (
    <>
      <Topbar
        icon={ShieldAlert}
        breadcrumb={[{ label: 'Étudiants', path: '/supervision/etudiants' }, { label: 'Comptes suspendus' }]}
        badge={{ text: `${stats?.activeSuspensions ?? students.length} actives`, tone: (stats?.activeSuspensions ?? 0) > 0 ? 'red' : 'default' }}
      />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Étudiants</div>
          <h1>Comptes suspendus</h1>
          <p>Liste des étudiants suspendus, avec motif et durée (règle anti-abus, section 6 du CDC)</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Suspensions actives</div>
            <div className="kpi-value">{loading ? '—' : stats?.activeSuspensions ?? students.length}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Suspensions (30 jours)</div>
            <div className="kpi-value">{loading ? '—' : stats?.suspensions30d ?? '—'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Fonds bloqués</div>
            <div className="kpi-value">{loading ? '—' : formatTickets(blockedFunds)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Bannissements définitifs</div>
            <div className="kpi-value">{loading ? '—' : stats?.totalBanned ?? '—'}</div>
          </div>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-title">Étudiants suspendus</div>
          {/* Lecture seule : la levée de suspension est une action de
              modération réservée à l'Admin web (voir CDC 9.2 — Supervision
              n'a pas ce droit ; le backend le refuse explicitement,
              403 "La supervision est en lecture seule sur les comptes
              utilisateurs"). Traiter une suspension se fait depuis
              l'espace Admin. */}
          <div className="card-sub">Consultation uniquement — la levée de suspension se fait depuis l&apos;espace Admin</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Étudiant</th><th>Campus</th><th>Motif</th><th>Date</th><th>Fin de suspension</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6}>Chargement...</td></tr>
                )}
                {!loading && students.length === 0 && (
                  <tr><td colSpan={6}>Aucun compte suspendu actuellement.</td></tr>
                )}
                {!loading && students.map((s) => (
                  <tr key={s.id}>
                    <td className="name-cell">
                      <span className="initials init-indigo">{initials(s.firstName, s.lastName)}</span>
                      <strong>{s.firstName} {s.lastName}</strong>
                    </td>
                    <td>{campusById[s.campusId] || '—'}</td>
                    <td>{s.suspensionReason || '—'}</td>
                    <td>{formatDate(s.suspendedAt)}</td>
                    <td>{s.suspensionUntil ? formatDate(s.suspensionUntil) : 'Indéterminée'}</td>
                    <td>
                      {s.isBanned ? (
                        <span className="badge-black">Banni définitivement</span>
                      ) : (
                        <span className="badge-red">Suspendu</span>
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
