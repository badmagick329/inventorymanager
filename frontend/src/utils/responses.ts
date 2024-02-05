import { NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { TOKEN_KEY } from '@/consts';

export function createErrorResponse(
  error: unknown,
  errorMessage?: string,
  headers?: Record<string, string>
) {
  let responseHeaders = {};

  let axiosError = null;
  if (axios.isAxiosError(error)) {
    axiosError = error as AxiosError;
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

  return new NextResponse(
    JSON.stringify({ message: errorMessage ?? 'error' }),
    responseHeaders
  );
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
