import { NEXT_USERS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { isUserArray } from '@/predicates';

export default function useDeleteUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteUser,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, mutationVars) => {
      const { userId } = mutationVars;
      const previousData = queryClient.getQueryData(['users']);
      if (!(previousData && isUserArray(previousData))) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        return;
      }
      const updatedData = previousData.filter((user) => user.id !== userId);
      queryClient.setQueryData(['users'], updatedData);
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true });
    },
    onError: (error) => {
      console.error(`error during delete user. ${error}`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  return mutation;
}

async function deleteUser({ userId }: { userId: number }) {
  return await axios.delete(`${NEXT_USERS}/${userId}`);
}
