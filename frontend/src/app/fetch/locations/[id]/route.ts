import { API_LOCATIONS } from '@/consts/urls';
import {
  emptyResponse,
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const url = `${BASE_URL}${API_LOCATIONS}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    await axios.delete(`${url}/${params.id}`, { headers });
    return emptyResponse(204);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const response = await axios.patch(`${url}/${params.id}`, payload, {
      headers,
    });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
