import PriceFieldContent from './price-field-content';

export default function SalesInfoCardField({
  label,
  value,
  perItemValue,
}: {
  label: string;
  value: number;
  perItemValue?: number;
}) {
  return (
    <div className='flex w-full max-w-xs justify-between'>
      <span className='text-sm font-semibold sm:text-base'>{label}</span>
      <PriceFieldContent value={value} calculatedValue={perItemValue} />
    </div>
  );
}
