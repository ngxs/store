import {
  State,
  Action,
  getStoreMetadata,
  getSelectorMetadata,
  Selector,
  NgxsModule,
  SelectorOptions,
  Store
} from '@ngxs/store';
import { async, TestBed } from '@angular/core/testing';

import { SelectorMetaDataModel } from '../src/internal/internals';
import { getSelectorFn } from '../src/utils/selector-utils';

describe('Ensure metadata', () => {
  let store: Store;

  it('should return undefined if not a state class', () => {
    class MyState {}
    expect(getStoreMetadata(MyState)).toBeUndefined();
    expect(getSelectorMetadata(MyState)).toBeUndefined();
  });

  describe('Ensure store for plugins', () => {
    @State({
      name: 'myCounter',
      defaults: 1
    })
    class MyCounterState {
      @Selector()
      @SelectorOptions({ suppressErrors: false })
      public static canInheritSelectFn(state: number): number {
        return state * 2;
      }

      @Action({ type: 'decrement' })
      public decrement(): void {}
    }

    @State({
      name: 'count',
      defaults: 0,
      children: [MyCounterState]
    })
    class CountState extends MyCounterState {
      @Selector()
      public static selectFn(state: number): number {
        return state;
      }

      @Action({ type: 'increment' })
      public addOne(): void {}

      @Action({ type: 'increment' })
      public addTwo(): void {}
    }

    beforeAll(async(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([CountState, MyCounterState])]
      });

      store = TestBed.get(Store);
    }));

    it('should get the meta data from the CountState', () => {
      console.log(store.snapshot());

      expect(getStoreMetadata(CountState)).toEqual({
        name: 'count',
        actions: {
          increment: [
            { fn: 'addOne', options: {}, type: 'increment' },
            { fn: 'addTwo', options: {}, type: 'increment' }
          ],
          decrement: [{ fn: 'decrement', options: {}, type: 'decrement' }]
        },
        defaults: 0,
        path: 'count',
        instance: expect.any(CountState),
        selectFromAppState: expect.any(Function),
        children: [MyCounterState]
      });
    });

    it('should get the meta data from the MyCounterState', () => {
      expect(getStoreMetadata(MyCounterState)).toEqual({
        name: 'myCounter',
        actions: { decrement: [{ fn: 'decrement', options: {}, type: 'decrement' }] },
        defaults: 1,
        path: 'count.myCounter',
        instance: expect.any(MyCounterState),
        selectFromAppState: expect.any(Function),
        children: undefined
      });
    });

    it('should get the selector meta data from the CountState, MyCounterState', () => {
      expect(getSelectorMetadata(CountState)).toBeUndefined();
      expect(getSelectorMetadata(MyCounterState)).toBeUndefined();
    });

    it('should get the selector meta data from the CountState.selectFn', () => {
      const metadata: SelectorMetaDataModel = getSelectorMetadata(CountState.selectFn);

      expect(metadata.selectorName).toEqual('selectFn');
      expect(metadata.containerClass).toEqual(CountState);

      expect(metadata.originalFn).not.toEqual(CountState.selectFn);
      expect(metadata.originalFn!(1)).toEqual(1); // state => state

      expect(metadata.getSelectorOptions()).toEqual({
        injectContainerState: true,
        suppressErrors: true
      });

      expect(metadata.selectFromAppState).toEqual(getSelectorFn(CountState.selectFn));
      expect(getSelectorFn(CountState.selectFn)(0)).toBeUndefined();
    });

    it('should get the selector meta data from the CountState.canInheritSelectFn, MyCounterState.canInheritSelectFn', () => {
      const countMetadata: SelectorMetaDataModel = getSelectorMetadata(
        CountState.canInheritSelectFn
      );

      const myCounterMetadata: SelectorMetaDataModel = getSelectorMetadata(
        MyCounterState.canInheritSelectFn
      );

      expect(countMetadata.selectorName).toEqual('canInheritSelectFn');
      expect(myCounterMetadata.selectorName).toEqual('canInheritSelectFn');
      expect(countMetadata.containerClass).toEqual(MyCounterState);
      expect(myCounterMetadata.containerClass).toEqual(MyCounterState);

      expect(countMetadata.originalFn).not.toEqual(CountState.canInheritSelectFn);
      expect(myCounterMetadata.originalFn).not.toEqual(MyCounterState.canInheritSelectFn);
      expect(countMetadata.originalFn!(1)).toEqual(2); // state => state * 2
      expect(myCounterMetadata.originalFn!(1)).toEqual(2); // state => state * 2
      expect(countMetadata.getSelectorOptions()).toEqual({
        injectContainerState: true,
        suppressErrors: false
      });

      expect(myCounterMetadata.getSelectorOptions()).toEqual({
        injectContainerState: true,
        suppressErrors: false
      });

      expect(countMetadata.selectFromAppState).toEqual(
        getSelectorFn(CountState.canInheritSelectFn)
      );

      expect(myCounterMetadata.selectFromAppState).toEqual(
        getSelectorFn(MyCounterState.canInheritSelectFn)
      );

      expect(getSelectorFn(CountState.canInheritSelectFn)(0)).toEqual(NaN);
      expect(getSelectorFn(MyCounterState.canInheritSelectFn)(0)).toEqual(NaN);
    });

    it('should get the selector meta data from the SuperCountState.canInheritSelectFn', () => {
      let error: Error | null = null;

      try {
        @State({
          name: 'superCount',
          defaults: 0
        })
        class SuperCountState extends MyCounterState {
          @Selector()
          public static canInheritSelectFn(state: number): number {
            return super.canInheritSelectFn(state) + 1;
          }
        }

        const metadata: SelectorMetaDataModel = getSelectorMetadata(
          SuperCountState.canInheritSelectFn
        );

        expect(metadata.containerClass).toEqual(SuperCountState);
      } catch (e) {
        error = e;
      }

      expect(flatString(error!.message)).toEqual(
        'Cannot set property canInheritSelectFn of function MyCounterState() { } which has only a getter'
      );
    });

    function flatString(str: string): string {
      return str
        .toString()
        .replace(/\n/g, '')
        .replace(/\s\s+/g, ' ');
    }
  });
});
