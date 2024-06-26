import { getAccessToken, withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export const GET = withApiAuthRequired(async function shows(req) {
  try {
    const res = new NextResponse();
    console.log('accessToken', await getSession());

    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['read:shows']
    });
    const apiPort = process.env.API_PORT || 3001;



    const response = await fetch(`http://localhost:${apiPort}/api/shows`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const shows = await response.json();

    return NextResponse.json(shows, res);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
});
