import Icon from '../components/Icon';

function Catalog({ categories, filter, items, onFilterChange, onOpenCategory }) {
  return (
    <section className="catalog section" id="catalog">
      <div className="section-heading">
        <p className="eyebrow">Pets and products page</p>
        <h2>Browse dogs, cats, birds, fish, rabbits, food, toys, and accessories</h2>
      </div>

      <div className="filter-row" aria-label="Catalog filters">
        {categories.map((category) => (
          <button
            className={filter === category ? 'active' : ''}
            key={category}
            type="button"
            onClick={() => onFilterChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="catalog-grid">
        {items.map((item) => (
          <button
            className="catalog-card browse-card"
            key={item.id}
            type="button"
            onClick={() => onOpenCategory(item.id)}
          >
            <div
              className={`photo-panel ${item.visual} ${item.image ? 'with-image' : ''}`}
              style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
            >
              <span className="photo-badge">
                <Icon value={item.icon} />
              </span>
            </div>
            <div className="card-body">
              <span className="tag">{item.kind}</span>
              <h3>{item.name}</h3>
              <p>{item.care}</p>
              <div className="price-row">
                <strong>{item.price}</strong>
                <span>{item.status}</span>
              </div>
              <div className="card-actions">
                <span className="text-link">Open {item.category} page</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default Catalog;
