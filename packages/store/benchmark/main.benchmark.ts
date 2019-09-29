import Benchmark = require('benchmark');
import { PlainObjectOf } from '@ngxs/store/internals';

export class BenchmarkStats {
  private static suiteLimitStats: Map<string, number> = BenchmarkStats.generateGolden({
    isObject: 700_000_000,
    topologicalSort: 1_200_000
  });

  public static showCycle(event: Event): void {
    console.log(event.target!.toString());
  }

  public static operationLimitDetect(name: string, event: Event): void {
    if (BenchmarkStats.getCurrentOps(event) < BenchmarkStats.suiteLimitStats.get(name)!) {
      BenchmarkStats.exception();
    }
  }

  private static generateGolden(obj: PlainObjectOf<number>): Map<string, number> {
    return new Map<string, number>(Object.entries(obj));
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
