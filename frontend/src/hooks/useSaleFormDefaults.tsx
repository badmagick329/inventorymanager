import { isSaleResponse } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSaleBySaleId } from '@/utils/query-client-reader';
import { NEXT_SALE_DETAIL } from '@/consts/urls';
import axios from 'axios';

type useSaleFormDefaultsProps = {
  orderId: string;
  saleId?: string;
};

export default function useSaleFormDefaults({
  orderId,
  saleId,
}: useSaleFormDefaultsProps) {
  const queryClient = useQueryClient();

  async function fetchDefaults() {
    console.log(`fetchDefaults saleId: ${saleId}`);
    if (!saleId) {
      return createSaleDefaultValues();
    }
    const sale = getSaleBySaleId(saleId, orderId, queryClient);
    if (sale) {
      return createSaleDefaultValues(sale);
    }
    try {
      const response = await axios.get(`${NEXT_SALE_DETAIL}/${saleId}`);
      return createSaleDefaultValues(response.data);
    } catch (error) {
      return createSaleDefaultValues();
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

export function createSaleDefaultValues(sale?: any) {
  if (!isSaleResponse(sale)) {
    return {
      vendor: '',
      date: '',
      quantity: '',
      salePrice: '',
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
