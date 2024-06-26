import { API_USERS } from '@/consts/urls';
import { createAuthHeader, createErrorResponse } from '@/utils/responses';
import axios from 'axios';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const url = `${BASE_URL}${API_USERS}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.delete(`${url}/${params.id}`, { headers });
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}
