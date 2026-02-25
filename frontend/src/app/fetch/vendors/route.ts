import { API_VENDORS } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const location_id = reqUrl.searchParams.get('location_id');
  const order_id = reqUrl.searchParams.get('order_id');
  const url = new URL(`${BASE_URL}${API_VENDORS}`);
  if (location_id) {
    url.searchParams.append('location_id', location_id);
  }
  if (order_id) {
    url.searchParams.append('order_id', order_id);
  }
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const response = await axios.get(url.toString(), { headers });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const body = await req.json();
    const payload = {
      name: body.name,
      locationId: body.locationId,
    };
    const response = await axios.post(`${BASE_URL}${API_VENDORS}`, payload, {
      headers,
    });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
