import { NEXT_SALE_DETAIL } from '@/consts/urls';
import { isSaleResponse } from '@/predicates';
import { queryKeys } from '@/consts/queryKeys';
import {
  getOrderByOrderId,
  getSaleBySaleId,
} from '@/utils/query-client-reader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import useOrders from './useOrders';

type useSaleFormDefaultsProps = {
  locationId: string;
  orderId: string;
  saleId?: string;
};

/**
 * Loads the sale form's starting values once per opening; see
 * `useOrderFormDefaults` for why the form waits for plain values.
 */
export default function useSaleFormDefaults({
  locationId,
  orderId,
  saleId,
}: useSaleFormDefaultsProps) {
  const queryClient = useQueryClient();
  useOrders(locationId);

  async function fetchDefaults() {
    const order = getOrderByOrderId(orderId, locationId, queryClient);
    const salePrice = order ? order.currentSalePrice.toString() : '';
    if (!saleId) {
      return createSaleDefaultValues(salePrice);
    }
    const sale = getSaleBySaleId(saleId, orderId, queryClient);
    if (sale) {
      return createSaleDefaultValues(salePrice, sale);
    }
    try {
      const response = await axios.get(`${NEXT_SALE_DETAIL}/${saleId}`);
      return createSaleDefaultValues(salePrice, response.data);
    } catch (error) {
      console.error(`error during sales defaults. ${error}`);
      return createSaleDefaultValues(salePrice);
    }
  }

  return useQuery({
    queryKey: queryKeys.saleFormDefaults(orderId, saleId),
    queryFn: fetchDefaults,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });
}

export function createSaleDefaultValues(salePrice: string, sale?: any) {
  if (!isSaleResponse(sale)) {
    return {
      vendor: '',
      date: '',
      quantity: '',
      salePrice,
      amountPaid: '',
    };
  }
  const totalSalePrice = sale.pricePerItem * sale.quantity;
  const amountPaid = totalSalePrice - sale.debt;
  return {
    vendor: sale.vendor,
    date: sale.date || '',
    quantity: sale.quantity.toString(),
    salePrice: sale.pricePerItem.toString(),
    amountPaid: amountPaid.toString(),
  };
}
