/* tslint:disable:max-line-length */
/// <reference types="@types/jest" />
import { Selector, State, SelectorOptions } from '@ngxs/store';
import { assertType } from './utils/assert-type';

describe('[TEST]: The SelectorOptions decorator', () => {
  it('should be valid on on State classes', () => {
    @State<string>({ name: 'my-state' })
    @SelectorOptions({ injectContainerState: false })
    class MyState { }
  });

  it('should be valid on on State class selectors', () => {
    @State<string>({ name: 'my-state' })
    class MyState {
      @Selector([MyState])
      @SelectorOptions({ injectContainerState: false })
      static getMyState(state: string) {
        return state;
      }
    }
  });

  it('should be valid on on query classes', () => {
    @State<string>({ name: 'my-state' })
    class MyState { }

    @SelectorOptions({ suppressErrors: false })
    class MyStateQueries {
      @Selector([MyState])
      static getMyState(state: string) {
        return state;
      }
    }
  });

  it('should be valid on on query class selectors', () => {
    @State<string>({ name: 'my-state' })
    class MyState { }

    class MyStateQueries {
      @Selector([MyState])
      @SelectorOptions({ suppressErrors: false })
      static getMyState(state: string) {
        return state;
      }
    }
  });

  it('should not be a valid parameter decorator', () => {
    @State<string>({ name: 'my-state' })
    class MyState {
      @Selector([MyState])
      getMyState(
        @SelectorOptions({ injectContainerState: false }) // $ExpectError
        state: string
      ) {
        return state;
      }
    }
  });

  it('should not be a valid property decorator', () => {
    @State<string>({ name: 'my-state' })
    class MyState {
      @SelectorOptions({ injectContainerState: false }) // $ExpectError
      getMyState = () => 'test';
    }
  });

  it('should accept the following parameters', () => {
    assertType(() => SelectorOptions({})); // $ExpectType ClassDecorator & MethodDecorator
    assertType(() => SelectorOptions({ suppressErrors: undefined })); // $ExpectType ClassDecorator & MethodDecorator
    assertType(() => SelectorOptions({ suppressErrors: true })); // $ExpectType ClassDecorator & MethodDecorator
    assertType(() => SelectorOptions({ suppressErrors: false })); // $ExpectType ClassDecorator & MethodDecorator
    assertType(() => SelectorOptions({ injectContainerState: undefined })); // $ExpectType ClassDecorator & MethodDecorator
    assertType(() => SelectorOptions({ injectContainerState: true })); // $ExpectType ClassDecorator & MethodDecorator
    assertType(() => SelectorOptions({ injectContainerState: false })); // $ExpectType ClassDecorator & MethodDecorator
    assertType(() => SelectorOptions({ suppressErrors: false, injectContainerState: false })); // $ExpectType ClassDecorator & MethodDecorator
  });

  it('should not accept the following parameters', () => {
    SelectorOptions(); // $ExpectError
    assertType(() => SelectorOptions({ suppressErrors: null })); // $ExpectError
    assertType(() => SelectorOptions({ suppressErrors: 'string' })); // $ExpectError
    assertType(() => SelectorOptions({ suppressErrors: 123 })); // $ExpectError
    assertType(() => SelectorOptions({ suppressErrors: {} })); // $ExpectError
    assertType(() => SelectorOptions({ suppressErrors: [] })); // $ExpectError
    assertType(() => SelectorOptions({ injectContainerState: null })); // $ExpectError
    assertType(() => SelectorOptions({ injectContainerState: 'string' })); // $ExpectError
    assertType(() => SelectorOptions({ injectContainerState: 123 })); // $ExpectError
    assertType(() => SelectorOptions({ injectContainerState: {} })); // $ExpectError
    assertType(() => SelectorOptions({ injectContainerState: [] })); // $ExpectError
  });
});
