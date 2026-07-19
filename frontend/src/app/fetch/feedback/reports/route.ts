import { API_PROBLEM_REPORTS } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET() {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const response = await axios.get(`${BASE_URL}${API_PROBLEM_REPORTS}`, {
      headers,
    });
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
    const response = await axios.post(
      `${BASE_URL}${API_PROBLEM_REPORTS}`,
      body,
      {
        headers,
      }
    );
    return jsonResponse(response.data, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
