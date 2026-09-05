import { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { findSuspensionEvents } from '../../../services/domain/suspensionsService';
import { updateUser } from '../../../services/domain/usersService';

function initialsOf(first, last) {
  return `${(first || '?')[0]}${(last || '?')[0]}`.toUpperCase();
}
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function remainingLabel(untilIso) {
  if (!untilIso) return { label: 'Durée indéterminée', tone: 'var(--muted)' };
  const ms = new Date(untilIso).getTime() - Date.now();
  if (ms <= 0) return { label: 'Expire sous peu', tone: '#22C55E' };
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return { label: `Expire dans ${Math.round(ms / 60000)} min`, tone: '#22C55E' };
  if (hours < 3) return { label: `Expire dans ${hours}h`, tone: '#22C55E' };
  return { label: `${hours}h restantes`, tone: 'var(--muted)' };
}

export default function ComptesSuspendus() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  const [editTarget, setEditTarget] = useState(null); // event en cours d'édition
  const [editReason, setEditReason] = useState('');
  const [editUntil, setEditUntil] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    findSuspensionEvents({ status: 'ACTIVE', limit: 100 })
      .then((res) => setRows(res.items))
      .catch((err) => setError(err.message || 'Impossible de charger les suspensions.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleLift(event) {
    setBusyId(event.id);
    setActionError(null);
    try {
      await updateUser(event.studentId, { isSuspended: false });
      setRows((prev) => prev.filter((r) => r.id !== event.id));
    } catch (err) {
      setActionError(err.message || 'Échec de la levée.');
    } finally {
      setBusyId(null);
    }
  }

  function openEdit(event) {
    setEditTarget(event);
    setEditReason(event.reason || '');
    setEditUntil(event.suspendedUntil ? new Date(event.suspendedUntil).toISOString().slice(0, 16) : '');
    setActionError(null);
  }

  async function handleSaveEdit() {
    setBusyId(editTarget.id);
    setActionError(null);
    try {
      await updateUser(editTarget.studentId, {
        isSuspended: true,
        suspensionReason: editReason,
        suspensionUntil: editUntil ? new Date(editUntil).toISOString() : null,
      });
      setEditTarget(null);
      load();
    } catch (err) {
      setActionError(err.message || 'Échec de la modification.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Topbar icon={ShieldAlert} breadcrumb={[{ label: 'Litiges', path: '/admin/litiges' }, { label: 'Comptes suspendus' }]} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Litiges</div>
          <h1>Comptes suspendus</h1>
          <p>Étudiants bloqués pour comportement abusif — {rows.length} actif{rows.length === 1 ? '' : 's'}</p>
        </div>

        {error && <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 16 }}>{error}</p>}
        {actionError && <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 16 }}>{actionError}</p>}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Étudiant</th><th>Campus</th><th>Motif</th>
                  <th>Suspendu le</th><th>Levée prévue</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>Chargement…</td></tr>}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>Aucune suspension active.</td></tr>
                )}
                {!loading && rows.map((r) => {
                  const student = r.student;
                  const fullName = `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim() || '—';
                  const remaining = remainingLabel(r.suspendedUntil);
                  const isBusy = busyId === r.id;
                  return (
                    <tr key={r.id}>
                      <td className="name-cell">
                        <span className="initials init-gray" style={{ width: 28, height: 28, fontSize: 11 }}>{initialsOf(student?.firstName, student?.lastName)}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{fullName}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{student?.phone || '—'}</div>
                        </div>
                      </td>
                      <td>{student?.campus?.name ? <span className="badge-blue">{student.campus.name}</span> : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                      <td style={{ fontSize: 13, color: '#475569' }}>{r.reason}</td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDateTime(r.suspendedAt)}</td>
                      <td style={{ fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: 'var(--indigo)' }}>{r.suspendedUntil ? formatDateTime(r.suspendedUntil) : 'Indéterminée'}</span>
                        <div style={{ fontSize: 11, color: remaining.tone }}>{remaining.label}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-secondary-sm" style={{ padding: '7px 12px', fontSize: 13 }} disabled={isBusy} onClick={() => openEdit(r)}>Modifier</button>
                          <button className="btn-danger-sm" style={{ padding: '7px 12px', fontSize: 13 }} disabled={isBusy} onClick={() => handleLift(r)}>
                            {isBusy ? '…' : 'Lever'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </PageContent>

      {editTarget && (
        <div className="modal-overlay" onClick={() => !busyId && setEditTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={20} color="#64748B" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Modifier la suspension</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                  {`${editTarget.student?.firstName ?? ''} ${editTarget.student?.lastName ?? ''}`.trim()}
                </div>
              </div>
            </div>
            <div className="field-group" style={{ marginBottom: 14 }}>
              <label className="fg-label">Motif</label>
              <textarea className="fg-input" rows={2} value={editReason} onChange={(e) => setEditReason(e.target.value)} />
            </div>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label className="fg-label">Levée prévue (laisser vide pour une durée indéterminée)</label>
              <input className="fg-input" type="datetime-local" value={editUntil} onChange={(e) => setEditUntil(e.target.value)} />
            </div>
            {actionError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{actionError}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary-sm" disabled={!!busyId} onClick={() => setEditTarget(null)}>Annuler</button>
              <button className="btn-primary-sm" disabled={!editReason || !!busyId} onClick={handleSaveEdit}>
                {busyId ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
