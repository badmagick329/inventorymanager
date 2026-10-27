import { NEXT_ORDER_DETAIL } from '@/consts/urls';
import { isOrderResponse } from '@/predicates';
import { queryKeys } from '@/consts/queryKeys';
import { getOrderByOrderId } from '@/utils/query-client-reader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import useOrders from './useOrders';

type useOrderFormDefaultsProps = {
  locationId: string;
  orderId?: string;
};

/**
 * Loads the item form's starting values once per opening. The form mounts
 * only after this resolves and receives plain `defaultValues`: handing
 * react-hook-form an async loader lets Strict Mode's second mount reset the
 * fields after the user has started typing. `gcTime: 0` drops the entry when
 * the form closes, so the next opening reads the current item.
 */
export default function useOrderFormDefaults({
  locationId,
  orderId,
}: useOrderFormDefaultsProps) {
  const queryClient = useQueryClient();
  useOrders(locationId);

  async function fetchDefaults() {
    if (!orderId) {
      return createOrderDefaultValues();
    }
    const order = getOrderByOrderId(orderId, locationId, queryClient);
    if (order) {
      return createOrderDefaultValues(order);
    }
    try {
      const response = await axios.get(`${NEXT_ORDER_DETAIL}/${orderId}`);
      return createOrderDefaultValues(response.data);
    } catch (error) {
      console.error(`error during order defaults. ${error}`);
      return createOrderDefaultValues();
    }
  }

  return useQuery({
    queryKey: queryKeys.orderFormDefaults(locationId, orderId),
    queryFn: fetchDefaults,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });
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
