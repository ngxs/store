import { Suite } from 'benchmark';

import { topologicalSort } from '../../src/internal/internals';
import { BenchmarkStats } from '../main.benchmark';

new Suite('topologicalSort', BenchmarkStats.options)
  .add('topologicalSort', function() {
    topologicalSort({
      cart: ['saved'],
      saved: ['items'],
      items: []
    });
  })
  .on('complete', (event: Event) =>
    BenchmarkStats.operationLimitDetect('topologicalSort', event)
  )
  .run();
