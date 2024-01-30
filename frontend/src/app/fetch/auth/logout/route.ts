import { serialize } from 'cookie';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
import { TOKEN_KEY } from '@/consts';
const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
  console.log('logout route');
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_KEY);
  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'no token' }), {
      status: 400,
    });
  }
  console.log(`token: ${JSON.stringify(token)}`);
  const authToken = JSON.parse(token.value);
  const url = `${BASE_URL}/api/auth/logout`;
  const headers = {
    'Set-Cookie': serialize(TOKEN_KEY, '', {
      path: '/',
      httpOnly: true,
      maxAge: 0,
      sameSite: true,
    }),
  };
  try {
    console.log('Sending logout request');
    const response = await axios.post(
      url,
      {},
      {
        headers: { Authorization: `Token ${authToken}` },
      }
    );
    console.log(`logout result: ${JSON.stringify(response.data)}`);
    return new NextResponse(JSON.stringify({}), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return createErrorResponse(error, '', headers);
  }
}
