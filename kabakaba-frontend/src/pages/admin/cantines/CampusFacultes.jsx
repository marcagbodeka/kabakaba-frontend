import { useState } from 'react';
import { Building2, Plus, Pencil, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const initialCampuses = [
  {
    code: 'UCAO', init: 'init-indigo', name: 'UCAO', full: "Université Catholique de l'Afrique de l'Ouest · Lomé",
    faculties: [
      { name: 'Faculté de Droit', active: true },
      { name: 'Faculté des Sciences', active: true },
      { name: 'Faculté de Théologie', active: true },
      { name: 'Institut de Technologie', active: true },
      { name: 'École de Commerce', active: false },
    ],
    canteens: ['Cantine Centrale', 'Snack Resto', 'Snack du Campus'],
    canteenTone: 'badge-blue',
  },
  {
    code: 'UL', init: 'init-gray', name: 'UL', full: 'Université de Lomé · Lomé',
    faculties: [
      { name: 'Faculté de Médecine', active: true },
      { name: 'Faculté des Lettres', active: true },
      { name: 'Faculté des Sciences', active: true },
    ],
    canteens: ['Bistro UL', 'Kiosque Plus'],
    canteenTone: 'badge-gray',
  },
];

export default function CampusFacultes() {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState(initialCampuses);
  const [addingTo, setAddingTo] = useState(null);
  const [newFaculty, setNewFaculty] = useState('');

  const toggleFaculty = (campusCode, facultyName) => {
    setCampuses((prev) =>
      prev.map((c) =>
        c.code !== campusCode
          ? c
          : { ...c, faculties: c.faculties.map((f) => (f.name === facultyName ? { ...f, active: !f.active } : f)) }
      )
    );
  };

  const addFaculty = (campusCode) => {
    if (!newFaculty.trim()) return;
    setCampuses((prev) =>
      prev.map((c) =>
        c.code !== campusCode ? c : { ...c, faculties: [...c.faculties, { name: newFaculty.trim(), active: true }] }
      )
    );
    setNewFaculty('');
    setAddingTo(null);
  };

  return (
    <>
      <Topbar icon={Building2} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }, { label: 'Campus & facultés' }]}>
        <button className="btn-primary-sm"><Plus size={14} /> Ajouter un campus</button>
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Cantines</div>
          <h1>Campus & facultés</h1>
          <p>{campuses.length} universités couvertes · {campuses.reduce((n, c) => n + c.faculties.length, 0)} facultés configurées</p>
        </div>

        {campuses.map((c) => (
          <div className="campus-block" key={c.code}>
            <div className="campus-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className={`initials ${c.init}`} style={{ width: 44, height: 44, borderRadius: 12, fontSize: 14 }}>{c.code}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.full}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="badge-green">Actif</span>
                <button className="icon-btn" title="Modifier le campus"><Pencil size={15} /></button>
              </div>
            </div>

            <div style={{ padding: '0 22px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Facultés & instituts
                </div>
                <button className="btn-secondary-sm" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setAddingTo(addingTo === c.code ? null : c.code)}>
                  <Plus size={12} /> Ajouter
                </button>
              </div>

              {addingTo === c.code && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    className="fg-input"
                    style={{ flex: 1 }}
                    placeholder="Ex : Faculté de Pharmacie"
                    value={newFaculty}
                    onChange={(e) => setNewFaculty(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFaculty(c.code)}
                    autoFocus
                  />
                  <button className="btn-primary-sm" onClick={() => addFaculty(c.code)}><Check size={14} /></button>
                </div>
              )}

              <div className="faculty-grid">
                {c.faculties.map((f) => (
                  <div className={`faculty-pill ${f.active ? 'active' : 'inactive'}`} key={f.name}>
                    <span>{f.name}</span>
                    <button
                      className="faculty-del"
                      style={!f.active ? { color: '#22C55E' } : undefined}
                      title={f.active ? 'Désactiver' : 'Réactiver'}
                      onClick={() => toggleFaculty(c.code, f.name)}
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
                {c.canteens.map((name) => (
                  <span className={c.canteenTone} style={{ cursor: 'pointer' }} key={name} onClick={() => navigate('/admin/cantines/1')}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </PageContent>
    </>
  );
}