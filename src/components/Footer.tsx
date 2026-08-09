import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">3D.COLLECTION</div>
        <p className="footer-description">
          A digital collection of 3D models.
        </p>
        
        <div className="footer-info">
          <div className="footer-section">
            <h4>Developer</h4>
            <a href="https://maskhar.com" target="_blank" rel="noopener noreferrer">
              Mas Kharisman
            </a>
          </div>
          
          <div className="footer-section">
            <h4>Agency</h4>
            <a href="https://uteroindonesia.com" target="_blank" rel="noopener noreferrer">
              Utero Indonesia
            </a>
          </div>
          
          <div className="footer-section">
            <h4>AI Technology</h4>
            <a href="https://carubra.com" target="_blank" rel="noopener noreferrer">
              Carubra AI
            </a>
          </div>
        </div>
        
        <p className="footer-copyright">© 2026 3D Collection. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
