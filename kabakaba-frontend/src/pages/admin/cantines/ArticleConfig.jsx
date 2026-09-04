import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Utensils, Plus, Trash2, ImageIcon } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getVendorForAdmin } from '../../../services/domain/vendorsService';
import {
  getMenuItem, getMenuComponents, getPackagingOptions,
  createMenuItem, updateMenuItem,
  createMenuComponent, updateMenuComponent, deleteMenuComponent,
  createPackagingOption, updatePackagingOption, deletePackagingOption,
} from '../../../services/domain/catalogService';

let tempId = 0;
const newTempId = () => `new-${tempId++}`;

// Conditionnements courants proposés par défaut à la création. En édition,
// les PackagingOption réelles de l'article sont chargées et rapprochées de
// ces 3 noms ; toute option existante au nom différent est affichée en plus,
// avec un bouton Retirer explicite plutôt qu'une case à décocher, pour ne
// jamais supprimer une donnée réelle par accident.
const PRESET_PACKAGING = [
  { name: 'Sur place', desc: "L'étudiant mange sur place" },
  { name: 'À emporter — Sachet', desc: 'Emballage sachet simple' },
  { name: 'À emporter — Take away', desc: 'Boîte ou contenant hermétique' },
];

export default function ArticleConfig() {
  const navigate = useNavigate();
  const { id, articleId } = useParams();
  const isEdit = !!articleId;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [vendor, setVendor] = useState(null);

  const [type, setType] = useState('FIXED');
  const [nom, setNom] = useState('');
  const [desc, setDesc] = useState('');
  const [prixFixe, setPrixFixe] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);

  const [composants, setComposants] = useState([]);
  const [removedComposantIds, setRemovedComposantIds] = useState([]);

  const [presetState, setPresetState] = useState(
    PRESET_PACKAGING.map((p) => ({ ...p, id: null, checked: false, surcout: 0 })),
  );
  const [extraPackaging, setExtraPackaging] = useState([]); // options existantes hors presets
  const [removedPackagingIds, setRemovedPackagingIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    const tasks = [getVendorForAdmin(id).then(setVendor)];

    if (isEdit) {
      tasks.push(
        getMenuItem(articleId).then((item) => {
          setType(item.type);
          setNom(item.name);
          setDesc(item.description || '');
          setPrixFixe(item.priceTickets);
          setIsAvailable(item.isAvailable);
        }),
        getMenuComponents(articleId).then((res) => {
          setComposants(res.data.map((c) => ({
            id: c.id, name: c.name, price: c.unitPriceTickets, min: c.minQty, max: c.maxQty, required: c.minQty >= 1,
          })));
        }),
        getPackagingOptions(articleId).then((res) => {
          const rows = res.data;
          setPresetState(PRESET_PACKAGING.map((p) => {
            const match = rows.find((r) => r.name === p.name);
            return match ? { ...p, id: match.id, checked: true, surcout: match.extraCost } : { ...p, id: null, checked: false, surcout: 0 };
          }));
          setExtraPackaging(rows.filter((r) => !PRESET_PACKAGING.some((p) => p.name === r.name)));
        }),
      );
    } else {
      // Nouvel article : les 3 conditionnements usuels cochés par défaut,
      // comme dans la maquette.
      setPresetState(PRESET_PACKAGING.map((p, i) => ({ ...p, id: null, checked: true, surcout: i === 2 ? 100 : 0 })));
      setComposants([
        { id: newTempId(), name: '', price: 0, min: 1, max: 1, required: true },
      ]);
    }

    Promise.all(tasks)
      .catch((err) => setLoadError(err.message || "Impossible de charger l'article."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, articleId]);

  const prixMinPerso = composants.filter((c) => c.required).reduce((sum, c) => sum + c.price * Math.max(c.min, 1), 0);

  const updateComposant = (cid, field, value) => {
    setComposants((prev) => prev.map((c) => (c.id === cid ? { ...c, [field]: value } : c)));
  };
  const addComposant = () => {
    setComposants((prev) => [...prev, { id: newTempId(), name: '', price: 0, min: 0, max: 1, required: false }]);
  };
  const removeComposant = (cid) => {
    setComposants((prev) => prev.filter((c) => c.id !== cid));
    if (!String(cid).startsWith('new-')) setRemovedComposantIds((prev) => [...prev, cid]);
  };

  const togglePreset = (name) => {
    setPresetState((prev) => prev.map((p) => (p.name === name ? { ...p, checked: !p.checked } : p)));
  };
  const updatePresetSurcout = (name, value) => {
    setPresetState((prev) => prev.map((p) => (p.name === name ? { ...p, surcout: value } : p)));
  };
  const updateExtraPackaging = (pid, field, value) => {
    setExtraPackaging((prev) => prev.map((p) => (p.id === pid ? { ...p, [field]: value } : p)));
  };
  const removeExtraPackaging = (pid) => {
    setExtraPackaging((prev) => prev.filter((p) => p.id !== pid));
    setRemovedPackagingIds((prev) => [...prev, pid]);
  };

  const previewPrice = type === 'FIXED' ? `${prixFixe} tickets` : `dès ${prixMinPerso} tickets`;

  const canSave = nom.trim().length > 0 && (type === 'CUSTOMIZABLE' || prixFixe > 0);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      const itemPayload = {
        name: nom,
        description: desc || undefined,
        type,
        priceTickets: type === 'FIXED' ? prixFixe : 0,
        isAvailable,
      };

      let itemId = articleId;
      if (isEdit) {
        await updateMenuItem(articleId, itemPayload);
      } else {
        const created = await createMenuItem({ ...itemPayload, vendorId: id });
        itemId = created.id;
      }

      if (type === 'CUSTOMIZABLE') {
        for (const cid of removedComposantIds) {
          await deleteMenuComponent(cid);
        }
        for (const c of composants) {
          const payload = {
            itemId,
            name: c.name,
            unitPriceTickets: c.price,
            minQty: c.required ? Math.max(c.min, 1) : c.min,
            maxQty: c.max,
          };
          if (String(c.id).startsWith('new-')) {
            await createMenuComponent(payload);
          } else {
            await updateMenuComponent(c.id, payload);
          }
        }
      }

      for (const pid of removedPackagingIds) {
        await deletePackagingOption(pid);
      }
      for (const p of presetState) {
        if (p.checked && !p.id) {
          await createPackagingOption({ itemId, name: p.name, extraCost: p.surcout, required: false });
        } else if (p.checked && p.id) {
          await updatePackagingOption(p.id, { extraCost: p.surcout });
        } else if (!p.checked && p.id) {
          await deletePackagingOption(p.id);
        }
      }
      for (const p of extraPackaging) {
        await updatePackagingOption(p.id, { extraCost: p.extraCost });
      }

      navigate(`/admin/cantines/${id}`);
    } catch (err) {
      setSaveError(err.message || "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  const canteenBreadcrumb = vendor ? vendor.canteenName : '…';

  if (loading) {
    return (
      <>
        <Topbar icon={Utensils} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Topbar icon={Utensils} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{loadError}</p></PageContent>
      </>
    );
  }

  return (
    <>
      <Topbar
        icon={Utensils}
        breadcrumb={[
          { label: 'Cantines', path: '/admin/cantines' },
          { label: canteenBreadcrumb, path: `/admin/cantines/${id}` },
          { label: isEdit ? 'Modifier un article' : 'Configurer un article' },
        ]}
      >
        <button className="btn-secondary-sm" disabled={saving} onClick={() => navigate(`/admin/cantines/${id}`)}>Annuler</button>
        <button className="btn-primary-sm" disabled={!canSave || saving} onClick={handleSave}>
          {saving ? 'Enregistrement…' : "Enregistrer l'article"}
        </button>
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Cantines</div>
          <h1>{isEdit ? 'Modifier un article' : 'Configurer un article'}</h1>
          <p>{vendor?.canteenName} · {vendor?.campuses?.map((c) => c.name).join(', ')}</p>
        </div>

        {saveError && <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 16 }}>{saveError}</p>}

        <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-title">Type d&apos;article</div>
            <div className="card-sub">Définit si l&apos;étudiant peut personnaliser sa commande ou non.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className={`type-card ${type === 'FIXED' ? 'selected' : ''}`} onClick={() => setType('FIXED')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="decision-radio" style={type === 'FIXED' ? { borderColor: 'var(--indigo)' } : undefined}>
                    {type === 'FIXED' && <div className="decision-radio-dot" />}
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
              <div className={`type-card ${type === 'CUSTOMIZABLE' ? 'selected' : ''}`} onClick={() => setType('CUSTOMIZABLE')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="decision-radio" style={type === 'CUSTOMIZABLE' ? { borderColor: 'var(--indigo)' } : undefined}>
                    {type === 'CUSTOMIZABLE' && <div className="decision-radio-dot" />}
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
                <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 24, textAlign: 'center', cursor: 'not-allowed', opacity: 0.6 }} title="Upload d'image pas encore disponible">
                  <ImageIcon size={28} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Pas encore disponible</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>JPG, PNG · max 2 Mo</div>
                </div>
              </div>
              <div className="field-group">
                <label className="fg-label">Disponibilité</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="dispo" checked={isAvailable} onChange={() => setIsAvailable(true)} style={{ accentColor: 'var(--indigo)', width: 16, height: 16 }} /> Disponible
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="dispo" checked={!isAvailable} onChange={() => setIsAvailable(false)} style={{ accentColor: 'var(--indigo)', width: 16, height: 16 }} /> Indisponible
                  </label>
                </div>
                {type === 'FIXED' && (
                  <div className="field-group" style={{ marginTop: 12 }}>
                    <label className="fg-label">Prix (tickets) <span style={{ color: '#EF4444' }}>*</span></label>
                    <input className="fg-input" type="number" value={prixFixe} onChange={(e) => setPrixFixe(Number(e.target.value) || 0)} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {type === 'CUSTOMIZABLE' && (
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
              {presetState.map((c) => (
                <label key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1.5px solid var(--border)', cursor: 'pointer', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={c.checked} onChange={() => togglePreset(c.name)} style={{ width: 16, height: 16, accentColor: 'var(--indigo)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
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
                        onChange={(e) => updatePresetSurcout(c.name, Number(e.target.value) || 0)}
                      />
                      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--indigo)', fontWeight: 600 }}>t.</span>
                    </div>
                  </div>
                </label>
              ))}
              {extraPackaging.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1.5px solid var(--border)', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>(existant)</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Surcoût :</span>
                    <input
                      className="fg-input"
                      type="number" min={0} step={50}
                      style={{ width: 90, textAlign: 'center', height: 36, fontSize: 13 }}
                      value={p.extraCost}
                      onChange={(e) => updateExtraPackaging(p.id, 'extraCost', Number(e.target.value) || 0)}
                    />
                    <button className="icon-btn" style={{ color: '#EF4444', borderColor: '#FEE2E2' }} title="Retirer" onClick={() => removeExtraPackaging(p.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
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
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{type === 'FIXED' ? 'Menu fixe' : 'Personnalisable'}</span>
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
