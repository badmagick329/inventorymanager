import { NextResponse } from 'next/server';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
const BASE_URL = process.env.BASE_URL;
import { API_VENDORS } from '@/consts/urls';
import { createAuthHeader } from '@/utils/responses';

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const location_id = reqUrl.searchParams.get('location_id');
  let url = `${BASE_URL}${API_VENDORS}`;
  if (location_id) {
    url = `${BASE_URL}${API_VENDORS}/?location_id=${location_id}`;
    console.log('url', url);
  }
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.get(url, { headers });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
