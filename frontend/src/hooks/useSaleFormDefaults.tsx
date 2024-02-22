import { isSaleResponse } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSaleBySaleId } from '@/utils/query-client-reader';
import { NEXT_SALE_DETAIL } from '@/consts/urls';
import { getOrderByOrderId } from '@/utils/query-client-reader';
import axios from 'axios';
import useOrders from './useOrders';

type useSaleFormDefaultsProps = {
  locationId: string;
  orderId: string;
  saleId?: string;
};

export default function useSaleFormDefaults({
  locationId,
  orderId,
  saleId,
}: useSaleFormDefaultsProps) {
  const queryClient = useQueryClient();
  useOrders(locationId);
  const order = getOrderByOrderId(orderId, locationId, queryClient);
  let salePrice = '';
  if (order) {
    salePrice = order.currentSalePrice.toString();
  }

  async function fetchDefaults() {
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
      return createSaleDefaultValues(salePrice);
    }
  }

  const mutation = useMutation({
    mutationFn: fetchDefaults,
    retry: false,
    onSettled: () => {},
    onSuccess: (data) => {
      // console.log(`success data`, data);
      // queryClient.setQueryData(['sales', orderId, saleId], data);
    },
    onError: (error) => {
      console.log(`error during sales defaults. ${error}`);
    },
  });
  return mutation;
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
