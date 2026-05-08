function CategoryPage({ category, options, onBack, onOpenOption }) {
  const pageLabel = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'].includes(category.category)
    ? 'Breeds'
    : 'Options';

  return (
    <section className="subpage section">
      <button className="back-btn" type="button" onClick={onBack}>
        Back to browse
      </button>

      <div className="subpage-hero">
        <div
          className={`subpage-visual ${category.visual} ${category.image ? 'with-image' : ''}`}
          style={category.image ? { backgroundImage: `url(${category.image})` } : undefined}
        />
        <div className="subpage-copy">
          <p className="eyebrow">{category.category} {pageLabel}</p>
          <h1>{category.name}</h1>
          <p>{category.care}</p>
          <div className="subpage-meta">
            <span>{category.price}</span>
            <span>{category.status}</span>
            <span>{options.length} choices</span>
          </div>
        </div>
      </div>

      <div className="option-grid">
        {options.map((option, index) => (
          <button
            className="option-card"
            key={option.id}
            style={{ '--tilt-delay': `${index * 90}ms` }}
            type="button"
            onClick={() => onOpenOption(option.id)}
          >
            <div
              className={`option-visual ${option.visual} ${option.image ? 'with-image' : ''}`}
              style={option.image ? { backgroundImage: `url(${option.image})` } : undefined}
            />
            <span className="tag">{pageLabel.slice(0, -1) || 'Option'}</span>
            <h3>{option.title}</h3>
            <p>{option.subtitle}</p>
            <div className="trait-row">
              {option.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>
            <strong>{option.price}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategoryPage;
