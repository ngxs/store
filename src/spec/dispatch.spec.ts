import { TestBed } from '@angular/core/testing';

import { State } from '../state';
import { Action } from '../action';
import { Store } from '../store';
import { NgxsModule } from '../module';
import { StateContext } from '../symbols';
import { Observable } from 'rxjs/Observable';

describe('Dispatch', () => {
  it('should correctly dispatch the event', () => {
    class Increment {}
    class Decrement {}

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class MyState {
      @Action(Increment)
      increment({ getState, setState }: StateContext<number>) {
        setState(getState() + 1);
      }

      @Action(Decrement)
      decrement({ getState, setState }: StateContext<number>) {
        setState(getState() - 1);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Decrement());

    store.selectOnce(MyState).subscribe(res => {
      expect(res).toBe(3);
    });
  });

  it('should correctly dispatch an async event', () => {
    class Increment {}
    class Decrement {}

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class MyState {
      @Action(Increment)
      increment({ getState, setState }: StateContext<number>) {
        return new Observable(observer => {
          setState(getState() + 1);

          observer.next();
          observer.complete();
        });
      }

      @Action(Decrement)
      decrement({ getState, setState }: StateContext<number>) {
        setState(getState() - 1);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment()).subscribe();
    store.dispatch(new Increment()).subscribe();
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Decrement());

    store.select(MyState).subscribe(res => {
      expect(res).toBe(3);
    });
  });
});
