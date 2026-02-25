import { API_SALES } from '@/consts/urls';
import { isSalePost, isSaleResponseArray } from '@/predicates';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const url = `${BASE_URL}${API_SALES}/${params.id}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    if (!isSaleResponseArray(data)) {
      const message = 'There was an error with the server response';
      return handleRouteError(new Error(message), message);
    }
    return jsonResponse(data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  const url = `${BASE_URL}${API_SALES}/${params.id}`;
  try {
    const body = await req.json();
    if (!isSalePost(body)) {
      const message = 'Invalid request body';
      return handleRouteError(new Error(message), message);
    }
    const response = await axios.post(url, body, { headers });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
