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
      return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as T;
    }

    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }

    return obj;
  },

  // Merge objects
  merge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    const result = { ...target };
    
    for (const source of sources) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (this.isObject(result[key]) && this.isObject(source[key])) {
            result[key] = this.merge(result[key] as Record<string, any>, source[key] as Record<string, any>) as any;
          } else {
            result[key] = source[key] as any;
          }
        }
      }
    }
    
    return result;
  },

  // Deep merge objects
  deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    const result = this.deepClone(target);
    
    for (const source of sources) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (this.isObject(result[key]) && this.isObject(source[key])) {
            result[key] = this.deepMerge(result[key] as Record<string, any>, source[key] as Record<string, any>) as any;
          } else {
            result[key] = source[key] as any;
          }
        }
      }
    }
    
    return result;
  },

  // Check if value is object
  isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },

  // Check if object is empty
  isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },

  // Check if object is not empty
  isNotEmpty(obj: any): boolean {
    return !this.isEmpty(obj);
  },

  // Get object keys
  getKeys(obj: any, options: ObjectOptions = {}): string[] {
    if (!this.isObject(obj)) return [];
    
    let keys: string[] = [];
    
    if (options.includePrototype) {
      keys = Object.getOwnPropertyNames(obj);
    } else {
      keys = Object.keys(obj);
    }
    
    if (options.sortKeys) {
      keys.sort();
    }
    
    return keys;
  },

  // Get object values
  getValues<T>(obj: Record<string, T>): T[] {
    return Object.values(obj);
  },

  // Get object entries
  getEntries<T>(obj: Record<string, T>): [string, T][] {
    return Object.entries(obj);
  },

  // Pick properties from object
  pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  // Omit properties from object
  omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  },

  // Get nested property value
  get(obj: any, path: string, defaultValue?: any): any {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || !(key in result)) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result;
  },

  // Set nested property value
  set(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || !this.isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return obj;
  },

  // Check if object has property
  has(obj: any, path: string): boolean {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false;
      }
      current = current[key];
    }
    
    return true;
  },

  // Remove property from object
  unset(obj: any, path: string): boolean {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current === null || current === undefined || !(key in current)) {
        return false;
      }
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    if (current !== null && current !== undefined && lastKey in current) {
      delete current[lastKey];
      return true;
    }
    
    return false;
  },

  // Transform object keys
  transformKeys<T extends Record<string, any>>(
    obj: T,
    transformer: (key: string) => string
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      result[transformer(key)] = value;
    }
    
    return result;
  },

  // Transform object values
  transformValues<T extends Record<string, any>, U>(
    obj: T,
    transformer: (value: any, key: string) => U
  ): Record<string, U> {
    const result: Record<string, U> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      result[key] = transformer(value, key);
    }
    
    return result;
  },

  // Filter object properties
  filter<T extends Record<string, any>>(
    obj: T,
    predicate: (value: any, key: string) => boolean
  ): Partial<T> {
    const result: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (predicate(value, key)) {
        result[key as keyof T] = value;
      }
    }
    
    return result;
  },

  // Map object properties
  map<T extends Record<string, any>, U>(
    obj: T,
    mapper: (value: any, key: string) => U
  ): Record<string, U> {
    const result: Record<string, U> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      result[key] = mapper(value, key);
    }
    
    return result;
  },

  // Reduce object
  reduce<T extends Record<string, any>, U>(
    obj: T,
    reducer: (acc: U, value: any, key: string) => U,
    initialValue: U
  ): U {
    let result = initialValue;
    
    for (const [key, value] of Object.entries(obj)) {
      result = reducer(result, value, key);
    }
    
    return result;
  },

  // Find key by value
  findKey<T extends Record<string, any>>(
    obj: T,
    predicate: (value: any, key: string) => boolean
  ): string | undefined {
    for (const [key, value] of Object.entries(obj)) {
      if (predicate(value, key)) {
        return key;
      }
    }
    return undefined;
  },

  // Find value by predicate
  findValue<T extends Record<string, any>>(
    obj: T,
    predicate: (value: any, key: string) => boolean
  ): any {
    for (const [key, value] of Object.entries(obj)) {
      if (predicate(value, key)) {
        return value;
      }
    }
    return undefined;
  },

  // Group array by key
  groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Sort object by keys
  sortByKeys<T extends Record<string, any>>(obj: T): T {
    const sortedKeys = Object.keys(obj).sort();
    const result = {} as T;
    
    for (const key of sortedKeys) {
      (result as any)[key] = (obj as any)[key];
    }
    
    return result;
  },

  // Sort object by values
  sortByValues<T extends Record<string, any>>(
    obj: T,
    compareFn?: (a: any, b: any) => number
  ): Record<string, any> {
    const entries = Object.entries(obj as Record<string, any>);
    entries.sort(([, a], [, b]) => {
      if (compareFn) {
        return compareFn(a, b);
      }
      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
      }
      return a < b ? -1 : a > b ? 1 : 0;
    });
    
    const result: Record<string, any> = {};
    for (const [key, value] of entries) {
      result[key] = value;
    }
    
    return result;
  },

  // Flatten object
  flatten(obj: any, prefix: string = '', result: Record<string, any> = {}): Record<string, any> {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (this.isObject(obj[key])) {
          this.flatten(obj[key], newKey, result);
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    
    return result;
  },

  // Unflatten object
  unflatten(obj: Record<string, any>): any {
    const result: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.set(result, key, obj[key]);
      }
    }
    
    return result;
  },

  // Compare objects
  isEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return false;
    
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return false;
    
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.isEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  },

  // Get object size
  getSize(obj: any): number {
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
  fromPairs(pairs: [string, any][]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of pairs) {
      result[key] = value;
    }
    return result;
  },

  // Convert object to pairs
  toPairs(obj: Record<string, any>): [string, any][] {
    return Object.entries(obj);
  }
};

