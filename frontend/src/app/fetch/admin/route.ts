import { NextResponse } from 'next/server';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
import { API_IS_ADMIN } from '@/consts/urls';
const BASE_URL = process.env.BASE_URL;
import { createAuthHeader } from '@/utils/responses';

export async function GET(req: Request) {
  const url = `${BASE_URL}${API_IS_ADMIN}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    await axios.get(url, { headers });
    return new NextResponse(JSON.stringify({}), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
