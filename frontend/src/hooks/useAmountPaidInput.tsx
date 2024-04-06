import { SaleFormValues } from '@/types';
import { useEffect, useState } from 'react';
import {
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

type SaleAmountPaidProps = {
  getValues: UseFormGetValues<SaleFormValues>;
  setValue: UseFormSetValue<SaleFormValues>;
  watch: UseFormWatch<SaleFormValues>;
  isAmountPaidPerItem: boolean;
  isSalePricePerItem: boolean;
};

export default function useSaleAmountPaidInput({
  getValues,
  setValue,
  watch,
  isAmountPaidPerItem,
  isSalePricePerItem,
}: SaleAmountPaidProps) {
  const notPaidText = 'Set as fully paid';
  const paidText = 'Amount paid';
  const [buttonText, setButtonText] = useState(notPaidText);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonColor, setButtonColor] = useState<'success' | 'default'>(
    'default'
  );

  const [watchedQuantity, watchedSalePrice, watchedAmountPaid] = watch([
    'quantity',
    'salePrice',
    'amountPaid',
  ]);

  useEffect(() => {
    const amountIsPaid = amountIsFullyPaid(
      watchedQuantity,
      watchedSalePrice,
      watchedAmountPaid,
      isAmountPaidPerItem,
      isSalePricePerItem
    );

    if (amountIsPaid) {
      setButtonText(paidText);
      setButtonColor('success');
      setButtonDisabled(true);
      return;
    }

    setButtonText(notPaidText);
    setButtonColor('default');
    watchedQuantity && watchedSalePrice
      ? setButtonDisabled(false)
      : setButtonDisabled(true);
  }, [
    watchedQuantity,
    watchedSalePrice,
    watchedAmountPaid,
    isAmountPaidPerItem,
    isSalePricePerItem,
  ]);

  const fullAmountCallback = () => {
    const fullAmount = calculateFullAmount(
      getValues,
      isSalePricePerItem,
      isAmountPaidPerItem
    );
    if (fullAmount === null) {
      return;
    }
    setValue('amountPaid', fullAmount.toString());
  };

  return {
    buttonText,
    buttonDisabled,
    buttonColor,
    fullAmountCallback,
  };
}

function amountIsFullyPaid(
  watchedQuantity: string,
  watchedSalePrice: string,
  watchedAmountPaid: string,
  isAmountPaidPerItem: boolean,
  isSalePricePerItem: boolean
) {
  const salePrice = parseInt(watchedSalePrice);
  const quantity = parseInt(watchedQuantity);
  const amountPaid = parseInt(watchedAmountPaid);

  if (isNaN(salePrice) || isNaN(amountPaid) || isNaN(quantity)) {
    return false;
  }

  const fullSalePrice = isSalePricePerItem ? salePrice * quantity : salePrice;
  const fullAmountPaid = isAmountPaidPerItem
    ? Math.round(fullSalePrice / quantity)
    : fullSalePrice;
  return amountPaid === fullAmountPaid;
}

function calculateFullAmount(
  getValues: UseFormGetValues<SaleFormValues>,
  isSalePricePerItem: boolean,
  isAmountPaidPerItem: boolean
) {
  let [quantityString, salePriceString] = getValues(['quantity', 'salePrice']);
  const salePrice = parseInt(salePriceString);
  const quantity = parseInt(quantityString);

  if (isNaN(salePrice) || isNaN(quantity)) {
    return null;
  }
  const fullSalePrice = isSalePricePerItem ? salePrice * quantity : salePrice;

  return isAmountPaidPerItem
    ? Math.round(fullSalePrice / quantity)
    : fullSalePrice;
}
