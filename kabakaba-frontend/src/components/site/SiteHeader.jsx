import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV = [
  { label: 'Comment ça marche', href: '#comment-ca-marche' },
  { label: 'Pourquoi kabakaba', href: '#pourquoi' },
  { label: 'Devenir partenaire', href: '#partenaire' },
  { label: 'Ambassadeurs', href: '#ambassadeur' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#top" className="site-logo">
          kaba<span>kaba</span>
        </a>

        <nav className="site-nav site-nav-desktop">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="site-header-actions">
          <a href="#telecharger" className="site-btn-primary">Télécharger l&apos;app</a>
        </div>

        <button className="site-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="site-nav-mobile">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
