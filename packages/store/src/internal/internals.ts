import { META_KEY, ActionOptions, SELECTOR_META_KEY } from '../symbols';
import { Observable } from 'rxjs';

export interface ObjectKeyMap<T> {
  [key: string]: T;
}

export interface StateClass {
  [META_KEY]?: MetaDataModel;
}

export type StateKeyGraph = ObjectKeyMap<string[]>;

export interface ActionHandlerMetaData {
  fn: string;
  options: ActionOptions;
  type: string;
}

export interface StateOperations<T> {
  getState(): T;
  setState(val: T);
  dispatch(actions: any | any[]): Observable<void>;
}

export interface MetaDataModel {
  name: string;
  actions: ObjectKeyMap<ActionHandlerMetaData[]>;
  defaults: any;
  path: string;
  children: StateClass[];
  instance: any;
}

export type SelectFromState = (state: any) => any;

export interface SelectorMetaDataModel {
  selectFromAppState: SelectFromState;
  originalFn: Function;
  containerClass: any;
  selectorName: string;
}

export interface MappedStore {
  name: string;
  actions: ObjectKeyMap<ActionHandlerMetaData[]>;
  defaults: any;
  instance: any;
  depth: string;
}

/**
 * Ensures metadata is attached to the class and returns it.
 *
 * @ignore
 */
export function ensureStoreMetadata(target): MetaDataModel {
  if (!target.hasOwnProperty(META_KEY)) {
    const defaultMetadata: MetaDataModel = {
      name: null,
      actions: {},
      defaults: {},
      path: null,
      children: [],
      instance: null
    };

    Object.defineProperty(target, META_KEY, { value: defaultMetadata });
  }
  return getStoreMetadata(target);
}

/**
 * Get the metadata attached to the class if it exists.
 *
 * @ignore
 */
export function getStoreMetadata(target): MetaDataModel {
  return target[META_KEY];
}

/**
 * Ensures metadata is attached to the selector and returns it.
 *
 * @ignore
 */
export function ensureSelectorMetadata(target): SelectorMetaDataModel {
  if (!target.hasOwnProperty(SELECTOR_META_KEY)) {
    const defaultMetadata: SelectorMetaDataModel = {
      selectFromAppState: null,
      originalFn: null,
      containerClass: null,
      selectorName: null
    };

    Object.defineProperty(target, SELECTOR_META_KEY, { value: defaultMetadata });
  }

  return getSelectorMetadata(target);
}

/**
 * Get the metadata attached to the selector if it exists.
 *
 * @ignore
 */
export function getSelectorMetadata(target): SelectorMetaDataModel {
  return target[SELECTOR_META_KEY];
}

/**
 * The generated function is faster than:
 * - pluck (Observable operator)
 * - memoize
 *
 * @ignore
 */
export function fastPropGetter(paths: string[]): (x: any) => any {
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
export function buildGraph(stateClasses: StateClass[]): StateKeyGraph {
  const findName = (stateClass: StateClass) => {
    const meta = stateClasses.find(g => g === stateClass);
    if (!meta) {
      throw new Error(`Child state not found: ${stateClass}`);
    }

    if (!meta[META_KEY]) {
      throw new Error('States must be decorated with @State() decorator');
    }

    return meta[META_KEY].name;
  };

  return stateClasses.reduce<StateKeyGraph>((result: StateKeyGraph, stateClass: StateClass) => {
    if (!stateClass[META_KEY]) {
      throw new Error('States must be decorated with @State() decorator');
    }

    const { name, children } = stateClass[META_KEY];
    result[name] = (children || []).map(findName);
    return result;
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
export function nameToState(states: StateClass[]): ObjectKeyMap<StateClass> {
  return states.reduce<ObjectKeyMap<StateClass>>((result: ObjectKeyMap<StateClass>, stateClass: StateClass) => {
    if (!stateClass[META_KEY]) {
      throw new Error('States must be decorated with @State() decorator');
    }

    const meta = stateClass[META_KEY];
    result[meta.name] = stateClass;
    return result;
  }, {});
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
export function findFullParentPath(obj: StateKeyGraph, newObj: ObjectKeyMap<string> = {}): ObjectKeyMap<string> {
  const visit = (child: StateKeyGraph, keyToFind: string): string => {
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
  const visited: ObjectKeyMap<boolean> = {};

  const visit = (name: string, ancestors: string[] = []) => {
    if (!Array.isArray(ancestors)) {
      ancestors = [];
    }

    ancestors.push(name);
    visited[name] = true;

    graph[name].forEach((dep: string) => {
      if (ancestors.indexOf(dep) >= 0) {
        throw new Error(`Circular dependency '${dep}' is required by '${name}': ${ancestors.join(' -> ')}`);
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

/**
 * Returns if the parameter is a object or not.
 *
 * @ignore
 */
export function isObject(obj) {
  return (typeof obj === 'object' && obj !== null) || typeof obj === 'function';
}
