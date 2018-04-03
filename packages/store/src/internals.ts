import { META_KEY } from './symbols';

export interface MetaDataModel {
  name: string;
  actions: any;
  defaults: any;
  path: string;
  children: any[];
  instance: any;
}

/**
 * Ensures metadata is attached to the klass and returns it.
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
 */
export function buildGraph(states) {
  const findName = klass => {
    const meta = states.find(g => g === klass);
    if (!meta) {
      throw new Error(`Child state not found: ${klass}`);
    }

    if (!meta[META_KEY]) {
      throw new Error('States must be decorated with @State() decorator');
    }

    return meta[META_KEY].name;
  };

  return states.reduce((result, klass) => {
    if (!klass[META_KEY]) {
      throw new Error('States must be decorated with @State() decorator');
    }

    const { name, children } = klass[META_KEY];
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
 */
export function nameToState(states) {
  return states.reduce((result, klass) => {
    if (!klass[META_KEY]) {
      throw new Error('States must be decorated with @State() decorator');
    }

    const meta = klass[META_KEY];
    result[meta.name] = klass;
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
 */
export function findFullParentPath(obj: any, newObj: any = {}) {
  const visit = (child: any, keyToFind: string) => {
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
 */
export function topologicalSort(graph) {
  const sorted = [];
  const visited = {};
  const visit = (name, ancestors: any = []) => {
    if (!Array.isArray(ancestors)) {
      ancestors = [];
    }

    ancestors.push(name);
    visited[name] = true;

    graph[name].forEach(dep => {
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
 */
export function isObject(obj) {
  return (typeof obj === 'object' && obj !== null) || typeof obj === 'function';
}
