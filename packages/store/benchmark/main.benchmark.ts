import Benchmark = require('benchmark');
import { GOLDEN_SCORE_LIMIT } from './score.golden';
import { Options } from 'benchmark';

export class BenchmarkStats {
  private static suiteLimitStats: Map<string, number> = new Map<string, number>(
    Object.entries(GOLDEN_SCORE_LIMIT)
  );

  public static options: Options = {
    /**
     * A flag to indicate that the benchmark clock is deferred.
     *
     * @memberOf Benchmark.options
     * @type boolean
     */
    defer: false,

    /**
     * The delay between test cycles (secs).
     * @memberOf Benchmark.options
     * @type number
     */
    delay: 0.0005,

    /**
     * The default number of times to execute a test on a benchmark's first cycle.
     *
     * @memberOf Benchmark.options
     * @type number
     */
    initCount: 1,

    /**
     * The maximum time a benchmark is allowed to run before finishing (secs).
     *
     * Note: Cycle delays aren't counted toward the maximum time.
     *
     * @memberOf Benchmark.options
     * @type number
     */
    maxTime: -Infinity,

    /**
     * The minimum sample size required to perform statistical analysis.
     *
     * @memberOf Benchmark.options
     * @type number
     */
    minSamples: 3,

    /**
     * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
     *
     * @memberOf Benchmark.options
     * @type number
     */
    minTime: -Infinity,

    /**
     * An event listener called after each run cycle.
     *
     * @memberOf Benchmark.options
     * @type Function
     */
    onCycle: (event: Event) => console.log(event.target!.toString())
  };

  public static operationLimitDetect(name: string, event: Event): void {
    if (BenchmarkStats.getCurrentOps(event) < BenchmarkStats.suiteLimitStats.get(name)!) {
      BenchmarkStats.exception();
    }
  }

  private static getCurrentOps(e: Event): number {
    const [result]: Benchmark[] = Array.from(e.currentTarget as any);
    return Math.round(result.hz);
  }

  private static exception(): void {
    throw new Error(
      'The number of operations (ops/sec) has decreased, which means poor performance'
    );
  }
}
