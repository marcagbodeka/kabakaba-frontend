import './BrandLoader.css';

export default function BrandLoader() {
  return (
    <div className="brand-loader" role="status" aria-live="polite" aria-label="Kabakaba">
      <div className="brand-loader__scene" aria-hidden="true">
        <span className="brand-loader__ring brand-loader__ring--outer" />
        <span className="brand-loader__ring brand-loader__ring--inner" />
        <span className="brand-loader__dot brand-loader__dot--one" />
        <span className="brand-loader__dot brand-loader__dot--two" />
        <span className="brand-loader__dot brand-loader__dot--three" />
        <img className="brand-loader__logo" src="/site/logo-512.png" alt="" width="128" height="128" />
      </div>
    </div>
  );
}
