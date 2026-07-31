import { API_USERS } from '@/consts/urls';
import { getAuthHeaders } from '@/utils/fetch-route';

const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
  const { headers, errorResponse } = getAuthHeaders();
  if (errorResponse) return errorResponse;
  try {
    const response = await fetch(`${BASE_URL}${API_USERS}/assistant/messages`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(await req.json()),
    });
    if (!response.ok || !response.body) return new Response(await response.text(), { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' } });
    return new Response(response.body, { status: response.status, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' } });
  } catch {
    return Response.json({ error: 'The assistant service is unavailable.' }, { status: 503 });
  }
}
