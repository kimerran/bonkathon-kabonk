import React from 'react';

const Footer = () => (
  <footer className="bg-light p-3 text-center" data-testid="footer">
    <div className="logox" data-testid="footer-logo" />
    <p data-testid="footer-text">
      Submission to Bonkathon by <a href="https://x.com/k1merran">@k1merran</a>
    </p>
  </footer>
);

export default Footer;
