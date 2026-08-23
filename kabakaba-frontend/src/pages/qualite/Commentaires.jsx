import { useEffect, useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import DateRangePicker from '../../components/DateRangePicker';
import { findReviews } from '../../services/domain/reviewsService';
import { getReviewsQuality } from '../../services/domain/analyticsService';

const RATING_LABELS = {
  1: 'Pas du tout satisfait',
  2: 'Peut mieux faire',
  3: "Ce n'est pas mal",
  4: 'Satisfait',
  5: 'Excellent',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(firstName, lastName) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

const filters = ['Toutes', '5', '4', '3', '2', '1'];
const sortOptions = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'highest', label: 'Meilleure note' },
  { value: 'lowest', label: 'Note la plus basse' },
];

export default function Commentaires() {
  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
  const [quality, setQuality] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('Toutes');
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReviewsQuality(30, range).then(setQuality).catch(() => {});
  }, [range]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const { items } = await findReviews({
            limit: 50,
            rating: ratingFilter === 'Toutes' ? undefined : Number(ratingFilter),
            search: search || undefined,
            sortBy,
          });
          setReviews(items);
        } catch (err) {
          setError(err.message || 'Impossible de charger les commentaires.');
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(timeout);
  }, [ratingFilter, sortBy, search]);

  const distribution = quality?.distribution ?? [];
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <>
      <Topbar
        icon={MessageSquare}
        breadcrumb={[{ label: 'Avis & qualité', path: '/supervision/qualite/notes' }, { label: 'Commentaires' }]}
        hidePeriodSelect
      >
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Qualité</div>
          <h1>Commentaires</h1>
          <p>Avis post-commande par cantine — visibles uniquement en interne (rôle Supervision)</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Note moyenne</div>
            <div className="kpi-value">{quality?.summary?.avgRating ?? '—'} / 5</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avis collectés</div>
            <div className="kpi-value">{quality?.summary?.totalReviews ?? '—'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Cantines en alerte</div>
            <div className="kpi-value">{quality?.summary?.alertCount ?? '—'}</div>
            <div className="kpi-sub">note moyenne &lt; 3.5</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Répartition des ressentis</div>
          <div className="card-sub">Basée sur les libellés associés à chaque note (1 à 5)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const entry = distribution.find((d) => d.rating === rating);
              const count = entry?.count ?? 0;
              return (
                <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 150, fontSize: 13, color: 'var(--muted)' }}>{RATING_LABELS[rating]}</div>
                  <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxCount) * 100}%`, background: '#1B2A6B', height: '100%', opacity: 0.4 + rating / 10 }} />
                  </div>
                  <div style={{ width: 30, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', margin: '16px 0' }}>
          <div className="filter-pills">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-pill ${ratingFilter === f ? 'active' : ''}`}
                onClick={() => setRatingFilter(f)}
              >
                {f === 'Toutes' ? 'Toutes' : `${f}★`}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              fontSize: 13, fontWeight: 600, color: 'var(--indigo)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '6px 10px', fontFamily: 'inherit', background: 'var(--surface)',
            }}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Rechercher dans les commentaires..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px 8px 30px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', fontSize: 13, fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {error && (
          <div className="notice-banner notice-error">
            {error}
          </div>
        )}

        <div className="card">
          {loading && <div className="card-sub">Chargement...</div>}
          {!loading && reviews.length === 0 && <div className="card-sub">Aucun commentaire pour ce filtre.</div>}
          {!loading && reviews.map((r) => (
            <div className="comment-card" key={r.id}>
              <div className="comment-head">
                <span className="initials init-orange">{initials(r.student?.firstName, r.student?.lastName)}</span>
                <div className="comment-meta">
                  <div className="comment-vendor">{r.vendor?.canteenName ?? '—'}</div>
                  <div className="comment-date">{formatDate(r.createdAt)} · {RATING_LABELS[r.rating]}</div>
                </div>
                <div className="comment-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              </div>
              {r.comment && <div className="comment-text">{r.comment}</div>}
            </div>
          ))}
        </div>
      </PageContent>
    </>
  );
}