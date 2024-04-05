import { API_ORDER_DETAIL } from '@/consts/urls';
import { createAuthHeader, createErrorResponse } from '@/utils/responses';
import axios from 'axios';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const url = `${BASE_URL}${API_ORDER_DETAIL}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const body = await req.json();
    const response = await axios.patch(`${url}/${params.orderId}`, body, {
      headers,
    });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const url = `${BASE_URL}${API_ORDER_DETAIL}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.delete(`${url}/${params.orderId}`, {
      headers,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const url = `${BASE_URL}${API_ORDER_DETAIL}/${params.orderId}`;
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
