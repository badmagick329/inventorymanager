import { API_SALE_DETAIL } from '@/consts/urls';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
import { NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;
import { createAuthHeader } from '@/utils/responses';

export async function PATCH(
  req: Request,
  { params }: { params: { saleId: string } }
) {
  const url = `${BASE_URL}${API_SALE_DETAIL}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.patch(`${url}/${params.saleId}`, { headers });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { saleId: string } }
) {
  const url = `${BASE_URL}${API_SALE_DETAIL}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.delete(`${url}/${params.saleId}`, { headers });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
