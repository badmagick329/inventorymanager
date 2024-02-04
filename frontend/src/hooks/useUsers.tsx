import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_USERS } from '@/consts/urls';
import axios from 'axios';
import { SHORT_STALE_TIME } from '@/consts';

export default function useUsers() {
  const query = useQuery({
    queryKey: ['users'],
    queryFn: () => axios.get(NEXT_USERS),
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return query;
}
