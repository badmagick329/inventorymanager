import { NextResponse } from 'next/server';
import axios from 'axios';
const BASE_URL = process.env.BASE_URL;
import { createErrorResponse } from '@/utils/responses';
import { createAuthHeader } from '@/utils/responses';
import { API_SALES } from '@/consts/urls';
import { isSalePost, isSaleResponseArray } from '@/predicates';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const url = `${BASE_URL}${API_SALES}/${params.id}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    if (!isSaleResponseArray(data)) {
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
  const url = `${BASE_URL}${API_SALES}/${params.id}`;
  try {
    const body = await req.json();
    if (!isSalePost(body)) {
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
