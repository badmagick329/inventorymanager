import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_USERS } from '@/consts/urls';
import axios from 'axios';

export default function useUsers() {
  const query = useQuery({
    queryKey: ['users'],
    queryFn: () => axios.get(NEXT_USERS),
    retry: false,
    placeholderData: keepPreviousData,
  });
  return query;
}
