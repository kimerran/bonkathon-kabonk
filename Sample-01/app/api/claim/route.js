import { getAccessToken, withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

const apiUrl = process.env.KABONK_SERVICE_URL || 'http://localhost:3003';

export const GET = withApiAuthRequired(async function getClaims(req) {
  try {
    const res = new NextResponse();
    const session = await getSession();
    const response = await fetch(`${apiUrl}/claim?email=${session.user.email}`);

    console.log('response claims'   , response)

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
    const session = await getSession();
    const payload = {
      email: session.user.email
    };

    const response = await fetch(`${apiUrl}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // body data type must match "Content-Type" header
    });
    return NextResponse.json(await response.json(), res);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
});
