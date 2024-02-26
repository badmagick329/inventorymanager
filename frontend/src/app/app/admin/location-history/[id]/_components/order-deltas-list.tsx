import { Delta } from '@/types';
import ChangesDisplay from './changes-display';
import PaddedDivider from '@/components/padded-divider';

export default function OrderDeltasList({ deltas }: { deltas: Delta[] }) {
  return (
    <>
      {deltas.map((delta, index) => {
        if (delta.changes.length === 0) return null;
        return (
          <div key={index} className='flex flex-col'>
            <ChangesDisplay
              changes={delta.changes}
              lastModifiedBy={delta.lastModifiedBy}
              lastModified={delta.lastModified}
            />
            <PaddedDivider />
          </div>
        );
      })}
    </>
  );
}
