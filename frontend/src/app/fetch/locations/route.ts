import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { createErrorResponse } from '@/utils/responses';
const BASE_URL = process.env.BASE_URL;
import { Location } from '@/types';
import { TOKEN_KEY } from '@/consts';
import { API_LOCATIONS } from '@/consts/urls';

const locations: Location[] = [
  {
    id: 1,
    name: 'Very long location name that is long',
  },
  {
    id: 2,
    name: 'Location 2',
  },
  {
    id: 3,
    name: 'Location 3',
  },
];

export async function GET(req: Request) {
  // TODO: Replace with actual query
  const cookieStore = cookies();
  const url = `${BASE_URL}${API_LOCATIONS}`;
  const token = cookieStore.get(TOKEN_KEY);
  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'no token' }), {
      status: 400,
    });
  }
  const authHeader = `Token ${JSON.parse(token.value)}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: authHeader },
    });
    const resp = {
      locations,
    };
    return new NextResponse(JSON.stringify(resp), {
      status: 200,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
