import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

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

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST /public/partner-applications une fois l'API prête
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="partner-success">
        <CheckCircle2 size={32} />
        <div>
          <div className="partner-success-title">Candidature envoyée</div>
          <div className="partner-success-sub">
            Notre équipe revient vers vous sous peu à l&apos;adresse indiquée.
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
          <input id="telephone" type="tel" required value={form.telephone} onChange={handleChange('telephone')} />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" required value={form.email} onChange={handleChange('email')} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="campus">Campus visé</label>
        <input id="campus" required value={form.campus} onChange={handleChange('campus')} placeholder="Ex. UCAO, Université de Lomé..." />
      </div>
      <div className="field">
        <label htmlFor="message">Message (optionnel)</label>
        <textarea id="message" rows={3} value={form.message} onChange={handleChange('message')} />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
        Envoyer ma candidature
      </button>
    </form>
  );
}
