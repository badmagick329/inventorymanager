import { OrderFormValues } from '@/types';
import { Input } from "@heroui/react";
import { Control, Controller, FormState } from 'react-hook-form';

type OrderQuantityInputProps = {
  control: Control<OrderFormValues, any>;
  formState: FormState<OrderFormValues>;
  showHelpText?: boolean;
};

export default function OrderQuantityInput({
  control,
  formState,
}: OrderQuantityInputProps) {
  return (
    <>
      <div className='flex w-full justify-between px-2'>
        <span className='text-danger-500'>
          {formState.errors.quantity?.message}
        </span>
      </div>
      <Controller
        name='quantity'
        control={control}
        rules={{ required: 'Quantity is required', validate: (value) => Number.isFinite(Number(value)) && Number(value) >= 1 || 'Please enter a number of at least 1.' }}
        render={({ field, fieldState }) => (
          <Input
            data-testid='items-order-quantity-input'
            type='number'
            variant='flat'
            autoComplete='off'
            label='Quantity'
            labelPlacement='outside'
            placeholder=' '
            validationBehavior='aria'
            isInvalid={Boolean(fieldState.error)}
            {...field}
          />
        )}
      />
    </>
  );
}
