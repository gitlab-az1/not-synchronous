export * from './core';
export * from './iterable';
export * from './deferred';
export * from './event-loop';
export * from './concurrently';



type NativeEventLoopConstructor = import('./event-loop').EventLoopConstructor;
type NativeIEventLoop<T, R = any, E = Error> = import('./event-loop').IEventLoop<T, R, E>;
type NativeCancelablePromise<T> = import('./core').CancelablePromise<T>;
type NativeThenable<T> = import('./core').Thenable<T>;


export namespace nsync { // eslint-disable-line @typescript-eslint/no-namespace
  /* eslint-disable @typescript-eslint/no-var-requires */

  export const concurrently: typeof import('./concurrently').concurrency = require('./concurrently').concurrency;
  export const iterable: typeof import('./iterable').iterable = require('./iterable').iterable;

  /**
   * Represents the constructor of the EventLoop class.
   */
  export interface EventLoopConstructor extends NativeEventLoopConstructor {}

  /**
   * Represents the event loop interface.
   */
  export interface IEventLoop<T, R = any, E = Error> extends NativeIEventLoop<T, R, E> {}

  /**
   * Represents a promise-like object that can be resolved asynchronously.
   * Extends the PromiseLike interface.
   */
  export interface Thenable<T> extends NativeThenable<T> {}

  /**
   * Represents a promise that can be cancelled.
   * Extends the native Promise interface.
   */
  export interface CancelablePromise<T> extends NativeCancelablePromise<T> {}

  /**
   * A class for managing asynchronous event loop processing.
   */
  export const EventLoop: typeof import('./event-loop').EventLoop = require('./event-loop').EventLoop;

  /**
   * Represents a promise whose resolution can be controlled externally.
   * Allows resolving, rejecting, and canceling the promise.
   */
  export const Deferred: typeof import('./deferred').Deferred = require('./deferred').Deferred;

  /**
   * Delays the resolution of a promise by a specified amount of time.
   * 
   * @param amount The delay duration in milliseconds (default is 750ms).
   * @returns A promise that resolves after the specified delay.
   */
  export const delay: typeof import('./core').delay = require('./core').delay;

  /**
   * Checks if an object is thenable (has a `then` method).
   * 
   * @param obj The object to check.
   * @returns True if the object is thenable, otherwise false.
   */
  export const isThenable: typeof import('./core').isThenable = require('./core').isThenable;

  /**
   * Converts a synchronous or asynchronous callback function into a promise.
   * 
   * @param callback The callback function to convert into a promise.
   * @returns A promise that resolves with the result of the callback function.
   *          If the callback returns a thenable object, the promise resolves or rejects accordingly.
   */
  export const asPromise: typeof import('./core').asPromise = require('./core').asPromise;

  /**
   * Executes an array of promise-returning functions with given arguments concurrently,
   * limiting the concurrency to a specified number.
   * 
   * @param args Array of arguments to be passed to each promise-returning function.
   * @param callback Promise-returning function to be executed with each set of arguments.
   * @param concurrency Maximum number of promises to be executed concurrently (default: 3).
   * @returns A promise that resolves to an array of results indicating the status and value/reason of each promise.
   */
  export const mapPromises: typeof import('./concurrently').mapPromises = require('./concurrently').mapPromises;

  /**
   * Executes an array of promise-returning functions concurrently, limiting the concurrency.
   * 
   * @param callbacks Array of promise-returning functions to be executed.
   * @param concurrency Maximum number of promises to be executed concurrently (default: 3).
   * @returns A promise that resolves to an array of results indicating the status and value/reason of each promise.
   */
  export const promiseConcurrency: typeof import('./concurrently').promiseConcurrency = require('./concurrently').promiseConcurrency;

  /**
   * Iterates over an array-like object or an iterable, calling a provided function on each element.
   * 
   * @param thing The array-like object or iterable to iterate over.
   * @param callback The function to call for each element.
   * @param limit The maximum number of iterations to perform.
   */
  export const forEachArray: typeof import('./iterable').forEachArray = require('./iterable').forEachArray;

  /**
   * Safe version of `forEachArray` that catches errors and continues to the next iteration.
   * 
   * @param thing The array-like object or iterable to iterate over.
   * @param callback The function to call for each element. 
   * @param limit The maximum number of iterations to perform.
   */
  export const forEachArraySafe: typeof import('./iterable').forEachArraySafe = require('./iterable').forEachArraySafe;

  /**
   * Iterates over an object, calling a provided function on each key-value pair.
   * 
   * @param thing The object to iterate over.
   * @param callback The function to call for each key-value pair.
   * @param limit (optional) The maximum number of iterations to perform.
   */
  export const forEachObject: typeof import('./iterable').forEachObject = require('./iterable').forEachObject;

  /**
   * Safe version of `forEachObject` that catches errors and continues to the next iteration.
   * 
   * @param thing The object to iterate over.
   * @param callback The function to call for each key-value pair.
   * @param limit (optional) The maximum number of iterations to perform.
   */
  export const forEachObjectSafe: typeof import('./iterable').forEachObjectSafe = require('./iterable').forEachObjectSafe;
  /* eslint-enable @typescript-eslint/no-var-requires */
}

export default nsync;
