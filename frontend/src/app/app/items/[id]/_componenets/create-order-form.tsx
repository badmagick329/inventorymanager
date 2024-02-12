import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateOrder } from '@/hooks';

import {
  ModalContent,
  ModalFooter,
  Button,
  Spacer,
  Input,
  Checkbox,
} from '@nextui-org/react';

export type FormValues = {
  name: string;
  date: string;
  quantity: string;
  cost: string;
  salePrice: string;
  isCostPerItem: boolean;
  isSalePricePerItem: boolean;
};

export default function CreateOrderForm({
  locationId,
  onClose,
}: {
  locationId: string;
  onClose: () => void;
}) {
  const defaultValues = {
    name: '',
    date: '',
    quantity: '',
    cost: '',
    salePrice: '',
    isCostPerItem: true,
    isSalePricePerItem: true,
  };

  const { register, handleSubmit, formState } = useForm({
    defaultValues: defaultValues,
  });
  const createOrder = useCreateOrder();

  function submitForm(data: FormValues) {
    const quantity = parseInt(data.quantity);
    const cost = parseInt(data.cost);
    const salePrice = parseInt(data.salePrice);
    const date = data.date ? data.date : null;
    const order = {
      name: data.name,
      date,
      quantity,
      pricePerItem: data.isCostPerItem ? cost : cost / quantity,
      currentSalePrice: data.isSalePricePerItem
        ? salePrice
        : salePrice / quantity,
    };
    const response = createOrder.mutateAsync({
      locationId,
      order,
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
        Enter Purchase Details
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
                Add Item
              </span>
              <span className='text-danger-500'>
                {formState.errors.name?.message}
              </span>
              <Input
                type='text'
                variant='flat'
                autoComplete='off'
                label='Name'
                {...register('name', { required: 'Name is required' })}
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
              <div className='flex flex-col gap-2'>
                <span className='text-danger-500'>
                  {formState.errors.cost?.message}
                </span>
                <Input
                  type='number'
                  variant='flat'
                  autoComplete='off'
                  label='Cost'
                  {...register('cost', {
                    required: 'Cost is required',
                    min: 1,
                  })}
                />
                <Checkbox defaultSelected {...register('isCostPerItem')}>
                  per item
                </Checkbox>
              </div>
              <div className='flex flex-col gap-2'>
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
                <Checkbox defaultSelected {...register('isSalePricePerItem')}>
                  per item
                </Checkbox>
              </div>
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
