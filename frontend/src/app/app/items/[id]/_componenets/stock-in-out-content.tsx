'use client';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { ICON_SM } from '@/consts';
import { Tooltip } from '@nextui-org/react';

type StockInOutContentProps = {
  stockIn: number;
  stockOut: number;
};

export default function StockInOutContent({
  stockIn,
  stockOut,
}: StockInOutContentProps) {
  const styling = getStyling(stockIn, stockOut);
  return (
    <>
      <span className='flex gap-2'>
        <StockIn stockIn={stockIn} styling={styling} />
        <Divider stockIn={stockIn} stockOut={stockOut} />
        <StockOut stockOut={stockOut} styling={styling} />
      </span>
    </>
  );
}

function StockIcon({ stockIn }: { stockIn: number }) {
  if (stockIn === 0) {
    return <Check size={ICON_SM} />;
  }
  if (stockIn > 0) {
    return <ShoppingCart size={ICON_SM} />;
  }
  const errorMessage =
    'Number of items sold is greater than the number of items set in stock';

  return (
    <Tooltip placement='top' content={errorMessage}>
      <AlertCircle size={ICON_SM} />
    </Tooltip>
  );
}

function StockIn({ stockIn, styling }: { stockIn: number; styling: string }) {
  if (stockIn === 0) {
    return (
      <span className={`flex gap-2 ${styling}`}>
        <Check size={ICON_SM} />
      </span>
    );
  }
  return (
    <span className={`flex gap-2 ${styling}`}>
      <StockIcon stockIn={stockIn} />
      {stockIn}
    </span>
  );
}

function Divider({ stockIn, stockOut }: { stockIn: number; stockOut: number }) {
  if (stockIn === 0 || stockOut === 0) {
    return null;
  }
  return <span> / </span>;
}

function StockOut({
  stockOut,
  styling,
}: {
  stockOut: number;
  styling: string;
}) {
  if (stockOut <= 0) {
    return null;
  }
  return <span className={`flex gap-2 ${styling}`}>{stockOut}</span>;
}

function getStyling(stockIn: number, stockOut: number) {
  if (stockIn > 0 && stockOut > 0) {
    return 'text-foreground';
  } else if (stockIn === 0) {
    return 'text-default-500';
  } else if (stockIn <= 0) {
    return 'text-danger-500 font-semibold';
  } else {
    return 'text-foreground';
  }
}
