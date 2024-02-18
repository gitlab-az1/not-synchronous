import Deferred from './deferred';
import { shortId } from './_internals/uid';
import { Exception } from './_internals/errors';
import IDisposable from './_internals/disposable';
import { Stack, Order } from './_internals/stack';
import { isPlainObject } from './_internals/utils';
import { EventEmitter, Event as BaseEvent, EventSubscribeOptions } from './_internals/events';


export type EventLoopOptions = {
  concurrency?: number;
}

/**
 * Represents the constructor of the EventLoop class.
 */
export interface EventLoopConstructor {

  /**
   * Schedule a callback function to be executed asynchronously.
   * 
   * @param callback The callback function to be scheduled.
   */
  schedule<T extends ((...args: unknown[]) => any | Promise<any>)>(callback: T): void;

  /**
   * Execute a callback function immediately scheduling the "immediate" execution of the callback after I/O events' callbacks.
   * 
   * @param callback The callback function to be executed.
   * @param args The arguments to be passed to the callback function.
   * @returns An object with a dispose method to cancel the scheduled callback.
   */
  immediate<TArgs extends any[]>(callback: (...args: TArgs) => void, ...args: TArgs): void;

  /**
   * Creates a new instance of the EventLoop class.
   * 
   * @param options Optional configuration options for the event loop.
   */
  new <T = any, R = any, E = unknown>(options?: EventLoopOptions): IEventLoop<T, R, E>;
}


let promise: Promise<void> | undefined;

export type JobOptions = {
  timeout?: number;
  delay?: number;
}

export interface Job<T> {
  readonly data: T;
  readonly jobId: string;
  readonly queuedAt: number;
  readonly messageType?: string;
  readonly options: JobOptions;
}

export type ProcessFn<T> = (context: Job<T>, abortSignal: AbortSignal) => Promise<any>;



/* events */
class CompletedEvent<T, R = any> extends BaseEvent<Job<T> & { result: R }> {
  constructor(target: Job<T> & { result: R }) {
    super('completed', target, { cancelable: false });
  }
}

class FailedEvent<T, E = Error> extends BaseEvent<Job<T> & { error: E }> {
  constructor(target: Job<T> & { error: E }) {
    super('failed', target, { cancelable: false });
  }
}

class ProcessingEvent extends BaseEvent<EventLoop> {
  constructor(target: EventLoop) {
    super('processing', target, { cancelable: false });
  }
}


export interface EventLoopDefaultEventsMap<T, R = any, E = Error> {
  completed: CompletedEvent<T, R>;
  failed: FailedEvent<T, E>;
  processing: ProcessingEvent;
}
/* events */




/**
 * Represents the event loop interface.
 */
export interface IEventLoop<T, R = any, E = Error> extends IDisposable {

  /**
   * Gets the number of jobs currently in the event loop queue.
   */
  readonly size: number;

  /**
   * Adds an event listener to the event loop.
   * 
   * @param event The name of the event to listen for.
   * @param listener The callback function to be invoked when the event is emitted.
   * @param thisArgs Optional value to use as 'this' when executing the listener.
   * @param options Additional options for subscribing to the event.
   * @returns An object that can be used to unsubscribe from the event.
   */
  addEventListener<K extends keyof EventLoopDefaultEventsMap<T, R, E>>(
    event: K | Omit<string, K>,
    listener: (event: EventLoopDefaultEventsMap<T, R, E>[K]) => any,
    thisArgs?: any,
    options?: EventSubscribeOptions // eslint-disable-line comma-dangle
  ): IDisposable & { unsubscribe: () => void };

  /**
   * Removes an event listener for a specific event type.
   * 
   * @param event The event type for which the listener should be removed.
   * @param listener The listener function to be removed.
   */
  removeEventListener<K extends keyof EventLoopDefaultEventsMap<T, R, E>>(
    event: K | Omit<string, K>,
    listener: (event: EventLoopDefaultEventsMap<T, R, E>[K]) => any // eslint-disable-line comma-dangle
  ): void;

  /**
   * Removes all event listeners for a specific event type.
   * 
   * @param event The event type for which all listeners should be removed.
   */
  removeManyEventListeners<K extends keyof EventLoopDefaultEventsMap<T, R, E>>(
    event: K | Omit<string, K> // eslint-disable-line comma-dangle
  ): void;

  /**
   * Removes all event listeners for all event types.
   */
  removeAllEventListeners(): void;

  /**
   * Adds a new job to the event loop queue.
   * 
   * @param context The context or data associated with the job.
   * @param type Optional string identifier for the job type.
   * @param options Additional options for the job.
   * @returns The index of the newly added job in the queue.
   */
  add(context: T, type?: string, options?: JobOptions): number;

  /**
   * Starts the event loop, processing jobs asynchronously.
   * 
   * @param fn The processing function to be executed for each job in the event loop.
   * @returns A promise that resolves when the event loop is stopped.
   * @throws {Exception} If the event loop is already processing.
   */
  start(fn: ProcessFn<T>): Promise<void>;

  /**
   * Disposes of the event loop, clearing all pending jobs and event listeners.
   */
  dispose(): void;
}


/**
 * A class for managing asynchronous event loop processing.
 */
export class EventLoop<T = any, R = any, E = unknown> implements IEventLoop<T, R, E> {

  /**
   * Schedule a callback function to be executed asynchronously.
   * 
   * @param callback The callback function to be scheduled.
   */
  public static schedule<T extends ((...args: unknown[]) => any | Promise<any>)>(callback: T): void {
    if(typeof queueMicrotask !== 'undefined' &&
      typeof queueMicrotask === 'function') return void queueMicrotask(callback);

    // Use a promise chain to ensure asynchronous execution
    (promise || (promise = Promise.resolve()))
      .then(callback)
      .catch(err => {
        // If an error occurs during execution, schedule it for immediate execution
        this.immediate(() => { throw err; });
      });
  }

  /**
   * Execute a callback function immediately scheduling the "immediate" execution of the callback after I/O events' callbacks.
   * 
   * @param callback The callback function to be executed.
   * @param args The arguments to be passed to the callback function.
   * @returns An object with a dispose method to cancel the scheduled callback.
   */
  public static immediate<TArgs extends any[]>(callback: (...args: TArgs) => void, ...args: TArgs): IDisposable & Disposable {
    const hasNativeMethod = typeof setImmediate === 'function';
    const id = hasNativeMethod ? setImmediate(callback, ...args) : setTimeout(callback, 0, ...args);

    return {
      dispose() {
        if(hasNativeMethod) {
          clearImmediate(id as NodeJS.Immediate);
        } else {
          clearTimeout(id as NodeJS.Timeout);
        }
      },

      [Symbol.dispose]() {
        if(hasNativeMethod) {
          clearImmediate(id as NodeJS.Immediate);
        } else {
          clearTimeout(id as NodeJS.Timeout);
        }
      },
    };
  }


  readonly #eventLoopQueueStack: Stack<Job<T>> = new Stack<Job<T>>({ order: Order.FIFO });
  #eventLoopQueueProcessor: ProcessFn<T> | undefined;

  readonly #ee: EventEmitter<EventLoopDefaultEventsMap<T, R, E> & { [key: string]: any }>;
  readonly #options: EventLoopOptions;
  #stopPromise?: Deferred<void>;
  #executing: Job<T>[] = [];

  /**
   * Creates a new instance of the EventLoop class.
   * 
   * @param options Optional configuration options for the event loop.
   */
  public constructor(options?: EventLoopOptions) {
    this.#options = Object.assign({}, options, { concurrency: 1 });
    this.#ee = new EventEmitter<EventLoopDefaultEventsMap<T, R, E> & { [key: string]: any }>();
  }

  /**
   * Gets the number of jobs currently in the event loop queue.
   */
  public get size(): number {
    return this.#eventLoopQueueStack.size();
  }

  /**
   * Adds an event listener to the event loop.
   * 
   * @param event The name of the event to listen for.
   * @param listener The callback function to be invoked when the event is emitted.
   * @param thisArgs Optional value to use as 'this' when executing the listener.
   * @param options Additional options for subscribing to the event.
   * @returns An object that can be used to unsubscribe from the event.
   */
  public addEventListener<K extends keyof EventLoopDefaultEventsMap<T, R, E>>(
    event: K | Omit<string, K>,
    listener: (event: EventLoopDefaultEventsMap<T, R, E>[K]) => any,
    thisArgs?: any,
    options?: EventSubscribeOptions | undefined // eslint-disable-line comma-dangle
  ): IDisposable & { unsubscribe: () => void } {
    return this.#ee.subscribe(event, listener, thisArgs, options);
  }

  /**
   * Removes an event listener for a specific event type.
   * 
   * @param event The event type for which the listener should be removed.
   * @param listener The listener function to be removed.
   */
  public removeEventListener<K extends keyof EventLoopDefaultEventsMap<T, R, E>>(event: K | Omit<string, K>, listener: (event: EventLoopDefaultEventsMap<T, R, E>[K]) => any): void {
    this.#ee.removeListener(event, listener);    
  }

  /**
   * Removes all event listeners for a specific event type.
   * @param event The event type for which all listeners should be removed.
   */
  public removeManyEventListeners<K extends keyof EventLoopDefaultEventsMap<T, R, E>>(event: K | Omit<string, K>): void {
    this.#ee.removeListener(event);    
  }

  /**
   * Removes all event listeners for all event types.
   */
  public removeAllEventListeners(): void {
    this.#ee.removeListeners();
  }

  /**
   * Adds a new job to the event loop queue.
   * 
   * @param context The context or data associated with the job.
   * @param type Optional string identifier for the job type.
   * @param options Additional options for the job.
   * @returns The index of the newly added job in the queue.
   */
  public add(context: T, type?: string, options?: JobOptions): number {
    const jobId = shortId();

    this.#eventLoopQueueStack.push({
      data: context,
      jobId,
      queuedAt: Date.now(),
      messageType: type,
      options: Object.assign({}, options),
    });

    EventLoop.schedule(() => this.#execute());
    return this.#eventLoopQueueStack.findIndex(j => j.jobId === jobId);
  }

  #execute(): void {
    if(!this.#eventLoopQueueProcessor) return;
    if(this.#executing.length > 0) return;
    if(this.#eventLoopQueueStack.size() === 0) return;
    if(typeof this.#eventLoopQueueProcessor !== 'function') return;

    while(this.#executing.length < (this.#options.concurrency || 1)) {
      const job = this.#eventLoopQueueStack.pop();
      if(!job) break;
    
      this.#executing.push(job);
    }

    for(const job of this.#executing) {
      const processJob = () => {
        if(!this.#eventLoopQueueProcessor) return;

        if(job.options.timeout && job.options.timeout > 0) {
          const ac = new AbortController();
  
          Promise.race([
            this.#eventLoopQueueProcessor(job, ac.signal),
            new Promise((_, reject) => {
              setTimeout(() => {
                ac.abort(new Error(`Timeout of ${job.options.timeout}ms exceeded`));
                reject(new Error(`Timeout of ${job.options.timeout}ms exceeded`));
              }, job.options.timeout);
            }),
          ]).then(result => {
            this.#ee.emit('completed', new CompletedEvent({
              ...job,
              result,
            }));
          }).catch(err => {
            if(typeof err !== 'object' || isPlainObject(err)) {
              err = new Error(typeof err === 'object' ? err.message ?? err : err);
            }
  
            this.#ee.emit('failed', new FailedEvent({
              ...job,
              error: err,
            }));
          }).finally(() => {
            const index = this.#executing.findIndex(j => j.jobId === job.jobId);
  
            if(index > -1) {
              this.#executing.splice(index, 1);
            }
          });
        } else {
          this.#eventLoopQueueProcessor(job, new AbortController().signal).then(result => {
            this.#ee.emit('completed', new CompletedEvent({
              ...job,
              result,
            }));
          }).catch(err => {
            if(typeof err !== 'object' || isPlainObject(err)) {
              err = new Error(typeof err === 'object' ? err.message ?? err : err);
            }
  
            this.#ee.emit('failed', new FailedEvent({
              ...job,
              error: err,
            }));
          }).finally(() => {
            const index = this.#executing.findIndex(j => j.jobId === job.jobId);
  
            if(index > -1) {
              this.#executing.splice(index, 1);
            }
          });
        }
      };

      if(job.options.delay && job.options.delay > 0) {
        setTimeout(() => {
          EventLoop.schedule(processJob);
        }, job.options.delay);
      } else {
        EventLoop.schedule(processJob);
      }
    }
  }

  /**
   * Starts the event loop, processing jobs asynchronously.
   * 
   * @param fn The processing function to be executed for each job in the event loop.
   * @returns A promise that resolves when the event loop is stopped.
   * @throws {Exception} If the event loop is already processing.
   */
  public start(fn: ProcessFn<T>): Promise<void> {
    // eslint-disable-next-line no-extra-boolean-cast
    if(!!this.#eventLoopQueueProcessor) {
      throw new Exception('SyncQueue is already processing');
    }

    this.#eventLoopQueueProcessor = fn;
    EventLoop.schedule(() => this.#execute());
    this.#ee.emit('processing', new ProcessingEvent(this));

    this.#stopPromise = new Deferred<void>();
    return this.#stopPromise.promise;
  }

  /**
   * Disposes of the event loop, clearing all pending jobs and event listeners.
   */
  public dispose(): void {
    this.#eventLoopQueueProcessor = undefined;
    this.#eventLoopQueueStack.clear();
    this.#executing = [];

    if(this.#stopPromise) {
      this.#stopPromise.resolve();
      this.#stopPromise = void 0;
    }

    this.removeAllEventListeners();
    this.#ee.dispose();
  }
}

export default EventLoop;
