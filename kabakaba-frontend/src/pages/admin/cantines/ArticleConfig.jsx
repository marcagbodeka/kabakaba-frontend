import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Utensils, Plus, Trash2, ImageIcon } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

let nextId = 3;

export default function ArticleConfig() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [type, setType] = useState('fixe');
  const [nom, setNom] = useState('Menu midi complet');
  const [desc, setDesc] = useState('Riz · Sauce tomate · Poisson · Salade');
  const [prixFixe, setPrixFixe] = useState(800);
  const [composants, setComposants] = useState([
    { id: 0, name: 'Riz', price: 200, min: 1, max: 1, required: true },
    { id: 1, name: 'Œuf', price: 100, min: 0, max: 3, required: false },
    { id: 2, name: 'Saucisse', price: 100, min: 0, max: 3, required: false },
  ]);
  const [conditionnements, setConditionnements] = useState([
    { key: 'place', label: 'Sur place', desc: "L'étudiant mange sur place", checked: true, surcout: 0 },
    { key: 'sachet', label: 'À emporter — Sachet', desc: 'Emballage sachet simple', checked: true, surcout: 0 },
    { key: 'takeaway', label: 'À emporter — Take away', desc: 'Boîte ou contenant hermétique', checked: true, surcout: 100 },
  ]);

  const prixMinPerso = composants.filter((c) => c.required).reduce((sum, c) => sum + c.price * Math.max(c.min, 1), 0);

  const updateComposant = (id, field, value) => {
    setComposants((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addComposant = () => {
    setComposants((prev) => [...prev, { id: nextId++, name: '', price: 0, min: 0, max: 1, required: false }]);
  };

  const removeComposant = (id) => {
    setComposants((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleConditionnement = (key) => {
    setConditionnements((prev) => prev.map((c) => (c.key === key ? { ...c, checked: !c.checked } : c)));
  };

  const updateSurcout = (key, value) => {
    setConditionnements((prev) => prev.map((c) => (c.key === key ? { ...c, surcout: value } : c)));
  };

  const previewPrice = type === 'fixe' ? `${prixFixe} tickets` : `dès ${prixMinPerso} tickets`;

  return (
    <>
      <Topbar
        icon={Utensils}
        breadcrumb={[
          { label: 'Cantines', path: '/admin/cantines' },
          { label: 'Cantine Centrale', path: '/admin/cantines/1' },
          { label: id ? 'Modifier un article' : 'Configurer un article' },
        ]}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/cantines/1')}>Annuler</button>
        <button className="btn-primary-sm" onClick={() => navigate('/admin/cantines/1')}>Enregistrer l&apos;article</button>
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Cantines</div>
          <h1>{id ? 'Modifier un article' : 'Configurer un article'}</h1>
          <p>Cantine Centrale · UCAO</p>
        </div>

        <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-title">Type d&apos;article</div>
            <div className="card-sub">Définit si l&apos;étudiant peut personnaliser sa commande ou non.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className={`type-card ${type === 'fixe' ? 'selected' : ''}`} onClick={() => setType('fixe')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="decision-radio" style={type === 'fixe' ? { borderColor: 'var(--indigo)' } : undefined}>
                    {type === 'fixe' && <div className="decision-radio-dot" />}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Menu fixe</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Composition définie à l&apos;avance. L&apos;étudiant commande tel quel, sans modification possible.
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--indigo)', fontWeight: 600 }}>
                  Ex : Menu midi complet — Riz + sauce + poisson
                </div>
              </div>
              <div className={`type-card ${type === 'perso' ? 'selected' : ''}`} onClick={() => setType('perso')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="decision-radio" style={type === 'perso' ? { borderColor: 'var(--indigo)' } : undefined}>
                    {type === 'perso' && <div className="decision-radio-dot" />}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Article personnalisable</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  L&apos;étudiant choisit les composants et leurs quantités parmi ceux que vous configurez.
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>
                  Ex : Assiette sur mesure — Riz + œuf(s) + saucisse(s)
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Informations générales</div>
            <div className="form-grid">
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label className="fg-label">Nom de l&apos;article <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Menu midi complet" />
              </div>
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label className="fg-label">Description (affichée à l&apos;étudiant)</label>
                <textarea className="fg-input" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="fg-label">Photo (optionnelle)</label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 24, textAlign: 'center', cursor: 'pointer' }}>
                  <ImageIcon size={28} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Cliquez pour uploader</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>JPG, PNG · max 2 Mo</div>
                </div>
              </div>
              <div className="field-group">
                <label className="fg-label">Disponibilité</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="dispo" defaultChecked style={{ accentColor: 'var(--indigo)', width: 16, height: 16 }} /> Disponible
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="dispo" style={{ accentColor: 'var(--indigo)', width: 16, height: 16 }} /> Indisponible
                  </label>
                </div>
                {type === 'fixe' && (
                  <div className="field-group" style={{ marginTop: 12 }}>
                    <label className="fg-label">Prix (tickets) <span style={{ color: '#EF4444' }}>*</span></label>
                    <input className="fg-input" type="number" value={prixFixe} onChange={(e) => setPrixFixe(Number(e.target.value) || 0)} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {type === 'perso' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div className="card-title" style={{ marginBottom: 2 }}>Composants</div>
                  <div className="card-sub" style={{ marginBottom: 0 }}>
                    Chaque composant a un nom, un prix unitaire et des quantités min/max que l&apos;étudiant peut choisir.
                  </div>
                </div>
                <button className="btn-secondary-sm" onClick={addComposant}><Plus size={13} /> Ajouter un composant</button>
              </div>

              <div className="comp-grid comp-header">
                <div>Composant <span style={{ color: '#EF4444' }}>*</span></div>
                <div style={{ textAlign: 'center' }}>Prix unitaire (tickets) <span style={{ color: '#EF4444' }}>*</span></div>
                <div style={{ textAlign: 'center' }}>Qté min</div>
                <div style={{ textAlign: 'center' }}>Qté max</div>
                <div style={{ textAlign: 'center' }}>Obligatoire</div>
                <div />
              </div>

              {composants.map((c) => (
                <div className="comp-row" key={c.id}>
                  <input className="fg-input comp-input" placeholder="Ex : Riz" value={c.name} onChange={(e) => updateComposant(c.id, 'name', e.target.value)} />
                  <div style={{ position: 'relative' }}>
                    <input
                      className="fg-input comp-input"
                      type="number" min={0} step={50}
                      style={{ textAlign: 'center', paddingRight: 36 }}
                      value={c.price}
                      onChange={(e) => updateComposant(c.id, 'price', Number(e.target.value) || 0)}
                    />
                    <span className="comp-unit">t.</span>
                  </div>
                  <input className="fg-input comp-input" type="number" min={0} max={10} style={{ textAlign: 'center' }} value={c.min} onChange={(e) => updateComposant(c.id, 'min', Number(e.target.value) || 0)} />
                  <input className="fg-input comp-input" type="number" min={0} max={10} style={{ textAlign: 'center' }} value={c.max} onChange={(e) => updateComposant(c.id, 'max', Number(e.target.value) || 0)} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input type="checkbox" checked={c.required} onChange={(e) => updateComposant(c.id, 'required', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--indigo)' }} />
                  </div>
                  <button className="icon-btn" style={{ color: '#EF4444', borderColor: '#FEE2E2' }} onClick={() => removeComposant(c.id)} title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--peach)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--indigo)', fontWeight: 600 }}>Prix minimum (composants obligatoires)</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>L&apos;étudiant verra &quot;à partir de X tickets&quot;</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--indigo)' }}>{prixMinPerso} tickets</div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title">Options de conditionnement</div>
            <div className="card-sub">Sélectionnez les modes de retrait disponibles pour cet article et leur surcoût éventuel.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {conditionnements.map((c) => (
                <label key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1.5px solid var(--border)', cursor: 'pointer', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={c.checked} onChange={() => toggleConditionnement(c.key)} style={{ width: 16, height: 16, accentColor: 'var(--indigo)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Surcoût :</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="fg-input"
                        type="number" min={0} step={50}
                        style={{ width: 90, textAlign: 'center', height: 36, paddingRight: 28, fontSize: 13 }}
                        value={c.surcout}
                        onChange={(e) => updateSurcout(c.key, Number(e.target.value) || 0)}
                      />
                      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--indigo)', fontWeight: 600 }}>t.</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'var(--indigo-dark)', borderColor: 'transparent' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>
              Aperçu dans l&apos;application étudiant
            </div>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(255,255,255,.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={22} color="rgba(255,255,255,.4)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{nom || 'Nom de l’article'}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>{desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange)' }}>{previewPrice}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{type === 'fixe' ? 'Menu fixe' : 'Personnalisable'}</span>
                </div>
              </div>
              <button style={{ padding: '10px 16px', background: 'var(--orange)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Commander
              </button>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
