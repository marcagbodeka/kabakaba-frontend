/**
 * Fait défiler vers un id de la page sans jamais écrire de hash dans
 * l'URL (pas de "#pourquoi", "#campus", etc. dans la barre d'adresse).
 * Les liens restent de vrais <a href="#id"> pour l'accessibilité
 * (clavier, clic droit "copier le lien") mais le clic est intercepté :
 * on empêche le comportement par défaut du navigateur et on scroll
 * nous-mêmes vers l'élément ciblé.
 */
export function handleAnchorClick(id) {
  return (e) => {
    e.preventDefault();
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}
