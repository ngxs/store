/* tslint:disable:max-line-length no-boolean-literal-compare */

/// <reference types="@types/jest" />
import { iif, patch } from '@ngxs/store/operators';

describe('[TEST]: the iif State Operator', () => {
  it('should return the correct implied null or undefined type', () => {
//    iif(true, null); // $ExpectType StateOperator<null>
//    iif(true, undefined); // $ExpectType StateOperator<undefined>
//    iif(true, null, undefined); // $ExpectType StateOperator<null>
//    iif(() => true, null); // $ExpectType StateOperator<null>
//    iif(() => true, undefined); // $ExpectType StateOperator<undefined>
//    iif(() => true, null, undefined); // $ExpectType StateOperator<null>
  });

  it('should return the correct implied number type', () => {
//    iif(null!, 10); // $ExpectType StateOperator<number>
//    iif(null!, 10, 20); // $ExpectType StateOperator<number>
//    iif(undefined!, 10); // $ExpectType StateOperator<number>
//    iif(undefined!, 10, 20); // $ExpectType StateOperator<number>

//    iif(true, 10); // $ExpectType StateOperator<number>
//    iif(false, 10, 20); // $ExpectType StateOperator<number>
//    iif(false, 10, null); // $ExpectType StateOperator<number | null>
//    iif(false, null, 10); // $ExpectType StateOperator<number | null>
//    iif(false, 10, undefined); // $ExpectType StateOperator<number>
//    iif(false, undefined, 10); // $ExpectType StateOperator<number | undefined>

//    iif(() => true, 10); // $ExpectType StateOperator<number>
//    iif(() => false, 10, 20); // $ExpectType StateOperator<number>
//    iif(() => false, 10, null); // $ExpectType StateOperator<number | null>
//    iif(() => false, 10, undefined); // $ExpectType StateOperator<number>

//    iif(val => val === 1, 10); // $ExpectType StateOperator<number>
//    iif(val => val === 1, 10, 20); // $ExpectType StateOperator<number>
//    iif(val => val === 1, 10, null); // $ExpectType StateOperator<number | null>
//    iif(val => val === 1, null, 10); // $ExpectType StateOperator<number | null>
//    iif(val => val === null, 10, null); // $ExpectType StateOperator<number | null>
//    iif(val => val === 1, 10, undefined); // $ExpectType StateOperator<number>
//    iif(val => val === 1, undefined, 10); // $ExpectType StateOperator<number | undefined>
//    iif(val => val === undefined, 10, undefined); // $ExpectType StateOperator<number>
  });

  it('should return the correct implied string type', () => {
//    iif(null!, '10'); // $ExpectType StateOperator<string>
//    iif(null!, '10', '20'); // $ExpectType StateOperator<string>
//    iif(undefined!, '10'); // $ExpectType StateOperator<string>
//    iif(undefined!, '10', '20'); // $ExpectType StateOperator<string>

//    iif(true, '10'); // $ExpectType StateOperator<string>
//    iif(false, '10', '20'); // $ExpectType StateOperator<string>
//    iif(false, '10', null); // $ExpectType StateOperator<string | null>
//    iif(false, null, '10'); // $ExpectType StateOperator<string | null>
//    iif(false, '10', undefined); // $ExpectType StateOperator<string>
//    iif(false, undefined, '10'); // $ExpectType StateOperator<string | undefined>

//    iif(() => true, '10'); // $ExpectType StateOperator<string>
//    iif(() => false, '10', '20'); // $ExpectType StateOperator<string>
//    iif(() => false, '10', null); // $ExpectType StateOperator<string | null>
//    iif(() => false, '10', undefined); // $ExpectType StateOperator<string>

//    iif(val => val === '1', '10'); // $ExpectType StateOperator<string>
//    iif(val => val === '1', '10', '20'); // $ExpectType StateOperator<string>
//    iif(val => val === '1', '10', null); // $ExpectType StateOperator<string | null>
//    iif(val => val === '1', null, '10'); // $ExpectType StateOperator<string | null>
//    iif(val => val === null, '10', null); // $ExpectType StateOperator<string | null>
//    iif(val => val === '1', '10', undefined); // $ExpectType StateOperator<string>
//    iif(val => val === '1', undefined, '10'); // $ExpectType StateOperator<string | undefined>
//    iif(val => val === undefined, '10', undefined); // $ExpectType StateOperator<string>
  });

  it('should return the correct implied boolean type', () => {
//    iif(null!, true); // $ExpectType StateOperator<boolean>
//    iif(null!, true, false); // $ExpectType StateOperator<boolean>
//    iif(undefined!, true); // $ExpectType StateOperator<boolean>
//    iif(undefined!, true, false); // $ExpectType StateOperator<boolean>

//    iif(true, true); // $ExpectType StateOperator<boolean>
//    iif(false, true, false); // $ExpectType StateOperator<boolean>
//    iif(false, true, null); // $ExpectType StateOperator<boolean | null>
//    iif(false, null, true); // $ExpectType StateOperator<boolean | null>
//    iif(false, true, undefined); // $ExpectType StateOperator<boolean>
//    iif(false, undefined, true); // $ExpectType StateOperator<boolean | undefined>

//    iif(() => true, true); // $ExpectType StateOperator<boolean>
//    iif(() => false, true, false); // $ExpectType StateOperator<boolean>
//    iif(() => false, true, null); // $ExpectType StateOperator<boolean | null>
//    iif(() => false, true, undefined); // $ExpectType StateOperator<boolean>

//    iif(val => val === true, true); // $ExpectType StateOperator<boolean>
//    iif(val => val === true, true, false); // $ExpectType StateOperator<boolean>
//    iif(val => val === true, true, null); // $ExpectType StateOperator<boolean | null>
//    iif(val => val === true, null, true); // $ExpectType StateOperator<boolean | null>
//    iif(val => val === null, true, null); // $ExpectType StateOperator<boolean | null>
//    iif(val => val === true, true, undefined); // $ExpectType StateOperator<boolean>
//    iif(val => val === true, undefined, true); // $ExpectType StateOperator<boolean | undefined>
//    iif(val => val === undefined, true, undefined); // $ExpectType StateOperator<boolean>
  });

  it('should return the correct implied object type', () => {
//    iif(null!, { val: '10' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(null!, { val: '10' }, { val: '20' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(undefined!, { val: '10' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(undefined!, { val: '10' }, { val: '20' }); // $ExpectType StateOperator<{ val: string; }>

//    iif(true, { val: '10' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(false, { val: '10' }, { val: '20' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(false, { val: '10' }, null); // $ExpectType StateOperator<{ val: string; } | null>
//    iif(false, null, { val: '10' }); // $ExpectType StateOperator<{ val: string; } | null>
//    iif(false, { val: '10' }, undefined); // $ExpectType StateOperator<{ val: string; }>
//    iif(false, undefined, { val: '10' }); // $ExpectType StateOperator<{ val: string; } | undefined>

//    iif(() => true, { val: '10' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(() => false, { val: '10' }, { val: '20' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(() => false, { val: '10' }, null); // $ExpectType StateOperator<{ val: string; } | null>
//    iif(() => false, { val: '10' }, undefined); // $ExpectType StateOperator<{ val: string; }>

//    iif(obj => obj.val === '1', { val: '10' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(obj => obj.val === '1', { val: '10' }, { val: '20' }); // $ExpectType StateOperator<{ val: string; }>
//    iif(obj => obj.val === '1', { val: '10' }, null); // $ExpectType StateOperator<{ val: string; } | null>
//    iif(obj => obj.val === '1', null, { val: '10' }); // $ExpectType StateOperator<{ val: string; } | null>
//    iif(obj => obj === null, { val: '10' }, null); // $ExpectType StateOperator<{ val: string; } | null>
//    iif(obj => obj.val === '1', { val: '10' }, undefined); // $ExpectType StateOperator<{ val: string; }>
//    iif(obj => obj.val === '1', undefined, { val: '10' }); // $ExpectType StateOperator<{ val: string; } | undefined>
//    iif(obj => obj === undefined, { val: '10' }, undefined); // $ExpectType StateOperator<{ val: string; }>
  });

  it('should have the following valid number usages', () => {
    interface MyType {
      num: number;
      _num: number | null;
      __num?: number;
    }

    const original: MyType = { num: 1, _num: null };

    patch<MyType>({ num: iif(null!, 1) })(original); // $ExpectType MyType
    patch<MyType>({ num: iif(null!, 2, 3) })(original); // $ExpectType MyType
    patch<MyType>({ num: iif(undefined!, 1) })(original); // $ExpectType MyType
    patch<MyType>({ num: iif(undefined!, 2, 3) })(original); // $ExpectType MyType

    patch<MyType>({ num: iif(() => true, 10) })(original); // $ExpectType MyType
    patch<MyType>({ num: iif(true, 10) })(original); // $ExpectType MyType
    patch<MyType>({ num: iif(val => val === 1, 10) })(original); // $ExpectType MyType
    patch<MyType>({ num: iif(() => false, 10, 20) })(original); // $ExpectType MyType
    patch<MyType>({ num: iif(false, 10, 20) })(original); // $ExpectType MyType
    patch<MyType>({ num: iif(val => val === 2, 10, 20) })(original); // $ExpectType MyType

    iif<number | null>(() => true, null)(100); // $ExpectType number | null
    iif<number | null>(() => false, 1)(100); // $ExpectType number | null
    iif<number | null>(() => false, 1, null)(100); // $ExpectType number | null
    patch<MyType>({ _num: iif(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _num: iif(() => false, 123, null) })(original); // $ExpectType MyType

    iif<number | undefined>(() => true, undefined)(100); // $ExpectType number | undefined
    iif<number | undefined>(() => true, 1)(100); // $ExpectType number | undefined
    iif<number | undefined>(() => true, 1, undefined)(100); // $ExpectType number | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __num: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __num: iif(() => false, 123, undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch({ num: 1 }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch({ num: 3, _num: 4 }), // $ExpectType StateOperator<MyType>
      patch({ num: 5, __num: 6 }) // $ExpectType StateOperator<MyType>
    )(original); // $ExpectType MyType

    patch<MyType>({
      num: iif(() => false, 10, 30),
      _num: iif(() => true, 50, 100),
      __num: iif(() => true, 5, 10)
    })(original); // $ExpectType MyType
  });

  it('should have the following valid number array usages', () => {
    interface MyType {
      nums: number[];
      _nums: number[] | null;
      __nums?: number[];
    }

    const original: MyType = { nums: [1], _nums: null };

    patch<MyType>({ nums: iif(null!, [1]) })(original); // $ExpectType MyType
    patch<MyType>({ nums: iif(null!, [2], [3]) })(original); // $ExpectType MyType
    patch<MyType>({ nums: iif(undefined!, [1]) })(original); // $ExpectType MyType
    patch<MyType>({ nums: iif(undefined!, [2], [3]) })(original); // $ExpectType MyType

    patch<MyType>({ nums: iif(() => true, [10]) })(original); // $ExpectType MyType
    patch<MyType>({ nums: iif(true, [10]) })(original); // $ExpectType MyType
    patch<MyType>({ nums: iif(val => val.includes(1), [10]) })(original); // $ExpectType MyType
    patch<MyType>({ nums: iif(() => false, [10], [20]) })(original); // $ExpectType MyType
    patch<MyType>({ nums: iif(false, [10], [20]) })(original); // $ExpectType MyType
    patch<MyType>({ nums: iif(val => val.includes(2), [10], [20]) })(original); // $ExpectType MyType

    iif<number[] | null>(() => true, null)([100]); // $ExpectType number[] | null
    iif<number[] | null>(() => false, [1])([100]); // $ExpectType number[] | null
    iif<number[] | null>(() => false, [1], null)([100]); // $ExpectType number[] | null
    iif<number[] | null>(arr => arr!.includes(1), [10], null)([100]); // $ExpectType number[] | null
    iif<number[] | null>(arr => arr!.includes(1), null, [10])([100]); // $ExpectType number[] | null
    iif<number[] | null>(arr => arr === null, [10], null)([100]); // $ExpectType number[] | null
    patch<MyType>({ _nums: iif(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _nums: iif(() => false, [123], null) })(original); // $ExpectType MyType

    iif<number[] | undefined>(() => true, undefined)([100]); // $ExpectType number[] | undefined
    iif<number[] | undefined>(() => true, [1])([100]); // $ExpectType number[] | undefined
    iif<number[] | undefined>(() => true, [1], undefined)([100]); // $ExpectType number[] | undefined
    iif<number[] | undefined>(arr => arr!.includes(1), [10], undefined)([100]); // $ExpectType number[] | undefined
    iif<number[] | undefined>(arr => arr!.includes(1), undefined, [10])([100]); // $ExpectType number[] | undefined
    iif<number[] | undefined>(arr => arr === undefined, [10], undefined)([100]); // $ExpectType number[] | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __nums: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __nums: iif(() => false, 123, undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch({ nums: [1] }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch({ nums: [3], _nums: [4] }), // $ExpectType StateOperator<MyType>
      patch({ nums: [5], __nums: [6] }) // $ExpectType StateOperator<MyType>
    )(original); // $ExpectType MyType

    patch<MyType>({
      nums: iif(() => false, [10], [30]),
      _nums: iif(() => true, [50], [100]),
      __nums: iif(() => true, [5], [10])
    })(original); // $ExpectType MyType
  });

  it('should have the following valid string usages', () => {
    interface MyType {
      str: string;
      _str: string | null;
      __str?: string;
    }

    const original: MyType = { str: '1', _str: null };

    patch<MyType>({ str: iif(null!, '1') })(original); // $ExpectType MyType
    patch<MyType>({ str: iif(null!, '2', '3') })(original); // $ExpectType MyType
    patch<MyType>({ str: iif(undefined!, '1') })(original); // $ExpectType MyType
    patch<MyType>({ str: iif(undefined!, '2', '3') })(original); // $ExpectType MyType

    patch<MyType>({ str: iif(() => true, '10') })(original); // $ExpectType MyType
    patch<MyType>({ str: iif(true, '10') })(original); // $ExpectType MyType
    patch<MyType>({ str: iif(val => val === '1', '10') })(original); // $ExpectType MyType
    patch<MyType>({ str: iif(() => false, '10', '20') })(original); // $ExpectType MyType
    patch<MyType>({ str: iif(false, '10', '20') })(original); // $ExpectType MyType
    patch<MyType>({ str: iif(val => val === '2', '10', '20') })(original); // $ExpectType MyType

    iif<string | null>(() => true, null)('100'); // $ExpectType string | null
    iif<string | null>(() => false, '1')('100'); // $ExpectType string | null
    iif<string | null>(() => false, '1', null)('100'); // $ExpectType string | null
    patch<MyType>({ _str: iif(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _str: iif(() => false, '123', null) })(original); // $ExpectType MyType

    iif<string | undefined>(() => true, undefined)('100'); // $ExpectType string | undefined
    iif<string | undefined>(() => true, '1')('100'); // $ExpectType string | undefined
    iif<string | undefined>(() => true, '1', undefined)('100'); // $ExpectType string | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __str: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __str: iif(() => false, '123', undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch({ str: '1' }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch({ str: '3', _str: '4' }), // $ExpectType StateOperator<MyType>
      patch({ str: '5', __str: '6' }) // $ExpectType StateOperator<MyType>
    )(original); // $ExpectType MyType

    patch<MyType>({
      str: iif(() => false, '10', '30'),
      _str: iif(() => true, '50', '100'),
      __str: iif(() => true, '5', '10')
    })(original); // $ExpectType MyType
  });

  it('should have the following valid string array usages', () => {
    interface MyType {
      strs: string[];
      _strs: string[] | null;
      __strs?: string[];
    }

    const original: MyType = { strs: ['1'], _strs: null };

    patch<MyType>({ strs: iif(null!, ['1']) })(original); // $ExpectType MyType
    patch<MyType>({ strs: iif(null!, ['2'], ['3']) })(original); // $ExpectType MyType
    patch<MyType>({ strs: iif(undefined!, ['1']) })(original); // $ExpectType MyType
    patch<MyType>({ strs: iif(undefined!, ['2'], ['3']) })(original); // $ExpectType MyType

    patch<MyType>({ strs: iif(() => true, ['10']) })(original); // $ExpectType MyType
    patch<MyType>({ strs: iif(true, ['10']) })(original); // $ExpectType MyType
    patch<MyType>({ strs: iif(val => val.includes('1'), ['10']) })(original); // $ExpectType MyType
    patch<MyType>({ strs: iif(() => false, ['10'], ['20']) })(original); // $ExpectType MyType
    patch<MyType>({ strs: iif(false, ['10'], ['20']) })(original); // $ExpectType MyType
    patch<MyType>({ strs: iif(val => val.includes('2'), ['10'], ['20']) })(original); // $ExpectType MyType

    iif<string[] | null>(() => true, null)(['100']); // $ExpectType string[] | null
    iif<string[] | null>(() => false, ['1'])(['100']); // $ExpectType string[] | null
    iif<string[] | null>(() => false, ['1'], null)(['100']); // $ExpectType string[] | null
    iif<string[] | null>(arr => arr!.includes('1'), ['10'], null)(['100']); // $ExpectType string[] | null
    iif<string[] | null>(arr => arr!.includes('1'), null, ['10'])(['100']); // $ExpectType string[] | null
    iif<string[] | null>(arr => arr === null, ['10'], null)(['100']); // $ExpectType string[] | null
    patch<MyType>({ _strs: iif(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _strs: iif(() => false, ['123'], null) })(original); // $ExpectType MyType

    iif<string[] | undefined>(() => true, undefined)(['100']); // $ExpectType string[] | undefined
    iif<string[] | undefined>(() => true, ['1'])(['100']); // $ExpectType string[] | undefined
    iif<string[] | undefined>(() => true, ['1'], undefined)(['100']); // $ExpectType string[] | undefined
    iif<string[] | undefined>(arr => arr!.includes('1'), ['10'], undefined)(['100']); // $ExpectType string[] | undefined
    iif<string[] | undefined>(arr => arr!.includes('1'), undefined, ['10'])(['100']); // $ExpectType string[] | undefined
    iif<string[] | undefined>(arr => arr === undefined, ['10'], undefined)(['100']); // $ExpectType string[] | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __str: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __str: iif(() => false, ['123'], undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch({ strs: ['1'] }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch({ strs: ['3'], _strs: ['4'] }), // $ExpectType StateOperator<MyType>
      patch({ strs: ['5'], __strs: ['6'] }) // $ExpectType StateOperator<MyType>
    )(original); // $ExpectType MyType

    patch<MyType>({
      strs: iif(() => false, ['10'], ['30']),
      _strs: iif(() => true, ['50'], ['100']),
      __strs: iif(() => true, ['5'], ['10'])
    })(original); // $ExpectType MyType
  });

  it('should have the following valid boolean usages', () => {
    interface MyType {
      bool: boolean;
      _bool: boolean | null;
      __bool?: boolean;
    }

    const original: MyType = { bool: true, _bool: null };

    patch<MyType>({ bool: iif(null!, true) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(null!, false, true) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(undefined!, true) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(undefined!, false, true) })(original); // $ExpectType MyType

    patch<MyType>({ bool: iif(() => true, true) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(true, true) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(val => val === true, true) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(() => false, true, false) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(false, true, false) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(val => val === false, true, false) })(original); // $ExpectType MyType
    patch<MyType>({ bool: iif(val => val === false, true, true) })(original); // $ExpectType MyType

    iif<boolean | null>(() => true, null)(true); // $ExpectType boolean | null
    iif<boolean | null>(() => false, true)(true); // $ExpectType boolean | null
    iif<boolean | null>(() => false, true, null)(true); // $ExpectType boolean | null
    patch<MyType>({ _bool: iif(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _bool: iif(() => false, true, null) })(original); // $ExpectType MyType

    iif<boolean | undefined>(() => true, undefined)(true); // $ExpectType boolean | undefined
    iif<boolean | undefined>(() => true, true)(true); // $ExpectType boolean | undefined
    iif<boolean | undefined>(() => true, true, undefined)(true); // $ExpectType boolean | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __bool: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __bool: iif(() => false, true, undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch({ bool: true }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch({ bool: true, _bool: false }), // $ExpectType StateOperator<MyType>
      patch({ bool: false, __bool: true }) // $ExpectType StateOperator<MyType>
    )(original); // $ExpectType MyType

    patch<MyType>({
      bool: iif(() => false, true, false),
      _bool: iif(() => true, false, true),
      __bool: iif(() => true, false, true)
    })(original); // $ExpectType MyType
  });

  it('should have the following valid boolean array usages', () => {
    interface MyType {
      bools: boolean[];
      _bools: boolean[] | null;
      __bools?: boolean[];
    }

    const original: MyType = { bools: [true], _bools: null };

    patch<MyType>({ bools: iif(null!, [true]) })(original); // $ExpectType MyType
    patch<MyType>({ bools: iif(null!, [false], [true]) })(original); // $ExpectType MyType
    patch<MyType>({ bools: iif(undefined!, [true]) })(original); // $ExpectType MyType
    patch<MyType>({ bools: iif(undefined!, [false], [true]) })(original); // $ExpectType MyType

    patch<MyType>({ bools: iif(() => true, [true]) })(original); // $ExpectType MyType
    patch<MyType>({ bools: iif(true, [true]) })(original); // $ExpectType MyType
    patch<MyType>({ bools: iif(val => val.includes(true), [true]) })(original); // $ExpectType MyType
    patch<MyType>({ bools: iif(() => false, [true], [false]) })(original); // $ExpectType MyType
    patch<MyType>({ bools: iif(false, [true], [false]) })(original); // $ExpectType MyType
    patch<MyType>({ bools: iif(val => val.includes(false), [true], [false]) })(original); // $ExpectType MyType

    iif<boolean[] | null>(() => true, null)([true]); // $ExpectType boolean[] | null
    iif<boolean[] | null>(() => false, [true])([true]); // $ExpectType boolean[] | null
    iif<boolean[] | null>(() => false, [true], null)([true]); // $ExpectType boolean[] | null
    iif<boolean[] | null>(arr => arr!.includes(true), [false], null)([true]); // $ExpectType boolean[] | null
    iif<boolean[] | null>(arr => arr!.includes(true), null, [false])([true]); // $ExpectType boolean[] | null
    iif<boolean[] | null>(arr => arr === null, [false], null)([true]); // $ExpectType boolean[] | null
    patch<MyType>({ _bools: iif(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _bools: iif(() => false, [true], null) })(original); // $ExpectType MyType

    iif<boolean[] | undefined>(() => true, undefined)([true]); // $ExpectType boolean[] | undefined
    iif<boolean[] | undefined>(() => true, [true])([true]); // $ExpectType boolean[] | undefined
    iif<boolean[] | undefined>(() => true, [true], undefined)([true]); // $ExpectType boolean[] | undefined
    iif<boolean[] | undefined>(arr => arr!.includes(true), [false], undefined)([true]); // $ExpectType boolean[] | undefined
    iif<boolean[] | undefined>(arr => arr!.includes(true), undefined, [false])([true]); // $ExpectType boolean[] | undefined
    iif<boolean[] | undefined>(arr => arr === undefined, [false], undefined)([true]); // $ExpectType boolean[] | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __bool: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __bool: iif(() => false, [true], undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch({ bools: [true] }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch({ bools: [true], _bools: [false] }), // $ExpectType StateOperator<MyType>
      patch({ bools: [false], __bools: [true] }) // $ExpectType StateOperator<MyType>
    )(original); // $ExpectType MyType

    patch<MyType>({
      bools: iif(() => false, [true], [false]),
      _bools: iif(() => true, [false], [true]),
      __bools: iif(() => true, [false], [true])
    })(original); // $ExpectType MyType
  });

  it('should have the following valid object usages', () => {
    interface MyObj {
      val: string;
    }
    interface MyType {
      obj: MyObj;
      _obj: MyObj | null;
      __obj?: MyObj;
    }

    const original: MyType = { obj: { val: '1' }, _obj: null };

    patch<MyType>({ obj: iif(null!, { val: '1' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(null!, { val: '2' }, { val: '3' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(undefined!, { val: '1' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(undefined!, { val: '2' }, { val: '3' }) })(original); // $ExpectType MyType

    patch<MyType>({ obj: iif(() => true, { val: '10' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(true, { val: '10' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(obj => obj.val === '1', { val: '10' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(() => false, { val: '10' }, { val: '20' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(false, { val: '10' }, { val: '20' }) })(original); // $ExpectType MyType
    patch<MyType>({
      obj: iif(obj => obj.val === '2', { val: '10' }, { val: '20' })
    })(original); // $ExpectType MyType

    iif<MyObj | null>(() => true, null)({ val: '100' }); // $ExpectType MyObj | null
    iif<MyObj | null>(() => false, { val: '1' })({ val: '100' }); // $ExpectType MyObj | null
    iif<MyObj | null>(() => false, { val: '1' }, null)({ val: '100' }); // $ExpectType MyObj | null
    patch<MyType>({ _obj: iif(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _obj: iif(() => false, { val: '123' }, null) })(original); // $ExpectType MyType

    iif<MyObj | undefined>(() => true, undefined)({ val: '100' }); // $ExpectType MyObj | undefined
    iif<MyObj | undefined>(() => true, { val: '1' })({ val: '100' }); // $ExpectType MyObj | undefined
    iif<MyObj | undefined>(() => true, { val: '1' }, undefined)({ val: '100' }); // $ExpectType MyObj | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __obj: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __obj: iif(() => false, { val: '123' }, undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch({ obj: { val: '1' } }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch({ obj: { val: '3' }, _obj: { val: '4' } }), // $ExpectType StateOperator<MyType>
      patch({ obj: { val: '5' }, __obj: { val: '6' } }) // $ExpectType StateOperator<MyType>
    )(original); // $ExpectType MyType

    patch<MyType>({
      obj: iif(() => false, { val: '10' }, { val: '30' }),
      _obj: iif(() => true, { val: '50' }, { val: '100' }),
      __obj: iif(() => true, { val: '5' }, { val: '10' })
    })(original); // $ExpectType MyType
  });

  it('should have the following valid object array usages', () => {
    interface MyObj {
      val: string;
    }
    interface MyType {
      obj: MyObj[];
      _obj: MyObj[] | null;
      __obj?: MyObj[];
    }

    const original: MyType = { obj: [{ val: '1' }], _obj: null };

    patch<MyType>({ obj: iif(null!, [{ val: '1' }]) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(null!, [{ val: '2' }], [{ val: '3' }]) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(undefined!, [{ val: '1' }]) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(undefined!, [{ val: '2' }], [{ val: '3' }]) })(original); // $ExpectType MyType

    patch<MyType>({ obj: iif(() => true, [{ val: '10' }]) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(true, [{ val: '10' }]) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(obj => obj.some(o => o.val === '1'), [{ val: '10' }]) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(() => false, [{ val: '10' }], [{ val: '20' }]) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(false, [{ val: '10' }], [{ val: '20' }]) })(original); // $ExpectType MyType
    patch<MyType>({
      obj: iif(obj => obj.some(o => o.val === '2'), [{ val: '10' }], [{ val: '20' }])
    })(original); // $ExpectType MyType

    iif<MyObj[] | null>(() => true, null)([{ val: '100' }]); // $ExpectType MyObj[] | null
    iif<MyObj[] | null>(() => false, [{ val: '1' }])([{ val: '100' }]); // $ExpectType MyObj[] | null
    iif<MyObj[] | null>(() => false, [{ val: '1' }], null)([{ val: '100' }]); // $ExpectType MyObj[] | null
    iif<MyObj[] | null>(arr => arr!.some(o => o.val === '1'), [{ val: '123' }], null)([{ val: '1' }]); // $ExpectType MyObj[] | null
    iif<MyObj[] | null>(arr => arr!.some(o => o.val === '1'), null, [{ val: '123' }])([{ val: '20' }]); // $ExpectType MyObj[] | null
    patch<MyType>({ _obj: iif(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _obj: iif(() => false, [{ val: '123' }], null) })(original); // $ExpectType MyType

    iif<MyObj[] | undefined>(() => true, undefined)([{ val: '100' }]); // $ExpectType MyObj[] | undefined
    iif<MyObj[] | undefined>(() => true, [{ val: '1' }])([{ val: '100' }]); // $ExpectType MyObj[] | undefined
    iif<MyObj[] | undefined>(() => true, [{ val: '1' }], undefined)([{ val: '100' }]); // $ExpectType MyObj[] | undefined
    iif<MyObj[] | undefined>(arr => arr!.some(o => o.val === '1'), [{ val: '123' }], undefined)([{ val: '1' }]); // $ExpectType MyObj[] | undefined
    iif<MyObj[] | undefined>(arr => arr!.some(o => o.val === '1'), undefined, [{ val: '123' }])([{ val: '20' }]); // $ExpectType MyObj[] | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __obj: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __obj: iif(() => false, [{ val: '123' }], undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch({ obj: [{ val: '1' }] }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch({ obj: [{ val: '3' }], _obj: [{ val: '4' }] }), // $ExpectType StateOperator<MyType>
      patch({ obj: [{ val: '5' }], __obj: [{ val: '6' }] }) // $ExpectType StateOperator<MyType>
    )(original); // $ExpectType MyType

    patch<MyType>({
      obj: iif(() => false, [{ val: '10' }], [{ val: '30' }]),
      _obj: iif(() => true, [{ val: '50' }], [{ val: '100' }]),
      __obj: iif(() => true, [{ val: '5' }], [{ val: '10' }])
    })(original); // $ExpectType MyType
  });

  it('should support some specific use cases', () => {
    {
      type MyType = {
        a: number;
        b: number;
        c: number;
      };
      const original: MyType = { a: 1, b: 2, c: 3 };

      patch<MyType>({
        a: iif(a => a < 10, 10, 5), // $ExpectType StateOperator<number>
        b: iif(b => b > 0, 10, 5), // $ExpectType StateOperator<number>
        c: iif(c => c === 3, 10, 5) // $ExpectType StateOperator<number>
      })(original); // $ExpectType MyType
    }
  });

  it('should have the following valid complex usage', () => {
    interface Person {
      name: string;
      lastName?: string;
      nickname?: string;
    }

    interface Greeting {
      motivated?: boolean;
      person: Person;
    }

    interface InnerModel {
      hello?: Greeting;
      goodbye?: Greeting;
      greeting?: string;
    }

    interface Model {
      a: number;
      b: InnerModel;
      c?: number;
    }

    const original: Model = {
      a: 1,
      b: {
        hello: {
          person: {
            name: 'you'
          }
        },
        goodbye: {
          person: {
            name: 'Artur'
          }
        }
      }
    };

    patch<Model>({
      b: iif(
        b => typeof b.hello === 'object',
        // $ExpectType StateOperator<InnerModel>
        patch({
          hello: // $ExpectType StateOperator<Greeting>
            patch({
              motivated: iif(motivated => motivated !== true, true), // $ExpectType StateOperator<boolean>
              person: // $ExpectType StateOperator<Person>
                patch({
                  name: 'Artur', // $ExpectType string
                  lastName: 'Androsovych' // $ExpectType string
                }),
            }),
          greeting: 'How are you?' // $ExpectType string
        })
      ),
      c: iif(c => c !== 100, () => 0 + 100, 10)
    })(original); // $ExpectType Model

    patch<Model>({
      b: // $ExpectType StateOperator<InnerModel>
        patch({
          hello: // $ExpectType StateOperator<Greeting>
            patch({
              motivated: iif(motivated => motivated !== true, true), // $ExpectType StateOperator<boolean>
              person: // $ExpectType StateOperator<Person>
                patch({
                  name: iif(name => name !== 'Mark', 'Artur'), // $ExpectType StateOperator<string>
                  lastName: iif(lastName => lastName !== 'Whitfeld', 'Androsovych') // $ExpectType StateOperator<string>
                })
            }),
          greeting: iif(greeting => !greeting, 'How are you?')  // $ExpectType StateOperator<string>
        }),
      c: iif(c => !c, 100, 10) // $ExpectType StateOperator<number>
    })(original); // $ExpectType Model
  });

  it('should not accept the following usages', () => {
    interface MyType {
      num: number;
      _num: number | null;
      __num?: number;
      str: string;
      _str: string | null;
      __str?: string;
      bool: boolean;
      _bool: boolean | null;
      __bool?: boolean;
    }

    const original: MyType = {
      num: 1,
      _num: null,
      str: '2',
      _str: null,
      bool: true,
      _bool: null
    };

    patch<MyType>({ num: iif(true, '1') })(original); // $ExpectError
    patch<MyType>({ num: iif(true, {}) })(original); // $ExpectError
    patch<MyType>({ _num: iif(true, '1') })(original); // $ExpectError
    patch<MyType>({ _num: iif(true, undefined) })(original); // $ExpectError
    patch<MyType>({ __num: iif(true, '1') })(original); // $ExpectError
    patch<MyType>({ __num: iif(true, null) })(original); // $ExpectError
    patch<MyType>({ str: iif(true, 1) })(original); // $ExpectError
    patch<MyType>({ str: iif(true, {}) })(original); // $ExpectError
    patch<MyType>({ _str: iif(true, 1) })(original); // $ExpectError
    patch<MyType>({ _str: iif(true, undefined) })(original); // $ExpectError
    patch<MyType>({ __str: iif(true, 1) })(original); // $ExpectError
    patch<MyType>({ __str: iif(true, null) })(original); // $ExpectError
    patch<MyType>({ bool: iif(true, '1') })(original); // $ExpectError
    patch<MyType>({ bool: iif(true, {}) })(original); // $ExpectError
    patch<MyType>({ _bool: iif(true, '1') })(original); // $ExpectError
    patch<MyType>({ _bool: iif(true, undefined) })(original); // $ExpectError
    patch<MyType>({ __bool: iif(true, '1') })(original); // $ExpectError
    patch<MyType>({ __bool: iif(true, null) })(original); // $ExpectError
  });
});

/*
type Z<T> = (a: T) => T;
type Y<R, P> = (a: P) => R;
type IsSubtypeOf<S, P> = S extends P ? true : false;

let a: Z<boolean> = null;
let b: Z<true> = null;
a = b;

type x1 = IsSubtypeOf<Z<boolean>,Z<true>>; // $/ExpectType true
type x2 = IsSubtypeOf<Z<true>,Z<boolean>>; // $/ExpectType true

type x3 = IsSubtypeOf<Y<boolean, boolean>,Y<true, boolean>>; // $/ExpectType true
type x4 = IsSubtypeOf<Y<true, boolean>,Y<boolean, boolean>>; // $/ExpectType true

type x01 = IsSubtypeOf<true, boolean>; // $/ExpectType true
type x02 = IsSubtypeOf<boolean, true>; // $/ExpectType true
*/
