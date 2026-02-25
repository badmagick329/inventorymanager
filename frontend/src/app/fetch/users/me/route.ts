import { API_USERS_ME } from '@/consts/urls';
import {
  getAuthHeaders,
  handleRouteError,
  jsonResponse,
} from '@/utils/fetch-route';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;

export async function GET(req: Request) {
  const url = `${BASE_URL}${API_USERS_ME}?name_only=true`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const response = await axios.get(url, { headers });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: Request) {
  const url = `${BASE_URL}${API_USERS_ME}`;
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) {
    return errorResponse;
  }
  try {
    const data = await req.json();
    const payload = {
      password: data.password,
      newPassword: data.newPassword,
      newPassword2: data.newPassword2,
    };
    const response = await axios.patch(url, payload, {
      headers,
    });
    return jsonResponse(response.data, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
