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

export type StateKeyGraph = ɵPlainObjectOf<string[]>;
export type StatesByName = ɵPlainObjectOf<ɵStateClassInternal>;

export interface StateOperations<T> {
  getState(): T;

  setState(val: T): void;

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
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'PROP_GETTER' : '',
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
  // Resolve a state's name from the class reference.
  const findName = (stateClass: ɵStateClassInternal): string => {
    const meta = stateClasses.find(s => s === stateClass);
    if (typeof ngDevMode !== 'undefined' && ngDevMode && !meta) {
      throw new Error(
        `Child state not found: ${stateClass}. \r\nYou may have forgotten to add states to module`
      );
    }
    return meta![ɵMETA_KEY]!.name!;
  };

  // Build the dependency graph.
  return stateClasses.reduce((graph: StateKeyGraph, stateClass) => {
    const meta = stateClass[ɵMETA_KEY]!;
    graph[meta.name!] = (meta.children || []).map(findName);
    return graph;
  }, {});
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
  out: ɵPlainObjectOf<string> = {}
): ɵPlainObjectOf<string> {
  // Recursively find the full dotted parent path for a given key.
  const find = (graph: StateKeyGraph, target: string): string | null => {
    for (const key in graph) {
      if (graph[key]?.includes(target)) {
        const parent = find(graph, key);
        return parent ? `${parent}.${key}` : key;
      }
    }
    return null;
  };

  // Build full path for each key
  for (const key in obj) {
    const parent = find(obj, key);
    out[key] = parent ? `${parent}.${key}` : key;
  }

  return out;
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

  // DFS (Depth-First Search) to visit each node and its dependencies.
  const visit = (name: string, ancestors: string[] = []) => {
    visited[name] = true;
    ancestors.push(name);

    for (const dep of graph[name]) {
      if (typeof ngDevMode !== 'undefined' && ngDevMode && ancestors.includes(dep)) {
        throw new Error(
          `Circular dependency '${dep}' is required by '${name}': ${ancestors.join(' -> ')}`
        );
      }

      if (!visited[dep]) visit(dep, ancestors.slice());
    }

    // Add to sorted list if not already included.
    if (!sorted.includes(name)) sorted.push(name);
  };

  // Start DFS from each key
  for (const key in graph) visit(key);

  return sorted.reverse();
}
