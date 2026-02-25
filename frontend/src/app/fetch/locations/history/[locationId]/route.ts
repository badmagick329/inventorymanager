import { API_LOCATION_HISTORY } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(
  req: Request,
  { params }: { params: { locationId: string } }
) {
  const url = `${BASE_URL}${API_LOCATION_HISTORY}/${params.locationId}`;
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
