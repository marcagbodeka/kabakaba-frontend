import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Copy, Trash2, Check, X } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { useAuth } from '../../context/AuthContext';
import {
  findWebUsers,
  provisionWebUser,
  findPendingDeletionRequests,
  getDeletionRequestProgress,
  initiateDeletion,
  confirmDeletion,
  cancelDeletion,
  generateTemporaryPassword,
} from '../../services/domain/webUsersService';

const roleLabel = { SUPERVISION: 'Supervision', ADMIN: 'Admin web' };

function initials(firstName, lastName) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function GestionComptes() {
  const { user: currentUser } = useAuth();
  const [webUsers, setWebUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'ADMIN' });
  const [tempPassword, setTempPassword] = useState(generateTemporaryPassword());
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const [reasonById, setReasonById] = useState({});
  const [actionError, setActionError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, pending] = await Promise.all([findWebUsers(), findPendingDeletionRequests()]);
      setWebUsers(users);
      const enriched = await Promise.all(
        pending.map(async (r) => {
          const progress = await getDeletionRequestProgress(r.id);
          return progress;
        }),
      );
      setRequests(enriched);
    } catch (err) {
      setError(err.message || 'Impossible de charger les comptes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const userById = Object.fromEntries(webUsers.map((u) => [u.id, u]));

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setActionError(null);
    try {
      const created = await provisionWebUser({ ...form, temporaryPassword: tempPassword });
      setCreatedCredentials({ email: created.email, password: tempPassword });
      setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'ADMIN' });
      setTempPassword(generateTemporaryPassword());
      await load();
    } catch (err) {
      setActionError(err.message || 'Impossible de créer ce compte.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdCredentials) return;
    await navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nMot de passe temporaire: ${createdCredentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInitiateDeletion = async (id) => {
    setActionError(null);
    try {
      await initiateDeletion(id, reasonById[id] || undefined);
      await load();
    } catch (err) {
      setActionError(err.message || 'Impossible d\'initier la suppression.');
    }
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

  const handleCancel = async (requestId) => {
    setActionError(null);
    try {
      await cancelDeletion(requestId);
      await load();
    } catch (err) {
      setActionError(err.message || 'Impossible d\'annuler.');
    }
  };

  return (
    <>
      <Topbar icon={ShieldCheck} breadcrumb={[{ label: 'Compte' }, { label: 'Gestion des comptes' }]}>
        <button className="btn-primary-sm" onClick={() => { setShowCreate(true); setCreatedCredentials(null); }}>
          <Plus size={15} /> Nouveau compte
        </button>
      </Topbar>
      <PageContent>
        <div className="page-header">
          <h1>Gestion des comptes Supervision & Admin web</h1>
          <p>Création de comptes, suivi des suppressions en cours</p>
        </div>

        {error && <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>{error}</div>}
        {actionError && <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>{actionError}</div>}

        {requests.length > 0 && (
          <div className="card">
            <div className="card-title">Suppressions en attente de vote</div>
            <div className="card-sub">Vote à la majorité des comptes Supervision actifs — fenêtre de 48h</div>
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
                          <button className="action-btn" onClick={() => handleVote(r.id)}>
                            <Check size={13} /> Voter pour
                          </button>
                        )}
                        <button className="action-btn-danger" onClick={() => handleCancel(r.id)}>
                          <X size={13} /> Annuler
                        </button>
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
          <div className="card-title">Comptes existants</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Compte</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th><th></th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6}>Chargement...</td></tr>}
                {!loading && webUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="name-cell">
                      <span className="initials init-indigo">{initials(u.firstName, u.lastName)}</span>
                      <strong>{u.firstName} {u.lastName}</strong>
                      {u.isRoot && <span className="badge-black" style={{ marginLeft: 8 }}>Root</span>}
                    </td>
                    <td>{u.email}</td>
                    <td><span className="badge-gray">{roleLabel[u.role]}</span></td>
                    <td>
                      {u.isActive ? <span className="badge-green">Actif</span> : <span className="badge-orange">En attente de 1ère connexion</span>}
                    </td>
                    <td>{formatDateTime(u.lastLoginAt)}</td>
                    <td>
                      {!u.isRoot && u.id !== currentUser?.id && (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Motif (optionnel)"
                            value={reasonById[u.id] || ''}
                            onChange={(e) => setReasonById((prev) => ({ ...prev, [u.id]: e.target.value }))}
                            style={{ fontSize: 12, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 6, width: 130 }}
                          />
                          <button className="action-btn-danger" onClick={() => handleInitiateDeletion(u.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContent>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!createdCredentials ? (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Nouveau compte</h2>
                <form onSubmit={handleCreate}>
                  <div className="field">
                    <label>Prénom</label>
                    <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Nom</label>
                    <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Téléphone (optionnel)</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Espace</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="ADMIN">Admin web</option>
                      <option value="SUPERVISION">Supervision</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Mot de passe temporaire (généré)</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input readOnly value={tempPassword} style={{ fontFamily: 'monospace', flex: 1 }} />
                      <button type="button" className="btn-secondary-sm" onClick={() => setTempPassword(generateTemporaryPassword())}>
                        Régénérer
                      </button>
                    </div>
                  </div>
                  {actionError && <div className="fieldError">{actionError}</div>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button type="button" className="btn-secondary-sm" onClick={() => setShowCreate(false)}>Annuler</button>
                    <button type="submit" className="btn-primary-sm" disabled={creating}>
                      {creating ? 'Création...' : 'Créer le compte'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Compte créé</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                  Transmets ces identifiants à la personne concernée par un canal sûr — le mot de passe ne sera plus jamais affiché.
                </p>
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 13 }}>
                  Email : {createdCredentials.email}<br />
                  Mot de passe : {createdCredentials.password}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn-secondary-sm" onClick={handleCopy}>
                    <Copy size={13} /> {copied ? 'Copié !' : 'Copier'}
                  </button>
                  <button className="btn-primary-sm" onClick={() => setShowCreate(false)}>Fermer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}