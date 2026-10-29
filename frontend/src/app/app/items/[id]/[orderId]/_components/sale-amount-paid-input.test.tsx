import { cleanup, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it } from 'vitest';

import { SaleFormValues } from '@/types';

import SaleAmountPaid from './sale-amount-paid-input';

function AmountPaidField({
  quantity,
  salePrice,
  isSalePricePerItem = true,
  isAmountPaidPerItem = false,
}: {
  quantity: string;
  salePrice: string;
  isSalePricePerItem?: boolean;
  isAmountPaidPerItem?: boolean;
}) {
  const { control, formState, getValues, setValue, watch } =
    useForm<SaleFormValues>({
      defaultValues: {
        vendor: '',
        date: '',
        quantity,
        salePrice,
        amountPaid: '',
      },
    });
  return (
    <SaleAmountPaid
      control={control}
      formState={formState}
      showHelpText={false}
      getValues={getValues}
      setValue={setValue}
      watch={watch}
      isAmountPaidPerItem={isAmountPaidPerItem}
      isSalePricePerItem={isSalePricePerItem}
    />
  );
}

function amountPaidPlaceholder() {
  return screen
    .getByTestId('sale-amount-paid-input')
    .getAttribute('placeholder');
}

describe('SaleAmountPaid placeholder', () => {
  afterEach(cleanup);

  it('shows sale price times quantity', () => {
    render(<AmountPaidField quantity='3' salePrice='100' />);

    expect(amountPaidPlaceholder()).toBe('300');
  });

  it('treats a total sale price as the full amount', () => {
    render(
      <AmountPaidField
        quantity='3'
        salePrice='300'
        isSalePricePerItem={false}
      />
    );

    expect(amountPaidPlaceholder()).toBe('300');
  });

  it('shows the per-item amount when amount paid is per item', () => {
    render(
      <AmountPaidField quantity='3' salePrice='100' isAmountPaidPerItem />
    );

    expect(amountPaidPlaceholder()).toBe('100');
  });

  it('stays blank until quantity and sale price are entered', () => {
    render(<AmountPaidField quantity='' salePrice='100' />);

    expect(amountPaidPlaceholder()).toBe(' ');
  });
});
