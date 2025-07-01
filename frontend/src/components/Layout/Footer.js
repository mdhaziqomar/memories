import React from 'react';
import { Heart, Code } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="copyright">
            <p className="mb-0">
              © {currentYear} Chung Hua Middle School BSB - Media Management System
            </p>
          </div>
          <div className="developer-credit">
            <p className="mb-0 d-flex align-items-center gap-2">
              <Code size={16} /> with <Heart size={16} color="var(--ctp-red)" /> by 
              <strong>Haziq Omar</strong> - IT Department
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 