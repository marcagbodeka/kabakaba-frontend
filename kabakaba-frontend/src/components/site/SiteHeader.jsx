import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { handleAnchorClick } from '../../utils/scrollTo';

// Ordre conforme à celui des sections dans la page (Home.jsx) :
// Pourquoi kabakaba → Devenir vendeur → Nos technologies → Ambassadeur → Nos campus.
const NAV = [
  { label: 'Pourquoi kabakaba', id: 'pourquoi' },
  { label: 'Devenir vendeur', id: 'partenaire' },
  { label: 'Nos technologies', id: 'technologies' },
  { label: 'Ambassadeur', id: 'ambassadeur' },
  { label: 'Nos campus', id: 'campus' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#top" className="site-logo" onClick={handleAnchorClick('top')}>
          <img
            src="/site/logo-64.webp"
            width="32"
            height="32"
            alt="kabakaba"
            className="site-logo-mark"
          />
          <span className="site-wordmark">
            kaba<span>kaba</span>
          </span>
        </a>

        <nav className="site-nav site-nav-desktop">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={handleAnchorClick(item.id)}>{item.label}</a>
          ))}
        </nav>

        <div className="site-header-actions">
          <a href="#telecharger" className="site-btn-primary" onClick={handleAnchorClick('telecharger')}>Télécharger l&apos;app</a>
        </div>

        <button className="site-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="site-nav-mobile">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => { handleAnchorClick(item.id)(e); setOpen(false); }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
