/**
 * Bande horizontale de logos en défilement continu. Générique : le rendu de
 * chaque logo (SVG, wordmark, image) est délégué à `renderLogo`, ce qui
 * permet de réutiliser la même mécanique de scroll pour les technologies
 * partenaires et pour les campus, sans dupliquer l'animation.
 *
 * La liste est dupliquée une fois pour permettre une boucle continue
 * (translateX -50%) sans coupure visible. L'animation est suspendue au
 * survol et respecte prefers-reduced-motion (voir site.css).
 */
export default function ScrollingLogos({ items, renderLogo }) {
  const track = [...items, ...items];

  return (
    <div className="logo-strip">
      <div className="logo-track">
        {track.map((item, i) => (
          <div className="logo-item" key={`${item.name}-${i}`}>
            {renderLogo(item)}
            <span className="logo-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
