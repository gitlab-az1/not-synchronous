import math from 'next-math';
import CryptoJS from 'crypto-js';

import { isBrowser } from './utils';


/**
 * Generates cryptographically secure random values into the provided Uint8Array.
 * 
 * If the crypto API is available, it uses `crypto.getRandomValues`, else it generates
 * random values using a custom math library.
 * 
 * @param bucket - The Uint8Array to fill with random values.
 * @returns A Uint8Array filled with random values.
 */
export function getRandomValues(bucket: Uint8Array): Uint8Array {
  if(typeof crypto !== 'undefined' &&
    typeof crypto === 'object' &&
    typeof crypto.getRandomValues === 'function') return crypto.getRandomValues(bucket);
  
  for(let i = 0; i < bucket.length; i++) {
    bucket[i] = math.random.uniform(0, 256, 'floor');
  }

  return bucket;
}


export class Hash {

  public static get promises(): AsyncHash {
    return new AsyncHash();
  }

  /**
   * Simple synchronous sha256 hash
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public static sha256(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Simple synchronous sha512 hash
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public static sha512(data: string): string {
    return CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Deep compare two hashes
   * 
   * @param src 
   * @param target 
   * @returns 
   */
  public static equals(src: string, target: string): boolean {
    return src.toLowerCase() === target.toLowerCase();
  }
}


export class AsyncHash {

  /**
   * Hashes the given data with sha256 algorithm
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public async sha256(data: string): Promise<string> {
    if(isBrowser()) return Promise.resolve<string>(CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex));

    const __crypt = await import('crypto');
    const hash = __crypt.createHash('sha256');
    hash.update(data);

    return hash.digest('hex');
  }

  /**
   * Hashes the given data with sha512 algorithm
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public async sha512(data: string): Promise<string> {
    if(isBrowser()) return Promise.resolve<string>(CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex));

    const __crypt = await import('crypto');
    const hash = __crypt.createHash('sha512');
    hash.update(data);

    return hash.digest('hex');
  }
}

