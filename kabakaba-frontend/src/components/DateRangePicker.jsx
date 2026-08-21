import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DateRangePicker.module.css';

const MONTH_LABELS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const WEEKDAY_LABELS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDay(a, b) {
  return a && b && a.toDateString() === b.toDateString();
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

function formatShort(d) {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatRangeLabel(from, to) {
  const today = startOfDay(new Date());
  if (sameDay(from, today) && sameDay(to, today)) return "Aujourd'hui";
  if (sameDay(to, today) && sameDay(from, daysAgo(6))) return '7 derniers jours';
  if (sameDay(to, today) && sameDay(from, daysAgo(29))) return '30 derniers jours';
  if (sameDay(from, to)) return formatShort(from);
  return `${formatShort(from)} – ${formatShort(to)}`;
}

// Génère la grille du mois affiché (cases vides pour l'alignement lundi-dimanche)
function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay() : 0=dimanche..6=samedi -> on veut 0=lundi..6=dimanche
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  return cells;
}

/**
 * Sélecteur de plage de dates personnalisée.
 * Props :
 * - value: { from: Date, to: Date }
 * - onChange: (range: { from: Date, to: Date }) => void
 */
export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date(value?.to ?? new Date()));
  const [draftFrom, setDraftFrom] = useState(value?.from ?? daysAgo(6));
  const [draftTo, setDraftTo] = useState(value?.to ?? startOfDay(new Date()));
  const [pickingSecond, setPickingSecond] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function openPicker() {
    setDraftFrom(value?.from ?? daysAgo(6));
    setDraftTo(value?.to ?? startOfDay(new Date()));
    setPickingSecond(false);
    setOpen((o) => !o);
  }

  function applyPreset(from, to) {
    onChange({ from, to });
    setOpen(false);
  }

  function handleDayClick(day) {
    if (!pickingSecond) {
      setDraftFrom(day);
      setDraftTo(day);
      setPickingSecond(true);
      return;
    }
    if (day < draftFrom) {
      setDraftFrom(day);
      setDraftTo(draftFrom);
    } else {
      setDraftTo(day);
    }
    setPickingSecond(false);
  }

  function handleApply() {
    onChange({ from: draftFrom, to: draftTo });
    setOpen(false);
  }

  const cells = buildMonthGrid(viewDate);
  const label = value ? formatRangeLabel(value.from, value.to) : '';

  return (
    <div className={styles.wrap} ref={containerRef}>
      <button type="button" className={styles.trigger} onClick={openPicker}>
        <Calendar size={16} />
        <span>{label}</span>
      </button>

      {open && (
        <div className={styles.popover}>
          <div className={styles.presets}>
            <button type="button" onClick={() => applyPreset(startOfDay(new Date()), startOfDay(new Date()))}>
              Aujourd'hui
            </button>
            <button type="button" onClick={() => applyPreset(daysAgo(6), startOfDay(new Date()))}>
              7 derniers jours
            </button>
            <button type="button" onClick={() => applyPreset(daysAgo(29), startOfDay(new Date()))}>
              30 derniers jours
            </button>
          </div>

          <div className={styles.calendarHeader}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthLabel}>
              {MONTH_LABELS_FR[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.weekdays}>
            {WEEKDAY_LABELS_FR.map((w, i) => (
              <span key={`${w}-${i}`}>{w}</span>
            ))}
          </div>

          <div className={styles.grid}>
            {cells.map((day, i) => {
              if (!day) return <span key={`blank-${i}`} className={styles.blankCell} />;
              const isFrom = sameDay(day, draftFrom);
              const isTo = sameDay(day, draftTo);
              const inRange = day > draftFrom && day < draftTo;
              const isFuture = day > startOfDay(new Date());
              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  disabled={isFuture}
                  onClick={() => handleDayClick(day)}
                  className={[
                    styles.dayCell,
                    isFrom || isTo ? styles.dayCellSelected : '',
                    inRange ? styles.dayCellInRange : '',
                  ].join(' ')}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className={styles.footer}>
            <span className={styles.rangePreview}>
              {formatShort(draftFrom)} – {formatShort(draftTo)}
            </span>
            <div className={styles.footerActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setOpen(false)}>
                Annuler
              </button>
              <button type="button" className={styles.applyBtn} onClick={handleApply}>
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
