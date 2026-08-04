import { OrderFormValues } from '@/types';
import { Input } from "@heroui/react";
import { Control, Controller, FormState } from 'react-hook-form';

type OrderNameInputProps = {
  control: Control<OrderFormValues, any>;
  formState: FormState<OrderFormValues>;
};

export default function OrderNameInput({
  control,
  formState,
}: OrderNameInputProps) {
  return (
    <>
      <span className='text-danger-500'>{formState.errors.name?.message}</span>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Name is required' }}
        render={({ field, fieldState }) => (
          <Input
            data-testid='items-order-name-input'
            type='text'
            variant='flat'
            label='Name'
            labelPlacement='outside'
            placeholder=' '
            autoComplete='off'
            validationBehavior='aria'
            isInvalid={Boolean(fieldState.error)}
            {...field}
          />
        )}
      />
    </>
  );
}
