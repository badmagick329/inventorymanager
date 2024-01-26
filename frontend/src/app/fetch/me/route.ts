import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const cookieStore = cookies();
  const url = `${BASE_URL}/api/me`;
  const token = cookieStore.get('auth-token');
  if (!token) {
    return invalidResponse('No token', 401);
  }
  const authHeader = `Token ${JSON.parse(token.value)}`;

  console.log(`Auth header will be ${authHeader}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
  });
  console.log(`Response from django: ${response.status}`);
  if (response.status !== 200) {
    return invalidResponse('error', response.status);
  }
  const responseJson = await response.json();
  return new NextResponse(JSON.stringify(responseJson), {
    status: 200,
  });
}

function invalidResponse(message: string, status: number) {
  return new NextResponse(
    JSON.stringify({
      message,
    }),
    {
      status,
    }
  );
}
