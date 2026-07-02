import { useState, useEffect } from 'react';

export const getStoredData = <T,>(key: string, defaultData: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultData;
  }
};

export const setStoredData = <T,>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => getStoredData(key, initialValue));

  useEffect(() => {
    setStoredData(key, state);
  }, [key, state]);

  return [state, setState] as const;
}
