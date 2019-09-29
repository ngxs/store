import { Suite } from 'benchmark';

import { topologicalSort } from '../../src/internal/internals';
import { BenchmarkStats } from '../main.benchmark';

new Suite()
  .add('topologicalSort', function() {
    topologicalSort({
      cart: ['saved'],
      saved: ['items'],
      items: []
    });
  })
  .on('cycle', (event: Event) => BenchmarkStats.showCycle(event))
  .on('complete', (event: Event) =>
    BenchmarkStats.operationLimitDetect('topologicalSort', event)
  )
  .run();
