import { useState } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const updateValue = (newValue: T) => {
    try {
      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error on update local storage');
    }
  };

  const removeValue = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
      setValue(initialValue);
    } catch (error) {
      console.error('Error on remove local storage');
    }
  };

  return [value, updateValue, removeValue];
}

export default useLocalStorage;
