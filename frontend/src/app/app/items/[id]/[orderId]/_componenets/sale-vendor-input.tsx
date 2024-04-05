import { SaleFormValues, VendorResponse } from '@/types';
import {
  Control,
  Controller,
  FormState,
  UseFormRegister,
  UseFormGetValues,
} from 'react-hook-form';
import HelpTooltip from '@/components/help-tooltip';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useVendors } from '@/hooks';
import VendorInputBadge from './sale-vendor-input-badge';

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
      <div className='flex justify-between w-full'>
        <span className='text-danger-500 self-start px-2'>
          {formState.errors.vendor?.message}
        </span>
        {showHelpText && (
          <HelpTooltip
            content={'Name of the vendor this sale is being made to'}
          />
        )}{' '}
      </div>
      <div className='flex w-full self-start justify-between gap-4'>
        <Controller
          name='vendor'
          control={control}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
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
