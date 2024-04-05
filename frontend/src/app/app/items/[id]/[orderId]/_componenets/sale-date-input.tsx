import { SaleFormValues } from '@/types';
import {
  Control,
  Controller,
  FormState,
  UseFormGetValues,
} from 'react-hook-form';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Button, Input } from '@nextui-org/react';
import { getISODateString } from '@/utils';
import { useState } from 'react';

type SaleDateProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
  setValue: UseFormSetValue<SaleFormValues>;
  getValues: UseFormGetValues<SaleFormValues>;
};

export default function SaleDate({
  control,
  register,
  formState,
  setValue,
  getValues,
}: SaleDateProps) {
  const [_, setDate] = useState(getValues().date);

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button
          onPress={() => handleClick(getValues, setValue, setDate)}
          radius='sm'
        >
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
  getValues: UseFormGetValues<SaleFormValues>,
  setValue: UseFormSetValue<SaleFormValues>,
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

function dateIsEmpty(getValues: UseFormGetValues<SaleFormValues>) {
  return getValues().date === '';
}
