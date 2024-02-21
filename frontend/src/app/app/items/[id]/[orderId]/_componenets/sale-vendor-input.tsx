import { SaleFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type SaleVendorProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
};

export default function SaleVendor({
  control,
  register,
  formState,
}: SaleVendorProps) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.vendor?.message}
      </span>
      <Controller
        name='vendor'
        control={control}
        render={({ field }) => (
          <Input
            type='text'
            variant='flat'
            autoComplete='off'
            label='Vendor'
            {...field}
            {...register('vendor', { required: 'Vendor name is required' })}
          />
        )}
      />
    </>
  );
}
