import { API_USERS } from '@/consts/urls';
import { createAuthHeader, createErrorResponse } from '@/utils/responses';
import axios from 'axios';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const url = `${BASE_URL}${API_USERS}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const response = await axios.get(url, { headers });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(req: Request) {
  const url = `${BASE_URL}${API_USERS}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const body = await req.json();
    const payload = {
      username: body.username,
      password: body.password,
    };
    const response = await axios.post(url, payload, { headers });
    return new NextResponse(JSON.stringify(response.data), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return new NextResponse(JSON.stringify(error.response?.data), {
        status: error.response?.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    return createErrorResponse(error);
  }
}
