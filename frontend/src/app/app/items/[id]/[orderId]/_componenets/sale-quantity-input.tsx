import { SaleFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type SaleQuantityProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
};

export default function SaleQuantity({
  control,
  register,
  formState,
}: SaleQuantityProps) {
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
