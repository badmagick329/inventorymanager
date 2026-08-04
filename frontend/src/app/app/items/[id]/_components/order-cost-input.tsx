import { OrderFormValues } from '@/types';
import { Input } from "@heroui/react";
import { Control, Controller, FormState } from 'react-hook-form';

type OrderCostInputProps = {
  control: Control<OrderFormValues, any>;
  formState: FormState<OrderFormValues>;
  showHelpText?: boolean;
};

export default function OrderCostInput({
  control,
  formState,
}: OrderCostInputProps) {
  return (
    <>
      <div className='flex w-full justify-between px-2'>
        <span className='text-danger-500'>
          {formState.errors.cost?.message}
        </span>
      </div>
      <Controller
        name='cost'
        control={control}
        rules={{ required: 'Cost is required', validate: (value) => Number.isFinite(Number(value)) && Number(value) >= 1 || 'Please enter a number of at least 1.' }}
        render={({ field, fieldState }) => (
          <Input
            data-testid='items-order-cost-input'
            type='number'
            variant='flat'
            autoComplete='off'
            label='Cost'
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
