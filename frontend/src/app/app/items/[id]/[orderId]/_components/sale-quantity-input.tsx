import { SaleFormValues } from '@/types';
import { Input } from "@heroui/react";
import {
  Control,
  Controller,
  FormState,
} from 'react-hook-form';

type SaleQuantityProps = {
  control: Control<SaleFormValues, any>;
  formState: FormState<SaleFormValues>;
};

export default function SaleQuantity({
  control,
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
        rules={{ required: 'Quantity is required', validate: (value) => Number.isFinite(Number(value)) && Number(value) >= 1 || 'Please enter a number of at least 1.' }}
        render={({ field, fieldState }) => (
          <Input
            data-testid='sale-quantity-input'
            type='number'
            variant='flat'
            autoComplete='off'
            label='Quantity'
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
