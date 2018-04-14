import { META_KEY, ActionOptions } from './symbols';
import { Observable } from 'rxjs';

export interface ObjectKeyMap<T> {
  [key: string]: T;
}

export interface StateKlass {
  [META_KEY]?: MetaDataModel;
}

type StateKeyGraph = ObjectKeyMap<string[]>;

export interface ActionHandlerMetaData {
  fn: string;
  options: ActionOptions;
  type: string;
}

export type GetStateFn<T> = () => T;
export type SetStateFn<T> = (newState: T) => void;
export type DispatchFn = (actions: any | any[]) => Observable<any>;

export interface MetaDataModel {
  name: string;
  actions: ObjectKeyMap<ActionHandlerMetaData[]>;
  defaults: any;
  path: string;
  children: StateKlass[];
  instance: any;
}

/**
 * Ensures metadata is attached to the klass and returns it.
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

  return target[META_KEY];
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
export function buildGraph(stateKlasses: StateKlass[]): StateKeyGraph {
  const findName = (klass: StateKlass): string => {
    const meta: StateKlass = stateKlasses.find(g => g === klass);
    if (!meta) {
      throw new Error(`Child state not found: ${klass}`);
    }

    if (!meta[META_KEY]) {
      throw new Error('States must be decorated with @State() decorator');
    }

    return meta[META_KEY].name;
  };

  return stateKlasses.reduce(
    (result: StateKeyGraph, klass: StateKlass) => {
      if (!klass[META_KEY]) {
        throw new Error('States must be decorated with @State() decorator');
      }

      const { name, children } = klass[META_KEY];
      result[name] = (children || []).map(findName);
      return result;
    },
    <StateKeyGraph>{}
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
export function nameToState(states: StateKlass[]): ObjectKeyMap<StateKlass> {
  return states.reduce(
    (result, klass: StateKlass) => {
      if (!klass[META_KEY]) {
        throw new Error('States must be decorated with @State() decorator');
      }

      const meta = klass[META_KEY];
      result[meta.name] = klass;
      return result;
    },
    <ObjectKeyMap<StateKlass>>{}
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
export function findFullParentPath(obj: StateKeyGraph, newObj: ObjectKeyMap<string> = {}): ObjectKeyMap<string> {
  const visit = (child: StateKeyGraph, keyToFind: string): string => {
    for (const key in child) {
      if (child.hasOwnProperty(key) && child[key].indexOf(keyToFind) >= 0) {
        const parent: string = visit(child, key);
        return parent !== null ? `${parent}.${key}` : key;
      }
    }
    return null;
  };

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const parent: string = visit(obj, key);
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
