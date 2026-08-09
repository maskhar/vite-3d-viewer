import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">3D.COLLECTION</div>
        <nav className="header-nav">
          <button onClick={() => scrollToSection('collection')} className="nav-link">
            Collection
          </button>
          <button onClick={() => scrollToSection('about')} className="nav-link">
            About
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
