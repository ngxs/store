/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { updateItem, patch } from '@ngxs/store/operators';

describe('[TEST]: the updateItem State Operator', () => {
  it('should have the following valid usages', () => {
    interface Original {
      nums: number[];
      strs: string[];
      bools: boolean[];
      arrs: number[][];
      objs: Array<{ name: string }>;
    }
    const original: Original = {
      nums: [1, 2, 3],
      strs: ['1', '2', '3'],
      bools: [true, false],
      arrs: [[1, 2], [3], []],
      objs: [{ name: '1' }, { name: '2' }, { name: '3' }]
    };

    patch<Original>({ nums: updateItem<number>(0, 123) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ nums: updateItem(0, 123) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ nums: updateItem(0, 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ nums: updateItem<number>(0, 123) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ nums: updateItem(0, 123) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ nums: updateItem(0, 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }

    patch<Original>({ strs: updateItem<string>(0, '123') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ strs: updateItem(0, '123') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ strs: updateItem(0, '') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ strs: updateItem<string>(0, '123') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ strs: updateItem(0, '123') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ strs: updateItem(0, '') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }

    patch<Original>({ bools: updateItem<boolean>(0, true) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ bools: updateItem<boolean>(0, true) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ bools: updateItem(0, true) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ bools: updateItem(0, true) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ bools: updateItem(0, false) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ bools: updateItem(0, false) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
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
      beer: updateItem(0, { name: 'Alchemist', quantity: 10 }),
      controller: updateItem(0, 'Max Ivanov'),
      nestedStock: {
        wine: [{ name: 'Centine', quantity: 10 }],
        nestedStock: {
          whiskey: [{ name: 'Jack Daniels' }]
        }
      }
    })(original); // $ExpectType Stock

    patch<Stock>({
      nestedStock: patch({
        wine: updateItem(0, { name: 'Chablis', quantity: 20 }),
        nestedStock: patch({
          whiskey: updateItem(0, { name: 'Chivas' })
        })
      })
    })(original); // $ExpectType Stock
  });

  it('should not accept the following usages', () => {
    interface Original {
      nums: number[];
      strs: string[];
      bools: boolean[];
      arrs: number[][];
      objs: Array<{ name: string }>;
    }
    const original: Original = {
      nums: [1, 2, 3],
      strs: ['1', '2', '3'],
      bools: [true, false],
      arrs: [[1, 2], [3], []],
      objs: [{ name: '1' }, { name: '2' }, { name: '3' }]
    };

    patch<Original>({ nums: updateItem(0, null!) })(original); // $ExpectError
    patch<Original>({ nums: updateItem(0, undefined!) })(original); // $ExpectError
    patch<Original>({ nums: updateItem(0, '1') })(original); // $ExpectError
    patch<Original>({ nums: updateItem(0, true) })(original); // $ExpectError
    patch<Original>({ nums: updateItem(0, []) })(original); // $ExpectError
    patch<Original>({ nums: updateItem(0, {}) })(original); // $ExpectError
    patch<Original>({ nums: updateItem<string>(0, '1') })(original); // $ExpectError
    patch<Original>({ nums: updateItem<boolean>(0, true) })(original); // $ExpectError
    patch<Original>({ nums: updateItem<number[]>(0, []) })(original); // $ExpectError
    patch<Original>({ nums: updateItem<object>(0, {}) })(original); // $ExpectError

    patch<Original>({ strs: updateItem(0, null!) })(original); // $ExpectError
    patch<Original>({ strs: updateItem(0, undefined!) })(original); // $ExpectError
    patch<Original>({ strs: updateItem(0, 1) })(original); // $ExpectError
    patch<Original>({ strs: updateItem(0, true) })(original); // $ExpectError
    patch<Original>({ strs: updateItem(0, []) })(original); // $ExpectError
    patch<Original>({ strs: updateItem(0, {}) })(original); // $ExpectError
    patch<Original>({ strs: updateItem<number>(0, 1) })(original); // $ExpectError
    patch<Original>({ strs: updateItem<boolean>(0, true) })(original); // $ExpectError
    patch<Original>({ strs: updateItem<number[]>(0, []) })(original); // $ExpectError
    patch<Original>({ strs: updateItem<object>(0, {}) })(original); // $ExpectError

    patch<Original>({ bools: updateItem(0, null!) })(original); // $ExpectError
    patch<Original>({ bools: updateItem(0, undefined!) })(original); // $ExpectError
    patch<Original>({ bools: updateItem(0, 1) })(original); // $ExpectError
    patch<Original>({ bools: updateItem(0, '1') })(original); // $ExpectError
    patch<Original>({ bools: updateItem(0, []) })(original); // $ExpectError
    patch<Original>({ bools: updateItem(0, {}) })(original); // $ExpectError
    patch<Original>({ bools: updateItem<number>(0, 1) })(original); // $ExpectError
    patch<Original>({ bools: updateItem<string>(0, '1') })(original); // $ExpectError
    patch<Original>({ bools: updateItem<number[]>(0, []) })(original); // $ExpectError
    patch<Original>({ bools: updateItem<object>(0, {}) })(original); // $ExpectError

    patch<Original>({ arrs: updateItem(0, null!) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem(0, undefined!) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem(0, 1) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem(0, '1') })(original); // $ExpectError
    patch<Original>({ arrs: updateItem(0, true) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem(0, ['123']) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem(0, {}) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem<number>(0, 1) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem<boolean>(0, true) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem<string>(0, '1') })(original); // $ExpectError
    patch<Original>({ arrs: updateItem<string[]>(0, []) })(original); // $ExpectError
    patch<Original>({ arrs: updateItem<object>(0, {}) })(original); // $ExpectError

    patch<Original>({ objs: updateItem(0, null!) })(original); // $ExpectError
    patch<Original>({ objs: updateItem(0, undefined!) })(original); // $ExpectError
    patch<Original>({ objs: updateItem(0, 1) })(original); // $ExpectError
    patch<Original>({ objs: updateItem(0, '1') })(original); // $ExpectError
    patch<Original>({ objs: updateItem(0, true) })(original); // $ExpectError
    patch<Original>({ objs: updateItem(0, []) })(original); // $ExpectError
    patch<Original>({ objs: updateItem(0, { desc: '' }) })(original); // $ExpectError
    patch<Original>({ objs: updateItem<number>(0, 1) })(original); // $ExpectError
    patch<Original>({ objs: updateItem<boolean>(0, true) })(original); // $ExpectError
    patch<Original>({ objs: updateItem<string>(0, '1') })(original); // $ExpectError
    patch<Original>({ objs: updateItem<number[]>(0, []) })(original); // $ExpectError
    patch<Original>({ objs: updateItem<Original['objs'][0]>(0, { desc: '' }) })(original); // $ExpectError
  });
});
