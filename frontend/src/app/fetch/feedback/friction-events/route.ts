import { API_FRICTION_EVENTS } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const body = await req.json();
    const response = await axios.post(
      `${BASE_URL}${API_FRICTION_EVENTS}`,
      body,
      {
        headers,
      }
    );
    return jsonResponse(response.data, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
