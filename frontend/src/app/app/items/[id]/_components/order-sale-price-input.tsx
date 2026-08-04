import HelpTooltip from '@/components/help-tooltip';
import { OrderFormValues } from '@/types';
import { Input } from "@heroui/react";
import {
  Control,
  Controller,
  FormState,
} from 'react-hook-form';

type OrderSalePriceInputProps = {
  control: Control<OrderFormValues, any>;
  formState: FormState<OrderFormValues>;
  showHelpText?: boolean;
};

export default function OrderSalePriceInput({
  control,
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
        rules={{ required: 'Sale price is required', validate: (value) => Number.isFinite(Number(value)) && Number(value) >= 1 || 'Please enter a number of at least 1.' }}
        render={({ field, fieldState }) => (
          <Input
            data-testid='items-order-sale-input'
            type='number'
            variant='flat'
            autoComplete='off'
            label='Sale Price'
            labelPlacement='outside'
            placeholder=' '
            validationBehavior='aria'
            isInvalid={Boolean(fieldState.error)}
            {...field}
          />
        )}
      />
    </>
  );
}
