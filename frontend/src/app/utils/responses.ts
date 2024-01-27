import { NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

export function createErrorResponse(error: unknown, errorMessage?: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return new NextResponse(
      JSON.stringify({ message: errorMessage ?? 'error' }),
      {
        status: axiosError.response?.status,
      }
    );
  }
  return new NextResponse(
    JSON.stringify({ message: errorMessage ?? 'error' }),
    {
      status: 500,
    }
  );
}
