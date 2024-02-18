/**
 * Represents the order of the stack, either 'fifo' (First-In-First-Out) or 'lifo' (Last-In-First-Out).
 */
export type StackOrder = 'fifo' | 'lifo';

/**
 * Enumeration for the order of the stack.
 */
export enum Order {

  /** First-In-First-Out */
  FIFO,

  /** Last-In-First-Out */
  LIFO,
}


export type StackInit = {
  order?: StackOrder | number;
}

/**
 * Generic stack class that can operate in either FIFO or LIFO order.
 * @template T The type of elements stored in the stack.
 */
export class Stack<T> {
  readonly #order: Order;
  #items: T[];

  /**
   * Constructs a new Stack instance with optional initialization options.
   * @param {StackInit} [props] Initialization options for the stack.
   */
  constructor(props?: StackInit) {
    props ??= {};

    this.#items = [];
    
    if(!props.order) {
      this.#order = Order.LIFO;
    } else {
      if(typeof props.order === 'number') {
        this.#order = props.order === Order.FIFO ? Order.FIFO : Order.LIFO;
      } else {
        this.#order = props.order === 'fifo' ? Order.FIFO : Order.LIFO;
      }
    }
  }

  /**
   * Adds one or more items to the top of the stack.
   * @param {...T[]} items The items to be added to the stack.
   */
  public push(...items: T[]): void {
    this.#items[this.#order === Order.FIFO ? 'push' : 'unshift'](...items);
  }

  /**
   * Retrieves the item at the top of the stack without removing it.
   * @returns {T | null} The item at the top of the stack or null if the stack is empty.
   */
  public peek(): T | null {
    return (this.#items.length > 0 ?
      this.#items[this.#items.length - 1] :
      null);
  }

  /**
   * Removes and returns the item at the top of the stack.
   * @returns {T | null} The item removed from the top of the stack or null if the stack is empty.
   */
  public pop(): T | null {
    const item = (this.#items.length > 0 ?
      this.#items.splice(this.#order === Order.FIFO ? 0 : this.#items.length - 1, 1)[0] :
      null);

    if(item && item != null) {
      const index = this.#items.indexOf(item);
      this.#items.splice(index, 1);
    }

    return item;
  }

  /**
   * Returns the number of items in the stack.
   * @returns {number} The number of items in the stack.
   */
  public size(): number {
    return this.#items.length;
  }

  /**
   * Checks if the stack is empty.
   * @returns {boolean} True if the stack is empty, false otherwise.
   */
  public isEmpty(): boolean {
    return this.#items.length === 0;
  }

  /**
   * Clears all items from the stack.
   */
  public clear(): void {
    this.#items = [];
  }

  /**
   * Enumerates all items in the stack.
   * @returns {IterableIterator<[number, T]>} An iterator for all items in the stack.
   */
  public enumerate(): [number, T][] {
    let index = 0;
    const items: [number, T][] = [];

    for(const item of this.#items) {
      items.push([index++, item]);
    }

    return items;
  }

  public findMany(predicate: (value: T, index: number, obj: T[]) => boolean): T[] {
    return this.#items.filter(predicate);
  }

  public find(predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined {
    return this.#items.find(predicate);
  }

  public findIndex(predicate: (value: T, index: number, obj: T[]) => boolean): number {
    return this.#items.findIndex(predicate);
  }

  public deleteByIndex(index: number): T | undefined {
    return this.#items.splice(index, 1)[0];
  }

  public getByIndex(index: number): T | undefined {
    return this.#items[index];
  }

  /**
   * Returns an array of all items in the stack.
   * @returns {T[]} An array of all items in the stack.
   */
  public toArray(): T[] {
    return this.#items;
  }
  
  public [Symbol.iterator]() {
    return this.#items[Symbol.iterator]();
  }

  public [Symbol.toStringTag](): string {
    return '[object Stack]';
  }
}

export default Stack;
