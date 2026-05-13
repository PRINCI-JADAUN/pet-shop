import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import { catalogItems, categoryOptions } from './data';
import { API_BASE_URL, getProducts, resolveImageUrl } from './api';
import About from './sections/About';
import Admin from './sections/Admin';
import Catalog from './sections/Catalog';
import Contact from './sections/Contact';
import CategoryPage from './sections/CategoryPage';
import Details from './sections/Details';
import Featured from './sections/Featured';
import Hero from './sections/Hero';
import OptionDetailPage from './sections/OptionDetailPage';
import Services from './sections/Services';

function App() {
  const [selectedId, setSelectedId] = useState('dog');
  const [filter, setFilter] = useState('All');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeOptionId, setActiveOptionId] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [backendProducts, setBackendProducts] = useState([]);

  const mappedCatalogItems = useMemo(() => {
    if (!backendProducts.length) return catalogItems;

    return backendProducts.map((item) => ({
      id: item.slug || item._id,
      _id: item._id,
      name: item.name,
      category: item.category,
      kind: item.kind,
      price: item.price,
      age: 'Varies',
      breed: item.category,
      care: item.care,
      visual: item.visual || 'visual-dog',
      image: resolveImageUrl(item.image),
      icon: '&#128062;',
      status: item.status || 'Available',
    }));
  }, [backendProducts]);

  const categories = useMemo(
    () => ['All', ...new Set(mappedCatalogItems.map((item) => item.category))],
    [mappedCatalogItems],
  );

  const visibleItems = useMemo(
    () =>
      filter === 'All'
        ? mappedCatalogItems
        : mappedCatalogItems.filter((item) => item.category === filter),
    [filter, mappedCatalogItems],
  );

  const selectedItem = mappedCatalogItems.find((item) => item.id === selectedId) ?? mappedCatalogItems[0];
  const activeCategory = mappedCatalogItems.find((item) => item.id === activeCategoryId);
  const activeOptions = activeCategory ? categoryOptions[activeCategory.id] ?? [] : [];
  const activeOption = activeOptions.find((item) => item.id === activeOptionId);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getProducts();
        setBackendProducts(products);
      } catch {
        setBackendProducts([]);
      }
    };
    loadProducts();

    const events = new EventSource(`${API_BASE_URL}/api/admin/events`);
    events.addEventListener('admin:update', (event) => {
      const payload = JSON.parse(event.data);
      if (Array.isArray(payload.products)) {
        setBackendProducts(payload.products);
      }
    });
    return () => events.close();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategoryId, activeOptionId]);

  const openCategory = (categoryId) => {
    setActiveCategoryId(categoryId);
    setActiveOptionId(null);
  };

  const backToBrowse = () => {
    setActiveCategoryId(null);
    setActiveOptionId(null);
    setShowAdmin(false);
  };

  const openAdmin = () => {
    setActiveCategoryId(null);
    setActiveOptionId(null);
    setShowAdmin(true);
  };

  if (showAdmin) {
    return (
      <div className="app">
        <Header onNavigateHome={backToBrowse} onOpenAdmin={openAdmin} />
        <main>
          <Admin onBack={backToBrowse} />
        </main>
      </div>
    );
  }

  if (activeCategory && activeOption) {
    return (
      <div className="app">
        <Header onNavigateHome={backToBrowse} onOpenAdmin={openAdmin} />
        <main>
          <OptionDetailPage
            category={activeCategory}
            option={activeOption}
            onBack={() => setActiveOptionId(null)}
            onBrowse={backToBrowse}
          />
        </main>
      </div>
    );
  }

  if (activeCategory) {
    return (
      <div className="app">
        <Header onNavigateHome={backToBrowse} onOpenAdmin={openAdmin} />
        <main>
          <CategoryPage
            category={activeCategory}
            options={activeOptions}
            onBack={backToBrowse}
            onOpenOption={setActiveOptionId}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onNavigateHome={backToBrowse} onOpenAdmin={openAdmin} />
      <main>
        <Hero onSelectItem={setSelectedId} />
        <Featured onSelectItem={setSelectedId} />
        <Catalog
          categories={categories}
          filter={filter}
          items={visibleItems}
          onFilterChange={setFilter}
          onOpenCategory={openCategory}
        />
        <Details item={selectedItem} />
        <Services />
        <About />
        <Contact />
      </main>
    </div>
  );
}

export default App;
