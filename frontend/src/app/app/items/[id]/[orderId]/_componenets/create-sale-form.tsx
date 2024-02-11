import React from 'react';
import { useForm } from 'react-hook-form';

import {
  ModalContent,
  ModalFooter,
  Button,
  Spacer,
  Input,
} from '@nextui-org/react';
import useCreateSale from '@/hooks/useCreateSale';
import axios from 'axios';

export type FormValues = {
  vendor: string;
  date: string;
  quantity: number;
  salePrice: number;
  amountPaid: number;
};

export default function CreateSaleForm({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const defaultValues = {
    vendor: '',
    date: '',
    quantity: 1,
    salePrice: 1,
    amountPaid: 0,
  };

  const { register, handleSubmit, formState, setError } = useForm({
    defaultValues,
  });
  const createSale = useCreateSale();

  async function submitForm(data: FormValues) {
    const date = data.date ? data.date : null;
    const quantity = data.quantity;
    const salePrice = data.salePrice;
    const pricePerItem = salePrice / quantity;
    const amountPaid = data.amountPaid;
    const sale = {
      vendor: data.vendor,
      date,
      quantity,
      pricePerItem,
      amountPaid,
    };
    try {
      const response = await createSale.mutateAsync({
        orderId,
        sale,
      });
      console.log(response);
      onClose();
    } catch (error) {
      console.log('ERROR', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        console.log('errorData', errorData);
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
    console.log('key', key);
    const errorMap = new Map([
      ['vendor', 'vendor'],
      ['date', 'date'],
      ['quantity', 'quantity'],
      ['price_per_item', 'salePrice'],
      ['debt', 'amountPaid'],
    ]);
    return errorMap.get(key) || 'vendor';
  }

  return (
    <>
      <span className='text-center text-2xl font-semibold'>
        Enter Sale Details
      </span>
      <form
        className='flex flex-col gap-4 p-4'
        onSubmit={handleSubmit((data) => submitForm(data))}
      >
        <ModalContent>
          {(onClose) => (
            <div className='flex flex-col gap-4 px-4'>
              <Spacer y={2} />
              <span className='text-center text-2xl font-semibold'>
                Add Sale
              </span>
              <span className='text-danger-500'>
                {formState.errors.vendor?.message}
              </span>
              <Input
                type='text'
                variant='flat'
                autoComplete='off'
                label='Vendor'
                {...register('vendor', { required: 'Vendor name is required' })}
              />
              <span className='text-danger-500'>
                {formState.errors.date?.message}
              </span>
              <Input
                type='date'
                variant='flat'
                autoComplete='off'
                placeholder=''
                {...register('date')}
              />
              <span className='text-danger-500'>
                {formState.errors.quantity?.message}
              </span>
              <Input
                type='number'
                variant='flat'
                autoComplete='off'
                label='Quantity'
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: 1,
                })}
              />
              <span className='text-danger-500'>
                {formState.errors.salePrice?.message}
              </span>
              <Input
                type='number'
                variant='flat'
                autoComplete='off'
                label='Sale Price'
                {...register('salePrice', {
                  required: 'Sale price is required',
                  min: 1,
                })}
              />
              <span className='text-danger-500'>
                {formState.errors.amountPaid?.message}
              </span>
              <Input
                type='number'
                variant='flat'
                autoComplete='off'
                label='Amount Paid'
                {...register('amountPaid', {
                  required: 'Amount Paid is required',
                  min: 0,
                })}
              />
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button type='submit' color='primary'>
                  Create
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </form>
    </>
  );
}
