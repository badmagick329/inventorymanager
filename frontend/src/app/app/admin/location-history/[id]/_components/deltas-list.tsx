import { Delta } from '@/types';
import { UTCStringtoLocalDate } from '@/utils';
import { Accordion, AccordionItem } from "@heroui/react";

import ChangesDisplay from './changes-display';

export default function DeltasList({
  deltas,
  message,
}: {
  deltas: Delta[];
  message?: string;
}) {
  const nonEmptyDeltas = deltas.filter((delta) => delta.changes.length > 0);
  if (nonEmptyDeltas.length === 0) {
    return null;
  }
  return (
    <div className='flex flex-col rounded-md border-1 border-default-500'>
      <Accordion selectionMode='multiple'>
        <AccordionItem
          title={`${nonEmptyDeltas.length} change${nonEmptyDeltas.length > 1 ? 's' : ''} ${message || ''}`}
        >
          <div className='flex flex-col divide-y-2 divide-default-500'>
            {deltas.map((delta, index) => {
              if (delta.changes.length === 0) return null;
              return (
                <div key={index} className='flex flex-col py-2'>
                  <ChangesDisplay
                    changes={delta.changes}
                    lastModifiedBy={delta.lastModifiedBy}
                    lastModified={UTCStringtoLocalDate(
                      delta.lastModified
                    ).toLocaleString()}
                  />
                </div>
              );
            })}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
