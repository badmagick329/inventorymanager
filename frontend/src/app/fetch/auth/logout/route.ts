import { serialize } from 'cookie';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { createErrorResponse } from '@/app/utils/responses';
const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');
  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'no token' }), {
      status: 400,
    });
  }
  const authToken = JSON.parse(token.value);
  const url = `${BASE_URL}/api/auth/logout`;
  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: { Authorization: `Token ${authToken}` },
      }
    );
    return new NextResponse(JSON.stringify({}), {
      status: 200,
      headers: {
        'Set-Cookie': serialize('auth-token', '', {
          path: '/',
          httpOnly: true,
          maxAge: 0,
          sameSite: true,
        }),
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
