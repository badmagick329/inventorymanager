import { API_LOCATION_HISTORY } from '@/consts/urls';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
import { NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;
import { createAuthHeader } from '@/utils/responses';

export async function GET(
  req: Request,
  { params }: { params: { locationId: string } }
) {
  const url = `${BASE_URL}${API_LOCATION_HISTORY}/${params.locationId}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    return new NextResponse(JSON.stringify(data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
