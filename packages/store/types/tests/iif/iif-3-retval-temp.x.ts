import { StateOperator } from '@ngxs/store';
// tslint:disable-next-line: no-relative-import-in-test
import { Predicate, NoInfer } from './iif-shared';

type AsReadonly<T> = T extends Readonly<infer O> ? (O extends T ? Readonly<T> : T) : T;
type StateOperator2<T> = (existing: AsReadonly<T>) => AsReadonly<T>;

type StateOperator_<T, P> = T extends unknown ? StateOperator<P> : StateOperator<T>;

type NotAFunction<T, Then> = T extends (...args: any[]) => any ? never : Then;

type Operator1<P> = StateOperator<P>; // Original
type Operator2<P> = StateOperator2<P>; // Nests Readonlys
type Operator3<P> = StateOperator<P> | StateOperator2<P>; // This is ok
// type Operator<P> = StateOperator2<P>;

type OperatorOrValuez<T, P, V> = T extends unknown
  ? Operator3<P> | NotAFunction<V, V extends P ? V : never> // ? StateOperator<P> | NotAFunction<V, V extends P ? V : never>
  : StateOperator<T> | T | NotAFunction<V, T>;

type OperatorOrValue<T> = StateOperator<T> | T;
type OpType1<T, TReturn> = unknown extends TReturn
  ? T
  : TReturn extends StateOperator<infer P>
  ? P
  : never;
type OpType2<T, TReturn> = unknown extends T
  ? TReturn extends StateOperator<infer P>
    ? P
    : never
  : T;
type OpType<T, TReturn> = OpType1<T, TReturn>;

type OperatorType<TReturn> = TReturn extends StateOperator<infer T> ? T : never;
// type OperatorOrValueFor<T, TReturn> = StateOperator<OpType<T, TReturn>> | OpType<T, TReturn>;
// type OperatorOrValueFor<T1, T2> = StateOperator<OpType<T1, T2>> | OpType<T1, T2>;
type OperatorOrValueFor<T1, T2> = T1 extends T2
  ? StateOperator<OpType<T1, T2>> | OpType<T1, T2>
  : never;

interface X {
  name: string;
  lastName?: string;
  nickname?: string;
}
const aa: OperatorOrValueFor<X, unknown> = x => x.name;

export declare function iif<T, TReturn>(
  condition: Predicate<OpType<NoInfer<T>, NoInfer<TReturn>>> | boolean,
  trueOperatorOrValue: OperatorOrValueFor<NoInfer<T>, NoInfer<TReturn>>,
  elseOperatorOrValue?: OperatorOrValueFor<NoInfer<T>, NoInfer<TReturn>>
): unknown extends TReturn ? StateOperator<T> : TReturn;
// ): unknown extends TReturn ? StateOperator<T> : TReturn;
// ): unknown extends TReturn ? StateOperator<T> : TReturn;
// ): TReturn extends unknown ? StateOperator<T> : TReturn;

export {};

/* tslint:disable: no-consecutive-blank-lines











*/
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////      TESTS      //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/* tslint:disable:max-line-length */

import { patch } from '@ngxs/store/operators';

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
    // Commented out because they document an existing bug
    // patch<MyType>({ _num: iif(() => true, null) })(original); // $ExpectType MyType
    // patch<MyType>({ _num: iif(() => false, 123, null) })(original); // $ExpectType MyType

    iif<number | undefined>(() => true, undefined)(100); // $ExpectType number | undefined
    iif<number | undefined>(() => true, 1)(100); // $ExpectType number | undefined
    iif<number | undefined>(() => true, 1, undefined)(100); // $ExpectType number | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __num: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __num: iif(() => false, 123, undefined) })(original); // $ExpectType MyType

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
    // Commented out because they document an existing bug
    // patch<MyType>({ _str: iif(() => true, null) })(original); // $ExpectType MyType
    // patch<MyType>({ _str: iif(() => false, '123', null) })(original); // $ExpectType MyType

    iif<string | undefined>(() => true, undefined)('100'); // $ExpectType string | undefined
    iif<string | undefined>(() => true, '1')('100'); // $ExpectType string | undefined
    iif<string | undefined>(() => true, '1', undefined)('100'); // $ExpectType string | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __str: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __str: iif(() => false, '123', undefined) })(original); // $ExpectType MyType

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
    patch<MyType>({ bool: iif(val => val === false, true, true) })(original); // $ExpectType MyType

    iif<boolean | null>(() => true, null)(true); // $ExpectType boolean | null
    iif<boolean | null>(() => false, true)(true); // $ExpectType boolean | null
    iif<boolean | null>(() => false, true, null)(true); // $ExpectType boolean | null
    // Commented out because they document an existing bug
    // patch<MyType>({ _bool: iif(() => true, null) })(original); // $ExpectType MyType
    // patch<MyType>({ _bool: iif(() => false, true, null) })(original); // $ExpectType MyType

    iif<boolean | undefined>(() => true, undefined)(true); // $ExpectType boolean | undefined
    iif<boolean | undefined>(() => true, true)(true); // $ExpectType boolean | undefined
    iif<boolean | undefined>(() => true, true, undefined)(true); // $ExpectType boolean | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __bool: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __bool: iif(() => false, true, undefined) })(original); // $ExpectType MyType

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
    patch<MyType>({ obj: iif(obj => obj.val === '1', { val: '10' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(() => false, { val: '10' }, { val: '20' }) })(original); // $ExpectType MyType
    patch<MyType>({ obj: iif(false, { val: '10' }, { val: '20' }) })(original); // $ExpectType MyType
    patch<MyType>({
      obj: iif(obj => obj.val === '2', { val: '10' }, { val: '20' })
    })(original); // $ExpectType MyType

    iif<MyObj | null>(() => true, null)({ val: '100' }); // $ExpectType MyObj | null
    iif<MyObj | null>(() => false, { val: '1' })({ val: '100' }); // $ExpectType MyObj | null
    iif<MyObj | null>(() => false, { val: '1' }, null)({ val: '100' }); // $ExpectType MyObj | null
    // Commented out because they document an existing bug
    // patch<MyType>({ _obj: iif(() => true, null) })(original); // $ExpectType MyType
    // patch<MyType>({ _obj: iif(() => false, { val: '123' }, null) })(original); // $ExpectType MyType

    iif<MyObj | undefined>(() => true, undefined)({ val: '100' }); // $ExpectType MyObj | undefined
    iif<MyObj | undefined>(() => true, { val: '1' })({ val: '100' }); // $ExpectType MyObj | undefined
    iif<MyObj | undefined>(() => true, { val: '1' }, undefined)({ val: '100' }); // $ExpectType MyObj | undefined
    // Commented out because they document an existing bug
    // patch<MyType>({ __obj: iif(() => true, undefined) })(original); // $ExpectType MyType
    // patch<MyType>({ __obj: iif(() => false, { val: '123' }, undefined) })(original); // $ExpectType MyType

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

    type test = OperatorOrValueFor<Person, Person | StateOperator<Person> | undefined>;

    const aa: OperatorOrValueFor<Person, unknown> = x => x.name;

    patch<Model>({
      b: iif(
        b => typeof b.hello === 'object',
        // $ExpectType StateOperator<InnerModel>
        patch({
          hello: patch({
            motivated: iif(
              motivated => motivated !== true,
              3, // $ExpectError
              true
            ),
            // $ExpectType StateOperator<Person>
            person: iif(
              val => val.name === 'blah',
              // $ExpectType StateOperator<Person>
              patch({
                name: 'Artur',
                lastName: 'Androsovych'
              }),
              x => x.name // $ExpectError
            )
          }),
          greeting: 'How are you?'
        }),
        x => {
          x; // $ExpectType Readonly<InnerModel>
          return x;
        }
      ),
      c: iif(
        c => c !== 100,
        () => 0 + 100,
        10
      )
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
    })(original); // $/ExpectType Model
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

/* tslint:disable: no-consecutive-blank-lines
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
