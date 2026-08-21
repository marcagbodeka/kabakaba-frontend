import { Mail, Phone, MapPin } from 'lucide-react';
import StoreBadges from './StoreBadges';

const CAMPUSES = [
  { code: 'UCAO', name: 'UCAO-UUT, Lomé', gradient: 'linear-gradient(135deg,#3A4CA8,#232F72)' },
  { code: 'UL', name: 'Université de Lomé', gradient: 'linear-gradient(135deg,var(--orange),var(--orange-dark))' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#top" className="site-logo logo-dark">
              <img src="/site/logo-64.webp" width="32" height="32" alt="kabakaba" className="site-logo-mark" loading="lazy" />
              <span className="site-wordmark">
                kaba<span>kaba</span>
              </span>
            </a>
            <p>
              La restauration de campus, simplifiée. Commande, paye et suis tes repas depuis ton
              téléphone.
            </p>
            <StoreBadges />
          </div>

          <div className="footer-col">
            <h5>Navigation</h5>
            <a href="#comment-ca-marche">Comment ça marche</a>
            <a href="#pourquoi">Pourquoi kabakaba</a>
            <a href="#ambassadeur">Programme ambassadeur</a>
            <a href="#partenaire">Devenir vendeur</a>
          </div>

          <div className="footer-col">
            <h5>Nos campus</h5>
            {CAMPUSES.map((c) => (
              <div className="footer-campus-row" key={c.code}>
                <div className="footer-campus-badge" style={{ background: c.gradient }}>{c.code}</div>
                <span>{c.name}</span>
              </div>
            ))}
            <p className="footer-note">De nouveaux campus rejoignent le réseau régulièrement.</p>
          </div>

          <div className="footer-col">
            <h5>Nous contacter</h5>
            <div className="footer-contact-row"><Mail size={14} /><span>contact@kabakaba.app</span></div>
            <div className="footer-contact-row"><Phone size={14} /><span>+228 90 00 00 00</span></div>
            <div className="footer-contact-row"><MapPin size={14} /><span>Lomé, Togo</span></div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} kabakaba. Tous droits réservés.</span>
          <span>Fait avec ❤️ à Lomé, Togo</span>
        </div>
      </div>
    </footer>
  );
}
