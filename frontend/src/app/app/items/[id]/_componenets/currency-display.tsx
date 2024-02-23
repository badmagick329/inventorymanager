import { formatCurrency } from '@/utils';

export default function CurrencyDisplay({
  text,
  value,
}: {
  text: string;
  value?: number;
}) {
  if (value === undefined) {
    return null;
  }
  return (
    <div className='flex w-full justify-between py-2'>
      <span>{text}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
