import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { createErrorResponse } from '@/utils/responses';
const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
  const url = `${BASE_URL}/api/auth/login`;
  const body = await req.json();
  const { username, password } = body;
  try {
    const response = await axios.post(url, { username, password });
    return createLoginResponse(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}

function createLoginResponse(response: AxiosResponse<any, any>) {
  const { expiry, token } = response.data;
  const now = new Date();
  const expiryDate = new Date(expiry);
  const maxAge = (expiryDate.getTime() - now.getTime()) / 1000;
  const authCookieSerialized = serialize('auth-token', JSON.stringify(token), {
    path: '/',
    httpOnly: true,
    maxAge,
    sameSite: true,
  });
  return new NextResponse(JSON.stringify({}), {
    status: 200,
    headers: {
      'Set-Cookie': authCookieSerialized,
    },
  });
}
