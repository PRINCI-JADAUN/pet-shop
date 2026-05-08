import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import { catalogItems, categoryOptions } from './data';
import About from './sections/About';
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

  const categories = useMemo(
    () => ['All', ...new Set(catalogItems.map((item) => item.category))],
    [],
  );

  const visibleItems = useMemo(
    () =>
      filter === 'All'
        ? catalogItems
        : catalogItems.filter((item) => item.category === filter),
    [filter],
  );

  const selectedItem = catalogItems.find((item) => item.id === selectedId) ?? catalogItems[0];
  const activeCategory = catalogItems.find((item) => item.id === activeCategoryId);
  const activeOptions = activeCategory ? categoryOptions[activeCategory.id] ?? [] : [];
  const activeOption = activeOptions.find((item) => item.id === activeOptionId);

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
  };

  if (activeCategory && activeOption) {
    return (
      <div className="app">
        <Header onNavigateHome={backToBrowse} />
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
        <Header onNavigateHome={backToBrowse} />
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
      <Header onNavigateHome={backToBrowse} />
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
