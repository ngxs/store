import {
  ApplicationRef,
  NgZone,
  Component,
  Type,
  NgModule,
  Injectable,
  inject
} from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
  State,
  Action,
  StateContext,
  NgxsModule,
  Store,
  Actions,
  Selector
} from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';
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
    const ticks = { count: 0 };
    @Injectable()
    class MockApplicationRef extends ApplicationRef {
      tick(): void {
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
    const store: Store = TestBed.inject(Store);
    const zone: NgZone = TestBed.inject(NgZone);
    const get = <T>(classType: Type<T>) => <T>TestBed.inject(classType);
    return { zone, store, ticks, get };
  }

  describe('[store.select]', () => {
    it('should be performed inside Angular zone, when dispatched from outside zones', () => {
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
      expect(ticks.count).toEqual(3);
      zoneCounter.assert({
        inside: 3,
        outside: 0
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
        imports: [NgxsModule.forRoot([CounterState])],
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

    it('should be performed inside Angular zone, when dispatched from outside zones', () => {
      // Arrange
      const { zone, store, ticks, zoneCounter, cleanup } = setupWithComponentSubscription();
      // Act
      zone.runOutsideAngular(() => {
        store.dispatch(new Increment());
        store.dispatch(new Increment());
      });
      // Assert
      cleanup();
      expect(ticks.count).toEqual(4);
      zoneCounter.assert({
        inside: 3,
        outside: 0
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
      // Assert
      cleanup();
      expect(ticks.count).toEqual(3);
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
