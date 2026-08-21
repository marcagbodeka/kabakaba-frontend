/**
 * Affiche une capture d'écran de l'app dans un cadre de téléphone.
 * width/height explicites sur chaque image → pas de décalage de mise en
 * page (CLS) pendant le chargement. `priority` déclenche un chargement
 * eager + fetchpriority="high" pour l'image la plus visible du hero (LCP).
 */
export default function PhoneShot({ src, alt, width, height, priority = false, className = '' }) {
  return (
    <div className={`phone-frame ${className}`}>
      <img
        src={src}
        width={width}
        height={height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </div>
  );
}
