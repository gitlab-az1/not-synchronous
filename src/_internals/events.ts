import { uuid } from './uid';
import { Hash } from './crypto';
import { Exception } from './errors';
import { assertString } from './utils';
import { IDisposable } from './disposable';
import type { Dict, Writable } from './types';


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
}

export class Event<T> {
  public readonly target: T;
  public readonly timestamp: number;
  public readonly cancelable: boolean;
  private readonly _stack?: Stacktrace;
  private _isCancelled: boolean = false;
  private _isDefaultPrevented: boolean = false;
  private _isDelivered: boolean = false;

  constructor(
    public readonly type: string,
    data: T,
    options?: EventOptions // eslint-disable-line comma-dangle
  ) {
    this.target = data;
    this.timestamp = Date.now();
    this.cancelable = options?.cancelable ?? false;
    this._stack = options?.stack;
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
    if(this.cancelable) {
      this._isDefaultPrevented = true;
    }
  }

  public stopPropagation(): void {
    throw new Error('Not implemented');
  }

  public cancel(): void {
    if(this.cancelable) {
      this._isCancelled = true;
    }
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

export class EventEmitter<EventsMap extends Dict<Event<any>> = Dict<Event<any>>> {
  private _size: number = 0;
  private _disposed: boolean = false;
  private readonly _listeners: Map<string, ListenerSubscription[]> = new Map();

  constructor(private readonly _options?: EventEmitterOptions) { }

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

  public fire<K extends keyof EventsMap>(event: K | Omit<string, K>, data: EventsMap[K] | any): void {
    assertString(event);

    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    if(!this._listeners.has(event)) return;

    const listeners = this._listeners.get(event) ?? [];

    for(const subscription of listeners as Writable<ListenerSubscription>[]) {
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

      subscription.calls++;
      const index = listeners.findIndex(item => item.subscriptionId === subscription.subscriptionId);

      if(index > -1) {
        listeners.splice(index, 1);
        listeners.push(subscription);
      }
    }
  }

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

  public getListeners<K extends keyof EventsMap>(event: K | Omit<string, K>): ListenerSubscription[] {
    assertString(event);

    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    return this._listeners.get(event) ?? [];
  }

  public removeListeners(): void {
    if(this._disposed) {
      throw new Exception('EventEmitter has been disposed');
    }

    this._listeners.clear();
    this._size = 0;
  }

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

  public hasListeners(): boolean {
    return this._size > 0;
  }

  public dispose(): void {
    if(this._disposed) return;

    this._listeners.clear();
    this._size = 0;

    this._disposed = true;
  }
}
