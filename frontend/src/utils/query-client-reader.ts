import { isLocationArray, isOrderResponseArray } from '@/predicates';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

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
  const locations = queryClient.getQueryData(['locations']);
  if (!isLocationArray(locations)) {
    return [] as string[];
  }
  let selectedNames = [] as string[];
  for (const location of locations) {
    if (location.id === locationId) {
      return location.users || ([] as string[]);
    }
  }
  return selectedNames;
}

export function getOrderByOrderId(
  orderId: string,
  locationId: string,
  queryClient: QueryClient
) {
  let orders = queryClient.getQueryData(['orders', locationId]);
  const orderIdNumber = Number(orderId);
  if (!isOrderResponseArray(orders)) {
    return null;
  }
  for (const order of orders) {
    if (order.id === orderIdNumber) {
      return order;
    }
  }
}
