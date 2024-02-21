import { SaleFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type SalePriceProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
};

export default function SalePrice({
  control,
  register,
  formState,
}: SalePriceProps) {
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
