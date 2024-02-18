export type ReadonlyRecord<K extends string | number | symbol, T> = {
  readonly [P in K]: T;
}

export type Dict<T> = {
  [key: string]: T;
}

export type ReadonlyDict<T> = {
  [key: string]: T;
}

export type ReadonlyArrayLike<T> = {
  readonly [key: number]: T;
}

export type ByteArrayLike = number[];

export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
}
