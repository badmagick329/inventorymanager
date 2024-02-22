import { OrderFormValues } from '@/types';
import {
  Control,
  Controller,
  FormState,
  UseFormGetValues,
  UseFormSetValue,
} from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form';
import { Button, Input } from '@nextui-org/react';
import { getISODateString } from '@/utils';
import { useState } from 'react';

type OrderDateInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
  setValue: UseFormSetValue<OrderFormValues>;
  getValues: UseFormGetValues<OrderFormValues>;
};

export default function OrderDateInput({
  control,
  register,
  formState,
  setValue,
  getValues,
}: OrderDateInputProps) {
  const [_, setDate] = useState(getValues().date);

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button onPress={() => handleClick(getValues, setValue, setDate)}>
          {dateIsEmpty(getValues) ? 'Use Today' : 'Clear Date'}
        </Button>
        <span className='text-danger-500'>
          {formState.errors.date?.message}
        </span>
      </div>
      <Controller
        name='date'
        control={control}
        render={({ field }) => (
          <Input type='date' variant='flat' {...field} {...register('date')} />
        )}
      />
    </>
  );
}

function handleClick(
  getValues: UseFormGetValues<OrderFormValues>,
  setValue: UseFormSetValue<OrderFormValues>,
  setDate: React.Dispatch<React.SetStateAction<string>>
) {
  if (dateIsEmpty(getValues)) {
    setValue('date', getISODateString(new Date()));
    setDate(getISODateString(new Date()));
  } else {
    setValue('date', '');
    setDate('');
  }
}

function dateIsEmpty(getValues: UseFormGetValues<OrderFormValues>) {
  return getValues().date === '';
}
