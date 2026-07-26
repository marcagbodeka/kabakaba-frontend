import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { findSuspensionEvents } from '../../services/domain/suspensionsService';

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABEL = { ACTIVE: 'Active', LIFTED: 'Levée', EXPIRED: 'Expirée' };
const STATUS_BADGE = { ACTIVE: 'badge-red', LIFTED: 'badge-green', EXPIRED: 'badge-gray' };
const TRIGGER_LABEL = { MANUAL: 'Manuelle', AUTOMATIC: 'Automatique' };

export default function HistoriqueSuspensions() {
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await findSuspensionEvents({ limit: 100, ...filters });
      setEvents(items);
    } catch (err) {
      setError(err.message || "Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const applyFilters = () => {
    load({
      status: statusFilter || undefined,
      trigger: triggerFilter || undefined,
    });
  };

  return (
    <>
      <Topbar
        icon={History}
        breadcrumb={[{ label: 'Étudiants', path: '/supervision/etudiants' }, { label: 'Historique des suspensions' }]}
      />
      <PageContent>
        <div className="page-header">
          <h1>Historique des suspensions</h1>
          <p>Toutes les suspensions (actives, levées) et bannissements définitifs, avec origine et motif</p>
        </div>

        <div className="filters-row" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Active</option>
            <option value="LIFTED">Levée</option>
            <option value="EXPIRED">Expirée</option>
          </select>
          <select value={triggerFilter} onChange={(e) => setTriggerFilter(e.target.value)}>
            <option value="">Toute origine</option>
            <option value="MANUAL">Manuelle</option>
            <option value="AUTOMATIC">Automatique</option>
          </select>
          <button className="action-btn" onClick={applyFilters}>Filtrer</button>
        </div>

        {error && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-title">Événements</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Étudiant</th><th>Origine</th><th>Motif</th><th>Suspendu le</th><th>Levé le</th><th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6}>Chargement...</td></tr>}
                {!loading && events.length === 0 && <tr><td colSpan={6}>Aucun événement.</td></tr>}
                {!loading && events.map((e) => (
                  <tr key={e.id}>
                    <td className="name-cell">
                      <strong>{e.student?.firstName} {e.student?.lastName}</strong>
                      {e.student?.isBanned && <span className="badge-black" style={{ marginLeft: 8 }}>Banni</span>}
                    </td>
                    <td>{TRIGGER_LABEL[e.trigger] || e.trigger}</td>
                    <td>{e.reason}</td>
                    <td>{formatDateTime(e.suspendedAt)}</td>
                    <td>{formatDateTime(e.liftedAt)}</td>
                    <td><span className={STATUS_BADGE[e.status] || 'badge-gray'}>{STATUS_LABEL[e.status] || e.status}</span></td>
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