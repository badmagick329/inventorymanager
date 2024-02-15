import { OrderFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type OrderQuantityInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
};

export default function OrderQuantityInput({
  control,
  register,
  formState,
}: OrderQuantityInputProps) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.quantity?.message}
      </span>
      <Controller
        name='quantity'
        control={control}
        render={({ field }) => (
          <Input
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
