import { ApplicationRef, NgZone, Component, Type } from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { Observable } from 'rxjs';
import {
  State,
  Action,
  StateContext,
  NgxsModule,
  Store,
  Select,
  Actions,
  NoopNgxsExecutionStrategy
} from '@ngxs/store';

describe('NoopNgxsExecutionStrategy', () => {
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
    public static readonly type = '[Counter] Increment';
  }

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  class CounterState {
    public zoneCounter = new ZoneCounter();

    @Action(Increment)
    public increment({ setState, getState }: StateContext<number>): void {
      setState(getState() + 1);
      this.zoneCounter.hit();
    }
  }

  @Component({ template: '{{ counter$ | async }}' })
  class CounterComponent {
    @Select(CounterState)
    public counter$: Observable<number>;
  }

  function setup(moduleDef?: TestModuleMetadata) {
    moduleDef = moduleDef || {
      imports: [
        NgxsModule.forRoot([CounterState], {
          executionStrategy: NoopNgxsExecutionStrategy
        })
      ]
    };

    const ticks = { count: 0 };
    class MockApplicationRef extends ApplicationRef {
      public tick(): void {
        ticks.count += 1;
      }
    }
    TestBed.configureTestingModule({
      imports: [...(moduleDef.imports || [])],
      providers: [
        ...(moduleDef.providers || []),
        {
          provide: ApplicationRef,
          useClass: MockApplicationRef
        }
      ],
      declarations: [...(moduleDef.declarations || [])]
    });
    const store: Store = TestBed.get(Store);
    const zone: NgZone = TestBed.get(NgZone);
    const get = <T>(classType: Type<T>) => <T>TestBed.get(classType);
    return { zone, store, ticks, get };
  }

  describe('[store.select]', () => {
    it('should be performed outside Angular zone, when dispatched from outside zones', () => {
      // Arrange
      const { zone, store, ticks } = setup();
      ticks.count = 0;
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
      expect(ticks.count).toEqual(0);
      zoneCounter.assert({
        inside: 0,
        outside: 3
      });
    });

    it('should be performed inside Angular zone, when dispatched from inside zones', () => {
      // Arrange
      const { zone, store, ticks } = setup();
      ticks.count = 0;
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
      expect(ticks.count).toEqual(1);
      zoneCounter.assert({
        inside: 3,
        outside: 0
      });
    });
  });

  describe('[@Select]', () => {
    function setupWithComponentSubscription() {
      const { zone, store, ticks, get } = setup({
        imports: [
          NgxsModule.forRoot([CounterState], {
            executionStrategy: NoopNgxsExecutionStrategy
          })
        ],
        declarations: [CounterComponent]
      });
      const fixture = TestBed.createComponent(CounterComponent);
      const component = fixture.componentInstance;
      ticks.count = 0;
      const zoneCounter = new ZoneCounter();
      const subscription = component.counter$.subscribe(() => {
        zoneCounter.hit();
      });
      const cleanup = () => {
        fixture.detectChanges();
        fixture.destroy();
        subscription.unsubscribe();
      };
      return { zone, store, ticks, get, zoneCounter, cleanup };
    }

    it('should be performed outside Angular zone, when dispatched from outside zones', () => {
      // Arrange
      const { zone, store, ticks, zoneCounter, cleanup } = setupWithComponentSubscription();
      // Act
      zone.runOutsideAngular(() => {
        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });
      // Assert
      cleanup();
      expect(ticks.count).toEqual(1);
      zoneCounter.assert({
        inside: 0,
        outside: 3
      });
    });

    it('should be performed inside Angular zone, when dispatched from inside zones', () => {
      // Arrange
      const { zone, store, ticks, zoneCounter, cleanup } = setupWithComponentSubscription();
      // Act
      zone.run(() => {
        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });
      cleanup();
      // Assert
      expect(ticks.count).toEqual(2);
      zoneCounter.assert({
        inside: 2,
        outside: 1
      });
    });
  });

  describe('[actions...subscribe]', () => {
    it('should be performed outside Angular zone, when dispatched from outside zones', () => {
      // Arrange
      const { zone, store, get } = setup();
      const actionsStream = get(Actions);
      const zoneCounter = new ZoneCounter();
      // Act
      zone.runOutsideAngular(() => {
        actionsStream.subscribe(() => {
          zoneCounter.hit();
        });

        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });

      // Assert
      zoneCounter.assert({
        inside: 0,
        outside: 4
      });
    });

    it('should be performed inside Angular zone, when dispatched from inside zones', () => {
      // Arrange
      const { zone, store, get } = setup();
      const actionsStream = get(Actions);
      const zoneCounter = new ZoneCounter();
      // Act
      zone.run(() => {
        actionsStream.subscribe(() => {
          zoneCounter.hit();
        });

        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });

      // Assert
      zoneCounter.assert({
        inside: 4,
        outside: 0
      });
    });
  });

  describe('[@Action]', () => {
    it('should be performed outside Angular zone, when dispatched from outside zones', () => {
      // Arrange
      const { zone, store, get } = setup();
      const counterState = get(CounterState);
      // Act
      zone.runOutsideAngular(() => {
        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });

      // Assert
      counterState.zoneCounter.assert({
        inside: 0,
        outside: 2
      });
    });

    it('should be performed inside Angular zone, when dispatched from inside zones', () => {
      // Arrange
      const { zone, store, get } = setup();
      const counterState = get(CounterState);
      // Act
      zone.run(() => {
        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });

      // Assert
      counterState.zoneCounter.assert({
        inside: 2,
        outside: 0
      });
    });
  });
});
