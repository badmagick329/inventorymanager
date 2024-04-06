import { HelpTooltip } from '@/components';
import { useSaleAmountPaidInput } from '@/hooks';
import { SaleFormValues } from '@/types';
import { Button, Input } from '@nextui-org/react';
import {
  Control,
  Controller,
  FormState,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

type SaleAmountPaidProps = {
  control: Control<SaleFormValues, any>;
  formState: FormState<SaleFormValues>;
  showHelpText: boolean;
  getValues: UseFormGetValues<SaleFormValues>;
  setValue: UseFormSetValue<SaleFormValues>;
  watch: UseFormWatch<SaleFormValues>;
  isAmountPaidPerItem: boolean;
  isSalePricePerItem: boolean;
};

export default function SaleAmountPaid({
  control,
  formState,
  showHelpText,
  getValues,
  setValue,
  watch,
  isAmountPaidPerItem,
  isSalePricePerItem,
}: SaleAmountPaidProps) {
  const helpText =
    'Amount paid so far by the vendor. This cannot be more than the total amount owed';
  const { buttonText, buttonDisabled, buttonColor, fullAmountCallback } =
    useSaleAmountPaidInput({
      getValues,
      setValue,
      watch,
      isAmountPaidPerItem,
      isSalePricePerItem,
    });

  return (
    <>
      <div className='flex w-full justify-between px-2'>
        <span className='text-danger-500'>
          {formState.errors.amountPaid?.message}
        </span>
        {showHelpText && <HelpTooltip content={helpText} />}
      </div>
      <div className='flex items-center gap-2'>
        <Controller
          name='amountPaid'
          control={control}
          render={({ field }) => (
            <Input
              type='number'
              variant='flat'
              autoComplete='off'
              label='Amount Paid'
              {...field}
            />
          )}
        />
        <Button
          className='h-14'
          radius='sm'
          variant='flat'
          color={buttonColor}
          isDisabled={buttonDisabled}
          onPress={fullAmountCallback}
        >
          {buttonText}
        </Button>
      </div>
    </>
  );
}
