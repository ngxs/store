/* tslint:disable:max-line-length */

/// <reference types="@types/jest" />
import { compose } from '../../operators/src';

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
    compose((x) => 10); // $ExpectType StateOperator<unknown>
    compose((_x: number) => 10); // $ExpectType StateOperator<number>
    compose<number>((_x) => 10); // $ExpectType StateOperator<number>
    compose(() => 10, () => 20); // $ExpectType StateOperator<number>
    compose(() => 10, (_x) => 20); // $ExpectType StateOperator<number>
    compose((_x) => 10, () => 20); // $ExpectType StateOperator<number>
    compose((x) => 10, (x) => 20); // $ExpectType StateOperator<unknown>
    compose<number>((_x) => 10, (_x) => 20); // $ExpectType StateOperator<number>
    compose(() => 10, (x) => x * 2); // $ExpectType StateOperator<number>
    compose((_x) => 10, (x: number) => x * 2);  // $ExpectType StateOperator<number>
    compose<number>((_x) => 10, (x) => x * 2); // $ExpectType StateOperator<number>
    compose(() => 10, () => null); // $ExpectType StateOperator<number | null>
    compose(() => 10, () => undefined); // $ExpectType StateOperator<number | undefined>
    compose<number | null>((_x) => 10, (_x) => null); // $ExpectType StateOperator<number | null>
    compose<number | undefined>((_x) => 10, (_x) => undefined); // $ExpectType StateOperator<number | undefined>
    compose<number | string>((_x) => 10, (_x) => 'abc'); // $ExpectType StateOperator<string | number>
    compose<number | boolean>((_x) => 10, (_x) => true); // $ExpectType StateOperator<number | boolean>
    compose<number | boolean>((_x) => 10, (_x) => false); // $ExpectType StateOperator<number | boolean>
    compose<number | number[]>((x) => 10, (x) => [123]); // $ExpectType StateOperator<number | number[]>
    compose<number | { val: number }>((_x) => 10, (_x) => ({ val: 123 })); // $ExpectType StateOperator<number | { val: number; }>
  });

  it('should return the correct string type', () => {
    compose(() => 'abc'); // $ExpectType StateOperator<string>
    compose((x) => 'abc'); // $ExpectType StateOperator<unknown>
    compose((_x: string) => 'abc'); // $ExpectType StateOperator<string>
    compose<string>((_x) => 'abc'); // $ExpectType StateOperator<string>
    compose(() => 'abc', () => 'bcd'); // $ExpectType StateOperator<string>
    compose(() => 'abc', (_x) => 'bcd'); // $ExpectType StateOperator<string>
    compose((_x) => 'abc', () => 'bcd'); // $ExpectType StateOperator<string>
    compose((x) => 'abc', (x) => 'bcd'); // $ExpectType StateOperator<unknown>
    compose<string>((_x) => 'abc', (_x) => 'bcd'); // $ExpectType StateOperator<string>
    compose(() => 'abc', (x) => x + 'e'); // $ExpectType StateOperator<string>
    compose((_x) => 'abc', (x: string) => x + 'e');  // $ExpectType StateOperator<string>
    compose<string>((_x) => 'abc', (x) => x + 'e'); // $ExpectType StateOperator<string>
    compose(() => 'abc', () => null); // $ExpectType StateOperator<string | null>
    compose(() => 'abc', () => undefined); // $ExpectType StateOperator<string | undefined>
    compose<string | null>((_x) => 'abc', (_x) => null); // $ExpectType StateOperator<string | null>
    compose<string | undefined>((_x) => 'abc', (_x) => undefined); // $ExpectType StateOperator<string | undefined>
    compose<string | number>((_x) => 'abc', (_x) => 123); // $ExpectType StateOperator<string | number>
    compose<string | boolean>((_x) => 'abc', (_x) => true); // $ExpectType StateOperator<string | boolean>
    compose<string | boolean>((_x) => 'abc', (_x) => false); // $ExpectType StateOperator<string | boolean>
    compose<string | string[]>((x) => 'abc', (x) => ['abc']); // $ExpectType StateOperator<string | string[]>
    compose<string | { val: string }>((_x) => 'abc', (_x) => ({ val: 'abc' })); // $ExpectType StateOperator<string | { val: string; }>
  });

  it('should return the correct implied boolean type', () => {
    compose(() => true); // $ExpectType StateOperator<boolean>
    compose((x) => true); // $ExpectType StateOperator<unknown>
    compose((_x: boolean) => true); // $ExpectType StateOperator<boolean>
    compose<boolean>((_x) => true); // $ExpectType StateOperator<boolean>
    compose(() => true, () => false); // $ExpectType StateOperator<boolean>
    compose(() => true, (_x) => false); // $ExpectType StateOperator<boolean>
    compose((_x) => true, () => false); // $ExpectType StateOperator<boolean>
    compose((x) => true, (x) => false); // $ExpectType StateOperator<unknown>
    compose<boolean>((_x) => true, (_x) => false); // $ExpectType StateOperator<boolean>
    compose(() => true, (x) => !x); // $ExpectType StateOperator<boolean>
    compose((_x) => true, (x: boolean) => !x);  // $ExpectType StateOperator<boolean>
    compose<boolean>((_x) => true, (x) => !x); // $ExpectType StateOperator<boolean>
    compose(() => true, () => null); // $ExpectType StateOperator<boolean | null>
    compose(() => true, () => undefined); // $ExpectType StateOperator<boolean | undefined>
    compose<boolean | null>((_x) => true, (_x) => null); // $ExpectType StateOperator<boolean | null>
    compose<boolean | undefined>((_x) => true, (_x) => undefined); // $ExpectType StateOperator<boolean | undefined>
    compose<boolean | string>((_x) => true, (_x) => 'abc'); // $ExpectType StateOperator<string | boolean>
    compose<boolean | number>((_x) => true, (_x) => 123); // $ExpectType StateOperator<number | boolean>
    compose<boolean | boolean[]>((x) => true, (x) => [true]); // $ExpectType StateOperator<boolean | boolean[]>
    compose<boolean | { val: boolean }>((_x) => true, (_x) => ({ val: true })); // $ExpectType StateOperator<boolean | { val: boolean; }>
  });

  it('should return the correct array type', () => {
    compose(() => [10]); // $ExpectType StateOperator<number[]>
    compose((x) => [10]); // $ExpectType StateOperator<unknown>
    compose((x: Readonly<number[]>) => [10]); // $ExpectType StateOperator<number[]>
    compose<number[]>((x) => [10]); // $ExpectType StateOperator<number[]>
    compose(() => [10], () => [20]); // $ExpectType StateOperator<number[]>
    compose(() => [10], (x) => [20]); // $ExpectType StateOperator<number[]>
    compose((x) => [10], () => [20]); // $ExpectType StateOperator<number[]>
    compose((x) => [10], (x) => [20]); // $ExpectType StateOperator<unknown>
    compose<number[]>((x) => [10], (x) => [20]); // $ExpectType StateOperator<number[]>
    compose(() => [10], (x) => [...x, 2]); // $ExpectType StateOperator<number[]>
    compose((x) => [10], (x: Readonly<number[]>) => [...x, 2]);  // $ExpectType StateOperator<number[]>
    compose<number[]>((x) => [10], (x) => [...x, 2]); // $ExpectType StateOperator<number[]>
    compose(() => [10], () => null); // $ExpectType StateOperator<number[] | null>
    compose(() => [10], () => undefined); // $ExpectType StateOperator<number[] | undefined>
    compose<number[] | null>((x) => [10], (x) => null); // $ExpectType StateOperator<number[] | null>
    compose<number[] | undefined>((x) => [10], (x) => undefined); // $ExpectType StateOperator<number[] | undefined>
    compose<number[] | number>((x) => [10], (x) => 123); // $ExpectType StateOperator<number | number[]>
    compose<number[] | string>((x) => [10], (x) => 'abc'); // $ExpectType StateOperator<string | number[]>
    compose<number[] | boolean>((x) => [10], (x) => true); // $ExpectType StateOperator<boolean | number[]>
    compose<number[] | boolean>((x) => [10], (x) => false); // $ExpectTypeStateOperator<boolean | number[]>
    compose<number[] | number[][]>((x) => [10], (x) => [123]); // $ExpectType StateOperator<number[] | number[][]>
    compose<number[] | { val: number[] }>((x) => [10], (x) => ({ val: [123] })); // $ExpectType StateOperator<number[] | { val: number[]; }>
  });

  it('should return the correct object type', () => {
    compose(() => ({ val: 10 })); // $ExpectType StateOperator<{ val: number; }>
    compose((x) => ({ val: 10 })); // $ExpectType StateOperator<unknown>
    compose((_x: { val: number; }) => ({ val: 10 })); // $ExpectType StateOperator<{ val: number; }>
    compose<{ val: number; }>((_x) => ({ val: 10 })); // $ExpectType StateOperator<{ val: number; }>
    compose(() => ({ val: 10 }), () => ({ val: 20 })); // $ExpectType StateOperator<{ val: number; }>
    compose(() => ({ val: 10 }), (_x) => ({ val: 20 })); // $ExpectType StateOperator<{ val: number; }>
    compose((_x) => ({ val: 10 }), () => ({ val: 20 })); // $ExpectType StateOperator<{ val: number; }>
    compose((x) => ({ val: 10 }), (x) => ({ val: 20 })); // $ExpectType StateOperator<unknown>
    compose<{ val: number; }>((_x) => ({ val: 10 }), (x) => ({ val: 20 })); // $ExpectType StateOperator<{ val: number; }>
    compose(() => ({ val: 10 }), (x) => ({ val: x.val * 2 })); // $ExpectType StateOperator<{ val: number; }>
    compose((_x) => ({ val: 10 }), (x: { val: number; }) => ({ val: x.val * 2 }));  // $ExpectType StateOperator<{ val: number; }>
    compose<{ val: number; }>((_x) => ({ val: 10 }), (x) => ({ val: x.val * 2 })); // $ExpectType StateOperator<{ val: number; }>
    compose(() => ({ val: 10 }), () => null); // $ExpectType StateOperator<{ val: number; } | null>
    compose(() => ({ val: 10 }), () => undefined); // $ExpectType StateOperator<{ val: number; } | undefined>
    compose<{ val: number; } | null>((_x) => ({ val: 10 }), (_x) => null); // $ExpectType StateOperator<{ val: number; } | null>
    compose<{ val: number; } | undefined>((_x) => ({ val: 10 }), (_x) => undefined); // $ExpectType StateOperator<{ val: number; } | undefined>
    compose<{ val: number; } | number>((_x) => ({ val: 10 }), (_x) => 123); // $ExpectType StateOperator<number | { val: number; }>
    compose<{ val: number; } | string>((_x) => ({ val: 10 }), (_x) => 'abc'); // $ExpectType StateOperator<string | { val: number; }>
    compose<{ val: number; } | boolean>((_x) => ({ val: 10 }), (_x) => true); // $ExpectType StateOperator<boolean | { val: number; }>
    compose<{ val: number; } | boolean>((_x) => ({ val: 10 }), (_x) => false); // $ExpectType StateOperator<boolean | { val: number; }>
    compose<{ val: number; } | Array<{ val: number; }>>((x) => ({ val: 10 }), (x) => [{ val: 123 }]); // $ExpectType StateOperator<{ val: number; }[] | { val: number; }>
    compose<{ val: number; } | { val: { val: number; } }>((_x) => ({ val: 10 }), (_x) => ({ val: 123 })); // $ExpectType StateOperator<{ val: number; } | { val: { val: number; }; }>
  });
});
