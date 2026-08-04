import { NEXT_ASSISTANT_ACTIVITY } from '@/consts/urls';
import { AssistantActivityResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type AssistantActivityFilters = {
  page: number;
  userId: string;
  locationId: string;
  query: string;
  dateFrom: string;
  dateTo: string;
};

export default function useAssistantActivity(filters: AssistantActivityFilters) {
  const params = new URLSearchParams({ page: String(filters.page) });
  if (filters.userId) params.set('user_id', filters.userId);
  if (filters.locationId) params.set('location_id', filters.locationId);
  if (filters.query) params.set('q', filters.query);
  if (filters.dateFrom) params.set('date_from', filters.dateFrom);
  if (filters.dateTo) params.set('date_to', filters.dateTo);

  return useQuery({
    queryKey: ['assistant-activity', params.toString()],
    queryFn: async () => (await axios.get<AssistantActivityResponse>(`${NEXT_ASSISTANT_ACTIVITY}?${params}`)).data,
    placeholderData: (previousData) => previousData,
    retry: false,
  });
}
