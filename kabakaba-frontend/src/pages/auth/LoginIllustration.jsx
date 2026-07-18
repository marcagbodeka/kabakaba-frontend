import styles from './LoginIllustration.module.css';

/**
 * Illustration du réseau kabakaba : un hub central (la plateforme) relié à
 * des nœuds satellites (campus/cantines), avec un petit "paquet" lumineux
 * qui voyage le long de chaque liaison — une métaphore des commandes qui
 * transitent en continu sur la plateforme.
 */
export default function LoginIllustration() {
  const satellites = [
    { angle: -60, delay: '0s', duration: '3.2s' },
    { angle: 20, delay: '0.7s', duration: '3.6s' },
    { angle: 100, delay: '1.4s', duration: '3s' },
    { angle: 170, delay: '2.1s', duration: '3.8s' },
    { angle: 230, delay: '2.8s', duration: '3.4s' },
  ];

  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg viewBox="0 0 240 240" className={styles.svg}>
        <circle cx="120" cy="120" r="30" className={styles.glowDot} />

        <circle cx="120" cy="120" r="98" className={styles.ringOuter} />
        <circle cx="120" cy="120" r="70" className={styles.ringInner} />

        <g className={styles.orbit}>
          {satellites.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const r = 98;
            const x = 120 + r * Math.cos(rad);
            const y = 120 + r * Math.sin(rad);
            const path = `path('M120,120 L${x.toFixed(1)},${y.toFixed(1)}')`;
            return (
              <g key={i}>
                <line x1="120" y1="120" x2={x} y2={y} className={styles.spoke} />
                <circle
                  className={styles.packet}
                  style={{
                    offsetPath: path,
                    WebkitOffsetPath: path,
                    animationDelay: s.delay,
                    animationDuration: s.duration,
                  }}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  className={styles.node}
                  style={{ animationDelay: s.delay }}
                />
              </g>
            );
          })}
        </g>

        <circle cx="120" cy="120" r="14" className={styles.hub} />
        <circle cx="120" cy="120" r="14" className={styles.hubPulse} />
      </svg>
    </div>
  );
}