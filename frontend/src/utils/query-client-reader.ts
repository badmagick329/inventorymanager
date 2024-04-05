import { isOrderResponseArray, isSaleResponseArray } from '@/predicates';
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

export function getSaleBySaleId(
  saleId: string,
  orderId: string,
  queryClient: QueryClient
) {
  let sales = queryClient.getQueryData(['sales', orderId]);
  const saleIdNumber = Number(saleId);
  if (!isSaleResponseArray(sales)) {
    return null;
  }
  for (const sale of sales) {
    if (sale.id === saleIdNumber) {
      return sale;
    }
  }
}
