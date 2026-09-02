/**
 * Bande horizontale défilante des technologies partenaires (Vercel, Neon,
 * Google Play, FedaPay). Logos en SVG inline, monochromes, pour rester
 * cohérents visuellement quel que soit le rendu de la marque d'origine.
 *
 * FedaPay n'a pas de marque SVG officielle distribuable à ce jour : on
 * affiche son nom en wordmark plutôt qu'une icône, pour ne pas reproduire
 * une version approximative de leur logo.
 *
 * La liste est dupliquée une fois pour permettre une boucle d'animation
 * continue (translateX -50%) sans coupure visible. L'animation est
 * suspendue au survol et respecte prefers-reduced-motion (voir site.css).
 */
const PARTNERS = [
  {
    name: 'Vercel',
    type: 'svg',
    viewBox: '0 0 24 24',
    path: 'm12 1.608 12 20.784H0Z',
  },
  {
    name: 'Neon',
    type: 'svg',
    viewBox: '0 0 24 24',
    path: 'M24 0V24l-9.365-8.045V24H0V0ZM2.942 21.087h8.751V9.563l9.365 8.204V2.919L2.942 2.914Z',
  },
  {
    name: 'Google Play',
    type: 'svg',
    viewBox: '0 0 24 24',
    path: 'M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z',
  },
  { name: 'FedaPay', type: 'wordmark' },
];

function TechLogo({ partner }) {
  return (
    <div className="tech-item" role="img" aria-label={partner.name}>
      {partner.type === 'svg' ? (
        <svg viewBox={partner.viewBox} className="tech-icon" aria-hidden="true">
          <path d={partner.path} />
        </svg>
      ) : (
        <span className="tech-wordmark">{partner.name}</span>
      )}
    </div>
  );
}

export default function TechPartners() {
  // Deux passes du même tableau : la piste anime de 0 à -50%, la seconde
  // moitié prend le relais visuellement à l'identique → boucle infinie.
  const track = [...PARTNERS, ...PARTNERS];

  return (
    <div className="tech-strip">
      <div className="tech-track">
        {track.map((p, i) => (
          <TechLogo partner={p} key={`${p.name}-${i}`} />
        ))}
      </div>
    </div>
  );
}
