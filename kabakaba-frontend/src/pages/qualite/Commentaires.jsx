import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

const comments = [
  { vendor: 'Cantine Centrale UCAO', initials: 'FT', date: '13 juil. 2026', note: 5, text: "Service rapide, plat bien chaud et copieux. Rien à redire." },
  { vendor: 'Snack du Campus', initials: 'AK', date: '13 juil. 2026', note: 3, text: "Correct mais l'attente était un peu longue ce midi-là." },
  { vendor: 'Cantine du Lac', initials: 'MN', date: '12 juil. 2026', note: 2, text: "Commande arrivée froide, et il manquait la sauce demandée." },
  { vendor: 'Resto U Lomé 1', initials: 'JD', date: '12 juil. 2026', note: 4, text: "Bon rapport qualité-prix, je recommande le menu riz-sauce." },
  { vendor: 'Cantine du Lac', initials: 'PS', date: '11 juil. 2026', note: 1, text: "Deuxième fois que la commande met plus de 30 min à être prête." },
];

const filters = ['Toutes', '5★', '4★', '3★', '2★', '1★'];

export default function Commentaires() {
  const [active, setActive] = useState('Toutes');

  const filtered =
    active === 'Toutes' ? comments : comments.filter((c) => `${c.note}★` === active);

  return (
    <>
      <Topbar
        icon={MessageSquare}
        breadcrumb={[{ label: 'Avis & qualité', path: '/supervision/qualite/notes' }, { label: 'Commentaires' }]}
      />
      <PageContent>
        <div className="page-header">
          <h1>Commentaires</h1>
          <p>Avis post-commande par cantine — visibles uniquement en interne (rôle Supervision)</p>
        </div>

        <div className="filter-pills">
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-pill ${active === f ? 'active' : ''}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="card">
          {filtered.length === 0 && (
            <div className="card-sub">Aucun commentaire pour ce filtre.</div>
          )}
          {filtered.map((c, i) => (
            <div className="comment-card" key={i}>
              <div className="comment-head">
                <span className="initials init-orange">{c.initials}</span>
                <div className="comment-meta">
                  <div className="comment-vendor">{c.vendor}</div>
                  <div className="comment-date">{c.date}</div>
                </div>
                <div className="comment-stars">{'★'.repeat(c.note)}{'☆'.repeat(5 - c.note)}</div>
              </div>
              <div className="comment-text">{c.text}</div>
            </div>
          ))}
        </div>
      </PageContent>
    </>
  );
}