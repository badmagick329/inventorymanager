import { describe, expect, it } from 'vitest';

import { emptyResponse, jsonResponse } from './fetch-route';

describe('fetch route helpers', () => {
  it('builds JSON response with explicit status and content-type', async () => {
    const response = jsonResponse({ ok: true }, 201);
    expect(response.status).toBe(201);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('builds empty responses while preserving status code', () => {
    const response = emptyResponse(204);
    expect(response.status).toBe(204);
  });
});
