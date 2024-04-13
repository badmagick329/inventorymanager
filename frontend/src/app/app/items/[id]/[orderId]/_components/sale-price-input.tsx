import { SaleFormValues } from '@/types';
import { Input } from '@nextui-org/react';
import {
  Control,
  Controller,
  FormState,
  UseFormRegister,
} from 'react-hook-form';

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
            data-testid='sale-price-input'
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
