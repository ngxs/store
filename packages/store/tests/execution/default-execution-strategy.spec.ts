import { NgZone, Component, Type, Injectable, inject } from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import {
  State,
  Action,
  StateContext,
  NgxsModule,
  Store,
  Actions,
  Selector
} from '@ngxs/store';
import { Observable } from 'rxjs';

describe('DispatchOutsideZoneNgxsExecutionStrategy', () => {
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

  @Component({ template: '{{ counter$ | async }}', standalone: false })
  class CounterComponent {
    counter$: Observable<number> = inject(Store).select(CounterState.getCounter);
  }

  function setup(moduleDef?: TestModuleMetadata) {
    moduleDef = moduleDef || {
      imports: [NgxsModule.forRoot([CounterState])]
    };
    TestBed.configureTestingModule({
      imports: [...(moduleDef.imports || [])],
      providers: [...(moduleDef.providers || [])],
      declarations: [...(moduleDef.declarations || [])]
    });
    const store: Store = TestBed.inject(Store);
    const zone: NgZone = TestBed.inject(NgZone);
    const get = <T>(classType: Type<T>) => <T>TestBed.inject(classType);
    return { zone, store, get };
  }

  describe('[store.select]', () => {
    it('should be performed inside Angular zone, when dispatched from outside zones', () => {
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
        inside: 3,
        outside: 0
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

  describe('[@Select]', () => {
    function setupWithComponentSubscription() {
      const { zone, store, get } = setup({
        imports: [NgxsModule.forRoot([CounterState])],
        declarations: [CounterComponent]
      });
      const fixture = TestBed.createComponent(CounterComponent);
      const component = fixture.componentInstance;
      const zoneCounter = new ZoneCounter();
      const subscription = component.counter$.subscribe(() => {
        zoneCounter.hit();
      });
      const cleanup = () => {
        fixture.detectChanges();
        fixture.destroy();
        subscription.unsubscribe();
      };
      return { zone, store, get, zoneCounter, cleanup };
    }

    it('should be performed inside Angular zone, when dispatched from outside zones', () => {
      // Arrange
      const { zone, store, zoneCounter, cleanup } = setupWithComponentSubscription();
      // Act
      zone.runOutsideAngular(() => {
        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });
      // Assert
      cleanup();
      zoneCounter.assert({
        inside: 3,
        outside: 0
      });
    });

    it('should be performed inside Angular zone, when dispatched from inside zones', () => {
      // Arrange
      const { zone, store, zoneCounter, cleanup } = setupWithComponentSubscription();
      // Act
      zone.run(() => {
        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });
      // Assert
      cleanup();
      zoneCounter.assert({
        inside: 3,
        outside: 0
      });
    });
  });

  describe('[actions...subscribe]', () => {
    it('should be performed inside Angular zone, when dispatched from outside zones', () => {
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
        inside: 4,
        outside: 0
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

    it('should be performed outside Angular zone, when dispatched from inside zones', () => {
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
        inside: 0,
        outside: 2
      });
    });
  });
});
