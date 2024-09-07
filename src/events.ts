import { uuid } from './_internals/uid';
import { Hash } from './_internals/crypto';
import { Exception } from './_internals/errors';
import { assertString } from './_internals/utils';
import { IDisposable } from './_internals/disposable';
import type { Dict, Writable } from './_internals/types';


const logger = console;

class Stacktrace {
  public static create(): Stacktrace {
    return new Stacktrace(new Error().stack ?? '');
  }

  private constructor(readonly value: string) { }

  public print(): void {
    logger.warn(this.value.split('\n').slice(2).join('\n'));
  }
}


export type EventOptions = {
  cancelable?: boolean;
  stack?: Stacktrace;
  onCancel?: () => void;
  onPropagate?: () => void;
  onPropagationStopped?: () => void;
  onDefaultPrevented?: () => void;
}

/**
 * Represents an event object.
 * 
 * @template T The type of the event data.
 */
export class Event<T> {
  public readonly target: T;
  public readonly timestamp: number;
  public readonly cancelable: boolean;
  private readonly _stack?: Stacktrace;
  private _isCancelled: boolean = false;
  private _isDefaultPrevented: boolean = false;
  private _isDelivered: boolean = false;
  private readonly _callbacks: Dict<(() => void) | null | undefined> = {};

  /**
   * Constructs an Event object.
   * 
   * @param type The type of the event.
   * @param data The data associated with the event.
   * @param options Additional options for the event.
   */
  public constructor(
    public readonly type: string,
    data: T,
    options?: EventOptions // eslint-disable-line comma-dangle
  ) {
    this.target = data;
    this.timestamp = Date.now();
    this.cancelable = options?.cancelable || false;
    this._stack = options?.stack;

    this._callbacks = {
      _cancel: options?.onCancel,
      _propagate: options?.onPropagate,
      _propagateEnd: options?.onDefaultPrevented,
      _stopPropagation: options?.onPropagationStopped,
    };
  }

  public get isDefaultPrevented(): boolean {
    return this._isDefaultPrevented;
  }

  public get isCancelled(): boolean {
    return this._isCancelled;
  }

  public get isDelivered(): boolean {
    return this._isDelivered;
  }

  public get stack(): string | undefined {
    return this._stack?.value;
  }

  public preventDefault(): void {
    if(this._isDefaultPrevented) return;

    this._callbacks._propagateEnd?.();
    this._isDefaultPrevented = true;
  }

  public stopPropagation(): void {
    if(!this._isDelivered) return;
    this._callbacks._stopPropagation?.();
    this._isDelivered = true;
  }

  public cancel(): void {
    if(!this.cancelable) return;
    this._callbacks._cancel?.();
    this._isCancelled = true;
  }
}


export interface ListenerSubscription {
  readonly listener: (...args: any[]) => any;
  readonly unsubscribe: () => void;
  readonly thisArgs?: any;
  readonly listenerSignature: string;
  readonly subscriptionId: string;
  readonly once: boolean;
  readonly stack?: Stacktrace;
  readonly calls: number;
  readonly isDisposed: boolean;
  readonly eventName: string;
}


export type EventSubscribeOptions = {
  once?: boolean;
  stack?: Stacktrace;
}

export type EventEmitterOptions = {
  onListenerError?: (error: Error) => void;
}

/**
 * Represents an event emitter.
 */
export class EventEmitter<EventsMap extends Dict<Event<any>> = Dict<Event<any>>> {
  private _size: number = 0;
  private _disposed: boolean = false;
  private readonly _listeners: Map<string, ListenerSubscription[]> = new Map();

  
  constructor(private readonly _options?: EventEmitterOptions) { }

  /**
   * Subscribes to an event.
   * 
   * @param event The type of event to subscribe to.
   * @param listener The function to be called when the event is emitted.
   * @param thisArgs The context object to be used as 'this' when calling the listener function.
   * @param options Additional options for the subscription.
   * @returns An object containing a method to unsubscribe from the event.
   */
  public subscribe<K extends keyof EventsMap>(
    event: K | Omit<string, K>,
    listener: (e: EventsMap[K]) => any,
    thisArgs?: any | undefined,
    options?: EventSubscribeOptions // eslint-disable-line comma-dangle
  ): IDisposable & { unsubscribe: () => void } {
    assertString(event);

    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    if(!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }

    const previousListeners = this._listeners.get(event) ?? [];
    const listenerSignature = Hash.sha256(listener.toString());

    const unsubscribe = () => {
      const index = previousListeners.findIndex(item => item.listenerSignature === listenerSignature);

      if(index > -1) {
        previousListeners.splice(index, 1);
        this._size--;
      }
    };

    const dispose = () => {
      const index = previousListeners.findIndex(item => item.listenerSignature === listenerSignature);
      if(index < 0) return;

      const self = previousListeners[index] as Writable<ListenerSubscription>;
      self.isDisposed = true;

      previousListeners.splice(index, 1);
      previousListeners.push(self);
    };

    const self = {
      calls: 0,
      eventName: event,
      isDisposed: false,
      listener,
      listenerSignature,
      once: typeof options?.once === 'boolean' ? options.once : false,
      subscriptionId: uuid(),
      unsubscribe,
      stack: options?.stack,
      thisArgs,
    } satisfies ListenerSubscription;

    previousListeners.push(self);
    this._size++;

    return {
      dispose,
      unsubscribe,
    };
  }

  /**
   * Emits an event, invoking all subscribed listeners.
   * 
   * @param event The event to emit.
   * @param args Arguments to pass to the event listeners.
   * @returns An array of results returned by the event listeners.
   */
  public emit<K extends keyof EventsMap>(event: K | Omit<string, K>, ...args: any[]): any[] | undefined {
    assertString(event);

    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    args ??= [];
    if(!this._listeners.has(event)) return;

    const listeners = this._listeners.get(event) ?? [];
    const errorHandler = this._options?.onListenerError ?? (err => {
      logger.warn(`[uncaught exception]: ${err.message ?? err}`);

      if(err && typeof err !== 'string' && !!err.stack) {
        logger.warn(err.stack);
      }
    });

    const results = [];

    for(const subscription of listeners as Writable<ListenerSubscription>[]) {
      if(subscription.isDisposed) continue;

      if(subscription.once === true &&
        subscription.calls > 0) {
        subscription.unsubscribe();
        continue;
      }

      try {
        if(subscription.thisArgs) {
          results.push(subscription.listener.apply(subscription.thisArgs, args));
        } else {
          results.push(subscription.listener(...args));
        }
      } catch (err: any) {
        errorHandler(err);
      }

      subscription.calls++;
      const index = listeners.findIndex(item => item.subscriptionId === subscription.subscriptionId);

      if(index > -1) {
        listeners.splice(index, 1);
        listeners.push(subscription);
      }
    }

    return results;
  }

  /**
   * Fires an event with provided data.
   * 
   * @param event The event to fire.
   * @param data The data to pass to the event listeners.
   */
  public fire<K extends keyof EventsMap>(event: K | Omit<string, K>, data: EventsMap[K] | any): void {
    assertString(event);

    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    const listeners = [...this._listeners.values()].flat();

    for(const subscription of listeners) {
      if(subscription.isDisposed) continue;

      if(subscription.once &&
        subscription.calls > 0) {
        subscription.unsubscribe();
        continue;
      }

      try {
        if(subscription.thisArgs) {
          subscription.listener.apply(subscription.thisArgs, [data]);
        } else {
          subscription.listener(data);
        }
      } catch (err: any) {
        this._options?.onListenerError?.(err);
      }

      (<Writable<typeof subscription>>subscription).calls++;
      const index = listeners.findIndex(item => item.subscriptionId === subscription.subscriptionId);

      if(index > -1) {
        listeners.splice(index, 1);
        listeners.push(subscription);
      }
    }

    this.removeListener(event);
  }

  /**
   * Gets the subscription for a specific event listener.
   * 
   * @param event The event to query.
   * @param listener The event listener function.
   * @returns The subscription object if found, otherwise null.
   */
  public getSubscription<K extends keyof EventsMap>(event: K | Omit<string, K>, listener: (...args: any[]) => any): ListenerSubscription | null {
    assertString(event);

    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    if(!this._listeners.has(event)) return null;

    const listenerSignature = Hash.sha256(listener.toString());
    const listeners = this._listeners.get(event) ?? [];

    for(const subscription of listeners) {
      if(subscription.listenerSignature === listenerSignature) {
        return subscription;
      }
    }

    return null;
  }

  /**
   * Gets all listeners for a specific event.
   * 
   * @param event The event to query.
   * @returns An array of listener subscriptions.
   */
  public getListeners<K extends keyof EventsMap>(event: K | Omit<string, K>): ListenerSubscription[] {
    assertString(event);

    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    return this._listeners.get(event) ?? [];
  }

  /**
   * Removes all listeners for all events.
   */
  public removeListeners(): void {
    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    this._listeners.clear();
    this._size = 0;
  }

  /**
   * Removes a listener for a specific event.
   * 
   * @param event The event to remove the listener from.
   * @param listener The listener function to remove.
   */
  public removeListener<K extends keyof EventsMap>(
    event: K | Omit<string, K>,
    listener?: (...args: any[]) => any // eslint-disable-line comma-dangle
  ): void {
    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    assertString(event);

    if(!this._listeners.has(event)) return;
    if(!listener) return void this._listeners.delete(event);

    const listenerSignature = Hash.sha256(listener.toString());
    const listeners = this._listeners.get(event) ?? [];

    for(const subscription of listeners) {
      if(subscription.listenerSignature === listenerSignature) {
        subscription.unsubscribe();
        this._size--;
        break;
      }
    }
  }

  /**
   * Checks if there are any active listeners.
   * 
   * @returns True if there are active listeners, false otherwise.
   */
  public hasListeners(): boolean {
    return this._size > 0;
  }

  /**
   * Disposes of the event emitter, removing all listeners.
   */
  public dispose(): void {
    if(this._disposed) return;

    this._listeners.clear();
    this._size = 0;

    this._disposed = true;
  }

  public [Symbol.toStringTag](): string {
    return '[object EventEmitter]';
  }

  public [Symbol.toPrimitive](): string {
    return this[Symbol.toStringTag]();
  }

  public [Symbol.iterator](): IterableIterator<[string, ListenerSubscription[]]> {
    return this._listeners.entries();
  }

  public [Symbol.dispose](): void {
    this.dispose();
  }
}
