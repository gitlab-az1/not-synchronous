declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process {
      type?: string;
    }
  }
}


export function isBrowser(): boolean {
  // Check if the current environment is Node.js
  if(typeof process !== 'undefined' && process?.versions?.node) return false;

  // Check if the current environment is a browser
  if(typeof window !== 'undefined'
    && typeof window === 'object' &&
    !!window.document) return true;

  // Check for other browser-like environments (e.g., Electron renderer process)
  if(typeof process !== 'undefined' && typeof process?.type === 'string' && process?.type === 'renderer') return true;

  // Add additional checks for specific browser-like environments if needed

  // Assume Node.js environment if not running in a browser-like environment
  return false;
}

/**
 * Shuffle the specified string.
 * 
 * @param str 
 * @returns 
 */
export function strShuffle(str: string): string {
  if(typeof str !== 'string' || str.length === 0) return '';
  const arr = str.split('');

  // Loop through the array
  for (let i = arr.length - 1; i > 0; i--) {
    // Generate a random index
    const j = Math.floor(Math.random() * (i + 1));

    // Swap the current element with the random element
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  // Convert the array back to a string and return it
  return arr.join('');
}

export function assertString(value: unknown): asserts value is string {
  if(typeof value !== 'string') {
    throw new TypeError('Value must be a string');
  }
}



const kindOf = (cache => (thing: any) => {
  const str = Object.prototype.toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));


/**
 * Determine if a value is a plain Object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a plain Object, otherwise false
 */
export function isPlainObject(val: any): boolean {
  if(Array.isArray(val)) return false;
  if(kindOf(val) !== 'object' || typeof val !== 'object') return false;

  const prototype = Object.getPrototypeOf(val);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
}


export function isIterableIterator<T>(value: any): value is IterableIterator<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value[Symbol.iterator] === 'function' &&
    typeof value.next === 'function'
  );
}
