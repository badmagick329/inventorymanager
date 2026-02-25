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
  { params }: { params: { id: string } }
) {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    await axios.delete(`${BASE_URL}${API_VENDORS}/${params.id}`, { headers });
    return emptyResponse(204);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const response = await axios.patch(
      `${BASE_URL}${API_VENDORS}/${params.id}`,
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
