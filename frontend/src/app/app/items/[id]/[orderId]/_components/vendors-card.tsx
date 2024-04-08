import { SalesInfoCardField } from '@/components';
import { VendorResponse } from '@/types';

export default function VendorsCard({
  vendors,
}: {
  vendors: VendorResponse[];
}) {
  return (
    <div className='flex w-1/2 max-w-xs flex-col items-center gap-2'>
      <span className='text-lg font-semibold sm:text-xl'>
        Amounts due for these sales
      </span>
      <div className='flex w-full max-w-xs rounded-md bg-neutral-500 py-[1px]'></div>
      {vendors.map((vendor, idx) => (
        <SalesInfoCardField key={idx} label={vendor.name} value={vendor.debt} />
      ))}
      {vendors.length === 0 && (
        <span className='text-sm text-neutral-500'>
          No sales data for this order
        </span>
      )}
    </div>
  );
}
