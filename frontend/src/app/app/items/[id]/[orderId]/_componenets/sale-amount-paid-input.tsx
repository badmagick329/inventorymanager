import { SaleFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type SaleAmountPaidProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
};

export default function SaleAmountPaid({
  control,
  register,
  formState,
}: SaleAmountPaidProps) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.amountPaid?.message}
      </span>
      <Controller
        name='amountPaid'
        control={control}
        render={({ field }) => (
          <Input
            type='number'
            variant='flat'
            autoComplete='off'
            label='Amount Paid'
            {...field}
            {...register('amountPaid', {
              required: 'Amount Paid is required',
              min: 0,
            })}
          />
        )}
      />
    </>
  );
}
