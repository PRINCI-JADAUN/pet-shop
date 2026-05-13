import { useState } from 'react';
import { createContact } from '../api';

const emptyContact = {
  name: '',
  phone: '',
  email: '',
  interest: 'Adoption',
  message: '',
};

function Contact() {
  const [form, setForm] = useState(emptyContact);
  const [status, setStatus] = useState('');

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const sendInquiry = async (event) => {
    event.preventDefault();

    try {
      await createContact(form);
      setForm(emptyContact);
      setStatus('Inquiry sent. Our team will contact you soon.');
    } catch (error) {
      setStatus(`Inquiry was not sent: ${error.message}`);
    }
  };

  return (
    <section className="contact section" id="contact">
      <div className="section-heading">
        <p className="eyebrow">Contact page</p>
        <h2>Visit, call, WhatsApp, or book a service appointment</h2>
      </div>
      <div className="contact-layout">
        <form className="contact-form" onSubmit={sendInquiry}>
          <label>
            Name
            <input name="name" type="text" value={form.name} onChange={updateForm} placeholder="Your name" />
          </label>
          <label>
            Phone or WhatsApp
            <input name="phone" type="tel" value={form.phone} onChange={updateForm} placeholder="+91 98765 43210" />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateForm} placeholder="you@example.com" />
          </label>
          <label>
            Interested In
            <select name="interest" value={form.interest} onChange={updateForm}>
              <option>Adoption</option>
              <option>Products</option>
              <option>Grooming</option>
              <option>Vet Support</option>
              <option>Boarding</option>
              <option>Training</option>
            </select>
          </label>
          <label>
            Message
            <textarea name="message" rows="5" value={form.message} onChange={updateForm} placeholder="Tell us what you need." />
          </label>
          <button type="submit" className="primary-btn">
            Send Inquiry
          </button>
          {status && <p className="admin-status">{status}</p>}
        </form>

        <aside className="contact-card">
          <h3>PawSphere Pet Shop</h3>
          <p>12 Happy Paws Street, Near City Park, New Delhi</p>
          <a href="tel:+919000011111">Phone: +91 90000 11111</a>
          <a href="https://wa.me/919000011111">WhatsApp: +91 90000 11111</a>
          <a href="mailto:hello@pawsphere.shop">Email: hello@pawsphere.shop</a>
          <div className="hours">
            <strong>Opening Hours</strong>
            <span>Mon-Sat: 9:00 AM - 8:00 PM</span>
            <span>Sunday: 10:00 AM - 5:00 PM</span>
          </div>
          <div className="map-preview" aria-label="Map preview">
            <span>City Park</span>
            <strong>PawSphere</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Contact;
