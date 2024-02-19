'use client';
import { ShoppingCart, ArrowUp as ArrowUpIcon } from 'lucide-react';
import { ICON_SM } from '@/consts';

type StockInOutContentProps = {
  stockIn: number;
  stockOut: number;
};

export default function StockInOutContent({
  stockIn,
  stockOut,
}: StockInOutContentProps) {
  const inColor = getStockInColor(stockIn, stockOut);
  const outColor = getStockOutColor(stockIn, stockOut);
  return (
    <>
      <span className='flex gap-2'>
        <span className={`flex gap-2 ${inColor}`}>
          <ShoppingCart size={ICON_SM} />
          {stockIn}
        </span>
        <span className={`flex gap-2 ${outColor}`}>
          <ArrowUpIcon size={ICON_SM} />
          {stockOut}
        </span>
      </span>
    </>
  );
}

function getStockInColor(stockIn: number, stockOut: number) {
  if (stockIn > 0 && stockOut > 0) {
    return 'text-primary-500';
  } else if (stockIn > 0 && stockOut === 0) {
    return 'text-foreground';
  } else {
    return 'text-success-600';
  }
}

function getStockOutColor(stockIn: number, stockOut: number) {
  if (stockOut > 0 && stockIn > 0) {
    return 'text-primary-500';
  } else if (stockOut > 0 && stockIn === 0) {
    return 'text-success-600';
  } else {
    return 'text-foreground';
  }
}
