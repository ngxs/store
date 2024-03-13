import { InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ɵMETA_KEY,
  ɵPlainObjectOf,
  ɵStateClassInternal,
  ɵActionHandlerMetaData
} from '@ngxs/store/internals';

import { NgxsConfig } from '../symbols';

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

export type StateKeyGraph = ɵPlainObjectOf<string[]>;
export type StatesByName = ɵPlainObjectOf<ɵStateClassInternal>;

export interface StateOperations<T> {
  getState(): T;

  setState(val: T): T;

  dispatch(actionOrActions: any | any[]): Observable<void>;
}

export interface MappedStore {
  name: string;
  isInitialised: boolean;
  actions: ɵPlainObjectOf<ɵActionHandlerMetaData[]>;
  defaults: any;
  instance: any;
  path: string;
}

export interface StatesAndDefaults {
  defaults: any;
  states: MappedStore[];
}

/**
 * Get a deeply nested value. Example:
 *
 *    getValue({ foo: bar: [] }, 'foo.bar') //=> []
 *
 * Note: This is not as fast as the `fastPropGetter` but is strict Content Security Policy compliant.
 * See perf hit: https://jsperf.com/fast-value-getter-given-path/1
 *
 * @ignore
 */
function compliantPropGetter(paths: string[]): (x: any) => any {
  return obj => {
    for (let i = 0; i < paths.length; i++) {
      if (!obj) return undefined;
      obj = obj[paths[i]];
    }
    return obj;
  };
}

/**
 * The generated function is faster than:
 * - pluck (Observable operator)
 * - memoize
 *
 * @ignore
 */
function fastPropGetter(paths: string[]): (x: any) => any {
  const segments = paths;
  let seg = 'store.' + segments[0];
  let i = 0;
  const l = segments.length;

  let expr = seg;
  while (++i < l) {
    expr = expr + ' && ' + (seg = seg + '.' + segments[i]);
  }

  const fn = new Function('store', 'return ' + expr + ';');

  return <(x: any) => any>fn;
}

/**
 * Get a deeply nested value. Example:
 *
 *    getValue({ foo: bar: [] }, 'foo.bar') //=> []
 *
 * @ignore
 *
 * Marked for removal. It's only used within `createSelectorFn`.
 */
export function propGetter(paths: string[], config: NgxsConfig) {
  if (config?.compatibility?.strictContentSecurityPolicy) {
    return compliantPropGetter(paths);
  } else {
    return fastPropGetter(paths);
  }
}

// This injection token selects the prop getter implementation once the app is
// bootstrapped, as the `propGetter` function's behavior determines the implementation
// each time it's called. It accepts the config as the second argument. We no longer
// need to check for the `strictContentSecurityPolicy` every time the prop getter
// implementation is selected. Now, the `propGetter` function is only used within
// `createSelectorFn`, which, in turn, is solely used by the `Select` decorator.
// We've been trying to deprecate the `Select` decorator because it's unstable with
// server-side rendering and micro-frontend applications.
export const ɵPROP_GETTER = new InjectionToken<(paths: string[]) => (x: any) => any>(
  NG_DEV_MODE ? 'PROP_GETTER' : '',
  {
    providedIn: 'root',
    factory: () =>
      inject(NgxsConfig).compatibility?.strictContentSecurityPolicy
        ? compliantPropGetter
        : fastPropGetter
  }
);

/**
 * Given an array of states, it will return a object graph. Example:
 *    const states = [
 *      Cart,
 *      CartSaved,
 *      CartSavedItems
 *    ]
 *
 * would return:
 *
 *  const graph = {
 *    cart: ['saved'],
 *    saved: ['items'],
 *    items: []
 *  };
 *
 * @ignore
 */
export function buildGraph(stateClasses: ɵStateClassInternal[]): StateKeyGraph {
  const findName = (stateClass: ɵStateClassInternal) => {
    const meta = stateClasses.find(g => g === stateClass);

    // Caretaker note: we have still left the `typeof` condition in order to avoid
    // creating a breaking change for projects that still use the View Engine.
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !meta) {
      throw new Error(
        `Child state not found: ${stateClass}. \r\nYou may have forgotten to add states to module`
      );
    }

    return meta![ɵMETA_KEY]!.name!;
  };

  return stateClasses.reduce<StateKeyGraph>(
    (result: StateKeyGraph, stateClass: ɵStateClassInternal) => {
      const { name, children } = stateClass[ɵMETA_KEY]!;
      result[name!] = (children || []).map(findName);
      return result;
    },
    {}
  );
}

/**
 * Given a states array, returns object graph
 * returning the name and state metadata. Example:
 *
 *  const graph = {
 *    cart: { metadata }
 *  };
 *
 * @ignore
 */
export function nameToState(
  states: ɵStateClassInternal[]
): ɵPlainObjectOf<ɵStateClassInternal> {
  return states.reduce<ɵPlainObjectOf<ɵStateClassInternal>>(
    (result: ɵPlainObjectOf<ɵStateClassInternal>, stateClass: ɵStateClassInternal) => {
      const meta = stateClass[ɵMETA_KEY]!;
      result[meta.name!] = stateClass;
      return result;
    },
    {}
  );
}

/**
 * Given a object relationship graph will return the full path
 * for the child items. Example:
 *
 *  const graph = {
 *    cart: ['saved'],
 *    saved: ['items'],
 *    items: []
 *  };
 *
 * would return:
 *
 *  const r = {
 *    cart: 'cart',
 *    saved: 'cart.saved',
 *    items: 'cart.saved.items'
 *  };
 *
 * @ignore
 */
export function findFullParentPath(
  obj: StateKeyGraph,
  newObj: ɵPlainObjectOf<string> = {}
): ɵPlainObjectOf<string> {
  const visit = (child: StateKeyGraph, keyToFind: string): string | null => {
    for (const key in child) {
      if (child.hasOwnProperty(key) && child[key].indexOf(keyToFind) >= 0) {
        const parent = visit(child, key);
        return parent !== null ? `${parent}.${key}` : key;
      }
    }
    return null;
  };

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const parent = visit(obj, key);
      newObj[key] = parent ? `${parent}.${key}` : key;
    }
  }

  return newObj;
}

/**
 * Given a object graph, it will return the items topologically sorted Example:
 *
 *  const graph = {
 *    cart: ['saved'],
 *    saved: ['items'],
 *    items: []
 *  };
 *
 * would return:
 *
 *  const results = [
 *    'items',
 *    'saved',
 *    'cart'
 *  ];
 *
 * @ignore
 */
export function topologicalSort(graph: StateKeyGraph): string[] {
  const sorted: string[] = [];
  const visited: ɵPlainObjectOf<boolean> = {};

  const visit = (name: string, ancestors: string[] = []) => {
    if (!Array.isArray(ancestors)) {
      ancestors = [];
    }

    ancestors.push(name);
    visited[name] = true;

    graph[name].forEach((dep: string) => {
      // Caretaker note: we have still left the `typeof` condition in order to avoid
      // creating a breaking change for projects that still use the View Engine.
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && ancestors.indexOf(dep) >= 0) {
        throw new Error(
          `Circular dependency '${dep}' is required by '${name}': ${ancestors.join(' -> ')}`
        );
      }

      if (visited[dep]) {
        return;
      }

      visit(dep, ancestors.slice(0));
    });

    if (sorted.indexOf(name) < 0) {
      sorted.push(name);
    }
  };

  Object.keys(graph).forEach(k => visit(k));

  return sorted.reverse();
}
