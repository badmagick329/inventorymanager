import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
const BASE_URL = process.env.BASE_URL;
import { TOKEN_KEY } from '@/consts';
import { API_USERS } from '@/consts/urls';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const url = `${BASE_URL}${API_USERS}`;
  const token = cookieStore.get(TOKEN_KEY);
  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'no token' }), {
      status: 400,
    });
  }
  const authHeader = `Token ${JSON.parse(token.value)}`;
  try {
    const headers = {
      Authorization: authHeader,
    };

    const response = await axios.get(url, { headers });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(req: Request) {
  const cookieStore = cookies();
  const url = `${BASE_URL}${API_USERS}`;
  const token = cookieStore.get(TOKEN_KEY);
  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'no token' }), {
      status: 400,
    });
  }
  const authHeader = `Token ${JSON.parse(token.value)}`;
  try {
    const headers = {
      Authorization: authHeader,
    };
    const body = await req.json();
    const payload = {
      username: body.username,
      password: body.password,
    };
    const response = await axios.post(url, payload, { headers });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return new NextResponse(JSON.stringify(error.response?.data), {
        status: error.response?.status,
      });
    }
    return createErrorResponse(error);
  }
}
