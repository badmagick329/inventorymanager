import React from 'react';
import { useForm, UseFormSetError } from 'react-hook-form';

import {
  ModalContent,
  ModalFooter,
  Button,
  Spacer,
  Checkbox,
} from '@nextui-org/react';
import { useCreateSale } from '@/hooks';
import axios from 'axios';
import { useState } from 'react';
import { SaleFormValues } from '@/types';
import { Spinner } from '@/components/loaders';
import SaleVendor from './sale-vendor-input';
import SaleDate from './sale-date-input';
import SalePrice from './sale-price-input';
import SaleQuantity from './sale-quantity-input';
import SaleAmountPaid from './sale-amount-paid-input';
import useSaleFormDefaults from '@/hooks/useSaleFormDefaults';

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

  const fetchDefaults = useSaleFormDefaults({
    orderId,
    saleId,
  });

  const { register, handleSubmit, formState, setError, control } = useForm({
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
        onSubmit={handleSubmit((data) =>
          submitForm(
            data,
            isSalePricePerItem,
            isAmountPaidPerItem,
            locationId,
            orderId,
            saleId,
            createSale.mutateAsync,
            onClose,
            setError
          )
        )}
      >
        <ModalContent>
          {(onClose) => (
            <div className='flex flex-col gap-4 px-4'>
              <Spacer y={2} />
              <span className='text-center text-2xl font-semibold'>
                {orderId ? 'Edit Sale' : 'Add Sale'}
              </span>
              <SaleVendor
                register={register}
                formState={formState}
                control={control}
              />
              <SaleDate
                register={register}
                formState={formState}
                control={control}
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
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  color='primary'
                  isLoading={formState.isSubmitting}
                >
                  {orderId ? 'Update' : 'Create'}
                </Button>
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
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      if (errorData) {
        for (const [field, message] of Object.entries(errorData)) {
          // @ts-ignore
          setError(mapErrorKeyToField(field), { type: 'server', message });
          return;
        }
      }
    }
    setError('vendor', { type: 'server', message: 'An error occurred' });
  }
}

function mapErrorKeyToField(key: string) {
  const errorMap = new Map([
    ['vendor', 'vendor'],
    ['date', 'date'],
    ['quantity', 'quantity'],
    ['price_per_item', 'salePrice'],
    ['debt', 'amountPaid'],
  ]);
  return errorMap.get(key) || 'vendor';
}
