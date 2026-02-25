import { API_LOCATIONS } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const url = `${BASE_URL}${API_LOCATIONS}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const response = await axios.get(url, { headers });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  const url = `${BASE_URL}${API_LOCATIONS}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const body = await req.json();
    const payload = {
      name: body.location,
      users: body.usernames,
    };
    const response = await axios.post(url, payload, { headers });
    return jsonResponse(response.data, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
