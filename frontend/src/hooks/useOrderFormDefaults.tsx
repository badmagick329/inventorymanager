import { isOrderResponse } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderByOrderId } from '@/utils/query-client-reader';
import { NEXT_ORDER_DETAIL } from '@/consts/urls';
import axios from 'axios';

type useOrderFormDefaultsProps = {
  locationId: string;
  orderId?: string;
};

export default function useOrderFormDefaults({
  locationId,
  orderId,
}: useOrderFormDefaultsProps) {
  const queryClient = useQueryClient();

  async function fetchDefaults() {
    if (!orderId) {
      return createOrderDefaultValues();
    }
    const order = getOrderByOrderId(locationId, orderId, queryClient);
    if (order) {
      return createOrderDefaultValues(order);
    }
    try {
      const response = await axios.get(`${NEXT_ORDER_DETAIL}/${orderId}`);
      return createOrderDefaultValues(response.data);
    } catch (error) {
      return createOrderDefaultValues();
    }
  }

  const mutation = useMutation({
    mutationFn: fetchDefaults,
    retry: false,
    onSettled: () => {
      console.log('settled createOrderDefaultValues');
    },
    onSuccess: (_, data) => {
      console.log('successfully created order default values');
      queryClient.setQueryData(['orders', locationId, orderId], data);
    },
    onError: (error) => {
      console.log(`error during order defaults. ${error}`);
    },
  });
  return mutation;
}

export function createOrderDefaultValues(order?: any) {
  if (!isOrderResponse(order)) {
    return {
      name: '',
      date: '',
      quantity: '',
      cost: '',
      salePrice: '',
    };
  }
  return {
    name: order.name,
    date: order.date || '',
    quantity: order.quantity.toString(),
    cost: order.pricePerItem.toString(),
    salePrice: order.currentSalePrice.toString(),
  };
}
