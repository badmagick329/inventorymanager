import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { createErrorResponse } from '@/app/utils/responses';
const BASE_URL = process.env.BASE_URL;
import { Location } from '@/app/utils/types';

const locations: Location[] = [
  {
    id: 1,
    name: 'Location 1',
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
  return new NextResponse(JSON.stringify(locations), {
    status: 200,
  });
  // const cookieStore = cookies();
  // const url = `${BASE_URL}/api/locations`;
  // const token = cookieStore.get('auth-token');
  // if (!token) {
  //   return new NextResponse(JSON.stringify({ message: 'no token' }), {
  //     status: 400,
  //   });
  // }
  // const authHeader = `Token ${JSON.parse(token.value)}`;
  // try {
  //   const response = await axios.get(url, {
  //     headers: { Authorization: authHeader },
  //   });
  //   return new NextResponse(JSON.stringify(response.data), {
  //     status: 200,
  //   });
  // } catch (error) {
  //   return createErrorResponse(error);
  // }
}
