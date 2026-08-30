import { useRef, useState } from 'react';
import styles from './LineChart.module.css';

/**
 * Graphique en ligne SVG, avec info-bulle au survol (souris) ou au tap
 * (tactile). Remplace les anciens graphiques "en bandes" (barres CSS) sur
 * toutes les pages de supervision, qui débordaient visuellement.
 *
 * Props :
 * - labels: string[] — dates ISO ("YYYY-MM-DD") ou libellés bruts
 * - values: number[]
 * - color: couleur de la ligne (défaut : indigo)
 * - formatValue: (v) => string — formatage de la valeur (info-bulle + axe Y)
 * - formatLabel: (l) => string — formatage du libellé (info-bulle + axe X)
 */
export default function LineChart({
  labels = [],
  values = [],
  color = '#1B2A6B',
  formatValue = (v) => `${v}`,
  formatLabel = (l) => l,
  height = 220,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  const width = 700;
  const paddingLeft = 8;
  const paddingRight = 54;
  const paddingTop = 16;
  const paddingBottom = 30;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const hasData = values.length > 0;
  const maxVal = Math.max(1, ...values, 0);
  const minVal = Math.min(0, ...values);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => {
    const x = paddingLeft + (values.length === 1 ? plotWidth / 2 : (i / Math.max(1, values.length - 1)) * plotWidth);
    const y = paddingTop + plotHeight - ((v - minVal) / range) * plotHeight;
    return { x, y, v, label: labels[i] };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = hasData
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + plotHeight).toFixed(1)} Z`
    : '';

  const gridLines = [0, 1, 2, 3].map((i) => {
    const val = minVal + (range * i) / 3;
    const y = paddingTop + plotHeight - ((val - minVal) / range) * plotHeight;
    return { y, val };
  });

  function handleMove(e) {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relX = ((clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - relX);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const active = hoverIndex !== null ? points[hoverIndex] : null;
  const gradientId = useRef(`lineFill-${Math.random().toString(36).slice(2)}`).current;

  return (
    <div className={styles.wrap}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchStart={handleMove}
        onTouchMove={handleMove}
        onTouchEnd={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={paddingLeft} x2={width - paddingRight} y1={g.y} y2={g.y} className={styles.gridLine} />
            <text x={width - paddingRight + 10} y={g.y + 4} className={styles.gridLabel}>
              {formatValue(Math.round(g.val))}
            </text>
          </g>
        ))}

        {hasData && <path d={areaD} fill={`url(#${gradientId})`} stroke="none" />}
        {hasData && (
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoverIndex === i ? 6 : 3.5}
            fill={hoverIndex === i ? '#fff' : color}
            stroke={color}
            strokeWidth={hoverIndex === i ? 3 : 0}
          />
        ))}

        {active && (
          <line x1={active.x} x2={active.x} y1={paddingTop} y2={paddingTop + plotHeight} className={styles.hoverLine} />
        )}
      </svg>

      {active && (
        <div
          className={styles.tooltip}
          style={{
            left: `${(active.x / width) * 100}%`,
            top: `${(active.y / height) * 100}%`,
          }}
        >
          <div className={styles.tooltipDate}>{formatLabel(active.label)}</div>
          <div className={styles.tooltipValue}>{formatValue(active.v)}</div>
        </div>
      )}

      <div className={styles.xLabels}>
        <span>{labels.length > 0 ? formatLabel(labels[0]) : ''}</span>
        {labels.length > 1 && <span>{formatLabel(labels[labels.length - 1])}</span>}
      </div>
    </div>
  );
}
