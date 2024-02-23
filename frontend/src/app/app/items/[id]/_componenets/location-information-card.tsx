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
    <div className='flex w-full max-w-lg flex-col gap-4 items-center'>
      <span className='text-xl font-bold'>Location Information</span>
      <div className='flex w-full flex-col items-center divide-y-2 rounded-md bg-neutral-100 p-4 text-center dark:divide-neutral-400 dark:bg-neutral-800'>
        <CurrencyDisplay text='Total revenue' value={revenue} />
        <CurrencyDisplay text='Total spent' value={spendings} />
        <CurrencyDisplay text='Total profit' value={profit} />
      </div>
    </div>
  );
}
