/* tslint:disable:max-line-length */

/// <reference types="@types/jest" />
import { compose } from '@ngxs/store/operators';

describe('[TEST]: the compose State Operator', () => {
  it('should return the correct null or undefined type', () => {
    compose(() => null); // $ExpectType StateOperator<null>
    compose(() => null, () => null); // $ExpectType StateOperator<null>
    compose(() => undefined); // $ExpectType StateOperator<undefined>
    compose(() => undefined, () => undefined); // $ExpectType StateOperator<undefined>
    compose(() => null, () => undefined); // $ExpectType StateOperator<null | undefined>
  });

  it('should return the correct number type', () => {
    compose(() => 10); // $ExpectType StateOperator<number>
    // TS3.4 compose((x) => 10); // $/ExpectType (existing: Readonly<{}>) => {}
    compose((x: number) => 10); // $ExpectType StateOperator<number>
    compose<number>((x) => 10); // $ExpectType StateOperator<number>
    compose(() => 10, () => 20); // $ExpectType StateOperator<number>
    compose(() => 10, (x) => 20); // $ExpectType StateOperator<number>
    compose((x) => 10, () => 20); // $ExpectType StateOperator<number>
    // TS3.4 compose((x) => 10, (x) => 20); // $/ExpectType (existing: Readonly<{}>) => {}
    compose<number>((x) => 10, (x) => 20); // $ExpectType StateOperator<number>
    compose(() => 10, (x) => x * 2); // $ExpectType StateOperator<number>
    compose((x) => 10, (x: number) => x * 2);  // $ExpectType StateOperator<number>
    compose<number>((x) => 10, (x) => x * 2); // $ExpectType StateOperator<number>
    compose(() => 10, () => null); // $ExpectType StateOperator<number | null>
    compose(() => 10, () => undefined); // $ExpectType StateOperator<number | undefined>
    compose<number | null>((x) => 10, (x) => null); // $ExpectType StateOperator<number | null>
    compose<number | undefined>((x) => 10, (x) => undefined); // $ExpectType StateOperator<number | undefined>
    compose<number | string>((x) => 10, (x) => 'abc'); // $ExpectType StateOperator<string | number>
    compose<number | boolean>((x) => 10, (x) => true); // $ExpectType StateOperator<number | boolean>
    compose<number | boolean>((x) => 10, (x) => false); // $ExpectType StateOperator<number | boolean>
    // TS3.4 compose<number | number[]>((x) => 10, (x) => [123]); // $/ExpectType StateOperator<number | number[]>
    compose<number | { val: number }>((x) => 10, (x) => ({ val: 123 })); // $ExpectType StateOperator<number | { val: number; }>
  });

  it('should return the correct string type', () => {
    compose(() => 'abc'); // $ExpectType StateOperator<string>
    // TS3.4 compose((x) => 'abc'); // $/ExpectType (existing: Readonly<{}>) => {}
    compose((x: string) => 'abc'); // $ExpectType StateOperator<string>
    compose<string>((x) => 'abc'); // $ExpectType StateOperator<string>
    compose(() => 'abc', () => 'bcd'); // $ExpectType StateOperator<string>
    compose(() => 'abc', (x) => 'bcd'); // $ExpectType StateOperator<string>
    compose((x) => 'abc', () => 'bcd'); // $ExpectType StateOperator<string>
    // TS3.4 compose((x) => 'abc', (x) => 'bcd'); // $/ExpectType (existing: Readonly<{}>) => {}
    compose<string>((x) => 'abc', (x) => 'bcd'); // $ExpectType StateOperator<string>
    compose(() => 'abc', (x) => x + 'e'); // $ExpectType StateOperator<string>
    compose((x) => 'abc', (x: string) => x + 'e');  // $ExpectType StateOperator<string>
    compose<string>((x) => 'abc', (x) => x + 'e'); // $ExpectType StateOperator<string>
    compose(() => 'abc', () => null); // $ExpectType StateOperator<string | null>
    compose(() => 'abc', () => undefined); // $ExpectType StateOperator<string | undefined>
    compose<string | null>((x) => 'abc', (x) => null); // $ExpectType StateOperator<string | null>
    compose<string | undefined>((x) => 'abc', (x) => undefined); // $ExpectType StateOperator<string | undefined>
    compose<string | number>((x) => 'abc', (x) => 123); // $ExpectType StateOperator<string | number>
    compose<string | boolean>((x) => 'abc', (x) => true); // $ExpectType StateOperator<string | boolean>
    compose<string | boolean>((x) => 'abc', (x) => false); // $ExpectType StateOperator<string | boolean>
    // TS3.4 compose<string | string[]>((x) => 'abc', (x) => ['abc']); // $/ExpectType StateOperator<string | string[]>
    compose<string | { val: string }>((x) => 'abc', (x) => ({ val: 'abc' })); // $ExpectType StateOperator<string | { val: string; }>
  });

  it('should return the correct implied boolean type', () => {
    compose(() => true); // $ExpectType StateOperator<boolean>
    // TS3.4 compose((x) => true); // $/ExpectType (existing: Readonly<{}>) => {}
    compose((x: boolean) => true); // $ExpectType StateOperator<boolean>
    compose<boolean>((x) => true); // $ExpectType StateOperator<boolean>
    compose(() => true, () => false); // $ExpectType StateOperator<boolean>
    compose(() => true, (x) => false); // $ExpectType StateOperator<boolean>
    compose((x) => true, () => false); // $ExpectType StateOperator<boolean>
    // TS3.4 ((x) => true, (x) => false); // $/ExpectType (existing: Readonly<{}>) => {}
    compose<boolean>((x) => true, (x) => false); // $ExpectType StateOperator<boolean>
    compose(() => true, (x) => !x); // $ExpectType StateOperator<boolean>
    compose((x) => true, (x: boolean) => !x);  // $ExpectType StateOperator<boolean>
    compose<boolean>((x) => true, (x) => !x); // $ExpectType StateOperator<boolean>
    compose(() => true, () => null); // $ExpectType StateOperator<boolean | null>
    compose(() => true, () => undefined); // $ExpectType StateOperator<boolean | undefined>
    compose<boolean | null>((x) => true, (x) => null); // $ExpectType StateOperator<boolean | null>
    compose<boolean | undefined>((x) => true, (x) => undefined); // $ExpectType StateOperator<boolean | undefined>
    compose<boolean | string>((x) => true, (x) => 'abc'); // $ExpectType StateOperator<string | boolean>
    compose<boolean | number>((x) => true, (x) => 123); // $ExpectType StateOperator<number | boolean>
    // TS3.4 compose<boolean | boolean[]>((x) => true, (x) => [true]); // $/ExpectType StateOperator<boolean | boolean[]>
    compose<boolean | { val: boolean }>((x) => true, (x) => ({ val: true })); // $ExpectType StateOperator<boolean | { val: boolean; }>
  });

  it('should return the correct array type', () => {
    /* TODO: readonly array improvement with TS3.4
    compose(() => [10]); // $/ExpectType (existing: number[]) => number[]
    compose((x) => [10]); // $/ExpectType (existing: Readonly<{}>) => {}
    compose((x: number[]) => [10]); // $/ExpectType (existing: number[]) => number[]
    compose<number[]>((x) => [10]); // $/ExpectType (existing: number[]) => number[]
    compose(() => [10], () => [20]); // $/ExpectType (existing: number[]) => number[]
    compose(() => [10], (x) => [20]); // $/ExpectType (existing: number[]) => number[]
    compose((x) => [10], () => [20]); // $/ExpectType (existing: number[]) => number[]
    compose((x) => [10], (x) => [20]); // $/ExpectType (existing: Readonly<{}>) => {}
    compose<number[]>((x) => [10], (x) => [20]); // $/ExpectType (existing: number[]) => number[]
    compose(() => [10], (x) => [...x, 2]); // $/ExpectType (existing: number[]) => number[]
    compose((x) => [10], (x: number[]) => [...x, 2]);  // $/ExpectType (existing: number[]) => number[]
    compose<number[]>((x) => [10], (x) => [...x, 2]); // $/ExpectType (existing: number[]) => number[]
    compose(() => [10], () => null); // $/ExpectType (existing: number[] | null) => number[] | null
    compose(() => [10], () => undefined); // $/ExpectType (existing: number[] | undefined) => number[] | undefined
    compose<number[] | null>((x) => [10], (x) => null); // $/ExpectType (existing: number[] | null) => number[] | null
    compose<number[] | undefined>((x) => [10], (x) => undefined); // $/ExpectType (existing: number[] | undefined) => number[] | undefined
    compose<number[] | number>((x) => [10], (x) => 123); // $/ExpectType (existing: number | number[]) => number | number[]
    compose<number[] | string>((x) => [10], (x) => 'abc'); // $/ExpectType (existing: string | number[]) => string | number[]
    compose<number[] | boolean>((x) => [10], (x) => true); // $/ExpectType (existing: boolean | number[]) => boolean | number[]
    compose<number[] | boolean>((x) => [10], (x) => false); // $/ExpectType(existing: boolean | number[]) => boolean | number[]
    compose<number[] | number[][]>((x) => [10], (x) => [123]); // $/ExpectType (existing: number[] | number[][]) => number[] | number[][]
    compose<number[] | { val: number[] }>((x) => [10], (x) => ({ val: [123] })); // $/ExpectType (existing: number[] | Readonly<{ val: number[]; }>) => number[] | { val: number[]; }
    */
  });

  it('should return the correct object type', () => {
    compose(() => ({ val: 10 })); // $ExpectType StateOperator<{ val: number; }>
    // TS3.4 compose((x) => ({ val: 10 })); // $/ExpectType (existing: Readonly<{}>) => {}
    compose((x: { val: number; }) => ({ val: 10 })); // $ExpectType StateOperator<{ val: number; }>
    compose<{ val: number; }>((x) => ({ val: 10 })); // $ExpectType StateOperator<{ val: number; }>
    compose(() => ({ val: 10 }), () => ({ val: 20 })); // $ExpectType StateOperator<{ val: number; }>
    compose(() => ({ val: 10 }), (x) => ({ val: 20 })); // $ExpectType StateOperator<{ val: number; }>
    compose((x) => ({ val: 10 }), () => ({ val: 20 })); // $ExpectType StateOperator<{ val: number; }>
    // TS3.4 compose((x) => ({ val: 10 }), (x) => ({ val: 20 })); // $/ExpectType (existing: Readonly<{}>) => {}
    compose<{ val: number; }>((x) => ({ val: 10 }), (x) => ({ val: 20 })); // $ExpectType StateOperator<{ val: number; }>
    compose(() => ({ val: 10 }), (x) => ({ val: x.val * 2 })); // $ExpectType StateOperator<{ val: number; }>
    compose((x) => ({ val: 10 }), (x: { val: number; }) => ({ val: x.val * 2 }));  // $ExpectType StateOperator<{ val: number; }>
    compose<{ val: number; }>((x) => ({ val: 10 }), (x) => ({ val: x.val * 2 })); // $ExpectType StateOperator<{ val: number; }>
    compose(() => ({ val: 10 }), () => null); // $ExpectType StateOperator<{ val: number; } | null>
    compose(() => ({ val: 10 }), () => undefined); // $ExpectType StateOperator<{ val: number; } | undefined>
    compose<{ val: number; } | null>((x) => ({ val: 10 }), (x) => null); // $ExpectType StateOperator<{ val: number; } | null>
    compose<{ val: number; } | undefined>((x) => ({ val: 10 }), (x) => undefined); // $ExpectType StateOperator<{ val: number; } | undefined>
    compose<{ val: number; } | number>((x) => ({ val: 10 }), (x) => 123); // $ExpectType StateOperator<number | { val: number; }>
    compose<{ val: number; } | string>((x) => ({ val: 10 }), (x) => 'abc'); // $ExpectType StateOperator<string | { val: number; }>
    compose<{ val: number; } | boolean>((x) => ({ val: 10 }), (x) => true); // $ExpectType StateOperator<boolean | { val: number; }>
    compose<{ val: number; } | boolean>((x) => ({ val: 10 }), (x) => false); // $ExpectType StateOperator<boolean | { val: number; }>
    // TS3.4 compose<{ val: number; } | Array<{ val: number; }>>((x) => ({ val: 10 }), (x) => [{ val: 123 }]); // $/ExpectType StateOperator<{ val: number; }[] | { val: number; }>
    compose<{ val: number; } | { val: { val: number; } }>((x) => ({ val: 10 }), (x) => ({ val: 123 })); // $ExpectType StateOperator<{ val: number; } | { val: { val: number; }; }>
  });
});
