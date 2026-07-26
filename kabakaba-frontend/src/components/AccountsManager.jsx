import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  findWebUsers,
  findPendingDeletionRequests,
  getDeletionRequestProgress,
  initiateDeletion,
  confirmDeletion,
  cancelDeletion,
} from '../services/domain/webUsersService';
import { useAuth } from '../context/AuthContext';
import AccountFormModal from './AccountFormModal';
import DeleteAccountModal from './DeleteAccountModal';

function initials(firstName, lastName) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AccountsManager({ role, roleLabel }) {
  const { user: currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await findWebUsers();
      setAccounts(all.filter((u) => u.role === role));

      if (role === 'SUPERVISION') {
        const pending = await findPendingDeletionRequests();
        const relevant = pending.filter((r) => all.find((u) => u.id === r.targetWebUserId)?.role === 'SUPERVISION');
        const enriched = await Promise.all(relevant.map((r) => getDeletionRequestProgress(r.id)));
        setRequests(enriched);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger les comptes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const userById = Object.fromEntries(accounts.map((u) => [u.id, u]));

  const handleConfirmDelete = async (reason) => {
    await initiateDeletion(deleteTarget.id, reason);
    await load();
  };

  const handleVote = async (requestId) => {
    setActionError(null);
    try {
      await confirmDeletion(requestId);
      await load();
    } catch (err) {
      setActionError(err.message || 'Impossible de voter.');
    }
  };

  const handleCancelRequest = async (requestId) => {
    setActionError(null);
    try {
      await cancelDeletion(requestId);
      await load();
    } catch (err) {
      setActionError(err.message || "Impossible d'annuler.");
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="acct-btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Nouveau compte {roleLabel}
        </button>
      </div>

      {error && <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>{error}</div>}
      {actionError && <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>{actionError}</div>}

      {role === 'SUPERVISION' && requests.length > 0 && (
        <div className="card">
          <div className="card-title">Suppressions en attente de vote</div>
          <div className="card-sub">Majorité des comptes Supervision actifs — fenêtre de 48h</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
            {requests.map((r) => {
              const target = userById[r.targetWebUserId];
              const initiator = userById[r.initiatedByWebUserId];
              const hasVoted = r.approvals?.some((a) => a.approverId === currentUser?.id);
              const pct = Math.min(100, (r.approvalsCount / r.majorityThreshold) * 100);
              return (
                <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <strong>{target ? `${target.firstName} ${target.lastName}` : r.targetWebUserId}</strong>
                      <span style={{ fontSize: 12.5, color: 'var(--muted)', marginLeft: 8 }}>
                        initié par {initiator ? `${initiator.firstName} ${initiator.lastName}` : '—'} · expire le {formatDateTime(r.expiresAt)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!hasVoted && (
                        <button className="acct-btn-secondary" onClick={() => handleVote(r.id)}>Voter pour</button>
                      )}
                      <button className="acct-btn-danger" onClick={() => handleCancelRequest(r.id)}>Annuler</button>
                    </div>
                  </div>
                  {r.reason && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Motif : {r.reason}</div>}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>
                      <span>{r.approvalsCount} / {r.majorityThreshold} votes requis</span>
                      <span>{r.eligibleVoters} votant(s) éligible(s)</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Comptes {roleLabel}</div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Compte</th><th>Email</th><th>Statut</th><th>Dernière connexion</th><th></th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5}>Chargement...</td></tr>}
              {!loading && accounts.length === 0 && <tr><td colSpan={5}>Aucun compte.</td></tr>}
              {!loading && accounts.map((u) => (
                <tr key={u.id}>
                  <td className="name-cell">
                    <span className="initials init-indigo">{initials(u.firstName, u.lastName)}</span>
                    <strong>{u.firstName} {u.lastName}</strong>
                    {u.isRoot && <span className="badge-black" style={{ marginLeft: 8 }}>Root</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.isActive ? <span className="badge-green">Actif</span> : <span className="badge-orange">En attente de 1ère connexion</span>}</td>
                  <td>{formatDateTime(u.lastLoginAt)}</td>
                  <td>
                    {!u.isRoot && u.id !== currentUser?.id && (
                      <button className="acct-icon-btn" style={{ color: '#EF4444', borderColor: '#FECACA' }} onClick={() => setDeleteTarget(u)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <AccountFormModal role={role} roleLabel={roleLabel} onClose={() => setShowCreate(false)} onCreated={load} />
      )}
      {deleteTarget && (
        <DeleteAccountModal
          account={deleteTarget}
          immediate={role === 'ADMIN'}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}