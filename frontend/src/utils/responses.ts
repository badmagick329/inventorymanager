import { TOKEN_KEY } from '@/consts';
import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export function createErrorResponse(
  error: unknown,
  errorMessage?: string,
  headers?: Record<string, string>
) {
  let responseHeaders = {};
  let data = {};

  let axiosError = null;
  if (axios.isAxiosError(error)) {
    axiosError = error as AxiosError;
    if (axiosError?.response?.data) {
      data = axiosError.response.data;
    }
  }
  responseHeaders = {
    status: axiosError?.response?.status ?? 500,
  };

  if (headers) {
    responseHeaders = {
      ...responseHeaders,
      ...headers,
    };
  }

  const response = data ? data : { message: errorMessage ?? 'error' };

  return new NextResponse(JSON.stringify(response), responseHeaders);
}

export function createAuthHeader(): {
  Authorization?: string;
  ErrorResponse?: NextResponse;
} {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_KEY);
  if (!token) {
    return {
      ErrorResponse: new NextResponse(JSON.stringify({ message: 'no token' }), {
        status: 400,
      }),
    };
  }

  return {
    Authorization: `Token ${JSON.parse(token.value)}`,
  };
}
