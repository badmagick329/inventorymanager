import HelpTooltip from '@/components/help-tooltip';
import { OrderFormValues } from '@/types';
import { Input } from '@nextui-org/react';
import {
  Control,
  Controller,
  FormState,
  UseFormRegister,
} from 'react-hook-form';

type OrderSalePriceInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
  showHelpText?: boolean;
};

export default function OrderSalePriceInput({
  control,
  register,
  formState,
  showHelpText,
}: OrderSalePriceInputProps) {
  const helpMessage =
    'The initial sale price of this item. This is not a permanent choice. It can be updated on any sale entered on the sales page';
  return (
    <>
      <div className='flex w-full justify-between px-2'>
        <span className='text-danger-500'>
          {formState.errors.salePrice?.message}
        </span>
        {showHelpText && <HelpTooltip content={helpMessage} />}
      </div>
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
