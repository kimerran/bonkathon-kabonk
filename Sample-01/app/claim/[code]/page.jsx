'use client';

import React, { use, useEffect, useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { Button, Table } from 'reactstrap';

export default withPageAuthRequired(function CSRPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState({});
  const [claim, setClaim] = useState({});

  const createWallet = async () => {
    try {
      const response = await fetch('/api/wallet', { method: 'POST' });
      setWallet(await response.json());
    } catch (error) {
      console.log('errr', error);
    }
  };
  const checkClaim = async () => {
    try {
      const response = await fetch('/api/claim', { method: 'GET' });

      const claim = await response.json();
      console.log('claim', claim);

      setClaim(claim);
    } catch (error) {
      console.log('errr', error);
    }
  };

  const performClaim = async () => {
    try {
      const response = await fetch('/api/claim', { method: 'POST' });
      setClaim(await response.json());
    } catch (error) {
      console.log('errr performClaim', error);
    }
  };

  useEffect(() => {
    createWallet();
    checkClaim();
    setIsLoading(false);
  }, []);

  return (
    <div>
      <h1>Claim Your Bonk!</h1>

      {isLoading && <p>Loading...</p>}

      {!isLoading && (
        <>
          <p>Wallet: {wallet.wallet}</p>
          <p>Claim: {claim.id}</p>

          {claim && claim.id && <p>You have already claimed!</p>}

          {!isLoading && claim && !claim.id && <Button onClick={performClaim}>Claim</Button>}
        </>
      )}
    </div>
  );
});
