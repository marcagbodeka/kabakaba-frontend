import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Utensils, Plus, Pencil, X, Clock, Building2, Trash2 } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getVendorForAdmin, updateVendor, getVendorSchedules, createVendorSchedule, deleteVendorSchedule } from '../../../services/domain/vendorsService';
import { getMenuItemsByVendor } from '../../../services/domain/catalogService';
import { findAllCampuses } from '../../../services/domain/campusesService';

const DAY_LABEL = { MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mer', THURSDAY: 'Jeu', FRIDAY: 'Ven', SATURDAY: 'Sam', SUNDAY: 'Dim' };
const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function initialsOf(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function CantineFiche() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState('infos');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [canteenName, setCanteenName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [motif, setMotif] = useState('');
  const [suspending, setSuspending] = useState(false);
  const [suspendError, setSuspendError] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [newDay, setNewDay] = useState('MONDAY');
  const [newStart, setNewStart] = useState('07:30');
  const [newEnd, setNewEnd] = useState('15:00');
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  const [menuItems, setMenuItems] = useState([]);

  const [allCampuses, setAllCampuses] = useState([]);
  const [campusToAdd, setCampusToAdd] = useState('');
  const [campusBusy, setCampusBusy] = useState(false);
  const [campusError, setCampusError] = useState(null);

  function loadVendor() {
    return getVendorForAdmin(id).then((v) => {
      setVendor(v);
      setCanteenName(v.canteenName);
    });
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      loadVendor(),
      getVendorSchedules(id).then(setSchedules),
      getMenuItemsByVendor(id).then((res) => setMenuItems(res.data)),
      findAllCampuses().then(setAllCampuses),
    ])
      .catch((err) => setError(err.message || 'Impossible de charger cette cantine.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const menuTypeCount = useMemo(() => new Set(menuItems.map((m) => m.type)).size, [menuItems]);
  const availableCampusesToAdd = useMemo(() => {
    const affiliatedIds = new Set((vendor?.campuses ?? []).map((c) => c.id));
    return allCampuses.filter((c) => !affiliatedIds.has(c.id));
  }, [allCampuses, vendor]);
  const sortedSchedules = useMemo(
    () => [...schedules].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)),
    [schedules],
  );

  async function handleSaveName() {
    setSavingName(true);
    setNameError(null);
    try {
      const updated = await updateVendor(id, { canteenName });
      setVendor((v) => ({ ...v, canteenName: updated.canteenName }));
    } catch (err) {
      setNameError(err.message || "Échec de l'enregistrement.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleConfirmSuspend() {
    setSuspending(true);
    setSuspendError(null);
    try {
      await updateVendor(id, { isActive: false, suspensionReason: motif });
      await loadVendor();
      setModalOpen(false);
      setMotif('');
    } catch (err) {
      setSuspendError(err.message || 'Échec de la suspension.');
    } finally {
      setSuspending(false);
    }
  }

  async function handleReactivate() {
    setSuspending(true);
    try {
      await updateVendor(id, { isActive: true });
      await loadVendor();
    } catch (err) {
      setSuspendError(err.message || 'Échec de la réactivation.');
    } finally {
      setSuspending(false);
    }
  }

  async function handleAddSchedule() {
    setScheduleBusy(true);
    setScheduleError(null);
    try {
      const created = await createVendorSchedule(id, { day: newDay, startTime: newStart, endTime: newEnd });
      setSchedules((prev) => [...prev, created]);
    } catch (err) {
      setScheduleError(err.message || "Échec de l'ajout.");
    } finally {
      setScheduleBusy(false);
    }
  }

  async function handleDeleteSchedule(scheduleId) {
    setScheduleBusy(true);
    setScheduleError(null);
    try {
      await deleteVendorSchedule(id, scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (err) {
      setScheduleError(err.message || 'Échec de la suppression.');
    } finally {
      setScheduleBusy(false);
    }
  }

  async function handleAddCampus() {
    if (!campusToAdd) return;
    setCampusBusy(true);
    setCampusError(null);
    try {
      const nextIds = [...(vendor.campuses ?? []).map((c) => c.id), campusToAdd];
      const updated = await updateVendor(id, { campusIds: nextIds });
      await loadVendor();
      setCampusToAdd('');
    } catch (err) {
      setCampusError(err.message || "Échec de l'affiliation.");
    } finally {
      setCampusBusy(false);
    }
  }

  async function handleRemoveCampus(campusId) {
    const currentIds = (vendor.campuses ?? []).map((c) => c.id);
    if (currentIds.length <= 1) {
      setCampusError('Une cantine doit rester affiliée à au moins un campus.');
      return;
    }
    setCampusBusy(true);
    setCampusError(null);
    try {
      await updateVendor(id, { campusIds: currentIds.filter((cId) => cId !== campusId) });
      await loadVendor();
    } catch (err) {
      setCampusError(err.message || 'Échec du retrait.');
    } finally {
      setCampusBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <Topbar icon={Utensils} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (error || !vendor) {
    return (
      <>
        <Topbar icon={Utensils} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error || 'Cantine introuvable.'}</p></PageContent>
      </>
    );
  }

  const ownerName = [vendor.user?.firstName, vendor.user?.lastName].filter(Boolean).join(' ') || '—';
  const campusesLabel = vendor.campuses.map((c) => c.name).join(', ') || '—';

  return (
    <>
      <Topbar
        icon={Utensils}
        breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }, { label: vendor.canteenName }]}
        badge={{ text: `${vendor.isActive ? 'Actif' : 'Suspendu'} · ${vendor.isOpen ? 'Ouverte' : 'Fermée'}` }}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/cantines')}>← Retour à la liste</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <span className="initials init-indigo" style={{ width: 56, height: 56, borderRadius: 14, fontSize: 18 }}>{initialsOf(vendor.canteenName)}</span>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>{vendor.canteenName}</h1>
            <p style={{ fontSize: 15, color: 'var(--muted)' }}>Campus {campusesLabel} · Vendeur : {ownerName} · Créée le {formatDate(vendor.createdAt)}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {vendor.isActive ? (
              <button className="btn-secondary-sm" onClick={() => setModalOpen(true)}>Suspendre le compte</button>
            ) : (
              <button className="btn-secondary-sm" disabled={suspending} onClick={handleReactivate}>{suspending ? 'Réactivation…' : 'Réactiver le compte'}</button>
            )}
            <button className="btn-primary-sm" disabled={savingName || canteenName === vendor.canteenName} onClick={handleSaveName}>
              {savingName ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
        {nameError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{nameError}</p>}

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'infos' ? 'active' : ''}`} onClick={() => setTab('infos')}>Infos & accès</button>
          <button className={`tab-btn ${tab === 'catalogue' ? 'active' : ''}`} onClick={() => setTab('catalogue')}>Catalogue & menus</button>
          <button className={`tab-btn ${tab === 'campus' ? 'active' : ''}`} onClick={() => setTab('campus')}>Campus couverts</button>
        </div>

        {tab === 'infos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="form-grid">
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="fg-label">Nom de la cantine</label>
                  <input className="fg-input" value={canteenName} onChange={(e) => setCanteenName(e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="fg-label">Nom du vendeur</label>
                  <input className="fg-input" value={ownerName} disabled style={{ background: '#F8FAFC', color: 'var(--muted)' }} />
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Non modifiable depuis ce tableau de bord (protection du compte).</div>
                </div>
                <div className="field-group">
                  <label className="fg-label">Téléphone de contact</label>
                  <input className="fg-input" value={vendor.user?.phone || '—'} disabled style={{ background: '#F8FAFC', color: 'var(--muted)' }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--indigo)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                <Clock size={15} /> Horaires typiques d&apos;ouverture
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                Indicatif — l&apos;ouverture réelle reste gérée par le vendeur depuis l&apos;application mobile.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedSchedules.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Aucune plage horaire renseignée.</div>
                )}
                {sortedSchedules.map((s) => (
                  <div className="horaire-row" key={s.id}>
                    <div style={{ width: 44, fontWeight: 600, fontSize: 13 }}>{DAY_LABEL[s.day]}</div>
                    <div className="horaire-times">
                      <span style={{ fontSize: 13 }}>{s.startTime}</span>
                      <span style={{ color: 'var(--muted)' }}>→</span>
                      <span style={{ fontSize: 13 }}>{s.endTime}</span>
                    </div>
                    <button className="icon-btn" disabled={scheduleBusy} style={{ color: '#EF4444', borderColor: '#FEE2E2' }} title="Supprimer" onClick={() => handleDeleteSchedule(s.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                <select className="filter-select" value={newDay} onChange={(e) => setNewDay(e.target.value)}>
                  {DAY_ORDER.map((d) => <option key={d} value={d}>{DAY_LABEL[d]}</option>)}
                </select>
                <input className="fg-input" type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} style={{ width: 110, height: 36 }} />
                <span style={{ color: 'var(--muted)' }}>→</span>
                <input className="fg-input" type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} style={{ width: 110, height: 36 }} />
                <button className="btn-secondary-sm" disabled={scheduleBusy} onClick={handleAddSchedule}><Plus size={13} /> Ajouter une plage</button>
              </div>
              {scheduleError && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8 }}>{scheduleError}</p>}
            </div>

            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--indigo)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Accès vendeur
              </div>
              <div className="form-grid">
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="fg-label">Email de connexion</label>
                  <input className="fg-input" value={vendor.user?.email || '—'} disabled style={{ background: '#F8FAFC', color: 'var(--muted)' }} />
                </div>
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="fg-label">Mot de passe</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="fg-input" type="password" value="••••••••••" disabled style={{ flex: 1, background: '#F8FAFC' }} />
                    <button className="btn-secondary-sm" disabled title="Pas encore disponible : aucun mécanisme de réinitialisation de mot de passe vendeur n'existe côté backend">Réinitialiser</button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    La réinitialisation du mot de passe vendeur n&apos;est pas encore disponible.
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Statut du compte</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span className={vendor.isActive ? 'badge-green' : 'badge-gray'}>{vendor.isActive ? 'Actif' : 'Suspendu'}</span>
                    {vendor.isActive ? (
                      <button className="btn-secondary-sm" style={{ fontSize: 13 }} onClick={() => setModalOpen(true)}>Suspendre</button>
                    ) : (
                      <button className="btn-secondary-sm" style={{ fontSize: 13 }} disabled={suspending} onClick={handleReactivate}>Réactiver</button>
                    )}
                  </div>
                  {!vendor.isActive && vendor.suspensionReason && (
                    <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 8 }}>Motif : {vendor.suspensionReason}</div>
                  )}
                </div>
                <div style={{ padding: '14px 16px', background: vendor.debtFcfa > 0 ? '#FFF7ED' : '#F8FAFC', borderRadius: 10, border: vendor.debtFcfa > 0 ? '1px solid #FED7AA' : '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: vendor.debtFcfa > 0 ? '#92400E' : 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Créance active</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: vendor.debtFcfa > 0 ? '#DC2626' : 'var(--muted)' }}>{formatFcfa(vendor.debtFcfa)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'catalogue' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 18px', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Articles disponibles</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{menuItems.length} article{menuItems.length === 1 ? '' : 's'} configuré{menuItems.length === 1 ? '' : 's'} · {menuTypeCount} type{menuTypeCount === 1 ? '' : 's'}</div>
              </div>
              <button className="btn-primary-sm" onClick={() => navigate(`/admin/cantines/${id}/articles/nouveau`)}><Plus size={14} /> Ajouter un article</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {menuItems.length === 0 && (
                <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0' }}>Aucun article configuré pour le moment.</div>
              )}
              {menuItems.map((a) => (
                <div className="article-card" key={a.id} style={a.isAvailable ? undefined : { opacity: 0.65 }}>
                  <div className="article-left">
                    <div className="article-img-placeholder">
                      <Utensils size={20} color="#94A3B8" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{a.name}</span>
                        <span className={a.type === 'FIXED' ? 'badge-blue' : 'badge-peach'} style={{ fontSize: 11 }}>{a.type === 'FIXED' ? 'Fixe' : 'Personnalisable'}</span>
                      </div>
                      {a.description && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{a.description}</div>}
                    </div>
                  </div>
                  <div className="article-right">
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--indigo)' }}>{a.type === 'CUSTOMIZABLE' ? 'dès ' : ''}{a.priceTickets} tickets</span>
                    <span className={a.isAvailable ? 'badge-green' : 'badge-gray'}>{a.isAvailable ? 'Disponible' : 'Indisponible'}</span>
                    <button className="icon-btn" title="Modifier" onClick={() => navigate(`/admin/cantines/${id}/articles/${a.id}`)}><Pencil size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'campus' && (
          <div className="card">
            <div className="card-title">Campus affiliés</div>
            <div className="card-sub">Cette cantine est visible par les étudiants des campus suivants</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vendor.campuses.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="initials init-indigo" style={{ width: 36, height: 36, borderRadius: 10, fontSize: 12 }}>{initialsOf(c.name)}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{[c.institution, c.city].filter(Boolean).join(' — ')}</div>
                    </div>
                  </div>
                  <button className="icon-btn" disabled={campusBusy} style={{ color: '#EF4444', borderColor: '#FEE2E2' }} title="Retirer ce campus" onClick={() => handleRemoveCampus(c.id)}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              <select className="filter-select" value={campusToAdd} onChange={(e) => setCampusToAdd(e.target.value)}>
                <option value="">Choisir un campus…</option>
                {availableCampusesToAdd.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button className="btn-secondary-sm" disabled={!campusToAdd || campusBusy} onClick={handleAddCampus}>
                <Building2 size={14} /> Affilier un campus supplémentaire
              </button>
            </div>
            {campusError && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8 }}>{campusError}</p>}
          </div>
        )}
      </PageContent>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => !suspending && setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={20} color="#DC2626" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Suspendre le compte vendeur</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{vendor.canteenName}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
              Le compte sera désactivé immédiatement. Les étudiants ne pourront plus passer commande. Les
              commandes en cours ne sont pas annulées automatiquement.
            </p>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label className="fg-label">Motif de la suspension (obligatoire)</label>
              <textarea
                className="fg-input"
                rows={3}
                placeholder="Ex : non-respect des délais de livraison..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
              />
            </div>
            {suspendError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{suspendError}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary-sm" disabled={suspending} onClick={() => setModalOpen(false)}>Annuler</button>
              <button className="btn-danger-sm" disabled={!motif || suspending} onClick={handleConfirmSuspend}>
                {suspending ? 'Suspension…' : 'Confirmer la suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
