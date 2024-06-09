import React from 'react';

const Hero = () => (
  <div className="hero my-5 text-center" data-testid="hero">
    <img src="logo.png" height="269px" />
    <h1 className="mb-4" data-testid="hero-title">
      Onboard your next MILLION hodlers
    </h1>

    <p className="lead" data-testid="hero-lead">
      KaBonk! lets you onboard your next million holders with ease. Distribute $BONK tokens to your community, track
      their progress, and reward them for their loyalty.
    </p>
  </div>
);

export default Hero;
