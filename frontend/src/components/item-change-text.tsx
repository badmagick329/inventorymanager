export default function ItemChangeText({
  totalChanges,
  created,
  lastModifiedBy,
  lastModified,
}: {
  totalChanges: number;
  created: string;
  lastModifiedBy: string;
  lastModified: string;
}) {
  const changeText = totalChanges > 1 ? 'changes' : 'change';
  return (
    <div className='flex flex-col'>
      <span className='text-xs text-default-500'>
        <span className='font-semibold'>{totalChanges}</span> {changeText} -
        created on <span className='font-semibold'>{created}</span>
      </span>
      <span className='text-xs text-default-500'>
        Last modified by {lastModifiedBy} on{' '}
        <span className='font-semibold'>{lastModified}</span>
      </span>
    </div>
  );
}
