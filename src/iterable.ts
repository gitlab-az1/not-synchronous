import { isIterableIterator } from './_internals/utils';



/**
 * Iterates over an array-like object or an iterable, calling a provided function on each element.
 * 
 * @param thing The array-like object or iterable to iterate over.
 * @param callback The function to call for each element.
 * @param limit The maximum number of iterations to perform.
 */
export function forEachArray<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  limit: number,
  callback: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
): void;

/**
 * Iterates over an array-like object or an iterable, calling a provided function on each element.
 * 
 * @param thing The array-like object or iterable to iterate over.
 * @param callback The function to call for each element.
 * @param limit The maximum number of iterations to perform.
 */
export function forEachArray<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  callback: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
): void;

/**
 * Iterates over an array-like object or an iterable, calling a provided function on each element.
 * 
 * @param thing The array-like object or iterable to iterate over.
 * @param callback The function to call for each element.
 * @param limit The maximum number of iterations to perform.
 */
export function forEachArray<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  limitOrCallback: number | ((value: T, index: number) => void | Promise<void>),
  callback?: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
): void {
  let limit: number | undefined = undefined;
  let cb: ((value: T, index: number) => void | Promise<void>) | undefined = undefined;

  if(typeof limitOrCallback === 'number') {
    limit = limitOrCallback;

    if(typeof callback !== 'function') {
      throw new TypeError(`[${typeof callback}] Expected \`callback\` as a function`);
    }

    cb = callback;
  } else if(typeof limitOrCallback === 'function') {
    cb = limitOrCallback;
  }

  if(!cb) {
    throw new TypeError(`[${typeof cb}] Expected \`callback\` as a function`);
  }

  let runCount = 0;
  if(!!limit && limit > 0 && runCount >= limit) return;

  if(Array.isArray(thing)) {
    for(let i = 0; i < thing.length; i++) {
      cb(thing[i], i);
      runCount++;

      if(!!limit && limit > 0 && runCount >= limit) break;
    }
  } else {
    const isIterable = isIterableIterator(typeof thing === 'function' ? thing() : thing);

    if(!isIterable) {
      throw new TypeError(`[${typeof thing}] Expected \`thing\` as an array-like object or iterable`);
    }

    let i = 0;
    const it = (typeof thing === 'function' ? thing() : thing) as IterableIterator<T>;

    for(const item of it) {
      cb(item, i++);
      runCount++;

      if(!!limit && limit > 0 && runCount >= limit) break;
    }
  }
}



/**
 * Safe version of `forEachArray` that catches errors and continues to the next iteration.
 * 
 * @param thing The array-like object or iterable to iterate over.
 * @param callback The function to call for each element. 
 * @param limit The maximum number of iterations to perform.
 */
export function forEachArraySafe<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  limit: number,
  callback: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
): void;

/**
 * Safe version of `forEachArray` that catches errors and continues to the next iteration.
 * 
 * @param thing The array-like object or iterable to iterate over.
 * @param callback The function to call for each element. 
 * @param limit The maximum number of iterations to perform.
 */
export function forEachArraySafe<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  callback: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
): void;

/**
 * Safe version of `forEachArray` that catches errors and continues to the next iteration.
 * 
 * @param thing The array-like object or iterable to iterate over.
 * @param callback The function to call for each element. 
 * @param limit The maximum number of iterations to perform.
 */
export function forEachArraySafe<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  limitOrCallback: number | ((value: T, index: number) => void | Promise<void>),
  callback?: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
): void {
  let limit: number | undefined = undefined;
  let cb: ((value: T, index: number) => void | Promise<void>) | undefined = undefined;

  if(typeof limitOrCallback === 'number') {
    limit = limitOrCallback;

    if(typeof callback !== 'function') {
      throw new TypeError(`[${typeof callback}] Expected \`callback\` as a function`);
    }

    cb = callback;
  } else if(typeof limitOrCallback === 'function') {
    cb = limitOrCallback;
  }

  if(!cb) {
    throw new TypeError(`[${typeof cb}] Expected \`callback\` as a function`);
  }

  let runCount = 0;
  if(!!limit && limit > 0 && runCount >= limit) return;

  if(Array.isArray(thing)) {
    for(let i = 0; i < thing.length; i++) {
      try {
        cb(thing[i], i);
        // eslint-disable-next-line no-empty
      } catch {}

      runCount++;
      if(!!limit && limit > 0 && runCount >= limit) break;
    }
  } else {
    const isIterable = isIterableIterator(typeof thing === 'function' ? thing() : thing);

    if(!isIterable) {
      throw new TypeError(`[${typeof thing}] Expected \`thing\` as an array-like object or iterable`);
    }

    let i = 0;
    const it = (typeof thing === 'function' ? thing() : thing) as IterableIterator<T>;

    for(const item of it) {
      try {
        cb(item, i++);
        // eslint-disable-next-line no-empty
      } catch {}
      
      runCount++;
      if(!!limit && limit > 0 && runCount >= limit) break;
    }
  }
}




/**
 * Iterates over an object, calling a provided function on each key-value pair.
 * 
 * @param thing The object to iterate over.
 * @param callback The function to call for each key-value pair.
 * @param limit (optional) The maximum number of iterations to perform.
 */
export function forEachObject<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  limit: number,
  callback: (value: T, index: number) => void // eslint-disable-line comma-dangle
): void;

/**
 * Iterates over an object, calling a provided function on each key-value pair.
 * 
 * @param thing The object to iterate over.
 * @param callback The function to call for each key-value pair.
 * @param limit (optional) The maximum number of iterations to perform.
 */
export function forEachObject<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  callback: (value: T, index: number) => void // eslint-disable-line comma-dangle
): void;


/**
 * Iterates over an object, calling a provided function on each key-value pair.
 * 
 * @param thing The object to iterate over.
 * @param callback The function to call for each key-value pair.
 * @param limit (optional) The maximum number of iterations to perform.
 */
export function forEachObject<T extends Record<string | number | symbol, unknown>>(
  thing: T,
  limitOrCallback: number | ((key: keyof T, value: T[keyof T], index: number) => void | Promise<void>),
  callback?: (key: keyof T, value: T[keyof T], index: number) => void | Promise<void> // eslint-disable-line comma-dangle
): void {
  let limit: number | undefined;
  let cb: ((key: keyof T, value: T[keyof T], index: number) => void | Promise<void>) | undefined = undefined;

  if(typeof limitOrCallback === 'number') {
    limit = limitOrCallback;

    if(typeof callback !== 'function') {
      throw new TypeError(`[${typeof callback}] Expected \`callback\` as a function`);
    }

    cb = callback;
  } else if(typeof limitOrCallback === 'function') {
    cb = limitOrCallback;
  }

  if(!cb) {
    throw new TypeError(`[${typeof cb}] Expected \`callback\` as a function`);
  }

  let runCount = 0;
  if(!!limit && limit > 0 && runCount >= limit) return;

  const entries = Object.entries(thing) as [keyof T, T[keyof T]][];

  for(let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];

    cb(key, value, i);
    runCount++;

    if(!!limit && limit > 0 && runCount >= limit) break;
  }
}




/**
 * Safe version of `forEachObject` that catches errors and continues to the next iteration.
 * 
 * @param thing The object to iterate over.
 * @param callback The function to call for each key-value pair.
 * @param limit (optional) The maximum number of iterations to perform.
 */
export function forEachObjectSafe<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  limit: number,
  callback: (value: T, index: number) => void // eslint-disable-line comma-dangle
): void;

/**
 * Safe version of `forEachObject` that catches errors and continues to the next iteration.
 * 
 * @param thing The object to iterate over.
 * @param callback The function to call for each key-value pair.
 * @param limit (optional) The maximum number of iterations to perform.
 */
export function forEachObjectSafe<T>(
  thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
  callback: (value: T, index: number) => void // eslint-disable-line comma-dangle
): void;


/**
 * Safe version of `forEachObject` that catches errors and continues to the next iteration.
 * 
 * @param thing The object to iterate over.
 * @param callback The function to call for each key-value pair.
 * @param limit (optional) The maximum number of iterations to perform.
 */
export function forEachObjectSafe<T extends Record<string | number | symbol, unknown>>(
  thing: T,
  limitOrCallback: number | ((key: keyof T, value: T[keyof T], index: number) => void | Promise<void>),
  callback?: (key: keyof T, value: T[keyof T], index: number) => void | Promise<void> // eslint-disable-line comma-dangle
): void {
  let limit: number | undefined;
  let cb: ((key: keyof T, value: T[keyof T], index: number) => void | Promise<void>) | undefined = undefined;

  if(typeof limitOrCallback === 'number') {
    limit = limitOrCallback;

    if(typeof callback !== 'function') {
      throw new TypeError(`[${typeof callback}] Expected \`callback\` as a function`);
    }

    cb = callback;
  } else if(typeof limitOrCallback === 'function') {
    cb = limitOrCallback;
  }

  if(!cb) {
    throw new TypeError(`[${typeof cb}] Expected \`callback\` as a function`);
  }

  let runCount = 0;
  if(!!limit && limit > 0 && runCount >= limit) return;

  const entries = Object.entries(thing) as [keyof T, T[keyof T]][];

  for(let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];

    try {
      cb(key, value, i);
      // eslint-disable-next-line no-empty
    } catch {}

    runCount++;
    if(!!limit && limit > 0 && runCount >= limit) break;
  }
}



export namespace iterable { // eslint-disable-line @typescript-eslint/no-namespace
  /**
   * Iterates over an array-like object or an iterable, calling a provided function on each element.
   * 
   * @param thing The array-like object or iterable to iterate over.
   * @param callback The function to call for each element.
   * @param limit The maximum number of iterations to perform.
   */
  export function forEachArray<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    limit: number,
    callback: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
  ): void;

  /**
   * Iterates over an array-like object or an iterable, calling a provided function on each element.
   * 
   * @param thing The array-like object or iterable to iterate over.
   * @param callback The function to call for each element.
   * @param limit The maximum number of iterations to perform.
   */
  export function forEachArray<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    callback: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
  ): void;

  /**
   * Iterates over an array-like object or an iterable, calling a provided function on each element.
   * 
   * @param thing The array-like object or iterable to iterate over.
   * @param callback The function to call for each element.
   * @param limit The maximum number of iterations to perform.
   */
  export function forEachArray<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    limitOrCallback: number | ((value: T, index: number) => void | Promise<void>),
    callback?: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
  ): void {
    let limit: number | undefined = undefined;
    let cb: ((value: T, index: number) => void | Promise<void>) | undefined = undefined;

    if(typeof limitOrCallback === 'number') {
      limit = limitOrCallback;

      if(typeof callback !== 'function') {
        throw new TypeError(`[${typeof callback}] Expected \`callback\` as a function`);
      }

      cb = callback;
    } else if(typeof limitOrCallback === 'function') {
      cb = limitOrCallback;
    }

    if(!cb) {
      throw new TypeError(`[${typeof cb}] Expected \`callback\` as a function`);
    }

    let runCount = 0;
    if(!!limit && limit > 0 && runCount >= limit) return;

    if(Array.isArray(thing)) {
      for(let i = 0; i < thing.length; i++) {
        cb(thing[i], i);
        runCount++;

        if(!!limit && limit > 0 && runCount >= limit) break;
      }
    } else {
      const isIterable = isIterableIterator(typeof thing === 'function' ? thing() : thing);

      if(!isIterable) {
        throw new TypeError(`[${typeof thing}] Expected \`thing\` as an array-like object or iterable`);
      }

      let i = 0;
      const it = (typeof thing === 'function' ? thing() : thing) as IterableIterator<T>;

      for(const item of it) {
        cb(item, i++);
        runCount++;

        if(!!limit && limit > 0 && runCount >= limit) break;
      }
    }
  }



  /**
   * Safe version of `forEachArray` that catches errors and continues to the next iteration.
   * 
   * @param thing The array-like object or iterable to iterate over.
   * @param callback The function to call for each element. 
   * @param limit The maximum number of iterations to perform.
   */
  export function forEachArraySafe<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    limit: number,
    callback: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
  ): void;

  /**
   * Safe version of `forEachArray` that catches errors and continues to the next iteration.
   * 
   * @param thing The array-like object or iterable to iterate over.
   * @param callback The function to call for each element. 
   * @param limit The maximum number of iterations to perform.
   */
  export function forEachArraySafe<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    callback: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
  ): void;

  /**
   * Safe version of `forEachArray` that catches errors and continues to the next iteration.
   * 
   * @param thing The array-like object or iterable to iterate over.
   * @param callback The function to call for each element. 
   * @param limit The maximum number of iterations to perform.
   */
  export function forEachArraySafe<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    limitOrCallback: number | ((value: T, index: number) => void | Promise<void>),
    callback?: (value: T, index: number) => void | Promise<void> // eslint-disable-line comma-dangle
  ): void {
    let limit: number | undefined = undefined;
    let cb: ((value: T, index: number) => void | Promise<void>) | undefined = undefined;

    if(typeof limitOrCallback === 'number') {
      limit = limitOrCallback;

      if(typeof callback !== 'function') {
        throw new TypeError(`[${typeof callback}] Expected \`callback\` as a function`);
      }

      cb = callback;
    } else if(typeof limitOrCallback === 'function') {
      cb = limitOrCallback;
    }

    if(!cb) {
      throw new TypeError(`[${typeof cb}] Expected \`callback\` as a function`);
    }

    let runCount = 0;
    if(!!limit && limit > 0 && runCount >= limit) return;

    if(Array.isArray(thing)) {
      for(let i = 0; i < thing.length; i++) {
        try {
          cb(thing[i], i);
          // eslint-disable-next-line no-empty
        } catch {}

        runCount++;
        if(!!limit && limit > 0 && runCount >= limit) break;
      }
    } else {
      const isIterable = isIterableIterator(typeof thing === 'function' ? thing() : thing);

      if(!isIterable) {
        throw new TypeError(`[${typeof thing}] Expected \`thing\` as an array-like object or iterable`);
      }

      let i = 0;
      const it = (typeof thing === 'function' ? thing() : thing) as IterableIterator<T>;

      for(const item of it) {
        try {
          cb(item, i++);
          // eslint-disable-next-line no-empty
        } catch {}
        
        runCount++;
        if(!!limit && limit > 0 && runCount >= limit) break;
      }
    }
  }




  /**
   * Iterates over an object, calling a provided function on each key-value pair.
   * 
   * @param thing The object to iterate over.
   * @param callback The function to call for each key-value pair.
   * @param limit (optional) The maximum number of iterations to perform.
   */
  export function forEachObject<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    limit: number,
    callback: (value: T, index: number) => void // eslint-disable-line comma-dangle
  ): void;

  /**
   * Iterates over an object, calling a provided function on each key-value pair.
   * 
   * @param thing The object to iterate over.
   * @param callback The function to call for each key-value pair.
   * @param limit (optional) The maximum number of iterations to perform.
   */
  export function forEachObject<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    callback: (value: T, index: number) => void // eslint-disable-line comma-dangle
  ): void;


  /**
   * Iterates over an object, calling a provided function on each key-value pair.
   * 
   * @param thing The object to iterate over.
   * @param callback The function to call for each key-value pair.
   * @param limit (optional) The maximum number of iterations to perform.
   */
  export function forEachObject<T extends Record<string | number | symbol, unknown>>(
    thing: T,
    limitOrCallback: number | ((key: keyof T, value: T[keyof T], index: number) => void | Promise<void>),
    callback?: (key: keyof T, value: T[keyof T], index: number) => void | Promise<void> // eslint-disable-line comma-dangle
  ): void {
    let limit: number | undefined;
    let cb: ((key: keyof T, value: T[keyof T], index: number) => void | Promise<void>) | undefined = undefined;

    if(typeof limitOrCallback === 'number') {
      limit = limitOrCallback;

      if(typeof callback !== 'function') {
        throw new TypeError(`[${typeof callback}] Expected \`callback\` as a function`);
      }

      cb = callback;
    } else if(typeof limitOrCallback === 'function') {
      cb = limitOrCallback;
    }

    if(!cb) {
      throw new TypeError(`[${typeof cb}] Expected \`callback\` as a function`);
    }

    let runCount = 0;
    if(!!limit && limit > 0 && runCount >= limit) return;

    const entries = Object.entries(thing) as [keyof T, T[keyof T]][];

    for(let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];

      cb(key, value, i);
      runCount++;

      if(!!limit && limit > 0 && runCount >= limit) break;
    }
  }




  /**
   * Safe version of `forEachObject` that catches errors and continues to the next iteration.
   * 
   * @param thing The object to iterate over.
   * @param callback The function to call for each key-value pair.
   * @param limit (optional) The maximum number of iterations to perform.
   */
  export function forEachObjectSafe<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    limit: number,
    callback: (value: T, index: number) => void // eslint-disable-line comma-dangle
  ): void;

  /**
   * Safe version of `forEachObject` that catches errors and continues to the next iteration.
   * 
   * @param thing The object to iterate over.
   * @param callback The function to call for each key-value pair.
   * @param limit (optional) The maximum number of iterations to perform.
   */
  export function forEachObjectSafe<T>(
    thing: IterableIterator<T> | T[] | ArrayLike<T> | (() => IterableIterator<T>),
    callback: (value: T, index: number) => void // eslint-disable-line comma-dangle
  ): void;


  /**
   * Safe version of `forEachObject` that catches errors and continues to the next iteration.
   * 
   * @param thing The object to iterate over.
   * @param callback The function to call for each key-value pair.
   * @param limit (optional) The maximum number of iterations to perform.
   */
  export function forEachObjectSafe<T extends Record<string | number | symbol, unknown>>(
    thing: T,
    limitOrCallback: number | ((key: keyof T, value: T[keyof T], index: number) => void | Promise<void>),
    callback?: (key: keyof T, value: T[keyof T], index: number) => void | Promise<void> // eslint-disable-line comma-dangle
  ): void {
    let limit: number | undefined;
    let cb: ((key: keyof T, value: T[keyof T], index: number) => void | Promise<void>) | undefined = undefined;

    if(typeof limitOrCallback === 'number') {
      limit = limitOrCallback;

      if(typeof callback !== 'function') {
        throw new TypeError(`[${typeof callback}] Expected \`callback\` as a function`);
      }

      cb = callback;
    } else if(typeof limitOrCallback === 'function') {
      cb = limitOrCallback;
    }

    if(!cb) {
      throw new TypeError(`[${typeof cb}] Expected \`callback\` as a function`);
    }

    let runCount = 0;
    if(!!limit && limit > 0 && runCount >= limit) return;

    const entries = Object.entries(thing) as [keyof T, T[keyof T]][];

    for(let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];

      try {
        cb(key, value, i);
        // eslint-disable-next-line no-empty
      } catch {}

      runCount++;
      if(!!limit && limit > 0 && runCount >= limit) break;
    }
  }
}

export default iterable;
