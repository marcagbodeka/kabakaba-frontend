import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV = [
  { label: 'Comment ça marche', href: '#comment-ca-marche' },
  { label: 'Pourquoi kabakaba', href: '#pourquoi' },
  { label: 'Ambassadeur', href: '#ambassadeur' },
  { label: 'Devenir vendeur', href: '#partenaire' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#top" className="site-logo">
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
