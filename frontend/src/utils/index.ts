import { isOrderResponse } from '@/predicates';

export function formatNumber(num: number) {
  const abs = Math.abs(num);
  if (abs < 1000) {
    return num.toFixed(0);
  }
  if (abs < 1000000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  if (abs < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
}

export function sleep(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
