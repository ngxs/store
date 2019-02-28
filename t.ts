import { performance } from 'perf_hooks';
import { StateKeyGraph, ObjectKeyMap } from './packages/store/src/internal/internals';

function benchmark(name: string, fn: () => void, { iterations }: { iterations: number }) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  const elapsedMs = end - start;
  console.log(`Test "${name}" finished in ${elapsedMs} MS.`);
  return elapsedMs;
}

export function topologicalSortWithForEach(graph: StateKeyGraph): string[] {
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
export function topologicalSortWithSingleFor(graph: StateKeyGraph): string[] {
  const sorted: string[] = [];
  const visited: ObjectKeyMap<boolean> = {};

  const visit = (name: string, ancestors: string[] = []) => {
    if (!Array.isArray(ancestors)) {
      ancestors = [];
    }

    ancestors.push(name);
    visited[name] = true;

    const deps: string[] = graph[name];

    for (let i = 0, length = deps.length; i < length; i++) {
      const dep = deps[i];

      if (ancestors.indexOf(dep) >= 0) {
        throw new Error(
          `Circular dependency '${dep}' is required by '${name}': ${ancestors.join(' -> ')}`
        );
      }

      if (visited[dep]) {
        continue;
      }

      visit(dep, ancestors.slice(0));
    }

    if (sorted.indexOf(name) < 0) {
      sorted.push(name);
    }
  };

  const keys = Object.keys(graph);
  for (let i = 0, length = keys.length; i < length; i++) {
    visit(keys[i]);
  }

  return sorted.reverse();
}

benchmark(
  'forEach',
  () => {
    topologicalSortWithForEach({
      saved: ['items'],
      items: ['child'],
      cart: ['saved'],
      child: []
    });
  },
  { iterations: 1e5 }
);

benchmark(
  'for',
  () => {
    topologicalSortWithSingleFor({
      saved: ['items'],
      items: ['child'],
      cart: ['saved'],
      child: []
    });
  },
  { iterations: 1e5 }
);
