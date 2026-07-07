/**
 * A reference to the native localStorage.setItem, captured before any interceptors
 * are installed. Use this to write to localStorage without triggering the sync
 * interceptor (e.g., when writing data received from the cloud to avoid an
 * infinite push → snapshot → push loop).
 */
export const nativeSetItem = localStorage.setItem.bind(localStorage);
