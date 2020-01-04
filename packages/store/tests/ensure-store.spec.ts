import {
  State,
  Action,
  getStoreMetadata,
  getSelectorMetadata,
  Selector,
  NgxsModule,
  SelectorOptions
} from '@ngxs/store';
import { TestBed } from '@angular/core/testing';

import { SelectorMetaDataModel } from '../src/internal/internals';
import { getRootSelectorFactory } from '../src/utils/selector-utils';

describe('Ensure metadata', () => {
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

    beforeAll(() => {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([CountState, MyCounterState])]
      });
    });

    it('should get the meta data from the CountState', () => {
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
        path: null,
        makeRootSelector: expect.any(Function),
        children: [MyCounterState]
      });
    });

    it('should get the meta data from the MyCounterState', () => {
      expect(getStoreMetadata(MyCounterState)).toEqual({
        name: 'myCounter',
        actions: { decrement: [{ fn: 'decrement', options: {}, type: 'decrement' }] },
        defaults: 1,
        path: null,
        makeRootSelector: expect.any(Function),
        children: undefined
      });
    });

    it('should get the selector meta data from the CountState, MyCounterState', () => {
      expect(getSelectorMetadata(CountState)).toBeUndefined();
      expect(getSelectorMetadata(MyCounterState)).toBeUndefined();
    });

    it('should get the selector meta data from the CountState.selectFn', () => {
      const metadata = <SelectorMetaDataModel>getSelectorMetadata(CountState.selectFn);

      expect(metadata.selectorName).toEqual('selectFn');
      expect(metadata.containerClass).toEqual(CountState);

      expect(metadata.originalFn).not.toEqual(CountState.selectFn);
      expect(metadata.originalFn!(1)).toEqual(1); // state => state

      expect(metadata.getSelectorOptions()).toEqual({});
      expect(metadata.makeRootSelector).toEqual(getRootSelectorFactory(CountState.selectFn));
    });

    it('should get the selector meta data from the CountState.canInheritSelectFn, MyCounterState.canInheritSelectFn', () => {
      const countMetadata = <SelectorMetaDataModel>(
        getSelectorMetadata(CountState.canInheritSelectFn)
      );

      const myCounterMetadata = <SelectorMetaDataModel>(
        getSelectorMetadata(MyCounterState.canInheritSelectFn)
      );

      expect(countMetadata.selectorName).toEqual('canInheritSelectFn');
      expect(myCounterMetadata.selectorName).toEqual('canInheritSelectFn');

      // TODO(splincode): is normal for CountState?
      expect(countMetadata.containerClass).toEqual(MyCounterState);
      expect(myCounterMetadata.containerClass).toEqual(MyCounterState);

      expect(countMetadata.originalFn).not.toEqual(CountState.canInheritSelectFn);
      expect(myCounterMetadata.originalFn).not.toEqual(MyCounterState.canInheritSelectFn);
      expect(countMetadata.originalFn!(1)).toEqual(2); // state => state * 2
      expect(myCounterMetadata.originalFn!(1)).toEqual(2); // state => state * 2
      expect(countMetadata.getSelectorOptions()).toEqual({ suppressErrors: false });
      expect(myCounterMetadata.getSelectorOptions()).toEqual({ suppressErrors: false });

      expect(countMetadata.makeRootSelector).toEqual(
        getRootSelectorFactory(CountState.canInheritSelectFn)
      );

      expect(myCounterMetadata.makeRootSelector).toEqual(
        getRootSelectorFactory(MyCounterState.canInheritSelectFn)
      );
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

        const metadata = <SelectorMetaDataModel>(
          getSelectorMetadata(SuperCountState.canInheritSelectFn)
        );

        expect(metadata.containerClass).toEqual(SuperCountState);
      } catch (e) {
        error = e;
      }

      // TODO(splincode): is normal for SuperCountState?
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
