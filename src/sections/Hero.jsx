import Icon from '../components/Icon';
import { catalogItems, stats } from '../data';

function Hero({ onSelectItem }) {
  return (
    <section className="hero section" id="home">
      <div className="hero-copy">
        <p className="eyebrow">Premium pet shop and adoption center</p>
        <h1>PawSphere brings healthy pets, trusted care, and joyful supplies together.</h1>
        <p>
          Explore adoptable dogs, cats, birds, fish, rabbits, pet food, toys, and daily
          accessories with friendly guidance from a trained care team.
        </p>
        <div className="hero-actions">
          <a className="primary-btn" href="#catalog">
            Shop Pets & Products
          </a>
          <a className="secondary-btn" href="#services">
            View Services
          </a>
        </div>
        <div className="stats-grid">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="hero-stage" aria-label="3D featured pet display">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="central-podium">
          <Icon value="&#128054;" />
          <strong>Featured Friends</strong>
        </div>
        {catalogItems.slice(0, 5).map((item, index) => (
          <button
            className={`floating-tile tile-${index + 1}`}
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
          >
            <Icon value={item.icon} />
            <span>{item.category}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default Hero;
