import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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

// Trois états distincts, à ne pas confondre : un compte pas encore
// connecté une première fois (isActive=false, deletedAt=null) n'a rien à
// voir avec un compte désactivé (deletedAt renseigné) — les fusionner sous
// le même badge masquerait justement la trace qu'on veut garder.
function accountStatus(u) {
  if (u.deletedAt) return { label: 'Désactivé', className: 'badge-red' };
  if (u.isActive) return { label: 'Actif', className: 'badge-green' };
  return { label: 'En attente de 1ère connexion', className: 'badge-orange' };
}

const SORTABLE_COLUMNS = {
  name: (u) => `${u.firstName} ${u.lastName}`.toLowerCase(),
  email: (u) => u.email.toLowerCase(),
  status: (u) => (u.deletedAt ? 2 : u.isActive ? 0 : 1),
  lastLoginAt: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0),
};

export default function AccountsManager({ role, roleLabel }) {
  const { user: currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

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

  const visibleAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? accounts.filter(
          (u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        )
      : accounts;

    const keyFn = SORTABLE_COLUMNS[sortBy];
    const sorted = [...filtered].sort((a, b) => {
      const ka = keyFn(a);
      const kb = keyFn(b);
      if (ka < kb) return sortDir === 'asc' ? -1 : 1;
      if (ka > kb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [accounts, search, sortBy, sortDir]);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom ou un email..."
            style={{
              width: '100%',
              height: 36,
              padding: '0 12px 0 32px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13.5,
            }}
          />
        </div>
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
        <div className="card-title">
          Comptes {roleLabel}
          {!loading && (
            <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 13 }}>
              {' '}({visibleAccounts.length}{visibleAccounts.length !== accounts.length ? ` / ${accounts.length}` : ''})
            </span>
          )}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('name')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Compte <SortIcon column="name" /></span>
                </th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('email')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Email <SortIcon column="email" /></span>
                </th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('status')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Statut <SortIcon column="status" /></span>
                </th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('lastLoginAt')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Dernière connexion <SortIcon column="lastLoginAt" /></span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5}>Chargement...</td></tr>}
              {!loading && visibleAccounts.length === 0 && (
                <tr><td colSpan={5}>{search ? 'Aucun compte ne correspond à cette recherche.' : 'Aucun compte.'}</td></tr>
              )}
              {!loading && visibleAccounts.map((u) => {
                const status = accountStatus(u);
                return (
                  <tr key={u.id} style={u.deletedAt ? { opacity: 0.6 } : undefined}>
                    <td className="name-cell">
                      <span className="initials init-indigo">{initials(u.firstName, u.lastName)}</span>
                      <strong>{u.firstName} {u.lastName}</strong>
                      {u.isRoot && <span className="badge-black" style={{ marginLeft: 8 }}>Root</span>}
                    </td>
                    <td>{u.email}</td>
                    <td><span className={status.className}>{status.label}</span></td>
                    <td>{formatDateTime(u.lastLoginAt)}</td>
                    <td>
                      {!u.isRoot && !u.deletedAt && u.id !== currentUser?.id && (
                        <button className="acct-icon-btn" style={{ color: '#EF4444', borderColor: '#FECACA' }} onClick={() => setDeleteTarget(u)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
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