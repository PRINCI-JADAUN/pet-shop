import Icon from '../components/Icon';
import myPetImage from '../assets/pet.jpg';

function Details({ item }) {
  return (
        <section className="details section" id="details">
      <div className="detail-card">
        <div className={`detail-visual ${item.visual}`}>
          <img src={myPetImage} alt="Pet" />  {/* Replace or add alongside Icon */}
          <Icon value={item.icon} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">Individual pet/product details</p>
          <h2>{item.name}</h2>
          <p>{item.care}</p>
          <dl className="detail-list">
            <div>
              <dt>Category</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt>Price / Adoption</dt>
              <dd>{item.price}</dd>
            </div>
            <div>
              <dt>Age / Stage</dt>
              <dd>{item.age}</dd>
            </div>
            <div>
              <dt>Breed / Fit</dt>
              <dd>{item.breed}</dd>
            </div>
          </dl>
          <a className="primary-btn" href="#contact">
            Ask About {item.name}
          </a>
        </div>
      </div>
    </section>
  );
}

export default Details;
