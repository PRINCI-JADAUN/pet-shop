import Icon from '../components/Icon';
import { services } from '../data';

function Services() {
  return (
    <section className="services section" id="services">
      <div className="section-heading">
        <p className="eyebrow">Services page</p>
        <h2>Everything a pet family needs after the first hello</h2>
      </div>
      <div className="service-grid">
        {services.map((service) => (
          <article className="service-card" key={service.title}>
            <div className="service-icon">
              <Icon value={service.icon} />
            </div>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Services;
