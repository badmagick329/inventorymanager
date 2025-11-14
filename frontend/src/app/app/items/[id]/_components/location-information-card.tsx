import CurrencyDisplay from './currency-display';

export default function LocationInformationCard({
  revenue,
  spendings,
  profit,
}: {
  revenue?: number;
  spendings?: number;
  profit?: number;
}) {
  if (
    revenue === undefined ||
    spendings === undefined ||
    profit === undefined
  ) {
    return null;
  }
  return (
    <div className='flex w-full max-w-lg flex-col items-center gap-4'>
      <span
        data-testid='items-location-card-title'
        className='text-xl font-bold'
      >
        Location Information
      </span>
      <div className='flex w-full flex-col items-center divide-y-2 rounded-md p-4 text-center'>
        <CurrencyDisplay text='Total revenue' value={revenue} />
        <CurrencyDisplay text='Total spent' value={spendings} />
        <CurrencyDisplay text='Total profit' value={profit} />
      </div>
    </div>
  );
}
