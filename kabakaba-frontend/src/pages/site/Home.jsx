import { Smartphone, Wallet, Bell, ShieldCheck, MapPin, Award, Download } from 'lucide-react';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import HeroIllustration from '../../components/site/HeroIllustration';
import PartnerForm from '../../components/site/PartnerForm';
import '../../styles/site.css';

const STEPS = [
  { n: '01', title: 'Choisis ton campus', text: "Inscription en quelques secondes, tu ne vois que les cantines affiliées à ton campus." },
  { n: '02', title: 'Commande & paie en tickets', text: 'Menu fixe ou personnalisable, recharge ton portefeuille en un instant.' },
  { n: '03', title: 'Suis ta commande en direct', text: 'Acceptée, en préparation, prête — tu es notifié à chaque étape.' },
  { n: '04', title: 'Récupère et savoure', text: 'Sur place, à emporter ou en take away, comme tu préfères.' },
];

const BENEFITS = [
  { icon: Wallet, title: 'Paiement anticipé simple', text: 'Recharge via Moov Flooz ou Mixx by Yas, sans complication.' },
  { icon: Bell, title: 'Suivi en temps réel', text: 'Notifications à chaque étape, jusqu\u2019à la confirmation de réception.' },
  { icon: ShieldCheck, title: 'Séquestre sécurisé', text: 'Tes tickets ne sont débités qu\u2019une fois ta commande prête.' },
  { icon: MapPin, title: 'Pensé pour ton campus', text: 'Seules les cantines de ton campus s\u2019affichent, rien d\u2019inutile.' },
];

const CAMPUSES = ['UCAO · Lomé', 'Université de Lomé'];

export default function Home() {
  return (
    <div id="top">
      <SiteHeader />

      <section className="hero">
        <div className="hero-text">
          <div className="site-eyebrow">Restauration campus</div>
          <h1>Commande ton repas, on s&apos;occupe du reste.</h1>
          <p className="hero-sub">
            kabakaba connecte les étudiants aux cantines de leur campus : commande, paiement
            anticipé et suivi en temps réel, dans une seule application.
          </p>
          <div className="hero-actions">
            <a href="#telecharger" className="site-btn-primary">
              <Smartphone size={16} /> Télécharger l&apos;app
            </a>
            <a href="#comment-ca-marche" className="site-btn-ghost">Voir comment ça marche</a>
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section id="comment-ca-marche" className="site-section">
        <div className="site-section-head">
          <div className="site-eyebrow">Comment ça marche</div>
          <h2>De la commande à la récupération, en 4 étapes</h2>
        </div>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div className="step-card" key={s.n}>
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-text">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pourquoi" className="site-section site-section-alt">
        <div className="site-section-head">
          <div className="site-eyebrow">Pourquoi kabakaba</div>
          <h2>Fait pour la vie de campus</h2>
        </div>
        <div className="benefits-grid">
          {BENEFITS.map((b) => (
            <div className="benefit-card" key={b.title}>
              <div className="benefit-icon"><b.icon size={20} /></div>
              <div className="benefit-title">{b.title}</div>
              <div className="benefit-text">{b.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="partenaire" className="site-section site-partner">
        <div className="site-partner-text">
          <div className="site-eyebrow">Tu tiens une cantine ?</div>
          <h2>Rejoins le réseau kabakaba</h2>
          <p>
            Touche plus d&apos;étudiants sur ton campus, simplifie la gestion de tes commandes
            et reçois tes paiements directement sur ton portefeuille kabakaba.
          </p>
        </div>
        <div className="site-partner-form">
          <PartnerForm />
        </div>
      </section>

      <section id="ambassadeur" className="site-section site-section-alt site-ambassador">
        <Award size={28} className="site-ambassador-icon" />
        <div className="site-eyebrow">Programme ambassadeur</div>
        <h2>Deviens ambassadeur, gagne des commissions</h2>
        <p>
          Partage ton code de parrainage et touche une commission sur chaque recharge de tes
          affiliés. La demande de statut se fait directement depuis l&apos;application, une fois
          ton compte étudiant créé.
        </p>
      </section>

      <section className="site-section">
        <div className="site-section-head">
          <div className="site-eyebrow">Campus disponibles</div>
          <h2>Déjà présent sur</h2>
        </div>
        <div className="campus-pills">
          {CAMPUSES.map((c) => (
            <span key={c} className="campus-pill"><MapPin size={14} /> {c}</span>
          ))}
        </div>
      </section>

      <section id="telecharger" className="site-section site-download">
        <h2>Télécharge kabakaba</h2>
        <p>Disponible sur Android et iOS.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#" className="site-btn-primary"><Download size={16} /> App Store</a>
          <a href="#" className="site-btn-primary"><Download size={16} /> Google Play</a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
