import { API_POSSIBLE_FRICTION } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET() {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const response = await axios.get(`${BASE_URL}${API_POSSIBLE_FRICTION}`, {
      headers,
    });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
