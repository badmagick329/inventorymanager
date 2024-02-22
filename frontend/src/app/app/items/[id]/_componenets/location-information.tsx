import { Location, OrderResponse } from '@/types';

export default function LocationInformation({
  detailsHidden,
  orders,
  location,
}: {
  detailsHidden: boolean;
  orders: OrderResponse[];
  location?: Location;
}) {
  if (detailsHidden) {
    return null;
  }
  const totalDebt = orders.reduce((acc, order) => {
    return acc + order.debt;
  }, 0);
  return (
    <div className='flex flex-col w-full items-center text-center text-xl max-w-lg'>
      <LocationSpending location={location} />
      <div className='flex justify-between w-full'>
        <span>Total amount due</span>
        <span>{totalDebt}</span>
      </div>
    </div>
  );
}

function LocationSpending({ location }: { location?: Location }) {
  if (!location) {
    return null;
  }
  return (
    <>
      <div className='flex justify-between w-full'>
        <span>Total spent</span>
        <span>{location?.spendings}</span>
      </div>
      <div className='flex justify-between w-full'>
        <span>Total revenue</span>
        <span>{location?.revenue}</span>
      </div>
      <div className='flex justify-between w-full'>
        <span>Total profit</span>
        <span>{location?.profit}</span>
      </div>
    </>
  );
}
