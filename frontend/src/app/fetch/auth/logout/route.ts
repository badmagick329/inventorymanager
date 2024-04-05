import { TOKEN_KEY } from '@/consts';
import { API_LOGOUT } from '@/consts/urls';
import { createAuthHeader, createErrorResponse } from '@/utils/responses';
import axios from 'axios';
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
  const url = `${BASE_URL}${API_LOGOUT}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  const responseHeaders = {
    'Set-Cookie': serialize(TOKEN_KEY, '', {
      path: '/',
      httpOnly: true,
      maxAge: 0,
      sameSite: true,
    }),
  };
  try {
    const response = await axios.post(
      url,
      {},
      {
        headers,
      }
    );
    return new NextResponse(JSON.stringify({ message: 'success' }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return createErrorResponse(error, '', responseHeaders);
  }
}
