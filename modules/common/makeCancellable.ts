/**
 * Make a promise cancellable.
 * 
 * @param promise The promise to make cancellable.
 * @returns The cancellable promise with a callback to cancel.
 */
export const makeCancellable = <T>(promise: Promise<T>): {promise: Promise<T>, cancel: () => void} => {
  let cancelled: boolean = false;

  const wrappedPromise = new Promise<T>((res, rej) => {
    promise
      .then((...args) => !cancelled && res(...args))
      .catch(err => !cancelled && rej(err));
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      cancelled = true;
    }
  }
}