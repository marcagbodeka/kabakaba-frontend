export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <div className="site-logo">
            kaba<span>kaba</span>
          </div>
          <p className="site-footer-tagline">
            Commande et paiement anticipé pour les cantines de campus.
          </p>
        </div>
        <div className="site-footer-col">
          <div className="site-footer-title">Produit</div>
          <a href="#comment-ca-marche">Comment ça marche</a>
          <a href="#pourquoi">Pourquoi kabakaba</a>
          <a href="#telecharger">Télécharger</a>
        </div>
        <div className="site-footer-col">
          <div className="site-footer-title">Partenaires</div>
          <a href="#partenaire">Devenir partenaire</a>
          <a href="#ambassadeur">Programme ambassadeur</a>
        </div>
        <div className="site-footer-col">
          <div className="site-footer-title">Contact</div>
          <a href="mailto:contact@kabakaba.app">contact@kabakaba.app</a>
        </div>
      </div>
      <div className="site-footer-bottom">© {new Date().getFullYear()} kabakaba. Tous droits réservés.</div>
    </footer>
  );
}
