/* tslint:disable:max-line-length */

/// <reference types="@types/jest" />
import { iif, patch } from '../../operators/src';

describe('[TEST]: the iif State Operator', () => {
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

    patch<MyType>({ _num: iif<number>(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _num: iif<number>(() => false, 123, null) })(original); // $ExpectType MyType

    iif<number | undefined>(() => true, undefined)(100); // $ExpectType number | undefined
    iif<number | undefined>(() => true, 1)(100); // $ExpectType number | undefined
    iif<number | undefined>(() => true, 1, undefined)(100); // $ExpectType number | undefined

    patch<MyType>({ __num: iif<number>(() => true, undefined) })(original); // $ExpectType MyType
    patch<MyType>({ __num: iif<number>(() => false, 123, undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch<MyType>({ num: 1 }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch<MyType>({ num: 3, _num: 4 }),
      patch<MyType>({ num: 5, __num: 6 })
    )(original); // $ExpectType MyType

    patch<MyType>({
      num: iif(() => false, 10, 30),
      _num: iif(() => true, 50, 100),
      __num: iif(() => true, 5, 10)
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

    patch<MyType>({ _str: iif<string>(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _str: iif<string>(() => false, '123', null) })(original); // $ExpectType MyType

    iif<string | undefined>(() => true, undefined)('100'); // $ExpectType string | undefined
    iif<string | undefined>(() => true, '1')('100'); // $ExpectType string | undefined
    iif<string | undefined>(() => true, '1', undefined)('100'); // $ExpectType string | undefined

    patch<MyType>({ __str: iif<string>(() => true, undefined) })(original); // $ExpectType MyType
    patch<MyType>({ __str: iif<string>(() => false, '123', undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch<MyType>({ str: '1' }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch<MyType>({ str: '3', _str: '4' }),
      patch<MyType>({ str: '5', __str: '6' })
    )(original); // $ExpectType MyType

    patch<MyType>({
      str: iif(() => false, '10', '30'),
      _str: iif(() => true, '50', '100'),
      __str: iif(() => true, '5', '10')
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

    iif<boolean | null>(() => true, null)(true); // $ExpectType boolean | null
    iif<boolean | null>(() => false, true)(true); // $ExpectType boolean | null
    iif<boolean | null>(() => false, true, null)(true); // $ExpectType boolean | null

    patch<MyType>({ _bool: iif<boolean>(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _bool: iif<boolean>(() => false, true, null) })(original); // $ExpectType MyType

    iif<boolean | undefined>(() => true, undefined)(true); // $ExpectType boolean | undefined
    iif<boolean | undefined>(() => true, true)(true); // $ExpectType boolean | undefined
    iif<boolean | undefined>(() => true, true, undefined)(true); // $ExpectType boolean | undefined

    patch<MyType>({ __bool: iif<boolean>(() => true, undefined) })(original); // $ExpectType MyType
    patch<MyType>({ __bool: iif<boolean>(() => false, true, undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch<MyType>({ bool: true }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch<MyType>({ bool: true, _bool: false }),
      patch<MyType>({ bool: false, __bool: true })
    )(original); // $ExpectType MyType

    patch<MyType>({
      bool: iif(() => false, true, false),
      _bool: iif(() => true, false, true),
      __bool: iif(() => true, false, true)
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
    patch<MyType>({ obj: iif(obj => obj!.val === '1', { val: '10' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(() => false, { val: '10' }, { val: '20' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(false, { val: '10' }, { val: '20' }) })(original); // $ExpectType MyType
    patch<MyType>({
      obj: iif(obj => obj!.val === '2', { val: '10' }, { val: '20' })
    })(original); // $ExpectType MyType

    iif<MyObj | null>(() => true, null)({ val: '100' }); // $ExpectType MyObj | null
    iif<MyObj | null>(() => false, { val: '1' })({ val: '100' }); // $ExpectType MyObj | null
    iif<MyObj | null>(() => false, { val: '1' }, null)({ val: '100' }); // $ExpectType MyObj | null

    patch<MyType>({ _obj: iif<MyObj>(() => true, null) })(original); // $ExpectType MyType
    patch<MyType>({ _obj: iif<MyObj>(() => false, { val: '123' }, null) })(original); // $ExpectType MyType

    iif<MyObj | undefined>(() => true, undefined)({ val: '100' }); // $ExpectType MyObj | undefined
    iif<MyObj | undefined>(() => true, { val: '1' })({ val: '100' }); // $ExpectType MyObj | undefined
    iif<MyObj | undefined>(() => true, { val: '1' }, undefined)({ val: '100' }); // $ExpectType MyObj | undefined

    patch<MyType>({ __obj: iif<MyObj>(() => true, undefined) })(original); // $ExpectType MyType
    patch<MyType>({ __obj: iif<MyObj>(() => false, { val: '123' }, undefined) })(original); // $ExpectType MyType

    iif<MyType>(() => true, patch<MyType>({ obj: { val: '1' } }))(original); // $ExpectType MyType
    iif<MyType>(
      () => true,
      patch<MyType>({ obj: { val: '3' }, _obj: { val: '4' } }),
      patch<MyType>({ obj: { val: '5' }, __obj: { val: '6' } })
    )(original); // $ExpectType MyType

    patch<MyType>({
      obj: iif(() => false, { val: '10' }, { val: '30' }),
      _obj: iif(() => true, { val: '50' }, { val: '100' }),
      __obj: iif(() => true, { val: '5' }, { val: '10' })
    })(original); // $ExpectType MyType
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

    interface Model {
      a: number;
      b: {
        hello?: Greeting;
        goodbye?: Greeting;
        greeting?: string;
      };
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
      b: iif<Model['b']>(
        b => typeof b!.hello === 'object',
        patch<Model['b']>({
          hello: patch({
            motivated: iif(motivated => motivated !== true, true),
            person: patch({
              name: 'Artur',
              lastName: 'Androsovych'
            })
          }),
          greeting: 'How are you?'
        })
      ),
      c: iif(c => c !== 100, () => 0 + 100, 10)
    })(original); // $ExpectType Model

    patch<Model>({
      b: patch<Model['b']>({
        hello: patch<Greeting>({
          motivated: iif(motivated => motivated !== true, true),
          person: patch({
            name: iif(name => name !== 'Mark', 'Artur'),
            lastName: iif(lastName => lastName !== 'Whitfeld', 'Androsovych')
          })
        }),
        greeting: iif(greeting => !greeting, 'How are you?')
      }),
      c: iif(c => !c, 100, 10)
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

    patch<MyType>({ _num: iif(() => true, null) })(original); // $ExpectError
    patch<MyType>({ _num: iif(() => false, 123, null) })(original); // $ExpectError
    patch<MyType>({ __num: iif(() => true, undefined) })(original); // $ExpectError
    patch<MyType>({ __num: iif(() => false, 123, undefined) })(original); // $ExpectError
    patch<MyType>({ _str: iif(() => true, null) })(original); // $ExpectError
    patch<MyType>({ _str: iif(() => false, '123', null) })(original); // $ExpectError
    patch<MyType>({ __str: iif(() => true, undefined) })(original); // $ExpectError
    patch<MyType>({ __str: iif(() => false, '123', undefined) })(original); // $ExpectError
    patch<MyType>({ _bool: iif(() => true, null) })(original); // $ExpectError
    patch<MyType>({ _bool: iif(() => false, true, null) })(original); // $ExpectError
    patch<MyType>({ __bool: iif(() => true, undefined) })(original); // $ExpectError
    patch<MyType>({ __bool: iif(() => false, true, undefined) })(original); // $ExpectError
    patch<MyType>({ _obj: iif(() => true, null) })(original); // $ExpectError
    patch<MyType>({ _obj: iif(() => false, { val: '123' }, null) })(original); // $ExpectError
    patch<MyType>({ __obj: iif(() => true, undefined) })(original); // $ExpectError
    patch<MyType>({ __obj: iif(() => false, { val: '123' }, undefined) })(original); // $ExpectError

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
