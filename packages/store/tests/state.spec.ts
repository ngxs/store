import { TestBed } from '@angular/core/testing';

import { InitState, UpdateState } from '../src/actions/actions';
import { State, Action, NgxsOnInit, NgxsModule, StateContext, Store } from '../src/public_api';

import { stateNameErrorMessage } from '../src/decorators/state';
import { META_KEY } from '../src/symbols';

describe('State', () => {
  it('describes correct name', () => {
    @State({
      name: 'moo'
    })
    class BarState {}

    const meta = BarState[META_KEY];

    expect(meta.name).toBe('moo');
  });

  it('handles extending', () => {
    class Eat {
      static type = 'EAT';
    }
    class Drink {
      static type = 'DRINK';
    }

    @State({
      name: 'bar'
    })
    class BarState {
      @Action(Eat)
      eat() {}
    }

    @State({
      name: 'bar2'
    })
    class Bar2State extends BarState {
      @Action(Drink)
      drink() {}
    }

    const meta = Bar2State[META_KEY];
    expect(meta.actions[Eat.type]).toBeDefined();
    expect(meta.actions[Drink.type]).toBeDefined();
  });

  it('should throw an error on invalid names', () => {
    let message: string;

    try {
      @State({
        name: 'bar-foo'
      })
      class MyState {}

      window['foo'] = MyState; // to help with unread warning
    } catch (err) {
      message = err.message;
    }

    expect(message).toBe(stateNameErrorMessage('bar-foo'));
  });

  describe('given the ngxsOnInit lifecycle method is present', () => {
    it('should call the ngxsOnInit method on root module initialisation', () => {
      const listener: string[] = [];

      @State<number>({
        name: 'foo',
        defaults: 0
      })
      class FooState implements NgxsOnInit {
        ngxsOnInit(stateContext: StateContext<number>) {
          listener.push('onInit');
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([FooState])]
      });

      TestBed.get(FooState);

      expect(listener).toEqual(['onInit']);
    });

    it('should call the ngxsOnInit method on feature module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      class FooState implements NgxsOnInit {
        ngxsOnInit(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'onInit']);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([]), NgxsModule.forFeature([FooState])]
      });

      TestBed.get(FooState);

      expect(TestBed.get(Store).snapshot().foo).toEqual(['onInit']);
    });

    it('should call an InitState action handler before the ngxsOnInit method on root module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      class FooState implements NgxsOnInit {
        ngxsOnInit(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'onInit']);
        }

        @Action(InitState)
        initState(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'initState']);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([FooState])]
      });

      TestBed.get(FooState);

      expect(TestBed.get(Store).snapshot().foo).toEqual(['initState', 'onInit']);
    });

    it('should call an UpdateState action handler before the ngxsOnInit method on feature module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      class FooState implements NgxsOnInit {
        ngxsOnInit(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'onInit']);
        }

        @Action(InitState)
        initState(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'initState']);
        }

        @Action(UpdateState)
        updateState(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'updateState']);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([]), NgxsModule.forFeature([FooState])]
      });

      TestBed.get(FooState);

      expect(TestBed.get(Store).snapshot().foo).toEqual(['updateState', 'onInit']);
    });
  });
});
