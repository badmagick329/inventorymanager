import {
  CancelButton,
  CreateButton,
  ItemFormHeader,
  Spinner,
  UpdateButton,
} from '@/components';
import { useCreateSale, useLocalStorage, useSaleFormDefaults } from '@/hooks';
import { SaleFormValues } from '@/types';
import { Checkbox, ModalContent, ModalFooter } from '@nextui-org/react';
import axios from 'axios';
import React, { useState } from 'react';
import { UseFormSetError, useForm } from 'react-hook-form';

import {
  SaleAmountPaid,
  SaleDate,
  SalePrice,
  SaleQuantity,
  SaleVendor,
} from '.';

type CreateSaleMutation = ReturnType<typeof useCreateSale>['mutateAsync'];

export default function CreateSaleForm({
  locationId,
  orderId,
  onClose,
  saleId,
}: {
  locationId: string;
  orderId: string;
  onClose: () => void;
  saleId?: string;
}) {
  const [isSalePricePerItem, setIsSalePricePerItem] = useState(true);
  const [isAmountPaidPerItem, setIsAmountPaidPerItem] = useState(false);
  const [value, updateValue] = useLocalStorage('showHelp', true);

  const fetchDefaults = useSaleFormDefaults({
    locationId,
    orderId,
    saleId,
  });

  const {
    register,
    handleSubmit,
    formState,
    setError,
    control,
    setValue,
    getValues,
  } = useForm({
    // @ts-ignore
    defaultValues: fetchDefaults.mutateAsync,
  });
  const createSale = useCreateSale();

  if (formState.isLoading) {
    return <Spinner />;
  }
  return (
    <>
      <form
        className='flex flex-col gap-4 p-4'
        onSubmit={handleSubmit((data, e) => {
          e?.preventDefault();
          return submitForm(
            data,
            isSalePricePerItem,
            isAmountPaidPerItem,
            locationId,
            orderId,
            saleId,
            createSale.mutateAsync,
            onClose,
            setError
          );
        })}
      >
        <ModalContent>
          {(onClose) => (
            <div className='flex flex-col gap-4 px-4'>
              <ItemFormHeader
                value={value}
                updateValue={() => updateValue(!value)}
                title={saleId ? 'Edit Sale' : 'Add Sale'}
              />
              <SaleVendor
                register={register}
                formState={formState}
                control={control}
                showHelpText={value}
                locationId={locationId}
                getValues={getValues}
              />
              <SaleDate
                register={register}
                formState={formState}
                control={control}
                setValue={setValue}
                getValues={getValues}
              />
              <SaleQuantity
                register={register}
                formState={formState}
                control={control}
              />
              <div className='flex flex-col gap-2'>
                <SalePrice
                  control={control}
                  register={register}
                  formState={formState}
                />
                <Checkbox
                  defaultSelected={isSalePricePerItem}
                  checked={isSalePricePerItem}
                  onChange={() => setIsSalePricePerItem(!isSalePricePerItem)}
                >
                  per Item
                </Checkbox>
              </div>
              <div className='flex flex-col gap-2'>
                <SaleAmountPaid
                  register={register}
                  formState={formState}
                  control={control}
                  showHelpText={value}
                />
                <Checkbox
                  defaultSelected={isAmountPaidPerItem}
                  checked={isAmountPaidPerItem}
                  onChange={() => setIsAmountPaidPerItem(!isAmountPaidPerItem)}
                >
                  per Item
                </Checkbox>
              </div>
              <ModalFooter>
                <CancelButton onCancel={onClose} />
                {saleId ? (
                  <UpdateButton formState={formState} />
                ) : (
                  <CreateButton formState={formState} />
                )}
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </form>
    </>
  );
}

async function submitForm(
  data: SaleFormValues,
  isSalePricePerItem: boolean,
  isAmountPaidPerItem: boolean,
  locationId: string,
  orderId: string,
  saleId: string | undefined,
  mutateAsync: CreateSaleMutation,
  onClose: () => void,
  setError: UseFormSetError<SaleFormValues>
) {
  const date = data.date ? data.date : null;
  const quantity = Number(data.quantity);
  const salePrice = Number(data.salePrice);
  const vendorName = data.vendor.trim();
  const pricePerItem = isSalePricePerItem ? salePrice : salePrice / quantity;
  const amountPaid = isAmountPaidPerItem
    ? Number(data.amountPaid) * quantity
    : Number(data.amountPaid);
  const sale = {
    vendor: vendorName,
    date,
    quantity,
    pricePerItem,
    amountPaid,
  };
  try {
    await mutateAsync({ locationId, orderId, saleId, sale });
    onClose();
  } catch (error) {
    handleFormError(error, setError);
  }
}

function handleFormError(
  error: any,
  setError: UseFormSetError<SaleFormValues>
) {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data;
    if (errorData) {
      for (const [field, messages] of Object.entries(errorData)) {
        if (!Array.isArray(messages) || messages.length === 0) {
          continue;
        }
        const message = messages[0];
        if (typeof message !== 'string') {
          continue;
        }
        setError(mapErrorKeyToField(field), { type: 'manual', message });
        return;
      }
    }
  }
  setError('vendor', { type: 'manual', message: 'An error occurred' });
  console.error(error);
}

function mapErrorKeyToField(key: string) {
  switch (key) {
    case 'vendor':
      return 'vendor';
    case 'date':
      return 'date';
    case 'quantity':
      return 'quantity';
    case 'price_per_item':
      return 'salePrice';
    case 'debt':
      return 'amountPaid';
    default:
      return 'vendor';
  }
}
