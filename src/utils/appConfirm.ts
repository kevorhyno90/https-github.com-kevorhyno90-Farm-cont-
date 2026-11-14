export interface ConfirmRequest {
  message: string;
  resolve: (confirmed: boolean) => void;
}

export const CONFIRM_EVENT = 'jr-farm-confirm';

/**
 * Non-blocking in-app replacement for window.confirm().
 */
export function appConfirm(message: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }
  return new Promise<boolean>((resolve) => {
    const event = new CustomEvent<ConfirmRequest>(CONFIRM_EVENT, {
      detail: { message, resolve }
    });
    window.dispatchEvent(event);
  });
}

