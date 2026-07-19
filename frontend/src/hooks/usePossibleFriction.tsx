import { NEXT_POSSIBLE_FRICTION, NEXT_PROBLEM_REPORTS } from '@/consts/urls';
import { queryKeys } from '@/consts/queryKeys';
import { PossibleFrictionSummary, ProblemReport } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function usePossibleFriction() {
  return useQuery({
    queryKey: queryKeys.feedback,
    queryFn: async () => {
      const [reports, summary] = await Promise.all([
        axios.get<ProblemReport[]>(NEXT_PROBLEM_REPORTS),
        axios.get<PossibleFrictionSummary[]>(NEXT_POSSIBLE_FRICTION),
      ]);
      return { reports: reports.data, summary: summary.data };
    },
    retry: false,
  });
}
