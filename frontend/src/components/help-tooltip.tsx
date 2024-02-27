import { HelpCircle } from 'lucide-react';
import { ICON_SM } from '@/consts';
import { Tooltip } from '@nextui-org/react';
import { DELAY_500 } from '@/consts';

export default function HelpTooltip({ content }: { content: string }) {
  return (
    <div className='flex items-center'>
      <Tooltip content={content} color='default' delay={DELAY_500}>
        <HelpCircle size={ICON_SM} />
      </Tooltip>
    </div>
  );
}
