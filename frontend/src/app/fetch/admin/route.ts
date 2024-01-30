import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
import { TOKEN_KEY } from '@/consts';
const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  // TODO: Replace with actual query
  const cookieStore = cookies();
  const url = `${BASE_URL}/api/auth/is-admin`;
  const token = cookieStore.get(TOKEN_KEY);
  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'no token' }), {
      status: 400,
    });
  }
  const authHeader = `Token ${JSON.parse(token.value)}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: authHeader },
    });
    return new NextResponse(JSON.stringify({}), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
