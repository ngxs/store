import { InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';

export const enum StorageOption {
  LocalStorage,
  SessionStorage
}

export interface NgxsStoragePluginOptions {
  /**
   * Key for the state slice to store in the storage engine.
   */
  key?: string | string[] | undefined;

  /**
   * Storage engine to use. Deaults to localStorage but can provide
   *
   * sessionStorage or custom implementation of the StorageEngine interface
   */
  storage?: StorageOption;

  /**
   * Migration strategies.
   */
  migrations?: {
    /**
     * Version to key off.
     */
    version: number | string;

    /**
     * Method to migrate the previous state.
     */
    migrate: (state: any) => any;

    /**
     * Key to migrate.
     */
    key?: string;

    /**
     * Key for the version. Defaults to 'version'.
     */
    versionKey?: string;
  }[];

  /**
   * Serailizer for the object before its pushed into the engine.
   */
  serialize?(obj: any);

  /**
   * Deserializer for the object before its pulled out of the engine.
   */
  deserialize?(obj: any);
}

export const NGXS_STORAGE_PLUGIN_OPTIONS = new InjectionToken('NGXS_STORAGE_PLUGIN_OPTION');

export const STORAGE_ENGINE = new InjectionToken('STORAGE_ENGINE');

export interface StorageEngine {
  readonly length: number;
  getItem(key): any;
  setItem(key, val): void;
  removeItem(key): void;
  clear(): void;
  key(val: number): string;
}

export interface AsyncStorageEngine {
  length(): Observable<number>;
  getItem(key): Observable<any>;
  setItem(key, val): void;
  removeItem(key): void;
  clear(): void;
  key(val: number): Observable<string>;
}

/**
 * @Description Proxy used around synchronous storage engines to provide the same internal API than async engines
 */
export class AsyncStorageEngineProxy implements AsyncStorageEngine {
  constructor(private _storage: StorageEngine) {}

  public length(): Observable<number> {
    return of(this._storage.length);
  }

  public getItem<T = any>(key): Observable<T> {
    return of(this._storage.getItem(key));
  }

  public setItem(key, val): void {
    this._storage.setItem(key, val);
  }

  public removeItem(key): void {
    this._storage.removeItem(key);
  }

  public clear(): void {
    this._storage.clear();
  }

  public key(val: number): Observable<string> {
    return of(this._storage.key(val));
  }
}
