import { OrderFormValues } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@nextui-org/react';

type OrderCostInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
  showHelpText?: boolean;
};

export default function OrderCostInput({
  control,
  register,
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
        render={({ field }) => (
          <Input
            type='number'
            variant='flat'
            autoComplete='off'
            label='Cost'
            {...field}
            {...register('cost', {
              required: 'Cost is required',
              min: 1,
            })}
          />
        )}
      />
    </>
  );
}
