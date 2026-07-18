import styles from './PageContent.module.css';

// Enveloppe le contenu de chaque page avec le padding et la largeur max
// standard, pour que les pages n'aient pas à connaître les détails du layout.
export default function PageContent({ children }) {
  return <div className={styles.content}>{children}</div>;
}
