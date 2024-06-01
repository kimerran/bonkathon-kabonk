import { getAccessToken, withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export const GET = withApiAuthRequired(async function links(req) {
  try {
    const res = new NextResponse();
    const session = await getSession();
    console.log('session', session)

    const response = await fetch(`http://localhost:3003/link?email=${session.user.email}`);

    const links = await response.json();

    console.log('from api', links)


    return NextResponse.json(links, res);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
});
