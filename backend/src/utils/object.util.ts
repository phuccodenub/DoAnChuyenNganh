// Object utility functions
export interface ObjectOptions {
  deep?: boolean;
  includePrototype?: boolean;
  sortKeys?: boolean;
}

export const objectUtils = {
  // Deep clone object
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return (obj as unknown as Array<unknown>).map((item) => this.deepClone(item)) as unknown as T;
    }

    const clonedObj: Record<string, unknown> = {};
    for (const key of Object.keys(obj as unknown as Record<string, unknown>)) {
      clonedObj[key] = this.deepClone((obj as unknown as Record<string, unknown>)[key]);
    }
    return clonedObj as unknown as T;
  },

  // Merge objects (shallow)
  merge<T extends Record<string, unknown>>(target: T, ...sources: Array<Partial<T>>): T {
    const result: Record<string, unknown> = { ...(target as Record<string, unknown>) };
    for (const source of sources) {
      if (!source) continue;
      for (const key of Object.keys(source as Record<string, unknown>)) {
        const sVal = (source as Record<string, unknown>)[key];
        const rVal = result[key];
        if (this.isObject(rVal) && this.isObject(sVal)) {
          result[key] = this.merge(rVal as Record<string, unknown>, sVal as Record<string, unknown>) as unknown;
        } else {
          result[key] = sVal as unknown;
        }
      }
    }
    return result as T;
  },

  // Deep merge objects
  deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Array<Partial<T>>): T {
    const result: Record<string, unknown> = this.deepClone(target) as unknown as Record<string, unknown>;
    for (const source of sources) {
      if (!source) continue;
      for (const key of Object.keys(source as Record<string, unknown>)) {
        const sVal = (source as Record<string, unknown>)[key];
        const rVal = result[key];
        if (this.isObject(rVal) && this.isObject(sVal)) {
          result[key] = this.deepMerge(rVal as Record<string, unknown>, sVal as Record<string, unknown>) as unknown;
        } else {
          result[key] = sVal as unknown;
        }
      }
    }
    return result as T;
  },

  // Check if value is plain object (not array)
  isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },

  // Check if object is empty
  isEmpty(obj: unknown): boolean {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (this.isObject(obj)) return Object.keys(obj).length === 0;
    return false;
  },

  // Check if object is not empty
  isNotEmpty(obj: unknown): boolean {
    return !this.isEmpty(obj);
  },

  // Get object keys
  getKeys(obj: unknown, options: ObjectOptions = {}): string[] {
    if (!this.isObject(obj)) return [];
    const base = options.includePrototype ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    if (options.sortKeys) {
      base.sort();
    }
    return base;
  },

  // Get object values
  getValues<T>(obj: Record<string, T>): T[] {
    return Object.values(obj);
  },

  // Get object entries
  getEntries<T>(obj: Record<string, T>): [string, T][] {
    return Object.entries(obj) as [string, T][];
  },

  // Pick properties from object
  pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  // Omit properties from object
  omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete (result as Record<string, unknown>)[key as string];
    }
    return result;
  },

  // Get nested property value
  get(obj: unknown, path: string, defaultValue?: unknown): unknown {
    const keys = path.split('.');
    let current: unknown = obj as unknown;
    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      if (!this.isObject(current)) {
        return defaultValue;
      }
      const rec = current as Record<string, unknown>;
      if (!(key in rec)) {
        return defaultValue;
      }
      current = rec[key];
    }
    return current === undefined ? defaultValue : current;
  },

  // Set nested property value
  set(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
    const keys = path.split('.');
    let current: Record<string, unknown> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextVal = current[key];
      if (!this.isObject(nextVal)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    return obj;
  },

  // Check if object has property
  has(obj: unknown, path: string): boolean {
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
      if (current === null || current === undefined) return false;
      if (!this.isObject(current)) return false;
      const rec = current as Record<string, unknown>;
      if (!(key in rec)) return false;
      current = rec[key];
    }
    return true;
  },

  // Remove property from object
  unset(obj: Record<string, unknown>, path: string): boolean {
    const keys = path.split('.');
    let current: Record<string, unknown> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextVal = current[key];
      if (!this.isObject(nextVal)) {
        return false;
      }
      current = nextVal as Record<string, unknown>;
    }
    const lastKey = keys[keys.length - 1];
    if (lastKey in current) {
      delete current[lastKey];
      return true;
    }
    return false;
  },

  // Transform object keys
  transformKeys<T extends Record<string, unknown>>(obj: T, transformer: (key: string) => string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[transformer(key)] = value;
    }
    return result;
  },

  // Transform object values
  transformValues<T extends Record<string, unknown>, U>(obj: T, transformer: (value: unknown, key: string) => U): Record<string, U> {
    const result: Record<string, U> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = transformer(value, key);
    }
    return result;
  },

  // Filter object properties
  filter<T extends Record<string, unknown>>(obj: T, predicate: (value: unknown, key: string) => boolean): Partial<T> {
    const result: Partial<T> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (predicate(value, key)) {
        (result as Record<string, unknown>)[key] = value as unknown;
      }
    }
    return result;
  },

  // Map object properties
  map<T extends Record<string, unknown>, U>(obj: T, mapper: (value: unknown, key: string) => U): Record<string, U> {
    const result: Record<string, U> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = mapper(value, key);
    }
    return result;
  },

  // Reduce object
  reduce<T extends Record<string, unknown>, U>(obj: T, reducer: (acc: U, value: unknown, key: string) => U, initialValue: U): U {
    let acc = initialValue;
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      acc = reducer(acc, value, key);
    }
    return acc;
  },

  // Find key by value
  findKey<T extends Record<string, unknown>>(obj: T, predicate: (value: unknown, key: string) => boolean): string | undefined {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (predicate(value, key)) return key;
    }
    return undefined;
  },

  // Find value by predicate
  findValue<T extends Record<string, unknown>>(obj: T, predicate: (value: unknown, key: string) => boolean): unknown {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (predicate(value, key)) return value;
    }
    return undefined;
  },

  // Group array by key
  groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce<Record<string, T[]>>((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  },

  // Sort object by keys
  sortByKeys<T extends Record<string, unknown>>(obj: T): T {
    const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
    const result = {} as Record<string, unknown>;
    for (const key of sortedKeys) {
      result[key] = (obj as Record<string, unknown>)[key];
    }
    return result as T;
  },

  // Sort object by values
  sortByValues<T extends Record<string, unknown>>(obj: T, compareFn?: (a: unknown, b: unknown) => number): Record<string, unknown> {
    const entries = Object.entries(obj as Record<string, unknown>);
    entries.sort(([, a], [, b]) => {
      if (compareFn) return compareFn(a, b);
      if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return 0;
    });
    const result: Record<string, unknown> = {};
    for (const [key, value] of entries) {
      result[key] = value;
    }
    return result;
  },

  // Flatten object
  flatten(obj: unknown, prefix = '', result: Record<string, unknown> = {}): Record<string, unknown> {
    if (!this.isObject(obj)) return result;
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (this.isObject(value)) {
        this.flatten(value, newKey, result);
      } else {
        result[newKey] = value as unknown;
      }
    }
    return result;
  },

  // Unflatten object
  unflatten(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      this.set(result, key, obj[key]);
    }
    return result;
  },

  // Compare objects (deep)
  isEqual(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    if (!this.isObject(obj1) || !this.isObject(obj2)) return false;
    const a = obj1 as Record<string, unknown>;
    const b = obj2 as Record<string, unknown>;
    const keys1 = Object.keys(a);
    const keys2 = Object.keys(b);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      const v1 = a[key];
      const v2 = b[key];
      const bothObjects = this.isObject(v1) && this.isObject(v2);
      if (bothObjects) {
        if (!this.isEqual(v1, v2)) return false;
      } else if (v1 !== v2) {
        return false;
      }
    }
    return true;
  },

  // Get object size
  getSize(obj: unknown): number {
    if (Array.isArray(obj)) return obj.length;
    if (this.isObject(obj)) return Object.keys(obj).length;
    return 0;
  },

  // Convert object to array
  toArray<T>(obj: Record<string, T>): T[] {
    return Object.values(obj);
  },

  // Convert array to object
  fromArray<T>(array: T[], keyField: keyof T): Record<string, T> {
    const result: Record<string, T> = {};
    for (const item of array) {
      result[String(item[keyField])] = item;
    }
    return result;
  },

  // Create object from keys and values
  fromPairs(pairs: Array<[string, unknown]>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of pairs) {
      result[key] = value;
    }
    return result;
  },

  // Convert object to pairs
  toPairs(obj: Record<string, unknown>): Array<[string, unknown]> {
    return Object.entries(obj) as Array<[string, unknown]>;
  }
};
