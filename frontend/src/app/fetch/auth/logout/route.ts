import { TOKEN_KEY } from '@/consts';
import { API_LOGOUT } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';
import { serialize } from 'cookie';

const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
  const url = `${BASE_URL}${API_LOGOUT}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  const responseHeaders = {
    'Set-Cookie': serialize(TOKEN_KEY, '', {
      path: '/',
      httpOnly: true,
      maxAge: 0,
      sameSite: true,
    }),
    'Content-Type': 'application/json',
  };
  try {
    await axios.post(url, {}, { headers });
    return jsonResponse({ message: 'success' }, 200, responseHeaders);
  } catch (error) {
    return handleRouteError(error, '', responseHeaders);
  }
}
