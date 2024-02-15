import { OrderFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

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
