import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
  const url = new URL(`${BASE_URL}/api/auth/login/`);
  const body = await req.json();
  const { username, password } = body;
  console.log(`${username} - ${password}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  console.log(`Response from django: ${response.status}`);
  if (response.status !== 200) {
    return new NextResponse(JSON.stringify({ message: 'error' }), {
      status: response.status,
    });
  }
  const responseJson = await response.json();
  const { expiry, token } = responseJson;
  const now = new Date();
  const expiryDate = new Date(expiry);
  const maxAge = (expiryDate.getTime() - now.getTime()) / 1000;
  const cookieSerialized = serialize('auth-token', JSON.stringify(token), {
    path: '/',
    httpOnly: true,
    maxAge,
    sameSite: true,
  });
  return new NextResponse(JSON.stringify({ message: 'hello from server' }), {
    status: 200,
    headers: {
      'Set-Cookie': cookieSerialized,
    },
  });
}
