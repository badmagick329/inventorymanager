import { UseFormSetError, useForm } from 'react-hook-form';
import { useCreateOrder, useOrderFormDefaults } from '@/hooks';
import { useState } from 'react';
import axios from 'axios';

import { ModalContent, ModalFooter, Checkbox } from '@nextui-org/react';
import { Spinner } from '@/components/loaders';
import { OrderFormValues } from '@/types';
import OrderNameInput from './order-name-input';
import OrderDateInput from './order-date-input';
import OrderCostInput from './order-cost-input';
import OrderQuantityInput from './order-quantity-input';
import OrderSalePriceInput from './order-sale-price-input';
import UpdateButton from '@/components/update-button';
import CreateButton from '@/components/create-button';
import CancelButton from '@/components/cancel-button';
import { useLocalStorage } from '@/hooks';
import ItemFormHeader from '@/components/item-form-header';

type CreateOrderMutation = ReturnType<typeof useCreateOrder>['mutateAsync'];

export default function CreateOrderForm({
  locationId,
  orderId,
  onClose,
}: {
  locationId: string;
  orderId?: string;
  onClose: () => void;
}) {
  const [isCostPerItem, setIsCostPerItem] = useState(true);
  const [isSalePricePerItem, setIsSalePricePerItem] = useState(true);
  const [value, updateValue] = useLocalStorage('showHelp', true);

  const fetchDefaults = useOrderFormDefaults({
    locationId,
    orderId,
  });

  const {
    register,
    handleSubmit,
    formState,
    control,
    setValue,
    getValues,
    setError,
  } = useForm({
    // @ts-ignore
    defaultValues: fetchDefaults.mutateAsync,
  });
  const createOrder = useCreateOrder();

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
            isCostPerItem,
            isSalePricePerItem,
            locationId,
            createOrder.mutateAsync,
            onClose,
            setError,
            orderId
          );
        })}
      >
        <ModalContent>
          {(onClose) => (
            <div className='flex flex-col gap-4 px-4'>
              <ItemFormHeader
                value={value}
                updateValue={() => updateValue(!value)}
                title={orderId ? 'Edit Item' : 'Add Item'}
              />
              <OrderNameInput
                control={control}
                register={register}
                formState={formState}
              />
              <OrderDateInput
                control={control}
                register={register}
                formState={formState}
                setValue={setValue}
                getValues={getValues}
                showHelpText={value}
              />
              <OrderQuantityInput
                control={control}
                register={register}
                formState={formState}
              />
              <div className='flex flex-col gap-2'>
                <OrderCostInput
                  control={control}
                  register={register}
                  formState={formState}
                />
                <Checkbox
                  defaultSelected={isCostPerItem}
                  checked={isCostPerItem}
                  onChange={() => setIsCostPerItem(!isCostPerItem)}
                >
                  per item
                </Checkbox>
              </div>
              <div className='flex flex-col gap-2'>
                <OrderSalePriceInput
                  control={control}
                  register={register}
                  formState={formState}
                  showHelpText={value}
                />
                <Checkbox
                  defaultSelected={isSalePricePerItem}
                  checked={isSalePricePerItem}
                  onChange={() => setIsSalePricePerItem(!isSalePricePerItem)}
                >
                  per item
                </Checkbox>
              </div>
              <ModalFooter>
                <CancelButton onCancel={onClose} />
                {orderId ? (
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
  data: OrderFormValues,
  isCostPerItem: boolean,
  isSalePricePerItem: boolean,
  locationId: string,
  mutateAsync: CreateOrderMutation,
  onClose: () => void,
  setError: UseFormSetError<OrderFormValues>,
  orderId?: string
) {
  const quantity = parseInt(data.quantity);
  const cost = parseInt(data.cost);
  const salePrice = parseInt(data.salePrice);
  const date = data.date ? data.date : null;
  const order = {
    name: data.name,
    date,
    quantity,
    pricePerItem: isCostPerItem ? cost : cost / quantity,
    currentSalePrice: isSalePricePerItem ? salePrice : salePrice / quantity,
  };
  try {
    await mutateAsync({
      locationId,
      orderId,
      order,
    });
    onClose();
  } catch (error) {
    handleFormError(error, setError);
  }
}

function handleFormError(
  error: any,
  setError: UseFormSetError<OrderFormValues>
) {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data;
    if (error.response?.status === 400 && errorData) {
      for (const [field, messages] of Object.entries(errorData)) {
        if (!Array.isArray(messages) || messages.length === 0) {
          continue;
        }
        const message = messages[0];
        if (typeof message !== 'string') {
          continue;
        }
        setError(mapErrorKeyToField(field), {
          type: 'manual',
          message: message,
        });
        return;
      }
    }
  }
  setError('name', { type: 'manual', message: 'An error occurred' });
  console.error(error);
}

function mapErrorKeyToField(key: string) {
  switch (key) {
    case 'name':
      return 'name';
    case 'date':
      return 'date';
    case 'quantity':
      return 'quantity';
    case 'price_per_item':
      return 'cost';
    case 'current_sale_price':
      return 'salePrice';
    default:
      return 'name';
  }
}
