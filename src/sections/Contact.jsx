function Contact() {
  return (
    <section className="contact section" id="contact">
      <div className="section-heading">
        <p className="eyebrow">Contact page</p>
        <h2>Visit, call, WhatsApp, or book a service appointment</h2>
      </div>
      <div className="contact-layout">
        <form className="contact-form">
          <label>
            Name
            <input type="text" placeholder="Your name" />
          </label>
          <label>
            Phone or WhatsApp
            <input type="tel" placeholder="+91 98765 43210" />
          </label>
          <label>
            Interested In
            <select defaultValue="Adoption">
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
            <textarea rows="5" placeholder="Tell us what you need." />
          </label>
          <button type="button" className="primary-btn">
            Send Inquiry
          </button>
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
