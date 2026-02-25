import { API_ORDER_DETAIL } from '@/consts/urls';
import {
  emptyResponse,
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const url = `${BASE_URL}${API_ORDER_DETAIL}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const body = await req.json();
    const response = await axios.patch(`${url}/${params.orderId}`, body, {
      headers,
    });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const url = `${BASE_URL}${API_ORDER_DETAIL}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    await axios.delete(`${url}/${params.orderId}`, { headers });
    return emptyResponse(204);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const url = `${BASE_URL}${API_ORDER_DETAIL}/${params.orderId}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    return jsonResponse(data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
