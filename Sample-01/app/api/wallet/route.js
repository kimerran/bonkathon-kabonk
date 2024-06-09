import { getAccessToken, withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { apiGet } from '../fetchClient';

const apiUrl = process.env.KABONK_SERVICE_URL || 'http://localhost:3003';

export const POST = withApiAuthRequired(async function wallet(req) {
    try {
      const res = new NextResponse();
      const session = await getSession();
      const payload = {
        email: session.user.email
      };
  
      const response = await fetch(`${apiUrl}/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload) // body data type must match "Content-Type" header
      });

      const wallet = await response.json();
      
      console.log('wallet', wallet  )
      const { public: pubkey } = wallet;
      // check ATA if existing
      const getAtaResponse =  await apiGet(`${apiUrl}/wallet/ata/${pubkey}`);

      console.log('getAtaResponse', getAtaResponse)

      return NextResponse.json({
        wallet: wallet.public,
        email: session.user.email,
        getAtaResponse
      }, res);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
  });
  