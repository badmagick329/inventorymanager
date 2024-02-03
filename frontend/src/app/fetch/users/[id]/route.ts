import { API_USER_DETAIL } from '@/consts/urls';
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
  const url = `${BASE_URL}${API_USER_DETAIL}`;
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
