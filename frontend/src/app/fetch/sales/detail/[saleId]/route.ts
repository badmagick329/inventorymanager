import { API_SALE_DETAIL } from '@/consts/urls';
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
  { params }: { params: { saleId: string } }
) {
  const url = `${BASE_URL}${API_SALE_DETAIL}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const body = await req.json();
    const response = await axios.patch(`${url}/${params.saleId}`, body, {
      headers,
    });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { saleId: string } }
) {
  const url = `${BASE_URL}${API_SALE_DETAIL}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    await axios.delete(`${url}/${params.saleId}`, { headers });
    return emptyResponse(204);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { saleId: string } }
) {
  const url = `${BASE_URL}${API_SALE_DETAIL}/${params.saleId}`;
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
