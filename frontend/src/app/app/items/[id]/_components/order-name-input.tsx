import { OrderFormValues, OrderResponse } from '@/types';
import { Input } from "@heroui/react";
import { useState } from 'react';
import { Control, Controller, FormState } from 'react-hook-form';

import OrderNameHistoryNote, { getOrderNameHistory } from './order-name-history';

type OrderNameInputProps = {
  control: Control<OrderFormValues, any>;
  formState: FormState<OrderFormValues>;
  orders?: OrderResponse[];
  excludedOrderId?: string;
};

export default function OrderNameInput({
  control,
  formState,
  orders,
  excludedOrderId,
}: OrderNameInputProps) {
  // The name the history describes; set on blur so it does not flicker
  // through partial matches while the user types.
  const [checkedName, setCheckedName] = useState('');

  return (
    <>
      <span className='text-danger-500'>{formState.errors.name?.message}</span>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Name is required' }}
        render={({ field, fieldState }) => (
          <div className='flex flex-col gap-1'>
            <Input
              data-testid='items-order-name-input'
              type='text'
              variant='flat'
              label='Name'
              labelPlacement='outside'
              placeholder=' '
              autoComplete='off'
              validationBehavior='aria'
              isInvalid={Boolean(fieldState.error)}
              {...field}
              onBlur={() => {
                field.onBlur();
                setCheckedName(field.value.trim());
              }}
            />
            {/* Without loaded orders there is no history to report, and
                "not bought before" would be a false claim. */}
            {orders && checkedName && field.value.trim() && (
              <OrderNameHistoryNote
                history={getOrderNameHistory(
                  orders,
                  checkedName,
                  excludedOrderId
                )}
              />
            )}
          </div>
        )}
      />
    </>
  );
}
