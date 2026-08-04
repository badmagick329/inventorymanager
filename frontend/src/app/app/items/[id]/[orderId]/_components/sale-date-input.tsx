import { SaleFormValues } from '@/types';
import { getISODateString } from '@/utils';
import { Button, Input } from "@heroui/react";
import { useState } from 'react';
import {
  Control,
  Controller,
  FormState,
  UseFormGetValues,
  UseFormSetValue,
} from 'react-hook-form';

type SaleDateProps = {
  control: Control<SaleFormValues, any>;
  formState: FormState<SaleFormValues>;
  setValue: UseFormSetValue<SaleFormValues>;
  getValues: UseFormGetValues<SaleFormValues>;
};

export default function SaleDate({
  control,
  formState,
  setValue,
  getValues,
}: SaleDateProps) {
  const [_, setDate] = useState(getValues().date);

  return (
    <>
      <div className='flex items-center gap-2'>
        <span className='text-danger-500'>
          {formState.errors.date?.message}
        </span>
      </div>
      <div className='flex items-center gap-2'>
        <Controller
          name='date'
          control={control}
          render={({ field }) => (
            <Input
              type='date'
              variant='flat'
              {...field}
            />
          )}
        />
        <Button
          className='h-14'
          radius='sm'
          variant='flat'
          onPress={() => handleClick(getValues, setValue, setDate)}
        >
          {dateIsEmpty(getValues) ? 'Use Today' : 'Clear Date'}
        </Button>
      </div>
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
