import { getAccessToken, withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { apiGet, apiPost } from '../fetchClient';
// import bodyParser from 'body-parser';

const apiUrl = process.env.KABONK_SERVICE_URL || 'http://localhost:3003';

export const GET = withApiAuthRequired(async function getClaims(req) {
  try {
    const res = new NextResponse();
    const session = await getSession();
    const response = await fetch(`${apiUrl}/claim?email=${session.user.email}`);

    console.log('response claims', response);

    try {
      const claims = await response.json();
      return NextResponse.json(claims, res);
    } catch (error) {
      // probably empty
      return NextResponse.json({}, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
});

export const POST = withApiAuthRequired(async function performClaimToken(req) {
  try {
    const res = new NextResponse();
    const { code } = await req.json();

    const session = await getSession();
    const payload = {
      email: session.user.email,
      code // link code used on this claim
    };

    console.log('performing POST claim', payload);
    const { id } = await apiPost(`${apiUrl}/claim`, payload);

    // get wallet
    console.log('performing GET wallet', payload);
    const { public: publicKey } = await apiGet(`${apiUrl}/wallet?email=${session.user.email}`);

    // send token
    console.log('performing POST send-token', payload);
    const sendToken = await apiPost(`${apiUrl}/send-token`, {
      recipient: publicKey,
      amount: 2e5, // TODO: modify this amount?
      claimId: id.split('claim:')[1]
    });

    const claim = await apiGet(`${apiUrl}/claim?email=${session.user.email}`);

    return NextResponse.json(claim, res);


  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
});


export const config = {
  api: {
    bodyParser:  true
  }
}