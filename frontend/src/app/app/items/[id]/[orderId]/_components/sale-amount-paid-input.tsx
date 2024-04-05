import { HelpTooltip } from '@/components';
import { SaleFormValues } from '@/types';
import { Input } from '@nextui-org/react';
import {
  Control,
  Controller,
  FormState,
  UseFormRegister,
} from 'react-hook-form';

type SaleAmountPaidProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
  showHelpText: boolean;
};

export default function SaleAmountPaid({
  control,
  register,
  formState,
  showHelpText,
}: SaleAmountPaidProps) {
  return (
    <>
      <div className='flex w-full justify-between px-2'>
        <span className='text-danger-500'>
          {formState.errors.amountPaid?.message}
        </span>
        {showHelpText && (
          <HelpTooltip
            content={
              'Amount paid so far by the vendor. This cannot be more than the total amount owed'
            }
          />
        )}
      </div>
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
