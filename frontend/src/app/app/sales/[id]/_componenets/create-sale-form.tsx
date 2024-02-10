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

export type FormValues = {
  vendor: string;
  date: string;
  quantity: string;
  salePrice: string;
  amountPaid: string;
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
    quantity: '',
    salePrice: '',
    amountPaid: '',
  };

  const { register, handleSubmit, formState } = useForm({
    defaultValues: defaultValues,
  });
  const createSale = useCreateSale();

  function submitForm(data: FormValues) {
    const date = data.date ? data.date : null;
    const quantity = parseInt(data.quantity);
    const salePrice = parseInt(data.salePrice);
    const pricePerItem = salePrice / quantity;
    const amountPaid = parseInt(data.amountPaid);
    const sale = {
      vendor: data.vendor,
      date,
      quantity,
      pricePerItem,
      amountPaid,
    };
    const response = createSale.mutateAsync({
      orderId,
      sale,
    });
    try {
      console.log(response);
      onClose();
    } catch (error) {
      console.log(error);
    }
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
            <div className='flex flex-col gap-4'>
              <Spacer y={2} />
              <span className='text-center text-2xl font-semibold'>
                Add Item
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
