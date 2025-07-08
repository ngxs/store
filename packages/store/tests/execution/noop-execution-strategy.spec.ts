import { Injectable, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Action,
  provideStore,
  Selector,
  State,
  StateContext,
  Store,
  withNgxsNoopExecutionStrategy
} from '@ngxs/store';

describe('Noop execution strategy', () => {
  class ZoneCounter {
    inside = 0;
    outside = 0;
    hit() {
      if (NgZone.isInAngularZone()) {
        this.inside += 1;
      } else {
        this.outside += 1;
      }
    }

    assert(expectation: { inside: number; outside: number }) {
      const self: ZoneCounter = this;
      expect({ ...self }).toEqual(expectation);
    }
  }

  class Increment {
    static readonly type = '[Counter] Increment';
  }

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Selector()
    static getCounter(state: number) {
      return state;
    }

    zoneCounter = new ZoneCounter();

    @Action(Increment)
    increment({ setState, getState }: StateContext<number>): void {
      setState(getState() + 1);
      this.zoneCounter.hit();
    }
  }

  function setup() {
    TestBed.configureTestingModule({
      providers: [provideStore([CounterState], withNgxsNoopExecutionStrategy())]
    });
    const store = TestBed.inject(Store);
    const zone: NgZone = TestBed.inject(NgZone);
    return { zone, store };
  }

  describe('[store.select]', () => {
    it('should be performed outside Angular zone, when dispatched from outside zones', () => {
      // Arrange
      const { zone, store } = setup();
      const zoneCounter = new ZoneCounter();
      // Act
      zone.runOutsideAngular(() => {
        store
          .select<number>(({ counter }) => counter)
          .subscribe(() => {
            zoneCounter.hit();
          });

        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });

      // Assert
      zoneCounter.assert({
        inside: 0,
        outside: 3
      });
    });

    it('should be performed inside Angular zone, when dispatched from inside zones', () => {
      // Arrange
      const { zone, store } = setup();
      const zoneCounter = new ZoneCounter();
      // Act
      zone.run(() => {
        store
          .select<number>(({ counter }) => counter)
          .subscribe(() => {
            zoneCounter.hit();
          });

        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });

      // Assert
      zoneCounter.assert({
        inside: 3,
        outside: 0
      });
    });
  });
});
