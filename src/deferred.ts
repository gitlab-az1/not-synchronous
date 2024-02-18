import { CanceledError } from './_internals/errors';


/**
 * Represents a callback function that handles a resolved value or a promise.
 */
export type ValueCallback<T = unknown> = (value: T | Promise<T>) => void;

/**
 * Enumeration of possible outcomes for a deferred promise.
 */
const enum DeferredOutcome {
  Resolved,
  Rejected
}


/**
 * Represents a promise whose resolution can be controlled externally.
 * Allows resolving, rejecting, and canceling the promise.
 */
export class Deferred<T, E = unknown> {
  private _onfulfilled: ValueCallback<T>;
  private _onrejected: (reason?: E) => void;
  private _outcome?: { outcome: DeferredOutcome.Resolved, value: T } | { outcome: DeferredOutcome.Rejected, reason?: E };

  /**
   * The promise associated with this Deferred instance.
   */
  public readonly promise: Promise<T>;

  /**
   * Constructs a new Deferred instance.
   */
  public constructor() {
    this.promise = new Promise((resolve, reject) => {
      [this._onfulfilled, this._onrejected] = [resolve, reject];
    });
  }

  /**
   * Checks if the promise has been rejected.
   */
  public get isRejected() {
    return this._outcome?.outcome === DeferredOutcome.Rejected;
  }

  /**
   * Checks if the promise has been resolved.
   */
  public get isResolved() {
    return this._outcome?.outcome === DeferredOutcome.Resolved;
  }

  /**
   * Retrieves the resolved value of the promise, if available.
   */
  public get value(): T | undefined {
    if(this._outcome?.outcome === DeferredOutcome.Resolved) return this._outcome.value;
    return undefined;
  }

  /**
   * Resolves the promise with the provided value.
   * 
   * @param value The value to resolve the promise with.
   * @returns A promise that resolves once the current promise is resolved.
   */
  public resolve(value: T): Promise<void> {
    return new Promise<void>(resolve => {
      this._onfulfilled(value);

      this._outcome = {
        outcome: DeferredOutcome.Resolved,
        value,
      } as const;

      resolve();
    });
  }

  /**
   * Rejects the promise with the provided reason.
   * 
   * @param reason The reason for rejecting the promise.
   * @returns A promise that resolves once the current promise is rejected.
   */
  public reject(reason?: E): Promise<void> {
    return new Promise<void>(resolve => {
      this._onrejected(reason);

      this._outcome = {
        outcome: DeferredOutcome.Rejected,
        reason,
      } as const;

      resolve();
    });
  }

  /**
   * Cancels the promise by rejecting it with a CanceledError.
   * 
   * @param reason The reason for canceling the promise.
   */
  public cancel(reason?: string): void {
    this.reject(new CanceledError(reason) as unknown as any);
  }
}

export default Deferred;
