import { HelpTooltip } from '@/components';
import { useVendors } from '@/hooks';
import { SaleFormValues, VendorResponse } from '@/types';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import {
  Control,
  Controller,
  FormState,
  UseFormGetValues,
  UseFormRegister,
} from 'react-hook-form';

import { VendorInputBadge } from '.';

type SaleVendorProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
  showHelpText: boolean;
  locationId: string;
  getValues: UseFormGetValues<SaleFormValues>;
};

export default function SaleVendor({
  control,
  register,
  formState,
  showHelpText,
  locationId,
  getValues,
}: SaleVendorProps) {
  const { data, isLoading, isError } = useVendors(locationId);

  if (isError || !data || isLoading) {
    return null;
  }
  const existingNames = data.map((vendor: VendorResponse) => vendor.name);

  return (
    <div className='flex flex-col items-end gap-2'>
      <div className='flex w-full justify-between'>
        <span className='self-start px-2 text-danger-500'>
          {formState.errors.vendor?.message}
        </span>
        {showHelpText && (
          <HelpTooltip
            content={'Name of the vendor this sale is being made to'}
          />
        )}{' '}
      </div>
      <div className='flex w-full justify-between gap-4 self-start'>
        <Controller
          name='vendor'
          control={control}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              data-testid='sale-vendor-input'
              label='Enter vendor name or select from existing vendors'
              isLoading={isLoading}
              defaultItems={data}
              onInputChange={onChange}
              inputValue={value}
              allowsCustomValue
              endContent={
                <VendorInputBadge
                  getValue={() => getValues('vendor')}
                  existingNames={existingNames}
                />
              }
              {...register('vendor', { required: 'Vendor name is required' })}
              // Fix for Autocomplete throwing the following error:
              // "stopPropagation is now the default behavior for events in
              // React Spectrum. You can use continuePropagation() to revert
              // this behavior."
              // https://github.com/nextui-org/nextui/issues/2074
              onKeyDown={(e: any) => e.continuePropagation()}
            >
              {existingNames.map((name: string) => (
                <AutocompleteItem key={name}>{name}</AutocompleteItem>
              ))}
            </Autocomplete>
          )}
        />
      </div>
    </div>
  );
}
