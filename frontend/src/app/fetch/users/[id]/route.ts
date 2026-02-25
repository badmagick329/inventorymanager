import { API_USERS } from '@/consts/urls';
import {
  emptyResponse,
  getAuthHeaders,
  handleRouteError,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const url = `${BASE_URL}${API_USERS}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const response = await axios.delete(`${url}/${params.id}`, { headers });
    if (response.status === 204) {
      return emptyResponse(204);
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
