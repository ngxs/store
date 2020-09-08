/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { removeItem, patch } from '@ngxs/store/operators';

describe('[TEST]: the removeItem State Operator', () => {
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

    patch<Original>({ nums: removeItem(null!) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ nums: removeItem(undefined!) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }

    patch<Original>({ nums: removeItem<number>(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ nums: removeItem(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ nums: removeItem(item => item === 2) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }

    patch<Original>({ strs: removeItem<string>(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ strs: removeItem(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ strs: removeItem(item => item === '2') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }

    patch<Original>({ bools: removeItem<boolean>(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ bools: removeItem(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ bools: removeItem(item => item === true) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }

    patch<Original>({ arrs: removeItem<number[]>(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ arrs: removeItem(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ arrs: removeItem(item => item === []) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }

    patch<Original>({ objs: removeItem<Original['objs'][0]>(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ objs: removeItem(1) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
    patch<Original>({ objs: removeItem(item => item!.name === '') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; arrs: number[][]; objs: { name: string; }[]; }
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
      beer: removeItem(1),
      controller: removeItem(item => item === 'Mark Whitfield'),
      nestedStock: {
        wine: [{ name: 'Centine', quantity: 10 }],
        nestedStock: {
          whiskey: [{ name: 'Jack Daniels' }]
        }
      }
    })(original); // $ExpectType Stock

    patch<Stock>({
      nestedStock: patch({
        wine: removeItem(1),
        nestedStock: patch({
          whiskey: removeItem<Whiskey>(item => item!.name === 'Chivas')
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

    patch<Original>({ nums: removeItem('1') })(original); // $ExpectError
    patch<Original>({ nums: removeItem(true) })(original); // $ExpectError
    patch<Original>({ nums: removeItem([]) })(original); // $ExpectError
    patch<Original>({ nums: removeItem({}) })(original); // $ExpectError

    patch<Original>({ nums: removeItem<string>(1) })(original); // $ExpectError
    patch<Original>({ nums: removeItem(item => item === '2') })(original); // $ExpectError
    patch<Original>({ nums: removeItem<boolean>(1) })(original); // $ExpectError
    patch<Original>({ nums: removeItem(item => item === true) })(original); // $ExpectError
    patch<Original>({ nums: removeItem<number[]>(1) })(original); // $ExpectError
    patch<Original>({ nums: removeItem(item => item === []) })(original); // $ExpectError
    patch<Original>({ nums: removeItem<object>(1) })(original); // $ExpectError
    patch<Original>({ nums: removeItem(item => item === {}) })(original); // $ExpectError

    patch<Original>({ strs: removeItem<number>(1) })(original); // $ExpectError
    patch<Original>({ strs: removeItem(item => item === 2) })(original); // $ExpectError
    patch<Original>({ strs: removeItem<boolean>(1) })(original); // $ExpectError
    patch<Original>({ strs: removeItem(item => item === true) })(original); // $ExpectError
    patch<Original>({ strs: removeItem<number[]>(1) })(original); // $ExpectError
    patch<Original>({ strs: removeItem(item => item === []) })(original); // $ExpectError
    patch<Original>({ strs: removeItem<object>(1) })(original); // $ExpectError
    patch<Original>({ strs: removeItem(item => item === {}) })(original); // $ExpectError

    patch<Original>({ bools: removeItem<number>(1) })(original); // $ExpectError
    patch<Original>({ bools: removeItem(item => item === 2) })(original); // $ExpectError
    patch<Original>({ bools: removeItem<string>(1) })(original); // $ExpectError
    patch<Original>({ bools: removeItem(item => item === '2') })(original); // $ExpectError
    patch<Original>({ bools: removeItem<number[]>(1) })(original); // $ExpectError
    patch<Original>({ bools: removeItem(item => item === []) })(original); // $ExpectError
    patch<Original>({ bools: removeItem<object>(1) })(original); // $ExpectError
    patch<Original>({ bools: removeItem(item => item === {}) })(original); // $ExpectError

    patch<Original>({ arrs: removeItem<number>(1) })(original); // $ExpectError
    patch<Original>({ arrs: removeItem(item => item === 2) })(original); // $ExpectError
    patch<Original>({ arrs: removeItem<string>(1) })(original); // $ExpectError
    patch<Original>({ arrs: removeItem(item => item === '2') })(original); // $ExpectError
    patch<Original>({ arrs: removeItem<boolean>(1) })(original); // $ExpectError
    patch<Original>({ arrs: removeItem(item => item === true) })(original); // $ExpectError
    patch<Original>({ arrs: removeItem<object>(1) })(original); // $ExpectError
    patch<Original>({ arrs: removeItem(item => item === {}) })(original); // $ExpectError

    patch<Original>({ objs: removeItem<number>(1) })(original); // $ExpectError
    patch<Original>({ objs: removeItem(item => item === 2) })(original); // $ExpectError
    patch<Original>({ objs: removeItem<string>(1) })(original); // $ExpectError
    patch<Original>({ objs: removeItem(item => item === '2') })(original); // $ExpectError
    patch<Original>({ objs: removeItem<boolean>(1) })(original); // $ExpectError
    patch<Original>({ objs: removeItem(item => item === true) })(original); // $ExpectError
    patch<Original>({ objs: removeItem<number[]>(1) })(original); // $ExpectError
    patch<Original>({ objs: removeItem(item => item === []) })(original); // $ExpectError
  });
});
