import ScrollingLogos from './ScrollingLogos';

/**
 * Sources des tracés et couleurs :
 * - Vercel : noir #000000 (charte officielle).
 * - Neon : teal #00E0D9 (charte officielle, extrait de leur logo SVG).
 * - Google Play : 4 couleurs officielles Google — rouge #EA4335,
 *   jaune #FBBC04, bleu #4285F4, vert #34A853.
 * - FedaPay : aucun SVG de marque public/récupérable trouvé à ce jour →
 *   rendu en wordmark texte plutôt qu'une icône inventée qui serait
 *   inexacte. Couleur neutre (indigo du site) faute de couleur de marque
 *   officielle confirmée — à corriger si vous avez leur charte graphique.
 */
const PARTNERS = [
  {
    name: 'Vercel',
    type: 'svg',
    viewBox: '0 0 256 222',
    paths: [{ d: 'M127.999778 0 256 221.704527 0 221.704527Z', fill: '#000000' }],
  },
  {
    name: 'Neon',
    type: 'svg',
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M24 0V24l-9.365-8.045V24H0V0ZM2.942 21.087h8.751V9.563l9.365 8.204V2.919L2.942 2.914Z',
        fill: '#00E0D9',
      },
    ],
  },
  {
    name: 'Google Play',
    type: 'svg',
    viewBox: '0 0 256 283',
    paths: [
      { d: 'M119.553141,134.916362 L1.0599006,259.060547 C3.75619448,268.616998 10.7182836,276.3906 19.9208658,280.119977 C29.1234481,283.849353 39.5331235,283.115716 48.121672,278.132484 L181.448642,202.197919 L119.553141,134.916362 Z', fill: '#EA4335' },
      { d: 'M239.370822,113.813616 L181.71353,80.7909097 L116.815965,137.741834 L181.978418,202.021326 L239.19423,169.351804 C249.525723,163.942452 256,153.24465 256,141.58271 C256,129.92077 249.525723,119.222968 239.19423,113.813616 L239.370822,113.813616 Z', fill: '#FBBC04' },
      { d: 'M1.0599006,23.4868015 C0.343633396,26.134699 -0.0127538816,28.8670014 -9.94374397e-15,31.6100341 L-9.94374397e-15,250.937314 C0.00751268399,253.679042 0.363556675,256.408712 1.0599006,259.060547 L123.614758,138.095018 L1.0599006,23.4868015 Z', fill: '#4285F4' },
      { d: 'M120.436101,141.273674 L181.71353,80.7909097 L48.5631521,4.50316009 C43.5539929,1.56944036 37.8568091,0.0156629668 32.0517989,0 C17.6444261,-0.0284873284 4.97836875,9.53420553 1.0599006,23.3985055 L120.436101,141.273674 Z', fill: '#34A853' },
    ],
  },
  { name: 'FedaPay', type: 'wordmark' },
];

function renderTechLogo(partner) {
  if (partner.type === 'svg') {
    return (
      <svg viewBox={partner.viewBox} className="tech-icon" role="img" aria-label={partner.name}>
        {partner.paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill} />
        ))}
      </svg>
    );
  }
  return <span className="tech-wordmark">{partner.name}</span>;
}

export default function TechPartners() {
  return <ScrollingLogos items={PARTNERS} renderLogo={renderTechLogo} />;
}
