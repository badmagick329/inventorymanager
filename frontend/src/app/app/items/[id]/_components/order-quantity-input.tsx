import { OrderFormValues } from '@/types';
import { Input } from '@nextui-org/react';
import {
  Control,
  Controller,
  FormState,
  UseFormRegister,
} from 'react-hook-form';

type OrderQuantityInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
  showHelpText?: boolean;
};

export default function OrderQuantityInput({
  control,
  register,
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
        render={({ field }) => (
          <Input
            data-testid='items-order-quantity-input'
            type='number'
            variant='flat'
            autoComplete='off'
            label='Quantity'
            {...field}
            {...register('quantity', {
              required: 'Quantity is required',
              min: 1,
            })}
          />
        )}
      />
    </>
  );
}
