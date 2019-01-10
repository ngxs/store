import { ApplicationRef, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { State, Action, StateContext, NgxsModule, Store } from '../src/public_api';

describe('zone', () => {
  class Increment {
    public static readonly type = '[Counter] Increment';
  }

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  class CounterState {
    @Action(Increment)
    public increment({ setState, getState }: StateContext<number>): void {
      setState(getState() + 1);
    }
  }

  it('"select" should be performed inside Angular zone', () => {
    let ticks = 0;

    class MockApplicationRef extends ApplicationRef {
      public tick(): void {
        ticks++;
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])],
      providers: [
        {
          provide: ApplicationRef,
          useClass: MockApplicationRef
        }
      ]
    });

    const store: Store = TestBed.get(Store);
    const zone: NgZone = TestBed.get(NgZone);

    store.dispatch(new Increment());
    store.dispatch(new Increment());

    // NGXS performes initializions inside Angular zone
    // thus it causes app to tick
    expect(ticks).toBeGreaterThan(0);

    zone.runOutsideAngular(() => {
      store
        .selectOnce<number>(({ counter }) => counter)
        .subscribe(() => {
          expect(NgZone.isInAngularZone()).toBeTruthy();
        });
    });
  });

  it('"select" should be performed outside Angular zone', () => {
    let ticks = 0;

    class MockApplicationRef extends ApplicationRef {
      public tick(): void {
        ticks++;
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState], { outsideZone: true })],
      providers: [
        {
          provide: ApplicationRef,
          useClass: MockApplicationRef
        }
      ]
    });

    const store: Store = TestBed.get(Store);
    const zone: NgZone = TestBed.get(NgZone);

    // NGXS performed all initializations outside Angular zone
    expect(ticks).toBe(0);

    zone.runOutsideAngular(() => {
      store
        .selectOnce<number>(({ counter }) => counter)
        .subscribe(() => {
          expect(NgZone.isInAngularZone()).toBeFalsy();
        });
    });
  });
});
