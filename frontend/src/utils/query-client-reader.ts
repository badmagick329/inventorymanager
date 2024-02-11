import { isOrderResponseArray } from '@/predicates';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { Location } from '@/types';

export async function getOrderById(locationId: number, orderId: number) {
  const queryClient = useQueryClient();
  let orders = queryClient.getQueryData(['orders', locationId]);
  if (!orders) {
    await queryClient.refetchQueries({
      queryKey: ['orders', locationId],
    });
    orders = queryClient.getQueryData(['orders', locationId]);
  }
  if (!isOrderResponseArray(orders)) {
    return null;
  }
  for (const order of orders) {
    if (order.id === orderId) {
      return order;
    }
  }
}

export function getUsersWithAccessTo(locationId?: number) {
  if (!locationId) {
    return [] as string[];
  }
  const queryClient = useQueryClient();
  const locationQuery = queryClient.getQueryData(['locations']) as
    | AxiosResponse<any, any>
    | undefined;
  let selectedNames = [] as string[];
  if (locationQuery) {
    const locations = locationQuery.data as Location[];
    for (const location of locations) {
      if (location.id === locationId) {
        return location.users || ([] as string[]);
      }
    }
  }
  return selectedNames;
}
