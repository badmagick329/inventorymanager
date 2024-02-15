import { OrderFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type OrderDateInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
};

export default function OrderDateInput({
  control,
  register,
  formState,
}: OrderDateInputProps) {
  return (
    <>
      <span className='text-danger-500'>{formState.errors.date?.message}</span>
      <Controller
        name='date'
        control={control}
        render={({ field }) => (
          <Input
            type='date'
            variant='flat'
            // placeholder=''
            {...field}
            {...register('date')}
          />
        )}
      />
    </>
  );
}
