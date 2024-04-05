import { State, Action, Selector, NgxsModule, SelectorOptions } from '@ngxs/store';
import {
  ɵSelectorMetaDataModel,
  ɵgetSelectorMetadata,
  ɵgetStoreMetadata
} from '@ngxs/store/internals';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { getRootSelectorFactory } from '../src/selectors/selector-utils';

describe('Ensure metadata', () => {
  it('should return undefined if not a state class', () => {
    class MyState {}
    expect(ɵgetStoreMetadata(MyState)).toBeUndefined();
    expect(ɵgetSelectorMetadata(MyState)).toBeUndefined();
  });

  describe('Ensure store for plugins', () => {
    @State({
      name: 'myCounter',
      defaults: 1
    })
    @Injectable()
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
    @Injectable()
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
      expect(ɵgetStoreMetadata(CountState)).toEqual({
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
      expect(ɵgetStoreMetadata(MyCounterState)).toEqual({
        name: 'myCounter',
        actions: { decrement: [{ fn: 'decrement', options: {}, type: 'decrement' }] },
        defaults: 1,
        path: null,
        makeRootSelector: expect.any(Function),
        children: undefined
      });
    });

    it('should get the selector meta data from the CountState, MyCounterState', () => {
      expect(ɵgetSelectorMetadata(CountState)).toBeUndefined();
      expect(ɵgetSelectorMetadata(MyCounterState)).toBeUndefined();
    });

    it('should get the selector meta data from the CountState.selectFn', () => {
      const metadata = <ɵSelectorMetaDataModel>ɵgetSelectorMetadata(CountState.selectFn);

      expect(metadata.selectorName).toEqual('selectFn');
      expect(metadata.containerClass).toEqual(CountState);

      expect(metadata.originalFn).not.toEqual(CountState.selectFn);
      expect(metadata.originalFn!(1)).toEqual(1); // state => state

      expect(metadata.getSelectorOptions()).toEqual({});
      expect(metadata.makeRootSelector).toEqual(getRootSelectorFactory(CountState.selectFn));
    });

    it('should get the selector meta data from the CountState.canInheritSelectFn, MyCounterState.canInheritSelectFn', () => {
      const countMetadata = <ɵSelectorMetaDataModel>(
        ɵgetSelectorMetadata(CountState.canInheritSelectFn)
      );

      const myCounterMetadata = <ɵSelectorMetaDataModel>(
        ɵgetSelectorMetadata(MyCounterState.canInheritSelectFn)
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
      @State({
        name: 'superCount',
        defaults: 0
      })
      @Injectable()
      class SuperCountState extends MyCounterState {
        @Selector()
        static canInheritSelectFn(state: number): number {
          return super.canInheritSelectFn(state) + 1;
        }
      }

      const metadata = <ɵSelectorMetaDataModel>(
        ɵgetSelectorMetadata(SuperCountState.canInheritSelectFn)
      );

      expect(metadata.containerClass).toEqual(SuperCountState);
    });
  });
});
