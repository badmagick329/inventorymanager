import { NEXT_USERS } from '@/consts/urls';
import { queryKeys } from '@/consts/queryKeys';
import { isUserArray } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useDeleteUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteUser,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, mutationVars) => {
      const { userId } = mutationVars;
      const previousData = queryClient.getQueryData(queryKeys.users);
      if (!(previousData && isUserArray(previousData))) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users });
        return;
      }
      const updatedData = previousData.filter((user) => user.id !== userId);
      queryClient.setQueryData(queryKeys.users, updatedData);
      queryClient.invalidateQueries({ queryKey: queryKeys.users, exact: true });
    },
    onError: (error) => {
      console.error(`error during delete user. ${error}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
  return mutation;
}

async function deleteUser({ userId }: { userId: number }) {
  return await axios.delete(`${NEXT_USERS}/${userId}`);
}
