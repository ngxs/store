import { StorageOption } from '@ngxs/storage-plugin/internals';
import { engineFactory } from '../src/internals';

describe('engineFactory', () => {
  it('should return localStorage when it exists on the global', () => {
    expect(engineFactory({ keys: '*', storage: StorageOption.LocalStorage })).toBe(
      localStorage
    );
  });

  it('should return sessionStorage when it exists on the global', () => {
    expect(engineFactory({ keys: '*', storage: StorageOption.SessionStorage })).toBe(
      sessionStorage
    );
  });

  // Some pages get rendered by crawlers/bots whose JS engines never define
  // `localStorage`/`sessionStorage` at all. Referencing the bare identifier in that
  // case throws a ReferenceError, so engineFactory must check it exists first instead
  // of assuming every non-SSR environment is a real browser.
  it('should return null instead of throwing when localStorage is not defined on the global', () => {
    const original = globalThis.localStorage;
    // @ts-expect-error - simulating an environment where the global doesn't exist
    delete globalThis.localStorage;

    try {
      const options = { keys: '*', storage: StorageOption.LocalStorage } as const;
      expect(() => engineFactory(options)).not.toThrow();
      expect(engineFactory(options)).toBeNull();
    } finally {
      globalThis.localStorage = original;
    }
  });

  it('should return null instead of throwing when sessionStorage is not defined on the global', () => {
    const original = globalThis.sessionStorage;
    // @ts-expect-error - simulating an environment where the global doesn't exist
    delete globalThis.sessionStorage;

    try {
      const options = { keys: '*', storage: StorageOption.SessionStorage } as const;
      expect(() => engineFactory(options)).not.toThrow();
      expect(engineFactory(options)).toBeNull();
    } finally {
      globalThis.sessionStorage = original;
    }
  });
});
