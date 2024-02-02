import { API_LOCATION_DETAIL } from '@/consts/urls';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const BASE_URL = process.env.BASE_URL;
import { TOKEN_KEY } from '@/consts';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const url = `${BASE_URL}${API_LOCATION_DETAIL}`;
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
    const response = await axios.delete(`${url}/${params.id}`, { headers });
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const url = `${BASE_URL}${API_LOCATION_DETAIL}`;
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
      name: body.location,
      users: body.usernames,
    };
    const response = await axios.patch(`${url}/${params.id}`, payload, {
      headers,
    });
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
