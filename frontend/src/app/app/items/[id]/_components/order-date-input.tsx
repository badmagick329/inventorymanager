import HelpTooltip from '@/components/help-tooltip';
import { OrderFormValues } from '@/types';
import { getISODateString } from '@/utils';
import { Button, Input } from "@heroui/react";
import { useState } from 'react';
import {
  Control,
  Controller,
  FormState,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

type OrderDateInputProps = {
  control: Control<OrderFormValues, any>;
  register: UseFormRegister<OrderFormValues>;
  formState: FormState<OrderFormValues>;
  setValue: UseFormSetValue<OrderFormValues>;
  getValues: UseFormGetValues<OrderFormValues>;
  showHelpText?: boolean;
};

export default function OrderDateInput({
  control,
  register,
  formState,
  setValue,
  getValues,
  showHelpText,
}: OrderDateInputProps) {
  const [_, setDate] = useState(getValues().date);

  return (
    <>
      <div className='flex items-center gap-2'>
        <div className='flex w-full justify-between px-2'>
          <span className='text-danger-500'>
            {formState.errors.date?.message}
          </span>
          {showHelpText && <HelpTooltip content='Date of purchase' />}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Controller
          name='date'
          control={control}
          render={({ field }) => (
            <Input
              data-testid='items-order-date-input'
              type='date'
              variant='flat'
              {...field}
              {...register('date')}
            />
          )}
        />
        <Button
          onPress={() => handleClick(getValues, setValue, setDate)}
          className='h-14'
          radius='sm'
          variant='flat'
        >
          {dateIsEmpty(getValues) ? 'Use Today' : 'Clear Date'}
        </Button>
      </div>
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
