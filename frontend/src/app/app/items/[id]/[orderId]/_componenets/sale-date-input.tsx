import { SaleFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type SaleDateProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
};

export default function SaleDate({
  control,
  register,
  formState,
}: SaleDateProps) {
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
            placeholder=''
            {...field}
            {...register('date')}
          />
        )}
      />
    </>
  );
}
