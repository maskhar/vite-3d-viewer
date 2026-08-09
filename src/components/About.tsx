import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <section id="about" className="about">
      <div className="about-content">
        <div className="about-header">
          <h2 className="about-title">UTERO 3D ART</h2>
          <p className="about-subtitle">Transforming Ideas into Immersive 3D Experiences</p>
        </div>

        <div className="about-body">
          <div className="about-section">
            <h3>Who We Are</h3>
            <p>
              Utero 3D Art is a creative division of Utero Indonesia, specializing in high-quality 
              3D modeling, visualization, and digital art. We bring imagination to life through 
              cutting-edge technology and artistic excellence.
            </p>
          </div>

          <div className="about-section">
            <h3>Our Expertise</h3>
            <div className="expertise-grid">
              <div className="expertise-item">
                <h4>3D Character Design</h4>
                <p>Creating memorable characters for games, animation, and marketing campaigns.</p>
              </div>
              <div className="expertise-item">
                <h4>Product Visualization</h4>
                <p>Photorealistic 3D renders for product showcases and e-commerce.</p>
              </div>
              <div className="expertise-item">
                <h4>Architectural Visualization</h4>
                <p>Bringing architectural concepts to life with stunning visual representations.</p>
              </div>
              <div className="expertise-item">
                <h4>Digital Sculpting</h4>
                <p>High-detail organic and hard-surface modeling for collectibles and art pieces.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h3>Our Process</h3>
            <p>
              We combine artistic vision with technical precision to deliver exceptional results. 
              From concept sketches to final renders, every project receives meticulous attention 
              to detail and professional craftsmanship.
            </p>
          </div>

          <div className="about-cta">
            <h3>Let's Create Together</h3>
            <p>Ready to bring your vision to life? Get in touch with us.</p>
            <div className="cta-buttons">
              <a 
                href="https://uteroindonesia.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cta-button primary"
              >
                Visit Utero Indonesia
              </a>
              <a 
                href="mailto:info@uteroindonesia.com" 
                className="cta-button secondary"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
