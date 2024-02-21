import { NextResponse } from 'next/server';
import axios from 'axios';
const BASE_URL = process.env.BASE_URL;
import { API_ORDERS } from '@/consts/urls';
import { createErrorResponse } from '@/utils/responses';
import { isOrderResponseArray, isOrderPost } from '@/predicates';
import { createAuthHeader } from '@/utils/responses';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const url = `${BASE_URL}${API_ORDERS}/${params.id}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    if (!isOrderResponseArray(data)) {
      const message = 'There was an error with the server response';
      return createErrorResponse(new Error(message), message);
    }
    return new NextResponse(JSON.stringify(data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  const url = `${BASE_URL}${API_ORDERS}/${params.id}`;
  try {
    const body = await req.json();
    if (!isOrderPost(body)) {
      const message = 'Invalid request body';
      return createErrorResponse(new Error(message), message);
    }
    const response = await axios.post(url, body, { headers });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
