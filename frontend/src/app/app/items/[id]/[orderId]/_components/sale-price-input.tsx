import { SaleFormValues } from '@/types';
import { Input } from "@heroui/react";
import {
  Control,
  Controller,
  FormState,
} from 'react-hook-form';

type SalePriceProps = {
  control: Control<SaleFormValues, any>;
  formState: FormState<SaleFormValues>;
};

export default function SalePrice({
  control,
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
        rules={{ required: 'Sale price is required', validate: (value) => Number.isFinite(Number(value)) && Number(value) >= 1 || 'Please enter a number of at least 1.' }}
        render={({ field, fieldState }) => (
          <Input
            data-testid='sale-price-input'
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
