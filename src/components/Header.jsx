import { navItems } from '../data';

function Header({ onNavigateHome, onOpenAdmin }) {
  return (
    <header className="site-header">
      <nav className="navbar">
        <a className="brand" href="#home" onClick={onNavigateHome}>
          <span className="brand-mark">P</span>
          <span>PawSphere Pet Shop</span>
        </a>
        <div className="nav-links">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={onNavigateHome}>
              {item.label}
            </a>
          ))}
        </div>
        <a className="nav-cta" href="#contact" onClick={onNavigateHome}>
          Book Visit
        </a>
        <button className="admin-link" type="button" onClick={onOpenAdmin}>
          Admin
        </button>
      </nav>
    </header>
  );
}

export default Header;
