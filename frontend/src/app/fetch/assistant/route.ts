import { API_USERS, NEXT_LOGIN } from '@/consts/urls';
import { getAuthHeaders, handleRouteError, jsonResponse } from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) return errorResponse;
  try {
    const response = await axios.get(`${BASE_URL}${API_USERS}/assistant${new URL(req.url).search}`, { headers });
    return jsonResponse(response.data, 200);
  } catch (error) { return handleRouteError(error); }
}

export async function DELETE(req: Request) {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) return errorResponse;
  try { await axios.delete(`${BASE_URL}${API_USERS}/assistant${new URL(req.url).search}`, { headers }); return new Response(null, { status: 204 }); }
  catch (error) { return handleRouteError(error); }
}
