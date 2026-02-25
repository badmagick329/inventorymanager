import { API_IS_ADMIN } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const url = `${BASE_URL}${API_IS_ADMIN}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    await axios.get(url, { headers });
    return jsonResponse({}, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
