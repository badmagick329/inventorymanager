import { Change } from '@/types';
import { ICON_MD } from '@/consts';
import { MoveRight } from 'lucide-react';

const fieldMap = new Map([
  ['name', 'Name'],
  ['pricePerItem', 'Price Per Item'],
  ['currentSalePrice', 'Sale Price'],
]);

export default function ChangesDisplay({
  changes,
  lastModifiedBy,
  lastModified,
}: {
  changes: Change[];
  lastModifiedBy?: string;
  lastModified: string;
}) {
  return (
    <div className='flex flex-col'>
      {changes.map((change, index) => {
        if (change.field === 'lastModifiedBy') {
          return null;
        }
        return (
          <div key={index}>
            <div className='flex gap-2'>
              <span className='font-semibold'>
                {fieldMap.get(change.field) ||
                  change.field.slice(0, 1).toUpperCase() +
                    change.field.slice(1)}
              </span>
              <span> </span>
              <span className='text-danger-500'>{change.oldValue || '-'}</span>
              <MoveRight size={ICON_MD} />
              <span className='text-success-500'>{change.newValue || '-'}</span>
            </div>
          </div>
        );
      })}
      {changes.length > 0 && (
        <div>
          {lastModifiedBy} - {lastModified}
        </div>
      )}
    </div>
  );
}
