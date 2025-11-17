import { API_USERS_ME } from '@/consts/urls';
import { createAuthHeader, createErrorResponse } from '@/utils/responses';
import axios from 'axios';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const url = `${BASE_URL}${API_USERS_ME}?name_only=true`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
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

export async function PATCH(req: Request) {
  const url = `${BASE_URL}${API_USERS_ME}`;
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return ErrorResponse;
  }
  const headers = { Authorization };
  try {
    const data = await req.json();
    const payload = {
      password: data.password,
      newPassword: data.newPassword,
      newPassword2: data.newPassword2,
    };
    const response = await axios.patch(url, payload, {
      headers,
    });
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
