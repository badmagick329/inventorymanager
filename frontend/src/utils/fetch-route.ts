import { createAuthHeader, createErrorResponse } from '@/utils/responses';
import { NextResponse } from 'next/server';

type Headers = Record<string, string>;

export function getAuthHeaders():
  | { headers: Headers; errorResponse?: undefined }
  | { headers?: undefined; errorResponse: NextResponse } {
  const { Authorization, ErrorResponse } = createAuthHeader();
  if (ErrorResponse) {
    return { errorResponse: ErrorResponse };
  }
  return { headers: { Authorization: Authorization as string } };
}

export function jsonResponse(
  data: unknown,
  status: number,
  headers?: Headers
): NextResponse {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function emptyResponse(
  status: number,
  headers?: Headers
): NextResponse {
  return new NextResponse(null, { status, headers });
}

export function handleRouteError(
  error: unknown,
  errorMessage?: string,
  headers?: Headers
): NextResponse {
  return createErrorResponse(error, errorMessage, headers);
}
