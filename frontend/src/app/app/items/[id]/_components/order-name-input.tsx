import { OrderFormValues } from '@/types';
import { Input } from '@nextui-org/react';
import {
  Control,
  Controller,
  FormState,
  UseFormRegister,
} from 'react-hook-form';

type OrderNameInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
};

export default function OrderNameInput({
  control,
  register,
  formState,
}: OrderNameInputProps) {
  return (
    <>
      <span className='text-danger-500'>{formState.errors.name?.message}</span>
      <Controller
        name='name'
        control={control}
        render={({ field }) => (
          <Input
            data-testid='items-order-name-input'
            type='text'
            variant='flat'
            label='Name'
            autoComplete='off'
            {...field}
            {...register('name', { required: 'Name is required' })}
          />
        )}
      />
    </>
  );
}
