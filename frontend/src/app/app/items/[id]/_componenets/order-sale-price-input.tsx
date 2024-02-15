import { OrderFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type OrderSalePriceInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
};

export default function OrderSalePriceInput({
  control,
  register,
  formState,
}: OrderSalePriceInputProps) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.salePrice?.message}
      </span>
      <Controller
        name='salePrice'
        control={control}
        render={({ field }) => (
          <Input
            type='number'
            variant='flat'
            autoComplete='off'
            label='Sale Price'
            {...field}
            {...register('salePrice', {
              required: 'Sale price is required',
              min: 1,
            })}
          />
        )}
      />
    </>
  );
}
