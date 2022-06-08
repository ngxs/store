/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { append, patch } from '@ngxs/store/operators';

describe('[TEST]: the append State Operator', () => {
  it('should have the following valid usages', () => {
    interface Original {
      nums: number[];
      strs: string[];
      bools: boolean[];
    }
    const original: Original = {
      nums: [1, 2, 3],
      strs: ['1', '2', '3'],
      bools: [true, false]
    };

    patch<Original>({ nums: append<number>([]) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ nums: append(null!) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ nums: append(undefined!) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ nums: append([1, 2]) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }

    patch<Original>({ strs: append<string>([]) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ strs: append(null!) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ strs: append(undefined!) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ strs: append(['1', '2']) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }

    patch<Original>({ bools: append<boolean>([]) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: append(null!) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: append(undefined!) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: append([true, false]) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: append([true]) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: append([false]) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
  });

  it('should have the following valid complex usage', () => {
    interface Stock {
      beer: Beer[];
      controller: string[];
      nestedStock?: {
        wine: Wine[];
        nestedStock?: {
          whiskey: Whiskey[];
        };
      };
    }

    interface Beer {
      name: string;
      quantity: number;
    }

    interface Wine {
      name: string;
      quantity: number;
    }

    interface Whiskey {
      name: string;
    }

    const original: Stock = {
      beer: [
        {
          name: 'Colessi',
          quantity: 10
        },
        {
          name: 'BUNK!',
          quantity: 5
        }
      ],
      controller: ['Artur Androsovych', 'Mark Whitfield']
    };

    patch<Stock>({
      beer: append([{ name: 'Alchemist', quantity: 10 }]),
      controller: append(['Max Ivanov']),
      nestedStock: {
        wine: [{ name: 'Centine', quantity: 10 }],
        nestedStock: {
          whiskey: [{ name: 'Jack Daniels' }]
        }
      }
    })(original); // $ExpectType Stock

    patch<Stock>({
      nestedStock: patch({
        wine: append([{ name: 'Chablis', quantity: 20 }]),
        nestedStock: patch({
          whiskey: append([{ name: 'Chivas' }])
        })
      })
    })(original); // $//ExpectType Stock
  });

  it('should not accept the following usages', () => {
    interface Original {
      nums: number[];
      strs: string[];
      bools: boolean[];
    }
    const original: Original = {
      nums: [1, 2, 3],
      strs: ['1', '2', '3'],
      bools: [true, false]
    };

    patch<Original>({ nums: append([]) })(original); // $ExpectError
    patch<Original>({ nums: append<string>([]) })(original); // $ExpectError
    patch<Original>({ nums: append([null]) })(original); // $ExpectError
    patch<Original>({ nums: append([undefined]) })(original); // $ExpectError
    patch<Original>({ nums: append(['1', 2]) })(original); // $ExpectError
    patch<Original>({ nums: append(['4', '5']) })(original); // $ExpectError

    patch<Original>({ strs: append([]) })(original); // $ExpectError
    patch<Original>({ strs: append<number>([]) })(original); // $ExpectError
    patch<Original>({ strs: append([null]) })(original); // $ExpectError
    patch<Original>({ strs: append([undefined]) })(original); // $ExpectError
    patch<Original>({ strs: append([1, '2']) })(original); // $ExpectError
    patch<Original>({ strs: append([4, 5]) })(original); // $ExpectError

    patch<Original>({ bools: append([]) })(original); // $ExpectError
    patch<Original>({ bools: append<number>([]) })(original); // $ExpectError
    patch<Original>({ bools: append([null]) })(original); // $ExpectError
    patch<Original>({ bools: append([undefined]) })(original); // $ExpectError
    patch<Original>({ bools: append([1, true]) })(original); // $ExpectError
    patch<Original>({ bools: append([4, 5]) })(original); // $ExpectError
  });
});
