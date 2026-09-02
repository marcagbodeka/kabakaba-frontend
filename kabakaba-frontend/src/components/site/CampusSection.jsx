const CAMPUSES = [
  { code: 'UCAO', name: 'UCAO-UUT', city: 'Lomé', gradient: 'linear-gradient(135deg,#3A4CA8,#232F72)' },
];

/**
 * Placée juste après la section Ambassadeur. Un seul campus actif pour
 * l'instant (UCAO-UUT) ; la liste s'étend à mesure que kabakaba se déploie
 * sur de nouveaux campus.
 */
export default function CampusSection() {
  return (
    <section id="campus" className="site-section">
      <div className="section-head">
        <div className="eyebrow">Où nous sommes</div>
        <h2>Nos campus</h2>
        <p>kabakaba est actif sur ce campus, d&apos;autres suivront.</p>
      </div>
      <div className="campus-grid">
        {CAMPUSES.map((c) => (
          <div className="campus-card" key={c.code}>
            <div className="campus-badge" style={{ background: c.gradient }}>{c.code}</div>
            <div>
              <div className="campus-name">{c.name}</div>
              <div className="campus-city">{c.city}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
