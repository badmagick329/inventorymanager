import { API_RECEIVABLES } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(
  req: Request,
  { params }: { params: { vendorId: string } }
) {
  const target = new URL(
    `${BASE_URL}${API_RECEIVABLES}/vendors/${params.vendorId}`
  );
  const source = new URL(req.url);
  source.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) return errorResponse;

  try {
    const response = await axios.get(target.toString(), { headers });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
