
/**
 * Represents a promise-like object that can be resolved asynchronously.
 * Extends the PromiseLike interface.
 */
export interface Thenable<T> extends PromiseLike<T> { }


/**
 * Represents a promise that can be cancelled.
 * Extends the native Promise interface.
 */
export interface CancelablePromise<T> extends Promise<T> {

  /**
   * Cancels the promise.
   */
  cancel(): void;
}

/**
 * Delays the resolution of a promise by a specified amount of time.
 * 
 * @param amount The delay duration in milliseconds (default is 750ms).
 * @returns A promise that resolves after the specified delay.
 */
export function delay(amount: number = 750) {
  return new Promise(resolve => setTimeout(resolve, amount));
}

/**
 * Checks if an object is thenable (has a `then` method).
 * 
 * @param obj The object to check.
 * @returns True if the object is thenable, otherwise false.
 */
export function isThenable<T>(obj: unknown): obj is Promise<T> {
  return !!obj && typeof (obj as unknown as Promise<T>).then === 'function';
}


/**
 * Converts a synchronous or asynchronous callback function into a promise.
 * 
 * @param callback The callback function to convert into a promise.
 * @returns A promise that resolves with the result of the callback function.
 *          If the callback returns a thenable object, the promise resolves or rejects accordingly.
 */
export function asPromise<T>(callback: () => T | Thenable<T>): Promise<T> {
  try {
    const item = callback();

    if(isThenable<T>(item)) return item;
    return Promise.resolve(item);
  } catch (err: any) {
    return Promise.reject(err);
  }
}
