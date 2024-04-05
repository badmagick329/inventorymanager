import { API_VENDORS } from '@/consts/urls';
import { createAuthHeader, createErrorResponse } from '@/utils/responses';
import axios from 'axios';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.delete(
      `${BASE_URL}${API_VENDORS}/${params.id}`,
      {
        headers,
      }
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const response = await axios.patch(
      `${BASE_URL}${API_VENDORS}/${params.id}`,
      payload,
      {
        headers,
      }
    );
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
