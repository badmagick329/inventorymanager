import { API_ASSISTANT_ACTIVITY } from '@/consts/urls';
import { getAuthHeaders, handleRouteError, jsonResponse } from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) return errorResponse;
  try {
    const response = await axios.get(`${BASE_URL}${API_ASSISTANT_ACTIVITY}${new URL(req.url).search}`, { headers });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
