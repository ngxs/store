import { Suite } from 'benchmark';

import { isObject } from '../../src/internal/internals';
import { BenchmarkStats } from '../main.benchmark';

new Suite()
  .add('isObject', function() {
    isObject({});
    isObject([]);
    isObject(null);
    isObject(1);
    isObject('string');
  })
  .on('cycle', (event: Event) => BenchmarkStats.showCycle(event))
  .on('complete', (event: Event) => BenchmarkStats.operationLimitDetect('isObject', event))
  .run();
