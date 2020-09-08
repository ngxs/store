/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { insertItem, patch } from '@ngxs/store/operators';

describe('[TEST]: the insertItem State Operator', () => {
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

    patch<Original>({ nums: insertItem<number>(123) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ nums: insertItem(123) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ nums: insertItem(0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ nums: insertItem<number>(123, 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ nums: insertItem(123, 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ nums: insertItem(0, 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }

    patch<Original>({ strs: insertItem<string>('123') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ strs: insertItem('123') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ strs: insertItem('') })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ strs: insertItem<string>('123', 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ strs: insertItem('123', 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ strs: insertItem('', 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }

    patch<Original>({ bools: insertItem<boolean>(true) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: insertItem<boolean>(true, 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: insertItem(true) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: insertItem(true, 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: insertItem(false) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
    patch<Original>({ bools: insertItem(false, 0) })(original); // $ExpectType { nums: number[]; strs: string[]; bools: boolean[]; }
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
      beer: insertItem({ name: 'Alchemist', quantity: 10 }),
      controller: insertItem('Max Ivanov'),
      nestedStock: {
        wine: [{ name: 'Centine', quantity: 10 }],
        nestedStock: {
          whiskey: [{ name: 'Jack Daniels' }]
        }
      }
    })(original); // $ExpectType Stock

    patch<Stock>({
      nestedStock: patch({
        wine: insertItem({ name: 'Chablis', quantity: 20 }),
        nestedStock: patch({
          whiskey: insertItem({ name: 'Chivas' })
        })
      })
    })(original); // $ExpectType Stock
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

    patch<Original>({ nums: insertItem(null!) })(original); // $ExpectError
    patch<Original>({ nums: insertItem(undefined!) })(original); // $ExpectError
    patch<Original>({ nums: insertItem('1') })(original); // $ExpectError
    patch<Original>({ nums: insertItem(true) })(original); // $ExpectError
    patch<Original>({ nums: insertItem([]) })(original); // $ExpectError
    patch<Original>({ nums: insertItem({}) })(original); // $ExpectError
    patch<Original>({ nums: insertItem<string>('1') })(original); // $ExpectError
    patch<Original>({ nums: insertItem<boolean>(true) })(original); // $ExpectError
    patch<Original>({ nums: insertItem<number[]>([]) })(original); // $ExpectError
    patch<Original>({ nums: insertItem<object>({}) })(original); // $ExpectError

    patch<Original>({ strs: insertItem(null!) })(original); // $ExpectError
    patch<Original>({ strs: insertItem(undefined!) })(original); // $ExpectError
    patch<Original>({ strs: insertItem(1) })(original); // $ExpectError
    patch<Original>({ strs: insertItem(true) })(original); // $ExpectError
    patch<Original>({ strs: insertItem([]) })(original); // $ExpectError
    patch<Original>({ strs: insertItem({}) })(original); // $ExpectError
    patch<Original>({ strs: insertItem<number>(1) })(original); // $ExpectError
    patch<Original>({ strs: insertItem<boolean>(true) })(original); // $ExpectError
    patch<Original>({ strs: insertItem<number[]>([]) })(original); // $ExpectError
    patch<Original>({ strs: insertItem<object>({}) })(original); // $ExpectError

    patch<Original>({ bools: insertItem(null!) })(original); // $ExpectError
    patch<Original>({ bools: insertItem(undefined!) })(original); // $ExpectError
    patch<Original>({ bools: insertItem(1) })(original); // $ExpectError
    patch<Original>({ bools: insertItem('1') })(original); // $ExpectError
    patch<Original>({ bools: insertItem([]) })(original); // $ExpectError
    patch<Original>({ bools: insertItem({}) })(original); // $ExpectError
    patch<Original>({ bools: insertItem<number>(1) })(original); // $ExpectError
    patch<Original>({ bools: insertItem<string>('1') })(original); // $ExpectError
    patch<Original>({ bools: insertItem<number[]>([]) })(original); // $ExpectError
    patch<Original>({ bools: insertItem<object>({}) })(original); // $ExpectError
  });
});
