import React from 'react';
import { Sparkles, Zap, Boxes } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">3D PRINTING</h1>
        <p className="hero-subtitle">By Utero 3D Art</p>
        <p className="hero-description">
          Transform your digital designs into physical reality with precision 3D printing.
          <br />
          From prototypes to production, we bring your ideas to life.
        </p>
        
        <div className="hero-features">
          <div className="feature-item">
            <div className="feature-icon">
              <Sparkles size={48} />
            </div>
            <h3>High-Quality Prints</h3>
            <p>Professional-grade 3D printing with exceptional detail and finish</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <Zap size={48} />
            </div>
            <h3>Fast Turnaround</h3>
            <p>Quick production times without compromising on quality</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <Boxes size={48} />
            </div>
            <h3>Multiple Materials</h3>
            <p>Wide range of materials including PLA, ABS, resin, and more</p>
          </div>
        </div>

        <button onClick={scrollToCollection} className="hero-cta">
          View Our Work
        </button>
      </div>
    </section>
  );
};

export default Hero;
