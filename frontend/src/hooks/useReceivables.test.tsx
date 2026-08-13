import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useReceivables, { useVendorReceivables } from './useReceivables';

vi.mock('axios');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('receivables hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockResolvedValue({ data: { vendors: [] } });
  });

  it('sends the active location, search, age, and ordering filters', async () => {
    const { result } = renderHook(
      () =>
        useReceivables({
          locationId: '8',
          query: 'Ali Javaid',
          ageBucket: '90_plus',
          ordering: 'oldest_desc',
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axios.get).toHaveBeenCalledWith(
      '/fetch/receivables?location_id=8&q=Ali+Javaid&age_bucket=90_plus&ordering=oldest_desc'
    );
  });

  it('loads vendor sale details only when the row is expanded', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useVendorReceivables(12, '31_60', enabled),
      { initialProps: { enabled: false }, wrapper }
    );
    expect(axios.get).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axios.get).toHaveBeenCalledWith(
      '/fetch/receivables/vendors/12?age_bucket=31_60'
    );
  });
});
