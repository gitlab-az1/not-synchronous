import Deferred from './deferred';
import EventLoop from './event-loop';


type Result<T, E = unknown> = 
  | { status: 'fulfilled', value: T }
  | { status: 'rejected', reason: E };


/**
 * Executes an array of promise-returning functions with given arguments concurrently,
 * limiting the concurrency to a specified number.
 * 
 * @param args Array of arguments to be passed to each promise-returning function.
 * @param callback Promise-returning function to be executed with each set of arguments.
 * @param concurrency Maximum number of promises to be executed concurrently (default: 3).
 * @returns A promise that resolves to an array of results indicating the status and value/reason of each promise.
 */
export function mapPromises<
  T,
  Args extends unknown[],
  Callback extends (...args: Args) => Promise<T>
>(args: Args[], callback: Callback, concurrency: number = 3): Promise<Result<T>[]> {
  const deferred = new Deferred<Result<T>[]>();
  const results = [] as Result<T>[];

  let cursor = 0,
    settled = 0;

  const next = () => {
    if(cursor < args.length) {
      const index = cursor++;

      void callback(...args[index])
        .then(value => {
          results[index] = { status: 'fulfilled', value };
        }).catch(reason => {
          results[index] = { status: 'rejected', reason };
        }).then(() => {
          settled++;
          EventLoop.immediate(next);
        });
    } else if(settled === args.length) {
      deferred.resolve(results);
    }
  };

  while(--concurrency >= 0) {
    next();
  }

  return deferred.promise;
}


/**
 * Executes an array of promise-returning functions concurrently, limiting the concurrency.
 * 
 * @param callbacks Array of promise-returning functions to be executed.
 * @param concurrency Maximum number of promises to be executed concurrently (default: 3).
 * @returns A promise that resolves to an array of results indicating the status and value/reason of each promise.
 */
export function promiseConcurrency<T>(callbacks: (() => Promise<T>)[], concurrency: number = 3): Promise<Result<T>[]> {
  const deferred = new Deferred<Result<T>[]>();
  const results = [] as Result<T>[];

  let cursor = 0,
    settled = 0;

  const next = () => {
    if(cursor < callbacks.length) {
      const index = cursor++;

      void callbacks[index]()
        .then(result => {
          results[index] = { status: 'fulfilled', value: result };
        }).catch(reason => {
          results[index] = { status: 'rejected', reason };
        }).then(() => {
          settled++;
          EventLoop.immediate(next);
        });
    } else if(settled === callbacks.length) {
      deferred.resolve(results);
    }
  };

  while(--concurrency >= 0) {
    next();
  }

  return deferred.promise;
}



export namespace concurrency { // eslint-disable-line @typescript-eslint/no-namespace
  /**
   * Executes an array of promise-returning functions with given arguments concurrently,
   * limiting the concurrency to a specified number.
   * 
   * @param args Array of arguments to be passed to each promise-returning function.
   * @param callback Promise-returning function to be executed with each set of arguments.
   * @param concurrency Maximum number of promises to be executed concurrently (default: 3).
   * @returns A promise that resolves to an array of results indicating the status and value/reason of each promise.
   */
  export function mapPromises<
    T,
    Args extends unknown[],
    Callback extends (...args: Args) => Promise<T>
  >(args: Args[], callback: Callback, concurrency: number = 3): Promise<Result<T>[]> {
    const deferred = new Deferred<Result<T>[]>();
    const results = [] as Result<T>[];

    let cursor = 0,
      settled = 0;

    const next = () => {
      if(cursor < args.length) {
        const index = cursor++;

        void callback(...args[index])
          .then(value => {
            results[index] = { status: 'fulfilled', value };
          }).catch(reason => {
            results[index] = { status: 'rejected', reason };
          }).then(() => {
            settled++;
            EventLoop.immediate(next);
          });
      } else if(settled === args.length) {
        deferred.resolve(results);
      }
    };

    while(--concurrency >= 0) {
      next();
    }

    return deferred.promise;
  }


  /**
   * Executes an array of promise-returning functions concurrently, limiting the concurrency.
   * 
   * @param callbacks Array of promise-returning functions to be executed.
   * @param concurrency Maximum number of promises to be executed concurrently (default: 3).
   * @returns A promise that resolves to an array of results indicating the status and value/reason of each promise.
   */
  export function promiseConcurrency<T>(callbacks: (() => Promise<T>)[], concurrency: number = 3): Promise<Result<T>[]> {
    const deferred = new Deferred<Result<T>[]>();
    const results = [] as Result<T>[];

    let cursor = 0,
      settled = 0;

    const next = () => {
      if(cursor < callbacks.length) {
        const index = cursor++;

        void callbacks[index]()
          .then(result => {
            results[index] = { status: 'fulfilled', value: result };
          }).catch(reason => {
            results[index] = { status: 'rejected', reason };
          }).then(() => {
            settled++;
            EventLoop.immediate(next);
          });
      } else if(settled === callbacks.length) {
        deferred.resolve(results);
      }
    };

    while(--concurrency >= 0) {
      next();
    }

    return deferred.promise;
  }
}

export default concurrency;
