import { SaleFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';
import HelpTooltip from '@/components/help-tooltip';

type SaleVendorProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
  showHelpText: boolean;
};

export default function SaleVendor({
  control,
  register,
  formState,
  showHelpText,
}: SaleVendorProps) {
  return (
    <>
      <div className='flex w-full justify-between px-2'>
        <span className='text-danger-500'>
          {formState.errors.vendor?.message}
        </span>
        {showHelpText && (
          <HelpTooltip
            content={'Name of the vendor this sale is being made to'}
          />
        )}
      </div>
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
