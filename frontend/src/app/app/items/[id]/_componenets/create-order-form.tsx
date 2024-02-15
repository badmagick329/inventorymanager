import { useForm } from 'react-hook-form';
import { useCreateOrder } from '@/hooks';
import { useState } from 'react';

import { ModalContent, ModalFooter, Spacer, Checkbox } from '@nextui-org/react';
import { Spinner } from '@/components/loaders';
import { OrderFormValues } from '@/types';
import OrderNameInput from './order-name-input';
import OrderDateInput from './order-date-input';
import OrderCostInput from './order-cost-input';
import OrderQuantityInput from './order-quantity-input';
import OrderSalePriceInput from './order-sale-price-input';
import CreateButton from '@/components/create-button';
import CancelButton from '@/components/cancel-button';
import useOrderFormDefaults from '@/hooks/useOrderFormDefaults';

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

  const fetchDefaults = useOrderFormDefaults({
    locationId,
    orderId,
  });

  const { register, handleSubmit, formState, control } = useForm({
    // @ts-ignore
    defaultValues: fetchDefaults.mutateAsync,
  });
  const createOrder = useCreateOrder();

  if (formState.isLoading) {
    return <Spinner />;
  }

  function submitForm(data: OrderFormValues) {
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
              <OrderNameInput
                control={control}
                register={register}
                formState={formState}
              />
              <OrderDateInput
                control={control}
                register={register}
                formState={formState}
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
                <CreateButton formState={formState} />
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </form>
    </>
  );
}
