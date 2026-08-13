import { queryKeys } from '@/consts/queryKeys';
import { NEXT_RECEIVABLES } from '@/consts/urls';
import {
  ReceivablesBucketKey,
  ReceivablesOverview,
  VendorReceivablesResponse,
} from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type ReceivablesFilters = {
  locationId: string;
  query: string;
  ageBucket: ReceivablesBucketKey | '';
  ordering: string;
};

function getParams(filters: ReceivablesFilters) {
  const params = new URLSearchParams();
  if (filters.locationId) params.set('location_id', filters.locationId);
  if (filters.query) params.set('q', filters.query);
  if (filters.ageBucket) params.set('age_bucket', filters.ageBucket);
  if (filters.ordering) params.set('ordering', filters.ordering);
  return params;
}

export default function useReceivables(filters: ReceivablesFilters) {
  const params = getParams(filters);
  return useQuery({
    queryKey: queryKeys.receivables(params.toString()),
    queryFn: async () =>
      (
        await axios.get<ReceivablesOverview>(
          `${NEXT_RECEIVABLES}?${params.toString()}`
        )
      ).data,
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useVendorReceivables(
  vendorId: number,
  ageBucket: ReceivablesBucketKey | '',
  enabled: boolean
) {
  const params = new URLSearchParams();
  if (ageBucket) params.set('age_bucket', ageBucket);
  return useQuery({
    queryKey: queryKeys.vendorReceivables(vendorId, ageBucket || undefined),
    queryFn: async () =>
      (
        await axios.get<VendorReceivablesResponse>(
          `${NEXT_RECEIVABLES}/vendors/${vendorId}?${params.toString()}`
        )
      ).data,
    enabled,
    retry: false,
  });
}
