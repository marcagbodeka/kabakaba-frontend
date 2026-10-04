import { useEffect, useState } from 'react';
import { Building2, Plus, Pencil, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { findAllCampuses, createCampus, updateCampus } from '../../../services/domain/campusesService';
import { getFaculties, createFaculty, updateFaculty } from '../../../services/domain/facultiesService';
import { getVendorsForAdmin } from '../../../services/domain/vendorsService';

const INIT_CLASSES = ['init-indigo', 'init-gray', 'init-orange'];
const CANTEEN_TONES = ['badge-blue', 'badge-gray', 'badge-peach'];

export default function CampusFacultes() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campuses, setCampuses] = useState([]); // enrichi : { ...campus, faculties, canteens }

  const [addingTo, setAddingTo] = useState(null);
  const [newFaculty, setNewFaculty] = useState('');
  const [busyFacultyId, setBusyFacultyId] = useState(null);

  const [campusModal, setCampusModal] = useState(null); // null | 'new' | campus à éditer
  const [form, setForm] = useState({ name: '', city: '', institution: '' });
  const [savingCampus, setSavingCampus] = useState(false);
  const [campusError, setCampusError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    findAllCampuses()
      .then(async (list) => {
        const enriched = await Promise.all(
          list.map(async (c) => {
            const [faculties, vendorsRes] = await Promise.all([
              getFaculties(c.id),
              getVendorsForAdmin(1, 50, { campusId: c.id }),
            ]);
            return { ...c, faculties, canteens: vendorsRes.data };
          }),
        );
        setCampuses(enriched);
      })
      .catch((err) => setError(err.message || 'Impossible de charger les campus.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function toggleFaculty(campusId, faculty) {
    setBusyFacultyId(faculty.id);
    try {
      const updated = await updateFaculty(campusId, faculty.id, { active: !faculty.active });
      setCampuses((prev) => prev.map((c) => (
        c.id !== campusId ? c : { ...c, faculties: c.faculties.map((f) => (f.id === faculty.id ? updated : f)) }
      )));
    } catch (err) {
      setError(err.message || 'Échec de la mise à jour.');
    } finally {
      setBusyFacultyId(null);
    }
  }

  async function addFaculty(campusId) {
    if (!newFaculty.trim()) return;
    try {
      const created = await createFaculty(campusId, newFaculty.trim());
      setCampuses((prev) => prev.map((c) => (c.id !== campusId ? c : { ...c, faculties: [...c.faculties, created] })));
      setNewFaculty('');
      setAddingTo(null);
    } catch (err) {
      setError(err.message || "Échec de l'ajout.");
    }
  }

  function openNewCampus() {
    setForm({ name: '', city: '', institution: '' });
    setCampusError(null);
    setCampusModal('new');
  }
  function openEditCampus(c) {
    setForm({ name: c.name, city: c.city, institution: c.institution });
    setCampusError(null);
    setCampusModal(c);
  }

  async function handleSaveCampus() {
    setSavingCampus(true);
    setCampusError(null);
    try {
      if (campusModal === 'new') {
        await createCampus(form);
      } else {
        await updateCampus(campusModal.id, form);
      }
      setCampusModal(null);
      load();
    } catch (err) {
      setCampusError(err.message || "Échec de l'enregistrement.");
    } finally {
      setSavingCampus(false);
    }
  }

  const totalFaculties = campuses.reduce((n, c) => n + c.faculties.length, 0);

  if (loading) {
    return (
      <>
        <Topbar icon={Building2} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }, { label: 'Campus & facultés' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  return (
    <>
      <Topbar icon={Building2} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }, { label: 'Campus & facultés' }]}>
        <button className="btn-primary-sm" onClick={openNewCampus}><Plus size={14} /> Ajouter un campus</button>
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Cantines</div>
          <h1>Campus & facultés</h1>
          <p>{campuses.length} université{campuses.length === 1 ? '' : 's'} couverte{campuses.length === 1 ? '' : 's'} · {totalFaculties} faculté{totalFaculties === 1 ? '' : 's'} configurée{totalFaculties === 1 ? '' : 's'}</p>
        </div>

        {error && <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 16 }}>{error}</p>}

        {campuses.map((c, ci) => (
          <div className="campus-block" key={c.id}>
            <div className="campus-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className={`initials ${INIT_CLASSES[ci % INIT_CLASSES.length]}`} style={{ width: 44, height: 44, borderRadius: 12, fontSize: 14 }}>
                  {c.name.slice(0, 4).toUpperCase()}
                </span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.institution} · {c.city}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="badge-green">Actif</span>
                <button className="icon-btn" title="Modifier le campus" onClick={() => openEditCampus(c)}><Pencil size={15} /></button>
              </div>
            </div>

            <div style={{ padding: '0 22px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Facultés & instituts
                </div>
                <button className="btn-secondary-sm" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setAddingTo(addingTo === c.id ? null : c.id)}>
                  <Plus size={12} /> Ajouter
                </button>
              </div>

              {addingTo === c.id && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    className="fg-input"
                    style={{ flex: 1 }}
                    placeholder="Ex : Faculté de Pharmacie"
                    value={newFaculty}
                    onChange={(e) => setNewFaculty(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFaculty(c.id)}
                    autoFocus
                  />
                  <button className="btn-primary-sm" onClick={() => addFaculty(c.id)}><Check size={14} /></button>
                </div>
              )}

              <div className="faculty-grid">
                {c.faculties.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Aucune faculté configurée.</div>}
                {c.faculties.map((f) => (
                  <div className={`faculty-pill ${f.active ? 'active' : 'inactive'}`} key={f.id} style={busyFacultyId === f.id ? { opacity: 0.5 } : undefined}>
                    <span>{f.name}</span>
                    <button
                      className="faculty-del"
                      style={!f.active ? { color: '#22C55E' } : undefined}
                      title={f.active ? 'Désactiver' : 'Réactiver'}
                      disabled={busyFacultyId === f.id}
                      onClick={() => toggleFaculty(c.id, f)}
                    >
                      {f.active ? <X size={12} /> : <Check size={12} />}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                Les facultés désactivées n&apos;apparaissent plus dans la liste proposée aux étudiants lors de la demande ambassadeur.
              </div>
            </div>

            <div style={{ padding: '16px 22px 20px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                Cantines affiliées
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {c.canteens.length === 0 && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Aucune cantine affiliée.</span>}
                {c.canteens.map((v, vi) => (
                  <span className={CANTEEN_TONES[vi % CANTEEN_TONES.length]} style={{ cursor: 'pointer' }} key={v.id} onClick={() => navigate(`/admin/cantines/${v.id}`)}>
                    {v.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </PageContent>

      {campusModal && (
        <div className="modal-overlay" onClick={() => !savingCampus && setCampusModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
              {campusModal === 'new' ? 'Ajouter un campus' : 'Modifier le campus'}
            </div>
            <div className="field-group" style={{ marginBottom: 12 }}>
              <label className="fg-label">Nom du campus</label>
              <input className="fg-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex : UCAO" />
            </div>
            <div className="field-group" style={{ marginBottom: 12 }}>
              <label className="fg-label">Institution</label>
              <input className="fg-input" value={form.institution} onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))} placeholder="Ex : Université Catholique de l'Afrique de l'Ouest" />
            </div>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label className="fg-label">Ville</label>
              <input className="fg-input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Ex : Lomé" />
            </div>
            {campusError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{campusError}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary-sm" disabled={savingCampus} onClick={() => setCampusModal(null)}>Annuler</button>
              <button className="btn-primary-sm" disabled={!form.name || !form.city || !form.institution || savingCampus} onClick={handleSaveCampus}>
                {savingCampus ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
