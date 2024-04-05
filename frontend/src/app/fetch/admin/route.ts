import { API_IS_ADMIN } from '@/consts/urls';
import { createErrorResponse } from '@/utils/responses';
import { createAuthHeader } from '@/utils/responses';
import axios from 'axios';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

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
