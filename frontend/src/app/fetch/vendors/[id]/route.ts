import { API_VENDORS } from '@/consts/urls';
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { headers, errorResponse } = await getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    await axios.delete(`${BASE_URL}${API_VENDORS}/${id}`, { headers });
    return emptyResponse(204);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { headers, errorResponse } = await getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const body = await req.json();
    const payload = {
      name: body.name,
      locationId: body.locationId,
    };
    const response = await axios.patch(
      `${BASE_URL}${API_VENDORS}/${id}`,
      payload,
      {
        headers,
      }
    );
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
