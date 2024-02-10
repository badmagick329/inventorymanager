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
  console.log(`GET /orders/[id] called with id: ${params.id}`);
  const url = `${BASE_URL}${API_ORDERS}/${params.id}`;
  console.log(`Constructed URL: ${url}`);
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
  console.log(`POST /orders/[id] called with id: ${params.id}`);
  const headers = { Authorization };
  const url = `${BASE_URL}${API_ORDERS}/${params.id}`;
  console.log(`Posting to URL: ${url}`);
  try {
    const body = await req.json();
    console.log(`Request body: ${JSON.stringify(body)}`);
    if (!isOrderPost(body)) {
      const message = 'Invalid request body';
      console.log(message);
      return createErrorResponse(new Error(message), message);
    }
    console.log('Request body is valid');
    const response = await axios.post(url, body, { headers });
    console.log(`Response: ${JSON.stringify(response.data)}`);
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
