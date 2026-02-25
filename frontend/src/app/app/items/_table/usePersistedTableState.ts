'use client';

import { useLocalStorage } from '@/hooks';
import { BaseTableState } from './types';

export function usePersistedTableState<T extends BaseTableState>(
  storageKey: string,
  initialState: T
) {
  return useLocalStorage<T>(storageKey, initialState);
}

