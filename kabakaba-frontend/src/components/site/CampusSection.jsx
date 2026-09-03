import ScrollingLogos from './ScrollingLogos';

/**
 * Un seul campus actif pour l'instant (UCAO-UUT). La liste s'étend au fil
 * du déploiement de kabakaba sur de nouveaux campus, dans le même format
 * { name, logo }.
 */
const CAMPUSES = [
  { name: 'UCAO-UUT', logo: '/site/campus/ucao-uut.webp' },
];

function renderCampusLogo(campus) {
  return <img src={campus.logo} alt={campus.name} className="campus-logo-img" width={56} height={52} loading="lazy" />;
}

export default function CampusSection() {
  return (
    <section id="campus" className="site-section">
      <div className="section-head">
        <div className="eyebrow">Où nous sommes</div>
        <h2>Nos campus</h2>
        <p>kabakaba est actif sur ce campus, d&apos;autres suivront.</p>
      </div>
      <ScrollingLogos items={CAMPUSES} renderLogo={renderCampusLogo} />
    </section>
  );
}
