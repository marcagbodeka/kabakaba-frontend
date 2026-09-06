import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitPartnerApplication } from '../../services/domain/applicationsService';
import { ApiError } from '../../services/httpClient';

// Même règle que le backend (@IsPhoneNumber(), format E.164) : "+" suivi
// de l'indicatif pays puis le numéro, sans espaces ni "00".
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  structure: '',
  contact: '',
  telephone: '',
  email: '',
  campus: '',
  message: '',
};

export default function PartnerForm() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!PHONE_REGEX.test(form.telephone.trim())) {
      setError('Numéro invalide — utilisez le format international, ex. +22890000000 (pas de 00, pas d\'espaces).');
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError('Adresse email invalide.');
      return;
    }

    setSubmitting(true);
    try {
      // CDC 8.2 : mapping vers les noms attendus par CreatePartnerApplicationDto.
      await submitPartnerApplication({
        structureName: form.structure.trim(),
        contactName: form.contact.trim(),
        phone: form.telephone.trim(),
        email: form.email.trim(),
        targetCampus: form.campus.trim(),
        message: form.message.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Une erreur est survenue lors de l'envoi. Merci de réessayer.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="partner-success">
        <CheckCircle2 size={32} />
        <div>
          <div className="partner-success-title">Candidature envoyée</div>
          <div className="partner-success-sub">
            Notre équipe revient vers vous sous peu au numéro indiqué.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="partner-form" onSubmit={handleSubmit}>
      <div className="partner-form-row">
        <div className="field">
          <label htmlFor="structure">Nom de la cantine / structure</label>
          <input id="structure" required value={form.structure} onChange={handleChange('structure')} />
        </div>
        <div className="field">
          <label htmlFor="contact">Nom du contact</label>
          <input id="contact" required value={form.contact} onChange={handleChange('contact')} />
        </div>
      </div>
      <div className="partner-form-row">
        <div className="field">
          <label htmlFor="telephone">Téléphone</label>
          <input
            id="telephone"
            type="tel"
            required
            placeholder="+22890000000"
            value={form.telephone}
            onChange={handleChange('telephone')}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            placeholder="contact@structure.com"
            value={form.email}
            onChange={handleChange('email')}
          />
        </div>
      </div>
      <div className="partner-form-row">
        <div className="field">
          <label htmlFor="campus">Vous êtes sur quel campus ?</label>
          <input id="campus" required value={form.campus} onChange={handleChange('campus')} placeholder="Ex. UCAO-UUT, Lomé..." />
        </div>
      </div>
      <div className="field">
        <label htmlFor="message">Message (optionnel)</label>
        <textarea id="message" rows={3} value={form.message} onChange={handleChange('message')} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
        {submitting ? 'Envoi en cours…' : 'Envoyer ma candidature'}
      </button>
      {error && <p style={{ color: '#EF4444', fontSize: 13.5, marginTop: 10 }}>{error}</p>}
    </form>
  );
}
