import { Wallet, ShieldCheck, MapPin, Bell, Award, UtensilsCrossed, Ticket } from 'lucide-react';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import StoreBadges from '../../components/site/StoreBadges';
import PhoneShot from '../../components/site/PhoneShot';
import PartnerForm from '../../components/site/PartnerForm';
import TechPartners from '../../components/site/TechPartners';
import '../../styles/site.css';

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

      {/* ── Pourquoi kabakaba ─────────────────────────────────── */}
      <section id="pourquoi" className="site-section why-section">
        <div className="section-head">
          <div className="eyebrow">Pourquoi kabakaba</div>
          <h2>Une méthode, pas juste une appli</h2>
          <p>kabakaba existe pour un seul problème : trop de temps perdu autour d&apos;un repas.</p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="tag">🎓 Pour les étudiants</div>
            <h3>Tu ne fais plus jamais la queue</h3>
            <p className="desc">
              Tu précommandes ton repas quand ça t&apos;arrange — avant le cours, entre deux
              amphis, la veille au soir — et tu payes directement dans l&apos;app. Plus de
              monnaie à chercher, plus d&apos;attente au comptoir : ta commande t&apos;attend,
              prête, au moment où tu arrives.
            </p>
          </div>

          <div className="why-card">
            <div className="tag amber">📈 Pour les vendeurs</div>
            <h3>Vous servez plus vite, vous vendez plus</h3>
            <p className="desc">
              Chaque commande est déjà payée et préparée avant l&apos;arrivée du client : plus
              de file d&apos;attente qui bloque votre cuisine. Vous écoulez vos plats plus
              vite, vous servez beaucoup plus d&apos;étudiants sur la même plage horaire —
              et certains vendeurs kabakaba doublent leur chiffre d&apos;affaires rien qu&apos;en
              augmentant le nombre de clients servis par jour.
            </p>
          </div>
        </div>

        <div className="why-tagline">
          kabakaba n&apos;est pas simplement une application. <span>C&apos;est une méthode : plus vite, plus d&apos;argent.</span>
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

      {/* ── Technologies partenaires ─────────────────────────── */}
      <section id="technologies" className="site-section tech-section">
        <div className="section-head">
          <div className="eyebrow">Notre stack</div>
          <h2>Nos technologies partenaires</h2>
          <p>kabakaba s&apos;appuie sur des outils fiables pour le paiement, l&apos;hébergement et la distribution de l&apos;app.</p>
        </div>
        <TechPartners />
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
