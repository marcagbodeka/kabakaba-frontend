import { Wallet, ShieldCheck, MapPin, Bell, Award, UtensilsCrossed, Ticket } from 'lucide-react';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import StoreBadges from '../../components/site/StoreBadges';
import PhoneShot from '../../components/site/PhoneShot';
import PartnerForm from '../../components/site/PartnerForm';
import '../../styles/site.css';

const GALLERY = [
  {
    tone: 'c1',
    title: 'Ton portefeuille en un coup d\u2019œil',
    text: 'Solde de tickets, commandes en cours et accès rapide aux cantines.',
    src: '/site/screen-home.webp',
  },
  {
    tone: 'c2',
    title: 'Suis ta commande en direct',
    text: 'Acceptée, en préparation, prête — tu confirmes la réception en un tap.',
    src: '/site/screen-tracking.webp',
  },
  {
    tone: 'c3',
    title: 'Toutes les cantines de ton campus',
    text: 'Filtre par campus, horaires d\u2019ouverture, spécialités — tout est là.',
    src: '/site/screen-cantines.webp',
  },
];

const FEATURES = [
  { icon: Ticket, tone: 'peach', title: 'Paiement anticipé simple', text: 'Recharge via Moov Flooz ou Mixx by Yas, sans complication.' },
  { icon: ShieldCheck, tone: 'indigo', title: 'Séquestre sécurisé', text: 'Tes tickets ne sont débités qu\u2019une fois ta commande prête.' },
  { icon: MapPin, tone: 'green', title: 'Pensé pour ton campus', text: 'Seules les cantines de ton campus s\u2019affichent, rien d\u2019inutile.' },
  { icon: Bell, tone: 'peach', title: 'Suivi en temps réel', text: 'Notifications à chaque étape, jusqu\u2019à la confirmation de réception.' },
  { icon: Award, tone: 'indigo', title: 'Programme ambassadeur', text: 'Partage ton code et gagne une commission sur chaque recharge de tes affiliés.' },
  { icon: UtensilsCrossed, tone: 'green', title: 'Réseau de cantines', text: 'De plus en plus de cantines rejoignent kabakaba sur ton campus.' },
];

const TIERS = [
  { name: 'Bronze', rate: '0,5%' },
  { name: 'Argent', rate: '0,8%' },
  { name: 'Or', rate: '1,2%' },
];

export default function Home() {
  return (
    <div id="top">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-text">
          <div className="pill">Restauration campus · 100% digital</div>
          <h1>
            Ton ex fait la queue.
            <span className="accent">Toi tu manges déjà.</span>
          </h1>
          <p className="hero-kicker">
            Ce n&apos;est pas le karma.&nbsp;C&apos;est&nbsp;<b>kabakaba</b>.
          </p>
          <p className="hero-sub">
            Commande, paye et suis ta commande en temps réel dans les cantines de ton campus.
          </p>
          <StoreBadges />
          <div className="micro-note">Gratuit · Paiement sécurisé par séquestre</div>
        </div>

        <div className="hero-phones">
          <div className="phone-cluster">
            <PhoneShot
              src="/site/screen-onboarding.webp"
              alt="Écran de création de compte kabakaba"
              width={210} height={407}
              priority
              className="p1"
            />
            <PhoneShot
              src="/site/screen-recharge.webp"
              alt="Confirmation de rechargement de tickets"
              width={190} height={410}
              priority
              className="p2"
            />
            <div className="float-card notif-card float-1">
              <img src="/site/logo-32.webp" width="26" height="26" alt="" className="notif-logo" loading="eager" />
              <div className="notif-body">
                <div className="notif-head"><b>kabakaba</b><span>maintenant</span></div>
                <div className="notif-msg">Commande prête !<br /><small>Chez Mama Afi</small></div>
              </div>
            </div>
            <div className="float-card float-2">
              <div className="fc-icon" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>✓</div>
              <div>
                <div className="fc-title">7 200 tickets</div>
                <div className="fc-sub">Nouveau solde</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Galerie ──────────────────────────────────────────── */}
      <section id="comment-ca-marche" className="site-section">
        <div className="section-head">
          <div className="eyebrow">Découvre l&apos;app en images</div>
          <h2>Tout ce qu&apos;il te faut pour ta vie de campus</h2>
          <p>De la commande à la récupération, en toute simplicité, depuis ton téléphone.</p>
        </div>
        <div className="gallery">
          {GALLERY.map((g) => (
            <div className={`gallery-card ${g.tone}`} key={g.title}>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
              <PhoneShot src={g.src} alt={g.title} width={170} height={368} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Suivi en temps réel ──────────────────────────────── */}
      <section id="pourquoi" className="site-section" style={{ paddingTop: 0 }}>
        <div className="feature-block">
          <PhoneShot src="/site/screen-tracking.webp" alt="Suivi de commande en temps réel" width={230} height={497} />
          <div>
            <div className="tag">🔔 Suivi en temps réel</div>
            <h3>Ne rate plus jamais ta commande prête</h3>
            <p className="desc">
              kabakaba te tient informé à chaque étape, de la validation par la cantine jusqu&apos;à
              la confirmation de réception — directement dans l&apos;app.
            </p>
            <ul className="check-list">
              <li><span className="ck">✓</span> Commande acceptée par la cantine</li>
              <li><span className="ck">✓</span> Suivi de la préparation en direct</li>
              <li><span className="ck">✓</span> Confirmation de réception en un tap</li>
              <li><span className="ck">✓</span> Historique de toutes tes commandes</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ──────────────────────────────────── */}
      <section className="site-section" style={{ paddingTop: '20px' }}>
        <div className="section-head">
          <div className="eyebrow">Pourquoi kabakaba</div>
          <h2>Fait pour la vie de campus</h2>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat-card" key={f.title}>
              <div className={`fi fi-${f.tone}`}><f.icon size={19} /></div>
              <h4>{f.title}</h4>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ambassadeur ──────────────────────────────────────── */}
      <section id="ambassadeur" className="site-section">
        <div className="amb-section">
          <div className="amb-grid">
            <div>
              <div className="amb-tag">🏆 Programme ambassadeur</div>
              <h2>Partage ton code, gagne des commissions</h2>
              <p className="desc">
                Deviens ambassadeur directement depuis l&apos;app. Tu touches une commission sur
                chaque recharge de tes affiliés, avec un niveau qui progresse selon ton volume.
              </p>
              <div className="tier-row">
                {TIERS.map((t) => (
                  <div className={`tier tier-${t.name.toLowerCase()}`} key={t.name}>
                    <div className="tname">{t.name}</div>
                    <div className="tval">{t.rate}</div>
                  </div>
                ))}
              </div>
              <a href="#telecharger" className="btn-accent">Devenir ambassadeur</a>
            </div>
            <div className="amb-phones">
              <PhoneShot src="/site/screen-ambassadeur-dashboard.webp" alt="Tableau de bord ambassadeur" width={210} height={454} />
              <PhoneShot src="/site/screen-ambassadeur-historique.webp" alt="Historique des commissions" width={210} height={454} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Devenir vendeur ──────────────────────────────────── */}
      <section id="partenaire" className="site-section">
        <div className="partner-block">
          <div className="partner-text">
            <div className="eyebrow">Tu tiens une cantine ?</div>
            <h2>Rejoins le réseau kabakaba</h2>
            <p className="partner-desc">
              Touche plus d&apos;étudiants sur ton campus, simplifie la gestion de tes commandes et
              reçois tes paiements directement sur ton portefeuille kabakaba.
            </p>
            <ul className="check-list">
              <li><span className="ck">✓</span> Visibilité auprès des étudiants de ton campus</li>
              <li><span className="ck">✓</span> Commandes et paiements centralisés dans l&apos;app</li>
              <li><span className="ck">✓</span> Réponse de notre équipe sous quelques jours</li>
            </ul>
          </div>
          <div className="partner-form-card">
            <PartnerForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
