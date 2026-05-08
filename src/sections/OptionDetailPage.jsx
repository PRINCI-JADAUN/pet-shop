import Icon from '../components/Icon';

function OptionDetailPage({ category, option, onBack, onBrowse }) {
  return (
    <section className="subpage detail-subpage section">
      <div className="page-actions">
        <button className="back-btn" type="button" onClick={onBack}>
          Back to {category.category}
        </button>
        <button className="secondary-btn" type="button" onClick={onBrowse}>
          Browse all
        </button>
      </div>

      <div className="info-stage">
        <div
          className={`info-model ${option.visual} ${category.image ? 'with-image' : ''}`}
          style={category.image ? { backgroundImage: `url(${category.image})` } : undefined}
        >
          <span className="photo-badge large">
            <Icon value={option.icon} />
          </span>
          <span>{category.category}</span>
        </div>
        <div className="info-copy">
          <p className="eyebrow">{category.category} detail page</p>
          <h1>{option.title}</h1>
          <p>{option.description}</p>
          <dl className="detail-list">
            <div>
              <dt>Price / Range</dt>
              <dd>{option.price}</dd>
            </div>
            <div>
              <dt>Age / Stage</dt>
              <dd>{option.age}</dd>
            </div>
            <div>
              <dt>Best For</dt>
              <dd>{option.bestFor}</dd>
            </div>
            <div>
              <dt>Care Note</dt>
              <dd>{option.care}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="related-panel">
        <div>
          <p className="eyebrow">Related content</p>
          <h2>Helpful picks for {option.title}</h2>
        </div>
        <div className="related-grid">
          {option.related.map((item) => (
            <article className="related-card" key={item}>
              <span aria-hidden="true">+</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OptionDetailPage;
