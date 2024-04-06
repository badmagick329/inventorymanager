import { API_VENDORS } from '@/consts/urls';
import { createAuthHeader, createErrorResponse } from '@/utils/responses';
import axios from 'axios';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const location_id = reqUrl.searchParams.get('location_id');
  const order_id = reqUrl.searchParams.get('order_id');
  const url = new URL(`${BASE_URL}${API_VENDORS}`);
  if (location_id) {
    url.searchParams.append('location_id', location_id);
  }
  if (order_id) {
    url.searchParams.append('order_id', order_id);
  }
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.get(url.toString(), { headers });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(req: Request) {
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const body = await req.json();
    const payload = {
      name: body.name,
      locationId: body.locationId,
    };
    const response = await axios.post(`${BASE_URL}${API_VENDORS}`, payload, {
      headers,
    });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
