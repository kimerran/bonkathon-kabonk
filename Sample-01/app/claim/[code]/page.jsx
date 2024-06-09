'use client';

import React, { use, useEffect, useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { Button, Table } from 'reactstrap';

import BonkLogo from '../../../public/bonk-logo.png';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default withPageAuthRequired(function CSRPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState({});
  const [claim, setClaim] = useState({});
  const code = window.location.pathname.split('/claim/').pop();
  // const router = useRouter();
  // const { code } = router.query
  // console.log('>>> code', code)

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
      setClaim(claim);
    } catch (error) {
      console.log('errr', error);
    }
  };

  const performClaim = async () => {
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
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

  const displayWallet = () => {
    if (wallet?.wallet) {
      return (
        <p>
          Wallet:{' '}
          <a target="_blank" href={`https://solscan.io/account/${wallet.wallet}`}>
            {wallet.wallet}
          </a>
        </p>
      );
    }
    return <p>Loading your wallet....</p>;
  };

  return (
    <div className="text-center">
      <h1>Claim Your Bonk!</h1>
      <Image src={BonkLogo} height={250} />
      {isLoading && <p>Loading...</p>}

      {!isLoading && (
        <>
          {displayWallet()}

          {claim && claim.id && <p>You have already claimed!</p>}

          {claim && claim.signature && (
            <p>
              Check your transaction{' '}
              <a target="_blank" href={`https://solscan.io/tx/${claim.signature}`}>
                here
              </a>
            </p>
          )}

          {!isLoading && claim && !claim.id && (
            <Button className="btn-danger" onClick={performClaim}>
              Claim $BONK
            </Button>
          )}

          <div className="content" style={{ marginTop: 48 }}>
            <p>
              Don't forget to <Link href="/links">create your links</Link> and share them with your friends to earn more
              <strong>&nbsp;$BONK!</strong>
            </p>
          </div>
        </>
      )}
    </div>
  );
});
