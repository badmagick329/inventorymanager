import { NextResponse } from 'next/server';
import axios from 'axios';
const BASE_URL = process.env.BASE_URL;
import { createErrorResponse } from '@/utils/responses';
import { createAuthHeader } from '@/utils/responses';
import { API_SALES } from '@/consts/urls';
import { isSaleResponseArray } from '@/predicates';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log(`GET /orders/[id] called with id: ${params.id}`);
  const url = `${BASE_URL}${API_SALES}/${params.id}`;
  console.log(`Constructed URL: ${url}`);
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
