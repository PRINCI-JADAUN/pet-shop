import Icon from '../components/Icon';
import { catalogItems } from '../data';

function Featured({ onSelectItem }) {
  return (
    <section className="featured section">
      <div className="section-heading">
        <p className="eyebrow">Featured pets and products</p>
        <h2>Quick picks customers ask for most</h2>
      </div>
      <div className="featured-track">
        {catalogItems.slice(0, 6).map((item) => (
          <button
            className="feature-chip"
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
          >
            <span
              className={`mini-visual ${item.visual} ${item.image ? 'with-image' : ''}`}
              style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
            >
              <Icon value={item.icon} />
            </span>
            <span>
              <strong>{item.name}</strong>
              <small>{item.price}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default Featured;
