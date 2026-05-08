import { trustBadges } from '../data';

function About() {
  return (
    <section className="about section" id="about">
      <div className="about-panel">
        <div>
          <p className="eyebrow">About PawSphere</p>
          <h2>A neighborhood pet shop built around responsible care.</h2>
          <p>
            PawSphere started as a small adoption-first shop and grew into a complete pet care
            destination. Our team helps families choose the right companion, prepares starter kits,
            keeps records transparent, and follows up after adoption or purchase.
          </p>
        </div>
        <div className="trust-grid">
          {trustBadges.map((badge) => (
            <div className="trust-badge" key={badge}>
              <span aria-hidden="true">&#10003;</span>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
