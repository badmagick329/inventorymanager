import { SaleFormValues, VendorResponse } from '@/types';
import { Control, Controller, FormState } from 'react-hook-form';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import HelpTooltip from '@/components/help-tooltip';
import React from 'react';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useVendors } from '@/hooks';
import { Button } from '@nextui-org/react';
import useDeleteVendor from '@/hooks/useDeleteVendor';

type SaleVendorProps = {
  control: Control<SaleFormValues, any>;
  register: UseFormRegister<SaleFormValues>;
  formState: FormState<SaleFormValues>;
  showHelpText: boolean;
  locationId: string;
  setValue: UseFormSetValue<SaleFormValues>;
};

export default function SaleVendor({
  control,
  register,
  formState,
  showHelpText,
  locationId,
  setValue,
}: SaleVendorProps) {
  const { data, isLoading, isError } = useVendors(locationId);
  const deleteVendor = useDeleteVendor();
  if (isError || !data) {
    return null;
  }

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
              className='max-w-md'
              onInputChange={onChange}
              inputValue={value}
              allowsCustomValue
              {...register('vendor', { required: 'Vendor name is required' })}
              // Fix for Autocomplete throwing the following error:
              // "stopPropagation is now the default behavior for events in
              // React Spectrum. You can use continuePropagation() to revert
              // this behavior."
              // https://github.com/nextui-org/nextui/issues/2074
              onKeyDown={(e: any) => e.continuePropagation()}
            >
              {data.map((vendor: VendorResponse) => (
                <AutocompleteItem
                  key={vendor.name}
                  endContent={
                    <Button
                      color='danger'
                      isDisabled={deleteVendor.isPending}
                      onPress={() => {
                        console.log('about to delete', vendor);
                        deleteVendor
                          .mutateAsync({ vendorId: vendor.id })
                          .then(() => {
                            setValue('vendor', '');
                          });
                      }}
                    >
                      Delete
                    </Button>
                  }
                >
                  {vendor.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          )}
        />
      </div>
    </div>
  );
}
