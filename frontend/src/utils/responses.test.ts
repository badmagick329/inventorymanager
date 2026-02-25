import { describe, expect, it } from 'vitest';

describe('createErrorResponse', () => {
  it('returns 500 with empty payload for non-axios errors', async () => {
    const { createErrorResponse } = await import('./responses');
    const response = createErrorResponse(new Error('boom'));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({});
  });

  it('keeps non-axios payload behavior even with custom message/headers', async () => {
    const { createErrorResponse } = await import('./responses');
    const response = createErrorResponse(new Error('boom'), 'bad', {
      'X-Test': 'yes',
    });
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({});
  });
});
